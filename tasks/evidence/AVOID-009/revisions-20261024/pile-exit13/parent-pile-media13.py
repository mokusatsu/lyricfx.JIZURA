import json,gzip,hashlib,pathlib,math,subprocess,shutil
R=pathlib.Path('/tmp/avoid009-pile-exit-20261024-01/output01')
repo=pathlib.Path('/workspace/lyricfx.JIZURA');m=json.loads((R/'manifest.json').read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
for n,pin in m['assets'].items():
 data=(R/n).read_bytes();assert len(data)==pin['bytes'] and sha(data)==pin['sha256'],n
pins=json.loads((R/'pins.json').read_text())
for pin in pins['files']:assert sha(pathlib.Path(pin['path']).read_bytes())==pin['sha256'],pin['path']
before=json.loads(gzip.decompress((R/'before-inputs.json.gz').read_bytes()))
after=json.loads(gzip.decompress((R/'after-inputs.json.gz').read_bytes()))
ap=json.loads(json.dumps(after['sourcePlan']));bp=json.loads(json.dumps(before['sourcePlan']))
ap['lyricAvoidanceIndex'].pop('enabled');bp['lyricAvoidanceIndex'].pop('enabled');assert ap==bp
assert sha(subprocess.check_output(['git','show','bc39ce2b7893a514e6ddd7e053312dde469f8640:index.html'],cwd=repo))==m['sourceProvenance']['before']['sha256']
plan=after['renderPlan'];segment=plan['cuts'][0]['placementTrajectory']['units'][0]['segments'][0]
units={u['owner']:u for u in segment['unitProofs']};circle=segment['circle'];W,H=plan['W'],plan['H'];margin=max(2,.005*min(W,H))
def inside(p,poly):
 z=[(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]) for a,b in zip(poly,poly[1:]+poly[:1])]
 return not(any(x>1e-5 for x in z) and any(x< -1e-5 for x in z))
def distance(poly):
 p=[circle['cx'],circle['cy']]
 if inside(p,poly):return 0
 ds=[]
 for a,b in zip(poly,poly[1:]+poly[:1]):
  dx,dy=b[0]-a[0],b[1]-a[1];den=dx*dx+dy*dy;t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/den)) if den else 0
  ds.append(math.hypot(a[0]+t*dx-p[0],a[1]+t*dy-p[1]))
 return min(ds)
frames=json.loads(gzip.decompress((R/'after-frames.json.gz').read_bytes()))
entry=json.loads(pathlib.Path('/tmp/avoid009-pile-entry-20261024-01/output01/after-motion.json').read_text())
settled=json.loads(pathlib.Path('/tmp/avoid009-pile-media01/output02/after-motion.json').read_text())
count=vertices=ledgers=entrypairs=settledpairs=0;minclear=math.inf
for n,f in enumerate(frames):
 assert f['frame']==n and f['time']==n/60 and len(f['observations'])==3
 for o,tag in zip(f['observations'],['B','A','main']):
  assert o['pass']==tag and o['safety']=='safe' and o['activeRegion']=='normal'
  lag={'B':1.6/24,'A':.8/24,'main':0}[tag];tq=math.floor((n/60)/(1/60)+1e-6)/60
  assert abs(o['lt']-max(0,tq-lag))<1e-12 and o['realTime']==n/60
  exit=3.6<o['lt']<4 and 0<o['sourcePOut']<1
  e=o['exitTransport'];assert abs(e['sourceDeltaY']-99.09000000000005*o['sourcePOut']**3)<1e-10
  for q,poly in zip(o['actual'],o['polygons']):
   u=units[q['owner']];hull=u['exitEnvelope'] if exit else u['envelope']
   assert all(inside(p,hull) for p in q['polygon'])
   for src,dst in zip(q['polygon'],poly):assert abs(dst[0]-src[0]-o['offset'][0])<1e-7 and abs(dst[1]-src[1]-o['offset'][1])<1e-7
   d=distance(poly)-circle['r']-margin;minclear=min(minclear,d);assert d>=-1e-5
   fall=bool(u.get('entryRule')) and 0<=q.get('sourceF',-1)<1
   assert all(0<=x<=W and (y>=0 or fall) and (y<=H or exit) for x,y in poly)
   count+=1;vertices+=len(poly)
  for ledger in o['exitLedger']:
   assert exit and ledger['side']=='bottom' and 3.6<ledger['lt']<4 and all(p[1]>H for p in ledger['outsideVertices']);ledgers+=1
 if all(o['sourcePOut']==0 for o in f['observations']):assert f['encoderInputPNG']==entry[n]['encoderInputPNG'];entrypairs+=1
 if all(o['sourcePOut']==0 and o['lt']>=.5 and all(q['gap'] or q['f']>=1 for q in o['sourceSlots']) for o in f['observations']):assert f['encoderInputPNG']==settled[n]['encoderInputPNG'];settledpairs+=1
for side in ['before','after']:
 s=m['sides'][side];rows=json.loads(gzip.decompress((R/s['frameReceipt']).read_bytes()));assert len(rows)==240 and len({x['encoderInputPNG'] for x in rows})==s['distinct']
 stream=next(x for x in s['probe']['streams'] if x['codec_type']=='video')
 assert stream['width']==1280 and stream['height']==720 and stream['nb_read_frames']=='240' and stream['avg_frame_rate']=='60/1' and float(stream['duration'])==4
 for key in s['keys']:assert sha((R/key['file']).read_bytes())==rows[key['frame']]['encoderInputPNG']
assert not m['errors'] and len(frames)==240
out=repo/'tasks/evidence/AVOID-009/revisions-20261024/pile-exit13'
report={'captureSession':18059,'exit':0,'manifestSHA256':sha((R/'manifest.json').read_bytes()),'assets':len(m['assets']),'actualInputHashes':len(pins['files']),'animation':'1280x720,60fps,240frames,4s,canvas only','actualPolygons':count,'actualVertices':vertices,'exitLedgerRows':ledgers,'nonexitEntry12PNGParity':entrypairs,'approvedSettled064PNGParity':settledpairs,'minimumCircleClearanceBeyondMargin':minclear,'nativeBefore':'exact bc39 GitHTML, no observed geometry claimed','parentImageViews':0,'publicChecks':0,'humanApproval':False,'formalPerformanceAcceptance':False}
(out/'parent-media13.json').write_text(json.dumps(report,indent=2)+'\n');shutil.copy2(__file__,out/pathlib.Path(__file__).name);print(json.dumps(report))
