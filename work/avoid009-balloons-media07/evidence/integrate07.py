from pathlib import Path
import hashlib,json,gzip,subprocess,sys,os,datetime
sys.dont_write_bytecode=True
R=Path('/workspace/lyricfx.JIZURA');D=R/'work/avoid009-balloons-media07';S=R/'work/avoid009-balloons-adapter05';sha=lambda b:hashlib.sha256(b).hexdigest()
sys.path.insert(0,str(R));from app.english import localize_js
rawpath=Path('/tmp/avoid009-balloons-ordered06/evidence/ordered06.raw.json.gz');assert sha(rawpath.read_bytes())=='f317820c13d36283cc27902cf1de7f4ce14f213f7f8f6d73ffb29d7623044689';raw=json.loads(gzip.decompress(rawpath.read_bytes()));assert not raw['errors'] and len(raw['results'])==2
pins=json.loads((S/'evidence/pins05.json').read_text());base=json.loads((R/'work/avoid009-balloons-translation03/evidence/baseline-pins03.json').read_text());assert sha((R/'work/avoid009-balloons-translation03/evidence/baseline-pins03.json').read_bytes())==pins['referenceSHA256']
for p in base['files']:assert sha((R/p['path']).read_bytes())==p['sha256'],p['path']
for p in json.loads((S/'evidence/seal05.json').read_text())['files']:assert sha((S/p['path']).read_bytes())==p['sha256'],p['path']
old={str(p.relative_to(R)):sha(p.read_bytes()) for p in (R/'src').glob('*.js')};assert len(old)==101
names=['src/11p_layoutsDa_balloons_proof05.js','src/11p_layoutsDb_balloons_adapter05.js'];expected=['3b9c57ab4ffbe6915c7e51bf816048bc04ed884dff97574ad5dd41fde3fb119a','a31e6d421c89fca495eeb3d6b817ab1f7e6989d87be58c178d491fbd9ca6bd0b'];new={p:(S/p).read_bytes() for p in names}
for p,h in zip(names,expected):assert not (R/p).exists() and sha(new[p])==h,p
ordered=sorted([*old,*new]);i=ordered.index('src/11p_layoutsD.js');assert ordered[i+1:i+3]==names
native=(R/'src/11p_layoutsD.js').read_text();ja=(R/'index.html').read_text();en=(R/'en/index.html').read_text();assert ja.count(native)==1
expectedJA=ja.replace(native,native+'\n'+'\n'.join(new[p].decode() for p in names));assert sha(expectedJA.encode())==raw['invocation']['htmlSHA256']['after']
nativeEN=localize_js(native,'src/11p_layoutsD.js');assert en.count(nativeEN)==1;expectedEN=en.replace(nativeEN,nativeEN+'\n'+'\n'.join(localize_js(new[p].decode(),p) for p in names))
pyc=lambda:{str(p.relative_to(R)):sha(p.read_bytes()) for p in (R/'app').rglob('*.pyc')};pybefore=pyc();assert pybefore['app/__pycache__/english.cpython-312.pyc']=='7390411f8a74499a4ef117d443f4c04f3814039cbb64343cb50c043cc580f898'
absent=pins['absent45'];assert len(absent)==45 and all(not(R/p).exists() for p in absent)
buildNames=['build.py','app/english.py','app/english.js','app/body.html','app/style.css','vendor/mp4-muxer.min.js','assets/effect-preview.png'];buildPins={p:sha((R/p).read_bytes()) for p in buildNames}
receipt={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceProductBefore':'ec594e6f','documentaryHEADBefore':'f146ede2','parentAcceptedOrdered06RawSHA256':sha(rawpath.read_bytes()),'newFiles':[{'path':p,'bytes':len(b),'sha256':sha(b)} for p,b in new.items()],'existing101Before':old,'buildInputs':buildPins,'JAExpectedSHA256':sha(expectedJA.encode()),'ENExpectedSHA256':sha(expectedEN.encode()),'pycacheBefore':pybefore,'absent45':absent,'scope':'two accepted new modules plus ordinary offline JAEN build only; no Git/browser/media'}
for p,b in new.items():
 with (R/p).open('xb') as f:f.write(b)
env=os.environ.copy();env['PYTHONDONTWRITEBYTECODE']='1';result=subprocess.run([sys.executable,'build.py'],cwd=R,env=env,capture_output=True,text=True);receipt['build']={'args':['python3','build.py'],'PYTHONDONTWRITEBYTECODE':'1','exit':result.returncode,'stdout':result.stdout,'stderr':result.stderr};assert result.returncode==0,receipt['build']
assert (R/'index.html').read_bytes()==expectedJA.encode();assert (R/'en/index.html').read_bytes()==expectedEN.encode()
assert len(list((R/'src').glob('*.js')))==103
for p,h in old.items():assert sha((R/p).read_bytes())==h,p
for p,h in buildPins.items():assert sha((R/p).read_bytes())==h,p
assert pyc()==pybefore and all(not(R/p).exists() for p in absent)
receipt.update({'JAExactOrdered06':True,'ENExactLocalizedInsertion':True,'existing101Unchanged':True,'sourceCountAfter':103,'pycacheUnchanged':True,'absent45Unchanged':True,'browserMediaGitExecutions':0,'afterHTML':[{'path':p,'bytes':(R/p).stat().st_size,'sha256':sha((R/p).read_bytes())} for p in ['index.html','en/index.html']]})
with (D/'evidence/main-integration07.json').open('x') as f:json.dump(receipt,f,indent=2);f.write('\n')
print(json.dumps({k:receipt[k] for k in ['JAExactOrdered06','ENExactLocalizedInsertion','existing101Unchanged','sourceCountAfter','pycacheUnchanged','absent45Unchanged','build']}))
