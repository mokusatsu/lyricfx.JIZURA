"""SOURCE53 parent-gated exact canonical copy/build. No Git or app/browser tests."""
from pathlib import Path
import os,sys,json,hashlib,datetime,types,importlib.util,runpy,contextlib,io,shutil
sys.dont_write_bytecode=True
R=Path('/workspace/lyricfx.JIZURA');D=R/'work/avoid009-bulbs53-canonical'
def sha(b):return hashlib.sha256(b).hexdigest()
def load(p):return json.loads(Path(p).read_text())
def pin(p,base=R):
 b=Path(p).read_bytes();return {'path':str(Path(p).relative_to(base)),'bytes':len(b),'sha256':sha(b)}
def fresh_english():
 p=R/'app/english.py';assert not(R/'app/__init__.py').exists(),'Review actual package initialization before using namespace source path'
 spec=importlib.util.spec_from_loader('app',loader=None,is_package=True);spec.submodule_search_locations=[str(R/'app')];pkg=importlib.util.module_from_spec(spec);sys.modules['app']=pkg
 spec=importlib.util.spec_from_file_location('app.english',str(p));module=importlib.util.module_from_spec(spec);module.__cached__=None;sys.modules['app.english']=module;exec(compile(p.read_bytes(),str(p),'exec'),module.__dict__);assert module.localize_js.__code__.co_filename==str(p) and module.localize_body.__code__.co_filename==str(p);pkg.english=module;return module

def main():
 assert os.environ.get('BULBS53_APPLY_RELEASE')=='PARENT_REVIEWED_EXACT_COPY_NORMAL_BUILD'
 assert os.environ.get('PYTHONDONTWRITEBYTECODE')=='1' and sys.dont_write_bytecode
 pins=load(D/'evidence/pre-pins53.json');seal=load(D/'evidence/seal53.json');modules=load(D/'evidence/modules53.json');frozen=load(D/'evidence/frozen-before53.json');out=Path(os.environ['BULBS53_BUILD_OUT']);assert out.is_absolute() and str(out).startswith('/dev/shm/') and not out.exists();out.mkdir(parents=True)
 def check_pre():
  assert len(pins['files'])==123 and len(pins['pycache'])==7 and len(pins['absent60'])==60
  for p in pins['files']+pins['pycache']:assert sha((R/p['path']).read_bytes())==p['sha256'],p['path']
  assert all(not(R/p).exists()for p in pins['absent60']);assert sha((R/pins['index']['path']).read_bytes())==pins['index']['sha256']
  for p in seal['files']:assert sha((D/p['path']).read_bytes())==p['sha256'],p['path']
  for p in seal['inputs']:assert sha(Path(p['path']).read_bytes())==p['sha256'],p['path']
 check_pre();old_src={str(p.relative_to(R)):pin(p)for p in sorted((R/'src').glob('*.js'))};assert set(old_src)==set(pins['canonicalSourcePaths'])and len(old_src)==107;before_html={};before_paths={};old_sources={};new_paths=[];touched=[];receipt={'kind':'SOURCE53-exact-canonical-native-build','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'buildComplete':False,'rollback':None,'sourceBaseCommit':pins['HEADReference'],'productBase':pins['productReference'],'beforeSourceCount':len(old_src),'changes':modules}
 for row in frozen:
  f=Path(os.environ.get('BULBS53_BEFORE_'+('JA'if row['source']=='index.html'else'EN'),row['frozen']));b=f.read_bytes();assert len(b)==row['bytes'] and sha(b)==row['sha256'];assert(R/row['source']).read_bytes()==b;before_paths[row['source']]=f;before_html[row['source']]=b
 for m in modules['accepted']:
  b=Path(m['source']).read_bytes();assert len(b)==m['bytes'] and sha(b)==m['sha256'];target=R/m['target']
  if m['target']in modules['existing']:
   old=target.read_bytes();assert sha(old)==modules['existing'][m['target']]['sha256'];old_sources[m['target']]=old;(out/('rollback-'+target.name)).write_bytes(old)
  else:assert not target.exists();new_paths.append(target)
 try:
  for m in modules['accepted']:
   target=R/m['target'];touched.append(target);target.write_bytes(Path(m['source']).read_bytes());assert sha(target.read_bytes())==m['sha256']
  english=fresh_english()
  for m in modules['accepted']:assert english.localize_js(Path(m['source']).read_text(),m['target'])==Path(m['source']).read_text(),'Unexpected localization of accepted native module'
  stdout=io.StringIO();sys.path.insert(0,str(R));argv=sys.argv[:];sys.argv=[str(R/'build.py')]
  try:
   with contextlib.redirect_stdout(stdout):runpy.run_path(str(R/'build.py'),run_name='__main__')
  finally:sys.argv=argv
  (out/'normal-build.stdout.txt').write_text(stdout.getvalue());anchor=(R/'src/11za_layoutsD_transport.js').read_text();late=(R/'src/11zb_bulbs_native_transport51.js').read_text();outputs=[]
  for name,old in before_html.items():
   prior=old.decode();expected=prior
   for target,body in old_sources.items():assert expected.count(body.decode())==1;expected=expected.replace(body.decode(),(R/target).read_text(),1)
   assert expected.count(anchor)==1;expected=expected.replace(anchor,anchor+'\n'+late,1);actual=(R/name).read_text();assert actual==expected,'Normal build changed more than exact accepted modules: '+name
   inverse=actual
   for target,body in old_sources.items():new=(R/target).read_text();assert inverse.count(new)==1;inverse=inverse.replace(new,body.decode(),1)
   assert inverse.count('\n'+late)==1;inverse=inverse.replace('\n'+late,'',1);assert inverse.encode()==old,'Inverse whole HTML does not equal parent original: '+name;outputs.append({**pin(R/name),'inverseSHA256':sha(inverse.encode()),'inverseMatchesFrozenOriginal':True,'normalBuildOnlyAcceptedModules':True})
  current={str(p.relative_to(R)):pin(p)for p in sorted((R/'src').glob('*.js'))};added=set(current)-set(old_src);assert added=={'src/11zb_bulbs_native_transport51.js'};assert set(old_src)<=set(current);assert all(current[p]['sha256']==old_src[p]['sha256']for p in old_src if p not in old_sources)
  for m in modules['accepted']:assert current[m['target']]['sha256']==m['sha256']
  for p in pins['pycache']:assert sha((R/p['path']).read_bytes())==p['sha256']
  for p in seal['inputs']:assert sha(Path(p['path']).read_bytes())==p['sha256'],p['path']
  assert all(not(R/p).exists()for p in pins['absent60']);assert sha((R/pins['index']['path']).read_bytes())==pins['index']['sha256'];changed=[p['path']for p in pins['files']if sha((R/p['path']).read_bytes())!=p['sha256']];assert set(changed)=={'src/09a_placement.js','src/11p_layoutsD.js','index.html','en/index.html'}
  post={**pins,'kind':'SOURCE53-canonical-postbuild-pins','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'files':[pin(R/p['path'])for p in pins['files']]+[current[p]for p in sorted(added)],'canonicalSourceCount':len(current),'canonicalSourcePaths':sorted(current),'buildReceipt':'build53.json'};assert len(post['files'])==124 and len(current)==len(old_src)+1
  receipt.update(buildComplete=True,normalBuilderUnmodified=True,actualEnglishSourceCompiled=True,englishPYCReadAvoided=True,all7PYCBytesPreserved=True,otherExistingJSSourcesPreserved=len(old_src)-len(old_sources),afterSourceCount=len(current),addedSources=sorted(added),changedExistingPinnedFiles=changed,outputs=outputs,publicChecks=0,browserExecuted=False)
  (out/'build53.json').write_text(json.dumps(receipt,indent=2)+'\n');(out/'post-pins53.json').write_text(json.dumps(post,indent=2)+'\n');print(json.dumps({'kind':'SOURCE53_BUILD_DONE','out':str(out),'receiptSHA256':sha((out/'build53.json').read_bytes()),'postPinsSHA256':sha((out/'post-pins53.json').read_bytes()),'sourceCount':len(current),'outputs':outputs}))
 except BaseException as e:
  receipt['error']={'name':type(e).__name__,'message':str(e)}
  try:
   for target,body in old_sources.items():
    if R/target in touched:(R/target).write_bytes(body)
   for name,f in before_paths.items():assert sha(f.read_bytes())==sha(before_html[name]);shutil.copyfile(f,R/name)
   for target in new_paths:
    if target.exists():assert sha(target.read_bytes())==next(m['sha256']for m in modules['accepted']if R/m['target']==target);target.unlink()
   check_pre();receipt['rollback']={'complete':True,'old09aAndDAndHTMLRestored':True,'onlyOwnedLateModuleRemoved':True,'GitIndexOrPYCMutated':False}
  except BaseException as re:receipt['rollback']={'complete':False,'error':{'name':type(re).__name__,'message':str(re)}}
  (out/'build53-failed.json').write_text(json.dumps(receipt,indent=2)+'\n');raise
if __name__=='__main__':main()
