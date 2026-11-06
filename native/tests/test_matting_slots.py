import os, sys, unittest, tempfile, shutil, subprocess
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

    def test_decode_frame_seek_accuracy(self):
        from native.matting import decode_source_frame, resolve_system_ffmpeg
        ffmpeg = resolve_system_ffmpeg()
        test_video = os.path.join(self.tmp_dir, "seek_test.mp4")
        # Generate video: 0.0s..1.0s is pure blue, 1.0s..2.0s is pure red
        subprocess.run([
            ffmpeg, "-y",
            "-f", "lavfi", "-i", "color=c=blue:s=64x64:d=1:r=30",
            "-f", "lavfi", "-i", "color=c=red:s=64x64:d=1:r=30",
            "-filter_complex", "[0:v][1:v]concat=n=2:v=1:a=0[v]",
            "-map", "[v]", "-pix_fmt", "yuv420p", test_video
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

        # Calling decode_source_frame with target_time=1.0 and fps=1 must accurately extract the 1.0s frame (red),
        # not the 0.5s frame (blue) from dt=0.5/fps subtraction!
        buf = decode_source_frame(test_video, target_time=1.0, width=64, height=64, fps=1)
        self.assertEqual(len(buf), 64 * 64 * 3)
        r, g, b = buf[0], buf[1], buf[2]
        self.assertGreater(r, 200, f"Expected red pixel at 1.0s, but got R={r}, G={g}, B={b}")
        self.assertLess(b, 50, f"Expected red pixel at 1.0s, but got R={r}, G={g}, B={b}")

    def test_streaming_frame_sequence_accuracy(self):
        # Regression test for 1-frame offset bug in streaming decoder
        from native.matting import resolve_system_ffmpeg, run_matting
        from native.matte_format import unpack_jizmat
        ffmpeg = resolve_system_ffmpeg()
        test_video = os.path.join(self.tmp_dir, "stream_seq_test.mp4")

        # 2-second video at 2fps:
        # Slot 0 (0.0s), Slot 1 (0.5s): Pure RED
        # Slot 2 (1.0s), Slot 3 (1.5s): Pure BLUE
        subprocess.run([
            ffmpeg, "-y",
            "-f", "lavfi", "-i", "color=c=red:s=64x64:d=1:r=2",
            "-f", "lavfi", "-i", "color=c=blue:s=64x64:d=1:r=2",
            "-filter_complex", "[0:v][1:v]concat=n=2:v=1:a=0[v]",
            "-map", "[v]", "-pix_fmt", "yuv420p", test_video
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

        # Hook or capture intermediate frames
        out_file = os.path.join(self.tmp_dir, "stream_seq.jizmat")
        config = {
            "sourceVideo": test_video,
            "outputFile": out_file,
            "profile": "rvm-mobilenetv3-fp32-p512-r05-v1",
            "fps": 2,
            "duration": 2.0,
            "slots": [0, 1, 2, 3],
            "sourceId": "seq-test"
        }

        # Also directly test streaming decoder sequential frames
        from native.matting import FFmpegStreamDecoder
        dec = FFmpegStreamDecoder(test_video, 64, 64, fps=2, start_time=0.0)
        frames = [dec.read_frame() for _ in range(4)]
        dec.close()

        self.assertEqual(len(frames), 4)
        # Frame 0 (0.0s) & 1 (0.5s) must be RED
        self.assertGreater(frames[0][0], 200, "Frame 0 must be red")
        self.assertLess(frames[0][2], 50, "Frame 0 must not be blue")
        self.assertGreater(frames[1][0], 200, "Frame 1 must be red")
        self.assertLess(frames[1][2], 50, "Frame 1 must not be blue")

        # Frame 2 (1.0s) & 3 (1.5s) must be BLUE
        self.assertGreater(frames[2][2], 200, "Frame 2 must be blue")
        self.assertLess(frames[2][0], 50, "Frame 2 must not be red")
        self.assertGreater(frames[3][2], 200, "Frame 3 must be blue")
        self.assertLess(frames[3][0], 50, "Frame 3 must not be red")

        # Verify run_matting completes without error
        res = run_matting(config)
        self.assertEqual(res["status"], "completed")

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
