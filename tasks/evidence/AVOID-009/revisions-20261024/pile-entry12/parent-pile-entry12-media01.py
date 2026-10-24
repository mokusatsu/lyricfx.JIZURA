from pathlib import Path
import gzip,json,hashlib,math
r=Path('/tmp/avoid009-pile-entry-20261024-01/output01');m=json.loads((r/'manifest.json').read_text());frames={s:json.load(gzip.open(r/(s+'-frames.json.gz'))) for s in ['before','after']};inputs={s:json.load(gzip.open(r/(s+'-inputs.json.gz'))) for s in ['before','after']};old=json.loads(Path('/tmp/avoid009-pile-media01/output02/after-motion.json').read_text());a,b=inputs['after']['sourcePlan'].copy(),inputs['before']['sourcePlan'].copy();assert set(a)==set(b);ia,ib=a.pop('lyricAvoidanceIndex'),b.pop('lyricAvoidanceIndex');assert a==b;assert ia['enabled'] and not ib['enabled'];ia.pop('enabled');ib.pop('enabled');assert ia==ib
for name,pin in m['assets'].items():
 p=r/name;data=p.read_bytes();assert len(data)==pin['bytes'] and hashlib.sha256(data).hexdigest()==pin['sha256'],name
tr=inputs['after']['renderPlan']['cuts'][0]['placementTrajectory'];seg=tr['units'][0]['segments'][0];units={u['owner']:u for u in seg['unitProofs']};count={'framePairs':240,'afterObservations':0,'polygons':0,'vertices':0,'topEntryPolygons':0,'settledFramesExact064':0,'firstFallOwnersAndPasses':0};seen=set();minimumFirstTop=-math.inf
assert len(frames['before'])==len(frames['after'])==len(old)==240;assert frames['before'][0]['encoderInputPNG']==frames['after'][0]['encoderInputPNG']
def inside(v,p):
 q=[(b[0]-a[0])*(v[1]-a[1])-(b[1]-a[1])*(v[0]-a[0]) for a,b in zip(p,p[1:]+p[:1])];return all(x>=-1e-5 for x in q) or all(x<=1e-5 for x in q)
def distance(poly,c):
 if inside(c,poly):return 0
 z=math.inf
 for a,b in zip(poly,poly[1:]+poly[:1]):
  dx,dy=b[0]-a[0],b[1]-a[1];q=dx*dx+dy*dy;t=max(0,min(1,((c[0]-a[0])*dx+(c[1]-a[1])*dy)/q)) if q else 0;z=min(z,math.hypot(c[0]-a[0]-t*dx,c[1]-a[1]-t*dy))
 return z
for n,(before,after) in enumerate(zip(frames['before'],frames['after'])):
 assert before['frame']==after['frame']==n and before['time']==after['time']==n/60;assert not before['observations'];assert len(after['observations'])==3
 for o,passname in zip(after['observations'],['B','A','main']):
  count['afterObservations']+=1;assert o['pass']==passname;lag={'B':1.6/24,'A':.8/24,'main':0}[passname];tp=max(0,math.floor((n/60)/(1/60)+1e-6)*(1/60)-lag);assert abs(o['motionTime']-tp)<1e-12 and abs(o['lt']-tp)<1e-12;assert abs(o['ltb']-(tp+lag))<1e-12;assert o['realTime']==n/60
  assert o['envelopeCovered'] and o['stagePolicySatisfied'] and o['strictCircleClear'] and o['safety']=='safe';assert abs(o['entrance']['materialAlpha']-(1-(1-max(0,min(1,o['lt']/.5)))**3))<1e-15
  for q,p in zip(o['actual'],o['polygons']):
   u=units[q['owner']];assert all(inside(v,u['envelope']) for v in q['polygon']);assert p==[[x+o['offset'][0],y+o['offset'][1]] for x,y in q['polygon']];fall='entryRule' in u and 0<=q.get('sourceF',-1)<1;assert all(math.isfinite(x+y) and 0<=x<=1280 and y<=720 and (y>=0 or fall) for x,y in p);assert distance(p,(640,302.4))>=144+3.6-1e-7
   count['polygons']+=1;count['vertices']+=len(p)
   if fall:
    key=(passname,q['owner'])
    if key not in seen:assert all(y<0 for x,y in p);minimumFirstTop=max(minimumFirstTop,max(y for x,y in p));seen.add(key)
   if any(y<0 for x,y in p):assert fall and any(e['owner']==q['owner'] and e['pass']==passname and 0<=e['sourceF']<1 and e['expiryLocalClock']==e['when']+.34 for e in o['entryLedger']);count['topEntryPolygons']+=1
   if 'entryRule' in u and q.get('sourceF',-1)>=1:assert all(inside(v,u['settledEnvelope']) for v in q['polygon'])
 if all(o['lt']>=.5 and all(q['gap'] or q['f']>=1 for q in o['sourceSlots']) for o in after['observations']):assert after['encoderInputPNG']==old[n]['encoderInputPNG'];count['settledFramesExact064']+=1
count['firstFallOwnersAndPasses']=len(seen);assert len(seen)==12;assert not m['errors'];result={'status':'PASS','manifestSHA256':hashlib.sha256((r/'manifest.json').read_bytes()).hexdigest(),'counts':count,'firstFallLargestGuardY':minimumFirstTop,'fullSourcePlanAndCutKeysExactExceptAvoidanceEnabled':True,'initialNativePNGExact':True,'afterSourceCommit':'ee5a2788','parentImageViews':0,'publicResultChecks':0,'limits':['Native BEFORE has expected clock model only, no observed placement callback','Fade differs from original geometric emergence; human motion review pending','No formal performance/full009 acceptance']};Path('/tmp/parent-pile-entry12-media01.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
