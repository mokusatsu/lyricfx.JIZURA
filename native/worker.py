import os, sys, json, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path:
    sys.path.insert(0, HERE)
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

try:
    from matting import run_matting, get_ort_session, probe_backends
    from export_video import run_export_worker, probe_encoders, resolve_system_ffmpeg
except ImportError:
    from native.matting import run_matting, get_ort_session, probe_backends
    from native.export_video import run_export_worker, probe_encoders, resolve_system_ffmpeg

def do_probe():
    backends = probe_backends()
    encoders = probe_encoders()
    continuous = False
    try:
        ffmpeg = resolve_system_ffmpeg()
        continuous = bool(shutil.which('ffprobe') or os.path.isfile(os.path.join(os.path.dirname(ffmpeg), 'ffprobe.exe' if sys.platform == 'win32' else 'ffprobe')))
    except RuntimeError:
        pass

    result = {
        "version": 1,
        "name": "desktop",
        "nativeMatting": True,
        "nativeExport": len(encoders) > 0,
        "backends": backends,
        "encoders": encoders
    }
    result['exportPipelines'] = ['legacy', 'continuous-ipc', 'continuous-port'] if continuous else ['legacy']
    sys.stdout.write(json.dumps(result) + "\n")
    sys.stdout.flush()

def do_matte(config_path):
    with open(config_path, 'r', encoding='utf-8') as f:
        config = json.load(f)

    def on_progress(p):
        sys.stdout.write(json.dumps(p) + "\n")
        sys.stdout.flush()

    res = run_matting(config, progress_cb=on_progress)
    sys.stdout.write(json.dumps({"type": "finished", **res}) + "\n")
    sys.stdout.flush()

def main():
    if len(sys.argv) < 2:
        sys.stderr.write("Usage: python -m native.worker [probe|matte <config.json>|export]\n")
        sys.exit(1)

    cmd = sys.argv[1]
    if cmd == "probe":
        do_probe()
    elif cmd == "matte":
        if len(sys.argv) < 3:
            sys.stderr.write("Error: matte requires config.json path\n")
            sys.exit(1)
        do_matte(sys.argv[2])
    elif cmd == "export":
        run_export_worker()
    elif cmd == "export-session":
        from export_session import run_export_session
        run_export_session()
    else:
        sys.stderr.write(f"Unknown command: {cmd}\n")
        sys.exit(1)

if __name__ == '__main__':
    main()
