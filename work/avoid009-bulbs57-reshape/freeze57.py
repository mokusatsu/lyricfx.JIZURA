"""Freeze own-source receipts only. No Git/index/product/application writes."""
from pathlib import Path
import ast,datetime,hashlib,json
root=Path('/workspace/lyricfx.JIZURA');d=root/'work/avoid009-bulbs57-reshape';ev=d/'evidence';ev.mkdir(exist_ok=True)
sha=lambda b:hashlib.sha256(b).hexdigest()
def row(p,label=None):
 b=p.read_bytes();return {'path':label or str(p.relative_to(root)),'bytes':len(b),'sha256':sha(b)}
old=json.loads((root/'work/avoid009-bulbs56-diagnostic/evidence/pins56.json').read_text())
snap=root/'work/avoid009-capacity-objects13/continuation62-snapshot.json';s=json.loads(snap.read_text());assert len(s['skip'])==62
head=(root/'.git/HEAD').read_text().strip();assert head.startswith('ref: ');head=(root/'.git'/head[5:]).read_text().strip();assert head=='15a8e70d2dce8d977d893919162bba423bc061df'
idx=row(root/'.git/index');assert idx['sha256']=='a986c6ad19fa06b1e9578081cd10ceb1a5dafc2c3481821b474c578592220a76' and idx['bytes']==5766833;assert (root/'.git/index').stat().st_ino==554090
files=[row(root/p['path']) for p in old['files']];assert all(a==b for a,b in zip(files,old['files']));assert len(files)==124
source=sorted(str(p.relative_to(root)) for p in (root/'src').glob('*.js'));assert len(source)==108 and set(source)=={p['path'] for p in files if p['path'].startswith('src/')}
pycs=[row(root/p['path']) for p in old['pycache']];assert pycs==old['pycache'] and len(pycs)==7
assert all(not (root/p).exists() for p in s['skip']);assert set(old['absent61']).issubset(s['skip'])
node=row(Path(old['localNode']['path']),old['localNode']['path']);assert node==old['localNode']
rt=Path(old['runtimeAbsoluteReference']);assert sha(rt.read_bytes())==old['runtimeReferenceSHA256']
for p in d.glob('*.py'):ast.parse(p.read_text(),filename=str(p))
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
pins={'kind':'SOURCE57-fresh-source-runtime-index62-pins','at':now,'HEADReference':head,'productReference':'e891de1a778f26c79fb978678bb8a9a7b76b1c93','runtimeAbsoluteReference':str(rt),'runtimeReferenceSHA256':sha(rt.read_bytes()),'files':files,'pycache':pycs,'index':idx,'indexInode':554090,'localNode':node,'canonicalSourceCount':108,'canonicalSourcePaths':source,'absent62':s['skip'],'skipSnapshotReference':row(snap),'skipSnapshotMetadataHistoricalNotActualHEAD':True,'productSourceMutated':False,'actualBrowserOrApplicationExecutionsByPreparer':0,'pureSelfcheckExecutionsByPreparer':0}
(ev/'pins57.json').write_text(json.dumps(pins,ensure_ascii=False,indent=2)+'\n')
inputs=[row(Path(p),p) for p in [str(rt),str(root/'tasks/evidence/AVOID-009/bulbs-transport51/source51/runner/chunks51.cjs'),str(root/'dev/browser.cjs'),str(root/'dev/avoidance/layouts-b-fixture.js'),str(root/'dev/avoidance/layouts-c-editorial-fonts/manifest.json'),str(root/'work/avoid009-bulbs56-diagnostic/runner/kernel56.cjs'),str(root/'work/avoid009-bulbs56-diagnostic/runner/browser56.js'),str(root/'src/11p_layoutsD.js'),str(root/'src/11p_layoutsEc_tiles_proof48.js'),str(root/'work/avoid009-next57-readonly/RESHAPE57.md'),str(root/'work/avoid009-next57-readonly/pre-parent01/RESHAPE57.md')]]
sealFiles=[row(p,str(p.relative_to(d))) for p in sorted(d.rglob('*')) if p.is_file() and p.name!='seal57.json']
seal={'kind':'SOURCE57-frozen-source-only-parent-execution-gate-required','at':now,'HEADReference':head,'indexSHA256':idx['sha256'],'files':sealFiles,'inputs':inputs,'canonicalWrites':0,'applicationExecutionsByPreparer':0,'pureSelfcheckExecutionsByPreparer':0,'staticAuditReceipt':'evidence/static-audit57.json','recipeInventory':54,'heldScreens':54,'expectedNativeStates':250,'expectedNativePasses':727,'maxUntranslatedGeometryAcquisitions':6,'maxDestinationMaterializations':6,'tableKeyByteCap':67108864,'serializedJSONByteCap':268435456,'publicChecks':0,'imagesViewed':0,'adapterAdded':False,'numericStatus':'CONDITIONAL_DIAGNOSTIC_ONLY','original56Unchanged':True,'newRecipeObserverParityNotIndependentRecipeOracle':True}
(ev/'seal57.json').write_text(json.dumps(seal,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'pins':row(ev/'pins57.json'),'seal':row(ev/'seal57.json'),'sourceFiles':len(sealFiles),'inputs':len(inputs),'applicationExecuted':False}))
