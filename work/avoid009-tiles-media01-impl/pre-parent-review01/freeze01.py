"""SOURCE ONLY. Parent executes only after full source review in keeper8802.
Produces an intrinsically pending seal; parent independently reviews and authorizes it.
Arguments: finalHEAD finalIndexSHA outputSealSHM. No gate or release is generated.
"""
from pathlib import Path
import sys,json,hashlib,subprocess
ROOT=Path('/workspace/lyricfx.JIZURA');SRC=ROOT/'work/avoid009-tiles-media01-impl';BASE=Path('/dev/shm/avoid009-evening-20261024')
def main():
 head,index,out=sys.argv[1:];out=Path(out);assert out.parent==BASE and not out.exists()
 assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()==head
 sha=lambda b:hashlib.sha256(b).hexdigest();assert sha((ROOT/'.git/index').read_bytes())==index
 files=[]
 def add(key,p,expected=None):
  p=Path(p);assert p.is_absolute() and not str(p).startswith('/proc/');b=p.read_bytes();h=sha(b)
  if expected:assert h==expected,(str(p),h)
  files.append({'key':key,'path':str(p),'bytes':len(b),'sha256':h})
 for key,name in [('runner','capture01.cjs'),('hooks','browser-hooks01.js'),('html-ja','index.html'),('html-en','en.html'),('projection','public-manifest-projection01.cjs'),('freezer','freeze01.py')]:add(key,SRC/name)
 for key,p in [('fixture','dev/avoidance/layouts-b-fixture.js'),('fontManifest','dev/avoidance/layouts-c-editorial-fonts/manifest.json'),('browserLauncher','dev/browser.cjs'),('afterHTML','index.html'),('acceptedExercise48','tasks/evidence/AVOID-009/tiles-adapter48/source48/runner/exercise48.js'),('nativeOracle','tasks/evidence/AVOID-009/tiles-canonical49/source49/runner/oracle49.cjs'),('accepted49Raw','tasks/evidence/AVOID-009/tiles-canonical49/tiles49.raw.json.xz'),('parentReview49','tasks/evidence/AVOID-009/tiles-canonical49/parent-review49.json'),('index','.git/index')]:add(key,ROOT/p)
 frozen=json.loads((ROOT/'tasks/evidence/AVOID-009/tiles-adapter48/frozen-native-before48.json').read_text())[0];add('beforeHTML',frozen['frozen'],frozen['sha256'])
 pins=json.loads((ROOT/'tasks/evidence/AVOID-009/tiles-canonical49/post-pins49.json').read_text())
 for i,p in enumerate(pins['files']+pins['pycache']):add('canonical-'+str(i),ROOT/p['path'],p['sha256'])
 runtime=json.loads(Path(pins['runtimeAbsoluteReference']).read_text());add('runtimeReference',pins['runtimeAbsoluteReference'],pins['runtimeReferenceSHA256'])
 for i,p in enumerate(runtime['runtimeExternalPins']):add('browser-runtime-'+str(i),p['path'],p['sha256'])
 encoder=json.loads((ROOT/'tasks/evidence/AVOID-009/balloons-media11/evidence/pins11.json').read_text())
 for i,p in enumerate(encoder['encoderPins']):add('encoder-runtime-'+str(i),p['path'],p['sha256'])
 for key,p in [('node',pins['localNode']['path']),('chromium',runtime['browser']['path']),('ffmpeg','/usr/bin/ffmpeg'),('ffprobe','/usr/bin/ffprobe'),('xz','/usr/bin/xz')]:add(key,p)
 fonts=json.loads((ROOT/'dev/avoidance/layouts-c-editorial-fonts/manifest.json').read_text());assets=[]
 for f in fonts['faces']:
  key='font-'+f['id'];url=f['url'];assert url.startswith('/') and '..' not in url;add(key,ROOT/url[1:],f['sourceSHA256']);assets.append({'url':url,'key':key})
 absent=[str(ROOT/p) for p in pins['absent57']];assert len(absent)==57 and all(not Path(p).exists() for p in absent)
 seal={'status':'PENDING_PARENT_REVIEW_NOT_EXECUTABLE','build':'tiles-native-20261025-01','root':str(ROOT),'head':head,'indexSHA256':index,'sourceProduct':head,'sourceFixture':'tiles48-native4-right-score-1205','adapterRevision':'tiles-native-fixed-number-v1','afterOverlays':[],'files':files,'localAssets':assets,'protectedAbsent':absent,'publicChecks':0}
 out.write_text(json.dumps(seal,indent=2)+'\n');print(json.dumps({'seal':str(out),'sha256':sha(out.read_bytes()),'status':seal['status']}))
if __name__=='__main__':main()
