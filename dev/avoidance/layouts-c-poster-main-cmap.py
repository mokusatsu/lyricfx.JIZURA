"""Verify pinned real font bytes and actual cmap, then every emitted matrix glyph."""
from pathlib import Path
from fontTools.ttLib import TTFont
import hashlib, json, sys
root = Path(__file__).resolve().parents[2]
folder = root / 'dev/avoidance/layouts-c-editorial-fonts'
manifest = json.loads((folder/'manifest.json').read_text())
matrix = json.loads((root/sys.argv[1]).read_text())
target = root/sys.argv[2]
assert not target.exists(), 'Preserve earlier receipts'
faces, cmaps = [], {}
for face in manifest['faces']:
    p = folder/face['file']
    digest = hashlib.sha256(p.read_bytes()).hexdigest()
    assert digest == face['sourceSHA256'], face['id']+' font bytes changed'
    actual = set(TTFont(p).getBestCmap())
    assert actual == set(face['codepoints']), face['id']+' manifest is not actual cmap'
    cmaps[face['id']] = actual
    faces.append({'id':face['id'],'sha256':digest,'actualCmapCount':len(actual),'manifestIdentical':True})
rows = []
for row in matrix['rows']:
    for role, corpus in {'native-emitted':row['corpus']}.items():
        for glyph in corpus:
            cp = ord(glyph['char'])
            assigned = cp in cmaps.get(glyph['face'], set())
            explicit_symbol = not assigned and cp in cmaps['symbols']
            assert assigned or explicit_symbol, (row['id'],role,glyph)
        rows.append({'id':row['id'],'role':role,'glyphAssignments':len(corpus),'assignedFaces':sorted(set(g['face'] for g in corpus))})
result = {'scope':'All eight real subset byte/cmap identities and actual emitted Poster native corpus; no system fallback counted. Loading eight faces does not imply eight primary faces were used.', 'matrixSHA256':hashlib.sha256((root/sys.argv[1]).read_bytes()).hexdigest(),'faces':faces,'rows':rows,'passed':True}
target.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'faces':len(faces),'caseRoleRows':len(rows),'glyphAssignments':sum(r['glyphAssignments'] for r in rows),'passed':True}))
