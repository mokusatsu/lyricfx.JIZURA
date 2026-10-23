import pathlib,json,gzip,hashlib,math
p=pathlib.Path('/tmp/avoid009-pile-media01/output02');m=json.loads((p/'manifest.json').read_text());a=json.loads(gzip.decompress((p/'after-inputs.json.gz').read_bytes()));b=json.loads(gzip.decompress((p/'before-inputs.json.gz').read_bytes()));rows=json.loads(gzip.decompress((p/'after-frames.json.gz').read_bytes()));native=json.loads(gzip.decompress((p/'before-frames.json.gz').read_bytes()));plan=a['renderPlan'];cut=plan['cuts'][0];tr=cut['placementTrajectory'];s=tr['units'][0]['segments'][0];units={q['owner']:q for q in s['unitProofs']};W,H=plan['W'],plan['H'];n=dict(frames=0,observations=0,polygons=0,vertices=0,heapMappings=0,sourceSlots=0,artifactHashes=0);mind=math.inf
for name,q in m['assets'].items():
 data=(p/name).read_bytes();assert len(data)==q['bytes']and hashlib.sha256(data).hexdigest()==q['sha256'];n['artifactHashes']+=1
for side in ['before','after']:
 source=(b if side=='before'else a)['sourcePlan'];assert source['fps']==60 and source['fx']['koma']==0;assert source['cuts'][0]['area']is None
for k in ['style','fx','W','H','fps','duration','events','beats']:assert a['sourcePlan'][k]==b['sourcePlan'][k]
for k in ['params','text','words','lineText','seed','start','end','dur','cam','camP','motionScale','contentScale','area']:assert a['sourcePlan']['cuts'][0][k]==b['sourcePlan']['cuts'][0][k]
assert (W,H)==(1280,720)and s['status']=='safe'and s['candidate']=='a84-split-rho110-groupY'and s['start']==0 and s['end']==4 and s['from']==s['to'];assert tr['safety']=='certified-bounded-adapter';assert len(rows)==len(native)==240
# Independent distance to convex polygon, without A.clear or source helper calls.
def inside(q,poly):
 cross=[(v[0]-u[0])*(q[1]-u[1])-(v[1]-u[1])*(q[0]-u[0])for u,v in zip(poly,poly[1:]+poly[:1])];return min(cross)>=-1e-7 or max(cross)<=1e-7
def distance(q,poly):
 if inside(q,poly):return 0
 out=[]
 for u,v in zip(poly,poly[1:]+poly[:1]):
  dx,dy=v[0]-u[0],v[1]-u[1];t=max(0,min(1,((q[0]-u[0])*dx+(q[1]-u[1])*dy)/(dx*dx+dy*dy)))if dx or dy else 0;out.append(math.hypot(q[0]-u[0]-t*dx,q[1]-u[1]-t*dy))
 return min(out)
margin=max(2,.005*min(W,H));center=(s['circle']['cx'],s['circle']['cy'])
for u in units.values():
 moved=[[q[0]+s['from'][0],q[1]+s['from'][1]]for q in u['envelope']];assert all(0<=q[0]<=W and 0<=q[1]<=H for q in moved);assert distance(center,moved)>=s['circle']['r']+margin
for i,row in enumerate(rows):
 assert row['frame']==i and row['time']==i/60 and len(row['observations'])==3;assert native[i]['time']==row['time']and native[i]['frame']==i and native[i]['observations']==[]and 'not observed'in native[i]['expectedClockModel']['scope'];n['frames']+=1
 for j,o in enumerate(row['observations']):
  lag=[1.6/24,.8/24,0][j];expected=max(0,math.floor((i/60)/(1/60)+1e-6)*(1/60)-lag);assert o['pass']==['B','A','main'][j]and o['realTime']==i/60;assert abs(o['motionTime']-expected)<1e-12 and abs(o['lt']-expected)<1e-12 and abs(o['ltb']-expected-lag)<1e-12;assert o['offset']==s['from']and o['activeRegion']=='normal';assert all(e['role']=='primary'for e in o['events']);g=o['geometry'];assert g['ownership']=='all-primary-none-exempted'and g['size']==144 and g['heapSize']==25.92;n['observations']+=1
  assert len(o['actual'])==len(o['polygons'])
  for actual,poly in zip(o['actual'],o['polygons']):
   assert poly==[[v[0]+o['offset'][0],v[1]+o['offset'][1]]for v in actual['polygon']];assert all(inside(v,units[actual['owner']]['envelope'])for v in actual['polygon']);assert all(0<=v[0]<=W and 0<=v[1]<=H for v in poly);d=distance(center,poly)-s['circle']['r']-margin;assert d>=0;mind=min(mind,d);n['polygons']+=1;n['vertices']+=len(poly)
   if actual['kind']=='item'and actual['owner'].startswith('pile.heap.'):
    src=g['heap'][actual['index']];assert src['ordinal']==actual['index']and src['id']==actual['owner']and src['ch']==actual['ch'];n['heapMappings']+=1
  for q in g['slots']:
   assert abs(q['f']-(o['lt']-q['when'])/g['fd'])<1e-12;n['sourceSlots']+=1
for side,data in [('before',native),('after',rows)]:
 hashes=[r['encoderInputPNG']for r in data];assert len(set(hashes))==m['sides'][side]['distinct'];stream=next(s for s in m['sides'][side]['probe']['streams']if s['codec_type']=='video');assert stream['avg_frame_rate']==stream['r_frame_rate']=='60/1'and stream['nb_read_frames']=='240'and float(stream['duration'])==4
out={'status':'PARENT_RAW_SOURCE_GEOMETRY_METADATA_ACCEPTED_VISUAL_HUMAN_PENDING','manifestSHA256':hashlib.sha256((p/'manifest.json').read_bytes()).hexdigest(),'counts':n,'continuousOwnerHulls':len(units),'minimumActualCircleClearanceBeyondMargin':mind,'nativeFrames':240,'nativeFPS':60,'nativeDimensions':[W,H],'beforeDistinctImages':m['sides']['before']['distinct'],'afterDistinctImages':m['sides']['after']['distinct'],'sourceTypography':'Native144primary/25.92heap','beforeObservationLimit':'OriginalunwrappednativeRenderer.frame; clocks saved ONLYasexpectedmodel, not observed geometry/callback','parentImages':0,'publicChecks':0,'limits':'One representative only; no humanreadability/contact/artistic/fullfamily/formalperformance acceptance'};pathlib.Path('/tmp/parent-pile-media01.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out,indent=2))
