import json, struct, os

MAGIC = b'JIZMAT01'

def pack_jizmat(meta, frames_data):
    """
    Packs metadata and list of (index, png_bytes) into JIZMAT01 container format (v2).
    meta must contain: sourceId, model, duration, fps, width, height
    frames_data: list of tuples (frame_index, png_bytes) sorted by frame_index
    """
    # Build frames manifest with offsets
    frames_manifest = []
    current_offset = 0
    all_pngs = bytearray()

    for idx, png_bytes in frames_data:
        size = len(png_bytes)
        frames_manifest.append({
            "index": int(idx),
            "offset": current_offset,
            "size": size
        })
        current_offset += size
        all_pngs.extend(png_bytes)

    manifest_obj = {
        "version": 2,
        "sourceId": str(meta.get("sourceId", "")),
        "model": str(meta.get("model", "")),
        "duration": float(meta.get("duration", 0.0)),
        "fps": float(meta.get("fps", 24)),
        "width": int(meta.get("width", 512)),
        "height": int(meta.get("height", 512)),
        "frameCount": len(frames_manifest),
        "frames": frames_manifest
    }

    manifest_bytes = json.dumps(manifest_obj, separators=(',', ':')).encode('utf-8')
    header = bytearray(12)
    header[0:8] = MAGIC
    struct.pack_into('<I', header, 8, len(manifest_bytes))

    return bytes(header) + manifest_bytes + bytes(all_pngs)

def unpack_jizmat(data):
    """
    Unpacks JIZMAT01 binary data into (meta, list of (index, png_bytes)).
    """
    if len(data) < 12:
        raise ValueError("Invalid JIZMAT01 data: too short")
    if data[0:8] != MAGIC:
        raise ValueError("Invalid JIZMAT01 magic")

    json_len = struct.unpack_from('<I', data, 8)[0]
    start = 12 + json_len
    if start > len(data):
        raise ValueError("Invalid JIZMAT01 header: json_len out of bounds")

    manifest_str = data[12:start].decode('utf-8')
    meta = json.loads(manifest_str)

    frames = []
    for f in meta.get("frames", []):
        idx = f.get("index", 0)
        off = f.get("offset", 0)
        sz = f.get("size", 0)
        png_data = data[start + off : start + off + sz]
        if len(png_data) != sz:
            raise ValueError(f"Corrupted frame data for index {idx}")
        frames.append((idx, png_data))

    return meta, frames

def write_jizmat_file(path, meta, frames_data):
    content = pack_jizmat(meta, frames_data)
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, 'wb') as f:
        f.write(content)
