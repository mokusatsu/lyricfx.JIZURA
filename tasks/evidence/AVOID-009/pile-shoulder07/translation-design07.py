"""Read-only numeric design from actual06 raw, no browser or product execution.
Post-camera common offset, as existing09s/09t A.replay protocol. Not a SAFE result.
"""
from pathlib import Path
import json,math,hashlib
b=Path('/tmp/avoid009-pile01');raw=b/'physical06/run01/raw.json';r=json.loads(raw.read_text());rows=[]
def distance(c,p):
 inside=False;best=math.inf
 for i,a in enumerate(p):
  z=p[(i+1)%len(p)];dx=z[0]-a[0];dy=z[1]-a[1];ll=dx*dx+dy*dy;t=max(0,min(1,((c[0]-a[0])*dx+(c[1]-a[1])*dy)/ll))if ll else 0
  best=min(best,math.hypot(c[0]-a[0]-t*dx,c[1]-a[1]-t*dy))
  if (a[1]>c[1])!=(z[1]>c[1])and c[0]<(z[0]-a[0])*(c[1]-a[1])/(z[1]-a[1])+a[0]:inside=not inside
 return 0 if inside else best
for pair in r['rows']:
 case=next(c for c in r['cases']if c['id']==pair['id']);W=case['W'];H=case['H'];circle=[.5*W,.42*H,.2*min(W,H)];margin=max(2,.005*min(W,H));R=circle[2]+margin
 for item in pair['06']['trials']:
  if item['id']=='native-equivalent':continue
  t=item['trial'];u=t['continuous']['units'];allp=[v for q in u for v in q['stageEnvelope']['polygon']];xr=[-min(v[0]for v in allp),W-max(v[0]for v in allp)];yr=[-min(v[1]for v in allp),H-max(v[1]for v in allp)];feasible=xr[0]<=xr[1]and yr[0]<=yr[1];row={'case':pair['id'],'recipe':item['id'],'postCameraOffsetConvention':True,'stageOffsetX':xr,'stageOffsetY':yr,'stageSupportTranslationRectangleNonempty':feasible,'circle':circle,'margin':margin,'strictOwnerPolicy':'body/heap/dust alltimes; each main originalf>=1; fallcircle exclusion PROPOSALONLY, no stage exclusion','notSafeOutcome':True}
  if feasible:
   xs=[xr[0],sum(xr)/2,xr[1]];ys=[yr[0],sum(yr)/2,yr[1]];samples=[];corners=[[x,y]for x in [xr[0],xr[1]]for y in [yr[0],yr[1]]];blocking=[]
   for q in u:
    if not q.get('circleStrictEnvelope'):continue
    p=q['circleStrictEnvelope']['polygon'];ds=[distance([circle[0]-d[0],circle[1]-d[1]],p)for d in corners]
    if max(ds)+1e-7<=R:blocking.append({'owner':q['owner'],'kind':q['kind'],'cornerDistances':ds,'maximumDistanceUpper':max(ds)+1e-7,'meaning':'This conservative convex OWNER ENVELOPE blocks every offset in rectangle by convexity of distance-to-convex-set; NOT actualpixel/geometry impossibility'})
   for x in xs:
    for y in ys:
     hits=[]
     for q in u:
      if not q.get('circleStrictEnvelope'):continue
      d=distance([circle[0]-x,circle[1]-y],q['circleStrictEnvelope']['polygon']);clearance=d-R
      if clearance<=1e-7:hits.append({'owner':q['owner'],'kind':q['kind'],'distance':d,'clearance':clearance})
     samples.append({'offset':[x,y],'conservativeEnvelopeIntersections':hits,'supportClearAtThisOffset':not hits,'semantics':'bounded numeric design witness only, no SAFE/candidate acceptance'})
   row.update(allRectangleBlockingOwnerEnvelopes=blocking,nineRepresentativeOffsets=samples)
  rows.append(row)
out={'scope':'READ-ONLY DESIGN from frozen06 raw, no browser/source edits, no SAFE/fit/quality acceptance','rawSHA256':hashlib.sha256(raw.read_bytes()).hexdigest(),'roundingModel':'ordinary binary64 ±1e-7 distance model only','rows':rows};p=b/'physical06/translation-design07.json';p.write_text(json.dumps(out,indent=2)+'\n')
for q in rows:
 print(q['case'],q['recipe'],'x',q['stageOffsetX'],'y',q['stageOffsetY'],'nonempty',q['stageSupportTranslationRectangleNonempty'])
 if q['stageSupportTranslationRectangleNonempty']:
  print('whole-rectangle blockers',[(v['owner'],v['cornerDistances'])for v in q['allRectangleBlockingOwnerEnvelopes']]);print('sample hit counts',[len(v['conservativeEnvelopeIntersections'])for v in q['nineRepresentativeOffsets']]);print('center hits',q['nineRepresentativeOffsets'][4]['conservativeEnvelopeIntersections'])
