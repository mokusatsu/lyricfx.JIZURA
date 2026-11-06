#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const desktopDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(desktopDir, '..');

let backend = 'openvino';
let makeDist = false;

for (const arg of process.argv.slice(2)) {
  if (arg.startsWith('--backend=')) {
    backend = arg.split('=')[1].toLowerCase();
  } else if (arg === '--dist') {
    makeDist = true;
  } else if (['openvino', 'directml', 'cuda', 'cpu'].includes(arg.toLowerCase())) {
    backend = arg.toLowerCase();
  }
}

console.log('====================================================');
console.log(`[BUILD-ALL] Starting clean build for backend: ${backend.toUpperCase()}`);
console.log('====================================================');

function runStep(cmd, args, cwd = repoRoot) {
  console.log(`\n[*] Running: ${cmd} ${args.join(' ')} (in ${cwd})`);
  const res = spawnSync(cmd, args, { cwd, stdio: 'inherit', shell: true });
  if (res.status !== 0) {
    console.error(`\n[FATAL] Step failed with exit code ${res.status}: ${cmd} ${args.join(' ')}`);
    process.exit(res.status || 1);
  }
}

// 1. Clean previous build artifacts
console.log('\n[1/5] Cleaning old artifacts...');
const dirsToClean = [
  path.resolve(desktopDir, 'dist'),
  path.resolve(desktopDir, 'build'),
  path.resolve(desktopDir, 'web'),
  path.resolve(desktopDir, 'resources/native/worker'),
  path.resolve(repoRoot, 'native/dist'),
  path.resolve(repoRoot, 'native/build')
];

for (const d of dirsToClean) {
  if (fs.existsSync(d)) {
    console.log(`  Removing ${d}...`);
    fs.rmSync(d, { recursive: true, force: true });
  }
}

// 2. Build Electron web runtime from src/
console.log('\n[2/5] Building Web assets from src/...');
runStep('python', ['build.py', '--target', 'electron'], repoRoot);
const indexHtml = path.resolve(desktopDir, 'web/index.html');
if (!fs.existsSync(indexHtml)) {
  console.error(`[FATAL] web/index.html was not generated!`);
  process.exit(1);
}

// 3. Build native worker without models
console.log('\n[3/5] Building native worker without models...');
const buildWorkerScript = path.resolve(desktopDir, 'scripts/build-worker.cjs');
runStep('node', [buildWorkerScript, `--backend=${backend}`, '--install'], desktopDir);

// Verify worker does NOT contain models
const workerInternalModels = path.resolve(desktopDir, 'resources/native/worker/_internal/models');
const workerModels = path.resolve(desktopDir, 'resources/native/worker/models');
if (fs.existsSync(workerInternalModels) || fs.existsSync(workerModels)) {
  console.error('[FATAL] Native worker unexpectedly contains models directory!');
  process.exit(1);
}

// 4. Generate app-build.json and collect licenses
console.log('\n[4/5] Preparing app-build.json and licenses...');
const prepareScript = path.resolve(desktopDir, 'scripts/prepare-resources.cjs');
runStep('node', [prepareScript], desktopDir);

const buildMetaPath = path.resolve(desktopDir, 'resources/app-build.json');
if (!fs.existsSync(buildMetaPath)) {
  console.error('[FATAL] app-build.json was not generated!');
  process.exit(1);
}

// 5. Package desktop application
console.log('\n[5/5] Packaging desktop distribution...');
const builderArgs = makeDist ? ['electron-builder'] : ['electron-builder', '--dir'];
runStep('npx', builderArgs, desktopDir);

// 6. Post-verification of unpacked distribution
const unpackedResources = path.resolve(desktopDir, 'dist/win-unpacked/resources');
if (!makeDist || fs.existsSync(unpackedResources)) {
  console.log('\n[*] Verifying win-unpacked resources structure...');
  const appAsar = path.resolve(unpackedResources, 'app.asar');
  const appBuildJson = path.resolve(unpackedResources, 'app-build.json');
  const licenses = path.resolve(unpackedResources, 'licenses');
  const workerExe = path.resolve(unpackedResources, 'native/worker/worker.exe');
  const unpackedModels1 = path.resolve(unpackedResources, 'native/models');
  const unpackedModels2 = path.resolve(unpackedResources, 'native/worker/models');
  const unpackedModels3 = path.resolve(unpackedResources, 'native/worker/_internal/models');

  if (!fs.existsSync(appAsar)) {
    console.error('[FATAL] win-unpacked/resources/app.asar is missing!');
    process.exit(1);
  }
  if (!fs.existsSync(appBuildJson)) {
    console.error('[FATAL] win-unpacked/resources/app-build.json is missing!');
    process.exit(1);
  }
  if (!fs.existsSync(licenses)) {
    console.error('[FATAL] win-unpacked/resources/licenses is missing!');
    process.exit(1);
  }
  if (!fs.existsSync(workerExe)) {
    console.error('[FATAL] win-unpacked/resources/native/worker/worker.exe is missing!');
    process.exit(1);
  }
  if (fs.existsSync(unpackedModels1) || fs.existsSync(unpackedModels2) || fs.existsSync(unpackedModels3)) {
    console.error('[FATAL] win-unpacked contains models! Models must not be bundled in distribution.');
    process.exit(1);
  }
  console.log('[SUCCESS] All distribution verification checks passed! No models bundled.');
}

console.log('\n====================================================');
console.log('[BUILD-ALL] Completed successfully.');
console.log('====================================================');
