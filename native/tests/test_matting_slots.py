import os, sys, unittest, tempfile, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from native.matting import run_matting
from native.matte_format import unpack_jizmat

class TestMattingSlots(unittest.TestCase):
    def setUp(self):
        self.tmp_dir = tempfile.mkdtemp(prefix="jizura_matte_slots_test_")

    def tearDown(self):
        shutil.rmtree(self.tmp_dir, ignore_errors=True)

    def test_discontinuous_slots(self):
        out_file = os.path.join(self.tmp_dir, "test.jizmat")
        slots = [0, 1, 2, 10, 11, 25]
        progress_events = []

        def on_prog(e):
            progress_events.append(e)

        config = {
            "sourceVideo": "dummy.mp4",
            "outputFile": out_file,
            "profile": "rvm-mobilenetv3-fp32-p512-r05-v1",
            "fps": 24,
            "slots": slots,
            "sourceId": "item-abc"
        }

        res = run_matting(config, progress_cb=on_prog)
        self.assertEqual(res["status"], "completed")
        self.assertTrue(os.path.exists(out_file))
        self.assertEqual(len(progress_events), len(slots))

        # Check unpacked container
        with open(out_file, "rb") as f:
            data = f.read()
        meta, frames = unpack_jizmat(data)
        self.assertEqual(meta["sourceId"], "item-abc")
        self.assertEqual(meta["version"], 2)
        self.assertEqual(meta["frameCount"], len(slots))
        unpacked_indices = [idx for idx, _ in frames]
        self.assertEqual(unpacked_indices, slots)

if __name__ == '__main__':
    unittest.main()
