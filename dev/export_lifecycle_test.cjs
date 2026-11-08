const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const code = fs.readFileSync(path.join(__dirname, '../src/11_export.js'), 'utf8');

async function run(failure, native = true) {
  const events = [], controller = new AbortController();
  const context = vm.createContext({ console, crypto, Blob, Uint8Array, Uint32Array, ArrayBuffer, DataView, TextEncoder,
    setTimeout, performance: { now: () => 200 },
    document: { createElement: () => ({ getContext: () => ({ getImageData: () => ({ data: new Uint8Array(64) }) }) }) },
    J: { mediaLabel: ja => ja, outputSize: () => [4,4], glyphs: { maxRes: 123 }, Renderer: class { frame() { events.push('frame'); } },
      prepareMediaFrame: async () => { if (failure === 'frame') throw Error('frame failure'); },
      platform: {
        nativeExport: true,
        startExport: async () => ({ jobId: 'job' }),
        writeFrame: async () => { events.push('write'); if (failure === 'write') throw Error('write failure'); },
        finishExport: async () => {
          events.push('finish');
          if (failure === 'finish') throw Error('finish failure');
          if (failure === 'cancel-finish') controller.abort();
          return { saved: true, videoEncoder: 'x264' };
        },
        cancelJob: async () => { events.push('cancel'); await Promise.resolve(); events.push('cancelled'); if (failure === 'write') throw Error('cancel failure'); },
      },
    },
  });
  vm.runInContext(code, context);
  context.J.pickVideoCodec = async () => null;
  const stream = { abort: async () => events.push('abort-stream') };
  if (failure === 'cancel-frame') controller.abort();
  let error, result;
  try {
    result = await context.J.exportMP4({ plan: { W:4, H:4, fps:2, duration:1 },
      project: { quality:failure==='invalid-qp'?'qp':'high',exportQP:-1,includeAudio:false }, outputToken: native ? 'out' : null,
      signal: controller.signal, fileStream: native ? null : stream });
  } catch (caught) { error = caught; }
  assert.equal(context.J.glyphs.maxRes, 123, 'glyph resolution restored');
  if (native) {
    if (!failure) {
      assert.equal(result.codec, 'FFmpeg (x264)');
      assert.deepEqual(events, ['frame','write','frame','write','finish']);
    } else {
      assert(error);
      assert.equal(events.filter(event => event === 'cancel').length, 1, 'cancel exactly once');
      assert.equal(events.at(-1), 'cancelled', 'await cleanup before rejecting');
      if (failure === 'write') assert.equal(error.message, 'write failure', 'keep original failure');
    }
  } else {
    assert(error);
    assert.deepEqual(events, ['abort-stream'], 'abort the selected stream if codec negotiation fails');
  }
  const count = events.length;
  controller.abort();
  await Promise.resolve();
  assert.equal(events.length, count, 'remove abort listener after completion');
}

(async () => {
  for (const failure of [null, 'frame', 'write', 'finish', 'cancel-frame', 'cancel-finish']) await run(failure);
  await run('unsupported-codec', false);
  await run('invalid-qp', false);
  console.log('Export lifecycle: 8 completion/error/cancellation cases passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
