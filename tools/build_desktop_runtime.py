"""Tools script to verify and prepare desktop native runtime resources."""
import os, sys, json, hashlib, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST_PATH = os.path.join(ROOT, "native", "resources-manifest.json")
MODELS_DIR = os.path.join(ROOT, "native", "models")

def sha256sum(filepath):
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def verify_or_download_models():
    os.makedirs(MODELS_DIR, exist_ok=True)
    if not os.path.exists(MANIFEST_PATH):
        raise FileNotFoundError(f"Manifest not found: {MANIFEST_PATH}")

    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    for name, item in manifest.get("models", {}).items():
        expected_hash = item.get("sha256")
        target_path = os.path.join(MODELS_DIR, f"{name}.onnx")
        if os.path.exists(target_path):
            current_hash = sha256sum(target_path)
            if current_hash.lower() == expected_hash.lower():
                print(f"[OK] {name} matches checksum.")
                continue
            else:
                print(f"[WARN] {name} checksum mismatch. Removing corrupted file...")
                os.remove(target_path)

        url = item.get("sourceUrl")
        if not url:
            raise RuntimeError(f"No sourceUrl specified for model {name}")

        print(f"[FETCH] Downloading {name} from {url}...")
        temp_path = target_path + ".download"
        try:
            urllib.request.urlretrieve(url, temp_path)
            download_hash = sha256sum(temp_path)
            if download_hash.lower() != expected_hash.lower():
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                raise ValueError(f"Checksum mismatch for {name}: expected {expected_hash}, got {download_hash}")
            os.replace(temp_path, target_path)
            print(f"[OK] Downloaded and verified {name}.")
        except Exception as e:
            if os.path.exists(temp_path):
                try: os.remove(temp_path)
                except Exception: pass
            print(f"[ERROR] Failed to download and verify {name}: {e}", file=sys.stderr)
            sys.exit(1)

if __name__ == "__main__":
    verify_or_download_models()
