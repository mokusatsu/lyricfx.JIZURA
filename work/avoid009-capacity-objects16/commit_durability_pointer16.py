#!/usr/bin/env python3
"""Parent-reviewed one-process STRICT65 round3 for an explicit durability-doc allowlist."""
import argparse,hashlib,json,os,pathlib,tempfile,types
P=pathlib.Path;ROOT=P('/workspace/lyricfx.JIZURA');W=ROOT/'work/avoid009-capacity-objects16';HEAD='a5bc1de12b779b87c60a21f3402dad5cdca4e621';IDX='579bdcfec781ca98d9710b2bd9f97a7aabc4f335e2731f17c1157c56dbfb540a';RECEIPT='7352d3d33d782708bde956616f0652806fd689d279ddaba4205b9f93d1083211';MODEL='3dad72608f7a6d6ec5432c4cb1cc8815b375df21a267a1fb0646715290c7199c'
def sha(b):return hashlib.sha256(b).hexdigest()
def need(ok,msg):
 if not ok:raise RuntimeError(msg)
def read(p):
 for q in [*reversed(p.parents),p]:need(not q.is_symlink(),'symlink refused: '+str(q))
 need(p.is_file(),'regular file required');return p.read_bytes()
def exclusive(p,b):
 with p.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--parent-reviewed',action='store_true',required=True);ap.add_argument('--allowlist',required=True);a=ap.parse_args();allow=json.loads(read(P(a.allowlist)));need(isinstance(allow,list) and 1<=len(allow)<=20 and len(set(allow))==len(allow),'explicit small literal file list required')
code=read(W/'private_index_resume16.py');need(sha(code)=='eb8de7f8d030db70e6bd33fb054738debccfd94375521a8f7a915426e44535b2','immutable helper changed');need(sha(read(W/'authorized-continuation65-snapshot.json'))==MODEL,'model changed')
g=types.ModuleType('reviewed65');g.__file__=str(W/'private_index_resume16.py');exec(compile(code,g.__file__,'exec'),g.__dict__);g.BASE=P(tempfile.mkdtemp(prefix='avoid009-pointer-round3-',dir='/dev/shm'));g.SNAP=W/'authorized-continuation65-snapshot.json';g.ARGS=types.SimpleNamespace(root_index_sha256=IDX,expected_head=HEAD,private_index_sha256=None)
need(g.head()==HEAD and sha(read(ROOT/'.git/index'))==IDX,'current ROOT baseline changed')
seed=P('/workspace/avoid009-private-commit16-20261025');ib=read(seed/'evening-resume16-index-round-2');rb=read(seed/'evening-resume16-index-round-2-receipt.json');need(sha(ib)==IDX and sha(rb)==RECEIPT,'archived historical seed differs');previous,_,previousreceipt=g.paths(2);exclusive(previous,ib);exclusive(previousreceipt,rb)
g.prepare(3,MODEL,RECEIPT);m=g.model(MODEL);contents={}
for rel in allow:g.relfile(rel,m);contents[rel]=read(ROOT/rel)
g.run(3,['add','--',*allow]);private,_,_,_,_=g.load(3)
changed=[x.decode() for x in g.git(['diff','--cached','--name-only','-z'],private).split(b'\0') if x];need(set(changed)==set(allow),'staged scope differs from exact allowlist')
for rel,b in contents.items():need(g.git(['show',':'+rel],private)==b and read(ROOT/rel)==b,'staged/source bytes differ: '+rel)
g.git(['diff','--cached','--check'],private)
# Source and complete staged-byte gates above must pass before the authorized commit.
g.run(3,['commit','-m','AVOID-009 document Git-durable workspace backup and handoff'])
newhead=g.head();g.ARGS.expected_head=newhead;g.ARGS.private_index_sha256=sha(read(private));g.install(3)
_,_,receipt=g.paths(3);out=ROOT/'tasks/evidence/AVOID-009/evening-20261024/storage-capacity-objects16/durability-pointer-round3-receipt.json';exclusive(out,read(receipt))
try:
 pushed=g.git(['push','origin','work']).decode();print(json.dumps({'state':'DURABILITY_POINTER_COMMIT_INSTALL_PUSH_DONE','HEAD':newhead,'indexSHA256':sha(read(ROOT/'.git/index')),'receiptPath':str(out),'receiptSHA256':sha(read(out)),'pushOutput':pushed,'publicChecks':0,'privateScratchRetained':str(g.BASE)},indent=2))
except BaseException:
 print(json.dumps({'state':'COMMIT_AND_INSTALL_DONE_PUSH_NOT_CONFIRMED','HEAD':newhead,'receiptPath':str(out),'scratchRetained':str(g.BASE)}));raise
