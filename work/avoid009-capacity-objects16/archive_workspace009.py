#!/usr/bin/env python3
"""Parent-reviewed exact scoped backup in isolated RAM Git; ROOT HEAD/index never written."""
import argparse,hashlib,json,os,pathlib,subprocess,tempfile
P=pathlib.Path;ROOT=P('/workspace/lyricfx.JIZURA');HEAD='a5bc1de12b779b87c60a21f3402dad5cdca4e621';IDX='579bdcfec781ca98d9710b2bd9f97a7aabc4f335e2731f17c1157c56dbfb540a'
AUDIT=ROOT/'work/avoid009-capacity-objects16/untracked-009-blob-audit.json'
PREFIX='tasks/evidence/AVOID-009/evening-20261024/storage-capacity-objects16/'
def need(ok,msg):
 if not ok:raise RuntimeError(msg)
def sha(b):return hashlib.sha256(b).hexdigest()
def blob(b):return hashlib.sha1(('blob '+str(len(b))+'\0').encode()+b).hexdigest()
def read(p):
 for q in [*reversed(p.parents),p]:need(not q.is_symlink(),'symlink refused: '+str(q))
 need(p.is_file() and p.stat().st_nlink>=1,'regular file required: '+str(p));return p.read_bytes()
def run(args,env=None,data=None):
 result=subprocess.run(['git',*args],cwd=ROOT,env=env,input=data,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 if result.returncode:
  raise RuntimeError('Git command failed (exit '+str(result.returncode)+'): '+result.stderr.decode(errors='replace').strip())
 return result.stdout
ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--parent-reviewed',action='store_true',required=True);ap.add_argument('--branch',default='archive/avoid009-workspace-20261025');args=ap.parse_args()
need(args.branch.startswith('archive/avoid009-workspace-20261025') and all(c.isalnum() or c in '/-_' for c in args.branch),'explicit backup branch only')
env=os.environ.copy()
for k in ['GIT_DIR','GIT_WORK_TREE','GIT_INDEX_FILE','GIT_OBJECT_DIRECTORY','GIT_ALTERNATE_OBJECT_DIRECTORIES']:env.pop(k,None)
env.update(GIT_OPTIONAL_LOCKS='0',GIT_TERMINAL_PROMPT='0')
n=int(env.get('GIT_CONFIG_COUNT','0'))
for i,(key,value) in enumerate([('gc.auto','0'),('maintenance.auto','false')]):
 env['GIT_CONFIG_KEY_'+str(n+i)]=key;env['GIT_CONFIG_VALUE_'+str(n+i)]=value
env['GIT_CONFIG_COUNT']=str(n+2)
def rootgit(a):return run(['-C',str(ROOT),*a],env)
index=read(ROOT/'.git/index');identity=(ROOT/'.git/index').stat();need(identity.st_nlink==1,'ROOT index must have one link');need(sha(index)==IDX and rootgit(['rev-parse','HEAD']).decode().strip()==HEAD,'ROOT baseline changed');need(not os.path.lexists(ROOT/'.git/index.lock'),'ROOT locked')
flags=rootgit(['ls-files','-v','-z']);stage=rootgit(['ls-files','--stage','-z']);need(sum(x.startswith(b'S ') for x in flags.split(b'\0'))==65,'expected65')
model=json.loads(read(ROOT/'work/avoid009-capacity-objects16/authorized-continuation65-snapshot.json'))
for rel in model['skip']:need(not os.path.lexists(ROOT/rel),'protected absent path appeared')
for x in model['pycs']:need(sha(read(ROOT/x['path']))==x['sha256'],'PYC changed')
def unchanged():
 s=(ROOT/'.git/index').stat();need((s.st_dev,s.st_ino,s.st_mode,s.st_nlink)==(identity.st_dev,identity.st_ino,identity.st_mode,identity.st_nlink),'ROOT identity changed');need(read(ROOT/'.git/index')==index and rootgit(['rev-parse','HEAD']).decode().strip()==HEAD and rootgit(['ls-files','-v','-z'])==flags and rootgit(['ls-files','--stage','-z'])==stage,'ROOT changed')
ab=read(AUDIT);need(sha(ab)=='bf59ea7ffbd75962265d1826042e67159f2b070c8e7aa78dd1ba09a333f41d60','audit seal changed');audit=json.loads(ab);need(audit['head']==HEAD and len(audit['files'])==1275,'audit scope changed')
mb=read(ROOT/PREFIX/'commit-rounds-durable01/manifest.json');need(sha(mb)=='f351174ce372a865bfacaaea1062c4598eb3664fb41f66c06554c989c1bb9744','capsule manifest changed');cm=json.loads(mb);need(sha(read(ROOT/PREFIX/'commit-rounds-durable01/historical-rounds.tar.xz'))==cm['archiveSHA256'],'capsule archive changed')
expected={};files={}
for x in audit['files']:
 rel=x['path'];need(not P(rel).is_absolute() and '..' not in P(rel).parts,'invalid scope path');b=read(ROOT/rel);need(len(b)==x['bytes'] and blob(b)==x['gitBlobSHA1'],'audited file changed: '+rel);files[rel]=b
# Preserve the prepared storage package itself, including this utility and audit.
for folder in [ROOT/'work/avoid009-capacity-objects16',ROOT/PREFIX]:
 for p in folder.rglob('*'):
  if p.is_file():files[str(p.relative_to(ROOT))]=read(p)
# External authoritative originals are inserted directly as blobs, with source mapping.
external={PREFIX+'workspace-durability01/original-design-e44551ae.zip':P('/workspace/attachments/b87099ae-b9ec-49e3-af9b-3edf1e0cdd37/AVOID-009_tiles_bulbs_billboard_design_e44551ae.zip'),PREFIX+'workspace-durability01/parent-evidence-audit.json':P('/workspace/avoid009-evidence-durability-audit.json')}
for rel,p in external.items():files[rel]=read(p)
scratch=P(tempfile.mkdtemp(prefix='avoid009-backup-',dir='/dev/shm'));gd=scratch/'repo.git';run(['init','--bare',str(gd)],env)
se=env.copy();se.update(GIT_DIR=str(gd),GIT_WORK_TREE=str(ROOT),GIT_INDEX_FILE=str(scratch/'index'),GIT_ALTERNATE_OBJECT_DIRECTORIES=str(ROOT/'.git/objects'))
def sg(a,data=None):return run(a,se,data)
sg(['read-tree',HEAD])
for rel,b in files.items():
 need(len(b)<100000000,'oversized Git blob');oid=sg(['hash-object','-w','--stdin'],b).decode().strip();need(oid==blob(b),'written blob mismatch');expected[rel]=(oid,len(b));sg(['update-index','--add','--cacheinfo','100644',oid,rel])
# Verify stored full bytes through Git, independently of the source read and index.
for oid,size in set(expected.values()):
 b=sg(['cat-file','blob',oid]);need(len(b)==size and blob(b)==oid,'stored full blob mismatch')
manifest={'state':'SCOPED009_BACKUP_ALL_BYTES_VERIFIED','baseHEAD':HEAD,'scopeFileCount':len(files),'scopeBytes':sum(map(len,files.values())),'all277UniqueAuditedFilesIncluded':True,'duplicatesMappedByAudit':True,'files':[{'path':r,'gitBlobSHA1':v[0],'bytes':v[1]} for r,v in sorted(expected.items())],'externalMappings':{k:str(v) for k,v in external.items()},'excluded':'Other untracked001-008/scratch/build dependencies, not claimed saved; RAW67 unavailable and not recreated','publicChecks':0,'ROOTIndexModified':False}
manifestrel=PREFIX+'workspace-durability01/archive-scope.json';b=(json.dumps(manifest,indent=2)+'\n').encode();oid=sg(['hash-object','-w','--stdin'],b).decode().strip();sg(['update-index','--add','--cacheinfo','100644',oid,manifestrel]);tree=sg(['write-tree']).decode().strip()
for rel,(oid,size) in expected.items():need(sg(['rev-parse',tree+':'+rel]).decode().strip()==oid,'final tree path mismatch')
unchanged();author=rootgit(['show','-s','--format=%an%x00%ae',HEAD]).decode().strip().split('\0');se.update(GIT_AUTHOR_NAME=author[0],GIT_AUTHOR_EMAIL=author[1],GIT_COMMITTER_NAME=author[0],GIT_COMMITTER_EMAIL=author[1]);commit=sg(['commit-tree',tree,'-p',HEAD],b'AVOID-009 preserve scoped workspace evidence and recovery metadata\n').decode().strip()
remote=rootgit(['config','--get','remote.origin.url']).decode().strip();ref='refs/heads/'+args.branch
need(not sg(['ls-remote',remote,ref]).strip(),'backup branch exists; choose a fresh suffix')
unchanged();out=sg(['push','--porcelain',remote,commit+':'+ref]).decode();unchanged()
receipt={'state':'SCOPED009_BACKUP_PUSH_DONE','baseHEAD':HEAD,'commit':commit,'branch':args.branch,'files':len(files)+1,'bytes':sum(map(len,files.values()))+len(b),'pushOutput':out,'ROOTIndexSHA256':IDX,'ROOTHEADUnchanged':True,'ROOTIndexUnchanged':True,'publicChecks':0,'scratchRetained':str(scratch)}
outpath=ROOT/PREFIX/'workspace-backup-push-receipt.json'
with outpath.open('x') as f:json.dump(receipt,f,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
print(json.dumps(receipt,indent=2))
