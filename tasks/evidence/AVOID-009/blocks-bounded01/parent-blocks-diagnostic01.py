import pathlib,json,gzip,math,hashlib,collections,shutil
repo=pathlib.Path('/workspace/lyricfx.JIZURA');p=repo/'work/avoid009-blocks-bounded01/evidence/diagnostic01.raw.json.gz';raw=json.loads(gzip.decompress(p.read_bytes()))
assert len(raw['results'])==8 and not raw['errors']
counts=collections.Counter();failures=[];outcomes=collections.Counter();fonts=[]
def inside(v,polygon):
 pos=neg=False
 for a,b in zip(polygon,polygon[1:]+polygon[:1]):
  cross=(b[0]-a[0])*(v[1]-a[1])-(b[1]-a[1])*(v[0]-a[0]);pos|=cross>1e-6;neg|=cross< -1e-6
 return not(pos and neg)
for row in raw['results']:
 c,o=row['current'],row['original'];spec=c['spec'];assert not c['errors'];counts['fixtures']+=1
 for a in o['observations']:
  b=next(b for b in c['observations'] if all(b[k]==a[k] for k in ['realTime','pass','renderScale']))
  assert a['pixelHash']==b['pixelHash'] and a['events']==b['events'];counts['nativeBaselinePixelEventPairs']+=1
 assert c['forcedDirect']['rows']==o['forcedDirect']['rows'];counts['forcedNativePairs']+=len(c['forcedDirect']['rows'])
 for f in c['forcedDirect']['rows']:
  assert not f['coverageEligible'] and f['engineReachabilityNotClaimed'];counts['forcedNativeEvents']+=len(f['events'])
  for b in f['blocks']:
   assert b['emitted']==(b['f']>=0)
   if not b['emitted']:assert not b['glyphPainted']
 d=c['diagnostic']
 if not d:
  assert spec['id']=='typed-unsupported-camera' and c['typed']['code']=='BLOCKS_INITIAL_DOMAIN';counts['typedUnsupportedControls']+=1;continue
 assert d['status']=='diagnostic-only' and not d['safetyCertificate'] and not d['adapterRegistered']
 g=d['sourceCatalog'];duration=2*g['clock']['lt'];outDur=.4;outStart=duration-outDur;assert outStart==d['holdWindow'][1];start=g['clock']['t']-g['clock']['lt']
 assert all(x['sourceLifetime']==[start,start+duration] for x in d['passes'])
 for metric in d['metrics']:
  b=g['blocks'][metric['sourceIndex']];assert metric['ch']==b['ch'] and metric['size']==g['k']*b['sz']*.6 and metric['font']==g['params']['font'];counts['exactNativeFontMetrics']+=1
 fonts.append({'case':spec['id'],'sizes':sorted({x['size'] for x in d['metrics']})})
 for report in d['passes']:
  for atom in report['atoms']:
   for a,b in zip(atom['blocks'],g['blocks']):
    t1=.06+(b['order']+1)*g['gap'];f=(atom['lt']-t1)/g['fd'];po=max(0,min(1,(atom['lt']-outStart)/outDur)) if outDur>0 else 0;q=max(0,min(1,po*1.4-(b['order']+1)/(g['n']+3)*.4))
    assert a['sourceBodyActive']==(f>=0) and a['entry']==(0<=f<1)
    assert a['movingExit']==(outDur>0 and 0<q<1) and a['q1Tail']==(q==1)
    assert abs(a['q'][0]-q)<1e-12 and abs(a['q'][1]-q)<1e-12;counts['sourceBoundaryBlockAtoms']+=1
 for trial in d['trials']:
  for a in trial['attempts']:
   assert a['diagnosticOnly'] and a['sourceBoundaryAtomsPending'];outcomes[a['disposition']]+=1
   if spec.get('expectHold') is False or spec.get('shortRegion'):assert not a['holdEnough']
 variants={1:d,**{float(k):v for k,v in c['additionalScaleDiagnostics'].items()}}
 indices={}
 for scale,diag in variants.items():
  groups=collections.defaultdict(list)
  for e in diag['ledger']:
   assert all(math.isfinite(v) for point in e['polygon'] for v in point)
   assert not e['phase'].get('mixedSourceBoundary') or not any(e['phase'][k] for k in ['entry','movingExit','q1Tail'])
   groups[(e['owner'],e['pass'])].append(e);counts['diagnosticLedgerCells']+=1
  indices[scale]=groups
 for obs in c['observations']:
  counts['observations']+=1
  if not obs['coverageEligible']:
   assert not obs['active'];counts['expiredSourceDiagnosticObservations']+=1;continue
  counts['activeGeometryObservations']+=1;scale=obs['renderScale'];diag=variants[scale];groups=indices[scale]
  for e in obs['events']:
   assert e['role']=='primary' and e['owner'].startswith('blocks.')
   candidates=[u for u in groups[(e['owner'],obs['pass'])] if u['sourceRange'][0]<=obs['lt']<=u['sourceRange'][1]]
   # Stronger than per-vertex union: ONE exact-time cell must contain a whole event.
   norm=[[[x/scale,y/scale] for x,y in poly] for poly in e['polygons']]
   covered=any(all(inside(v,u['polygon']) for poly in norm for v in poly) for u in candidates)
   if not covered:failures.append({'case':spec['id'],'owner':e['owner'],'lt':obs['lt'],'pass':obs['pass'],'scale':scale,'exactTimeCells':len(candidates)})
   counts['wholeEventsChecked']+=1;counts['actualVerticesChecked']+=sum(len(poly) for poly in norm)
 counts['sourcePhaseCellsMainDiagnostic']+=len(d['ledger'])
report={'scope':'Native proof diagnostic source/raw ONLY; no adapter/candidate safety or appearance approval','rawSHA256':hashlib.sha256(p.read_bytes()).hexdigest(),'parentSession':25520,'exit':0,'counts':dict(counts),'strongWholeEventExactTimeCellFailures':failures,'candidateDispositionCounts':dict(outcomes),'nativeFontSizeEvidence':fonts,'sourceLifetime':'Expired direct events retained and excluded from coverage success','pending':['Boundary policy certification','Branch-resolved supports for mixed cells','Global multi-region tail no-reentry','Production adapter/dependency/cache','Formal performance'],'safeAdapterCountIncrement':0,'codeIntegrated':False,'parentImages':0,'publicChecks':0}
out=repo/'tasks/evidence/AVOID-009/blocks-bounded01';(out/'parent-diagnostic01-review.json').write_text(json.dumps(report,indent=2)+'\n');shutil.copy2(__file__,out/pathlib.Path(__file__).name);print(json.dumps({k:v for k,v in report.items() if k!='nativeFontSizeEvidence'}));assert not failures
