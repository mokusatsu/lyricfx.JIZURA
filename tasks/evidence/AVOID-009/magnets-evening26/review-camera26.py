from pathlib import Path
import json,gzip,math,hashlib
from fractions import Fraction as F
from functools import lru_cache
P21=Path('/tmp/avoid009-magnets-diagnostic21/evidence/diagnostic21.raw.json.gz');B=Path('/tmp/avoid009-evening-magnets26/evidence/camera26.raw.json.gz');base=json.load(gzip.open(P21))['results'][0];raw=json.load(gzip.open(B));model=base['result'];D=model['domain'];plan=base['sourcePlan'];cut=model['sourceCutSnapshot'];old=model['ledger'];new=raw['ledger'];C={};nearMax=0

def inc(k,n=1):C[k]=C.get(k,0)+n

def out(a,b):return math.nextafter(a,-math.inf),math.nextafter(b,math.inf)
def add(a,b):return out(a[0]+b[0],a[1]+b[1])
def sub(a,b):return out(a[0]-b[1],a[1]-b[0])
def mul(a,b):
 v=[x*y for x in a for y in b];return out(min(v),max(v))
def point(x):return x,x

def interval(lo,hi):
 q=out(lo/4,hi/4);q=max(0,min(1,q[0])),max(0,min(1,q[1]));cam=add(point(1),mul(mul(point(.03),point(.65)),q));return mul(add(point(1),mul(sub(cam,point(1)),point(1))),point(1))
def scale(t):return 1+((1+.03*.65*max(0,min(1,t/4)))-1)

def cross(a,b,c):return(F(b[0])-F(a[0]))*(F(c[1])-F(a[1]))-(F(b[1])-F(a[1]))*(F(c[0])-F(a[0]))
def inside(p,poly):return all(cross(poly[i-1],q,p)>=0 for i,q in enumerate(poly))
def hull(p):
 p=sorted(set(tuple(x)for x in p));a=[];b=[]
 for q in p:
  while len(a)>1 and cross(a[-2],a[-1],q)<=0:a.pop()
  a.append(q)
 for q in p[::-1]:
  while len(b)>1 and cross(b[-2],b[-1],q)<=0:b.pop()
  b.append(q)
 return[list(q)for q in a[:-1]+b[:-1]]

def projected(e,S):
 aa=2/D['minRenderScale']+D['rootGuard']+D['arithmeticGuard'];pas=next(x for x in D['passes']if x['pass']==e['pass']);dx=pas['off'][0]*D['chroma']*540/1080;dy=pas['off'][1]*D['chroma']*540/1080;pts=[];ideal=[]
 for x,y in e['local']:
  for s in S:
   xx=add(add(point(480),mul(sub(point(x),point(480)),point(s))),point(dx));yy=add(add(point(270),mul(sub(point(y),point(270)),point(s))),point(dy));xx=sub(xx,point(aa))[0],add(xx,point(aa))[1];yy=sub(yy,point(aa))[0],add(yy,point(aa))[1];pts.extend([[a,b]for a in xx for b in yy])
   fx=F(480)+(F(x)-480)*F(s)+F(dx);fy=F(270)+(F(y)-270)*F(s)+F(dy)
   ideal.extend([(fx+a,fy+b)for a in[-F(aa),F(aa)]for b in[-F(aa),F(aa)]])
 return hull(pts),ideal
modes={};assert len(new)==len(old)==1324
for o,n in zip(old,new):
 for k in ['owner','q','part','pass','sourceRange','realRange','entry','sizeRange','liftRange','local']:assert o[k]==n[k],k
 S=interval(*o['sourceRange']);assert list(S)==n['scaleInterval'];assert S[0]<=scale(o['sourceRange'][0])<=scale(o['sourceRange'][1])<=S[1];inc('sourceScaleIntervals')
 prop,ideal=projected(o,S);ref=n['cameraRefinement'];assert prop==ref['proposedPolygon'];assert all(inside(q,prop)for q in ideal);inc('exactIdealEndpointPlusAAContainment',len(ideal))
 subset=all(inside(q,o['polygon'])for q in prop);mode='correlated-endpoint-refinement'if subset else'accepted21-fallback';assert ref['selectedMode']==mode;assert n['polygon']==(prop if subset else o['polygon']);assert all(inside(q,o['polygon'])for q in n['polygon']);modes[mode]=modes.get(mode,0)+1;inc('selectedSupports')
 if not subset:
  w=ref['proposedOldSubsetViolation'];p=prop[w['proposedVertex']];edge=w['oldEdge'];a=o['polygon'][edge-1];b=o['polygon'][edge];v=cross(a,b,p);assert v<0;assert v==F(int(w['signedCross']['numerator']),int(w['signedCross']['denominator']));l2=(F(b[0])-F(a[0]))**2+(F(b[1])-F(a[1]))**2;assert v*v/l2==F(int(w['normalizedDistanceSquared']['numerator']),int(w['normalizedDistanceSquared']['denominator']));inc('exactFallbackWitnesses')
assert modes==raw['selectedModeCounts']
# Existing actual native observations, now against precisely selected new/old supports.
for frame in base['actual']:
 assert scale(frame['lt'])==frame['cs'];inc('nativeProgramCameraChecks')
 for item in frame['events']:
  ev=item['event'];points=item['physical']
  if not frame['ownSelectorActive']:continue
  if ev['role']=='primary':
   hits=[e for e in new if e['owner']==ev['owner']and e['pass']==frame['pass']and e['sourceRange'][0]<=frame['lt']<=e['sourceRange'][1]];assert len(hits)==1;poly=hits[0]['polygon'];assert hits[0]['scaleInterval'][0]<=frame['cs']<=hits[0]['scaleInterval'][1];kind='actualPrimaryVertices'
  elif ev['kind']=='item'or ev['owner']=='magnets.scene.handle':poly=next(e['polygon']for e in model['obstacles']if e['owner']==ev['owner']);kind='actualObstacleVertices'
  else:continue
  for pt in points:assert inside(pt,poly);inc(kind)
for f in base['cameraProbes']:
 assert scale(f['lt'])==f['cs'];S=interval(f['lt'],f['lt']);assert S[0]<=f['cs']<=S[1];s=f['scale'];dx,dy=f['actualPassShift'];expected=[s*f['cs'],0,0,s*f['cs'],s*(480+dx-480*f['cs']),s*(270+dy-270*f['cs'])];assert expected==f['expected'];assert max(abs(x-y)for x,y in zip(expected,f['root']))<=D['rootGuard']*s;inc('actualRendererRootProbes')
# Rounded board exact-rational membership; all other categories independently computed.
mx,my=960*.04,540*.05;bw,bh=960-2*mx,540-2*my;r=540*.03;g=2/D['minRenderScale']+D['rootGuard']+D['arithmeticGuard'];Q=[F(mx)+F(r),F(my)+F(540*.04)+F(r),F(mx)+F(bw)-F(r),F(my)+F(bh)-F(r)];rr=(F(r)-F(g))**2
@lru_cache(None)
def board(x,y):
 x,y=F(x),F(y);dx=max(F(0),Q[0]-x,x-Q[2]);dy=max(F(0),Q[1]-y,y-Q[3]);return dx*dx+dy*dy<=rr

def box(p):return[min(x[0]for x in p),min(x[1]for x in p),max(x[0]for x in p),max(x[1]for x in p)]
def overlap(a,b):return a[0]<=b[2]and a[2]>=b[0]and a[1]<=b[3]and a[3]>=b[1]
def circle_clear(poly):
 p=[480,226.8];R=110.7;signs=[]
 for a,b in zip(poly,poly[1:]+poly[:1]):
  signs.append((b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]));dx,dy=b[0]-a[0],b[1]-a[1];length=dx*dx+dy*dy;t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/length))if length else 0
  if math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)<=R:return False
 return not(min(signs)>=0 or max(signs)<=0)
obs=[box(e['polygon'])for e in model['obstacles']];band=model['sourceCatalog']['band'];assert len(raw['attempts'])==486
for att in raw['attempts']:
 counts=dict.fromkeys(att['counts'],0);states={'contained':0,'outside':0,'inconclusive':0};vs=0
 for e in new:
  dx,dy=att['leftDelta']if e['q']<2 else att['rightDelta'];poly=[[x+dx,y+dy]for x,y in e['polygon']];b=box(poly);onboard=all(board(x,y)for x,y in poly);states['contained'if onboard else'outside']+=1;vs+=len(poly);bad={'circle':not circle_clear(poly),'globalStage':b[0]<0 or b[2]>960 or b[1]<0 or b[3]>540,'board':not onboard,'handle':overlap(b,obs[0]),'decoys':any(overlap(b,o)for o in obs[1:]),'sourceBandPolicyOnly':b[1]<band['y0']or b[3]>band['y1']}
  for k,val in bad.items():counts[k]+=val
 assert counts==att['counts'],(att['leftDelta'],att['rightDelta'],counts,att['counts']);assert states==att['boardSupportStates'];assert vs==att['boardVerticesTested'];assert att['candidateOnly']==all(x==0 for k,x in counts.items()if k!='sourceBandPolicyOnly');inc('independentCandidateConstraintSets')
out={'kind':'parent-independent-camera26-review','rawSHA256':hashlib.sha256(B.read_bytes()).hexdigest(),'counts':C,'selectedModes':modes,'source26ProposedIdealEndpointEnclosureVerified':True,'allSelectedHullsExactSubsetOld':True,'allFallbackWitnessFractionsVerified':True,'allSource21LocalMetadataPreserved':True,'all8736NativeVerticesAnd54RootsPass':True,'candidateCount':sum(x['candidateOnly']for x in raw['attempts']),'noAdapterOrCertificate':True,'parentImages':0,'publicChecks':0};Path('/tmp/avoid009-evening-parent/parent-camera26-review.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
