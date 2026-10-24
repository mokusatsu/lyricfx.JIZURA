# Pure offline source algebra over accepted native03 raw; no JS/browser execution.
from pathlib import Path
import json,gzip,math,hashlib
D=Path('/workspace/lyricfx.JIZURA/work/avoid009-blocks-native01');rawpath=D/'evidence/native03.raw.json.gz';raw=json.loads(gzip.decompress(rawpath.read_bytes()))
def inv(m):
 a,b,c,d,e,f=m;n=a*d-b*c;return [d/n,-b/n,-c/n,a/n,(c*f-d*e)/n,(b*e-a*f)/n]
def pt(m,p):return [m[0]*p[0]+m[2]*p[1]+m[4],m[1]*p[0]+m[3]*p[1]+m[5]]
def hull(ps):
 p=sorted(set(tuple(v) for v in ps));cross=lambda a,b,c:(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);lo=[];hi=[]
 for v in p:
  while len(lo)>1 and cross(lo[-2],lo[-1],v)<=0:lo.pop()
  lo.append(v)
 for v in reversed(p):
  while len(hi)>1 and cross(hi[-2],hi[-1],v)<=0:hi.pop()
  hi.append(v)
 return lo[:-1]+hi[:-1]
def distance(poly,c):
 sides=[];best=math.inf
 for i,a in enumerate(poly):
  b=poly[(i+1)%len(poly)];cross=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);sides.append(cross)
  dx=b[0]-a[0];dy=b[1]-a[1];t=max(0,min(1,((c[0]-a[0])*dx+(c[1]-a[1])*dy)/(dx*dx+dy*dy))) if dx*dx+dy*dy else 0
  best=min(best,math.hypot(c[0]-a[0]-t*dx,c[1]-a[1]-t*dy))
 return 0 if all(v>=-1e-10 for v in sides) or all(v<=1e-10 for v in sides) else best

def solve(owners,W,H):
 xs=[v[0] for o in owners for v in o['hull']];ys=[v[1] for o in owners for v in o['hull']];lo=-min(ys);hi=H-max(ys);margin=max(2,.005*min(W,H));circle=[.5*W,.42*H,.2*min(W,H)]
 if min(xs)<0 or max(xs)>W or lo>hi:return {'status':'conditional-no-Y-only-certificate','stageYRange':[lo,hi],'reason':'held continuous hull exceeds common stage bounds'}
 candidates=[lo,hi]+[lo+i for i in range(math.floor(hi-lo)+1)]+([0] if lo<=0<=hi else []);candidates=sorted(set(candidates),key=lambda y:(abs(y),y));best=None
 for dy in candidates:
  ds=[distance([[x,y+dy] for x,y in o['hull']],circle[:2]) for o in owners];clear=min(ds)-circle[2]-margin
  if clear>1e-7:
   best={'offset':[0,dy],'strictCircleExcessAboveRadiusAndMargin':clear,'stageYRange':[lo,hi],'minOwnerDistance':min(ds),'clearanceLimitingOwner':owners[ds.index(min(ds))]['owner'],'candidatesChecked':candidates.index(dy)+1};break
 return {'status':'conditional-held-Y-translation-found' if best else 'conditional-no-Y-only-certificate','circle':circle,'margin':margin,'solution':best,'stageYRange':[lo,hi],'scope':'per-owner continuous independent squash/bounce/hop hulls and declared copies with declared camera hull; not an adapter/entry certificate'}
results=[]
for result in raw['results']:
 current=result['current'];spec=current['spec']
 if spec.get('empty'):continue
 row=next(r for r in current['rows'] if r['call']=={'t':1.5,'pass':'main','root':True});g=row['direct']['catalog'];events=row['zero']['events'];owners=[]
 for e in events:
  local=[[pt(inv(e['matrix']),p) for p in poly] for poly in e['polygons']];name=e['owner'];points=[]
  if name=='blocks.floor':points=[p for poly in local for p in poly]
  else:
   b=g['blocks'][int(name.split('.')[2])];rad=math.radians(b['rot']);co=math.cos(rad);si=math.sin(rad);kz=b['kz'];dyMin=-.1*kz-(.16*kz if g['params']['hop'] and b['sourceIndex']<g['n'] else 0)
   for poly in local:
    for x,y in poly:
     yy=y if name.endswith('.glyph') else y-kz/2
     for q in [.9,1]:
      for dy in [dyMin,0]:points.append([b['x']+co*x-si*q*yy,b['y']+kz/2+si*x+co*q*yy+dy])
  # Extra device guard covers inversion/root rounding and variation of raw AA guards.
  owners.append({'owner':name,'hull':hull([[x+dx,y+dy] for x,y in points for dx in [-2,2] for dy in [-2,2]])})
 scenarios=[]
 for chromaMax in [0,1.33]:
  expanded=[]
  for original in owners:
   o={'owner':original['owner'],'hull':hull([[spec['W']/2+(x-spec['W']/2)*scale,spec['H']/2+(y-spec['H']/2)*scale] for x,y in original['hull'] for scale in [1,1.0195]])}
   expanded.append(o)
   if o['owner'].endswith('.glyph') and chromaMax:
    for tag,coef in [('A',(3.2,1.9)),('B',(-3.4,-1.3))]:
     shifts=[[0,0],[coef[0]*chromaMax*spec['H']/1080,coef[1]*chromaMax*spec['H']/1080]]
     expanded.append({'owner':o['owner']+'.copy'+tag,'hull':hull([[x+s[0],y+s[1]] for x,y in o['hull'] for s in shifts])})
  scenarios.append({'cameraPushScaleRange':[1,1.0195],'declaredChromaMax':chromaMax,'ownerHulls':len(expanded),'result':solve(expanded,spec['W'],spec['H'])})
 results.append({'seed':spec['seed'],'text':spec['text'],'stage':[spec['W'],spec['H']],'nativeShapeFontTravelUnchanged':True,'nativeK':g['k'],'baseOwnerHulls':len(owners),'scenarios':scenarios})
# Source-algebra short four-character native body example. No unmeasured font claim.
W=960;H=540;n=4;per=4;rows=1;k=min(W*.84/(per*1.07+2*.95+.34),H*.7/(rows*1.02+.34+.2),min(W,H)*.26);dx=k*.34*.8;ddy=-k*.34*.62;fy=H/2+rows*k/2+k*.1;bl=[]
for i in range(4):bl.append({'x':W/2+(i-1.5)*k*1.07-dx/2,'y':fy-.5*k*1.02,'sz':1,'name':'lyric.'+str(i)})
xl=W/2-(per-1)/2*k*1.07-dx/2-k*1.05;xr=W/2+(per-1)/2*k*1.07-dx/2+k*1.05
bl.extend([{'x':xl,'y':fy-k*.4,'sz':.8,'name':'toy.left'},{'x':xr,'y':fy-k*.4,'sz':.8,'name':'toy.right'},{'x':xr,'y':fy-k*.8-k*.3,'sz':.6,'name':'toy.diamond'}])
owners=[{'owner':'floor','hull':hull([[W*.08-3,fy-3],[W*.92+3,fy-3],[W*.92+3,fy+3],[W*.08-3,fy+3]])}]
for b in bl:
 z=k*b['sz'];hx=z/2;ddx=dx*b['sz'];dddy=ddy*b['sz'];vertices=[[-hx,-hx],[hx,-hx],[hx,hx],[-hx,hx],[-hx+ddx,-hx+dddy],[hx+ddx,-hx+dddy],[hx+ddx,hx+dddy]];points=[]
 for x,y in vertices:
  for q in [.9,1]:
   for dy in [-.1*z,0]:
    for gx in [-3,3]:
     for gy in [-3,3]:points.append([b['x']+x+gx,b['y']+z/2+q*(y-z/2)+dy+gy])
 owners.append({'owner':b['name'],'hull':hull(points)})
owners=[{'owner':o['owner'],'hull':hull([[W/2+(x-W/2)*scale,H/2+(y-H/2)*scale] for x,y in o['hull'] for scale in [1,1.0195]])} for o in owners]
short={'text':'風の先へ','stage':[W,H],'nativeK':k,'condition':'native single-row/no-hop/deco=true/push camera scale[1,1.0195]; full measured glyph/copy containment pending, not safe claim','bodyOnly':solve(owners,W,H)}
out={'kind':'READONLY_NATIVE_FIRST_HELD_FEASIBILITY','rawSHA256':hashlib.sha256(rawpath.read_bytes()).hexdigest(),'noNewJSBrowserExecution':True,'noSafeAdapterClaim':True,'continuousEnvelopeMeaning':'Independent convex hull over source sq[.9,1], native bounce[-.1kz,0], native hop[-.16kz,0] for all eligible original IDs; measured original polygons mapped to local coordinates. This is source-algebra feasibility with declared stock push scale endpoints, not frame-union certification.','limits':['only stock push camera fx.motion=.65/cut.motionScale=1/contentScale=1 in[1,1.0195]; other cameras unsupported by this exploration','declared chroma1.33 excludes unbounded/additional event spikes','does not certify stage/circle entry/exit','Y grid miss is not impossibility and says nothing about X translation feasibility','raw extra device guard is conservative trial support, not final writing/AA policy'],'existingActualCases':results,'fourCharacterBodySourceExample':short}
(D/'evidence/native-held-feasibility-readonly.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'cases':[{'text':r['text'],'stage':r['stage'],'scenarios':[{'chroma':s['declaredChromaMax'],'status':s['result']['status'],'offset':(s['result'].get('solution') or {}).get('offset')} for s in r['scenarios']]} for r in results],'shortFourBodyOnly':short['bodyOnly']},ensure_ascii=False))
