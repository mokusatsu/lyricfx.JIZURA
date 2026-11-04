import os, sys, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from native.matting import run_matting, get_ort_session
from native.export_video import run_export_worker, probe_encoders

def do_probe():
    _, backend = get_ort_session()
    encoders = probe_encoders()
    backends = ["cpu"]
    if backend.lower() != "cpu" and backend.lower() != "none" and backend.lower() != "mock-cpu":
        backends.insert(0, backend.lower())

    result = {
        "version": 1,
        "name": "desktop",
        "nativeMatting": True,
        "nativeExport": True,
        "backends": backends,
        "encoders": encoders
    }
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
    else:
        sys.stderr.write(f"Unknown command: {cmd}\n")
        sys.exit(1)

if __name__ == '__main__':
    main()
