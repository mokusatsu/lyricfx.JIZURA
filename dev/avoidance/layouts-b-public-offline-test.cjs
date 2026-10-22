/* Fake validators only: no credential, HTTP request or browser launch. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {Readable} = require('node:stream');
const crypto = require('node:crypto');
const T = require('./layouts-b-public-test.cjs');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const source = require.resolve('./layouts-b-public-test.cjs');
const startup = [source, __filename, path.join(__dirname, 'pages-output-audit.py')]
  .map(file => ({file, sha256: sha(fs.readFileSync(file))}));
const credential = 'synthetic-offline-only-secret-sentinel-987654321';
const SUCCESS = 'raw HTTP, UI, MP4 decoded seek/playback and native parity verified';
console.log('# startup pins ' + JSON.stringify(startup.map(p => ({name: path.basename(p.file), sha256: p.sha256}))));
async function temp(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'avoid007-private-offline-'));
  try { await fn(dir); } finally { fs.rmSync(dir, {recursive: true, force: true}); }
}
function setup(root, mode = 'success', kind = 'avoid007-native-v1') {
  const bundle = path.join(root, 'bundle'); fs.mkdirSync(bundle);
  const assets = {};
  for (const [name, body] of [['index.html', 'synthetic page'], ['before.mp4', 'fake-video-before'.repeat(4)], ['after.mp4', 'fake-video-after'.repeat(4)]]) {
    fs.writeFileSync(path.join(bundle, name), body); assets[name] = sha(body);
  }
  const manifest = {schema: kind, cases: Array.from({length: 25}, (_, i) => ({id: 'synthetic-' + i,
    conditions: {W: 1920, H: 1080}})), assets};
  if(kind==='avoid007-h03-native-v1')manifest.inputMedia=[{path:'before.mp4',layer:'media'},{path:'after.mp4',layer:'foreground'}];
  fs.writeFileSync(path.join(bundle, 'manifest.json'), JSON.stringify(manifest));
  const validator = path.join(root, 'validator.cjs'), runner = path.join(root, 'runner.cjs');
  fs.copyFileSync(source, runner);
  fs.writeFileSync(validator, `
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
exports.validateBrowser=async(dir,o)=>{
 assert.deepEqual(Object.keys(o).sort(),['authorize','baseURL','onProgress']);
 assert.equal(process.env.HTTPS_PROXY,'http://synthetic-proxy.example.test:8080');
 const origin=new URL(o.baseURL).origin;
 const headers=await o.authorize({origin,url:o.baseURL+'index.html'});
 const secret=headers['OAI-Sites-Authorization'].slice(7);
 assert.ok(secret.length>16);
 for(const request of [
  {origin:'https://foreign.example.test',url:o.baseURL},
  {origin,url:'https://foreign.example.test/file'},
  {origin,url:o.baseURL,redirectedFrom:true},
  {origin,url:o.baseURL.replace('https://','https://u:p@')},
  {origin:origin+':443',url:o.baseURL}
 ])await assert.rejects(()=>o.authorize(request));
 console.log(secret); process.stderr.write(secret); // Must be discarded.
 const m=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json')));
 const result={status:${JSON.stringify(SUCCESS)},context:{stage:'raw-http',asset:'index.html',secret},raw:[],ui:[],playback:[],nativeParity:[],live:[],headers,failure:{message:secret}};
 for(const file of ['manifest.json',...Object.keys(m.assets)]){
  const b=fs.readFileSync(path.join(dir,file));
  result.raw.push({path:file,status:200,type:file.endsWith('.mp4')?'video/mp4':'text/html',range:null,length:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex'),headers,unknown:secret});
  if(file.endsWith('.mp4'))result.raw.push({path:file,range:{status:206,range:'bytes 0-31/'+b.length,bytes:32,secret}});
 }
 for(const lang of ['index.html','en.html'])for(const width of [1100,390])result.ui.push({lang,width,cases:m.cases.length,controls:true,guideKeyboardOnOff:true,guideMeasurements:100,secret});
 const seek=t=>({seekedAt:t,decodedAfterSeek:{mediaTime:t,presentedFrames:1,secret},ignoredFrames:[],secret});
 for(const c of m.cases)for(const side of ['before','after']){
  result.playback.push({case:c.id,side,seeks:[1.5,.125,3.75].map(seek),playback:{ended:true,currentTime:4,decoded:96,dropped:0,corrupt:0,startFrame:seek(0),secret},secret});
  result.nativeParity.push({case:c.id,side,frames:[3,15,36,90],reverseFrames:[90,36,15,3],secret});

 }
 if(m.schema==='avoid007-h03-native-v1')result.inputPlayback=m.inputMedia.map(input=>({path:input.path,layer:input.layer,duration:12,frames:288,fps:24,seeks:[.5,6.5,11.5].map(seek),playback:{ended:true,currentTime:12,decoded:288,dropped:0,corrupt:0,startFrame:seek(0),secret,headers},pause:{paused:true,ended:false,playing:true,seek:seek(.5),startTime:.5,playedTime:.6,pausedTime:.6,afterWaitTime:.6,waitMs:125,secret},secret,headers}));
 for(const side of ['after','before'])result.live.push({case:m.cases[0].id,side,frame:90,width:390,canvas:[1920,1080],secret});
 result.phaseIsolation='owned-three-browser-lifecycles';
 result.playbackPageMode='fresh-same-origin-minimal-page-per-video';
 result.context.phase='playback';
 result.phases=[{phase:'playback',lifecycle:'owned',status:'closed',startedAt:'2026-10-22T00:00:00.000Z',closedAt:'2026-10-22T00:00:01.000Z',secret},{phase:secret}];
 result.playback[0].playback.callbackFrames=[{callbackNow:2,observedNow:3,mediaTime:1/24,presentedFrames:8,currentTime:1/24,quality:{decoded:8,dropped:0,corrupt:0,secret},secret}];
 result.playback[0].playback.callbackCount=1;
 result.playback[0].playback.callbackNowMonotonic=true;
 o.onProgress(result);
 const mode=${JSON.stringify(mode)};
 if(mode==='failure')throw Error(secret);
 if(mode==='asset-mutation')fs.appendFileSync(path.join(dir,'index.html'),'changed');
 if(mode==='validator-mutation')fs.appendFileSync(__filename,'\\n// changed');
 if(mode==='runner-mutation')fs.appendFileSync(path.join(__dirname,'runner.cjs'),'\\n// changed');
 if(mode==='false-success')return {status:'verified'};
 if(mode==='missing-playback')result.playback.pop();
 if(mode==='missing-live')result.live.pop();
 if(mode==='wrong-seek')result.playback[0].seeks[0].decodedAfterSeek.mediaTime=0;
 if(mode.startsWith('marker-'))result.playback[0].playback.failure=mode==='marker-unknown'?secret:mode.slice(7);
 if(mode==='bad-h03-status')result.status='not verified';
 if(mode==='input-missing')delete result.inputPlayback;
 if(mode==='input-duplicate')result.inputPlayback[1]=result.inputPlayback[0];
 if(mode==='input-unknown-path')result.inputPlayback[0].path=secret;
 if(mode==='input-short')result.inputPlayback[0].playback.decoded=283;
 if(mode==='input-wrong-seek')result.inputPlayback[0].seeks[2].decodedAfterSeek.mediaTime=0;
 if(mode==='input-drop')result.inputPlayback[0].playback.dropped=1;
 if(mode==='input-corrupt')result.inputPlayback[0].playback.corrupt=1;
 if(mode==='input-ended-pause')result.inputPlayback[0].pause={paused:true,ended:true,currentTime:12,secret};
 if(mode==='input-drifting-pause')result.inputPlayback[0].pause.afterWaitTime=.7;
 if(mode==='input-no-progress')result.inputPlayback[0].pause.playedTime=.5;
 if(mode==='input-no-pause')result.inputPlayback[0].pause.paused=false;
 if(mode==='input-marker')result.inputPlayback[0].playback.failure=secret;

 setImmediate(()=>process.stderr.write(secret)); // Late diagnostics must also be discarded.
 return result;
};
`);
  return {bundle, validator, runner, report: path.join(root, 'report.json')};
}
async function execute(config, input = JSON.stringify({token: credential}) + '\n', args) {
  const previousProxy = process.env.HTTPS_PROXY;
  const originalStdout = process.stdout.write, originalStderr = process.stderr.write;
  const stdout = [], stderr = [];
  const collect = output => (chunk, encoding, callback) => {
    output.push(String(chunk));
    if (typeof encoding === 'function') encoding(); else callback?.();
    return true;
  };
  process.stdout.write = collect(stdout); process.stderr.write = collect(stderr);
  process.env.HTTPS_PROXY = 'http://synthetic-proxy.example.test:8080';
  try {
    const options = T.argumentsFor(args || ['--validator', config.validator, '--bundle', config.bundle,
      '--base-url', 'https://example.test/review/AVOID-007/synthetic/', '--report', config.report]);
    const result = await require(config.runner).run(options, {input: Readable.from([input])});
    return {status: result.status === 'success' ? 0 : 1, stdout: stdout.join(''), stderr: stderr.join('')};
  } catch { return {status: 1, stdout: stdout.join(''), stderr: stderr.join('')}; }
  finally {
    process.stdout.write = originalStdout; process.stderr.write = originalStderr;
    if (previousProxy === undefined) delete process.env.HTTPS_PROXY;
    else process.env.HTTPS_PROXY = previousProxy;
  }
}
function secretFree(config, result) {
  const outputs = [result.stdout, result.stderr];
  for (const name of [config.report, config.report + '.partial.json', config.report + '.log']) {
    if (fs.existsSync(name)) outputs.push(fs.readFileSync(name, 'utf8'));
  }
  for (const output of outputs) {
    assert.ok(!output.includes(credential) && !output.includes('Bearer ') && !output.includes('OAI-Sites-Authorization'));
  }
}

test('canonical CLI/baseURL rejects credentials, query, non-HTTPS and duplicate flags', async () => {
  for (const url of ['http://example.test/', 'https://u:p@example.test/', 'https://example.test/?token=x',
    'https://example.test/#x', 'https://example.test/a/../', 'https://example.test/%78/', 'https://example.test/a//']) assert.throws(() => T.baseURL(url));
  assert.throws(() => T.argumentsFor(['--validator', 'x']));
  await temp(async root => {
    const c = setup(root), result = await execute(c, '', ['--validator', c.validator, '--bundle', c.bundle]);
    assert.notEqual(result.status, 0); assert.ok(!result.stderr.includes('AssertionError'));
  });
});
test('success preserves exact-origin auth, proxy and whitelisted numeric/raw evidence without secrets', () => temp(async root => {
  const c = setup(root), result = await execute(c);
  assert.equal(result.status, 0, result.stderr);
  secretFree(c, result);
  const report = JSON.parse(fs.readFileSync(c.report));
  assert.equal(report.status, 'success'); assert.equal(report.inputIntegrity, 'unchanged');
  assert.equal(report.checks.playback.length, 50); assert.equal(report.checks.raw.length, 6);
  assert.equal(report.checks.nativeParity.length, 50); assert.equal(report.checks.live.length, 2);
  assert.equal(report.checks.phases.length, 1);
  assert.equal(report.checks.context.phase, 'playback');
  assert.equal(report.checks.phases[0].closedAt, '2026-10-22T00:00:01.000Z');
  assert.equal(report.checks.playback[0].playback.callbackFrames[0].quality.dropped, 0);
  assert.equal(report.checks.playback[0].playback.callbackCount, 1);
  assert.equal(report.checks.playback[0].playback.decoded, 96);
  assert.equal(report.checks.playback[0].seeks[0].decodedAfterSeek.mediaTime, 1.5);
  assert.equal(report.checks.raw[0].status, 200);
  for (const name of [c.report, c.report + '.partial.json', c.report + '.log']) assert.equal(fs.statSync(name).mode & 0o777, 0o600);
  assert.equal(JSON.parse(fs.readFileSync(c.report + '.partial.json')).status, 'success');
  const previous = fs.readFileSync(c.report);
  assert.notEqual((await execute(c)).status, 0);
  assert.ok(fs.readFileSync(c.report).equals(previous), 'fresh output protection');
}));
test('validator exception leaves usable secret-free failure partial/final/log', () => temp(async root => {
  const c = setup(root, 'failure'), result = await execute(c);
  assert.notEqual(result.status, 0); secretFree(c, result);
  const report = JSON.parse(fs.readFileSync(c.report));
  assert.equal(report.failure.reason, 'validator-failed');
  assert.equal(report.checks.context.asset, 'index.html');
  assert.equal(JSON.parse(fs.readFileSync(c.report + '.partial.json')).status, 'failure');
}));
test('asset/validator/runner byte mutations reject success at end', async () => {
  for (const mode of ['asset-mutation', 'validator-mutation', 'runner-mutation']) await temp(async root => {
    const c = setup(root, mode), result = await execute(c);
    assert.notEqual(result.status, 0); secretFree(c, result);
    const report = JSON.parse(fs.readFileSync(c.report));
    assert.equal(report.failure.reason, 'input-mutated'); assert.equal(report.inputIntegrity, 'changed');
  });
});
test('main false success, missing evidence, wrong seek and full-counter failure markers reject', async () => {
  for (const mode of ['false-success', 'missing-playback', 'missing-live', 'wrong-seek', 'marker-timeout', 'marker-media-error', 'marker-play-rejected', 'marker-unknown']) await temp(async root => {
    const c = setup(root, mode), result = await execute(c);
    assert.notEqual(result.status, 0); secretFree(c, result);
    const rejected = JSON.parse(fs.readFileSync(c.report));
    assert.equal(rejected.failure.reason, 'completion-contract-failed');
    if (mode.startsWith('marker-')) {
      assert.equal(rejected.checks.playback[0].playback.ended, true);
      assert.equal(rejected.checks.playback[0].playback.decoded, 96);
      assert.equal(rejected.checks.playback[0].playback.dropped, 0);
      assert.equal(rejected.checks.playback[0].playback.corrupt, 0);
      assert.equal(rejected.checks.playback[0].playback.currentTime, 4);
      if (mode !== 'marker-unknown') assert.equal(rejected.checks.playback[0].playback.failure, mode.slice(7));
    }
  });
});
test('malformed/extra/multiline stdin and stale asset hash fail before validator; H03 status is exact', async () => {
  for (const input of ['not JSON\n', JSON.stringify({token: credential, extra: true}) + '\n', JSON.stringify({token: credential}) + '\nsecond line\n']) await temp(async root => {
    const c = setup(root), result = await execute(c, input);
    assert.notEqual(result.status, 0); secretFree(c, result);
    assert.equal(JSON.parse(fs.readFileSync(c.report)).failure.reason, 'credential-input-rejected');
  });
  await temp(async root => {
    const c = setup(root); fs.appendFileSync(path.join(c.bundle, 'index.html'), 'stale');
    const result = await execute(c); assert.notEqual(result.status, 0); secretFree(c, result);
    assert.equal(JSON.parse(fs.readFileSync(c.report)).failure.reason, 'preflight-failed');
  });
  for (const mode of ['bad-h03-status', 'marker-media-error']) await temp(async root => {
    const c = setup(root, mode, 'avoid007-h03-native-v1'), result = await execute(c);
    assert.notEqual(result.status, 0); secretFree(c, result);
    assert.equal(JSON.parse(fs.readFileSync(c.report)).failure.reason, 'completion-contract-failed');
  });
  for (const pin of startup) assert.equal(sha(fs.readFileSync(pin.file)), pin.sha256);
  console.log('# end input pins unchanged; synthetic offline tests only');
});

test('H03 input playback projects known numeric evidence and rejects false success without leaking text',async()=>{
  await temp(async root=>{
    const c=setup(root,'success','avoid007-h03-native-v1'),result=await execute(c);assert.equal(result.status,0);secretFree(c,result);
    const report=JSON.parse(fs.readFileSync(c.report));assert.equal(report.checks.inputPlayback.length,2);assert.equal(report.checks.counts.inputPlayback,2);
    assert.equal(report.checks.inputPlayback[0].path,'before.mp4');assert.equal(report.checks.inputPlayback[0].playback.decoded,288);
    assert.equal(report.checks.inputPlayback[0].seeks[2].decodedAfterSeek.mediaTime,11.5);assert.equal(report.checks.inputPlayback[0].pause.paused,true);assert.equal(report.checks.inputPlayback[0].pause.ended,false);assert.equal(report.checks.inputPlayback[0].pause.afterWaitTime,.6);assert.equal(report.checks.inputPlayback[0].pause.waitMs,125);
    assert.equal(report.checks.inputPlayback[0].headers,undefined);assert.equal(report.checks.inputPlayback[0].playback.secret,undefined);
  });
  for(const mode of ['input-missing','input-duplicate','input-unknown-path','input-short','input-wrong-seek','input-drop','input-corrupt','input-no-pause','input-ended-pause','input-drifting-pause','input-no-progress','input-marker'])await temp(async root=>{
    const c=setup(root,mode,'avoid007-h03-native-v1'),result=await execute(c);assert.notEqual(result.status,0);secretFree(c,result);
    assert.equal(JSON.parse(fs.readFileSync(c.report)).failure.reason,'completion-contract-failed');
  });
  const manifest={schema:'avoid007-native-v1',cases:[]},projected=T.projection({inputPlayback:[{secret:credential}]},manifest,[]);
  assert.equal(projected.inputPlayback,undefined);assert.equal(projected.counts.inputPlayback,undefined);
});
