from pathlib import Path,PurePosixPath
import json,hashlib,tarfile,gzip,io,stat
BASE=Path('/dev/shm/avoid009-burst75-failed-sourcebackup-20261025-01');RUN=Path('/dev/shm/avoid009-burst75-native-actual01-20261025')
def need(v):
 if not v:raise RuntimeError('fixed backup input precondition')
def sha(b):return hashlib.sha256(b).hexdigest()
def read(p):
 for q in [*reversed(p.parents),p]:need(not q.is_symlink())
 need(stat.S_ISREG(p.stat().st_mode));return p.read_bytes()
def safe_name(n):
 p=PurePosixPath(n);need(not p.is_absolute() and '..' not in p.parts and str(p)==n)
 need(not any(x.lower() in {'.git','private-git','.aws','.ssh','credentials','secrets','profile','profiles','browser-profiles','tmp'} for x in p.parts))
 need(n.endswith(('.json','.json.gz','.txt','.py','.js','.cjs','.patch')))
def checked(p,n,pin=None):
 safe_name(n);b=read(p)
 if pin is not None:need(len(b)==pin['bytes'] and sha(b)==pin['sha256'])
 # No HTML/media file bytes: gzip is accepted only for parseable JSON raw.
 text=gzip.decompress(b) if n.endswith('.json.gz') else b
 need(not text.startswith(b'\x89PNG\r\n\x1a\n') and not text.startswith(b'\xff\xd8\xff') and not (len(text)>8 and text[4:8]==b'ftyp'))
 need(not text.lstrip().lower().startswith((b'<!doctype html',b'<html')))
 text.decode('utf-8')
 if n.endswith(('.json','.json.gz')):json.loads(text)
 return b

selection=json.loads(read(RUN/'archive-input-list-1.json'))['files'];need(len(selection)==34 and sum(r['bytes'] for r in selection)==133461);payload={}
for r in selection:
 n=r['relative'];need(Path(r['source'])==RUN/n and n not in payload);payload[n]=checked(RUN/n,n,r)
for n in ['archive-input-list-1.json','sites-source-persistence-pending.json']:payload[n]=checked(RUN/n,n)
need(len(payload)==36 and sum(map(len,payload.values()))==151808);need(sha(payload['raw/manifest.json'])=='4fa84b4ed7dbf56de2b799895591b5b073093b0d635a3503cae6d4ea4c1f46d1')
m=json.loads(payload['raw/manifest.json']);r=json.loads(payload['parent-local-review.json']);need(not m['complete'] and len(m['records'])==19 and len(m['errors'])==2 and r['state']=='FAIL_SOURCE75_RAW_FIDELITY')
rows=[{'path':n,'bytes':len(b),'sha256':sha(b)} for n,b in sorted(payload.items())];a=BASE/'burst75-failed-actual01-20261025-01.tar.gz'
with a.open('xb') as raw:
 with gzip.GzipFile(filename='',fileobj=raw,mode='wb',mtime=0) as gz:
  with tarfile.open(fileobj=gz,mode='w|',format=tarfile.USTAR_FORMAT) as tar:
   for n,b in sorted(payload.items()):
    t=tarfile.TarInfo(n);t.size=len(b);t.mode=0o600;t.mtime=0;tar.addfile(t,io.BytesIO(b))
with tarfile.open(a,'r:gz') as tar:
 members=tar.getmembers();need(len(members)==36 and {t.name for t in members}==set(payload))
 for t in members:need(t.isfile() and not t.pax_headers and tar.extractfile(t).read()==payload[t.name])
b=read(a);manifest={'state':'LOCAL_FAILED_ONLY_BACKUP_READY_NOT_SAVED','target':'verification/AVOID-009/'+a.name,'archiveBytes':len(b),'archiveSHA256':sha(b),'innerFiles':rows,'innerFileCount':36,'innerBytes':151808,'rawManifestSHA256':sha(payload['raw/manifest.json']),'provenance':{'producerRecords':19,'nativeDrawsBeforeFailure':18,'producerComplete':False,'producerErrors':2,'checkerState':r['state'],'failure':'Cannot redefine withBulbsRecipe68; initBurst75 undefined','fix02Included':False,'geometrySafetyCertified':False,'adapterRegistered':False},'sourcePinsChecked':34,'originalsChanged':False,'mediaFiles':0,'htmlFiles':0,'credentialProfileFiles':0,'networkOperations':0,'sourceGitOperations':0,'publish':False,'postSaveReadback':False}
p=BASE/'burst75-failed-actual01-20261025-01.manifest.json';p.write_text(json.dumps(manifest,indent=2)+'\n');json.loads(read(p));print(json.dumps({'archiveBytes':len(b),'archiveSHA256':sha(b),'manifestBytes':p.stat().st_size,'manifestSHA256':sha(read(p)),'innerFiles':36,'innerBytes':151808}))
