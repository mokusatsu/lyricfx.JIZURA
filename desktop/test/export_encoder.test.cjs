const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { NativeJobs } = require('../native-jobs.cjs');

async function runEncoderTests() {
  console.log('[*] Testing Native Export Encoder Selection & Probing...');

  const tempDir = path.join(__dirname, '.tmp_enc_test');
  fs.mkdirSync(tempDir, { recursive: true });

  const jobs = new NativeJobs({
    cacheDir: path.join(tempDir, 'cache'),
    tempDir: path.join(tempDir, 'temp')
  });

  const width = 64;
  const height = 64;
  const fps = 30;
  const frameCount = 15;
  const frameSize = width * height * 4;
  const frameData = Buffer.alloc(frameSize, 128);

  async function testExportWithEncoder(encoderSetting, expectedEncoderList) {
    const targetPath = path.join(tempDir, `out_${encoderSetting}.mp4`);
    const outToken = jobs.registerOutput(targetPath);

    const startRes = await jobs.startExportJob({}, {
      outputToken: outToken,
      width,
      height,
      fps,
      frameCount,
      encoder: encoderSetting,
      qualityMode: 'qp',
      qp: 23
    });

    assert.strictEqual(startRes.status, 'ready');
    const jobId = startRes.jobId;

    for (let i = 0; i < frameCount; i++) {
      await jobs.writeFrame(jobId, i, frameData);
    }

    const finishRes = await jobs.finishExport(jobId);
    assert.strictEqual(finishRes.saved, true);
    assert.ok(fs.existsSync(finishRes.path), 'Output file must exist');
    assert.ok(finishRes.size > 0, 'Output file size must be > 0');
    console.log(`  [OK] encoder="${encoderSetting}" -> used encoder: "${finishRes.videoEncoder}", file size: ${finishRes.size} bytes`);

    if (expectedEncoderList) {
      assert.ok(
        expectedEncoderList.includes(finishRes.videoEncoder),
        `Expected videoEncoder in ${JSON.stringify(expectedEncoderList)}, got "${finishRes.videoEncoder}"`
      );
    }

    try { fs.unlinkSync(finishRes.path); } catch (e) {}
  }

  // Test 1: auto (on this Intel Core Ultra machine, QSV should be auto-detected via 0.1s blank probe)
  await testExportWithEncoder('auto', ['QSV', 'x264', 'NVENC', 'AMF']);

  // Test 2: explicit cpu (should use x264)
  await testExportWithEncoder('cpu', ['x264']);

  // Test 3: explicit qsv (should use QSV on Intel GPU)
  await testExportWithEncoder('qsv', ['QSV', 'x264']);

  // Test 4: explicit gpu (fallback to x264 if NVENC/AMF not available)
  await testExportWithEncoder('gpu', ['NVENC', 'AMF', 'x264']);

  // Cleanup
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (e) {}

  console.log('[SUCCESS] All Native Export Encoder tests passed successfully!');
}

runEncoderTests().catch((err) => {
  console.error('[FAILED]', err);
  process.exit(1);
});
