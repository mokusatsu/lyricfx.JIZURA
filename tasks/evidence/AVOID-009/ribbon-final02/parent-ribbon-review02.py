import json,gzip,math,bisect,hashlib,pathlib
P=pathlib.Path('/tmp/avoid009-ribbon01/evidence/ribbon01')
def load(n):return json.load(gzip.open(P/n))
def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
def dist(p,a,b):
 d=[b[i]-a[i] for i in (0,1)];q=sum((p[i]-a[i])*d[i] for i in (0,1))/max(1e-300,sum(v*v for v in d));q=max(0,min(1,q));return math.hypot(*(p[i]-a[i]-q*d[i] for i in (0,1)))
def inside(p,poly):
 if min(dist(p,poly[i-1],poly[i]) for i in range(len(poly)))<1e-7:return True
 c=False
 for a,b in zip(poly,poly[1:]+poly[:1]):
  if (a[1]>p[1])!=(b[1]>p[1]) and p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]:c=not c
 return c
def hull(ps):
 ps=sorted(set(map(tuple,ps)))
 def half(qs):
  h=[]
  for q in qs:
   while len(h)>1 and cross(h[-2],h[-1],q)<=0:h.pop()
   h.append(q)
  return h[:-1]
 return half(ps)+half(ps[::-1])
x=load('matrix02.json.gz');result=x['result'];assert not result['failures'];counts=dict(records=0,polygons=0,vertices=0,edges=0,glyphs=0,certificatePolygons=0);margin=float('inf')
for r in result['rows']:
 if r['preserved']:assert all(r['preserved'].values())
 tr=r.get('trajectory')
 if not tr:continue
 for s in tr['units'][0]['segments']:
  if s['status']!='safe':continue
  for poly in s['envelopes']:
   poly=[[p[i]+s['from'][i] for i in (0,1)] for p in poly];counts['certificatePolygons']+=1
   assert all(-1e-6<=p[0]<=r['spec']['W']+1e-6 and -1e-6<=p[1]<=r['spec']['H']+1e-6 for p in poly)
   c=[s['circle']['cx'],s['circle']['cy']];d=min(dist(c,poly[i-1],poly[i]) for i in range(len(poly)))-s['circle']['r'];assert not inside(c,poly) and d>0; margin=min(margin,d)
 for rec in r['records']:
  counts['records']+=1;s=next(s for s in tr['units'][0]['segments'] if s['start']<=rec['t']<s['end']);c=[s['circle']['cx'],s['circle']['cy']]
  for obs in rec['observations']:
   for poly in obs['polygons']:
    counts['polygons']+=1
    assert all(-1e-6<=p[0]<=r['spec']['W']+1e-6 and -1e-6<=p[1]<=r['spec']['H']+1e-6 for p in poly)
    assert not inside(c,poly);assert min(dist(c,poly[i-1],poly[i]) for i in range(len(poly)))>s['circle']['r']
  quality=next(a['quality'] for a in s['attempts'] if a.get('status')=='safe');inks={q['id']:q['ink'] for f in quality['fields'] for q in f['rows']}
  for row in rec['geometry']['rows']:
   poly=[q['a'] for q in row['band'][11:54]]+[q['b'] for q in row['band'][11:54][::-1]]
   for slot in row['slots']:
    if slot['space']:continue
    counts['glyphs']+=1;k=max(0,min(89,bisect.bisect_right(row['acc'],slot['sc0'])-1));a,b=row['pts'][k:k+2];f=(slot['sc0']-row['acc'][k])/(row['acc'][k+1]-row['acc'][k]);p=[a[i]+f*(b[i]-a[i]) for i in (0,1)];theta=math.atan2(b[1]-a[1],b[0]-a[0]);cs,sn=math.cos(theta),math.sin(theta);guard=20/r['spec'].get('explicitScale',1)*(math.cos(math.radians(5))+math.sin(math.radians(5))) if r['spec'].get('cam')=='dutch' else 20/r['spec'].get('explicitScale',1)
    ps=[[p[0]+v[0]*cs-v[1]*sn+dx,p[1]+v[0]*sn+v[1]*cs+dy] for v in inks[slot['id']] for dx in (-guard,guard) for dy in (-guard,guard)];counts['vertices']+=len(ps);assert all(inside(v,poly) for v in ps),(r['id'],rec['t'],slot['id'])
    h=hull(ps);counts['edges']+=len(h)
    for a,b in zip(h,h[1:]+h[:1]):
     assert all(not(cross(a,b,c)*cross(a,b,d)<-1e-8 and cross(c,d,a)*cross(c,d,b)<-1e-8) for c,d in zip(poly,poly[1:]+poly[:1]))
assert all(result['cache'][k] for k in ('equal','detached','frozen','sourceUnchanged'));assert result['cache']['ws']['hits']>result['cache']['cs']['hits']
e=load('explicit01.json.gz')['result'][0];s=e['trajectory']['units'][0]['segments'][0];assert e['cut']['contentScale']==1.1 and e['cut']['areaMode']=='auto';assert all((a.get('recipe') or {}).get('fontScale',1)==1 for a in s['attempts']);assert e['trajectory']['sourceProof']['explicitSizePreserved']
f=load('focused04.json.gz');n=0
for i,r in enumerate(f['result']['result']):
 ref=f['reference']['result'][i]
 for row in r['rows']:
  before=next(q for q in ref['rows'] if q['t']==row['t'] and q['stagger']==row['stagger'])
  orig={q['id']:q for q in before['slots']}
  for slot in row['slots']:
   q=orig[slot['id']]
   for k in ('f','rawMi','visible','ch','row','slot'):assert slot[k]==q[k],(i,k,slot,q)
   n+=1
print("independent slot records",n);assert n>=140
non=load('matrix02.json.gz.nonimpact.gz');assert non['after']==non['baseline']
report={'decision':'independent raw checks pass; bounded scope only; source review derivation separately recorded','counts':counts,'minCertificateCircleMargin':margin,'focusedNativeClockRecords':n,'explicitAutoStatus':s['status'],'nonimpactPairs':len(non['after']),'rawSha256':{n:hashlib.sha256((P/n).read_bytes()).hexdigest() for n in ('matrix02.json.gz','explicit01.json.gz','focused04.json.gz','matrix02.json.gz.nonimpact.gz')},'imagesViewed':0,'publicChecks':0}
pathlib.Path('/tmp/parent-ribbon-review02.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
