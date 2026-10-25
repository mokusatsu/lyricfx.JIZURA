"""Parent-gated exact accepted D copy, normal JA/EN build, transactional rollback."""
from pathlib import Path
import os,sys,json,hashlib,runpy,types,importlib.util,contextlib,io,datetime,shutil
sys.dont_write_bytecode=True
R=Path('/workspace/lyricfx.JIZURA');D=R/'work/avoid009-billboard63-canonical'
def sha(b):return hashlib.sha256(b).hexdigest()
def load(p):return json.loads(Path(p).read_text())
def pin(p):
 b=p.read_bytes();return {'path':str(p.relative_to(R)),'bytes':len(b),'sha256':sha(b)}
def fresh_english():
 p=R/'app/english.py';assert not(R/'app/__init__.py').exists();spec=importlib.util.spec_from_loader('app',loader=None,is_package=True);spec.submodule_search_locations=[str(R/'app')];pkg=importlib.util.module_from_spec(spec);sys.modules['app']=pkg;spec=importlib.util.spec_from_file_location('app.english',p);m=importlib.util.module_from_spec(spec);m.__cached__=None;sys.modules['app.english']=m;exec(compile(p.read_bytes(),str(p),'exec'),m.__dict__);pkg.english=m;assert m.localize_js.__code__.co_filename==str(p);return m

def main():
 assert os.environ.get('BILLBOARD63_APPLY_RELEASE')=='PARENT_REVIEWED_EXACT_D_NORMAL_BUILD';assert os.environ.get('PYTHONDONTWRITEBYTECODE')=='1' and sys.dont_write_bytecode
 pre=load(D/'evidence/pre-pins63.json');seal=load(D/'evidence/seal63.json');assert os.environ['BILLBOARD63_FROZEN_MANIFEST']==seal['frozenManifestPath'];frozen=load(seal['frozenManifestPath']);out=Path(os.environ['BILLBOARD63_BUILD_OUT']);assert str(out).startswith('/dev/shm/') and not out.exists();out.mkdir(parents=True)
 def immutable():
  for x in seal['files']:assert sha((D/x['path']).read_bytes())==x['sha256'],x['path']
  for x in seal['inputs']:assert sha(Path(x['path']).read_bytes())==x['sha256'],x['path']
  for x in pre['pycache']:assert sha((R/x['path']).read_bytes())==x['sha256'],x['path']
  assert sha((R/pre['index']['path']).read_bytes())==pre['index']['sha256'];assert all(not(R/x).exists() for x in pre['protectedAbsent'])
 immutable()
 for x in pre['files']:assert sha((R/x['path']).read_bytes())==x['sha256'],x['path']
 assert len(pre['files'])==124 and len(pre['canonicalSourcePaths'])==108 and len(pre['protectedAbsent'])==64
 target=R/'src/11p_layoutsD.js';old=target.read_bytes();new=(R/'work/avoid009-billboard62-native/src/11p_layoutsD.js').read_bytes();(out/'rollback-11p_layoutsD.js').write_bytes(old)
 before={}
 for x in frozen:
  b=Path(x['frozen']).read_bytes();assert sha(b)==x['sha256'] and len(b)==x['bytes'];assert (R/x['source']).read_bytes()==b;before[x['source']]=b
 assert set(before)=={'index.html','en/index.html'};receipt={'kind':'SOURCE63-exact-D-normal-build','buildComplete':False,'canonicalSourceCount':108,'acceptedDSource':'work/avoid009-billboard62-native/src/11p_layoutsD.js'}
 try:
  target.write_bytes(new);eng=fresh_english();assert eng.localize_js(old.decode(),'src/11p_layoutsD.js')==old.decode();assert eng.localize_js(new.decode(),'src/11p_layoutsD.js')==new.decode()
  log=io.StringIO();sys.path.insert(0,str(R));argv=sys.argv[:];sys.argv=[str(R/'build.py')]
  try:
   with contextlib.redirect_stdout(log):runpy.run_path(str(R/'build.py'),run_name='__main__')
  finally:sys.argv=argv
  (out/'normal-build.stdout.txt').write_text(log.getvalue());outputs=[]
  for name,b in before.items():
   prior=b.decode();actual=(R/name).read_text();assert prior.count(old.decode())==1 and actual.count(new.decode())==1;assert actual==prior.replace(old.decode(),new.decode(),1);inverse=actual.replace(new.decode(),old.decode(),1).encode();assert inverse==b;outputs.append({**pin(R/name),'wholeHTMLInverseSHA256':sha(inverse)})
  assert sorted(str(p.relative_to(R)) for p in(R/'src').glob('*.js'))==pre['canonicalSourcePaths'];changed=[x['path'] for x in pre['files'] if sha((R/x['path']).read_bytes())!=x['sha256']];assert set(changed)=={'src/11p_layoutsD.js','index.html','en/index.html'}
  immutable();post={**pre,'kind':'SOURCE63-canonical-postbuild','files':[pin(R/x['path']) for x in pre['files']]};receipt.update(buildComplete=True,changed=changed,other107JSByteExact=True,sourceEnglishCompiled=True,PYC7ByteExact=True,outputs=outputs,applicationExecuted=False,publicChecks=0)
  (out/'post-pins63.json').write_text(json.dumps(post,indent=2)+'\n');(out/'build63.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
 except BaseException as e:
  receipt['error']={'name':type(e).__name__,'message':str(e)}
  try:
   target.write_bytes(old)
   for x in frozen:shutil.copyfile(x['frozen'],R/x['source'])
   for x in pre['files']:assert sha((R/x['path']).read_bytes())==x['sha256']
   immutable();receipt['rollbackComplete']=True
  except BaseException as q:receipt['rollbackComplete']=False;receipt['rollbackError']=str(q)
  (out/'build63-failed.json').write_text(json.dumps(receipt,indent=2)+'\n');raise
if __name__=='__main__':main()
