const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('[*] Testing Platform UI Selectors (Web vs Desktop)...');

const rootDir = path.resolve(__dirname, '../..');

// 1. Verify index.html (Web Japanese)
const webJa = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
assert.ok(/<html[^>]*class="[^"]*\bis-web\b[^"]*"/.test(webJa), 'index.html must have class="is-web"');
assert.ok(!/<html[^>]*class="[^"]*\bis-desktop\b[^"]*"/.test(webJa), 'index.html must NOT have class="is-desktop"');
assert.ok(webJa.includes('html.is-web .desktop-only'), 'index.html must include .desktop-only CSS rule');
assert.ok(/id="eEncoderField"[^>]*class="[^"]*\bdesktop-only\b[^"]*"|class="[^"]*\bdesktop-only\b[^"]*"[^>]*id="eEncoderField"/.test(webJa), 'eEncoderField must have desktop-only class');
assert.ok(/id="outEncoderField"[^>]*class="[^"]*\bdesktop-only\b[^"]*"|class="[^"]*\bdesktop-only\b[^"]*"[^>]*id="outEncoderField"/.test(webJa), 'outEncoderField must have desktop-only class');

// 2. Verify en/index.html (Web English)
const webEn = fs.readFileSync(path.join(rootDir, 'en/index.html'), 'utf-8');
assert.ok(/<html[^>]*class="[^"]*\bis-web\b[^"]*"/.test(webEn), 'en/index.html must have class="is-web"');
assert.ok(!/<html[^>]*class="[^"]*\bis-desktop\b[^"]*"/.test(webEn), 'en/index.html must NOT have class="is-desktop"');
assert.ok(webEn.includes('html.is-web .desktop-only'), 'en/index.html must include .desktop-only CSS rule');

// 3. Verify desktop/web/index.html (Electron Japanese)
const elJa = fs.readFileSync(path.join(rootDir, 'desktop/web/index.html'), 'utf-8');
assert.ok(/<html[^>]*class="[^"]*\bis-desktop\b[^"]*"/.test(elJa), 'desktop/web/index.html must have class="is-desktop"');
assert.ok(!/<html[^>]*class="[^"]*\bis-web\b[^"]*"/.test(elJa), 'desktop/web/index.html must NOT have class="is-web"');

// 4. Verify desktop/web/en/index.html (Electron English)
const elEn = fs.readFileSync(path.join(rootDir, 'desktop/web/en/index.html'), 'utf-8');
assert.ok(/<html[^>]*class="[^"]*\bis-desktop\b[^"]*"/.test(elEn), 'desktop/web/en/index.html must have class="is-desktop"');
assert.ok(!/<html[^>]*class="[^"]*\bis-web\b[^"]*"/.test(elEn), 'desktop/web/en/index.html must NOT have class="is-web"');

// 5. Verify desktop/web/app.css
const appCss = fs.readFileSync(path.join(rootDir, 'desktop/web/app.css'), 'utf-8');
assert.ok(appCss.includes('html.is-web .desktop-only'), 'app.css must include html.is-web .desktop-only');
assert.ok(appCss.includes('html.is-desktop .web-only'), 'app.css must include html.is-desktop .web-only');

console.log('[SUCCESS] All Platform UI Selector tests passed successfully!');
