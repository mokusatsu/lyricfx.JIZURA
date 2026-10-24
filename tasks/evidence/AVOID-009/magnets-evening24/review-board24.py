from pathlib import Path
import json,gzip,math,hashlib
from fractions import Fraction as F
from functools import lru_cache
B=Path('/tmp/avoid009-evening-magnets24/evidence/board24.raw.json.gz');old=json.load(gzip.open('/tmp/avoid009-magnets-family23/evidence/family23.raw.json.gz'));p=json.load(gzip.open('/tmp/avoid009-magnets-diagnostic21/evidence/diagnostic21.raw.json.gz'))['results'][0];a=json.load(gzip.open(B));g=p['result']['sourceCatalog'];d=p['result']['domain'];W,H=p['sourcePlan']['W'],p['sourcePlan']['H'];m=a['boardModel'];mx,my=W*.04,H*.05;bw,bh=W-mx*2,H-my*2;r=min(min(W,H)*.03,bw/2,bh/2);slide=H*.04;guard=2/d['minRenderScale']+d['rootGuard']+d['arithmeticGuard'];assert guard==m['guard'] and 0<=guard<r and bh-slide>=2*r
Q=[F(mx)+F(r),F(my)+F(slide)+F(r),F(mx)+F(bw)-F(r),F(my)+F(bh)-F(r)];rr=F(r)-F(guard);rad2=rr*rr
for exact,interval in zip(Q,m['coreIntervals']):assert F(interval[0])<=exact<=F(interval[1])
assert F(m['erodedRadiusInterval'][0])<=rr<=F(m['erodedRadiusInterval'][1]);assert Q[0]<F(W/2)<Q[2] and Q[1]<F(H/2)<Q[3]
@lru_cache(None)
def inside(x,y):
 x,y=F(x),F(y);dx=max(F(0),Q[0]-x,x-Q[2]);dy=max(F(0),Q[1]-y,y-Q[3]);return dx*dx+dy*dy<=rad2
counts={'candidates':0,'supports':0,'vertices':0,'arithmeticCases':0};recovered=0
assert len(old['attempts'])==len(a['attempts'])==486
for before,after in zip(old['attempts'],a['attempts']):
 assert before['leftDelta']==after['leftDelta'] and before['rightDelta']==after['rightDelta'];expected=0;states={'contained':0,'outside':0,'inconclusive':0};totalverts=0;first=None
 for e in p['result']['ledger']:
  dx,dy=after['leftDelta']if e['q']<2 else after['rightDelta'];poly=[[v[0]+dx,v[1]+dy]for v in e['polygon']];results=[inside(x,y)for x,y in poly];totalverts+=len(poly);counts['vertices']+=len(poly);counts['supports']+=1
  state='contained'if all(results)else'outside';states[state]+=1
  if state=='outside':
   expected+=1
   if first is None:first={'owner':e['owner'],'pass':e['pass'],'range':e['sourceRange']}
 assert after['counts']['board']==expected,(after['leftDelta'],after['rightDelta'],after['counts']['board'],expected);assert after['boardSupportStates']==states;assert after['boardVerticesTested']==totalverts;assert after['worst'].get('board')==first
 for key in before['counts']:
  if key!='board':assert before['counts'][key]==after['counts'][key]and before['worst'].get(key)==after['worst'].get(key)
 assert before['counts']['board']>=expected;recovered+=before['counts']['board']-expected;assert after['candidateOnly']==all(v==0 for k,v in after['counts'].items()if k!='sourceBandPolicyOnly');assert after['certificate']is False;counts['candidates']+=1
for c in a['boardArithmeticContractCases']:
 x,y=map(F,c['point']);dx=max(F(0),-x,x-10);dy=max(F(0),-y,y-10);dist=dx*dx+dy*dy;assert F(c['distanceSquared'][0])<=dist<=F(c['distanceSquared'][1]);assert F(c['radiusSquared'][0])<=25<=F(c['radiusSquared'][1]);assert c['state']!='contained'or dist<=25;assert c['state']!='outside'or dist>25;counts['arithmeticCases']+=1
out={'kind':'parent-independent-exact-rational-board24-review','rawSHA256':hashlib.sha256(B.read_bytes()).hexdigest(),'counts':counts,'uniqueExactVertexCalculations':inside.cache_info().misses,'oldBoardFalseRejectionsRemoved':recovered,'candidateCount':sum(c['candidateOnly']for c in a['attempts']),'boardGuardUnchanged':True,'otherConstraintCountsAndWorstExact23':True,'exactFractionMembershipMatchesAllProductionStates':True,'noAdapterOrCertificate':True,'parentImages':0,'publicChecks':0};Path('/tmp/avoid009-evening-parent/parent-board24-review.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
