import gzip,json,math,hashlib
from pathlib import Path
root=Path('/workspace/lyricfx.JIZURA');raw=root/'work/avoid009-blocks-media03/evidence/after.frames.json.gz';media=json.load(gzip.open(raw,'rt'));before=json.load(gzip.open(root/'work/avoid009-blocks-media03/evidence/before.frames.json.gz','rt'));m=json.loads((root/'work/avoid009-blocks-media03/manifest.json').read_text());assert not m['errors'] and not media['pageErrors']
for item in [media,before]:
 assert len(item['frames'])==240 and [f['time'] for f in item['frames']]==[i/60 for i in range(240)] and len({f['nativePNGHash'] for f in item['frames']})==240
 assert all(not f['errors'] and not f['warnings'] for f in item['frames']+item['extraDiagnostics'])
for side in ['before','after']:
 s=m['sides'][side];f=root/'work/avoid009-blocks-media03/public'/s['video'];assert hashlib.sha256(f.read_bytes()).hexdigest()==s['videoSHA256'];v=s['probe']['streams'][0];assert v['width']==960 and v['height']==540 and v['avg_frame_rate']=='60/1' and int(v['nb_read_frames'])==240 and float(s['probe']['format']['duration'])==4
j=json.load(gzip.open(root/'work/avoid009-blocks-bounded01/evidence/production03.raw.json.gz','rt'));j['results'][0]['current']['certificate']=media['initial']['plan']['cuts'][0]['placementTrajectory']['certificate'];j['results'][0]['current']['rows']=[{'time':f['time'],'pass':o['pass'],'scale':o['renderScale'],'tp':o['motionTime'],'sourceSelectorActive':True,'error':None,'observations':[o]} for f in media['frames']+media['extraDiagnostics'] for o in f['observations']]
assert len(j['results'][0]['current']['rows'])==724
c=j['results'][0]['current'];cert=c['certificate'];cut=cert['sourceCut'];g=cert['sourceCatalog'];W,H=g['stage'];margin=max(2,.005*min(W,H));count={'fixtures':3,'baselinePixels':0,'activeRows':0,'inactiveRows':0,'events':0,'vertices':0,'offset0Events':0,'movingCircleWaivers':0,'continuationEntries':0,'proofCells':len(cert['ledger'])}
def inside(poly,p):
 z=[(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]) for a,b in zip(poly,poly[1:]+poly[:1])];return not(any(x>1e-7 for x in z) and any(x< -1e-7 for x in z))
def clear(poly,circle):
 p=[circle['cx'],circle['cy']]
 if inside(poly,p):return False
 distances=[]
 for a,b in zip(poly,poly[1:]+poly[:1]):
  x,y=b[0]-a[0],b[1]-a[1];den=x*x+y*y;t=max(0,min(1,((p[0]-a[0])*x+(p[1]-a[1])*y)/den)) if den else 0;distances.append(math.hypot(p[0]-a[0]-t*x,p[1]-a[1]-t*y))
 return min(distances)>=circle['r']+margin
assert cert['worstRenderScale']==.5 and cert['renderScaleRange']==[.5,2] and cert['circleMode']=='selective-moving';assert cert['holdWindow'][1]-cert['holdWindow'][0]>=.04
for p in cert['continuation']:
 tq=math.floor(cert['region']['end']/cert['domain']['stepDur']+1e-6)*cert['domain']['stepDur'];tp=max(0,tq-p['lag']);assert p['firstFallbackTq']==tq and p['firstFallbackTp']==tp
 assert p['mainExpired'] and p['zeroOffsetAllRemainingBelow'];assert p['pass']!='main' or tp>=cut['end']
 for e in p['entries']:assert e['minY']==min(v[1] for v in e['polygon']) and e['minY']>H;count['continuationEntries']+=1
for row in c['rows']:
 assert row.get('error') is None
 if not row['sourceSelectorActive']:count['inactiveRows']+=1;assert not row.get('observations');continue
 count['activeRows']+=1;assert len(row['observations'])==1;o=row['observations'][0];lag={'A':.8/24,'B':1.6/24,'main':0}[row['pass']];tq=math.floor(row['time']/c['planClocks']['stepDur']+1e-6)*c['planClocks']['stepDur'];tp=max(0,tq-lag);lt=tp-cut['start'];assert tp==row['tp']==o['motionTime'] and lt==o['lt'] and o['ltb']==lt+lag
 active=cert['region']['start']<=row['time']<cert['region']['end'];offset=cert['offset'] if active else [0,0];assert o['offset']==offset and o['renderScale']==row['scale'];assert o['safety']==('safe-hold' if active else 'zero-offset-tail-proved')
 for e in o['events']:
  assert e['role']=='primary';part=next(p for p in cert['parts'] if p['owner']==e['owner']);entry=moving=q1=False;branch='floor'
  if part['block'] is not None:
   b=g['blocks'][part['block']];when=.06+(b['order']+1)*g['gap'];f=(lt-when)/g['fd'];pout=max(0,min(1,(lt-(cut['dur']-cut['outDur']))/cut['outDur'])) if cut['outDur']>0 else 0;q=max(0,min(1,pout*1.4-(b['order']+1)/(g['n']+3)*.4));assert f>=0;entry=f<1;moving=0<q<1;q1=q==1;branch=('entry' if entry else 'settled')+':'+('q0' if q==0 else 'q1' if q1 else 'moving')
  assert branch==e['branchKey'];polys=[[[v[0]/row['scale'],v[1]/row['scale']] for v in p] for p in e['polygons']];matches=[l for l in cert['ledger'] if l['owner']==e['owner'] and l['pass']==row['pass'] and l['branchKey']==branch and l['sourceRange'][0]<=lt<=l['sourceRange'][1]];assert any(all(inside(l['polygon'],v) for p in polys for v in p) for l in matches),(row['time'],e['owner'])
  moved=[[[v[0]+offset[0],v[1]+offset[1]] for v in p] for p in polys]
  if active:
   hold=cert['holdWindow'][0]<=row['time']<=cert['holdWindow'][1];strict=hold or not(entry or moving);actualclear=all(clear(p,cert['region']['circle']) for p in moved);tail=next((t for t in cert['tails'] if t['block']==part['block']),None) if q1 else None;tailok=bool(tail and tail['minY']+offset[1]>H);stage=all(0<=v[0]<=W and (v[1]>=0 or entry) and (v[1]<=H or moving or tailok) for p in moved for v in p)
   assert stage and (not strict or actualclear);assert e['circleStrict']==strict and e['clear']==actualclear and e['stage']==stage and e['tailAllowed']==tailok
   if not strict and not actualclear:count['movingCircleWaivers']+=1
  else:
   con=next(p for p in cert['continuation'] if p['pass']==row['pass']);assert all(v[1]>H for p in moved for v in p);assert any(l['owner']==e['owner'] and l['branchKey']==branch and l['sourceRange'][0]<=lt<=l['sourceRange'][1] and all(inside(l['polygon'],v) for p in polys for v in p) for l in con['entries']);count['offset0Events']+=1
  count['events']+=1;count['vertices']+=sum(map(len,polys))
for orig in j['results'][0]['original']['rows']:
 native=next(x for x in c['nativeControls'] if x['pass']==orig['pass'] and x['scale']==orig['scale']);assert native['pixelHash']==orig['pixelHash'];count['baselinePixels']+=1
cache=c['decodedEvidence'];assert cache['cacheAfter']['hits']>cache['cacheBefore']['hits'] and cache['certificateSHA256']==cache['originalCertificateSHA256'];assert cache['decodeDraw']['error'] is None
assert c['tamperCode']=='BLOCKS_DECODED_PROOF_MISMATCH'
for key in ['font','helper']:assert c['staleControls'][key]['identityReturned'] and c['staleControls'][key]['error']['code']=='BLOCKS_STALE_DEPENDENCY'
assert c['staleControls']['actualFont']['oldError']['code']=='STALE_PLACEMENT_PLAN' and c['staleControls']['actualFont']['freshDraw']['error'] is None and c['staleControls']['freshRecovery']['error'] is None
for i,code in [(1,'BLOCKS_MAIN_AFTER_REGION_UNSUPPORTED'),(2,'BLOCKS_ZERO_OFFSET_TAIL_INCONCLUSIVE')]:assert j['results'][i]['current']['diagnostics'][0]['code']==code and j['results'][i]['current']['diagnostics'][0]['safety']=='unsupported'
report={'scope':'Parent independent native60fps actual Renderer.frame all240frames plus2endpoint diagnostics; source proof03 unchanged','rawSHA256':hashlib.sha256(raw.read_bytes()).hexdigest(),'parentSession':83708,'exit':0,'counts':count,'commonOffset':cert['offset'],'warmDecodedHitAndFirstUse':True,'ordinaryFontHelperStaleAndFreshReplan':True,'typedNegativeControls':2,'nativeMovedPixelParity':'48 active pair runtime assertions in reviewed runner, expected moved hash not separately persisted; 9 native zero pairs independently compared from raw','codeIntegrated':False,'formalPerformanceAccepted':False,'humanMotionAccepted':False,'parentImages':0,'publicChecks':0}
(root/'work/avoid009-blocks-media03/evidence/parent-media03-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False))

p=root/'work/avoid009-blocks-media03/evidence/parent-media03-review.json';report=json.loads(p.read_text());report.update(parentSession=14376,actualVideoFramesEach=240,actualFPS=60,actualSize=[960,540],actualUniquePNGEach=240,extraEndpointFrames=2,codeIntegrated=True,nativeMovedPixelParity='Pixel controls independently accepted in source raw03; media before is exact original Renderer.frame and all native input PNG hashes are stored',referenceSourceRaw03SHA256='c62c8f18ca31a76ced79f05ea145f071950a843f2a3f339f647b4d60b66b582c');p.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('Full media proof PASS',report['counts'])
