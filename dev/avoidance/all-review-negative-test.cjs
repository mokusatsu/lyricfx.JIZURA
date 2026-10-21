"use strict";
const fs = require("node:fs"),
  path = require("node:path"),
  os = require("node:os"),
  assert = require("node:assert/strict");
const { validateFiles } = require("./all-review.cjs");
const source = path.resolve(process.argv[2] || "");
assert.ok(
  fs.existsSync(path.join(source, "manifest.json")),
  "capture directory argument required",
);
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "all006-negative-"));
fs.cpSync(source, dir, { recursive: true });
const results = [];
function reject(label, mutation) {
  const cleanup = mutation();
  try {
    assert.throws(() => validateFiles(dir));
    results.push({ label, rejected: true });
  } finally {
    cleanup();
  }
}
function mutateJSON(relative, fn) {
  const p = path.join(dir, relative),
    raw = fs.readFileSync(p),
    m = JSON.parse(raw);
  fn(m);
  fs.writeFileSync(p, JSON.stringify(m));
  return () => fs.writeFileSync(p, raw);
}
try {
  validateFiles(dir);
  reject("missing representative", () =>
    mutateJSON("manifest.json", (m) => m.cases.pop()),
  );
  reject("changed source identity", () =>
    mutateJSON("manifest.json", (m) => (m.after.sourceSHA256 = "0".repeat(64))),
  );
  reject("changed public circle condition", () =>
    mutateJSON(
      "public/manifest.json",
      (m) => (m.cases[0].conditions.radius = 0.49),
    ),
  );
  reject("wrong frame count", () =>
    mutateJSON("manifest.json", (m) => (m.frames = 95)),
  );
  reject("damaged encoded MP4", () => {
    const p = path.join(
        dir,
        "public",
        JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"))).cases[0]
          .before.path,
      ),
      raw = fs.readFileSync(p),
      changed = Buffer.from(raw);
    changed[12] ^= 1;
    fs.writeFileSync(p, changed);
    return () => fs.writeFileSync(p, raw);
  });
  reject("symlink asset", () => {
    const relative =
        "images/" +
        JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"))).cases[0]
          .id +
        "-before-3.png",
      p = path.join(dir, "evidence", relative),
      raw = fs.readFileSync(p);
    fs.unlinkSync(p);
    fs.symlinkSync(path.join(source, "evidence", relative), p);
    return () => {
      fs.unlinkSync(p);
      fs.writeFileSync(p, raw);
    };
  });
  console.log(JSON.stringify({ passed: true, source, results }));
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
