"""Parent full literal producer-file preservation only. No application or public access."""
from pathlib import Path
import argparse,json,hashlib,tarfile,io,os
p=argparse.ArgumentParser();p.add_argument('--phase',choices=['oracle','media'],required=True);p.add_argument('--manifest-sha256',required=True);a=p.parse_args();R=Path('/workspace/lyricfx.JIZURA');BASE=Path('/dev/shm/avoid009-evening-20261024');B=BASE/('bulbs60.'+a.phase+'01');E=R/'tasks/evidence/AVOID-009/bulbs-oracle60';H=lambda b:hashlib.sha256(b).hexdigest();mb=(B/'manifest.json').read_bytes();assert H(mb)==a.manifest_sha256;m=json.loads(mb);assert m.get('finishedAt') and 'postPins' in m;seal=E/'source60/evidence/seal60.json';assert H(seal.read_bytes())=='10f58d580c9e76ac9b12ec7a6e19d1da8851854f091f5e47c32467732fee001c'
paths=sorted(B.rglob('*'));assert all(not p.is_symlink() and (p.is_file() or p.is_dir()) for p in paths);out=BASE/(B.name+'.full-output.tar.xz');assert not out.exists();inventory=[]
with tarfile.open(out,'w:xz',preset=6) as tf:
 for p in paths:
  if not p.is_file():continue
  b=p.read_bytes();name=p.relative_to(B).as_posix();info=tarfile.TarInfo(name);info.size=len(b);info.mode=0o600;info.mtime=0;tf.addfile(info,io.BytesIO(b));inventory.append({'member':name,'bytes':len(b),'sha256':H(b)})
with tarfile.open(out,'r:xz') as tf:
 assert len(tf.getmembers())==len(inventory)
 for x in inventory:
  b=tf.extractfile(x['member']).read();assert len(b)==x['bytes'] and H(b)==x['sha256'] and b==(B/x['member']).read_bytes()
size=out.stat().st_size;assert os.statvfs(R).f_bavail*os.statvfs(R).f_frsize>size+2097152;dest=E/out.name;data=out.read_bytes()
with dest.open('xb') as f:f.write(data);f.flush();os.fsync(f.fileno())
assert dest.read_bytes()==data
with (E/('manifest60-'+a.phase+'.json')).open('xb') as f:f.write(mb);f.flush();os.fsync(f.fileno())
report={'state':'ALL_LITERAL_PRODUCER_FILES_BYTE_EXACT_RETAINED_NOT_ACCEPTANCE','phase':a.phase,'archive':dest.name,'archiveBytes':len(data),'archiveSHA256':H(data),'manifestSHA256':H(mb),'files':len(inventory),'originalCompressedAndMetadataBytes':sum(x['bytes'] for x in inventory),'completed':m['completed'],'complete':m['complete'],'errors':m['errors'],'postPins':m['postPins'],'allLiteralMembersComparedToLiveOriginalBytes':True,'originalSHMDeleted':False,'sourceSealSHA256':H(seal.read_bytes()),'productAdmission':False,'publicChecks':0,'parentImages':0,'inventory':inventory};reportpath=E/('storage60-'+a.phase+'.json');assert not reportpath.exists();reportpath.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='inventory'},indent=2))
