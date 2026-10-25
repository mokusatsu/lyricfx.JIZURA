"""Focused ordinary-test review, reusing the accepted unchanged default subset.
No network or images. This does not repeat the old per-paint verification.
"""
import collections,gzip,hashlib,json,pathlib,runpy,time
ROOT=pathlib.Path('/workspace/lyricfx.JIZURA');E=ROOT/'tasks/evidence/AVOID-009/resume-20261025'
PROGRESS={}
def product_pin(p):
 return p.startswith(('src/','app/')) or p in ['build.py','assets/effect-preview.png','vendor/mp4-muxer.min.js','dev/browser.cjs','dev/package.json','dev/package-lock.json','dev/avoidance/layouts-b-fixture.js','dev/avoidance/layouts-c-editorial-fonts/manifest.json','dev/avoidance/layouts-d-bulbs69-oracle.js','dev/avoidance/layouts-d-bulbs69-oracle-primitives.js','tasks/evidence/AVOID-009/resume-20261025/parent-read-raw69.py','tasks/evidence/AVOID-009/bulbs-diagnostic56/parent-review-bulbs56.py'] or p.endswith(('.ttf','.otf','.woff','.woff2')) or p.startswith('tasks/evidence/AVOID-009/bulbs-focused59/source59/runner/')
def review(folder,out):
 P=runpy.run_path(str(E/'parent-local-review69.py'));exact=P['exact'];evaluate=P['evaluate'];selection=P['selection_check'];repeat=P['repeated_proof'];restore=P['restore'];undefined=P['undefined']
 m=json.loads((folder/'manifest.json').read_bytes());assert m['mode']=='focused-ordinary-boundaries';reuse=m['referenceReuse'];old=json.loads((E/'parent-actual03-result.json').read_bytes());seal=json.loads((E/'parent-reviewed-seal69-actual03.json').read_bytes());current=json.loads((folder.parent/'reviewed-seal.json').read_bytes())
 assert old['defaultSubsetAcceptance']['accepted'] and not old['defaultSubsetAcceptance']['producerWholeRunPassed'] and old['parentReview']['stats']['destinationPasses']==727 and old['parentReview']['stats']['independentPaintSupports']==173040
 assert reuse['oldWholeProducerPassed'] is False and reuse['oldTablesDirectlyCompared'] is False and reuse['allPaintsResaved'] is False
 files={r['path']:r for r in current['files']};prior={r['path']:r for r in seal['files']};expected={p:r for p,r in prior.items() if product_pin(p)};assert len(expected)>=120
 assert {p for p in files if p.startswith(('src/','app/'))}=={p for p in prior if p.startswith(('src/','app/'))}
 for p,r in expected.items():assert files[p]==r
 assert {r['path']:r for r in reuse['matchedProductPins']}==expected
 for name in ['runtime','resolvedNodeDependency']:assert exact(current[name])==exact(seal[name])
 assert current['root']['indexInode']==seal['root']['indexInode']
 assert exact(reuse['matchedRuntime'])==exact(seal['runtime']) and exact(reuse['resolvedNodeDependency'])==exact(seal['resolvedNodeDependency'])
 for name in ['PYC','oldHTML']:assert exact(current['root'][name])==exact(seal['root'][name])
 for name in ['parent-actual03-result.json','parent-reviewed-seal69-actual03.json']:
  p='tasks/evidence/AVOID-009/resume-20261025/'+name;b=(E/name).read_bytes();assert files[p]['sha256']==hashlib.sha256(b).hexdigest()
 phases=collections.Counter();tables={};case=None;epochs=None;seq={};sums=collections.Counter();total=0;baseline=None;baseline_atlas=None;baseline_certificate=None;default_hash=None;attempts=[];unsupported=False;cache=[];hits=[];upper_hits=0;isolations=0;frames=collections.defaultdict(list);redecode=0;final_stats=None;started=time.monotonic();last=started
 old_tables={t['recipe']:t for t in old['parentReview']['recipeSummaries']}
 for row in m['records']:
  z=(folder/row['file']).read_bytes();assert len(z)==row['bytes'] and hashlib.sha256(z).hexdigest()==row['sha256'];raw=gzip.decompress(z);assert len(raw)==row['JSONBytes'];total+=len(raw);assert total<=268435456;r=json.loads(raw)
  if case!=r['case']:
   case=r['case'];tables={k:[] for k in ['matrix','paint','catalog']};sums=collections.Counter()
   if epochs is not None:assert r['tableEpoch']==epochs+1
   epochs=r['tableEpoch']
  assert r['tableEpoch']==epochs and r['sequence']==row['sequence']==seq.get(case,-1)+1;seq[case]=r['sequence']
  for k,values in r['tableDeltas'].items():
   for v in values:assert v['id']==len(tables[k]);tables[k].append(v['value']);sums[k]+=len(json.dumps(v['value'],ensure_ascii=False,separators=(',',':')).encode())
   assert len(tables[k])==r['tableStats'][k]['entries']<=100000 and sums[k]==r['tableStats'][k]['canonicalKeyBytes']<=67108864
  v=restore(r['binding'],tables);phase=v['phase'];assert phase==row['phase'];phases[phase]+=1;PROGRESS.update(records=sum(phases.values()),phase=phase,phases=dict(phases),negativeAttempts=attempts[:],cacheCircles=len(cache),cacheHits=len(hits),producerErrors=m['errors'])
  if phase.startswith('boundary-cache-') or phase in ['boundary-negative-attempt','boundary-unsupported-attempt']:PROGRESS['lastAttempt']={k:v[k] for k in ['phase','label','kind','before','after','upperBefore','upperAfter','expected','error','safe'] if k in v}
  if phase=='init':
   P['clock'](v['clocks']);active={int(s['n']):[p['pass'] for p in s['passes'] if p['active']] for s in v['clocks']['states']};plan=v['plan'];cut=plan['cuts'][0];assert (plan['W'],plan['H'],plan['duration'],plan['fps'],cut['text'],cut['seed'])==(960,540,4.150001,60,'風の先へ',1205)
  if phase=='focused-baseline-proof':
   rows=[x for x in v['proof'] if x['phase']=='recipe-complete'];assert len(rows)==4;baseline={x['table']['recipe']:x['table'] for x in rows};assert set(baseline)==set(old_tables)
   for rid,t in baseline.items():
    for k in ['recipe','complete','qualityPassed','counts']:assert exact(t[k])==exact(old_tables[rid][k])
   baseline_atlas=repeat(v['proof'],baseline);baseline_certificate=v['trajectory']['certificate'];assert v['trajectory']['safety']=='certified-bounded-adapter' and exact(baseline_certificate['winner'])==exact(old['parentReview']['winner'])
  if phase=='boundary-negative-attempt':
   negative_expected={'stale-plan':'STALE_PLACEMENT_PLAN','font-revision':'STALE_PLACEMENT_PLAN','helper-reference':'BULBS69_SOURCE_DEPENDENCY','frame-options':'BULBS69_FRAME_OPTIONS','frame-context':'TILES48_TEXT_STATE:letterSpacing'};assert v['kind'] in negative_expected and v['expected']==negative_expected[v['kind']];code=v['error'].get('code');code=v['error'].get('message') if code is None or code is undefined else code
   assert code==negative_expected[v['kind']] and v['before']==v['after'] and not v['observations'] and v['atomic'] and v['reasonMatches'];attempts.append(v['kind'])
  if phase=='boundary-unsupported-attempt':
   tr=v.get('trajectory');assert tr is None or tr is undefined or tr.get('safety')!='certified-bounded-adapter' and all(s.get('status')!='safe' for u in tr.get('units',[]) for s in u.get('segments',[]));assert v['safe'] is False and (v.get('error') is None or v.get('error') is undefined);unsupported=True
  if phase=='boundary-cache-circle':
   a=repeat(v['proof'],baseline);reg=v['input']['lyricAvoidanceIndex']['regions'][0];c={'cx':reg['center']['x']*960,'cy':reg['center']['y']*540,'r':reg['radius']*540,'margin':2.7};assert exact(a['region']['circle'])==exact(c) and v['allSourceUnionValuesEqual'] and v['fullPaintsResaved'] is False;assert v['after']['proofRuns']==v['before']['proofRuns']+1 and v['after']['cacheEntries']==2;cache.append(v)
  if phase=='boundary-frame':
   n=int(v['n']);assert v['hash']==v['oracle']['oracleSHA256'] and not v['oracle'].get('wrapperErrors') and v['expectedPasses']==active[n]==[o['pass'] for o in v['observations']] and all(o['realTime']==v['time'] for o in v['observations']);assert v['stats']['cacheEntries']<=2;frames[v['label']].append(n)
   if v['label']=='focused-default-reference':assert default_hash is None and n==90;default_hash=v['hash']
   if v['label']=='evicted-default-redecode':assert n==90 and v['hash']==default_hash and v['recomputedProof'];repeat(v['recomputedProof'],baseline);redecode+=1;assert v['stats']['proofRuns']==cache[-1]['after']['proofRuns']+1
  if phase=='boundary-cache-upper-attempt':
   assert exact(v['before'])==exact(v['after']) and v['upperAfter']['hits']==v['upperBefore']['hits']+1 and exact(v['certificate'])==exact(baseline_certificate) and (v.get('error') is None or v.get('error') is undefined);upper_hits+=1
  if phase=='boundary-cache-isolation':assert exact(v['before'])==exact(v['after']) and v['upperAfter']['entries']==0;isolations+=1
  if phase=='boundary-cache-hit':
   assert v['after']['proofRuns']==v['before']['proofRuns'] and v['after']['proofHits']==v['before']['proofHits']+1 and v['after']['cacheEntries']<=2 and exact(v['certificate'])==exact(baseline_certificate) and (v.get('error') is None or v.get('error') is undefined);hits.append(v);final_stats=v['after']
  if time.monotonic()-last>25:print(json.dumps({'focusedRecords':sum(phases.values()),'phase':phase}),flush=True);last=time.monotonic()
 if not m['complete']:
  result={'state':'PASS_FOCUSED_STORED_PREFIX_ONLY_PRODUCER_FAILED','producerComplete':False,'producerErrors':m['errors'],'records':sum(phases.values()),'phases':dict(phases),'storedJSONBytes':total,'negativeAttempts':attempts,'unsupportedExplicitSizeNotSafe':unsupported,'cacheCircles':len(cache),'cacheHits':len(hits),'upperCacheHits':upper_hits,'cacheIsolations':isolations,'redecode':redecode,'wholeFocusedRunPassed':False,'publicChecks':0,'parentImages':0};out.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result));return
 assert not m['errors'] and total==m['serializedBytes'];assert len(attempts)==5 and len(set(attempts))==5 and unsupported and len(cache)==2 and len(hits)==2 and upper_hits==isolations==2 and redecode==1 and baseline_atlas
 for c in cache:
  tr=c['trajectory'];cert=tr.get('certificate')
  if isinstance(cert,dict):assert frames[c['label']]==[0,36,90,231,249]
 assert final_stats['proofRuns']==4 and final_stats['proofHits']==2 and final_stats['cacheEntries']==2
 result={'state':'PASS_FOCUSED_ORDINARY_BOUNDARIES','producerComplete':True,'records':sum(phases.values()),'phases':dict(phases),'storedJSONBytes':total,'sourcePinsMatched':len(expected),'reusedAcceptedDefaultArchive':old['execution']['archive']['commit'],'oldWholeProducerPassed':False,'oldTablesDirectlyCompared':False,'allOldPaintsResaved':False,'freshDefaultTablesMatchOldDeclaredCountsAndQuality':True,'currentCircleAndRedecodeTablesAllValuesEqual':True,'negativeAttempts':attempts,'unsupportedSilentSafe':False,'cacheCircles':len(cache),'cacheHits':len(hits),'upperCacheHits':upper_hits,'cacheIsolations':isolations,'redecode':redecode,'frames':dict(frames),'finalStats':final_stats,'scope':'same continuous environment and unchanged inputs only; default full-paint geometry/250+500 order evidence reused from actual03','canonicalJAEN':False,'basic6':False,'formalPerformanceAccepted':False,'saveBodyAccepted':False,'whole009Complete':False,'humanApproval':False,'publicChecks':0,'postSaveReachabilityChecks':0,'parentImages':0};out.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
