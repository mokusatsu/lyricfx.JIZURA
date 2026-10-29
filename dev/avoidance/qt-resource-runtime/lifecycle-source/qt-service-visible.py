"""Tiny protected real-Qt lifecycle fixture: three plain pages, no media/Canvas."""
import json
import os
from pathlib import Path
from PyQt6.QtCore import QT_VERSION_STR
from PyQt6.QtWebEngineCore import qWebEngineVersion, qWebEngineChromiumVersion
import webview

assert not any('SANDBOX' in key for key in os.environ)
assert '--no-sandbox' not in os.environ.get('QTWEBENGINE_CHROMIUM_FLAGS', '')
windows = [webview.create_window('Jizura lifecycle '+str(i), html='<html><body>lifecycle</body></html>',
                                 width=160, height=90, hidden=False) for i in range(3)]


def ready():
    Path(os.environ['JIZURA_QT_STARTUP_REPORT']).write_text(json.dumps({
        'complete': True, 'Qt': QT_VERSION_STR, 'QtWebEngine': qWebEngineVersion(),
        'Chromium': qWebEngineChromiumVersion(), 'createdPages': len(windows),
        'scope': 'plain-page lifecycle only; no rendering/media acceptance'})+'\n')


webview.start(ready, gui='qt', debug=False)
