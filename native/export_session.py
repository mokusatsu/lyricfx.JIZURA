"""Bounded, PTS-addressed video export session. Paths are resolved by the host.

Source replies are <uint32 JSON length><UTF-8 metadata><decoded pixels>.
Each cursor owns at most five decoded frames; a reply is immutable until the
renderer has received it. Output requests are strictly ordered and acknowledged
only after the encoder pipe accepts the entire RGBA frame.
"""
import json
import math
import os
import queue
import re
import secrets
import socket
import shutil
import struct
import subprocess
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit, parse_qs

from export_video import (resolve_system_ffmpeg, resolve_encoder,
                          build_video_encoder_args, ENCODER_DISPLAY_NAMES,
                          NO_WINDOW_FLAG, drain_stream_thread, stream_frame_into,
                          probe_audio_format_and_copy)


def resolve_probe(ffmpeg):
    probe = os.path.join(os.path.dirname(ffmpeg), 'ffprobe.exe' if sys.platform == 'win32' else 'ffprobe')
    if not os.path.isfile(probe):
        probe = shutil.which('ffprobe')
    if not probe:
        raise RuntimeError('ffprobe is required for PTS-addressed export')
    return probe


def probe_media(filename, ffmpeg):
    probe = resolve_probe(ffmpeg)
    p = subprocess.run([probe, '-v', 'error', '-show_streams', '-show_format', '-of', 'json', filename],
                       capture_output=True, timeout=30, creationflags=NO_WINDOW_FLAG, check=True)
    return json.loads(p.stdout)


def stop_process(proc):
    if proc is None:
        return
    if proc.poll() is None:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except subprocess.TimeoutExpired:
            proc.kill()
            proc.wait(timeout=3)


class Decoder:
    def __init__(self, ffmpeg, spec, info):
        self.spec, self.info = spec, info
        self.closed = threading.Event()
        self.frames = queue.Queue(maxsize=2)
        self.current = self.next = None
        self.lock = threading.Lock()
        self.decoded = self.decode_ms = self.wait_ms = 0
        self.error = None
        stream = next(s for s in info['streams'] if s['codec_type'] == 'video')
        w, h = int(stream['width']), int(stream['height'])
        # Keep subsampled planes unrotated: rotating YUV before converting it
        # to RGB changes chroma sampling. Chromium applies the display transform.
        rotation = next((float(s.get('rotation', 0)) for s in stream.get('side_data_list', []) if 'rotation' in s), 0)
        self.rotation = int(spec.get('rotation', -rotation)) % 360
        self.flip = bool(spec.get('flip', False))
        self.width, self.height = w, h
        self.origin = float(stream.get('start_time', info['format'].get('start_time', 0)))
        self.container_duration = float(info['format'].get('duration', 0))
        self.expected_video_end = None
        if stream.get('duration') is not None:
            self.expected_video_end = float(stream['duration'])
        else:
            duration_tag = stream.get('tags', {}).get('DURATION')
            if duration_tag:
                hh, mm, ss = map(float, duration_tag.split(':'))
                self.expected_video_end = hh * 3600 + mm * 60 + ss - self.origin
        # Preserve decoded YUV samples and use Chromium's own YUV->RGB conversion
        # rather than introducing swscale rounding differences in the compositor.
        pix = stream.get('pix_fmt', '')
        alpha = pix == 'yuva420p' or str(stream.get('tags', {}).get('alpha_mode', stream.get('tags', {}).get('ALPHA_MODE', '0'))) == '1'
        self.format = ('I420A' if alpha else 'I420') if pix in ('yuv420p', 'yuva420p') and w % 2 == 0 and h % 2 == 0 else 'RGBA'
        self.size = w * h * (5 if alpha else 3) // 2 if self.format in ('I420', 'I420A') else w * h * 4
        if self.size > 128 * 1024 * 1024:
            raise ValueError('Decoded source frame exceeds 128 MiB')
        sar = stream.get('sample_aspect_ratio', '1:1').split(':')
        ratio = float(sar[0]) / max(1, float(sar[1])) if len(sar) == 2 else 1
        self.display_width = max(1, round(w * ratio))
        self.display_height = h
        if self.rotation % 180:
            self.display_width, self.display_height = self.display_height, self.display_width
        self.color = dict(primaries=stream.get('color_primaries', 'bt709'),
                          transfer=stream.get('color_transfer', 'bt709'),
                          matrix=stream.get('color_space', 'bt709'),
                          fullRange=stream.get('color_range') == 'pc')
        if spec.get('colorSpace') and self.format != 'RGBA':
            self.color = spec['colorSpace']
        if spec.get('displayWidth') and spec.get('displayHeight'):
            self.display_width, self.display_height = int(spec['displayWidth']), int(spec['displayHeight'])
        if self.format == 'RGBA':
            self.color = dict(primaries='bt709', transfer='iec61966-2-1', matrix='rgb', fullRange=True)
        self.metadata = queue.Queue(maxsize=4)
        start = max(0, float(spec['start']) - .001)
        cmd = [ffmpeg, '-hide_banner', '-nostdin', '-loglevel', 'info', '-copyts',
               '-ss', str(start), '-noaccurate_seek', '-noautorotate', '-threads', '2']
        if alpha and stream['codec_name'] in ('vp8', 'vp9'):
            cmd += ['-c:v', 'libvpx-vp9' if stream['codec_name'] == 'vp9' else 'libvpx']
        cmd += ['-i', spec['path'],
               '-map', '0:v:0', '-an', '-sn', '-dn', '-vf', 'showinfo=checksum=0',
               '-fps_mode', 'passthrough', '-pix_fmt', {'I420': 'yuv420p', 'I420A': 'yuva420p', 'RGBA': 'rgba'}[self.format],
               '-f', 'rawvideo', 'pipe:1']
        self.command = cmd
        self.proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                     creationflags=NO_WINDOW_FLAG)
        self.stderr = bytearray()
        self.decoder_name = None
        self.stderr_thread = threading.Thread(target=self._stderr, daemon=True)
        self.reader = threading.Thread(target=self._read, daemon=True)
        self.stderr_thread.start()
        self.reader.start()

    def _put(self, q, value):
        while not self.closed.is_set():
            try:
                q.put(value, timeout=.1)
                return True
            except queue.Full:
                pass
        return False

    def _stderr(self):
        for line in iter(self.proc.stderr.readline, b''):
            self.stderr.extend(line)
            if len(self.stderr) > 65536:
                del self.stderr[:-32768]
            text = line.decode('utf-8', 'replace')
            mapping = re.search(r'\((\w+) \(([^)]+)\) -> rawvideo', text)
            if mapping:
                self.decoder_name = mapping.group(2)
            match = re.search(r'\bn:\s*(\d+).*?pts_time:([\d.e+\-]+).*?duration_time:([\d.e+\-]+)', text)
            if match:
                if not self._put(self.metadata, (int(match[1]), float(match[2]) - self.origin, float(match[3]))):
                    break

    def _read(self):
        try:
            while not self.closed.is_set():
                data = bytearray(self.size)
                started = time.perf_counter()
                if not stream_frame_into(self.proc.stdout, memoryview(data), self.size):
                    code = self.proc.wait(timeout=10)
                    if code:
                        raise RuntimeError(f'Decoder exited {code}: {self.stderr.decode("utf-8", "replace")}')
                    break
                while not self.closed.is_set():
                    try:
                        serial, pts, duration = self.metadata.get(timeout=.1)
                        break
                    except queue.Empty:
                        if not self.stderr_thread.is_alive():
                            raise RuntimeError('Decoded frame has no matching PTS')
                if self.closed.is_set():
                    break
                self.decoded += 1
                self.decode_ms += (time.perf_counter() - started) * 1000
                if not self._put(self.frames, (serial, pts, duration, data)):
                    break
        except Exception as error:
            self.error = error
        finally:
            self._put(self.frames, None)

    def _take(self):
        started = time.perf_counter()
        while not self.closed.is_set():
            try:
                result = self.frames.get(timeout=.1)
                self.wait_ms += (time.perf_counter() - started) * 1000
                if result is None and self.error:
                    raise self.error
                return result
            except queue.Empty:
                if not self.reader.is_alive():
                    raise self.error or RuntimeError('Decoder stopped before the requested frame')
        raise RuntimeError('Decoder cancelled')

    def frame(self, target, after):
        with self.lock:
            if self.current is not None and target < self.current[1] - .000001:
                raise ValueError('Source PTS requests must be monotonic within a cursor')
            if self.current is None:
                self.current = self._take()
                if self.current is None:
                    raise EOFError('Source contains no decoded frames')
                self.next = self._take()
            while self.next is not None and self.next[1] <= target + .000001:
                self.current, self.next = self.next, self._take()
            serial, pts, duration, data = self.current
            if pts > target + .002:
                raise EOFError(f'First source PTS {pts} is after requested {target}')
            if self.next is None and target >= pts + max(duration, .001) + .002:
                complete_video = self.expected_video_end is not None and abs(pts + duration - self.expected_video_end) <= .002
                if not complete_video or target > self.container_duration + .002:
                    raise EOFError(f'Source ended at {pts + duration}, requested {target}')
            meta = dict(serial=serial, pts=pts, duration=duration, format=self.format,
                        width=self.width, height=self.height, displayWidth=self.display_width,
                        displayHeight=self.display_height, rotation=self.rotation, flip=self.flip,
                        colorSpace=self.color, reused=serial == after)
            header = json.dumps(meta, separators=(',', ':')).encode()
            return struct.pack('<I', len(header)) + header, b'' if meta['reused'] else data

    def close(self):
        self.closed.set()
        stop_process(self.proc)
        for thread in (self.reader, self.stderr_thread):
            if thread is not threading.current_thread():
                thread.join(timeout=3)
        for stream in (self.proc.stdout, self.proc.stderr):
            stream.close()


class ExportSession:
    def __init__(self, config, infos=None):
        self.config = config
        self.ffmpeg = resolve_system_ffmpeg()
        self.width, self.height = int(config['width']), int(config['height'])
        self.total = int(config['frameCount'])
        if not (0 < self.width <= 16384 and 0 < self.height <= 16384 and self.total > 0 and 0 < config['fps'] <= 240):
            raise ValueError('Invalid video dimensions, frame count or fps')
        self.frame_size = self.width * self.height * 4
        self.frames = self.write_ms = 0
        self.lock = threading.Lock()
        self.cancelled = False
        self.specs = {s['id']: s for s in config.get('sources', [])}
        self.decoders, self.closed_stats, self.infos = {}, [], infos or {}
        self.encoder = resolve_encoder(self.ffmpeg, config.get('encoder', 'auto'))
        self.audio = config.get('audioFile')
        self.video = config['outputFile'] + '.video.mp4' if self.audio else config['outputFile']
        self.mux_proc = None
        args = [self.ffmpeg, '-y', '-hide_banner', '-nostdin', '-f', 'rawvideo', '-pixel_format', 'rgba',
                '-video_size', f'{self.width}x{self.height}', '-framerate', str(config['fps']), '-i', 'pipe:0',
                '-frames:v', str(self.total)]
        args += build_video_encoder_args(self.encoder, config.get('bitrate'), config.get('qp'))
        args += ['-an', '-movflags', '+faststart', '-f', 'mp4', self.video]
        self.command = args
        self.proc = subprocess.Popen(args, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL,
                                     stderr=subprocess.PIPE, creationflags=NO_WINDOW_FLAG)
        self.errors = drain_stream_thread(self.proc.stderr)

    def source(self, cursor, target, after):
        if self.cancelled:
            raise RuntimeError('Export cancelled')
        spec = self.specs[cursor]
        if not math.isfinite(target) or target < spec['start'] - .002 or target > spec['end'] + .002:
            raise ValueError('Source time is outside the declared interval')
        if cursor not in self.decoders:
            if len(self.decoders) >= 4:
                raise ValueError('More than four simultaneous source cursors')
            if spec['path'] not in self.infos:
                self.infos[spec['path']] = probe_media(spec['path'], self.ffmpeg)
            self.decoders[cursor] = Decoder(self.ffmpeg, spec, self.infos[spec['path']])
            if sum(decoder.size * 5 for decoder in self.decoders.values()) > 256 * 1024 * 1024:
                self.release(cursor)
                raise ValueError('Decoded source buffers exceed the 256 MiB prefetch budget')
        return self.decoders[cursor].frame(target, after)

    def release(self, cursor, check=True):
        decoder = self.decoders.pop(cursor, None)
        if decoder:
            error, exit_code = decoder.error, decoder.proc.poll()
            decoder.close()
            self.closed_stats.append(dict(id=cursor, decoded=decoder.decoded, decodeMs=decoder.decode_ms,
                                          waitMs=decoder.wait_ms, command=decoder.command,
                                          decoder=decoder.decoder_name, hardwareAcceleration=False,
                                          format=decoder.format, width=decoder.width, height=decoder.height))
            if check and (error is not None or exit_code not in (None, 0)):
                raise error or RuntimeError(f'Decoder exited unexpectedly with code {exit_code}')

    def write(self, index, stream):
        with self.lock:
            if self.cancelled or index != self.frames or index >= self.total:
                raise ValueError(f'Expected output frame {self.frames}, received {index}')
            data = bytearray(self.frame_size)
            if not stream_frame_into(stream, memoryview(data), self.frame_size):
                raise EOFError('Missing output frame')
            started = time.perf_counter()
            self.proc.stdin.write(data)
            self.proc.stdin.flush()
            self.write_ms += (time.perf_counter() - started) * 1000
            self.frames += 1

    def finish(self):
        with self.lock:
            if self.cancelled or self.frames != self.total:
                raise EOFError(f'Expected {self.total} frames, received {self.frames}')
            self.proc.stdin.close()
            code = self.proc.wait(timeout=120)
            if code:
                raise RuntimeError(f'Encoder exited {code}: {self.errors().decode("utf-8", "replace")}')
            for cursor in list(self.decoders):
                self.release(cursor)
            audio_codec, mux_mode = None, 'none'
            started = time.perf_counter()
            if self.audio:
                offset = self.config.get('audioOffset', 0)
                can_copy, _ = probe_audio_format_and_copy(self.ffmpeg, self.audio, offset)
                streams = probe_media(self.audio, self.ffmpeg)['streams']
                codec = next(s['codec_name'] for s in streams if s['codec_type'] == 'audio')
                for copy in ([True, False] if can_copy else [False]):
                    args = [self.ffmpeg, '-y', '-hide_banner', '-nostdin', '-i', self.video,
                            '-ss', str(offset), '-t', str(self.config['audioDuration']), '-i', self.audio,
                            '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'copy' if copy else 'aac']
                    if not copy:
                        args += ['-b:a', '320k']
                    args += ['-movflags', '+faststart', '-f', 'mp4', self.config['outputFile']]
                    self.mux_proc = subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE,
                                                     creationflags=NO_WINDOW_FLAG)
                    _, errors = self.mux_proc.communicate(timeout=120)
                    if self.mux_proc.returncode == 0:
                        audio_codec, mux_mode = (codec.upper() if copy else 'AAC'), ('copy' if copy else 'reencode')
                        break
                else:
                    raise RuntimeError(f'Audio mux failed: {errors.decode("utf-8", "replace")}')
                os.remove(self.video)
            return dict(type='finished', frames=self.frames, videoEncoder=ENCODER_DISPLAY_NAMES[self.encoder],
                        audioCodec=audio_codec, audioMuxMode=mux_mode,
                        metrics=dict(encoderWriteMs=self.write_ms, muxMs=(time.perf_counter() - started) * 1000,
                                     decoders=self.closed_stats, encoderCommand=self.command))

    def close(self):
        self.cancelled = True
        for cursor in list(self.decoders):
            self.release(cursor, check=False)
        stop_process(self.proc)
        stop_process(self.mux_proc)
        self.errors.thread.join(timeout=3)
        for stream in (self.proc.stdin, self.proc.stderr):
            try:
                stream.close()
            except (OSError, ValueError):
                pass


def run_export_session():
    config = json.loads(sys.stdin.buffer.readline())
    ffmpeg = resolve_system_ffmpeg()
    infos = {path: probe_media(path, ffmpeg) for path in {source['path'] for source in config.get('sources', [])}}
    session = ExportSession(config, infos)
    token = secrets.token_urlsafe(32)
    done = threading.Event()
    completed = threading.Event()

    class Handler(BaseHTTPRequestHandler):
        protocol_version = 'HTTP/1.1'

        def handle_one_request(self):
            self.raw_requestline = None
            try:
                super().handle_one_request()
            except ConnectionResetError:
                # Only an idle keep-alive reset after a completed export is benign.
                if not completed.is_set() or self.raw_requestline is not None:
                    raise
                self.close_connection = True

        def setup(self):
            super().setup()
            self.connection.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
            self.connection.settimeout(30)

        def log_message(self, *_):
            pass

        def respond(self, status, data=b'', content='application/octet-stream'):
            self.send_response(status)
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Type', content)
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            if data:
                self.wfile.write(data)

        def handle_request(self):
            parsed = urlsplit(self.path)
            parts = parsed.path.strip('/').split('/')
            if len(parts) < 2 or not secrets.compare_digest(parts[0], token):
                return self.respond(403)
            op = parts[1]
            try:
                if op == 'source' and self.command == 'GET':
                    query = parse_qs(parsed.query)
                    header, pixels = session.source(parts[2], float(query['t'][0]), int(query.get('after', ['-1'])[0]))
                    self.send_response(200)
                    self.send_header('Cache-Control', 'no-store')
                    self.send_header('Content-Length', str(len(header) + len(pixels)))
                    self.end_headers()
                    self.wfile.write(header)
                    self.wfile.write(pixels)
                elif op == 'release' and self.command == 'POST':
                    session.release(parts[2])
                    self.respond(200, b'{}', 'application/json')
                elif op == 'frame' and self.command == 'POST':
                    if int(self.headers.get('Content-Length', 0)) != session.frame_size:
                        raise ValueError('Incorrect RGBA frame size')
                    session.write(int(parts[2]), self.rfile)
                    self.respond(200, b'{}', 'application/json')
                elif op == 'finish' and self.command == 'POST':
                    result = session.finish()
                    print(json.dumps(result), flush=True)
                    completed.set()
                    self.respond(200, json.dumps(result).encode(), 'application/json')
                    done.set()
                else:
                    self.respond(404)
            except Exception as error:
                self.close_connection = True
                self.respond(500, str(error).encode('utf-8'), 'text/plain')

        do_GET = handle_request
        do_POST = handle_request

    server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    server.daemon_threads = True
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    print(json.dumps(dict(type='ready', endpoint=f'http://127.0.0.1:{server.server_port}/{token}',
                          videoEncoder=ENCODER_DISPLAY_NAMES[session.encoder])), flush=True)

    def stdin_closed():
        # The host closes stdin only on cancellation/crash; finish uses HTTP.
        sys.stdin.buffer.read()
        done.set()

    threading.Thread(target=stdin_closed, daemon=True).start()
    try:
        done.wait()
    finally:
        session.close()
        server.shutdown()
        server.server_close()
    if not completed.is_set():
        raise EOFError('Export session closed before all frames were finalized')


if __name__ == '__main__':
    run_export_session()
