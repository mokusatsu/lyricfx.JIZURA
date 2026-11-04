import os, sys, json, subprocess, shutil

def resolve_ffmpeg():
    if os.environ.get("JIZURA_FFMPEG") and os.path.exists(os.environ["JIZURA_FFMPEG"]):
        return os.environ["JIZURA_FFMPEG"]
    # Check bundled native directory
    bundled = os.path.join(os.path.dirname(os.path.abspath(__file__)), "bin", "ffmpeg.exe" if sys.platform == "win32" else "ffmpeg")
    if os.path.exists(bundled):
        return bundled
    # Check PATH
    found = shutil.which("ffmpeg")
    if found:
        return found
    return "ffmpeg"

def probe_encoders():
    """
    Returns list of available h264 encoders.
    """
    ffmpeg = resolve_ffmpeg()
    try:
        res = subprocess.run([ffmpeg, "-encoders"], capture_output=True, text=True, timeout=5)
        encoders = []
        for line in res.stdout.splitlines():
            if "h264" in line.lower() or "264" in line.lower():
                parts = line.split()
                if len(parts) >= 2:
                    encoders.append(parts[1])
        return encoders if encoders else ["libx264"]
    except Exception:
        return ["libx264"]

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
    bitrate = config.get("bitrate")
    qp = config.get("qp")

    ffmpeg_bin = resolve_ffmpeg()
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
        cmd.extend(["-i", audio_file, "-map", "0:v:0", "-map", "1:a:0"])
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

    # Audio codec if present
    if has_audio:
        cmd.extend(["-c:a", "aac", "-ar", "48000", "-ac", "2", "-b:a", "192k"])

    cmd.extend(["-movflags", "+faststart", "-f", "mp4", output_file])

    os.makedirs(os.path.dirname(os.path.abspath(output_file)), exist_ok=True)

    # Launch FFmpeg
    try:
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    except Exception as e:
        sys.stderr.write(f"Failed to spawn ffmpeg: {e}\n")
        sys.exit(2)

    # Signal ready to Electron parent process
    sys.stdout.write(json.dumps({"type": "ready"}) + "\n")
    sys.stdout.flush()

    frames_read = 0
    try:
        while frames_read < frame_count:
            rgba = read_exact(sys.stdin.buffer, frame_bytes)
            if not rgba:
                break
            proc.stdin.write(rgba)
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
        err_msg = proc.stderr.read().decode('utf-8', errors='replace')
        sys.stderr.write(f"FFmpeg exited with code {ret}:\n{err_msg}\n")
        sys.exit(ret)

    sys.stdout.write(json.dumps({
        "type": "finished",
        "outputFile": output_file,
        "frames": frames_read
    }) + "\n")
    sys.stdout.flush()
