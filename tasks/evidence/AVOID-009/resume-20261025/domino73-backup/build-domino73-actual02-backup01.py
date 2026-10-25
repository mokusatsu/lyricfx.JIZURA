from pathlib import Path,PurePosixPath
import os,stat,json,hashlib,tarfile,gzip,io
BASE=Path('/dev/shm/avoid009-domino73-actual02-sourcebackup-20261025-01')
RUN=Path('/dev/shm/avoid009-bulbs69-domino73-native-actual02-20261025')
CHECKER=Path('/dev/shm/avoid009-domino73-sourceprepare-20261025/parent-raw-review73-rowindex02.py')
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

payload={};selection=json.loads(read(RUN/'archive-input-list-1.json'))['files'];need(len(selection)==285 and sum(r['bytes'] for r in selection)==780389)
for row in selection:
 n=row['relative'];need(Path(row['source'])==RUN/n);need(n not in payload);payload[n]=checked(RUN/n,n,row)
for n in ['archive-input-list-1.json','sites-source-persistence-pending.json','parent-corrected-raw-review73-rowindex02.json','parent-corrected-raw-review73-rowindex02.stdout.txt','parent-corrected-raw-review73-rowindex02.stderr.txt']:
 need(n not in payload);payload[n]=checked(RUN/n,n)
payload['corrected-checker/parent-raw-review73-rowindex02.py']=checked(CHECKER,'corrected-checker/parent-raw-review73-rowindex02.py',{'bytes':8823,'sha256':'33e698358ff7655f30126e3bead31a2fd82553209efedef6002dd0bef9a67bcf'})
need(len(payload)==291);need(sha(payload['raw/manifest.json'])=='74d31a5c00267e27f80522424662975787df0430deda81a614b60b6cf3349b93')
m=json.loads(payload['raw/manifest.json']);review=json.loads(payload['parent-corrected-raw-review73-rowindex02.json']);need(m['complete'] and not m['errors'] and len(m['records'])==270 and review['state']=='PASS_SOURCE73_REPRESENTATIVE_RAW_FIDELITY' and review['restoredRecords']==270 and not review['geometrySafetyCertified'])
rows=[{'path':n,'bytes':len(b),'sha256':sha(b)} for n,b in sorted(payload.items())]
archive=BASE/'domino73-actual02-20261025-01.tar.gz'
with archive.open('xb') as raw:
 with gzip.GzipFile(filename='',fileobj=raw,mode='wb',mtime=0) as gz:
  with tarfile.open(fileobj=gz,mode='w|',format=tarfile.USTAR_FORMAT) as tar:
   for n,b in sorted(payload.items()):
    t=tarfile.TarInfo(n);t.size=len(b);t.mode=0o600;t.mtime=0;tar.addfile(t,io.BytesIO(b))
with tarfile.open(archive,'r:gz') as tar:
 members=tar.getmembers();need(len(members)==291 and {t.name for t in members}==set(payload))
 for t in members:need(t.isfile() and not t.pax_headers and tar.extractfile(t).read()==payload[t.name])
a=read(archive);total=sum(map(len,payload.values()))
manifest={'state':'LOCAL_FIXED_BACKUP_READY_NOT_SAVED','target':'verification/AVOID-009/domino73-actual02-20261025-01.tar.gz','archiveBytes':len(a),'archiveSHA256':sha(a),'innerFiles':rows,'innerFileCount':291,'innerBytes':total,'originalRawManifestSHA256':'74d31a5c00267e27f80522424662975787df0430deda81a614b60b6cf3349b93','correctedCheckerSHA256':'33e698358ff7655f30126e3bead31a2fd82553209efedef6002dd0bef9a67bcf','provenance':{'producerRecords':270,'producerErrors':0,'correctedReviewState':review['state'],'pairedNativeFrames':104,'pairedMovedFrames':52,'allPaints':4575,'glyphItems':1045,'rowClocksChecked':156,'geometrySafetyCertified':False,'originalCheckerFailureAndLogsPreserved':True,'humanMotionReview':'NOT_APPROVED','adapterRegistered':False,'formalPerformance':'NOT_ACCEPTED'},'sourcePinsChecked':285,'originalsChanged':False,'mediaFiles':0,'htmlFiles':0,'credentialProfileFiles':0,'networkOperations':0,'sourceGitOperations':0,'publish':False,'postSaveReadback':False}
p=BASE/'domino73-actual02-20261025-01.manifest.json';p.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n');json.loads(p.read_bytes())
print(json.dumps({'archiveBytes':len(a),'archiveSHA256':sha(a),'manifestBytes':p.stat().st_size,'manifestSHA256':sha(read(p)),'innerFiles':len(rows),'innerBytes':total,'networkCredentialsSourceGit':0}))
