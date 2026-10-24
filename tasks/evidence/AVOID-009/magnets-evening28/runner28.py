"""SOURCE28 only. Parent must review source/math before this gated run."""
from pathlib import Path
import os,sys,json,gzip,hashlib,struct,subprocess,datetime,math
sys.dont_write_bytecode=True
assert os.environ.get('MAGNETS_OBSTACLE28_RELEASE')=='PARENT_REVIEWED_SOURCE_MATH_RUNNER','Parent source/math gate required'
D=Path('/tmp/avoid009-evening-magnets28');R=Path('/workspace/lyricfx.JIZURA');sha=lambda b:hashlib.sha256(b).hexdigest();pins=json.loads((D/'evidence/pins28.json').read_text());seal=json.loads((D/'evidence/seal28.json').read_text());target=Path(os.environ.get('MAGNETS_OBSTACLE28_OUTPUT',str(D/'evidence/obstacle28.raw.json.gz')));assert target.is_absolute()and target.parent.is_dir()and not target.exists()
def check():
 assert len(pins['files'])==119 and len(pins['pycache'])==7 and len(pins['absent52'])==52
 for p in pins['files']+pins['pycache']:assert sha((R/p['path']).read_bytes())==p['sha256'],p['path']
 assert all(not(R/p).exists()for p in pins['absent52'])
 for p in seal['files']:
  b=(D/p['path']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256'],p['path']
 p=pins['localNode'];assert sha(Path(p['path']).read_bytes())==p['sha256']
 for p in seal['inputs']:
  b=Path(p['path']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256'],p['path']
check();inputs={p['kind']:p for p in seal['inputs']}
def read(kind):return json.loads(gzip.decompress(Path(inputs[kind]['path']).read_bytes()))
v=read('raw21')['results'][0];model=v['result'];plan=v['sourcePlan'];cut=model['sourceCutSnapshot'];prior=read('raw26');clock=read('raw27')
assert not v['containmentFailures']and not v['cameraFailures']and model['metricKeys']==23062
assert prior['selectedModeCounts']=={'accepted21-fallback':965,'correlated-endpoint-refinement':359}and prior['candidateCount']==0
assert prior['certificate']is False and not prior['adapterRegistered']and len(prior['attempts'])==486 and len(prior['ledger'])==1324
assert clock['proofDomain']['representableCount']=='4616358504166684700'and len(clock['states'])==250 and len(clock['all1324SupportMappings'])==1324
assert clock['nodeParity']['allQueryBitsAndN']and clock['nodeParity']['allStatesMatch']and len(clock['actual54RootClockChecks'])==54
assert clock['limits']['allContinuousPrimaryCircleStageBoardObligationsRemain']and clock['certificate']is False and not clock['candidateEvaluationPerformed']
assert clock['sourceGeometryChanged']is False and clock['obstacleGeometryChanged']is False
assert plan['W']==960 and plan['H']==540 and plan['fps']==60 and cut['seed']==1205 and cut['text']=='風の先へ'and cut['dur']==4 and plan['duration']==4.150001
# Immutable raw21/27 full-plan and119 pins bind all effective style, FX, inputs,
# overrides and actual selectors. No broad/full-frame constancy statement.
assert plan['fx']['koma']==0 and not cut['effectFx']and not cut['effectStyle']and not plan['events']and not plan['beats']
assert len(model['obstacles'])==17 and len(model['sourceCatalog']['decoys'])==8 and len(model['branches']['ranges'])==93
metricAudit=[]
for m in model['metricReceipts']:
 assert len(m['fullBinValues'])==m['count']*4 and m['count']==m['max']-m['min']+1
 values=list(m['fullBinValues'])
 for i in m['negativeZeroIndices']:assert values[i]==0;values[i]=-0.
 endianness=m['fullBinEncoding']['endianness'];prefix='<'if endianness=='little'else'>';digest=sha(struct.pack(prefix+str(len(values))+'d',*values));assert digest==m['digestSHA256']
 metricAudit.append({'font':m['font'],'ch':m['ch'],'bins':[m['min'],m['max']],'count':m['count'],'rawFloat64DigestRebuilt':digest})
assert sum(a['count']for a in metricAudit)==23062
payload={'plan':plan,'cut':cut,'catalog':model['sourceCatalog'],'states':clock['states'],'fontAudit':v['fontAudit'],'metrics':[{k:m[k]for k in ['font','ch','min','max','selected']}for m in model['metricReceipts']],'nativeCalls':v['actual']}
proc=subprocess.run([pins['localNode']['path'],str(D/'source28.cjs')],input=json.dumps(payload,separators=(',',':'),ensure_ascii=False).encode(),stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=False)
assert proc.returncode==0,{'nodeExit':proc.returncode,'stderr':proc.stderr.decode()};source=json.loads(proc.stdout);assert source['noBrowser']and source['noPaintOrRendererExecuted']
from obstacle28 import construct,relations,bounds
rows,modes=construct(model,clock,source);relation=relations(clock,rows,model['obstacles'])
assert len(rows)==250 and len(relation)==279
lookup={(r['cellIndex'],r['pass']):r for r in relation}
ledger=prior['ledger'];supportRefs=[]
for i,(e,m)in enumerate(zip(ledger,clock['all1324SupportMappings'])):
 assert m['supportIndex']==i and m['owner']==e['owner']and m['pass']==e['pass']and m['sourceRange']==e['sourceRange']
 r=lookup[(m['cellIndex'],e['pass'])];assert r['sourceRange']==e['sourceRange']and r['allReachableNs']==m['reachableStateNs']
 supportRefs.append({'supportIndex':i,'owner':e['owner'],'pass':e['pass'],'sourceRange':e['sourceRange'],'cellIndex':m['cellIndex'],'continuousPrimaryPolygonUnchanged':True,'obstacleRelationKey':[m['cellIndex'],e['pass']]})
def overlap(a,b):return a['x0']<=b['x1']and a['x1']>=b['x0']and a['y0']<=b['y1']and a['y1']>=b['y0']
oldBounds=[bounds(o['polygon'])for o in model['obstacles']];attempts=[]
# Unchanged immutable primary constraints copied EXACTLY from accepted26, with
# exact ledger/offset binding. Only handle+decoy decisions are replaced here.
for old in prior['attempts']:
 counts=dict(old['counts']);worst=dict(old['worst']);counts['handle']=counts['decoys']=0;worst.pop('handle',None);worst.pop('decoys',None);firstObstacleWitness={};oldObstacleCounts={'handle':0,'decoys':0}
 for i,(e,m)in enumerate(zip(ledger,supportRefs)):
  dx,dy=old['leftDelta']if e['q']<2 else old['rightDelta']
  # Use actual translated polygon arithmetic; translating stored bounds is
  # equivalent for ordered finite addition but avoid a separate assumption.
  b=bounds([[p[0]+dx,p[1]+dy]for p in e['polygon']]);r=lookup[tuple(m['obstacleRelationKey'])]
  for category,obstacles in [('handle',r['obstacles'][:1]),('decoys',r['obstacles'][1:])]:
   colliding=next((o for o in obstacles if o['allSameNBounds']is not None and overlap(b,o['allSameNBounds'])),None)
   oldBad=overlap(b,oldBounds[0])if category=='handle'else any(overlap(b,q)for q in oldBounds[1:]);oldObstacleCounts[category]+=int(oldBad)
   if colliding:
    assert oldBad
    counts[category]+=1
    if category not in worst:
     worst[category]={'owner':e['owner'],'pass':e['pass'],'range':e['sourceRange']};firstObstacleWitness[category]={'supportIndex':i,'obstacleOwner':colliding['owner'],'cellIndex':m['cellIndex'],'allProvenReachableNs':r['allReachableNs'],'obstacleActiveNs':colliding['activeStateNs'],'unionBounds':colliding['allSameNBounds'],'translatedPrimaryBounds':b,'conservativeOverlapNotPixelCollision':True}
 assert oldObstacleCounts=={k:old['counts'][k]for k in ['handle','decoys']}
 assert all(counts[k]==old['counts'][k]for k in counts if k not in ['handle','decoys'])
 assert all(worst.get(k)==old['worst'].get(k)for k in counts if k not in ['handle','decoys'])
 assert all(counts[k]<=old['counts'][k]for k in ['handle','decoys'])
 attempts.append({**old,'counts':counts,'worst':worst,'prior26Counts':old['counts'],'prior26Worst':old['worst'],'primaryConstraintsExact26':True,'firstObstacleWitness':firstObstacleWitness,'candidateOnly':all(n==0 for k,n in counts.items()if k!='sourceBandPolicyOnly'),'certificate':False})
assert len(attempts)==486
# Geometry audit against existing actual native calls separately from co-time.
# Those126 own-clock synthetic programs are not remapped to Renderer n states.
assert source['directChecks']and all(a['syntheticClockNotAssertedCoTime']for a in source['directChecks'])
# Synthetic own-clock geometry check only: these rows deliberately do not enter
# relation() and never supply n states or absence rules for candidate decisions.
auditClock={'states':[{'n':r['n'],'passes':[None,None,{'lt':r['mainClock'],'selectorActive':True,'contentScale':v['actual'][r['n']]['cs']}]}for r in source['directGeometryRows']]}
auditRows,auditModes=construct(model,auditClock,{'rows':source['directGeometryRows']});directGeometryAudit=[];auditedVertices=0
from camera26 import contained
for row in auditRows:
 a=v['actual'][row['n']];assert a['pass']=='main'and a['ownSelectorActive']
 byOwner={e['owner']:e for e in row['entries']};vertices=0
 for wrapped in a['events']:
  event=wrapped['event']
  if event['owner']not in byOwner:continue
  support=byOwner[event['owner']];assert support['activeForConservativeObligation']
  assert all(contained(p,support['proposedPolygon'])for p in wrapped['physical']),('PROPOSED_OBSTACLE_NATIVE_CONTAINMENT',row['n'],event['owner'])
  vertices+=len(wrapped['physical'])
 auditedVertices+=vertices;directGeometryAudit.append({'program':row['n'],'ownClock':a['lt'],'scale':a['scale'],'actualVerticesInsideProposedHull':vertices,'noSyntheticCoTimeClaim':True})
assert auditedVertices==prior['actualAudits']['unchangedObstacleVertices']

check()
ledgerDigest=sha(json.dumps(ledger,separators=(',',':'),ensure_ascii=False).encode())
result={'kind':'magnets-same-Renderer-Number-main-obstacle28','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'finite-family-diagnostic-only','certificate':False,'adapterRegistered':False,'sourceGeometryChanged':False,'primarySource26Ref':inputs['raw26'],'continuousPrimaryLedgerSHA256':ledgerDigest,'continuousPrimarySupportsUnchanged':1324,'continuousPrimaryModeCountsUnchanged':prior['selectedModeCounts'],'source21Ref':inputs['raw21'],'clock27Ref':inputs['raw27'],'failed25InputsPreserved':{k:inputs[k]for k in ['source25Seal','diagnosis25','failure25']},'source27CompleteNumberDomain':clock['proofDomain'],'sourceScope':'Fixed Renderer Number fixture only; all continuous primary circle/stage/board constraints26 remain exact','all17ObstacleOwnerIDs':[o['owner']for o in model['obstacles']],'mainStateObstacles':rows,'obstacleModeCounts':modes,'all279CellPassObstacleRelations':relation,'all1324SupportRelationRefs':supportRefs,'metricBinAudit':metricAudit,'localPureSourceAudit':{'stdoutSHA256':sha(proc.stdout),'baselineAt1_5':source['baseline'],'nativeDirectCalls':source['directChecks'],'nativeObstacleGeometryAudits':directGeometryAudit,'nativeObstacleVertices':auditedVertices,'fontCSSSelectedRequestsVerified':source['fontCSSChecks'],'all126NativeMetadataInputRef':inputs['raw21'],'synthetic126ClocksNotClaimedCoTime':True,'nodePath':pins['localNode']['path'],'nodeSHA256':pins['localNode']['sha256'],'noBrowser':True,'noPaintOrRendererExecuted':True,'stderr':proc.stderr.decode()},'family':prior['family'],'groups':prior['groups'],'unchangedPolicyRef':prior['unchangedPolicyRef'],'boardModel':prior['boardModel'],'attempts':attempts,'nativeZero':attempts[0],'candidateCount':sum(a['candidateOnly']for a in attempts),'limits':{'finiteFamilyNotImpossibility':True,'noRasterOrReplayProof':True,'noAlphaThreshold':True,'anyPositiveAlphaConservativelyRetained':True,'mainSelectorAndExactENonpositiveOnlyAbsence':True,'emptyRelationsOnlyRendererNumberCoTimeObstacleDomain':True,'continuousPrimaryCircleStageBoardUnchanged':True,'selectedObstacleHullsSubsetOldOrExactFallback':True,'noNewFontMeasurementOrMetricScaling':True,'unionAABBMayFalseReject':True,'fontScopeOnlyPinnedLoadedFixtureFaces':True,'formalPerformanceNotTested':True},'inputReferences':seal['inputs'],'pins':pins,'seal':seal,'publicChecks':0}
encoded=gzip.compress(json.dumps(result,separators=(',',':'),ensure_ascii=False).encode(),compresslevel=9,mtime=0)
with target.open('xb')as f:f.write(encoded)
print(json.dumps({'target':str(target),'bytes':len(encoded),'sha256':sha(encoded),'mainStates':len(rows),'relations':len(relation),'supports':1324,'obstacleModeCounts':modes,'attempts':486,'candidateCount':result['candidateCount'],'certificate':False}))
