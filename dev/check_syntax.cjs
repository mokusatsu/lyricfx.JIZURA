const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');

function checkFile(filePath) {
  try {
    execFileSync(process.execPath, ['--check', filePath], { stdio: 'pipe' });
    return true;
  } catch (err) {
    console.error(`Syntax error in ${filePath}:`, err.stderr ? err.stderr.toString() : err.message);
    return false;
  }
}

let failed = 0;
let checked = 0;

function checkDir(dir, pattern = /\.(js|cjs|mjs)$/) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', 'dist'].includes(entry.name)) continue;
      checkDir(full, pattern);
    } else if (pattern.test(entry.name)) {
      checked++;
      if (!checkFile(full)) failed++;
    }
  }
}

// 1. Check all src/*.js
checkDir(path.join(ROOT, 'src'));

// 2. Check desktop scripts
checkDir(path.join(ROOT, 'desktop'), /\.(cjs|js)$/);

// 3. Check dev scripts
checkDir(path.join(ROOT, 'dev'), /\.(cjs|js|mjs)$/);

console.log(`Checked ${checked} JavaScript files. Failures: ${failed}`);
if (failed > 0) {
  process.exit(1);
}
