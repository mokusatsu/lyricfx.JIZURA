"""SOURCE24 only: conservative directed Float64 rounded-board containment."""
import math
from fractions import Fraction

# Every operation below encloses exact real arithmetic on its Float64 inputs.
# No arbitrary epsilon, sqrt, AABB-center test, or radius clamp is used.
def point(x):
 assert math.isfinite(x) and abs(x)<=1e8
 return (x,x)
def outward(lo,hi):
 assert math.isfinite(lo) and math.isfinite(hi) and lo<=hi
 return (math.nextafter(lo,-math.inf),math.nextafter(hi,math.inf))
def add(a,b):return outward(a[0]+b[0],a[1]+b[1])
def sub(a,b):return outward(a[0]-b[1],a[1]-b[0])
def square_nonnegative(a):
 assert 0<=a[0]<=a[1]<1e8
 lo,hi=outward(a[0]*a[0],a[1]*a[1])
 return (max(0,lo),hi)
def maximum(*args):return (max(a[0]for a in args),max(a[1]for a in args))

def classify_vertex(p,core,radius):
 assert len(p)==2
 x,y=map(point,p);x0,y0,x1,y1=core
 dx=maximum(point(0),sub(x0,x),sub(x,x1))
 dy=maximum(point(0),sub(y0,y),sub(y,y1))
 distance2=add(square_nonnegative(dx),square_nonnegative(dy))
 limit2=square_nonnegative(radius)
 state='contained' if distance2[1]<=limit2[0] else 'outside' if distance2[0]>limit2[1] else 'inconclusive'
 return {'state':state,'distanceSquared':distance2,'radiusSquared':limit2}

def classify_polygon(poly,core,radius):
 # Test EVERY already-guarded PRIMARY vertex, even following first rejection.
 results=[classify_vertex(p,core,radius)for p in poly]
 assert results
 states=[r['state']for r in results]
 state='outside' if 'outside'in states else 'inconclusive' if 'inconclusive'in states else 'contained'
 first=next(({'vertex':i,**r}for i,r in enumerate(results)if r['state']!='contained'),None)
 return {'state':state,'firstRejectedVertex':first,'verticesTested':len(poly),'vertexStates':{k:states.count(k)for k in ['contained','outside','inconclusive']}}

def geometry(W,H,g,d):
 # These scalar assignments reproduce original JS evaluation order.
 mx=W*.04;my=H*.05;bw=W-mx*2;bh=H-my*2;rr=min(W,H)*.03;r=min(rr,bw/2,bh/2)
 assert g['scene']['board']['x']==mx and g['scene']['board']['w']==bw and g['scene']['board']['h']==bh and g['scene']['board']['r']==rr
 guard=2/d['minRenderScale']+d['rootGuard']+d['arithmeticGuard']
 slide=H*.04
 assert 0<=guard<r and bh-slide>=2*r
 # Q intervals enclose real sum/difference of the stored source constants.
 # Source slide/arc/root coordinate roundoff is covered by unchanged existing
 # arithmeticGuard within g. Interval arithmetic adds conservative uncertainty.
 P=point
 core=(add(P(mx),P(r)),add(add(P(my),P(slide)),P(r)),sub(add(P(mx),P(bw)),P(r)),sub(add(P(my),P(bh)),P(r)))
 radius=sub(P(r),P(guard));assert radius[0]>0
 assert core[0][1]<W/2<core[2][0] and core[1][1]<H/2<core[3][0]
 return core,radius,{'mx':mx,'my':my,'bw':bw,'bh':bh,'sourceRadius':rr,'clampedRadius':r,'slideMaximum':slide,'guard':guard,'coreIntervals':core,'erodedRadiusInterval':radius,'status':'diagnostic-only','sourceCoordinateRoundoffAllowance':d['arithmeticGuard']}

def contract_cases():
 # Exact rational oracle is only for these declared fixtures, never a model
 # substitution. Integer core/radius give exact straight and 3-4-5 corners.
 core=tuple(point(x)for x in [0.,0.,10.,10.]);radius=point(5.)
 cases=[('interior',[5.,5.]),('straight-edge',[-5.,5.]),('straight-inside-ULP',[math.nextafter(-5.,math.inf),5.]),('straight-outside-ULP',[math.nextafter(-5.,-math.inf),5.]),('corner-exact',[-3.,-4.]),('corner-inside-ULP',[-3.,math.nextafter(-4.,math.inf)]),('corner-outside-ULP',[-3.,math.nextafter(-4.,-math.inf)]),('clear-outside',[-6.,5.]),('straight-clear-inside',[-4.,5.])]
 receipts=[]
 for name,p in cases:
  x,y=map(Fraction,p);dx=max(Fraction(0),-x,x-10);dy=max(Fraction(0),-y,y-10);exact=dx*dx+dy*dy;oracle='inside'if exact<25 else 'boundary'if exact==25 else 'outside';r=classify_vertex(p,core,radius)
  assert Fraction(r['distanceSquared'][0])<=exact<=Fraction(r['distanceSquared'][1])
  assert Fraction(r['radiusSquared'][0])<=25<=Fraction(r['radiusSquared'][1])
  assert r['state']!='contained' or exact<=25
  assert r['state']!='outside' or exact>25
  if name in ['interior','straight-clear-inside']:assert r['state']=='contained'
  if name=='clear-outside':assert r['state']=='outside'
  # Near-boundary cases may be inconclusive, never forced inside for a pass.
  receipts.append({'name':name,'point':p,'exactOracle':oracle,**r})
 return receipts
