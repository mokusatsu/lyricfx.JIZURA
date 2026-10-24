#!/usr/bin/env python3
"""Parent-only14 duplicate untracked PNG transaction. No index writes. Abrupt death NONATOMIC."""
import argparse,hashlib,io,json,os,pathlib,stat,subprocess,tarfile
P=pathlib.Path;ROOT=P('/workspace/lyricfx.JIZURA');INDEX=ROOT/'.git/index';BASE=P('/dev/shm/avoid009-evening-20261024')
HERE=ROOT/'work/avoid009-tiles-proof-release01';SNAP=HERE/'snapshot.json';DIR='tasks/evidence/AVOID-009/tiles-media01/local-proof/images/'
PROOF=BASE/'tiles-proof-release01-proof.json';START=BASE/'tiles-proof-release01-started.json';RECEIPT=BASE/'tiles-proof-release01-receipt.json';LOCK=BASE/'tiles-proof-release01.lock'
def need(ok,msg):
 if not ok:raise RuntimeError(msg)
def sha(b):return hashlib.sha256(b).hexdigest()
def regular(p):
 for q in [*reversed(p.parents),p]:need(not q.is_symlink(),'symlink refused')
 s=p.lstat();need(stat.S_ISREG(s.st_mode) and s.st_nlink==1,'regular single-link required');return s
def writejson(p,x):
 with p.open('x') as f:json.dump(x,f,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
def syncdir(p):
 fd=os.open(p,os.O_RDONLY|os.O_DIRECTORY)
 try:os.fsync(fd)
 finally:os.close(fd)
def git(args):
 e=os.environ.copy();e.pop('GIT_INDEX_FILE',None);e.update(GIT_OPTIONAL_LOCKS='0',GIT_TERMINAL_PROMPT='0')
 n=int(e.get('GIT_CONFIG_COUNT','0'))
 for i,(k,v) in enumerate([('gc.auto','0'),('maintenance.auto','false')]):e['GIT_CONFIG_KEY_'+str(n+i)]=k;e['GIT_CONFIG_VALUE_'+str(n+i)]=v
 e['GIT_CONFIG_COUNT']=str(n+2)
 return subprocess.run(['git','-C',str(ROOT),*args],env=e,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE).stdout
def source_sha():return sha(P(__file__).read_bytes())
def model():
 regular(SNAP);b=SNAP.read_bytes();need(sha(b)==ARGS.snapshot_sha256,'explicit snapshot seal differs');m=json.loads(b)
 expected={DIR+side+'-'+frame+'.png' for side in ['before','after'] for frame in ['006','024','060','120','216','231','244']}
 need(len(m['releaseOnlyFiles'])==14 and {x['path'] for x in m['releaseOnlyFiles']}==expected,'exact14 literal PNG scope required')
 return m
def baseline(m):
 need(BASE.is_dir() and not BASE.is_symlink(),'official8802 namespace required');need(not os.path.lexists(ROOT/'.git/index.lock'),'ROOT index transaction active')
 s=regular(INDEX);b=INDEX.read_bytes();need((s.st_dev,s.st_ino,stat.S_IMODE(s.st_mode),s.st_nlink)==(m['indexDevice'],m['indexInode'],m['indexMode'],m['indexNlink']),'ROOT index identity differs')
 need(len(b)==m['indexBytes'] and sha(b)==m['indexSHA256']==ARGS.root_index_sha256,'exact current ROOT index differs')
 need(git(['rev-parse','HEAD']).decode().strip()==m['head']==ARGS.expected_head,'actual current HEAD differs; fresh source gate after commits')
 need(sha(git(['ls-files','-v','-z']))==m['flagsSHA256'] and sha(git(['ls-files','--stage','-z']))==m['stageSHA256'],'ROOT stage/flags changed')
 need(len(m['skip'])==59 and len(set(m['skip']))==59,'exact59 protection required')
 for rel in m['skip']:need(not os.path.lexists(ROOT/rel),'protected59 absent changed')
 need(len(m['pycs'])==7 and len({x['path'] for x in m['pycs']})==7,'exact7 PYC required')
 for x in m['pycs']:
  p=ROOT/x['path'];regular(p);data=p.read_bytes();need(len(data)==x['bytes'] and sha(data)==x['sha256'],'PYC changed')
 need(not git(['ls-files','--stage','-z','--',*[x['path'] for x in m['releaseOnlyFiles']]]),'release path became tracked')
def retained(m):
 data={}
 for x in m['retained']:
  p=ROOT/x['path'];s=regular(p);b=p.read_bytes()
  need((s.st_dev,s.st_ino,stat.S_IMODE(s.st_mode))==(x['device'],x['inode'],x['mode']),'retained identity/mode changed')
  need(len(b)==x['bytes'] and sha(b)==x['sha256'] and b==git(['cat-file','blob',x['blob']]),'retained full blob differs')
  need(git(['rev-parse',m['head']+':'+x['path']]).decode().strip()==x['blob'],'retained HEAD blob differs');data[P(x['path']).name]=b
 need(sha(data['assets.native01.tar.xz'])=='17735803ac5ef041c8180841ea93f85804d0cc881c66afbc46041f9c899e8f3f','exact archive differs')
 inv=json.loads(data['asset-inventory01.json']);owned=json.loads(data['owned-proof-export01.json'])
 need(len(inv['files'])==16 and len(owned['files'])==14,'canonical inventory counts differ')
 need(inv['sha256']==owned['archiveSHA256']==sha(data['assets.native01.tar.xz']),'canonical archive hashes differ')
 out={}
 with tarfile.open(fileobj=io.BytesIO(data['assets.native01.tar.xz']),mode='r:xz') as tf:
  members=tf.getmembers();need(len(members)==16 and all(x.isfile() for x in members),'exact16 regular members required')
  need(sorted(x.name for x in members)==sorted(x['path'] for x in inv['files']),'member set differs')
  for x in inv['files']:
   b=tf.extractfile(x['path']).read();need(len(b)==x['bytes'] and sha(b)==x['sha256'],'full archive member hash differs');out[x['path']]=b
 for x in m['releaseOnlyFiles']:
  rows=[z for z in owned['files'] if z['path']==str(ROOT/x['path'])];need(len(rows)==1,'ownership mapping differs');z=rows[0]
  need((z['archiveMember'],z['bytes'],z['sha256'],z['inode'],z['nlink'])==(x['archiveMember'],x['bytes'],x['sha256'],x['inode'],1),'ownership record differs')
  b=out[x['archiveMember']];need(len(b)==x['bytes'] and sha(b)==x['sha256'],'PNG inventory differs')
 return out
def present(x):
 p=ROOT/x['path'];s=regular(p);b=p.read_bytes()
 need((s.st_dev,s.st_ino,stat.S_IMODE(s.st_mode),s.st_nlink,s.st_blocks*512)==(x['device'],x['inode'],x['mode'],1,x['allocated']),'owned PNG identity/mode/allocation differs')
 need(len(b)==x['bytes'] and sha(b)==x['sha256'],'owned PNG changed');return b
def verify(m):
 need(all(not os.path.lexists(p) for p in [PROOF,START,RECEIPT,LOCK]),'fresh transaction required');baseline(m);assets=retained(m)
 for x in m['releaseOnlyFiles']:need(present(x)==assets[x['archiveMember']],'owned PNG/TAR bytes differ')
 baseline(m);writejson(PROOF,{'state':'VERIFIED_NOT_RELEASED','sourceSHA256':source_sha(),'snapshotSHA256':ARGS.snapshot_sha256,'head':m['head'],'rootIndexSHA256':m['indexSHA256'],'files':m['releaseOnlyFiles'],'allocatedToRecover':m['allocatedToRecover'],'all16MembersVerified':True});print(PROOF.read_text())
def lease():return os.open(LOCK,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
def unlease(fd):
 try:need(regular(LOCK).st_ino==os.fstat(fd).st_ino and regular(LOCK).st_size==0,'owned zero-byte lease replaced');LOCK.unlink()
 finally:os.close(fd)
def safe_parent(p):
 for q in p.parents:need(not q.is_symlink(),'restore parent symlink refused')
 need(p.parent.is_dir(),'existing restore parent directory required')
def create(x,b):
 p=ROOT/x['path'];safe_parent(p)
 try:
  with p.open('xb') as f:ino=os.fstat(f.fileno()).st_ino;f.write(b);f.flush();os.fsync(f.fileno())
  os.chmod(p,x['mode']);need(regular(p).st_ino==ino and p.read_bytes()==b,'restored bytes/owned inode differ');return ino
 except BaseException:
  # Preserve partial created file for parent recovery; never unlink an unverified inode here.
  raise

def release(m):
 regular(PROOF);pb=PROOF.read_bytes();proof=json.loads(pb);need(ARGS.proof_sha256 and sha(pb)==ARGS.proof_sha256,'exact proof seal required')
 need(proof['state']=='VERIFIED_NOT_RELEASED' and proof['sourceSHA256']==source_sha() and proof['snapshotSHA256']==ARGS.snapshot_sha256 and proof['files']==m['releaseOnlyFiles'],'proof source/scope differs')
 need(all(not os.path.lexists(p) for p in [START,RECEIPT,LOCK]),'started transaction cannot rerun');baseline(m);assets=retained(m)
 for x in m['releaseOnlyFiles']:need(present(x)==assets[x['archiveMember']],'full pre-release PNG mismatch')
 fd=lease();removed=[]
 try:
  baseline(m);writejson(START,{'state':'STARTED_NOT_COMPLETE_DO_NOT_RERUN','proofSHA256':sha(pb),'snapshotSHA256':ARGS.snapshot_sha256,'head':m['head'],'rootIndexSHA256':m['indexSHA256']})
  try:
   for i,x in enumerate(m['releaseOnlyFiles']):
    baseline(m);need(present(x)==assets[x['archiveMember']],'PNG changed immediately before unlink')
    writejson(BASE/('tiles-proof-release01-unlink-intent-'+str(i+1)+'.json'),{'state':'UNLINK_NOT_YET_CONFIRMED','file':x,'proofSHA256':sha(pb),'head':m['head']})
    (ROOT/x['path']).unlink();removed.append(x);syncdir((ROOT/x['path']).parent)
   baseline(m);retained(m)
   for x in m['releaseOnlyFiles']:need(not os.path.lexists(ROOT/x['path']),'released PNG reappeared')
   writejson(RECEIPT,{'state':'RELEASED14_OWNED_UNTRACKED_DUPLICATES_ONLY','sourceSHA256':source_sha(),'snapshotSHA256':ARGS.snapshot_sha256,'proofSHA256':sha(pb),'head':m['head'],'rootIndexSHA256':m['indexSHA256'],'files':m['releaseOnlyFiles'],'freedAllocatedBytes':sum(x['allocated'] for x in removed),'ROOTIndexAndFlagsUnchanged':True,'protected59AndPYC7Preserved':True,'archiveAndAll16MembersPreserved':True})
  except BaseException:
   failures=[]
   for x in removed:
    try:create(x,assets[x['archiveMember']]);syncdir((ROOT/x['path']).parent)
    except BaseException as error:failures.append({'path':x['path'],'error':str(error)})
   if failures:raise RuntimeError('bounded rollback failed; preserve all evidence and fresh parent recovery: '+json.dumps(failures))
   baseline(m);raise
  print(RECEIPT.read_text())
 finally:unlease(fd)
def restore(m):
 regular(RECEIPT);rb=RECEIPT.read_bytes();r=json.loads(rb);need(ARGS.receipt_sha256 and sha(rb)==ARGS.receipt_sha256,'exact successful receipt seal required')
 need(r['state']=='RELEASED14_OWNED_UNTRACKED_DUPLICATES_ONLY' and r['sourceSHA256']==source_sha() and r['snapshotSHA256']==ARGS.snapshot_sha256 and r['files']==m['releaseOnlyFiles'],'release receipt differs')
 baseline(m);assets=retained(m);started=BASE/'tiles-proof-release01-restore-started.json';out=BASE/'tiles-proof-release01-restore-receipt.json'
 need(all(not os.path.lexists(p) for p in [started,out,LOCK]),'fresh restore required')
 for x in m['releaseOnlyFiles']:need(not os.path.lexists(ROOT/x['path']),'restore refuses existing target')
 fd=lease();created=[]
 try:
  baseline(m);writejson(started,{'state':'RESTORE_STARTED_NOT_COMPLETE','releaseReceiptSHA256':sha(rb),'head':m['head'],'rootIndexSHA256':m['indexSHA256']})
  try:
   for x in m['releaseOnlyFiles']:
    p=ROOT/x['path'];safe_parent(p)
    # Register owned inode immediately after exclusive open, including partial-write failures.
    with p.open('xb') as f:
     ino=os.fstat(f.fileno()).st_ino;created.append((x,ino));f.write(assets[x['archiveMember']]);f.flush();os.fsync(f.fileno())
    os.chmod(p,x['mode']);need(p.read_bytes()==assets[x['archiveMember']],'restore full bytes differ');syncdir(p.parent)
   baseline(m);retained(m)
   for x,ino in created:
    p=ROOT/x['path'];s=regular(p);need(s.st_ino==ino and stat.S_IMODE(s.st_mode)==x['mode'] and p.read_bytes()==assets[x['archiveMember']],'restore identity/fullbytes differ')
   writejson(out,{'state':'RESTORED14_UNTRACKED_EXACT_BYTES_NEW_INODES','releaseReceiptSHA256':sha(rb),'head':m['head'],'rootIndexSHA256':m['indexSHA256'],'created':[{'path':x['path'],'inode':ino,'sha256':x['sha256']} for x,ino in created],'ROOTIndexAndFlagsUnchanged':True,'protected59AndPYC7Preserved':True})
  except BaseException:
   for x,ino in created:
    p=ROOT/x['path'];need(regular(p).st_ino==ino,'restore-owned inode replaced');p.unlink();syncdir(p.parent)
   baseline(m);raise
  print(out.read_text())
 finally:unlease(fd)
if __name__=='__main__':
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('action',choices=['VERIFY','RELEASE','RESTORE']);ap.add_argument('--snapshot-sha256',required=True);ap.add_argument('--expected-head',required=True);ap.add_argument('--root-index-sha256',required=True);ap.add_argument('--proof-sha256');ap.add_argument('--receipt-sha256');ARGS=ap.parse_args();m=model()
 if ARGS.action=='VERIFY':verify(m)
 elif ARGS.action=='RELEASE':release(m)
 else:restore(m)
