import os, sys, json, subprocess, shutil, threading

def resolve_system_ffmpeg():
    """
    Finds system FFmpeg or raises RuntimeError if missing.
    """
    if os.environ.get("JIZURA_FFMPEG") and os.path.exists(os.environ["JIZURA_FFMPEG"]):
        return os.environ["JIZURA_FFMPEG"]
    found = shutil.which("ffmpeg")
    if found:
        return found
    raise RuntimeError("FFmpeg not found on system PATH. Please install FFmpeg or set JIZURA_FFMPEG environment variable.")

def probe_encoders():
    """
    Returns list of available h264 encoders from system FFmpeg.
    """
    try:
        ffmpeg = resolve_system_ffmpeg()
        res = subprocess.run([ffmpeg, "-encoders"], capture_output=True, text=True, timeout=5)
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

def read_exact(stream, n):
    """
    Reads exactly n bytes from stream. Returns b'' on clean EOF.
    """
    buf = bytearray(n)
    view = memoryview(buf)
    pos = 0
    while pos < n:
        chunk = stream.read(n - pos)
        if not chunk:
            if pos == 0:
                return b''
            raise EOFError(f"Unexpected EOF: expected {n} bytes, got {pos}")
        chunk_len = len(chunk)
        view[pos : pos + chunk_len] = chunk
        pos += chunk_len
    return bytes(buf)

def drain_stream_thread(stream, max_keep=65536):
    """
    Continuously reads stream in a background thread to prevent pipe deadlock.
    Keeps the latest max_keep bytes for error diagnostics.
    """
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
    """
    Checks if input audio can be copied into MP4 container without re-encoding.
    Returns (can_copy: bool, detected_codec: str).
    """
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
        res = subprocess.run(test_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, timeout=5)
        if res.returncode == 0:
            return True, detected_codec
    except Exception:
        pass

    return False, "AAC"

def run_export_worker():
    """
    Worker running via stdin/stdout:
    1. Reads 1 line of JSON configuration from stdin.buffer.
    2. Emits {"type": "ready"} on stdout.
    3. Sequentially reads N * (width * height * 4) raw RGBA bytes from stdin.buffer.
    4. Streams them to ffmpeg stdin pipe.
    5. Finalizes MP4 and prints {"type": "finished"}.
    """
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

    try:
        ffmpeg_bin = resolve_system_ffmpeg()
    except RuntimeError as err:
        sys.stderr.write(f"Error: {err}\n")
        sys.exit(2)

    frame_bytes = width * height * 4

    cmd = [
        ffmpeg_bin, "-y", "-hide_banner", "-nostdin",
        "-f", "rawvideo",
        "-pixel_format", "rgba",
        "-video_size", f"{width}x{height}",
        "-framerate", str(fps),
        "-i", "pipe:0"
    ]

    has_audio = audio_file and os.path.exists(audio_file)
    if has_audio:
        # Seek and duration on input audio to mux without re-encoding
        audio_args = []
        if audio_offset > 0:
            audio_args.extend(["-ss", f"{audio_offset:.4f}"])
        if audio_duration is not None and float(audio_duration) > 0:
            audio_args.extend(["-t", f"{float(audio_duration):.4f}"])
        cmd.extend(audio_args + ["-i", audio_file, "-map", "0:v:0", "-map", "1:a:0?"])
    else:
        cmd.extend(["-map", "0:v:0"])

    cmd.extend(["-frames:v", str(frame_count)])

    # Video codec and quality
    cmd.extend(["-c:v", "libx264", "-pix_fmt", "yuv420p"])
    if qp is not None:
        cmd.extend(["-qp", str(int(qp))])
    elif bitrate:
        cmd.extend(["-b:v", str(int(bitrate))])
    else:
        cmd.extend(["-crf", "18"])

    # Pass audio: try copy mux first; re-encode only if muxing fails
    audio_codec_name = None
    if has_audio:
        can_copy, detected_codec = probe_audio_format_and_copy(ffmpeg_bin, audio_file, audio_offset)
        if can_copy:
            cmd.extend(["-c:a", "copy"])
            audio_codec_name = detected_codec
        else:
            cmd.extend(["-c:a", "aac", "-b:a", "320k"])
            audio_codec_name = "AAC"

    cmd.extend(["-movflags", "+faststart", "-f", "mp4", output_file])

    os.makedirs(os.path.dirname(os.path.abspath(output_file)), exist_ok=True)

    # Launch FFmpeg with background stderr draining to prevent pipe deadlock
    try:
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    except Exception as e:
        sys.stderr.write(f"Failed to spawn ffmpeg: {e}\n")
        sys.exit(2)

    get_recent_stderr = drain_stream_thread(proc.stderr)

    # Signal ready to Electron parent process
    sys.stdout.write(json.dumps({"type": "ready", "audioCodec": audio_codec_name}) + "\n")
    sys.stdout.flush()

    frames_read = 0
    try:
        while frames_read < frame_count:
            rgba = read_exact(sys.stdin.buffer, frame_bytes)
            if not rgba:
                break
            try:
                proc.stdin.write(rgba)
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
        sys.stderr.write(f"FFmpeg exited with code {ret}:\n{err_msg}\n")
        sys.exit(ret)

    sys.stdout.write(json.dumps({
        "type": "finished",
        "outputFile": output_file,
        "frames": frames_read
    }) + "\n")
    sys.stdout.flush()
