#!/usr/bin/env python3
"""Parent-only second index round; exact52 preserved in manager40524 official SHM namespace."""
import argparse,hashlib,json,os,pathlib,stat,subprocess
P=pathlib.Path;ROOT=P('/workspace/lyricfx.JIZURA');GIT=ROOT/'.git';INDEX=GIT/'index';BASE=P('/dev/shm/avoid009-afternoon-20261024');PRIVATE=BASE/'private-task-index2';STATE=BASE/'private-task-index-state2.json'
PRIOR_INDEX=BASE/'private-task-index';PRIOR_RECEIPT=BASE/'private-task-index-install-receipt.json'
MANIFEST=P('/tmp/avoid009-storage-ordered-magnets04/manifest.json');MANIFEST_SHA='809036ee2f7705984f4e60df7ce44f932a728fbedde0d84ceaf727483e2e5d20'

def need(ok,msg):
 if not ok:raise RuntimeError(msg)

def sha(b):return hashlib.sha256(b).hexdigest()

def regular(p):
 for q in [*reversed(p.parents),p]:need(not q.is_symlink(),'symlink refused')
 s=p.lstat();need(stat.S_ISREG(s.st_mode),'regular file required');return s

def env(private):
 e=os.environ.copy();e.pop('GIT_INDEX_FILE',None);e['GIT_TERMINAL_PROMPT']='0'
 n=int(e.get('GIT_CONFIG_COUNT','0'))
 for i,(k,v) in enumerate([('gc.auto','0'),('maintenance.auto','false')]):e['GIT_CONFIG_KEY_'+str(n+i)]=k;e['GIT_CONFIG_VALUE_'+str(n+i)]=v
 e['GIT_CONFIG_COUNT']=str(n+2)
 if private:e['GIT_INDEX_FILE']=str(PRIVATE)
 return e

def git(args,private=True):return subprocess.run(['git','-C',str(ROOT),*args],env=env(private),check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE).stdout

def model():
 raw=MANIFEST.read_bytes();need(sha(raw)==MANIFEST_SHA,'frozen49 manifest differs');m=json.loads(raw);need(len(m['originalSkip'])==49,'original49 count differs');m['originalSkip']=sorted(m['originalSkip']+[x['path'] for x in m['items']]);need(len(m['originalSkip'])==52,'expected52 count differs');return m

def skips(private):return sorted(x[2:] for x in git(['ls-files','-v'],private).decode().splitlines() if x.startswith('S '))

def protected(m):
 for p in m['originalSkip']:need(not os.path.lexists(ROOT/p),'52 absent path changed')
 for x in m['pycs']:
  p=ROOT/x['path'];regular(p);b=p.read_bytes();need(len(b)==x['bytes'] and sha(b)==x['sha256'],'PYC changed')

def initial_unchanged(s,m):
 regular(INDEX);need(sha(INDEX.read_bytes())==s['originalSHA256'],'ROOT index changed since prepare')
 need(skips(False)==m['originalSkip'],'ROOT52 flags changed');protected(m)

def load():regular(STATE);regular(PRIVATE);return json.loads(STATE.read_text()),model()

def prepare(prior_sha):
 need(BASE.is_dir() and not BASE.is_symlink(),'official namespace required')
 need(not os.path.lexists(PRIVATE) and not os.path.lexists(STATE),'fresh private index/state required')
 need(not os.path.lexists(GIT/'index.lock'),'ROOT index lock exists')
 m=model();need(len(m['originalSkip'])==52 and skips(False)==m['originalSkip'],'exact52 flags required');protected(m)
 regular(PRIOR_RECEIPT);regular(PRIOR_INDEX);prior_bytes=PRIOR_RECEIPT.read_bytes();need(prior_sha and sha(prior_bytes)==prior_sha,'exact parent prior-install receipt SHA required');prior=json.loads(prior_bytes)
 need(prior['sameInode'] is True and prior['skipCount']==52 and prior['PYCAndOld49Preserved'] is True,'prior install receipt differs')
 need(sha(INDEX.read_bytes())==prior['newSHA256']==sha(PRIOR_INDEX.read_bytes()),'ROOT/private first-round bytes differ from prior installed receipt')
 need(git(['rev-parse','HEAD'],False).decode().strip()==prior['head'],'HEAD differs from prior installed receipt')
 info=regular(INDEX);data=INDEX.read_bytes();need(len(data)>=12 and data[:4]==b'DIRC','index signature differs')
 with PRIVATE.open('xb') as f:f.write(data);f.flush();os.fsync(f.fileno())
 need(PRIVATE.read_bytes()==data,'private index copy differs')
 need(git(['ls-files','--stage','-z'],False)==git(['ls-files','--stage','-z'],True),'independent stage listings differ')
 need(skips(True)==m['originalSkip'],'private52 flags differ')
 s={'originalSHA256':sha(data),'originalBytes':len(data),'originalDevice':info.st_dev,'originalInode':info.st_ino,'originalMode':stat.S_IMODE(info.st_mode),'originalHead':git(['rev-parse','HEAD'],False).decode().strip(),'priorInstallReceiptSHA256':prior_sha}
 with STATE.open('x') as f:json.dump(s,f,indent=2);f.write('\n')
 print(json.dumps({'prepared':True,'indexBytes':len(data),'indexSHA256':s['originalSHA256'],'stageListingsMatch':True}))

def run(args):
 s,m=load();initial_unchanged(s,m);need(isinstance(args,list) and args and all(isinstance(x,str) and '\0' not in x for x in args),'explicit Git argv required')
 need(args[0] in ['add','commit'],'Git command outside reviewed scope')
 if args[0]=='add':
  need(len(args)>2 and args[1]=='--','add requires explicit paths after --')
  for rel in args[2:]:
   pp=pathlib.PurePosixPath(rel);need(not pp.is_absolute() and '..' not in pp.parts and rel not in ['.',''] and not any(c in rel for c in '*?['),'explicit relative file paths required');need((ROOT/rel).is_file(),'add files only')
 # No shell. Commit may update HEAD/objects; parent reviews intended staging before invocation.
 output=git(args);initial_unchanged(s,m)
 expected=m['originalSkip'];need(skips(True)==expected,'private52 flags changed')
 os.write(1,output)
 print(json.dumps({'privateGitCommand':args[0],'rootIndexUnchanged':True}))

def put(fd,data):
 offset=0
 while offset<len(data):
  count=os.pwrite(fd,data[offset:offset+1048576],offset);need(count>0,'short index write');offset+=count
 os.ftruncate(fd,len(data));os.fsync(fd)

def install():
 s,m=load();initial_unchanged(s,m);expected=m['originalSkip'];need(skips(True)==expected,'private52 flags required')
 receipt=BASE/'private-task-index-install-receipt2.json';need(not os.path.lexists(receipt),'exclusive install receipt exists')
 final=PRIVATE.read_bytes();need(final[:4]==b'DIRC','final index signature differs');need(not os.path.lexists(PRIVATE.with_name(PRIVATE.name+'.lock')),'private index lock exists')
 # Coordination lock is ZERO bytes; final index data is held in RAM and written to the SAME inode.
 lock=GIT/'index.lock';lockfd=os.open(lock,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 fd=None
 try:
  initial_unchanged(s,m);fd=os.open(INDEX,os.O_RDWR|os.O_NOFOLLOW);info=os.fstat(fd)
  need((info.st_dev,info.st_ino)==(s['originalDevice'],s['originalInode']),'ROOT index inode changed')
  old=os.pread(fd,s['originalBytes']+1,0);need(sha(old)==s['originalSHA256'],'ROOT bytes changed before install')
  try:
   put(fd,final);need(INDEX.read_bytes()==final,'installed index verification failed')
   need(skips(False)==expected,'installed52 flags differ');protected(m)
  except BaseException:
   put(fd,old);need(INDEX.read_bytes()==old,'RAM rollback verification failed');raise
  with receipt.open('x') as f:json.dump({'oldSHA256':sha(old),'newSHA256':sha(final),'oldBytes':len(old),'newBytes':len(final),'sameInode':True,'skipCount':52,'PYCAndOld49Preserved':True,'head':git(['rev-parse','HEAD'],False).decode().strip()},f,indent=2);f.write('\n')
  print(json.dumps({'installed':True,'sameInode':True,'skipCount':52,'indexBytes':len(final),'receipt':str(receipt)}))
 finally:
  if fd is not None:os.close(fd)
  os.close(lockfd);lock.unlink()

if __name__=='__main__':
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('action',choices=['PREPARE','RUN','INSTALL']);ap.add_argument('--argv-json');ap.add_argument('--prior-install-receipt-sha256');a=ap.parse_args()
 if a.action=='PREPARE':prepare(a.prior_install_receipt_sha256)
 elif a.action=='RUN':run(json.loads(a.argv_json))
 else:install()
