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
  const sourceUrl = require('url').pathToFileURL(unicodeFile).toString();
  assert.ok(sourceUrl.includes('%23'), 'Hash (#) in source path must be URL-escaped to %23');
  assert.ok(sourceUrl.includes('%25'), 'Percent (%) in source path must be URL-escaped to %25');

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

  // 7. Video isolation test: source video modification must not affect cached asset
  const sourceVideo = path.join(tempDir, 'source_original.mp4');
  fs.writeFileSync(sourceVideo, Buffer.from('ORIGINAL_VIDEO_CONTENT'));
  const descVid = jobs.registerAssetFile(sourceVideo, 'video/mp4');
  const assetVid = jobs.getAsset(descVid.assetToken);
  assert.notEqual(assetVid.filePath, sourceVideo, 'Registered video must be copied into cache directory');
  assert.equal(fs.readFileSync(assetVid.filePath).toString(), 'ORIGINAL_VIDEO_CONTENT');

  // Now modify source video externally
  fs.writeFileSync(sourceVideo, Buffer.from('MODIFIED_EXTERNAL_CONTENT'));
  // Cached asset file must STILL have original content
  assert.equal(fs.readFileSync(assetVid.filePath).toString(), 'ORIGINAL_VIDEO_CONTENT', 'Cached video content must remain intact when source is modified');

  // 8. Chunked asset upload test
  const chunkToken = jobs.startChunkedAsset('large_test.mp4', 'video/mp4');
  assert.ok(chunkToken);
  jobs.appendAssetChunk(chunkToken, Buffer.from('CHUNK_PART_1_'));
  jobs.appendAssetChunk(chunkToken, Buffer.from('CHUNK_PART_2'));
  const finishedDesc = jobs.finishChunkedAsset(chunkToken);
  assert.equal(finishedDesc.size, 25);
  const chunkAsset = jobs.getAsset(chunkToken);
  assert.equal(fs.readFileSync(chunkAsset.filePath).toString(), 'CHUNK_PART_1_CHUNK_PART_2');

  // 9. Atomic project save simulation (temporary file rename pattern)
  const targetProject = path.join(tempDir, 'my_project.lyricfx');
  fs.writeFileSync(targetProject, Buffer.from('ORIGINAL_PROJECT_DATA'));

  // Simulate write failure on temporary file
  const tmpProj = path.join(tempDir, '.tmp_proj_sim.part');
  fs.writeFileSync(tmpProj, Buffer.from('PARTIAL_CORRUPT_DATA'));
  // Error occurs before atomic rename -> tmp is removed, targetProject untouched!
  fs.unlinkSync(tmpProj);
  assert.equal(fs.readFileSync(targetProject).toString(), 'ORIGINAL_PROJECT_DATA', 'Original project must not be corrupted on write failure');

  // Successful atomic save
  fs.writeFileSync(tmpProj, Buffer.from('NEW_VALID_PROJECT_DATA'));
  fs.renameSync(tmpProj, targetProject);
  assert.equal(fs.readFileSync(targetProject).toString(), 'NEW_VALID_PROJECT_DATA');

  // Clean up
  jobs.cleanupAll();
  console.log('Native dialog and asset tests passed successfully.');
} finally {
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (e) {}
}
