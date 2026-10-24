"""Preserve the complete producer output of failed55, without changing any status."""
from pathlib import Path
import json,hashlib,gzip,tarfile,io,os,shutil
R=Path('/workspace/lyricfx.JIZURA');B=Path('/dev/shm/avoid009-evening-20261024/bulbs55.raw01');E=R/'tasks/evidence/AVOID-009/bulbs-diagnostic55';sha=lambda b:hashlib.sha256(b).hexdigest();mb=(B/'manifest.json').read_bytes();m=json.loads(mb);assert sha(mb)=='f14038b8cd31bfc87c313e9009510ed0e3bc930f609aeda9bd9562b1ea14a0e5';assert not m['complete'] and m['postPins']['unchanged'] and len(m['errors'])==1 and m['errors'][0]['message']=='INTERN_KEY_BYTE_BUDGET';assert m['completed']['states']==250 and m['completed']['selectedPasses']==727 and m['completed']['materializedStates']==352;paths=sorted(B.rglob('*'));assert all(not p.is_symlink() for p in paths);out=B.parent/'bulbs55.failed01.full-output.tar.xz';assert not out.exists();inventory=[]
# Literal original gzip files are retained, rather than recompressed/reference transformed.
with tarfile.open(out,'w:xz',preset=6) as tf:
 for p in paths:
  if not p.is_file():continue
  b=p.read_bytes();name=p.relative_to(B).as_posix();info=tarfile.TarInfo(name);info.size=len(b);info.mode=0o600;info.mtime=0;tf.addfile(info,io.BytesIO(b));inventory.append({'member':name,'bytes':len(b),'sha256':sha(b)})
with tarfile.open(out,'r:xz') as tf:
 assert len(tf.getmembers())==len(inventory)
 for p in inventory:
  b=tf.extractfile(p['member']).read();assert len(b)==p['bytes'] and sha(b)==p['sha256'] and b==(B/p['member']).read_bytes()
b=out.read_bytes();dest=E/'bulbs55.failed01.full-output.tar.xz'
with dest.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
assert dest.read_bytes()==b;shutil.copyfile(B/'manifest.json',E/'manifest55-failed01.json');report={'state':'FAILED55_FULL_PRODUCER_OUTPUT_LITERAL_BYTES_ARCHIVED_NOT_ACCEPTED','archive':dest.name,'archiveBytes':len(b),'archiveSHA256':sha(b),'manifestSHA256':sha(mb),'files':len(inventory),'originalCompressedAndMetadataBytes':sum(x['bytes'] for x in inventory),'complete':False,'failure':'INTERN_KEY_BYTE_BUDGET','completed':m['completed'],'postPins':m['postPins'],'source55SealSHA256':'2ce92c13bfc6bd7175e631dc5fc712b0f4943383d33cb32a56f153ce0e5836af','fourGlyphEvaluated':False,'conditionalGeometryOnly':True,'placementAccepted':False,'allLiteralArchiveMembersFullByteComparedToOriginals':True,'originalSHMDeleted':False,'inventory':inventory,'publicChecks':0,'parentImagesViewed':0};(E/'storage55-failed01.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='inventory'},indent=2))
