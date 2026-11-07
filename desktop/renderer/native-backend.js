/* Native Desktop Backend adapter for Electron environment.
   Bridges J.platform calls to window.jizuraDesktop contextBridge API. */
(() => {
  'use strict';
  if (!window.jizuraDesktop) return;

  const desktop = window.jizuraDesktop;
  const blobToToken = new WeakMap();
  const itemToAssetInfo = new Map(); // itemId -> { token, size, lastModified }

  J.getNativeAssetToken = (file) => (file && (blobToToken.get(file) || file.__assetToken)) || null;
  J.getItemAssetToken = (itemId) => itemToAssetInfo.get(itemId)?.token || null;
  J.clearNativeAssetCache = () => {
    itemToAssetInfo.clear();
  };

  // Wrap J.snapshotMediaFile to preserve asset tokens across file cloning
  const origSnapshot = J.snapshotMediaFile;
  if (typeof origSnapshot === 'function') {
    J.snapshotMediaFile = async (file, onProgress) => {
      const copy = await origSnapshot(file, onProgress);
      const token = (file && (blobToToken.get(file) || file.__assetToken));
      if (token && copy) {
        copy.__assetToken = token;
        blobToToken.set(copy, token);
      }
      return copy;
    };
  }

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
    workerAvailable: true,
    nativeMatting: true,
    nativeExport: true,
    ffmpegAvailable: true,
    workerReason: null,
    ffmpegReason: null,

    capabilities: async () => {
      try {
        const caps = await desktop.capabilities();
        J.platform.workerAvailable = !!caps.workerAvailable;
        J.platform.nativeMatting = !!(caps.workerAvailable && caps.nativeMatting);
        J.platform.nativeExport = !!(caps.workerAvailable && caps.nativeExport);
        J.platform.ffmpegAvailable = !!caps.ffmpegAvailable;
        J.platform.workerReason = caps.reason || null;
        J.platform.ffmpegReason = caps.ffmpegReason || null;
        return caps;
      } catch (e) {
        console.warn('Failed to query desktop capabilities:', e);
        J.platform.workerAvailable = false;
        J.platform.nativeMatting = false;
        J.platform.nativeExport = false;
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
      return await desktop.startExport(settings);
    },

    writeFrame: async (jobId, index, rgba) => {
      const buffer = (rgba.byteOffset === 0 && rgba.byteLength === rgba.buffer.byteLength)
        ? rgba.buffer
        : rgba.buffer.slice(rgba.byteOffset, rgba.byteOffset + rgba.byteLength);
      return await desktop.writeFrame(jobId, index, buffer);
    },

    finishExport: async (jobId) => {
      return await desktop.finishExport(jobId);
    },

    cancelJob: async (jobId) => {
      return await desktop.cancelJob(jobId);
    }
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
