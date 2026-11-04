const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { NativeJobs } = require('../native-jobs.cjs');

(async () => {
  const tempDir = path.join(os.tmpdir(), 'jizura_matte_e2e_' + Date.now());
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    const jobs = new NativeJobs({ appDataDir: tempDir });

    // 1. Create a dummy test video / image file
    const samplePath = path.join(tempDir, 'sample_video.mp4');
    fs.writeFileSync(samplePath, Buffer.from('dummy video for matting test'));
    const assetDesc = jobs.registerAssetFile(samplePath, 'video/mp4');

    const progressLogs = [];
    const fakeWebContents = {
      isDestroyed: () => false,
      send: (channel, data) => {
        if (channel === 'desktop:matteProgress') {
          progressLogs.push(data);
        }
      }
    };

    console.log('Starting native matte job...');
    const result = await jobs.startMatteJob(fakeWebContents, {
      assetToken: assetDesc.assetToken,
      sourceId: 'item-person-test',
      profile: 'rvm-mobilenetv3-fp32-p512-r05-v1',
      fps: 24,
      slots: [0, 1, 2]
    });

    assert.ok(result.jobId);
    assert.ok(result.maskToken);
    assert.equal(result.meta.model, 'rvm-mobilenetv3-fp32-p512-r05-v1');
    assert.equal(result.meta.slotsCount, 3);

    // Verify progress events received
    const analyzeEvents = progressLogs.filter(e => e.phase === 'analyze');
    assert.ok(analyzeEvents.length >= 3, 'Should have received progress for each slot');
    assert.equal(analyzeEvents[analyzeEvents.length - 1].completed, 3);

    // Verify JIZMAT01 binary result
    const matteBytes = jobs.getMatteResultBlob(result.maskToken);
    assert.ok(matteBytes.length > 12);
    assert.equal(matteBytes.subarray(0, 8).toString(), 'JIZMAT01');

    jobs.cleanupAll();
    console.log('Person native matting E2E test passed successfully.');
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}
  }
})();
