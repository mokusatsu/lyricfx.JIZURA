"""Exhaustive Number-time preimages; source-only, parent execution required."""
from pathlib import Path
import json,gzip,hashlib,math,struct,os,sys,subprocess,datetime
sys.dont_write_bytecode=True
assert os.environ.get('MAGNETS_CLOCK27_RELEASE')=='PARENT_REVIEWED_SOURCE_MATH_RUNNER'
D=Path('/tmp/avoid009-evening-magnets27');R=Path('/workspace/lyricfx.JIZURA');sha=lambda b:hashlib.sha256(b).hexdigest();pins=json.loads((D/'evidence/pins27.json').read_text());seal=json.loads((D/'evidence/seal27.json').read_text());target=D/'evidence/clock27.raw.json.gz';assert not target.exists()
def check():
 assert len(pins['files'])==119 and len(pins['pycache'])==7 and len(pins['absent52'])==52
 for p in pins['files']+pins['pycache']:assert sha((R/p['path']).read_bytes())==p['sha256'],p['path']
 assert all(not(R/p).exists()for p in pins['absent52'])
 for p in seal['files']:assert sha((D/p['path']).read_bytes())==p['sha256'],p['path']
 assert sha(Path(pins['localNode']['path']).read_bytes())==pins['localNode']['sha256']
check();inputs={}
for p in seal['inputs']:
 b=Path(p['path']).read_bytes();assert sha(b)==p['sha256'];inputs[p['kind']]=json.loads(gzip.decompress(b))
proof=inputs['raw21'];assert not proof['errors']and len(proof['results'])==1;v=proof['results'][0];model=v['result'];plan=v['sourcePlan'];cut=plan['cuts'][0];domain=model['domain'];prior26=inputs['raw26']
assert len(model['ledger'])==len(prior26['ledger'])==1324 and len(model['branches']['ranges'])==93 and len(model['obstacles'])==17
assert prior26['selectedModeCounts']=={'accepted21-fallback':965,'correlated-endpoint-refinement':359}
assert prior26['candidateCount']==0 and prior26['certificate']is False and not prior26['adapterRegistered'];assert not v['containmentFailures']and not v['cameraFailures']
assert len(plan['cuts'])==1 and cut['layout']=='magnets'and cut['seed']==1205 and cut['text']=='風の先へ'and plan['W']==960 and plan['H']==540 and plan['fps']==60
assert plan['fx']['koma']==0 and plan['fx']['onTwos']is True and plan['fx']['motion']==.65 and cut['contentScale']==cut['motionScale']==1
assert not plan['customEffects']and not plan['keyBg']and not plan['retainedCutIndices']
assert not plan['events']and not plan['beats']and not plan.get('media')and not plan.get('foreground')and not plan.get('energy')and not plan.get('ghostPreRoll')and not plan.get('placementFinalization')
assert plan['layerVisibility']=={'foreground':True,'lyrics':True,'media':True}
# Explicit assertions separate from optional missing keys.
assert cut.get('blank',False)is False and not cut['insertedAtPlayhead']and not cut['frontmost']and not cut['area']and not cut.get('mask')and not cut.get('trans')and not cut.get('group')and not cut.get('groupExit')and cut.get('groupOutDur')is None
assert cut['effectFx']is None and cut['effectStyle']is None and cut['opacity']==100 and cut['blend']=='normal'
assert cut['start']==cut['renderStart']==0 and cut['end']==cut['displayEnd']==cut['dur']==4 and cut['outDur']==.4
assert not cut['drawing']and not cut['effectsOnly']and not cut['decor']and cut['enter']==cut['exit']=='cut'and cut['hold']=='still'and cut['treat']=='none'and cut['cam']=='push'
opts={'noLyrics':False,'noGhost':False,'lyricLayer':None,'avoidanceRealTimeOverride':False,'noForeground':True,'noMedia':True,'copyLyrics':False,'transparent':False,'personOcclusion':False,'mask':None,'sourceScope':'clock+nativePrimarySourceGeometry only; not whole background/post/media pixels'}
assert plan['fx']['chroma']>.02 and plan['style']['ghost']>.02
h=1/60;assert h==domain['step'];Rend=v['region']['end'];assert Rend==4.150001
bits=lambda x:struct.unpack('>Q',struct.pack('>d',x))[0]
number=lambda b:struct.unpack('>d',struct.pack('>Q',b))[0]
hex64=lambda b:format(b,'016x')
lastBits=bits(math.nextafter(Rend,-math.inf));lastTime=number(lastBits);assert 0<=lastTime<Rend
cache={}
def n_index(t):return math.floor(t/h+1e-6)
def n_bits(b):
 if b not in cache:cache[b]=n_index(number(b))
 return cache[b]
def render_cut(c):
 if c.get('displayEnd')is None:return c
 return {**c,'end':c['displayEnd'],'dur':c['displayEnd']-c['start'],'exit':c.get('groupExit')or c['exit'],'outDur':c['outDur']if c.get('groupOutDur')is None else c['groupOutDur']}
def selected(t):return not cut.get('blank',False)and(cut.get('renderStart',cut['start'])<=t<cut.get('displayEnd',cut['end']))
def snapshot(t):
 n=n_index(t);q=n*h;effective=cut if selected(t)else None;fx=effective.get('effectFx')if effective and effective.get('effectFx')else plan['fx'];passes=[]
 for name,lag in [('B',1.6/24),('A',.8/24),('main',0)]:
  tp=max(0.,q-lag);active=selected(tp);c=render_cut(cut)if active else cut;lt=tp-c['start'];ltb=lt+lag
  cam=1+.03*fx['motion']*max(0,min(1,lt/max(.3,c['dur'])))if active else None
  cs=(1+(cam-1)*c['motionScale'])*c['contentScale']if active else None
  passes.append({'pass':name,'lag':lag,'tp':tp,'lt':lt,'ltb':ltb,'selectorActive':active,'renderCut':{k:c[k]for k in ['index','end','dur','exit','outDur']}if active else None,'cameraScale':cam,'contentScale':cs})
 return {'n':n,'q':q,'h':h,'mainCutAtIndex':cut['index']if selected(q)else None,'effectiveMotion':fx['motion'],'passes':passes}
minN=n_bits(0);maxN=n_bits(lastBits);assert minN==0 and 0<=maxN<1000
thresholds=[]
# Predicate n(t)>=k is monotone: positive constant division, correctly-rounded
# monotone +epsilon, floor. Bisection proves firstTrue on ordered Float64 bits.
for k in range(minN,maxN+2):
 trace=[]
 if k<=minN:first=0
 elif k>maxN:first=lastBits+1
 else:
  a=0;b=lastBits;assert n_bits(a)<k<=n_bits(b)
  while b-a>1:
   mid=(a+b)//2;value=n_bits(mid);trace.append([hex64(mid),value])
   if value>=k:b=mid
   else:a=mid
  first=b;assert n_bits(first)>=k and n_bits(first-1)<k
 thresholds.append({'thresholdN':k,'firstTrueBits':hex64(first)if first<=lastBits else None,'pastRegionSentinel':first>lastBits,'trace':trace,'integerFirst':first})
states=[];preimages=[]
for i,n in enumerate(range(minN,maxN+1)):
 first=thresholds[i]['integerFirst'];end=thresholds[i+1]['integerFirst']-1
 if first>end:
  preimages.append({'n':n,'reachable':False,'reason':'empty monotone integer-state preimage'});continue
 assert n_bits(first)==n_bits(end)==n
 if first>0:assert n_bits(first-1)<n
 if end<lastBits:assert n_bits(end+1)>n
 s=snapshot(number(first));assert s['n']==n and s==snapshot(number(end));states.append(s)
 preimages.append({'n':n,'reachable':True,'firstBits':hex64(first),'lastBits':hex64(end),'firstTime':number(first),'lastTime':number(end),'representableCount':str(end-first+1),'priorNeighborN':n_bits(first-1)if first else None,'nextNeighborN':n_bits(end+1)if end<lastBits else None})
reachable=[p for p in preimages if p['reachable']];assert int(reachable[0]['firstBits'],16)==0 and int(reachable[-1]['lastBits'],16)==lastBits
assert all(int(a['lastBits'],16)+1==int(b['firstBits'],16)for a,b in zip(reachable,reachable[1:]))
assert sum(int(p['representableCount'])for p in reachable)==lastBits+1
for t in thresholds:t.pop('integerFirst')
# Per93oldcell/pass and per1324support mapping keeps oldcontinuous obligations.
cellMappings=[];lookup={}
for cellIndex,cell in enumerate(model['branches']['ranges']):
 for name in ['B','A','main']:
  refs=[]
  for state in states:
   p=next(p for p in state['passes']if p['pass']==name);main=state['passes'][2]
   if p['selectorActive']and cell['lo']<=p['lt']<=cell['hi']:
    refs.append({'n':state['n'],'primaryOwnClock':p['lt'],'primaryLTB':p['ltb'],'sameNMainClock':main['lt'],'sameNMainSelectorActive':main['selectorActive']})
  item={'cellIndex':cellIndex,'pass':name,'sourceRange':[cell['lo'],cell['hi']],'stateRefs':refs,'rendererNumberCoTimeReachable':bool(refs),'continuousPrimaryObligationsKept':True};cellMappings.append(item);lookup[(name,cell['lo'],cell['hi'])]=item
supportMappings=[]
for i,e in enumerate(model['ledger']):
 mapped=lookup[(e['pass'],*e['sourceRange'])];supportMappings.append({'supportIndex':i,'owner':e['owner'],'pass':e['pass'],'sourceRange':e['sourceRange'],'cellIndex':mapped['cellIndex'],'reachableStateNs':[r['n']for r in mapped['stateRefs']],'rendererNumberCoTimeReachable':mapped['rendererNumberCoTimeReachable'],'continuousPrimaryObligationsKept':True})
assert len(cellMappings)==279 and len(supportMappings)==1324
retainedGhostStates=[{'n':s['n'],'q':s['q'],'ghostPasses':[p['pass']for p in s['passes'][:2]if p['selectorActive']]}for s in states if not s['passes'][2]['selectorActive']and any(p['selectorActive']for p in s['passes'][:2])];assert retainedGhostStates
rootChecks=[]
for i,p in enumerate(v['cameraProbes']):
 s=snapshot(p['realTime']);own=next(x for x in s['passes']if x['pass']==p['pass']);assert own['selectorActive']and own['lt']==p['lt']and own['ltb']==p['ltb']and own['cameraScale']==p['cam']['s']and own['contentScale']==p['cs']and s['effectiveMotion']==p['actualFX']['motion']
 rootChecks.append({'probe':i,'realTime':p['realTime'],'n':s['n'],'q':s['q'],'pass':p['pass'],'clockAndCameraMatchRaw21':True})
assert len(rootChecks)==54
zero=snapshot(0.);negativeZero=snapshot(-0.);assert zero==negativeZero and bits(zero['q'])==bits(negativeZero['q'])==0
endpoint=snapshot(Rend);endpoint['regionMembership']='excluded endpoint separately evaluated'
# True JS Number/Math.floor/source-helper parity for EVERY bisection query,
# state endpoints, boundary neighbors,54actualroots,+0/-0 and exactRend.
probeBits=sorted(cache);payload={'plan':plan,'probeBits':[hex64(b)for b in probeBits],'stateFirstBits':[p['firstBits']for p in reachable],'rootRealTimes':[p['realTime']for p in v['cameraProbes']],'regionEnd':Rend}
command=[pins['localNode']['path'],str(D/'parity27.cjs')]
proc=subprocess.run(command,input=json.dumps(payload,separators=(',',':')).encode(),stdout=subprocess.PIPE,stderr=subprocess.PIPE,env=os.environ.copy(),check=False)
assert proc.returncode==0,{'nodeExit':proc.returncode,'stderr':proc.stderr.decode()};js=json.loads(proc.stdout)
assert js['quantizerNs']==[cache[b]for b in probeBits]and js['states']==states
assert js['rootSnapshots']==[snapshot(p['realTime'])for p in v['cameraProbes']]
assert js['zeros']==[zero,negativeZero]
assert js['end']==snapshot(Rend)
check()
for p in seal['inputs']:assert sha(Path(p['path']).read_bytes())==p['sha256']
result={'kind':'magnets-clock27-only-complete-Number-preimage-proof','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'clock-domain-diagnostic-only','certificate':False,'adapterRegistered':False,'sourceGeometryChanged':False,'obstacleGeometryChanged':False,'candidateEvaluationPerformed':False,'proofDomain':{'first':'+0','endExclusive':Rend,'lastNumber':lastTime,'lastNumberBits':hex64(lastBits),'representableCount':str(lastBits+1),'h':h,'koma':0,'onTwosIgnoredBecauseExplicitKoma':True,'negativeZeroEquivalent':True,'exactEndSeparatelyChecked':True,'scope':'native primary source clocks; not whole background-frame pixel constancy'},'boundRenderOptions':opts,'sourceSnippetRef':{'path':'evidence/source-snippets27.json','sha256':sha((D/'evidence/source-snippets27.json').read_bytes())},'preimages':preimages,'thresholdProofs':thresholds,'states':states,'all279CellPassMappings':cellMappings,'all1324SupportMappings':supportMappings,'mainAbsentGhostRetainedStates':retainedGhostStates,'actual54RootClockChecks':rootChecks,'zeroSnapshot':zero,'excludedEndpointSnapshot':endpoint,'nodeParity':{'nodePath':pins['localNode']['path'],'nodeSHA256':pins['localNode']['sha256'],'allQuantizerQueryCount':len(probeBits),'allQueryBitsAndN':[[hex64(b),cache[b]]for b in probeBits],'quantizerNsSHA256':sha(json.dumps(js['quantizerNs'],separators=(',',':')).encode()),'allStatesMatch':True,'all54RootSnapshotsMatch':True,'zeroNegativeZeroMatch':True,'exactEndpointMatch':True,'noBrowser':True,'noRendererOrDrawingExecuted':True,'stderr':proc.stderr.decode()},'limits':{'noObstacleAbsenceOrSizeProofYet':True,'emptyCellsUnreachableOnlyInDeclaredRendererNumberCoTimeDomain':True,'allContinuousPrimaryCircleStageBoardObligationsRemain':True,'noAlphaCutoffOrSourcePaintDrop':True,'noSafeCertificateOrImpossibility':True},'inputReferences':seal['inputs'],'pins':pins,'seal':seal,'publicChecks':0}
with target.open('xb')as f:f.write(gzip.compress(json.dumps(result,separators=(',',':'),ensure_ascii=False).encode(),compresslevel=9,mtime=0))
print(json.dumps({'target':str(target),'bytes':target.stat().st_size,'sha256':sha(target.read_bytes()),'reachableStates':len(states),'cellPassMappings':279,'supportMappings':1324,'nodeParityQueries':len(probeBits),'actualRoots':54,'candidateEvaluationPerformed':False,'certificate':False}))
