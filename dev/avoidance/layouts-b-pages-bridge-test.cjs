/* Synthetic metadata only. No real Sites URL, publication or MP4 capture. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');
const T = require('./layouts-b-pages-bridge.cjs');
const auditPath = path.join(__dirname, 'pages-output-audit.py');
const goldenPath = path.join(__dirname, 'fixtures/layouts-b-pages-bridge-fa05519.cjs');
const goldenSHA256 = 'd68a58e7b0ba5673a4843a40caaed947d31fb6ca186bd8e4d5535153c2049694';
const startup = [__filename, require.resolve('./layouts-b-pages-bridge.cjs'), auditPath, goldenPath]
  .map(file => ({file, sha256: T.sha(fs.readFileSync(file))}));
process.stdout.write('# bridge startup pins ' + T.json(startup.map(p => ({name: path.basename(p.file), sha256: p.sha256}))));
const h = character => character.repeat(64);

function inputs() {
  const cases = T.LAYOUTS.map(layout => ({id: 'synthetic-' + layout, layout,
    stage: {W: 1920, H: 1080}, circle: {cx: .5, cy: .42, radius: .2}, aspect: '16:9',
    hids: layout === 'rain' ? T.HIDS.slice() : [T.HIDS[0]]}));
  const native = {schema: 'avoid007-native-v1', taskID: 'AVOID-007', baseline: T.BASE,
    assets: {'sources/before/index.html': h('a'), 'sources/after/index.html': h('b'),
      'sources/after/en/index.html': h('c')},
    cases: cases.map(c => ({id: c.id, hids: c.hids,
      conditions: {layout: c.layout, W: c.stage.W, H: c.stage.H, cx: c.circle.cx,
        cy: c.circle.cy, radius: c.circle.radius}}))};
  const nativeManifestBytes = Buffer.from(T.json(native));
  const config = {buildID: 'synthetic-bridge',
    sites: {comparisonURL: 'https://example.test/review/AVOID-007/synthetic-native/index.html',
      englishComparisonURL: 'https://example.test/review/AVOID-007/synthetic-native/en.html',
      manifestURL: 'https://example.test/review/AVOID-007/synthetic-native/manifest.json',
      manifestSHA256: T.sha(nativeManifestBytes), audience: 'owner-private'},
    implementations: {before: {commit: T.BASE, htmlSHA256: h('a')}, after: {htmlSHA256: h('b')}},
    product: {jaSHA256: h('b'), enSHA256: h('c')}, cases};
  return {config, nativeManifestBytes};
}
function temp(fn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'avoid007-bridge-unit-'));
  try { return fn(root); } finally { fs.rmSync(root, {recursive: true, force: true}); }
}

function supplementalInputs() {
  const input = inputs(), main = JSON.parse(input.nativeManifestBytes);
  main.buildID = 'synthetic-native';
  main.assets['index.html'] = T.sha('synthetic JA #AVOID-007-H03');
  main.assets['en.html'] = T.sha('synthetic EN #AVOID-007-H03');
  main.fixtureOptions = {fonts: {faces: [], assignments: {sans: 'f0', serif: 'f1', symbol: 'f7'}}};
  const fonts = Array.from({length: 8}, (_, i) => ({path: `fonts/face${i}.woff2`, sha256: T.sha('synthetic-font-' + i)}));
  for (const f of fonts) {
    main.assets[f.path] = f.sha256;
    main.fixtureOptions.fonts.faces.push({id: 'f' + main.fixtureOptions.fonts.faces.length, url: f.path, sourceSHA256: f.sha256});
  }
  const nativeManifestBytes = Buffer.from(T.json(main));
  const m = {schema: 'avoid007-h03-native-v1', taskID: 'AVOID-007', buildID: 'synthetic-h03', baseline: T.BASE,
    mainBundle: {manifestSHA256: T.sha(nativeManifestBytes)},
    sources: {before: {html: 'sources/before/index.html', sha256: h('a')},
      after: {html: 'sources/after/index.html', sha256: h('b')},
      products: {jaSHA256: h('b'), enSHA256: h('c'), en: 'sources/after/en/index.html'}},
    fontManifest: {path: 'evidence/font-manifest.json', sha256: h('d')}, fonts,
    fixtureOptions: {fonts: {assignments: structuredClone(main.fixtureOptions.fonts.assignments)}},
    focusedReceipt: {path: 'evidence/h03-focused-synthetic.json', sha256: h('e')},
    assets: {...main.assets, 'evidence/font-manifest.json': h('d'), 'evidence/h03-focused-synthetic.json': h('e')},
    capture: {absoluteStart: 3, absoluteEnd: 7, fps: 24, frames: 96, duration: 4},
    cases: [['h03-rain-panL', 'rain', 'panL', 'safe'], ['h03-bubbles-push', 'bubbles', 'push', 'insufficient'],
      ['h03-credits-dutch', 'credits', 'dutch', 'unsupported']].map(([id, layout, camera, status]) => ({
      id, hids: ['AVOID-007-H03'], status,
      conditions: {layout, camera, W: 3200, H: 1080, seed: 704, cx: .5, cy: .42, radius: .2, text: 'one\ntwo\nthree'},
    }))};
  const media = {};
  for (const side of ['before', 'after']) {
    const video = `videos/synthetic-${side}.mp4`, key = `images/synthetic-${side}.png`;
    m.assets[video] = T.sha('not a real MP4 ' + side);
    m.assets[key] = T.sha('not a real PNG ' + side);
    media[side] = {video, keyImages: [key]};
  }
  m.cases[0].media = media;
  const config = structuredClone(input.config);
  config.sites.manifestSHA256 = T.sha(nativeManifestBytes);
  const h03ManifestBytes = Buffer.from(T.json(m));
  config.h03Supplement = {comparisonURL: 'https://example.test/review/AVOID-007/synthetic-h03/index.html',
    englishComparisonURL: 'https://example.test/review/AVOID-007/synthetic-h03/en.html',
    manifestURL: 'https://example.test/review/AVOID-007/synthetic-h03/manifest.json',
    manifestSHA256: T.sha(h03ManifestBytes), audience: 'owner-private', caseIDs: ['h03-rain-panL']};
  return {config, nativeManifestBytes, h03ManifestBytes, m};
}

test('bridge metadata fixes all 25 IDs, conditions, H anchors and source hashes', () => {
  const {config, nativeManifestBytes} = inputs();
  assert.equal(T.verifyNativeReference(config, nativeManifestBytes).cases.length, 25);
  for (const mutate of [
    c => { c.cases.pop(); },
    c => { c.cases[0].layout = 'orbit'; },
    c => { c.cases[1].id = c.cases[0].id; },
    c => { c.cases[0].hids = [T.HIDS[0]]; },
    c => { c.cases[0].aspect = '4:3'; },
    c => { c.cases[0].circle.radius = .5; },
    c => { c.product.jaSHA256 = h('d'); },
    c => { c.sites.audience = 'public'; },
    c => { c.token = 'secret-sentinel'; },
  ]) {
    const changed = structuredClone(config);
    mutate(changed);
    assert.throws(() => T.normalizeConfig(changed));
  }
  const changed = structuredClone(config);
  changed.cases[0].circle.cy = .5;
  assert.throws(() => T.verifyNativeReference(changed, nativeManifestBytes), /conditions match/);
  changed.cases[0].circle.cy = .42;
  changed.product.enSHA256 = h('d');
  assert.throws(() => T.verifyNativeReference(changed, nativeManifestBytes));
  assert.throws(() => T.verifyNativeReference(config, Buffer.concat([nativeManifestBytes, Buffer.from(' ')])), /raw hash/);
});

test('canonical HTTPS input rejects secrets, query, traversal and external English destination', () => {
  for (const value of ['http://example.test/x', 'https://u:p@example.test/x',
    'https://example.test/x?token=secret', 'https://example.test/x#token',
    'https://example.test/a/../x', 'https://example.test/%2e%2e/x', 'https://example.test/a//x',
    'https://example.test/x\r\n', 'https://example.test\\x']) assert.throws(() => T.url(value));
  const {config} = inputs();
  config.sites.englishComparisonURL = 'https://other.test/en.html';
  assert.throws(() => T.normalizeConfig(config));
  assert.equal(T.esc('<a href="x&y">\''), '&lt;a href=&quot;x&amp;y&quot;&gt;&#39;');
});

test('four-file immutable bridge has local audit closure, bilingual anchors and direct case links', () => temp(root => {
  const {config, nativeManifestBytes} = inputs();
  const dir = path.join(root, 'bridge');
  const receipt = T.generate(config, dir, {nativeManifestBytes});
  assert.ok(receipt.bytes < 128 * 1024);
  assert.deepEqual(fs.readdirSync(dir).sort(), ['en.html', 'index.html', 'manifest.json', 'sites-pointer.json']);
  const checked = T.validate(dir, {expectedConfig: config, nativeManifestBytes});
  assert.equal(checked.manifestSHA256, receipt.manifestSHA256);
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json')));
  assert.deepEqual(Object.keys(manifest.assets).sort(), T.ASSETS.slice().sort());
  assert.equal(manifest.remoteReference.manifestSHA256, T.sha(nativeManifestBytes));
  assert.equal(manifest.assets['manifest.json'], undefined);
  for (const [filename, english] of [['index.html', false], ['en.html', true]]) {
    const html = fs.readFileSync(path.join(dir, filename), 'utf8');
    assert.ok(html.includes(english ? 'Open before / after MP4s' : '変更前後のMP4を開く'));
    assert.ok(html.includes(english ? 'href="index.html"' : 'href="en.html"'));
    assert.ok(html.includes(T.PRODUCT));
    for (const hid of T.HIDS) {
      assert.ok(html.includes(`id="${hid}"`));
      assert.ok(html.includes(`#${hid}`));
    }
    for (const c of config.cases) assert.ok(html.includes((english ? config.sites.englishComparisonURL : config.sites.comparisonURL) + '#' + c.id));
    assert.ok(!/<(?:script|iframe|video|meta[^>]+http-equiv)/i.test(html), 'small link page, no media, JS or redirect');
    assert.ok(!html.includes('htmlSHA256'), 'technical implementation details stay in manifest');
  }
  assert.throws(() => T.generate(config, dir, {nativeManifestBytes}), /fresh immutable/);
}));

test('missing, tampered, rehashed, extra and symlink assets and changed conditions are rejected', () => temp(root => {
  const {config, nativeManifestBytes} = inputs();
  const dir = path.join(root, 'bridge');
  T.generate(config, dir, {nativeManifestBytes});
  const asset = path.join(dir, 'sites-pointer.json');
  const original = fs.readFileSync(asset);
  const manifestFile = path.join(dir, 'manifest.json');
  const manifest = fs.readFileSync(manifestFile);
  fs.unlinkSync(asset);
  assert.throws(() => T.validate(dir));
  fs.writeFileSync(asset, Buffer.concat([original, Buffer.from(' ')]));
  assert.throws(() => T.validate(dir), /raw bridge asset hash/);
  const rehashed = JSON.parse(manifest);
  rehashed.assets['sites-pointer.json'] = T.sha(fs.readFileSync(asset));
  fs.writeFileSync(manifestFile, T.json(rehashed));
  assert.throws(() => T.validate(dir), /generated bridge bytes/);
  fs.writeFileSync(manifestFile, manifest);
  fs.writeFileSync(asset, original);
  const extra = path.join(dir, 'unexpected.mp4');
  fs.writeFileSync(extra, 'not a real movie');
  assert.throws(() => T.validate(dir), /closure/);
  fs.unlinkSync(extra);
  const target = path.join(root, 'outside.json');
  fs.writeFileSync(target, original);
  fs.unlinkSync(asset);
  fs.symlinkSync(target, asset);
  assert.throws(() => T.validate(dir), /symlink/);
  fs.unlinkSync(asset);
  fs.writeFileSync(asset, original);
  const changed = structuredClone(config);
  changed.cases[0].circle.cy = .5;
  assert.throws(() => T.validate(dir, {expectedConfig: changed}), /external input/);
}));

test('Sites hub is relative, leaves old deep URLs intact and never overwrites a root', () => temp(root => {
  const old = path.join(root, 'review/AVOID-007/old/index.html');
  fs.mkdirSync(path.dirname(old), {recursive: true});
  fs.writeFileSync(old, 'immutable old bytes');
  const before = T.sha(fs.readFileSync(old));
  const receipt = T.generateSitesHub('review/AVOID-007/synthetic-native', root);
  const hub = fs.readFileSync(receipt.path, 'utf8');
  assert.ok(hub.includes('href="review/AVOID-007/synthetic-native/index.html"'));
  assert.ok(hub.includes('href="review/AVOID-007/synthetic-native/en.html"'));
  assert.ok(!hub.includes('http') && !hub.includes('manifest.json'));
  assert.equal(T.sha(fs.readFileSync(old)), before);
  assert.throws(() => T.generateSitesHub('review/AVOID-007/another', root), /not be overwritten/);
  for (const bad of ['../native', '/review/AVOID-007/x', 'https://example.test/x',
    'review/AVOID-007/x?token=a', 'review/AVOID-007/x/index.html']) assert.throws(() => T.sitesHubHTML(bad));
}));

for (const supplemented of [false, true]) test('unchanged Pages audit accepts ' + (supplemented ? 'supplemented ' : '') + 'bridge and still rejects changed old public bytes', () => temp(root => {
  const {config, nativeManifestBytes, h03ManifestBytes} = supplemented ? supplementalInputs() : inputs();
  const candidate = 'review/AVOID-007/synthetic-bridge';
  const source = path.join(root, 'source');
  const output = path.join(root, 'output');
  const dir = path.join(source, candidate);
  T.generate(config, dir, {nativeManifestBytes, h03ManifestBytes});
  const script = `
import importlib.util,json,hashlib,sys
from pathlib import Path
spec=importlib.util.spec_from_file_location('audit',sys.argv[1]);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
root=Path(sys.argv[2]);src=root/'source';out=root/'output';candidate='review/AVOID-007/synthetic-bridge'
def put(p,b):
 p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b)
put(src/'_config.yml',b'synthetic: true\\n')
for name in m.MUTABLE|m.DOWNLOADS:put(src/name,('synthetic '+name).encode())
old='review/AVOID-006/synthetic-old/asset.bin';put(src/old,b'old immutable asset')
oldmanifest='review/AVOID-006/synthetic-old/manifest.json';put(src/oldmanifest,json.dumps({'assets':{'asset.bin':hashlib.sha256((src/old).read_bytes()).hexdigest()}}).encode())
legacy={p.relative_to(src).as_posix():m.fingerprint(p)['gitBlob'] for p in src.rglob('*') if p.is_file() and not p.relative_to(src).as_posix().startswith(candidate) and p.name!='_config.yml'}
def projection():return {'inventory':[{'url':p.relative_to(src).as_posix(),**{k:v for k,v in m.fingerprint(p).items() if k in ('bytes','sha256')}} for p in src.rglob('*') if p.is_file() and p.name!='_config.yml']}
def copy():
 for p in src.rglob('*'):
  if p.is_file() and p.name!='_config.yml':put(out/p.relative_to(src),p.read_bytes())
copy();result=m.audit(src,out,projection(),legacy,candidate)
assert result['passed'] and result['manifestCount']==2 and result['siteBytes']<131072
put(src/old,b'changed immutable asset');copy()
try:m.audit(src,out,projection(),legacy,candidate)
except ValueError as e:assert 'Old public bytes changed' in str(e)
else:raise AssertionError('legacy byte mutation accepted')
print(json.dumps({'syntheticAudit':True,'manifestCount':result['manifestCount'],'siteBytes':result['siteBytes'],'legacyMutationRejected':True}))
`;
  const result = cp.spawnSync('python3', ['-c', script, auditPath, root], {
    encoding: 'utf8', env: {...process.env, PYTHONDONTWRITEBYTECODE: '1'}, maxBuffer: 1024 * 1024,
  });
  assert.equal(result.status, 0, result.stderr);
  const receipt = JSON.parse(result.stdout);
  assert.equal(receipt.legacyMutationRejected, true);
  process.stdout.write('# synthetic unchanged Pages audit ' + T.json(receipt));
}));

test('no-supplement output is byte-identical to committed fa05519 golden helper', () => temp(root => {
  const golden = fs.readFileSync(goldenPath);
  assert.equal(T.sha(golden), goldenSHA256, 'original committed golden source bytes');
  const Module = require('node:module'), module = new Module('/tmp/avoid007-golden.cjs');
  module._compile(golden.toString('utf8'), '/tmp/avoid007-golden.cjs');
  const old = module.exports, {config, nativeManifestBytes} = inputs();
  const before = path.join(root, 'before'), after = path.join(root, 'after');
  old.generate(config, before, {nativeManifestBytes});
  T.generate(config, after, {nativeManifestBytes});
  for (const file of [...T.ASSETS, 'manifest.json']) assert.ok(fs.readFileSync(path.join(before, file)).equals(fs.readFileSync(path.join(after, file))), file);
  assert.equal(T.sitesHubHTML('review/AVOID-007/synthetic-native'), old.sitesHubHTML('review/AVOID-007/synthetic-native'));
  assert.equal(T.pageHTML(T.normalizeConfig(config)), old.pageHTML(old.normalizeConfig(config)));
  process.stdout.write('# committed no-supplement golden source SHA256 ' + T.sha(golden) + '\n');
}));

test('mixed H03 outcomes retain all diagnoses and link only acquired safe media in JA/EN', () => temp(root => {
  const {config, nativeManifestBytes, h03ManifestBytes} = supplementalInputs();
  const options = {nativeManifestBytes, h03ManifestBytes};
  const dir = path.join(root, 'supplemented');
  T.generate(config, dir, options);
  assert.equal(T.validate(dir, options).externalReferenceChecked, true);
  assert.equal(T.validate(dir).externalReferenceChecked, false);
  for (const [file, en] of [['index.html', false], ['en.html', true]]) {
    const html = fs.readFileSync(path.join(dir, file), 'utf8');
    const remote = config.h03Supplement[en ? 'englishComparisonURL' : 'comparisonURL'];
    assert.ok(html.includes(remote + '#AVOID-007-H03'));
    assert.ok(html.includes(remote + '#h03-rain-panL'));
    assert.ok(!html.includes(remote + '#h03-bubbles-push') && !html.includes(remote + '#h03-credits-dutch'));
    assert.ok(html.includes(config.sites[en ? 'englishComparisonURL' : 'comparisonURL'] + '#AVOID-007-H03'));
  }
  assert.throws(() => T.generate(config, path.join(root, 'missing'), {nativeManifestBytes}));
  const legacy = inputs();
  assert.throws(() => T.generate(legacy.config, path.join(root, 'unused'), {...legacy, h03ManifestBytes}));
  assert.throws(() => T.validate(dir, {nativeManifestBytes}));
  assert.throws(() => T.validate(dir, {...options, h03ManifestBytes: Buffer.concat([h03ManifestBytes, Buffer.from(' ')])}), /raw H03/);
}));

test('H03 fails closed on source, EN, font roles, clock, receipt, condition and media mismatches', () => {
  for (const mutate of [
    m => { m.baseline = '0'.repeat(40); },
    m => { m.mainBundle.manifestSHA256 = h('f'); },
    m => { m.sources.before.sha256 = h('f'); },
    m => { m.sources.after.sha256 = h('f'); m.assets[m.sources.after.html] = h('f'); },
    m => { m.sources.products.enSHA256 = h('f'); m.assets[m.sources.products.en] = h('f'); },
    m => { m.sources.products.jaSHA256 = h('f'); },
    m => { m.fonts[0].sha256 = h('f'); m.assets[m.fonts[0].path] = h('f'); },
    m => { m.fonts.pop(); },
    m => { m.fixtureOptions.fonts.assignments.symbol = 'f0'; },
    m => { delete m.assets[m.fontManifest.path]; },
    m => { delete m.assets[m.focusedReceipt.path]; },
    m => { m.focusedReceipt.path = '../receipt.json'; },
    m => { m.capture.absoluteStart = 0; },
    m => { m.capture.absoluteStart = 6; m.capture.absoluteEnd = 10; },
    m => { m.capture.fps = 30; },
    m => { m.cases.pop(); },
    m => { m.cases[1].id = m.cases[0].id; },
    m => { m.cases[0].conditions.cy = .5; },
    m => { m.cases[0].conditions.text = 'one'; },
    m => { m.cases[0].status = 'unsupported'; },
    m => { delete m.cases[0].media.after; },
    m => { m.cases[0].media.after.video = m.cases[0].media.before.video; },
    m => { m.cases[0].media.before.keyImages = []; },
    m => { delete m.assets[m.cases[0].media.before.video]; },
    m => { m.cases[0].media.before.video = 'https://example.test/a.mp4'; },
  ]) {
    const {m, nativeManifestBytes} = supplementalInputs();
    mutate(m);
    assert.throws(() => T.verifyH03Linkage(nativeManifestBytes, Buffer.from(T.json(m)), ['h03-rain-panL']));
  }
  const {nativeManifestBytes, h03ManifestBytes} = supplementalInputs();
  const incompleteMain = JSON.parse(nativeManifestBytes), linked = JSON.parse(h03ManifestBytes);
  incompleteMain.cases.pop();
  const incompleteBytes = Buffer.from(T.json(incompleteMain));
  linked.mainBundle.manifestSHA256 = T.sha(incompleteBytes);
  assert.throws(() => T.verifyH03Linkage(incompleteBytes, Buffer.from(T.json(linked)), ['h03-rain-panL']), /complete main/);
  for (const ids of [[], ['h03-bubbles-push'], ['h03-rain-panL', 'h03-rain-panL'], ['unknown'], ['h03-rain-panL', 'h03-credits-dutch']]) {
    assert.throws(() => T.verifyH03Linkage(nativeManifestBytes, h03ManifestBytes, ids));
  }
});

test('optional supplement URL and private audience follow strict canonical reference rules', () => {
  for (const bad of ['http://example.test/x', 'https://u:p@example.test/x', 'https://example.test/x?token=x',
    'https://example.test/a/../x', 'https://example.test/%78', 'https://example.test/x#H03']) {
    const {config} = supplementalInputs();
    config.h03Supplement.comparisonURL = bad;
    assert.throws(() => T.normalizeConfig(config));
  }
  for (const mutate of [s => { s.audience = 'public'; }, s => { s.englishComparisonURL = 'https://other.test/en.html'; },
    s => { s.token = 'secret'; }, s => { s.caseIDs = ['unknown']; }]) {
    const {config} = supplementalInputs();
    mutate(config.h03Supplement);
    assert.throws(() => T.normalizeConfig(config));
  }
});

test('hub legacy mode accepts only absent or undefined supplementary inputs', () => temp(root => {
  const main = 'review/AVOID-007/synthetic-native';
  const legacy = T.sitesHubHTML(main);
  assert.equal(T.sitesHubHTML(main, {h03Supplement: undefined,
    nativeManifestBytes: undefined, h03ManifestBytes: undefined}), legacy);
  for (const field of ['h03Supplement', 'nativeManifestBytes', 'h03ManifestBytes']) {
    for (const value of [null, false, 0, '', NaN]) {
      const options = {[field]: value};
      assert.throws(() => T.sitesHubHTML(main, options), field);
      const dist = path.join(root, field + '-' + String(value));
      assert.throws(() => T.generateSitesHub(main, dist, options), field);
      assert.ok(!fs.existsSync(dist), 'invalid input writes no hub');
    }
  }
}));

test('supplemented relative hub checks real deep manifests and leaves frozen deep bytes unchanged', () => temp(root => {
  const {nativeManifestBytes, h03ManifestBytes} = supplementalInputs();
  const main = 'review/AVOID-007/synthetic-native', extra = 'review/AVOID-007/synthetic-h03';
  const options = {nativeManifestBytes, h03ManifestBytes, h03Supplement: {relativeBundle: extra, caseIDs: ['h03-rain-panL']}};
  const pins = [];
  for (const [dir, raw] of [[main, nativeManifestBytes], [extra, h03ManifestBytes]]) {
    fs.mkdirSync(path.join(root, dir), {recursive: true});
    for (const [name, bytes] of [['manifest.json', raw], ['index.html', Buffer.from('synthetic JA #AVOID-007-H03')], ['en.html', Buffer.from('synthetic EN #AVOID-007-H03')]]) {
      const file = path.join(root, dir, name);
      fs.writeFileSync(file, bytes); pins.push([file, T.sha(bytes)]);
    }
  }
  const receipt = T.generateSitesHub(main, root, options), html = fs.readFileSync(receipt.path, 'utf8');
  assert.ok(html.includes(extra + '/index.html#h03-rain-panL') && html.includes(extra + '/en.html#AVOID-007-H03'));
  assert.ok(!html.includes('http') && !html.includes('h03-bubbles-push'));
  for (const [file, digest] of pins) assert.equal(T.sha(fs.readFileSync(file)), digest);
  assert.throws(() => T.sitesHubHTML(main, {...options, h03Supplement: {relativeBundle: main, caseIDs: ['h03-rain-panL']}}));
  assert.throws(() => T.sitesHubHTML(main, {...options, h03Supplement: {...options.h03Supplement, relativeBundle: '../escape'}}));
  assert.throws(() => T.sitesHubHTML(main, {h03Supplement: options.h03Supplement}));
  fs.unlinkSync(receipt.path);
  const htmlFile = path.join(root, extra, 'en.html'), originalHTML = fs.readFileSync(htmlFile);
  fs.writeFileSync(htmlFile, 'corrupt HTML');
  assert.throws(() => T.generateSitesHub(main, root, options), /deep HTML raw hash/);
  fs.writeFileSync(htmlFile, originalHTML);
  fs.writeFileSync(path.join(root, extra, 'manifest.json'), 'corrupt');
  assert.throws(() => T.generateSitesHub(main, root, options), /actual deep manifest/);
  assert.ok(!fs.existsSync(receipt.path));
}));

test('CLI rejected credentials are not echoed; startup source and audit bytes stay unchanged', () => temp(root => {
  const {config} = inputs();
  config.sites.comparisonURL = 'https://credential-sentinel:token-sentinel@example.test/index.html';
  const file = path.join(root, 'bad-config.json');
  fs.writeFileSync(file, T.json(config));
  const result = cp.spawnSync(process.execPath,
    [require.resolve('./layouts-b-pages-bridge.cjs'), 'generate', file, path.join(root, 'out'), file], {encoding: 'utf8'});
  assert.notEqual(result.status, 0);
  assert.ok(!result.stderr.includes('sentinel') && !result.stdout.includes('sentinel'));
  for (const pin of startup) assert.equal(T.sha(fs.readFileSync(pin.file)), pin.sha256);
  process.stdout.write('# bridge tool receipt ' + T.json({scope: 'synthetic metadata/local audit only; no real Sites generation or publication',
    inputs: startup.map(p => ({name: path.basename(p.file), sha256: p.sha256})), endInputsUnchanged: true}));
}));
