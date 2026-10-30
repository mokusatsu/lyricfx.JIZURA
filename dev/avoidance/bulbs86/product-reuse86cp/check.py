"""Current product86cp and explicitly historical evidence; no Qt/media/network."""
from pathlib import Path
from fractions import Fraction as F
import sys,json,gzip,hashlib
B=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent;R=U.parents[3];Q=U.parent/'previous-model86co';sha=lambda b:hashlib.sha256(b).hexdigest();load=lambda p:json.loads(p.read_text())
maps=[p for pattern in ['bulbs-product-reuse86cp-sourceprep*/pins.json','bulbs-previous-model86co-sourceprep*/pins.json','burst-product-ui83be-sourceprep*/pins.json','domino-product-reuse82ar-sourceprep*/pins.json']for m in B.glob(pattern)for p in load(m)]
def pin(p):
 b=Path(p['path']).read_bytes()
 if len(b)==p['bytes']and sha(b)==p['sha256']:return False
 candidates=[v for v in maps if all(v[k]==p[k]for k in ['path','bytes','sha256'])];assert candidates,('missing historical pin',p['path'])
 for v in candidates:
  b=Path(v['snapshot']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256']
 return True
def evidence(name,complete=True,pins=None):
 D=B/name;r=load(D/'result.json');h=load(Path(str(D)+'-runtime')/'host.json');historical=sum(pin(p)for p in r['pins']);raw={}
 assert r['complete']==complete and r['postPinsUnchanged']and r['mediaOutputs']==r['publicChecks']==0 and bool(r['errors'])!=complete
 if pins is not None:assert len(r['pins'])==pins
 assert len(r['raw'])==2
 for p in r['raw']:
  g=(D/p['file']).read_bytes();b=gzip.decompress(g);assert len(g)==p['gzipBytes']and sha(g)==p['gzipSHA256']and len(b)==p['jsonBytes']and sha(b)==p['sha256']and len(b)<=8*1024**2;raw[p['file'][:-8]]=json.loads(b)
 assert sum(p['jsonBytes']for p in r['raw'])<=128*1024**2 and sum(p['gzipBytes']for p in r['raw'])<=32*1024**2
 assert h['complete']==complete and h['probeExit']==(0 if complete else 1)and h['normalPageClosureConfirmed']and h['debugPortClosed']and h['pages']['created']==3 and sorted(h['pages']['closed'])==[0,1,2]and h['pages']['serviceReturned']and not h['pages']['errors']
 assert h['cleanup']['complete']and all(not h['cleanup'][k]for k in ['remaining','signals','ownershipFailures','signalFailures'])and all(v['exit']==0 for v in h['cleanup']['reaped'])and h['cleanup']['roots']['service']['exit']==0 and h['cleanup']['roots']['node']['exit']==(0 if complete else 1)
 for p in h['runtimeSources']:pin(p)
 if complete:assert raw['product-ui']==r['summary']
 return raw['product-ui'],{'name':name,'complete':complete,'sourcePins':len(r['pins']),'historicalPins':historical,'raw':2,'normallyClosed':3,'ownedChildrenReaped':True}
failed,run1=evidence('bulbs-product-reuse-actual86cp01',False,199);second,run2=evidence('bulbs-product-reuse-actual86cp02',True,200)
failure=failed['failure'];assert failure['code']=='UNSUPPORTED'and failure['details']['original']['error']=='BULBS86BJ_INSUFFICIENT_SPACE'and failure['details']['original']['cleanupError']is None and not failure['details']['original']['ready']
first=failure['details']['partial'];cases=first['cases'];assert [r['label']for r in cases]==['initial-product','same-input','circle-only','collision-fallback','independent-revision']
assert [r['compiles']for r in cases]==[1,0,0,0,1]and [r['state']['stepCount']for r in cases]==[538,2,2,253,538]
assert cases[2]['stats']['reservation']['reuse']=={'accepted':2,'rejected':0,'checkedSupports':20,'candidates':2}
assert cases[3]['stats']['reservation']['reuse']=={'accepted':2,'rejected':1,'checkedSupports':24,'candidates':4}
# The post05 cold-proof release ran in the product: a changed model never
# reaches the old-proof mismatch branch, unlike old05's rejected counter2.
assert cases[4]['stats']['reservation']['reuse']['rejected']==1
refs=load(B/'bulbs-previous-model-new-actual86co05/result.json')['summary'];cold=load(B/'bulbs-previous-model-old-actual86co04/result.json')['summary']['cases'][0]
for r,ref in [(cases[0],refs['cases'][0]),(cases[3],cold),(cases[4],refs['cases'][2])]:
 for k in ['modelHash','frameHash','counts','proof','delta']:assert r[k]==ref[k],(r['label'],k)
for r in cases[:3]:assert r['modelHash']==cases[0]['modelHash']and r['delta']==cases[0]['delta']and r['frameHash']==cases[0]['frameHash']
oldWarm=load(B/'bulbs-previous-model-old-actual86co02/result.json')['summary']['cases'];assert cases[2]['delta']!=oldWarm[2]['delta']and cases[2]['frameHash']!=oldWarm[2]['frameHash']
assert len(first['stale'])==5 and first['stale'][-1]['label']=='lyrics-input'and all(r['bitmapUnchanged']and r['code']for r in first['stale'])
for r in cases+second['cases']:
 assert r['state']['ready']and r['viewport']==[480,270]and r['schedule']==250 and r['groups']==40
 assert r['stats']['owner']['residentModels']==1 and r['stats']['owner']['peakSerializedWorkingBytes']<=8388608
 proof=r['proof'];assert len(proof['groups'])==10 and proof['referenceCount']==250 and proof['scalarContributions']==1754==sum(g['scalarContributions']for g in proof['groups'])
 cx=F((.52 if r['label']=='circle-only'else .5)*1920*.25);cy=F(.1*1080*.25);radius=F((.09 if r['label']=='circle-only'else .12 if r['label']in ['collision-fallback','independent-revision']else .1)*1080*.25);margin=F(2.7)
 for g in proof['groups']:
  b={k:F(v)for k,v in g['bounds'].items()};assert 0<=b['x0']<=b['x1']<=480 and 0<=b['y0']<=b['y1']<=270;x=max(b['x0'],min(cx,b['x1']));y=max(b['y0'],min(cy,b['y1']));assert (x-cx)**2+(y-cy)**2>(radius+margin)**2
assert len(second['outputs'])==4 and all(r['code']=='BULBS_UI_OUTPUT_UNSUPPORTED'and r['workNotStarted']for r in second['outputs'])
cancel=second['cancelled'];assert cancel['clear']and cancel['state']['phase']=='cancelled'and not cancel['state']['ready'];assert cancel['stats']['owner']['residentModels']==cancel['stats']['reservation']['previousBytes']==cancel['stats']['reservation']['records']==cancel['stats']['reservation']['bindings']==0
assert all(r['bitmapUnchanged']and r['code']for r in second['stale'])
ar=load(B/'domino-product-reuse-actual82ar01/result.json')['summary'];effects=second['effects'];assert [r['layout']for r in effects]==['burst','dominoes','center']
assert [r['frameHash']for r in effects]==[ar['burst']['hash'],ar['cases'][0]['frameHash'],ar['centerAfter']['hash']]
assert all(not r['bulbs']['active']for r in effects)and not effects[0]['domino']['active']and not effects[1]['burst']['active']and not effects[2]['burst']['active']and not effects[2]['domino']['active']
mixed=second['mixed'];assert len(mixed['editors'])==4 and mixed['otherPart']=={'line':5,'part':1}and mixed['screenshotTarget']=={'canvases':0,'renderers':0,'blobs':0,'saves':0}
assert [r['kind']for r in mixed['preservedOnly']]==['line-lock','emphasis','manual','notation','disabled','hidden']and all(not r['state']['active']and r['screenshotCanvasControls']==1 for r in mixed['preservedOnly'])
for r in mixed['cuts']:
 if r['line']in [1,2,3,4]:assert r['preserved']and not r['target']
# Current product is exactly the reviewed module set, including final cold release.
for target,source in load(U/'module-map.json'):assert (R/'src'/target).read_bytes()==(Q/source).read_bytes(),target
baseline=load(B/'bulbs-product-reuse86cp-before/pins.json')
for p in baseline:
 b=Path(p['snapshot']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256']
oldPins=load(B/'bulbs-previous-model-source86co-new05/pins.json');changed=[]
for p in oldPins:
 path=Path(p['path'])
 if path.parent==R/'src'and sha(path.read_bytes())!=p['sha256']:changed.append(path.name)
assert sorted(changed)==sorted(t for t,_ in load(U/'module-map.json'))
prior=(B/'bulbs-previous-model86co-sourceprep03/adapter86co.js').read_text();now=(R/'src/11zz10_bulbs_adapter80.js').read_text();line="if(current.job.state().phase!=='reusing')issuer.clearPrevious();";assert now==prior.replace("current.phase='preparing';issuer.checkBudget(0);",line+"current.phase='preparing';issuer.checkBudget(0);")
final=B/'bulbs-product-reuse86cp-sourceprep03-final/pins.json'
if final.exists():
 for p in load(final):
  b=Path(p['path']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256']
print(json.dumps({'passed':True,'runs':[run1,run2],'currentProductTimings':[{'label':r['label'],'wallMs':r['wallMs'],'maxStepMs':r['state']['maxStepMs'],'compiles':r['compiles'],'steps':r['state']['stepCount'],'geometryCalls':r['geometryCalls'],'evaluatedSupports':r['evaluatedSupports']}for r in cases],'scope':'current product warm/cold/fallback and existing proof/bitmap equality; saved input unsupported preserved; output/cancel/effects/mixed routing; inherited font/viewport evidence remains explicitly historical and source-identical except exercised cold-release line','oldColdOutliersUnresolved':True,'newLyricsInputUnsupported':True,'finalPins':len(load(final))if final.exists()else None},indent=2))
