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
const H03_CASES = {'h03-rain-panL': ['rain', 'panL'],
  'h03-bubbles-push': ['bubbles', 'push'], 'h03-credits-dutch': ['credits', 'dutch']};
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
  keys(config, ['buildID', 'sites', 'implementations', 'product', 'cases'], ['h03Supplement']);
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
  if (config.h03Supplement) assert.notEqual(config.h03Supplement.manifestURL, config.sites.manifestURL, 'distinct supplement reference');
  return {buildID: config.buildID, sites: {...config.sites}, implementations: structuredClone(config.implementations),
    product: {...config.product}, cases,
    ...(config.h03Supplement !== undefined ? {h03Supplement: supplementReference(config.h03Supplement)} : {})};
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
function supplementReference(input) {
  keys(input, ['comparisonURL', 'englishComparisonURL', 'manifestURL', 'manifestSHA256', 'audience', 'caseIDs']);
  for (const name of ['comparisonURL', 'englishComparisonURL', 'manifestURL']) url(input[name]);
  assert.equal(input.englishComparisonURL, new URL('en.html', input.comparisonURL).href);
  assert.equal(input.manifestURL, new URL('manifest.json', input.comparisonURL).href);
  assert.equal(input.audience, 'owner-private');
  hash(input.manifestSHA256);
  const caseIDs = supplementIDs(input.caseIDs);
  return {...input, caseIDs};
}
function supplementIDs(ids) {
  assert.ok(Array.isArray(ids) && ids.length > 0, 'nonempty acquired H03 subset');
  assert.equal(new Set(ids).size, ids.length, 'unique H03 subset');
  for (const id of ids) assert.ok(Object.hasOwn(H03_CASES, id), 'known H03 case');
  return ids.slice().sort();
}
function assetPath(value) {
  assert.equal(typeof value, 'string');
  assert.match(value, /^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_.-]+)+$/, 'canonical local asset path');
  assert.ok(!value.split('/').some(p => p === '.' || p === '..'), 'no asset traversal');
  return value;
}
function indexed(manifest, file, digest) {
  assetPath(file);
  assert.equal(hash(manifest.assets[file]), hash(digest), 'indexed asset identity');
  return digest;
}
function verifyH03Linkage(nativeManifestBytes, h03ManifestBytes, caseIDs) {
  assert.ok(Buffer.isBuffer(nativeManifestBytes) && Buffer.isBuffer(h03ManifestBytes), 'both raw manifests required');
  const main = JSON.parse(nativeManifestBytes), m = JSON.parse(h03ManifestBytes);
  const mainCases = nativeCases(main);
  assert.equal(mainCases.length, 25, 'complete main 25-pair manifest');
  assert.equal(new Set(mainCases.map(c => c.id)).size, 25);
  assert.deepEqual(mainCases.map(c => c.layout).sort(), LAYOUTS.slice().sort());
  assert.equal(m.schema, 'avoid007-h03-native-v1');
  assert.equal(m.taskID, 'AVOID-007');
  assert.equal(m.baseline, BASE);
  identifier(m.buildID);
  assert.notEqual(m.buildID, main.buildID, 'distinct supplemental build');
  assert.equal(m.mainBundle.manifestSHA256, sha(nativeManifestBytes), 'raw main linkage');
  for (const side of ['before', 'after']) {
    const source = m.sources[side], file = `sources/${side}/index.html`;
    assert.equal(source.html, file);
    indexed(m, file, source.sha256);
    assert.equal(source.sha256, hash(main.assets[file]), 'same frozen engine');
  }
  assert.equal(m.sources.products.en, 'sources/after/en/index.html');
  indexed(m, m.sources.products.en, m.sources.products.enSHA256);
  assert.equal(m.sources.products.enSHA256, hash(main.assets['sources/after/en/index.html']), 'same EN product');
  assert.equal(m.sources.products.jaSHA256, m.sources.after.sha256, 'same JA product');
  assert.match(assetPath(m.fontManifest.path), /^evidence\/.+\.json$/);
  assert.match(assetPath(m.focusedReceipt.path), /^evidence\/.+\.json$/);
  indexed(m, m.fontManifest.path, m.fontManifest.sha256);
  indexed(m, m.focusedReceipt.path, m.focusedReceipt.sha256);
  const mainFaces = main.fixtureOptions.fonts.faces;
  assert.ok(Array.isArray(mainFaces) && mainFaces.length === 8, 'eight main runtime faces');
  assert.ok(Array.isArray(m.fonts) && m.fonts.length === 8, 'eight supplemental faces');
  const mainFonts = mainFaces.map(f => {
    indexed(main, f.url, f.sourceSHA256);
    return [f.url, f.sourceSHA256];
  }).sort();
  const fonts = m.fonts.map(f => [assetPath(f.path), indexed(m, f.path, f.sha256)]).sort();
  assert.equal(new Set(fonts.map(f => f[0])).size, 8, 'unique font paths');
  assert.deepEqual(fonts, mainFonts, 'same actual font bytes and paths');
  assert.deepEqual(m.fixtureOptions.fonts.assignments, main.fixtureOptions.fonts.assignments, 'same font roles');
  assert.ok(main.fixtureOptions.fonts.assignments && Object.keys(main.fixtureOptions.fonts.assignments).length > 0);
  if(m.profile===undefined)assert.deepEqual(m.capture,{absoluteStart:3,absoluteEnd:7,fps:24,frames:96,duration:4},'legacy absolute H03 clock');
  else {
    assert.equal(m.profile,'native-single-retention-v1','known distinct H03 profile only');
    assert.deepEqual(m.capture,{absoluteStart:.5,absoluteEnd:4.5,fps:24,frames:96,duration:4},'single-retention absolute H03 clock');
  }
  assert.ok(Array.isArray(m.cases));
  assert.deepEqual(m.cases.map(c => c.id).sort(), Object.keys(H03_CASES).sort(), 'all three focused outcomes');
  const acquired = [], mediaPaths = new Set();
  const acquiredAsset = file => {
    assert.ok(!mediaPaths.has(file), 'distinct acquired media paths');
    mediaPaths.add(file);
    return indexed(m, file, m.assets[file]);
  };
  for (const c of m.cases) {
    assert.deepEqual(c.hids, ['AVOID-007-H03']);
    assert.ok(['safe', 'insufficient', 'unsupported'].includes(c.status), 'honest focused status');
    const condition = c.conditions, [layout, camera] = H03_CASES[c.id];
    for (const [key, value] of Object.entries({layout, camera, W: 3200, H: 1080, seed: 704, cx: .5, cy: .42, radius: .2})) {
      assert.equal(condition[key], value, 'reviewed H03 condition ' + key);
    }
    assert.equal(typeof condition.text, 'string');
    assert.equal(condition.text.split('\n').length, 3, 'three actual scene lyric lines');
    assert.ok(condition.text.split('\n').every(line => line.length > 0));
    if (c.media !== undefined) {
      assert.equal(c.status, 'safe', 'media only for approved acquired safe outcomes');
      keys(c.media, ['before', 'after']);
      for (const side of ['before', 'after']) {
        const media = c.media[side];
        keys(media, ['video', 'keyImages']);
        assert.match(assetPath(media.video), /^videos\/.+\.mp4$/);
        acquiredAsset(media.video);
        assert.ok(Array.isArray(media.keyImages) && media.keyImages.length > 0, 'acquired key images');
        assert.equal(new Set(media.keyImages).size, media.keyImages.length);
        for (const file of media.keyImages) {
          assert.match(assetPath(file), /\.png$/);
          acquiredAsset(file);
        }
      }
      acquired.push(c.id);
    }
  }
  assert.deepEqual(supplementIDs(caseIDs), acquired.sort(), 'exact approved acquired safe subset');
  return {mainManifestSHA256: sha(nativeManifestBytes), h03ManifestSHA256: sha(h03ManifestBytes), caseIDs: acquired};
}
function verifySupplement(config, nativeManifestBytes, h03ManifestBytes) {
  if (!config.h03Supplement) {
    assert.equal(h03ManifestBytes, undefined, 'no unconfigured supplement bytes');
    return;
  }
  assert.ok(Buffer.isBuffer(h03ManifestBytes), 'original local H03 manifest bytes required');
  assert.equal(sha(h03ManifestBytes), config.h03Supplement.manifestSHA256, 'raw H03 manifest hash');
  verifyH03Linkage(nativeManifestBytes, h03ManifestBytes, config.h03Supplement.caseIDs);
}
function supplementHTML(reference, en, relative = false) {
  const remote = relative ? reference.relativeBundle + (en ? '/en.html' : '/index.html') :
    (en ? reference.englishComparisonURL : reference.comparisonURL);
  const label = en ? 'Open the long-scene and video comparison' : '長いシーンと動画の比較を開く';
  return `<p><a href="${esc(remote)}#AVOID-007-H03">${label}</a></p><ul>${reference.caseIDs.map(id =>
    `<li><a href="${esc(remote)}#${esc(id)}">${esc(id)}</a></li>`).join('')}</ul>`;
}
function pointer(config) {
  return {schema: 'avoid007-sites-pointer-v1', taskID: 'AVOID-007', buildID: config.buildID,
    remoteReference: {...config.sites}, implementations: config.implementations, product: config.product,
    productURLs: {ja: PRODUCT, en: PRODUCT + 'en/'}, cases: config.cases,
    ...(config.h03Supplement ? {h03Supplement: config.h03Supplement} : {})};
}
function pageHTML(config, en = false) {
  const remote = en ? config.sites.englishComparisonURL : config.sites.comparisonURL;
  const texts = en ? ['Before / after MP4 comparison', 'Open before / after MP4s',
    'You may be asked to sign in.', 'Open the app', 'Cases', 'Motion', 'Primary and repeated lyrics', 'Camera and seeking'] :
    ['変更前後のMP4比較', '変更前後のMP4を開く', '必要に応じてログインしてください。', 'アプリを開く', '各演出', '動き', '主歌詞と反復歌詞', 'カメラとシーク'];
  const link = (href, label) => `<a href="${esc(href)}">${esc(label)}</a>`;
  return `<!doctype html><html lang="${en ? 'en' : 'ja'}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${texts[0]}</title><style>body{font:17px system-ui;line-height:1.7;max-width:850px;margin:28px auto;padding:0 16px}a{overflow-wrap:anywhere}li{margin:8px 0}</style><body><h1>${texts[0]}</h1><p>${link(en ? 'index.html' : 'en.html', en ? '日本語' : 'English')}</p><p>${link(remote, texts[1])}</p><p>${texts[2]}</p><p>${link(en ? PRODUCT + 'en/' : PRODUCT, texts[3])}</p><nav>${HIDS.map(h => link('#' + h, h.slice(-3))).join(' · ')}</nav>${HIDS.map((h, i) => `<section id="${h}"><h2>${texts[i + 5]}</h2>${h === 'AVOID-007-H03' && config.h03Supplement ? supplementHTML(config.h03Supplement, en) : ''}<p>${link(remote + '#' + h, texts[1])}</p><ul>${config.cases.filter(c => c.hids.includes(h)).map(c => `<li>${link(remote + '#' + c.id, c.layout)}</li>`).join('')}</ul></section>`).join('')}<h2>${texts[4]}</h2><ul>${config.cases.map(c => `<li id="${esc(c.id)}">${link(remote + '#' + c.id, c.layout)}</li>`).join('')}</ul><p>${link('manifest.json', en ? 'Details' : '詳細')}</p></body></html>\n`;
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
function generate(config, freshDir, {nativeManifestBytes, h03ManifestBytes} = {}) {
  const c = verifyNativeReference(config, nativeManifestBytes);
  verifySupplement(c, nativeManifestBytes, h03ManifestBytes);
  assert.ok(!fs.existsSync(freshDir), 'fresh immutable bridge directory');
  const content = files(c);
  const manifest = {schema: 'avoid007-pages-bridge-v1', taskID: 'AVOID-007',
    buildID: c.buildID, configurationSHA256: sha(Buffer.from(json(c))),
    remoteReference: c.sites, implementations: c.implementations, product: c.product,
    cases: c.cases, nativeReferenceVerified: true,
    ...(c.h03Supplement ? {h03Supplement: c.h03Supplement} : {}),
    assets: Object.fromEntries(ASSETS.map(name => [name, sha(content[name])]))};
  content['manifest.json'] = Buffer.from(json(manifest));
  const totalBytes = Object.values(content).reduce((sum, b) => sum + b.length, 0);
  assert.ok(totalBytes <= 128 * 1024, 'small bridge; no native media copied to Pages');
  fs.mkdirSync(freshDir, {recursive: true});
  for (const [name, data] of Object.entries(content)) fs.writeFileSync(path.join(freshDir, name), data, {flag: 'wx'});
  validate(freshDir, {expectedConfig: c, nativeManifestBytes, h03ManifestBytes});
  return {buildID: c.buildID, directory: freshDir, files: Object.keys(content), bytes: totalBytes,
    manifestSHA256: sha(content['manifest.json']), status: 'local bridge generated; no network or publication'};
}
function validate(dir, {expectedConfig, nativeManifestBytes, h03ManifestBytes} = {}) {
  assert.deepEqual(fs.readdirSync(dir).sort(), [...ASSETS, 'manifest.json'].sort(), 'exact bridge file closure');
  const raw = localFile(dir, 'manifest.json');
  const m = JSON.parse(raw);
  keys(m, ['schema', 'taskID', 'buildID', 'configurationSHA256', 'remoteReference',
    'implementations', 'product', 'cases', 'nativeReferenceVerified', 'assets'], ['h03Supplement']);
  assert.equal(m.schema, 'avoid007-pages-bridge-v1');
  assert.equal(m.taskID, 'AVOID-007');
  assert.equal(m.nativeReferenceVerified, true);
  const c = normalizeConfig({buildID: m.buildID, sites: m.remoteReference,
    implementations: m.implementations, product: m.product, cases: m.cases,
    ...(m.h03Supplement !== undefined ? {h03Supplement: m.h03Supplement} : {})});
  assert.equal(m.configurationSHA256, sha(Buffer.from(json(c))), 'fixed configuration hash');
  if (expectedConfig) assert.deepEqual(c, normalizeConfig(expectedConfig), 'conditions equal external input');
  if (nativeManifestBytes) verifyNativeReference(c, nativeManifestBytes);
  if (nativeManifestBytes || h03ManifestBytes) verifySupplement(c, nativeManifestBytes, h03ManifestBytes);
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
function hubSupplement(mainPath, options) {
  keys(options, [], ['h03Supplement', 'nativeManifestBytes', 'h03ManifestBytes']);
  if (options.h03Supplement === undefined) {
    assert.ok(options.nativeManifestBytes === undefined && options.h03ManifestBytes === undefined, 'no unused hub reference bytes');
    return '';
  }
  keys(options.h03Supplement, ['relativeBundle', 'caseIDs']);
  const reference = options.h03Supplement;
  bundlePath(reference.relativeBundle);
  assert.notEqual(reference.relativeBundle, mainPath, 'distinct deep bundles');
  verifyH03Linkage(options.nativeManifestBytes, options.h03ManifestBytes, reference.caseIDs);
  assert.equal(mainPath.split('/').at(-1), JSON.parse(options.nativeManifestBytes).buildID, 'main deep build path');
  assert.equal(reference.relativeBundle.split('/').at(-1), JSON.parse(options.h03ManifestBytes).buildID, 'H03 deep build path');
  return '<section id="AVOID-007-H03">' + supplementHTML(reference, false, true) + supplementHTML(reference, true, true) + '</section>';
}
function sitesHubHTML(relativeBundle, options = {}) {
  const dir = bundlePath(relativeBundle);
  const extra = hubSupplement(dir, options);
  return `<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MP4比較 / MP4 comparison</title><body><p><a href="${esc(dir)}/index.html">変更前後のMP4を開く</a></p><p><a href="${esc(dir)}/en.html">Open before / after MP4s</a></p>${extra}</body></html>\n`;
}
function generateSitesHub(relativeBundle, freshDistRoot, options = {}) {
  const data = Buffer.from(sitesHubHTML(relativeBundle, options));
  if (options.h03Supplement) {
    for (const [dir, raw] of [[relativeBundle, options.nativeManifestBytes],
      [options.h03Supplement.relativeBundle, options.h03ManifestBytes]]) {
      for (const name of ['index.html', 'en.html', 'manifest.json']) {
        const file = path.join(freshDistRoot, dir, name);
        assert.equal(fs.realpathSync(file), path.resolve(file), 'no symlink deep bundle');
        assert.ok(fs.statSync(file).isFile());
        if (name === 'manifest.json') assert.ok(fs.readFileSync(file).equals(raw), 'actual deep manifest bytes');
        else assert.equal(sha(fs.readFileSync(file)), hash(JSON.parse(raw).assets[name]), 'actual deep HTML raw hash');
      }
    }
  }
  const target = path.join(freshDistRoot, 'index.html');
  assert.ok(!fs.existsSync(target), 'existing Sites root must not be overwritten');
  fs.mkdirSync(freshDistRoot, {recursive: true});
  assert.equal(fs.realpathSync(freshDistRoot), path.resolve(freshDistRoot), 'no symlink dist root');
  fs.writeFileSync(target, data, {flag: 'wx'});
  return {path: target, sha256: sha(data), bytes: data.length, relativeBundle};
}

module.exports = {BASE, PRODUCT, HIDS, LAYOUTS, ASSETS, sha, json, esc, url,
  normalizeConfig, nativeCases, verifyNativeReference, pageHTML, generate, validate,
  bundlePath, sitesHubHTML, generateSitesHub, verifyH03Linkage};
if (require.main === module) {
  try {
    const [command, a, b, c, d] = process.argv.slice(2);
    let receipt;
    if (command === 'generate') receipt = generate(JSON.parse(fs.readFileSync(a)), b, {nativeManifestBytes: fs.readFileSync(c), ...(d ? {h03ManifestBytes: fs.readFileSync(d)} : {})});
    else if (command === 'validate') receipt = validate(a, b ? {nativeManifestBytes: fs.readFileSync(b),
      ...(c ? {h03ManifestBytes: fs.readFileSync(c)} : {})} : {});
    else if (command === 'hub') receipt = generateSitesHub(a, b);
    else throw Error('Usage: layouts-b-pages-bridge.cjs generate config.json fresh-dir native-manifest.json [h03-manifest.json] | validate dir [native-manifest.json [h03-manifest.json]] | hub review/AVOID-007/build fresh-dist-root');
    process.stdout.write(json(receipt));
  } catch (error) {
    // URL parser errors may include rejected credentials; do not echo inputs.
    console.error('Bridge operation failed: ' + (error.code === 'ERR_ASSERTION' ? 'input or artifact validation' : 'invalid input or filesystem operation'));
    process.exitCode = 1;
  }
}
