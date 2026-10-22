"""Immutable start/end identity for the integration's source, compiled files and drivers."""
from pathlib import Path
import gzip, hashlib, json, sys
root = Path(__file__).resolve().parents[2]
out = root / 'tasks/evidence/AVOID-008/editorial/integrated01'
mode = sys.argv[1]
paths = sorted(set([*root.glob('src/*.js'), root/'index.html', root/'en/index.html', *root.glob('dev/avoidance/layouts-c-editorial*.*'), *root.glob('dev/avoidance/layouts-c-editorial-fonts/*'), *root.glob('dev/avoidance/layouts-?-fixture.js'), root/'dev/browser.cjs']))
pins = {str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest() for p in paths if p.is_file()}
target = out / f'{mode}-pins.json'
assert not target.exists(), 'Keep old pin receipts'
if mode == 'start':
    for key in pins:
        (out / ('input-' + key.replace('/', '__') + '.gz')).write_bytes(gzip.compress((root/key).read_bytes(), mtime=0))
else:
    assert mode == 'end'
    start = json.loads((out/'start-pins.json').read_text())
    assert start == pins, 'Inputs changed during the integration checks'
target.write_text(json.dumps(pins, indent=2)+'\n')
print(json.dumps({'mode':mode,'inputs':len(pins),'identical':mode=='end'}))
