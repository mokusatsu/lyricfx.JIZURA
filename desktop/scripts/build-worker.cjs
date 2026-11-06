#!/usr/bin/env node
const { spawnSync, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const validBackends = ['openvino', 'directml', 'cuda', 'cpu'];

// Extract backend and options from CLI args
let selectedBackend = process.env.JIZURA_BACKEND || 'openvino';
let autoInstall = process.env.JIZURA_AUTO_INSTALL === '1';
let skipPostVerify = false;

for (const arg of process.argv.slice(2)) {
  if (arg.startsWith('--backend=')) {
    selectedBackend = arg.split('=')[1].toLowerCase();
  } else if (arg === '--install') {
    autoInstall = true;
  } else if (arg === '--skip-verify') {
    skipPostVerify = true;
  } else if (!arg.startsWith('-') && validBackends.includes(arg.toLowerCase())) {
    selectedBackend = arg.toLowerCase();
  }
}

if (!validBackends.includes(selectedBackend)) {
  console.error(`[!] Invalid backend '${selectedBackend}'. Supported backends: ${validBackends.join(', ')}`);
  process.exit(1);
}

console.log(`[JIZURA] Target backend: ${selectedBackend.toUpperCase()}`);

const desktopDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(desktopDir, '..');
const specPath = path.resolve(repoRoot, 'native/worker.spec');
const distPath = path.resolve(desktopDir, 'resources/native');
const workPath = path.resolve(desktopDir, 'build/worker');
const reqFile = path.resolve(repoRoot, `native/requirements-${selectedBackend}.lock`);

// Helper to check if current python environment satisfies backend
function checkPythonBackend(backend) {
  const code = `
import sys, os
sys.path.insert(0, 'native')

def verify(backend):
    backend = backend.lower()
    import onnxruntime as ort

    if backend == 'cpu':
        return True

    if backend == 'directml':
        return 'DmlExecutionProvider' in ort.get_available_providers()

    if backend == 'cuda':
        return 'CUDAExecutionProvider' in ort.get_available_providers()

    if backend == 'openvino':
        try:
            import onnxruntime_ep_openvino as ep
            lib_path = ep.get_library_path()
            if not os.path.exists(lib_path):
                sys.stderr.write(f"[OpenVINO-EP] Plugin library file not found: {lib_path}\\n")
                sys.stderr.flush()
                return False
        except ImportError as e:
            sys.stderr.write(f"[OpenVINO-EP] ImportError onnxruntime_ep_openvino: {e}\\n")
            sys.stderr.flush()
            return False

        from matting import _init_openvino_ep
        ok = _init_openvino_ep()
        if not ok:
            sys.stderr.write(f"[OpenVINO-EP] _init_openvino_ep() returned False. Available providers: {ort.get_available_providers()}\\n")
            sys.stderr.flush()
        return ok

    return False

backend_arg = sys.argv[1] if len(sys.argv) > 1 else 'openvino'
if verify(backend_arg):
    sys.stdout.write('OK')
    sys.exit(0)
else:
    sys.exit(1)
`;
  try {
    const res = spawnSync('python', ['-c', code, backend], {
      cwd: repoRoot,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, JIZURA_DEBUG: '1' }
    });
    if (res.stderr && res.stderr.trim()) {
      console.warn(`[JIZURA-PROBE] Python stderr:\n${res.stderr.trim()}`);
    }
    return res.status === 0 && res.stdout.trim() === 'OK';
  } catch (e) {
    console.warn(`[JIZURA-PROBE] Exception running python probe: ${e.message}`);
    return false;
  }
}

// 1. Pre-build validation & optional auto-installation
console.log(`[JIZURA] Checking Python environment for ${selectedBackend.toUpperCase()} support...`);
let isReady = checkPythonBackend(selectedBackend);

if (!isReady) {
  if (autoInstall) {
    if (fs.existsSync(reqFile)) {
      console.log(`[JIZURA] Installing required dependencies from ${path.basename(reqFile)}...`);
      const pipRes = spawnSync('python', ['-m', 'pip', 'install', '-r', reqFile], {
        cwd: repoRoot,
        stdio: 'inherit'
      });
      if (pipRes.status !== 0) {
        console.error(`[!] Failed to install dependencies for ${selectedBackend}.`);
        process.exit(1);
      }
      isReady = checkPythonBackend(selectedBackend);
    } else {
      console.error(`[!] Requirements file not found: ${reqFile}`);
      process.exit(1);
    }
  }

  if (!isReady) {
    console.error(`\n[ERROR] Current Python environment does not have ${selectedBackend.toUpperCase()} execution provider enabled!`);
    console.error(`To fix this, install the required dependencies first:`);
    console.error(`  python -m pip install -r native/requirements-${selectedBackend}.lock`);
    console.error(`Or run with --install to install automatically:`);
    console.error(`  npm run build:worker -- --backend=${selectedBackend} --install\n`);
    process.exit(1);
  }
}
console.log(`[JIZURA] Python environment check passed for ${selectedBackend.toUpperCase()}.`);

// 2. PyInstaller execution
console.log(`[JIZURA] Building native worker binary with PyInstaller...`);
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

const pyInstallerCmd = process.platform === 'win32' ? 'pyinstaller.exe' : 'pyinstaller';

const result = spawnSync(pyInstallerCmd, pyArgs, {
  cwd: desktopDir,
  env,
  stdio: 'inherit'
});

if (result.status !== 0) {
  console.error(`[!] PyInstaller build failed with code ${result.status}`);
  process.exit(result.status || 1);
}

// 3. Post-build verification: execute built worker binary and assert target backend is present
if (!skipPostVerify) {
  console.log(`[JIZURA] Running post-build verification on generated worker binary...`);
  const workerExeName = process.platform === 'win32' ? 'worker.exe' : 'worker';
  const workerExePath = path.join(distPath, 'worker', workerExeName);

  if (!fs.existsSync(workerExePath)) {
    console.error(`[!] Generated worker executable not found at: ${workerExePath}`);
    process.exit(1);
  }

  try {
    const probeOutput = execFileSync(workerExePath, ['probe'], {
      encoding: 'utf-8',
      timeout: 10000,
      windowsHide: true
    });
    const parsed = JSON.parse(probeOutput.trim());
    const reportedBackends = (parsed.backends || []).map(b => b.toLowerCase());

    console.log(`[JIZURA] Worker probe reported backends: [${reportedBackends.join(', ')}]`);

    if (!reportedBackends.includes(selectedBackend.toLowerCase())) {
      console.error(`\n[FATAL] Post-build verification failed!`);
      console.error(`Target backend '${selectedBackend}' is NOT reported by the generated worker binary.`);
      console.error(`Reported backends: [${reportedBackends.join(', ')}]`);
      console.error(`Ensure your Python environment and worker.spec properly bundle the required runtime libraries.\n`);
      process.exit(1);
    }

    console.log(`[SUCCESS] Verified: generated worker binary successfully exposes '${selectedBackend.toUpperCase()}'.`);
  } catch (err) {
    console.error(`[!] Post-build probe execution failed: ${err.message}`);
    process.exit(1);
  }
}

console.log(`[JIZURA] Native worker build and verification completed successfully for ${selectedBackend.toUpperCase()}.`);
