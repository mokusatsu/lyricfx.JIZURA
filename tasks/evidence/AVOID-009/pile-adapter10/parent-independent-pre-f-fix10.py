import json,math,pathlib,hashlib,sys
root=pathlib.Path('/tmp/avoid009-pile01');rp=pathlib.Path(sys.argv[1]) if len(sys.argv)>1 else root/'physical10/run01/raw.json';raw=json.loads(rp.read_text());old=json.loads((root/'physical09/run01/raw.json').read_text());n=dict(cases=0,continuousOwnerHulls=0,continuousVertices=0,firstWitnesses=0,observations=0,activeObservations=0,actualPolygons=0,activePolygons=0,actualVertices=0,heapMappings=0,sourceSlots=0,originalClockChecks=0);results=[]
def inside(p,poly):
 z=[(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]) for a,b in zip(poly,poly[1:]+poly[:1])];return min(z)>=-1e-7 or max(z)<=1e-7
def distance(p,poly):
 if inside(p,poly):return 0
 ds=[]
 for a,b in zip(poly,poly[1:]+poly[:1]):
  dx,dy=b[0]-a[0],b[1]-a[1];u=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy))) if dx or dy else 0;ds.append(math.hypot(p[0]-a[0]-u*dx,p[1]-a[1]-u*dy))
 return min(ds)
def eq(a,b):assert math.isclose(a,b,rel_tol=3e-12,abs_tol=3e-8),(a,b)
def compact(r):
 r=json.loads(json.dumps(r));r.pop('launchLedger',None);r.pop('floorLedger',None);r.pop('signature',None)
 for q in r.get('rowReflow',{}).get('sharedY',{}).get('runs',[]):
  for k in ['constraints','reserve','zeroAllowed']:q.pop(k,None)
 return r
for pair in raw['rows']:
 a=pair['10'];fixture=next(q for q in raw['cases'] if q['id']==pair['id']);W,H=fixture['W'],fixture['H'];tr=a['cold']['trajectory'];ref=next(q for q in old['rows'] if q['id']==pair['id'])['09'];trial=next(t['trial'] for t in ref['trials'] if t['id']=='a84-split-rho110-groupY');segs=tr['units'][0]['segments'];margin=max(2,.005*min(W,H));assert len(segs)==2;caseMin=math.inf
 for s in segs:
  assert compact(s['composition'])==compact(trial['recipe']);units={q['owner']:q for q in s['unitProofs']};expected={q['owner']:q for q in trial['continuous']['units']};assert units.keys()==expected.keys()
  for owner,u in units.items():assert u['envelope']==expected[owner]['stageEnvelope']['polygon'];n['continuousOwnerHulls']+=1;n['continuousVertices']+=len(u['envelope'])
  ps=[u['envelope'] for u in units.values()];flat=sum(ps,[]);X=[-min(p[0]for p in flat),W-max(p[0]for p in flat)];Y=[-min(p[1]for p in flat),H-max(p[1]for p in flat)];good=[]
  for dx in dict.fromkeys([X[0],sum(X)/2,X[1]]):
   for dy in dict.fromkeys([Y[0],sum(Y)/2,Y[1]]):
    moved=[[[p[0]+dx,p[1]+dy]for p in poly]for poly in ps];ok=all(0<=p[0]<=W and 0<=p[1]<=H for poly in moved for p in poly) and all(distance((s['circle']['cx'],s['circle']['cy']),poly)>=s['circle']['r']+margin for poly in moved)
    if ok:good.append([dx,dy])
  assert good and good[0]==s['from']==s['to'];n['firstWitnesses']+=1
 for frame in a['frames']+a['warmFrames']+[a['refinalized']['frame']]:
  assert frame['error'] is None
  for o in frame['observations']:
   n['observations']+=1;g=o['geometry'];assert g['ownership']=='all-primary-none-exempted';assert len(o['polygons'])==len(o['actual']);assert all(e['role']=='primary' for e in o['events']);s=next((s for s in segs if s['start']<=o['realTime']<s['end']),None);units={q['owner']:q for q in s['unitProofs']} if s else {};assert o['offset']==(s['from'] if s else [0,0]);assert o['activeRegion']==(s['region']if s else None)
   if s:n['activeObservations']+=1
   for actual,p in zip(o['actual'],o['polygons']):
    n['actualPolygons']+=1;n['actualVertices']+=len(p);assert p==[[v[0]+o['offset'][0],v[1]+o['offset'][1]]for v in actual['polygon']]
    if actual['kind']=='item' and actual['owner'].startswith('pile.heap.'):
     q=g['heap'][actual['index']];assert q['id']==actual['owner'] and q['ordinal']==actual['index'] and q['ch']==actual['ch'];n['heapMappings']+=1
    if s:
     n['activePolygons']+=1;assert all(inside(p,units[actual['owner']]['envelope'])for p in actual['polygon']);assert all(0<=v[0]<=W and 0<=v[1]<=H for v in p);d=distance((s['circle']['cx'],s['circle']['cy']),p)-s['circle']['r']-margin;assert d>=0;caseMin=min(caseMin,d)
   lag={'main':0,'A':.8/24,'B':1.6/24}[o['pass']];assert o['motionTime']==max(0,math.floor(o['realTime']/(1/24)+1e-6)/24-lag);eq(o['lt'],o['motionTime']);eq(o['ltb'],o['lt']+lag);n['originalClockChecks']+=1
   for q in g['slots']:
    src=next(v for v in trial['source']['slots']if v['id']==q['id']);assert all(q[k]==src[k]for k in ['id','row','slot','ch','gap','advance','when','mi','f']);n['sourceSlots']+=1
 for q in raw['comparisons']:
  if q['id']==pair['id']:assert all(c['equal']for c in q['checks'])
 assert a['warm']['newSegmentIdentity'] and a['warm']['dependencyValuesEqual'];assert a['fontDrift']['error']['code']=='PILE_STALE_DEPENDENCY';assert a['cameraDrift']['error']['code']=='PILE_STALE_DEPENDENCY';assert a['revisionDrift']['error']['code']=='STALE_PLACEMENT_PLAN';assert a['blocked']['error']['code']=='PILE_COMPOSITION_EXCLUDED';assert not a['blocked']['observations'];n['cases']+=1
 results.append({'id':pair['id'],'minObservedCircleClearanceBeyondMargin':caseMin,'coldMs':a['cold']['preparationMs'],'warmMs':a['warm']['preparationMs'],'trajectoryBytes':a['cold']['trajectoryBytes'],'warmTrajectoryBytes':a['warm']['trajectoryBytes'],'sourceGuardsAndWitnessesExactlyMatchAccepted09':True})
out={'status':'INDEPENDENT_SOURCE_GEOMETRY_RAW_PASS_ONLY_NOT_OVERALL_RUN_ACCEPTANCE','rawSHA256':hashlib.sha256(rp.read_bytes()).hexdigest(),'counts':n,'cases':results,'originalRunnerFailures':[{'id':q['id'],'failures':q['10']['failures']}for q in raw['rows']],'limits':'Normal bounded2fixtures only, guard/contact/readability/human/performance/global009 not accepted; no image/public result checks'};pathlib.Path('/tmp/parent-pile-adapter10-raw.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out,indent=2))
