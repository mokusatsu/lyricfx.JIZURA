#!/usr/bin/env python3
"""Parent-reviewed, single-file Gitblob-only capacity transaction. Abrupt-death NONATOMIC."""
import argparse,gzip,hashlib,io,json,os,pathlib,stat,subprocess,tarfile
P=pathlib.Path;ROOT=P('/workspace/lyricfx.JIZURA');INDEX=ROOT/'.git/index'
BASE=P('/dev/shm/avoid009-evening-20261024');SNAP=P('/workspace/lyricfx.JIZURA/work/avoid009-capacity-objects14/snapshot.json')
REL='tasks/evidence/AVOID-008/objects859-main01/matrix01.json.gz'
BLOB='7e5aa4790765a199fd9a2d0822a2586c2dc79cd2';RAW_SHA='07ee3304da854ba3be11a196e6b0da635dbdf3d76349fa2406dbfd06c00acf9d';RAW_BYTES=32487897
PROOF=BASE/'capacity-objects14-proof.json';RECEIPT=BASE/'capacity-objects14-receipt.json';START=BASE/'capacity-objects14-started.json';INTENT=BASE/'capacity-objects14-unlink-intent.json';PRIVATE=BASE/'capacity-objects14-index'
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
 need(len(m['skip'])==62 and len(set(expected))==len(expected),'exact old62 plus optional one')
 for rel in expected:need(not os.path.lexists(ROOT/rel),'protected absent path appeared')
 for x in m['pycs']:
  p=ROOT/x['path'];regular(p);b=p.read_bytes();need(len(b)==x['bytes'] and sha(b)==x['sha256'],'PYC changed')
def model():
 regular(SNAP);b=SNAP.read_bytes();need(ARGS.snapshot_sha256 and sha(b)==ARGS.snapshot_sha256,'snapshot seal required');return json.loads(b)
def parent_gates():
 need(ARGS.source59_parent_review_accepted,'parent59 fullraw/postpins review required; not productadapter/saving/perf')
def source59_context(m):
 c=m['source59Context']
 need(m['finalSourceReviewPending'] is False,'parent14 final source review gate pending: no action')
 need(c['reviewSHA256'] and c['finalReviewPending'] is False and ARGS.source59_review_sha256==c['reviewSHA256'],'final parent59 review exact seal not bound: no action')
 data={}
 for key in ['archive','manifest','storage','sourceSeal','sourceGate']:
  x=c[key];p=ROOT/x['path'];s=regular(p);b=p.read_bytes()
  need((s.st_dev,s.st_ino,stat.S_IMODE(s.st_mode),s.st_nlink)==(x['device'],x['inode'],x['mode'],1),'59 retained context identity changed')
  need(len(b)==x['bytes'] and sha(b)==x['sha256'],'59 retained context bytes changed');data[key]=b
 need(sha(data['manifest'])=='9c228e33ddea86851c4cf6cae5ffe61bc7debfddb0ca1b30121a2760844976b1' and sha(data['archive'])=='fc527532ff3c8cd7d497bcbe1a74253dc2b77f0ced1f00a8ea25d5862cb5a1c3','exact final59 raw seals differ')
 raw=json.loads(data['manifest']);storage=json.loads(data['storage'])
 need(raw['complete'] is True and not raw['errors'] and not raw['partialRecords'] and not raw['inFlight'] and raw['postPins']['unchanged'] is True,'59 producer not complete/postpins clean')
 need(storage['archiveSHA256']==sha(data['archive']) and storage['manifestSHA256']==sha(data['manifest']) and storage['files']==2495 and storage['allLiteralArchiveMembersFullByteComparedToOriginals'] is True,'59 storage proof differs')
 rows={x['member']:x for x in storage['inventory']};need(len(rows)==len(storage['inventory'])==2495,'exact2495 literal members required');seen=set()
 with tarfile.open(fileobj=io.BytesIO(data['archive']),mode='r|xz') as tf:
  for info in tf:
   need(info.isfile() and info.name in rows and info.name not in seen,'59 archive member scope differs');x=rows[info.name];b=tf.extractfile(info).read();need(len(b)==x['bytes'] and sha(b)==x['sha256'],'59 full literal member differs')
   if info.name=='manifest.json':need(b==data['manifest'],'59 literal archived manifest differs')
   seen.add(info.name)
 need(seen==set(rows),'59 archive member missing')
 pins=raw['pins'];need(len(pins['files'])==124 and len(pins['pycache'])==7 and sorted(pins['absent62'])==m['skip'],'59 original124/PYC7/62 scope differs')
 need(pins['HEADReference']==m['head'] and pins['index']['sha256']==m['indexSHA256'] and pins['index']['bytes']==m['indexBytes'] and pins['indexInode']==m['indexInode'],'59 baseline pins differ')
 for x in pins['files']+pins['pycache']:
  p=ROOT/x['path'];regular(p);b=p.read_bytes();need(len(b)==x['bytes'] and sha(b)==x['sha256'],'59 current source/postpin changed')
 for rel in pins['absent62']:need(not os.path.lexists(ROOT/rel),'59 original protected absent appeared')
 p=ROOT/c['reviewPath'];regular(p);rb=p.read_bytes();need(sha(rb)==c['reviewSHA256'],'59 parent review bytes differ');r=json.loads(rb)
 need(r['state']==c['reviewStateRequired'] and r['manifestSHA256']==sha(data['manifest']),'59 parent fullraw review not accepted')
 for key in ['sourcePostpins124PYC7Index62IndependentlyRechecked','allNeighborWitnessesAndPreferredShortfallsIndependentlyChecked','fullOwnPassTextFaceRimCaptionQualityIndependentlyChecked','circleAndStageActualDestinationsExactFractionChecked','numericalFoundationConditional','independentRecipeOraclePending']:need(r[key] is True,'59 parent conditional review qualification differs')
 need(r['productAdapterAdded'] is False and r['formalPerformanceAccepted'] is False and r['savingBodyTested'] is False and r['humanApproval'] is False and r['publicChecks']==0 and r['parentImagesViewed']==0,'59 broader acceptance falsely claimed')
def baseline(m):
 parent_gates();source59_context(m)
 s=regular(INDEX);need(s.st_nlink==m['indexNlink']==1,'ROOT nlink changed');b=INDEX.read_bytes()
 need((s.st_dev,s.st_ino,stat.S_IMODE(s.st_mode))==(m['indexDevice'],m['indexInode'],m['indexMode']),'ROOT identity/mode changed')
 need(len(b)==m['indexBytes'] and sha(b)==m['indexSHA256'],'ROOT index changed')
 need(head()==m['head']==ARGS.expected_head,'explicit baseline HEAD differs')
 need(skips()==m['skip'] and special()==m['specialFlags'],'old62/fullspecial changed')
 need(sha(flags())==m['flagsSHA256'] and sha(git(['ls-files','--stage','-z']))==m['stageSHA256'],'full stage/flags changed');protect(m)
 regular(P(m['bootstrapReceiptPath']));receipt=P(m['bootstrapReceiptPath']).read_bytes();need(sha(receipt)==m['bootstrapReceiptSHA256'],'installed receipt changed')
 r=json.loads(receipt);need(r['round']==3 and r['sameInode'] is True and r['skipCount']==62 and r['PYCAndProtected62Preserved'] is True and r['newSHA256']==sha(b) and r['head']==head(),'installed receipt mismatch')
 return b
def decodedcheck(data):
 digest=hashlib.sha256();count=0
 with gzip.GzipFile(fileobj=io.BytesIO(data),mode='rb') as stream:
  while True:
   chunk=stream.read(1048576)
   if not chunk:break
   digest.update(chunk);count+=len(chunk)
 need(count==244873152 and digest.hexdigest()=='af46cb8b32ff12c89db55017f9c0576c1b586412c6b02f54a0032b7aa0e402f5','gzip decoded full stream size/hash/CRC differs')
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
 writejson(PROOF,{'state':'VERIFIED_NOT_RELEASED','sourceSHA256':source_sha(),'snapshotSHA256':ARGS.snapshot_sha256,'head':head(),'rootSHA256':sha(b),'rawSHA256':sha(data),'rawBytes':len(data),'rawAllocated':(ROOT/REL).stat().st_blocks*512,'releaseOnlyPath':REL,'old62Preserved':True,'PYC7Preserved':True,'source59ManifestSHA256':m['source59Context']['manifest']['sha256'],'source59RawArchiveSHA256':m['source59Context']['archive']['sha256'],'source59ParentReviewSHA256':m['source59Context']['reviewSHA256'],'source59ParentReviewAccepted':True,'source59ConditionalOnly':True,'source59ProductAdapterAccepted':False,'source59SavingBodyAccepted':False,'source59FormalPerformanceAccepted':False})
 print(PROOF.read_text())
def put(fd,b):
 off=0
 while off<len(b):
  n=os.pwrite(fd,b[off:off+1048576],off);need(n>0,'short write');off+=n
 os.ftruncate(fd,len(b));os.fsync(fd)
def finalcheck(m,final,new):
 need(INDEX.read_bytes()==final,'installed ROOT bytes differ');s=regular(INDEX);need(s.st_nlink==m['indexNlink']==1,'installed ROOT nlink changed')
 need((s.st_dev,s.st_ino,stat.S_IMODE(s.st_mode))==(m['indexDevice'],m['indexInode'],m['indexMode']),'installed identity/mode differs')
 need(skips()==sorted(m['skip']+[REL]),'expected exact63 skips');need(special()==sorted(m['specialFlags']+['S '+REL]),'special flags differ')
 need(git(['ls-files','--stage','-z'])==git(['ls-files','--stage','-z'],PRIVATE),'installed stage mismatch');protect(m,new);need(head()==m['head'],'HEAD changed');source59_context(m)
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
   writejson(RECEIPT,{'state':'RELEASED_GITBLOB_ONLY','releaseOnlyPath':REL,'blob':BLOB,'rawSHA256':sha(data),'rawBytes':len(data),'freedAllocatedBytes':proof['rawAllocated'],'head':head(),'oldSHA256':sha(old),'newSHA256':sha(final),'newBytes':len(final),'sameInode':True,'skipCount':63,'old62AndPYC7Preserved':True,'proofSHA256':sha(pb),'sourceSHA256':source_sha(),'snapshotSHA256':ARGS.snapshot_sha256,'unlinkIntentSHA256':sha(INTENT.read_bytes()),'source59ManifestSHA256':m['source59Context']['manifest']['sha256'],'source59RawArchiveSHA256':m['source59Context']['archive']['sha256'],'source59ParentReviewSHA256':m['source59Context']['reviewSHA256'],'source59ParentReviewAccepted':True,'source59ConditionalOnly':True,'source59ProductAdapterAccepted':False,'source59SavingBodyAccepted':False,'source59FormalPerformanceAccepted':False})
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
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('action',choices=['VERIFY','RELEASE']);ap.add_argument('--snapshot-sha256',required=True);ap.add_argument('--expected-head',required=True);ap.add_argument('--proof-sha256');ap.add_argument('--source59-parent-review-accepted',action='store_true',required=True);ap.add_argument('--source59-review-sha256',required=True);ARGS=ap.parse_args();m=model()
 if ARGS.action=='VERIFY':verify(m)
 else:release(m)
