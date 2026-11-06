const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { NativeJobs } = require('../native-jobs.cjs');

const tempDir = path.join(os.tmpdir(), 'jizura_dialog_test_' + Date.now());
fs.mkdirSync(tempDir, { recursive: true });

try {
  const jobs = new NativeJobs({ appDataDir: tempDir });

  // 1. Unicode & special characters in filename
  const unicodeFile = path.join(tempDir, 'テスト #1 100% 動画_sample 🚀.mp4');
  fs.writeFileSync(unicodeFile, Buffer.from('dummy video content for testing'));

  const desc1 = jobs.registerAssetFile(unicodeFile, 'video/mp4', 'テスト #1 100% 動画_sample 🚀.mp4');
  assert.ok(desc1.assetToken, 'assetToken must be generated');
  assert.equal(desc1.name, 'テスト #1 100% 動画_sample 🚀.mp4');
  assert.equal(desc1.type, 'video/mp4');
  assert.equal(desc1.size, 31);

  // Verify asset lookup
  const asset1 = jobs.getAsset(desc1.assetToken);
  assert.ok(asset1, 'Asset must be found by token');
  assert.ok(fs.existsSync(asset1.filePath), 'Cached file must exist');
  assert.equal(fs.readFileSync(asset1.filePath).toString(), 'dummy video content for testing');
  const fileUrl = require('url').pathToFileURL(asset1.filePath).toString();
  assert.ok(fileUrl.includes('%23'), 'Hash (#) must be URL-escaped to %23');
  assert.ok(fileUrl.includes('%25'), 'Percent (%) must be URL-escaped to %25');

  // 2. Fallback MIME detection from extension
  const imageFile = path.join(tempDir, 'image.PNG');
  fs.writeFileSync(imageFile, Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  const desc2 = jobs.registerAssetFile(imageFile, '');
  assert.equal(desc2.type, 'image/png', 'Empty MIME should fall back to image/png for .png');

  // 3. Missing file handling
  assert.throws(() => {
    jobs.registerAssetFile(path.join(tempDir, 'nonexistent.mp4'), 'video/mp4');
  }, /does not exist/);

  // 4. Invalid / unknown token
  assert.equal(jobs.getAsset('unknown-token-1234'), null);
  assert.throws(() => {
    jobs.readAssetBuffer('unknown-token-1234');
  }, /not found/);

  // 5. ensureNativeAsset from ArrayBuffer
  const dummyBuf = new Uint8Array([1, 2, 3, 4, 5]).buffer;
  const desc3 = jobs.ensureNativeAsset('item-xyz', dummyBuf);
  assert.ok(desc3.assetToken);
  assert.equal(desc3.size, 5);
  const readBuf = jobs.readAssetBuffer(desc3.assetToken);
  assert.deepEqual(Array.from(readBuf), [1, 2, 3, 4, 5]);

  // 6. Output registration
  const outputPath = path.join(tempDir, 'output.mp4');
  const outToken = jobs.registerOutput(outputPath);
  assert.ok(outToken);
  const outInfo = jobs.getOutput(outToken);
  assert.equal(outInfo.targetPath, outputPath);
  assert.equal(jobs.getOutput('invalid-output-token'), null);

  // Clean up
  jobs.cleanupAll();
  console.log('Native dialog and asset tests passed successfully.');
} finally {
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (e) {}
}
