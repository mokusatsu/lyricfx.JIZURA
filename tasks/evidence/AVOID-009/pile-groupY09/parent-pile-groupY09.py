import json,math,pathlib,hashlib
from fractions import Fraction as F
base=pathlib.Path('/tmp/avoid009-pile01/physical09');raw=json.loads((base/'run01/raw.json').read_text());counts=dict(runs=0,slots=0,witnesses=0,translatedFrames=0,translatedVertices=0,sharedYRuns=0,innerOwnerConstraints=0,correctedFullPhaseWitnesses=0,correctedActualFullPhaseFrames=0);out=[]
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
 after=pair['09'];plan=json.loads(after['before']['json']);W,H=plan['W'],plan['H'];trials={q['id']:q for q in after['trials']}
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
  if t.get('sharedYProof'):
   yp=t['sharedYProof'];assert yp['allOwnersWithinOriginalAllowance'] and yp['recheckStatus']=='diagnostic-budget-compliant';assert yp['correctedCorrelated']==entry['correlated'];assert all(q['withinTrialEnvelopeAllowance'] for q in entry['correlated']['comparisons']);assert yp['derivation']==f['sharedY'];baseline_trial=yp['baselineTrial'];native=yp['baselineCorrelated']['native']['rows'];candidate=yp['baselineCorrelated']['candidate']['rows'];correlations=yp['baselineCorrelated']['comparisons'];assert not baseline_trial['recipe']['rowReflow'].get('sharedY')
   for run,sourceRun in zip(f['sharedY']['runs'],f['runs']):
    assert run['sourceIDs']==sourceRun['sourceIDs'];owners=[q['id'] for q in g['slots'] if q['id'] in sourceRun['sourceIDs'] and not q['gap']];assert run['nongapIDs']==owners;assert [q['owner'] for q in run['constraints']]==owners;Ls=[];Us=[]
    for c in run['constraints']:
     n=next(q for q in native if q['owner']==c['owner']);q=next(q for q in candidate if q['owner']==c['owner']);cmp=next(q for q in correlations if q['owner']==c['owner']);assert c['candidateClearance']==q['clearance'] and c['allowance']==cmp['allowance'];eq(c['nativeGap'],n['gapBudget']);eq(c['nativePenetration'],n['penetrationBudget']);L=-F.from_float(n['gapBudget'])-F.from_float(c['allowance']['gap'])-F.from_float(q['clearance'][0]);U=F.from_float(n['penetrationBudget'])+F.from_float(c['allowance']['penetration'])-F.from_float(q['clearance'][1]);assert F.from_float(c['lower'])>=L and F.from_float(c['upper'])<=U;Ls.append(L);Us.append(U);counts['innerOwnerConstraints']+=1
    cap=F.from_float(.04*g['size']);L=max([-cap]+Ls);U=min([cap]+Us);assert F.from_float(run['inner'][0])>=L and F.from_float(run['inner'][1])<=U;dy=run['dy'];lo,hi=run['inner'];assert lo<=dy<=hi and abs(dy)<=float(cap);zeroAllowed=lo<=0<=hi;assert zeroAllowed==run['zeroAllowed'];assert dy==0 if zeroAllowed else lo<dy<hi;eq(dy,0 if zeroAllowed else lo/2+hi/2);eq(run['reserve'],min(dy-lo,hi-dy));counts['sharedYRuns']+=1
  clear=0;fullclear=0
  for w in d['witnesses']:
   dx,dy=w['offset'];assert X[0]<=dx<=X[1] and Y[0]<=dy<=Y[1];blocked=[];stage=True
   for u in units:
    stage=stage and all(0<=p[0]+dx<=W and 0<=p[1]+dy<=H for p in u['stageEnvelope']['polygon']);circle=u['circleStrictEnvelope']
    if circle and distance((d['circle']['cx'],d['circle']['cy']),[[p[0]+dx,p[1]+dy] for p in circle['polygon']])<d['circle']['r']+d['margin']:blocked.append((u['owner'],u['kind']))
   allBlocked=[]
   for u in units:
    if distance((d['circle']['cx'],d['circle']['cy']),[[p[0]+dx,p[1]+dy] for p in u['stageEnvelope']['polygon']])<d['circle']['r']+d['margin']:allBlocked.append((u['owner'],u['kind']))
   assert allBlocked==[(b['owner'],b['kind']) for b in w['allPhaseBlocked']];assert w['fullyStrictAllPhaseClear']==(not allBlocked);fullclear+=not allBlocked
   assert stage==w['stageContained'];assert blocked==[(b['owner'],b['kind']) for b in w['blocked']];assert w['proposedStrictPolicyEnvelopeClear']==(not blocked);clear+=not blocked;counts['witnesses']+=1
  if t.get('sharedYProof'):assert fullclear>0 and d['selected']['fullyStrictAllPhaseClear'];counts['correctedFullPhaseWitnesses']+=fullclear
  out.append(dict(fullPhaseCircleClearWitnesses=fullclear,case=pair['id'],recipe=key,split=bool(f),stageRangeNonempty=d['stageRangeNonempty'],circleClearWitnesses=clear,strictBudgetPassed=sum(q['withinEnvelopeBudget'] for q in t['comparisons']),trialAllowancePassed=sum(q['withinTrialEnvelopeAllowance'] for q in t['comparisons']),budgetTotal=len(t['comparisons'])))
 for obs in after['observations']:
  z=obs['translated']
  if not z:continue
  d=trials[obs['id']]['translationDesign'];assert z['offset']==d['selected']['offset'];assert z['directHash']==z['replayHash'];assert z['positivePixels']>0 or not obs['actual'];stage=True;clear=True;allclear=True;cross=[]
  for a,b in zip(obs['actual'],z['polygons']):
   assert a['owner']==b['owner'] and a['circleApplies']==b['circleApplies'];dx,dy=z['offset']
   for p,v in zip(a['polygon'],b['polygon']):eq(v[0],p[0]+dx);eq(v[1],p[1]+dy);stage=stage and 0<=v[0]<=W and 0<=v[1]<=H;counts['translatedVertices']+=1
   hit=distance((d['circle']['cx'],d['circle']['cy']),b['polygon'])<d['circle']['r']+d['margin']
   allclear=allclear and not hit
   if a['circleApplies']:clear=clear and not hit
   elif hit:cross.append(a['owner'])
  assert allclear==z['fullyStrictActualCircleClear']
  if trials[obs['id']]['trial'].get('sharedYProof'):assert allclear;counts['correctedActualFullPhaseFrames']+=1
  assert stage==z['completeMeasuredStageContained'];assert clear==z['proposedStrictActualCircleClear'];assert cross==z['entryCircleCrossingOwners'];counts['translatedFrames']+=1
result={'status':'PASS','rawSHA256':hashlib.sha256((base/'run01/raw.json').read_bytes()).hexdigest(),'counts':counts,'diagnostics':out,'limitations':['SharedY source-budget trial plus fullystrictallphase geometry; no Safe/adapter/visual acceptance','No entry/exit waiver activated','Source-budget allowance does not prove physical contact or readability']};pathlib.Path('/tmp/parent-pile-groupY09.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
