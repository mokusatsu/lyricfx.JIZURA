/* Small Pages pointer to an immutable AVOID-007 Sites native bundle. No network. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const BASE = 'e96cbb2f8379eb5895c36f1312f5083b0c583e75';
const PRODUCT = 'https://mokusatsu.github.io/lyricfx.JIZURA/';
const HIDS = ['AVOID-007-H01', 'AVOID-007-H02', 'AVOID-007-H03'];
const LAYOUTS = ['rain', 'hanging', 'tunnel', 'wordCloud', 'bounceLine', 'elastic',
  'crossBands', 'stickerBomb', 'neon', 'keycaps', 'bubbles', 'slotMachine',
  'flipBoard', 'credits', 'zoomRepeat', 'splitHalves', 'columnsBig', 'dotMatrix',
  'depthStack', 'typeSpecimen', 'kanjiFocus', 'halfVertical', 'curtain', 'equalizer', 'tape'];
const ASSETS = ['index.html', 'en.html', 'sites-pointer.json'];
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const json = value => JSON.stringify(value, null, 2) + '\n';
const esc = value => String(value).replace(/[&<>"']/g,
  c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

function keys(value, required, optional = []) {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), 'plain input object');
  assert.ok(Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
  for (const key of required) assert.ok(Object.hasOwn(value, key), 'required field ' + key);
  for (const key of Object.keys(value)) assert.ok([...required, ...optional].includes(key), 'unknown input field ' + key);
}
function hash(value) {
  assert.equal(typeof value, 'string');
  assert.match(value, /^[a-f0-9]{64}$/, 'SHA-256');
  return value;
}
function commit(value) {
  assert.equal(typeof value, 'string');
  assert.match(value, /^[a-f0-9]{40}$/, 'commit SHA');
  return value;
}
function identifier(value) {
  assert.equal(typeof value, 'string');
  assert.match(value, /^[a-zA-Z0-9_-]+$/, 'safe identifier');
  return value;
}
function url(value) {
  assert.equal(typeof value, 'string');
  assert.ok(!/[\s\\%]/.test(value), 'URL has no whitespace, escape or backslash');
  const parsed = new URL(value);
  assert.equal(parsed.protocol, 'https:', 'HTTPS required');
  assert.ok(!parsed.username && !parsed.password && !parsed.search && !parsed.hash, 'no URL credentials, query or fragment');
  assert.match(parsed.pathname, /^\/[a-zA-Z0-9_./-]*$/, 'normalized public URL path');
  assert.ok(!parsed.pathname.includes('//'), 'normalized path has no repeated slash');
  assert.ok(!parsed.pathname.split('/').some(p => p === '.' || p === '..'));
  assert.equal(parsed.href, value, 'already canonical URL required');
  return value;
}
function gcd(a, b) { return b ? gcd(b, a % b) : a; }
function normalizedCase(input) {
  keys(input, ['id', 'layout', 'stage', 'circle', 'aspect', 'hids']);
  identifier(input.id);
  assert.ok(!HIDS.includes(input.id), 'case ID does not shadow an H anchor');
  assert.ok(LAYOUTS.includes(input.layout), 'B25 layout');
  keys(input.stage, ['W', 'H']);
  for (const n of Object.values(input.stage)) assert.ok(Number.isSafeInteger(n) && n > 0 && n % 2 === 0);
  const divisor = gcd(input.stage.W, input.stage.H);
  assert.equal(input.aspect, `${input.stage.W / divisor}:${input.stage.H / divisor}`, 'aspect equals actual stage');
  keys(input.circle, ['cx', 'cy', 'radius']);
  for (const n of Object.values(input.circle)) assert.ok(Number.isFinite(n));
  assert.ok(input.circle.cx >= 0 && input.circle.cx <= 1 && input.circle.cy >= 0 && input.circle.cy <= 1);
  assert.ok(input.circle.radius >= .02 && input.circle.radius <= .45);
  assert.ok(Array.isArray(input.hids) && input.hids.includes(HIDS[0]));
  assert.equal(new Set(input.hids).size, input.hids.length);
  assert.ok(input.hids.every(h => HIDS.includes(h)));
  return {id: input.id, layout: input.layout, stage: {...input.stage},
    circle: {...input.circle}, aspect: input.aspect, hids: input.hids.slice().sort()};
}
function normalizeConfig(config) {
  keys(config, ['buildID', 'sites', 'implementations', 'product', 'cases']);
  identifier(config.buildID);
  keys(config.sites, ['comparisonURL', 'englishComparisonURL', 'manifestURL', 'manifestSHA256', 'audience']);
  for (const name of ['comparisonURL', 'englishComparisonURL', 'manifestURL']) url(config.sites[name]);
  assert.equal(config.sites.englishComparisonURL, new URL('en.html', config.sites.comparisonURL).href);
  assert.equal(config.sites.manifestURL, new URL('manifest.json', config.sites.comparisonURL).href);
  assert.equal(config.sites.audience, 'owner-private', 'existing private audience is preserved');
  hash(config.sites.manifestSHA256);
  keys(config.implementations, ['before', 'after']);
  keys(config.implementations.before, ['commit', 'htmlSHA256']);
  keys(config.implementations.after, ['htmlSHA256'], ['commit']);
  assert.equal(commit(config.implementations.before.commit), BASE);
  if (config.implementations.after.commit !== undefined) commit(config.implementations.after.commit);
  hash(config.implementations.before.htmlSHA256);
  hash(config.implementations.after.htmlSHA256);
  keys(config.product, ['jaSHA256', 'enSHA256'], ['commit']);
  hash(config.product.jaSHA256);
  hash(config.product.enSHA256);
  if (config.product.commit !== undefined) commit(config.product.commit);
  assert.equal(config.product.jaSHA256, config.implementations.after.htmlSHA256, 'product JA matches captured candidate');
  assert.ok(Array.isArray(config.cases) && config.cases.length === 25, 'exactly 25 representative cases');
  const cases = config.cases.map(normalizedCase);
  assert.equal(new Set(cases.map(c => c.id)).size, 25, 'unique case IDs');
  assert.deepEqual(cases.map(c => c.layout).sort(), LAYOUTS.slice().sort(), 'exact B25 set');
  for (const hid of HIDS) assert.ok(cases.some(c => c.hids.includes(hid)), 'all H anchors');
  cases.sort((a, b) => LAYOUTS.indexOf(a.layout) - LAYOUTS.indexOf(b.layout));
  return {buildID: config.buildID, sites: {...config.sites}, implementations: structuredClone(config.implementations),
    product: {...config.product}, cases};
}
function nativeCases(manifest) {
  assert.equal(manifest.schema, 'avoid007-native-v1');
  assert.equal(manifest.taskID, 'AVOID-007');
  assert.equal(manifest.baseline, BASE);
  return manifest.cases.map(c => {
    const s = c.conditions;
    if (s.regions) {
      assert.equal(s.regions.length, 1, 'bridge supports one static representative circle');
      assert.deepEqual(s.regions[0].center, {x: s.cx, y: s.cy});
      assert.equal(s.regions[0].radius, s.radius);
      assert.equal(s.regions[0].start, 0);
      assert.ok(s.regions[0].end === null || s.regions[0].end === 4);
    }
    const divisor = gcd(s.W, s.H);
    return normalizedCase({id: c.id, layout: s.layout, stage: {W: s.W, H: s.H},
      circle: {cx: s.cx, cy: s.cy, radius: s.radius}, aspect: `${s.W / divisor}:${s.H / divisor}`, hids: c.hids});
  }).sort((a, b) => LAYOUTS.indexOf(a.layout) - LAYOUTS.indexOf(b.layout));
}
function verifyNativeReference(config, nativeManifestBytes) {
  const c = normalizeConfig(config);
  assert.ok(Buffer.isBuffer(nativeManifestBytes), 'original local native manifest bytes required');
  assert.equal(sha(nativeManifestBytes), c.sites.manifestSHA256, 'native manifest raw hash');
  const manifest = JSON.parse(nativeManifestBytes);
  assert.deepEqual(nativeCases(manifest), c.cases, 'bridge conditions match native manifest');
  assert.equal(manifest.assets['sources/before/index.html'], c.implementations.before.htmlSHA256);
  assert.equal(manifest.assets['sources/after/index.html'], c.implementations.after.htmlSHA256);
  assert.equal(manifest.assets['sources/after/index.html'], c.product.jaSHA256);
  assert.equal(manifest.assets['sources/after/en/index.html'], c.product.enSHA256);
  return c;
}
function pointer(config) {
  return {schema: 'avoid007-sites-pointer-v1', taskID: 'AVOID-007', buildID: config.buildID,
    remoteReference: {...config.sites}, implementations: config.implementations, product: config.product,
    productURLs: {ja: PRODUCT, en: PRODUCT + 'en/'}, cases: config.cases};
}
function pageHTML(config, en = false) {
  const remote = en ? config.sites.englishComparisonURL : config.sites.comparisonURL;
  const texts = en ? ['Before / after MP4 comparison', 'Open before / after MP4s',
    'You may be asked to sign in.', 'Open the app', 'Cases', 'Motion', 'Primary and repeated lyrics', 'Camera and seeking'] :
    ['変更前後のMP4比較', '変更前後のMP4を開く', '必要に応じてログインしてください。', 'アプリを開く', '各演出', '動き', '主歌詞と反復歌詞', 'カメラとシーク'];
  const link = (href, label) => `<a href="${esc(href)}">${esc(label)}</a>`;
  return `<!doctype html><html lang="${en ? 'en' : 'ja'}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${texts[0]}</title><style>body{font:17px system-ui;line-height:1.7;max-width:850px;margin:28px auto;padding:0 16px}a{overflow-wrap:anywhere}li{margin:8px 0}</style><body><h1>${texts[0]}</h1><p>${link(en ? 'index.html' : 'en.html', en ? '日本語' : 'English')}</p><p>${link(remote, texts[1])}</p><p>${texts[2]}</p><p>${link(en ? PRODUCT + 'en/' : PRODUCT, texts[3])}</p><nav>${HIDS.map(h => link('#' + h, h.slice(-3))).join(' · ')}</nav>${HIDS.map((h, i) => `<section id="${h}"><h2>${texts[i + 5]}</h2><p>${link(remote + '#' + h, texts[1])}</p><ul>${config.cases.filter(c => c.hids.includes(h)).map(c => `<li>${link(remote + '#' + c.id, c.layout)}</li>`).join('')}</ul></section>`).join('')}<h2>${texts[4]}</h2><ul>${config.cases.map(c => `<li id="${esc(c.id)}">${link(remote + '#' + c.id, c.layout)}</li>`).join('')}</ul><p>${link('manifest.json', en ? 'Details' : '詳細')}</p></body></html>\n`;
}
function files(config) {
  return {'index.html': Buffer.from(pageHTML(config)), 'en.html': Buffer.from(pageHTML(config, true)),
    'sites-pointer.json': Buffer.from(json(pointer(config)))};
}
function localFile(dir, name) {
  assert.ok([...ASSETS, 'manifest.json'].includes(name));
  const file = path.join(dir, name);
  assert.equal(fs.realpathSync(file), path.resolve(file), 'no symlink file or directory');
  assert.ok(fs.statSync(file).isFile());
  return fs.readFileSync(file);
}
function generate(config, freshDir, {nativeManifestBytes} = {}) {
  const c = verifyNativeReference(config, nativeManifestBytes);
  assert.ok(!fs.existsSync(freshDir), 'fresh immutable bridge directory');
  const content = files(c);
  const manifest = {schema: 'avoid007-pages-bridge-v1', taskID: 'AVOID-007',
    buildID: c.buildID, configurationSHA256: sha(Buffer.from(json(c))),
    remoteReference: c.sites, implementations: c.implementations, product: c.product,
    cases: c.cases, nativeReferenceVerified: true,
    assets: Object.fromEntries(ASSETS.map(name => [name, sha(content[name])]))};
  content['manifest.json'] = Buffer.from(json(manifest));
  const totalBytes = Object.values(content).reduce((sum, b) => sum + b.length, 0);
  assert.ok(totalBytes <= 128 * 1024, 'small bridge; no native media copied to Pages');
  fs.mkdirSync(freshDir, {recursive: true});
  for (const [name, data] of Object.entries(content)) fs.writeFileSync(path.join(freshDir, name), data, {flag: 'wx'});
  validate(freshDir, {expectedConfig: c, nativeManifestBytes});
  return {buildID: c.buildID, directory: freshDir, files: Object.keys(content), bytes: totalBytes,
    manifestSHA256: sha(content['manifest.json']), status: 'local bridge generated; no network or publication'};
}
function validate(dir, {expectedConfig, nativeManifestBytes} = {}) {
  assert.deepEqual(fs.readdirSync(dir).sort(), [...ASSETS, 'manifest.json'].sort(), 'exact bridge file closure');
  const raw = localFile(dir, 'manifest.json');
  const m = JSON.parse(raw);
  keys(m, ['schema', 'taskID', 'buildID', 'configurationSHA256', 'remoteReference',
    'implementations', 'product', 'cases', 'nativeReferenceVerified', 'assets']);
  assert.equal(m.schema, 'avoid007-pages-bridge-v1');
  assert.equal(m.taskID, 'AVOID-007');
  assert.equal(m.nativeReferenceVerified, true);
  const c = normalizeConfig({buildID: m.buildID, sites: m.remoteReference,
    implementations: m.implementations, product: m.product, cases: m.cases});
  assert.equal(m.configurationSHA256, sha(Buffer.from(json(c))), 'fixed configuration hash');
  if (expectedConfig) assert.deepEqual(c, normalizeConfig(expectedConfig), 'conditions equal external input');
  if (nativeManifestBytes) verifyNativeReference(c, nativeManifestBytes);
  assert.deepEqual(Object.keys(m.assets).sort(), ASSETS.slice().sort(), 'only local assets in audit schema');
  const expected = files(c);
  let totalBytes = raw.length;
  for (const name of ASSETS) {
    const b = localFile(dir, name);
    assert.equal(sha(b), hash(m.assets[name]), 'raw bridge asset hash');
    assert.ok(b.equals(expected[name]), 'generated bridge bytes match fixed configuration');
    totalBytes += b.length;
  }
  assert.ok(totalBytes <= 128 * 1024);
  return {manifestSHA256: sha(raw), bytes: totalBytes, assets: 3, externalReferenceChecked: !!nativeManifestBytes};
}
function bundlePath(value) {
  assert.equal(typeof value, 'string');
  assert.match(value, /^review\/AVOID-007\/[a-zA-Z0-9_-]+$/, 'immutable relative bundle directory');
  return value;
}
function sitesHubHTML(relativeBundle) {
  const dir = bundlePath(relativeBundle);
  return `<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MP4比較 / MP4 comparison</title><body><p><a href="${esc(dir)}/index.html">変更前後のMP4を開く</a></p><p><a href="${esc(dir)}/en.html">Open before / after MP4s</a></p></body></html>\n`;
}
function generateSitesHub(relativeBundle, freshDistRoot) {
  const data = Buffer.from(sitesHubHTML(relativeBundle));
  const target = path.join(freshDistRoot, 'index.html');
  assert.ok(!fs.existsSync(target), 'existing Sites root must not be overwritten');
  fs.mkdirSync(freshDistRoot, {recursive: true});
  assert.equal(fs.realpathSync(freshDistRoot), path.resolve(freshDistRoot), 'no symlink dist root');
  fs.writeFileSync(target, data, {flag: 'wx'});
  return {path: target, sha256: sha(data), bytes: data.length, relativeBundle};
}

module.exports = {BASE, PRODUCT, HIDS, LAYOUTS, ASSETS, sha, json, esc, url,
  normalizeConfig, nativeCases, verifyNativeReference, pageHTML, generate, validate,
  bundlePath, sitesHubHTML, generateSitesHub};
if (require.main === module) {
  try {
    const [command, a, b, c] = process.argv.slice(2);
    let receipt;
    if (command === 'generate') receipt = generate(JSON.parse(fs.readFileSync(a)), b, {nativeManifestBytes: fs.readFileSync(c)});
    else if (command === 'validate') receipt = validate(a, b ? {nativeManifestBytes: fs.readFileSync(b)} : {});
    else if (command === 'hub') receipt = generateSitesHub(a, b);
    else throw Error('Usage: layouts-b-pages-bridge.cjs generate config.json fresh-dir native-manifest.json | validate dir [native-manifest.json] | hub review/AVOID-007/build fresh-dist-root');
    process.stdout.write(json(receipt));
  } catch (error) {
    // URL parser errors may include rejected credentials; do not echo inputs.
    console.error('Bridge operation failed: ' + (error.code === 'ERR_ASSERTION' ? 'input or artifact validation' : 'invalid input or filesystem operation'));
    process.exitCode = 1;
  }
}
