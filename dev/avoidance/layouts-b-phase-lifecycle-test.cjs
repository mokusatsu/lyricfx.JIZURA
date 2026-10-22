/* Exact helpers and lifecycle mocks only: no browser, network or media encoding. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const T = require('./layouts-b-review.cjs');
const pins = [__filename, require.resolve('./layouts-b-review.cjs')].map(file => ({file, sha256: T.sha(fs.readFileSync(file))}));
console.log('# lifecycle startup ' + JSON.stringify(pins));
function playbackMock() {
  let timer, callback, clock = 0, cancelled = 0, paused = 0, played = 0, handle = 0;
  const v = {currentTime: 3.75, ended: false, playbackRate: 1,
    q: {totalVideoFrames: 10, droppedVideoFrames: 2, corruptedVideoFrames: 0},
    pause() { paused++; }, getVideoPlaybackQuality() { return {...this.q}; },
    requestVideoFrameCallback(fn) { callback = fn; return ++handle; },
    cancelVideoFrameCallback() { callback = null; cancelled++; },
    play() { played++; return Promise.resolve(); }};
  const play = vm.runInNewContext('(' + T.playNativeVideo.toString() + ')', {
    performance: {now: () => ++clock}, setTimeout(fn, ms) { assert.equal(ms, 12000); timer = fn; return 1; },
    clearTimeout() { timer = null; },
  });
  let resolveSeek;
  const pending = play(v, async (video, target) => {
    assert.equal(target, 0);
    return new Promise(resolve => { resolveSeek = resolve; });
  });
  return {v, pending, get cancelled() { return cancelled; }, get paused() { return paused; }, get played() { return played; },
    get callback() { return callback; }, get timer() { return timer; },
    async seeked() {
      v.currentTime = 0; v.q = {totalVideoFrames: 16, droppedVideoFrames: 5, corruptedVideoFrames: 0};
      resolveSeek({seekedAt: 0, decodedAfterSeek: {mediaTime: 0, presentedFrames: 7}});
      await new Promise(setImmediate);
    },
    frame(mediaTime, now, presentedFrames) {
      const fn = callback; callback = null; v.currentTime = mediaTime; v.q.totalVideoFrames++;
      fn(now, {mediaTime, presentedFrames});
    },
    end(drop = 0) {
      v.ended = true; v.currentTime = 4; v.q.totalVideoFrames = 112; v.q.droppedVideoFrames += drop;
      v.onended();
    }};
}

test('owned phase shutdown completes before the next browser may launch', async () => {
  const records = [], actions = [];
  let finishClose;
  const owner = T.browserPhases({baseURL: 'https://example.test/', records,
    launchBrowser: async url => {
      assert.equal(url, 'https://example.test/'); actions.push('launch');
      return {close: () => { actions.push('close-start'); return new Promise(resolve => { finishClose = () => { actions.push('close-end'); resolve(); }; }); }};
    }});
  for (const phase of ['raw-ui', 'playback', 'native-live']) {
    await owner.start(phase);
    const closing = owner.close();
    await assert.rejects(owner.start('playback'), /shutdown awaited/);
    finishClose(); await closing;
  }
  assert.deepEqual(actions, ['launch', 'close-start', 'close-end', 'launch', 'close-start', 'close-end', 'launch', 'close-start', 'close-end']);
  assert.ok(records.every(r => r.status === 'closed' && r.lifecycle === 'owned' && r.startedAt <= r.acquiredAt && r.closeStartedAt <= r.closedAt));
});

test('provided browser is released without closing and labelled shared diagnostic', async () => {
  const provided = {close() { throw Error('caller browser must not close'); }}, records = [];
  const owner = T.browserPhases({provided, records, launchBrowser: () => { throw Error('must not launch'); }});
  for (const phase of ['raw-ui', 'playback', 'native-live']) { assert.equal(await owner.start(phase), provided); await owner.close(); }
  assert.ok(records.every(r => r.lifecycle === 'provided-shared-diagnostic' && r.status === 'released-shared' && r.releasedAt && !r.closedAt));
});

test('failure cleanup closes active ownership, including observer errors and close retry', async () => {
  let closed = 0, throws = false;
  const owner = T.browserPhases({onProgress() { if (throws) throw Error('observer'); },
    launchBrowser: async () => ({close: async () => { closed++; }})});
  await owner.start('raw-ui'); throws = true;
  await assert.rejects(owner.close(), /observer/); assert.equal(closed, 1);
  throws = false; await owner.close(); assert.equal(closed, 1);
  let attempts = 0;
  const retry = T.browserPhases({launchBrowser: async () => ({close: async () => { if (++attempts === 1) throw Error('transient close'); }})});
  await retry.start('playback'); await assert.rejects(retry.close(), /transient close/);
  await retry.close(); assert.equal(attempts, 2);
});

test('all three owned phases hand the same origin-only authorization hook to pages', async () => {
  const calls = [], records = [];
  const authorize = async ({origin, url}) => { assert.equal(new URL(url).origin, origin); calls.push(origin); return {'X-Synthetic': 'memory-only'}; };
  const owner = T.browserPhases({baseURL: 'https://example.test/build/', records,
    launchBrowser: async () => ({close: async () => {}, newPage: async () => ({route: async function(pattern, handler) { this.handler = handler; }, close: async () => {}})})});
  for (const phase of ['raw-ui', 'playback', 'native-live']) {
    const browser = await owner.start(phase), page = await browser.newPage();
    await T.isolate(page, 'https://example.test/build/', authorize);
    let continued = 0, aborted = 0;
    const route = (url, redirect = false) => ({request: () => ({url: () => url, redirectedFrom: () => redirect ? {} : null, headers: () => ({})}),
      continue: async ({headers}) => { assert.equal(headers['X-Synthetic'], 'memory-only'); continued++; }, abort: async () => { aborted++; }});
    await page.handler(route('https://example.test/build/video.mp4'));
    await page.handler(route('https://foreign.example.test/video.mp4'));
    await page.handler(route('https://example.test/build/redirect', true));
    assert.equal(continued, 1); assert.equal(aborted, 2); await page.close(); await owner.close();
  }
  assert.equal(calls.length, 3); assert.equal(records.length, 3);
});

test('validation snapshots include immutable assets and reject changed bytes', () => {
  const os = require('node:os'), path = require('node:path');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'avoid007-phase-pins-'));
  try {
    fs.writeFileSync(path.join(root, 'manifest.json'), '{}'); fs.writeFileSync(path.join(root, 'asset.bin'), 'original');
    const before = T.browserInputPins(root, {assets: {'asset.bin': T.sha('original')}});
    T.assertBrowserInputs(before);
    fs.writeFileSync(path.join(root, 'asset.bin'), 'changed');
    assert.throws(() => T.assertBrowserInputs(before), /bytes unchanged/);
    assert.throws(() => T.browserInputPins(root, {assets: {'asset.bin': T.sha('original')}}), /prelaunch/);
  } finally { fs.rmSync(root, {recursive: true, force: true}); }
});

test('play window excludes seek flush drops and retains callback diagnostics without replacing quality gates', async () => {
  const p = playbackMock(); assert.equal(p.played, 0);
  await p.seeked(); assert.equal(p.played, 1);
  p.frame(1/24, 10, 8); p.frame(2/24, 20, 9); p.frame(4/24, 30, 10); p.end();
  const result = await p.pending;
  assert.equal(result.decoded, 96); assert.equal(result.startQuality.dropped, 5); assert.equal(result.dropped, 0);
  assert.equal(result.callbackCount, 3); assert.equal(result.mediaTimeGapCount, 1);
  assert.ok(result.callbackNowMonotonic && result.presentedFramesMonotonic);
  assert.equal(result.callbackFrames[0].quality.dropped, 5);
  assert.equal(result.callbackFrames[0].mediaTime, 1/24);
  assert.equal(p.callback, null); assert.equal(p.timer, null); assert.equal(p.cancelled, 1);
  assert.equal(p.v.onended, null); assert.equal(p.v.onerror, null);
  const dropped = playbackMock(); await dropped.seeked(); dropped.end(1);
  const bad = await dropped.pending; assert.equal(bad.dropped, 1); assert.throws(() => assert.equal(bad.dropped, 0));
});

test('timeout/error/play rejection cancel callback, timer and handlers and retain failure numbers', async () => {
  for (const mode of ['timeout', 'error', 'play-rejected']) {
    const p = playbackMock();
    if (mode === 'play-rejected') p.v.play = () => Promise.reject(Error('play failed'));
    const rejected = assert.rejects(p.pending, error => {
      assert.equal(error.playback.failure, mode === 'error' ? 'media-error' : mode);
      assert.equal(error.playback.startFrame.decodedAfterSeek.mediaTime, 0);
      assert.ok(Number.isFinite(error.playback.endObservedNow)); return true;
    });
    await p.seeked();
    if (mode === 'timeout') p.timer();
    if (mode === 'error') p.v.onerror();
    await rejected;
    assert.equal(p.callback, null); assert.equal(p.timer, null);
    assert.equal(p.v.onended, null); assert.equal(p.v.onerror, null); assert.ok(p.paused >= 2);
  }
});

test('actual browser acceptance block saves then rejects failure snapshots despite full counters', () => {
  const source = T.validateBrowser.toString(), start = source.indexOf('report.playback.push(');
  const end = source.indexOf('\n        }', start);
  assert.ok(start > 0 && end > start);
  const block = source.slice(start, end);
  const records = [], report = {playback: []};
  let progress = 0;
  const accept = playback => vm.runInNewContext(block, {assert, playback, report,
    c: {id: 'synthetic'}, side: 'after', seeks: [], progress: () => { progress++; }});
  for (const failure of ['timeout', 'media-error', 'play-rejected']) {
    const snapshot = {ended: true, decoded: 96, currentTime: 4, dropped: 0, corrupt: 0, failure};
    assert.throws(() => accept(snapshot), /no playback failure marker/);
    assert.equal(report.playback.at(-1).playback, snapshot, 'failed raw snapshot saved before assert');
    records.push(failure);
  }
  accept({ended: true, decoded: 96, currentTime: 4, dropped: 0, corrupt: 0});
  assert.equal(progress, 4); assert.equal(records.length, 3);
});

test('release source always disposes even when evaluate fails; helper bytes stay pinned', async () => {
  for (const fails of [false, true]) {
    const actions = [], video = {
      evaluate: async fn => { if (fails) throw Error('closed'); fn({pause: () => actions.push('pause'), removeAttribute: () => actions.push('remove'), load: () => actions.push('load')}); },
      dispose: async () => actions.push('dispose'),
    };
    if (fails) await assert.rejects(T.releaseVideo(video), /closed/); else await T.releaseVideo(video);
    assert.equal(actions.at(-1), 'dispose');
  }
  for (const pin of pins) assert.equal(T.sha(fs.readFileSync(pin.file)), pin.sha256);
  console.log('# lifecycle end inputs unchanged; helper/lifecycle mocks only');
});
