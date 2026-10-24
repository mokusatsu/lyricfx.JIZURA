#!/usr/bin/env python3
"""Immediate restore; reviewed sibling guard supplies pinned common primitives."""
import capacity_objects15 as core
from capacity_objects15 import *
def restore(m):
 official();receipt=ROOT/'tasks/evidence/AVOID-009/evening-20261024/storage-capacity-objects15/capacity-objects15-receipt.json';regular(receipt);rb=receipt.read_bytes();r=json.loads(rb)
 need(sha(rb)==ARGS.release_receipt_sha256,'exact durable release receipt SHA required')
 need(r['snapshotSHA256']==ARGS.snapshot_sha256 and r['sourceSHA256']==source_sha(),'release snapshot/source differs')
 need(r['state']=='RELEASED_GITBLOB_ONLY' and r['releaseOnlyPath']==REL and r['blob']==BLOB and r['rawSHA256']==RAW_SHA and r['old63AndPYC7Preserved'] is True,'release receipt differs')
 need(m['finalSourceReviewPending'] is False and m['source60Context']['finalReviewPending'] is False and r['source60BothParentRawReviewsAccepted'] is True and r['source60ConditionalOnly'] is True and r['source60HumanApproval'] is False and r['source60ProductAdmission'] is False and r['source60SavingBodyAccepted'] is False and r['source60FormalPerformanceAccepted'] is False,'release60 both reviews/conditional scope differs')
 for phase in ['oracle','media']:
  d=m['source60Context']['phases'][phase];prefix='source60'+phase.title();need(r[prefix+'ManifestSHA256']==d['manifest']['sha256'] and r[prefix+'ArchiveSHA256']==d['archive']['sha256'] and r[prefix+'ReviewSHA256']==d['review']['sha256'],'release60 exactphase bytegate chain differs')
 need(head()==ARGS.expected_head==m['head']==r['head'],'restore only supported immediately at release HEAD; fresh source gate required after later commits')
 need(skips()==sorted(m['skip']+[REL]) and special()==sorted(m['specialFlags']+['S '+REL]),'restore expected exact64 flags');protect(m,True)
 need(sha(git(['ls-files','--stage','-z']))==m['stageSHA256'],'restore stage differs')
 old=INDEX.read_bytes();info=regular(INDEX);need(info.st_nlink==m['indexNlink']==1,'restore ROOT nlink changed')
 need(sha(old)==ARGS.root_index_sha256,'explicit current ROOT index seal required')
 need(sha(old)==r['newSHA256'] and len(old)==r['newBytes'],'restore ROOT no longer exact release index')
 need((info.st_dev,info.st_ino,stat.S_IMODE(info.st_mode))==(m['indexDevice'],m['indexInode'],m['indexMode']),'restore identity/mode differs')
 data=git(['cat-file','blob',BLOB]);need(len(data)==RAW_BYTES and sha(data)==RAW_SHA,'restore blob mismatch')
 decodedcheck(data)
 need(git(['rev-parse',head()+':'+REL]).decode().strip()==BLOB,'restore HEAD blob differs')
 private=BASE/'capacity-objects15-restore-index';started=BASE/'capacity-objects15-restore-started.json';out=BASE/'capacity-objects15-restore-receipt.json'
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
   restored_info=regular(INDEX);need((restored_info.st_dev,restored_info.st_ino,stat.S_IMODE(restored_info.st_mode),restored_info.st_nlink)==(m['indexDevice'],m['indexInode'],m['indexMode'],1),'restored identity/mode/nlink differs')
   need(INDEX.read_bytes()==final and skips()==m['skip'] and special()==m['specialFlags'],'restored index differs');protect(m);need(head()==m['head'],'HEAD changed')
   writejson(out,{'state':'RESTORED_FULL_BYTES_OLD63_ONLY','path':REL,'blob':BLOB,'rawSHA256':sha(data),'newIndexSHA256':sha(final),'sameInode':True,'old63AndPYC7Preserved':True,'head':head()})
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
  need(regular(lock).st_ino==os.fstat(lfd).st_ino and regular(lock).st_size==0,'owned zero-byte lock replaced');os.close(lfd);lock.unlink()
if __name__=='__main__':
 ap=argparse.ArgumentParser(description='Immediate reversible restore only; fresh source review required after later commits');ap.add_argument('--snapshot-sha256',required=True);ap.add_argument('--expected-head',required=True);ap.add_argument('--release-receipt-sha256',required=True);ap.add_argument('--root-index-sha256',required=True);ARGS=ap.parse_args();core.ARGS=ARGS;restore(model())
