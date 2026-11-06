"""Build the Japanese and English editions from src/, app/ and vendor/.
usage: python3 build.py                              -> index.html and en/index.html (Web single-file)
       python3 build.py --dev                        -> also dev/www/jizura.js + dev/www/test.html
       python3 build.py --target electron            -> desktop/web/ with external JS/CSS
       python3 build.py --target electron --out <dir> -> custom output directory
"""
import glob, os, sys, base64, argparse
from app.english import localize_body, localize_js

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)

read = lambda p: open(p, encoding='utf-8').read()

def parse_args():
    parser = argparse.ArgumentParser(description='Build JIZURA editions')
    parser.add_argument('--target', choices=['web', 'electron'], default='web', help='Build target (web or electron)')
    parser.add_argument('--out', default=None, help='Output directory')
    parser.add_argument('--dev', action='store_true', help='Generate dev/www test bundle')
    return parser.parse_known_args()[0]

def build_web(out_dir, dev=False):
    sources = sorted(glob.glob('src/*.js'))
    js = '\n'.join(read(f) for f in sources)
    js = js.replace('__EFFECT_PREVIEW_IMAGE__', 'data:image/png;base64,' + base64.b64encode(open('assets/effect-preview.png', 'rb').read()).decode('ascii'))
    mux = '/*! mp4-muxer v5.2.2 | MIT License | (c) 2023 Vanilagy | see THIRD_PARTY_NOTICES.md */\n' + read('vendor/mp4-muxer.min.js')

    def build_lang(lang):
        english = lang == 'en'
        description = ('Turn lyrics into animated lyric videos in your browser and export MP4.' if english else '歌詞を入れると文字PV（リリックモーション）を自動で組み立てて MP4 に書き出すブラウザアプリ')
        title = 'lyricfx.JIZURA'
        canonical = 'https://hirazisora.github.io/JIZURA/en/' if english else 'https://hirazisora.github.io/JIZURA/'
        language_nav = ('<nav class="lang-switch" aria-label="Language"><a href="../index.html" lang="ja">日本語</a><span aria-current="page">English</span></nav>' if english else '<nav class="lang-switch" aria-label="言語"><span aria-current="page">日本語</span><a href="en/index.html" lang="en">English</a></nav>')
        body = read('app/body.html').replace('    <div class="acts">', '    ' + language_nav + '\n    <div class="acts">', 1)
        if english: body = localize_body(body)
        script = '\n'.join(localize_js(read(f), f) for f in sources) if english else js
        if english:
            marker = '/* ============================================================\n   JIZURA — editor UI'
            if marker not in script: raise ValueError('Could not find browser UI entry point')
            script = script.replace(marker, read('app/english.js') + '\n' + marker, 1)
        script = script.replace('__EFFECT_PREVIEW_IMAGE__', 'data:image/png;base64,' + base64.b64encode(open('assets/effect-preview.png', 'rb').read()).decode('ascii'))
        html = f'''<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="canonical" href="{canonical}">
<link rel="alternate" hreflang="ja" href="https://hirazisora.github.io/JIZURA/">
<link rel="alternate" hreflang="en" href="https://hirazisora.github.io/JIZURA/en/">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:url" content="{canonical}">
<meta name="twitter:card" content="summary">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<style>
{read('app/style.css')}
</style>
</head>
<body>
{body}
<script>
{mux}
</script>
<script>
{script}
</script>
</body>
</html>
'''
        target = os.path.join(out_dir, 'en/index.html') if english else os.path.join(out_dir, 'index.html')
        os.makedirs(os.path.dirname(target) or '.', exist_ok=True)
        open(target, 'w', encoding='utf-8').write(html)
        print(target, len(html), 'bytes')

    build_lang('ja')
    build_lang('en')

    if dev:
        os.makedirs('dev/www', exist_ok=True)
        open('dev/www/jizura.js', 'w', encoding='utf-8').write(js)
        open('dev/www/test.html', 'w', encoding='utf-8').write(read('dev/test.html'))
        print('dev/www ready: cd dev/www && python3 -m http.server 8765')

def build_electron(out_dir):
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(os.path.join(out_dir, 'vendor'), exist_ok=True)

    # 1. External CSS
    css_content = read('app/style.css')
    open(os.path.join(out_dir, 'app.css'), 'w', encoding='utf-8').write(css_content)

    # 2. External vendor libraries
    mux_content = '/*! mp4-muxer v5.2.2 | MIT License | (c) 2023 Vanilagy | see THIRD_PARTY_NOTICES.md */\n' + read('vendor/mp4-muxer.min.js')
    open(os.path.join(out_dir, 'vendor', 'mp4-muxer.min.js'), 'w', encoding='utf-8').write(mux_content)

    # 3. Collect sources with desktop adapter inserted right before 12_ui.js
    raw_sources = sorted(glob.glob('src/*.js'))
    backend_file = 'desktop/renderer/native-backend.js'
    sources = []
    for f in raw_sources:
        if os.path.basename(f) == '12_ui.js' and os.path.exists(backend_file):
            sources.append(backend_file)
        sources.append(f)

    effect_preview_b64 = 'data:image/png;base64,' + base64.b64encode(open('assets/effect-preview.png', 'rb').read()).decode('ascii')

    # Japanese bundle
    ja_script = '\n'.join(read(f) for f in sources)
    ja_script = ja_script.replace('__EFFECT_PREVIEW_IMAGE__', effect_preview_b64)
    open(os.path.join(out_dir, 'app.ja.js'), 'w', encoding='utf-8').write(ja_script)

    # English bundle
    en_script_parts = []
    for f in sources:
        content = read(f)
        if f == backend_file:
            en_script_parts.append(content)
        else:
            en_script_parts.append(localize_js(content, f))
    en_script = '\n'.join(en_script_parts)
    marker = '/* ============================================================\n   JIZURA — editor UI'
    if marker not in en_script:
        raise ValueError('Could not find browser UI entry point for English bundle')
    en_script = en_script.replace(marker, read('app/english.js') + '\n' + marker, 1)
    en_script = en_script.replace('__EFFECT_PREVIEW_IMAGE__', effect_preview_b64)
    open(os.path.join(out_dir, 'app.en.js'), 'w', encoding='utf-8').write(en_script)

    # 4. Generate HTML files
    def build_lang_html(lang):
        english = lang == 'en'
        rel_prefix = '../' if english else ''
        description = ('Turn lyrics into animated lyric videos in your browser and export MP4.' if english else '歌詞を入れると文字PV（リリックモーション）を自動で組み立てて MP4 に書き出すブラウザアプリ')
        title = 'lyricfx.JIZURA'
        language_nav = ('<nav class="lang-switch" aria-label="Language"><a href="../index.html" lang="ja">日本語</a><span aria-current="page">English</span></nav>' if english else '<nav class="lang-switch" aria-label="言語"><span aria-current="page">日本語</span><a href="en/index.html" lang="en">English</a></nav>')
        body = read('app/body.html').replace('    <div class="acts">', '    ' + language_nav + '\n    <div class="acts">', 1)
        if english: body = localize_body(body)

        # Content-Security-Policy for Electron:
        # script-src 'self' with local external scripts
        csp = "default-src 'self' data: blob: https:; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; media-src 'self' blob: data: jizura-asset:; connect-src 'self' data: blob: https: jizura-asset:;"

        html = f'''<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="{csp}">
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{rel_prefix}app.css">
</head>
<body>
{body}
<script src="{rel_prefix}vendor/mp4-muxer.min.js"></script>
<script src="{rel_prefix}app.{lang}.js"></script>
</body>
</html>
'''
        target = os.path.join(out_dir, 'en/index.html') if english else os.path.join(out_dir, 'index.html')
        os.makedirs(os.path.dirname(target) or '.', exist_ok=True)
        open(target, 'w', encoding='utf-8').write(html)
        print(target, len(html), 'bytes')

    build_lang_html('ja')
    build_lang_html('en')
    print(f'Electron web assets generated in {out_dir}')

if __name__ == '__main__':
    args = parse_args()
    if args.target == 'electron':
        out = args.out or os.path.join('desktop', 'web')
        build_electron(out)
    else:
        out = args.out or '.'
        build_web(out, dev=args.dev)
