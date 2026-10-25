from pathlib import Path
import hashlib,json,gzip,subprocess,sys,os,datetime
sys.dont_write_bytecode=True
R=Path('/workspace/lyricfx.JIZURA');D=R/'work/avoid009-balloons-media11';S=R/'work/avoid009-balloons-zero10';sha=lambda b:hashlib.sha256(b).hexdigest()
englishNS={'__file__':str(R/'app/english.py')};exec(compile((R/'app/english.py').read_text(),str(R/'app/english.py'),'exec'),englishNS);localize_js=englishNS['localize_js']
rawpath=Path('/tmp/avoid009-balloons-zero10/evidence/zero10.raw.json.gz');assert sha(rawpath.read_bytes())=='56685470948bb6f3e7bcc62cfdacc80bd9f1ba5e97b8b74a2091969895fd0780';raw=json.loads(gzip.decompress(rawpath.read_bytes()));assert not raw['errors'] and len(raw['results'])==2
pins=json.loads((S/'evidence/pins10.json').read_text())
for q in pins['currentFiles']:assert sha((R/q['path']).read_bytes())==q['sha256'],q['path']
for q in json.loads((S/'evidence/seal10.json').read_text())['files']:assert sha((S/q['path']).read_bytes())==q['sha256'],q['path']
old={str(p.relative_to(R)):sha(p.read_bytes()) for p in (R/'src').glob('*.js')};assert len(old)==103
names=['src/11p_layoutsDb_balloons_adapter05.js'];expected=['ad17b74b439bf143a0cd2a8b8d7f2826dd624140427173d64f557257d19ed334'];new={p:(S/p).read_bytes() for p in names}
for p,h in zip(names,expected):assert (R/p).exists() and sha(new[p])==h,p
ordered=sorted(old);i=ordered.index('src/11p_layoutsD.js');assert ordered[i+2:i+3]==names
ja=(R/'index.html').read_text();en=(R/'en/index.html').read_text();expectedJA=ja;expectedEN=en
for q in names:
 prior=(R/q).read_text();assert expectedJA.count(prior)==1;expectedJA=expectedJA.replace(prior,new[q].decode());priorEN=localize_js(prior,q);assert expectedEN.count(priorEN)==1;expectedEN=expectedEN.replace(priorEN,localize_js(new[q].decode(),q))
assert sha(expectedJA.encode())==raw['invocation']['htmlSHA256']['after']
pyc=lambda:{str(p.relative_to(R)):sha(p.read_bytes()) for p in (R/'app').rglob('*.pyc')};pybefore=pyc();assert pybefore['app/__pycache__/english.cpython-312.pyc']=='7390411f8a74499a4ef117d443f4c04f3814039cbb64343cb50c043cc580f898'
absent=pins['absent45'];assert len(absent)==45 and all(not(R/p).exists() for p in absent)
buildNames=['build.py','app/english.py','app/english.js','app/body.html','app/style.css','vendor/mp4-muxer.min.js','assets/effect-preview.png'];buildPins={p:sha((R/p).read_bytes()) for p in buildNames}
receipt={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceProductBefore':'3a3b2069','parentAcceptedZero10RawSHA256':sha(rawpath.read_bytes()),'newFiles':[{'path':p,'bytes':len(b),'sha256':sha(b)} for p,b in new.items()],'existing103Before':old,'buildInputs':buildPins,'JAExpectedSHA256':sha(expectedJA.encode()),'ENExpectedSHA256':sha(expectedEN.encode()),'pycacheBefore':pybefore,'absent45':absent,'scope':'one accepted replacement module plus ordinary offline JAEN build only; no Git/browser/media'}
for p,b in new.items():
 with (R/p).open('wb') as f:f.write(b)
env=os.environ.copy();env['PYTHONDONTWRITEBYTECODE']='1';result=subprocess.run([sys.executable,'build.py'],cwd=R,env=env,capture_output=True,text=True);receipt['build']={'args':['python3','build.py'],'PYTHONDONTWRITEBYTECODE':'1','exit':result.returncode,'stdout':result.stdout,'stderr':result.stderr};assert result.returncode==0,receipt['build']
assert (R/'index.html').read_bytes()==expectedJA.encode();assert (R/'en/index.html').read_bytes()==expectedEN.encode()
assert len(list((R/'src').glob('*.js')))==103
for p,h in old.items():
 if p not in names:assert sha((R/p).read_bytes())==h,p
for p,b in new.items():assert (R/p).read_bytes()==b,p
for p,h in buildPins.items():assert sha((R/p).read_bytes())==h,p
assert pyc()==pybefore and all(not(R/p).exists() for p in absent)
receipt.update({'JAExactOrdered10':True,'ENExactSourceCompiledLocalizedReplacement':True,'other102Unchanged':True,'sourceCountAfter':103,'pycacheUnchanged':True,'absent45Unchanged':True,'browserMediaGitExecutions':0,'afterHTML':[{'path':p,'bytes':(R/p).stat().st_size,'sha256':sha((R/p).read_bytes())} for p in ['index.html','en/index.html']]})
with (D/'evidence/main-integration11.json').open('x') as f:json.dump(receipt,f,indent=2);f.write('\n')
print(json.dumps({k:receipt[k] for k in ['JAExactOrdered10','ENExactSourceCompiledLocalizedReplacement','other102Unchanged','sourceCountAfter','pycacheUnchanged','absent45Unchanged','build']}))
