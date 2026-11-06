const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload script exposing a minimal, secure API to the Renderer.
 * Plain objects and ArrayBuffers only; no direct Node or file paths.
 */
const jizuraDesktop = {
  version: 1,

  capabilities: async () => {
    return await ipcRenderer.invoke('desktop:capabilities');
  },

  getInitialProjectData: async () => {
    return await ipcRenderer.invoke('desktop:getInitialProjectData');
  },

  saveProjectFile: async (defaultName, data) => {
    const isBlob = typeof Blob !== 'undefined' && data instanceof Blob;
    const isBuffer = data instanceof ArrayBuffer;
    if (!isBlob && !isBuffer) {
      throw new TypeError('Invalid arguments for saveProjectFile: data must be a Blob or an ArrayBuffer');
    }

    const totalSize = isBlob ? data.size : data.byteLength;
    const startRes = await ipcRenderer.invoke('desktop:saveProjectStart', {
      defaultName: String(defaultName || 'project.lyricfx')
    });

    if (startRes.error) {
      return { canceled: false, error: startRes.error };
    }
    if (startRes.canceled || !startRes.saveToken) {
      return { canceled: true };
    }

    const saveToken = startRes.saveToken;
    const CHUNK_SIZE = 8 * 1024 * 1024; // 8MB chunks to prevent huge single IPC buffer
    try {
      if (isBlob) {
        for (let offset = 0; offset < totalSize; offset += CHUNK_SIZE) {
          const slice = data.slice(offset, Math.min(offset + CHUNK_SIZE, totalSize));
          const chunkBuf = await slice.arrayBuffer();
          const chunkRes = await ipcRenderer.invoke('desktop:saveProjectChunk', {
            saveToken,
            buffer: chunkBuf
          });
          if (chunkRes.error) throw new Error(chunkRes.error);
        }
      } else {
        for (let offset = 0; offset < totalSize; offset += CHUNK_SIZE) {
          const chunkBuf = data.slice(offset, Math.min(offset + CHUNK_SIZE, totalSize));
          const chunkRes = await ipcRenderer.invoke('desktop:saveProjectChunk', {
            saveToken,
            buffer: chunkBuf
          });
          if (chunkRes.error) throw new Error(chunkRes.error);
        }
      }

      return await ipcRenderer.invoke('desktop:saveProjectFinish', {
        saveToken,
        expectedSize: totalSize
      });
    } catch (err) {
      await ipcRenderer.invoke('desktop:saveProjectCancel', { saveToken });
      return { canceled: false, error: err.message };
    }
  },

  uploadChunkedAsset: async (name, mimeType, blob) => {
    const isBlob = typeof Blob !== 'undefined' && blob instanceof Blob;
    const isBuffer = blob instanceof ArrayBuffer;
    if (!isBlob && !isBuffer) {
      throw new TypeError('Invalid arguments for uploadChunkedAsset: blob must be a Blob or ArrayBuffer');
    }

    const totalSize = isBlob ? blob.size : blob.byteLength;
    const token = await ipcRenderer.invoke('desktop:startChunkedAsset', { name, mimeType });
    const CHUNK_SIZE = 8 * 1024 * 1024;
    try {
      if (isBlob) {
        for (let offset = 0; offset < totalSize; offset += CHUNK_SIZE) {
          const slice = blob.slice(offset, Math.min(offset + CHUNK_SIZE, totalSize));
          const chunkBuf = await slice.arrayBuffer();
          await ipcRenderer.invoke('desktop:appendAssetChunk', { token, buffer: chunkBuf });
        }
      } else {
        for (let offset = 0; offset < totalSize; offset += CHUNK_SIZE) {
          const chunkBuf = blob.slice(offset, Math.min(offset + CHUNK_SIZE, totalSize));
          await ipcRenderer.invoke('desktop:appendAssetChunk', { token, buffer: chunkBuf });
        }
      }
      return await ipcRenderer.invoke('desktop:finishChunkedAsset', { token });
    } catch (err) {
      await ipcRenderer.invoke('desktop:cancelChunkedAsset', { token });
      throw err;
    }
  },

  setDirtyState: async (dirty) => {
    return await ipcRenderer.invoke('desktop:setDirtyState', !!dirty);
  },

  confirmQuit: async () => {
    return await ipcRenderer.invoke('desktop:confirmQuit');
  },

  onRequestSaveAndClose: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const listener = () => callback();
    ipcRenderer.on('desktop:requestSaveAndClose', listener);
    return () => {
      ipcRenderer.removeListener('desktop:requestSaveAndClose', listener);
    };
  },

  pickMedia: async (options = {}) => {
    return await ipcRenderer.invoke('desktop:pickMedia', {
      layer: String(options?.layer || 'media')
    });
  },

  ensureNativeAsset: async (itemId, arrayBuffer) => {
    if (!itemId || !(arrayBuffer instanceof ArrayBuffer)) {
      throw new TypeError('Invalid arguments for ensureNativeAsset');
    }
    return await ipcRenderer.invoke('desktop:ensureNativeAsset', {
      itemId: String(itemId),
      buffer: arrayBuffer
    });
  },

  fetchAssetData: async (token) => {
    if (!token || typeof token !== 'string') {
      throw new TypeError('Invalid token');
    }
    return await ipcRenderer.invoke('desktop:fetchAsset', { token });
  },

  startMatteJob: async (request) => {
    if (!request || typeof request !== 'object') {
      throw new TypeError('Invalid matte request');
    }
    return await ipcRenderer.invoke('desktop:startMatte', {
      version: 1,
      jobId: request.jobId ? String(request.jobId) : null,
      assetToken: String(request.assetToken),
      sourceId: String(request.sourceId),
      profile: String(request.profile),
      fps: Number(request.fps) || 24,
      duration: request.duration != null ? Number(request.duration) : null,
      slots: Array.isArray(request.slots) ? request.slots.map(Number) : [],
      priorMaskToken: request.priorMaskToken ? String(request.priorMaskToken) : null
    });
  },

  onMatteProgress: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const listener = (event, data) => callback(data);
    ipcRenderer.on('desktop:matteProgress', listener);
    return () => {
      ipcRenderer.removeListener('desktop:matteProgress', listener);
    };
  },

  getMatteResultBlob: async (maskToken) => {
    if (!maskToken || typeof maskToken !== 'string') {
      throw new TypeError('Invalid maskToken');
    }
    return await ipcRenderer.invoke('desktop:getMatteResult', { maskToken });
  },

  pickExportTarget: async (filename) => {
    return await ipcRenderer.invoke('desktop:pickExportTarget', {
      filename: String(filename || 'jizura.mp4')
    });
  },

  startExport: async (settings) => {
    if (!settings || typeof settings !== 'object') {
      throw new TypeError('Invalid export settings');
    }
    return await ipcRenderer.invoke('desktop:startExport', {
      version: 1,
      outputToken: String(settings.outputToken),
      width: Math.round(Number(settings.width)),
      height: Math.round(Number(settings.height)),
      fps: Number(settings.fps),
      frameCount: Math.round(Number(settings.frameCount)),
      qualityMode: String(settings.qualityMode || 'high'),
      bitrate: settings.bitrate != null ? Number(settings.bitrate) : null,
      qp: settings.qp != null ? Number(settings.qp) : null,
      audioBuffer: settings.audioBuffer instanceof ArrayBuffer ? settings.audioBuffer : null,
      audioExt: settings.audioExt ? String(settings.audioExt) : null,
      audioOffset: Number(settings.audioOffset) || 0,
      audioDuration: settings.audioDuration != null ? Number(settings.audioDuration) : null
    });
  },

  writeFrame: async (jobId, index, rgbaBuffer) => {
    if (!jobId || !(rgbaBuffer instanceof ArrayBuffer)) {
      throw new TypeError('Invalid arguments for writeFrame');
    }
    return await ipcRenderer.invoke('desktop:writeFrame', {
      jobId: String(jobId),
      index: Number(index),
      buffer: rgbaBuffer
    });
  },

  finishExport: async (jobId) => {
    return await ipcRenderer.invoke('desktop:finishExport', {
      jobId: String(jobId)
    });
  },

  cancelJob: async (jobId) => {
    return await ipcRenderer.invoke('desktop:cancelJob', {
      jobId: String(jobId)
    });
  }
};

contextBridge.exposeInMainWorld('jizuraDesktop', jizuraDesktop);
