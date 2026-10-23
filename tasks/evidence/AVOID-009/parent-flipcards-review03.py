import gzip,json,pathlib,math,hashlib,collections
root=pathlib.Path('/tmp/avoid009-flipcards-canonical01');outroot=pathlib.Path('/workspace/lyricfx.JIZURA/tasks/evidence/AVOID-009');counters=collections.Counter()
def load(n):return json.loads(gzip.decompress(pathlib.Path('/tmp/avoid009-flipcards-final-'+n+'.json.gz').read_bytes()))
def inside(p,poly):
 v=[(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]) for a,b in zip(poly,poly[1:]+poly[:1])];return not(any(x>1e-4 for x in v) and any(x< -1e-4 for x in v))
def distance(c,p):
 if inside(c,p):return 0
 ds=[]
 for a,b in zip(p,p[1:]+p[:1]):
  dx=b[0]-a[0];dy=b[1]-a[1];q=dx*dx+dy*dy;t=max(0,min(1,((c[0]-a[0])*dx+(c[1]-a[1])*dy)/q)) if q else 0;ds.append(math.hypot(c[0]-a[0]-t*dx,c[1]-a[1]-t*dy))
 return min(ds)
def safety(p,spec,circle):
 assert all(math.isfinite(z) for v in p for z in v)
 assert all(-1e-4<=x<=spec['W']+1e-4 and -1e-4<=y<=spec['H']+1e-4 for x,y in p)
 assert distance([circle['cx'],circle['cy']],p)+1e-4>=circle['r']+max(2,.005*min(spec['W'],spec['H']))
def checkrow(row):
 spec=row['spec'];tr=row['tr'];assert row['sourceUnchanged'] and row['idempotent'] and row['fromOtherEqual'] and row['legacyEqual'] and row['internalClean'] and not row['errors']
 native=tr['sourceProof']['coverage'];k=native['nativeCardSize'];cw=k;chh=1.38*k
 for unit in tr['units']:
  for seg in unit['segments']:
   counters[seg['status']]+=1
   if seg['status']!='safe':continue
   assert seg['decision']=='certified';offset=seg['from'];assert offset==seg['to']
   chosen=next(x for x in reversed(seg['attempts']) if x.get('status')=='safe');q=chosen['quality'];assert q['physicalFontAttachment'] and not q['nativeAttachmentFailures']
   assert q['minPrimaryPx']+1e-7>=min(native['minPrimaryPx'],max(18,.035*min(spec['W'],spec['H'])))
   if native['minRankPx'] is not None:assert q['minRankPx']+1e-7>=min(native['minRankPx'],12)
   assert ''.join(u['source']['text'] for u in seg['unitProofs'])==''.join(spec['text'].split())
   for u in seg['unitProofs']:
    for p in u['envelopes']:safety([[v[0]+offset[0],v[1]+offset[1]] for v in p],spec,seg['circle']);counters['certifiedPolygons']+=1
    for p in u['source']['fontOutlines']:
     for x,y in p:
      assert abs(x)<=cw/2+1e-6
      for sn in [0,1]:assert abs(y)*(1+.1*sn)<=chh/2*(1+.2*sn*min(0,x/cw))+1e-6
     counters['attachedFontPolygons']+=1
 for obs in row['observations']:
  assert obs['measurementSupported'] and obs['envelopeCovered']
  seg=next((s for s in tr['units'][0]['segments'] if s['start']<=obs['realTime']<s['end']),None)
  if not seg or seg['status']!='safe':continue
  assert obs['stageContained'] and obs['strictCircleClear'];envs=[p for u in seg['unitProofs'] for p in u['envelopes']]
  for p in obs['polygons']:
   safety(p,spec,seg['circle']);orig=[[x-obs['offset'][0],y-obs['offset'][1]] for x,y in p];assert any(all(inside(v,q) for v in orig) for q in envs);counters['actualPolygons']+=1
f=load('focus04');m=load('matrix03');e=load('extended02');v=load('parity02')
for report in [f,m,e,v]:
 for pin in report['pins']:assert hashlib.sha256((root/pin['path']).read_bytes()).hexdigest()==pin['sha256']
for row in m['rows']+e['rows']:checkrow(row)
assert len(m['rows'])==288 and len(e['rows'])==96
assert len(f['observations'])==240 and len(f['records'])==216 and len(f['peekRecords'])==108 and not f['errors']
for rec in f['records']+f['peekRecords']:assert rec['measurementSupported'] and rec['renderError'] is None and not rec['diagnostics'];counters['directProjectionRecords']+=1
assert f['strictAffine']=='SINGULAR_AFFINE' and f['capability']=={'version':1,'kind':'finite-forward-text'}
assert all(x['preserved'] for x in e['controls']) and len(e['controls'])==8
assert all(x['allFullSize'] for x in e['explicit']) and len(e['explicit'])==4
for p in e['pixels']:
 assert p['alphaThreshold']==1 and all(p[k]==0 for k in ['conflictPixels','marginConflictPixels','strictConflictPixels','strictMarginConflictPixels','relaxedConflictPixels','relaxedMarginConflictPixels'])
for a,b in zip(v['rows'],v['before']['rows']):
 assert a['pixels']==b['pixels'] and a['counts']==b['counts']
 for rec in a['nativeD']:assert rec['measurementSupported'] and rec['offSHA']==rec['onSHA'];counters['parityDFrames']+=1
 counters['offParityFrames']+=len(a['pixels'])
assert len(v['warnings'])==8 and all('willReadFrequently' in x for x in v['warnings'])
result={'baseline':'1b0d901','parentSourceReview':'Accepted narrow forward-only flipCards text recording, original general affine/inverse and device/font guards; native attachment failure retained, excluded from safe selection; final candidate strict attachment/readability/explicit size retained. Rendering semantics and media review remain separate.','rawIndependentReview':dict(counters),'matrixCases':len(m['rows']),'extendedCases':len(e['rows']),'controls':8,'explicitSizeCases':4,'parityWarnings':'8 ordinary Canvas2D willReadFrequently hints retained; no runtime errors','publicResultChecks':0,'mediaViewsByParent':0,'implementationModel':'gpt-6.1-sol/medium','scope':'Bounded cut/cut/still native flipCards1..14 source; not fullD34 or all fonts/effects, human motion review pending.'}
(outroot/'parent-flipcards-final03-review.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result))

# Independently normalize direct boundary records back to stage units.
seg=f['tr']['units'][0]['segments'][0];owners={u['owner']:u['envelopes'] for u in seg['unitProofs']};direct=0;near_singular=0
for rec in f['records']+f['peekRecords']:
 for event in rec['events']:
  if event['role']!='primary':continue
  assert event['owner'] in owners
  for polygon in event['polygons']:
   local=[[x/rec['scale'],y/rec['scale']] for x,y in polygon]
   assert any(all(inside(vertex,envelope) for vertex in local) for envelope in owners[event['owner']])
   safety([[x+seg['from'][0],y+seg['from'][1]] for x,y in local],f['spec'],seg['circle']);direct+=1
  if event['kind']=='item':
   matrix=event['matrix'];near_singular+=abs(matrix[0]*matrix[3]-matrix[1]*matrix[2])<1e-12
result['parentDirectProjectionGeometry']={'primaryPolygonsIndependentlyChecked':direct,'nearSingularItemEventsRetained':near_singular,'circleStageAndOwnedEnvelope':True}
freeze=json.loads((root/'tasks/evidence/AVOID-009/flipcards-final-freeze03.json').read_text())
for pin in freeze['pins']:
 path=pathlib.Path(pin['path']);path=path if path.is_absolute() else root/path
 assert path.stat().st_size==pin['bytes'] and hashlib.sha256(path.read_bytes()).hexdigest()==pin['sha256']
for pin in freeze['raw']:
 path=pathlib.Path(pin['path']);assert path.stat().st_size==pin['bytes'] and hashlib.sha256(path.read_bytes()).hexdigest()==pin['sha256']
result['freezeVerification']={'pins':len(freeze['pins']),'rawReports':len(freeze['raw']),'nonFlip11pBytesUnchanged':True,'memoAndCylinderBridgePreserved':True}
(outroot/'parent-flipcards-final03-review.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('PARENT_DIRECT_AND_FREEZE_PASS',direct,near_singular)
