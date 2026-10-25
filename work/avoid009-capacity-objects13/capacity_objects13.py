#!/usr/bin/env python3
"""Parent-reviewed, single-file Gitblob-only capacity transaction. Abrupt-death NONATOMIC."""
import argparse,gzip,hashlib,io,json,os,pathlib,stat,subprocess
P=pathlib.Path;ROOT=P('/workspace/lyricfx.JIZURA');INDEX=ROOT/'.git/index'
BASE=P('/dev/shm/avoid009-evening-20261024');SNAP=P('/workspace/lyricfx.JIZURA/work/avoid009-capacity-objects13/snapshot.json')
REL='tasks/evidence/AVOID-008/objects/integrated01/matrix01.json.gz'
BLOB='0fa23b43f765a75341c77d3705354b237f7f49e6';RAW_SHA='1cecddb3bae348f51bb6d9edb86bce060277f3deb22a7a4abccdf321ad1d0db1';RAW_BYTES=32488013
PROOF=BASE/'capacity-objects13-proof.json';RECEIPT=BASE/'capacity-objects13-receipt.json';START=BASE/'capacity-objects13-started.json';INTENT=BASE/'capacity-objects13-unlink-intent.json';PRIVATE=BASE/'capacity-objects13-index'
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
 need(len(m['pycs'])==7 and len({x['path'] for x in m['pycs']})==7,'exact7PYC required')
 need(len(m['skip'])==61 and len(set(expected))==len(expected),'exact old61 plus optional one')
 for rel in expected:need(not os.path.lexists(ROOT/rel),'protected absent path appeared')
 for x in m['pycs']:
  p=ROOT/x['path'];regular(p);b=p.read_bytes();need(len(b)==x['bytes'] and sha(b)==x['sha256'],'PYC changed')
def model():
 regular(SNAP);b=SNAP.read_bytes();need(ARGS.snapshot_sha256 and sha(b)==ARGS.snapshot_sha256,'snapshot seal required');return json.loads(b)
def parent_gates():
 need(ARGS.source56_conditional_postpins_reviewed and ARGS.source55_failure_preserved,'parent56conditional raw/postpins review and55failurepreservation required; notadapter/perf/55pass')
def baseline(m):
 parent_gates()
 s=regular(INDEX);need(s.st_nlink==m['indexNlink']==1,'ROOT nlink changed');b=INDEX.read_bytes()
 need((s.st_dev,s.st_ino,stat.S_IMODE(s.st_mode))==(m['indexDevice'],m['indexInode'],m['indexMode']),'ROOT identity/mode changed')
 need(len(b)==m['indexBytes'] and sha(b)==m['indexSHA256'],'ROOT index changed')
 need(head()==m['head']==ARGS.expected_head,'explicit baseline HEAD differs')
 need(skips()==m['skip'] and special()==m['specialFlags'],'old61/fullspecial changed')
 need(sha(flags())==m['flagsSHA256'] and sha(git(['ls-files','--stage','-z']))==m['stageSHA256'],'full stage/flags changed');protect(m)
 regular(P(m['bootstrapReceiptPath']));receipt=P(m['bootstrapReceiptPath']).read_bytes();need(sha(receipt)==m['bootstrapReceiptSHA256'],'installed receipt changed')
 r=json.loads(receipt);need(r['round']==2 and r['sameInode'] is True and r['skipCount']==61 and r['PYCAndProtected61Preserved'] is True and r['newSHA256']==sha(b) and r['head']==head(),'installed receipt mismatch')
 return b
def decodedcheck(data):
 digest=hashlib.sha256();count=0
 with gzip.GzipFile(fileobj=io.BytesIO(data),mode='rb') as stream:
  while True:
   chunk=stream.read(1048576)
   if not chunk:break
   digest.update(chunk);count+=len(chunk)
 need(count==244873234 and digest.hexdigest()=='308f5e7608a76abc03392397a180abdc3a5a176343f0353a7589b3d9ae421610','gzip decoded full stream size/hash/CRC differs')
def raw(m):
 p=ROOT/REL;s=regular(p);need(s.st_nlink==m['targetNlink']==1,'target nlink changed');need(s.st_blocks*512==m['targetAllocated'],'target allocated bytes changed');b=p.read_bytes()
 need((s.st_dev,s.st_ino,stat.S_IMODE(s.st_mode))==(m['targetDevice'],m['targetInode'],m['targetMode']),'target identity/mode changed')
 need(len(b)==RAW_BYTES and sha(b)==RAW_SHA and b==git(['cat-file','blob',BLOB]),'full target/blob mismatch')
 decodedcheck(b)
 need(git(['rev-parse',m['head']+':'+REL]).decode().strip()==BLOB,'current HEAD does not contain target blob')
 need(git(['ls-files','--stage','--',REL]).decode().strip()=='100644 '+BLOB+' 0\t'+REL,'index target differs from committed blob')
 return b
def official():
 need(BASE.is_dir() and not BASE.is_symlink(),'official keeper namespace required')
 need(not os.path.lexists(ROOT/'.git/index.lock'),'ROOT locked')
def source_sha():return sha(P(__file__).read_bytes())
def verify(m):
 official();need(all(not os.path.lexists(x) for x in [PROOF,PRIVATE,START,INTENT,RECEIPT]),'fresh transaction required');b=baseline(m);data=raw(m)
 writejson(PROOF,{'state':'VERIFIED_NOT_RELEASED','sourceSHA256':source_sha(),'snapshotSHA256':ARGS.snapshot_sha256,'head':head(),'rootSHA256':sha(b),'rawSHA256':sha(data),'rawBytes':len(data),'rawAllocated':(ROOT/REL).stat().st_blocks*512,'releaseOnlyPath':REL,'old61Preserved':True,'PYC7Preserved':True,'source56Result':'CONDITIONAL_RAW_REVIEW02_ACCEPTED_NOT_ADAPTER_OR_PERFORMANCE','source56Completed':True,'source56ConditionalPostpinsReviewed':True,'source56AdapterAccepted':False,'source56PerformanceAccepted':False,'source55Result':'FAILED_INTERN_KEY_BYTE_BUDGET','source55Passed':False,'source55FailurePreserved':True})
 print(PROOF.read_text())
def put(fd,b):
 off=0
 while off<len(b):
  n=os.pwrite(fd,b[off:off+1048576],off);need(n>0,'short write');off+=n
 os.ftruncate(fd,len(b));os.fsync(fd)
def finalcheck(m,final,new):
 need(INDEX.read_bytes()==final,'installed ROOT bytes differ');s=regular(INDEX);need(s.st_nlink==m['indexNlink']==1,'installed ROOT nlink changed')
 need((s.st_dev,s.st_ino,stat.S_IMODE(s.st_mode))==(m['indexDevice'],m['indexInode'],m['indexMode']),'installed identity/mode differs')
 need(skips()==sorted(m['skip']+[REL]),'expected exact62 skips');need(special()==sorted(m['specialFlags']+['S '+REL]),'special flags differ')
 need(git(['ls-files','--stage','-z'])==git(['ls-files','--stage','-z'],PRIVATE),'installed stage mismatch');protect(m,new);need(head()==m['head'],'HEAD changed')
def release(m):
 official();regular(PROOF);pb=PROOF.read_bytes();proof=json.loads(pb)
 need(ARGS.proof_sha256 and sha(pb)==ARGS.proof_sha256,'parent exact proof seal required')
 need(proof['state']=='VERIFIED_NOT_RELEASED' and proof['sourceSHA256']==source_sha() and proof['snapshotSHA256']==ARGS.snapshot_sha256,'proof/source mismatch')
 need(all(not os.path.lexists(x) for x in [PRIVATE,START,INTENT,RECEIPT]),'transaction already started: stop for recovery')
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
   need(raw(m)==data,'target changed before exact unlink')
   writejson(INTENT,{'state':'INDEX_INSTALLED_UNLINK_NOT_YET_CONFIRMED','releaseOnlyPath':REL,'blob':BLOB,'rawSHA256':sha(data),'rawBytes':len(data),'oldSHA256':sha(old),'newSHA256':sha(final),'proofSHA256':sha(pb),'snapshotSHA256':ARGS.snapshot_sha256,'head':head(),'targetInode':m['targetInode']})
   (ROOT/REL).unlink();removed=True
   directory=os.open((ROOT/REL).parent,os.O_RDONLY|os.O_DIRECTORY)
   try:os.fsync(directory)
   finally:os.close(directory)
   finalcheck(m,final,True)
   writejson(RECEIPT,{'state':'RELEASED_GITBLOB_ONLY','releaseOnlyPath':REL,'blob':BLOB,'rawSHA256':sha(data),'rawBytes':len(data),'freedAllocatedBytes':proof['rawAllocated'],'head':head(),'oldSHA256':sha(old),'newSHA256':sha(final),'newBytes':len(final),'sameInode':True,'skipCount':62,'old61AndPYC7Preserved':True,'proofSHA256':sha(pb),'sourceSHA256':source_sha(),'snapshotSHA256':ARGS.snapshot_sha256,'unlinkIntentSHA256':sha(INTENT.read_bytes()),'source56Result':'CONDITIONAL_RAW_REVIEW02_ACCEPTED_NOT_ADAPTER_OR_PERFORMANCE','source56Completed':True,'source56ConditionalPostpinsReviewed':True,'source56AdapterAccepted':False,'source56PerformanceAccepted':False,'source55Result':'FAILED_INTERN_KEY_BYTE_BUDGET','source55Passed':False,'source55FailurePreserved':True})
  except BaseException:
   try:
    if removed:
     with (ROOT/REL).open('xb') as f:f.write(data);f.flush();os.fsync(f.fileno())
     os.chmod(ROOT/REL,m['targetMode']);need((ROOT/REL).read_bytes()==data,'raw rollback differs')
   finally:
    if written:put(fd,old);need(INDEX.read_bytes()==old,'index rollback differs')
   raise
  print(RECEIPT.read_text())
 finally:
  if fd is not None:os.close(fd)
  need(regular(lock).st_ino==os.fstat(lfd).st_ino and regular(lock).st_size==0,'owned zero-byte lock replaced');os.close(lfd);lock.unlink()
if __name__=='__main__':
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('action',choices=['VERIFY','RELEASE']);ap.add_argument('--snapshot-sha256',required=True);ap.add_argument('--expected-head',required=True);ap.add_argument('--proof-sha256');ap.add_argument('--source56-conditional-postpins-reviewed',action='store_true',required=True);ap.add_argument('--source55-failure-preserved',action='store_true',required=True);ARGS=ap.parse_args();m=model()
 if ARGS.action=='VERIFY':verify(m)
 else:release(m)
