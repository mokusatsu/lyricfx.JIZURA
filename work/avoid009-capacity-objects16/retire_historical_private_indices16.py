#!/usr/bin/env python3
"""Retire ONLY two Git-archived historical private-index copies after parent review.
No ROOT index/Git writes. Keep every state/receipt, RAW, PYC and unrelated artifact.
"""
import argparse,hashlib,io,json,lzma,os,pathlib,stat,subprocess,tarfile
P=pathlib.Path;ROOT=P('/workspace/lyricfx.JIZURA');EXT=P('/workspace/avoid009-private-commit16-20261025');E=ROOT/'tasks/evidence/AVOID-009/evening-20261024/storage-capacity-objects16';CAP=E/'commit-rounds-durable01'
HEAD='d08cd4d6be162b8ba9e93764a03b53c3551821e5';IDX='4dc6bf49561427e40da18bd23fc098601a1cad05927d5ca7a6a3f8b67b5df6a6';IDENTITIES={1:565374,2:566195}
def need(ok,msg):
 if not ok:raise RuntimeError(msg)
def sha(b):return hashlib.sha256(b).hexdigest()
def regular(p):
 for q in [*reversed(p.parents),p]:need(not q.is_symlink(),'symlink refused: '+str(q))
 s=p.stat();need(stat.S_ISREG(s.st_mode) and s.st_nlink==1,'single regular file required');return s
def read(p):regular(p);return p.read_bytes()
def write(p,x):
 with p.open('x') as f:json.dump(x,f,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
def syncdir(p):
 fd=os.open(p,os.O_RDONLY|os.O_DIRECTORY)
 try:os.fsync(fd)
 finally:os.close(fd)
def git(a):
 e=os.environ.copy()
 for k in ['GIT_DIR','GIT_WORK_TREE','GIT_INDEX_FILE','GIT_OBJECT_DIRECTORY','GIT_ALTERNATE_OBJECT_DIRECTORIES']:e.pop(k,None)
 e.update(GIT_OPTIONAL_LOCKS='0',GIT_TERMINAL_PROMPT='0');return subprocess.check_output(['git','-C',str(ROOT),*a],env=e)
ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--parent-reviewed',action='store_true',required=True);ap.parse_args()
start=E/'historical-private-indices-retirement-started.json';out=E/'historical-private-indices-retirement-receipt.json';need(not os.path.lexists(start) and not os.path.lexists(out),'prior attempt exists: review, never rerun');need(not os.path.lexists(ROOT/'.git/index.lock') and not list(EXT.glob('*.lock')),'active lock refused')
index=read(ROOT/'.git/index');need(sha(index)==IDX and git(['rev-parse','HEAD']).decode().strip()==HEAD,'ROOT baseline changed');identity=regular(ROOT/'.git/index');flags=git(['ls-files','-v','-z']);stage=git(['ls-files','--stage','-z']);need(sum(x.startswith(b'S ') for x in flags.split(b'\0'))==65,'expected65');m=json.loads(read(ROOT/'work/avoid009-capacity-objects16/authorized-continuation65-snapshot.json'))
for rel in m['skip']:need(not os.path.lexists(ROOT/rel),'protected absent path appeared')
for x in m['pycs']:need(sha(read(ROOT/x['path']))==x['sha256'],'PYC changed')
def unchanged():
 s=regular(ROOT/'.git/index');need((s.st_dev,s.st_ino,s.st_mode)==(identity.st_dev,identity.st_ino,identity.st_mode) and read(ROOT/'.git/index')==index and git(['rev-parse','HEAD']).decode().strip()==HEAD and git(['ls-files','-v','-z'])==flags and git(['ls-files','--stage','-z'])==stage,'ROOT changed')
pr=read(E/'workspace-backup-push-receipt.json');need(sha(pr)=='52439d026d15086d5d9933af99c464bcb398ff1f1ef04957d2caf1d218ad194c','push receipt changed');r=json.loads(pr);need(r['state']=='SCOPED009_BACKUP_PUSH_DONE' and r['commit']=='683a50d492cb2ee2967a3e7ffff40f350610dfbd' and r['branch']=='archive/avoid009-workspace-20261025' and '[new branch]' in r['pushOutput'],'successful archive push required');need(git(['show',HEAD+':'+str((E/'workspace-backup-push-receipt.json').relative_to(ROOT))])==pr,'push receipt not exact current Git bytes')
mb=read(CAP/'manifest.json');need(sha(mb)=='f351174ce372a865bfacaaea1062c4598eb3664fb41f66c06554c989c1bb9744','capsule manifest changed');manifest=json.loads(mb);archive=read(CAP/'historical-rounds.tar.xz');need(len(archive)==1595272 and sha(archive)==manifest['archiveSHA256'],'capsule archive changed');plain=lzma.decompress(archive);rows={x['name']:x for x in manifest['files']};need(len(rows)==8,'expected full8members');seen=set();targets={}
with tarfile.open(fileobj=io.BytesIO(plain),mode='r:') as tf:
 for member in tf:
  need(member.isfile() and member.name in rows and member.name not in seen,'archive scope differs');b=tf.extractfile(member).read();x=rows[member.name];need(len(b)==x['bytes'] and sha(b)==x['sha256'] and read(EXT/member.name)==b,'archive/external full bytes differ');seen.add(member.name)
  if member.name in ['evening-resume16-index-round-1','evening-resume16-index-round-2']:targets[member.name]=b
need(seen==set(rows) and len(targets)==2,'missing capsule member');allocated=0
for n,inode in IDENTITIES.items():
 p=EXT/('evening-resume16-index-round-'+str(n));s=regular(p);need((s.st_dev,s.st_ino,stat.S_IMODE(s.st_mode))==(27,inode,0o600),'historical copy identity changed');allocated+=s.st_blocks*512
unchanged();write(start,{'state':'ONLY_TWO_ARCHIVED_COPIES_RETIREMENT_START','paths':[str(EXT/n) for n in targets],'capsuleManifestSHA256':sha(mb),'archiveCommit':r['commit'],'ROOTIndexSHA256':IDX});syncdir(E);removed=[]
try:
 for n,b in targets.items():
  p=EXT/n;s=regular(p);need(s.st_ino==IDENTITIES[int(n[-1])] and read(p)==b,'target changed before unlink');unchanged();p.unlink();removed.append(n)
 syncdir(EXT);unchanged();write(out,{'state':'ONLY_TWO_HISTORICAL_PRIVATE_INDEX_COPIES_RETIRED','paths':[str(EXT/n) for n in removed],'bytes':sum(len(b) for b in targets.values()),'freedAllocatedBytes':allocated,'archiveCommit':r['commit'],'archiveBranch':r['branch'],'capsuleManifestSHA256':sha(mb),'all8ArchiveMembersFullBytesVerified':True,'XZCRCVerified':True,'ROOTHEAD':HEAD,'ROOTIndexSHA256':IDX,'ROOTIndexUnchanged':True,'stateAndReceiptFilesRetained':True,'oldRoundsMustNeverReplay':True,'publicChecks':0});syncdir(E)
except BaseException:
 for n in removed:
  with (EXT/n).open('xb') as f:f.write(targets[n]);f.flush();os.fsync(f.fileno())
  os.chmod(EXT/n,0o600)
 syncdir(EXT);raise

print(out.read_text())
