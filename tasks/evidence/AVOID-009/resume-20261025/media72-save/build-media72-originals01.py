from pathlib import Path
import json,hashlib,tarfile,gzip,io,stat
BASE=Path('/dev/shm/avoid009-billboard72-sites-save-20261025-01');RUN=Path('/dev/shm/m72a01');MEDIA=RUN/'media'
ROUTE='dist/review/AVOID-009/billboard-native-20261025-01/'
def need(x):
 if not x:raise RuntimeError('fixed media72 input precondition')
def sha(b):return hashlib.sha256(b).hexdigest()
def read(p):
 for q in [*reversed(p.parents),p]:need(not q.is_symlink())
 need(stat.S_ISREG(p.stat().st_mode));return p.read_bytes()
mbytes=read(MEDIA/'manifest.json');need(len(mbytes)==2027526 and sha(mbytes)=='b1b35e62c2f9d3f7801a392f0219065ab9db7955e816847f783a35da57671858');m=json.loads(mbytes);need(m['complete'] and not m['errors'] and len(m['records'])==1002)
assets={};assetrows=[]
for row in [*m['videos'],*m['statics'],m['comparison']]:
 p=Path(row['path']);need(p.is_relative_to(MEDIA));name=str(p.relative_to(MEDIA));b=read(p);need(len(b)==row['bytes'] and sha(b)==row['sha256']);assets[ROUTE+name]=b;assetrows.append({'path':ROUTE+name,'source':str(p),'bytes':len(b),'sha256':sha(b)})
need(set(assets)=={ROUTE+'index.html'}|{ROUTE+'videos/default-'+s+'.mp4' for s in ['before','after']}|{ROUTE+'images/default-'+s+'-'+j+'.png' for s in ['before','after'] for j in ['014','090','231']})
for row in m['pins']+m['inputs']:
 b=read(Path(row['path']));need(len(b)==row['bytes'] and sha(b)==row['sha256'])
selection={}
for n in ['result.json','node.stderr.txt','node.stdout.txt','media-config.json','build-inputs.json','parent-numeric-review72.json']:selection['run/'+n]=RUN/n
for n in ['manifest.json','logs/after-ffmpeg.stderr.txt','logs/before-ffmpeg.stderr.txt']:selection['media/'+n]=MEDIA/n
for n in ['result.json','stderr.txt','stdout.txt']:selection['build-log/'+n]=RUN/'build-log'/n
for n in ['media72_ram.py','media72.cjs','media72-browser.js']:selection['media-source/'+n]=Path('/dev/shm/avoid009-billboard72-media-source01')/n
for n in ['media72-source-review-fix01.json','media72-source-static.json','media72-plan.json']:selection['media-plan/'+n]=Path('/dev/shm/avoid009-billboard72-media-plan01')/n
selection['canonical-source/canonical72_ram.py']=Path('/dev/shm/avoid009-bulbs69-billboard72-canonical-source01/canonical72_ram.py')
for n in ['report.md','result.json']:selection['fresh-visual/'+n]=Path('/dev/shm/billboard72-visual01')/n
payload={};rows=[]
for name,p in sorted(selection.items()):
 need(name.endswith(('.json','.txt','.py','.js','.cjs','.md')) and not any(x in name.split('/') for x in ['private-git','.git','.aws','profiles','credentials']))
 b=read(p);b.decode('utf-8');need(not b.lstrip().lower().startswith((b'<!doctype html',b'<html')))
 if name.endswith('.json'):json.loads(b)
 payload[name]=b;rows.append({'path':name,'source':str(p),'bytes':len(b),'sha256':sha(b)})
need(len(payload)==21);need(json.loads(payload['run/parent-numeric-review72.json'])['state']=='PARENT_ACCEPTED_MEDIA72_NUMERIC_AND_FIXED_STATIC_SCOPE')
archive=BASE/'billboard72-media-originals-20261025-01.tar.gz'
with archive.open('xb') as raw:
 with gzip.GzipFile(filename='',fileobj=raw,mode='wb',mtime=0) as gz:
  with tarfile.open(fileobj=gz,mode='w|',format=tarfile.USTAR_FORMAT) as tar:
   for name,b in payload.items():
    t=tarfile.TarInfo(name);t.size=len(b);t.mode=0o600;t.mtime=0;tar.addfile(t,io.BytesIO(b))
with tarfile.open(archive,'r:gz') as tar:
 members=tar.getmembers();need(len(members)==21 and {t.name for t in members}==set(payload))
 for t in members:need(t.isfile() and not t.pax_headers and tar.extractfile(t).read()==payload[t.name])
a=read(archive);manifest={'state':'LOCAL_FIXED_MEDIA72_ORIGINALS_READY_NOT_SAVED','target':'verification/AVOID-009/'+archive.name,'archiveBytes':len(a),'archiveSHA256':sha(a),'innerFiles':rows,'innerFileCount':21,'innerBytes':sum(map(len,payload.values())),'reviewAssets':assetrows,'mediaManifestSHA256':sha(mbytes),'sourcePinsChecked':len(m['pins'])+len(m['inputs']),'htmlFiles':0,'mediaFiles':0,'credentialProfileFiles':0,'independentCandidateRGBAOracle':False,'humanMotionReview':'PENDING','continuousMotionReviewed':False,'originalsChanged':False,'publish':False,'networkOperations':0,'sourceGitOperations':0,'postSaveReadback':False}
p=BASE/'billboard72-media-originals-20261025-01.manifest.json';p.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n');json.loads(read(p))
# This local inventory references the nine original files rather than duplicating them.
outputrows=assetrows+[{'path':'verification/AVOID-009/'+p.name,'source':str(p),'bytes':p.stat().st_size,'sha256':sha(read(p))},{'path':'verification/AVOID-009/'+archive.name,'source':str(archive),'bytes':len(a),'sha256':sha(a)}]
(BASE/'fixed-eleven-inventory01.json').write_text(json.dumps({'files':outputrows,'innerFiles':21,'innerBytes':manifest['innerBytes']},indent=2)+'\n')
print(json.dumps({'assets':len(assets),'assetBytes':sum(map(len,assets.values())),'archiveBytes':len(a),'archiveSHA256':sha(a),'manifestBytes':p.stat().st_size,'manifestSHA256':sha(read(p)),'innerFiles':21,'innerBytes':manifest['innerBytes'],'sourcePins':24,'transferCredentialsNetwork':0}))
