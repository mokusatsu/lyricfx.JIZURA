/* Lightweight tool qualification only. Synthetic Canvas rectangles are not B25 evidence. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const T = require('./layouts-b-review.cjs');

const condition = {
  layout: 'synthetic', W: 64, H: 48, seed: 704, text: 'synthetic tool test',
  cx: .5, cy: .42, radius: .2, duration: 4, start: 0, time: 0,
};
const row = () => ({
  id: 'synthetic', conditions: { ...condition },
  hids: ['AVOID-007-H01', 'AVOID-007-H02', 'AVOID-007-H03'],
  focus: { ja: '合成Canvasのツール試験', en: 'Synthetic Canvas tool test' },
});

test('canonical paths and exact target layout coverage', () => {
  for (const p of ['../font.ttf', '/font.ttf', 'https://host/font.ttf', 'x//y', 'x/./y']) {
    assert.throws(() => T.relative(p));
  }
  const all = T.LAYOUTS.map(layout => ({ ...row(), id: layout, conditions: { ...condition, layout } }));
  T.guardCases(all);
  assert.throws(() => T.guardCases(all.map((c, i) => i ? c : ({ ...c, conditions: { ...c.conditions, layout: 'orbit' } }))), /exact B25/);
  assert.throws(() => T.guardCases([{ ...row(), conditions: { ...condition, control: 'off' } }], { synthetic: true }));
  assert.throws(() => T.guardCases([{ ...row(), conditions: { ...condition, W: 65 } }], { synthetic: true }));
});

test('font URLs, proxy policy and source normalization are explicit', () => {
  assert.deepEqual(T.resolveOptions({ fonts: { faces: [{ url: 'fonts/a.ttf' }] } }, 'https://example.test/build/').fonts.faces[0].url,
    'https://example.test/build/fonts/a.ttf');
  assert.throws(() => T.resolveOptions({ fontURL: '../old/font.ttf' }, 'http://localhost/'));
  assert.throws(() => T.fontOptionsGuard({ fonts: [], fixtureOptions: { fontURL: 'fonts/a.ttf' } }), /real role font/);
  assert.deepEqual(T.publicBrowserOptions('http://localhost/x', { HTTPS_PROXY: 'http://secret:secret@proxy:80' }), {});
  assert.deepEqual(T.publicBrowserOptions('https://example.test/x', { NO_PROXY: '.example.test', HTTPS_PROXY: 'bad' }), {});
  const proxy = T.publicBrowserOptions('https://example.test/x', { HTTPS_PROXY: 'http://user:pass@proxy:1234' });
  assert.equal(proxy.proxy.server, 'http://proxy:1234');
  assert.equal(proxy.proxy.password, 'pass');
  assert.throws(() => T.publicBrowserOptions('https://example.test', { HTTPS_PROXY: 'secret-invalid' }), /^Error: Invalid environment proxy configuration$/);
  assert.throws(() => T.normalize(Buffer.from('<div id="app"></div>')), /normalization/);
});

test('origin-scoped authorization does not run for foreign origins or redirects', async () => {
  let routeHandler, authorizations = 0, continued = 0, aborted = 0;
  const fakePage = { route: async (pattern, fn) => { routeHandler = fn; } };
  await T.isolate(fakePage, 'https://example.test/build/', async () => { authorizations++; return { Authorization: 'in-memory-only' }; });
  const route = (url, redirect = false) => ({
    request: () => ({ url: () => url, redirectedFrom: () => redirect ? {} : null, headers: () => ({}) }),
    abort: async () => { aborted++; },
    continue: async ({ headers }) => { assert.equal(headers.Authorization, 'in-memory-only'); continued++; },
  });
  await routeHandler(route('https://example.test/build/font.ttf'));
  await routeHandler(route('https://example.test.attacker/font.ttf'));
  await routeHandler(route('https://example.test/redirected', true));
  assert.deepEqual([authorizations, continued, aborted], [1, 1, 2]);
});

test('unsupported, conflict and empty placement observations fail closed', () => {
  const o = { measurementSupported: true, envelopeCovered: true, safety: 'safe' };
  T.safeObservations([o]);
  for (const values of [[], [{ ...o, measurementSupported: false }], [{ ...o, envelopeCovered: false }], [{ ...o, safety: 'conflict' }], [{ ...o, safety: 'hold-safe-entry-exit-relaxed' }]]) {
    assert.throws(() => T.safeObservations(values));
  }
});

test('actual plan stage/text/circle conditions and nonempty certificates are required', () => {
  const initial = {
    observation: {newAPI: true, staged: true, safety: 'certified-bounded-adapter', diagnostics: []},
    plan: {
      W: 64, H: 48, duration: 4,
      lyricAvoidanceIndex: {version: 1, enabled: true, regions: [
        {start: 0, end: null, center: {x: .5, y: .42}, radius: .2},
      ]},
      cuts: [{layout: 'synthetic', text: 'synthetic tool test', placementTrajectory: {
        units: [{segments: [{status: 'safe', decision: 'certified'}]}],
      }}],
    },
  };
  T.actualConditionGuard(initial, condition);
  T.safeInitial(initial);
  for (const mutate of [
    i => { i.plan.W = 66; },
    i => { i.plan.H = 50; },
    i => { i.plan.duration = 4.1; },
    i => { i.plan.cuts[0].text = 'different'; },
    i => { i.plan.cuts[0].layout = 'rain'; },
    i => { i.plan.lyricAvoidanceIndex.enabled = false; },
    i => { i.plan.lyricAvoidanceIndex.regions[0].center.y = .5; },
    i => { i.plan.lyricAvoidanceIndex.regions[0].radius = .25; },
    i => { i.plan.lyricAvoidanceIndex.regions[0].start = .01; },
    i => { i.plan.lyricAvoidanceIndex.regions[0].end = 3.9; },
  ]) {
    const changed = structuredClone(initial);
    mutate(changed);
    assert.throws(() => T.actualConditionGuard(changed, condition));
  }
  for (const units of [[], [{segments: []}]]) {
    const changed = structuredClone(initial);
    changed.plan.cuts[0].placementTrajectory.units = units;
    assert.throws(() => T.safeInitial(changed), /nonempty trajectory/);
  }
  const pipeText = structuredClone(initial);
  pipeText.plan.cuts[0].text = ' main ';
  T.actualConditionGuard(pipeText, {...condition, text: ' main |note'});
  const regions = [
    {id: 'second', start: 2, end: null, center: {x: .3, y: .4}, radius: .1},
    {id: 'first', start: 0, end: null, center: {x: .5, y: .42}, radius: .2},
  ];
  const multiple = structuredClone(initial);
  multiple.plan.lyricAvoidanceIndex.regions = [
    {...regions[1], end: 2}, {...regions[0], end: 4},
  ];
  T.actualConditionGuard(multiple, {...condition, regions});
});

test('circle guide uses original stage coordinates and short-side radius for wide output', () => {
  const wide={...row(),conditions:{...condition,W:3200,H:1080}};
  const svg=T.circleGuide(wide);
  assert.ok(svg.includes('viewBox="0 0 3200 1080"'));
  assert.ok(svg.includes('preserveAspectRatio="xMidYMid meet"'));
  assert.ok(svg.includes('cx="1600"')&&svg.includes('r="216"'));
  assert.ok(svg.includes('fill="none"')&&svg.includes('vector-effect="non-scaling-stroke"'));
  assert.ok(svg.includes('aria-hidden="true"')&&svg.includes('focusable="false"'));
});

test('seek waits for both matching decoded frame and seeked, in either event order', async () => {
  let callback, id = 0, cancelled = 0;
  const events = new Map();
  const video = {
    currentTime: 0,
    requestVideoFrameCallback(fn) { callback = fn; return ++id; },
    cancelVideoFrameCallback() { cancelled++; },
    addEventListener(name, fn) { events.set(name, fn); },
    removeEventListener(name) { events.delete(name); },
  };
  let resolved = false;
  const done = T.seekDecodedFrame(video, 1.5).then(r => { resolved = true; return r; });
  callback(0, { mediaTime: .125, presentedFrames: 1 }); // Old non-target frame remains rejected.
  callback(1, { mediaTime: 1.5, presentedFrames: 2 }); // Correct frame may precede seeked.
  await Promise.resolve();
  assert.equal(resolved, false);
  events.get('seeked')();
  const result = await done;
  assert.equal(result.ignoredFrames.length, 1);
  assert.equal(result.decodedAfterSeek.mediaTime, 1.5);
  assert.equal(events.size, 0);
  assert.equal(cancelled, 0); // Current callback already ran.
});

const SYNTHETIC_FIXTURE = `
window.runLayoutsBFixture=async function(J,spec,options){
  if(!window.syntheticFont){const f=new FontFace('SyntheticToolFont','url('+options.fontURL+')');await f.load();document.fonts.add(f);await document.fonts.ready;window.syntheticFont=true;}
  const after=options.newPath,canvas=document.createElement('canvas');canvas.width=spec.W;canvas.height=spec.H;
  const trajectory={units:[{segments:[{status:'safe',decision:'certified',start:0,end:4}]}]};
  const plan={W:spec.W,H:spec.H,duration:(spec.start||0)+(spec.duration??4),
    lyricAvoidanceIndex:{version:1,enabled:true,regions:spec.regions||[{id:'fixture',start:0,end:null,center:{x:spec.cx,y:spec.cy},radius:spec.radius}]},
    cuts:[{area:null,text:String(spec.text||'風の先へ').split('|')[0],layout:spec.layout,...(after?{placementTrajectory:trajectory}:{})}]};
  const renderer={frame(ctx,p,time,opts){
    if(!opts.noHud||!opts.noPost)throw Error('wrong frame options');
    ctx.clearRect(0,0,p.W,p.H);ctx.fillStyle='#151923';ctx.fillRect(0,0,p.W,p.H);
    ctx.fillStyle=after?'#6ad0f5':'#ffcc55';ctx.fillRect(Math.floor(time*8)+(after?2:0),8,12,12);
    if(after&&opts.placementObservation)opts.placementObservation({measurementSupported:true,envelopeCovered:true,safety:'safe',realTime:time,motionTime:time,pass:'main',polygons:[[[0,0],[1,0],[1,1],[0,1]]]});
  }};
  return {canvas,renderer,plan,project:{synthetic:true},observation:{fontLoaded:document.fonts.check('20px SyntheticToolFont'),newAPI:after,staged:after,safety:after?'certified-bounded-adapter':'not-evaluated',diagnostics:[]}};
};
`;

// This creates one 64x48 rectangle animation through the production PNG->stdin encoder.
// It does not call production capture(), load product HTML, or inspect B25 output.
test('synthetic native Canvas stream, native RGBA, MP4 probe, portable bundle and negative validation', { timeout: 90000 }, async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'avoid007-tool-unit-'));
  const startupInputs = [require.resolve('./layouts-b-review.cjs'), __filename, require.resolve('playwright/package.json'), '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'].map(file => ({ file, sha256: T.sha(fs.readFileSync(file)) }));
  const startup = { phase: 'before synthetic browser launch', inputs: startupInputs.map(({file, sha256}) => ({name: path.basename(file), sha256})), node: process.version };
  process.stdout.write('# synthetic startup pins ' + JSON.stringify(startup) + '\n');
  const browser = await require('playwright').chromium.launch({ headless: true,
    ...(process.env.JIZURA_BROWSER ? { executablePath: process.env.JIZURA_BROWSER } : {}) });
  let local;
  try {
    const m = {
      schema: 'avoid007-native-v1', taskID: 'AVOID-007', buildID: 'synthetic-unit-only', baseline: T.BASE,
      capture: { keyFrames: T.KEYS, frames: 96, fps: 24, duration: 4, frameOptions: { noHud: true, noPost: true }, limitations: ['SYNTHETIC TOOL TEST; NOT PRODUCT EVIDENCE'] },
      assets: {}, cases: [row()], fixtureOptions: { fontURL: 'fonts/test.ttf' },
      endCheck: { allInputsUnchanged: true },
    };
    const add = (p, b) => {
      const data = Buffer.isBuffer(b) ? b : Buffer.from(b);
      fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
      fs.writeFileSync(path.join(root, p), data);
      m.assets[p] = T.sha(data);
    };
    const original = Buffer.from('<!doctype html><html><link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<body><div id="app"></div><script>window.J={};</script></body></html>');
    for (const side of ['before', 'after']) {
      add('sources/' + side + '/index.html', original);
      add('fixtures/' + side + '-engine.html', T.normalize(original));
    }
    add('fixtures/fixture.js', SYNTHETIC_FIXTURE);
    add('fonts/test.ttf', fs.readFileSync('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'));
    add('tools/layouts-b-review.cjs', fs.readFileSync(require.resolve('./layouts-b-review.cjs')));
    add('config.json', JSON.stringify({ cases: [row()], fixtureOptions: m.fixtureOptions, fonts: [{ name: 'test.ttf', path: 'fonts/test.ttf' }] }));
    add('startup.json', JSON.stringify({ phase: 'synthetic unit inputs before browser use', inputs: Object.entries(m.assets).map(([p, sha256]) => ({ path: p, sha256, bytes: fs.statSync(path.join(root, p)).size })) }));
    local = await T.serve(root);
    for (const side of ['before', 'after']) {
      const { page, init } = await T.fixturePage(browser, local.baseURL, m.cases[0], side, m.fixtureOptions);
      try {
        const r = m.cases[0][side] = {
          video: `videos/synthetic-${side}.mp4`, initial: `observations/synthetic-${side}-initial.json`,
          frames: `observations/synthetic-${side}-frames.json`, conditionsSHA256: T.digest(condition),
          keyImages: T.KEYS.map(n => `images/synthetic-${side}-${n}.png`),
        };
        add(r.initial, JSON.stringify(init));
        fs.mkdirSync(path.join(root, 'videos'), { recursive: true });
        const encoded = await T.encodeFrames(path.join(root, r.video), 64, 48,
          n => T.render(page, n), (n, png) => add(`images/synthetic-${side}-${n}.png`, png));
        add(r.frames, JSON.stringify(encoded.frames));
        r.probe = encoded.probe;
        r.encoderArgs = encoded.encoderArgs;
        r.codecQuality = T.codecQuality(path.join(root, r.video), T.KEYS.map(frame => ({ frame, file: path.join(root, `images/synthetic-${side}-${frame}.png`) })));
        m.assets[r.video] = T.sha(fs.readFileSync(path.join(root, r.video)));
      } finally { await page.close(); }
    }
    add('controls.js', '(' + T.controls.toString() + ')();');
    add('live.js', '(' + T.liveControls.toString() + ')();');
    add('live.html', T.liveHTML());
    add('index.html', T.pageHTML(m));
    add('en.html', T.pageHTML(m, true));
    const manifestFile = path.join(root, 'manifest.json');
    const store = () => fs.writeFileSync(manifestFile, JSON.stringify(m));
    store();
    const checked = T.validateFiles(root, { synthetic: true });
    assert.ok(checked.assets > 20);
    const missing = path.join(root, 'images/synthetic-before-3.png');
    const raw = fs.readFileSync(missing);
    fs.unlinkSync(missing);
    assert.throws(() => T.validateFiles(root, { synthetic: true }));
    fs.writeFileSync(missing, Buffer.concat([raw, Buffer.from('tampered')]));
    assert.throws(() => T.validateFiles(root, { synthetic: true }), /raw asset hash/);
    fs.writeFileSync(missing, raw);
    const actualPath = m.cases[0].before.initial;
    const actualBytes = fs.readFileSync(path.join(root, actualPath));
    const actualPlan = JSON.parse(actualBytes);
    actualPlan.plan.lyricAvoidanceIndex.regions[0].center.y = .5;
    add(actualPath, JSON.stringify(actualPlan));
    store();
    assert.throws(() => T.validateFiles(root, { synthetic: true }), /actual circle regions/);
    add(actualPath, actualBytes);
    m.cases[0].after.conditionsSHA256 = 'f'.repeat(64);
    store();
    assert.throws(() => T.validateFiles(root, { synthetic: true }), /same conditions/);
    m.cases[0].after.conditionsSHA256 = T.digest(condition);
    m.cases[0].conditions.seed++;
    store();
    assert.throws(() => T.validateFiles(root, { synthetic: true }), /pre-startup config/);
    m.cases[0].conditions.seed--;
    store();
    const corrupt = Buffer.from(raw); corrupt[corrupt.length - 1] ^= 1;
    assert.throws(() => T.decodePNG(corrupt), /PNG CRC/);
    const p = T.decodePNG(raw);
    assert.throws(() => T.pngRecord(raw, '0'.repeat(64), p.width, p.height), /getImageData/);
    let authCount = 0;
    const report = await T.validateBrowser(root, { baseURL: local.baseURL, synthetic: true, authorize: async ({origin, url}) => { assert.equal(new URL(url).origin, origin); authCount++; return {'X-Synthetic-Authorization': 'memory-only'}; } });
    assert.ok(authCount > Object.keys(m.assets).length, 'real browser hook covers assets, review, playback and native rerender');
    assert.equal(report.phaseIsolation, 'owned-three-browser-lifecycles');
    assert.deepEqual(report.phases.map(p => [p.phase, p.status]), [['raw-ui', 'closed'], ['playback', 'closed'], ['native-live', 'closed']]);
    assert.ok(report.phases.every(p => p.closedAt && p.lifecycle === 'owned'));
    assert.equal(report.playbackPageMode, 'fresh-same-origin-minimal-page-per-video');
    assert.equal(report.ui.length, 4);
    assert.ok(report.ui.every(row=>row.guideMeasurements>=72&&row.guideKeyboardOnOff));
    assert.equal(report.guideSourceAssetsUnchanged,true);
    assert.equal(report.nativeParity.length, 2);
    assert.equal(report.playback.length, 2);
    assert.equal(report.live.length, 2);
    assert.ok(report.playback.every(r => r.playback.decoded >= 92 && r.playback.ended));
    // Test live fixture execution separately from the static review controls.
    const live = await browser.newPage();
    await T.isolate(live, local.baseURL);
    try {
      await live.goto(new URL('live.html?case=synthetic', local.baseURL).href);
      await live.waitForFunction(() => document.querySelector('output').textContent === '36/24');
      assert.equal(await live.frameLocator('iframe').locator('canvas').count(), 1);
      await live.locator('#side').selectOption('before');
      await live.waitForFunction(() => document.body.dataset.fixtureSide === 'before');
      await live.locator('#frame').evaluate(i => { i.value = '90'; i.dispatchEvent(new Event('input', { bubbles: true })); });
      await live.waitForFunction(() => document.querySelector('output').textContent === '90/24');
    } finally { await live.close(); }
    process.stdout.write('# synthetic tool receipt ' + JSON.stringify({
      toolSHA256: T.sha(fs.readFileSync(require.resolve('./layouts-b-review.cjs'))),
      testSHA256: T.sha(fs.readFileSync(__filename)),
      manifestSHA256: checked.manifestSHA256, rawAssets: report.raw.length,
      ui: report.ui, playback: report.playback, nativeParity: report.nativeParity,
      phases: report.phases, phaseIsolation: report.phaseIsolation, inputIntegrity: report.inputIntegrity,
      startup, endInputsUnchanged: startupInputs.every(p => T.sha(fs.readFileSync(p.file)) === p.sha256),
      scope: 'one synthetic 64x48 case; no B25/product capture or public checks',
    }) + '\n');
  } finally {
    for (const pin of startupInputs) assert.equal(T.sha(fs.readFileSync(pin.file)), pin.sha256, 'synthetic inputs unchanged after run');
    await browser.close();
    if (local) await new Promise(resolve => local.server.close(resolve));
    fs.rmSync(root, { recursive: true, force: true });
  }
});
