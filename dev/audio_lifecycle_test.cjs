const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Mock browser globals for Node.js test environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.Blob = Blob;
global.File = File;

const mediaStore = new Map();

// Load real project pack/unpack implementation from src/11b_project_file.js
const projectFileCode = fs.readFileSync(path.join(__dirname, '..', 'src', '11b_project_file.js'), 'utf-8');

// Load src/12_ui.js to extract real undo, project, and audio restore functions
const uiCode = fs.readFileSync(path.join(__dirname, '..', 'src', '12_ui.js'), 'utf-8');

// Create test environment
const domElements = new Map();
function getEl(id) {
  if (!domElements.has(id)) {
    domElements.set(id, {
      value: '',
      textContent: '',
      hidden: false,
      setAttribute: () => {},
      addEventListener: () => {},
      closest: () => ({ addEventListener: () => {} })
    });
  }
  return domElements.get(id);
}

const sandbox = {
  window: {
    addEventListener: () => {},
    localStorage: { setItem: () => {}, getItem: () => null }
  },
  document: {
    getElementById: getEl,
    querySelector: () => null,
    querySelectorAll: () => []
  },
  $: getEl,
  console,
  Math,
  Number,
  Object,
  Array,
  JSON,
  TextEncoder,
  TextDecoder,
  Blob,
  File,
  Uint8Array,
  DataView,
  setTimeout,
  clearTimeout,
  performance: { now: () => Date.now() },
  crypto: { randomUUID: () => 'uuid-' + Math.random().toString(36).slice(2) }
};

const context = vm.createContext(sandbox);

// Setup J namespace and minimal mocks required by 12_ui.js audio and undo functions
context.J = {
  mediaLabel: (ja, en) => ja,
  mediaAssets: new Map(),
  loadMedia: async (id) => mediaStore.get(id) || null,
  storeMedia: async (id, blob) => { mediaStore.set(id, blob); },
  snapshotMediaFile: async (file) => file,
  personMaskReferences: () => [],
  personMaskBlob: async () => null,
  readFontFile: async () => null,
  defaultProject: () => ({
    title: '',
    artist: '',
    lyrics: '',
    timing: {},
    enabled: {},
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
  shortExportSettings: (s) => s || {},
  validateCustomEffects: (c) => c || [],
  activateCustomEffects: () => {},
  lyricEffectSettings: () => ({}),
  themeIds: () => [],
  normalizeEffectFavorites: (f) => f || [],
  combineCustomEffects: (a, b) => a || [],
  plan: () => ({ duration: 10, media: { cuts: [] } }),
  normalizeColorTheme: (t) => t || {},
  setCompositeFonts: () => {},
  migrateLyricCompositing: () => {},
  addUserFont: () => {},
  clamp: (v, min, max) => Math.max(min, Math.min(max, v)),
  outputSize: () => [1920, 1080],
  fmtTime: () => '00:00',
  analyzeAudio: async (file) => ({
    duration: 10.0,
    bpm: 120,
    buffer: { numberOfChannels: 2, sampleRate: 48000, duration: 10.0 }
  }),
  FONTS: {}
};

// Execute src/11b_project_file.js in context
vm.runInContext(projectFileCode, context);

// Extract and bind real UI helper functions from src/12_ui.js
// 1. mergeProject
const mergeProjectMatch = uiCode.match(/function mergeProject\([a-zA-Z0-9_]*\) \{[\s\S]*?\n\}/);
assert.ok(mergeProjectMatch, 'mergeProject must exist in src/12_ui.js');
vm.runInContext(mergeProjectMatch[0], context);

// 2. Global state S, U (Undo), H (History)
vm.runInContext(`
globalThis.NO_AUDIO_LABEL = '曲なし';
globalThis.LS_KEY = 'jizura_test_project';
globalThis.fontKey = '';
globalThis.replanTimer = 0;
globalThis.saveTimer = 0;
globalThis.S = {
  project: J.defaultProject(),
  audio: null,
  audioFile: null,
  audioAssetId: null,
  audioLoad: 0,
  plan: { duration: 10 },
  areaEdit: false
};
globalThis.U = { list: [], i: -1, restoring: false, pendingGroup: null, lastGroup: null };
globalThis.H = { list: [], i: -1 };

globalThis.migrateLyricBlankCuts = function(p) { return p; };
globalThis.pause = function() {};
globalThis.syncTapButtons = function() {};
globalThis.cancelAreaEditor = function() {};
globalThis.restoreMediaElements = function() {};
globalThis.syncUI = function() {};
globalThis.replan = function() {};
globalThis.flushSave = function() {};
globalThis.updateUndoButtons = function() {};
globalThis.ensureFonts = function() {};
globalThis.setTimelineZoom = function() {};
globalThis.toast = function() {};
globalThis.cleanupDeletedMedia = function() {};
globalThis.releaseProjectAssets = function() {};

globalThis.initUndo = function() {
  U.list = [JSON.stringify(S.project)];
  U.i = 0;
  updateUndoButtons();
};

globalThis.recordUndoState = function() {
  if (U.restoring) return;
  const snap = JSON.stringify(S.project);
  if (U.list[U.i] === snap) return;
  U.list = U.list.slice(0, U.i + 1);
  U.list.push(snap);
  if (U.list.length > 50) U.list.shift();
  U.i = U.list.length - 1;
  updateUndoButtons();
};

globalThis.commit = function() {
  recordUndoState();
};
`, context);

// 3. Bind real undoMove, refreshAudioName, replaceProject, restoreAudioAsset directly from 12_ui.js
const undoMoveMatch = uiCode.match(/function undoMove\(direction\) \{[\s\S]*?\n\}/);
const refreshAudioNameMatch = uiCode.match(/function refreshAudioName\(\) \{[\s\S]*?\n\}/);
const restoreAudioAssetMatch = uiCode.match(/async function restoreAudioAsset\(\) \{[\s\S]*?\n\}/);
const replaceProjectMatch = uiCode.match(/function replaceProject\(project, audio, audioFile, assets\) \{[\s\S]*?\n\}/);

assert.ok(undoMoveMatch, 'undoMove must exist in src/12_ui.js');
assert.ok(refreshAudioNameMatch, 'refreshAudioName must exist in src/12_ui.js');
assert.ok(restoreAudioAssetMatch, 'restoreAudioAsset must exist in src/12_ui.js');
assert.ok(replaceProjectMatch, 'replaceProject must exist in src/12_ui.js');

vm.runInContext(undoMoveMatch[0], context);
vm.runInContext(refreshAudioNameMatch[0], context);
vm.runInContext(restoreAudioAssetMatch[0], context);
vm.runInContext(replaceProjectMatch[0], context);

async function runTest() {
  console.log('Testing Audio Lifecycle: real undoMove and restoreAudioAsset integration...');

  // Initialize Project with initial state
  context.initUndo();
  assert.equal(context.U.i, 0);

  // 1. Simulate import of Video A as song
  const videoA = new File([Buffer.from('VIDEO_A_ORIGINAL_CONTAINER_STREAM_BYTES')], 'videoA.mp4', { type: 'video/mp4' });
  const audioAssetA = { id: 'audio_1', name: videoA.name, type: videoA.type };
  await context.J.storeMedia(audioAssetA.id, videoA);

  const projectA = context.mergeProject({
    title: 'Song A',
    lyrics: '[00:00]Song A',
    audioAsset: audioAssetA
  });

  const audioA = await context.J.analyzeAudio(videoA);
  context.replaceProject(projectA, audioA, videoA, new Map());

  assert.equal(context.S.project.title, 'Song A');
  assert.equal(context.S.project.audioAsset.id, 'audio_1');
  assert.equal(context.S.audioFile.name, 'videoA.mp4');
  assert.equal(context.S.audioAssetId, 'audio_1');

  // 2. Next, import Video B as song (user replaces song)
  const videoB = new File([Buffer.from('VIDEO_B_ORIGINAL_CONTAINER_STREAM_BYTES')], 'videoB.mp4', { type: 'video/mp4' });
  const audioAssetB = { id: 'audio_2', name: videoB.name, type: videoB.type };
  await context.J.storeMedia(audioAssetB.id, videoB);

  const audioB = await context.J.analyzeAudio(videoB);
  context.S.project.title = 'Song B';
  context.S.project.audioAsset = audioAssetB;
  context.S.audio = audioB;
  context.S.audioFile = videoB;
  context.refreshAudioName();
  context.commit(); // record in undo stack

  assert.equal(context.S.project.title, 'Song B');
  assert.equal(context.S.project.audioAsset.id, 'audio_2');
  assert.equal(context.S.audioFile.name, 'videoB.mp4');
  assert.equal(context.S.audioAssetId, 'audio_2');
  assert.equal(context.U.i, 1);

  // 3. User clicks Undo -> call real undoMove(-1)
  console.log('Executing real undoMove(-1)...');
  context.undoMove(-1);
  assert.equal(context.U.i, 0);
  assert.equal(context.S.project.title, 'Song A');
  assert.equal(context.S.project.audioAsset.id, 'audio_1');

  // Wait for async restoreAudioAsset to finish
  await new Promise(resolve => setTimeout(resolve, 50));

  // Verify that S.audioFile is restored to Video A original File!
  assert.ok(context.S.audioFile, 'S.audioFile must be restored after Undo');
  assert.equal(context.S.audioFile.name, 'videoA.mp4', 'Restored audioFile must be videoA.mp4');
  assert.equal(context.S.audioAssetId, 'audio_1');

  const restoredBytesA = Buffer.from(await context.S.audioFile.arrayBuffer()).toString('utf-8');
  assert.equal(restoredBytesA, 'VIDEO_A_ORIGINAL_CONTAINER_STREAM_BYTES', 'Audio stream must match original Video A bytes');

  // 4. Test Portable Project pack & unpack with Video A as original audio
  console.log('Testing packProject / unpackProject with video-derived audio...');
  const packedBlob = await context.J.packProject(context.S.project, context.S.audioFile);
  assert.ok(packedBlob instanceof Blob);

  const unpacked = await context.J.unpackProject(packedBlob);
  assert.equal(unpacked.project.title, 'Song A');
  assert.equal(unpacked.files.length, 1);
  assert.equal(unpacked.files[0].kind, 'audio');
  assert.equal(unpacked.files[0].name, 'videoA.mp4');
  assert.equal(unpacked.files[0].type, 'video/mp4');

  const unpackedBytes = Buffer.from(await unpacked.files[0].file.arrayBuffer()).toString('utf-8');
  assert.equal(unpackedBytes, 'VIDEO_A_ORIGINAL_CONTAINER_STREAM_BYTES', 'Portable unpack must restore exact original MP4 container');

  console.log('Real undoMove & audio lifecycle integration test passed successfully.');
}

runTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
