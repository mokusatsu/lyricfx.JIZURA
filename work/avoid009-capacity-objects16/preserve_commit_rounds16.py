#!/usr/bin/env python3
"""Archive historical commit metadata; extraction NEVER installs or authorizes an index.
BUILD reads the exact reviewed external round files. VERIFY checks every full archive
member and XZ CRC. EXTRACT requires an absent explicit directory, preserves history,
and cannot change ROOT index, flags, HEAD, or continue stale helper rounds.
"""
import argparse, hashlib, io, json, os, pathlib, tarfile
P=pathlib.Path
ROOT=P('/workspace/lyricfx.JIZURA')
EXTERNAL=P('/workspace/avoid009-private-commit16-20261025')
DEST=ROOT/'tasks/evidence/AVOID-009/evening-20261024/storage-capacity-objects16/commit-rounds-durable01'
NAMES=[f'evening-resume16-index-round-{n}{suffix}' for n in [1,2] for suffix in ['', '-state.json', '-receipt.json']]+['final-result.json','parent-final-staged-review.json']
EXPECTED={'evening-resume16-index-round-1':'12cce11faea8d1079d7ea76ed967e76595544832fc1876d525713ae46353b68e','evening-resume16-index-round-2':'579bdcfec781ca98d9710b2bd9f97a7aabc4f335e2731f17c1157c56dbfb540a','evening-resume16-index-round-2-receipt.json':'7352d3d33d782708bde956616f0652806fd689d279ddaba4205b9f93d1083211'}
def sha(data):return hashlib.sha256(data).hexdigest()
def need(ok,msg):
 if not ok:raise RuntimeError(msg)
def regular(path):
 for part in [*reversed(path.parents),path]:need(not part.is_symlink(),'symlink refused')
 need(path.is_file() and path.stat().st_nlink==1,'single regular file required')
def write(path,data):
 with path.open('xb') as f:f.write(data);f.flush();os.fsync(f.fileno())
def verify(manifest_sha):
 regular(DEST/'manifest.json');mb=(DEST/'manifest.json').read_bytes();need(sha(mb)==manifest_sha,'parent manifest seal required');m=json.loads(mb)
 regular(DEST/'historical-rounds.tar.xz');archive=(DEST/'historical-rounds.tar.xz').read_bytes();need(sha(archive)==m['archiveSHA256'],'archive full hash differs');rows={x['name']:x for x in m['files']};seen=set();data={}
 with tarfile.open(fileobj=io.BytesIO(archive),mode='r|xz') as tf:
  for member in tf:
   need(member.isfile() and member.name in rows and member.name not in seen,'archive scope differs');b=tf.extractfile(member).read();x=rows[member.name];need(len(b)==x['bytes'] and sha(b)==x['sha256'],'historical member differs');data[member.name]=b;seen.add(member.name)
 need(seen==set(NAMES)==set(rows),'missing or extra historical members')
 for key,value in EXPECTED.items():need(sha(data[key])==value,'reviewed historical pin differs')
 # Full LZMA decoding by tar may finish before the XZ footer. Explicit full decode
 # checks the container checksum/footer as well as every stored member hash.
 import lzma
 lzma.decompress(archive)
 return m,data
if __name__=='__main__':
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('action',choices=['BUILD','VERIFY','EXTRACT']);ap.add_argument('--manifest-sha256');ap.add_argument('--destination');a=ap.parse_args()
 if a.action=='BUILD':
  need(not os.path.lexists(DEST),'exclusive fresh capsule required');payload={}
  for name in NAMES:regular(EXTERNAL/name);payload[name]=(EXTERNAL/name).read_bytes()
  for key,value in EXPECTED.items():need(sha(payload[key])==value,'reviewed historical pin differs')
  for n in [1,2]:
   r=json.loads(payload[f'evening-resume16-index-round-{n}-receipt.json']);b=payload[f'evening-resume16-index-round-{n}'];need(r['round']==n and r['sameInode'] is True and r['skipCount']==65 and r['PYCAndProtected65Preserved'] is True and r['newSHA256']==sha(b) and r['newBytes']==len(b),'historical index receipt differs')
  DEST.mkdir(mode=0o700)
  with tarfile.open(DEST/'historical-rounds.tar.xz','x:xz',preset=0) as tf:
   for name,b in payload.items():
    info=tarfile.TarInfo(name);info.size=len(b);info.mode=0o600;tf.addfile(info,io.BytesIO(b))
  archive=DEST/'historical-rounds.tar.xz'
  with archive.open('rb') as f:os.fsync(f.fileno())
  m={'state':'HISTORICAL_METADATA_ARCHIVE_NOT_ACTIVE_INDEX_AUTHORITY','files':[{'name':n,'bytes':len(b),'sha256':sha(b)} for n,b in payload.items()],'archiveSHA256':sha(archive.read_bytes()),'archiveBytes':archive.stat().st_size,'oldFinalResultPushFailureRetainedAsHistorical':True,'latestActualPush':{'state':'PARENT_REPORTED_PUSH_DONE','from':'309a7c16b82e130ea92c966983576e4d6f770437','to':'a5bc1de12b779b87c60a21f3402dad5cdca4e621','publicResultChecks':0},'continuation':'Read actual current Git HEAD/index/stage/65/PYC7; bootstrap a fresh reviewed private-index model. Never replay these historical rounds after later commits. Fresh-clone skip/absent/PYC materialization requires separate explicit review; archive is not portable app/runtime proof.'}
  mb=(json.dumps(m,indent=2)+'\n').encode();write(DEST/'manifest.json',mb);seal=sha(mb);verify(seal);print(json.dumps({'manifestSHA256':seal,'archiveBytes':m['archiveBytes'],'fullMembersVerified':len(NAMES)}))
 else:
  m,data=verify(a.manifest_sha256)
  if a.action=='EXTRACT':
   need(a.destination,'explicit new destination required');target=P(a.destination);need(target.is_absolute() and not os.path.lexists(target),'absolute absent directory required');need(ROOT not in target.parents and target!=ROOT,'extract outside repository only')
   for part in reversed(target.parent.parents):need(not part.is_symlink(),'symlink parent refused')
   need(not target.parent.is_symlink(),'symlink parent refused');target.mkdir(mode=0o700)
   for name,b in data.items():write(target/name,b)
  print(json.dumps({'verifiedHistoricalFiles':len(data),'activeROOTIndexModified':False,'staleRoundsAuthorized':False}))
