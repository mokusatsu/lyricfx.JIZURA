# -*- mode: python ; coding: utf-8 -*-
import os, sys
from PyInstaller.utils.hooks import collect_all

block_cipher = None

backend = os.environ.get('JIZURA_BACKEND', 'openvino').lower()
print(f"[*] Building native worker targeting backend: {backend}")

extra_datas = [
    ('resources-manifest.json', '.'),
]
extra_binaries = []
extra_hiddenimports = [
    'onnxruntime',
    'PIL',
    'numpy',
    'matting',
    'export_video',
    'export_session',
    'matte_format',
]

if backend == 'openvino':
    for pkg in ['onnxruntime_ep_openvino', 'openvino']:
        try:
            d, b, h = collect_all(pkg)
            extra_datas.extend(d)
            extra_binaries.extend(b)
            extra_hiddenimports.extend(h)
        except Exception as e:
            print(f"[!] Warning: failed to collect {pkg}: {e}")
elif backend == 'directml':
    try:
        d, b, h = collect_all('onnxruntime')
        extra_datas.extend(d)
        extra_binaries.extend(b)
        extra_hiddenimports.extend(h)
    except Exception as e:
        print(f"[!] Warning: failed to collect onnxruntime: {e}")
elif backend == 'cuda':
    try:
        d, b, h = collect_all('onnxruntime')
        extra_datas.extend(d)
        extra_binaries.extend(b)
        extra_hiddenimports.extend(h)
    except Exception as e:
        print(f"[!] Warning: failed to collect onnxruntime: {e}")

a = Analysis(
    ['worker.py'],
    pathex=['.'],
    binaries=extra_binaries,
    datas=extra_datas,
    hiddenimports=extra_hiddenimports,
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
