#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const desktopDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(desktopDir, '..');
const resourcesDir = path.resolve(desktopDir, 'resources');
const licensesDir = path.resolve(resourcesDir, 'licenses');

// Ensure directories exist
fs.mkdirSync(resourcesDir, { recursive: true });
fs.mkdirSync(licensesDir, { recursive: true });

// 1. Generate app-build.json
const pkgPath = path.resolve(desktopDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

let electronVersion = '43.4.0';
try {
  const electronPkgPath = path.resolve(desktopDir, 'node_modules/electron/package.json');
  if (fs.existsSync(electronPkgPath)) {
    const electronPkg = JSON.parse(fs.readFileSync(electronPkgPath, 'utf8'));
    electronVersion = electronPkg.version;
  }
} catch (e) {
  console.warn('[!] Failed to read installed electron version, fallback to package.json setting:', e.message);
}

const buildInfo = {
  schema: 'jizura-desktop-build/1',
  appVersion: pkg.version || '1.0.0',
  electronVersion: electronVersion,
  platform: 'win32',
  arch: 'x64'
};

const appBuildJsonPath = path.resolve(resourcesDir, 'app-build.json');
fs.writeFileSync(appBuildJsonPath, JSON.stringify(buildInfo, null, 2) + '\n', 'utf8');
console.log(`[*] Generated ${appBuildJsonPath}:`, JSON.stringify(buildInfo));

// 2. Prepare licenses
const rootLicensePath = path.resolve(repoRoot, 'LICENSE');
if (fs.existsSync(rootLicensePath)) {
  fs.copyFileSync(rootLicensePath, path.resolve(licensesDir, 'LICENSE.txt'));
}

const thirdPartyNotices = `# Third-Party Notices and Licenses

This distribution of lyricfx.JIZURA includes or depends on the following software:

## 1. lyricfx.JIZURA
- License: GNU General Public License v3.0 or later (GPL-3.0-or-later)
- Copyright (c) Keiji Okamoto

## 2. Electron
- License: MIT License
- Copyright (c) Electron contributors / OpenJS Foundation

## 3. ONNX Runtime & ONNX Runtime OpenVINO EP
- License: MIT License / Apache License 2.0
- Copyright (c) Microsoft Corporation / Intel Corporation

## 4. OpenVINO Toolkit
- License: Apache License 2.0
- Copyright (c) Intel Corporation

## 5. RobustVideoMatting (RVM)
- License: GPL-3.0 (Commercial license available by original author)
- Copyright (c) Shanchuan Lin

## 6. PyInstaller
- License: GPL-2.0 with special exception for distributed executables
`;

fs.writeFileSync(path.resolve(licensesDir, 'THIRD_PARTY_NOTICES.md'), thirdPartyNotices, 'utf8');
console.log(`[*] Licenses collected in ${licensesDir}`);
