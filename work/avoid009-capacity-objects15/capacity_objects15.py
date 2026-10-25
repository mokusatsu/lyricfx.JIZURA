#!/usr/bin/env python3
"""Parent-reviewed, single-file Gitblob-only capacity transaction. Abrupt-death NONATOMIC."""
import argparse,gzip,hashlib,io,json,os,pathlib,stat,subprocess,tarfile
P=pathlib.Path;ROOT=P('/workspace/lyricfx.JIZURA');INDEX=ROOT/'.git/index'
BASE=P('/dev/shm/avoid009-evening-20261024');SNAP=P('/workspace/lyricfx.JIZURA/work/avoid009-capacity-objects15/snapshot.json')
REL='tasks/evidence/AVOID-008/objects/matrix14.json.gz'
BLOB='9665f87619cf62ea3e5f4f46b17b92fddb73373d';RAW_SHA='aba87fdcdbaaf5130b12d039d8047aa4b4ee07740cc3e53a28b88ae738354bcf';RAW_BYTES=30574111
PROOF=BASE/'capacity-objects15-proof.json';RECEIPT=BASE/'capacity-objects15-receipt.json';START=BASE/'capacity-objects15-started.json';INTENT=BASE/'capacity-objects15-unlink-intent.json';PRIVATE=BASE/'capacity-objects15-index'
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
 need(len(m['skip'])==63 and len(set(expected))==len(expected),'exact old63 plus optional one')
 for rel in expected:need(not os.path.lexists(ROOT/rel),'protected absent path appeared')
 for x in m['pycs']:
  p=ROOT/x['path'];regular(p);b=p.read_bytes();need(len(b)==x['bytes'] and sha(b)==x['sha256'],'PYC changed')
def model():
 regular(SNAP);b=SNAP.read_bytes();need(ARGS.snapshot_sha256 and sha(b)==ARGS.snapshot_sha256,'snapshot seal required');return json.loads(b)
def parent_gates():
 need(ARGS.source60_parent_oracle_media_accepted,'parent60 BOTH oracle/media fullraw/postpins reviews required; not human/product/perf/save')
def source60_context(m):
 c=m['source60Context'];need(m['finalSourceReviewPending'] is False,'parent15 final source review pending: no action')
 need(c['finalReviewPending'] is False and ARGS.source60_oracle_review_sha256==c['phases']['oracle']['review']['sha256'] and ARGS.source60_media_review_sha256==c['phases']['media']['review']['sha256'],'both exact60parent review seals required')
 data={}
 for key in ['sourceSeal','sourcePins','sourceGate','mediaGate']:
  x=c[key];p=ROOT/x['path'];s=regular(p);b=p.read_bytes();need((s.st_dev,s.st_ino,stat.S_IMODE(s.st_mode),s.st_nlink)==(x['device'],x['inode'],x['mode'],1),'60 context identity changed');need(len(b)==x['bytes'] and sha(b)==x['sha256'],'60 context bytes changed');data[key]=b
 pins=json.loads(data['sourcePins']);need(len(pins['files'])==124 and len(pins['pycache'])==7 and sorted(pins['protectedAbsent'])==m['skip'],'60 original124/PYC7/63 scope differs')
 need(pins['HEADReference']==m['head'] and pins['index']['sha256']==m['indexSHA256'] and pins['index']['bytes']==m['indexBytes'] and pins['indexInode']==m['indexInode'],'60 source baseline pin differs')
 need(REL not in {x['path'] for x in pins['files']+pins['pycache']},'old raw is active60 input')
 for x in pins['files']+pins['pycache']:
  p=ROOT/x['path'];regular(p);b=p.read_bytes();need(len(b)==x['bytes'] and sha(b)==x['sha256'],'60 current124/PYC7 postpin differs')
 for rel in pins['protectedAbsent']:need(not os.path.lexists(ROOT/rel),'60 original63 protected absent appeared')
 phases={}
 for phase in ['oracle','media']:
  d=c['phases'][phase];v={}
  for key in ['archive','manifest','storage','review']:
   x=d[key];p=ROOT/x['path'];s=regular(p);b=p.read_bytes();need((s.st_dev,s.st_ino,stat.S_IMODE(s.st_mode),s.st_nlink)==(x['device'],x['inode'],x['mode'],1),'60 phase file identity differs');need(len(b)==x['bytes'] and sha(b)==x['sha256'],'60 phase fullbytes differ');v[key]=b
  manifest=json.loads(v['manifest']);storage=json.loads(v['storage']);review=json.loads(v['review'])
  need(manifest['complete'] is True and not manifest['errors'] and not manifest.get('partialRecords',[]) and not manifest['inFlight'] and manifest['postPins']['unchanged'] is True and manifest['productAdmission'] is False and manifest['numericalFoundationConditional'] is True,'60 phase producer/postpins/scope differs')
  need(storage['files']==d['literalMembers'] and storage['archiveSHA256']==sha(v['archive']) and storage['manifestSHA256']==sha(v['manifest']) and storage['allLiteralMembersComparedToLiveOriginalBytes'] is True and storage['complete'] is True and not storage['errors'] and storage['postPins']['unchanged'] is True,'60 literal storage proof differs')
  rows={x['member']:x for x in storage['inventory']};need(len(rows)==len(storage['inventory'])==d['literalMembers'],'60 exact literal member count differs');seen=set()
  with tarfile.open(fileobj=io.BytesIO(v['archive']),mode='r|xz') as tf:
   for info in tf:
    need(info.isfile() and info.name in rows and info.name not in seen,'60 literal archive scope differs');x=rows[info.name];b=tf.extractfile(info).read();need(len(b)==x['bytes'] and sha(b)==x['sha256'],'60 full literal member differs')
    if info.name=='manifest.json':need(b==v['manifest'],'60 archived literal manifest differs')
    seen.add(info.name)
  need(seen==set(rows),'60 literal member missing')
  need(review['state']==d['reviewStateRequired'] and review['manifestSHA256']==sha(v['manifest']) and review['source124PYC7Protected63IndexPostpinsChecked'] is True and review['conditionalNumericalFoundation'] is True,'60 parent fullraw review/postpins differs')
  need(review['humanApproval'] is False and review['formalPerformanceAccepted'] is False and review['savingBodyTested'] is False and review['publicChecks']==0 and review['parentImagesViewed']==0,'60 broader acceptance falsely claimed');phases[phase]=(manifest,review)
 oracle,orr=phases['oracle'];media,mr=phases['media']
 need(oracle['sealSHA256']==sha(data['sourceSeal']) and orr['sourceSealSHA256']==sha(data['sourceSeal']) and media['sourceSealSHA256']==sha(data['sourceSeal']),'60 sourceSeal chain differs')
 need(media['oracleManifestSHA256']==c['phases']['oracle']['manifest']['sha256']==mr['oracleManifestSHA256'] and media['parentGateSHA256']==sha(data['mediaGate'])==mr['parentMediaGateSHA256'],'60 oracle/media/gate chain differs')
 for key in ['allOriginalNativeRecipeOraclePaintValuesAndRGBAEqual','proofNative250FullValuesEqualAccepted59','everyOriginalAndReplacementCallMatchedWithOnlyDeclaredGeometryFieldsChanged','thirdLinearLookupArcPointsExact','allCurrentHardQualityAndPreferredWarningsIndependentlyChecked','actualCurrentCircleStageIndependentFraction']:need(orr[key] is True,'60 oracle qualification differs')
 need(orr['productAdapterAdded'] is False and orr['totals']['proof']==250 and orr['totals']['media-time']==250,'60 oracle scope/count differs')
 for key in ['freshNative250FullPaintCatalogAndWholeRGBAEqualAcceptedOracle','all500EmittedCanvasRGBAHashesEqualAcceptedReferences','two250FrameNative60fpsMP4AndAllPTSValidated','MP4EncodedLossyNotPixelEqualityClaim']:need(mr[key] is True,'60 media qualification differs')
 need(mr['productAdmission'] is False and media['completed']['freshNativeReferences']==250 and media['completed']['beforeFrames']==250 and media['completed']['afterFrames']==250,'60 media scope/count differs')
def baseline(m):
 parent_gates();source60_context(m)
 s=regular(INDEX);need(s.st_nlink==m['indexNlink']==1,'ROOT nlink changed');b=INDEX.read_bytes()
 need((s.st_dev,s.st_ino,stat.S_IMODE(s.st_mode))==(m['indexDevice'],m['indexInode'],m['indexMode']),'ROOT identity/mode changed')
 need(len(b)==m['indexBytes'] and sha(b)==m['indexSHA256'],'ROOT index changed')
 need(head()==m['head']==ARGS.expected_head,'explicit baseline HEAD differs')
 need(skips()==m['skip'] and special()==m['specialFlags'],'old63/fullspecial changed')
 need(sha(flags())==m['flagsSHA256'] and sha(git(['ls-files','--stage','-z']))==m['stageSHA256'],'full stage/flags changed');protect(m)
 regular(P(m['bootstrapReceiptPath']));receipt=P(m['bootstrapReceiptPath']).read_bytes();need(sha(receipt)==m['bootstrapReceiptSHA256'],'installed receipt changed')
 r=json.loads(receipt);need(r['round']==1 and r['sameInode'] is True and r['skipCount']==63 and r['PYCAndProtected63Preserved'] is True and r['newSHA256']==sha(b) and r['head']==head(),'installed receipt mismatch')
 return b
def decodedcheck(data):
 digest=hashlib.sha256();count=0
 with gzip.GzipFile(fileobj=io.BytesIO(data),mode='rb') as stream:
  while True:
   chunk=stream.read(1048576)
   if not chunk:break
   digest.update(chunk);count+=len(chunk)
 need(count==227208579 and digest.hexdigest()=='79c38c30293d5f027484ce5be00776b7520dbc7436e5b2a52a3721af46affb7d','gzip decoded full stream size/hash/CRC differs')
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
 writejson(PROOF,{'state':'VERIFIED_NOT_RELEASED','sourceSHA256':source_sha(),'snapshotSHA256':ARGS.snapshot_sha256,'head':head(),'rootSHA256':sha(b),'rawSHA256':sha(data),'rawBytes':len(data),'rawAllocated':(ROOT/REL).stat().st_blocks*512,'releaseOnlyPath':REL,'old63Preserved':True,'PYC7Preserved':True,'source60OracleManifestSHA256':m['source60Context']['phases']['oracle']['manifest']['sha256'],'source60OracleArchiveSHA256':m['source60Context']['phases']['oracle']['archive']['sha256'],'source60OracleReviewSHA256':m['source60Context']['phases']['oracle']['review']['sha256'],'source60MediaManifestSHA256':m['source60Context']['phases']['media']['manifest']['sha256'],'source60MediaArchiveSHA256':m['source60Context']['phases']['media']['archive']['sha256'],'source60MediaReviewSHA256':m['source60Context']['phases']['media']['review']['sha256'],'source60BothParentRawReviewsAccepted':True,'source60ConditionalOnly':True,'source60HumanApproval':False,'source60ProductAdmission':False,'source60SavingBodyAccepted':False,'source60FormalPerformanceAccepted':False})
 print(PROOF.read_text())
def put(fd,b):
 off=0
 while off<len(b):
  n=os.pwrite(fd,b[off:off+1048576],off);need(n>0,'short write');off+=n
 os.ftruncate(fd,len(b));os.fsync(fd)
def finalcheck(m,final,new):
 need(INDEX.read_bytes()==final,'installed ROOT bytes differ');s=regular(INDEX);need(s.st_nlink==m['indexNlink']==1,'installed ROOT nlink changed')
 need((s.st_dev,s.st_ino,stat.S_IMODE(s.st_mode))==(m['indexDevice'],m['indexInode'],m['indexMode']),'installed identity/mode differs')
 need(skips()==sorted(m['skip']+[REL]),'expected exact64 skips');need(special()==sorted(m['specialFlags']+['S '+REL]),'special flags differ')
 need(git(['ls-files','--stage','-z'])==git(['ls-files','--stage','-z'],PRIVATE),'installed stage mismatch');protect(m,new);need(head()==m['head'],'HEAD changed');source60_context(m)
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
   writejson(RECEIPT,{'state':'RELEASED_GITBLOB_ONLY','releaseOnlyPath':REL,'blob':BLOB,'rawSHA256':sha(data),'rawBytes':len(data),'freedAllocatedBytes':proof['rawAllocated'],'head':head(),'oldSHA256':sha(old),'newSHA256':sha(final),'newBytes':len(final),'sameInode':True,'skipCount':64,'old63AndPYC7Preserved':True,'proofSHA256':sha(pb),'sourceSHA256':source_sha(),'snapshotSHA256':ARGS.snapshot_sha256,'unlinkIntentSHA256':sha(INTENT.read_bytes()),'source60OracleManifestSHA256':m['source60Context']['phases']['oracle']['manifest']['sha256'],'source60OracleArchiveSHA256':m['source60Context']['phases']['oracle']['archive']['sha256'],'source60OracleReviewSHA256':m['source60Context']['phases']['oracle']['review']['sha256'],'source60MediaManifestSHA256':m['source60Context']['phases']['media']['manifest']['sha256'],'source60MediaArchiveSHA256':m['source60Context']['phases']['media']['archive']['sha256'],'source60MediaReviewSHA256':m['source60Context']['phases']['media']['review']['sha256'],'source60BothParentRawReviewsAccepted':True,'source60ConditionalOnly':True,'source60HumanApproval':False,'source60ProductAdmission':False,'source60SavingBodyAccepted':False,'source60FormalPerformanceAccepted':False})
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
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('action',choices=['VERIFY','RELEASE']);ap.add_argument('--snapshot-sha256',required=True);ap.add_argument('--expected-head',required=True);ap.add_argument('--proof-sha256');ap.add_argument('--source60-parent-oracle-media-accepted',action='store_true',required=True);ap.add_argument('--source60-oracle-review-sha256',required=True);ap.add_argument('--source60-media-review-sha256',required=True);ARGS=ap.parse_args();m=model()
 if ARGS.action=='VERIFY':verify(m)
 else:release(m)
