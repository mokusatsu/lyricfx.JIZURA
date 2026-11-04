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
                print(f"[WARN] {name} checksum mismatch. Re-downloading...")

        url = item.get("sourceUrl")
        if url:
            print(f"[FETCH] Downloading {name} from {url}...")
            try:
                urllib.request.urlretrieve(url, target_path)
                final_hash = sha256sum(target_path)
                if final_hash.lower() == expected_hash.lower():
                    print(f"[OK] Downloaded and verified {name}.")
                else:
                    print(f"[ERROR] Downloaded {name} has unexpected hash: {final_hash}")
            except Exception as e:
                print(f"[SKIP] Could not download {name}: {e}")

if __name__ == "__main__":
    verify_or_download_models()
