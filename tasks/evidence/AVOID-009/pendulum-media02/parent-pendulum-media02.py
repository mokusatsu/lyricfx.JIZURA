import pathlib,json,gzip,hashlib,math,subprocess
r=pathlib.Path('/tmp/avoid009-pendulum-selected-20261024-01/output02')
m=json.loads((r/'manifest.json').read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
def inside(p,q):
 signs=[]
 for a,b in zip(q,q[1:]+q[:1]):
  v=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);signs.append(v)
 return all(v>=-1e-5 for v in signs) or all(v<=1e-5 for v in signs)
def distance(p,q):
 assert not inside(p,q),'circle centre inside primary polygon'
 result=math.inf
 for a,b in zip(q,q[1:]+q[:1]):
  dx=b[0]-a[0];dy=b[1]-a[1];den=dx*dx+dy*dy;t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/den)) if den else 0
  result=min(result,math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy))
 return result
for path,pin in m['assets'].items():
 b=(r/path).read_bytes();assert len(b)==pin['bytes'] and sha(b)==pin['sha256'],path
counts={'pairs':0,'framesEachSide':0,'afterObservations':0,'afterPolygons':0,'completeOwnerMatches':0};minGap=math.inf;rows=[]
for case in m['cases']:
 spec=case['spec'];W,H=spec['W'],spec['H'];before=json.loads(gzip.decompress((r/case['sides']['before']['actualInputs']).read_bytes()));after=json.loads(gzip.decompress((r/case['sides']['after']['actualInputs']).read_bytes()));assert before['sourcePlan']==after['sourcePlan'];assert after['sourcePlan']['fps']==60 and after['sourcePlan']['fx']['koma']==0
 tr=after['renderPlan']['cuts'][0]['placementTrajectory'];assert tr['safety']=='certified-bounded-adapter';unit=tr['units'][0];assert all(s['status']=='safe' for s in unit['segments']);accepted=json.loads((r/'accepted-case-reference.json').read_text());old=next(q for q in accepted['selected'] if q['id']==case['id']);assert unit['segments'][0]['composition']==old['trajectory']['units'][0]['segments'][0]['composition'];assert unit['segments'][0]['from']==old['trajectory']['units'][0]['segments'][0]['from']
 rec={'id':case['id'],'distinctPixels':{},'polygons':0}
 for side in ['before','after']:
  s=case['sides'][side];frames=json.loads(gzip.decompress((r/s['frameReceipt']).read_bytes()));assert len(frames)==240;assert [f['frame'] for f in frames]==list(range(240));assert all(abs(f['time']-f['frame']/60)<1e-12 for f in frames)
  probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-of','json',str(r/s['video'])]));v=next(v for v in probe['streams'] if v['codec_type']=='video');assert (v['width'],v['height'],v['nb_frames'],v['avg_frame_rate'],float(v['duration']))==(W,H,'240','60/1',4.)
  rec['distinctPixels'][side]=len({f['encoderInputPNG'] for f in frames});assert rec['distinctPixels'][side]==s['distinctEncoderInputPNGs']
  for f in frames:
   main=[v for v in f['nativeClocks'] if v['pass']=='main'];assert main and all(abs(v['t']-f['time'])<1e-9 for v in main)
   assert all(v['provenance']==('observed-placementObservation' if side=='after' else 'derived-source-quantizer') for v in f['nativeClocks'])
   if side=='before':assert not f['observations'];continue
   assert f['observations']
   for o in f['observations']:
    counts['afterObservations']+=1;assert o['safety']=='safe' and o['strictCircleClear'] and o['stageContained'] and o['envelopeCovered'];segment=next(s for s in unit['segments'] if s['start']<=o['realTime']<s['end']);C=segment['circle'];cx,cy,cr=C['cx'],C['cy'],C['r'];margin=max(2,.005*min(W,H));offset=o['offset'];expected=[]
    for e in o['events']:
     assert e['role']=='primary';proof=next(p for p in segment['unitProofs'] if p['owner']==e['owner']);counts['completeOwnerMatches']+=1
     for q in e['polygons']:
      assert any(all(inside(p,hull) for p in q) for hull in proof['envelopes']);expected.append([[v[0]+offset[0],v[1]+offset[1]] for v in q])
    assert expected==o['polygons']
    for q in o['polygons']:
     assert all(-1e-6<=p[0]<=W+1e-6 and -1e-6<=p[1]<=H+1e-6 for p in q);gap=distance([cx,cy],q)-cr-margin;assert gap>=-1e-5;minGap=min(minGap,gap);counts['afterPolygons']+=1;rec['polygons']+=1
 counts['pairs']+=1;counts['framesEachSide']+=240;rows.append(rec)
result={'decision':'Source/actual native60fps raw, owner-envelope coverage, stage/circle and ffprobe independently checked. Human aesthetics not accepted.','counts':counts,'minCircleGapBeyondMargin':minGap,'cases':rows,'manifestSHA256':sha((r/'manifest.json').read_bytes()),'sourceBeforeAfterEqual':True,'beforeClockProvenance':'Derived from unchanged native source quantizer; not observed callback','afterClockProvenance':'Existing placementObservation actualmotionTime, no renderer function hooks','imagesViewed':0,'publicChecks':0};pathlib.Path('/tmp/parent-pendulum-media02.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
