"""Read saved numeric evidence only. Does not start Qt or create media."""
from pathlib import Path
from fractions import Fraction as F
import sys,json,gzip,hashlib
B=Path(sys.argv[1]).resolve();R=Path(__file__).resolve().parents[4]
def digest(b):return hashlib.sha256(b).hexdigest()
def load(p):return json.loads(p.read_text())
snapshots=[r for p in B.glob('bulbs-previous-model86co-sourceprep*/pins.json') for r in load(p)]
def verify_pin(p):
 current=Path(p['path']);data=current.read_bytes()if current.exists()else b''
 if len(data)==p['bytes']and digest(data)==p['sha256']:return False
 matches=[r for r in snapshots if r['path']==p['path']and r['bytes']==p['bytes']and r['sha256']==p['sha256']]
 assert matches,('missing historical source',p['path'],p['sha256'])
 for r in matches:
  b=Path(r['snapshot']).read_bytes();assert len(b)==p['bytes']and digest(b)==p['sha256']
 return True
results={};summaries=[]
for tag in ['old02','new02','old04','new05']:
 mode=tag[:3];n=tag[3:];D=B/f'bulbs-previous-model-{mode}-actual86co{n}';d=load(D/'result.json');h=load(Path(str(D)+'-runtime')/'host.json')
 assert d['complete']and d['postPinsUnchanged']and not d['errors']and d['mediaOutputs']==d['publicChecks']==0
 assert len(d['pins'])==(187 if n=='02'else 190)
 historical=sum(verify_pin(p)for p in d['pins'])
 assert len(d['raw'])==2 and sum(r['jsonBytes']for r in d['raw'])<=128*1024**2 and sum(r['gzipBytes']for r in d['raw'])<=32*1024**2
 for p in d['raw']:
  g=(D/p['file']).read_bytes();b=gzip.decompress(g);assert len(g)==p['gzipBytes']and digest(g)==p['gzipSHA256']and len(b)==p['jsonBytes']and digest(b)==p['sha256']and len(b)<=8*1024**2
 assert json.loads(gzip.decompress((D/'product-ui.json.gz').read_bytes()))==d['summary']
 assert h['complete']and h['probeExit']==0 and h['debugPortClosed']and h['normalPageClosureConfirmed']
 assert h['pages']['created']==3 and sorted(h['pages']['closed'])==[0,1,2]and not h['pages']['errors']and h['pages']['serviceReturned']
 cleanup=h['cleanup'];assert cleanup['complete']and not any(cleanup[k]for k in ['remaining','signals','ownershipFailures','signalFailures'])and all(p['exit']==0 for p in cleanup['reaped'])and all(p['exit']==0 for p in cleanup['roots'].values())
 for p in h['runtimeSources']:assert not verify_pin(p)
 s=d['summary'];results[tag]=s
 assert all(row['bitmapUnchanged']and row['code']for row in s['stale'])
 for row in s['cases']:
  assert row['state']['ready']and row['viewport']==[480,270]and row['groups']==40 and row['schedule']==250
  o=row['stats']['owner'];assert o['residentModels']==1 and o['residentBytes']==1114348 and o['peakSerializedWorkingBytes']<=8388608
 assert s['cancelled']['clear']and not s['cancelled']['state']['ready']
 assert s['cancelled']['stats']['owner']['residentModels']==s['cancelled']['stats']['reservation']['records']==s['cancelled']['stats']['reservation']['bindings']==0
 summaries.append({'tag':tag,'sourcePins':len(d['pins']),'historicalPins':historical,'raw':len(d['raw']),'normalReaped':True,'cases':[{'label':r['label'],'wallMs':r['wallMs'],'maxStepMs':r['state']['maxStepMs'],'steps':r['state']['stepCount'],'compiles':r['compiles'],'geometryCalls':r['geometryCalls'],'evaluatedSupports':r['evaluatedSupports']}for r in s['cases']]})
old,new=results['old02']['cases'],results['new02']['cases']
assert [r['compiles']for r in old]==[1,1,1]and [r['compiles']for r in new]==[1,0,0]
assert len({r['modelHash']for r in new})==1
assert old[0]['frameHash']==old[1]['frameHash']==new[0]['frameHash']==new[1]['frameHash']==new[2]['frameHash']
assert old[2]['delta']!=new[2]['delta']and old[2]['frameHash']!=new[2]['frameHash']
assert new[0]['delta']==new[1]['delta']==new[2]['delta']
assert new[1]['state']['stepCount']==new[2]['state']['stepCount']==2
assert new[2]['stats']['reservation']['reuse']=={'accepted':2,'rejected':0,'checkedSupports':20,'candidates':2}
reference=results['old04']['cases'][0];supplement=results['new05'];fallback=supplement['cases'][1]
assert fallback['label']=='collision-fallback'and fallback['compiles']==0 and fallback['stats']['reservation']['reuse']['rejected']==1
for k in ['modelHash','frameHash','delta','counts','proof']:assert fallback[k]==reference[k],('fallback differs',k)
assert supplement['cases'][2]['label']=='independent-revision'and supplement['cases'][2]['compiles']==1
assert supplement['cases'][3]['label']=='restore-before-viewport'and supplement['cases'][3]['compiles']==1
assert supplement['glyphFont']['requested']==supplement['glyphFont']['effective']=='gothic_bold'
assert supplement['glyphFont']['state']['phase']=='unsupported'and supplement['glyphFont']['clear']
assert supplement['viewport']['size']==[640,360]and supplement['viewport']['state']['phase']=='unsupported'and supplement['viewport']['clear']
for row in supplement['cases']:
 p=row['parkedStats'];assert p['owner']['residentBytes']+p['reservation']['controllerAndBindingReservationBytes']<=8388608
 if row['label']in ['collision-fallback','independent-revision']:
  assert p['owner']['residentModels']==1 and p['reservation']['records']==p['reservation']['bindings']==0 and p['reservation']['previousBytes']>0
 # Independent rational rectangle/circle comparison for every retained all-clock group.
 proof=row['proof'];assert proof['referenceCount']==250 and len(proof['groups'])==10 and proof['scalarContributions']==sum(g['scalarContributions']for g in proof['groups'])==1754
 circle={'cx':F(.5*1920*.25),'cy':F(.1*1080*.25),'r':F((.1 if row['label']=='initial-for-boundaries'else .12)*1080*.25),'margin':F(2.7)}
 for g in proof['groups']:
  b={k:F(v)for k,v in g['bounds'].items()};assert 0<=b['x0']<=b['x1']<=480 and 0<=b['y0']<=b['y1']<=270
  x=max(b['x0'],min(circle['cx'],b['x1']));y=max(b['y0'],min(circle['cy'],b['y1']));assert (x-circle['cx'])**2+(y-circle['cy'])**2>(circle['r']+circle['margin'])**2
# Genuine replay source aggregates every scheduled template support and glyph;
# the optimization only retains these frozen groups, not user-supplied payloads.
source=(R/'src/11zz08b_bulbs_replay86.js').read_text()
for text in ['for(const entry of model.schedule)','for(const s of template.supports)','for(const item of template.items)','for(const g of item.glyphs)','g.bounds=C.union(g.bounds,bounds);g.scalarContributions++','refs.size===model.schedule.length']:
 assert text in source,text
final=B/'bulbs-previous-model86co-sourceprep04-final/pins.json'
if final.exists():
 for p in load(final):
  verify_pin(p)
print(json.dumps({'passed':True,'finalPins':len(load(final))if final.exists()else None,'historicalFinalSnapshot':True,'scope':'historical86co sidecar numeric evidence only, including original final review snapshot; not current product qualification; warm reuse, full aggregate circle evaluation, original cold candidate fallback, unchanged semantic model/proof/frame at fallback, revision/font/viewport rejection and old authority release; no cold performance acceptance or all-input claim','runs':summaries},indent=2))
