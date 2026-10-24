#!/usr/bin/env python3
"""Parent-reviewed, single-file Gitblob-only capacity transaction. Abrupt-death NONATOMIC."""
import argparse,hashlib,json,os,pathlib,stat,subprocess
P=pathlib.Path;ROOT=P('/workspace/lyricfx.JIZURA');INDEX=ROOT/'.git/index'
BASE=P('/dev/shm/avoid009-evening-20261024');SNAP=P('/tmp/avoid009-evening-capacity-pile03/snapshot.json')
REL='tasks/evidence/AVOID-009/revisions-20261024/pile-exit13/media01/after-frames.json.gz'
BLOB='ea66a2ce7d23633a226959650bbcfbdc176b3a39';RAW_SHA='9871dbde2bdc8008773cab7f0cdc7738909f215221b7e0ab85a7b0826270ac68';RAW_BYTES=8236265
PROOF=BASE/'capacity-pile03-proof.json';RECEIPT=BASE/'capacity-pile03-receipt.json';START=BASE/'capacity-pile03-started.json';PRIVATE=BASE/'capacity-pile03-index'
def need(x,m):
 if not x:raise RuntimeError(m)
def sha(b):return hashlib.sha256(b).hexdigest()
def regular(p):
 for q in [*reversed(p.parents),p]:need(not q.is_symlink(),'symlink refused')
 s=p.lstat();need(stat.S_ISREG(s.st_mode),'regular file required');return s
def writejson(p,x):
 with p.open('x') as f:json.dump(x,f,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
def env(private=None):
 e=os.environ.copy();e.pop('GIT_INDEX_FILE',None);e.update(GIT_OPTIONAL_LOCKS='0',GIT_TERMINAL_PROMPT='0')
 n=int(e.get('GIT_CONFIG_COUNT','0'))
 for i,(k,v) in enumerate([('gc.auto','0'),('maintenance.auto','false')]):e['GIT_CONFIG_KEY_'+str(n+i)]=k;e['GIT_CONFIG_VALUE_'+str(n+i)]=v
 e['GIT_CONFIG_COUNT']=str(n+2)
 if private:e['GIT_INDEX_FILE']=str(private)
 return e
def git(a,private=None):return subprocess.run(['git','-C',str(ROOT),*a],env=env(private),check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE).stdout
def head():return git(['rev-parse','HEAD']).decode().strip()
def flags(private=None):return git(['ls-files','-v','-z'],private)
def skips(private=None):return sorted(x[2:].decode() for x in flags(private).split(b'\0') if x.startswith(b'S '))
def special(private=None):return [x.decode() for x in flags(private).split(b'\0') if x and not x.startswith(b'H ')]
def protect(m,new=False):
 expected=m['skip']+([REL] if new else [])
 need(len(m['skip'])==52 and len(set(expected))==len(expected),'exact old52 plus optional one')
 for rel in expected:need(not os.path.lexists(ROOT/rel),'protected absent path appeared')
 for x in m['pycs']:
  p=ROOT/x['path'];regular(p);b=p.read_bytes();need(len(b)==x['bytes'] and sha(b)==x['sha256'],'PYC changed')
def model():
 regular(SNAP);b=SNAP.read_bytes();need(ARGS.snapshot_sha256 and sha(b)==ARGS.snapshot_sha256,'snapshot seal required');return json.loads(b)
def baseline(m):
 regular(INDEX);s=INDEX.stat();b=INDEX.read_bytes()
 need((s.st_dev,s.st_ino,stat.S_IMODE(s.st_mode))==(m['indexDevice'],m['indexInode'],m['indexMode']),'ROOT identity/mode changed')
 need(len(b)==m['indexBytes'] and sha(b)==m['indexSHA256'],'ROOT index changed')
 need(head()==m['head']==ARGS.expected_head,'explicit baseline HEAD differs')
 need(skips()==m['skip'] and special()==m['specialFlags'],'old52/fullspecial changed')
 need(sha(flags())==m['flagsSHA256'] and sha(git(['ls-files','--stage','-z']))==m['stageSHA256'],'full stage/flags changed');protect(m)
 regular(P(m['bootstrapReceiptPath']));receipt=P(m['bootstrapReceiptPath']).read_bytes();need(sha(receipt)==m['bootstrapReceiptSHA256'],'installed receipt changed')
 r=json.loads(receipt);need(r['sameInode'] is True and r['skipCount']==52 and r['PYCAndOld52Preserved'] is True and r['newSHA256']==sha(b) and r['head']==head(),'installed receipt mismatch')
 return b
def raw(m):
 p=ROOT/REL;s=regular(p);b=p.read_bytes()
 need((s.st_dev,s.st_ino,stat.S_IMODE(s.st_mode))==(m['targetDevice'],m['targetInode'],m['targetMode']),'target identity/mode changed')
 need(len(b)==RAW_BYTES and sha(b)==RAW_SHA and b==git(['cat-file','blob',BLOB]),'full target/blob mismatch')
 need(git(['rev-parse',m['head']+':'+REL]).decode().strip()==BLOB,'current HEAD does not contain target blob')
 need(git(['ls-files','--stage','--',REL]).decode().strip()=='100644 '+BLOB+' 0\t'+REL,'index target differs from committed blob')
 return b
def official():
 need(BASE.is_dir() and not BASE.is_symlink(),'official keeper namespace required')
 need(not os.path.lexists(ROOT/'.git/index.lock'),'ROOT locked')
def source_sha():return sha(P(__file__).read_bytes())
def verify(m):
 official();need(all(not os.path.lexists(x) for x in [PROOF,PRIVATE,START,RECEIPT]),'fresh transaction required');b=baseline(m);data=raw(m)
 writejson(PROOF,{'state':'VERIFIED_NOT_RELEASED','sourceSHA256':source_sha(),'snapshotSHA256':ARGS.snapshot_sha256,'head':head(),'rootSHA256':sha(b),'rawSHA256':sha(data),'rawBytes':len(data),'rawAllocated':(ROOT/REL).stat().st_blocks*512,'releaseOnlyPath':REL,'old52Preserved':True,'PYC7Preserved':True})
 print(PROOF.read_text())
def put(fd,b):
 off=0
 while off<len(b):
  n=os.pwrite(fd,b[off:off+1048576],off);need(n>0,'short write');off+=n
 os.ftruncate(fd,len(b));os.fsync(fd)
def finalcheck(m,final,new):
 need(INDEX.read_bytes()==final,'installed ROOT bytes differ');s=regular(INDEX)
 need((s.st_dev,s.st_ino,stat.S_IMODE(s.st_mode))==(m['indexDevice'],m['indexInode'],m['indexMode']),'installed identity/mode differs')
 need(skips()==sorted(m['skip']+[REL]),'expected exact53 skips');need(special()==sorted(m['specialFlags']+['S '+REL]),'special flags differ')
 need(git(['ls-files','--stage','-z'])==git(['ls-files','--stage','-z'],PRIVATE),'installed stage mismatch');protect(m,new);need(head()==m['head'],'HEAD changed')
def release(m):
 official();regular(PROOF);pb=PROOF.read_bytes();proof=json.loads(pb)
 need(ARGS.proof_sha256 and sha(pb)==ARGS.proof_sha256,'parent exact proof seal required')
 need(proof['state']=='VERIFIED_NOT_RELEASED' and proof['sourceSHA256']==source_sha() and proof['snapshotSHA256']==ARGS.snapshot_sha256,'proof/source mismatch')
 need(all(not os.path.lexists(x) for x in [PRIVATE,START,RECEIPT]),'transaction already started: stop for recovery')
 old=baseline(m);data=raw(m) # Both independent full rollback copies stay in RAM throughout.
 need(proof['head']==head() and proof['rootSHA256']==sha(old) and proof['rawSHA256']==sha(data),'proof baseline mismatch')
 with PRIVATE.open('xb') as f:f.write(old);f.flush();os.fsync(f.fileno())
 need(PRIVATE.read_bytes()==old,'private copy mismatch')
 stage=git(['ls-files','--stage','-z']);git(['update-index','--skip-worktree','--',REL],PRIVATE)
 need(git(['ls-files','--stage','-z'],PRIVATE)==stage,'stage changed while adding flag')
 need(skips(PRIVATE)==sorted(m['skip']+[REL]) and special(PRIVATE)==sorted(m['specialFlags']+['S '+REL]),'private flags differ')
 final=PRIVATE.read_bytes();need(final[:4]==b'DIRC','private index invalid');baseline(m);need(raw(m)==data,'target bytes changed')
 writejson(START,{'state':'IN_PROGRESS_DO_NOT_RERUN','proofSHA256':sha(pb),'oldIndexSHA256':sha(old),'finalIndexSHA256':sha(final),'targetSHA256':sha(data)})
 lock=ROOT/'.git/index.lock';lfd=os.open(lock,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600);fd=None;removed=False;written=False
 try:
  baseline(m);fd=os.open(INDEX,os.O_RDWR|os.O_NOFOLLOW);s=os.fstat(fd);need((s.st_dev,s.st_ino)==(m['indexDevice'],m['indexInode']),'fd identity differs');need(os.pread(fd,len(old)+1,0)==old,'old fd bytes differ')
  try:
   written=True;put(fd,final);finalcheck(m,final,False)
   need(raw(m)==data,'target changed before exact unlink');(ROOT/REL).unlink();removed=True
   directory=os.open((ROOT/REL).parent,os.O_RDONLY|os.O_DIRECTORY)
   try:os.fsync(directory)
   finally:os.close(directory)
   finalcheck(m,final,True)
   writejson(RECEIPT,{'state':'RELEASED_GITBLOB_ONLY','releaseOnlyPath':REL,'blob':BLOB,'rawSHA256':sha(data),'rawBytes':len(data),'freedAllocatedBytes':proof['rawAllocated'],'head':head(),'oldSHA256':sha(old),'newSHA256':sha(final),'newBytes':len(final),'sameInode':True,'skipCount':53,'old52AndPYC7Preserved':True,'proofSHA256':sha(pb),'sourceSHA256':source_sha()})
  except BaseException:
   if removed:
    with (ROOT/REL).open('xb') as f:f.write(data);f.flush();os.fsync(f.fileno())
    os.chmod(ROOT/REL,m['targetMode']);need((ROOT/REL).read_bytes()==data,'raw rollback differs')
   if written:put(fd,old);need(INDEX.read_bytes()==old,'index rollback differs')
   raise
  print(RECEIPT.read_text())
 finally:
  if fd is not None:os.close(fd)
  os.close(lfd);lock.unlink()
def restore(m):
 official();receipt=ROOT/'tasks/evidence/AVOID-009/evening-20261024/storage-capacity-pile03/capacity-pile03-receipt.json';regular(receipt);rb=receipt.read_bytes();r=json.loads(rb)
 need(sha(rb)==ARGS.release_receipt_sha256,'exact durable release receipt SHA required')
 need(r['state']=='RELEASED_GITBLOB_ONLY' and r['releaseOnlyPath']==REL and r['blob']==BLOB and r['rawSHA256']==RAW_SHA and r['old52AndPYC7Preserved'] is True,'release receipt differs')
 need(head()==ARGS.expected_head==m['head']==r['head'],'restore only supported immediately at release HEAD; fresh source gate required after later commits')
 need(skips()==sorted(m['skip']+[REL]) and special()==sorted(m['specialFlags']+['S '+REL]),'restore expected exact53 flags');protect(m,True)
 need(sha(git(['ls-files','--stage','-z']))==m['stageSHA256'],'restore stage differs')
 old=INDEX.read_bytes();info=regular(INDEX)
 need(sha(old)==r['newSHA256'] and len(old)==r['newBytes'],'restore ROOT no longer exact release index')
 need((info.st_dev,info.st_ino,stat.S_IMODE(info.st_mode))==(m['indexDevice'],m['indexInode'],m['indexMode']),'restore identity/mode differs')
 data=git(['cat-file','blob',BLOB]);need(len(data)==RAW_BYTES and sha(data)==RAW_SHA,'restore blob mismatch')
 need(git(['rev-parse',head()+':'+REL]).decode().strip()==BLOB,'restore HEAD blob differs')
 private=BASE/'capacity-pile03-restore-index';started=BASE/'capacity-pile03-restore-started.json';out=BASE/'capacity-pile03-restore-receipt.json'
 need(all(not os.path.lexists(x) for x in [private,started,out,ROOT/REL]),'fresh restore required')
 with private.open('xb') as f:f.write(old);f.flush();os.fsync(f.fileno())
 git(['update-index','--no-skip-worktree','--',REL],private)
 need(skips(private)==m['skip'] and special(private)==m['specialFlags'],'restore flags differ')
 need(sha(git(['ls-files','--stage','-z'],private))==m['stageSHA256'],'restore entries differ');final=private.read_bytes()
 writejson(started,{'state':'RESTORE_STARTED_DO_NOT_RERUN','releaseReceiptSHA256':sha(rb),'oldIndexSHA256':sha(old),'newIndexSHA256':sha(final)})
 lock=ROOT/'.git/index.lock';lfd=os.open(lock,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600);fd=None;created=None;written=False
 try:
  need(INDEX.read_bytes()==old and not os.path.lexists(ROOT/REL) and head()==m['head'],'restore baseline changed')
  fd=os.open(INDEX,os.O_RDWR|os.O_NOFOLLOW);st=os.fstat(fd);need((st.st_dev,st.st_ino)==(m['indexDevice'],m['indexInode']),'restore fd differs')
  try:
   with (ROOT/REL).open('xb') as f:
    created=os.fstat(f.fileno()).st_ino;f.write(data);f.flush();os.fsync(f.fileno())
   os.chmod(ROOT/REL,m['targetMode']);need((ROOT/REL).read_bytes()==data,'restored bytes differ')
   written=True;put(fd,final)
   need(INDEX.read_bytes()==final and skips()==m['skip'] and special()==m['specialFlags'],'restored index differs');protect(m);need(head()==m['head'],'HEAD changed')
   writejson(out,{'state':'RESTORED_FULL_BYTES_OLD52_ONLY','path':REL,'blob':BLOB,'rawSHA256':sha(data),'newIndexSHA256':sha(final),'sameInode':True,'old52AndPYC7Preserved':True,'head':head()})
  except BaseException:
   try:
    if written:put(fd,old);need(INDEX.read_bytes()==old,'restore index rollback differs')
   finally:
    if created is not None:
     need(regular(ROOT/REL).st_ino==created,'restore-owned inode replaced');(ROOT/REL).unlink()
   raise
  print(out.read_text())
 finally:
  if fd is not None:os.close(fd)
  os.close(lfd);lock.unlink()
if __name__=='__main__':
 ap=argparse.ArgumentParser(description='Immediate reversible restore only; fresh source review required after later commits');ap.add_argument('--snapshot-sha256',required=True);ap.add_argument('--expected-head',required=True);ap.add_argument('--release-receipt-sha256',required=True);ARGS=ap.parse_args();restore(model())
