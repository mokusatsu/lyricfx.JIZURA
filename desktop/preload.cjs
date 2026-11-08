const { contextBridge, ipcRenderer } = require('electron');

ipcRenderer.on('desktop:export-port', (event, { jobId }) => {
  window.postMessage({ type: 'jizura-export-port', jobId }, '*', event.ports);
});

const FILE_CHUNK_BYTES = 8 * 1024 * 1024;
async function* fileChunks(data) {
  const isBlob = typeof Blob !== 'undefined' && data instanceof Blob;
  const size = isBlob ? data.size : data.byteLength;
  const read = async offset => isBlob
    ? data.slice(offset, offset + FILE_CHUNK_BYTES).arrayBuffer()
    : data.slice(offset, offset + FILE_CHUNK_BYTES);
  let next = size ? read(0) : null;
  for (let offset = 0; offset < size; offset += FILE_CHUNK_BYTES) {
    const buffer = await next;
    if (buffer.byteLength !== Math.min(FILE_CHUNK_BYTES, size - offset)) throw new Error('File chunk size mismatch');
    next = offset + FILE_CHUNK_BYTES < size ? read(offset + FILE_CHUNK_BYTES) : null;
    // The caller acknowledges the current chunk before advancing. A failed
    // prefetch is handled here and rethrown when that chunk is consumed.
    next?.catch(() => {});
    yield buffer;
  }
}

/**
 * Purpose-specific IPC exposed to the renderer. File transfers keep at most
 * the current and next 8 MiB chunk; writes are acknowledged in order.
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
    try {
      for await (const buffer of fileChunks(data)) {
        const chunkRes = await ipcRenderer.invoke('desktop:saveProjectChunk', { saveToken, buffer });
        if (chunkRes.error) throw new Error(chunkRes.error);
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

    const token = await ipcRenderer.invoke('desktop:startChunkedAsset', { name, mimeType });
    try {
      for await (const buffer of fileChunks(blob)) {
        await ipcRenderer.invoke('desktop:appendAssetChunk', { token, buffer });
      }
      return await ipcRenderer.invoke('desktop:finishChunkedAsset', { token });
    } catch (err) {
      await ipcRenderer.invoke('desktop:cancelChunkedAsset', { token });
      throw err;
    }
  },

  setDirtyState: (dirty) => {
    try {
      ipcRenderer.sendSync('desktop:setDirtyStateSync', !!dirty);
      return true;
    } catch (e) {
      return ipcRenderer.invoke('desktop:setDirtyState', !!dirty);
    }
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

  getAssetInfo: async (token) => {
    if (!token || typeof token !== 'string') return null;
    return await ipcRenderer.invoke('desktop:getAssetInfo', { token });
  },

  fetchAssetChunk: async (token, offset, length) => {
    if (!token || typeof token !== 'string') throw new TypeError('Invalid token');
    return await ipcRenderer.invoke('desktop:fetchAssetChunk', { token, offset, length });
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
      jobId: settings.jobId ? String(settings.jobId) : null,
      width: Math.round(Number(settings.width)),
      height: Math.round(Number(settings.height)),
      fps: Number(settings.fps),
      frameCount: Math.round(Number(settings.frameCount)),
      qualityMode: String(settings.qualityMode || 'high'),
      bitrate: settings.bitrate != null ? Number(settings.bitrate) : null,
      qp: settings.qp != null ? Number(settings.qp) : null,
      encoder: settings.encoder ? String(settings.encoder) : 'auto',
      pipeline: String(settings.pipeline || 'legacy'),
      sources: Array.isArray(settings.sources) ? settings.sources.map(source => ({
        id: String(source.id), assetToken: String(source.assetToken),
        start: Number(source.start), end: Number(source.end),
        displayWidth: Number(source.displayWidth), displayHeight: Number(source.displayHeight),
        rotation: Number(source.rotation) || 0, flip: !!source.flip,
        colorSpace: source.colorSpace ? {
          primaries: source.colorSpace.primaries, transfer: source.colorSpace.transfer,
          matrix: source.colorSpace.matrix, fullRange: source.colorSpace.fullRange
        } : null
      })) : [],
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

  readExportFrame: async (jobId, cursor, time, after) => {
    return await ipcRenderer.invoke('desktop:readExportFrame', {
      jobId: String(jobId), cursor: String(cursor), time: Number(time), after: Number(after)
    });
  },

  releaseExportSource: async (jobId, cursor) => {
    return await ipcRenderer.invoke('desktop:releaseExportSource', { jobId: String(jobId), cursor: String(cursor) });
  },

  cancelJob: async (jobId) => {
    return await ipcRenderer.invoke('desktop:cancelJob', {
      jobId: String(jobId)
    });
  }
};

contextBridge.exposeInMainWorld('jizuraDesktop', jizuraDesktop);
