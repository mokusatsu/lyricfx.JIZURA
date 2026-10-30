"""Saved numeric/source/resource evidence only; no Qt, media or remote reads."""
from pathlib import Path
import sys,json,gzip,hashlib
B=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent;R=U.parents[3];load=lambda p:json.loads(p.read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
maps=[r for p in B.glob('burst-previous-model83bf-sourceprep*/pins.json')for r in load(p)]
def pin(p):
 path=Path(p['path']);b=path.read_bytes()if path.exists()else b''
 if len(b)==p['bytes']and sha(b)==p['sha256']:return False
 found=[v for v in maps if all(v[k]==p[k]for k in ['path','bytes','sha256'])];assert found,('missing execution source',p['path'],p['sha256'])
 for v in found:
  b=Path(v['snapshot']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256']
 return True
records={};runs=[]
for tag in ['old01','new01','old02','new02','new03','new04','new05']:
 D=B/('burst-previous-model-'+tag[:3]+'-actual83bf'+tag[3:]);r=load(D/'result.json');h=load(Path(str(D)+'-runtime')/'host.json');complete=tag not in ['new03','new04'];expectedPins=188 if tag.endswith('01')else 189 if tag.endswith('02')else 192
 assert r['complete']==complete and r['postPinsUnchanged']and len(r['pins'])==expectedPins and len(r['raw'])==2 and r['mediaOutputs']==r['publicChecks']==0 and bool(r['errors'])!=complete
 historical=sum(pin(p)for p in r['pins']);raw={}
 for p in r['raw']:
  g=(D/p['file']).read_bytes();b=gzip.decompress(g);assert len(g)==p['gzipBytes']and sha(g)==p['gzipSHA256']and len(b)==p['jsonBytes']and sha(b)==p['sha256']and len(b)<=8*1024**2;raw[p['file'][:-8]]=json.loads(b)
 assert sum(p['jsonBytes']for p in r['raw'])<=128*1024**2 and sum(p['gzipBytes']for p in r['raw'])<=32*1024**2
 assert h['complete']==complete and h['probeExit']==(0 if complete else 1)and h['normalPageClosureConfirmed']and h['debugPortClosed']and h['pages']['created']==3 and sorted(h['pages']['closed'])==[0,1,2]and h['pages']['serviceReturned']and not h['pages']['errors']
 assert h['cleanup']['complete']and all(not h['cleanup'][k]for k in ['remaining','signals','ownershipFailures','signalFailures'])and all(v['exit']==0 for v in h['cleanup']['reaped'])and h['cleanup']['roots']['service']['exit']==0 and h['cleanup']['roots']['node']['exit']==(0 if complete else 1)
 for p in h['runtimeSources']:assert not pin(p)
 if complete:record=raw['product-ui'];assert record==r['summary']
 else:
  failure=raw['product-ui']['failure'];record=failure['details']['partial']
  if tag=='new03':assert failure['code']=='INPUT_REUSED'
  else:assert 'compiles' in failure['message']and 'undefined'in failure['message']
 records[tag]=record
 for row in record['cases']:
  assert row['state']['ready']and row['proof']['checkedOwn']==row['counts']['own']and row['proof']['checkedSupports']==row['counts']['supports']and row['counts']['zeroReplayOwn']==row['counts']['own']and row['proof']['peak']<=8388608
 assert all(v['bitmapUnchanged']and v['code']for v in record['stale'])
 if complete:assert record['cancelled']['clear']and record['cancelled']['state']['phase']=='cancelled'
 runs.append({'tag':tag,'complete':complete,'pins':expectedPins,'historicalPins':historical,'raw':2,'normallyClosed':3,'ownedChildrenReaped':True,'cases':[{'label':x['label'],'wallMs':x['wallMs'],'maxStepMs':x['state']['maxStepMs'],'compiles':x['compiles'],'replays':x['replays'],'checkedSupports':x['checkedSupports'],'candidates':x['candidates']}for x in record['cases']]})
old,new=records['old01']['cases'],records['new01']['cases']
assert [v['compiles']for v in old]==[1,1]and [v['replays']for v in old]==[250,250]and [v['checkedSupports']for v in old]==[3392,3392]
assert (new[1]['compiles'],new[1]['replays'],new[1]['checkedSupports'],new[1]['candidates'],new[1]['state']['stepCount'])==(0,0,0,0,1)
assert len({v['modelHash']for v in old+new})==len({v['frameHash']for v in old+new})==1
old,new=records['old02']['cases'],records['new02']['cases']
assert [v['label']for v in new]==['initial-for-circles','circle-clear','circle-collision','independent-revision']
assert (new[1]['compiles'],new[1]['replays'],new[1]['checkedSupports'],new[1]['candidates'])==(0,250,3392,0)
assert new[1]['proof']['delta']==new[0]['proof']['delta']and new[1]['frameHash']==new[0]['frameHash']and new[1]['proof']['delta']!=old[1]['proof']['delta']and new[1]['frameHash']!=old[1]['frameHash']
assert (new[2]['compiles'],new[2]['replays'],new[2]['checkedSupports'],new[2]['candidates'])==(0,277,3809,2)
for i in range(3):assert new[i]['modelHash']==old[i]['modelHash']and new[i]['counts']==old[i]['counts']
for k in ['frameHash']:assert new[2][k]==old[2][k]
for k in ['delta','circle','checkedOwn','checkedSupports','minStageSlack']:assert new[2]['proof'][k]==old[2]['proof'][k]
assert new[3]['compiles']==1 and new[3]['stats']['owner']['reuse']['compiles']==2
parked=[v['owner']['cachedBytes']for v in records['new02']['cancels']if v['owner']['cached']];assert parked and max(parked)==2168345 and all(v['formal']['bindings']==v['formal']['certificates']==v['owner']['models']==0 for v in records['new02']['cancels'])
inputCase=records['new03']['cases'][1];assert inputCase['label']=='lyrics-input'and inputCase['compiles']==2 and inputCase['replays']==276 and inputCase['checkedSupports']==3959 and inputCase['counts']['own']==276 and inputCase['viewport']==[480,270]and inputCase['stats']['owner']['reuse']['same']==inputCase['stats']['owner']['reuse']['circle']==0
assert inputCase['modelHash']==records['new04']['cases'][0]['modelHash']and inputCase['frameHash']==records['new04']['cases'][0]['frameHash']
resize=records['new04']['cases'][1];assert resize['label']=='viewport-change'and resize['compiles']==1 and resize['replays']==276 and resize['checkedSupports']==3959 and resize['viewport']==[640,360]and resize['stats']['owner']['reuse']['same']==resize['stats']['owner']['reuse']['circle']==0
last=records['new05'];assert len(last['cases'])==1 and last['cases'][0]['viewport']==[640,360]and last['cases'][0]['modelHash']==resize['modelHash']and last['cases'][0]['frameHash']==resize['frameHash']
glyph=last['glyphFont'];assert glyph['effective']=='gothic_bold'and glyph['state']['phase']=='unsupported'and glyph['state']['error']=='BURST83N_PARAMS'and glyph['clear']and glyph['resources']['owner']['models']==glyph['resources']['owner']['cachedBytes']==0
cancel=last['cancelled'];assert cancel['clear']and cancel['state']['phase']=='cancelled'and cancel['state']['stepCount']>=2;res=cancel['resources'];assert res['owner']['models']==res['owner']['cachedBytes']==res['formal']['bindings']==res['formal']['certificates']==0 and not res['owner']['preparing']
# No renderer/compiler/replay/clock/math change: only four product owner/session
# fragments and one UI font entry are proposed. This is still source-only.
core=(R/'src/11zz12_burst_core83.js').read_text();markers=load(U/'module-markers.json');current=[core[core.index(markers[i]):core.index(markers[i+1])]for i in range(4)];proposal=[(U/n).read_text()for n in ['owner83bf.js','handoff83bf.js','runtime83bf.js','session83bf.js']]
assert all(a!=b for a,b in zip(current,proposal))and (R/'src/12_ui.js').read_bytes()!=(U/'ui83bf.js').read_bytes()
assert 'for(const state of clocks.states)'in core and 'counts.own===clocks.actualCounts.selectedPasses&&counts.zeroReplayOwn===counts.own'in core
owner=proposal[0]
for s in ["same83bf=state==='same'","if(!same83bf){","if(previous83bfAttempt&&!evaluation.passed)","proof.checkedSupports===model.counts.supports","matches(previous83bf.dep,dep)","if(cached&&proofReservation>8388608)"]:
 assert s in owner,s
final=B/'burst-previous-model83bf-sourceprep06-final/pins.json'
if final.exists():
 for p in load(final):
  b=Path(p['path']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256']
print(json.dumps({'passed':True,'runs':runs,'sameInputSkipsCompileAndReplay':True,'circleKeepsExactOriginalReplay':True,'oldNewDifferentValidClearCirclePositionExplicit':True,'coldStillUnresolved':True,'actualFontFaceReplacementNotTested':True,'sourceOnlyNotProductApplied':True,'finalPins':len(load(final))if final.exists()else None},indent=2))
