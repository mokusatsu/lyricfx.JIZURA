import gzip, json, math, hashlib, pathlib
R=pathlib.Path('/tmp/avoid009-pile-exit13')
raw=json.loads(gzip.decompress((R/'run01/raw.json.gz').read_bytes()))
counts={'actualPolygons':0,'actualVertices':0,'proofOwners':0,'exitLedgerRows':0,'nonexitPixelPairs':0,'directReplayPairs':0}
maxerr=0.0; final=[]; tails=[]
def same(a,b): return a==b
def inside(p,poly):
 z=[(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]) for a,b in zip(poly,poly[1:]+poly[:1])]
 return not (any(v>1e-5 for v in z) and any(v< -1e-5 for v in z))
def distance(poly,c):
 pt=[c['cx'],c['cy']]
 if inside(pt,poly): return 0
 ds=[]
 for a,b in zip(poly,poly[1:]+poly[:1]):
  dx,dy=b[0]-a[0],b[1]-a[1]; den=dx*dx+dy*dy
  t=max(0,min(1,((pt[0]-a[0])*dx+(pt[1]-a[1])*dy)/den)) if den else 0
  ds.append(math.hypot(a[0]+t*dx-pt[0],a[1]+t*dy-pt[1]))
 return min(ds)
for row in raw['rows']:
 a,b=row['after'],row['before']; assert not a['failures'] and not b['failures']
 assert a['sourcePlan']==b['sourcePlan']
 p=a['finalPlan']; W,H=p['W'],p['H']; margin=max(2,.005*min(W,H)); cut=p['cuts'][0]
 segs=cut['placementTrajectory']['units'][0]['segments']; olds=b['finalPlan']['cuts'][0]['placementTrajectory']['units'][0]['segments']
 data=a['exitSourceData']; D=data['nativeAout']-data['currentAout']; assert D==data['amplitude'] and D>0
 assert data['exitStart']==cut['dur']-cut['outDur']>=max(.5,data['latestImpact'])
 dataowners={u['owner']:u for u in data['units']}
 for s,o in zip(segs,olds):
  comp=dict(s['composition']); comp.pop('exit'); assert comp==o['composition']
  for key in ['from','to','quality','candidate','entryProof']: assert s[key]==o[key]
  assert len(s['unitProofs'])==len(dataowners)==len(o['unitProofs'])
  for u,v in zip(s['unitProofs'],o['unitProofs']):
   stripped={k:x for k,x in u.items() if k not in ['exitSource','exitEnvelope','exitRule']}; assert stripped==v
   src=dataowners[u['owner']]['source']; expanded=u['exitSource']; assert expanded['x']==src['x'] and expanded['y'][0]<=src['y'][0] and expanded['y'][1]>=src['y'][1]+D
   hull=[[x+s['from'][0],y+s['from'][1]] for x,y in u['exitEnvelope']]
   assert all(0<=x<=W and y>=0 for x,y in hull)
   assert distance(hull,s['circle'])>=s['circle']['r']+margin-1e-7
   rule=u['exitRule']; assert rule['bothEndpointsExcluded'] and rule['sourcePOut']==[0,1] and rule['sourceDeltaAmplitude']==D and rule['startLocalClock']==data['exitStart'] and rule['expiryLocalClock']==data['dur']
   counts['proofOwners']+=1
 for f,oldframe in zip(a['frames'],b['frames']):
  assert f['t']==oldframe['t'] and f['error'] is None
  if all(o['sourceClock']['pOut']==0 for o in f['observations']): assert f['hash']==oldframe['hash']; counts['nonexitPixelPairs']+=1
  for o,old in zip(f['observations'],oldframe['observations']):
   assert o['pass']==old['pass'] and o['lt']==old['lt'] and o['sourceClock']==old['sourceClock'] and o['sourceSlots']==old['sourceSlots']
   lag={'main':0,'A':.8/24,'B':1.6/24}[o['pass']]; tq=math.floor(f['t']*60+1e-6)/60
   assert abs(o['lt']-max(0,tq-lag))<1e-12
   assert len(o['actual'])==len(old['actual'])
   s=next((s for s in segs if s['start']<=o['realTime']<s['end']),None)
   dy=o['exitTransport']['sourceDeltaY'] if o['exitTransport'] else 0
   if s:
    assert abs(dy-D*o['sourceClock']['pOut']**3)<1e-10
   scale=1+.03*.65*o['lt']/4
   for q,v,placed in zip(o['actual'],old['actual'],o['polygons']):
    assert q['owner']==v['owner'] and len(q['polygon'])==len(v['polygon'])
    for pos,pre,out in zip(q['polygon'],v['polygon'],placed):
     err=max(abs(pos[0]-pre[0]),abs(pos[1]-pre[1]-dy*scale)); maxerr=max(maxerr,err); assert err<2e-4
     if s:
      assert abs(out[0]-pos[0]-s['from'][0])<1e-7 and abs(out[1]-pos[1]-s['from'][1])<1e-7
     counts['actualVertices']+=1
    if s:
     u=next(u for u in s['unitProofs'] if u['owner']==q['owner'])
     exit=data['exitStart']<o['lt']<data['dur'] and 0<o['sourceClock']['pOut']<1
     hull=u['exitEnvelope'] if exit else u['envelope']
     assert all(inside(vtx,hull) for vtx in q['polygon'])
     assert distance(placed,s['circle'])>=s['circle']['r']+margin-1e-5
     falling=0<=q.get('sourceF',-1)<1 and bool(u.get('entryRule'))
     assert all(0<=x<=W and (y>=0 or falling) and (y<=H or exit) for x,y in placed)
    counts['actualPolygons']+=1
   for e in o.get('exitLedger',[]):
    assert data['exitStart']<e['lt']<data['dur'] and 0<e['pOut']<1 and e['side']=='bottom'
    assert abs(e['sourceDeltaY']-D*e['pOut']**3)<1e-10 and all(v[1]>H for v in e['outsideVertices'])
    counts['exitLedgerRows']+=1
   if not s:
    assert not o['activeRegion'] and o['safety']=='not-active'
    tails.append({'case':row['id'],'t':f['t'],'pass':o['pass'],'lt':o['lt'],'actual':len(o['actual']),'certified':False})
 for probe in a['probes']:
  if 'directHash' in probe:
   assert probe['directHash']==probe['replayHash']; counts['directReplayPairs']+=1
  if probe['lt']>=4: assert probe['outsideSourceLifetime'] and not probe['stagePolicyGuaranteed']
 for x,y in zip(a['off'],b['off']): assert x['hash']==y['hash']
 assert a['noout']['frame']['hash']==b['noout']['frame']['hash'] and not a['noout']['frame']['error']
 assert a['warm']['newSegmentIdentity'] and not a['warm']['frame']['error']
 assert a['fontDrift']['error']['code']==a['helperDrift']['error']['code']=='PILE_STALE_DEPENDENCY'
 f=next(f for f in a['frames'] if f['t']==239/60); means={}
 for o in f['observations']:
  ix=next(i for i,q in enumerate(o['actual']) if q['owner']=='pile.glyph.0.0'); poly=o['polygons'][ix]
  means[o['pass']]=[sum(v[k] for v in poly)/len(poly) for k in [0,1]]
 final.append({'case':row['id'],'deltaAY':means['A'][1]-means['main'][1],'deltaBY':means['B'][1]-means['main'][1], 'D':D})
assert not raw['errors'] and all(not any(not c['equal'] for c in p['checks']) for p in raw['comparisons'])
end=json.loads((R/'run01/end-pins.json').read_text()); assert end['allInputsUnchanged'] and all(x['sha256']==x['actualSHA256'] for x in end['files'])
report={'scope':'independent parent raw algebra, all actual vertices and proof owners; limited two push fixtures', 'rawSHA256':hashlib.sha256((R/'run01/raw.json.gz').read_bytes()).hexdigest(),'counts':counts,'maximumActualMovementResidual':maxerr,'finalGhostCentroids':final,'knownInactiveRegionGhostTail':tails,'parentImagesViewed':0,'publicChecks':0,'formalPerformanceAcceptance':False,'wholeNativePhysicsAcceptance':False}
pathlib.Path('/tmp/parent-pile-exit13.json').write_text(json.dumps(report,indent=2)+'\n'); print(json.dumps(report,ensure_ascii=False))
