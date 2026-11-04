const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { NativeJobs } = require('../native-jobs.cjs');

(async () => {
  const tempDir = path.join(os.tmpdir(), 'jizura_export_e2e_' + Date.now());
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    const jobs = new NativeJobs({ appDataDir: tempDir });

    const width = 160;
    const height = 90;
    const fps = 10;
    const frameCount = 10;
    const frameSize = width * height * 4;

    const outPath = path.join(tempDir, 'test_export_result.mp4');
    const outputToken = jobs.registerOutput(outPath);

    // 1. Create a dummy WAV for audio multiplexing test
    const sr = 48000;
    const durationSec = frameCount / fps;
    const sampleCount = Math.round(sr * durationSec);
    const wavBytes = 44 + sampleCount * 2 * 2;
    const wavBuf = Buffer.alloc(wavBytes);
    wavBuf.write('RIFF', 0);
    wavBuf.writeUInt32LE(wavBytes - 8, 4);
    wavBuf.write('WAVEfmt ', 8);
    wavBuf.writeUInt32LE(16, 16);
    wavBuf.writeUInt16LE(1, 20); // PCM
    wavBuf.writeUInt16LE(2, 22); // 2 channels
    wavBuf.writeUInt32LE(sr, 24);
    wavBuf.writeUInt32LE(sr * 4, 28);
    wavBuf.writeUInt16LE(4, 32);
    wavBuf.writeUInt16LE(16, 34);
    wavBuf.write('data', 36);
    wavBuf.writeUInt32LE(sampleCount * 4, 40);

    const fakeWebContents = {
      isDestroyed: () => false,
      send: () => {}
    };

    console.log('Starting native export job...');
    const startRes = await jobs.startExportJob(fakeWebContents, {
      outputToken,
      width,
      height,
      fps,
      frameCount,
      qualityMode: 'high',
      bitrate: 500000,
      audioBuffer: wavBuf.buffer.slice(wavBuf.byteOffset, wavBuf.byteOffset + wavBuf.byteLength)
    });

    assert.equal(startRes.status, 'ready');
    const jobId = startRes.jobId;

    // 2. Stream RGBA frames
    const frameData = Buffer.alloc(frameSize);
    for (let i = 0; i < frameCount; i++) {
      // Color gradient per frame
      for (let p = 0; p < width * height; p++) {
        frameData[p * 4] = (i * 25) % 256;     // R
        frameData[p * 4 + 1] = 128;            // G
        frameData[p * 4 + 2] = 200;            // B
        frameData[p * 4 + 3] = 255;            // A
      }
      const rawBuf = frameData.buffer.slice(frameData.byteOffset, frameData.byteOffset + frameData.byteLength);
      await jobs.writeFrame(jobId, i, rawBuf);
    }

    // 3. Finalize export
    console.log('Finalizing native export...');
    const finishRes = await jobs.finishExport(jobId);
    assert.equal(finishRes.saved, true);
    assert.ok(finishRes.size > 0);
    assert.ok(fs.existsSync(outPath), 'Final MP4 output must exist');
    assert.ok(fs.statSync(outPath).size > 1000, 'MP4 file should be non-trivial');

    // 4. Test job cancellation and cleanup
    const cancelOutPath = path.join(tempDir, 'cancel_test.mp4');
    const cancelToken = jobs.registerOutput(cancelOutPath);
    const cancelStart = await jobs.startExportJob(fakeWebContents, {
      outputToken: cancelToken,
      width,
      height,
      fps,
      frameCount: 50
    });
    const cancelRes = jobs.cancelJob(cancelStart.jobId);
    assert.equal(cancelRes.ok, true);

    jobs.cleanupAll();
    console.log('Native export E2E test passed successfully.');
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}
  }
})();
