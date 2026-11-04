const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Mock browser globals for Node.js test environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.Blob = Blob;
global.File = File;

global.J = {
  mediaLabel: (ja, en) => ja,
  mediaAssets: new Map(),
  loadMedia: async () => null,
  snapshotMediaFile: async (file) => file,
  personMaskReferences: (project) => [],
  personMaskBlob: async () => null,
  readFontFile: async () => null,
  defaultProject: () => ({
    lyrics: '',
    media: { items: [], cutOverrides: {} },
    foreground: { items: [], cutOverrides: {} },
    fx: {}
  }),
  normalizeMedia: () => ({ items: [], cutOverrides: {} }),
  normalizeAvoidance: () => ({}),
  normalizeAvoidanceMask: () => ({}),
  mediaEffectSettings: () => ({}),
  parseLyrics: () => ({ lines: [] }),
  importCustomEffects: () => {}
};

// Load src/11b_project_file.js
const projectFileCode = fs.readFileSync(path.join(__dirname, '..', 'src', '11b_project_file.js'), 'utf-8');
new Function(projectFileCode)();

async function runTest() {
  const sampleMediaBlob = new Blob(['sample video data'], { type: 'video/mp4' });
  const sampleAudioBlob = new Blob(['sample audio data'], { type: 'audio/wav' });

  global.J.mediaAssets.set('item-1', { file: sampleMediaBlob });

  const sampleProject = {
    version: 1,
    title: 'Test Song',
    artist: 'Test Artist',
    lyrics: '[00:00]Hello World',
    projectName: 'my_song_project',
    media: {
      items: [
        { id: 'item-1', name: 'video.mp4', type: 'video', size: sampleMediaBlob.size }
      ],
      cutOverrides: {}
    },
    foreground: {
      items: [],
      cutOverrides: {}
    },
    audioAsset: {
      id: 'audio-1',
      name: 'music.wav',
      type: 'audio/wav',
      size: sampleAudioBlob.size
    }
  };

  // Pack project to portable container
  const packedBlob = await global.J.packProject(sampleProject, sampleAudioBlob);
  assert.ok(packedBlob instanceof Blob, 'packProject should return a Blob');

  // Verify manifest contents
  const buffer = Buffer.from(await packedBlob.arrayBuffer());
  const magic = buffer.subarray(0, 8).toString('utf-8');
  assert.equal(magic, 'JIZURA01', 'Magic header must match JIZURA01');

  const manifestLen = buffer.readUInt32LE(8);
  const manifestJson = buffer.subarray(12, 12 + manifestLen).toString('utf-8');
  const manifest = JSON.parse(manifestJson);

  assert.equal(manifest.format, 'jizura');
  assert.equal(manifest.version, 1);
  assert.equal(manifest.project.title, 'Test Song');

  // Strict token and environment isolation assertions
  assert.ok(!manifestJson.includes('assetToken'), 'Project manifest must not contain assetToken');
  assert.ok(!manifestJson.includes('outputToken'), 'Project manifest must not contain outputToken');
  assert.ok(!manifestJson.includes('jobId'), 'Project manifest must not contain jobId');
  assert.ok(!manifestJson.includes('C:\\'), 'Project manifest must not contain absolute Windows paths');
  assert.ok(!manifestJson.includes('/Users/'), 'Project manifest must not contain absolute POSIX paths');
  assert.ok(!manifestJson.includes('\\Users\\'), 'Project manifest must not contain absolute Windows user paths');

  // Test unpack
  const unpacked = await global.J.unpackProject(packedBlob);
  assert.equal(unpacked.project.title, 'Test Song');
  assert.equal(unpacked.files.length, 2);
  assert.equal(unpacked.files[0].name, 'video.mp4');
  assert.equal(unpacked.files[1].name, 'music.wav');

  console.log('Portable project pack/unpack and token isolation tests passed successfully.');
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});