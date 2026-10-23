import pathlib,json,gzip,hashlib,math,collections
main=pathlib.Path('/workspace/lyricfx.JIZURA');root=pathlib.Path('/tmp/avoid009-flag01');C=collections.Counter()
def load(n):return json.load(gzip.open('/tmp/avoid009-flag-'+n+'.json.gz'))
def inside(p,q):
 a=[(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]) for a,b in zip(q,q[1:]+q[:1])]
 return not(any(v>1e-4 for v in a) and any(v< -1e-4 for v in a))
def distance(p,q):
 if inside(p,q):return 0
 ds=[]
 for a,b in zip(q,q[1:]+q[:1]):
  x=b[0]-a[0];y=b[1]-a[1];d=x*x+y*y;t=max(0,min(1,((p[0]-a[0])*x+(p[1]-a[1])*y)/d)) if d else 0;ds.append(math.hypot(p[0]-a[0]-t*x,p[1]-a[1]-t*y))
 return min(ds)
def safe(poly,spec,circle):
 assert all(math.isfinite(v) for p in poly for v in p)
 assert all(-1e-4<=x<=spec['W']+1e-4 and -1e-4<=y<=spec['H']+1e-4 for x,y in poly)
 assert distance([circle['cx'],circle['cy']],poly)+1e-4>=circle['r']+max(2,.005*min(spec['W'],spec['H']))

for name in ['final12']:
 report=load(name)
 for pin in report['pins']:
  snap=pathlib.Path('/tmp/avoid009-flag-'+name+'.json.gz.inputs')/(pin['path'].replace('/','__')+'.gz')
  assert hashlib.sha256(gzip.decompress(snap.read_bytes())).hexdigest()==pin['sha256'];assert hashlib.sha256((root/pin['path']).read_bytes()).hexdigest()==pin['sha256'];C['snapshotPins']+=1
 seen=set()
 for row in report['rows']:
  assert row['sourceUnchanged'] and not row['errors'];spec=row['spec'];key=json.dumps(spec,sort_keys=True);C[name+'DuplicateRows']+=int(key in seen);seen.add(key);tr=row.get('tr')
  if not tr:C[name+'TypedNonAdapterRows']+=1;continue
  segs=tr['units'][0]['segments']
  for seg in segs:
   if seg['status']!='safe':C[name+'Insufficient']+=1;continue
   C[name+'Safe']+=1;q=seg['attempts'][-1]['quality'];assert q['interval']['complete'] and q['fullGuardAttachmentEstablished'] and not q['fieldFailures'];assert q['complete'] and q['physicalAttachmentEstablished'] and not q['physicalFailures'] and q['poleEndClearance']>0;assert all(q['physicalAttachment'][k]['clearance']>=q['physicalAttachment']['requiredMargin'] for k in ['top','bottom'])
   assert len(seg['attempts'])<=122 and tr['sourceProof']['candidateRecipes']<=122
   if spec.get('explicitScale') is not None:assert all(a['recipe'].get('fontScale',1)==1 for a in seg['attempts'] if a.get('recipe'))
   pole=next(u['source'] for u in seg['unitProofs'] if u['owner']=='flag.pole');pa=q['physicalAttachment'];assert abs(pa['top']['field']-pole['ptop']-pa['top']['clearance'])<1e-7;assert abs(pole['ptop']+pole['poleLength']-pa['bottom']['field']-pa['bottom']['clearance'])<1e-7
   gs=[u for u in seg['unitProofs'] if 'ch' in u['source']];assert ''.join(u['source']['ch'] for u in gs)==''.join(spec['text'].split())
   for poly in seg['envelopes']:safe([[x+seg['from'][0],y+seg['from'][1]] for x,y in poly],spec,seg['circle']);C['continuousCertificatePolygons']+=1
  for obs in row['observations']:
   seg=next((s for s in segs if s['start']<=obs['realTime']<s['end']),None)
   if not seg or seg['status']!='safe':continue
   assert all(obs[k] for k in ['measurementSupported','envelopeCovered','stageContained','strictCircleClear'])
   eflat=[p for e in obs['events'] for p in e['polygons']]; assert len(eflat)==len(obs['polygons'])
   scales=[z for z in row.get('scales',[1]) if all(len(a)==len(b) and all(abs(v[0]/z+obs['offset'][0]-w[0])<1e-5 and abs(v[1]/z+obs['offset'][1]-w[1])<1e-5 for v,w in zip(a,b)) for a,b in zip(eflat,obs['polygons']))];assert scales;scale=scales[0]
   for e in obs['events']:
    assert e['role']=='primary';unit=next(u for u in seg['unitProofs'] if u['owner']==e['owner'])
    for poly in e['polygons']:assert any(all(inside([v[0]/scale,v[1]/scale],q) for v in poly) for q in unit['envelopes']);C['ownedEventEnvelopePolygons']+=1
   for poly in obs['polygons']:safe(poly,spec,seg['circle']);C['actualGuardedPolygons']+=1
 C[name+'UniqueSpecs']=len(seen)

for name in ['ids12','off12']:
 x=load(name)
 for pin in x['pins']:
  snap=pathlib.Path('/tmp/avoid009-flag-'+name+'.json.gz.inputs')/(pin['path'].replace('/','__')+'.gz');assert hashlib.sha256(gzip.decompress(snap.read_bytes())).hexdigest()==pin['sha256'];assert hashlib.sha256((root/pin['path']).read_bytes()).hexdigest()==pin['sha256'];C['snapshotPins']+=1
 if name=='ids12':
  R={(r['text'],r['mode'],r['stagger'],r['t']):r for r in x['reference']['temporal']}
  for r in x['temporal']:assert r['supported'] and not r['diagnostics'] and r['admitted']==R[r['text'],r['mode'],r['stagger'],r['t']]['admitted'];C['currentNativeClockIDRecords']+=1
 else:
  for a,b in zip(x['rows'],x['before']['rows']):assert a['spec']==b['spec'] and a['pixels']==b['pixels'];C['currentOFFPixelMetricFrames']+=len(a['pixels'])
out={'decision':'Accepted bounded raise adapter source/raw for main integration and selected media; not whole flag family or AVOID-009 completion.','baseline':'80f046d','counts':dict(C),'fixedParentFinding':'Native negative pole clearance now candidate failure; explicitScale.5 uses physical pole without font/contentScale reduction.','strategy':'Native joint then actual physical pole/travel, deduplicated contiguous native/2row/3row/flat writing forms at original font, then finite local font steps with floor and explicit-size preservation; maximum122 real recipes, no truncation.','sourceReview':'Read continuous outward interval algebra with31material nodes and all clamp/interpolation/trig branches; strict full font-space guarded cloth corridor incl swallow notch; continuous physical pole vs guarded cloth/rings; exact native gate/mi catalogue; narrow source-only solid cloth clip and live-root replay. No temporal sample union or generic guard/affine/clip expansion.','carry':'review03 96exact camera/scale/nonzerooffset transport:09a exacthash unchanged; final11p spatialdraw/clip code unchanged except pure rowForms metadata; source-known expected binding refreshed normally. Nonimpact06 18conditions72RGBA+3cache, common09a unchanged and all nonflag source blocks unchanged; no broader performance claim.','limitations':['Unfurl typed unsupported until actual phase-specific cloth-relative overhang proof','Only pinned functional font tested; full repertoire not certified','ExplicitScale4 insufficient preserved','No formal performance evaluation; cold earlier1000cut2712ms limitation remains','Human motion/visual review pending'],'publicResultChecks':0,'parentMediaViews':0}
p=main/'tasks/evidence/AVOID-009/flag-wip/parent-final12-review.json';p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out))
