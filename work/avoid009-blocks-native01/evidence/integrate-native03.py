from pathlib import Path
import json,hashlib,gzip,subprocess,os,datetime,sys
R=Path('/workspace/lyricfx.JIZURA');D=R/'work/avoid009-blocks-native01';sha=lambda b:hashlib.sha256(b).hexdigest()
sys.path.insert(0,str(R))
from app.english import localize_js
pins=json.loads((D/'evidence/baseline-pins03.json').read_text());accepted=json.loads((R/'tasks/evidence/AVOID-009/blocks-native01/parent-native03-review.json').read_text());raw=json.loads(gzip.decompress((D/'evidence/native03.raw.json.gz').read_bytes()))
assert sha((D/'evidence/native03.raw.json.gz').read_bytes())==accepted['rawSHA256'];assert accepted['exit']==0 and accepted['safeAdapterCountIncrement']==0
for f in pins['files']:assert sha((R/f['path']).read_bytes())==f['sha256'],f['path']
old={p:(R/p).read_bytes() for p in ['src/09a_placement.js','src/11p_layoutsD.js','index.html','en/index.html']}
assert old['src/09a_placement.js']==(D/'evidence/09a_placement.before.js').read_bytes()
assert old['src/11p_layoutsD.js']==(D/'evidence/11p_layoutsD.before.js').read_bytes()
new={p:(D/p).read_bytes() for p in ['src/09a_placement.js','src/11p_layoutsD.js']}
other={str(p.relative_to(R)):sha(p.read_bytes()) for p in (R/'src').glob('*.js') if str(p.relative_to(R)) not in new};assert len(other)==97
pyc=lambda:{str(p.relative_to(R)):sha(p.read_bytes()) for p in (R/'app').rglob('*.pyc')};pycBefore=pyc()
absent=json.loads((R/'tasks/evidence/AVOID-009/revisions-20261024/pile-exit13/parent-integration13.json').read_text())['absentSkipArchives'];assert len(absent)==22 and all(not(R/p).exists() for p in absent)
buildpaths=['build.py','app/english.py','app/english.js','app/body.html','app/style.css','vendor/mp4-muxer.min.js','assets/effect-preview.png'];buildpins=[{'path':p,'bytes':(R/p).stat().st_size,'sha256':sha((R/p).read_bytes())} for p in buildpaths]
expectedJA=old['index.html'].decode();expectedEN=old['en/index.html'].decode()
for p,b in new.items():
 before=old[p].decode();after=b.decode();assert expectedJA.count(before)==1;expectedJA=expectedJA.replace(before,after)
 beforeEN=localize_js(before,p);afterEN=localize_js(after,p);assert expectedEN.count(beforeEN)==1,p;expectedEN=expectedEN.replace(beforeEN,afterEN)
assert sha(expectedJA.encode())==raw['invocation']['htmlSHA256']['after']
receipt={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'baseCanonicalRef':'37bf5d98','nativeFidelityParentReview':accepted,'before':[{'path':p,'bytes':len(b),'sha256':sha(b)} for p,b in old.items()],'buildInputs':buildpins,'other97SourceBefore':other,'pycacheBefore':pycBefore,'absentSkipArchives':absent,'scope':'two reviewed source files + ordinary offline JAEN build; no Git/browser/media/public checks'}
for p,b in new.items():(R/p).write_bytes(b)
env=os.environ.copy();env['PYTHONDONTWRITEBYTECODE']='1'
process=subprocess.run([sys.executable,'build.py'],cwd=R,env=env,capture_output=True,text=True)
receipt['build']={'args':['python','build.py'],'PYTHONDONTWRITEBYTECODE':'1','exit':process.returncode,'stdout':process.stdout,'stderr':process.stderr}
assert process.returncode==0,receipt['build']
assert (R/'index.html').read_bytes()==expectedJA.encode(),'JA differs from exact tested standalone03'
assert (R/'en/index.html').read_bytes()==expectedEN.encode(),'EN differs from exact localized two-source substitution'
for p,b in new.items():assert(R/p).read_bytes()==b,p
for p,h in other.items():assert sha((R/p).read_bytes())==h,p
assert pyc()==pycBefore,'Existing app pycache changed or new pyc appeared'
assert all(not(R/p).exists() for p in absent)
for f in buildpins:assert sha((R/f['path']).read_bytes())==f['sha256'],f['path']
receipt.update({'after':[{'path':p,'bytes':(R/p).stat().st_size,'sha256':sha((R/p).read_bytes())} for p in old],'reviewedSourceExact':True,'JAExactTestedStandalone03':True,'ENExactLocalizedTwoSourcePatch':True,'other97SourceUnchanged':True,'pycacheUnchanged':True,'absent22Unchanged':True,'safeAdapterCountIncrement':0,'humanMotionReviewRequired':False,'publicChecks':0,'browserRuns':0,'imagesViewed':0})
(D/'evidence/integration-native03.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:receipt[k] for k in ['reviewedSourceExact','JAExactTestedStandalone03','ENExactLocalizedTwoSourcePatch','other97SourceUnchanged','pycacheUnchanged','absent22Unchanged','safeAdapterCountIncrement','build']},ensure_ascii=False))
