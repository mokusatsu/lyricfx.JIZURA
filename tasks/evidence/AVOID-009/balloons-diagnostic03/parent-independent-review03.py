import gzip,json,math,struct,hashlib,collections,time
from pathlib import Path
root=Path('/workspace/lyricfx.JIZURA'); path=Path('/tmp/avoid009-balloons-diagnostic03/evidence/diagnostic03.raw.json.gz')
b=path.read_bytes(); assert hashlib.sha256(b).hexdigest()=='fb21504e731e2fea74f3fc5898edf1d9517162bc14bbe5dae76ff3f96bb62b74'
d=json.loads(gzip.decompress(b)); assert d['errors']==[]
def first(pred):
 lo=0; hi=struct.unpack('>Q',struct.pack('>d',math.nextafter(4,-math.inf)))[0]
 if pred(0):return 0
 assert pred(struct.unpack('>d',struct.pack('>Q',hi))[0])
 while hi-lo>1:
  mid=(hi+lo)//2
  if pred(struct.unpack('>d',struct.pack('>Q',mid))[0]):hi=mid
  else:lo=mid
 return struct.unpack('>d',struct.pack('>Q',hi))[0]
def incl(p,poly):
 signs=[]
 for a,b in zip(poly,poly[1:]+poly[:1]):
  v=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);signs.append(v)
 return not(min(signs)<-1e-6 and max(signs)>1e-6)
def near(a,b): assert abs(a-b)<1e-8,(a,b)
def intersects(poly,cx,cy,r):
 inside=False
 for a,b in zip(poly,poly[1:]+poly[:1]):
  dx=b[0]-a[0];dy=b[1]-a[1];q=dx*dx+dy*dy;t=max(0,min(1,((cx-a[0])*dx+(cy-a[1])*dy)/q)) if q else 0
  if math.hypot(cx-a[0]-t*dx,cy-a[1]-t*dy)<=r:return True
  if (a[1]>cy)!=(b[1]>cy) and cx<(b[0]-a[0])*(cy-a[1])/(b[1]-a[1])+a[0]:inside=not inside
 return inside
out=[]; counts=collections.Counter(); total=0
for r in d['results']:
 x=r['result'];g=x['sourceCatalog'];cut=x['sourceCutSnapshot']; W,H=g['stage']; counts['cases']+=1
 assert not x['safetyCertificate'] and not x['adapterRegistered'] and x['modelPendingParentReview']
 assert r['sourceUnchanged'] and not r['containmentFailures']
 nmin=math.floor(g['nativeSize']*.3*100)-1;nmax=math.ceil(g['nativeSize']*1.1078356481481482*100)+1
 assert x['metricKeys']==len(set(z['ch'] for z in g['glyphs']))*(nmax-nmin+1)
 for m in x['metricReceipts']:
  assert (m['minBin'],m['maxBin'],m['count'])==(nmin,nmax,nmax-nmin+1)
  assert len(m['digestSHA256'])==64
  for s in m['selected']:
   assert nmin<=s['bin']<=nmax and all(a<=b for a,b in zip(s['values'],m['allBinExtrema']))
 total+=x['metricKeys']; assert r['totalMetricKeysUsed']==total
 bs=x['branches'];rs=bs['ranges']; assert rs[0]['lo']==0 and rs[-1]['hi']==math.nextafter(4,-math.inf)
 for a,z in zip(rs,rs[1:]):assert math.nextafter(a['hi'],math.inf)==z['lo']
 assert all(0<=a['hi']-a['lo']<=.05 for a in rs)
 for v,br in zip(g['glyphs'],bs['branches']):
  ee=lambda t:max(0,min(1,(t-v['t1'])/.45))
  assert br['onset']==first(lambda t:ee(t)>0) and br['held']==first(lambda t:ee(t)>=1)
  mi=max(0,v['t1'])/max(.005,cut['stagger'] or .04);delay=int(mi)*(cut['stagger'] or 0)
  near(br['delay'],delay); assert br['body']==first(lambda t:t-delay>=0)
 assert bs['exit']==first(lambda t:max(0,min(1,(t-(cut['dur']-cut['outDur']))/cut['outDur']))>0)
 led=x['ledger'];index=collections.defaultdict(list)
 for e in led:
  index[(e['owner'],e['pass'])].append(e);p=e['polygon'];bb=e['bounds']
  assert [bb['x0'],bb['x1'],bb['y0'],bb['y1']]==[min(a[0] for a in p),max(a[0] for a in p),min(a[1] for a in p),max(a[1] for a in p)]
  assert any([a['lo'],a['hi']]==e['sourceRange'] for a in rs)
  near(e['realRange'][0],max(0,e['sourceRange'][0]+e['lag']-x['domain']['step']))
  near(e['realRange'][1],e['sourceRange'][1]+e['lag']+x['domain']['step'])
 for a in r['actual']:
  counts['sourceProbes']+=1;lt=a['lt'];scale=a['scale'];assert a['selectorActive']==(lt<4)
  near(a['actualEffectiveFX']['motion'],r['sourcePlan']['fx']['motion']*(cut.get('motionScale',1) if cut.get('motionScale',1)<1 else 1))
  for ev in a['events']:
   e=ev['event']; assert e['role']=='primary';counts['events']+=1
   if e['kind']=='line':
    pts=e['args'][0];m=e['matrix'];guard=e['args'][2]/2*e['args'][4]['miterLimit'];assert len(pts)==11
    groups=[]
    for k in range(10):
     vertices=[]
     for p in [pts[k],pts[k+1]]:
      for sx in [-guard,guard]:
       for sy in [-guard,guard]:
        X=m[0]*(p[0]+sx)+m[2]*(p[1]+sy)+m[4];Y=m[1]*(p[0]+sx)+m[3]*(p[1]+sy)+m[5]
        for ax in [-1,1]:
         for ay in [-1,1]:vertices.append([(X+ax)/scale,(Y+ay)/scale])
     stored=ev['physicalSegments'][k];assert stored['owner']==e['owner']+'.'+str(k)
     for p,q in zip(vertices,stored['vertices']):near(p[0],q[0]);near(p[1],q[1])
     groups.append((stored['owner'],vertices));counts['segments']+=1
   else:
    vertices=[[p[0]/scale,p[1]/scale] for poly in e['polygons'] for p in poly];groups=[(e['owner'],vertices)]
    assert vertices==ev['physicalSupportVertices']
   if a['selectorActive']:
    for owner,vertices in groups:
     supports=[s for s in index[(owner,a['pass'])] if s['sourceRange'][0]<=lt<=s['sourceRange'][1]]
     assert len(supports)==1,(owner,lt,len(supports))
     assert all(incl(p,supports[0]['polygon']) for p in vertices),(owner,lt)
     counts['vertices']+=len(vertices)
 trials=x['trials'];c=r['region']['circle'];radius=c['r']+max(2,.005*min(W,H))
 for attempt in trials['attempts']:
  dx,dy=attempt['offset'];nf=ns=nt=0
  for e in led:
   z=e['bounds'];nt+=not(z['x0']+dx>=0 and z['x1']+dx<=W and (z['y0']+dy>=0 or e['phase']['exit']) and (z['y1']+dy<=H or e['phase']['entry']))
   if e['realRange'][0]>=r['region']['end'] or e['realRange'][1]<=r['region']['start']:continue
   # Move the circle instead of the polygon; independent distance/ray geometry.
   if intersects(e['polygon'],c['cx']-dx,c['cy']-dy,radius):
    nf+=1;ns+=not e['phase']['entry'] and not e['phase']['exit']
  assert (nf,ns,nt)==(attempt['fullCircleFailures'],attempt['selectiveMovingCircleFailures'],attempt['stageFailures'])
  assert attempt['certificate']==False;counts['candidates']+=1
 remaining=[e for e in led if e['realRange'][1]>r['region']['end'] and e['realRange'][0]<x['domain']['sourceExpiryUpperBound']]
 assert len(remaining)==x['retentionTail']['remainingSupports'] and x['retentionTail']['status']=='unsupported-plan-duration-retention-tail'
 assert x['retentionTail']['zeroOffsetAllRemainingTop']==all(e['bounds']['y1']<0 for e in remaining)
 counts['ledger']+=len(led);counts['ranges']+=len(rs)
 out.append({'seed':g['seed'],'metrics':x['metricKeys'],'ledger':len(led),'candidateStatuses':dict(collections.Counter(a['status'] for a in trials['attempts'])),'retention':x['retentionTail']})
receipt={'kind':'parent-independent-diagnostic03-review','rawSHA256':hashlib.sha256(b).hexdigest(),'counts':dict(counts),'metricKeys':total,'results':out,'limits':['Font metric full tables remain RAM-only: hashes/extrema/selected values are receipts, not independently remeasured here.','Declared bounded numeric/Canvas root model; no universal raster theorem.','Continuous own-clock source probes are not quantized Renderer.frame trajectory proof.','All original retention tails unsupported; no adapter or safety certificate accepted.'],'publicChecks':0,'imagesViewed':0}
p=root/'work/avoid009-balloons-translation03/evidence/parent-independent-raw03.json';p.write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,ensure_ascii=False))
