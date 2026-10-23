from pathlib import Path
import os,stat,subprocess,hashlib,json,gzip,shutil,datetime
M=Path('/workspace/lyricfx.JIZURA');D=Path('/workspace/avoid008-final-c34');C='446ed00a8a9d42ca5d06d30603083142caf65386';P='tasks/evidence/AVOID-008/performance/';O=M/P/'payload-tree-evidence-import01';sha=lambda b:hashlib.sha256(b).hexdigest()
def git(root,*args):return subprocess.check_output(['git','-c','gc.auto=0',*args],cwd=root)
def meta(p):
 s=p.lstat();d={'dev':s.st_dev,'inode':s.st_ino,'mode':s.st_mode,'bytes':s.st_size,'mtimeNs':s.st_mtime_ns,'ctimeNs':s.st_ctime_ns,'nlink':s.st_nlink}
 if stat.S_ISLNK(s.st_mode):d['symlink']=os.readlink(p)
 return d
def write(p,data):assert not p.exists(),str(p);p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
roots=[P+n+'/' for n in git(D,'ls-tree','-d','--name-only',C+':'+P.rstrip('/')).decode().splitlines() if n.startswith('cache-payload-tree') or n in ['payload-tree-browser01','payload-tree-diagnose01']];assert len(roots)==15 and all(not(M/r).exists()for r in roots);assert not O.exists()
helpers=['dev/avoidance/layouts-c-payload-tree'+s for s in ['-test.cjs','-extended-test.cjs','-ledger-test.cjs','-actual-test.cjs','-browser-test.cjs']]+['dev/avoidance/layouts-c-perf-gate-support.cjs'];helperObjects={p:git(D,'rev-parse',C+':'+p).decode().strip() for p in helpers}
preflight=[]
for root in roots:
 rows=git(D,'ls-tree','-rl',C,'--',root).decode().splitlines();preflight.append({'path':root,'files':len(rows),'bytes':sum(int(x.split()[3])for x in rows),'mainPreviouslyAbsent':True})
assert sum(r['files']for r in preflight)==275 and sum(r['bytes']for r in preflight)==24794007
untracked=[os.fsdecode(p)for p in git(M,'ls-files','--others','--exclude-standard','-z').split(b'\0') if p];beforeU={p:meta(M/p)for p in untracked};protected=[*sorted((M/'src').glob('*.js')),M/'index.html',M/'en/index.html',*sorted((M/'app').rglob('*.pyc'))];before={str(p.relative_to(M)):sha(p.read_bytes())for p in protected};flat={str(p.relative_to(M)):sha(p.read_bytes())for p in sorted((M/P).glob('*.json'))};indexBefore=sha((M/'.git/index').read_bytes());inodes={(s['dev'],s['inode'])for s in beforeU.values()}
for p in git(M,'ls-files','-z').split(b'\0'):
 if not p:continue
 q=M/os.fsdecode(p)
 if q.exists()or q.is_symlink():s=q.lstat();inodes.add((s.st_dev,s.st_ino))
assert shutil.disk_usage(M).free>300*1024**2;O.mkdir();write(O/'preflight.json',(json.dumps({'commit':C,'roots':preflight,'helperGitBlobs':helperObjects,'freeBytes':shutil.disk_usage(M).free},indent=2)+'\n').encode());write(O/'protection-before.json',(json.dumps({'main87SHA256':before,'mainIndexSHA256':indexBefore,'existingFlatJSONSHA256':flat,'untrackedPathCount':len(untracked),'mainHEAD':git(M,'rev-parse','HEAD').decode().strip()},indent=2)+'\n').encode());write(O/'existing-untracked-before.json.gz',gzip.compress(json.dumps(beforeU,separators=(',',':')).encode(),mtime=0));entries=[]
for raw in git(D,'ls-tree','-rz',C,'--',*roots).split(b'\0'):
 if not raw:continue
 head,rel=raw.split(b'\t',1);mode,kind,oid=head.decode().split();assert kind=='blob';rel=os.fsdecode(rel);b=git(D,'cat-file','blob',oid);assert hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==oid;src=D/rel;dst=M/rel;assert not dst.exists();sm=meta(src) if src.exists()else None;exact=src.is_file()and src.read_bytes()==b;dst.parent.mkdir(parents=True,exist_ok=True)
 if exact and sm and stat.S_ISREG(sm['mode'])and(sm['dev'],sm['inode'])not in inodes:
  os.chmod(src,stat.S_IMODE(sm['mode'])&~0o222)
  try:os.link(src,dst);method='Git-exact-immutable-hardlink'
  except OSError:write(dst,b);method='Git-blob-independent-copy'
 else:write(dst,b);method='Git-blob-independent-copy-protect-existing-inode'
 if 'hardlink'not in method:os.chmod(dst,0o444)
 assert dst.read_bytes()==b;entries.append({'path':rel,'gitCommit':C,'gitMode':mode,'gitBlobSHA1':oid,'sha256':sha(b),'bytes':len(b),'donorActualGitExact':exact,'donorInodeAtVerification':meta(src) if src.exists()else None,'mainInodeAtVerification':meta(dst),'method':method})
assert len(entries)==275 and sum(e['bytes']for e in entries)==24794007
helperRows=[]
for rel,oid in helperObjects.items():
 b=git(D,'cat-file','blob',oid);packed=gzip.compress(b,compresslevel=9,mtime=0);dest=O/'helpers'/(rel.replace('/','__')+'.gz');write(dest,packed);assert gzip.decompress(dest.read_bytes())==b;helperRows.append({'originalPath':rel,'gitCommit':C,'gitBlobSHA1':oid,'rawSHA256':sha(b),'rawBytes':len(b),'archivePath':str(dest.relative_to(M)),'compressedSHA256':sha(packed),'compressedBytes':len(packed),'archiveInode':meta(dest),'topDevApplied':False})
afterU={p:meta(M/p)for p in untracked};changed=[p for p in untracked if beforeU[p]!=afterU[p]];assert not changed,changed;after={p:sha((M/p).read_bytes())for p in before};assert before==after;afterFlat={p:sha((M/p).read_bytes())for p in flat};assert flat==afterFlat;assert sha((M/'.git/index').read_bytes())==indexBefore;assert shutil.disk_usage(M).free>=250*1024**2
write(O/'existing-untracked-after.json.gz',gzip.compress(json.dumps(afterU,separators=(',',':')).encode(),mtime=0));manifest={'fixedCommit':C,'selectedRoots':preflight,'entries':entries,'helpers':helperRows,'mutableSourceOrFutureReportImported':False};write(O/'manifest.json',(json.dumps(manifest,indent=2)+'\n').encode());write(O/'import.py',Path('/tmp/avoid008-payload-tree-evidence-import01.py').read_bytes());receipt={'completedUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'fixedCommit':C,'manifestSHA256':sha((O/'manifest.json').read_bytes()),'directories':len(roots),'files':len(entries),'rawBytes':sum(e['bytes']for e in entries),'hardlinks':sum('hardlink'in e['method']for e in entries),'independentCopies':sum('hardlink'not in e['method']for e in entries),'helperLosslessArchives':len(helperRows),'main87Before':before,'main87After':after,'main87ByteExact':True,'mainIndexBefore':indexBefore,'mainIndexAfter':sha((M/'.git/index').read_bytes()),'flatJSONBefore':flat,'flatJSONAfter':afterFlat,'allExistingFlatJSONPreserved':True,'existingUntrackedPaths':len(untracked),'existingUntrackedMetadataChanged':changed,'existingUntrackedBeforeSHA256':sha((O/'existing-untracked-before.json.gz').read_bytes()),'existingUntrackedAfterSHA256':sha((O/'existing-untracked-after.json.gz').read_bytes()),'untrackedScope':'Every pre-existing path/inode/mode/size/mtime/ctime/nlink/symlink metadata exact. No unrelated full-content SHA claim.','mainProductTopDevApplied':False,'mainGitStageCommitPush':False,'testsBrowserTimingImagesPublic':False,'freeBytesAfter':shutil.disk_usage(M).free};write(O/'receipt.json',(json.dumps(receipt,indent=2)+'\n').encode());print(json.dumps({k:v for k,v in receipt.items()if k not in ['main87Before','main87After','flatJSONBefore','flatJSONAfter']},indent=2))
