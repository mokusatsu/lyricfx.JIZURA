const { app, BrowserWindow, dialog, ipcMain, protocol, shell, net } = require('electron');
const path = require('node:path');
const { NativeJobs } = require('./native-jobs.cjs');

// Register custom protocol scheme privileges before app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'jizura-asset',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true
    }
  }
]);

let mainWindow = null;
let nativeJobs = null;
let isPickerOpen = false;

function createWindow() {
  nativeJobs = new NativeJobs();

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'lyricfx.JIZURA',
    backgroundColor: '#0c0d10',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  // Secure navigation: reject arbitrary navigation and window.open
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file:') && !url.startsWith('about:blank')) {
      event.preventDefault();
      if (url.startsWith('https:') || url.startsWith('http:')) {
        shell.openExternal(url);
      }
    }
  });

  const entryHtml = path.join(__dirname, 'web', 'index.html');
  mainWindow.loadFile(entryHtml);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Setup custom streaming protocol for assets
function setupAssetProtocol() {
  protocol.handle('jizura-asset', async (request) => {
    try {
      const url = new URL(request.url);
      const token = url.hostname || url.pathname.replace(/^\/+/, '');
      const asset = nativeJobs ? nativeJobs.getAsset(token) : null;
      if (!asset) {
        return new Response('Asset not found', { status: 404 });
      }
      return net.fetch(`file:///${asset.filePath.replace(/\\/g, '/')}`);
    } catch (e) {
      return new Response(e.message, { status: 500 });
    }
  });
}

// Setup IPC handlers
function setupIpcHandlers() {
  ipcMain.handle('desktop:capabilities', async () => {
    return await nativeJobs.getCapabilities();
  });

  ipcMain.handle('desktop:pickMedia', async (event, { layer }) => {
    if (isPickerOpen) {
      return [];
    }
    isPickerOpen = true;
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        title: layer === 'foreground' ? '前景素材を選択' : '背景素材を選択',
        properties: ['openFile', 'multiSelections'],
        filters: [
          {
            name: 'Media Files (Video / Image)',
            extensions: ['mp4', 'webm', 'mov', 'png', 'jpg', 'jpeg', 'webp', 'gif']
          }
        ]
      });

      if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
        return [];
      }

      const descriptors = [];
      for (const filePath of result.filePaths) {
        try {
          const ext = path.extname(filePath).toLowerCase();
          const isVideo = ['.mp4', '.webm', '.mov'].includes(ext);
          const mimeType = isVideo ? 'video/mp4' : 'image/png';
          const desc = nativeJobs.registerAssetFile(filePath, mimeType);
          descriptors.push(desc);
        } catch (err) {
          console.error(`Failed to register asset ${filePath}:`, err);
        }
      }
      return descriptors;
    } finally {
      isPickerOpen = false;
    }
  });

  ipcMain.handle('desktop:ensureNativeAsset', async (event, { itemId, buffer }) => {
    return nativeJobs.ensureNativeAsset(itemId, buffer);
  });

  ipcMain.handle('desktop:fetchAsset', async (event, { token }) => {
    const buffer = nativeJobs.readAssetBuffer(token);
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  });

  ipcMain.handle('desktop:startMatte', async (event, request) => {
    return await nativeJobs.startMatteJob(event.sender, request);
  });

  ipcMain.handle('desktop:getMatteResult', async (event, { maskToken }) => {
    const buffer = nativeJobs.getMatteResultBlob(maskToken);
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  });

  ipcMain.handle('desktop:pickExportTarget', async (event, { filename }) => {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'MP4 保存先を選択',
      defaultPath: filename,
      filters: [{ name: 'MP4 Video', extensions: ['mp4'] }]
    });

    if (result.canceled || !result.filePath) {
      return { cancelled: true };
    }

    const outputToken = nativeJobs.registerOutput(result.filePath);
    return {
      cancelled: false,
      outputToken,
      filePath: result.filePath
    };
  });

  ipcMain.handle('desktop:startExport', async (event, settings) => {
    return await nativeJobs.startExportJob(event.sender, settings);
  });

  ipcMain.handle('desktop:writeFrame', async (event, { jobId, index, buffer }) => {
    return await nativeJobs.writeFrame(jobId, index, buffer);
  });

  ipcMain.handle('desktop:finishExport', async (event, { jobId }) => {
    return await nativeJobs.finishExport(jobId);
  });

  ipcMain.handle('desktop:cancelJob', async (event, { jobId }) => {
    return nativeJobs.cancelJob(jobId);
  });
}

app.whenReady().then(() => {
  setupAssetProtocol();
  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', () => {
  if (nativeJobs) {
    nativeJobs.cleanupAll();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
