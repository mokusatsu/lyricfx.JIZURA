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

// 3. Test Stale Session Cleanup: Must NEVER delete directories of active/running PIDs, even if older than 24h
function isPidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

function cleanupStaleSessions(tmpBase) {
  try {
    const entries = fs.readdirSync(tmpBase, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.isDirectory() && ent.name.startsWith('lyricfx-session-')) {
        const fullPath = path.join(tmpBase, ent.name);
        const match = ent.name.match(/^lyricfx-session-(\d+)-/);
        let isDead = false;
        if (match) {
          const ownerPid = parseInt(match[1], 10);
          if (ownerPid > 0 && !isPidAlive(ownerPid)) {
            isDead = true;
          }
        }
        try {
          const stat = fs.statSync(fullPath);
          const ageMs = Date.now() - stat.mtimeMs;
          if (isDead && ageMs > 600000) {
            fs.rmSync(fullPath, { recursive: true, force: true });
          }
        } catch (e) {}
      }
    }
  } catch (e) {}
}

const testTmpBase = path.join(os.tmpdir(), `lyricfx_test_cleanup_${Date.now()}`);
fs.mkdirSync(testTmpBase, { recursive: true });

try {
  // Directory owned by CURRENT (alive) process, with mtime 48 hours ago
  const aliveSessionDir = path.join(testTmpBase, `lyricfx-session-${process.pid}-alive123`);
  fs.mkdirSync(aliveSessionDir, { recursive: true });
  const oldTime = new Date(Date.now() - 48 * 3600 * 1000);
  fs.utimesSync(aliveSessionDir, oldTime, oldTime);

  // Directory owned by DEAD process (PID 999999), with mtime 48 hours ago
  const deadSessionDir = path.join(testTmpBase, `lyricfx-session-999999-dead123`);
  fs.mkdirSync(deadSessionDir, { recursive: true });
  fs.utimesSync(deadSessionDir, oldTime, oldTime);

  // Run cleanup
  cleanupStaleSessions(testTmpBase);

  // Alive session MUST be preserved!
  assert.strictEqual(fs.existsSync(aliveSessionDir), true, 'Session directory of alive process must NOT be deleted even after 24 hours');
  // Dead session MUST be cleaned up!
  assert.strictEqual(fs.existsSync(deadSessionDir), false, 'Session directory of dead process must be deleted after timeout');
} finally {
  fs.rmSync(testTmpBase, { recursive: true, force: true });
}

console.log('[SUCCESS] All CLI parser and session isolation tests passed!');
