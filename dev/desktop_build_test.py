import os, sys, shutil, tempfile, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def run_build(args):
    cmd = [sys.executable, os.path.join(ROOT, 'build.py')] + args
    res = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
    if res.returncode != 0:
        print("STDOUT:", res.stdout)
        print("STDERR:", res.stderr)
        raise RuntimeError(f"build.py failed with code {res.returncode}")
    return res

def test_desktop_build():
    tmp_dir = tempfile.mkdtemp(prefix='jizura_desktop_test_')
    try:
        run_build(['--target', 'electron', '--out', tmp_dir])

        # Check required files
        expected_files = [
            'index.html',
            os.path.join('en', 'index.html'),
            'app.css',
            'app.ja.js',
            'app.en.js',
            os.path.join('vendor', 'mp4-muxer.min.js')
        ]
        for rel in expected_files:
            p = os.path.join(tmp_dir, rel)
            assert os.path.exists(p), f"Missing expected file: {rel}"
            assert os.path.getsize(p) > 0, f"File is empty: {rel}"

        # Inspect index.html
        ja_html = open(os.path.join(tmp_dir, 'index.html'), encoding='utf-8').read()
        assert '<link rel="stylesheet" href="app.css">' in ja_html
        assert '<script src="vendor/mp4-muxer.min.js"></script>' in ja_html
        assert '<script src="app.ja.js"></script>' in ja_html
        assert "Content-Security-Policy" in ja_html
        assert "script-src 'self'" in ja_html

        # Inspect en/index.html
        en_html = open(os.path.join(tmp_dir, 'en', 'index.html'), encoding='utf-8').read()
        assert '<link rel="stylesheet" href="../app.css">' in en_html
        assert '<script src="../vendor/mp4-muxer.min.js"></script>' in en_html
        assert '<script src="../app.en.js"></script>' in en_html
        assert "Content-Security-Policy" in en_html
        assert "script-src 'self'" in en_html

        # Check JS bundles
        ja_js = open(os.path.join(tmp_dir, 'app.ja.js'), encoding='utf-8').read()
        en_js = open(os.path.join(tmp_dir, 'app.en.js'), encoding='utf-8').read()
        assert 'J.platform = {' in ja_js
        assert 'J.platform = {' in en_js
        assert '__EFFECT_PREVIEW_IMAGE__' not in ja_js
        assert '__EFFECT_PREVIEW_IMAGE__' not in en_js

        print("Desktop build test passed successfully.")
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)

if __name__ == '__main__':
    test_desktop_build()
