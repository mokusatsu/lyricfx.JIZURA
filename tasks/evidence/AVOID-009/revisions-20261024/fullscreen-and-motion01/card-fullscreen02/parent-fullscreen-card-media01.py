from pathlib import Path
import json,gzip,hashlib,math
r=Path('/tmp/avoid009-fullscreen-card-20261024-01');m=json.loads((r/'manifest.json').read_text());d={side:json.load(gzip.open(r/(side+'-inputs.json.gz'))) for side in ['before','after']}
for f,p in m['assets'].items():
 b=(r/f).read_bytes();assert hashlib.sha256(b).hexdigest()==p['sha256'];assert len(b)==p['bytes']
a,b=d['before']['sourcePlan'].copy(),d['after']['sourcePlan'].copy();ia,ib=a.pop('lyricAvoidanceIndex'),b.pop('lyricAvoidanceIndex');assert a==b;assert ia==ib
counter={'framesEach':240,'distinctBefore':0,'distinctAfter':0,'observations':0,'polygons':0,'vertices':0}
def dist(p,c):
 x,y=c;cross=[];best=math.inf
 for a,b in zip(p,p[1:]+p[:1]):
  dx,dy=b[0]-a[0],b[1]-a[1];cross.append(dx*(y-a[1])-dy*(x-a[0]));q=dx*dx+dy*dy;t=max(0,min(1,((x-a[0])*dx+(y-a[1])*dy)/q)) if q else 0;best=min(best,math.hypot(x-a[0]-t*dx,y-a[1]-t*dy))
 return 0 if all(v>=-1e-9 for v in cross) or all(v<=1e-9 for v in cross) else best
frames={s:json.load(gzip.open(r/(s+'-frames.json.gz'))) for s in d}
assert frames['before'][0]['inputPNGSHA256']==frames['after'][0]['inputPNGSHA256']
for s,fs in frames.items():
 assert len(fs)==240;counter['distinct'+s.title()]=len({x['inputPNGSHA256'] for x in fs})
 for i,f in enumerate(fs):
  assert f['frame']==i and f['time']==i/60
  if s=='before':assert not f['observations'];continue
  if i>0:assert f['observations']
  for o in f['observations']:
   counter['observations']+=1;assert o['safety']=='safe' and o['offset']==[0,0] and o['stageContained'] and o['strictCircleClear'] and o['envelopeCovered']
   for p in o['polygons']:
    assert all(0<=x<=960 and 0<=y<=540 and math.isfinite(x+y) for x,y in p)
    assert dist(p,(480,226.8))>=108+2.7-1e-7;counter['polygons']+=1;counter['vertices']+=len(p)
g=d['after']['g'];assert len(g['fieldCells'])==len(g['fieldDraws'])==len(set(g['fieldDraws']))==45;assert len([x for x in g['fieldCells'] if x.get('assignedLyricIndex') is not None])==4
result={'status':'PASS','manifestSHA256':hashlib.sha256((r/'manifest.json').read_bytes()).hexdigest(),'allAssets':len(m['assets']),'completeSourcePlanAndCutKeysExact':True,'derivedIndexAlsoExact':True,'counts':counter,'parentImageViews':0,'publicResultChecks':0,'limits':'Static visual review and human motion approval pending; native BEFORE has no observed placement clocks; source/fixture fps is60'}
Path('/tmp/parent-fullscreen-card-media01.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
