import pathlib,json,math,hashlib
rawpath=pathlib.Path('/tmp/avoid009-pile01/physical06/run01/raw.json');j=json.loads(rawpath.read_text());design=json.loads(pathlib.Path('/tmp/avoid009-pile01/physical06/translation-design07.json').read_text());rows=[]
def distance(x,y,p):
 cross=[(b[0]-a[0])*(y-a[1])-(b[1]-a[1])*(x-a[0]) for a,b in zip(p,p[1:]+p[:1])]
 if min(cross)>=0 or max(cross)<=0:return 0
 ans=math.inf
 for a,b in zip(p,p[1:]+p[:1]):
  vx,vy=b[0]-a[0],b[1]-a[1];k=max(0,min(1,((x-a[0])*vx+(y-a[1])*vy)/(vx*vx+vy*vy))) if vx or vy else 0;ans=min(ans,math.dist((x,y),(a[0]+k*vx,a[1]+k*vy)))
 return ans
for pair in j['rows']:
 case=next(x for x in j['cases'] if x['id']==pair['id']);W,H=case['W'],case['H'];cx,cy,r=.5*W,.42*H,.2*min(W,H)+max(2,.005*min(W,H))
 for item in pair['06']['trials']:
  if item['id']=='native-equivalent':continue
  units=item['trial']['continuous']['units'];polys=[p for u in units for p in u['stageEnvelope']['polygon']];xr=[-min(p[0] for p in polys),W-max(p[0] for p in polys)];yr=[-min(p[1] for p in polys),H-max(p[1] for p in polys)];ref=next(x for x in design['rows'] if x['case']==pair['id'] and x['recipe']==item['id']);assert ref['stageOffsetX']==xr and ref['stageOffsetY']==yr;feasible=xr[0]<=xr[1] and yr[0]<=yr[1];assert feasible==ref['stageSupportTranslationRectangleNonempty'];row={'case':pair['id'],'recipe':item['id'],'x':xr,'y':yr,'nonempty':feasible,'blockers':[]}
  if feasible:
   for u in units:
    p=u['circleStrictEnvelope']['polygon'];ds=[distance(cx-x,cy-y,p) for x in xr for y in yr]
    if max(ds)+1e-7<=r:row['blockers'].append({'owner':u['owner'],'maximumCornerDistance':max(ds),'protectionRadius':r})
   assert [x['owner'] for x in row['blockers']]==[x['owner'] for x in ref['allRectangleBlockingOwnerEnvelopes']];offset=[sum(xr)/2,yr[1]];hits=[u['owner'] for u in units if distance(cx-offset[0],cy-offset[1],u['circleStrictEnvelope']['polygon'])<=r+1e-7];assert hits==['pile.glyph.0.0','pile.glyph.0.1','pile.glyph.0.2'];row['bodyHeapDustClearAtHighWitness']=True
  rows.append(row)
result={'status':'PASS','rawSHA256':hashlib.sha256(rawpath.read_bytes()).hexdigest(),'rows':rows,'math':'Distance from point to convex set is convex in common translation; its maximum over the rectangle is bounded by corner maximum. This establishes only blockage of the supplied conservative owner envelope, not actual pixel/geometry impossibility.','limitations':'Numeric design only; not stage/circle SAFE, source-geometry reflow or quality acceptance.'};pathlib.Path('/tmp/parent-pile-translation07.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
