from fractions import Fraction as F
from pathlib import Path
import json,math,hashlib
source=Path('/tmp/avoid009-pile01/physical08/run01/raw.json');raw=json.loads(source.read_text());rows=[]
def rational(x):return F.from_float(x)
def inward(x,up):
 y=float(x)
 if (rational(y)<x if up else rational(y)>x):y=math.nextafter(y,math.inf if up else -math.inf)
 return y
for pair in raw['rows']:
 for e in pair['08']['trials']:
  t=e['trial'];r=t['recipe'];split=r.get('rowReflow')
  if not split:continue
  proof=e['correlated'];size=t['source']['size'];cap=rational(.04*size);runs=[]
  for run in split['runs']:
   owners=[q for q in proof['candidate']['rows'] if q['owner'] in run['sourceIDs']];Ls=[];Us=[]
   for c in owners:
    n=next(q for q in proof['native']['rows'] if q['owner']==c['owner']);Ls.append(-rational(n['gapBudget'])-rational(.03*size)-rational(c['clearance'][0]));Us.append(rational(n['penetrationBudget'])+rational(.01*size)-rational(c['clearance'][1]))
   L=max([-cap]+Ls);U=min([cap]+Us);lo=inward(L,True);hi=inward(U,False);ok=lo<=hi;dy=0 if lo<=0<=hi else lo/2+hi/2
   if ok:
    assert rational(dy)>=L and rational(dy)<=U
    for c in owners:
     n=next(q for q in proof['native']['rows'] if q['owner']==c['owner']);assert rational(c['clearance'][0])+rational(dy)>=-rational(n['gapBudget'])-rational(.03*size);assert rational(c['clearance'][1])+rational(dy)<=rational(n['penetrationBudget'])+rational(.01*size)
   runs.append(dict(run=run['run'],owners=[q['owner'] for q in owners],innerInterval=[lo,hi],nonempty=ok,proposedDy=dy,cap=float(cap)))
  rows.append(dict(case=pair['id'],recipe=e['id'],runs=runs))
result={'scope':'READONLY09 exactrationaldesign analysis of accepted08projectionbudgetvalues, notphysicalimplementation/Safe/quality acceptance','sourceRawSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'rows':rows,'rounding':'Fraction.from_float exact coefficients/operands; directed inner interval endpoints; 0ifinside otherwiseinteriormidpoint. Actual09must recompute full proof after groupY applied.'};Path('/tmp/parent-pile-groupY-design09.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
