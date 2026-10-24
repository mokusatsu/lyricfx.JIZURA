import gzip,json,hashlib
from pathlib import Path
r=json.load(gzip.open('/tmp/avoid009-tiles-native34/native34.raw.json.gz','rt'));counts={'fixture':0,'nativePairs':0,'wholeFramePairs':0,'tileRecords':0,'sourceCalls':0,'transportExact':0,'transportFailed':0};failures=[]
for rs in r['results']:
 counts['fixture']+=1;a,b=[p['value'] for p in rs['pair']];assert a['spec']==b['spec'] and a['sourcePlan']==b['sourcePlan'] and a['params']==b['params'];assert a['otherDSourceFunctions']==b['otherDSourceFunctions'];assert a['wholeFrames']==b['wholeFrames'];counts['wholeFramePairs']+=len(a['wholeFrames'])
 for x,y in zip(a['calls'],b['calls']):
  assert (x['lt'],x['pass'])==(y['lt'],y['pass']);assert x['on'] is None
  for flag in ['off','on']:
   for k in ['pixelSHA256','bb','root','paintCore']:assert x['off'][k]==y[flag][k],(rs['spec']['id'],x['lt'],flag,k)
   counts['nativePairs']+=1
  c=y['on']['catalog'];assert c['complete'] and c['bounded'] and c['nativeOnly'] and not c['unsupported'];assert not c['independentDecorOwners'] and not c['tiledAuxOwners'];assert len(c['tiles'])==c['n'];assert [t['i'] for t in c['tiles']]==list(range(c['n']))
  for t in c['tiles']:
   assert c['rowsT'][t['sourceRow']][t['j']]==t['ch'];assert t['cnt']==len(c['rowsT'][t['sourceRow']]);assert t['exitSourceJ']==t['j'];assert t['exitDenominator']==t['cnt'];assert t['emitted']==(t['f']>0);assert t['f']==max(0,min(1,t['rawF']));counts['tileRecords']+=1
  for ordinal,call in enumerate(c['sourceCalls']):assert call['role']=='primary' and call['ordinal']==ordinal and call['owner'] in c['primaryOwners'];counts['sourceCalls']+=1
 for t in b['transport']:
  assert t['pixelsEqual']==(t['pixelSHA256']==t['expectedNativeSHA256']);counts['transportExact' if t['pixelsEqual'] else 'transportFailed']+=1
  if not t['pixelsEqual']:
   assert not t['error'] and not t['diagnostics'];live=next(c['on']['root'] for c in b['calls'] if c['lt']==t['lt'] and c['pass']==t['pass']);roots={tuple(e['nativeTransform']['root']) for e in t['events']};failures.append({'fixture':rs['spec']['id'],'lt':t['lt'],'pass':t['pass'],'liveRoot':live,'recordedRoots':list(roots),'maxRootImportDifference':max(abs(v-w) for rr in roots for v,w in zip(live,rr))})
assert len(failures)==3 and len(r['errors'])==3 and r['certificate'] is False and r['adapterRegistered'] is False
out={'status':'NATIVE_CATALOG_PARITY_ACCEPTED_TRANSPORT_FAILED_PRESERVED','rawSHA256':hashlib.sha256(Path('/tmp/avoid009-tiles-native34/native34.raw.json.gz').read_bytes()).hexdigest(),'counts':counts,'failures':failures,'parentReviewAttempt1':'TypeError due baseline on=None; no product/test changes; corrected parent comparison uses independent baseline off for both instrumented off/on, as runner specifies.','publicChecks':0,'parentImagesViewed':0,'adapterAccepted':False}
p=Path('/tmp/avoid009-evening-parent/parent-tiles34-review.json');p.write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out,indent=2))
