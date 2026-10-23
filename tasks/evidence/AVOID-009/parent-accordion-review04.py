import pathlib,json,math,hashlib,collections
root=pathlib.Path('/tmp/avoid009-accordion01');folder=root/'tasks/evidence/AVOID-009/accordion01';count=collections.Counter()
def inside(point,poly):
 cross=[(b[0]-a[0])*(point[1]-a[1])-(b[1]-a[1])*(point[0]-a[0]) for a,b in zip(poly,poly[1:]+poly[:1])];return not(any(v>1e-4 for v in cross) and any(v< -1e-4 for v in cross))
def distance(center,poly):
 if inside(center,poly):return 0
 values=[]
 for a,b in zip(poly,poly[1:]+poly[:1]):
  x=b[0]-a[0];y=b[1]-a[1];den=x*x+y*y;t=max(0,min(1,((center[0]-a[0])*x+(center[1]-a[1])*y)/den)) if den else 0;values.append(math.hypot(center[0]-a[0]-t*x,center[1]-a[1]-t*y))
 return min(values)
def safe(poly,spec,circle):
 assert all(math.isfinite(v) for p in poly for v in p)
 assert all(-1e-4<=x<=spec['W']+1e-4 and -1e-4<=y<=spec['H']+1e-4 for x,y in poly)
 assert distance([circle['cx'],circle['cy']],poly)+1e-4>=circle['r']+max(2,.005*min(spec['W'],spec['H']))
reports={n:json.loads((folder/(n+'.json')).read_text()) for n in ['matrix04','parity04','transport03','vertical01','nonimpact02']}
for report in reports.values():
 pins=report['pins']
 if isinstance(pins,str):pins=json.loads((root/pins/'invocation.json').read_text())['pins']
 for pin in pins:
  path=pathlib.Path(pin.get('file',pin.get('path','')));path=path if path.is_absolute() else root/path
  assert hashlib.sha256(path.read_bytes()).hexdigest()==pin['sha256'],str(path)
m=reports['matrix04'];assert m['summary']=={'cases':81,'safe':49,'insufficient':31,'unsupported':1,'failures':[]}
for row in m['rows']:
 assert row['inputUnchanged'] and not row['errors'];spec=row['spec'];segments=row.get('segments') or []
 for seg in segments:
  if seg['status']!='safe':continue
  count['safeSegments']+=1;q=seg['quality'];pw=q['panelWidth'];ph=q['panelHeight'];assert abs(ph/pw-1.2)<1e-12 and q['complete'] and not q['attachmentFailures'];assert q['minPrimaryPx']+1e-7>=min(q['nativeSize'],max(18,.035*min(spec['W'],spec['H'])))
  panels=[u for u in seg['unitProofs'] if 'ch' in u['source']];assert len(panels)==q['sourceSlots'];assert ''.join(u['source']['ch'] for u in panels).replace(' ','')==''.join(spec['text'].split());assert [u['source']['source'] for u in panels]==list(range(q['sourceSlots']));assert len(seg['unitProofs'])==q['sourceSlots']+q['rows']+q['covers'];groups=collections.defaultdict(list)
  for unit in panels:
   src=unit['source'];groups[src['row']].append(src);assert src['phase']==src['sourceJ']%2
   writing=src.get('writing')
   if not writing:continue
   for poly in writing['ink']:
    for vertex in poly:
     u,v=vertex[::-1] if src['localAxes']=='fontY-along-fontX-across' else vertex
     assert abs(u)<=pw/2+1e-7 and abs(v)<=ph/2-.13*ph/pw*abs(u)*math.sin(math.radians(88.5))+1e-7
    count['attachedFontPolygons']+=1
  for group in groups.values():assert all(x['sourceRow']==group[0]['sourceRow'] and x['sourceJ']==group[0]['sourceJ']+j for j,x in enumerate(group))
  for poly in seg['envelopes']:safe([[x+seg['from'][0],y+seg['from'][1]] for x,y in poly],spec,seg['circle']);count['certificatePolygons']+=1
 for obs in row['observations']:
  seg=next((s for s in segments if s['start']<=obs['realTime']<s['end']),None)
  if not seg or seg['status']!='safe':continue
  assert all(obs[k] for k in ['measurementSupported','envelopeCovered','stageContained','strictCircleClear']) and obs['safety']=='safe'
  for poly in obs['polygons']:
   safe(poly,spec,seg['circle']);local=[[x-obs['offset'][0],y-obs['offset'][1]] for x,y in poly];assert any(all(inside(v,q) for v in local) for q in seg['envelopes']);count['actualPolygons']+=1
for item in m['controls']:
 if item['control']=='explicit':assert item['explicitScale']==item['scale'] and item['scales']==[1]
 else:assert item['inputUnchanged'] and not item['staged']
for item in m['extra']:
 if item['kind']=='scale-and-native-clock':assert not item['errors'] and all(o['measurementSupported'] and o['envelopeCovered'] and o['stageContained'] and o['strictCircleClear'] for o in item['observations'])
v=reports['vertical01'];assert v['summary']=={'cases':24,'projectedChecks':192,'failures':0}
for row in v['rows']:
 assert not row['errors']
 for c in row['checks']:
  b=c['fontBounds'];corners=[[b['x0'],b['y0']],[b['x1'],b['y0']],[b['x1'],b['y1']],[b['x0'],b['y1']]];matrix=c['matrix'];derived=[[matrix[0]*x+matrix[2]*y+matrix[4],matrix[1]*x+matrix[3]*y+matrix[5]] for x,y in corners]
  assert all(any(math.dist(p,q)<1e-7 for q in c['fontVertices']) for p in derived);assert all(inside(p,c['panel']) for p in derived);assert c['attached'] and c['writing'] and c['covered'];count['independentVerticalProjections']+=1
p=reports['parity04'];assert not p['failures'] and len(p['rows'])==12 and len(p['transport'])==72 and len(p['chronology'])==18 and all(x['equal'] for x in p['rows']+p['transport']+p['chronology']);t=reports['transport03'];assert not t['failures'] and len(t['rows'])==432 and all(x['equal'] for x in t['rows'])
n=reports['nonimpact02'];assert n['summary']['failures']==0
result={'baseline':'90909a0','parentSourceReview':'Accepted corrected vertical fontY-along/fontX-across proof, complete native fold trig extrema and all owned blank/panel/cover/shadow units; exact original q/gi/mi and fold phase retained; narrow unchanged accordion live camera root capture only; no new draw/clip/affine permissions.','rawReview':dict(count),'matrixCases':81,'safeCases':49,'insufficientCases':31,'unsupportedCases':1,'nativeTransport':432,'OFFCases':12,'zeroTransportCases':72,'sourceChronologyCases':18,'nonimpact':'18 conditions72RGBA and3 completedcache cases','historicalFailuresRetained':'24transport/22diagnostic failures and prevertical-axis-correction snapshots preserved','formalPerformance':'Not evaluated; timing samples diagnostic only','humanReviewRequired':True,'publicResultChecks':0,'parentMediaViews':0}
path=pathlib.Path('/workspace/lyricfx.JIZURA/tasks/evidence/AVOID-009/parent-accordion-final04-review.json');path.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result))
