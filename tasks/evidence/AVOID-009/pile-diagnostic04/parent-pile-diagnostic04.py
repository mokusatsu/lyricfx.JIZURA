import json,math,hashlib,pathlib
base=pathlib.Path('/tmp/avoid009-pile01/diagnostic04');raw=json.loads((base/'run01/raw.json').read_text());n={'cases':0,'actualPolygons':0,'polygonVertices':0,'proofUnits':0,'cameraRectangleSupports':0,'clockObservations':0,'metricSupports':0}
def inside(x,r):return r[0]<=x<=r[1]
def extrema(a,b,t):
 q=[-t,t];phi=math.atan2(b,a)
 for k in range(-2,3):
  v=phi+k*math.pi
  if -t<=v<=t:q.append(v)
 vals=[a*math.cos(v)+b*math.sin(v) for v in q];return min(vals),max(vals)
for row in raw['rows']:
 n['cases']+=1;assert not row['failures'];assert row['before']==row['after'] and row['sourceUnchanged'];p=json.loads(row['before']['json']);cut=p['cuts'][0];proof=row['proof'];W,H=p['W'],p['H'];motion=cut.get('motionScale',1);m=p['fx']['motion'];K=max(0,min(1.25,m*1.25));cs=cut.get('contentScale',1);rs=proof['renderScale'];slo=cs;shi=cs*(1+motion*(max(1.02,1+.03*max(m,K))-1));angle=5*math.pi/180*motion if cut['cam']=='dutch' else 0;pan=W*(cut['camP'].get('a') or .022)*K*motion if cut['cam'] in ('panL','panR') else 0
 assert proof['status']=='diagnostic-only' and proof['safetyCertificate'] is False and proof['adapterRegistered'] is False
 for metric in proof['metrics']:
  xs=[abs(v[0]) for v in metric['vertices']];ys=[abs(v[1]) for v in metric['vertices']];assert metric['rotationL1Radius']>=max(xs)+max(ys);n['metricSupports']+=1
 for pas in proof['passes']:
  px,py={'main':(0,0),'A':(3.2,1.9),'B':(-3.4,-1.3)}[pas['pass']];dx=px*p['fx']['chroma']*p['style']['ghost']*H/1080*motion;dy=py*p['fx']['chroma']*p['style']['ghost']*H/1080*motion
  cells=pas['cells'];assert all(a['lt'][1]==b['lt'][0] for a,b in zip(cells,cells[1:]))
  for cell in cells:
   for unit in cell['units']:
    n['proofUnits']+=1;assert unit['role']=='primary';b=unit['sourceBounds'];screen=unit['screenBounds'];assert all(math.isfinite(v) for axis in ('x','y') for v in b[axis]+screen[axis])
    for x in b['x']:
     for y in b['y']:
      xr=extrema(x-W/2,-(y-H/2),angle);yr=extrema(y-H/2,x-W/2,angle)
      for axis,rr,center,offset,pad in [('x',xr,W/2,dx,pan),('y',yr,H/2,dy,0)]:
       vals=[v*s+center+offset for v in rr for s in (slo,shi)];lo=min(vals)-pad-2/rs;hi=max(vals)+pad+2/rs
       assert screen[axis][0]<=lo+1e-8 and screen[axis][1]>=hi-1e-8,(row['id'],unit['owner'],axis,screen[axis],lo,hi);n['cameraRectangleSupports']+=1
 for obs in row['checks']:
  n['clockObservations']+=1;step=proof['stepDur'];tq=math.floor(obs['realTime']/step+1e-6)*step;tp=max(0,tq-obs['lag']);assert math.isclose(tq,obs['tq'],abs_tol=1e-12) and math.isclose(tp-cut['start'],obs['lt'],abs_tol=1e-12);assert obs['supported']
  pas=next(p for p in proof['passes'] if p['pass']==obs['pass']);units=[u for cell in pas['cells'] if inside(obs['lt'],cell['lt']) for u in cell['units']]
  for actual in obs['actual']:
   n['actualPolygons']+=1;assert actual['covered'] and actual.get('mapping',True);matches=[u for u in units if u['owner']==actual['owner']];assert matches
   assert any(all(inside(v[0],u['screenBounds']['x']) and inside(v[1],u['screenBounds']['y']) for v in actual['polygon']) for u in matches)
   n['polygonVertices']+=len(actual['polygon'])
 assert all(q['code']==q['expected'] for q in row['typed']);assert row['readOnlyCameraLookup'] and all(row['cameraIdentities'].values())
end=json.loads((base/'run01/end-pins.json').read_text());assert end['allInputsUnchanged'];assert len(end['files'])==696
for f in end['files']:assert hashlib.sha256(pathlib.Path(f['path']).read_bytes()).hexdigest()==f['sha256']==f['actualSHA256']
result={'status':'PASS','rawSHA256':hashlib.sha256((base/'run01/raw.json').read_bytes()).hexdigest(),'counts':n,'inputsUnchanged':696,'limitations':['Continuous source interval algebra reviewed separately; camera rectangle analytic support independently recomputed here.','Actual selected clocks are falsification only, not continuous proof.','No placement adapter, fit, contact, quality, public, visual, performance or human approval.']}
pathlib.Path('/tmp/parent-pile-diagnostic04.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
