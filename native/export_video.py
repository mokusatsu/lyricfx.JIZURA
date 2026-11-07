import os, sys, json, subprocess, shutil, threading

NO_WINDOW_FLAG = subprocess.CREATE_NO_WINDOW if sys.platform == "win32" and hasattr(subprocess, "CREATE_NO_WINDOW") else 0

def resolve_system_ffmpeg():
    if os.environ.get("JIZURA_FFMPEG") and os.path.exists(os.environ["JIZURA_FFMPEG"]):
        return os.environ["JIZURA_FFMPEG"]
    found = shutil.which("ffmpeg")
    if found:
        return found
    raise RuntimeError("FFmpeg not found on system PATH. Please install FFmpeg or set JIZURA_FFMPEG environment variable.")

PROBED_ENCODERS = {}

ENCODER_DISPLAY_NAMES = {
    "h264_nvenc": "NVENC",
    "h264_amf": "AMF",
    "h264_qsv": "QSV",
    "libx264": "x264"
}

def probe_encoder(ffmpeg_bin, enc_name):
    if enc_name in PROBED_ENCODERS:
        return PROBED_ENCODERS[enc_name]
    null_sink = "NUL" if sys.platform == "win32" else "/dev/null"
    cmd = [
        ffmpeg_bin, "-y", "-hide_banner", "-nostdin",
        "-f", "lavfi", "-i", "nullsrc=s=64x64:r=10",
        "-t", "0.1",
        "-c:v", enc_name,
        "-f", "null", null_sink
    ]
    try:
        res = subprocess.run(
            cmd,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
            timeout=3,
            creationflags=NO_WINDOW_FLAG
        )
        ok = (res.returncode == 0)
    except Exception:
        ok = False
    PROBED_ENCODERS[enc_name] = ok
    return ok

def resolve_encoder(ffmpeg_bin, requested_mode="auto"):
    mode = (requested_mode or "auto").lower()
    if mode == "auto":
        candidates = ["h264_nvenc", "h264_amf", "h264_qsv", "libx264"]
    elif mode == "gpu":
        candidates = ["h264_nvenc", "h264_amf", "libx264"]
    elif mode == "qsv":
        candidates = ["h264_qsv", "libx264"]
    elif mode == "cpu":
        candidates = ["libx264"]
    else:
        candidates = ["h264_nvenc", "h264_amf", "h264_qsv", "libx264"]

    for enc in candidates:
        if probe_encoder(ffmpeg_bin, enc):
            return enc
    return "libx264"

def build_video_encoder_args(selected_enc, bitrate=None, qp=None):
    args = ["-c:v", selected_enc]
    if selected_enc == "libx264":
        args.extend(["-preset", "veryfast", "-threads", "0", "-pix_fmt", "yuv420p"])
        if qp is not None:
            args.extend(["-qp", str(int(qp))])
        elif bitrate:
            args.extend(["-b:v", str(int(bitrate))])
        else:
            args.extend(["-crf", "18"])
    elif selected_enc == "h264_qsv":
        args.extend(["-preset", "veryfast", "-pix_fmt", "nv12"])
        if qp is not None:
            args.extend(["-global_quality", str(int(qp))])
        elif bitrate:
            args.extend(["-b:v", str(int(bitrate))])
        else:
            args.extend(["-global_quality", "18"])
    elif selected_enc == "h264_nvenc":
        args.extend(["-preset", "p4", "-pix_fmt", "yuv420p"])
        if qp is not None:
            args.extend(["-qp", str(int(qp))])
        elif bitrate:
            args.extend(["-b:v", str(int(bitrate))])
        else:
            args.extend(["-qp", "18"])
    elif selected_enc == "h264_amf":
        args.extend(["-quality", "speed", "-pix_fmt", "nv12"])
        if qp is not None:
            args.extend(["-qp_i", str(int(qp)), "-qp_p", str(int(qp))])
        elif bitrate:
            args.extend(["-b:v", str(int(bitrate))])
        else:
            args.extend(["-qp_i", "18", "-qp_p", "18"])
    else:
        args.extend(["-preset", "veryfast", "-pix_fmt", "yuv420p"])
        if bitrate:
            args.extend(["-b:v", str(int(bitrate))])
    return args

def probe_encoders():
    try:
        ffmpeg = resolve_system_ffmpeg()
        res = subprocess.run([ffmpeg, "-encoders"], capture_output=True, text=True, timeout=5, creationflags=NO_WINDOW_FLAG)
        encoders = []
        for line in res.stdout.splitlines():
            if "h264" in line.lower() or "264" in line.lower():
                parts = line.split()
                if len(parts) >= 2:
                    encoders.append(parts[1])
        return encoders if encoders else ["libx264"]
    except Exception as e:
        sys.stderr.write(f"Warning: probe_encoders failed ({e})\n")
        return []

def stream_frame_into(stream, view, n):
    """
    Reads exactly n bytes from stream into pre-allocated memoryview without intermediate allocations.
    Returns False on clean EOF, True on success.
    """
    pos = 0
    while pos < n:
        read_bytes = stream.readinto(view[pos : n])
        if not read_bytes:
            if pos == 0:
                return False
            raise EOFError(f"Unexpected EOF: expected {n} bytes, got {pos}")
        pos += read_bytes
    return True

def drain_stream_thread(stream, max_keep=65536):
    recent_bytes = bytearray()
    lock = threading.Lock()

    def worker():
        while True:
            chunk = stream.read(4096)
            if not chunk:
                break
            with lock:
                recent_bytes.extend(chunk)
                if len(recent_bytes) > max_keep * 2:
                    del recent_bytes[: len(recent_bytes) - max_keep]

    t = threading.Thread(target=worker, daemon=True)
    t.start()
    return lambda: bytes(recent_bytes)

def probe_audio_format_and_copy(ffmpeg_bin, audio_path, offset=0):
    detected_codec = "AAC"
    ext = os.path.splitext(audio_path)[1].lower()
    if ext == ".mp3": detected_codec = "MP3"
    elif ext in [".m4a", ".aac"]: detected_codec = "AAC"
    elif ext == ".wav": detected_codec = "PCM"
    elif ext == ".flac": detected_codec = "FLAC"

    null_sink = "NUL" if sys.platform == "win32" else "/dev/null"
    test_cmd = [
        ffmpeg_bin, "-y", "-hide_banner", "-nostdin",
        "-ss", f"{offset:.4f}",
        "-t", "0.1",
        "-i", audio_path,
        "-vn", "-map", "0:a:0?",
        "-c:a", "copy",
        "-f", "mp4",
        null_sink
    ]
    try:
        res = subprocess.run(test_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, timeout=5, creationflags=NO_WINDOW_FLAG)
        if res.returncode == 0:
            return True, detected_codec
    except Exception:
        pass

    return False, "AAC"

def run_export_worker():
    line = sys.stdin.buffer.readline().decode('utf-8').strip()
    if not line:
        sys.stderr.write("No configuration received on stdin\n")
        sys.exit(1)

    config = json.loads(line)
    width = int(config["width"])
    height = int(config["height"])
    fps = float(config["fps"])
    frame_count = int(config["frameCount"])
    output_file = config["outputFile"]
    audio_file = config.get("audioFile")
    audio_offset = float(config.get("audioOffset", 0))
    audio_duration = config.get("audioDuration")
    bitrate = config.get("bitrate")
    qp = config.get("qp")
    requested_encoder = config.get("encoder", "auto")

    try:
        ffmpeg_bin = resolve_system_ffmpeg()
    except RuntimeError as err:
        sys.stderr.write(f"Error: {err}\n")
        sys.exit(2)

    frame_bytes = width * height * 4
    has_audio = bool(audio_file and os.path.exists(audio_file))

    temp_video = (output_file + ".video.mp4") if has_audio else output_file

    selected_enc = resolve_encoder(ffmpeg_bin, requested_encoder)
    video_encoder_name = ENCODER_DISPLAY_NAMES.get(selected_enc, selected_enc)

    cmd = [
        ffmpeg_bin, "-y", "-hide_banner", "-nostdin",
        "-f", "rawvideo",
        "-pixel_format", "rgba",
        "-video_size", f"{width}x{height}",
        "-framerate", str(fps),
        "-i", "pipe:0",
        "-frames:v", str(frame_count)
    ]
    cmd.extend(build_video_encoder_args(selected_enc, bitrate=bitrate, qp=qp))

    cmd.extend(["-an"])
    if not has_audio:
        cmd.extend(["-movflags", "+faststart"])
    cmd.extend(["-f", "mp4", temp_video])

    os.makedirs(os.path.dirname(os.path.abspath(output_file)), exist_ok=True)

    expected_audio_codec = None
    if has_audio:
        can_copy, detected_codec = probe_audio_format_and_copy(ffmpeg_bin, audio_file, audio_offset)
        expected_audio_codec = detected_codec if can_copy else "AAC"

    try:
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, creationflags=NO_WINDOW_FLAG)
    except Exception as e:
        sys.stderr.write(f"Failed to spawn ffmpeg: {e}\n")
        sys.exit(2)

    get_recent_stderr = drain_stream_thread(proc.stderr)

    sys.stdout.write(json.dumps({"type": "ready", "audioCodec": expected_audio_codec, "videoEncoder": video_encoder_name}) + "\n")
    sys.stdout.flush()

    # Pre-allocate a single reusable buffer for all frame streaming (zero-copy memoryview)
    reusable_buf = bytearray(frame_bytes)
    view = memoryview(reusable_buf)

    frames_read = 0
    try:
        while frames_read < frame_count:
            if not stream_frame_into(sys.stdin.buffer, view, frame_bytes):
                break
            try:
                proc.stdin.write(view)
            except BrokenPipeError:
                break
            frames_read += 1
            if frames_read % 10 == 0 or frames_read == frame_count:
                sys.stdout.write(json.dumps({
                    "type": "progress",
                    "completed": frames_read,
                    "total": frame_count
                }) + "\n")
                sys.stdout.flush()
    except Exception as e:
        sys.stderr.write(f"Error streaming frames to ffmpeg: {e}\n")
        try:
            proc.kill()
        except Exception:
            pass
        sys.exit(3)
    finally:
        try:
            proc.stdin.close()
        except Exception:
            pass

    ret = proc.wait()
    if ret != 0:
        err_msg = get_recent_stderr().decode('utf-8', errors='replace')
        sys.stderr.write(f"FFmpeg video encoding exited with code {ret}:\n{err_msg}\n")
        sys.exit(ret)

    # Audio muxing
    final_audio_codec = expected_audio_codec
    audio_mux_mode = None
    if has_audio:
        audio_args = []
        if audio_offset > 0:
            audio_args.extend(["-ss", f"{audio_offset:.4f}"])
        if audio_duration is not None and float(audio_duration) > 0:
            audio_args.extend(["-t", f"{float(audio_duration):.4f}"])

        can_copy, detected_codec = probe_audio_format_and_copy(ffmpeg_bin, audio_file, audio_offset)
        mux_success = False

        if can_copy:
            mux_cmd = [
                ffmpeg_bin, "-y", "-hide_banner", "-nostdin",
                "-i", temp_video
            ] + audio_args + [
                "-i", audio_file,
                "-map", "0:v:0", "-map", "1:a:0?",
                "-c:v", "copy",
                "-c:a", "copy",
                "-movflags", "+faststart",
                "-f", "mp4", output_file
            ]
            res = subprocess.run(mux_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, creationflags=NO_WINDOW_FLAG)
            if res.returncode == 0:
                mux_success = True
                final_audio_codec = detected_codec
                audio_mux_mode = "copy"
            else:
                err_detail = res.stderr.decode('utf-8', errors='replace')
                sys.stderr.write(f"Warning: -c:a copy mux failed in production, falling back to AAC re-encode:\n{err_detail}\n")

        if not mux_success:
            fallback_cmd = [
                ffmpeg_bin, "-y", "-hide_banner", "-nostdin",
                "-i", temp_video
            ] + audio_args + [
                "-i", audio_file,
                "-map", "0:v:0", "-map", "1:a:0?",
                "-c:v", "copy",
                "-c:a", "aac", "-b:a", "320k",
                "-movflags", "+faststart",
                "-f", "mp4", output_file
            ]
            res_fb = subprocess.run(fallback_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, creationflags=NO_WINDOW_FLAG)
            if res_fb.returncode == 0:
                mux_success = True
                final_audio_codec = "AAC"
                audio_mux_mode = "reencode"
            else:
                err_fb = res_fb.stderr.decode('utf-8', errors='replace')
                sys.stderr.write(f"Error: Fallback AAC audio mux failed:\n{err_fb}\n")
                sys.exit(res_fb.returncode)

        try:
            if os.path.exists(temp_video):
                os.remove(temp_video)
        except Exception:
            pass

    sys.stdout.write(json.dumps({
        "type": "finished",
        "outputFile": output_file,
        "frames": frames_read,
        "audioCodec": final_audio_codec,
        "audioMuxMode": audio_mux_mode,
        "videoEncoder": video_encoder_name
    }) + "\n")
    sys.stdout.flush()

if __name__ == "__main__":
    run_export_worker()
