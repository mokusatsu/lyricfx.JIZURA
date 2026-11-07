const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const source = name => fs.readFileSync(path.join(root, name), 'utf8');

(async () => {
  const events = [], classes = new Set();
  let requestSave;
  const context = vm.createContext({ console, Blob, File, Uint8Array, Map, WeakMap, crypto, setTimeout,
    document: { documentElement: { classList: { add: value => classes.add(value), remove: value => classes.delete(value) } },
      getElementById: () => ({ click: () => events.push('save') }) },
    fetch: async () => ({ ok: true, blob: async () => new Blob(['asset']) }),
    J: {},
  });
  context.window = context;
  context.addEventListener = () => {};
  vm.runInContext(source('src/01b_platform.js'), context);
  assert.equal(context.J.platform.name, 'browser');
  assert.equal(context.J.platform.getNativeAssetToken(new Blob()), null);
  const media = source('src/08d_media.js');
  vm.runInContext(media.slice(media.indexOf('const mediaSnapshots'), media.indexOf('// If browser storage')), context);
  const snapshot = context.J.snapshotMediaFile;
  context.jizuraDesktop = {
    pickMedia: async () => [{ assetToken: 'picked', name: 'asset.png', type: 'image/png' }],
    ensureNativeAsset: async () => ({ assetToken: 'uploaded' }),
    setDirtyState: value => events.push(value),
    saveProjectFile: async () => ({ name: 'project' }),
    confirmQuit: () => events.push('quit'),
    onRequestSaveAndClose: callback => { requestSave = callback; },
  };
  vm.runInContext(source('desktop/renderer/native-backend.js'), context);
  const platform = context.J.platform;
  assert.equal(platform.name, 'desktop');
  assert.equal(context.J.snapshotMediaFile, snapshot, 'adapter leaves shared implementation intact');
  const [picked] = await platform.pickMedia();
  const copy = await snapshot(picked);
  assert.equal(platform.getNativeAssetToken(copy), 'picked');
  assert.equal(await snapshot(picked), copy, 'snapshots retain object identity');
  const file = new File(['file'], 'file.png');
  const earlyCopy = await snapshot(file);
  await platform.ensureNativeAsset('item', file);
  assert.equal(await snapshot(file), earlyCopy);
  assert.equal(platform.getNativeAssetToken(earlyCopy), 'uploaded', 'cached copies inherit late tokens');
  assert.equal(platform.getItemAssetToken('item'), 'uploaded');
  platform.clearNativeAssetCache();
  assert.equal(platform.getItemAssetToken('item'), null);
  platform.setDirtyState(true);
  requestSave();
  platform.notifyProjectSaved();
  assert.deepEqual(events, [true, 'save', false, 'quit']);
  assert(!source('src/12_ui.js').includes('window.jizuraDesktop'), 'UI uses the platform boundary');
  console.log('Platform boundary: browser fallback, file identity/tokens, cache reset, save/close passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
