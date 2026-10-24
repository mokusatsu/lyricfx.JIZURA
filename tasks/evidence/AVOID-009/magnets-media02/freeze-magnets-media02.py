from pathlib import Path
import json,hashlib,datetime,shutil
root=Path('/workspace/lyricfx.JIZURA');base=Path('/dev/shm/avoid009-evening-20261024');src=Path('/tmp/avoid009-magnets-media-prep02');dest=root/'tasks/evidence/AVOID-009/magnets-media02';dest.mkdir(exist_ok=True)
sha=lambda b:hashlib.sha256(b).hexdigest();files=[]
def add(key,path,expected=None):
 p=Path(path);b=p.read_bytes();h=sha(b)
 if expected:assert h==expected,(key,h)
 files.append({'key':key,'path':str(p),'bytes':len(b),'sha256':h})
add('runner',src/'capture.cjs','64148e5117ed2b349e3a920f24ceb059e1b66c2eee0b984c55f7a6415e651a34');add('hooks',src/'browser-hooks.js');add('html-ja',src/'index.html');add('html-en',src/'en.html');add('rootHTML',base/'native-base-c595.html','0aa8b2522c38ba268e4b1ea7f5a9a1f010c3b8f7e4446e1980ba9e93b9a8ae3b')
add('proof29',root/'src/11p_layoutsEa_magnets_proof29.js','53618e88c310f2655cbebe289480f23450cfd3f3ed9d3bbec833d3aa3724b96a');add('adapter29',root/'src/11p_layoutsEb_magnets_adapter29.js','98e7544e662c8925673af65db445c96b43c196826170cdc11776eb54cef49cdf')
for key,path in [('fixture','dev/avoidance/layouts-b-fixture.js'),('fontManifest','dev/avoidance/layouts-c-editorial-fonts/manifest.json'),('browserLauncher','dev/browser.cjs')]:add(key,root/path)
for key,path in [('chromium','/usr/bin/chromium'),('ffmpeg','/usr/bin/ffmpeg'),('ffprobe','/usr/bin/ffprobe')]:add(key,path)
fonts=json.loads((root/'dev/avoidance/layouts-c-editorial-fonts/manifest.json').read_text());assets=[]
for f in fonts['faces']:
 key='font-'+f['id'];url=f['url'];assert url.startswith('/')and'..'not in url;add(key,root/url[1:],f['sourceSHA256']);assets.append({'url':url,'key':key})
pins=json.load(open('/tmp/avoid009-evening-magnets33/evidence/pins33.json'))
for i,p in enumerate(pins['files']):add('canonical-input-'+str(i),root/p['path'],p['sha256'])
runtime=json.load(open(root/'tasks/evidence/AVOID-009/balloons-diagnostic03/evidence/baseline-pins03.json'))
for i,p in enumerate(runtime['runtimeExternalPins']):add('browser-runtime-'+str(i),p['path'],p['sha256'])
encoder=json.load(open(root/'tasks/evidence/AVOID-009/balloons-media11/evidence/pins11.json'))
for i,p in enumerate(encoder['encoderPins']):add('encoder-runtime-'+str(i),p['path'],p['sha256'])
seal={'status':'PARENT_ACCEPTED_FROZEN_INPUTS','build':'magnets-native-20261024-01','sourceProduct':'3b670587e142f7c88b009d687a032e1081d10f5b','sourceFixture':'raw21-native4-1205','adapterRevision':'magnets-native-two-group-v1','afterOverlays':['proof29','adapter29'],'files':files,'localAssets':assets,'sourceRawAccepted':['32 full250/native727','33 canonicalJAEN representative18each'],'publicResultChecks':0}
sp=dest/'seal.media02.json';assert not sp.exists();sp.write_text(json.dumps(seal,indent=2)+'\n');gate={'source29Accepted':True,'mediaRunnerAccepted':True,'sealSHA256':sha(sp.read_bytes()),'parentRawReview':'tasks/evidence/AVOID-009/magnets-evening32/parent-native32-review.json + magnets-evening33/parent-canonical33-review.json','productCommit':seal['sourceProduct'],'visualHuman':'pending','publicChecks':0};gp=dest/'parent-media-gate02.json';assert not gp.exists();gp.write_text(json.dumps(gate,indent=2)+'\n');shutil.copytree(src,dest/'source-preparation',dirs_exist_ok=True);print(json.dumps({'seal':str(sp),'sealSHA256':sha(sp.read_bytes()),'gate':str(gp),'gateSHA256':sha(gp.read_bytes()),'files':len(files),'fonts':len(assets)}))
