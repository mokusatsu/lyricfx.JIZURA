"""Parent evidence utility: retain all literal producer files regardless of success."""
from pathlib import Path
import json,hashlib,tarfile,io,os,argparse
ap=argparse.ArgumentParser();ap.add_argument('--manifest-sha256',required=True);a=ap.parse_args()
R=Path('/workspace/lyricfx.JIZURA');B=Path('/dev/shm/avoid009-evening-20261024/bulbs56.raw01');E=R/'tasks/evidence/AVOID-009/bulbs-diagnostic56';H=lambda b:hashlib.sha256(b).hexdigest()
mb=(B/'manifest.json').read_bytes();assert H(mb)==a.manifest_sha256;m=json.loads(mb);assert m.get('finishedAt') and 'postPins' in m
paths=sorted(B.rglob('*'));assert all(not p.is_symlink() for p in paths);out=B.parent/'bulbs56.raw01.full-output.tar.xz';assert not out.exists();inventory=[]
with tarfile.open(out,'w:xz',preset=6) as tf:
 for p in paths:
  if not p.is_file():continue
  b=p.read_bytes();name=p.relative_to(B).as_posix();info=tarfile.TarInfo(name);info.size=len(b);info.mode=0o600;info.mtime=0;tf.addfile(info,io.BytesIO(b));inventory.append({'member':name,'bytes':len(b),'sha256':H(b)})
with tarfile.open(out,'r:xz') as tf:
 assert len(tf.getmembers())==len(inventory)
 for p in inventory:
  b=tf.extractfile(p['member']).read();assert len(b)==p['bytes'] and H(b)==p['sha256'] and b==(B/p['member']).read_bytes()
data=out.read_bytes();assert os.statvfs(R).f_bavail*os.statvfs(R).f_frsize>len(data)+2097152
dest=E/'bulbs56.raw01.full-output.tar.xz'
with dest.open('xb') as f:f.write(data);f.flush();os.fsync(f.fileno())
assert dest.read_bytes()==data
with (E/'manifest56.json').open('xb') as f:f.write(mb);f.flush();os.fsync(f.fileno())
report={'state':'COMPLETE_PRODUCER_FILES_LITERAL_BYTES_RETAINED_NOT_PRODUCT_ACCEPTANCE','manifestComplete':m['complete'],'errors':m['errors'],'destinationRejections':m['destinationRejections'],'archive':dest.name,'archiveBytes':len(data),'archiveSHA256':H(data),'manifestSHA256':H(mb),'files':len(inventory),'originalCompressedAndMetadataBytes':sum(x['bytes'] for x in inventory),'completed':m['completed'],'postPins':m['postPins'],'allLiteralArchiveMembersFullByteComparedToOriginals':True,'originalSHMDeleted':False,'sourceSealSHA256':H((E/'source56/evidence/seal56.json').read_bytes()),'conditionalGeometryOnly':True,'adapterAdded':False,'publicChecks':0,'parentImagesViewed':0,'inventory':inventory}
(E/'storage56.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='inventory'},indent=2))
