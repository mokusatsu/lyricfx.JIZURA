# -*- mode: python ; coding: utf-8 -*-
import os, sys

block_cipher = None

a = Analysis(
    ['worker.py'],
    pathex=['.'],
    binaries=[],
    datas=[
        ('models', 'models'),
        ('resources-manifest.json', '.'),
    ],
    hiddenimports=[
        'onnxruntime',
        'PIL',
        'numpy',
        'matting',
        'export_video',
        'matte_format',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['tkinter', 'matplotlib', 'scipy'],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='worker',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True, # stdin/stdout communication requires console executable; hide in spawn
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='worker',
)
