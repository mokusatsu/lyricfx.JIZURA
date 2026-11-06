#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');

const validBackends = ['openvino', 'directml', 'cuda', 'rocm', 'cpu'];

// Extract backend from CLI args (e.g. node build-worker.cjs --backend=cuda OR node build-worker.cjs cuda)
let selectedBackend = process.env.JIZURA_BACKEND || 'openvino';

for (const arg of process.argv.slice(2)) {
  if (arg.startsWith('--backend=')) {
    selectedBackend = arg.split('=')[1].toLowerCase();
  } else if (!arg.startsWith('-') && validBackends.includes(arg.toLowerCase())) {
    selectedBackend = arg.toLowerCase();
  }
}

if (!validBackends.includes(selectedBackend)) {
  console.error(`[!] Invalid backend '${selectedBackend}'. Supported backends: ${validBackends.join(', ')}`);
  process.exit(1);
}

console.log(`[JIZURA] Building native worker targeting backend: ${selectedBackend.toUpperCase()}`);

const desktopDir = path.resolve(__dirname, '..');
const specPath = path.resolve(desktopDir, '../native/worker.spec');
const distPath = path.resolve(desktopDir, 'resources/native');
const workPath = path.resolve(desktopDir, 'build/worker');

const pyArgs = [
  specPath,
  '--distpath', distPath,
  '--workpath', workPath,
  '--clean',
  '-y'
];

const env = {
  ...process.env,
  JIZURA_BACKEND: selectedBackend
};

const result = spawnSync('pyinstaller', pyArgs, {
  cwd: desktopDir,
  env,
  stdio: 'inherit',
  shell: true
});

if (result.status !== 0) {
  console.error(`[!] PyInstaller build failed with code ${result.status}`);
  process.exit(result.status || 1);
}

console.log(`[JIZURA] Native worker build completed successfully for ${selectedBackend.toUpperCase()}.`);
