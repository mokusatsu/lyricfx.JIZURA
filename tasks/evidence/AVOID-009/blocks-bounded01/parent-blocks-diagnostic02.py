import pathlib,json,gzip,math,hashlib,collections,shutil
repo=pathlib.Path('/workspace/lyricfx.JIZURA');path=repo/'work/avoid009-blocks-bounded01/evidence/diagnostic02.raw.json.gz';raw=json.loads(gzip.decompress(path.read_bytes()));assert len(raw['results'])==8 and not raw['errors']
counts=collections.Counter();outcomes=collections.Counter();favorable=[]
def inside(p,poly):
 cross=[(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]) for a,b in zip(poly,poly[1:]+poly[:1])]
 return not(any(x>1e-6 for x in cross) and any(x< -1e-6 for x in cross))
def distance(poly,c):
 p=[c['cx'],c['cy']]
 if inside(p,poly):return 0
 ds=[]
 for a,b in zip(poly,poly[1:]+poly[:1]):
  dx,dy=b[0]-a[0],b[1]-a[1];den=dx*dx+dy*dy;t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/den)) if den else 0
  ds.append(math.hypot(a[0]+t*dx-p[0],a[1]+t*dy-p[1]))
 return min(ds)
def branch(cut,g,lt,index,pout=None):
 if index is None:return 'floor'
 if not 0<=lt<cut['dur']:return 'expired'
 b=g['blocks'][index];when=.06+(b['order']+1)*g['gap'];f=(lt-when)/g['fd'];po=max(0,min(1,(lt-(cut['dur']-cut['outDur']))/cut['outDur'])) if cut['outDur']>0 else 0
 if pout is not None:assert abs(po-pout)<1e-12
 q=max(0,min(1,po*1.4-(b['order']+1)/(g['n']+3)*.4))
 return 'absent' if f<0 else ('entry' if f<1 else 'settled')+':'+('q0' if q==0 else 'q1' if q==1 else 'moving')
for row in raw['results']:
 c,o=row['current'],row['original'];cut=c['sourceCutSnapshot'];counts['fixtures']+=1;assert not c['errors']
 for old in o['observations']:
  new=next(n for n in c['observations'] if all(n[k]==old[k] for k in ['realTime','pass','renderScale']));assert new['events']==old['events'] and new['pixelHash']==old['pixelHash'];counts['nativeBaselinePixelEventPairs']+=1
 strip=lambda rows:[{k:v for k,v in f.items() if k not in ['sourceBranchContainment','sourceBranchContainmentEligible']} for f in rows]
 assert strip(c['forcedDirect']['rows'])==strip(o['forcedDirect']['rows']);counts['forcedNativePairs']+=len(c['forcedDirect']['rows'])
 d=c['diagnostic'];counts['allObservationRows']+=len(c['observations'])
 if not d:assert c['typed']['code']=='BLOCKS_INITIAL_DOMAIN';counts['typedUnsupportedControls']+=1;continue
 assert d['status']=='diagnostic-only' and not d['adapterRegistered'] and not d['safetyCertificate'] and d['sourceCutSnapshot']==cut
 g=d['sourceCatalog'];W,H=g['stage'];assert c['planClockSnapshot']['exactOutDur']==cut['outDur']==.4
 for b,s in zip(g['blocks'],d['sourceBranches']['blocks']):
  when=.06+(b['order']+1)*g['gap'];delay=s['delay'];last=math.nextafter(cut['dur'],-math.inf)
  f=lambda t:(t-when)/g['fd'];q=lambda t:max(0,min(1,(max(0,min(1,(t-(cut['dur']-cut['outDur']))/cut['outDur'])) if cut['outDur']>0 else 0)*1.4-(b['order']+1)/(g['n']+3)*.4))
  predicates={'bodyStart':lambda t:f(t)>=0,'settledStart':lambda t:f(t)>=1,'movingStart':lambda t:q(t)>0,'tailStart':lambda t:q(t)==1,'glyphStart':lambda t:t-delay>=0}
  for key,pred in predicates.items():
   first=s[key]
   if first is None:assert not pred(last)
   else:
    assert 0<=first<cut['dur'] and pred(first)
    if first>0:assert not pred(math.nextafter(first,-math.inf)),(key,first)
   counts['exactFirstTrueOrAbsentPredicates']+=1
  for span in s['ranges']:
   assert span['range'][0]<=span['range'][1]
   assert all(branch(cut,g,t,b['sourceIndex'])==span['key'] for t in span['range']);counts['predicateBranchRanges']+=1
 for metric in d['metrics']:
  b=g['blocks'][metric['sourceIndex']];assert metric['size']==g['k']*b['sz']*.6 and metric['font']==g['params']['font'];counts['exactNativeFontMetrics']+=1
 variants={1:d,**{float(k):v for k,v in c['additionalScaleDiagnostics'].items()}}
 for obs in c['observations']:
  if not obs['coverageEligible']:counts['nonProofExpiredObservations']+=1;continue
  assert obs['active'];diag=variants[obs['renderScale']];assert len(obs['events'])==len(obs['coverage']);counts['activeGeometryObservations']+=1
  for event,witness in zip(obs['events'],obs['coverage']):
   idx=None if event['owner']=='blocks.floor' else int(event['owner'].split('.')[2]);key=branch(cut,g,obs['lt'],idx);cell=diag['ledger'][witness['selectedCellIndex']]
   assert event['role']=='primary' and cell['owner']==event['owner'] and cell['pass']==obs['pass'] and cell['branchKey']==key==witness['branchKey']
   assert cell['sourceRange'][0]<=obs['lt']<=cell['sourceRange'][1]
   assert all(inside([x/obs['renderScale'],y/obs['renderScale']],cell['polygon']) for poly in event['polygons'] for x,y in poly)
   counts['selectedBranchWholeEvents']+=1;counts['selectedBranchVertices']+=sum(len(p) for p in event['polygons'])
 for forced in c['forcedDirect']['rows']:
  assert not forced['coverageEligible'] and forced['engineReachabilityNotClaimed']
  if not forced['sourceBranchContainmentEligible']:counts['expiredForcedSourceRows']+=1;continue
  assert 0<=forced['ownLt']<cut['dur'];counts['inLifetimeForcedSourceRows']+=1
  assert len(forced['events'])==len(forced['sourceBranchContainment'])
  for event,witness in zip(forced['events'],forced['sourceBranchContainment']):
   idx=None if event['owner']=='blocks.floor' else int(event['owner'].split('.')[2]);key=branch(cut,g,forced['ownLt'],idx,forced['pOut']);cell=d['ledger'][witness['selectedCellIndex']]
   if idx is not None:
    actual=forced['blocks'][idx];actualKey=('entry' if actual['f']<1 else 'settled')+':'+('q0' if actual['q']==0 else 'q1' if actual['q']==1 else 'moving');assert actual['emitted'] and key==actualKey
   assert cell['owner']==event['owner'] and cell['pass']==forced['pass'] and cell['branchKey']==key==witness['branchKey']
   assert cell['sourceRange'][0]<=forced['ownLt']<=cell['sourceRange'][1]
   assert all(inside(p,cell['polygon']) for poly in event['polygons'] for p in poly);counts['forcedSelectedBranchEvents']+=1;counts['forcedSelectedBranchVertices']+=sum(len(p) for p in event['polygons'])
 for trial in d['trials']:
  circle=trial['region']['circle'];active=[e for e in d['ledger'] if e['realRange'][0]<trial['region']['end'] and e['realRange'][1]>trial['region']['start']];margin=max(2,.005*min(W,H))
  for a in trial['attempts']:
   outcomes[a['disposition']]+=1;assert a['diagnosticOnly'] and a['crossRegionTailAdoptionPending']
   if not a['disposition'].startswith('native-translation'):continue
   assert a['holdEnough'] and a['holdIntersection'][1]-a['holdIntersection'][0]>=.04
   strictMiss=0;waived=0
   for e in active:
    poly=[[x+a['offset'][0],y+a['offset'][1]] for x,y in e['polygon']];clear=distance(poly,circle)>circle['r']+margin
    hold=e['realRange'][0]<d['holdWindow'][1] and e['realRange'][1]>d['holdWindow'][0];relax=(e['phase']['entry'] or e['phase']['movingExit']) and not hold
    assert clear or relax
    if not clear:strictMiss+=1;waived+=1;assert e['branchKey'].startswith('entry:') or e['branchKey'].endswith(':moving')
    tail=next((t for t in d['tails'] if t['block']==e['block']),None) if e['phase']['q1Tail'] else None
    tailAllowed=tail is not None and tail['minY']+a['offset'][1]>H
    if tail:assert abs(tail['minY']-min(p[1] for p in tail['allCopiesHull']))<1e-10
    assert all(0<=x<=W and (y>=0 or e['phase']['entry']) and (y<=H or e['phase']['movingExit'] or tailAllowed) for x,y in poly)
    if e['phase']['floor']:assert clear and all(0<=y<=H for x,y in poly)
    counts['conditionalCandidateBranchPolygons']+=1
   assert a['fullIntervalCircleStrict']==(strictMiss==0)
   favorable.append({'case':c['spec']['id'],'offset':a['offset'],'movingCircleWaivedBranchHulls':waived,'classification':'conditional diagnostic candidate only, no adapter safety'})
report={'scope':'Independent exact Float64 predicates and selected-branch geometry; diagnostic only','rawSHA256':hashlib.sha256(path.read_bytes()).hexdigest(),'parentSession':33837,'exit':0,'counts':dict(counts),'outcomes':dict(outcomes),'conditionalCandidates':favorable,'safeAdapterCountIncrement':0,'codeIntegrated':False,'parentImages':0,'publicChecks':0,'remaining':['Global active/gap/offset0 tail no-reentry adoption','Production adapter source/dependency/cache/warm decode','Formal performance','Human placement/motion review']}
out=repo/'tasks/evidence/AVOID-009/blocks-bounded01';(out/'parent-diagnostic02-review.json').write_text(json.dumps(report,indent=2)+'\n');shutil.copy2(__file__,out/pathlib.Path(__file__).name);print(json.dumps({k:v for k,v in report.items() if k!='conditionalCandidates'}));print('conditionalCandidates',len(favorable))
