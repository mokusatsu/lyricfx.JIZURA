"""Parent evidence archive: exact decoded fragments plus original-gzip reproduction map."""
from pathlib import Path
import json,hashlib,gzip,tarfile,io,subprocess,os,shutil
R=Path('/workspace/lyricfx.JIZURA');B=Path('/dev/shm/avoid009-evening-20261024/bulbs51.raw01');E=R/'tasks/evidence/AVOID-009/bulbs-transport51';out=B.parent/'bulbs51.raw01.lossless.tar.xz';N='/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node';sha=lambda b:hashlib.sha256(b).hexdigest()
assert not out.exists();m=json.loads((B/'manifest.json').read_bytes());assert m['complete'] and not m['errors'] and m['postPins']['unchanged'];subprocess.run([N,str(R/'work/reproduce-gzip-bulbs51.cjs'),str(B)],check=True);repro=json.loads((B/'gzip-reproduction51.json').read_bytes());by={p['path']:p for p in repro['files']};inventory=[];paths=sorted(B.rglob('*'));assert all(not p.is_symlink() for p in paths)
with tarfile.open(out,'w:xz',preset=6) as tf:
 for p in paths:
  if not p.is_file():continue
  rel=p.relative_to(B).as_posix();b=p.read_bytes();original={'path':rel,'bytes':len(b),'sha256':sha(b)}
  if rel.endswith('.gz'):
   q=by[rel];assert len(b)==q['gzipBytes'] and sha(b)==q['gzipSHA256'];b=gzip.decompress(b);assert len(b)==q['rawBytes'] and sha(b)==q['rawSHA256'];name='decoded-fragments/'+rel[:-3];original['reconstruction']='Node24 pinned gzipSync {level:9,mtime:0}; every original gzip exactly reproduced before archiving'
  else:name='original-metadata/'+rel
  info=tarfile.TarInfo(name);info.size=len(b);info.mode=0o600;info.mtime=0;tf.addfile(info,io.BytesIO(b));inventory.append({'member':name,'bytes':len(b),'sha256':sha(b),'original':original})
with tarfile.open(out,'r:xz') as tf:
 assert len(tf.getmembers())==len(inventory)
 for q in inventory:
  b=tf.extractfile(q['member']).read();assert len(b)==q['bytes'] and sha(b)==q['sha256']
b=out.read_bytes();dest=E/'bulbs51.raw01.lossless.tar.xz'
with dest.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
assert dest.read_bytes()==b;shutil.copyfile(B/'manifest.json',E/'manifest51.json');shutil.copyfile(B/'gzip-reproduction51.json',E/'gzip-reproduction51.json');report={'state':'FULL_RAW_LOSSLESS_FRAGMENT_ARCHIVE_ALL_ORIGINAL_GZIP_EXACTLY_REPRODUCIBLE','archive':dest.name,'archiveBytes':len(b),'archiveSHA256':sha(b),'manifestSHA256':sha((B/'manifest.json').read_bytes()),'originalGzipBytes':repro['originalGzipBytes'],'decodedRawBytes':repro['decodedRawBytes'],'originalNodeVersion':repro['nodeVersion'],'originalNodeSHA256':repro['nodeSHA256'],'allMembersIndependentlyDecodedAndHashed':True,'members':inventory,'publicChecks':0,'parentImagesViewed':0};(E/'storage51.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='members'}))
