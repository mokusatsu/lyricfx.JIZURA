import pathlib,gzip,json,hashlib,math,sys
raw=pathlib.Path(sys.argv[1]);p=json.load(gzip.open(raw));C={};maxerr=0

def count(k,n=1):C[k]=C.get(k,0)+n

def near(a,b):
 global maxerr
 if isinstance(a,list):
  assert len(a)==len(b)
  for x,y in zip(a,b):near(x,y)
 else:
  e=abs(a-b);maxerr=max(maxerr,e);assert e<2e-9,(a,b,e)

def hull(pts):
 a=sorted(set(tuple(x) for x in pts));cross=lambda o,a,b:(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);lo=[];hi=[]
 for q in a:
  while len(lo)>1 and cross(lo[-2],lo[-1],q)<=0:lo.pop()
  lo.append(q)
 for q in a[::-1]:
  while len(hi)>1 and cross(hi[-2],hi[-1],q)<=0:hi.pop()
  hi.append(q)
 return lo[:-1]+hi[:-1]

def point(m,x,y):return[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]]
for rr in p['results']:
 a=rr['current'];assert not rr['parity'];count('fixtures')
 for row,old in zip(a['rows'],rr['original']['rows']):
  count('calls');assert row['off']==old['off'];assert row['direct']['hash']==old['off']['hash'];count('originalDirectPixelPairs')
  z,m,d,s=row['zero'],row['moved'],row['direct'],row['shifted'];assert not z['recordError'] and not m['recordError'];assert z['hash']==d['hash'];assert m['hash']==s['hash'];count('zeroPixelPairs');count('nonzeroPrimaryOnlyPixelPairs');assert z['catalog']==d['catalog']==s['catalog'];assert z['recordEvents']==m['recordEvents'];g=d['catalog'];root=d['root']
  trace=old['off']['trace'];nativeitems=[x['args'][0] for x in trace if x['key']=='item' and not (row['call']['pass']!='main' and x['args'][0].get('ghost') is False)];itemevents=[x for x in z['recordEvents'] if x['kind']=='item'];assert len(itemevents)==len(nativeitems)
  for e,it in zip(itemevents,nativeitems):
   arg=e['args'][0]
   for k in ['text','font','size','x','y','rot','color','stroke','strokeColor','strokeUnder','alpha','ghost','plain','mi','seed','delay']:
    if k in it:assert arg.get(k)==it[k],(k,arg.get(k),it[k])
   count('exactNativeRecordedItems')
  for e in z['recordEvents']:
   assert e['nativeTransform']['root']==root;assert not e['nativeTransform']['ops'];assert not e['clips'];count('originalRootEvents')
   if e['role']=='primary':assert e['owner'].startswith('magnets.glyph.')
   else:assert e['role']=='independentDecor' and e['owner'] in g['independentDecorOwners']
   if e['kind']=='nativeMagnetsRoundedGradient':
    q=g['scene']['gradient'];x,y,w,h,rad=[q['path'][k] for k in ['x','y','w','h','r']];r=max(0,min(rad,w/2,h/2));commands=[['moveTo',[x+r,y]],['arcTo',[x+w,y,x+w,y+h,r]],['arcTo',[x+w,y+h,x,y+h,r]],['arcTo',[x,y+h,x,y,r]],['arcTo',[x,y,x+w,y,r]],['closePath',[]]];assert e['args'][0]==commands;paint=e['args'][1];assert paint['args']==q['from']+q['to'];assert paint['matrix']==root==e['matrix'];assert paint['stops']==[[v['offset'],v['color']] for v in q['stops']];assert e['alpha']==q['alpha'];assert e['owner']=='magnets.scene.gradient'
    pts=[point(root,x,y),point(root,x+w,y),point(root,x+w,y+h),point(root,x,y+h)];expanded=[[v[0]+dx,v[1]+dy] for v in pts for dx,dy in [(-1,-1),(1,-1),(1,1),(-1,1)]];expected=hull(expanded);actual=e['polygons'][0];near([list(v) for v in expected],actual);count('independentExactRoundedGradientEvents');count('independentGradientGuardVertices',len(actual))
  expected=1 if g is not None and row['call']['pass']=='main' and g['ba']>0 else 0
  assert sum(e['kind']=='nativeMagnetsRoundedGradient' for e in z['recordEvents'])==expected
for c in p['controls']:
 assert c['equal'] and c['original']==c['current'];assert c['original']['direct']==c['original']['replay'];count('unrelatedDControls')
assert not p['errors'];assert p['summary']['failures']==0
out={'raw':str(raw),'rawBytes':raw.stat().st_size,'rawSHA256':hashlib.sha256(raw.read_bytes()).hexdigest(),'counts':C,'maximumNumericResidual':maxerr,'transportOnly':True,'placementAdapterAccepted':False,'formalPerformanceAccepted':False,'parentImages':0,'publicChecks':0}
pathlib.Path(sys.argv[2]).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
