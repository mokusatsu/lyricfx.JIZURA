import json,math,pathlib,hashlib
base=pathlib.Path('/tmp/avoid009-pile01/physical07');raw=json.loads((base/'run02/raw.json').read_text());counts=dict(runs=0,slots=0,witnesses=0,translatedFrames=0,translatedVertices=0);out=[]
def eq(a,b):assert math.isclose(a,b,rel_tol=3e-12,abs_tol=3e-8),(a,b)
def inside(p,poly):
 z=[(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]) for a,b in zip(poly,poly[1:]+poly[:1])];return min(z)>=-1e-7 or max(z)<=1e-7
def distance(p,poly):
 if inside(p,poly):return 0
 ds=[]
 for a,b in zip(poly,poly[1:]+poly[:1]):
  x,y=b[0]-a[0],b[1]-a[1];t=max(0,min(1,((p[0]-a[0])*x+(p[1]-a[1])*y)/(x*x+y*y))) if x or y else 0;ds.append(math.hypot(p[0]-a[0]-t*x,p[1]-a[1]-t*y))
 return min(ds)
for pair in raw['rows']:
 after=pair['07'];plan=json.loads(after['before']['json']);W,H=plan['W'],plan['H'];trials={q['id']:q for q in after['trials']}
 for key,entry in trials.items():
  t=entry['trial'];r=t['recipe'];g=t['source'];f=r.get('rowReflow');d=entry['translationDesign'];units=t['continuous']['units'];X=[-min(q['stageEnvelope']['x'][0] for q in units),W-max(q['stageEnvelope']['x'][1] for q in units)];Y=[-min(q['stageEnvelope']['y'][0] for q in units),H-max(q['stageEnvelope']['y'][1] for q in units)]
  for a,b in zip(X+Y,d['range']['x']+d['range']['y']):eq(a,b)
  assert d['stageRangeNonempty']==(X[0]<=X[1] and Y[0]<=Y[1]);assert len(d['witnesses'])<=9
  if f:
   assert g['nR']==1 and r['c']==r['c0']==g['cx'];slots=g['slots'];options=[]
   for k in range(1,len(slots)):
    if all(any(not q['gap'] for q in run) for run in [slots[:k],slots[k:]]):options.append((abs(sum(q['advance'] for q in slots[:k])-sum(q['advance'] for q in slots[k:])),not(slots[k-1]['gap'] or slots[k]['gap']),k))
   assert min(options)[2]==f['boundary']
   for i,run in enumerate([slots[:f['boundary']],slots[f['boundary']:]]):
    z=f['runs'][i];center=(run[0]['gxp']-run[0]['advance']/2+run[-1]['gxp']+run[-1]['advance']/2)/2;target=g['cx']+(-1 if i==0 else 1)*f['rho']*r['sigma'];eq(z['sourceCenter'],center);eq(z['targetCenter'],target);eq(z['offset'],target-center);assert z['sourceIDs']==[q['id'] for q in run];counts['runs']+=1
    for q in run:
     v=f['slots'][q['slot']];eq(v['targetGxp'],q['gxp']+target-center);assert all(v[k]==q[k] for k in ['id','row','slot','ch','gap','advance','when']);counts['slots']+=1
    for a,b in zip(run,run[1:]):eq(f['slots'][b['slot']]['targetGxp']-f['slots'][a['slot']]['targetGxp'],b['gxp']-a['gxp'])
  for q in t['comparisons']:
   fields=[('gap','gap',.03),('penetration','penetration',.01),('overhang','overhang',.04)]
   for fld,delta,frac in fields:eq(q['delta'][delta],q['candidate'][fld]-q['native'][fld]);eq(q['trialAllowance'][fld],g['size']*frac)
   assert q['withinTrialEnvelopeAllowance']==all(q['candidate'][fld]<=q['native'][fld]+g['size']*frac for fld,_,frac in fields)
  clear=0
  for w in d['witnesses']:
   dx,dy=w['offset'];assert X[0]<=dx<=X[1] and Y[0]<=dy<=Y[1];blocked=[];stage=True
   for u in units:
    stage=stage and all(0<=p[0]+dx<=W and 0<=p[1]+dy<=H for p in u['stageEnvelope']['polygon']);circle=u['circleStrictEnvelope']
    if circle and distance((d['circle']['cx'],d['circle']['cy']),[[p[0]+dx,p[1]+dy] for p in circle['polygon']])<d['circle']['r']+d['margin']:blocked.append((u['owner'],u['kind']))
   assert stage==w['stageContained'];assert blocked==[(b['owner'],b['kind']) for b in w['blocked']];assert w['proposedStrictPolicyEnvelopeClear']==(not blocked);clear+=not blocked;counts['witnesses']+=1
  out.append(dict(case=pair['id'],recipe=key,split=bool(f),stageRangeNonempty=d['stageRangeNonempty'],circleClearWitnesses=clear,strictBudgetPassed=sum(q['withinEnvelopeBudget'] for q in t['comparisons']),trialAllowancePassed=sum(q['withinTrialEnvelopeAllowance'] for q in t['comparisons']),budgetTotal=len(t['comparisons'])))
 for obs in after['observations']:
  z=obs['translated']
  if not z:continue
  d=trials[obs['id']]['translationDesign'];assert z['offset']==d['selected']['offset'];assert z['directHash']==z['replayHash'];assert z['positivePixels']>0 or not obs['actual'];stage=True;clear=True;cross=[]
  for a,b in zip(obs['actual'],z['polygons']):
   assert a['owner']==b['owner'] and a['circleApplies']==b['circleApplies'];dx,dy=z['offset']
   for p,v in zip(a['polygon'],b['polygon']):eq(v[0],p[0]+dx);eq(v[1],p[1]+dy);stage=stage and 0<=v[0]<=W and 0<=v[1]<=H;counts['translatedVertices']+=1
   hit=distance((d['circle']['cx'],d['circle']['cy']),b['polygon'])<d['circle']['r']+d['margin']
   if a['circleApplies']:clear=clear and not hit
   elif hit:cross.append(a['owner'])
  assert stage==z['completeMeasuredStageContained'];assert clear==z['proposedStrictActualCircleClear'];assert cross==z['entryCircleCrossingOwners'];counts['translatedFrames']+=1
result={'status':'PASS','rawSHA256':hashlib.sha256((base/'run02/raw.json').read_bytes()).hexdigest(),'counts':counts,'diagnostics':out,'limitations':['Source-envelope trial only; no circle/Safe/adapter/visual acceptance','Entry allowance remains unregistered proposal','Source-budget allowance does not prove physical contact or readability']};pathlib.Path('/tmp/parent-pile-shoulder07.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
