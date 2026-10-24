#!/usr/bin/env python3
"""Reviewed parent-only private-index rounds. INSTALL is same-inode NONATOMIC on abrupt kill."""
import argparse,hashlib,json,os,pathlib,stat,subprocess
P=pathlib.Path;ROOT=P('/workspace/lyricfx.JIZURA');INDEX=ROOT/'.git/index'
BASE=P('/dev/shm/avoid009-evening-20261024')
SNAP=P('/workspace/lyricfx.JIZURA/work/avoid009-capacity-objects13/continuation62-snapshot.json')
def need(ok,msg):
 if not ok:raise RuntimeError(msg)
def sha(b):return hashlib.sha256(b).hexdigest()
def regular(p):
 for q in [*reversed(p.parents),p]:need(not q.is_symlink(),'symlink refused')
 s=p.lstat();need(stat.S_ISREG(s.st_mode),'regular file required');return s
def readjson(p):regular(p);return json.loads(p.read_bytes())
def writejson(p,data):
 with p.open('x') as f:json.dump(data,f,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
def paths(n):
 need(n>=1,'positive round required')
 stem=BASE/('evening-resume13-index-round-'+str(n))
 return stem,stem.with_name(stem.name+'-state.json'),stem.with_name(stem.name+'-receipt.json')
def env(private):
 e=os.environ.copy();e.pop('GIT_INDEX_FILE',None);e['GIT_TERMINAL_PROMPT']='0';e['GIT_OPTIONAL_LOCKS']='0'
 n=int(e.get('GIT_CONFIG_COUNT','0'))
 for i,(k,v) in enumerate([('gc.auto','0'),('maintenance.auto','false')]):e['GIT_CONFIG_KEY_'+str(n+i)]=k;e['GIT_CONFIG_VALUE_'+str(n+i)]=v
 e['GIT_CONFIG_COUNT']=str(n+2)
 if private:e['GIT_INDEX_FILE']=str(private)
 return e
def git(a,private=None):return subprocess.run(['git','-C',str(ROOT),*a],env=env(private),check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE).stdout
def head():return git(['rev-parse','HEAD']).decode().strip()
def skips(private=None):
 return sorted(x[2:].decode() for x in git(['ls-files','-v','-z'],private).split(b'\0') if x.startswith(b'S '))
def flags(private=None):
 return [x.decode() for x in git(['ls-files','-v','-z'],private).split(b'\0') if x and not x.startswith(b'H ')]
def protected(m):
 need(len(m['skip'])==62 and len(set(m['skip']))==62,'expected62')
 need(len(m['pycs'])==7 and len({x['path'] for x in m['pycs']})==7,'exact7PYC required')
 for rel in m['skip']:need(not os.path.lexists(ROOT/rel),'62 absent path changed')
 for x in m['pycs']:
  p=ROOT/x['path'];regular(p);b=p.read_bytes();need(len(b)==x['bytes'] and sha(b)==x['sha256'],'PYC changed')
def model(expected_sha):
 regular(SNAP);raw=SNAP.read_bytes();need(expected_sha and sha(raw)==expected_sha,'snapshot seal required');return json.loads(raw)
def unchanged(s,m):
 info=regular(INDEX);need(info.st_nlink==m['indexNlink']==1,'ROOT nlink changed');need((info.st_dev,info.st_ino,stat.S_IMODE(info.st_mode))==(s['device'],s['inode'],s['mode']),'ROOT index identity/mode changed')
 need(sha(INDEX.read_bytes())==s['rootSHA256'],'ROOT index bytes changed')
 need(skips()==m['skip'] and flags()==m['specialFlags'],'ROOT flags changed');protected(m)
def prepare(n,manifest_sha,prior_sha):
 private,state,receipt=paths(n);need(BASE.is_dir() and not BASE.is_symlink(),'official SHM required')
 need(all(not os.path.lexists(p) for p in [private,state,receipt,ROOT/'.git/index.lock']),'exclusive fresh round required')
 m=model(manifest_sha);protected(m);need(skips()==m['skip'] and flags()==m['specialFlags'],'ROOT flags required')
 info=regular(INDEX);need(info.st_nlink==m['indexNlink']==1,'ROOT nlink changed');data=INDEX.read_bytes();need(data[:4]==b'DIRC','index signature')
 if n==1:
  durable=P(m['releaseReceiptPath']);regular(durable);raw=durable.read_bytes()
  need(prior_sha and sha(raw)==prior_sha,'parent exact durable release receipt SHA required')
  r=json.loads(raw)
  need(r['state']=='RELEASED_GITBLOB_ONLY' and r['sameInode'] is True and r['skipCount']==62 and r['old61AndPYC7Preserved'] is True,'release receipt protections differ')
  need(r['source56Result']=='CONDITIONAL_RAW_REVIEW02_ACCEPTED_NOT_ADAPTER_OR_PERFORMANCE' and r['source56Completed'] is True and r['source56ConditionalPostpinsReviewed'] is True and r['source56AdapterAccepted'] is False and r['source56PerformanceAccepted'] is False and r['source55Result']=='FAILED_INTERN_KEY_BYTE_BUDGET' and r['source55Passed'] is False and r['source55FailurePreserved'] is True,'release conditional56/failed55 truth gates differ')
  need(r['releaseOnlyPath']=='tasks/evidence/AVOID-008/objects/integrated01/matrix01.json.gz','release path differs')
  need(r['blob']=='0fa23b43f765a75341c77d3705354b237f7f49e6' and r['rawSHA256']=='1cecddb3bae348f51bb6d9edb86bce060277f3deb22a7a4abccdf321ad1d0db1' and r['rawBytes']==32488013,'release target identity differs')
  need(r['oldSHA256']==m['indexSHA256'] and r['newSHA256']==sha(data) and r['newBytes']==len(data),'release index chain differs')
  need(head()==m['head']==r['head'],'release HEAD changed')
  need((info.st_dev,info.st_ino,stat.S_IMODE(info.st_mode))==(m['indexDevice'],m['indexInode'],m['indexMode']),'release ROOT identity/mode differs')
  need(sha(git(['ls-files','--stage','-z']))==m['stageSHA256'],'release stage entries changed')
 else:
  prev,_,prevreceipt=paths(n-1);regular(prevreceipt);raw=prevreceipt.read_bytes()
  need(prior_sha and sha(raw)==prior_sha,'prior receipt seal required')
  r=json.loads(raw);regular(prev)
  need(r['round']==n-1 and r['sameInode'] is True and r['skipCount']==62 and r['PYCAndProtected62Preserved'] is True,'prior receipt differs')
  need(sha(data)==r['newSHA256']==sha(prev.read_bytes()) and head()==r['head'],'prior ROOT/private/HEAD differ')
 need(sha(data)==ARGS.root_index_sha256,'explicit current ROOT index seal required')
 s={'round':n,'manifestSHA256':manifest_sha,'priorReceiptSHA256':prior_sha,'rootSHA256':sha(data),'rootBytes':len(data),'device':info.st_dev,'inode':info.st_ino,'mode':stat.S_IMODE(info.st_mode),'prepareHead':head()}
 with private.open('xb') as f:f.write(data);f.flush();os.fsync(f.fileno())
 need(private.read_bytes()==data,'private copy differs')
 need(git(['ls-files','--stage','-z'])==git(['ls-files','--stage','-z'],private),'independent stage entries differ')
 need(skips(private)==m['skip'] and flags(private)==m['specialFlags'],'private flags differ');writejson(state,s)
 print(json.dumps({'prepared':True,'round':n,'indexBytes':len(data),'indexSHA256':sha(data),'stageEntriesMatch':True}))
def load(n):
 private,state,receipt=paths(n);regular(private);s=readjson(state);m=model(s['manifestSHA256'])
 need(s['round']==n and not os.path.lexists(receipt),'round already installed or mismatched')
 unchanged(s,m);need(skips(private)==m['skip'] and flags(private)==m['specialFlags'],'private flags differ')
 return private,state,receipt,s,m
def relfile(rel,m):
 p=pathlib.PurePosixPath(rel)
 need(isinstance(rel,str) and rel and not p.is_absolute() and '..' not in p.parts and rel not in ['.',''] and not any(x in rel for x in '*?[:\\'),'explicit literal relative file required')
 need(rel not in m['skip'] and rel not in [x['path'] for x in m['pycs']],'protected path refused');regular(ROOT/rel)
def run(n,args):
 private,state,receipt,s,m=load(n)
 need(isinstance(args,list) and args and all(isinstance(x,str) and '\0' not in x for x in args),'explicit argv required')
 if args[0]=='add':
  need(len(args)>2 and args[1]=='--','add -- explicit files required')
  for rel in args[2:]:relfile(rel,m)
 elif args[0]=='commit':
  # Restrict commit to already reviewed private staging; no -a/path/amend/hooks bypass.
  need(len(args)==3 and args[1]=='-m' and args[2].startswith('AVOID-009') and len(args[2])<=2000,'commit -m AVOID-009 message required')
 elif args[0]=='status':need(args==['status','--porcelain=v1','--untracked-files=no'],'exact readonly status required')
 elif args[0]=='diff':
  need(args in [['diff','--cached','--stat'],['diff','--cached','--check'],['diff','--cached','--'],['diff','--stat'],['diff','--check']],'reviewed readonly diff argv required')
 else:raise RuntimeError('command outside reviewed scope')
 before=head()
 if args[0] in ['add','commit']:
  need(ARGS.expected_head and before==ARGS.expected_head,'explicit current HEAD required')
 out=git(args,private);unchanged(s,m);need(skips(private)==m['skip'] and flags(private)==m['specialFlags'],'private flags changed')
 os.write(1,out);print(json.dumps({'round':n,'command':args[0],'head':head(),'rootIndexUnchanged':True}))
def put(fd,b):
 off=0
 while off<len(b):
  count=os.pwrite(fd,b[off:off+1048576],off);need(count>0,'short pwrite');off+=count
 os.ftruncate(fd,len(b));os.fsync(fd)
def install(n):
 private,state,receipt,s,m=load(n)
 need(ARGS.expected_head and head()==ARGS.expected_head,'explicit final HEAD required')
 final=private.read_bytes();need(final[:4]==b'DIRC' and not os.path.lexists(P(str(private)+'.lock')),'private index invalid/locked')
 need(sha(final)==ARGS.private_index_sha256,'explicit final private index seal required')
 # Coordination only; never place index contents in the ROOT lock.
 lock=ROOT/'.git/index.lock';lockfd=os.open(lock,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600);fd=None
 try:
  unchanged(s,m);fd=os.open(INDEX,os.O_RDWR|os.O_NOFOLLOW);info=os.fstat(fd)
  need((info.st_dev,info.st_ino,stat.S_IMODE(info.st_mode))==(s['device'],s['inode'],s['mode']),'index fd identity differs')
  old=os.pread(fd,s['rootBytes']+1,0);need(sha(old)==s['rootSHA256'],'old RAM bytes differ')
  try:
   put(fd,final);need(INDEX.read_bytes()==final and os.pread(fd,len(final)+1,0)==final,'full installed bytes differ')
   need(skips()==m['skip'] and flags()==m['specialFlags'],'installed flags differ');protected(m)
   installed_info=regular(INDEX);need(installed_info.st_nlink==m['indexNlink']==1,'installed nlink differs');need((installed_info.st_dev,installed_info.st_ino,stat.S_IMODE(installed_info.st_mode))==(s['device'],s['inode'],s['mode']),'installed inode/mode differs')
   need(head()==ARGS.expected_head,'HEAD changed during install')
   writejson(receipt,{'round':n,'oldSHA256':sha(old),'newSHA256':sha(final),'oldBytes':len(old),'newBytes':len(final),'sameInode':True,'skipCount':62,'PYCAndProtected62Preserved':True,'head':head()})
  except BaseException:
   put(fd,old);need(INDEX.read_bytes()==old,'RAM rollback verification failed');raise
  print(json.dumps({'installed':True,'round':n,'receipt':str(receipt),'sameInode':True,'skipCount':62}))
 finally:
  if fd is not None:os.close(fd)
  need(regular(lock).st_ino==os.fstat(lockfd).st_ino and regular(lock).st_size==0,'owned zero-byte lock replaced');os.close(lockfd);lock.unlink()
if __name__=='__main__':
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('action',choices=['PREPARE','RUN','INSTALL']);ap.add_argument('--round',type=int,required=True);ap.add_argument('--snapshot-sha256');ap.add_argument('--root-index-sha256');ap.add_argument('--prior-receipt-sha256');ap.add_argument('--private-index-sha256');ap.add_argument('--expected-head');ap.add_argument('--argv-json');ARGS=ap.parse_args()
 if ARGS.action=='PREPARE':prepare(ARGS.round,ARGS.snapshot_sha256,ARGS.prior_receipt_sha256)
 elif ARGS.action=='RUN':run(ARGS.round,json.loads(ARGS.argv_json))
 else:install(ARGS.round)
