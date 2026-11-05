import os, sys, time, json, math, subprocess, hashlib, urllib.request

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

def probe_backends():
    """
    Probes available hardware execution providers without requiring an ONNX model file.
    """
    backends = ["cpu"]
    try:
        import onnxruntime as ort
        available = ort.get_available_providers()
        if "DmlExecutionProvider" in available:
            backends.insert(0, "directml")
        elif "CUDAExecutionProvider" in available:
            backends.insert(0, "cuda")
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

def get_ort_session(model_path=None, prefer_gpu=True):
    import onnxruntime as ort
    if model_path is None:
        model_path = ensure_model_file()

    available = ort.get_available_providers()
    providers = []
    backend = "CPU"

    if prefer_gpu:
        if "DmlExecutionProvider" in available:
            providers.append("DmlExecutionProvider")
            backend = "DirectML"
        elif "CUDAExecutionProvider" in available:
            providers.append("CUDAExecutionProvider")
            backend = "CUDA"

    providers.append("CPUExecutionProvider")

    try:
        sess = ort.InferenceSession(model_path, providers=providers)
        actual = sess.get_providers()[0]
        if "Dml" in actual: backend = "DirectML"
        elif "CUDA" in actual: backend = "CUDA"
        else: backend = "CPU"
        return sess, backend
    except Exception as e:
        sys.stderr.write(f"GPU session creation failed ({e}), falling back to CPU...\n")
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
        img.save(buf, format="PNG")
        return buf.getvalue()
    except ImportError:
        import zlib, struct
        raw_rows = bytearray()
        for y in range(height):
            raw_rows.append(0)
            row_start = y * width
            for x in range(width):
                raw_rows.extend((255, 255, 255, alpha_bytes[row_start + x]))

        compressed = zlib.compress(bytes(raw_rows), 6)
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
    sess, backend = get_ort_session(model_path, prefer_gpu=True)

    width = 512
    height = 512
    frames_data = []

    r1, r2, r3, r4 = None, None, None, None
    last_slot = -999
    last_valid_frame = None

    for idx, slot in enumerate(slots):
        t0 = time.perf_counter()
        target_time = slot / fps

        # Reset recurrent state if discontinuous
        if slot != last_slot + 1:
            r1, r2, r3, r4 = None, None, None, None
        last_slot = slot

        # Decode actual video/image frame with fallback for short videos
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

        # Run inference with GPU -> CPU fallback on error
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

        # Extract alpha channel
        alpha_u8 = (np.clip(pha[0, 0], 0.0, 1.0) * 255).astype(np.uint8).tobytes()
        png_bytes = encode_white_alpha_png(width, height, alpha_u8)
        frames_data.append((slot, png_bytes))

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
