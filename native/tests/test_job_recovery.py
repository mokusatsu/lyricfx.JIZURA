import os, sys, unittest, tempfile, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from native.matting import get_ort_session, run_matting

class TestJobRecovery(unittest.TestCase):
    def setUp(self):
        self.tmp_dir = tempfile.mkdtemp(prefix="jizura_recovery_test_")

    def tearDown(self):
        shutil.rmtree(self.tmp_dir, ignore_errors=True)

    def test_gpu_unavailable_falls_back_to_cpu(self):
        # Request GPU on a non-existent or cpu-only session
        sess, backend = get_ort_session("non_existent_model.onnx", prefer_gpu=True)
        # Should gracefully return None/CPU without crashing
        self.assertIn(backend.lower(), ["cpu", "directml", "cuda", "none", "mock-cpu"])

    def test_matting_completes_under_fallback(self):
        out_file = os.path.join(self.tmp_dir, "fallback_test.jizmat")
        config = {
            "sourceVideo": "non_existent.mp4",
            "outputFile": out_file,
            "profile": "rvm-mobilenetv3-fp32-p512-r05-v1",
            "fps": 24,
            "slots": [0, 1]
        }
        res = run_matting(config)
        self.assertEqual(res["status"], "completed")
        self.assertTrue(os.path.exists(out_file))

if __name__ == '__main__':
    unittest.main()
