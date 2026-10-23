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
reports={k:load(k) for k in ['clock01','probe02','milestone03','off03']}
for k,r in reports.items():
 for p in r['pins']:
  snapshot=pathlib.Path('/tmp/avoid009-flag-'+k+'.json.gz.inputs')/(p['path'].replace('/','__')+'.gz')
  assert hashlib.sha256(gzip.decompress(snapshot.read_bytes())).hexdigest()==p['sha256'];assert hashlib.sha256((root/p['path']).read_bytes()).hexdigest()==p['sha256'],p['path'];C['inputPins']+=1
r=reports['clock01'];ref={(x['mode'],x['stagger'],x['t']):x for x in r['reference']['temporal']}
for x in r['temporal']:
 assert x['supported'] and not x['diagnostics'];y=ref[x['mode'],x['stagger'],x['t']];assert [{k:z[k] for k in ['text','mi']} for z in x['admitted']]==y['admitted'];catalog=next(c['catalog'] for c in r['catalogs'] if c['mode']==x['mode'] and c['stagger']==x['stagger'])
 for z in x['admitted']:assert any(q['index']==z['index'] and q['ch']==z['text'] and q['u']==z['nativeU'] for q in catalog['glyphs'])
 C['nativeClockRecords']+=1
for x in r['transport']:assert x['supported'] and not x['diagnostics'] and x['directSHA']==x['replaySHA'];C['exactTransportFrames']+=1
r=reports['off03'];assert len(r['rows'])==2
for x,y in zip(r['rows'],r['before']['rows']):assert x['spec']==y['spec'] and x['pixels']==y['pixels'];C['OFFPixelMetricFrames']+=len(x['pixels'])
r=reports['probe02']
for x,y in zip(r['rows'],r['before']['rows']):
 assert x['pixels']==y['pixels']
 for z in x['records']:assert z['measurementSupported'] and not z['diagnostics'] and z['directSHA']==z['replaySHA'];C['finiteReferenceTransport']+=1
r=reports['milestone03'];assert len(r['rows'])==7
for row in r['rows']:
 assert row['sourceUnchanged'] and not row['errors'];tr=row.get('tr');spec=row['spec']
 if not tr:assert row['diagnostics'][0]['code']=='FLAG_ENTRY_OVERHANG_INCONCLUSIVE';C['typedUnfurlUnsupported']+=1;continue
 for seg in tr['units'][0]['segments']:
  assert len(seg['attempts'])<=128
  if seg['status']!='safe':C['insufficientSegments']+=1;continue
  C['safeSegments']+=1;q=seg['attempts'][-1]['quality'];assert q['complete'] and q['fullGuardAttachmentEstablished'] and not q['fieldFailures'] and q['interval']['complete'];assert q['poleEndClearance']>0
  assert q['minPrimaryPx']+1e-6>=min(seg['composition']['baseSize'],max(18,.035*min(spec['W'],spec['H'])))
  units=seg['unitProofs'];gs=[u for u in units if 'ch' in u['source']];assert ''.join(u['source']['ch'] for u in gs)==''.join(spec['text'].split());assert len(units)==len(gs)+3
  for poly in seg['envelopes']:safe([[x+seg['from'][0],y+seg['from'][1]] for x,y in poly],spec,seg['circle']);C['continuousCertificatePolygons']+=1
 for obs in row['observations']:
  seg=next((s for s in tr['units'][0]['segments'] if s['start']<=obs['realTime']<s['end']),None)
  if not seg or seg['status']!='safe':continue
  assert all(obs[k] for k in ['measurementSupported','envelopeCovered','stageContained','strictCircleClear'])
  for event in obs['events']:
   assert event['role']=='primary';unit=next(u for u in seg['unitProofs'] if u['owner']==event['owner'])
   for poly in event['polygons']:
    assert any(all(inside([x,y],q) for x,y in poly) for q in unit['envelopes']);C['ownedEventEnvelopePolygons']+=1
  for poly in obs['polygons']:safe(poly,spec,seg['circle']);C['actualGuardedPolygons']+=1
out={'decision':'Focused raise milestone independently checked; NOT product integration/family acceptance. Ordinary pairwise matrix pending.','baseline':'80f046d','sourcePinsUnchanged':True,'counts':dict(C),'sourceReview':'Read09r interval arithmetic,31materialnodes,sourcefinite-difference/interpolation and all-owner boxes; conservative strict raise font-guard corridor, pole/ring/surface inclusion and fixed native-clock catalogue. No sampled-time union accepted as proof. Narrow source-sealed solid cloth clip/live root only; general affine/inverse and font guards unchanged.','limitations':['Unfurl unsupported pending actual cloth-relative phase proof','Normal circle four-glyph case remains insufficient128attempts','One pinned functional font, no repertoire certification','No formal performance claim','Independent reference clock traces text/mi; repeated-ID test planned'],'publicResultChecks':0,'parentMediaViews':0}
p=main/'tasks/evidence/AVOID-009/flag-wip/parent-raise-review03.json';p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out))
