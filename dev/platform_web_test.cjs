const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Test 1: Verify index.html contains J.platform browser definition
const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');
const enIndexHtml = fs.readFileSync(path.join(__dirname, '..', 'en', 'index.html'), 'utf-8');

assert.ok(indexHtml.includes('J.platform = {'), 'index.html must define J.platform');
assert.ok(enIndexHtml.includes('J.platform = {'), 'en/index.html must define J.platform');
assert.ok(indexHtml.includes("name: 'browser'"), 'index.html must set browser platform name');
assert.ok(indexHtml.includes("nativeMatting: false"), 'Web edition must have nativeMatting: false');
assert.ok(indexHtml.includes("nativeExport: false"), 'Web edition must have nativeExport: false');

// Ensure no Node.js or Electron leaked into web output
assert.ok(!indexHtml.includes("require('electron')"), 'Web edition must not require electron');
assert.ok(!indexHtml.includes("contextBridge.exposeInMainWorld"), 'Web edition must not include contextBridge');

// Test 2: In-memory evaluation of src/01b_platform.js
const mockWindow = {};
const mockJ = { PERSON_MODEL: { id: 'rvm' } };
const platformCode = fs.readFileSync(path.join(__dirname, '..', 'src', '01b_platform.js'), 'utf-8');
const fn = new Function('window', 'J', platformCode);
fn(mockWindow, mockJ);

assert.ok(mockJ.platform, 'mockJ.platform should be populated');
assert.equal(mockJ.platform.name, 'browser');
assert.equal(mockJ.platform.nativeMatting, false);
assert.equal(mockJ.platform.nativeExport, false);
assert.equal(mockJ.platform.personModelProfile(), 'rvm');

mockJ.platform.capabilities().then(caps => {
  assert.equal(caps.version, 1);
  assert.equal(caps.nativeMatting, false);
  assert.equal(caps.nativeExport, false);
  assert.deepEqual(caps.backends, ['browser']);
  console.log('Platform Web tests passed successfully.');
}).catch(err => {
  console.error(err);
  process.exit(1);
});
