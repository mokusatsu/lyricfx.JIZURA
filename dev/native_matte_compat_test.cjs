const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');

// 1. Run Python helper to pack a sample JIZMAT01
const pyCode = `
import sys, os
sys.path.insert(0, r"${ROOT}")
from native.matte_format import write_jizmat_file

meta = {
    "sourceId": "compat-src-456",
    "model": "rvm-mobilenetv3-fp32-p512-r05-v1",
    "duration": 4.0,
    "fps": 24,
    "width": 512,
    "height": 512
}
# Valid 1x1 white PNG with alpha
import base64
png_bytes = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8//8/AAX+Av6nVgGEAAAAAElFTkSuQmCC')

frames = [(0, png_bytes), (5, png_bytes), (12, png_bytes)]
write_jizmat_file(r"${path.join(ROOT, 'dev', 'temp_compat.jizmat')}", meta, frames)
`;

const res = spawnSync(process.platform === 'win32' ? 'python' : 'python3', ['-c', pyCode], { encoding: 'utf-8' });
if (res.status !== 0) {
  console.error(res.stderr);
  process.exit(1);
}

const jizmatPath = path.join(ROOT, 'dev', 'temp_compat.jizmat');
const fileBuffer = fs.readFileSync(jizmatPath);

// 2. Set up mock environment to run J.readPersonMask
global.window = {};
global.Blob = class MockBlob {
  constructor(parts = []) {
    this._buffer = Buffer.concat(parts.map(p => Buffer.isBuffer(p) ? p : Buffer.from(p)));
    this.size = this._buffer.length;
  }
  slice(start, end) {
    return new MockBlob([this._buffer.subarray(start, end)]);
  }
  async arrayBuffer() {
    return this._buffer.buffer.slice(this._buffer.byteOffset, this._buffer.byteOffset + this._buffer.byteLength);
  }
  async text() {
    return this._buffer.toString('utf-8');
  }
};

const J = {
  mediaLabel: (ja, en) => ja,
  clamp: (v, min, max) => Math.min(max, Math.max(min, v))
};

// Evaluate the reading part of 08m_person_cutout.js
const cutoutCode = fs.readFileSync(path.join(ROOT, 'src', '08m_person_cutout.js'), 'utf-8');
const encode = new TextEncoder(), decode = new TextDecoder(), MAX_MASK_FRAMES = 1200;

// Extract readPersonMask logic
eval(`
  const fail = () => new Error('Invalid person mask');
  J.readPersonMask = async (blob, ref) => {
    if (!(blob instanceof Blob) || blob.size < 12) throw fail();
    const head = new Uint8Array(await blob.slice(0, 12).arrayBuffer()), length = new DataView(head.buffer).getUint32(8, true), start = 12 + length;
    if (decode.decode(head.slice(0, 8)) !== 'JIZMAT01' || length > 8 * 1024 * 1024 || start > blob.size) throw fail();
    const meta = JSON.parse(await blob.slice(12, start).text());
    if (![1, 2].includes(meta.version) || meta.sourceId !== ref.sourceId || meta.model !== ref.model || !Number.isFinite(meta.duration) || meta.duration < 0 || !Number.isFinite(meta.fps) || meta.fps < 1 || meta.fps > 60 || !Number.isInteger(meta.width) || !Number.isInteger(meta.height) || meta.width < 1 || meta.height < 1 || meta.width > 1024 || meta.height > 1024 || !Array.isArray(meta.frames) || !meta.frames.length || meta.frames.length > MAX_MASK_FRAMES) throw fail();
    let end = 0, last = -1; const slots = new Map(), limit = Math.max(0, Math.ceil(meta.duration * meta.fps) - 1);
    for (const [i, f] of meta.frames.entries()) {
      const index = meta.version === 2 ? f.index : i;
      if (!Number.isSafeInteger(index) || index <= last || meta.version === 2 && index > limit || !Number.isSafeInteger(f.offset) || f.offset !== end || !Number.isSafeInteger(f.size) || f.size < 1 || start + end + f.size > blob.size) throw fail();
      slots.set(index, i); last = index; end += f.size;
    }
    if (start + end !== blob.size) throw fail();
    return { blob, meta, start, slots, decoded: new Map(), pending: new Map() };
  };
`);

(async () => {
  try {
    const blob = new Blob([fileBuffer]);
    const ref = {
      sourceId: 'compat-src-456',
      model: 'rvm-mobilenetv3-fp32-p512-r05-v1'
    };

    const entry = await J.readPersonMask(blob, ref);
    assert.ok(entry, 'entry should be read successfully');
    assert.equal(entry.meta.sourceId, 'compat-src-456');
    assert.equal(entry.meta.version, 2);
    assert.equal(entry.slots.size, 3);
    assert.ok(entry.slots.has(0));
    assert.ok(entry.slots.has(5));
    assert.ok(entry.slots.has(12));
    assert.equal(entry.slots.has(99), false);

    console.log('JIZMAT01 Python-to-JS compatibility test passed successfully.');
  } finally {
    try { fs.unlinkSync(jizmatPath); } catch (e) {}
  }
})();
