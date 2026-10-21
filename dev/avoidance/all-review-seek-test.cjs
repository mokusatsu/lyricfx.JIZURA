"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict"),
  vm = require("node:vm");
const { seekDecodedFrame } = require("./all-review.cjs"),
  oldSeek = require("./film-review.cjs").seekDecodedFrame;
class Video {
  constructor() {
    this.events = new Map();
    this.callbacks = new Map();
    this.next = 0;
    this.currentTime = 0.25;
    this.seeking = true;
    this.cancelled = [];
  }
  addEventListener(n, f) {
    if (!this.events.has(n)) this.events.set(n, new Set());
    this.events.get(n).add(f);
  }
  removeEventListener(n, f) {
    this.events.get(n)?.delete(f);
  }
  requestVideoFrameCallback(f) {
    const id = ++this.next;
    this.callbacks.set(id, f);
    return id;
  }
  cancelVideoFrameCallback(id) {
    this.cancelled.push(id);
    this.callbacks.delete(id);
  }
  emit(n) {
    for (const f of [...(this.events.get(n) || [])]) f();
  }
  frame(mediaTime) {
    const [id, fn] = this.callbacks.entries().next().value;
    this.callbacks.delete(id);
    fn(0, { mediaTime, presentedFrames: id });
  }
}
function harness(fn = seekDecodedFrame) {
  let deadline = null,
    cleared = false;
  const run = vm.runInNewContext("(" + fn.toString() + ")", {
    setTimeout: (callback, ms) => {
      assert.equal(ms, 10000);
      deadline = callback;
      return 1;
    },
    clearTimeout: (id) => {
      assert.equal(id, 1);
      cleared = true;
    },
  });
  return { run, expire: () => deadline(), cleared: () => cleared };
}
function cleaned(v, h) {
  assert.equal(v.callbacks.size, 0);
  assert.ok([...v.events.values()].every((s) => s.size === 0));
  assert.equal(h.cleared(), true);
}
test("old helper deterministically pairs a stale callback with a later seeked event", async () => {
  const h = harness(oldSeek),
    v = new Video(),
    promise = h.run(v, 2.6);
  v.frame(0.25);
  v.seeking = false;
  v.emit("seeked");
  const result = await promise;
  assert.equal(result.decodedAfterSeek.mediaTime, 0.25);
  assert.equal(result.seekedAt, 2.6);
  cleaned(v, h);
});
test("new helper records stale callback and resolves only after an eventual target frame", async () => {
  const h = harness(),
    v = new Video();
  let resolved = false;
  const promise = h.run(v, 2.6).then((r) => {
    resolved = true;
    return r;
  });
  v.frame(0.25);
  v.seeking = false;
  v.emit("seeked");
  await Promise.resolve();
  assert.equal(resolved, false);
  assert.equal(v.callbacks.size, 1);
  v.frame(2.583333);
  const result = await promise;
  assert.equal(result.decodedAfterSeek.mediaTime, 2.583333);
  assert.equal(result.ignoredFrames.length, 1);
  assert.equal(result.ignoredFrames[0].mediaTime, 0.25);
  cleaned(v, h);
});
test("target callback before seeked waits for the seeked event", async () => {
  const h = harness(),
    v = new Video();
  let resolved = false;
  const promise = h.run(v, 2.6).then((r) => {
    resolved = true;
    return r;
  });
  v.frame(2.583333);
  await Promise.resolve();
  assert.equal(resolved, false);
  v.seeking = false;
  v.emit("seeked");
  assert.equal((await promise).decodedAfterSeek.mediaTime, 2.583333);
  cleaned(v, h);
});
test("never reaching target rejects at the unchanged ten-second deadline and cleans listeners", async () => {
  const h = harness(),
    v = new Video(),
    promise = h.run(v, 2.6),
    rejected = assert.rejects(
      promise,
      /seek frame not decoded.*ignoredFrames.*0.25/,
    );
  v.frame(0.25);
  v.seeking = false;
  v.emit("seeked");
  h.expire();
  await rejected;
  cleaned(v, h);
  assert.equal(v.cancelled.length, 1);
});
test("media error preserves diagnostics and removes the pending frame callback", async () => {
  const h = harness(),
    v = new Video(),
    promise = h.run(v, 2.6),
    rejected = assert.rejects(promise, /media seek error 3/);
  v.error = { code: 3 };
  v.emit("error");
  await rejected;
  cleaned(v, h);
  assert.equal(v.cancelled.length, 1);
});
test("queued callbacks after timeout cannot register more frame callbacks", async () => {
  const h = harness(),
    v = new Video(),
    promise = h.run(v, 2.6),
    rejected = assert.rejects(promise, /seek frame not decoded/),
    queued = [...v.callbacks.values()][0];
  h.expire();
  await rejected;
  queued(0, { mediaTime: 0.25, presentedFrames: 1 });
  cleaned(v, h);
});
test("queued callbacks after media error cannot register more frame callbacks", async () => {
  const h = harness(),
    v = new Video(),
    promise = h.run(v, 2.6),
    rejected = assert.rejects(promise, /media seek error 3/),
    queued = [...v.callbacks.values()][0];
  v.error = { code: 3 };
  v.emit("error");
  await rejected;
  queued(0, { mediaTime: 0.25, presentedFrames: 1 });
  cleaned(v, h);
});
test("a currentTime setter exception cleans listeners and pending frame callback", async () => {
  const h = harness(),
    v = new Video();
  Object.defineProperty(v, "currentTime", {
    get: () => 0.25,
    set: () => {
      throw Error("setter failed");
    },
  });
  await assert.rejects(h.run(v, 2.6), /seek setup failed setter failed/);
  cleaned(v, h);
});
