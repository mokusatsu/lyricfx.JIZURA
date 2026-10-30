"""Current product83bg evidence; historical records remain explicitly separate."""
from pathlib import Path
import sys,json,gzip,hashlib
B=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent;R=U.parents[3];Q=U.parent/'previous-model83bf';load=lambda p:json.loads(p.read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
maps=[r for pattern in ['burst-product-reuse83bg-sourceprep*/pins.json','burst-previous-model83bf-sourceprep*/pins.json']for m in B.glob(pattern)for r in load(m)]
def pin(p):
 b=Path(p['path']).read_bytes()
 if len(b)==p['bytes']and sha(b)==p['sha256']:return False
 found=[r for r in maps if all(r[k]==p[k]for k in ['path','bytes','sha256'])];assert found,('missing execution source',p['path'])
 for v in found:
  b=Path(v['snapshot']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256']
 return True
D=B/'burst-product-reuse-actual83bg01';r=load(D/'result.json');h=load(Path(str(D)+'-runtime')/'host.json');assert r['complete']and r['postPinsUnchanged']and not r['errors']and r['mediaOutputs']==r['publicChecks']==0 and len(r['pins'])==199 and len(r['raw'])==2;historical=sum(pin(p)for p in r['pins']);raw={}
for p in r['raw']:
 g=(D/p['file']).read_bytes();b=gzip.decompress(g);assert len(g)==p['gzipBytes']and sha(g)==p['gzipSHA256']and len(b)==p['jsonBytes']and sha(b)==p['sha256']and len(b)<=8*1024**2;raw[p['file'][:-8]]=json.loads(b)
assert sum(p['jsonBytes']for p in r['raw'])<=128*1024**2 and sum(p['gzipBytes']for p in r['raw'])<=32*1024**2
assert h['complete']and h['probeExit']==0 and h['normalPageClosureConfirmed']and h['debugPortClosed']and h['pages']['created']==3 and sorted(h['pages']['closed'])==[0,1,2]and h['pages']['serviceReturned']and not h['pages']['errors']
assert h['cleanup']['complete']and all(not h['cleanup'][k]for k in ['remaining','signals','ownershipFailures','signalFailures'])and all(p['exit']==0 for p in h['cleanup']['reaped'])and all(p['exit']==0 for p in h['cleanup']['roots'].values())
for p in h['runtimeSources']:assert not pin(p)
s=raw['product-ui'];assert s==r['summary'];cases=s['cases'];assert [v['label']for v in cases]==['initial-product','same-input','circle-clear','circle-collision']
assert [(v['compiles'],v['replays'],v['checkedSupports'],v['candidates'],v['state']['stepCount'])for v in cases]==[(1,250,3392,2,501),(0,0,0,0,1),(0,250,3392,0,250),(0,277,3809,2,277)]
prior=load(B/'burst-previous-model-new-actual83bf02/result.json')['summary'];old=load(B/'burst-previous-model-old-actual83bf02/result.json')['summary']
for v,i in [(cases[0],0),(cases[2],1),(cases[3],2)]:
 for k in ['modelHash','frameHash','counts']:assert v[k]==prior['cases'][i][k],(v['label'],k)
for v in cases:
 assert v['state']['ready']and v['viewport']==[480,270]and v['counts']=={'states':112,'own':250,'supports':3392,'glyphs':964,'zeroReplayOwn':250}and v['proof']['checkedOwn']==250 and v['proof']['checkedSupports']==3392 and v['proof']['peak']<=8388608
assert cases[0]['modelHash']==cases[1]['modelHash']and cases[0]['frameHash']==cases[1]['frameHash']==cases[2]['frameHash']and cases[0]['proof']['delta']==cases[1]['proof']['delta']==cases[2]['proof']['delta']
assert cases[2]['frameHash']!=old['cases'][1]['frameHash']and cases[2]['proof']['delta']!=old['cases'][1]['proof']['delta']
assert cases[3]['frameHash']==old['cases'][2]['frameHash']and cases[3]['proof']['delta']==old['cases'][2]['proof']['delta']and cases[3]['stats']['owner']['reuse']['rejected']==1
assert len(s['outputs'])==4 and all(p['code']=='BURST_UI_OUTPUT_UNSUPPORTED'and p['workNotStarted']for p in s['outputs'])
cancel=s['cancelled'];assert cancel['clear']and cancel['state']['phase']=='cancelled';resources=cancel['resources'];assert resources['owner']['models']==resources['owner']['cachedBytes']==resources['formal']['bindings']==resources['formal']['certificates']==0 and not resources['owner']['preparing']
assert len(s['stale'])==4 and all(p['bitmapUnchanged']and p['code']for p in s['stale'])
ar=load(B/'domino-product-reuse-actual82ar01/result.json')['summary'];effects=s['effects'];assert [p['layout']for p in effects]==['bulbs','dominoes']
for p,expected in zip(effects,[ar['bulbs']['hash'],ar['cases'][0]['frameHash']]):
 assert p['initial']['state']['ready']and p['warm']['state']['ready']and p['warm']['state']['stepCount']<=2 and p['initial']['frameHash']==p['warm']['frameHash']==expected and not p['burst']['active']
assert effects[0]['initial']['bulbsStats']['owner']['compiles']==effects[0]['warm']['bulbsStats']['owner']['compiles']and effects[0]['warm']['bulbsStats']['owner']['reuses']==effects[0]['initial']['bulbsStats']['owner']['reuses']+1
assert not effects[0]['domino']['active']and not effects[1]['bulbs']['active']
assert s['center']['frameHash']==ar['centerAfter']['hash']and all(not s['center'][k]['active']for k in ['state','bulbs','domino'])
mixed=s['mixed'];assert [p['kind']for p in mixed['cases']]==['locked','manual']and all(p['selectedPreserved']and p['finalLegacyDrawn']and p['areaOpened']and not p['frameTarget']and p['activeCode']=='BULBS80T_OWNED_PLAN_REQUIRED'and p['activeBitmapUnchanged']for p in mixed['cases'])
assert not mixed['center']['state']['active']
base=load(B/'burst-product-reuse83bg-before/pins.json')
for p in base:
 b=Path(p['snapshot']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256']
oldcore=next(Path(p['snapshot']).read_text()for p in base if p['path']==str(R/'src/11zz12_burst_core83.js'));expected=oldcore;markers=load(Q/'module-markers.json')
for i,n in enumerate(load(U/'module-map.json')):
 a=expected.index(markers[i]);z=expected.index(markers[i+1]);expected=expected[:a]+(Q/n).read_text()+expected[z:]
assert (R/'src/11zz12_burst_core83.js').read_text()==expected and (R/'src/12_ui.js').read_bytes()==(Q/'ui83bf.js').read_bytes()
# Other source, including bulbs/domino/renderer/output and all native burst
# compiler/replay/math fragments, is byte-identical to the executed83bf baseline.
baselinePins=load(B/'burst-previous-model-source83bf-new05/pins.json');changed=[]
for p in baselinePins:
 path=Path(p['path'])
 if path.parent==R/'src'and sha(path.read_bytes())!=p['sha256']:changed.append(path.name)
assert sorted(changed)==['11zz12_burst_core83.js','12_ui.js']
final=B/'burst-product-reuse83bg-sourceprep02-final/pins.json'
if final.exists():
 for p in load(final):
  b=Path(p['path']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256']
print(json.dumps({'passed':True,'currentProductRun':{'pins':199,'historicalPins':historical,'raw':2,'normallyClosed':3,'ownedChildrenReaped':True},'timings':[{'label':v['label'],'wallMs':v['wallMs'],'maxStepMs':v['state']['maxStepMs'],'compiles':v['compiles'],'replays':v['replays'],'checkedSupports':v['checkedSupports'],'candidates':v['candidates']}for v in cases],'fontViewportEvidence':'inherited83bf actual03/04/05, source-identical final fragments; no repeated font/viewport trial','actualFontFaceReplacementNotTested':True,'coldPerformanceUnresolved':True,'otherEffectsWarmReused':True,'mixedPreservedCuts':2,'finalPins':len(load(final))if final.exists()else None},indent=2))
