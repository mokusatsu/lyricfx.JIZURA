/* Native Desktop Backend adapter for Electron environment.
   Bridges J.platform calls to window.jizuraDesktop contextBridge API. */
(() => {
  'use strict';
  if (!window.jizuraDesktop) return;

  const desktop = window.jizuraDesktop;
  const blobToToken = new WeakMap();
  const itemToAssetInfo = new Map(); // itemId -> { token, size, lastModified }

  J.getNativeAssetToken = (file) => (file && blobToToken.get(file)) || null;
  J.getItemAssetToken = (itemId) => itemToAssetInfo.get(itemId)?.token || null;
  J.clearNativeAssetCache = () => {
    itemToAssetInfo.clear();
  };

  J.platform = {
    name: 'desktop',
    nativeMatting: true,
    nativeExport: true,

    capabilities: async () => {
      try {
        return await desktop.capabilities();
      } catch (e) {
        console.warn('Failed to query desktop capabilities:', e);
        return {
          version: 1,
          name: 'desktop',
          nativeMatting: true,
          nativeExport: true,
          backends: ['cpu'],
          encoders: ['libx264']
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
          const buffer = await desktop.fetchAssetData(desc.assetToken);
          const file = new File([buffer], desc.name, { type: desc.type });
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
      const cached = itemToAssetInfo.get(itemId);
      if (cached && blob && cached.size === blob.size && cached.lastModified === (blob.lastModified || 0)) {
        return cached.token;
      }
      const buffer = await blob.arrayBuffer();
      const desc = await desktop.ensureNativeAsset(itemId, buffer);
      if (blob) blobToToken.set(blob, desc.assetToken);
      itemToAssetInfo.set(itemId, {
        token: desc.assetToken,
        size: blob ? blob.size : buffer.byteLength,
        lastModified: (blob && blob.lastModified) || 0
      });
      return desc.assetToken;
    },

    generatePersonMask: async (cut, { fps = 24, signal, onProgress = () => {} } = {}) => {
      const asset = J.mediaAssets.get(cut.itemId);
      if (!asset) throw new Error(J.mediaLabel('画像・動画素材を指定してください', 'Select an image or video asset'));

      let assetToken = (asset.file && blobToToken.get(asset.file)) || null;
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
      } finally {
        unsubs();
        signal?.removeEventListener('abort', abortHandler);
      }
    },

    pickExportTarget: async (filename) => {
      return await desktop.pickExportTarget(filename);
    },

    startExport: async (settings) => {
      return await desktop.startExport(settings);
    },

    writeFrame: async (jobId, index, rgba) => {
      const buffer = rgba.buffer.slice(rgba.byteOffset, rgba.byteOffset + rgba.byteLength);
      return await desktop.writeFrame(jobId, index, buffer);
    },

    finishExport: async (jobId) => {
      return await desktop.finishExport(jobId);
    },

    cancelJob: async (jobId) => {
      return await desktop.cancelJob(jobId);
    }
  };
})();
