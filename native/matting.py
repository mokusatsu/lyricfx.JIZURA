import os, sys, time, json, math, subprocess, hashlib, urllib.request, queue, threading
from concurrent.futures import ThreadPoolExecutor

MODEL_URL = "https://github.com/PeterL1n/RobustVideoMatting/releases/download/v1.0.0/rvm_mobilenetv3_fp32.onnx"
MODEL_SHA256 = "88d4531297118f595bf2fd60f6f566aec2e559393802d1f436c380f0cbbd2828"

def sha256_file(filepath):
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def ensure_model_file(model_dir=None):
    """
    Ensures that RVM ONNX model is available and verified.
    Downloads from official release if missing (like Web version).
    """
    if model_dir is None:
        candidates = []
        if getattr(sys, 'frozen', False):
            base_dir = getattr(sys, '_MEIPASS', os.path.dirname(sys.executable))
            candidates.append(os.path.join(base_dir, "models"))
            candidates.append(os.path.join(os.path.dirname(sys.executable), "models"))
            candidates.append(os.path.join(os.path.dirname(os.path.dirname(sys.executable)), "models"))
        candidates.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "models"))

        found_dir = None
        for c in candidates:
            p = os.path.join(c, "rvm_mobilenetv3_fp32.onnx")
            if os.path.exists(p):
                found_dir = c
                break
        model_dir = found_dir or candidates[-1]

    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "rvm_mobilenetv3_fp32.onnx")

    if os.path.exists(model_path):
        current_hash = sha256_file(model_path)
        if current_hash.lower() == MODEL_SHA256.lower():
            return model_path
        sys.stderr.write(f"Model hash mismatch ({current_hash}), re-downloading...\n")
        try:
            os.remove(model_path)
        except Exception:
            pass

    # Download to temporary file
    temp_path = model_path + ".download"
    sys.stderr.write(f"Downloading RVM ONNX model from {MODEL_URL}...\n")
    try:
        urllib.request.urlretrieve(MODEL_URL, temp_path)
        download_hash = sha256_file(temp_path)
        if download_hash.lower() != MODEL_SHA256.lower():
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise ValueError(f"Downloaded model checksum mismatch: expected {MODEL_SHA256}, got {download_hash}")
        # Atomic rename
        os.replace(temp_path, model_path)
        return model_path
    except Exception as e:
        if os.path.exists(temp_path):
            try: os.remove(temp_path)
            except Exception: pass
        raise RuntimeError(f"Failed to download and prepare AI model: {e}")

def resolve_system_ffmpeg():
    """
    Finds system FFmpeg or raises RuntimeError if missing.
    """
    if os.environ.get("JIZURA_FFMPEG") and os.path.exists(os.environ["JIZURA_FFMPEG"]):
        return os.environ["JIZURA_FFMPEG"]
    import shutil
    found = shutil.which("ffmpeg")
    if found:
        return found
    raise RuntimeError("FFmpeg not found on system PATH. Please install FFmpeg or set JIZURA_FFMPEG environment variable.")

def _init_openvino_ep():
    """
    Ensures OpenVINO EP is registered if available (modular plugin or built-in).
    """
    try:
        import onnxruntime as ort
        if "OpenVINOExecutionProvider" in ort.get_available_providers():
            return True
        # Try modular plugin EP
        try:
            import onnxruntime_ep_openvino as ep
            lib_path = ep.get_library_path()
            if os.path.exists(lib_path):
                ort.register_execution_provider_library(ep.get_ep_name(), lib_path)
                return "OpenVINOExecutionProvider" in ort.get_available_providers()
        except Exception:
            pass

        # Try bundled frozen location fallback
        if getattr(sys, 'frozen', False):
            base_dir = getattr(sys, '_MEIPASS', os.path.dirname(sys.executable))
            candidates = [
                os.path.join(base_dir, "onnxruntime_ep_openvino", "onnxruntime_providers_openvino_plugin.dll"),
                os.path.join(base_dir, "onnxruntime_providers_openvino_plugin.dll"),
            ]
            for c in candidates:
                if os.path.exists(c):
                    ort.register_execution_provider_library("OpenVINOExecutionProvider", c)
                    return "OpenVINOExecutionProvider" in ort.get_available_providers()
    except Exception:
        pass
    return False

def probe_backends():
    """
    Probes available hardware execution providers without requiring an ONNX model file.
    Returns ordered list of available backends.
    Priority order: openvino (default) -> directml -> cuda -> cpu.
    """
    backends = ["cpu"]
    try:
        import onnxruntime as ort
        _init_openvino_ep()
        available = ort.get_available_providers()

        # Insert in ascending priority so highest priority ends up at index 0
        if "CUDAExecutionProvider" in available:
            backends.insert(0, "cuda")
        if "DmlExecutionProvider" in available:
            backends.insert(0, "directml")
        if "OpenVINOExecutionProvider" in available:
            backends.insert(0, "openvino")
    except Exception:
        pass
    return backends

def decode_source_frame(source_path, target_time, width, height, fps=24, fallback_frame=None):
    """
    Decodes a single frame at target_time (seconds) from video or image file as RGB bytes.
    Uses Pillow for images if possible, otherwise system FFmpeg.
    Ensures that the frame covering target_time is returned and falls back gracefully on short videos.
    """
    if not os.path.exists(source_path):
        raise FileNotFoundError(f"Source media file not found: {source_path}")

    ext = os.path.splitext(source_path)[1].lower()
    is_image = ext in [".png", ".jpg", ".jpeg", ".webp", ".bmp", ".gif"]

    if is_image:
        try:
            from PIL import Image
            with Image.open(source_path) as img:
                img_rgb = img.convert("RGB").resize((width, height), Image.Resampling.BILINEAR)
                return img_rgb.tobytes()
        except ImportError:
            pass

    ffmpeg = resolve_system_ffmpeg()

    # Target frame seek time based on presentation timestamp
    seek_time = max(0.0, float(target_time))

    cmd = [
        ffmpeg, "-y", "-hide_banner", "-nostdin",
        "-ss", f"{seek_time:.4f}",
        "-i", source_path,
        "-vframes", "1",
        "-f", "rawvideo",
        "-pix_fmt", "rgb24",
        "-s", f"{width}x{height}",
        "pipe:1"
    ]
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=15)
    if proc.returncode == 0 and len(proc.stdout) == width * height * 3:
        return proc.stdout

    # If seeking at target_time returned 0 frames (e.g. at or near end of short video)
    if fallback_frame is not None and len(fallback_frame) == width * height * 3:
        return fallback_frame

    # Try fallback to video tail frame or start frame
    tail_cmd = [
        ffmpeg, "-y", "-hide_banner", "-nostdin",
        "-sseof", "-0.5",
        "-i", source_path,
        "-vframes", "1",
        "-f", "rawvideo",
        "-pix_fmt", "rgb24",
        "-s", f"{width}x{height}",
        "pipe:1"
    ]
    proc_tail = subprocess.run(tail_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=15)
    if proc_tail.returncode == 0 and len(proc_tail.stdout) == width * height * 3:
        return proc_tail.stdout

    # Last resort: try first frame
    first_cmd = [
        ffmpeg, "-y", "-hide_banner", "-nostdin",
        "-ss", "0",
        "-i", source_path,
        "-vframes", "1",
        "-f", "rawvideo",
        "-pix_fmt", "rgb24",
        "-s", f"{width}x{height}",
        "pipe:1"
    ]
    proc_first = subprocess.run(first_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=15)
    if proc_first.returncode == 0 and len(proc_first.stdout) == width * height * 3:
        return proc_first.stdout

    err = proc.stderr.decode('utf-8', errors='replace')
    raise RuntimeError(f"Failed to decode frame at {target_time}s from {source_path}:\n{err}")

class FFmpegStreamDecoder:
    """
    Decodes video frames sequentially via a single persistent FFmpeg pipe.
    """
    def __init__(self, source_path, width=512, height=512, fps=24, start_time=0.0):
        self.source_path = source_path
        self.width = width
        self.height = height
        self.fps = fps
        self.start_time = max(0.0, float(start_time))
        self.frame_size = width * height * 3
        self.proc = None
        self.last_valid_frame = None
        self._start_ffmpeg()

    def _start_ffmpeg(self):
        ffmpeg = resolve_system_ffmpeg()
        cmd = [ffmpeg, "-y", "-hide_banner", "-nostdin"]
        if self.start_time > 0.001:
            cmd.extend(["-ss", f"{self.start_time:.4f}"])
        cmd.extend([
            "-i", self.source_path,
            "-vf", f"fps={self.fps},scale={self.width}:{self.height}",
            "-f", "rawvideo",
            "-pix_fmt", "rgb24",
            "pipe:1"
        ])
        self.proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL
        )

    def read_frame(self):
        if not self.proc or not self.proc.stdout:
            return None
        try:
            buf = self.proc.stdout.read(self.frame_size)
            if len(buf) == self.frame_size:
                self.last_valid_frame = buf
                return buf
        except Exception:
            pass
        return None

    def close(self):
        if self.proc:
            try:
                if self.proc.stdout:
                    self.proc.stdout.close()
                self.proc.terminate()
                self.proc.wait(timeout=1)
            except Exception:
                pass
            self.proc = None

class FramePrefetcher:
    """
    Asynchronous frame prefetcher using a background reader thread.
    Keeps a small queue of decoded frames ahead of the GPU inference pipeline.
    """
    def __init__(self, decoder, maxsize=4):
        self.decoder = decoder
        self.queue = queue.Queue(maxsize=maxsize)
        self.stop_event = threading.Event()
        self.thread = threading.Thread(target=self._worker, daemon=True)
        self.thread.start()

    def _worker(self):
        while not self.stop_event.is_set():
            frame = self.decoder.read_frame()
            if frame is None:
                self.queue.put(None)
                break
            while not self.stop_event.is_set():
                try:
                    self.queue.put(frame, timeout=0.1)
                    break
                except queue.Full:
                    continue

    def get_frame(self, timeout=2.0):
        try:
            return self.queue.get(timeout=timeout)
        except queue.Empty:
            return None

    def close(self):
        self.stop_event.set()
        try:
            while not self.queue.empty():
                self.queue.get_nowait()
        except Exception:
            pass
        self.decoder.close()
        self.thread.join(timeout=1)

def get_ort_session(model_path=None, prefer_gpu=True, preferred_backend=None):
    import onnxruntime as ort
    if model_path is None:
        model_path = ensure_model_file()

    _init_openvino_ep()
    available = ort.get_available_providers()

    target_backend = (preferred_backend or os.environ.get("JIZURA_MATTE_BACKEND") or "").lower()

    # Determine order of backends to try
    candidate_backends = []
    if target_backend:
        candidate_backends.append(target_backend)

    if prefer_gpu:
        # Default priority: openvino -> directml -> cuda
        for b in ["openvino", "directml", "cuda"]:
            if b not in candidate_backends:
                candidate_backends.append(b)
    if "cpu" not in candidate_backends:
        candidate_backends.append("cpu")

    for candidate in candidate_backends:
        try:
            if candidate == "openvino" and "OpenVINOExecutionProvider" in available:
                # OpenVINO targets GPU or CPU devices via official OrtEpDevice metadata API
                if hasattr(ort, "get_ep_devices"):
                    try:
                        all_devices = ort.get_ep_devices()
                        openvino_devices = [d for d in all_devices if d.ep_name == "OpenVINOExecutionProvider"]

                        # Check using official ep_metadata["ov_device"] with device.type fallback
                        def is_device_match(dev, target_type):
                            ov_dev = getattr(dev, "ep_metadata", {}).get("ov_device", "")
                            if ov_dev.upper() == target_type:
                                return True
                            return target_type in str(getattr(getattr(dev, "device", None), "type", "")).upper()

                        gpu_devs = [d for d in openvino_devices if is_device_match(d, "GPU")]
                        if gpu_devs:
                            so = ort.SessionOptions()
                            so.add_provider_for_devices([gpu_devs[0]], {})
                            sess = ort.InferenceSession(model_path, so)
                            return sess, "OpenVINO (GPU)"

                        cpu_devs = [d for d in openvino_devices if is_device_match(d, "CPU")]
                        if cpu_devs:
                            so = ort.SessionOptions()
                            so.add_provider_for_devices([cpu_devs[0]], {})
                            sess = ort.InferenceSession(model_path, so)
                            return sess, "OpenVINO (CPU)"
                    except Exception as dev_err:
                        sys.stderr.write(f"OpenVINO device targeting failed ({dev_err}), trying standard provider...\n")

                # Fallback to standard provider list
                sess = ort.InferenceSession(model_path, providers=["OpenVINOExecutionProvider", "CPUExecutionProvider"])
                return sess, "OpenVINO"

            elif candidate == "directml" and "DmlExecutionProvider" in available:
                sess = ort.InferenceSession(model_path, providers=["DmlExecutionProvider", "CPUExecutionProvider"])
                return sess, "DirectML"

            elif candidate == "cuda" and "CUDAExecutionProvider" in available:
                sess = ort.InferenceSession(model_path, providers=["CUDAExecutionProvider", "CPUExecutionProvider"])
                return sess, "CUDA"

            elif candidate == "cpu":
                sess = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
                return sess, "CPU"

        except Exception as e:
            sys.stderr.write(f"Session creation with {candidate} failed ({e}), trying next fallback...\n")

    # Final fallback: pure CPU
    sess = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
    return sess, "CPU"

def encode_white_alpha_png(width, height, alpha_bytes):
    try:
        from PIL import Image
        import io
        img = Image.new("RGBA", (width, height), (255, 255, 255, 255))
        alpha_img = Image.frombytes("L", (width, height), alpha_bytes)
        img.putalpha(alpha_img)
        buf = io.BytesIO()
        # compress_level=1 provides ultra-fast PNG encoding while keeping fully standard PNG output
        img.save(buf, format="PNG", compress_level=1, optimize=False)
        return buf.getvalue()
    except ImportError:
        import zlib, struct
        raw_rows = bytearray()
        for y in range(height):
            raw_rows.append(0)
            row_start = y * width
            for x in range(width):
                raw_rows.extend((255, 255, 255, alpha_bytes[row_start + x]))

        compressed = zlib.compress(bytes(raw_rows), 1)
        png = bytearray(b'\x89PNG\r\n\x1a\n')

        ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
        png.extend(struct.pack('>I', len(ihdr)) + b'IHDR' + ihdr + struct.pack('>I', zlib.crc32(b'IHDR' + ihdr)))

        png.extend(struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', zlib.crc32(b'IDAT' + compressed)))

        png.extend(struct.pack('>I', 0) + b'IEND' + struct.pack('>I', zlib.crc32(b'IEND')))
        return bytes(png)

def run_matting(config, progress_cb=None):
    source_video = config["sourceVideo"]
    output_file = config["outputFile"]
    source_id = config.get("sourceId")
    if not source_id:
        raise ValueError("sourceId is required in matting config")

    profile = config.get("profile", "rvm-mobilenetv3-fp32-p512-r05-v1")
    fps = float(config.get("fps", 24))
    slots = sorted(list(set(config.get("slots", [0]))))
    total_slots = len(slots)
    full_duration = float(config.get("duration", (max(slots) + 1) / fps if slots else 1.0))

    # 1. Ensure Model
    model_path = ensure_model_file()

    # 2. Setup Inference Session
    import numpy as np
    sess, backend = get_ort_session(model_path, prefer_gpu=True, preferred_backend=config.get("backend"))

    width = 512
    height = 512

    # Check if media is static image
    ext = os.path.splitext(source_video)[1].lower()
    is_image = ext in [".png", ".jpg", ".jpeg", ".webp", ".bmp", ".gif"]
    cached_image_frame = None
    if is_image:
        cached_image_frame = decode_source_frame(source_video, 0.0, width, height, fps=fps)

    # Multi-worker parallel PNG encoding pipeline (2-4 workers)
    num_encode_workers = min(4, max(2, (os.cpu_count() or 4) // 2))
    encode_executor = ThreadPoolExecutor(max_workers=num_encode_workers)
    encode_futures = []

    def _encode_worker(slot_num, alpha_bytes):
        return (slot_num, encode_white_alpha_png(width, height, alpha_bytes))

    # Streaming video decoder & prefetcher
    prefetcher = None
    stream_decoder = None

    def start_stream_at_slot(slot_num):
        nonlocal stream_decoder, prefetcher
        if prefetcher:
            prefetcher.close()
            prefetcher = None
        start_sec = max(0.0, float(slot_num) / fps)
        stream_decoder = FFmpegStreamDecoder(source_video, width, height, fps=fps, start_time=start_sec)
        prefetcher = FramePrefetcher(stream_decoder, maxsize=4)

    if not is_image and len(slots) >= 1:
        start_stream_at_slot(slots[0])

    r1, r2, r3, r4 = None, None, None, None
    last_slot = -999
    last_valid_frame = cached_image_frame

    try:
        for idx, slot in enumerate(slots):
            t0 = time.perf_counter()
            target_time = slot / fps

            # Reset recurrent state if discontinuous
            is_continuous = (slot == last_slot + 1)
            if not is_continuous:
                r1, r2, r3, r4 = None, None, None, None
                # If gap between slots is more than 1 frame, restart stream decoder at target_time
                if not is_image and last_slot != -999:
                    start_stream_at_slot(slot)
            last_slot = slot

            # Obtain decoded frame (Image cache -> Prefetched stream -> Individual seek fallback)
            rgb_bytes = None
            if is_image:
                rgb_bytes = cached_image_frame
            elif prefetcher and is_continuous:
                rgb_bytes = prefetcher.get_frame(timeout=1.0)

            # Fallback to precise frame decode if stream ran out or missed
            if rgb_bytes is None or len(rgb_bytes) != width * height * 3:
                rgb_bytes = decode_source_frame(source_video, target_time, width, height, fps=fps, fallback_frame=last_valid_frame)
            last_valid_frame = rgb_bytes

            # Prepare float32 tensor [1, 3, H, W] normalized to [0, 1]
            rgb_arr = np.frombuffer(rgb_bytes, dtype=np.uint8).reshape((height, width, 3))
            src = (rgb_arr.astype(np.float32) / 255.0).transpose((2, 0, 1))[np.newaxis, ...]

            if r1 is None:
                r1 = np.zeros((1, 1, 1, 1), dtype=np.float32)
                r2 = np.zeros((1, 1, 1, 1), dtype=np.float32)
                r3 = np.zeros((1, 1, 1, 1), dtype=np.float32)
                r4 = np.zeros((1, 1, 1, 1), dtype=np.float32)

            inputs = {
                "src": src,
                "r1i": r1,
                "r2i": r2,
                "r3i": r3,
                "r4i": r4,
                "downsample_ratio": np.array([0.5], dtype=np.float32)
            }

            # Run GPU inference (continuous without encode/decode stall)
            try:
                out = sess.run(None, inputs)
                fgr, pha, r1, r2, r3, r4 = out
            except Exception as e:
                sys.stderr.write(f"Inference failed with {backend} ({e}), retrying with CPU session...\n")
                import onnxruntime as ort
                sess = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
                backend = "CPU"
                out = sess.run(None, inputs)
                fgr, pha, r1, r2, r3, r4 = out

            # Extract alpha channel bytes and dispatch to parallel encode worker
            alpha_u8 = (np.clip(pha[0, 0], 0.0, 1.0) * 255).astype(np.uint8).tobytes()
            fut = encode_executor.submit(_encode_worker, slot, alpha_u8)
            encode_futures.append((slot, fut))

            elapsed_ms = int((time.perf_counter() - t0) * 1000)

            if progress_cb:
                progress_cb({
                    "phase": "analyze",
                    "completed": idx + 1,
                    "total": total_slots,
                    "reused": 0,
                    "sourceFrame": slot,
                    "backend": backend,
                    "inferenceMs": elapsed_ms
                })

        # Collect all parallel encoded PNG frames in chronological order
        frames_data = []
        for slot, fut in encode_futures:
            _, png_bytes = fut.result()
            frames_data.append((slot, png_bytes))

    finally:
        encode_executor.shutdown(wait=True)
        if prefetcher:
            prefetcher.close()

    try:
        from matte_format import write_jizmat_file
    except ImportError:
        from native.matte_format import write_jizmat_file
    meta = {
        "sourceId": source_id,
        "model": profile,
        "duration": full_duration,
        "fps": fps,
        "width": width,
        "height": height
    }

    write_jizmat_file(output_file, meta, frames_data)
    return {
        "status": "completed",
        "outputFile": output_file,
        "totalFrames": len(frames_data)
    }
