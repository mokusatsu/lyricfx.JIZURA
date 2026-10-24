# Independent read-only first-cell numerical diagnosis. Never imports/runs25.
from pathlib import Path
from fractions import Fraction as F
import math,json,gzip,hashlib
D=Path('/tmp/avoid009-evening-magnets25-diagnosis');P=Path('/tmp/avoid009-magnets-diagnostic21/evidence/diagnostic21.raw.json.gz');sha=lambda b:hashlib.sha256(b).hexdigest()
b=P.read_bytes();assert sha(b)=='fc582ae77d1c572329ac6b74adeef45fd72e83da59deda4804fdb671fa1ef827';v=json.loads(gzip.decompress(b))['results'][0];m=v['result'];e=m['ledger'][0];d=m['domain'];W=v['sourcePlan']['W'];H=v['sourcePlan']['H'];lo,hi=e['sourceRange'];assert e['owner']=='magnets.glyph.0.body'and e['pass']=='B'
sealPath=Path('/tmp/avoid009-evening-magnets25/evidence/seal25.json');sealBytes=sealPath.read_bytes();seal=json.loads(sealBytes)
for p in seal['files']:assert sha((sealPath.parent.parent/p['path']).read_bytes())==p['sha256']
# Independent scalar interval operations matching the stated25 contract.
def out(a,b):return(math.nextafter(a,-math.inf),math.nextafter(b,math.inf))
def add(a,b):return out(a[0]+b[0],a[1]+b[1])
def sub(a,b):return out(a[0]-b[1],a[1]-b[0])
def mul(a,b):
 z=[x*y for x in a for y in b];return out(min(z),max(z))
def p(a):return(a,a)
t=out(lo/4,hi/4);t=(max(0,min(1,t[0])),max(0,min(1,t[1])))
cam=add(p(1),mul(mul(p(.03),p(.65)),t));S=mul(add(p(1),mul(sub(cam,p(1)),p(1))),p(1))
aa=2/d['minRenderScale']+d['rootGuard']+d['arithmeticGuard'];dx=-3.4*d['chroma']*H/1080;dy=-1.3*d['chroma']*H/1080
pts=[]
for q in e['local']:
 x=add(add(p(W/2),mul(sub(p(q[0]),p(W/2)),S)),p(dx));y=add(add(p(H/2),mul(sub(p(q[1]),p(H/2)),S)),p(dy))
 x=(sub(x,p(aa))[0],add(x,p(aa))[1]);y=(sub(y,p(aa))[0],add(y,p(aa))[1]);pts.extend([[a,b]for a in x for b in y])
def cross(a,b,c):return(F(b[0])-F(a[0]))*(F(c[1])-F(a[1]))-(F(b[1])-F(a[1]))*(F(c[0])-F(a[0]))
def hull(points):
 z=sorted(set(map(tuple,points)));a=[];b=[]
 for p0 in z:
  while len(a)>=2 and cross(a[-2],a[-1],p0)<=0:a.pop()
  a.append(p0)
 for p0 in reversed(z):
  while len(b)>=2 and cross(b[-2],b[-1],p0)<=0:b.pop()
  b.append(p0)
 return a[:-1]+b[:-1]
def signed_edges(point,poly):
 return [(i,cross(poly[i-1],q,point))for i,q in enumerate(poly)]
def rational(x):return{'numerator':str(x.numerator),'denominator':str(x.denominator),'float':float(x)}
def witness(point,poly):
 i,a=min(signed_edges(point,poly),key=lambda z:z[1]);start=poly[i-1];end=poly[i];length2=(F(end[0])-F(start[0]))**2+(F(end[1])-F(start[1]))**2
 return {'point':[float(x)for x in point],'edgeIndex':i,'edgeStart':[float(x)for x in start],'edgeEnd':[float(x)for x in end],'signedCross':rational(a),'edgeLengthSquared':rational(length2),'normalizedDistanceSquared':rational(a*a/length2),'signedNormalizedDistance':math.copysign(math.sqrt(float(a*a/length2)),float(a))}
newHull=hull(pts);old=e['polygon'];outside=[witness(q,old)for q in newHull if min(x[1]for x in signed_edges(q,old))<0]
assert outside
# Exact real-coordinate old camera hull from storedFloat64 source constants,
# AA and passshift. Correlated SAME S in x/y for every endpoint.
def exact_camera(scales):
 points=[]
 for q in e['local']:
  for s in scales:
   x=F(W/2)+(F(q[0])-F(W/2))*F(s)+F(dx);y=F(H/2)+(F(q[1])-F(H/2))*F(s)+F(dy)
   for ax in [-F(aa),F(aa)]:
    for ay in [-F(aa),F(aa)]:points.append((x+ax,y+ay))
 return hull(points)
idealOld=exact_camera([1,d['cameraEnvelopeMaxScale']]);idealCell=exact_camera(S)
idealBox=[]
for q in e['local']:
 xs=[F(W/2)+(F(q[0])-F(W/2))*F(s)+F(dx)for s in S];ys=[F(H/2)+(F(q[1])-F(H/2))*F(s)+F(dy)for s in S]
 idealBox.extend([(x,y)for x in[min(xs)-F(aa),max(xs)+F(aa)]for y in[min(ys)-F(aa),max(ys)+F(aa)]])
idealBox=hull(idealBox);idealBoxFailures=[witness(q,idealOld)for q in idealBox if min(x[1]for x in signed_edges(q,idealOld))<0]
assert idealBoxFailures
assert all(min(x[1]for x in signed_edges(q,idealOld))>=0 for q in idealCell)
# How far can stored-old JS rounded vertices diverge from their exact ideal hull?
storedOldEscapes=[witness(q,idealOld)for q in old if min(x[1]for x in signed_edges(q,idealOld))<0]
# Exact old ideal may very slightly escape rounded stored-old due arithmetic.
idealOldEscapes=[witness(q,old)for q in idealOld if min(x[1]for x in signed_edges(q,old))<0]
result={'status':'read-only numerical failure diagnosis; no source25 change/fallback','input21SHA':sha(b),'sealed25SHA':sha(sealBytes),'cell':{'owner':e['owner'],'pass':e['pass'],'sourceRange':e['sourceRange'],'local':e['local']},'scaleInterval25':S,'aaGuardUnchanged':aa,'passShift':[dx,dy],'oldStoredHull':old,'newIntervalBoxHull':newHull,'outsideStoredOld':outside,'exactIdealIntervalBoxOutsideExactIdealOld':idealBoxFailures,'exactCorrelatedCellHullInsideExactIdealOld':True,'storedOldEscapesExactIdealOld':storedOldEscapes,'exactIdealOldEscapesStoredOld':idealOldEscapes,'conclusion':'STRUCTURAL correlation loss: independently taking x/y interval extrema permits different S per coordinate. Exact-rational no-roundoff interval boxes also leave exact full-camera hull. Float64 outward roundoff is additional small effect, not sufficient explanation.','fallbackImplemented':False,'productChanged':False}
assert sealPath.read_bytes()==sealBytes
outpath=D/'diagnosis25.json';assert not outpath.exists();outpath.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'result':str(outpath),'outsidePoints':len(outside),'maxStoredEscapeDistance':max(-x['signedNormalizedDistance']for x in outside),'maxIdealBoxEscapeDistance':max(-x['signedNormalizedDistance']for x in idealBoxFailures),'maxOldRoundoffEscapeDistance':max([-x['signedNormalizedDistance']for x in storedOldEscapes+idealOldEscapes]or[0]),'structural':True,'sealed25Unchanged':True}))
