from pathlib import Path
import os,stat,subprocess,hashlib,json,gzip,shutil,datetime
M=Path('/workspace/lyricfx.JIZURA');D=Path('/workspace/avoid008-final-c34');C='663239f9e67eac8ae1c28e849ce1ff66df53ae0f';B='6dd7241';roots=['tasks/evidence/AVOID-008/performance/final-c34-correctness01/','tasks/evidence/AVOID-008/performance/final-c34-diagnose01/','tasks/evidence/AVOID-008/performance/final-c34-profile02/','tasks/evidence/AVOID-008/final-c34-profile02-preparation/'];O=M/'tasks/evidence/AVOID-008/performance/final-c34-evidence-import01';sha=lambda b:hashlib.sha256(b).hexdigest()
def git(root,*args):return subprocess.check_output(['git','-c','gc.auto=0',*args],cwd=root)
def meta(p):
 s=p.lstat();r={'dev':s.st_dev,'inode':s.st_ino,'mode':s.st_mode,'bytes':s.st_size,'mtimeNs':s.st_mtime_ns,'ctimeNs':s.st_ctime_ns,'nlink':s.st_nlink}
 if stat.S_ISLNK(s.st_mode):r['symlink']=os.readlink(p)
 return r
def listing(*args):return [os.fsdecode(p) for p in git(M,*args).split(b'\0') if p]
def write_new(p,data):assert not p.exists(),str(p);p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
assert not O.exists();assert all(not(M/r).exists() for r in roots);assert shutil.disk_usage(M).free>300*1024**2
untracked=listing('ls-files','--others','--exclude-standard','-z');uBefore={p:meta(M/p) for p in untracked};protected=[*sorted((M/'src').glob('*.js')),M/'index.html',M/'en/index.html',*sorted((M/'app').rglob('*.pyc'))];before={str(p.relative_to(M)):sha(p.read_bytes()) for p in protected};indexBefore=sha((M/'.git/index').read_bytes());inodes={(v['dev'],v['inode']) for v in uBefore.values()}
for p in listing('ls-files','-z'):
 q=M/p
 if q.exists() or q.is_symlink():s=q.lstat();inodes.add((s.st_dev,s.st_ino))
start=datetime.datetime.now(datetime.timezone.utc).isoformat();O.mkdir();write_new(O/'existing-untracked-before.json.gz',gzip.compress(json.dumps(uBefore,separators=(',',':')).encode(),mtime=0));entries=[]
for rec in git(D,'ls-tree','-rz',C,'--',*roots).split(b'\0'):
 if not rec:continue
 header,raw=rec.split(b'\t',1);mode,kind,oid=header.decode().split();assert kind=='blob';rel=os.fsdecode(raw);dst=M/rel;assert not dst.exists();data=git(D,'cat-file','blob',oid);assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==oid;src=D/rel;srcMeta=meta(src) if src.exists() else None;exact=src.is_file() and src.read_bytes()==data;dst.parent.mkdir(parents=True,exist_ok=True)
 if exact and srcMeta and (srcMeta['dev'],srcMeta['inode']) not in inodes and stat.S_ISREG(srcMeta['mode']):
  os.chmod(src,stat.S_IMODE(srcMeta['mode'])&~0o222)
  try:os.link(src,dst);method='immutable-Git-exact-hardlink'
  except OSError:write_new(dst,data);method='Git-blob-independent-copy'
 else:write_new(dst,data);method='Git-blob-independent-copy-protect-existing-main-inode'
 assert dst.read_bytes()==data;entries.append({'path':rel,'gitCommit':C,'gitMode':mode,'gitBlobSHA1':oid,'sha256':sha(data),'bytes':len(data),'donorActualGitExact':exact,'donorBefore':srcMeta,'donorAfter':meta(src) if src.exists() else None,'mainAfter':meta(dst),'method':method})
assert len(entries)==381 and sum(e['bytes'] for e in entries)==35454946
helpers=[]
for rel in git(D,'diff','--name-only',B,C,'--','dev/avoidance').decode().splitlines():
 oid=git(D,'rev-parse',C+':'+rel).decode().strip();data=git(D,'cat-file','blob',oid);assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==oid;name=rel.replace('/','__')+'.gz';dst=O/'helpers'/name;packed=gzip.compress(data,compresslevel=9,mtime=0);write_new(dst,packed);assert gzip.decompress(dst.read_bytes())==data;helpers.append({'originalPath':rel,'gitCommit':C,'gitBlobSHA1':oid,'rawSHA256':sha(data),'rawBytes':len(data),'archivePath':str(dst.relative_to(M)),'compressedSHA256':sha(packed),'compressedBytes':len(packed),'archiveInode':meta(dst),'topDevApplied':False})
assert len(helpers)==22
after={p:meta(M/p) for p in untracked};changed=[p for p in untracked if uBefore[p]!=after[p]];assert not changed,changed;afterProtected={str(p.relative_to(M)):sha(p.read_bytes()) for p in protected};assert before==afterProtected;indexAfter=sha((M/'.git/index').read_bytes());assert indexBefore==indexAfter;assert shutil.disk_usage(M).free>=250*1024**2
write_new(O/'existing-untracked-after.json.gz',gzip.compress(json.dumps(after,separators=(',',':')).encode(),mtime=0));manifest={'donorCommit':C,'donorSourceNotImported':True,'selectedRoots':roots,'entries':entries,'helpers':helpers,'helperDiffBase':B,'fixedGitEvidenceFiles':len(entries),'rawEvidenceBytes':sum(x['bytes'] for x in entries),'helperCount':len(helpers)};write_new(O/'manifest.json',(json.dumps(manifest,indent=2)+'\n').encode());write_new(O/'import.py',Path('/tmp/avoid008-final-c34-evidence-import01.py').read_bytes())
receipt={'start':start,'end':datetime.datetime.now(datetime.timezone.utc).isoformat(),'donorCommit':C,'selectedRoots':roots,'manifestSHA256':sha((O/'manifest.json').read_bytes()),'fixedGitEvidenceFiles':len(entries),'rawEvidenceBytes':sum(x['bytes'] for x in entries),'hardlinks':sum('hardlink'in x['method'] for x in entries),'independentCopies':sum('hardlink'not in x['method'] for x in entries),'helperLosslessArchives':len(helpers),'protectedMainBefore':before,'protectedMainAfter':afterProtected,'main87ByteExact':True,'mainIndexBefore':indexBefore,'mainIndexAfter':indexAfter,'mainIndexUnchanged':True,'existingUntrackedPaths':len(untracked),'existingUntrackedProtection':'All path/inode/mode/bytes/mtimeNs/ctimeNs/nlink/symlink metadata compared. Contents of unrelated26.5GB were not reread; do not infer a full-content SHA audit. No old file was an allowed write target.','existingUntrackedMetadataChanged':changed,'existingUntrackedBeforeSHA256':sha((O/'existing-untracked-before.json.gz').read_bytes()),'existingUntrackedAfterSHA256':sha((O/'existing-untracked-after.json.gz').read_bytes()),'topDevApplied':False,'mainProductApplied':False,'mainGitStageCommitPush':False,'browserTestsTimingImagesPublic':False,'freeBytesAfter':shutil.disk_usage(M).free};write_new(O/'receipt.json',(json.dumps(receipt,indent=2)+'\n').encode());print(json.dumps({k:v for k,v in receipt.items() if k not in ['protectedMainBefore','protectedMainAfter','selectedRoots']},indent=2))
