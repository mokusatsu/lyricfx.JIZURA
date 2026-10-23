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

for name in ['matrix05','supplement06']:
 report=load(name)
 for pin in report['pins']:
  snap=pathlib.Path('/tmp/avoid009-flag-'+name+'.json.gz.inputs')/(pin['path'].replace('/','__')+'.gz')
  assert hashlib.sha256(gzip.decompress(snap.read_bytes())).hexdigest()==pin['sha256'];C['snapshotPins']+=1
 seen=set()
 for row in report['rows']:
  assert row['sourceUnchanged'] and not row['errors'];spec=row['spec'];key=json.dumps(spec,sort_keys=True);C[name+'DuplicateRows']+=int(key in seen);seen.add(key);tr=row.get('tr')
  if not tr:C[name+'TypedNonAdapterRows']+=1;continue
  segs=tr['units'][0]['segments']
  for seg in segs:
   if seg['status']!='safe':C[name+'Insufficient']+=1;continue
   C[name+'Safe']+=1;q=seg['attempts'][-1]['quality'];assert q['interval']['complete'] and q['fullGuardAttachmentEstablished'] and not q['fieldFailures'];C['negativePoleClearanceSafeCandidates']+=int(q['poleEndClearance']<0)
   gs=[u for u in seg['unitProofs'] if 'ch' in u['source']];assert ''.join(u['source']['ch'] for u in gs)==''.join(spec['text'].split())
   for poly in seg['envelopes']:safe([[x+seg['from'][0],y+seg['from'][1]] for x,y in poly],spec,seg['circle']);C['continuousCertificatePolygons']+=1
  for obs in row['observations']:
   seg=next((s for s in segs if s['start']<=obs['realTime']<s['end']),None)
   if not seg or seg['status']!='safe':continue
   assert all(obs[k] for k in ['measurementSupported','envelopeCovered','stageContained','strictCircleClear'])
   eflat=[p for e in obs['events'] for p in e['polygons']]; assert len(eflat)==len(obs['polygons'])
   scales=[z for z in row['scales'] if all(len(a)==len(b) and all(abs(v[0]/z+obs['offset'][0]-w[0])<1e-5 and abs(v[1]/z+obs['offset'][1]-w[1])<1e-5 for v,w in zip(a,b)) for a,b in zip(eflat,obs['polygons']))];assert scales;scale=scales[0]
   for e in obs['events']:
    assert e['role']=='primary';unit=next(u for u in seg['unitProofs'] if u['owner']==e['owner'])
    for poly in e['polygons']:assert any(all(inside([v[0]/scale,v[1]/scale],q) for v in poly) for q in unit['envelopes']);C['ownedEventEnvelopePolygons']+=1
   for poly in obs['polygons']:safe(poly,spec,seg['circle']);C['actualGuardedPolygons']+=1
 C[name+'UniqueSpecs']=len(seen)
out={'counts':dict(C),'decision':'FAIL source physical attachment: matrix05 case29 explicitScale.5 selected native with poleEndClearance -58.5060070360646; returned to implementer; no product integration. Stage/circle/event geometry checks below passed but do not establish complete source attachment.','requiredFix':'Reject candidate if pole cannot cover full moving cloth/rings with declared clearance, preserving explicit scale and using real physicalPole fallback.','publicResultChecks':0,'parentMediaViews':0}; (main/'tasks/evidence/AVOID-009/flag-wip/parent-matrix06-findings.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
