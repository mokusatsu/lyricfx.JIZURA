const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawn, execFile } = require('node:child_process');

class NativeJobs {
  constructor(options = {}) {
    this.appDataDir = options.appDataDir || path.join(os.tmpdir(), 'jizura_desktop_' + process.pid);
    this.tempDir = path.join(this.appDataDir, 'jobs');
    this.cacheDir = path.join(this.appDataDir, 'assets');
    fs.mkdirSync(this.tempDir, { recursive: true });
    fs.mkdirSync(this.cacheDir, { recursive: true });

    this.assets = new Map(); // token -> { filePath, name, type, size }
    this.outputs = new Map(); // token -> { targetPath }
    this.mattes = new Map(); // maskToken -> { filePath, meta }
    this.jobs = new Map(); // jobId -> jobState

    this.pythonPath = this._resolvePython();
  }

  _resolvePython() {
    if (process.env.JIZURA_PYTHON && fs.existsSync(process.env.JIZURA_PYTHON)) {
      return process.env.JIZURA_PYTHON;
    }
    // Check bundled resources path
    const resourcesPath = process.resourcesPath || path.join(__dirname, '..');
    const bundledNative = path.join(resourcesPath, 'native', process.platform === 'win32' ? 'python.exe' : 'python3');
    if (fs.existsSync(bundledNative)) {
      return bundledNative;
    }
    // Fall back to system python
    return process.platform === 'win32' ? 'python' : 'python3';
  }

  async getCapabilities() {
    const python = this.pythonPath;
    const workerScript = path.join(__dirname, '..', 'native', 'worker.py');

    if (!fs.existsSync(workerScript)) {
      return {
        version: 1,
        name: 'desktop',
        nativeMatting: false,
        nativeExport: false,
        backends: ['cpu'],
        encoders: ['libx264']
      };
    }

    return new Promise((resolve) => {
      execFile(python, [workerScript, 'probe'], { timeout: 10000 }, (err, stdout) => {
        if (err) {
          console.warn('Worker probe failed, falling back to CPU defaults:', err.message);
          return resolve({
            version: 1,
            name: 'desktop',
            nativeMatting: true,
            nativeExport: true,
            backends: ['cpu'],
            encoders: ['libx264']
          });
        }
        try {
          const res = JSON.parse(stdout.trim());
          resolve({
            version: 1,
            name: 'desktop',
            nativeMatting: true,
            nativeExport: true,
            ...res
          });
        } catch (e) {
          resolve({
            version: 1,
            name: 'desktop',
            nativeMatting: true,
            nativeExport: true,
            backends: ['cpu'],
            encoders: ['libx264']
          });
        }
      });
    });
  }

  registerAssetFile(sourcePath, mimeType, displayName) {
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`File does not exist: ${sourcePath}`);
    }
    const stat = fs.statSync(sourcePath);
    const token = crypto.randomUUID();
    const ext = path.extname(sourcePath) || (mimeType.startsWith('video/') ? '.mp4' : '.png');
    const cacheFile = path.join(this.cacheDir, `${token}${ext}`);

    // Copy to cache directory so source mutations or moving does not corrupt ongoing jobs
    fs.copyFileSync(sourcePath, cacheFile);

    const descriptor = {
      assetToken: token,
      name: displayName || path.basename(sourcePath),
      type: mimeType || (sourcePath.match(/\.(mp4|webm|mov)$/i) ? 'video/mp4' : 'image/png'),
      size: stat.size
    };
    this.assets.set(token, { filePath: cacheFile, ...descriptor });
    return descriptor;
  }

  ensureNativeAsset(itemId, arrayBuffer) {
    const token = crypto.randomUUID();
    const cacheFile = path.join(this.cacheDir, `${token}.bin`);
    fs.writeFileSync(cacheFile, Buffer.from(arrayBuffer));
    const stat = fs.statSync(cacheFile);

    const descriptor = {
      assetToken: token,
      name: `asset_${itemId}`,
      type: 'application/octet-stream',
      size: stat.size
    };
    this.assets.set(token, { filePath: cacheFile, ...descriptor });
    return descriptor;
  }

  getAsset(token) {
    if (!token || typeof token !== 'string') return null;
    return this.assets.get(token) || null;
  }

  readAssetBuffer(token) {
    if (!token || typeof token !== 'string') {
      throw new Error(`Invalid asset token: ${token}`);
    }
    const asset = this.assets.get(token);
    if (!asset || !fs.existsSync(asset.filePath)) {
      throw new Error(`Asset not found for token: ${token}`);
    }
    return fs.readFileSync(asset.filePath);
  }

  registerOutput(targetPath) {
    const token = crypto.randomUUID();
    this.outputs.set(token, { targetPath });
    return token;
  }

  getOutput(token) {
    return this.outputs.get(token) || null;
  }

  async startMatteJob(webContents, request) {
    const asset = this.getAsset(request.assetToken);
    if (!asset) {
      throw new Error(`Invalid asset token: ${request.assetToken}`);
    }

    const jobId = crypto.randomUUID();
    const jobDir = path.join(this.tempDir, jobId);
    fs.mkdirSync(jobDir, { recursive: true });

    const outputFile = path.join(jobDir, 'matte.jizmat');
    const configFile = path.join(jobDir, 'config.json');

    const config = {
      jobId,
      sourceVideo: asset.filePath,
      outputFile,
      profile: request.profile || 'rvm-mobilenetv3-fp32-p512-r05-v1',
      fps: request.fps || 24,
      slots: request.slots || []
    };
    fs.writeFileSync(configFile, JSON.stringify(config), 'utf-8');

    const workerScript = path.join(__dirname, '..', 'native', 'worker.py');
    const child = spawn(this.pythonPath, [workerScript, 'matte', configFile], {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true
    });

    const job = {
      id: jobId,
      type: 'matte',
      child,
      dir: jobDir,
      status: 'running'
    };
    this.jobs.set(jobId, job);

    let stdoutBuffer = '';
    child.stdout.on('data', (chunk) => {
      stdoutBuffer += chunk.toString('utf-8');
      const lines = stdoutBuffer.split('\n');
      stdoutBuffer = lines.pop(); // keep partial line
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line);
          if (webContents && !webContents.isDestroyed()) {
            webContents.send('desktop:matteProgress', { jobId, ...msg });
          }
        } catch (e) {}
      }
    });

    child.stderr.on('data', (chunk) => {
      // Worker logs
      process.stderr.write(`[Worker ${jobId}] ${chunk}`);
    });

    return new Promise((resolve, reject) => {
      child.on('error', (err) => {
        job.status = 'failed';
        reject(err);
      });

      child.on('close', (code) => {
        if (job.status === 'cancelled') {
          return reject(new Error('Cancelled'));
        }
        if (code !== 0) {
          job.status = 'failed';
          return reject(new Error(`Matte worker exited with code ${code}`));
        }

        job.status = 'completed';
        if (!fs.existsSync(outputFile)) {
          return reject(new Error('Matte worker succeeded but output file is missing'));
        }

        const maskToken = crypto.randomUUID();
        this.mattes.set(maskToken, { filePath: outputFile });
        resolve({
          jobId,
          maskToken,
          meta: {
            model: config.profile,
            fps: config.fps,
            slotsCount: config.slots.length
          }
        });
      });
    });
  }

  getMatteResultBlob(maskToken) {
    const item = this.mattes.get(maskToken);
    if (!item || !fs.existsSync(item.filePath)) {
      throw new Error(`Matte result not found for maskToken: ${maskToken}`);
    }
    return fs.readFileSync(item.filePath);
  }

  async startExportJob(webContents, settings) {
    const outInfo = this.getOutput(settings.outputToken);
    if (!outInfo) {
      throw new Error(`Invalid output token: ${settings.outputToken}`);
    }

    const jobId = crypto.randomUUID();
    const jobDir = path.join(this.tempDir, jobId);
    fs.mkdirSync(jobDir, { recursive: true });

    const tempPartFile = path.join(jobDir, 'output.part.mp4');
    let audioWavFile = null;

    if (settings.audioBuffer && settings.audioBuffer.byteLength > 0) {
      audioWavFile = path.join(jobDir, 'audio.wav');
      fs.writeFileSync(audioWavFile, Buffer.from(settings.audioBuffer));
    }

    const exportConfig = {
      jobId,
      outputFile: tempPartFile,
      finalOutputFile: outInfo.targetPath,
      width: settings.width,
      height: settings.height,
      fps: settings.fps,
      frameCount: settings.frameCount,
      qualityMode: settings.qualityMode,
      bitrate: settings.bitrate,
      qp: settings.qp,
      audioFile: audioWavFile
    };

    const workerScript = path.join(__dirname, '..', 'native', 'worker.py');
    const child = spawn(this.pythonPath, [workerScript, 'export'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true
    });

    const job = {
      id: jobId,
      type: 'export',
      child,
      dir: jobDir,
      config: exportConfig,
      finalPath: outInfo.targetPath,
      tempPartFile,
      status: 'preparing',
      frameSize: settings.width * settings.height * 4,
      framesWritten: 0,
      totalFrames: settings.frameCount,
      readyPromise: null,
      readyResolve: null,
      readyReject: null
    };

    job.readyPromise = new Promise((resolve, reject) => {
      job.readyResolve = resolve;
      job.readyReject = reject;
    });

    this.jobs.set(jobId, job);

    let stdoutBuffer = '';
    child.stdout.on('data', (chunk) => {
      stdoutBuffer += chunk.toString('utf-8');
      const lines = stdoutBuffer.split('\n');
      stdoutBuffer = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line);
          if (msg.type === 'ready') {
            job.status = 'running';
            job.readyResolve && job.readyResolve(msg);
          }
        } catch (e) {}
      }
    });

    child.stderr.on('data', (chunk) => {
      process.stderr.write(`[Export ${jobId}] ${chunk}`);
    });

    child.on('error', (err) => {
      job.status = 'failed';
      job.readyReject && job.readyReject(err);
    });

    // Write initial config line to stdin
    child.stdin.write(JSON.stringify(exportConfig) + '\n');

    // Wait for ready handshake
    await job.readyPromise;

    return {
      jobId,
      status: 'ready'
    };
  }

  async writeFrame(jobId, index, buffer) {
    const job = this.jobs.get(jobId);
    if (!job || job.type !== 'export') {
      throw new Error(`Export job not found: ${jobId}`);
    }
    if (job.status !== 'running') {
      throw new Error(`Job is not running: ${job.status}`);
    }
    if (buffer.byteLength !== job.frameSize) {
      throw new Error(`Frame buffer length ${buffer.byteLength} does not match expected size ${job.frameSize}`);
    }

    const nodeBuffer = Buffer.from(buffer);
    const stdin = job.child.stdin;

    // Backpressure handling: if stdin.write returns false, wait for drain
    if (!stdin.write(nodeBuffer)) {
      await new Promise((resolve) => stdin.once('drain', resolve));
    }
    job.framesWritten++;
    return { ok: true, index };
  }

  async finishExport(jobId) {
    const job = this.jobs.get(jobId);
    if (!job || job.type !== 'export') {
      throw new Error(`Export job not found: ${jobId}`);
    }

    job.status = 'finalizing';
    // Close stdin to signal EOF to Python worker
    job.child.stdin.end();

    return new Promise((resolve, reject) => {
      job.child.on('close', (code) => {
        if (job.status === 'cancelled') {
          return reject(new Error('Export cancelled'));
        }
        if (code !== 0) {
          job.status = 'failed';
          return reject(new Error(`Export worker exited with code ${code}`));
        }

        if (!fs.existsSync(job.tempPartFile)) {
          return reject(new Error('Export finished but output part file is missing'));
        }

        try {
          // Atomic move/rename to final output target
          fs.renameSync(job.tempPartFile, job.finalPath);
          const stat = fs.statSync(job.finalPath);
          job.status = 'completed';

          resolve({
            saved: true,
            size: stat.size,
            path: job.finalPath
          });
        } catch (err) {
          // If cross-device move fails, copy and unlink
          try {
            fs.copyFileSync(job.tempPartFile, job.finalPath);
            fs.unlinkSync(job.tempPartFile);
            const stat = fs.statSync(job.finalPath);
            job.status = 'completed';
            resolve({
              saved: true,
              size: stat.size,
              path: job.finalPath
            });
          } catch (copyErr) {
            job.status = 'failed';
            reject(copyErr);
          }
        } finally {
          this._cleanupJobDir(job.dir);
        }
      });
    });
  }

  cancelJob(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) return { ok: false };

    job.status = 'cancelled';
    if (job.child) {
      try { job.child.stdin && job.child.stdin.destroy(); } catch (e) {}
      try { job.child.stdout && job.child.stdout.destroy(); } catch (e) {}
      try { job.child.stderr && job.child.stderr.destroy(); } catch (e) {}
      if (job.child.pid && !job.child.killed) {
        if (process.platform === 'win32') {
          try {
            const { execFileSync } = require('node:child_process');
            execFileSync('taskkill', ['/pid', String(job.child.pid), '/T', '/F'], { stdio: 'ignore' });
          } catch (e) {
            try { job.child.kill('SIGKILL'); } catch (err) {}
          }
        } else {
          try { job.child.kill('SIGKILL'); } catch (err) {}
        }
      }
    }
    this._cleanupJobDir(job.dir);
    this.jobs.delete(jobId);
    return { ok: true, jobId };
  }

  _cleanupJobDir(dir) {
    if (!dir || typeof dir !== 'string') return;
    try {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    } catch (e) {}
  }

  cleanupAll() {
    for (const [jobId, job] of this.jobs.entries()) {
      this.cancelJob(jobId);
    }
    try {
      if (fs.existsSync(this.appDataDir)) {
        fs.rmSync(this.appDataDir, { recursive: true, force: true });
      }
    } catch (e) {}
  }
}

module.exports = { NativeJobs };
