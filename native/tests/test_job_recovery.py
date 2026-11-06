import os, sys, unittest, tempfile, shutil
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from native.matting import get_ort_session, run_matting, ensure_model_file

class TestJobRecovery(unittest.TestCase):
    def setUp(self):
        self.tmp_dir = tempfile.mkdtemp(prefix="jizura_recovery_test_")
        self.img_path = os.path.join(self.tmp_dir, "test_input.png")
        img = Image.new("RGB", (64, 64), color=(100, 150, 200))
        img.save(self.img_path)

    def tearDown(self):
        shutil.rmtree(self.tmp_dir, ignore_errors=True)

    def test_gpu_unavailable_falls_back_to_cpu(self):
        # With real model, prefer_gpu should return either hardware backend (OpenVINO, DirectML, CUDA) or CPU fallback
        model_path = ensure_model_file()
        sess, backend = get_ort_session(model_path, prefer_gpu=True)
        self.assertIsNotNone(sess)
        valid_backends = [
            "cpu", "directml", "cuda",
            "openvino", "openvino (gpu)", "openvino (cpu)"
        ]
        self.assertIn(backend.lower(), valid_backends)

    def test_explicit_backend_selection(self):
        model_path = ensure_model_file()
        sess_cpu, backend_cpu = get_ort_session(model_path, preferred_backend="cpu")
        self.assertIsNotNone(sess_cpu)
        self.assertEqual(backend_cpu.lower(), "cpu")

    def test_matting_completes_with_real_input(self):
        out_file = os.path.join(self.tmp_dir, "fallback_test.jizmat")
        config = {
            "sourceVideo": self.img_path,
            "outputFile": out_file,
            "profile": "rvm-mobilenetv3-fp32-p512-r05-v1",
            "fps": 24,
            "duration": 5.0,
            "sourceId": "item-recovery-test",
            "slots": [0]
        }
        res = run_matting(config)
        self.assertEqual(res["status"], "completed")
        self.assertTrue(os.path.exists(out_file))

    def test_missing_source_fails_with_error(self):
        out_file = os.path.join(self.tmp_dir, "missing.jizmat")
        config = {
            "sourceVideo": os.path.join(self.tmp_dir, "non_existent.mp4"),
            "outputFile": out_file,
            "profile": "rvm-mobilenetv3-fp32-p512-r05-v1",
            "fps": 24,
            "duration": 5.0,
            "sourceId": "item-missing",
            "slots": [0]
        }
        with self.assertRaises((RuntimeError, FileNotFoundError)):
            run_matting(config)

if __name__ == '__main__':
    unittest.main()
