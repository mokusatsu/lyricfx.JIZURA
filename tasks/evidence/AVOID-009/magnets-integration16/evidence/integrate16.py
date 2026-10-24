from pathlib import Path
import hashlib,json,gzip,subprocess,sys,os,datetime
sys.dont_write_bytecode=True
assert os.environ.get('MAGNETS_INTEGRATION16_RELEASE')=='PARENT_ACCEPTED_SOURCE_RAW15','Parent source/raw gate required'
R=Path('/workspace/lyricfx.JIZURA');D=R/'work/avoid009-magnets-integration16';S=R/'work/avoid009-magnets-transport15';sha=lambda b:hashlib.sha256(b).hexdigest()
receiptPath=D/'evidence/main-integration16.json';assert not receiptPath.exists()
pins=json.loads((S/'evidence/pins15.json').read_text());seal=json.loads((S/'evidence/seal15.json').read_text())
for p in pins['files']:assert sha((R/p['path']).read_bytes())==p['sha256'],p['path']
for p in seal['files']:assert sha((S/p['path']).read_bytes())==p['sha256'],p['path']
for p in pins['pycache']:assert sha((R/p['path']).read_bytes())==p['sha256'],p['path']
assert len(pins['absent49'])==49 and all(not(R/p).exists() for p in pins['absent49'])
rawpath=Path('/tmp/avoid009-magnets-transport15/evidence/transport15.raw.json.gz');raw=json.loads(gzip.decompress(rawpath.read_bytes()));assert raw['summary']=={'fixtures':7,'calls':237,'failures':0,'publicChecks':0};assert not raw['errors'] and len(raw['controls'])==3 and all(v['equal'] for v in raw['controls'])
old={str(p.relative_to(R)):sha(p.read_bytes())for p in (R/'src').glob('*.js')};assert len(old)==103
names=['src/09a_placement.js','src/11p_layoutsD.js'];prior={p:(R/p).read_bytes()for p in names};rootBefore=(S/'src/09a_placement.before.js').read_bytes();rootAfter=(S/'src/09a_placement.after.js').read_bytes();nativeBefore=(S/'src/native-magnets.before.js').read_bytes();nativeAfter=(S/'src/native-magnets.after.js').read_bytes();assert prior[names[0]]==rootBefore and prior[names[1]].count(nativeBefore)==1
new={names[0]:rootAfter,names[1]:prior[names[1]].replace(nativeBefore,nativeAfter)};assert sha(rootAfter)=='abd7f5848a0e04c3d0c508edc42d0c7f079d4c02bdeb4375fb7c4006c1060378' and sha(nativeAfter)=='0455e15d38960e8a04cd073e6814926527bd378a279498f1f3ce8a7d41a39c88'
htmlNames=['index.html','en/index.html'];oldHTML={p:(R/p).read_bytes()for p in htmlNames};expectedJA=oldHTML['index.html'].decode();assert expectedJA.count(rootBefore.decode())==1 and expectedJA.count(nativeBefore.decode())==1;expectedJA=expectedJA.replace(rootBefore.decode(),rootAfter.decode()).replace(nativeBefore.decode(),nativeAfter.decode());assert sha(expectedJA.encode())==raw['invocation']['htmlSHA256']['after']
englishNS={'__file__':str(R/'app/english.py')};exec(compile((R/'app/english.py').read_text(),str(R/'app/english.py'),'exec'),englishNS);localize_js=englishNS['localize_js'];expectedEN=oldHTML['en/index.html'].decode()
for p in names:
 oldModule=localize_js(prior[p].decode(),p);newModule=localize_js(new[p].decode(),p);assert expectedEN.count(oldModule)==1,p;expectedEN=expectedEN.replace(oldModule,newModule)
fixed={p['path']:p['sha256']for p in pins['files']if p['path']not in names+htmlNames}
receipt={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'productBefore':'a046e71f','sourceGate':str(S.relative_to(R)),'sourceSealSHA256':sha((S/'evidence/seal15.json').read_bytes()),'parentAcceptedRaw15SHA256':sha(rawpath.read_bytes()),'expectedJAExactOrdered15SHA256':sha(expectedJA.encode()),'expectedENSourceCompiledLocalizedReplacementSHA256':sha(expectedEN.encode()),'old103Sources':old,'updatedSources':[{'path':p,'beforeSHA256':sha(prior[p]),'afterSHA256':sha(new[p]),'bytes':len(new[p])}for p in names],'pycache':pins['pycache'],'absent49':pins['absent49'],'scope':'Only2existing modules+ordinaryofflineJAEN; noGit/browser/media; nofullHTMLdiskcopy/atomictempfiles','rollback':'Original exacta046source+JAEN bytes keptRAM untilverification, restoredinplace onexception; noGitwrite'}
try:
 for p in names:
  with (R/p).open('wb')as f:f.write(new[p])
 env=os.environ.copy();env['PYTHONDONTWRITEBYTECODE']='1';result=subprocess.run([sys.executable,'build.py'],cwd=R,env=env,capture_output=True,text=True);receipt['build']={'args':['python3','build.py'],'PYTHONDONTWRITEBYTECODE':'1','exit':result.returncode,'stdout':result.stdout,'stderr':result.stderr};assert result.returncode==0,receipt['build']
 assert (R/'index.html').read_bytes()==expectedJA.encode();assert(R/'en/index.html').read_bytes()==expectedEN.encode()
 assert len(list((R/'src').glob('*.js')))==103
 for p,h in old.items():
  if p not in names:assert sha((R/p).read_bytes())==h,p
 for p,b in new.items():assert (R/p).read_bytes()==b,p
 for p,h in fixed.items():assert sha((R/p).read_bytes())==h,p
 for p in pins['pycache']:assert sha((R/p['path']).read_bytes())==p['sha256'],p['path']
 assert all(not(R/p).exists()for p in pins['absent49'])
except BaseException:
 for p,b in {**prior,**oldHTML}.items():
  with (R/p).open('wb')as f:f.write(b)
 raise
receipt.update({'JAExactOrdered15':True,'ENExactSourceCompiledReplacement':True,'other101SourcesUnchanged':True,'sourceCountAfter':103,'fixedInputsUnchanged':True,'all7PYCUnchanged':True,'absent49Unchanged':True,'browserGitMediaExecutions':0,'afterHTML':[{'path':p,'bytes':(R/p).stat().st_size,'sha256':sha((R/p).read_bytes())}for p in htmlNames]})
with receiptPath.open('x')as f:json.dump(receipt,f,indent=2);f.write('\n')
print(json.dumps({k:receipt[k]for k in ['JAExactOrdered15','ENExactSourceCompiledReplacement','other101SourcesUnchanged','all7PYCUnchanged','absent49Unchanged','build','afterHTML']}))
