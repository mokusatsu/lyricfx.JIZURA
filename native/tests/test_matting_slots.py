import os, sys, unittest, tempfile, shutil
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from native.matting import run_matting
from native.matte_format import unpack_jizmat

class TestMattingSlots(unittest.TestCase):
    def setUp(self):
        self.tmp_dir = tempfile.mkdtemp(prefix="jizura_matte_slots_test_")
        # Create a real test PNG image
        self.img_path = os.path.join(self.tmp_dir, "test_input.png")
        img = Image.new("RGB", (64, 64), color=(200, 100, 50))
        img.save(self.img_path)

    def tearDown(self):
        shutil.rmtree(self.tmp_dir, ignore_errors=True)

    def test_discontinuous_slots_with_real_input(self):
        out_file = os.path.join(self.tmp_dir, "test.jizmat")
        slots = [0, 1, 2, 5]
        progress_events = []

        def on_prog(e):
            progress_events.append(e)

        config = {
            "sourceVideo": self.img_path,
            "outputFile": out_file,
            "profile": "rvm-mobilenetv3-fp32-p512-r05-v1",
            "fps": 24,
            "duration": 8.5,
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
        self.assertEqual(meta["duration"], 8.5)
        unpacked_indices = [idx for idx, _ in frames]
        self.assertEqual(unpacked_indices, slots)

    def test_short_video_fallback_succeeds(self):
        # Create a short 2s, 2fps video (4 frames total at 0.0, 0.5, 1.0, 1.5s)
        short_video = os.path.join(self.tmp_dir, "short_2fps.mp4")
        import subprocess
        from native.matting import resolve_system_ffmpeg
        ffmpeg = resolve_system_ffmpeg()
        subprocess.run([
            ffmpeg, "-y", "-f", "lavfi",
            "-i", "testsrc=duration=2:size=64x64:rate=2",
            "-c:v", "libx264", "-pix_fmt", "yuv420p", short_video
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

        out_file = os.path.join(self.tmp_dir, "short_out.jizmat")
        # Request slots including 1.75s (slot 7 at 4fps) and beyond video end
        slots = [0, 1, 2, 7, 8, 9]

        config = {
            "sourceVideo": short_video,
            "outputFile": out_file,
            "profile": "rvm-mobilenetv3-fp32-p512-r05-v1",
            "fps": 4, # 0.25s interval: slot 7 is 1.75s, slot 8 is 2.0s
            "duration": 2.0,
            "slots": slots,
            "sourceId": "short-video-item"
        }

        # Must succeed gracefully without crashing
        res = run_matting(config)
        self.assertEqual(res["status"], "completed")
        self.assertTrue(os.path.exists(out_file))

        with open(out_file, "rb") as f:
            meta, frames = unpack_jizmat(f.read())
        self.assertEqual(meta["sourceId"], "short-video-item")
        self.assertEqual(meta["frameCount"], len(slots))

    def test_missing_input_file_raises_error(self):
        out_file = os.path.join(self.tmp_dir, "missing.jizmat")
        config = {
            "sourceVideo": os.path.join(self.tmp_dir, "non_existent.png"),
            "outputFile": out_file,
            "profile": "rvm-mobilenetv3-fp32-p512-r05-v1",
            "fps": 24,
            "slots": [0],
            "sourceId": "item-abc"
        }
        with self.assertRaises((RuntimeError, FileNotFoundError)):
            run_matting(config)

if __name__ == '__main__':
    unittest.main()
