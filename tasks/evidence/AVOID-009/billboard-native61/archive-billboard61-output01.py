"""Retain all literal SOURCE61 producer bytes, including failure. Not acceptance."""
from pathlib import Path
import json,hashlib,tarfile,io,os
R=Path('/workspace/lyricfx.JIZURA');B=Path('/dev/shm/avoid009-evening-20261024/billboard61.raw01');E=R/'tasks/evidence/AVOID-009/billboard-native61';H=lambda b:hashlib.sha256(b).hexdigest();mb=(B/'manifest.json').read_bytes();assert H(mb)=='f24743f90430255bd679f1ea660c41bb016840240eaf9c2f68e9df610a8e2d38';m=json.loads(mb);assert m['finishedAt'] and not m['complete'] and m['errors'];out=B.parent/(B.name+'.full-output.tar.xz');assert not out.exists();items=[]
with tarfile.open(out,'w:xz',preset=6) as tf:
 for p in sorted(B.rglob('*')):
  assert not p.is_symlink()
  if not p.is_file():continue
  b=p.read_bytes();name=p.relative_to(B).as_posix();i=tarfile.TarInfo(name);i.size=len(b);i.mode=0o600;i.mtime=0;tf.addfile(i,io.BytesIO(b));items.append({'member':name,'bytes':len(b),'sha256':H(b)})
with tarfile.open(out,'r:xz') as tf:
 assert len(tf.getmembers())==len(items)
 for x in items:assert tf.extractfile(x['member']).read()==(B/x['member']).read_bytes()
b=out.read_bytes();assert os.statvfs(R).f_bavail*os.statvfs(R).f_frsize>len(b)+2097152
with (E/out.name).open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
assert (E/out.name).read_bytes()==b
(E/'manifest61-failed01.json').write_bytes(mb);report={'state':'FAILED_SOURCE61_ALL_LITERAL_BYTES_PRESERVED_NOT_ACCEPTED','archive':out.name,'archiveBytes':len(b),'archiveSHA256':H(b),'manifestSHA256':H(mb),'files':len(items),'originalBytes':sum(x['bytes'] for x in items),'completed':m['completed'],'errors':m['errors'],'allLiteralMembersByteExact':True,'originalSHMDeleted':False,'postPins':m.get('postPins'),'publicChecks':0,'parentImages':0,'inventory':items};(E/'storage61-failed01.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='inventory'}))
