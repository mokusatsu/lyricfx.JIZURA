"""Explicit selected-file inventory; never stage the evidence directory wholesale."""
from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parents[4]
EVIDENCE = Path(__file__).resolve().parent
selected = set()
for name in ['src/09a_placement.js', 'src/09d_adaptive_placement.js', 'src/11p_layoutsA.js',
             'index.html', 'en/index.html']:
    selected.add(ROOT / name)
for name in ['film-ticket-edges.cjs', 'film-ticket-edges-review.cjs', 'film-ticket-off-parity.cjs',
             'film-hole-bounds-test.cjs', 'film-hole-batch-test.cjs', 'ticket-prepass-test.cjs']:
    selected.add(ROOT / 'dev/avoidance' / name)
# Top-level receipts, logs, source/tool histories and canonical compressed reports.
# Large raw observations/profiles are preserved locally, with canonical gzip copies.
exclude_names = {'adaptive-report.json', 'filmstrip-test-report.json', 'ticket-prepass-test.json',
                 'numeric21-report.json.gz', 'stage-inventory.json', 'stage-inventory.md'}
for p in EVIDENCE.iterdir():
    if p.is_file() and p.name not in exclude_names and not p.name.endswith('.cpuprofile') and not p.name.startswith(('local07-', 'public07-')):
        selected.add(p)
for name in ['baseline', 'pre-optimization', 'pre-payload-optimization', 'pre-immutable-snapshots',
             'immutable-snapshots-candidate', 'pre-ticket-prepass', 'final-candidate',
             'optimized-candidate', 'final-candidate-v2', 'bundle-local-20261021-07', 'historical-public05', 'historical-public06']:
    for p in (EVIDENCE / name).rglob('*'):
        if not p.is_file():
            continue
        if p.name.endswith('-report.json') or p.name.endswith('.cpuprofile'):
            continue
        selected.add(p)
for p in (ROOT / 'review/AVOID-006/local-20261021-07').rglob('*'):
    if p.is_file():
        selected.add(p)
entries = []
for p in sorted(selected):
    b = p.read_bytes()
    assert len(b) < 100 * 1024 * 1024, 'Git large-file refusal: ' + str(p)
    entries.append(dict(path=str(p.relative_to(ROOT)), bytes=len(b),
                        sha256=hashlib.sha256(b).hexdigest()))
excluded = []
for p in sorted(EVIDENCE.rglob('*')):
    if p.is_file() and p not in selected and p.name not in {'stage-inventory.json','stage-inventory.md'}:
        excluded.append(dict(path=str(p.relative_to(ROOT)), bytes=p.stat().st_size))
result = dict(schema=1, sourceSHA256=hashlib.sha256((ROOT/'index.html').read_bytes()).hexdigest(),
              afterCaptureReused=True, beforeCaptureReused=True,
              selected=entries, selectedBytes=sum(x['bytes'] for x in entries), excludedLocalOnly=excluded,
              stageControlFiles=[str((EVIDENCE/'stage-inventory.json').relative_to(ROOT)),
                                 str((EVIDENCE/'stage-inventory.md').relative_to(ROOT))],
              notes=['Parent owns selective staging; do not git add the whole evidence directory.',
                     'Public04/Public05/Public06 and all draft/old capture MP4/PNG directories remain local only; final07 pins the necessary native assets and c3a parity reference.',
                     'Withdrawn immutable test tool is preserved under immutable-snapshots-candidate/test-tool.cjs; dev/avoidance/film-hole-snapshots-test.cjs is not selected.',
                     'Raw giant reports/profiles are local-only; two current-run raw reports were released by the parent after exact gzip verification. Canonical gzip copies and release receipts preserve their bytes.',
                     'Existing dirty pyc and unrelated untracked files are outside this inventory and must remain untouched.',
                     'Future parent Pages/local/public/visual receipts may be staged separately; this inventory does not claim those checks ran.'])
(EVIDENCE/'stage-inventory.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(dict(files=len(entries),bytes=result['selectedBytes'],localOnlyFiles=len(excluded),maximumFileBytes=max(x['bytes'] for x in entries))))
