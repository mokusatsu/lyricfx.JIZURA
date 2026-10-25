#!/usr/bin/env python3
"""Parent-reviewed, single-file Gitblob-only capacity transaction. Abrupt-death NONATOMIC."""
import argparse,gzip,hashlib,io,json,os,pathlib,stat,subprocess,tarfile
P=pathlib.Path;ROOT=P('/workspace/lyricfx.JIZURA');INDEX=ROOT/'.git/index'
BASE=P('/dev/shm/avoid009-evening-20261024');SNAP=P('/workspace/lyricfx.JIZURA/work/avoid009-capacity-objects16/snapshot.json')
REL='tasks/evidence/AVOID-008/writingC861-main01/matrix01.json.gz'
BLOB='cfc2428a9b37bd852b13db50ae81d75d9e91bae5';RAW_SHA='944904bdd6f15d982b63853cd68334fa8e2ffcd3ed9a8aaee5793aad770287ea';RAW_BYTES=30565904
PROOF=BASE/'capacity-objects16-proof.json';RECEIPT=BASE/'capacity-objects16-receipt.json';START=BASE/'capacity-objects16-started.json';INTENT=BASE/'capacity-objects16-unlink-intent.json';PRIVATE=BASE/'capacity-objects16-index'
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
 need(len(m['skip'])==64 and len(set(expected))==len(expected),'exact old64 plus optional one')
 for rel in expected:need(not os.path.lexists(ROOT/rel),'protected absent path appeared')
 for x in m['pycs']:
  p=ROOT/x['path'];regular(p);b=p.read_bytes();need(len(b)==x['bytes'] and sha(b)==x['sha256'],'PYC changed')
def model():
 regular(SNAP);b=SNAP.read_bytes();need(ARGS.snapshot_sha256 and sha(b)==ARGS.snapshot_sha256,'snapshot seal required');return json.loads(b)
def parent_gates():
 need(ARGS.source63_ja_en_raw_and_after6_accepted,'parent BOTH63native raw/postpins+sixAFTER required; noadapter/perf/save')
def source63_context(m):
 c=m['source63Context'];need(m['finalSourceReviewPending'] is False and c['finalReviewPending'] is False and c['freshSnapshotAfter63CompleteRequired'] is False and c['after'],'final63/AFTER6 contexts and freshsnapshot pending: no action')
 def checked(x):
  need(x and x['sha256'],'unbound63context');p=ROOT/x['path'];s=regular(p);b=p.read_bytes();need((s.st_dev,s.st_ino,stat.S_IMODE(s.st_mode),s.st_nlink)==(x['device'],x['inode'],x['mode'],1),'63context identity changed');need(len(b)==x['bytes'] and sha(b)==x['sha256'],'63context fullbytes changed');return b
 pins=json.loads(checked(c['postPins']));checked(c['sourceSeal']);checked(c['sourceGate']);checked(c['buildReview']);before=json.loads(checked(c['beforeLiteral']))
 need(len(pins['files'])==124 and len(pins['pycache'])==7 and sorted(pins['protectedAbsent'])==m['skip'] and pins['index']['sha256']==m['indexSHA256'] and pins['HEADReference']==m['head'],'63final124/PYC7/64 baseline differs')
 need(REL not in {x['path'] for x in pins['files']},'oldraw active63input')
 for x in pins['files']+pins['pycache']:need(sha((ROOT/x['path']).read_bytes())==x['sha256'],'63currentpostpin changed')
 for lang,arg in [('ja',ARGS.source63_ja_review_sha256),('en',ARGS.source63_en_review_sha256)]:
  d=c['phases'][lang];v={k:checked(d[k]) for k in ['archive','manifest','storage','review']};raw=json.loads(v['manifest']);storage=json.loads(v['storage']);review=json.loads(v['review'])
  need(arg==d['review']['sha256'] and raw['language']==lang and raw['complete'] is True and not raw['errors'] and not raw['partialRecords'] and not raw['inFlight'] and raw['postPins']['unchanged'] is True,'63languagecomplete/reviewseal/postpins differs')
  need(raw['pins']['files']==pins['files'] and raw['pins']['pycache']==pins['pycache'] and raw['pins']['index']==pins['index'],'63languagepins differ')
  need(storage['archiveSHA256']==sha(v['archive']) and storage['manifestSHA256']==sha(v['manifest']) and storage['files']==d['literalMembers'] and storage['allLiteralMembersByteExact'] is True and not storage['errors'] and storage['postPins']['unchanged'] is True,'63literalstorage differs')
  rows={x['member']:x for x in storage['inventory']};need(len(rows)==len(storage['inventory'])==d['literalMembers'],'63membercount differs');seen=set()
  with tarfile.open(fileobj=io.BytesIO(v['archive']),mode='r|xz') as tf:
   for info in tf:
    need(info.isfile() and info.name in rows and info.name not in seen,'63member scope differs');x=rows[info.name];b=tf.extractfile(info).read();need(len(b)==x['bytes'] and sha(b)==x['sha256'],'63literalmember changed')
    if info.name=='manifest.json':need(b==v['manifest'],'63archivedmanifest differs')
    seen.add(info.name)
  need(seen==set(rows),'63member missing');need(review['state']==d['reviewStateRequired'] and review['language']==lang and review['manifestSHA256']==sha(v['manifest']) and review['sourcePinsPostVerified'] is True,'63parentrawreview notaccepted')
  for key in ['allLiteralFragmentsFullHashAndCRC','independentPythonFullValueDecodeAndMatrixReconstruction','independentOriginalOffOnFullPaintClipGradientRNGAndRGBAExact','catalogComparedToActualTraceAndCanvasPaint']:need(review[key] is True,'63rawqualification differs')
  need(review['adapter'] is False and review['transportQualified'] is False and review['allTimeOrNumericalCertificate'] is False and review['formalPerformance'] is False and review['savingBodyTested'] is False,'63broaderclaim false')
 # Preserve ALL literal BEFORE output, and all fresh AFTER outputs with exact reviewed receipt.
 import base64
 for x in before['files']:need(base64.b64decode(x['base64'])==(ROOT/x['path']).read_bytes(),'literalbefore baseline changed')
 a=c['after'];need(ARGS.after6_receipt_sha256==a['receipt']['sha256'],'exactAFTER6receipt seal required')
 for x in a['files']:checked(x)
 ar=json.loads(checked(a['receipt']));results=json.loads(checked(a['results']));need(ar['exitCode']==0 and ar['postPinsError'] is None and len(results['results'])==6 and all(x['exitCode']==0 for x in results['results']),'sixAFTER notpassed')
 br=next(x for x in before['files'] if x['path'].endswith('baseline53-receipt.json'));need(ar['beforeReferenceSHA256']==br['sha256'] and ar['beforeReferenceReusedNotRerun'] is True and ar['beforeSourceHTMLFontIdentityExact53Postbuild'] is True,'literalBEFORE reusequalification differs')
 need(ar['savingBodyTested'] is False and ar['formalPerformance'] is False,'baseline broaderclaim false')
def baseline(m):
 parent_gates();source63_context(m)
 s=regular(INDEX);need(s.st_nlink==m['indexNlink']==1,'ROOT nlink changed');b=INDEX.read_bytes()
 need((s.st_dev,s.st_ino,stat.S_IMODE(s.st_mode))==(m['indexDevice'],m['indexInode'],m['indexMode']),'ROOT identity/mode changed')
 need(len(b)==m['indexBytes'] and sha(b)==m['indexSHA256'],'ROOT index changed')
 need(head()==m['head']==ARGS.expected_head,'explicit baseline HEAD differs')
 need(skips()==m['skip'] and special()==m['specialFlags'],'old64/fullspecial changed')
 need(sha(flags())==m['flagsSHA256'] and sha(git(['ls-files','--stage','-z']))==m['stageSHA256'],'full stage/flags changed');protect(m)
 regular(P(m['bootstrapReceiptPath']));receipt=P(m['bootstrapReceiptPath']).read_bytes();need(sha(receipt)==m['bootstrapReceiptSHA256'],'installed receipt changed')
 r=json.loads(receipt);need(r['round']==2 and r['sameInode'] is True and r['skipCount']==64 and r['PYCAndProtected64Preserved'] is True and r['newSHA256']==sha(b) and r['head']==head(),'installed receipt mismatch')
 return b
def decodedcheck(data):
 digest=hashlib.sha256();count=0
 with gzip.GzipFile(fileobj=io.BytesIO(data),mode='rb') as stream:
  while True:
   chunk=stream.read(1048576)
   if not chunk:break
   digest.update(chunk);count+=len(chunk)
 need(count==227248774 and digest.hexdigest()=='29b3f76f9aea01e0ce4160db6f999c066445f0b0c274579f5049875cfd9fb9b2','gzip decoded full stream size/hash/CRC differs')
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
 writejson(PROOF,{'state':'VERIFIED_NOT_RELEASED','sourceSHA256':source_sha(),'snapshotSHA256':ARGS.snapshot_sha256,'head':head(),'rootSHA256':sha(b),'rawSHA256':sha(data),'rawBytes':len(data),'rawAllocated':(ROOT/REL).stat().st_blocks*512,'releaseOnlyPath':REL,'old64Preserved':True,'PYC7Preserved':True,'source63JAContext':m['source63Context']['phases']['ja'],'source63ENContext':m['source63Context']['phases']['en'],'source63AfterReceiptSHA256':m['source63Context']['after']['receipt']['sha256'],'source63BothNativeRawReviewsAccepted':True,'source63After6Accepted':True,'source63AdapterAccepted':False,'source63TransportQualified':False,'source63SavingBodyAccepted':False,'source63FormalPerformanceAccepted':False})
 print(PROOF.read_text())
def put(fd,b):
 off=0
 while off<len(b):
  n=os.pwrite(fd,b[off:off+1048576],off);need(n>0,'short write');off+=n
 os.ftruncate(fd,len(b));os.fsync(fd)
def finalcheck(m,final,new):
 need(INDEX.read_bytes()==final,'installed ROOT bytes differ');s=regular(INDEX);need(s.st_nlink==m['indexNlink']==1,'installed ROOT nlink changed')
 need((s.st_dev,s.st_ino,stat.S_IMODE(s.st_mode))==(m['indexDevice'],m['indexInode'],m['indexMode']),'installed identity/mode differs')
 need(skips()==sorted(m['skip']+[REL]),'expected exact65 skips');need(special()==sorted(m['specialFlags']+['S '+REL]),'special flags differ')
 need(git(['ls-files','--stage','-z'])==git(['ls-files','--stage','-z'],PRIVATE),'installed stage mismatch');protect(m,new);need(head()==m['head'],'HEAD changed');source63_context(m)
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
   writejson(RECEIPT,{'state':'RELEASED_GITBLOB_ONLY','releaseOnlyPath':REL,'blob':BLOB,'rawSHA256':sha(data),'rawBytes':len(data),'freedAllocatedBytes':proof['rawAllocated'],'head':head(),'oldSHA256':sha(old),'newSHA256':sha(final),'newBytes':len(final),'sameInode':True,'skipCount':65,'old64AndPYC7Preserved':True,'proofSHA256':sha(pb),'sourceSHA256':source_sha(),'snapshotSHA256':ARGS.snapshot_sha256,'unlinkIntentSHA256':sha(INTENT.read_bytes()),'source63JAContext':m['source63Context']['phases']['ja'],'source63ENContext':m['source63Context']['phases']['en'],'source63AfterReceiptSHA256':m['source63Context']['after']['receipt']['sha256'],'source63BothNativeRawReviewsAccepted':True,'source63After6Accepted':True,'source63AdapterAccepted':False,'source63TransportQualified':False,'source63SavingBodyAccepted':False,'source63FormalPerformanceAccepted':False})
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
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('action',choices=['VERIFY','RELEASE']);ap.add_argument('--snapshot-sha256',required=True);ap.add_argument('--expected-head',required=True);ap.add_argument('--proof-sha256');ap.add_argument('--source63-ja-en-raw-and-after6-accepted',action='store_true',required=True);ap.add_argument('--source63-ja-review-sha256',required=True);ap.add_argument('--source63-en-review-sha256',required=True);ap.add_argument('--after6-receipt-sha256',required=True);ARGS=ap.parse_args();m=model()
 if ARGS.action=='VERIFY':verify(m)
 else:release(m)
