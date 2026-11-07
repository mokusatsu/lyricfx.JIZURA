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

    // 1. Create a REAL valid PNG image with distinct red content
    const samplePngPath = path.join(tempDir, 'sample_source.png');
    // 1x1 Red PNG
    const redPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(samplePngPath, redPng);

    const assetDesc = jobs.registerAssetFile(samplePngPath, 'image/png');
    const sourceId = 'real-item-uuid-777';

    const progressLogs = [];
    const fakeWebContents = {
      isDestroyed: () => false,
      send: (channel, data) => {
        if (channel === 'desktop:matteProgress') {
          progressLogs.push(data);
        }
      }
    };

    console.log('Starting native matte job with real image input...');
    const result = await jobs.startMatteJob(fakeWebContents, {
      jobId: 'matte_test_123',
      assetToken: assetDesc.assetToken,
      sourceId: sourceId,
      profile: 'rvm-mobilenetv3-fp32-p512-r05-v1',
      fps: 24,
      slots: [0],
      duration: 5.0
    });

    assert.equal(result.jobId, 'matte_test_123');
    assert.ok(result.maskToken);
    assert.equal(result.meta.model, 'rvm-mobilenetv3-fp32-p512-r05-v1');
    assert.equal(result.meta.slotsCount, 1);

    // Verify progress events
    const analyzeEvents = progressLogs.filter(e => e.phase === 'analyze');
    assert.ok(analyzeEvents.length >= 1, 'Should have received analyze progress');
    assert.equal(analyzeEvents[0].completed, 1);

    // Verify JIZMAT01 binary result
    const matteBytes = jobs.getMatteResultBlob(result.maskToken);
    assert.ok(matteBytes.length > 12);
    assert.equal(matteBytes.subarray(0, 8).toString(), 'JIZMAT01');

    // Parse manifest from JIZMAT01 and assert sourceId and duration
    const jsonLen = matteBytes.readUInt32LE(8);
    const manifest = JSON.parse(matteBytes.subarray(12, 12 + jsonLen).toString('utf-8'));
    assert.equal(manifest.sourceId, sourceId, 'sourceId in JIZMAT01 must match request.sourceId');
    assert.equal(manifest.duration, 5.0, 'duration in JIZMAT01 must preserve full source duration');
    assert.equal(manifest.frames.length, 1);

    // 2. Test cancellation before finish
    console.log('Testing matte job cancellation...');
    const cancelPromise = jobs.startMatteJob(fakeWebContents, {
      jobId: 'cancel_matte_456',
      assetToken: assetDesc.assetToken,
      sourceId: 'cancel-item',
      slots: [0, 1, 2, 3, 4]
    });
    // Immediately cancel
    jobs.cancelJob('cancel_matte_456');

    await assert.rejects(async () => {
      await cancelPromise;
    }, /Cancelled/);

    // 3. Test renderer adapter cache and fileToToken bug fix
    console.log('Testing native-backend adapter caching and replacement...');
    global.window = {
      jizuraDesktop: {
        capabilities: async () => ({ nativeMatting: true }),
        pickMedia: async () => [{ assetToken: assetDesc.assetToken, name: 'sample.png', type: 'image/png' }],
        fetchAssetData: async () => redPng,
        ensureNativeAsset: async (itemId, buffer) => {
          return jobs.ensureNativeAsset(itemId, buffer);
        },
        startMatteJob: async (req) => jobs.startMatteJob(fakeWebContents, req),
        onMatteProgress: () => () => {},
        cancelJob: (id) => jobs.cancelJob(id)
      }
    };
    global.File = class MockFile {
      constructor(parts, name, opts) {
        this.parts = parts;
        this.name = name;
        this.type = opts?.type || '';
        this.size = parts.reduce((acc, p) => acc + (p.byteLength || p.length || 0), 0);
      }
      async arrayBuffer() {
        return this.parts[0];
      }
    };
    global.Blob = global.File;
    global.crypto = { randomUUID: () => 'uuid-' + Math.random().toString(36).slice(2) };
    global.J = {
      mediaLabel: (ja) => ja,
      clamp: (v, min, max) => Math.max(min, Math.min(max, v)),
      mediaAssets: new Map(),
      personMaskTargets: () => [{ time: 0, index: 0 }]
    };

    // Load native-backend.js
    const backendCode = fs.readFileSync(path.join(__dirname, '..', 'renderer', 'native-backend.js'), 'utf-8');
    new Function(backendCode)();

    // Verify pickMedia works and fileToToken is defined (does not throw)
    const pickedFiles = await global.J.platform.pickMedia();
    assert.equal(pickedFiles.length, 1);
    const token1 = global.J.platform.getNativeAssetToken(pickedFiles[0]);
    assert.ok(token1, 'Token must be retrieved from blobToToken');

    // Test asset replacement for same itemId with SAME size and SAME lastModified
    const file1 = new global.File([Buffer.from('content1')], 'f1.png', { type: 'image/png' });
    const tokenA = await global.J.platform.ensureNativeAsset('item-X', file1);
    assert.ok(tokenA);

    // Same instance should return same token
    const tokenA_cached = await global.J.platform.ensureNativeAsset('item-X', file1);
    assert.equal(tokenA, tokenA_cached, 'Same file instance must return cached token');

    // Different file instance with EXACTLY THE SAME size (8 bytes) and lastModified
    const file2_same_size = new global.File([Buffer.from('content2')], 'f2.png', { type: 'image/png' });
    assert.equal(file1.size, file2_same_size.size, 'Test setup precondition: files must have identical size');
    const tokenB = await global.J.platform.ensureNativeAsset('item-X', file2_same_size);
    assert.notEqual(tokenA, tokenB, 'Different file object with same size on same itemId must produce new token');

    // Test clearNativeAssetCache
    global.J.platform.clearNativeAssetCache();
    assert.equal(global.J.platform.getItemAssetToken('item-X'), null);

    jobs.cleanupAll();
    console.log('Person native matting E2E test passed successfully.');
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}
  }
})();
