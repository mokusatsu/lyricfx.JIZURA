const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Mock browser globals for Node.js test environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.Blob = Blob;
global.File = File;

const mediaStore = new Map();

global.J = {
  mediaLabel: (ja, en) => ja,
  mediaAssets: new Map(),
  loadMedia: async (id) => mediaStore.get(id) || null,
  storeMedia: async (id, blob) => { mediaStore.set(id, blob); },
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
  importCustomEffects: () => {},
  analyzeAudio: async (file) => ({
    duration: 10.0,
    bpm: 120,
    buffer: { numberOfChannels: 2, sampleRate: 48000, duration: 10.0 }
  })
};

// Load src/11b_project_file.js
const projectFileCode = fs.readFileSync(path.join(__dirname, '..', 'src', '11b_project_file.js'), 'utf-8');
new Function(projectFileCode)();

async function runTest() {
  console.log('Testing Audio Lifecycle: Undo/Redo tracking and portable persistence...');

  // 1. Simulate video A import
  const videoA = new File([Buffer.from('VIDEO_A_ORIGINAL_CONTAINER_STREAM')], 'videoA.mp4', { type: 'video/mp4' });
  const audioAssetA = { id: 'audio_1', name: videoA.name, type: videoA.type };
  await global.J.storeMedia(audioAssetA.id, videoA);

  const projectA = {
    version: 1,
    title: 'Song A',
    lyrics: '[00:00]Song A',
    audioAsset: audioAssetA,
    media: { items: [], cutOverrides: {} },
    foreground: { items: [], cutOverrides: {} }
  };

  // State after importing video A
  const S = {
    project: JSON.parse(JSON.stringify(projectA)),
    audio: await global.J.analyzeAudio(videoA),
    audioFile: videoA,
    audioAssetId: audioAssetA.id
  };

  const undoList = [JSON.stringify(S.project)];
  let undoIndex = 0;

  // 2. Simulate video B import
  const videoB = new File([Buffer.from('VIDEO_B_ORIGINAL_CONTAINER_STREAM')], 'videoB.mp4', { type: 'video/mp4' });
  const audioAssetB = { id: 'audio_2', name: videoB.name, type: videoB.type };
  await global.J.storeMedia(audioAssetB.id, videoB);

  const projectB = {
    version: 1,
    title: 'Song B',
    lyrics: '[00:00]Song B',
    audioAsset: audioAssetB,
    media: { items: [], cutOverrides: {} },
    foreground: { items: [], cutOverrides: {} }
  };

  S.project = JSON.parse(JSON.stringify(projectB));
  S.audio = await global.J.analyzeAudio(videoB);
  S.audioFile = videoB;
  S.audioAssetId = audioAssetB.id;

  undoList.push(JSON.stringify(S.project));
  undoIndex = 1;

  assert.equal(S.audioFile.name, 'videoB.mp4');
  assert.equal(S.project.audioAsset.id, 'audio_2');

  // 3. Test Undo back to Song A (Simulating restoreAudioAsset on undoMove)
  undoIndex = 0;
  S.project = JSON.parse(undoList[undoIndex]);

  // When project.audioAsset.id !== S.audioAssetId, restoreAudioAsset is called
  if (S.project.audioAsset?.id !== S.audioAssetId) {
    const restoredFile = await global.J.loadMedia(S.project.audioAsset.id);
    assert.ok(restoredFile, 'Restored file must exist in media storage');
    S.audioFile = restoredFile;
    S.audio = await global.J.analyzeAudio(restoredFile);
    S.audioAssetId = S.project.audioAsset.id;
  }

  // Verify that after Undo, the export target audioFile is exactly videoA!
  assert.equal(S.audioFile.name, 'videoA.mp4', 'Undo must restore original audioFile A');
  const bufferA = Buffer.from(await S.audioFile.arrayBuffer());
  assert.equal(bufferA.toString(), 'VIDEO_A_ORIGINAL_CONTAINER_STREAM', 'Undo must restore original stream A bytes');

  // 4. Test Persistence: Save project with video-derived audio and unpack it
  const packedBlob = await global.J.packProject(S.project, S.audioFile);
  assert.ok(packedBlob instanceof Blob, 'packProject must return Blob');

  const unpacked = await global.J.unpackProject(packedBlob);
  assert.equal(unpacked.project.title, 'Song A');
  assert.equal(unpacked.files.length, 1);
  assert.equal(unpacked.files[0].kind, 'audio');
  assert.equal(unpacked.files[0].name, 'videoA.mp4');
  assert.equal(unpacked.files[0].type, 'video/mp4');

  const unpackedBuffer = Buffer.from(await unpacked.files[0].file.arrayBuffer());
  assert.equal(unpackedBuffer.toString(), 'VIDEO_A_ORIGINAL_CONTAINER_STREAM', 'Unpacked audio file must preserve original MP4 bytes');

  console.log('Audio lifecycle test passed successfully.');
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
