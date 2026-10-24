#!/usr/bin/env python3
"""Parent-reviewed fixed44 untracked working-copy release; VERIFY then explicit sealed RELEASE."""
import argparse,hashlib,json,os,pathlib,stat,subprocess
P=pathlib.Path;ROOT=P('/workspace/lyricfx.JIZURA');BASE=P('/tmp/avoid009-evening-storage01')
PIN='8a13b3c16a38cb484a64b4787ba62353f9ca3db8'
PLANS={'capacity-expanded-plan.json':'cc216d15faa58c37129b6a60a510aa83af00d68891e86a10c706b71ef9951944','capacity-additional-plan.json':'33eeae231e10f6dcb8b4150477af9e1afcff3943965c15dd1e5903da7ec5335c'}
SNAP_SHA='1ebc40decae191390c695c36724445f750cd24683e3e49c97430ad2e36b8f149'
WHITELIST=["work/avoid009-blocks-native01/evidence/canonical-input-map.json","work/avoid009-blocks-native01/evidence/native03.invocation.json","work/avoid009-blocks-native01/evidence/native02.invocation.json","work/avoid009-blocks-bounded01/evidence/diagnostic02.invocation.json","work/avoid009-blocks-bounded01/evidence/production03.invocation.json","work/avoid009-blocks-bounded01/evidence/diagnostic01.invocation.json","work/avoid009-blocks-native01/evidence/native01.invocation.json","work/avoid009-blocks-native01/evidence/baseline-pins02.json","work/avoid009-blocks-native01/evidence/baseline-pins03.json","work/avoid009-blocks-bounded01/evidence/baseline-pins02.json","work/avoid009-blocks-bounded01/evidence/baseline-pins03.json","work/avoid009-blocks-bounded01/evidence/baseline-pins.json","work/avoid009-blocks-native01/evidence/baseline-pins.json","work/avoid009-blocks-native01/src/09a_placement.js","work/avoid009-blocks-bounded01/src/09y_layoutsD_blocks_diagnostic02.js","work/avoid009-blocks-bounded01/src/09y_layoutsD_blocks_proof03.js","work/avoid009-blocks-bounded01/src/09y_layoutsD_blocks_diagnostic.js","work/avoid009-blocks-native01/runner/native03.cjs","work/avoid009-blocks-bounded01/runner/diagnostic02.cjs","work/avoid009-blocks-bounded01/evidence/SOURCE-MATH-DOMAIN-RUNNER01.md","work/avoid009-blocks-bounded01/evidence/branch02-source-algebra.json","work/avoid009-blocks-bounded01/src/09z_layoutsD_blocks_adapter03.js","work/avoid009-blocks-native01/runner/native02.cjs","work/avoid009-blocks-native01/runner/native01.cjs","work/avoid009-blocks-native01/evidence/BOUNDED-NATIVE-FIRST-READONLY-DESIGN.md","work/avoid009-blocks-native01/evidence/integration-native03.json","work/avoid009-blocks-native01/evidence/native-held-feasibility-readonly.json","work/avoid009-blocks-bounded01/runner/diagnostic01.cjs","work/avoid009-blocks-bounded01/runner/production03.cjs","work/avoid009-blocks-bounded01/evidence/main-integration03.json","work/avoid009-blocks-native01/evidence/run02-root-diagnosis03.json","work/avoid009-blocks-bounded01/evidence/SOURCE-MATH-BRANCH02.md","work/avoid009-balloons-native01/evidence/native02.invocation.json","work/avoid009-balloons-native01/evidence/native01.invocation.json","work/avoid009-balloons-native01/evidence/baseline-pins01.json","work/avoid009-balloons-translation03/evidence/baseline-pins03.json","work/avoid009-balloons-native01/src/11p_layoutsD.js","work/avoid009-magnets-transport14/src/09a_placement.after.js","work/avoid009-magnets-transport15/src/09a_placement.after.js","work/avoid009-balloons-native01/source02/09a_placement.before.js","work/avoid009-balloons-native01/source02/09a_placement.js","work/avoid009-magnets-transport14/src/09a_placement.before.js","work/avoid009-magnets-transport15/src/09a_placement.before.js","work/avoid009-magnets-transport15/evidence/root-failure14.json"]
PROOF=BASE/'release44-proof.json';RECEIPT=BASE/'release44-receipt.json'
def need(ok,msg):
 if not ok:raise RuntimeError(msg)
def sha(b):return hashlib.sha256(b).hexdigest()
def regular(p):
 for q in [*reversed(p.parents),p]:need(not q.is_symlink(),'symlink refused')
 s=p.lstat();need(stat.S_ISREG(s.st_mode),'regular file required');return s
def readsealed(p,seal):
 regular(p);b=p.read_bytes();need(sha(b)==seal,'source/manifest seal mismatch');return json.loads(b)
def git(*a):
 e=os.environ.copy();e.pop('GIT_INDEX_FILE',None);e['GIT_OPTIONAL_LOCKS']='0';e['GIT_TERMINAL_PROMPT']='0'
 return subprocess.run(['git','-c','gc.auto=0','-c','maintenance.auto=false','-C',str(ROOT),*a],env=e,stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True).stdout
def writefd(fd,obj):
 b=(json.dumps(obj,indent=2)+'\n').encode();off=0
 while off<len(b):
  n=os.pwrite(fd,b[off:],off);need(n>0,'short receipt write');off+=n
 os.ftruncate(fd,len(b));os.fsync(fd)
def model():
 rows=[]
 for name,seal in PLANS.items():
  m=readsealed(BASE/name,seal);need(m['commit']==PIN,'plan commit differs');rows += [x for x in m['items'] if x['tracked'] is False]
 need(len(rows)==44 and set(x['path'] for x in rows)==set(WHITELIST) and len(set(WHITELIST))==44,'fixed44 differs')
 need(sum(x['allocated'] for x in rows)==6639616,'allocation differs')
 return rows,readsealed(BASE/'initial-snapshot.json',SNAP_SHA)
def protected(m):
 index=ROOT/'.git/index';info=regular(index);b=index.read_bytes()
 need(sha(b)==ARGS.root_index_sha256,'ROOT index SHA changed')
 need(not os.path.lexists(ROOT/'.git/index.lock'),'ROOT index lock exists')
 need(git('rev-parse','HEAD').decode().strip()==ARGS.expected_head,'HEAD changed')
 git('merge-base','--is-ancestor',PIN,ARGS.expected_head)
 flags=[x.decode() for x in git('ls-files','-v','-z').split(b'\0') if x and not x.startswith(b'H ')]
 need(flags==m['specialFlags'] and len(flags)==52,'exact52 flags differ')
 for rel in m['skip']:need(not os.path.lexists(ROOT/rel),'old52 absence changed')
 for x in m['pycs']:
  p=ROOT/x['path'];regular(p);raw=p.read_bytes();need(len(raw)==x['bytes'] and sha(raw)==x['sha256'],'PYC changed')
 return {'head':ARGS.expected_head,'indexSHA256':sha(b),'indexDevice':info.st_dev,'indexInode':info.st_ino,'indexMode':stat.S_IMODE(info.st_mode),'flags':flags,'pycs':m['pycs']}
def local(x):
 p=ROOT/x['path'];s=regular(p)
 need(s.st_nlink==1,'hardlink refused')
 need((s.st_dev,s.st_ino,stat.S_IMODE(s.st_mode),s.st_size,s.st_blocks*512)==(x['device'],x['inode'],x['mode'],x['bytes'],x['allocated']),'working-copy identity differs')
 b=p.read_bytes();need(len(b)==x['bytes'] and sha(b)==x['sha256'],'working-copy bytes differ')
 return b
def verify(rows,m):
 state=protected(m);rels=[x['path'] for x in rows]
 need(git('ls-files','-z','--',*rels)==b'','candidate present in ROOT index')
 need(git('ls-tree','-r','-z','HEAD','--',*rels)==b'','candidate present in HEAD')
 payload={}
 for x in rows:
  need(x['path'].startswith('work/avoid009-') and not any(v in x['path'] for v in ['__pycache__','.git/']),'working-copy scope differs')
  b=local(x)
  oid=git('rev-parse',PIN+':'+x['canonical']).decode().strip();need(oid==x['blob'],'canonical proof mapping changed')
  need(git('cat-file','blob',oid)==b,'canonical full bytes differ')
  payload[x['path']]=b
 need(protected(m)==state,'protected state changed during verification')
 proof={'state':'VERIFIED_NOT_RELEASED','sourceSHA256':ARGS.reviewed_source_sha256,'plans':PLANS,'snapshotSHA256':SNAP_SHA,'protected':state,'items':rows,'count':44,'allocated':6639616}
 return proof,payload
def main():
 regular(P(__file__));need(sha(P(__file__).read_bytes())==ARGS.reviewed_source_sha256,'parent-reviewed source SHA required')
 need(ARGS.expected_head and ARGS.root_index_sha256,'explicit current ROOT HEAD/index seals required')
 need(not os.path.lexists(RECEIPT),'release receipt already exists; do not rerun')
 rows,m=model()
 if ARGS.action=='VERIFY':
  need(not os.path.lexists(PROOF),'exclusive proof already exists')
  proof,_=verify(rows,m);fd=os.open(PROOF,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
  try:writefd(fd,proof)
  finally:os.close(fd)
  print(json.dumps({'verified':True,'count':44,'allocated':6639616,'proof':str(PROOF),'proofSHA256':sha(PROOF.read_bytes())}));return
 frozen=readsealed(PROOF,ARGS.proof_sha256);proof,payload=verify(rows,m);need(frozen==proof,'fresh proof differs from frozen parent-reviewed proof')
 # Parent serializes all filesystem/Git work. Reserve the exclusive receipt before any unlink.
 fd=os.open(RECEIPT,os.O_RDWR|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600);removed=[]
 try:
  writefd(fd,{'state':'RELEASING','proofSHA256':ARGS.proof_sha256,'count':44})
  try:
   need(protected(m)==proof['protected'],'protected state changed before release')
   for x in rows:
    need(local(x)==payload[x['path']],'file changed before unlink')
    (ROOT/x['path']).unlink();removed.append(x)
   need(all(not os.path.lexists(ROOT/x['path']) for x in rows),'released path still exists')
   need(protected(m)==proof['protected'],'protected state changed after release')
   writefd(fd,{'state':'RELEASED','proofSHA256':ARGS.proof_sha256,'sourceSHA256':ARGS.reviewed_source_sha256,'count':44,'allocated':6639616,'removedPaths':[x['path'] for x in rows],'protectedBeforeAfter':proof['protected'],'noFlagsOrGitWrites':True})
  except BaseException:
   # Caught-failure rollback restores only paths removed by this invocation, from exact RAM bytes.
   for x in removed:
    p=ROOT/x['path'];restorefd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,x['mode'])
    try:
     data=payload[x['path']];offset=0
     while offset<len(data):
      n=os.write(restorefd,data[offset:]);need(n>0,'short rollback write');offset+=n
     os.fchmod(restorefd,x['mode']);os.fsync(restorefd)
    finally:os.close(restorefd)
    need(p.read_bytes()==payload[x['path']],'rollback full bytes differ')
   writefd(fd,{'state':'CAUGHT_FAILURE_ROLLED_BACK','proofSHA256':ARGS.proof_sha256,'restoredPaths':[x['path'] for x in removed],'note':'restored inodes changed; original proof cannot be rerun'})
   raise
 finally:os.close(fd)
 print(json.dumps({'released':True,'count':44,'allocated':6639616,'receipt':str(RECEIPT),'noFlagsOrGitWrites':True}))
if __name__=='__main__':
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('action',choices=['VERIFY','RELEASE']);ap.add_argument('--reviewed-source-sha256',required=True);ap.add_argument('--root-index-sha256',required=True);ap.add_argument('--expected-head',required=True);ap.add_argument('--proof-sha256');ARGS=ap.parse_args();main()

