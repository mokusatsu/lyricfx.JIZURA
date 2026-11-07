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
  const { chromium } = require('playwright');
  const executablePath = process.env.JIZURA_TEST_BROWSER || [
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

module.exports = { root, buildRoot, launchBrowser, loadApp, tempDirectory };
