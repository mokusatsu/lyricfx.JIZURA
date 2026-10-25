#!/usr/bin/env python3
"""Parent-reviewed fresh HEAD transaction; no historical private-index/release-chain authority.
Exact old reviewed RUN/INSTALL preserve same-inode ROOT and rollback. One RAM process.
"""
import argparse,hashlib,json,os,pathlib,tempfile,types
P=pathlib.Path;ROOT=P('/workspace/lyricfx.JIZURA');W=ROOT/'work/avoid009-capacity-objects16'
def need(ok,msg):
 if not ok:raise RuntimeError(msg)
def sha(b):return hashlib.sha256(b).hexdigest()
def read(p):
 for q in [*reversed(p.parents),p]:need(not q.is_symlink(),'symlink refused: '+str(q))
 need(p.is_file(),'regular file required: '+str(p));return p.read_bytes()
def exclusive(p,b):
 with p.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--parent-reviewed',action='store_true',required=True)
for flag in ['expected-head','root-index-sha256','allowlist','message','receipt-output']:ap.add_argument('--'+flag,required=True)
a=ap.parse_args();need(a.message.startswith('AVOID-009') and len(a.message)<=2000,'AVOID-009 message required');allow=json.loads(read(P(a.allowlist)));need(isinstance(allow,list) and 1<=len(allow)<=200 and all(isinstance(x,str) for x in allow) and len(set(allow))==len(allow),'1..200 literal file list required')
out=P(a.receipt_output);need(out.is_absolute() and ROOT in out.parents and not os.path.lexists(out),'new explicit ROOT evidence receipt required');need(str(out.relative_to(ROOT)).startswith('tasks/evidence/AVOID-009/'),'receipt must be task009 evidence');need(str(out.relative_to(ROOT)) not in allow,'postcommit receipt cannot be staged as preexisting input')
for q in [*reversed(out.parent.parents),out.parent]:need(not q.is_symlink(),'receipt symlink parent refused')
need(out.parent.is_dir(),'receipt parent must already exist')
code=read(W/'private_index_resume16.py');need(sha(code)=='eb8de7f8d030db70e6bd33fb054738debccfd94375521a8f7a915426e44535b2','reviewed helper changed');g=types.ModuleType('fresh_reviewed65');g.__file__=str(W/'private_index_resume16.py');exec(compile(code,g.__file__,'exec'),g.__dict__)
need(not os.path.lexists(ROOT/'.git/index.lock'),'ROOT locked');info=g.regular(g.INDEX);need(info.st_nlink==1,'ROOT single link required');old=read(g.INDEX);need(sha(old)==a.root_index_sha256 and g.head()==a.expected_head,'explicit current HEAD/index differ');g.git(['diff','--cached','--quiet'])
historical=json.loads(read(W/'authorized-continuation65-snapshot.json'));m={k:historical[k] for k in ['skip','specialFlags','pycs']};m['indexNlink']=1;g.protected(m);need(g.skips()==m['skip'] and g.flags()==m['specialFlags'],'current65/fullspecial flags differ')
# ROOT state is the sole active baseline; old model contributes only protection lists.
g.BASE=P(tempfile.mkdtemp(prefix='avoid009-fresh-commit-',dir='/dev/shm'));g.SNAP=g.BASE/'fresh-protections.json';mb=(json.dumps(m,indent=2)+'\n').encode();exclusive(g.SNAP,mb);g.ARGS=types.SimpleNamespace(expected_head=a.expected_head,private_index_sha256=None)
private,state,receipt=g.paths(1);s={'round':1,'manifestSHA256':sha(mb),'rootSHA256':sha(old),'rootBytes':len(old),'device':info.st_dev,'inode':info.st_ino,'mode':info.st_mode&0o7777,'prepareHead':a.expected_head};exclusive(private,old);g.writejson(state,s);g.load(1);need(g.git(['ls-files','--stage','-z'])==g.git(['ls-files','--stage','-z'],private),'fresh private stage differs');contents={}
for rel in allow:g.relfile(rel,m);contents[rel]=read(ROOT/rel)
g.run(1,['add','--',*allow]);changed=[x.decode() for x in g.git(['diff','--cached','--name-only','-z'],private).split(b'\0') if x];need(set(changed)==set(allow),'staged changed files must equal exact allowlist')
for rel,b in contents.items():need(g.git(['show',':'+rel],private)==b and read(ROOT/rel)==b,'staged/source full bytes differ: '+rel)
g.git(['diff','--cached','--check'],private);need(g.head()==a.expected_head,'HEAD changed before commit');g.run(1,['commit','-m',a.message]);newhead=g.head();g.ARGS.expected_head=newhead;g.ARGS.private_index_sha256=sha(read(private));g.install(1);exclusive(out,read(receipt));fd=os.open(out.parent,os.O_RDONLY|os.O_DIRECTORY)
try:os.fsync(fd)
finally:os.close(fd)
try:
 pushed=g.git(['push','origin','work']).decode();print(json.dumps({'state':'FRESH_COMMIT_INSTALL_PUSH_DONE','HEAD':newhead,'ROOTIndexSHA256':sha(read(g.INDEX)),'receipt':str(out),'receiptSHA256':sha(read(out)),'privateScratchHistoricalOnly':str(g.BASE),'stagedFiles':len(allow),'stagedFileBytes':sum(map(len,contents.values())),'pushOutput':pushed,'publicChecks':0},indent=2))
except BaseException:
 print(json.dumps({'state':'COMMIT_INSTALL_DONE_PUSH_NOT_CONFIRMED','HEAD':newhead,'receipt':str(out),'privateScratchHistoricalOnly':str(g.BASE)}));raise
