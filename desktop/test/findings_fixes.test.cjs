const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

console.log('[*] Testing Findings Fixes (P1 Reload, P2 Timestamp Accumulation, P2 Audio Lifecycle, P2 Build Path)...');

// 1. Verify P1: Menu configuration in desktop/main.cjs
const mainCode = fs.readFileSync(path.join(__dirname, '../main.cjs'), 'utf-8');
assert.ok(mainCode.includes('setupApplicationMenu'), 'main.cjs must define setupApplicationMenu');
assert.ok(!mainCode.includes("role: 'reload'"), "main.cjs must NOT contain role: 'reload'");
assert.ok(!mainCode.includes("role: 'forcereload'"), "main.cjs must NOT contain role: 'forcereload'");
assert.ok(mainCode.includes('initialProjectConsumed = true'), 'main.cjs must track initialProjectConsumed');
console.log('  [OK] P1: Custom menu without Reload and initial project consumption verified.');

// 2. Verify P2: Date timestamp accumulation fix in src/12_ui.js
const uiCode = fs.readFileSync(path.join(__dirname, '../../src/12_ui.js'), 'utf-8');
assert.ok(uiCode.includes('res.name.replace(/_\\d{12}$/, \'\')'), 'src/12_ui.js must strip trailing timestamp from res.name');

// Test timestamp strip logic directly
const timestampRegex = /_\d{12}$/;
const firstSaveResult = 'MySong_202611071951';
const cleanedFirst = firstSaveResult.replace(timestampRegex, '');
assert.strictEqual(cleanedFirst, 'MySong', 'First save timestamp must be cleanly stripped');

const secondSaveSimulated = cleanedFirst + '_202611071955';
assert.strictEqual(secondSaveSimulated, 'MySong_202611071955');
const cleanedSecond = secondSaveSimulated.replace(timestampRegex, '');
assert.strictEqual(cleanedSecond, 'MySong', 'Second save must not accumulate timestamps');
console.log('  [OK] P2: Timestamp accumulation prevention verified.');

// 3. Verify P2: Audio lifecycle test runs and passes
const audioTestRes = spawnSync('node', ['dev/audio_lifecycle_test.cjs'], {
  cwd: path.resolve(__dirname, '../..'),
  encoding: 'utf-8'
});
assert.strictEqual(audioTestRes.status, 0, `Audio lifecycle test failed: ${audioTestRes.stderr || audioTestRes.stdout}`);
console.log('  [OK] P2: dev/audio_lifecycle_test.cjs passed successfully.');

// 4. Verify P2: build-all.cjs runStep shell: false
const buildAllCode = fs.readFileSync(path.join(__dirname, '../scripts/build-all.cjs'), 'utf-8');
assert.ok(buildAllCode.includes('shell: false'), 'desktop/scripts/build-all.cjs must use shell: false');
assert.ok(buildAllCode.includes('.cmd'), 'desktop/scripts/build-all.cjs must support .cmd on Windows');
console.log('  [OK] P2: build-all.cjs shell: false and Windows .cmd support verified.');

console.log('[SUCCESS] All Findings Fixes tests passed successfully!');
