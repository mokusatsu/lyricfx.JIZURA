import os,stat,tarfile,io,json,hashlib,sys,signal
from pathlib import Path
FIFO=Path('/workspace/lyricfx.JIZURA/work/avoid009-capacity-objects16/source71-assets-only.fifo')
ROOT=Path('/workspace/lyricfx.JIZURA')
def need(v):
 if not v:raise RuntimeError('fixed-two local IPC precondition')
def sha(b):return hashlib.sha256(b).hexdigest()
def fifo_fd(flags):
 s=FIFO.lstat();need(stat.S_ISFIFO(s.st_mode) and s.st_ino==927035 and s.st_uid==1000 and stat.S_IMODE(s.st_mode)==0o600)
 fd=os.open(FIFO,flags|os.O_NOFOLLOW);t=os.fstat(fd);need(t.st_dev==s.st_dev and t.st_ino==s.st_ino);return fd
PINS={'burst75-failed-actual01-20261025-01.tar.gz': (85123, '15d42c95300d6ebfda5117a58a51f20c26f7576b6491781b6d69ca2bbef818a8'), 'burst75-failed-actual01-20261025-01.manifest.json': (6725, 'e209bd0fc1e4f6408755442c3eb86408d1ed5722b7ce69c2c04f50165bad4ea5')}
BASE=Path('/dev/shm/avoid009-burst75-failed-sourcebackup-20261025-01')
payload={}
for name,(size,digest) in PINS.items():
 p=BASE/name
 for q in [*reversed(p.parents),p]:need(not q.is_symlink())
 need(stat.S_ISREG(p.stat().st_mode));b=p.read_bytes();need(len(b)==size and sha(b)==digest);payload[name]=b
with os.fdopen(fifo_fd(os.O_WRONLY),'wb') as pipe:
 with tarfile.open(fileobj=pipe,mode='w|',format=tarfile.USTAR_FORMAT) as tar:
  for name,b in payload.items():
   t=tarfile.TarInfo(name);t.size=len(b);t.mode=0o600;tar.addfile(t,io.BytesIO(b))
print('BURST75_FAILED_FIXED_TWO_LOCAL_STREAM_SENT',flush=True)
