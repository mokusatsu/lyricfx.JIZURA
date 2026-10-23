import pathlib,json,gzip,hashlib,math,collections
main=pathlib.Path('/workspace/lyricfx.JIZURA');root=pathlib.Path('/tmp/avoid009-flag01');C=collections.Counter()
def load(n):return json.load(gzip.open('/tmp/avoid009-flag-'+n+'.json.gz'))
def inside(p,q):
 a=[(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]) for a,b in zip(q,q[1:]+q[:1])]
 return not(any(v>1e-4 for v in a) and any(v< -1e-4 for v in a))
def distance(p,q):
 if inside(p,q):return 0
 ds=[]
 for a,b in zip(q,q[1:]+q[:1]):
  x=b[0]-a[0];y=b[1]-a[1];d=x*x+y*y;t=max(0,min(1,((p[0]-a[0])*x+(p[1]-a[1])*y)/d)) if d else 0;ds.append(math.hypot(p[0]-a[0]-t*x,p[1]-a[1]-t*y))
 return min(ds)
def safe(poly,spec,circle):
 assert all(math.isfinite(v) for p in poly for v in p)
 assert all(-1e-4<=x<=spec['W']+1e-4 and -1e-4<=y<=spec['H']+1e-4 for x,y in poly)
 assert distance([circle['cx'],circle['cy']],poly)+1e-4>=circle['r']+max(2,.005*min(spec['W'],spec['H']))

import subprocess
review=pathlib.Path('/tmp/avoid009-flag-selected-20261024-01/review');m=json.loads((review/'manifest.json').read_text());C=collections.Counter()
for n,a in m['assets'].items():
 p=review/n;assert p.stat().st_size==a['bytes'] and hashlib.sha256(p.read_bytes()).hexdigest()==a['sha256'];C['assetPins']+=1
for case in m['cases']:
 spec=case['spec'];circle={'cx':spec['cx']*spec['W'],'cy':spec['cy']*spec['H'],'r':spec['radius']*min(spec['W'],spec['H'])}
 for side,meta in case['sides'].items():
  f=json.load(gzip.open(review/meta['frameReceipt']));assert len(f)==240 and len({v['encoderInputPNG'] for v in f})==240
  probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-count_frames','-show_entries','stream=width,height,r_frame_rate,nb_read_frames,duration','-of','json',str(review/meta['video'])],text=True))['streams'][0]
  assert probe['width']==spec['W'] and probe['height']==spec['H'] and probe['r_frame_rate']=='60/1' and int(probe['nb_read_frames'])==240 and abs(float(probe['duration'])-4)<1e-5;C['nativeMP4s']+=1
  for i,row in enumerate(f):
   assert row['frame']==i and abs(row['time']-i/60)<1e-9
   if side!='after':continue
   assert row['observations']
   for obs in row['observations']:
    assert all(obs[k] for k in ['measurementSupported','envelopeCovered','stageContained','strictCircleClear']);assert obs['safety']=='safe';assert abs(obs['realTime']-i/60)<1e-8
    for poly in obs['polygons']:safe(poly,spec,circle);C['independentlyCheckedActualPolygons']+=1
   C['afterGuardedFrames']+=1
out={'manifestSHA256':hashlib.sha256((review/'manifest.json').read_bytes()).hexdigest(),'counts':dict(C),'checks':'Rawasset SHA/bytes, independentffprobe intrinsicMP4 dimensions60fps240frames4sec,240distinctinputPNGs each,480afterrawguardframes with independentactualpolygon circle/stage check. No image/video viewing.','circle':'No nativevisibleoverlay; strictclearance is independentmeasurement, aestheticjudgment separate.','publicResultChecks':0,'parentMediaViews':0}
(main/'tasks/evidence/AVOID-009/flag-media12').mkdir(exist_ok=True);(main/'tasks/evidence/AVOID-009/flag-media12/parent-local-review13.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
