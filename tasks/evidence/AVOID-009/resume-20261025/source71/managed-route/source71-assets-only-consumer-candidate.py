import os,stat,json,hashlib,tarfile,io
from pathlib import Path
FIFO=Path('/workspace/lyricfx.JIZURA/work/avoid009-capacity-objects16/source71-assets-only.fifo')
ROOT=Path('/workspace/lyricfx.JIZURA')
RUN=Path('/dev/shm/avoid009-bulbs69-media71-actual01-20261025')
NAMES=['index.html']+[f+'/'+c+'-'+s+x for c in ['upper','right'] for s in ['before','after'] for f,x in [('videos','.mp4'),('posters','.png')]]
def need(x):
 if not x:raise RuntimeError('asset-only precondition failed')
def sha(b):return hashlib.sha256(b).hexdigest()
def read(p):
 for q in [*reversed(p.parents),p]:need(not q.is_symlink())
 need(stat.S_ISREG(p.stat().st_mode));return p.read_bytes()
def pins():
 g=json.loads(read(ROOT/'tasks/evidence/AVOID-009/resume-20261025/source71/parent-source-save-gate71.json'))
 need(g['project_id']=='appgprj_6adbafe9f07c8191ab0b404c53caab16' and g['state']=='BLOCKED_DO_NOT_RUN')
 inv={x['path']:(x['bytes'],x['sha256']) for x in g['publicFiles']}
 need(set(inv)==set(NAMES) and len(g['publicFiles'])==9 and sum(x[0] for x in inv.values())==4475831)
 return g,inv
def fifo_fd(flags):
 s=FIFO.lstat();need(stat.S_ISFIFO(s.st_mode) and s.st_ino==927035 and s.st_uid==1000 and stat.S_IMODE(s.st_mode)==0o600)
 fd=os.open(FIFO,flags|os.O_NOFOLLOW);t=os.fstat(fd)
 need(t.st_dev==s.st_dev and t.st_ino==s.st_ino);return fd

# Managed consumer only: stage bytes in private SHM; never starts helper.
import signal
g,inv=pins();expected={'raw/public/'+n:(s,h) for n,(s,h) in inv.items()}
expected.update({'raw/manifest.json':(None,g['mediaManifestSHA256']),'parent-corrected-media71-review01.json':(None,g['numericReviewSHA256'])})
payload={}
with os.fdopen(fifo_fd(os.O_RDONLY),'rb') as pipe:
 with tarfile.open(fileobj=pipe,mode='r|') as tar:
  for t in tar:
   need(t.name in expected and t.name not in payload and t.isfile() and not t.issparse() and not t.pax_headers)
   size,digest=expected[t.name];need(0<=t.size<=16777216 and (size is None or t.size==size))
   b=tar.extractfile(t).read(t.size+1);need(len(b)==t.size and sha(b)==digest);payload[t.name]=b
need(set(payload)==set(expected))
m=json.loads(payload['raw/manifest.json']);n=json.loads(payload['parent-corrected-media71-review01.json'])
need(m['complete'] and not m['errors'] and n['state']=='PASS_MEDIA71_RAW_NUMERIC' and n['producerComplete'] and not n['producerErrors'])
need({x['path']:(x['bytes'],x['sha256']) for x in m['publicFiles']}==inv)
stage=Path('/dev/shm/avoid009-bulbs69-media71-managed03-'+str(os.getpid()));stage.mkdir(mode=0o700)
for name,b in payload.items():
 p=stage/name;p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('xb') as f:f.write(b)
 need(sha(read(p))==expected[name][1])
print(json.dumps({'state':'MANAGED_ASSET_ONLY_STAGE_READY_HELPER_NOT_STARTED','run':str(stage),'files':11,'assetBytes':4475831,'credentialOperations':0,'networkOperations':0,'gateModified':False}),flush=True)
# Preserve this private namespace. Parent must review source before any actual
# stream run. Helper/credential workflow requires separate parent approval;
# this candidate intentionally contains neither capability.
while True:signal.pause()
