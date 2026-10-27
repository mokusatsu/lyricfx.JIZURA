'use strict';

// Offline consistency checks for the existing diagnostic's report; no browser runs.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { isDeepStrictEqual: equal } = require('node:util');

const DEFAULT_ROOT = path.resolve(__dirname, '../..');
const DIAGNOSTIC = 'dev/avoidance/renderer-callback-throw-native-diagnostic.cjs';
const STATUS = 'KNOWN_FAILURE_REPRODUCED_WITH_PASSING_CONTROLS';
const SCOPE = 'Injected instance drawCut callback, native Canvas only; known restore omission characterization, NOT product pass or naturally occurring throw; no adapter69 execution';
const LIMITATION = 'Offline report consistency only; no independent Canvas verification, product pass, or human approval. Recovery counts are operations attempted, not measured stack depth.';
const ROOT_STATE = { matrix: [1, 0, 0, 1, 0, 0], alpha: 1, blend: 'source-over' };
const INITIAL_STATE = { matrix: [1, 0, 0, 1, 3, 5], alpha: .625, blend: 'source-over' };

function object(value, label) {
  assert(value !== null && typeof value === 'object' && !Array.isArray(value), `${label}: expected object`);
}
function keys(value, expected, label) {
  object(value, label);
  assert.deepEqual(Object.keys(value).sort(), [...expected].sort(), `${label}: fields`);
}
function nonempty(value, label) {
  assert(typeof value === 'string' && value.trim().length > 0, `${label}: expected nonempty string`);
}
function pixels(value, label) {
  assert(Number.isInteger(value) && value >= 0 && value <= 3072, `${label}: expected pixel count 0..3072`);
}
function state(value, label) {
  keys(value, ['matrix', 'alpha', 'blend'], label);
  assert(Array.isArray(value.matrix) && value.matrix.length === 6 && value.matrix.every(Number.isFinite), `${label}: finite six-value matrix`);
  assert(Number.isFinite(value.alpha) && value.alpha >= 0 && value.alpha <= 1, `${label}: finite alpha 0..1`);
  nonempty(value.blend, `${label}.blend`);
}
function timestamp(value, label) {
  assert(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value), `${label}: ISO timestamp`);
  const time = Date.parse(value);
  assert(Number.isFinite(time) && new Date(time).toISOString() === value, `${label}: valid timestamp`);
  return time;
}

function validateReport(report, repoRoot = DEFAULT_ROOT) {
  object(report, 'report');
  assert.equal(report.status, STATUS, 'report status');
  assert(!Object.hasOwn(report, 'error'), 'successful report must not contain error');
  assert.equal(report.scope, SCOPE, 'diagnostic scope');
  nonempty(report.browser, 'browser');
  assert(timestamp(report.finished, 'finished') >= timestamp(report.started, 'started'), 'finished precedes started');
  assert(Array.isArray(report.blockedRequests) && report.blockedRequests.every(v => typeof v === 'string'), 'blockedRequests: string array');

  const root = path.resolve(repoRoot);
  const expectedPins = [...new Set(['index.html', 'src/09_render.js', DIAGNOSTIC, ...fs.readdirSync(path.join(root, 'src'))
    .filter(name => name.endsWith('.js')).map(name => `src/${name}`)])].sort();
  assert(Array.isArray(report.pins), 'pins: expected array');
  const pinNames = new Set();
  for (const pin of report.pins) {
    keys(pin, ['file', 'sha256'], 'pin');
    assert(typeof pin.file === 'string' && expectedPins.includes(pin.file), 'unexpected source pin');
    assert(!pinNames.has(pin.file), `duplicate source pin: ${pin.file}`);
    pinNames.add(pin.file);
    assert(typeof pin.sha256 === 'string' && /^[a-f0-9]{64}$/.test(pin.sha256), `invalid SHA256: ${pin.file}`);
    const actual = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, pin.file))).digest('hex');
    assert.equal(pin.sha256, actual, `stale source pin: ${pin.file}`);
  }
  assert.deepEqual([...pinNames].sort(), expectedPins, 'complete exact source pin set');
  const rendererSource = fs.readFileSync(path.join(root, 'src/09_render.js'), 'utf8');
  assert(rendererSource.length > 0, 'renderer source must not be empty');
  assert.equal(fs.readFileSync(path.join(root, 'index.html'), 'utf8').split(rendererSource).length - 1, 1,
    'renderer source occurs exactly once byte-for-byte in index.html');

  assert(Array.isArray(report.rows) && report.rows.length === 8, 'complete eight-row matrix');
  let assertions = 0;
  const seen = new Set();
  const check = (condition, message) => { assert(condition, message); assertions++; };
  for (const [index, r] of report.rows.entries()) {
    const label = `row ${index}`;
    keys(r, ['layer', 'ownSave', 'throws', 'calls', 'sameContext', 'initial', 'callbackBefore', 'callbackAfter', 'caught', 'after', 'clip', 'manualRecoveryOperationsAttempted', 'restores', 'finalOuter', 'finalClipPixels'], label);
    for (const name of ['layer', 'ownSave', 'throws', 'sameContext']) assert.equal(typeof r[name], 'boolean', `${label}.${name}: boolean`);
    const tuple = `${r.layer}/${r.ownSave}/${r.throws}`;
    assert(!seen.has(tuple), `duplicate matrix tuple: ${tuple}`);
    seen.add(tuple);
    for (const name of ['initial', 'callbackBefore', 'callbackAfter', 'finalOuter']) state(r[name], `${label}.${name}`);
    keys(r.after, ['outer', 'callback'], `${label}.after`);
    state(r.after.outer, `${label}.after.outer`);
    state(r.after.callback, `${label}.after.callback`);
    assert(equal(r.initial, INITIAL_STATE), `${label}: fixed initial caller state`);
    const [a, b, c, d, e, f] = r.callbackBefore.matrix;
    const translated = [a, b, c, d, e + 7 * a + 11 * c, f + 7 * b + 11 * d];
    assert(r.callbackAfter.matrix.every((v, i) => Math.abs(v - translated[i]) <= 1e-10 * Math.max(1, Math.abs(translated[i]))), `${label}: callback translate(7,11)`);
    assert.equal(r.callbackAfter.alpha, .25, `${label}: callbackAfter alpha`);
    assert.equal(r.callbackAfter.blend, r.callbackBefore.blend, `${label}: callback blend unchanged`);
    if (!r.layer) assert(equal(r.after.outer, r.after.callback), `${label}: direct context snapshots agree`);
    if (r.throws) assert(equal(r.after.callback, r.callbackAfter), `${label}: thrown callback snapshot unchanged`);
    keys(r.clip, ['outer', 'callback'], `${label}.clip`);
    pixels(r.clip.outer, `${label}.clip.outer`);
    if (r.layer) pixels(r.clip.callback, `${label}.clip.callback`);
    else assert.equal(r.clip.callback, null, `${label}: direct callback clip is null`);
    pixels(r.finalClipPixels, `${label}.finalClipPixels`);
    assert(Array.isArray(r.restores), `${label}.restores: array`);
    assert(Number.isInteger(r.manualRecoveryOperationsAttempted) && r.manualRecoveryOperationsAttempted === r.restores.length, `${label}: recovery operation count`);
    const contexts = r.throws ? [...Array(r.layer ? 1 + Number(r.ownSave) : 2 + Number(r.ownSave)).fill('callback'), ...(r.layer ? ['outer'] : [])] : [];
    assert.equal(r.restores.length, contexts.length, `${label}: recovery operation length`);
    for (const [i, restore] of r.restores.entries()) {
      keys(restore, ['context', 'state'], `${label}.restores[${i}]`);
      assert.equal(restore.context, contexts[i], `${label}: recovery context ${i}`);
      state(restore.state, `${label}.restores[${i}].state`);
    }
    if (r.throws) assert(equal(r.restores.at(-1).state, r.finalOuter), `${label}: final recovery snapshot agrees with finalOuter`);

    // These checks mirror every assertion emitted by the producer, including controls.
    check(r.calls === 1, `${label}: exactly one injected callback`);
    check(r.sameContext === !r.layer, `${label}: direct/layer route`);
    if (r.throws) {
      keys(r.caught, ['same', 'message'], `${label}.caught`);
      assert.equal(r.caught.message, 'INJECTED_RENDER_CALLBACK_THROW', `${label}: injected error message`);
      check(r.caught.same === true, `${label}: original error propagated`);
      check(r.after.callback.alpha === .25, `${label}: callback alpha leaked`);
      check(r.clip[r.layer ? 'callback' : 'outer'] < 3072, `${label}: callback clip leaked`);
      check(r.restores.length === 2 + Number(r.ownSave), `${label}: manual recovery operations attempted (not stack depth)`);
      if (!r.layer) {
        check(r.restores.slice(0, -1).every(s => !equal(s.state, r.initial)), `${label}: caller state not reached before final direct restore`);
      } else {
        check(equal(r.restores.at(-2).state, ROOT_STATE), `${label}: layer callback root restored separately`);
        check(!equal(r.after.outer, r.initial), `${label}: outer frame state also leaked`);
      }
    } else {
      check(r.caught === null, `${label}: normal completed`);
      check(equal(r.after.outer, r.initial), `${label}: normal outer state restored`);
      check(r.clip.outer === 3072, `${label}: normal outer clip restored`);
    }
    check(equal(r.finalOuter, r.initial), `${label}: exact restores return caller state`);
    check(r.finalClipPixels === 3072, `${label}: exact restores return caller clip`);
  }
  assert.equal(report.assertions, assertions, 'emitted assertion count consistency');
  return { status: 'OFFLINE_REPORT_CONSISTENT', diagnosticStatus: report.status, rows: report.rows.length, assertions, pins: pinNames.size, browser: report.browser, limitation: LIMITATION };
}

module.exports = { validateReport };
if (require.main === module) {
  try {
    assert(process.argv.length === 3 || process.argv.length === 4, 'Usage: node renderer-callback-throw-report-check.cjs <report.json> [repo-root]');
    console.log(JSON.stringify(validateReport(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), process.argv[3])));
  } catch (error) {
    console.error(`OFFLINE_REPORT_REJECTED: ${error.message}\n${LIMITATION}`);
    process.exitCode = 1;
  }
}
