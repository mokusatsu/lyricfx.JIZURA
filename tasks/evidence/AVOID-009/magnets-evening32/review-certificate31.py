import gzip,json,math,sys,hashlib
from pathlib import Path
from fractions import Fraction as F
sys.path.insert(0,'/tmp/avoid009-evening-magnets24')
from board24 import geometry,classify_polygon
rawPath=Path('/workspace/lyricfx.JIZURA/tasks/evidence/AVOID-009/magnets-evening31-failed/adapter31.raw.json.gz')
r=json.load(gzip.open(rawPath,'rt'))['results'][0]['partial'];c=r['certificate']
old=json.load(gzip.open('/tmp/avoid009-magnets-diagnostic21/evidence/diagnostic21.raw.json.gz','rt'))['results'][0]['result']
core,rad,_=geometry(960,540,c['sourceCatalog'],c['domain'])
assert c['domain']['rootOperationBudget']==128 and c['domain']['rootGuard']>old['domain']['rootGuard']
assert len(c['ledger'])==1324 and len(c['obstacles'])==17
for a,b in zip(c['ledger'],old['ledger']):
 for k in ['owner','q','part','pass','sourceRange','entry','sizeRange','liftRange','local']:assert a[k]==b[k],k
assert c['recipe']=={'kind':'two-group-stage','left':[-144,27],'right':[144,27],'qGroups':[[0,1],[2,3]]}
def bounds(poly):return min(v[0]for v in poly),min(v[1]for v in poly),max(v[0]for v in poly),max(v[1]for v in poly)
def hit(a,b):return a[0]<=b[2]and a[2]>=b[0]and a[1]<=b[3]and a[3]>=b[1]
obs=[bounds(o['polygon'])for o in c['obstacles']];C=(F(480),F(226.8));limit=F(108+2.7)**2
count={k:0 for k in ['circle','globalStage','board','handle','decoys','entryHandle','entryDecoys','heldHandle','heldDecoys','sourceBandPolicyOnly']};vertices=0;minGap=1e9
for e in c['ledger']:
 dx,dy=c['recipe']['left']if e['q']<2 else c['recipe']['right'];poly=[[x+dx,y+dy]for x,y in e['polygon']];b=bounds(poly);fp=[(F(x),F(y))for x,y in poly];cross=[];nearest=None
 for (ax,ay),(bx,by)in zip(fp,fp[1:]+fp[:1]):
  vx,vy=bx-ax,by-ay;wx,wy=C[0]-ax,C[1]-ay;cross.append(vx*wy-vy*wx);length=vx*vx+vy*vy;t=min(F(1),max(F(0),(wx*vx+wy*vy)/length))if length else F(0);dd=(wx-t*vx)**2+(wy-t*vy)**2;nearest=dd if nearest is None else min(nearest,dd)
 bad=all(z>=0 for z in cross)or nearest<=limit;count['circle']+=bad;minGap=min(minGap,math.sqrt(float(nearest))-(108+2.7))
 count['globalStage']+=b[0]<0 or b[1]<0 or b[2]>960 or b[3]>540;count['board']+=classify_polygon(poly,core,rad)['state']!='contained'
 h=hit(b,obs[0]);d=any(hit(b,v)for v in obs[1:]);count['handle']+=h;count['decoys']+=d;count['entryHandle']+=e['entry']and h;count['entryDecoys']+=e['entry']and d;count['heldHandle']+=not e['entry']and h;count['heldDecoys']+=not e['entry']and d;count['sourceBandPolicyOnly']+=b[1]<c['sourceCatalog']['band']['y0']or b[3]>c['sourceCatalog']['band']['y1'];vertices+=len(poly)
assert count==c['selectedCounts'];assert all(count[k]==0 for k in ['circle','globalStage','board','heldHandle','heldDecoys']);assert c['retentionTail']['sourceExpiryUpperBound']<4.150001
result={'status':'PARENT_ACCEPTED_SELECTED_CONTINUOUS_CERTIFICATE_MATH_ONLY','inputRawSHA256':hashlib.sha256(rawPath.read_bytes()).hexdigest(),'fullRunnerPassed':False,'sourceRootBudget':128,'newGuard':c['domain']['rootGuard'],'sourceLocalMetadataExactOld21':True,'supports':1324,'selectedVertices':vertices,'circleNearestExactFraction':True,'minimumCircleExtraClearance':minGap,'boardIndependentDirectedAndExactOracle':True,'recomputedCounts':count,'recipe':c['recipe'],'selectedLedgerSHA256':hashlib.sha256(json.dumps(c['ledger'],separators=(',',':'),ensure_ascii=False).encode()).hexdigest(),'limits':'Source31 whole run failed. Only continuous selected certificate math accepted; all-frame/native fidelity/cache/visual/performance remain pending.','publicChecks':0}
Path('/tmp/avoid009-evening-parent/parent-certificate31-math-review.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
