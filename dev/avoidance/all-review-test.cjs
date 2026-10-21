"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict");
const {
  matrix,
  runPool,
  fullPlaybackIds,
  safety,
} = require("./all-review.cjs");
test("retains exactly the 26 old04 safe anchors with their original ids and conditions", () => {
  const old = require("../../review/AVOID-006/local-20261020-04/manifest.json"),
    cases = matrix();
  assert.equal(cases.length, 26);
  assert.equal(new Set(cases.map((c) => c.id)).size, 26);
  assert.deepEqual(
    cases.map((c) => ({ id: c.id, conditions: c.conditions })),
    old.cases
      .filter((c) => c.conditions.safeAnchor === true)
      .map((c) => ({ id: c.id, conditions: c.conditions })),
  );
  assert.equal(new Set(cases.map((c) => c.conditions.layout)).size, 26);
});
test("full playback covers all 26 representative pairs and every size", () => {
  const cases = matrix(),
    ids = fullPlaybackIds(cases),
    selected = cases.filter((c) => ids.has(c.id));
  for (const key of ["layout"])
    assert.deepEqual(
      new Set(selected.map((c) => c.conditions[key])),
      new Set(cases.map((c) => c.conditions[key])),
    );
  assert.deepEqual(
    new Set(selected.map((c) => [c.conditions.W, c.conditions.H].join("x"))),
    new Set(cases.map((c) => [c.conditions.W, c.conditions.H].join("x"))),
  );
  assert.equal(ids.size, 26);
});
test("two-worker pool bounds concurrency, waits for cancellation cleanup, and preserves first error", async () => {
  let active = 0,
    max = 0;
  const completed = [];
  await runPool([0, 1, 2, 3], 2, async (n) => {
    active++;
    max = Math.max(max, active);
    await new Promise((r) => setTimeout(r, 2));
    completed.push(n);
    active--;
  });
  assert.equal(max, 2);
  assert.deepEqual(completed.sort(), [0, 1, 2, 3]);
  const first = Error("first capture failure");
  let cancelled = false,
    started = [];
  await assert.rejects(
    runPool([0, 1, 2], 2, async (n, isCancelled) => {
      started.push(n);
      if (n === 0) {
        await new Promise((r) => setTimeout(r, 2));
        throw first;
      }
      await new Promise((r) => setTimeout(r, 8));
      cancelled = isCancelled();
    }),
    (e) => e === first,
  );
  assert.equal(cancelled, true);
  assert.deepEqual(started, [0, 1]);
});
test("independent geometry rejects a crossing even when source clear flags are true", () => {
  const frame = {
    diagnosis: { segment: { status: "safe" } },
    circle: { cx: 0, cy: 0, r: 1 },
    shortSide: 100,
    observations: [
      {
        measurementSupported: true,
        envelopeCovered: true,
        strictCircleClear: true,
        rawCircleClear: true,
        polygons: [
          [
            [10, 10],
            [11, 10],
            [11, 11],
            [10, 11],
          ],
        ],
      },
    ],
  };
  assert.equal(safety(frame).strictClear, true);
  frame.observations[0].polygons = [
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ],
  ];
  assert.throws(() => safety(frame), /independent strict polygon clearance/);
  frame.diagnosis.segment.status = "insufficient-space";
  assert.equal(safety(frame).strictClear, null);
});
