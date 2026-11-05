const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { NativeJobs } = require('../native-jobs.cjs');

(async () => {
  const tempDir = path.join(os.tmpdir(), 'jizura_security_test_' + Date.now());
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    const jobs = new NativeJobs({ appDataDir: tempDir });

    // 1. Path traversal attacks on asset token
    const traversalTokens = [
      '../../etc/passwd',
      '..\\..\\Windows\\System32',
      'token/../../secret.txt',
      '',
      null,
      undefined
    ];

    for (const token of traversalTokens) {
      assert.equal(jobs.getAsset(token), null, `Token ${token} should not resolve`);
      assert.throws(() => {
        jobs.readAssetBuffer(token);
      }, /not found|Invalid/, `Token ${token} should throw on read`);
    }

    // 2. Reject arbitrary output tokens
    const traversalOutputs = [
      '../../important_file.txt',
      'C:\\Windows\\System32\\calc.exe',
      'nonexistent-token'
    ];
    for (const token of traversalOutputs) {
      assert.equal(jobs.getOutput(token), null, `Output token ${token} must not resolve`);
    }

    // 3. Export buffer size mismatch
    const dummyJob = {
      id: 'fake-job',
      type: 'export',
      status: 'running',
      frameSize: 1920 * 1080 * 4,
      child: { stdin: { write: () => true } }
    };
    jobs.jobs.set('fake-job', dummyJob);

    const wrongBuffer = new ArrayBuffer(100); // Expecting 1920*1080*4 = 8,294,400 bytes
    await assert.rejects(async () => {
      await jobs.writeFrame('fake-job', 0, wrongBuffer);
    }, /does not match expected size/);

    // 4. Invalid job IDs
    await assert.rejects(async () => {
      await jobs.writeFrame('non-existent-job-id', 0, wrongBuffer);
    }, /not found/);

    await assert.rejects(async () => {
      await jobs.finishExport('non-existent-job-id');
    }, /not found/);

    // 5. Test path traversal on startMatteJob jobId
    const assetDesc = await jobs.ensureNativeAsset('item-test', Buffer.from('dummy'));
    const outsideTarget = path.join(tempDir, 'outside_target');
    fs.mkdirSync(outsideTarget, { recursive: true });
    const sentinelFile = path.join(outsideTarget, 'do_not_delete.txt');
    fs.writeFileSync(sentinelFile, 'safe');

    // Attempt traversal via jobId
    const maliciousJobId = '../outside_target';
    const matteRes = await jobs.startMatteJob(null, {
      assetToken: assetDesc.assetToken,
      sourceId: 'src-1',
      jobId: maliciousJobId,
      slots: []
    }).catch(() => null);

    // Cancel and ensure outsideTarget and sentinelFile are NOT deleted
    jobs.cancelJob(maliciousJobId);
    assert.ok(fs.existsSync(sentinelFile), 'Outside sentinel file must NOT be deleted by path traversal in jobId');

    // 6. Test audioExt traversal prevention in startExportJob
    const outToken = jobs.registerOutput(path.join(tempDir, 'out.mp4'));
    const expJob = await jobs.startExportJob(null, {
      outputToken: outToken,
      width: 16,
      height: 16,
      fps: 1,
      frameCount: 1,
      audioBuffer: Buffer.from('testaudio'),
      audioExt: '../../evil.txt'
    }).catch(() => null);

    if (expJob) {
      assert.ok(!fs.existsSync(path.join(tempDir, 'evil.txt')), 'audioExt traversal must not create files outside job directory');
      jobs.cancelJob(expJob.jobId);
    }

    // Clean up
    jobs.cleanupAll();
    console.log('IPC security tests passed successfully.');
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}
  }
})();
