import json,math,pathlib
raw=json.loads(pathlib.Path('/tmp/avoid009-pile01/physical07/run02/raw.json').read_text());output=[]
def hull(points):
 p=sorted(set(tuple(v) for v in points))
 def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
 lo=[];hi=[]
 for a in p:
  while len(lo)>1 and cross(lo[-2],lo[-1],a)<=0:lo.pop()
  lo.append(a)
 for a in p[::-1]:
  while len(hi)>1 and cross(hi[-2],hi[-1],a)<=0:hi.pop()
  hi.append(a)
 return lo[:-1]+hi[:-1]
def slab(poly,x,lower):
 out=[]
 for a,b in zip(poly,poly[1:]+poly[:1]):
  A=a[0]>=x if lower else a[0]<=x;B=b[0]>=x if lower else b[0]<=x
  if A:out.append(a)
  if A!=B:
   t=(x-a[0])/(b[0]-a[0]);out.append((x,a[1]+t*(b[1]-a[1])))
 return out
for pair in raw['rows']:
 for e in pair['07']['trials']:
  t=e['trial'];g=t['source'];results={}
  for key in ['nativeLedger','candidateLedger']:
   ledger=t[key];rows=[];metrics={(m['font'],m['ch'],m['size']):m for m in t['nativeDiagnostic']['metrics']}
   for q in ledger['rows']:
    src=next(v for v in g['slots'] if v['id']==q['owner']);metric=metrics[g['params']['font'],src['ch'],g['size']];a=q['tilt']*math.pi/180;c,s=math.cos(a),math.sin(a)
    x=src['gxp'];r=t['recipe'];phys=key=='candidateLedger' and r['mode']=='physical'
    if phys:x=r['c']+(x-r['c0'])+r.get('rowReflow',{}).get('slots',[{}]*len(g['slots']))[src['slot']].get('offset',0)
    pts=ledger['bodyTop'];ymat=None
    if phys:
     xx=r['c0']+(x-r['c'])/r['a'];ymat=r['B']-r['Hm']/(1+((x-r['c'])/r['sigma'])**4)+r['beta']*(math.sin(xx/g['W']*17+g['seed']%7)*g['H']*.006+math.sin(xx/g['W']*31+g['seed']%5)*g['H']*.004)
    else:ymat=g['yBase']-g['Hm']/(1+((x-g['cx'])/g['sig'])**4)+math.sin(x/g['W']*17+g['seed']%7)*g['H']*.006+math.sin(x/g['W']*31+g['seed']%5)*g['H']*.004
    rest=ymat-g['size']*(.47+.98*src['layer']);low=math.inf;high=-math.inf
    for cell in q['cells']:
     vv=[]
     for sy in cell['sy']:
      for index in cell['edge']:
       vx,vy=metric['vertices'][index];vv.append([x+c*vx-s*sy*vy,rest+g['size']*.47*(1-sy)+s*vx+c*sy*vy])
     p=hull(vv)
     for p0,p1 in zip(pts,pts[1:]):
      clipped=slab(slab(p,p0[0],True),p1[0],False)
      for v in clipped:
       body=p0[1]+(p1[1]-p0[1])*(v[0]-p0[0])/(p1[0]-p0[0]);clear=v[1]-body+g['cell']*1.2+src['layer']*.98*g['size'];low=min(low,clear-g['size']*.14);high=max(high,clear)
    rows.append(dict(owner=q['owner'],clearance=[low,high],gap=max(0,-low),penetration=max(0,high),oldGap=q['gapBudget'],oldPen=q['penetrationBudget']))
   results[key]=rows
  diagnostics=[]
  for a,b in zip(results['nativeLedger'],results['candidateLedger']):
   assert a['owner']==b['owner'];diagnostics.append(dict(owner=a['owner'],native=a,candidate=b,passTrial=b['gap']<=a['gap']+.03*g['size'] and b['penetration']<=a['penetration']+.01*g['size']))
  intervals=[]
  if t['recipe'].get('rowReflow'):
   for run in t['recipe']['rowReflow']['runs']:
    rows=[q for q in diagnostics if q['owner'] in run['sourceIDs']];L=max(-q['native']['gap']-.03*g['size']-q['candidate']['clearance'][0] for q in rows);U=min(q['native']['penetration']+.01*g['size']-q['candidate']['clearance'][1] for q in rows);intervals.append(dict(run=run['run'],range=[L,U],nonempty=L<=U,nearestZero=max(L,min(0,U))))
  output.append(dict(case=pair['id'],recipe=e['id'],runVerticalCorrectionDesign=intervals,diagnostics=diagnostics))
pathlib.Path('/tmp/parent-pile-correlated07.json').write_text(json.dumps({'scope':'Read-only design diagnostic from existingraw; no productionproof/source/browser/qualityacceptance','rows':output},indent=2));print(json.dumps(output))
