"""Freeze own-source receipts only. No Git/index/product/application writes."""
from pathlib import Path
import ast,datetime,hashlib,json
root=Path('/workspace/lyricfx.JIZURA');d=root/'work/avoid009-bulbs59-focused';ev=d/'evidence';ev.mkdir(exist_ok=True)
sha=lambda b:hashlib.sha256(b).hexdigest()
def row(p,label=None):
 b=p.read_bytes();return {'path':label or str(p.relative_to(root)),'bytes':len(b),'sha256':sha(b)}
old=json.loads((root/'work/avoid009-bulbs56-diagnostic/evidence/pins56.json').read_text())
snap=root/'work/avoid009-capacity-objects13/continuation62-snapshot.json';s=json.loads(snap.read_text());assert len(s['skip'])==62
head=(root/'.git/HEAD').read_text().strip();assert head.startswith('ref: ');head=(root/'.git'/head[5:]).read_text().strip();assert head=='7df6336fee494636b0c3ef7af2ff5f93227246d2'
idx=row(root/'.git/index');assert idx['sha256']=='2dfa365920e0762e47f77c9faa19373f4787c1c20146716b06a4e51da1c02375' and idx['bytes']==5778515;assert (root/'.git/index').stat().st_ino==554090
files=[row(root/p['path']) for p in old['files']];assert all(a==b for a,b in zip(files,old['files']));assert len(files)==124
source=sorted(str(p.relative_to(root)) for p in (root/'src').glob('*.js'));assert len(source)==108 and set(source)=={p['path'] for p in files if p['path'].startswith('src/')}
pycs=[row(root/p['path']) for p in old['pycache']];assert pycs==old['pycache'] and len(pycs)==7
assert all(not (root/p).exists() for p in s['skip']);assert set(old['absent61']).issubset(s['skip'])
node=row(Path(old['localNode']['path']),old['localNode']['path']);assert node==old['localNode']
rt=Path(old['runtimeAbsoluteReference']);assert sha(rt.read_bytes())==old['runtimeReferenceSHA256']
for p in d.glob('*.py'):ast.parse(p.read_text(),filename=str(p))
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
pins={'kind':'SOURCE59-fresh-source-runtime-index62-pins','at':now,'HEADReference':head,'productReference':'e891de1a778f26c79fb978678bb8a9a7b76b1c93','runtimeAbsoluteReference':str(rt),'runtimeReferenceSHA256':sha(rt.read_bytes()),'files':files,'pycache':pycs,'index':idx,'indexInode':554090,'localNode':node,'canonicalSourceCount':108,'canonicalSourcePaths':source,'absent62':s['skip'],'skipSnapshotReference':row(snap),'skipSnapshotMetadataHistoricalNotActualHEAD':True,'productSourceMutated':False,'actualBrowserOrApplicationExecutionsByPreparer':0,'pureSelfcheckExecutionsByPreparer':0}
(ev/'pins59.json').write_text(json.dumps(pins,ensure_ascii=False,indent=2)+'\n')
inputs=[row(Path(p),p) for p in [str(rt),str(root/'tasks/evidence/AVOID-009/bulbs-transport51/source51/runner/chunks51.cjs'),str(root/'dev/browser.cjs'),str(root/'dev/avoidance/layouts-b-fixture.js'),str(root/'dev/avoidance/layouts-c-editorial-fonts/manifest.json'),str(root/'work/avoid009-bulbs56-diagnostic/runner/kernel56.cjs'),str(root/'work/avoid009-bulbs56-diagnostic/runner/browser56.js'),str(root/'src/11p_layoutsD.js'),str(root/'src/11p_layoutsEc_tiles_proof48.js'),str(root/'work/avoid009-next57-readonly/RESHAPE57.md'),str(root/'work/avoid009-next57-readonly/pre-parent01/RESHAPE57.md'),str(root/'work/avoid009-bulbs57-reshape/evidence/seal57.json'),str(root/'tasks/evidence/AVOID-009/bulbs-next57/parent-capacity-dryrun57.json'),str(root/'work/avoid009-bulbs58-reshape/evidence/seal58.json'),str(root/'tasks/evidence/AVOID-009/bulbs-reshape58/parent-raw-review58.json'),str(root/'tasks/evidence/AVOID-009/bulbs-reshape58/parent-screen-facts58.json'),str(root/'work/avoid009-bulbs59-plan/SPEC59.md'),str(root/'work/avoid009-bulbs59-plan/ORACLE59.md')]]
sealFiles=[row(p,str(p.relative_to(d))) for p in sorted(d.rglob('*')) if p.is_file() and p.name!='seal59.json']
seal={'kind':'SOURCE59-frozen-source-only-parent-execution-gate-required','at':now,'HEADReference':head,'indexSHA256':idx['sha256'],'files':sealFiles,'inputs':inputs,'canonicalWrites':0,'applicationExecutionsByPreparer':0,'pureSelfcheckExecutionsByPreparer':0,'staticAuditReceipt':'evidence/static-audit59.json','recipeInventory':2,'heldScreens':0,'expectedUntranslatedFields':2,'expectedUntranslatedStates':500,'expectedUntranslatedPasses':1454,'expectedNativeStates':250,'expectedNativePasses':727,'maxUntranslatedGeometryAcquisitions':2,'maxDestinationMaterializations':2,'tableKeyByteCap':67108864,'serializedJSONByteCap':268435456,'publicChecks':0,'imagesViewed':0,'adapterAdded':False,'numericStatus':'CONDITIONAL_DIAGNOSTIC_ONLY','original56Unchanged':True,'original57UnexecutedAndUnchanged':True,'preserved57SealSHA256':'35e9696329ace4e9ec29eed6400728cd160e4f2f6fbeb77cfa93d1abc8242ce2','externalRootNestedIntrinsicFullRoundtrip':True,'sameGeometryImplementationAndFunctionalCircleStageAs58':True,'deliberateNeighborPilotPolicyRevision':True,'original58Unchanged':True,'preserved58SealSHA256':'a5f9e99d00557c4652c9550b22adf1fbed4211b93c62345c5a84d30b99c51abc','newRecipeObserverParityNotIndependentRecipeOracle':True}
(ev/'seal59.json').write_text(json.dumps(seal,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'pins':row(ev/'pins59.json'),'seal':row(ev/'seal59.json'),'sourceFiles':len(sealFiles),'inputs':len(inputs),'applicationExecuted':False}))
