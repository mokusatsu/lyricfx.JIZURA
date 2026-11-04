import os, sys, unittest

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from native.matte_format import pack_jizmat, unpack_jizmat

class TestMatteFormat(unittest.TestCase):
    def test_pack_and_unpack(self):
        meta = {
            "sourceId": "test-src-123",
            "model": "rvm-mobilenetv3-fp32-p512-r05-v1",
            "duration": 5.0,
            "fps": 24,
            "width": 512,
            "height": 512
        }
        # Fake png frames
        fake_png1 = b"\x89PNG\r\n\x1a\nframe1_dummy_data"
        fake_png2 = b"\x89PNG\r\n\x1a\nframe2_dummy_data_longer"
        frames = [(0, fake_png1), (10, fake_png2)]

        packed = pack_jizmat(meta, frames)
        self.assertTrue(packed.startswith(b'JIZMAT01'))

        unpacked_meta, unpacked_frames = unpack_jizmat(packed)
        self.assertEqual(unpacked_meta["sourceId"], "test-src-123")
        self.assertEqual(unpacked_meta["version"], 2)
        self.assertEqual(unpacked_meta["frameCount"], 2)
        self.assertEqual(len(unpacked_frames), 2)
        self.assertEqual(unpacked_frames[0], (0, fake_png1))
        self.assertEqual(unpacked_frames[1], (10, fake_png2))

    def test_invalid_magic(self):
        corrupted = b"BADMAGIC" + b"\x00" * 20
        with self.assertRaises(ValueError):
            unpack_jizmat(corrupted)

if __name__ == '__main__':
    unittest.main()
