"""Read-only verification of the limited cylinder merge; no build or main writes."""
from pathlib import Path
import difflib
import gzip
import hashlib
import json
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[4]
EVIDENCE = Path(__file__).resolve().parent
sha = lambda value: hashlib.sha256(value).hexdigest()
receipt = json.loads((EVIDENCE / 'integration-receipt01.json').read_text())

def canonical(name):
    return subprocess.check_output(['git', 'show', '14beefb:' + name], cwd=ROOT)

def changes(before, after):
    before, after = before.splitlines(keepends=True), after.splitlines(keepends=True)
    return [(b''.join(before[i:j]), b''.join(after[k:l]))
            for tag, i, j, k, l in difflib.SequenceMatcher(None, before, after, autojunk=False).get_opcodes()
            if tag != 'equal']

start09a = gzip.decompress((EVIDENCE / 'src__09a_placement.js.start.gz').read_bytes())
start09l = gzip.decompress((EVIDENCE / 'src__09l_layoutsD_fisheye.js.start.gz').read_bytes())
for name, patch in [('src/09a_placement.js', 'cylinder-band-bridge09a.patch'),
                    ('src/11p_layoutsD.js', 'cylinder-source.patch')]:
    original = canonical(name)
    with tempfile.TemporaryDirectory(prefix='cylinder-inverse-') as folder:
        target = Path(folder) / name
        target.parent.mkdir()
        target.write_bytes(original)
        subprocess.run(['patch', '--fuzz=0', '-p1', '-i', str(EVIDENCE / patch)], cwd=folder, check=True, capture_output=True)
        approved = target.read_bytes()
    start = start09a if name.endswith('09a_placement.js') else original
    assert changes(start, (ROOT / name).read_bytes()) == changes(original, approved), name

for name in ['index.html', 'en/index.html']:
    base = canonical(name)
    start = base.replace(canonical('src/09a_placement.js'), start09a).replace(canonical('src/09l_layoutsD_fisheye.js'), start09l)
    expected = next(pin['startSHA256'] for pin in receipt['pins'] if pin['file'] == name)
    assert sha(start) == expected, name + ' start reconstruction'
    current = (ROOT / name).read_bytes()
    reverse = current.replace((ROOT / 'src/09a_placement.js').read_bytes(), start09a)
    reverse = reverse.replace((ROOT / 'src/11p_layoutsD.js').read_bytes(), canonical('src/11p_layoutsD.js'))
    origami = (ROOT / 'src/09n_layoutsD_origami.js').read_bytes()
    cylinder = (ROOT / 'src/09o_layoutsD_cylinder.js').read_bytes()
    assert reverse.count(origami + b'\n' + cylinder) == 1
    reverse = reverse.replace(origami + b'\n' + cylinder, origami)
    assert reverse == start, name + ' non-target bytes'

for pin in receipt['pins']:
    assert sha((ROOT / pin['file']).read_bytes()) == pin['endSHA256'], pin['file']
originals = json.loads((EVIDENCE / 'all-start-source-pycache.json').read_text())
changed = sorted(name for name, digest in originals.items() if sha((ROOT / name).read_bytes()) != digest)
assert changed == ['src/09a_placement.js', 'src/11p_layoutsD.js'], changed
print('PASS: exact approved patch deltas, JA/EN inverse bytes, end pins, all unrelated source/pycache preservation')
