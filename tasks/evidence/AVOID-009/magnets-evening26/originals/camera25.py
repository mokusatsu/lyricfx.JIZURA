"""Primary camera only. No source/phase/local/obstacle changes."""
import math
from fractions import Fraction as F
from board24 import point as P,add,sub,outward

def mul(a,b):
 q=[x*y for x in a for y in b];return outward(min(q),max(q))
def divide_positive(a,b):
 assert b[0]>0
 q=[x/y for x in a for y in b];return outward(min(q),max(q))
def clamp01(a):return(max(0,min(1,a[0])),max(0,min(1,a[1])))
def scale_interval(lo,hi,d,cut):
 assert 0<=lo<=hi<=d['sourceExpiryUpperBound']+d['step'] and cut['dur']==4 and cut['motionScale']==cut['contentScale']==1
 assert d['motion']==d['base']==1 and d['effectiveMotion']==.65
 # Exact source order: 1 + (.03*FX.motion)*clamp(lt/max(.3,dur));
 # followed by lerp(1,s,motion)*contentScale. Every op outward encloses
 # actual Float64 op; no substituting a real-linear simplified formula.
 t=clamp01(divide_positive((lo,hi),P(max(.3,cut['dur']))))
 cam=add(P(1),mul(mul(P(.03),P(d['effectiveMotion'])),t))
 cs=mul(add(P(1),mul(sub(cam,P(1)),P(cut['motionScale']))),P(cut['contentScale']))
 assert 1-1e-12<=cs[0]<=cs[1]<d['cameraEnvelopeMaxScale']
 return cs

def cross(a,b,c):return (F(b[0])-F(a[0]))*(F(c[1])-F(a[1]))-(F(b[1])-F(a[1]))*(F(c[0])-F(a[0]))
def hull(points):
 points=sorted(set(map(tuple,points)));assert len(points)>=3
 lo=[];hi=[]
 for p in points:
  while len(lo)>=2 and cross(lo[-2],lo[-1],p)<=0:lo.pop()
  lo.append(p)
 for p in reversed(points):
  while len(hi)>=2 and cross(hi[-2],hi[-1],p)<=0:hi.pop()
  hi.append(p)
 return [list(p)for p in lo[:-1]+hi[:-1]]
def contained(p,poly):return all(cross(poly[i-1],q,p)>=0 for i,q in enumerate(poly))

def camera_support(e,plan,d):
 assert 0<=e['sourceRange'][0]<=e['sourceRange'][1]<plan['cuts'][0]['dur']
 W,H=plan['W'],plan['H'];S=scale_interval(*e['sourceRange'],d,plan['cuts'][0]);aa=2/d['minRenderScale']+d['rootGuard']+d['arithmeticGuard']
 p=next(x for x in d['passes']if x['pass']==e['pass'])
 # Exact old21 shift Float64 order unchanged. Widen arithmetic on the
 # scalar shift only at final interval map; retain literal old value.
 dx=p['off'][0]*d['chroma']*H/1080*d['motion'];dy=p['off'][1]*d['chroma']*H/1080*d['motion']
 points=[]
 for q in e['local']:
  assert max(map(abs,q))<=d['coordinateCeiling']
  x=add(add(P(W/2),mul(sub(P(q[0]),P(W/2)),S)),P(dx))
  y=add(add(P(H/2),mul(sub(P(q[1]),P(H/2)),S)),P(dy))
  x=(sub(x,P(aa))[0],add(x,P(aa))[1]);y=(sub(y,P(aa))[0],add(y,P(aa))[1])
  points.extend([[a,b]for a in x for b in y])
 poly=hull(points)
 # Exact halfspaces, zero slack. Original21 hull is immutable fallback;
 # a numeric-guard escape rejects the refinement rather than clipping it.
 assert all(contained(p,e['polygon'])for p in poly),('NEW_HULL_NOT_SUBSET_OLD',e['owner'],e['pass'],e['sourceRange'])
 return poly,S,{'aaGuardUnchanged':aa,'passShiftUnchanged':[dx,dy],'newHullVertices':len(poly),'oldSubsetExactFraction':True}

def source_scale(lt,cut,effective_motion):
 t=max(0,min(1,lt/max(.3,cut['dur'])))
 cam=1+.03*effective_motion*t
 cs=(1+(cam-1)*cut['motionScale'])*cut['contentScale']
 return cam,cs

def audit_actual(v,ledger,d):
 receipts=[];primary=obstacle=0;inactive=0;cut=v['result']['sourceCutSnapshot'];W=v['sourcePlan']['W'];H=v['sourcePlan']['H']
 for i,p in enumerate(v['actual']):
  assert p['actualEffectiveFX']['motion']==d['effectiveMotion']
  cam,cs=source_scale(p['lt'],cut,p['actualEffectiveFX']['motion']);assert cam==p['cam']['s'] and cs==p['cs']
  matches=0;vertices=0
  for wrapped in p['events']:
   event=wrapped['event'];points=wrapped['physical']
   if not p['ownSelectorActive']:
    if event['role']=='primary':inactive+=len(points)
    continue
   if event['role']=='primary':
    hits=[s for s in ledger if s['owner']==event['owner']and s['pass']==p['pass']and s['sourceRange'][0]<=p['lt']<=s['sourceRange'][1]]
    assert len(hits)==1,(i,event['owner'],len(hits));support=hits[0];assert support['scaleInterval'][0]<=cs<=support['scaleInterval'][1]
    assert all(contained(q,support['polygon'])for q in points),(i,event['owner'],'PRIMARY_CONTAINMENT')
    primary+=len(points);vertices+=len(points);matches+=1
   elif event['kind']=='item'or event['owner']=='magnets.scene.handle':
    hits=[s for s in v['result']['obstacles']if s['owner']==event['owner']];assert len(hits)==1
    assert all(contained(q,hits[0]['polygon'])for q in points),(i,event['owner'],'OLD_OBSTACLE_CONTAINMENT')
    obstacle+=len(points);vertices+=len(points)
  receipts.append({'program':i,'pass':p['pass'],'lt':p['lt'],'scale':p['scale'],'ownSelectorActive':p['ownSelectorActive'],'primaryExactlyOneSupportEvents':matches,'targetVerticesContained':vertices,'sourceCameraExact':True})
 roots=[]
 for i,p in enumerate(v['cameraProbes']):
  assert p['actualFX']['motion']==d['effectiveMotion']
  cam,cs=source_scale(p['lt'],cut,p['actualFX']['motion']);assert cam==p['cam']['s']and cs==p['cs']
  # Root-only clocks also use exact clamped source interval, no phase waiver.
  S=scale_interval(p['lt'],p['lt'],d,cut);assert S[0]<=cs<=S[1]
  off=next(x['off']for x in d['passes']if x['pass']==p['pass']);dx=off[0]*d['chroma']*H/1080*d['motion'];dy=off[1]*d['chroma']*H/1080*d['motion'];assert p['actualPassShift']==[dx,dy]
  scale=p['scale'];expected=[scale*cs,0,0,scale*cs,scale*(W/2+dx-W/2*cs),scale*(H/2+dy-H/2*cs)]
  assert expected==p['expected'];residual=max(abs(a-b)for a,b in zip(p['root'],expected));assert residual<=d['rootGuard']*scale
  roots.append({'probe':i,'pass':p['pass'],'lt':p['lt'],'scale':scale,'scaleInterval':S,'sourceCameraExact':True,'residual':residual,'rootGuard':d['rootGuard']*scale})
 assert len(receipts)==126 and primary==3648 and obstacle==5088 and primary+obstacle==8736 and inactive==288 and len(roots)==54
 return {'programs':receipts,'roots':roots,'primaryVertices':primary,'unchangedObstacleVertices':obstacle,'targetVertices':primary+obstacle,'inactivePrimaryVerticesUnclaimed':inactive,'allContainmentExactFraction':True}
