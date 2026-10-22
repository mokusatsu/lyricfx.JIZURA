from pathlib import Path
import json,gzip,math,hashlib
D=Path('tasks/evidence/AVOID-008/writingC861-main01');sha=lambda b:hashlib.sha256(b).hexdigest()
def clear(poly,c,m):
 x,y=c['cx'],c['cy'];inside=False;dist=math.inf
 for a,b in zip(poly,poly[1:]+poly[:1]):
  dx,dy=b[0]-a[0],b[1]-a[1];t=max(0,min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)))if dx*dx+dy*dy else 0;dist=min(dist,math.hypot(x-a[0]-t*dx,y-a[1]-t*dy))
  if(a[1]>y)!=(b[1]>y)and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]:inside=not inside
 return not inside and dist>=c['r']+m-1e-6
rows=[]
for name in ['matrix01','writing01','default01']:
 p=D/(name+'.json.gz');raw=gzip.decompress(p.read_bytes());r=json.loads(raw);polys=actual=phase=safeSeg=stageVertices=0
 for row in r['rows']:
  assert row['inputUnchanged']and not row['error'];W,H=row['spec']['W'],row['spec']['H'];margin=max(2,.005*min(W,H))
  for o in row['observations']:
   if'phaseCorrect'in o:assert o['phaseCorrect']
   phase+=1
   for k in ['envelopeCovered','stageEnvelopeCovered']:
    if k in o and o[k]is not None:assert o[k],(name,row['spec'],k,o['motionTime'])
  for s in row.get('segments')or[]:
   if s['status']!='safe-hold':continue
   safeSeg+=1;dx,dy=s['from'];assert s['start']<s['end'];dom=s['domain'];assert dom['minX']-1e-7<=dx<=dom['maxX']+1e-7 and dom['minY']-1e-7<=dy<=dom['maxY']+1e-7
   for p in s['envelopes']:
    q=[[x+dx,y+dy]for x,y in p];assert clear(q,s['circle'],margin),(name,row['spec']);polys+=1
    for x,y in q:assert -1e-7<=x<=W+1e-7 and -1e-7<=y<=H+1e-7;stageVertices+=1
   for o in row['observations']:
    if s['start']<=o['realTime']<s['end']:
     for p in o['polygons']:assert clear(p,s['circle'],margin),(name,row['spec'],o['motionTime']);actual+=1
 assert not r['summary']['failures'];rows.append({'dataset':name,'rawSHA256':sha(raw),'rawBytes':len(raw),'gzipSHA256':sha((D/(name+'.json.gz')).read_bytes()),'summary':r['summary'],'safeSegments':safeSeg,'independentIntervalCirclePolygons':polys,'holdStageVertices':stageVertices,'independentStrictActualCirclePolygons':actual,'phaseObservations':phase})
out={'scope':'Fresh independent ray-crossing/point-edge circle checks, complete hold-stage vertices and finite offset domains for each safe segment. Full source stage sweep models/domain remain separate analytic proof; sampled observations must retain coverage. No epsilon equivalence for historical comparisons.','datasets':rows,'passed':True};p=D/'independent01.json';assert not p.exists();p.write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(rows))
