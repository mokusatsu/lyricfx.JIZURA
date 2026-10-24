import pathlib,json,gzip,math,struct,hashlib,sys
path=pathlib.Path(sys.argv[1]);data=json.load(gzip.open(path));v=data['results'][0];r=v['result'];D=r['domain'];G=r['sourceCatalog'];P=v['sourcePlan'];cut=r['sourceCutSnapshot'];C={};maxerr=0

def inc(k,n=1):C[k]=C.get(k,0)+n

def near(a,b,eps=2e-8):
 global maxerr
 if isinstance(a,(list,tuple)):
  assert len(a)==len(b),(len(a),len(b))
  for x,y in zip(a,b):near(x,y,eps)
 else:
  e=abs(a-b);maxerr=max(maxerr,e);assert e<=eps,(a,b,e)

def box(p):return[min(x[0]for x in p),min(x[1]for x in p),max(x[0]for x in p),max(x[1]for x in p)]

def inside(pt,p):
 q=[(b[0]-a[0])*(pt[1]-a[1])-(b[1]-a[1])*(pt[0]-a[0])for a,b in zip(p,p[1:]+p[:1])];return min(q)>=-1e-8 or max(q)<=1e-8

def clear(p,c,R):
 pt=[c['cx'],c['cy']]
 if inside(pt,p):return False
 for a,b in zip(p,p[1:]+p[:1]):
  dx,dy=b[0]-a[0],b[1]-a[1];den=dx*dx+dy*dy;u=max(0,min(1,((pt[0]-a[0])*dx+(pt[1]-a[1])*dy)/den))if den else 0
  if math.hypot(pt[0]-a[0]-u*dx,pt[1]-a[1]-u*dy)<=R:return False
 return True

def overlap(a,b):return a[0]<=b[2]and a[2]>=b[0]and a[1]<=b[3]and a[3]>=b[1]

def hull(points):
 points=sorted(set(tuple(p)for p in points));cross=lambda o,a,b:(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);lo=[];hi=[]
 for p in points:
  while len(lo)>1 and cross(lo[-2],lo[-1],p)<=0:lo.pop()
  lo.append(p)
 for p in points[::-1]:
  while len(hi)>1 and cross(hi[-2],hi[-1],p)<=0:hi.pop()
  hi.append(p)
 return lo[:-1]+hi[:-1]

def project(local,pas):
 W,H=P['W'],P['H'];aa=2/D['minRenderScale']+D['rootGuard']+D['arithmeticGuard'];S=max(1,1+.03*max(min(P['fx']['motion']*1.25,1.25),P['fx']['motion']),1.02);pts=[]
 for x,y in local:
  for scale in [1,S]:
   for dx,dy in [(-aa,-aa),(-aa,aa),(aa,-aa),(aa,aa)]:pts.append([W/2+(x-W/2)*scale+dx,H/2+(y-H/2)*scale+dy])
 dx=pas['off'][0]*D['chroma']*H/1080*D['motion'];dy=pas['off'][1]*D['chroma']*H/1080*D['motion'];return[[x+dx,y+dy]for x,y in hull(pts)]

ranges=r['branches']['ranges'];assert ranges[0]['lo']==0 and ranges[-1]['hi']==math.nextafter(4,-math.inf)
for a,b in zip(ranges,ranges[1:]):assert math.nextafter(a['hi'],math.inf)==b['lo']
inc('gapfreeFloat64Ranges',len(ranges))
bits=lambda x:struct.unpack('Q',struct.pack('d',x))[0];val=lambda b:struct.unpack('d',struct.pack('Q',b))[0]
def first(pred):
 end=math.nextafter(4,-math.inf)
 if not pred(end):return None
 if pred(0):return 0
 lo,hi=0,bits(end)
 while hi-lo>1:
  m=(lo+hi)//2
  if pred(val(m)):hi=m
  else:lo=m
 return val(hi)
for b,g in zip(r['branches']['branches'],G['glyphs']):
 onset=first(lambda t:(t-g['t1'])/.16>=0);held=first(lambda t:(t-g['t1'])/.16>=1);mi=max(0,g['t1'])/max(.005,cut.get('stagger')or.04);delay=int(mi)*(cut.get('stagger') or 0);body=first(lambda t:t-delay>=0)
 assert (onset,held,body)==(b['onset'],b['held'],b['body']);near(mi,b['mi']);near(delay,b['delay']);inc('independentSourceBranchPredicates',3)
full=all('fullBinValues'in t for t in r['metricReceipts']);tables={}
if full:
 expected={}
 for glyph in G['glyphs']:
  key=(G['params']['font'],glyph['ch']);lo,hi=glyph['size']*.95,glyph['size']*1.28;a,b=math.floor(lo*100)-4,math.ceil(hi*100)+4
  expected[key]=(min(expected.get(key,(10**9,0))[0],a),max(expected.get(key,(10**9,0))[1],b))
 for glyph in G['decoys']:
  key=(G['params']['df'],glyph['ch']);lo,hi=glyph['size'],glyph['size']*1.25;a,b=math.floor(lo*100)-4,math.ceil(hi*100)+4
  expected[key]=(min(expected.get(key,(10**9,0))[0],a),max(expected.get(key,(10**9,0))[1],b))
 for t in r['metricReceipts']:
  key=(t['font'],t['ch']);assert(t['min'],t['max'])==expected[key];vals=t['fullBinValues'][:];assert len(vals)==t['count']*4
  for i in t['negativeZeroIndices']:assert vals[i]==0;vals[i]=-0.0
  endian='<'if t['fullBinEncoding']['endianness']=='little'else'>';encoded=struct.pack(endian+str(len(vals))+'d',*vals);assert hashlib.sha256(encoded).hexdigest()==t['digestSHA256']
  for s in t['selected']:assert vals[(s['bin']-t['min'])*4:(s['bin']-t['min']+1)*4]==s['values']
  for k in range(4):assert max(vals[k::4])==t['allBinExtrema'][k]
  tables[key]=(t['min'],t['max'],vals);inc('independentlyRebuiltFullMetricBins',t['count']);inc('negativeZeroSignsRestored',len(t['negativeZeroIndices']))

def R(a,b):return[math.nextafter(a,-math.inf),math.nextafter(b,math.inf)]
def add(a,b):return R(a[0]+b[0],a[1]+b[1])
def sub(a,b):return add(a,[-b[1],-b[0]])
def mul(a,b):
 q=[a[0]*b[0],a[0]*b[1],a[1]*b[0],a[1]*b[1]];return R(min(q),max(q))
def cst(a,k):return mul(a,[k,k])
def jsround(x):return math.floor(x)+int(x-math.floor(x)>=.5)
def ghull(g,font,sz,x,y):
 m0,m1,vals=tables[(font,g['ch'])];lo,hi=jsround(sz[0]*100)-1,jsround(sz[1]*100)+1;assert m0<=lo<=hi<=m1
 m=[max(vals[(lo-m0)*4+k:(hi-m0+1)*4:4])for k in range(4)];pad=sz[1]*.08/2+2;th=g['rot']*(math.pi/180);co,si=math.cos(th),math.sin(th);points=[[-m[0]-pad,-m[2]-pad],[m[1]+pad,-m[2]-pad],[m[1]+pad,m[3]+pad],[-m[0]-pad,m[3]+pad]];xs=[co*px-si*py for px,py in points];ys=[si*px+co*py for px,py in points]
 return hull([[x[0]+min(xs),y[0]+min(ys)],[x[1]+max(xs),y[0]+min(ys)],[x[1]+max(xs),y[1]+max(ys)],[x[0]+min(xs),y[1]+max(ys)]])

def independent_local(e):
 g=G['glyphs'][e['q']];b=r['branches']['branches'][e['q']];lo,hi=e['sourceRange'];f=R((lo-g['t1'])/.16,(hi-g['t1'])/.16);entry=hi<b['held'];snap=sub([1.28,1.28],cst(mul(f,f),.28))if entry else R(.95-1e-13,1.05+1e-13);sz=cst(snap,g['size']);lift=sub([1,1],f)if entry else[0,0];near(e['sizeRange'],sz);near(e['liftRange'],lift)
 if e['part']=='depth':x=add([g['x'],g['x']],cst(add([.04,.04],cst(lift,.12)),g['size']));y=add([g['y'],g['y']],cst(add([.06,.06],cst(lift,.18)),g['size']))
 else:x=[g['x'],g['x']];y=[g['y'],g['y']]
 return ghull(g,G['params']['font'],sz,x,y)
if full:
 for e in r['ledger']:near(independent_local(e),e['local']);inc('independentFullMetricIntervalLocalHulls')
 main=next(x for x in D['passes']if x['pass']=='main');handle=G['scene']['handle'];local=[[handle['x'],handle['y']],[handle['x']+handle['w'],handle['y']],[handle['x']+handle['w'],handle['y']+handle['h']],[handle['x'],handle['y']+handle['h']]];near(project(local,main),r['obstacles'][0]['polygon']);inc('independentFixedSceneObstacles')
 for obs in r['obstacles'][1:]:
  _,_,i,part=obs['owner'].split('.');g=G['decoys'][int(i)];x=g['x']+(g['size']*.05 if part=='depth'else 0);y=g['y']+(g['size']*.07 if part=='depth'else 0);local=ghull(g,G['params']['df'],[g['size'],g['size']*1.25],[x,x],[y,y]);near(project(local,main),obs['polygon']);inc('independentFixedSceneObstacles')

for e in r['ledger']:
 pas=next(p for p in D['passes']if p['pass']==e['pass']);near(project(e['local'],pas),e['polygon']);near(e['realRange'],[max(0,e['sourceRange'][0]+pas['lag']-D['step']),e['sourceRange'][1]+pas['lag']+D['step']]);inc('independentCameraProjectedSupports')
obs=[box(o['polygon'])for o in r['obstacles']];bi=r['boardInner'];circle=v['region']['circle'];radius=circle['r']+max(2,.005*min(P['W'],P['H']))
for candidate in r['candidates']:
 counts=dict.fromkeys(candidate['counts'],0);dx,dy=candidate['offset']
 for e in r['ledger']:
  poly=[[x+dx,y+dy]for x,y in e['polygon']];b=box(poly);bad={'circle':not clear(poly,circle,radius),'globalStage':b[0]<0 or b[1]<0 or b[2]>P['W']or b[3]>P['H'],'board':b[0]<bi['x0']or b[2]>bi['x1']or b[1]<bi['y0']or b[3]>bi['y1'],'handle':overlap(b,obs[0]),'decoys':any(overlap(b,o)for o in obs[1:]),'sourceBandPolicyOnly':b[1]<G['band']['y0']or b[3]>G['band']['y1']}
  for k,bad0 in bad.items():counts[k]+=bad0
 assert counts==candidate['counts'],(counts,candidate['counts']);assert candidate['candidateOnly']==all(n==0 for k,n in counts.items()if k!='sourceBandPolicyOnly');assert candidate['certificate']is False;inc('independentCandidateConstraintSets')
for frame in v['actual']:
 for e in frame['events']:
  inc('actualProgramEvents')
  if not frame['ownSelectorActive']:continue
  owner=e['event']['owner'];physical=e['physical']
  if e['event']['role']=='primary':
   support=[q for q in r['ledger']if q['owner']==owner and q['pass']==frame['pass']and q['sourceRange'][0]<=frame['lt']<=q['sourceRange'][1]];assert len(support)==1;poly=support[0]['polygon']
  elif e['event']['kind']=='item'or owner=='magnets.scene.handle':
   support=[q for q in r['obstacles']if q['owner']==owner];assert len(support)==1;poly=support[0]['polygon']
  else:continue
  for pt in physical:assert inside(pt,poly),(owner,frame['lt'],pt);inc('independentActualVertexContainment')
for f in v['cameraProbes']:
 near(f['cam']['s'],1+.03*f['actualFX']['motion']*max(0,min(1,f['lt']/4)));s=f['scale'];cs=f['cs'];dx,dy=f['actualPassShift'];expected=[s*cs,0,0,s*cs,s*(480+dx-480*cs),s*(270+dy-270*cs)];near(expected,f['expected']);assert max(abs(x-y)for x,y in zip(expected,f['root']))<=D['rootGuard']*s;inc('independentActualRendererRootProbes')
inc('metricKeys',sum(t['count']for t in r['metricReceipts']));assert C['metricKeys']==r['metricKeys']
assert not data['errors']and not v['cameraFailures']and not v['containmentFailures'];out={'raw':str(path),'rawBytes':path.stat().st_size,'rawSHA256':hashlib.sha256(path.read_bytes()).hexdigest(),'counts':C,'maximumProjectionResidual':maxerr,'candidatesPassingConservativeFamily':sum(c['candidateOnly']for c in r['candidates']),'noImpossibilityClaim':True,'noAdapterOrCertificate':True,'fullMetricTablesAvailable':all('fullBinValues'in x for x in r['metricReceipts']),'parentImages':0,'publicChecks':0};pathlib.Path(sys.argv[2]).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
