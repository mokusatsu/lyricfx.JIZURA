/* Private Sites validation entry point. Credentials enter only through stdin. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const SUCCESS = 'raw HTTP, UI, MP4 decoded seek/playback and native parity verified';
const STAGES = ['preflight', 'credential-input', 'validator', 'raw-http', 'review-ui',
  'playback', 'video-load', 'decoded-seek', 'continuous-playback', 'native-parity',
  'live-fixture', 'input-integrity', 'complete'];
const PHASES = ['raw-ui', 'playback', 'native-live'];
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const json = value => JSON.stringify(value, null, 2) + '\n';

function baseURL(value) {
  assert.equal(typeof value, 'string');
  assert.ok(!/[\s\\%]/.test(value));
  const u = new URL(value);
  assert.equal(u.protocol, 'https:');
  assert.ok(!u.username && !u.password && !u.search && !u.hash);
  assert.equal(u.href, value);
  assert.match(u.pathname, /^\/[a-zA-Z0-9_./-]*\/$|^\/$/);
  assert.ok(!u.pathname.includes('//'));
  assert.ok(!u.pathname.split('/').some(p => p === '.' || p === '..'));
  return u.href;
}
function relative(value) {
  assert.equal(typeof value, 'string');
  assert.match(value, /^[a-zA-Z0-9_.-]+(?:\/[a-zA-Z0-9_.-]+)*$/);
  assert.ok(!value.split('/').some(p => p === '.' || p === '..'));
  return value;
}
function regular(file) {
  assert.equal(fs.realpathSync(file), path.resolve(file), 'no symlink input');
  assert.ok(fs.statSync(file).isFile());
}
async function fingerprint(file) {
  regular(file);
  const hash = crypto.createHash('sha256');
  let bytes = 0;
  for await (const chunk of fs.createReadStream(file)) { hash.update(chunk); bytes += chunk.length; }
  return {sha256: hash.digest('hex'), bytes};
}
async function readToken(input) {
  let bytes = Buffer.alloc(0);
  for await (const chunk of input) {
    bytes = Buffer.concat([bytes, Buffer.from(chunk)]);
    assert.ok(bytes.length <= 65536, 'bounded credential input');
    if (bytes.includes(10)) break;
  }
  const lines = bytes.toString('utf8').split('\n');
  assert.ok(lines.slice(1).every(line => line.trim() === ''), 'one credential line');
  const value = JSON.parse(lines[0]);
  assert.ok(value && Object.getPrototypeOf(value) === Object.prototype);
  assert.deepEqual(Object.keys(value), ['token']);
  assert.equal(typeof value.token, 'string');
  assert.match(value.token, /^[a-zA-Z0-9._~+\/-]{16,32768}={0,2}$/, 'opaque bearer credential');
  return value.token;
}
function authorizer(origin, getToken) {
  return async request => {
    const u = new URL(request.url);
    assert.equal(request.origin, origin, 'exact authorization origin');
    assert.equal(u.origin, origin, 'exact request URL origin');
    assert.ok(!u.username && !u.password && !request.redirectedFrom, 'no credentialed URL or redirect');
    assert.equal(typeof getToken(), 'string', 'authorization lifetime');
    return {'OAI-Sites-Authorization': 'Bearer ' + getToken()};
  };
}
function numbers(value, names) {
  const output = {};
  for (const name of names) if (Number.isFinite(value?.[name])) output[name] = value[name];
  return output;
}
function bools(value, names) {
  const output = {};
  for (const name of names) if (typeof value?.[name] === 'boolean') output[name] = value[name];
  return output;
}
function seek(value) {
  return {...numbers(value, ['target', 'seekedAt']),
    decodedAfterSeek: numbers(value?.decodedAfterSeek, ['mediaTime', 'presentedFrames']),
    ignoredFrames: Array.isArray(value?.ignoredFrames) ? value.ignoredFrames.map(f => numbers(f, ['mediaTime', 'presentedFrames'])) : []};
}
function playback(value) {
  return {...bools(value, ['ended']), ...numbers(value, ['currentTime', 'decoded', 'dropped', 'corrupt', 'startObservedNow', 'endObservedNow', 'playbackRate', 'callbackCount', 'maxMediaTimeGap', 'mediaTimeGapCount']),
    ...bools(value, ['callbackNowMonotonic', 'presentedFramesMonotonic']),
    ...(value && ['timeout', 'media-error', 'play-rejected'].includes(value.failure) ? {failure: value.failure} : {}),
    callbackFrames: Array.isArray(value?.callbackFrames) ? value.callbackFrames.map(f => ({
      ...numbers(f, ['callbackNow', 'observedNow', 'mediaTime', 'presentedFrames', 'currentTime']),
      quality: numbers(f.quality, ['decoded', 'dropped', 'corrupt'])})) : [],
    startFrame: seek(value?.startFrame), startQuality: numbers(value?.startQuality, ['decoded', 'dropped', 'corrupt']),
    endQuality: numbers(value?.endQuality, ['decoded', 'dropped', 'corrupt'])};
}
function projection(report, manifest, inputs) {
  const cases = new Set(manifest.cases.map(c => c.id));
  const known = new Map(inputs.filter(i => i.asset).map(i => [i.asset, i]));
  const result = {context: {}, raw: [], ui: [], playback: [], nativeParity: [], live: []};
  if (['owned-three-browser-lifecycles', 'provided-shared-diagnostic'].includes(report?.phaseIsolation)) result.phaseIsolation = report.phaseIsolation;
  if (report?.playbackPageMode === 'fresh-same-origin-minimal-page-per-video') result.playbackPageMode = report.playbackPageMode;
  result.phases = [];
  for (const row of report?.phases || []) {
    if (!PHASES.includes(row.phase)) continue;
    const record = {phase: row.phase};
    if (['owned', 'provided-shared-diagnostic'].includes(row.lifecycle)) record.lifecycle = row.lifecycle;
    if (['starting', 'active', 'launch-failed', 'closed', 'close-failed', 'released-shared'].includes(row.status)) record.status = row.status;
    for (const name of ['startedAt', 'acquiredAt', 'closeStartedAt', 'closedAt', 'releasedAt']) {
      if (typeof row[name] === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(row[name])) record[name] = row[name];
    }
    result.phases.push(record);
  }
  if (['unchanged', 'changed'].includes(report?.inputIntegrity)) result.inputIntegrity = report.inputIntegrity;
  const context = report?.context;
  if (PHASES.includes(context?.phase)) result.context.phase = context.phase;
  if (STAGES.includes(context?.stage)) result.context.stage = context.stage;
  if (known.has(context?.asset)) result.context.asset = context.asset;
  if (cases.has(context?.case)) result.context.case = context.case;
  if (['before', 'after'].includes(context?.side)) result.context.side = context.side;
  if (['index.html', 'en.html'].includes(context?.lang)) result.context.lang = context.lang;
  Object.assign(result.context, numbers(context, ['width']));
  for (const row of report?.raw || []) {
    if (!known.has(row.path)) continue;
    const record = {path: row.path, ...numbers(row, ['status', 'length'])};
    if (row.sha256 === known.get(row.path).sha256) record.sha256 = row.sha256;
    const type = typeof row.type === 'string' ? row.type.split(';')[0] : null;
    if (['text/html', 'application/json', 'text/javascript', 'application/javascript', 'text/css',
      'video/mp4', 'image/png', 'font/woff2', 'font/ttf', 'font/otf', 'application/octet-stream'].includes(type)) record.type = type;
    if (typeof row.range === 'object' && row.range) {
      record.range = numbers(row.range, ['status', 'bytes']);
      if (/^bytes \d+-\d+\/\d+$/.test(row.range.range)) record.range.range = row.range.range;
    } else if (row.range === null || /^bytes \d+-\d+\/\d+$/.test(row.range)) record.range = row.range;
    result.raw.push(record);
  }
  for (const row of report?.ui || []) if (['index.html', 'en.html'].includes(row.lang)) {
    result.ui.push({lang: row.lang, ...numbers(row, ['width', 'cases', 'guideMeasurements']),
      ...bools(row, ['controls', 'guideKeyboardOnOff'])});
  }
  for (const name of ['playback', 'nativeParity', 'live']) for (const row of report?.[name] || []) {
    if (!cases.has(row.case) || !['before', 'after'].includes(row.side)) continue;
    const record = {case: row.case, side: row.side};
    if (name === 'playback') Object.assign(record, {
      seeks: Array.isArray(row.seeks) ? row.seeks.map(seek) : [], playback: playback(row.playback)});
    if (name === 'nativeParity') for (const key of ['frames', 'reverseFrames']) {
      record[key] = Array.isArray(row[key]) ? row[key].filter(Number.isFinite) : [];
    }
    if (name === 'live') Object.assign(record, numbers(row, ['frame', 'width']), {
      canvas: Array.isArray(row.canvas) ? row.canvas.filter(Number.isFinite) : []});
    result[name].push(record);
  }
  if(manifest.schema==='avoid007-h03-native-v1'&&report?.inputPlayback!==undefined){
    result.inputPlayback=[];
    const expected=new Map((manifest.inputMedia||[]).map(row=>[row.path,row.layer]));
    for(const row of Array.isArray(report.inputPlayback)?report.inputPlayback:[]){
      if(!known.has(row.path)||expected.get(row.path)!==row.layer||!['media','foreground'].includes(row.layer))continue;
      result.inputPlayback.push({path:row.path,layer:row.layer,...numbers(row,['duration','frames','fps']),
        seeks:Array.isArray(row.seeks)?row.seeks.map(seek):[],playback:playback(row.playback),
        pause:{...bools(row.pause,['paused','ended','playing']),...numbers(row.pause,['startTime','playedTime','pausedTime','afterWaitTime','waitMs']),seek:seek(row.pause?.seek)}});
    }
  }
  result.counts = Object.fromEntries(['raw', 'ui', 'playback', 'nativeParity', 'live'].map(k => [k, result[k].length]));
  if(result.inputPlayback!==undefined)result.counts.inputPlayback=result.inputPlayback.length;
  return result;
}
function completion(report, projected, manifest, inputs) {
  if (Array.isArray(report?.playback)) {
    assert.ok(report.playback.every(row => row.playback?.failure === undefined), 'no playback failure marker');
  }
  if (manifest.schema !== 'avoid007-native-v1') {
    // Supplemental source/fixture gates remain owned by the qualified H03 tool.
    assert.equal(report?.status, SUCCESS);
    assert.equal(manifest.schema,'avoid007-h03-native-v1');
    assert.equal(manifest.inputMedia?.length,2);
    assert.deepEqual(manifest.inputMedia.map(r=>r.layer).sort(),['foreground','media']);
    assert.equal(new Set(manifest.inputMedia.map(r=>r.path)).size,2);
    assert.equal(report.inputPlayback?.length,2);assert.equal(projected.inputPlayback?.length,2);
    assert.ok(report.inputPlayback.every(r=>r.playback?.failure===undefined),'no input playback failure marker');
    const known=new Set(inputs.filter(i=>i.asset).map(i=>i.asset));
    for(const input of manifest.inputMedia){
      assert.ok(known.has(input.path)&&input.path.endsWith('.mp4'));
      const rows=projected.inputPlayback.filter(r=>r.path===input.path&&r.layer===input.layer);
      assert.equal(rows.length,1);const row=rows[0],p=row.playback;
      assert.equal(row.duration,12);assert.equal(row.frames,288);assert.equal(row.fps,24);
      assert.equal(row.seeks.length,3);
      for(const [n,target]of [.5,6.5,11.5].entries()){
        assert.ok(Math.abs(row.seeks[n].seekedAt-target)<=1/24+1e-6);
        assert.ok(Math.abs(row.seeks[n].decodedAfterSeek.mediaTime-target)<=1/24+1e-6);
      }
      assert.equal(p.ended,true);assert.ok(p.decoded>=284&&Math.abs(p.currentTime-12)<1/24);
      assert.equal(p.dropped,0);assert.equal(p.corrupt,0);
      assert.ok(Math.abs(p.startFrame.seekedAt)<=1/24+1e-6);
      assert.ok(Math.abs(p.startFrame.decodedAfterSeek.mediaTime)<=1/24+1e-6);
      const pause=row.pause;
      assert.equal(pause.paused,true);assert.equal(pause.ended,false);assert.equal(pause.playing,true);
      assert.ok(Math.abs(pause.seek.seekedAt-.5)<=1/24+1e-6);
      assert.ok(Math.abs(pause.seek.decodedAfterSeek.mediaTime-.5)<=1/24+1e-6);
      assert.ok(Math.abs(pause.startTime-.5)<=1/24+1e-6);
      assert.ok(pause.playedTime-pause.startTime>=1/24);
      assert.ok(pause.pausedTime>=pause.playedTime&&pause.pausedTime<12-1/24);
      assert.ok(pause.waitMs>=100&&Number.isFinite(pause.waitMs));
      assert.ok(Math.abs(pause.afterWaitTime-pause.pausedTime)<=1e-6);
    }
    return;
  }
  assert.equal(manifest.cases.length, 25);
  assert.equal(new Set(manifest.cases.map(c => c.id)).size, 25);
  assert.equal(report.status, SUCCESS);
  for (const input of inputs.filter(i => i.asset)) {
    const matches = projected.raw.filter(r => r.path === input.asset && r.status === 200);
    assert.equal(matches.length, 1);
    assert.equal(matches[0].sha256, input.sha256);
    assert.equal(matches[0].length, input.bytes);
    for (const [extension, type] of [['.mp4', 'video/mp4'], ['.html', 'text/html'], ['.png', 'image/png']]) {
      if (input.asset.endsWith(extension)) assert.equal(matches[0].type, type);
    }
    if (input.asset.endsWith('.mp4')) {
      const ranges = projected.raw.filter(r => r.path === input.asset && r.range?.status === 206);
      assert.equal(ranges.length, 1);
      assert.equal(ranges[0].range.range, 'bytes 0-31/' + input.bytes);
      assert.equal(ranges[0].range.bytes, 32);
    }
  }
  assert.equal(projected.ui.length, 4);
  for (const lang of ['index.html', 'en.html']) for (const width of [1100, 390]) {
    assert.equal(projected.ui.filter(r => r.lang === lang && r.width === width && r.cases === manifest.cases.length && r.controls && r.guideKeyboardOnOff).length, 1);
  }
  for (const name of ['playback', 'nativeParity']) {
    assert.equal(projected[name].length, manifest.cases.length * 2);
    for (const c of manifest.cases) for (const side of ['before', 'after']) {
      assert.equal(projected[name].filter(r => r.case === c.id && r.side === side).length, 1);
    }
  }
  for (const row of projected.playback) {
    assert.equal(row.seeks.length, 3);
    for (const [i, target] of [1.5, .125, 3.75].entries()) {
      assert.ok(Math.abs(row.seeks[i].seekedAt - target) <= 1/24 + 1e-6);
      assert.ok(Math.abs(row.seeks[i].decodedAfterSeek.mediaTime - target) <= 1/24 + 1e-6);
    }
    const p = row.playback;
    assert.equal(p.ended, true);
    assert.ok(p.decoded >= 92 && Math.abs(p.currentTime - 4) < 1/24);
    assert.equal(p.dropped, 0); assert.equal(p.corrupt, 0);
  }
  for (const row of projected.nativeParity) {
    assert.deepEqual(row.frames, [3, 15, 36, 90]);
    assert.deepEqual(row.reverseFrames, [90, 36, 15, 3]);
  }
  assert.equal(projected.live.length, 2);
  for (const side of ['before', 'after']) {
    assert.equal(projected.live.filter(r => r.case === manifest.cases[0].id && r.side === side).length, 1);
  }
  for (const row of projected.live) {
    const c = manifest.cases[0];
    assert.equal(row.frame, 90); assert.equal(row.width, 390);
    assert.deepEqual(row.canvas, [c.conditions.W, c.conditions.H]);
  }
}
function reserve(report, bundle) {
  const targets = [report, report + '.partial.json', report + '.log'];
  const root = path.resolve(bundle) + path.sep;
  for (const file of targets) {
    assert.ok(!path.resolve(file).startsWith(root), 'reports outside immutable bundle');
    assert.equal(fs.realpathSync(path.dirname(file)), path.resolve(path.dirname(file)), 'no symlink output parent');
    assert.ok(!fs.existsSync(file), 'fresh output paths');
  }
  const opened = [];
  try {
    for (const file of targets) opened.push(fs.openSync(file, 'wx', 0o600));
  } catch {
    opened.forEach(fd => fs.closeSync(fd));
    targets.slice(0, opened.length).forEach(file => fs.unlinkSync(file));
    throw Error('output reservation failed');
  }
  return {write(index, value) { fs.ftruncateSync(opened[index]); fs.writeSync(opened[index], json(value), 0, 'utf8'); },
    log(value) { fs.writeSync(opened[2], JSON.stringify(value) + '\n'); },
    close() { opened.forEach(fd => fs.closeSync(fd)); }};
}
async function run(options, {input = process.stdin} = {}) {
  const base = baseURL(options.baseURL), origin = new URL(base).origin;
  const bundle = path.resolve(options.bundle), validator = path.resolve(options.validator);
  const outputs = reserve(path.resolve(options.report), bundle);
  const inputs = [];
  const report = {schema: 'avoid007-private-public-validation-v1', status: 'incomplete',
    context: {baseURL: base, stage: 'preflight'}, versions: {node: process.version, platform: process.platform, arch: process.arch}, inputs};
  let reason = 'preflight-failed', lastProjection, token;
  const stdout = process.stdout.write, stderr = process.stderr.write;
  const discard = (chunk, encoding, callback) => { if (typeof encoding === 'function') encoding(); else callback?.(); return true; };
  const save = () => { outputs.write(1, report); outputs.log({status: report.status, stage: report.context.stage, counts: report.checks?.counts}); };
  async function pin(role, file, asset, expected) {
    const identity = await fingerprint(file);
    if (expected !== undefined) assert.equal(identity.sha256, expected);
    inputs.push({role, ...(asset ? {asset} : {}), ...identity});
    return {file, ...identity};
  }
  const pins = [];
  try {
    save();
    pins.push(await pin('runner', __filename));
    pins.push(await pin('validator', validator));
    const manifestFile = path.join(bundle, 'manifest.json');
    pins.push(await pin('manifest', manifestFile, 'manifest.json'));
    const manifest = JSON.parse(fs.readFileSync(manifestFile));
    assert.ok(['avoid007-native-v1', 'avoid007-h03-native-v1'].includes(manifest.schema));
    report.context.kind = manifest.schema;
    report.completionContract = manifest.schema === 'avoid007-native-v1' ?
      'main-25-pair-numeric-gates' : 'parent-qualified-h03-tool-status-and-input-playback-numeric-gates';
    assert.ok(Array.isArray(manifest.cases) && manifest.cases.length > 0);
    assert.ok(manifest.assets && typeof manifest.assets === 'object' && !Array.isArray(manifest.assets));
    for (const [asset, expected] of Object.entries(manifest.assets)) {
      relative(asset); assert.notEqual(asset, 'manifest.json');
      assert.match(expected, /^[a-f0-9]{64}$/);
      pins.push(await pin('asset', path.join(bundle, asset), asset, expected));
    }
    report.manifestSHA256 = inputs.find(i => i.role === 'manifest').sha256;
    report.context.stage = 'credential-input'; reason = 'credential-input-rejected'; save();
    token = await readToken(input);
    report.context.stage = 'validator'; reason = 'validator-failed'; save();
    // Validator/dependency diagnostics are untrusted text. Never copy them to
    // report/log or the terminal; approved evidence comes from projection only.
    process.stdout.write = discard; process.stderr.write = discard;
    const tool = require(validator);
    assert.equal(typeof tool.validateBrowser, 'function');
    for (const pin of pins) assert.deepEqual(await fingerprint(pin.file), {sha256: pin.sha256, bytes: pin.bytes});
    const result = await tool.validateBrowser(bundle, {baseURL: base, authorize: authorizer(origin, () => token),
      onProgress(value) {
        lastProjection = projection(value, manifest, inputs);
        report.checks = lastProjection;
        report.context.stage = lastProjection.context.stage || 'validator';
        save();
      }});
    lastProjection = projection(result, manifest, inputs);
    report.checks = lastProjection;
    reason = 'completion-contract-failed';
    completion(result, lastProjection, manifest, inputs);
    report.status = 'success'; report.context.stage = 'complete';
  } catch {
    report.status = 'failure'; report.failure = {reason};
  } finally {
    token = undefined;
    try {
      for (const pin of pins) assert.deepEqual(await fingerprint(pin.file), {sha256: pin.sha256, bytes: pin.bytes});
      report.inputIntegrity = 'unchanged';
    } catch {
      report.status = 'failure'; report.failure = {reason: 'input-mutated'}; report.inputIntegrity = 'changed';
    }
    try { save(); outputs.write(0, report); } finally {
      try { outputs.close(); } finally {
        process.stdout.write = stdout; process.stderr.write = stderr;
      }
    }
  }
  return report;
}
function argumentsFor(argv) {
  assert.equal(argv.length, 8);
  const options = {}, names = {'--validator': 'validator', '--bundle': 'bundle', '--base-url': 'baseURL', '--report': 'report'};
  for (let i = 0; i < argv.length; i += 2) {
    assert.ok(Object.hasOwn(names, argv[i]) && !Object.hasOwn(options, names[argv[i]]));
    options[names[argv[i]]] = argv[i + 1];
  }
  return options;
}
module.exports = {run, baseURL, projection, completion, argumentsFor};
if (require.main === module) {
  Promise.resolve().then(() => run(argumentsFor(process.argv.slice(2)))).then(report => {
    process.stdout.write(json({status: report.status, reportSHA256: sha(Buffer.from(json(report)))}));
    process.exitCode = report.status === 'success' ? 0 : 1;
  }).catch(() => { process.stderr.write('Private validation failed; details suppressed.\n'); process.exitCode = 1; });
}
