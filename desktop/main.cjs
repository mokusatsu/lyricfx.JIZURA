const { app, BrowserWindow, dialog, ipcMain, protocol, shell, net } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const fs = require('node:fs');
const os = require('node:os');
const crypto = require('node:crypto');
const { NativeJobs } = require('./native-jobs.cjs');

// Parse CLI options (handles shared Electron entrypoint and direct invocation)
function parseCliArgs(argv) {
  let args = argv.slice(1);
  if (args.length > 0) {
    const first = args[0].toLowerCase();
    if (first.endsWith('.asar') || first.endsWith('main.cjs') || first === '.' || first.endsWith('electron.exe') || first.endsWith('lyricfx-jizura.exe')) {
      args = args.slice(1);
    }
  }
  const opts = { newProject: false, videoPath: null, lrcPath: null };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--new-project') {
      opts.newProject = true;
    } else if (a === '--video' && i + 1 < args.length) {
      opts.videoPath = path.resolve(args[++i]);
    } else if (a === '--lrc' && i + 1 < args.length) {
      opts.lrcPath = path.resolve(args[++i]);
    }
  }
  return opts;
}

const cliOptions = parseCliArgs(process.argv);
let currentSessionDir = null;

// Clean up dead session directories without touching active sessions or user data
function cleanupStaleSessions() {
  try {
    const tmp = os.tmpdir();
    const entries = fs.readdirSync(tmp);
    const now = Date.now();
    for (const name of entries) {
      if (name.startsWith('lyricfx-session-')) {
        const parts = name.split('-');
        const pid = parseInt(parts[2], 10);
        const dirPath = path.join(tmp, name);
        let isDead = false;
        if (!isNaN(pid)) {
          try {
            process.kill(pid, 0);
          } catch (e) {
            if (e.code === 'ESRCH') isDead = true;
          }
        }
        try {
          const stat = fs.statSync(dirPath);
          const ageMs = now - stat.mtimeMs;
          if (isDead && ageMs > 600000) {
            fs.rmSync(dirPath, { recursive: true, force: true });
          }
        } catch (e) {}
      }
    }
  } catch (e) {}
}

// Ensure isolated userData and sessionData for --new-project before app is ready
if (cliOptions.newProject) {
  cleanupStaleSessions();
  const sessionId = `${process.pid}-${crypto.randomUUID().slice(0, 8)}`;
  currentSessionDir = path.join(os.tmpdir(), `lyricfx-session-${sessionId}`);
  try {
    fs.mkdirSync(currentSessionDir, { recursive: true });
    const userDataDir = path.join(currentSessionDir, 'userData');
    const sessionDataDir = path.join(currentSessionDir, 'sessionData');
    fs.mkdirSync(userDataDir, { recursive: true });
    fs.mkdirSync(sessionDataDir, { recursive: true });
    app.setPath('userData', userDataDir);
    app.setPath('sessionData', sessionDataDir);
  } catch (err) {
    dialog.showErrorBox(
      '初期化エラー',
      `作業用セッションディレクトリの作成に失敗しました: ${err.message}\n起動を中止します。`
    );
    app.exit(1);
  }
}

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
let isProjectDirty = !!(cliOptions.newProject || cliOptions.videoPath || cliOptions.lrcPath);
let isQuittingConfirmed = false;

function detectVideoMime(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.mp4': return 'video/mp4';
    case '.webm': return 'video/webm';
    case '.mov': return 'video/quicktime';
    default: return null;
  }
}

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

  // Relay renderer errors to terminal for debugging
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    if (level >= 3) {
      console.error(`[Renderer Error] ${message} (${sourceId}:${line})`);
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

  // Synchronously intercept close event when project is unsaved
  mainWindow.on('close', (e) => {
    if (isQuittingConfirmed) return;

    if (isProjectDirty) {
      e.preventDefault();

      const choice = dialog.showMessageBoxSync(mainWindow, {
        type: 'question',
        buttons: ['保存する', '破棄して終了', 'キャンセル'],
        defaultId: 0,
        cancelId: 2,
        noLink: true,
        title: '未保存のプロジェクト',
        message: 'プロジェクトはまだファイルに保存されていません。',
        detail: '変更を保存しますか？ 保存せずに終了すると編集内容は失われます。'
      });

      if (choice === 0) {
        mainWindow.webContents.send('desktop:requestSaveAndClose');
      } else if (choice === 1) {
        isQuittingConfirmed = true;
        mainWindow.destroy();
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
      const fileUrl = pathToFileURL(asset.filePath).toString();
      return net.fetch(fileUrl);
    } catch (e) {
      return new Response(e.message, { status: 500 });
    }
  });
}

// Setup IPC handlers
function setupIpcHandlers() {
  const activeProjectSaves = new Map();

  ipcMain.handle('desktop:saveProjectStart', async (event, { defaultName }) => {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'プロジェクトを保存',
      defaultPath: defaultName || 'project.lyricfx',
      filters: [
        { name: 'lyricfx Project (*.lyricfx)', extensions: ['lyricfx'] },
        { name: 'Legacy Project (*.jizuraichi)', extensions: ['jizuraichi'] },
        { name: 'All Files (*.*)', extensions: ['*'] }
      ]
    });

    if (result.canceled || !result.filePath) {
      return { canceled: true };
    }

    const targetPath = result.filePath;
    const targetDir = path.dirname(targetPath);
    const saveToken = crypto.randomUUID();
    const tmpPath = path.join(targetDir, `.tmp_proj_${saveToken}_${Date.now()}.part`);

    try {
      fs.writeFileSync(tmpPath, Buffer.alloc(0));
      activeProjectSaves.set(saveToken, { targetPath, tmpPath, size: 0 });
      return { canceled: false, saveToken, targetPath };
    } catch (err) {
      return { canceled: false, error: err.message };
    }
  });

  ipcMain.handle('desktop:saveProjectChunk', async (event, { saveToken, buffer }) => {
    const save = activeProjectSaves.get(saveToken);
    if (!save) return { error: 'Invalid save token' };
    try {
      fs.appendFileSync(save.tmpPath, Buffer.from(buffer));
      save.size += buffer.byteLength;
      return { ok: true, size: save.size };
    } catch (err) {
      return { error: err.message };
    }
  });

  ipcMain.handle('desktop:saveProjectFinish', async (event, { saveToken, expectedSize }) => {
    const save = activeProjectSaves.get(saveToken);
    if (!save) return { error: 'Invalid save token' };
    activeProjectSaves.delete(saveToken);

    try {
      const stat = fs.statSync(save.tmpPath);
      if (expectedSize !== undefined && expectedSize !== null && stat.size !== expectedSize) {
        try { fs.unlinkSync(save.tmpPath); } catch (e) {}
        return { error: `File size mismatch (expected ${expectedSize}, got ${stat.size})` };
      }

      // Safe atomic replacement preserving existing file on write failure
      try {
        fs.renameSync(save.tmpPath, save.targetPath);
      } catch (renameErr) {
        fs.copyFileSync(save.tmpPath, save.targetPath);
        try { fs.unlinkSync(save.tmpPath); } catch (e) {}
      }

      isProjectDirty = false;
      const base = path.basename(save.targetPath, path.extname(save.targetPath));
      return { canceled: false, filePath: save.targetPath, name: base };
    } catch (err) {
      try { fs.unlinkSync(save.tmpPath); } catch (e) {}
      return { error: err.message };
    }
  });

  ipcMain.handle('desktop:saveProjectCancel', async (event, { saveToken }) => {
    const save = activeProjectSaves.get(saveToken);
    if (save) {
      activeProjectSaves.delete(saveToken);
      try { fs.unlinkSync(save.tmpPath); } catch (e) {}
    }
    return { ok: true };
  });

  ipcMain.handle('desktop:saveProjectFile', async (event, { defaultName, buffer }) => {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'プロジェクトを保存',
      defaultPath: defaultName || 'project.lyricfx',
      filters: [
        { name: 'lyricfx Project (*.lyricfx)', extensions: ['lyricfx'] },
        { name: 'Legacy Project (*.jizuraichi)', extensions: ['jizuraichi'] },
        { name: 'All Files (*.*)', extensions: ['*'] }
      ]
    });

    if (result.canceled || !result.filePath) {
      return { canceled: true };
    }

    const targetPath = result.filePath;
    const targetDir = path.dirname(targetPath);
    const tmpPath = path.join(targetDir, `.tmp_proj_${Date.now()}_${process.pid}.part`);

    try {
      fs.writeFileSync(tmpPath, Buffer.from(buffer));
      try {
        fs.renameSync(tmpPath, targetPath);
      } catch (renameErr) {
        fs.copyFileSync(tmpPath, targetPath);
        try { fs.unlinkSync(tmpPath); } catch (e) {}
      }
      isProjectDirty = false;
      const base = path.basename(targetPath, path.extname(targetPath));
      return { canceled: false, filePath: targetPath, name: base };
    } catch (err) {
      try { fs.unlinkSync(tmpPath); } catch (e) {}
      return { canceled: false, error: err.message };
    }
  });

  ipcMain.handle('desktop:startChunkedAsset', async (event, { name, mimeType }) => {
    return nativeJobs.startChunkedAsset(name, mimeType);
  });

  ipcMain.handle('desktop:appendAssetChunk', async (event, { token, buffer }) => {
    return nativeJobs.appendAssetChunk(token, buffer);
  });

  ipcMain.handle('desktop:finishChunkedAsset', async (event, { token }) => {
    return nativeJobs.finishChunkedAsset(token);
  });

  ipcMain.handle('desktop:cancelChunkedAsset', async (event, { token }) => {
    return nativeJobs.cancelChunkedAsset(token);
  });

  ipcMain.handle('desktop:capabilities', async () => {
    return await nativeJobs.getCapabilities();
  });

  ipcMain.handle('desktop:getInitialProjectData', async () => {
    if (!cliOptions.videoPath && !cliOptions.lrcPath && !cliOptions.newProject) {
      return { hasInitialProject: false };
    }

    let videoAsset = null;
    let videoError = null;
    if (cliOptions.videoPath) {
      if (!fs.existsSync(cliOptions.videoPath)) {
        videoError = `動画ファイルが見つかりません: ${cliOptions.videoPath}`;
      } else {
        const mime = detectVideoMime(cliOptions.videoPath);
        if (!mime) {
          videoError = `対応していない動画形式です: ${path.extname(cliOptions.videoPath)} (.mp4, .webm, .mov のみ対応)`;
        } else {
          try {
            videoAsset = nativeJobs.registerAssetFile(cliOptions.videoPath, mime, path.basename(cliOptions.videoPath), { noCopy: true });
          } catch (err) {
            videoError = `動画の登録に失敗しました: ${err.message}`;
          }
        }
      }
    }

    let lrcContent = null;
    let lrcError = null;
    if (cliOptions.lrcPath) {
      if (!fs.existsSync(cliOptions.lrcPath)) {
        lrcError = `LRC ファイルが見つかりません: ${cliOptions.lrcPath}`;
      } else {
        try {
          let raw = fs.readFileSync(cliOptions.lrcPath, 'utf8');
          if (raw.charCodeAt(0) === 0xFEFF) {
            raw = raw.slice(1);
          }
          if (!raw.trim()) {
            lrcError = `LRC ファイルが空です: ${cliOptions.lrcPath}`;
          } else {
            lrcContent = raw;
          }
        } catch (err) {
          lrcError = `LRC ファイルの読み込みに失敗しました: ${err.message}`;
        }
      }
    }

    return {
      hasInitialProject: true,
      newProject: cliOptions.newProject,
      video: videoAsset,
      videoError,
      lrc: lrcContent,
      lrcError
    };
  });

  ipcMain.handle('desktop:setDirtyState', async (event, dirty) => {
    isProjectDirty = !!dirty;
    return true;
  });

  ipcMain.handle('desktop:confirmQuit', async () => {
    isQuittingConfirmed = true;
    if (mainWindow) {
      mainWindow.close();
    }
    return true;
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
          const mimeType = detectVideoMime(filePath) || 'image/png';
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

app.on('will-quit', () => {
  if (currentSessionDir && fs.existsSync(currentSessionDir)) {
    try {
      fs.rmSync(currentSessionDir, { recursive: true, force: true });
    } catch (e) {}
  }
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
