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

# Elevated producer only: local bytes, no credentials, subprocess, or network.
g,inv=pins();payload={}
for name,(size,digest) in inv.items():
 b=read(RUN/'raw/public'/name);need(len(b)==size and sha(b)==digest);payload['raw/public/'+name]=b
for name,p,digest in [('raw/manifest.json',RUN/'raw/manifest.json',g['mediaManifestSHA256']),('parent-corrected-media71-review01.json',RUN/'parent-corrected-media71-review01.json',g['numericReviewSHA256'])]:
 b=read(p);need(sha(b)==digest and len(b)<=16777216);payload[name]=b
need(len(payload)==11)
with os.fdopen(fifo_fd(os.O_WRONLY),'wb') as pipe:
 with tarfile.open(fileobj=pipe,mode='w|') as tar:
  for name,b in payload.items():
   t=tarfile.TarInfo(name);t.size=len(b);t.mode=0o600;tar.addfile(t,io.BytesIO(b))
print('ASSET_ONLY_PRODUCER_SENT_EXACT11',flush=True)
