from pathlib import Path
import json,hashlib
p=Path(__file__).resolve().parent;root=Path('/workspace/lyricfx.JIZURA');sha=lambda b:hashlib.sha256(b).hexdigest()
load=lambda n:json.loads((p/n).read_text())
parity=load('parent-parity.json');shape=load('shape-parity.json');negative=load('negative.json');startup=load('startup.json');full=load('full-path.json');baseline=load('baseline-results.json')
functional=json.loads((root/'tasks/evidence/AVOID-006/adaptive-revision/final-candidate/functional-summary.json').read_text())
changed=[f for f,h in functional['sourceHashes'].items() if sha((root/f).read_bytes())!=h]
hashes={f:sha((root/f).read_bytes()) for f in ['index.html','en/index.html','src/09a_placement.js','src/09b_basic_placement.js','src/09c_layoutsA_placement.js','src/09d_adaptive_placement.js','dev/avoidance/layouts-a-fixture.js']}
failures=[]
if len(parity['comparisons'])!=180 or any(not r['equal'] for r in parity['comparisons']):failures.append('PNG parity failure')
for name,r in [('parent-parity',parity),('negative',negative),('startup',startup),('full-path',full)]:
 if r.get('failures'):failures.append(name+' failure')
if shape['failureCount']:failures.append('shape parity failure')
if not baseline.get('passed'):failures.append('baseline regression failure')
if changed:failures.append('Source hash changed')
if hashes['index.html']!='850e43d64de78aea880e8de7cc3d36e27d14cd2f3bcac96a57bf716952e00a07' or hashes['en/index.html']!='dd025dfb08551097184778b91bbca36d40fd1ecb8fe5543fd2044e9c5654399f':failures.append('Compiled hash changed')
files=[f for f in p.iterdir() if f.is_file() and f.name not in ['receipt.json','receipt.log']]
receipt={'hashes':hashes,'sourceHashesComparedToFunctionalSummary':len(functional['sourceHashes']),'changedSourceFiles':changed,'counts':{'PNGComparisons':len(parity['comparisons']),'native26Frames':sum(r['type']=='native26' for r in parity['comparisons']),'basic16Frames':sum(r['type']=='staged-basic16' for r in parity['comparisons']),'accepted18Frames':sum(r['type']=='accepted18-staged' for r in parity['comparisons']),'shapeOld53NewExactCases':shape['cases'],'prepassNegativeCases':negative['cases'],'JAENStartupWithAndWithoutSegmenter':len(startup['rows']),'fullPathCases':len(full['rows']),'adoptedCompositionsFullyRecorded':sum(r['adopted'] for r in full['rows']),'existingBaselineSuites':len(baseline['rows'])},'baselineRows':baseline['rows'],'failures':failures,'passed':not failures,'evidenceSHA256':{f.name:sha(f.read_bytes()) for f in files},'limits':'PNG comparisons use SHA256 of Canvas PNG data URLs, a one-to-one encoding of PNG bytes. No images opened. Parent parity legacy unused counters a26Cases/actualFrames/polygons=0 do not claim geometric frame audits. Known project_file_test failure not rerun and not counted as successful. Prior performance/192-spec optimization results are parent-owned evidence, not rerun here.'}
(p/'receipt.json').write_text(json.dumps(receipt,indent=2));print(json.dumps({'counts':receipt['counts'],'passed':receipt['passed'],'failures':failures,'sourceChanged':changed}))
raise SystemExit(0 if receipt['passed'] else 1)
