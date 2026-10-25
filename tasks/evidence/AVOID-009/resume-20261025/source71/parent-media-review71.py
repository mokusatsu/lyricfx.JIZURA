"""Parent numeric/raw review only. Never displays media or accesses a network."""
import collections,gzip,hashlib,json,pathlib,runpy,struct,sys,time,traceback
from fractions import Fraction
ROOT=pathlib.Path('/workspace/lyricfx.JIZURA');E=ROOT/'tasks/evidence/AVOID-009/resume-20261025'
P=runpy.run_path(str(E/'parent-local-review69.py'));exact=P['exact'];restore=P['restore'];Q=Fraction.from_float
PROGRESS={}
def review(folder,out):
 m=json.loads((folder/'manifest.json').read_bytes());assert m['mode']=='media71-two-representatives';seal=json.loads((folder.parent/'reviewed-seal.json').read_bytes());accepted=json.loads((E/'parent-bulbs69-canonical70-acceptance01.json').read_bytes());assert accepted['accepted'] and accepted['HTML']==seal['root']['oldHTML'];assert hashlib.sha256((E/'parent-bulbs69-canonical70-acceptance01.json').read_bytes()).hexdigest()==seal['acceptanceSHA256']
 correction=folder.parent/'parent-review-recovery71.json';correction=json.loads(correction.read_bytes()) if correction.exists() else None
 if correction:
  assert correction['sourceArchiveCommit']=='ad866b427c1c3d8d2f3b45ff5cbc484e77f6afb6' and correction['originalSealSHA256']==hashlib.sha256((folder.parent/'reviewed-seal.json').read_bytes()).hexdigest();assert correction['oldManifestSHA256']==hashlib.sha256((folder/'manifest.json').read_bytes()).hexdigest()
 for pin in seal['files']:
  digest=hashlib.sha256((ROOT/pin['path']).read_bytes()).hexdigest()
  if correction and pin['path']=='tasks/evidence/AVOID-009/resume-20261025/source71/parent-media-review71.py':assert pin['sha256']==correction['previousCheckerSHA256'] and digest==correction['correctedCheckerSHA256']
  else:assert digest==pin['sha256']
 cases={'upper':{'circle':{'cx':480.,'cy':108.,'r':108.,'margin':2.7},'id':'one-row-compact','side':'bottom'},'right':{'circle':{'cx':720.,'cy':.42*540,'r':108.,'margin':2.7},'id':'two-row-native','side':'left'}};clocks={};winners={};qualified={};encoded={};phases=collections.Counter();stats=collections.Counter();tables={};case=None;epoch=None;sequence={};keybytes=collections.Counter();total=0;last=time.monotonic()
 for row in m['records']:
  z=(folder/row['file']).read_bytes();assert len(z)==row['bytes'] and hashlib.sha256(z).hexdigest()==row['sha256'];raw=gzip.decompress(z);assert len(raw)==row['JSONBytes'];total+=len(raw);assert total<=268435456;r=json.loads(raw)
  if r['case']!=case:
   case=r['case'];assert case in ['upper.qualify','right.qualify','upper.encode','right.encode'];tables={k:[] for k in ['matrix','paint','catalog']};keybytes=collections.Counter()
   if epoch is not None:assert r['tableEpoch']==epoch+1
   epoch=r['tableEpoch']
  assert r['tableEpoch']==epoch and r['sequence']==row['sequence']==sequence.get(case,-1)+1;sequence[case]=r['sequence']
  for k,values in r['tableDeltas'].items():
   for v in values:assert v['id']==len(tables[k]);tables[k].append(v['value']);keybytes[k]+=len(json.dumps(v['value'],ensure_ascii=False,separators=(',',':')).encode('utf-8','backslashreplace'))
   assert len(tables[k])==r['tableStats'][k]['entries']<=100000 and keybytes[k]==r['tableStats'][k]['canonicalKeyBytes']<=67108864
  v=restore(r['binding'],tables);phase=v['phase'];assert phase==row['phase'];phases[phase]+=1;example=case.split('.')[0];PROGRESS.update(records=sum(phases.values()),phase=phase,case=case,stats=dict(stats),producerErrors=m['errors'])
  if phase=='init':
   P['clock'](v['clocks']);p=v['plan'];assert (p['lang'],p['W'],p['H'],p['duration'],p['fps'],p['cuts'][0]['text'],p['cuts'][0]['seed'])==('ja',960,540,4.150001,60,'風の先へ',1205);assert (p['cuts'][0]['renderStart'],p['cuts'][0]['start'],p['cuts'][0]['dur'],p['cuts'][0]['inDur'],p['cuts'][0]['outDur'])==(0,0,4,.35,.4)
   if example in clocks:assert exact(clocks[example])==exact(v['clocks'])
   clocks[example]=v['clocks'];stats['initializations']+=1
  elif phase=='focused-baseline-proof':
   t=v['trajectory'];assert t['safety']=='certified-bounded-adapter';cert=t['certificate'];winner=cert['winner'];wanted=cases[example];assert winner['recipe']['id']==wanted['id'] and winner['recipe']['scale']==1 and winner['side']==wanted['side'];assert exact(cert['region']['circle'])==exact(wanted['circle']);assert cert['destination']['complete'];rows=[x for x in v['proof'] if x['phase']=='recipe-complete'];assert len(rows)==4 and all(x['table']['complete'] and x['table']['qualityPassed'] for x in rows);winners[example]=winner
  elif phase=='media-time-qualified':
   j=int(v['j']);assert v['j']==j and 0<=j<250 and v['example']==example and v['time']==j/60 and (example,j) not in qualified;a,b,d=v['before'],v['native'],v['after'];assert a['SHA256']==b['SHA256'];assert all(x['j']==j and x['time']==j/60 for x in [a,b,d]);oracle=d['oracle'];assert oracle['n']==j and oracle['firstTime']==j/60 and d['SHA256']==oracle['oracleSHA256'];assert exact(oracle['delta'])==exact(winners[example]['delta'])
   state=next(s for s in clocks[example]['states'] if s['n']==j);expected=[p for p in state['passes'] if p['active']];passes=[p['pass'] for p in expected];assert all(x['expectedPasses']==passes for x in [a,b,d]);assert [o['pass'] for o in d['observations']]==passes==[o['pass'] for o in oracle['passes']]
   for own,obs,reference in zip(expected,d['observations'],oracle['passes']):
    assert obs['realTime']==j/60 and obs['sourceAdapter']=='bulbs-finite-live-source-v69' and obs['safety']=='safe';assert exact(obs['root'])==exact(reference['root']);assert all(reference[k]==own[k] for k in ['pass','tp','lt','ltb','step']);clamp=lambda x:0. if x<0 else 1. if x>1 else x;assert exact(reference['pIn'])==exact(clamp(own['lt']/max(.01,.35))) and exact(reference['pOut'])==exact(clamp((own['lt']-(4-.4))/.4));circle=cases[example]['circle'];cx,cy=Q(circle['cx']),Q(circle['cy']);rr=(Q(circle['r'])+Q(circle['margin']))**2
    for paint in obs['preflightPaint']:
     assert paint['pass']==own['pass'] and paint['role']=='primary' and paint['owner'].startswith('bulbs.sign.')
     if paint['state']['alpha']<=0:continue
     bound=P['box'](P['geom'](paint));assert bound['x0']>=0 and bound['y0']>=0 and bound['x1']<=960 and bound['y1']<=540;nx=min(max(cx,bound['x0']),bound['x1']);ny=min(max(cy,bound['y0']),bound['y1']);assert (cx-nx)**2+(cy-ny)**2>rr;stats['independentPositivePaintSupports']+=1
   qualified[example,j]={'before':a['SHA256'],'after':d['SHA256'],'sequence':r['sequence']};stats['qualifiedFrames']+=1
  elif phase=='encoded-frame':
   j=int(v['j']);side=v['side'];key=(example,side,j);assert v['example']==example and side in ['before','after'] and 0<=j<250 and v['j']==j and v['time']==j/60 and key not in encoded;ref=qualified[example,j];assert v['SHA256']==ref[side] and v['qualifiedCase']==example+'.qualify' and v['qualifiedSequence']==ref['sequence'];assert v['PNGBytes']>0 and len(v['PNGSHA256'])==64;encoded[key]=v;stats['encodedFrames']+=1
  else:assert phase in ['failure-partial','finalize-exception']
  if time.monotonic()-last>25:print(json.dumps({'mediaRecords':sum(phases.values()),'stats':dict(stats)}),flush=True);last=time.monotonic()
 if m['complete']:
  assert not m['errors'] and total==m['serializedBytes'];assert stats['initializations']==4 and stats['qualifiedFrames']==500 and stats['encodedFrames']==1000 and len(winners)==2;assert m['completed']=={'qualified':500,'encodedFrames':1000,'videos':4};assert len(m['videos'])==4
  for name,item in m['videos'].items():
   example,side=name.split('-');assert example in cases and side in ['before','after'];file=folder/item['path'];b=file.read_bytes();assert len(b)==item['bytes'] and hashlib.sha256(b).hexdigest()==item['sha256'];probe=item['probe'];assert len(probe['streams'])==1;s=probe['streams'][0]
   for k,wanted in {'codec_name':'h264','width':960,'height':540,'r_frame_rate':'60/1','avg_frame_rate':'60/1','sample_aspect_ratio':'1:1','pix_fmt':'yuv420p'}.items():assert s[k]==wanted
   assert int(s['nb_read_frames'])==250 and len(probe['frames'])==250 and abs(float(s['duration'])-250/60)<=1e-6 and 250/60-1e-6<=float(probe['format']['duration'])<=250/60+.001001;tb=Fraction(s['time_base'])
   for j,f in enumerate(probe['frames']):assert f['media_type']=='video' and int(f['best_effort_timestamp'])*tb==Fraction(j,60)
  assert len(m['staticFiles'])==12 and {p['path'] for p in m['staticFiles']}=={f'images/{example}-{side}-{j:03}.png' for example in cases for side in ['before','after'] for j in [14,90,231]}
  for item in m['staticFiles']:
   name=pathlib.PurePosixPath(item['path']);assert name.parent==pathlib.PurePosixPath('images');example,side,frame=name.stem.split('-');j=int(frame);assert example in cases and side in ['before','after'] and j in [14,90,231];b=(folder/item['path']).read_bytes();assert len(b)==item['bytes'] and hashlib.sha256(b).hexdigest()==item['sha256']==encoded[example,side,j]['PNGSHA256'];assert b[:8]==b'\x89PNG\r\n\x1a\n' and struct.unpack('>II',b[16:24])==(960,540)
  expected={'index.html'}|{f'{kind}/{example}-{side}.{ext}' for example in cases for side in ['before','after'] for kind,ext in [('videos','mp4'),('posters','png')]};assert {p['path'] for p in m['publicFiles']}==expected and len(m['publicFiles'])==9
  for item in m['publicFiles']:
   b=(folder/'public'/item['path']).read_bytes();assert len(b)==item['bytes'] and hashlib.sha256(b).hexdigest()==item['sha256']
   if item['path'].startswith('posters/'):
    example,side=pathlib.PurePosixPath(item['path']).stem.split('-');assert item['sha256']==encoded[example,side,90]['PNGSHA256']
 result={'state':'PASS_MEDIA71_RAW_NUMERIC' if m['complete'] else 'PASS_MEDIA71_STORED_PREFIX_PRODUCER_FAILED','producerComplete':m['complete'],'producerErrors':m['errors'],'records':sum(phases.values()),'storedJSONBytes':total,'phases':dict(phases),'stats':dict(stats),'native60fpsVideos':4 if m['complete'] else 0,'staticFrames':12 if m['complete'] else 0,'humanMotionReview':'pending','freshVisualReview':'pending','foundation':'conditional captured CTM/TextMetrics support; no universal raster bound','formalPerformanceAccepted':False,'saveBodyAccepted':False,'whole009Complete':False,'publicChecks':0,'postSaveReachabilityChecks':0,'parentImages':0};out.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
if __name__=='__main__':
 out=pathlib.Path(sys.argv[2])
 try:review(pathlib.Path(sys.argv[1]),out)
 except BaseException as e:
  result={'state':'PARENT_MEDIA71_RAW_REVIEW_FAILED','type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc(),'progress':PROGRESS,'parentImages':0,'publicChecks':0};out.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result));raise SystemExit(1)
