/* Native Desktop Backend adapter for Electron environment.
   Bridges J.platform calls to window.jizuraDesktop contextBridge API. */
(() => {
  'use strict';
  if (!window.jizuraDesktop) return;

  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.classList.remove('is-web');
    document.documentElement.classList.add('is-desktop');
  }

  const desktop = window.jizuraDesktop;
  const blobToToken = new WeakMap();
  const itemToAssetInfo = new Map(); // itemId -> { token, size, lastModified }
  const exports = new Map();
  const receivedPorts = new Map(), portWaiters = new Map();
  window.addEventListener('message', event => {
    if (event.source !== window || event.data?.type !== 'jizura-export-port' || !event.ports[0]) return;
    const id = event.data.jobId, port = event.ports[0], waiter = portWaiters.get(id);
    if (waiter) { portWaiters.delete(id); waiter.resolve(port); } else receivedPorts.set(id, port);
  });
  const takeExportPort = id => {
    if (receivedPorts.has(id)) { const port = receivedPorts.get(id); receivedPorts.delete(id); return Promise.resolve(port); }
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { portWaiters.delete(id); reject(new Error('Export port handshake timed out')); }, 10000);
      portWaiters.set(id, { resolve: port => { clearTimeout(timer); resolve(port); }, reject: error => { clearTimeout(timer); reject(error); } });
    });
  };
  const exportRPC = port => {
    const pending = new Map(); let next = 0, closed = false;
    const close = (error = new Error('Export port closed')) => {
      if (closed) return; closed = true;
      for (const { reject } of pending.values()) reject(error);
      pending.clear(); port.close();
    };
    port.onmessage = ({ data }) => {
      if (data.type === 'closed') { close(); return; }
      const request = pending.get(data.id); if (!request) return;
      pending.delete(data.id);
      if (data.error) request.reject(new Error(data.error)); else request.resolve(data);
    };
    port.addEventListener('close', () => close());
    port.onmessageerror = () => close(new Error('Invalid export port message'));
    port.start();
    return { close, request(op, args, buffer) {
      if (closed) return Promise.reject(new Error('Export port closed'));
      return new Promise((resolve, reject) => {
        const id = ++next; pending.set(id, { resolve, reject });
        // MessagePortMain accepts cloned buffers; transferred ArrayBuffers are
        // silently dropped by Electron. Keep ownership until acknowledgement.
        try { port.postMessage({ id, op, ...args, ...(buffer ? { buffer } : {}) }); }
        catch (error) { pending.delete(id); reject(error); }
      });
    } };
  };

  // Helper to fetch asset either via custom protocol (in browser) or fallback to desktop API (in Node unit tests)
  async function fetchAssetBlob(assetToken, mimeType) {
    try {
      const resp = await fetch(`jizura-asset://${assetToken}`);
      if (!resp.ok) {
        throw new Error(`Asset fetch HTTP ${resp.status}`);
      }
      return await resp.blob();
    } catch (e) {
      // Chunked streaming fallback to avoid single massive IPC buffer allocations
      if (typeof desktop.fetchAssetChunk === 'function' && typeof desktop.getAssetInfo === 'function') {
        try {
          const info = await desktop.getAssetInfo(assetToken);
          if (info && info.size !== undefined) {
            const totalSize = info.size;
            const chunkSize = 8 * 1024 * 1024; // 8MB chunks
            const chunks = [];
            for (let offset = 0; offset < totalSize; offset += chunkSize) {
              const length = Math.min(chunkSize, totalSize - offset);
              const chunk = await desktop.fetchAssetChunk(assetToken, offset, length);
              chunks.push(chunk);
            }
            return new Blob(chunks, { type: mimeType || info.type || 'application/octet-stream' });
          }
        } catch (chunkErr) {
          console.warn('Chunked asset fetch failed, falling back to full fetch:', chunkErr);
        }
      }
      if (typeof desktop.fetchAssetData === 'function') {
        const buffer = await desktop.fetchAssetData(assetToken);
        return new Blob([buffer], { type: mimeType });
      }
      throw e;
    }
  }

  J.platform = {
    name: 'desktop',
    mediaSnapshotChunkBytes: 32 * 1024 * 1024,
    workerAvailable: true,
    nativeMatting: true,
    nativeExport: true,
    defaultExportPipeline: 'legacy',
    ffmpegAvailable: true,
    workerReason: null,
    ffmpegReason: null,

    setDirtyState: dirty => desktop.setDirtyState?.(dirty),
    getNativeAssetToken: file => (file && (blobToToken.get(file) || file.__assetToken)) || null,
    getItemAssetToken: itemId => itemToAssetInfo.get(itemId)?.token || null,
    clearNativeAssetCache: () => itemToAssetInfo.clear(),
    retainMediaReference: (file, copy) => {
      const token = file && (blobToToken.get(file) || file.__assetToken);
      if (token && copy) {
        copy.__assetToken = token;
        blobToToken.set(copy, token);
      }
    },

    capabilities: async () => {
      try {
        const caps = await desktop.capabilities();
        J.platform.workerAvailable = !!caps.workerAvailable;
        J.platform.nativeMatting = !!(caps.workerAvailable && caps.nativeMatting);
        J.platform.nativeExport = !!(caps.workerAvailable && caps.nativeExport);
        J.platform.defaultExportPipeline = typeof VideoFrame === 'function'
          ? ['continuous-port', 'continuous-ipc'].find(pipeline => caps.exportPipelines?.includes(pipeline)) || 'legacy'
          : 'legacy';
        J.platform.ffmpegAvailable = !!caps.ffmpegAvailable;
        J.platform.workerReason = caps.reason || null;
        J.platform.ffmpegReason = caps.ffmpegReason || null;
        return caps;
      } catch (e) {
        console.warn('Failed to query desktop capabilities:', e);
        J.platform.workerAvailable = false;
        J.platform.nativeMatting = false;
        J.platform.nativeExport = false;
        J.platform.defaultExportPipeline = 'legacy';
        J.platform.ffmpegAvailable = false;
        J.platform.workerReason = e.message;
        return {
          version: 1,
          name: 'desktop',
          workerAvailable: false,
          nativeMatting: false,
          nativeExport: false,
          ffmpegAvailable: false,
          reason: e.message,
          backends: ['cpu'],
          encoders: []
        };
      }
    },

    personModelProfile: () => 'rvm-mobilenetv3-fp32-p512-r05-v1',

    pickMedia: async ({ layer = 'media' } = {}) => {
      const descriptors = await desktop.pickMedia({ layer });
      if (!descriptors || !descriptors.length) return [];

      const files = [];
      for (const desc of descriptors) {
        try {
          const blob = await fetchAssetBlob(desc.assetToken, desc.type);
          const file = new File([blob], desc.name, { type: desc.type });
          file.__assetToken = desc.assetToken;
          blobToToken.set(file, desc.assetToken);
          files.push(file);
        } catch (err) {
          console.error('Failed to materialize asset for picker:', desc.name, err);
        }
      }
      return files;
    },

    ensureNativeAsset: async (itemId, blob) => {
      if (blob && blobToToken.has(blob)) return blobToToken.get(blob);
      if (blob && blob.__assetToken) {
        blobToToken.set(blob, blob.__assetToken);
        return blob.__assetToken;
      }
      let desc;
      if (typeof desktop.uploadChunkedAsset === 'function' && blob instanceof Blob && blob.size > 2 * 1024 * 1024) {
        // Stream large blobs in chunks to avoid single massive IPC buffer allocation
        desc = await desktop.uploadChunkedAsset(blob.name || `asset_${itemId}`, blob.type || 'application/octet-stream', blob);
      } else {
        const buffer = await blob.arrayBuffer();
        desc = await desktop.ensureNativeAsset(itemId, buffer);
      }
      if (blob) {
        blob.__assetToken = desc.assetToken;
        blobToToken.set(blob, desc.assetToken);
      }
      itemToAssetInfo.set(itemId, {
        token: desc.assetToken,
        size: blob ? blob.size : buffer.byteLength,
        lastModified: (blob && blob.lastModified) || 0
      });
      return desc.assetToken;
    },

    generatePersonMask: async (cut, { fps = 24, signal, onProgress = () => {} } = {}) => {
      if (!J.platform.nativeMatting) {
        const msg = J.platform.workerReason || '人物切り抜き機能が利用できません。';
        throw new Error(msg);
      }

      const asset = J.mediaAssets.get(cut.itemId);
      if (!asset) throw new Error(J.mediaLabel('画像・動画素材を指定してください', 'Select an image or video asset'));

      let assetToken = (asset.file && blobToToken.get(asset.file)) || (asset.file && asset.file.__assetToken) || null;
      if (!assetToken && asset.file) {
        onProgress({ phase: 'upload', loaded: 0, total: 1 });
        assetToken = await J.platform.ensureNativeAsset(cut.itemId, asset.file);
      }
      if (!assetToken) throw new Error(J.mediaLabel('素材のネイティブ参照を取得できません', 'Cannot obtain native asset reference'));

      const profile = J.platform.personModelProfile();
      const duration = asset.element?.duration || 0;
      fps = J.clamp(Math.round(fps), 1, 60);
      const targets = J.personMaskTargets(cut, duration, fps);

      onProgress({ phase: 'plan', total: targets.length, reused: 0, missing: targets.length });

      let currentJobId = 'matte_' + crypto.randomUUID();
      const unsubs = desktop.onMatteProgress((msg) => {
        if (msg.jobId && currentJobId && msg.jobId !== currentJobId) return;
        onProgress({
          phase: msg.phase || 'analyze',
          completed: msg.completed || 0,
          total: msg.total || targets.length,
          reused: msg.reused || 0,
          required: targets.length,
          backend: msg.backend || 'CPU',
          inferenceMs: msg.inferenceMs || 0
        });
      });

      const abortHandler = () => {
        if (currentJobId) desktop.cancelJob(currentJobId);
      };
      signal?.addEventListener('abort', abortHandler, { once: true });

      try {
        if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');

        const res = await desktop.startMatteJob({
          jobId: currentJobId,
          assetToken,
          sourceId: cut.itemId,
          profile,
          fps,
          slots: targets,
          duration
        });

        if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
        onProgress({ phase: 'save' });

        const arrayBuffer = await desktop.getMatteResultBlob(res.maskToken);
        const containerBlob = new Blob([arrayBuffer], { type: 'application/octet-stream' });

        const maskId = 'person_' + crypto.randomUUID();
        const ref = {
          maskId,
          sourceId: cut.itemId,
          model: profile,
          display: 'only',
          behindLyrics: false,
          behindForeground: false,
          fps,
          width: 512,
          height: 512,
          frameCount: targets.length,
          duration
        };

        await J.attachPersonMask(ref, containerBlob);
        await J.storeMedia(maskId, containerBlob);

        return ref;
      } catch (err) {
        // Human-friendly error handling for model download or worker crash
        if (err.message && err.message.includes('AI model')) {
          throw new Error('AI モデルのダウンロードまたは初期化に失敗しました。インターネット接続を確認して再試行してください。');
        }
        throw err;
      } finally {
        unsubs();
        signal?.removeEventListener('abort', abortHandler);
      }
    },

    pickExportTarget: async (filename) => {
      return await desktop.pickExportTarget(filename);
    },

    startExport: async (settings) => {
      if (!J.platform.nativeExport) {
        const msg = J.platform.ffmpegReason || '動画出力機能が利用できません（FFmpeg が必要です）。';
        throw new Error(msg);
      }
      const state = { clientId: settings.jobId || crypto.randomUUID(), cancelled: false };
      exports.set(state.clientId, state);
      try {
        const job = await desktop.startExport(settings); state.jobId = job.jobId;
        if (state.cancelled) throw new DOMException('Cancelled', 'AbortError');
        exports.set(job.jobId, state);
        if (settings.pipeline === 'continuous-port') {
          const port = await takeExportPort(job.jobId);
          if (state.cancelled) { port.close(); throw new DOMException('Cancelled', 'AbortError'); }
          state.rpc = exportRPC(port);
        }
        return job;
      } catch (error) { J.platform.releaseExportResources(state.clientId); throw error; }
    },

    planExportMedia: async (plan, start, duration, fps, signal) => {
      const frames = [], cursors = new Map(), assets = new Map();
      const total = Math.max(1, Math.round(duration * fps));
      for (let index = 0; index < total; index++) {
        const demand = J.exportMediaDemand(plan, start + index / fps);
        for (const source of demand.sources) {
          const key = `${source.layer}_${source.cut.index}_${source.cycle}_${source.transition ? 'hold' : 'current'}`;
          let cursor = cursors.get(key);
          if (!cursor) {
            cursor = { id: `s${cursors.size}`, itemId: source.cut.itemId, start: source.time, end: source.time, last: index };
            cursors.set(key, cursor);
          }
          cursor.start = Math.min(cursor.start, source.time); cursor.end = Math.max(cursor.end, source.time); cursor.last = index;
          source.cursor = cursor;
          assets.set(source.cut.itemId, J.mediaAssets.get(source.cut.itemId));
        }
        frames.push(demand.sources);
      }
      for (const [id, asset] of assets) {
        if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
        if (!asset.file) throw new Error('Source video has no retained media file');
        const used = [...cursors.values()].filter(cursor => cursor.itemId === id);
        // Read display/color metadata once; frame selection is performed by PTS
        // in the continuous decoder, independently of browser seek rounding.
        await J.seekMediaVideo(asset.element, Math.min(...used.map(cursor => cursor.start)), signal, asset.file.name);
        const frame = new VideoFrame(asset.element);
        let display;
        try { display = { colorSpace: frame.colorSpace.toJSON(), rotation: frame.rotation || 0, flip: !!frame.flip,
          displayWidth: asset.element.videoWidth, displayHeight: asset.element.videoHeight }; }
        finally { frame.close(); }
        const token = await J.platform.ensureNativeAsset(id, asset.file);
        for (const cursor of used) Object.assign(cursor, { assetToken: token, ...display });
      }
      return { sources: [...cursors.values()].map(({ id, assetToken, start, end, colorSpace, displayWidth, displayHeight, rotation, flip }) =>
        ({ id, assetToken, start, end, colorSpace, displayWidth, displayHeight, rotation, flip })), frames };
    },

    prepareExportMedia: async (jobId, mediaPlan, index, signal) => {
      if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
      const job = exports.get(jobId);
      job.cursors ||= new Map();
      for (const [id, state] of job.cursors) if (state.last < index) {
        if (job.rpc) await job.rpc.request('release', { cursor: id });
        else await desktop.releaseExportSource(jobId, id);
        job.cursors.delete(id);
      }
      J.exportMediaSources = new Map(); J.exportMediaPreviousSources = new Map();
      J.exportMediaFrameInfo = new Map(); J.exportMediaPreviousFrameInfo = new Map();
      const prepared = new Map();
      const publish = (source, image, meta) => {
        (source.transition ? J.exportMediaPreviousSources : J.exportMediaSources).set(source.cut, image);
        (source.transition ? J.exportMediaPreviousFrameInfo : J.exportMediaFrameInfo).set(source.cut, { ...meta, requestedTime: source.time });
      };
      for (const source of mediaPlan.frames[index]) {
        const { cursor } = source;
        const key = cursor.assetToken + ':' + source.time;
        if (prepared.has(key)) { const prior = prepared.get(key); publish(source, prior.image, prior.meta); continue; }
        let state = job.cursors.get(cursor.id);
        if (!state) {
          state = { serial: -1, canvas: document.createElement('canvas'), last: cursor.last };
          job.cursors.set(cursor.id, state);
        }
        if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
        const buffer = job.rpc
          ? (await job.rpc.request('source', { cursor: cursor.id, time: source.time, after: state.serial })).buffer
          : await desktop.readExportFrame(jobId, cursor.id, source.time, state.serial);
        const length = new DataView(buffer).getUint32(0, true);
        if (length > buffer.byteLength - 4) throw new Error('Invalid decoded-frame metadata length');
        const meta = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 4, length)));
        if (!meta.reused) {
          const pixels = new Uint8Array(buffer, 4 + length), turn = meta.rotation % 180 !== 0;
          const width = turn ? meta.height : meta.width, height = turn ? meta.width : meta.height;
          if (state.canvas.width !== width || state.canvas.height !== height) { state.canvas.width = width; state.canvas.height = height; }
          state.canvas.videoWidth = meta.displayWidth; state.canvas.videoHeight = meta.displayHeight;
          const colorSpace = Object.fromEntries(Object.entries(meta.colorSpace).filter(([, value]) => value !== 'unknown' && value !== 'reserved'));
          // Rasterize coded pixels once; videoWidth/Height above apply SAR when
          // the existing compositor fits this image into its destination.
          const image = new VideoFrame(pixels, { format: meta.format, codedWidth: meta.width, codedHeight: meta.height,
            displayWidth: meta.width, displayHeight: meta.height,
            rotation: meta.rotation, flip: meta.flip, timestamp: Math.round(meta.pts * 1e6), colorSpace });
          const ctx = state.canvas.getContext('2d', { willReadFrequently: true });
          try { ctx.globalCompositeOperation = 'copy'; ctx.drawImage(image, 0, 0, width, height); }
          finally { image.close(); }
          state.serial = meta.serial;
        } else if (state.serial !== meta.serial) throw new Error('Missing reused source image');
        prepared.set(key, { image: state.canvas, meta });
        publish(source, state.canvas, meta);
      }
    },

    writeFrame: async (jobId, index, rgba) => {
      const buffer = (rgba.byteOffset === 0 && rgba.byteLength === rgba.buffer.byteLength)
        ? rgba.buffer
        : rgba.buffer.slice(rgba.byteOffset, rgba.byteOffset + rgba.byteLength);
      const rpc = exports.get(jobId)?.rpc;
      return rpc ? await rpc.request('frame', { index }, buffer) : await desktop.writeFrame(jobId, index, buffer);
    },

    finishExport: async (jobId) => {
      const result = await desktop.finishExport(jobId);
      J.platform.releaseExportResources(jobId);
      return result;
    },

    cancelJob: async (jobId) => {
      try { return await desktop.cancelJob(jobId); }
      finally { J.platform.releaseExportResources(jobId); }
    },

    releaseExportResources: jobId => {
      const state = exports.get(jobId);
      if (state) {
        state.cancelled = true; state.rpc?.close();
        for (const id of [state.jobId, state.clientId]) {
          exports.delete(id); receivedPorts.get(id)?.close(); receivedPorts.delete(id);
          portWaiters.get(id)?.reject(new Error('Export cancelled')); portWaiters.delete(id);
        }
      }
    },
  };

  // Synchronize unsaved dirty state with main process
  let isSavingAndClosing = false;

  const notifyProjectSaved = () => {
    if (typeof desktop.setDirtyState === 'function') {
      desktop.setDirtyState(false);
    }
    if (isSavingAndClosing) {
      isSavingAndClosing = false;
      if (typeof desktop.confirmQuit === 'function') {
        desktop.confirmQuit();
      }
    }
  };

  const cancelSaveAndClose = () => {
    isSavingAndClosing = false;
  };

  J.platform.saveProjectFile = async (defaultName, arrayBuffer) => {
    if (typeof desktop.saveProjectFile === 'function') {
      return await desktop.saveProjectFile(defaultName, arrayBuffer);
    }
    return null;
  };
  J.platform.notifyProjectSaved = notifyProjectSaved;
  J.platform.cancelSaveAndClose = cancelSaveAndClose;

  if (typeof desktop.onRequestSaveAndClose === 'function') {
    desktop.onRequestSaveAndClose(async () => {
      isSavingAndClosing = true;
      const saveBtn = document.getElementById('btnSave');
      if (saveBtn) {
        saveBtn.click();
      } else {
        isSavingAndClosing = false;
      }
    });
  }

  // Initial Project Handoff from Songcut CLI arguments
  async function applyInitialHandoff() {
    try {
      if (typeof desktop.getInitialProjectData !== 'function') return;
      const data = await desktop.getInitialProjectData();
      if (!data || !data.hasInitialProject) return;

      // If there are errors in video or lrc files, report and abort without touching existing project
      if (data.videoError) {
        alert(`動画の読み込みに失敗しました:\n${data.videoError}`);
        return;
      }
      if (data.lrcError) {
        alert(`LRC の読み込みに失敗しました:\n${data.lrcError}`);
        return;
      }

      let parsedLrc = null;
      if (data.lrc !== null && data.lrc !== undefined) {
        if (!data.lrc.trim()) {
          alert('LRC ファイルが空です。有効な歌詞データを含むファイルを指定してください。');
          return;
        }
        parsedLrc = J.parseSongcutLRC(data.lrc);
        if (!parsedLrc.ok) {
          alert(`LRC の取り込みに失敗しました:\n${parsedLrc.error}`);
          return;
        }
      }

      // Load video asset into background
      if (data.video && data.video.assetToken) {
        try {
          const blob = await fetchAssetBlob(data.video.assetToken, data.video.type);
          const file = new File([blob], data.video.name, { type: data.video.type });
          file.__assetToken = data.video.assetToken;
          blobToToken.set(file, data.video.assetToken);

          if (typeof window.loadAudioFile === 'function') {
            const ok = await window.loadAudioFile(file, { matchDuration: true, background: true });
            if (ok === false) {
              alert('動画の読み込みに失敗しました。');
              return;
            }
          }
        } catch (err) {
          alert(`動画素材の準備に失敗しました: ${err.message}`);
          return;
        }
      }

      // Apply lyrics
      if (parsedLrc && parsedLrc.rawLrcText) {
        const lyricInput = document.getElementById('lyrics');
        if (lyricInput) {
          lyricInput.value = parsedLrc.rawLrcText;
          lyricInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }

      // Mark project as dirty (unsaved) immediately after Songcut handoff
      if (typeof desktop.setDirtyState === 'function') {
        desktop.setDirtyState(true);
      }
    } catch (e) {
      console.warn('Initial project handoff failed:', e);
    }
  }

  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('DOMContentLoaded', () => {
      // Wait for JIZURA UI initialization before applying handoff
      setTimeout(applyInitialHandoff, 200);
    });
  }
})();
