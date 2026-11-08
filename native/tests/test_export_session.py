import io
import json
import pathlib
import struct
import subprocess
import sys
import tempfile
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'native'))
from export_session import Decoder, ExportSession, probe_media, resolve_system_ffmpeg


class ExportSessionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        target = ROOT / '.codex-temp' / 'tests'
        target.mkdir(parents=True, exist_ok=True)
        cls.directory = tempfile.TemporaryDirectory(prefix='export-session-', dir=target)
        cls.folder = pathlib.Path(cls.directory.name)
        cls.ffmpeg = resolve_system_ffmpeg()
        cls.cfr = cls.folder / 'cfr.mp4'
        cls.vfr = cls.folder / 'vfr.webm'
        cls.run_ffmpeg('-f', 'lavfi', '-i', 'testsrc2=size=64x48:rate=25:duration=3',
                       '-vf', 'setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709',
                       '-c:v', 'libx264', '-threads', '1', '-g', '25', '-pix_fmt', 'yuv420p',
                       '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', str(cls.cfr))
        cls.run_ffmpeg('-f', 'lavfi', '-i', 'testsrc2=size=64x48:rate=10:duration=1.2',
                       '-vf', r'select=not(eq(n\,2)+eq(n\,3)+eq(n\,6)),setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709', '-fps_mode', 'vfr',
                       '-c:v', 'libvpx-vp9', '-threads', '1', '-pix_fmt', 'yuv420p',
                       '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', str(cls.vfr))

    @classmethod
    def run_ffmpeg(cls, *args):
        subprocess.run([cls.ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', *args],
                       check=True, capture_output=True)

    @classmethod
    def tearDownClass(cls):
        cls.directory.cleanup()

    def decoder(self, path, start=0, end=3):
        decoder = Decoder(self.ffmpeg, dict(id='test', path=str(path), start=start, end=end),
                          probe_media(str(path), self.ffmpeg))
        self.addCleanup(decoder.close)
        return decoder

    def frame(self, decoder, time, after=-1):
        header, data = decoder.frame(time, after)
        length = struct.unpack('<I', header[:4])[0]
        self.assertEqual(length, len(header) - 4)
        return json.loads(header[4:]), data

    def test_cfr_pts_offsets_and_output_rates(self):
        for fps in (24, 30, 60):
            with self.subTest(fps=fps):
                decoder = self.decoder(self.cfr, 1.3, 2.3)
                for index in range(fps):
                    target = 1.3 + index / fps
                    metadata, data = self.frame(decoder, target)
                    self.assertAlmostEqual(metadata['pts'], int((target + .000001) * 25) / 25, places=5)
                    self.assertEqual(len(data), 64 * 48 * 3 // 2)
                decoder.close()

    def test_vfr_pts_and_reuse(self):
        decoder = self.decoder(self.vfr, 0, 1.1)
        previous = -1
        for target, expected in ((0, 0), (.15, .1), (.3, .1), (.45, .4), (.65, .5), (.75, .7), (1.09, 1)):
            metadata, data = self.frame(decoder, target, previous)
            self.assertAlmostEqual(metadata['pts'], expected, places=5)
            self.assertEqual(metadata['reused'], metadata['serial'] == previous)
            self.assertEqual(bool(data), not metadata['reused'])
            previous = metadata['serial']

    def test_early_eof_and_reverse_pts_fail(self):
        decoder = self.decoder(self.vfr, 0, 4)
        self.frame(decoder, .5)
        with self.assertRaisesRegex(ValueError, 'monotonic'):
            self.frame(decoder, .1)
        with self.assertRaises(EOFError):
            self.frame(decoder, 2)

    def test_decoded_bytes_match_pts_after_seek(self):
        reference = subprocess.run([self.ffmpeg, '-v', 'error', '-i', str(self.vfr), '-pix_fmt', 'yuv420p',
                                    '-fps_mode', 'passthrough', '-f', 'rawvideo', '-'], capture_output=True, check=True).stdout
        size = 64 * 48 * 3 // 2
        pts = [0, .1, .4, .5, .7, .8, .9, 1, 1.1]
        decoder = self.decoder(self.vfr, .2, 1.1)
        for target in (.2, .25, .45, .69, .75, 1.09):
            metadata, data = self.frame(decoder, target)
            index = max(i for i, time in enumerate(pts) if time <= target + .000001)
            self.assertAlmostEqual(metadata['pts'], pts[index], places=5)
            self.assertEqual(data, reference[index * size:(index + 1) * size])

    def test_decoder_and_encoder_failures_are_errors(self):
        broken = self.folder / 'broken.mp4'
        broken.write_bytes(b'not a video')
        decoder = Decoder(self.ffmpeg, dict(id='broken', path=str(broken), start=0, end=1),
                          probe_media(str(self.cfr), self.ffmpeg))
        self.addCleanup(decoder.close)
        with self.assertRaisesRegex(RuntimeError, 'Decoder exited'):
            self.frame(decoder, 0)
        session = ExportSession(dict(width=64, height=48, fps=24, frameCount=1, encoder='cpu',
                                     outputFile=str(self.folder / 'encoder-failed.mp4')))
        self.addCleanup(session.close)
        session.proc.kill();session.proc.wait()
        with self.assertRaises((OSError, RuntimeError)):
            session.write(0, io.BytesIO(bytes(64 * 48 * 4)))

    def test_alpha_samples_survive_decode(self):
        from PIL import Image
        image = Image.new('RGBA', (64, 48), (120, 80, 40, 128))
        png, video = self.folder / 'alpha.png', self.folder / 'alpha.webm'
        image.save(png)
        self.run_ffmpeg('-loop', '1', '-framerate', '10', '-i', str(png), '-t', '0.3',
                        '-c:v', 'libvpx-vp9', '-lossless', '1', '-threads', '1', '-pix_fmt', 'yuva420p', str(video))
        decoder = self.decoder(video, 0, .2)
        metadata, data = self.frame(decoder, 0)
        self.assertEqual(metadata['format'], 'I420A')
        reference = subprocess.run([self.ffmpeg, '-v', 'error', '-c:v', 'libvpx-vp9', '-i', str(video),
                                    '-frames:v', '1', '-vf', 'alphaextract', '-pix_fmt', 'gray', '-f', 'rawvideo', '-'],
                                   capture_output=True, check=True).stdout
        self.assertEqual(data[64 * 48 * 3 // 2:], reference)
        self.assertTrue(all(0 < value < 255 for value in reference))

    def test_rotation_and_sample_aspect(self):
        wide, rotated = self.folder / 'wide.mp4', self.folder / 'rotated.mp4'
        self.run_ffmpeg('-i', str(self.cfr), '-vf', 'setsar=2/1', '-c:v', 'libx264', '-threads', '1', str(wide))
        self.run_ffmpeg('-display_rotation:v:0', '90', '-i', str(wide), '-c', 'copy', str(rotated))
        decoder = self.decoder(rotated)
        metadata, data = self.frame(decoder, 0)
        self.assertEqual((metadata['width'], metadata['height']), (64, 48))
        self.assertEqual((metadata['displayWidth'], metadata['displayHeight']), (48, 128))
        self.assertEqual(metadata['rotation'], 270)
        self.assertEqual(len(data), 64 * 48 * 3 // 2)

    def test_strict_output_sequence_and_count(self):
        config = dict(width=64, height=48, fps=24, frameCount=2, encoder='cpu',
                      outputFile=str(self.folder / 'output.mp4'))
        session = ExportSession(config)
        self.addCleanup(session.close)
        data = bytes([100, 80, 60, 255]) * (64 * 48)
        with self.assertRaisesRegex(ValueError, 'Expected output frame'):
            session.write(1, io.BytesIO(data))
        with self.assertRaises(EOFError):
            session.write(0, io.BytesIO(data[:-1]))
        session.write(0, io.BytesIO(data))
        with self.assertRaises(EOFError):
            session.finish()
        session.write(1, io.BytesIO(data))
        result = session.finish()
        self.assertEqual(result['frames'], 2)

    def test_cancel_terminates_decoder_and_encoder(self):
        config = dict(width=64, height=48, fps=24, frameCount=20, encoder='cpu',
                      outputFile=str(self.folder / 'cancel.mp4'),
                      sources=[dict(id='source', path=str(self.cfr), start=0, end=2)])
        session = ExportSession(config)
        session.source('source', 0, -1)
        processes = [session.proc, session.decoders['source'].proc]
        session.close()
        self.assertTrue(all(process.poll() is not None for process in processes))
        with self.assertRaises(RuntimeError):
            session.source('source', 1, -1)

    def test_legacy_worker_rejects_short_input(self):
        config = dict(width=64, height=48, fps=24, frameCount=2, encoder='cpu',
                      outputFile=str(self.folder / 'short.mp4'))
        payload = json.dumps(config).encode() + b'\n' + bytes(64 * 48 * 4)
        result = subprocess.run([sys.executable, str(ROOT / 'native' / 'export_video.py')],
                                input=payload, capture_output=True, timeout=30)
        self.assertNotEqual(result.returncode, 0)
        self.assertNotIn(b'"finished"', result.stdout)


if __name__ == '__main__':
    unittest.main()
