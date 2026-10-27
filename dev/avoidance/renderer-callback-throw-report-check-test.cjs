'use strict';

// SYNTHETIC fixtures only. These tests do not produce actual Canvas evidence.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test, after } = require('node:test');
const { validateReport } = require('./renderer-callback-throw-report-check.cjs');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'synthetic-throw-report-'));
fs.mkdirSync(path.join(root, 'src'));
fs.mkdirSync(path.join(root, 'dev/avoidance'), { recursive: true });
const diagnostic = 'dev/avoidance/renderer-callback-throw-native-diagnostic.cjs';
for (const file of ['index.html', 'src/09_render.js', 'src/synthetic.js', diagnostic]) fs.writeFileSync(path.join(root, file), `SYNTHETIC TEST SOURCE: ${file}\n`);
fs.writeFileSync(path.join(root, 'index.html'), `<script>${fs.readFileSync(path.join(root, 'src/09_render.js'), 'utf8')}</script>`);
after(() => fs.rmSync(root, { recursive: true, force: true }));
const clone = value => structuredClone(value);
const caller = { matrix: [1, 0, 0, 1, 3, 5], alpha: .625, blend: 'source-over' };
const canvasRoot = { matrix: [1, 0, 0, 1, 0, 0], alpha: 1, blend: 'source-over' };
const leaked = { matrix: [1, 0, 0, 1, 10, 16], alpha: .25, blend: 'source-over' };
function pins(repoRoot) {
  return ['index.html', diagnostic, ...fs.readdirSync(path.join(repoRoot, 'src')).filter(n => n.endsWith('.js')).map(n => `src/${n}`)]
    .map(file => ({ file, sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(repoRoot, file))).digest('hex') }));
}
function fixture(repoRoot = root) {
  const rows = [];
  for (const layer of [false, true]) for (const ownSave of [false, true]) for (const throws of [false, true]) {
    const callbackBefore = clone(layer ? canvasRoot : caller);
    const callbackAfter = clone(leaked);
    callbackAfter.matrix[4] = callbackBefore.matrix[4] + 7;
    callbackAfter.matrix[5] = callbackBefore.matrix[5] + 11;
    const restores = [];
    if (throws) {
      const callbackCount = layer ? 1 + Number(ownSave) : 2 + Number(ownSave);
      for (let i = 0; i < callbackCount; i++) restores.push({ context: 'callback', state: clone(i === callbackCount - 1 ? (layer ? canvasRoot : caller) : leaked) });
      if (layer) restores.push({ context: 'outer', state: clone(caller) });
    }
    rows.push({ layer, ownSave, throws, calls: 1, sameContext: !layer, initial: clone(caller),
      callbackBefore, callbackAfter,
      caught: throws ? { same: true, message: 'INJECTED_RENDER_CALLBACK_THROW' } : null,
      after: { outer: clone(throws ? leaked : caller), callback: clone(throws ? callbackAfter : (layer ? canvasRoot : caller)) },
      clip: { outer: throws && !layer ? 48 : 3072, callback: layer ? 48 : null },
      manualRecoveryOperationsAttempted: restores.length, restores, finalOuter: clone(caller), finalClipPixels: 3072 });
  }
  return { syntheticFixture: 'UNIT TEST ONLY — NOT ACTUAL CANVAS EVIDENCE',
    started: '2026-10-27T00:00:00.000Z', finished: '2026-10-27T00:00:01.000Z',
    scope: 'Injected instance drawCut callback, native Canvas only; known restore omission characterization, NOT product pass or naturally occurring throw; no adapter69 execution',
    status: 'KNOWN_FAILURE_REPRODUCED_WITH_PASSING_CONTROLS', browser: 'SYNTHETIC BROWSER — NO EXECUTION',
    pins: pins(repoRoot), rows, blockedRequests: [], assertions: 66 };
}
const directThrow = r => r.rows.find(row => row.throws && !row.layer && !row.ownSave);
const layerThrow = r => r.rows.find(row => row.throws && row.layer && row.ownSave);
const control = r => r.rows.find(row => !row.throws);
function rejects(name, mutate, pattern = /./) {
  test(`rejects synthetic ${name}`, () => {
    const report = fixture();
    mutate(report);
    assert.throws(() => validateReport(report, root), pattern);
  });
}

test('accepts synthetic complete matrix and reports the limited offline meaning', () => {
  const result = validateReport(fixture(), root);
  assert.equal(result.assertions, 66);
  assert.equal(result.rows, 8);
  assert.equal(result.pins, 4);
  assert.equal(result.status, 'OFFLINE_REPORT_CONSISTENT');
  assert.match(result.limitation, /Offline report consistency only; no independent Canvas verification, product pass, or human approval/);
  assert.match(result.limitation, /not measured stack depth/);
});
test('accepts reordered synthetic rows, pins, and state object properties', () => {
  const report = fixture();
  report.rows.reverse(); report.pins.reverse();
  control(report).after.outer = { blend: 'source-over', alpha: .625, matrix: [1, 0, 0, 1, 3, 5] };
  assert.equal(validateReport(report, root).assertions, 66);
});
test('default repository root validates actual source hashes without executing source', () => {
  assert(validateReport(fixture(path.resolve(__dirname, '../..'))));
});
rejects('duplicate matrix row replacing another tuple', r => { r.rows[7] = clone(r.rows[0]); }, /duplicate matrix/);
rejects('missing matrix row', r => r.rows.pop(), /eight-row/);
rejects('extra matrix row', r => r.rows.push(clone(r.rows[0])), /eight-row/);
rejects('truthy nonboolean matrix flag', r => { r.rows[0].layer = 0; }, /boolean/);
rejects('bad callback count', r => { control(r).calls = 2; }, /exactly one/);
rejects('wrong context route', r => { control(r).sameContext = false; }, /route/);
rejects('control caught an error', r => { control(r).caught = { same: true, message: 'error' }; }, /normal completed/);
rejects('control outer state mismatch', r => { control(r).after.outer.alpha = .25; control(r).after.callback.alpha = .25; }, /normal outer/);
rejects('control clipped outer state', r => { control(r).clip.outer = 20; }, /normal outer clip/);
rejects('control with extra recovery operation', r => { const row = control(r); row.restores.push({ context: 'callback', state: clone(caller) }); row.manualRecoveryOperationsAttempted++; }, /operation length/);
rejects('replacement thrown error', r => { directThrow(r).caught.same = false; }, /original error/);
rejects('wrong injected error message', r => { directThrow(r).caught.message = 'other'; }, /injected error/);
rejects('throw without leaked alpha', r => { directThrow(r).after.callback.alpha = 1; }, /direct context snapshots/);
rejects('throw without leaked clip', r => { directThrow(r).clip.outer = 3072; }, /clip leaked/);
rejects('direct recovery reaching caller early', r => { directThrow(r).restores[0].state = clone(caller); }, /not reached/);
rejects('layer recovery missing callback root', r => { layerThrow(r).restores.at(-2).state.alpha = .25; }, /callback root/);
rejects('layer throw claiming unchanged outer', r => { layerThrow(r).after.outer = clone(caller); }, /outer frame/);
rejects('wrong final caller state', r => { directThrow(r).finalOuter.matrix[4] = 2; directThrow(r).restores.at(-1).state.matrix[4] = 2; }, /return caller state/);
rejects('wrong final caller clip', r => { directThrow(r).finalClipPixels = 10; }, /return caller clip/);
rejects('manual recovery count mismatch', r => { layerThrow(r).manualRecoveryOperationsAttempted--; }, /operation count/);
rejects('extra manual operation with internally matching count', r => { const row = layerThrow(r); row.restores.push(clone(row.restores[0])); row.manualRecoveryOperationsAttempted++; }, /operation length/);
rejects('wrong direct recovery context', r => { directThrow(r).restores[0].context = 'outer'; }, /recovery context/);
rejects('swapped layer recovery contexts', r => { const row = layerThrow(r); row.restores[0].context = 'outer'; row.restores.at(-1).context = 'callback'; }, /recovery context/);
rejects('missing source pin', r => r.pins.pop(), /complete exact/);
rejects('extra source pin', r => r.pins.push({ file: 'extra.js', sha256: '0'.repeat(64) }), /unexpected source/);
rejects('duplicate source pin', r => r.pins.push(clone(r.pins[0])), /duplicate source/);
rejects('stale source pin', r => { r.pins[0].sha256 = '0'.repeat(64); }, /stale source/);
rejects('malformed source hash', r => { r.pins[0].sha256 = 'sha256'; }, /invalid SHA256/);
rejects('failed diagnostic even with complete rows', r => { r.status = 'DIAGNOSTIC_FAILED'; r.error = 'synthetic failure'; }, /status/);
rejects('success with error field', r => { r.error = null; }, /must not contain error/);
rejects('missing browser', r => { delete r.browser; }, /browser/);
rejects('blank browser', r => { r.browser = ' '; }, /browser/);
rejects('missing scope', r => { delete r.scope; }, /scope/);
rejects('wrong assertion count', r => { r.assertions--; }, /assertion count/);
rejects('string assertion count', r => { r.assertions = '66'; }, /assertion count/);
rejects('invalid timestamp', r => { r.started = '2026-02-30T00:00:00.000Z'; }, /valid timestamp/);
rejects('missing finished timestamp', r => { delete r.finished; }, /ISO timestamp/);
rejects('reversed timestamps', r => { r.finished = '2026-10-26T00:00:00.000Z'; }, /precedes/);
rejects('nonfinite matrix element on import', r => { r.rows[0].callbackBefore.matrix[0] = Infinity; }, /finite six-value/);
rejects('null matrix element from nonfinite JSON', r => { r.rows[0].callbackBefore.matrix[0] = null; }, /finite six-value/);
rejects('string matrix element', r => { r.rows[0].callbackAfter.matrix[0] = '1'; }, /finite six-value/);
rejects('wrong matrix length', r => { r.rows[0].initial.matrix.pop(); }, /six-value/);
rejects('nonfinite alpha', r => { r.rows[0].after.outer.alpha = NaN; }, /finite alpha/);
rejects('alpha out of range', r => { r.rows[0].after.outer.alpha = 2; }, /finite alpha/);
rejects('blank blend', r => { r.rows[0].initial.blend = ''; }, /nonempty/);
rejects('noninteger clip', r => { layerThrow(r).clip.callback = .5; }, /pixel count/);
rejects('negative leaked clip', r => { directThrow(r).clip.outer = -1; }, /pixel count/);
rejects('invalid direct callback clip field', r => { directThrow(r).clip.callback = 0; }, /is null/);
rejects('nonfinite recovery state', r => { layerThrow(r).restores[0].state.alpha = Infinity; }, /finite alpha/);
rejects('missing required row field', r => { delete r.rows[0].callbackBefore; }, /fields/);
rejects('malformed blocked requests', r => { r.blockedRequests = [null]; }, /string array/);
rejects('coherent but wrong initial caller state', r => { const row = control(r); row.initial.matrix[4] = 4; row.after.outer.matrix[4] = 4; row.after.callback.matrix[4] = 4; row.finalOuter.matrix[4] = 4; }, /fixed initial/);
rejects('contradictory direct snapshots', r => { directThrow(r).after.outer.matrix[4]++; }, /direct context snapshots/);
rejects('callback transform inconsistent with translate', r => { layerThrow(r).callbackAfter.matrix[4]++; }, /translate/);
rejects('callbackAfter wrong alpha', r => { layerThrow(r).callbackAfter.alpha = .5; }, /callbackAfter alpha/);
rejects('callback changing blend despite no setter', r => { layerThrow(r).callbackAfter.blend = 'copy'; }, /blend unchanged/);
rejects('thrown callback snapshot contradicting callbackAfter', r => { layerThrow(r).after.callback.matrix[4]++; }, /thrown callback snapshot/);
rejects('last recovery contradicting finalOuter', r => { layerThrow(r).restores.at(-1).state.matrix[4]++; }, /final recovery snapshot/);

for (const copies of [0, 2]) test(`rejects synthetic source root embedding renderer ${copies} times despite matching pins`, () => {
  const file = path.join(root, 'index.html');
  const original = fs.readFileSync(file);
  try {
    fs.writeFileSync(file, fs.readFileSync(path.join(root, 'src/09_render.js'), 'utf8').repeat(copies));
    assert.throws(() => validateReport(fixture(), root), /exactly once/);
  } finally { fs.writeFileSync(file, original); }
});
test('rejects missing mandatory renderer even if pins match remaining directory listing', () => {
  const file = path.join(root, 'src/09_render.js');
  const original = fs.readFileSync(file);
  try {
    fs.unlinkSync(file);
    assert.throws(() => validateReport(fixture(), root), /complete exact source pin set/);
  } finally { fs.writeFileSync(file, original); }
});

test('CLI accepts synthetic JSON, rejects malformed JSON and failed reports, and prints limitations', () => {
  const file = path.join(root, 'synthetic-report.json');
  const cli = path.join(__dirname, 'renderer-callback-throw-report-check.cjs');
  const run = (...args) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
  fs.writeFileSync(file, JSON.stringify(fixture()));
  const accepted = run(file, root);
  assert.equal(accepted.status, 0, accepted.stderr);
  assert.equal(JSON.parse(accepted.stdout).assertions, 66);
  fs.writeFileSync(file, '{malformed');
  const malformed = run(file, root);
  assert.equal(malformed.status, 1);
  assert.match(malformed.stderr, /OFFLINE_REPORT_REJECTED/);
  assert.match(malformed.stderr, /no independent Canvas verification/);
  const failed = fixture(); failed.status = 'DIAGNOSTIC_FAILED';
  fs.writeFileSync(file, JSON.stringify(failed));
  assert.equal(run(file, root).status, 1);
  assert.equal(run().status, 1);
});
