from pathlib import Path
import json,hashlib,gzip,datetime,subprocess,os,sys
R=Path('/workspace/lyricfx.JIZURA');D=R/'work/avoid009-blocks-bounded01';sha=lambda b:hashlib.sha256(b).hexdigest()
raw=json.loads(gzip.decompress((D/'evidence/production03.raw.json.gz').read_bytes()));assert not raw['errors'] and len(raw['results'])==3
assert sha((D/'evidence/production03.raw.json.gz').read_bytes())=='c62c8f18ca31a76ced79f05ea145f071950a843f2a3f339f647b4d60b66b582c'
pins=json.loads((D/'evidence/baseline-pins03.json').read_text())
for p in pins['files']:assert sha((R/p['path']).read_bytes())==p['sha256'],p['path']
sourceFiles=sorted((R/'src').glob('*.js'));assert len(sourceFiles)==99
beforeSource={str(p.relative_to(R)):sha(p.read_bytes()) for p in sourceFiles}
outputs={p:(R/p).read_bytes() for p in ['index.html','en/index.html']}
new={'src/11p_layoutsCa_blocks_proof.js':D/'src/09y_layoutsD_blocks_proof03.js','src/11p_layoutsCb_blocks_adapter.js':D/'src/09z_layoutsD_blocks_adapter03.js'}
assert all(not(R/p).exists() for p in new)
assert sha(next(iter(new.values())).read_bytes())=='dae7e2d1e4e444e3449f53139d600868f854a9d035617a2547c81f006936bae5'
assert sha(list(new.values())[1].read_bytes())=='e25c8d0e1582dec2026c36f27a662300ee465f2eec299525864f82e718716264'
helper=list(new.values())[0].read_text();adapter=list(new.values())[1].read_text();native=(R/'src/11p_layoutsD.js').read_text();injection=helper+'\n'+adapter+'\n'+native
assert outputs['index.html'].decode().count(native)==1 and outputs['en/index.html'].decode().count(native)==1
expectedJA=outputs['index.html'].decode().replace(native,injection).encode();expectedEN=outputs['en/index.html'].decode().replace(native,injection).encode()
assert sha(expectedJA)==raw['invocation']['htmlSHA256']['after']
pyc=lambda:{str(p.relative_to(R)):sha(p.read_bytes()) for p in (R/'app').rglob('*.pyc')};pycBefore=pyc()
absent=json.loads((R/'tasks/evidence/AVOID-009/revisions-20261024/pile-exit13/parent-integration13.json').read_text())['absentSkipArchives'];assert len(absent)==22 and all(not(R/p).exists() for p in absent)
buildPaths=['build.py','app/english.py','app/english.js','app/body.html','app/style.css','vendor/mp4-muxer.min.js','assets/effect-preview.png'];buildPins={p:sha((R/p).read_bytes()) for p in buildPaths}
for dest,source in new.items():(R/dest).write_bytes(source.read_bytes())
order=[str(p.relative_to(R)) for p in sorted((R/'src').glob('*.js'))];i=order.index('src/11p_layoutsC.js');assert order[i:i+4]==['src/11p_layoutsC.js',*new.keys(),'src/11p_layoutsD.js']
env=os.environ.copy();env['PYTHONDONTWRITEBYTECODE']='1';p=subprocess.run([sys.executable,'build.py'],cwd=R,env=env,capture_output=True,text=True);assert p.returncode==0,(p.stdout,p.stderr)
assert (R/'index.html').read_bytes()==expectedJA,'JA differs from exactly tested memory afterHTML'
assert (R/'en/index.html').read_bytes()==expectedEN,'EN differs from originalEN+exact2source injection'
for path,h in beforeSource.items():assert sha((R/path).read_bytes())==h,path
for dest,source in new.items():assert(R/dest).read_bytes()==source.read_bytes(),dest
assert pyc()==pycBefore
assert all(not(R/path).exists() for path in absent)
for path,h in buildPins.items():assert sha((R/path).read_bytes())==h,path
receipt={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'MAIN2source exact addition + ordinary offlineJAEN build; parent review pending; noGit/media/public/browser','acceptedRunRawSHA256':sha((D/'evidence/production03.raw.json.gz').read_bytes()),'sourceCountBefore':99,'sourceCountAfter':len(order),'exactLoadOrder':order[i:i+4],'newSource':[{'path':dest,'bytes':(R/dest).stat().st_size,'sha256':sha((R/dest).read_bytes()),'isolatedSource':str(source.relative_to(R))} for dest,source in new.items()],'old99SourcePins':beforeSource,'old99SourcesUnchanged':True,'mainNative09a11pUnchanged':True,'beforeHTML':{path:{'bytes':len(b),'sha256':sha(b)} for path,b in outputs.items()},'afterHTML':{path:{'bytes':(R/path).stat().st_size,'sha256':sha((R/path).read_bytes())} for path in outputs},'JAExactTestedMemoryAfter':True,'ENExactOriginalPlus2Source':True,'build':{'args':['python','build.py'],'PYTHONDONTWRITEBYTECODE':'1','exit':p.returncode,'stdout':p.stdout,'stderr':p.stderr},'buildInputsUnchanged':buildPins,'pycacheBeforeAfter':pycBefore,'pycacheUnchanged':True,'absent22Unchanged':absent,'GitMediaPublicBrowserOperations':0,'safeAdapterCountIncreaseNotClaimedByChild':True,'visualHumanApprovalNotClaimed':True,'performanceAcceptance':False}
(D/'evidence/main-integration03.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:receipt[k] for k in ['sourceCountAfter','exactLoadOrder','JAExactTestedMemoryAfter','ENExactOriginalPlus2Source','old99SourcesUnchanged','pycacheUnchanged','build','afterHTML']},ensure_ascii=False))
