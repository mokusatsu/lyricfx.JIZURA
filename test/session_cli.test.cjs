const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

console.log('[*] Testing CLI options and session isolation logic...');

// 1. Test CLI argument parser logic
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

// Case A: Invocation via shared Electron (Songcut integration)
const sharedArgv = [
  'C:\\songcut\\electron\\songcut-electron.exe',
  'C:\\songcut\\jizura\\resources\\app.asar',
  '--new-project',
  '--video',
  'C:\\path with spaces\\sample.mp4',
  '--lrc',
  'C:\\path with spaces\\sample.lrc'
];
const parsedA = parseCliArgs(sharedArgv);
assert.strictEqual(parsedA.newProject, true);
assert.strictEqual(parsedA.videoPath, path.resolve('C:\\path with spaces\\sample.mp4'));
assert.strictEqual(parsedA.lrcPath, path.resolve('C:\\path with spaces\\sample.lrc'));

// Case B: Invocation via standalone lyricfx-jizura.exe
const standaloneArgv = [
  'C:\\JIZURA\\lyricfx-jizura.exe',
  '--new-project',
  '--video',
  'D:\\videos\\test.webm'
];
const parsedB = parseCliArgs(standaloneArgv);
assert.strictEqual(parsedB.newProject, true);
assert.strictEqual(parsedB.videoPath, path.resolve('D:\\videos\\test.webm'));
assert.strictEqual(parsedB.lrcPath, null);

// 2. Test Session Temp Directory Isolation
const sessionId1 = `${process.pid}-${crypto.randomUUID().slice(0, 8)}`;
const sessionDir1 = path.join(os.tmpdir(), `lyricfx-session-${sessionId1}`);
fs.mkdirSync(path.join(sessionDir1, 'userData'), { recursive: true });
fs.mkdirSync(path.join(sessionDir1, 'sessionData'), { recursive: true });

assert.strictEqual(fs.existsSync(path.join(sessionDir1, 'userData')), true);
assert.strictEqual(fs.existsSync(path.join(sessionDir1, 'sessionData')), true);

// Verify another session gets a completely separate directory
const sessionId2 = `${process.pid}-${crypto.randomUUID().slice(0, 8)}`;
const sessionDir2 = path.join(os.tmpdir(), `lyricfx-session-${sessionId2}`);
assert.notStrictEqual(sessionDir1, sessionDir2);

// Clean up
fs.rmSync(sessionDir1, { recursive: true, force: true });
assert.strictEqual(fs.existsSync(sessionDir1), false);

console.log('[SUCCESS] All CLI parser and session isolation tests passed!');
