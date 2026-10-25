from pathlib import Path
import json,hashlib,gzip,subprocess,os,datetime,sys
R=Path('/workspace/lyricfx.JIZURA');D=R/'work/avoid009-balloons-native01';sha=lambda b:hashlib.sha256(b).hexdigest()
sys.path.insert(0,str(R));from app.english import localize_js
pins=json.loads((D/'evidence/baseline-pins01.json').read_text());seal=json.loads((D/'evidence/pre-run-seal02.json').read_text());accepted=json.loads((R/'tasks/evidence/AVOID-009/balloons-native01/parent-native02-review.json').read_text());rawpath=D/'evidence/native02.raw.json.gz'
assert sha(rawpath.read_bytes())==accepted['rawSHA256']=='39bc12ac54c75f4f6fc54b1dc0209bf33b38a53e8fb8395e50eddfc3f53dd5f3'
assert accepted['exit']==0 and accepted['safeAdapterCountIncrement']==0
raw=json.loads(gzip.decompress(rawpath.read_bytes()));assert raw['summary']['failures']==0 and not raw['errors'] and raw['summary']['calls']==222
for f in pins['files']:assert sha((R/f['path']).read_bytes())==f['sha256'],f['path']
for f in seal['files']:assert sha((D/f['path']).read_bytes())==f['sha256'],f['path']
old={p:(R/p).read_bytes() for p in ['src/09a_placement.js','src/11p_layoutsD.js','index.html','en/index.html']}
assert old['src/09a_placement.js']==(D/'source02/09a_placement.before.js').read_bytes()
new={'src/09a_placement.js':(D/'source02/09a_placement.js').read_bytes(),'src/11p_layoutsD.js':(D/'src/11p_layoutsD.js').read_bytes()}
originalbody=(D/'evidence/native-balloons.before.js').read_bytes();newbody=(D/'evidence/native-balloons.after.js').read_bytes()
assert old['src/11p_layoutsD.js'].count(originalbody)==1
assert old['src/11p_layoutsD.js'].replace(originalbody,newbody)==new['src/11p_layoutsD.js']
other={str(p.relative_to(R)):sha(p.read_bytes()) for p in (R/'src').glob('*.js') if str(p.relative_to(R)) not in new};assert len(other)==99
pyc=lambda:{str(p.relative_to(R)):sha(p.read_bytes()) for p in (R/'app').rglob('*.pyc')};pycBefore=pyc();assert pycBefore['app/__pycache__/english.cpython-312.pyc']=='7390411f8a74499a4ef117d443f4c04f3814039cbb64343cb50c043cc580f898'
absent=pins['absent22Archives'];assert len(absent)==22 and all(not(R/p).exists() for p in absent)
buildpaths=['build.py','app/english.py','app/english.js','app/body.html','app/style.css','vendor/mp4-muxer.min.js','assets/effect-preview.png'];buildpins=[{'path':p,'bytes':(R/p).stat().st_size,'sha256':sha((R/p).read_bytes())} for p in buildpaths]
expectedJA=old['index.html'].decode();expectedEN=old['en/index.html'].decode()
for p,b in new.items():
 before=old[p].decode();after=b.decode();assert expectedJA.count(before)==1;expectedJA=expectedJA.replace(before,after)
 beforeEN=localize_js(before,p);afterEN=localize_js(after,p);assert expectedEN.count(beforeEN)==1;expectedEN=expectedEN.replace(beforeEN,afterEN)
assert sha(expectedJA.encode())==raw['invocation']['htmlSHA256']['after']
# Whole11p outside the balloons body must be byte-exact, retaining cards/pile/blocks.
assert old['src/11p_layoutsD.js'].split(originalbody)==new['src/11p_layoutsD.js'].split(newbody)
receipt={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'nativeFidelityParentReview':accepted,'before':[{'path':p,'bytes':len(b),'sha256':sha(b)} for p,b in old.items()],'buildInputs':buildpins,'other99SourceBefore':other,'pycacheBefore':pycBefore,'absentSkipArchives':absent,'scope':'two parent-accepted source files + ordinary offline JAEN build; no Git/browser/media/public checks'}
for p,b in new.items():(R/p).write_bytes(b)
env=os.environ.copy();env['PYTHONDONTWRITEBYTECODE']='1'
process=subprocess.run([sys.executable,'build.py'],cwd=R,env=env,capture_output=True,text=True)
receipt['build']={'args':['python3','build.py'],'PYTHONDONTWRITEBYTECODE':'1','exit':process.returncode,'stdout':process.stdout,'stderr':process.stderr}
assert process.returncode==0,receipt['build']
assert (R/'index.html').read_bytes()==expectedJA.encode(),'JA differs from accepted RAM afterHTML02'
assert (R/'en/index.html').read_bytes()==expectedEN.encode(),'EN differs from exact localized two-source substitution'
for p,b in new.items():assert(R/p).read_bytes()==b
for p,h in other.items():assert sha((R/p).read_bytes())==h
assert pyc()==pycBefore
assert all(not(R/p).exists() for p in absent)
for f in buildpins:assert sha((R/f['path']).read_bytes())==f['sha256']
receipt.update({'after':[{'path':p,'bytes':(R/p).stat().st_size,'sha256':sha((R/p).read_bytes())} for p in old],'reviewedSourceExact':True,'JAExactAcceptedRAMHTML02':True,'ENExactLocalizedTwoSourcePatch':True,'other99SourceUnchanged':True,'nonBalloons11pExactIncludingCardsPileBlocks':True,'pycacheUnchanged':True,'absent22Unchanged':True,'safeAdapterCountIncrement':0,'humanMotionReviewRequired':False,'publicChecks':0,'browserRuns':0,'imagesViewed':0,'gitMutations':0})
with (D/'evidence/integration-native02.json').open('x') as f:json.dump(receipt,f,ensure_ascii=False,indent=2);f.write('\n')
print(json.dumps({k:receipt[k] for k in ['reviewedSourceExact','JAExactAcceptedRAMHTML02','ENExactLocalizedTwoSourcePatch','other99SourceUnchanged','nonBalloons11pExactIncludingCardsPileBlocks','pycacheUnchanged','absent22Unchanged','safeAdapterCountIncrement','build']},ensure_ascii=False))
