const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const buildRoot = path.resolve(process.env.JIZURA_TEST_BUILD_DIR || root);

function tempDirectory(prefix = 'browser-') {
  const directory = path.join(root, '.codex-temp', 'tests');
  fs.mkdirSync(directory, { recursive: true });
  return fs.mkdtempSync(path.join(directory, prefix));
}

async function launchBrowser(options = {}) {
  const runtime = path.join(root, '.codex-temp', 'tests', 'browser-runtime');
  fs.mkdirSync(runtime, { recursive: true });
  // Playwright creates its profiles in the test process's temporary directory.
  for (const key of ['TEMP', 'TMP', 'TMPDIR']) process.env[key] = runtime;
  const { chromium } = require('playwright');
  const executablePath = process.env.JIZURA_TEST_BROWSER || process.env.CHROMIUM_PATH || process.env.EDGE_PATH || [
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
  ].find(file => fs.existsSync(file));
  return chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}), ...options });
}

async function loadApp(page, { locale = '', origin = 'http://localhost:8765', directory = buildRoot } = {}) {
  const url = `${origin.replace(/\/$/, '')}/${locale ? locale.replace(/\/$/, '') + '/' : ''}`;
  const html = fs.readFileSync(path.join(directory, locale, 'index.html'));
  await page.route('**/*', route => route.request().url() === url
    ? route.fulfill({ contentType: 'text/html', body: html }) : route.abort());
  await page.goto(url);
  await page.waitForFunction(() => !!window.J?.ui?.plan);
}

async function importProject(page, project, name = 'fixture.lyricfx') {
  const bytes = await page.evaluate(async project => Array.from(new Uint8Array(
    await (await J.packProject(project, null)).arrayBuffer())), project);
  await page.locator('#fileProject').setInputFiles({ name, mimeType: 'application/octet-stream', buffer: Buffer.from(bytes) });
  await page.waitForFunction(() => !J.ui.projectBusy);
}

module.exports = { root, buildRoot, launchBrowser, loadApp, importProject, tempDirectory };
