"""SOURCE49 parent-gated exact canonical copy/build. No Git or app/browser tests."""
from pathlib import Path
import os,sys,json,hashlib,datetime,types,importlib.util,runpy,contextlib,io,shutil
sys.dont_write_bytecode=True
R=Path('/workspace/lyricfx.JIZURA');D=R/'work/avoid009-tiles49-integration'
def sha(b):return hashlib.sha256(b).hexdigest()
def load(p):return json.loads(Path(p).read_text())
def pin(p,base=R):
 b=Path(p).read_bytes();return {'path':str(Path(p).relative_to(base)),'bytes':len(b),'sha256':sha(b)}
def fresh_english():
 p=R/'app/english.py';assert not(R/'app/__init__.py').exists(),'Review actual package initialization before using namespace source path'
 spec=importlib.util.spec_from_loader('app',loader=None,is_package=True);spec.submodule_search_locations=[str(R/'app')];pkg=importlib.util.module_from_spec(spec);sys.modules['app']=pkg
 spec=importlib.util.spec_from_file_location('app.english',str(p));module=importlib.util.module_from_spec(spec);module.__cached__=None;sys.modules['app.english']=module;exec(compile(p.read_bytes(),str(p),'exec'),module.__dict__);assert module.localize_js.__code__.co_filename==str(p) and module.localize_body.__code__.co_filename==str(p);pkg.english=module;return module

def main():
 assert os.environ.get('TILES49_APPLY_RELEASE')=='PARENT_REVIEWED_EXACT_COPY_NORMAL_BUILD'
 assert os.environ.get('PYTHONDONTWRITEBYTECODE')=='1' and sys.dont_write_bytecode
 pins=load(D/'evidence/pre-pins49.json');seal=load(D/'evidence/seal49.json');modules=load(D/'evidence/modules49.json');frozen=load(R/'tasks/evidence/AVOID-009/tiles-adapter48/frozen-native-before48.json');out=Path(os.environ['TILES49_BUILD_OUT']);assert out.is_absolute() and str(out).startswith('/dev/shm/') and not out.exists();out.mkdir(parents=True)
 def check_pre():
  assert len(pins['files'])==121 and len(pins['pycache'])==7 and len(pins['absent57'])==57
  for p in pins['files']+pins['pycache']:assert sha((R/p['path']).read_bytes())==p['sha256'],p['path']
  assert all(not(R/p).exists()for p in pins['absent57']);assert sha((R/pins['index']['path']).read_bytes())==pins['index']['sha256']
  for p in seal['files']:assert sha((D/p['path']).read_bytes())==p['sha256'],p['path']
  for p in seal['inputs']:assert sha(Path(p['path']).read_bytes())==p['sha256'],p['path']
 check_pre();old_src={str(p.relative_to(R)):pin(p)for p in sorted((R/'src').glob('*.js'))};before_html={};before_paths={};new_paths=[];touched=[];receipt={'kind':'SOURCE49-exact-canonical-build','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'started':True,'buildComplete':False,'rollback':None,'sourceBaseCommit':pins['HEADReference'],'productBase':pins['productReference'],'beforeSourceCount':len(old_src),'changes':modules}
 # Parent-owned frozen SHM files only; no HTML copies into ROOT scratch.
 for row in frozen:
  f=Path(os.environ.get('TILES49_BEFORE_'+('JA'if row['source']=='index.html'else'EN'),row['frozen']));assert f.is_absolute();b=f.read_bytes();assert len(b)==row['bytes'] and sha(b)==row['sha256'];assert(R/row['source']).read_bytes()==b;before_paths[row['source']]=f;before_html[row['source']]=b
 old09=(R/'src/09_render.js').read_bytes();assert sha(old09)==modules['old09']['sha256'];(out/'rollback-old09.js').write_bytes(old09)
 for m in modules['accepted']:
  b=Path(m['source']).read_bytes();assert len(b)==m['bytes'] and sha(b)==m['sha256'];target=R/m['target'];assert target==R/'src/09_render.js'or not target.exists()
  if m['target']!='src/09_render.js':new_paths.append(target)
 try:
  for m in modules['accepted']:
   target=R/m['target'];touched.append(target);target.write_bytes(Path(m['source']).read_bytes());assert sha(target.read_bytes())==m['sha256']
  english=fresh_english();assert 'app.english'in sys.modules and sys.modules['app.english']is english
  for m in modules['accepted']:assert english.localize_js(Path(m['source']).read_text(),m['target'])==Path(m['source']).read_text(),'Unexpected localization of accepted module'
  stdout=io.StringIO();sys.path.insert(0,str(R));oldargv=sys.argv[:];sys.argv=[str(R/'build.py')]
  try:
   with contextlib.redirect_stdout(stdout):runpy.run_path(str(R/'build.py'),run_name='__main__')
  finally:sys.argv=oldargv
  (out/'normal-build.stdout.txt').write_text(stdout.getvalue())
  new09=(R/'src/09_render.js').read_text();proof=(R/'src/11p_layoutsEc_tiles_proof48.js').read_text();adapter=(R/'src/11p_layoutsEd_tiles_adapter48.js').read_text();anchor=(R/'src/11p_layoutsEb_magnets_adapter29.js').read_text();outputs=[]
  for name,old in before_html.items():
   actual=(R/name).read_text();prior=old.decode();assert prior.count(old09.decode())==1 and prior.count(anchor)==1;expected=prior.replace(old09.decode(),new09).replace(anchor,anchor+'\n'+proof+'\n'+adapter);assert actual==expected,'Normal build differs from ONLY accepted module substitutions: '+name
   assert actual.count(new09)==1 and actual.count('\n'+proof+'\n'+adapter)==1
   inverse=actual.replace(new09,old09.decode(),1).replace('\n'+proof+'\n'+adapter,'',1);assert inverse.encode()==old,'Inverse wholeHTML mismatch: '+name;outputs.append({**pin(R/name),'inverseMatchesParentFrozen':True,'inverseSHA256':sha(inverse.encode()),'normalBuildOnlyAcceptedModules':True})
  new_src={str(p.relative_to(R)):pin(p)for p in sorted((R/'src').glob('*.js'))};added=set(new_src)-set(old_src);assert added=={m['target']for m in modules['accepted']if m['target']!='src/09_render.js'};assert set(old_src)<=set(new_src);assert all(old_src[p]['sha256']==new_src[p]['sha256']for p in old_src if p!='src/09_render.js')
  for m in modules['accepted']:assert new_src[m['target']]['sha256']==m['sha256']
  for p in pins['pycache']:assert sha((R/p['path']).read_bytes())==p['sha256']
  for p in seal['inputs']:assert sha(Path(p['path']).read_bytes())==p['sha256'],p['path']
  assert all(not(R/p).exists()for p in pins['absent57']);assert sha((R/pins['index']['path']).read_bytes())==pins['index']['sha256']
  allowed={'src/09_render.js','index.html','en/index.html'}
  changed=[p['path']for p in pins['files']if sha((R/p['path']).read_bytes())!=p['sha256']];assert set(changed)==allowed
  post={**pins,'kind':'SOURCE49-canonical-postbuild-pins','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'files':[pin(R/p['path'])for p in pins['files']]+[new_src[p]for p in sorted(added)],'canonicalSourceCount':len(new_src),'canonicalSourcePaths':sorted(new_src),'beforeSourceCount':len(old_src),'buildReceipt':'build49.json'};assert len(post['files'])==len(pins['files'])+2
  receipt.update(buildComplete=True,normalBuilderUnmodified=True,actualEnglishSourceCompiled=True,englishPYCReadAvoided=True,all7PYCBytesPreserved=True,otherExistingJSSourcesPreserved=len(old_src)-1,afterSourceCount=len(new_src),addedSources=sorted(added),changedExistingPinnedFiles=changed,outputs=outputs,publicChecks=0,browserExecuted=False)
  (out/'build49.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');(out/'post-pins49.json').write_text(json.dumps(post,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'kind':'SOURCE49_BUILD_DONE','out':str(out),'receiptSHA256':sha((out/'build49.json').read_bytes()),'postPinsSHA256':sha((out/'post-pins49.json').read_bytes()),'sourceCount':len(new_src),'outputs':outputs}))
 except BaseException as e:
  receipt['error']={'name':type(e).__name__,'message':str(e)};rollback_errors=[]
  try:
   if R/'src/09_render.js'in touched:(R/'src/09_render.js').write_bytes(old09)
   for name,f in before_paths.items():shutil.copyfile(f,R/name)
   for target in new_paths:
    if target.exists():
     expected=next(m['sha256']for m in modules['accepted']if R/m['target']==target);assert sha(target.read_bytes())==expected,'Refuse delete externallychanged newmodule';target.unlink()
   check_pre();receipt['rollback']={'complete':True,'sourceOld09SHA256':sha(old09),'HTMLFromVerifiedParentFrozen':True,'onlyOwnedNewFilesRemoved':True,'GitIndexOrPYCMutated':False}
  except BaseException as re:rollback_errors.append({'name':type(re).__name__,'message':str(re)});receipt['rollback']={'complete':False,'errors':rollback_errors}
  (out/'build49-failed.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');raise
if __name__=='__main__':main()
