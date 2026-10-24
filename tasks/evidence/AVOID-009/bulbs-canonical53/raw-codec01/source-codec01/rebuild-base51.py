#!/usr/bin/env python3
"""Parent-only fresh SHM accepted51 input rebuild; no application execution or original overwrite."""
import argparse,base64,datetime,gzip,hashlib,io,json,os,pathlib,stat,subprocess,tarfile
P=pathlib.Path;ROOT=P('/workspace/lyricfx.JIZURA');OFFICIAL=P('/dev/shm/avoid009-evening-20261024');HERE=P(__file__).parent
PACKAGE_CAP=2*1024*1024;PAYLOAD_CAP=16*1024*1024
sha=lambda b:hashlib.sha256(b).hexdigest()
def safe(p):
 assert p.is_absolute() and str(p)==os.path.normpath(str(p))
 for q in [*reversed(p.parents),p]:assert not q.is_symlink(),'symlink refused'
 return p
def regular(p):
 safe(p);s=p.lstat();assert stat.S_ISREG(s.st_mode) and s.st_nlink==1;return s
def read(p):regular(p);return p.read_bytes()
def shm(p):
 safe(p);assert str(p).startswith(str(OFFICIAL)+'/') and OFFICIAL.is_dir();return p
def literal(rel):
 p=pathlib.PurePosixPath(rel);assert isinstance(rel,str) and rel and not p.is_absolute() and '..' not in p.parts and '.' not in p.parts and '\\' not in rel and str(p)==rel;return rel
def write(p,b):
 safe(p)
 with p.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 assert read(p)==b

def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--package',required=True);ap.add_argument('--package-sha256',required=True);ap.add_argument('--base-pins-sha256',required=True);ap.add_argument('--out',required=True);ap.add_argument('--report',required=True);a=ap.parse_args()
 package=shm(P(a.package));compressed=read(package);assert len(compressed)<=PACKAGE_CAP and sha(compressed)==a.package_sha256
 with gzip.GzipFile(fileobj=io.BytesIO(compressed),mode='rb') as g:raw=g.read(PAYLOAD_CAP+1)
 assert len(raw)<=PAYLOAD_CAP;pkg=json.loads(raw);assert pkg['format']=='BULBS53-EXACT-JSON-GZIP-BASE51-v1' and pkg['standalone'] is False
 pinbytes=read(HERE/'base51-pins.json');assert sha(pinbytes)==a.base_pins_sha256;pins=json.loads(pinbytes);assert pkg['requiredImmutableBase51']==pins
 names={'common53.cjs','encode53.cjs','restore53.cjs','verify-directory53.cjs','rebuild-base51.py','base51-pins.json'};assert len(pkg['codecSources'])==len(names) and {x['path'] for x in pkg['codecSources']}==names
 for row in pkg['codecSources']:
  b=read(HERE/row['path']);assert len(b)==row['bytes'] and sha(b)==row['sha256']
 files={};env=os.environ.copy();env.pop('GIT_INDEX_FILE',None);env.update(GIT_OPTIONAL_LOCKS='0',GIT_TERMINAL_PROMPT='0')
 def git(args):return subprocess.check_output(['git','-C',str(ROOT),*args],env=env)
 for row in pins['files']:
  rel=literal(row['path']);b=read(ROOT/rel);assert len(b)==row['bytes'] and sha(b)==row['sha256'];assert git(['rev-parse',pins['baseCommit']+':'+rel]).decode().strip()==row['blob'];assert b==git(['cat-file','blob',row['blob']]);files[P(rel).name]=b
 storage=json.loads(files['storage51.json']);assert storage['archiveSHA256']==pins['archiveSHA256'] and storage['manifestSHA256']==pins['manifest51SHA256'];members={x['member']:x for x in storage['members']};assert len(members)==len(storage['members'])==pins['baseMemberCount']
 receipt=pkg['derivedReferenceExtractionReceipt'];assert receipt['path']=='reference51/reference53.json';receiptbytes=base64.b64decode(receipt['base64'],validate=True);assert len(receiptbytes)==receipt['bytes'] and sha(receiptbytes)==receipt['sha256'];r=json.loads(receiptbytes);assert r['archiveSHA256']==pins['archiveSHA256'] and r['manifestSHA256']==pins['manifest51SHA256'] and r['verifiedMembers']==pins['baseMemberCount']
 out=shm(P(a.out));report=shm(P(a.report));assert not out.exists() and not os.path.lexists(report) and not str(report).startswith(str(out)+'/') and not str(package).startswith(str(out)+'/');assert out.parent.is_dir() and report.parent.is_dir();out.mkdir(mode=0o700);seen=set()
 # Decode retained51 archive exactly once into a NEW derived base. Never extract generic paths.
 with tarfile.open(fileobj=io.BytesIO(files[storage['archive']]),mode='r|xz') as tf:
  for info in tf:
   assert info.isfile() and info.name in members and info.name not in seen;rel=literal(info.name);row=members[rel];assert info.size==row['bytes'];p=out/rel;safe(p);p.parent.mkdir(parents=True,exist_ok=True);digest=hashlib.sha256();count=0
   with tf.extractfile(info) as source,p.open('xb') as target:
    while True:
     b=source.read(65536)
     if not b:break
     target.write(b);digest.update(b);count+=len(b)
    target.flush();os.fsync(target.fileno())
   assert count==row['bytes'] and digest.hexdigest()==row['sha256'];seen.add(rel)
 assert seen==set(members);assert read(out/'original-metadata/manifest.json')==files['manifest51.json']
 # Seed EXACT stored original53 receipt, not a new timestamp or rewritten original.
 write(out/'reference53.json',receiptbytes)
 actual=[]
 for p in out.rglob('*'):
  assert not p.is_symlink()
  if p.is_file():regular(p);actual.append(p.relative_to(out).as_posix())
 assert sorted(actual)==sorted([*members,'reference53.json'])
 result={'state':'ACCEPTED51_DERIVED_INPUT_REBUILT_NEW_SHM_ALL_MEMBERS_VERIFIED_EXACT_ORIGINAL53_RECEIPT_SEEDED','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'out':str(out),'archiveSHA256':pins['archiveSHA256'],'storage51SHA256':pins['storage51SHA256'],'manifest51SHA256':pins['manifest51SHA256'],'verifiedMembers':len(seen),'exactOriginal53ExtractionReceiptSHA256':sha(receiptbytes),'newObservations':False,'applicationExecuted':False,'originalsOverwritten':False,'standalone':False};write(report,(json.dumps(result,indent=2)+'\n').encode());print(json.dumps(result))
if __name__=='__main__':main()
