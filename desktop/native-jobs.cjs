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
    this.clientToInternalJob = new Map(); // clientJobId -> internalJobId

    this.pythonPath = this._resolvePython();
  }

  _resolvePython() {
    if (process.env.JIZURA_PYTHON && fs.existsSync(process.env.JIZURA_PYTHON)) {
      return process.env.JIZURA_PYTHON;
    }
    const resourcesPath = process.resourcesPath || path.join(__dirname, '..');
    const bundledNative = path.join(resourcesPath, 'native', process.platform === 'win32' ? 'python.exe' : 'python3');
    if (fs.existsSync(bundledNative)) {
      return bundledNative;
    }
    return process.platform === 'win32' ? 'python' : 'python3';
  }

  _resolveWorker() {
    const exeName = process.platform === 'win32' ? 'worker.exe' : 'worker';
    const candidates = [
      process.env.JIZURA_WORKER,
      process.resourcesPath ? path.join(process.resourcesPath, 'native', 'worker', exeName) : null,
      path.join(__dirname, 'resources', 'native', 'worker', exeName),
      path.join(__dirname, '..', 'desktop', 'resources', 'native', 'worker', exeName),
      path.join(__dirname, '..', 'native', 'dist', 'worker', exeName)
    ].filter(Boolean);

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        return { isBinary: true, command: p, argsPrefix: [] };
      }
    }

    // Python script fallback
    const python = this._resolvePython();
    const workerScript = path.join(__dirname, '..', 'native', 'worker.py');
    return { isBinary: false, command: python, argsPrefix: [workerScript] };
  }

  spawnWorker(args, options = {}) {
    const worker = this._resolveWorker();
    const fullArgs = [...worker.argsPrefix, ...args];
    return spawn(worker.command, fullArgs, {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
      ...options
    });
  }

  execWorker(args, options = {}, callback) {
    const worker = this._resolveWorker();
    const fullArgs = [...worker.argsPrefix, ...args];
    return execFile(worker.command, fullArgs, {
      windowsHide: true,
      ...options
    }, callback);
  }

  async getCapabilities() {
    return new Promise((resolve) => {
      this.execWorker(['probe'], { timeout: 10000 }, (err, stdout) => {
        if (err) {
          console.warn('Worker probe failed:', err.message);
          return resolve({
            version: 1,
            name: 'desktop',
            nativeMatting: true,
            nativeExport: false,
            backends: ['cpu'],
            encoders: []
          });
        }
        try {
          const res = JSON.parse(stdout.trim());
          const hasEncoders = Array.isArray(res.encoders) && res.encoders.length > 0;
          resolve({
            version: 1,
            name: 'desktop',
            nativeMatting: true,
            nativeExport: hasEncoders,
            ...res
          });
        } catch (e) {
          resolve({
            version: 1,
            name: 'desktop',
            nativeMatting: true,
            nativeExport: false,
            backends: ['cpu'],
            encoders: []
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

    const internalJobId = crypto.randomUUID();
    const clientJobId = request.jobId ? String(request.jobId) : internalJobId;
    this.clientToInternalJob.set(clientJobId, internalJobId);

    const jobDir = path.join(this.tempDir, internalJobId);
    fs.mkdirSync(jobDir, { recursive: true });

    const outputFile = path.join(jobDir, 'matte.jizmat');
    const configFile = path.join(jobDir, 'config.json');

    const config = {
      jobId: internalJobId,
      clientJobId,
      sourceId: request.sourceId,
      sourceVideo: asset.filePath,
      outputFile,
      profile: request.profile || 'rvm-mobilenetv3-fp32-p512-r05-v1',
      fps: request.fps || 24,
      slots: request.slots || [],
      duration: request.duration
    };
    fs.writeFileSync(configFile, JSON.stringify(config), 'utf-8');

    const child = this.spawnWorker(['matte', configFile]);

    const job = {
      id: internalJobId,
      clientJobId,
      type: 'matte',
      child,
      dir: jobDir,
      status: 'running'
    };
    this.jobs.set(internalJobId, job);

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
            webContents.send('desktop:matteProgress', { jobId: clientJobId, ...msg });
          }
        } catch (e) {}
      }
    });

    child.stderr.on('data', (chunk) => {
      // Worker logs
      process.stderr.write(`[Worker ${clientJobId}] ${chunk}`);
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
          jobId: clientJobId,
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
    let audioFile = null;

    if (settings.audioBuffer && settings.audioBuffer.byteLength > 0) {
      const ALLOWED_AUDIO_EXTS = new Set(['.wav', '.mp3', '.m4a', '.aac', '.ogg', '.flac', '.mp4', '.mov', '.webm', '.mkv']);
      const rawExt = String(settings.audioExt || '').toLowerCase();
      const ext = ALLOWED_AUDIO_EXTS.has(rawExt) ? rawExt : '.wav';
      audioFile = path.join(jobDir, `audio${ext}`);
      fs.writeFileSync(audioFile, Buffer.from(settings.audioBuffer));
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
      audioFile,
      audioOffset: settings.audioOffset || 0,
      audioDuration: settings.audioDuration
    };

    const child = this.spawnWorker(['export']);

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

    job.isReadyResolved = false;
    job.readyPromise = new Promise((resolve, reject) => {
      job.readyResolve = (val) => {
        if (!job.isReadyResolved) {
          job.isReadyResolved = true;
          resolve(val);
        }
      };
      job.readyReject = (err) => {
        if (!job.isReadyResolved) {
          job.isReadyResolved = true;
          reject(err);
        }
      };
    });

    job.exitPromise = new Promise((resolve) => {
      child.on('close', (code) => {
        job.exitCode = code;
        if (!job.isReadyResolved) {
          job.status = 'failed';
          job.readyReject(new Error(`Export worker exited before ready with code ${code}`));
        }
        resolve(code);
      });
    });

    child.stdin.on('error', (err) => {
      job.status = 'failed';
      if (!job.isReadyResolved) {
        job.readyReject(new Error(`Export worker stdin error: ${err.message}`));
      }
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
            job.audioCodec = msg.audioCodec;
            job.readyResolve && job.readyResolve(msg);
          } else if (msg.type === 'finished') {
            if (msg.audioCodec) job.audioCodec = msg.audioCodec;
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

    const stdin = job.child.stdin;
    if (!stdin || stdin.destroyed || !stdin.writable) {
      job.status = 'failed';
      throw new Error('Export worker stdin is not writable (EPIPE/closed)');
    }

    const nodeBuffer = Buffer.from(buffer);

    // Backpressure handling: if stdin.write returns false, wait for drain or error
    if (!stdin.write(nodeBuffer)) {
      await new Promise((resolve, reject) => {
        const onDrain = () => { cleanup(); resolve(); };
        const onError = (e) => { cleanup(); reject(e); };
        const onClose = () => { cleanup(); reject(new Error('stdin closed while waiting for drain')); };
        const cleanup = () => {
          stdin.removeListener('drain', onDrain);
          stdin.removeListener('error', onError);
          stdin.removeListener('close', onClose);
        };
        stdin.once('drain', onDrain);
        stdin.once('error', onError);
        stdin.once('close', onClose);
      });
    }
    job.framesWritten++;
    return { ok: true, index };
  }

  async finishExport(jobId) {
    const job = this.jobs.get(jobId);
    if (!job || job.type !== 'export') {
      throw new Error(`Export job not found: ${jobId}`);
    }

    if (job.status === 'cancelled') {
      throw new Error('Export cancelled');
    }

    job.status = 'finalizing';
    try {
      if (job.child.stdin && !job.child.stdin.destroyed) {
        job.child.stdin.end();
      }
    } catch (e) {}

    const code = await job.exitPromise;
    if (job.status === 'cancelled') {
      throw new Error('Export cancelled');
    }
    if (code !== 0) {
      job.status = 'failed';
      throw new Error(`Export worker exited with code ${code}`);
    }

    if (!fs.existsSync(job.tempPartFile)) {
      throw new Error('Export finished but output part file is missing');
    }

    let stagingFile = null;
    try {
      // Safe cross-device copy using temporary file in target directory to protect existing file
      const targetDir = path.dirname(job.finalPath);
      stagingFile = path.join(targetDir, `.tmp_${job.id}_${Date.now()}.mp4`);
      try {
        fs.renameSync(job.tempPartFile, job.finalPath);
        stagingFile = null;
      } catch (renameErr) {
        // Cross-device move: copy to staging file in destination dir first
        fs.copyFileSync(job.tempPartFile, stagingFile);
        const srcStat = fs.statSync(job.tempPartFile);
        const stageStat = fs.statSync(stagingFile);
        if (stageStat.size !== srcStat.size) {
          try { fs.unlinkSync(stagingFile); } catch (e) {}
          stagingFile = null;
          throw new Error('Staging file size mismatch during copy');
        }
        // Atomic rename within target directory
        fs.renameSync(stagingFile, job.finalPath);
        stagingFile = null;
        try { fs.unlinkSync(job.tempPartFile); } catch (e) {}
      }

      const stat = fs.statSync(job.finalPath);
      job.status = 'completed';

      return {
        saved: true,
        size: stat.size,
        path: job.finalPath,
        audioCodec: job.audioCodec || 'AAC'
      };
    } finally {
      if (stagingFile && fs.existsSync(stagingFile)) {
        try { fs.unlinkSync(stagingFile); } catch (e) {}
      }
      this._cleanupJobDir(job.dir);
    }
  }

  cancelJob(jobId) {
    const actualId = this.clientToInternalJob.get(jobId) || jobId;
    const job = this.jobs.get(actualId);
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
    this.jobs.delete(actualId);
    this.clientToInternalJob.delete(jobId);
    return { ok: true, jobId };
  }

  _cleanupJobDir(dir) {
    if (!dir || typeof dir !== 'string') return;
    try {
      const resolvedDir = path.resolve(dir);
      const resolvedTemp = path.resolve(this.tempDir);
      // Strictly prevent deleting anything outside this.tempDir
      if (resolvedDir !== resolvedTemp && resolvedDir.startsWith(resolvedTemp + path.sep)) {
        if (fs.existsSync(resolvedDir)) {
          fs.rmSync(resolvedDir, { recursive: true, force: true });
        }
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
