"""SOURCE69 only: RAM canonical build and scoped isolated-Git raw persistence.
No browser launch, build, Git init or network action occurs on import.
"""
from pathlib import Path
import builtins,contextlib,hashlib,importlib.util,io,json,os,subprocess,sys,types
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parents[2]
def need(v,msg):
 if not v:raise RuntimeError(msg)
def sha(b):return hashlib.sha256(b).hexdigest()
def read(p):
 p=Path(p)
 for q in [*reversed(p.parents),p]:need(not q.is_symlink(),'symlink refused: '+str(q))
 need(p.is_file(),'regular file required: '+str(p));return p.read_bytes()
def write_json(p,value):
 with Path(p).open('x',encoding='utf-8') as f:json.dump(value,f,ensure_ascii=False,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
def git_env():
 env=os.environ.copy()
 for k in ['GIT_DIR','GIT_WORK_TREE','GIT_INDEX_FILE','GIT_OBJECT_DIRECTORY','GIT_ALTERNATE_OBJECT_DIRECTORIES']:env.pop(k,None)
 env.update(GIT_OPTIONAL_LOCKS='0',GIT_TERMINAL_PROMPT='0')
 n=int(env.get('GIT_CONFIG_COUNT','0'))
 for i,(k,v) in enumerate([('gc.auto','0'),('maintenance.auto','false')]):env['GIT_CONFIG_KEY_'+str(n+i)]=k;env['GIT_CONFIG_VALUE_'+str(n+i)]=v
 env['GIT_CONFIG_COUNT']=str(n+2);return env

def git(args,env=None,data=None):
 p=subprocess.run(['git',*args],cwd=ROOT,env=env or git_env(),input=data,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 if p.returncode:raise RuntimeError('Git exit '+str(p.returncode)+': '+p.stderr.decode(errors='replace').strip())
 return p.stdout
class RootGuard:
 def __init__(self,head,index_sha):
  self.env=git_env();self.head=head;self.index=read(ROOT/'.git/index');self.stat=(ROOT/'.git/index').stat();self.index_sha=index_sha
  need(sha(self.index)==index_sha and self.command(['rev-parse','HEAD']).decode().strip()==head,'ROOT baseline mismatch')
  need(self.stat.st_nlink==1 and not os.path.lexists(ROOT/'.git/index.lock'),'ROOT index link/lock mismatch')
  self.flags=self.command(['ls-files','-v','-z']);self.stage=self.command(['ls-files','--stage','-z'])
  self.skips=[ROOT/os.fsdecode(x[2:]) for x in self.flags.split(b'\0') if x.startswith(b'S ')];need(len(self.skips)==65,'expected65 protected flags')
  need(all(not os.path.lexists(p) for p in self.skips),'all65 protected paths must be physically absent')
  self.skip_state={str(p):None for p in self.skips}
  pyc_paths=['app/__pycache__/english.cpython-312.pyc','dev/avoidance/__pycache__/pages-output-audit.cpython-312.pyc','scratch/avoid008-japanese-visual07/233586c/app/__pycache__/english.cpython-312.pyc','scratch/avoid008-japanese-visual07/d87053c/app/__pycache__/english.cpython-312.pyc','scratch/avoid008-regression01/snapshot/dev/avoidance/__pycache__/pages-output-audit.cpython-312.pyc','work/avoid006-pages-size-prototype/__pycache__/check-jekyll-output.cpython-312.pyc','work/avoid006-pages-size-prototype/__pycache__/stage-source.cpython-312.pyc']
  self.pycs={name:sha(read(ROOT/name)) for name in pyc_paths};need(len(self.pycs)==7,'expected7 protected PYC')
  self.html={n:sha(read(ROOT/n)) for n in ['index.html','en/index.html']}
 def command(self,args):return git(args,self.env)
 def check(self):
  s=(ROOT/'.git/index').stat();need((s.st_dev,s.st_ino,s.st_mode,s.st_nlink)==(self.stat.st_dev,self.stat.st_ino,self.stat.st_mode,self.stat.st_nlink),'ROOT index identity changed')
  need(read(ROOT/'.git/index')==self.index and self.command(['rev-parse','HEAD']).decode().strip()==self.head,'ROOT HEAD/index changed')
  need(self.command(['ls-files','-v','-z'])==self.flags and self.command(['ls-files','--stage','-z'])==self.stage,'ROOT stage/flags changed')
  need(not os.path.lexists(ROOT/'.git/index.lock'),'ROOT index lock appeared')
  for name,digest in self.pycs.items():need(sha(read(ROOT/name))==digest,'PYC changed: '+name)
  for name,digest in self.html.items():need(sha(read(ROOT/name))==digest,'old HTML changed: '+name)
  for name,digest in self.skip_state.items():need((sha(read(name)) if os.path.lexists(name) else None)==digest,'protected path changed: '+name)
 def summary(self):return {'HEAD':self.head,'indexSHA256':self.index_sha,'indexInode':self.stat.st_ino,'skipCount':65,'PYC':self.pycs,'oldHTML':self.html}

def fresh_english():
 p=ROOT/'app/english.py';need(not (ROOT/'app/__init__.py').exists(),'unexpected app initializer')
 spec=importlib.util.spec_from_loader('app',loader=None,is_package=True);spec.submodule_search_locations=[str(ROOT/'app')];pkg=importlib.util.module_from_spec(spec);sys.modules['app']=pkg
 spec=importlib.util.spec_from_file_location('app.english',p);module=importlib.util.module_from_spec(spec);module.__cached__=None;sys.modules['app.english']=module
 exec(compile(read(p),str(p),'exec'),module.__dict__);pkg.english=module;need(module.localize_js.__code__.co_filename==str(p),'English source not compiled');return module

def ram_build(run_dir,guard,baseline_ref):
 run_dir=Path(run_dir);out=run_dir/'build';out.mkdir();(out/'candidate-en').mkdir();(out/'baseline-en').mkdir();guard.check()
 log=io.StringIO();before_modules={k:sys.modules.get(k) for k in ['app','app.english']};old_open=builtins.open;old_makedirs=os.makedirs;old_cwd=os.getcwd();old_argv=sys.argv[:];reads=set();writes=[]
 targets={str(ROOT/'index.html'):out/'candidate-ja.html',str(ROOT/'en/index.html'):out/'candidate-en/index.html'}
 def redirected(name,mode='r',*a,**kw):
  if isinstance(name,(str,bytes,os.PathLike)):
   p=Path(os.fsdecode(name));p=p if p.is_absolute() else Path.cwd()/p;p=Path(os.path.abspath(p))
   if any(c in mode for c in 'wax+'):
    need(str(p) in targets and mode=='w','unexpected build write: '+str(p));need(str(p) not in writes,'duplicate build output');writes.append(str(p));return old_open(targets[str(p)],mode,*a,**kw)
   reads.add(str(p))
  return old_open(name,mode,*a,**kw)
 def mkdir_only_existing(name,*a,**kw):
  p=Path(os.path.abspath(name));need(p in [ROOT,ROOT/'en'] and p.is_dir(),'unexpected build mkdir: '+str(p))
 try:
  fresh_english();builtins.open=redirected;os.makedirs=mkdir_only_existing;sys.argv=[str(ROOT/'build.py')]
  with contextlib.redirect_stdout(log):exec(compile(read(ROOT/'build.py'),str(ROOT/'build.py'),'exec'),{'__file__':str(ROOT/'build.py'),'__name__':'__main__'})
 finally:
  builtins.open=old_open;os.makedirs=old_makedirs;os.chdir(old_cwd);sys.argv=old_argv
  for k,v in before_modules.items():
   if v is None:sys.modules.pop(k,None)
   else:sys.modules[k]=v
  (out/'build.stdout.txt').write_text(log.getvalue())
 need(set(writes)==set(targets),'normal build did not write both outputs');(out/'build.stdout.txt').write_text(log.getvalue())
 for name,dest in [('index.html',out/'baseline-ja.html'),('en/index.html',out/'baseline-en/index.html')]:dest.write_bytes(guard.command(['show',baseline_ref+':'+name]))
 guard.check();receipt={'normalBuildSourceUnmodified':True,'EnglishCompiledFromSource':True,'PYC7Unchanged':True,'ROOTIndexUnchanged':True,'oldHTMLUnchanged':True,'baselineRef':baseline_ref,'reads':[{'path':p,'sha256':sha(read(p))} for p in sorted(reads)],'outputs':[{'path':str(p.relative_to(run_dir)),'bytes':len(read(p)),'sha256':sha(read(p))} for p in [*targets.values(),out/'baseline-ja.html',out/'baseline-en/index.html']], 'browserExecuted':False,'publicChecks':0};write_json(out/'build-receipt.json',receipt);return out

def input_paths():
 names=['build.py','assets/effect-preview.png','vendor/mp4-muxer.min.js','dev/browser.cjs','dev/package.json','dev/package-lock.json','dev/avoidance/layouts-b-fixture.js','tasks/evidence/AVOID-009/resume-20261025/parent-local-review69.py','tasks/evidence/AVOID-009/resume-20261025/parent-read-raw69.py','tasks/evidence/AVOID-009/bulbs-diagnostic56/parent-review-bulbs56.py']
 paths=[ROOT/n for n in names]+list((ROOT/'src').glob('*.js'))+[p for p in (ROOT/'app').iterdir() if p.is_file() and p.suffix in ['.py','.js','.html','.css']]
 paths+=list((ROOT/'dev/avoidance').glob('*bulbs69*'))+[ROOT/'dev/avoidance/layouts-d-bulbs68-source-test.cjs']
 paths+=[ROOT/'tasks/evidence/AVOID-009/bulbs-focused59/source59/runner'/n for n in ['kernel59.cjs','catalog59.cjs','quality59.cjs']]
 fm=ROOT/'dev/avoidance/layouts-c-editorial-fonts/manifest.json';fonts=json.loads(read(fm));paths.append(fm)
 from urllib.parse import urlparse
 for face in fonts['faces']:
  u=urlparse(face['url']);need(not u.netloc and '..' not in Path(u.path).parts,'nonlocal font input');p=ROOT/u.path.lstrip('/');need(sha(read(p))==face['sourceSHA256'],'font SHA mismatch');paths.append(p)
 return sorted(set(paths))

def node_dependency(node):
 script="const fs=require('node:fs'),crypto=require('node:crypto'),{createRequire}=require('node:module'),r=createRequire(process.argv[1]),p=r.resolve('playwright/package.json'),b=fs.readFileSync(p);console.log(JSON.stringify({nodeVersion:process.version,playwright:{path:p,version:JSON.parse(b).version,sha256:crypto.createHash('sha256').update(b).digest('hex')}}));"
 return json.loads(subprocess.check_output([str(node),'-e',script,str(ROOT/'dev/browser.cjs')],cwd=ROOT))

def freeze_inputs(run_dir,runtime_paths):
 run_dir=Path(run_dir);frozen=run_dir/'frozen-inputs';frozen.mkdir();rows=[]
 for p in input_paths():
  data=read(p);rel=p.relative_to(ROOT);dest=frozen/rel;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(data);rows.append({'path':str(rel),'bytes':len(data),'sha256':sha(data),'snapshot':str(dest.relative_to(run_dir))})
 runtime=[{'path':str(p),'bytes':Path(p).stat().st_size,'sha256':sha(Path(p).read_bytes()),'storage':'binary hash only; runtime not a Git source input'} for p in runtime_paths]
 write_json(run_dir/'frozen-inputs.json',{'files':rows,'runtime':runtime,'publicChecks':0});return rows

def check_inputs(rows):
 for row in rows:need(sha(read(ROOT/row['path']))==row['sha256'],'frozen input changed: '+row['path'])

def scope_files(run_dir,attempt):
 run_dir=Path(run_dir);rows=[];selected=[]
 # Authoritative producer files only. Browser TMPDIR/profiles and private Git
 # are runtime resources, never evidence inputs to this scoped archive.
 for folder in ['raw','build','frozen-inputs']:
  base=run_dir/folder
  if base.exists():
   need(base.is_dir() and not base.is_symlink(),'invalid producer folder: '+str(base))
   for p in sorted(base.rglob('*')):
    need(not p.is_symlink(),'source symlink refused: '+str(p))
    if p.is_file():selected.append(p)
 root_names=['reviewed-seal.json','run-start.json','frozen-inputs.json','producer-command.json','producer.stdout.txt','producer.stderr.txt','orchestrator-failure.json','producer-result.json','parent-local-review.json','parent-local-review.stdout.txt','parent-local-review.stderr.txt','parent-local-review-execution.json']
 for name in root_names:
  p=run_dir/name
  if os.path.lexists(p):selected.append(p)
 for pattern in ['persistence-failure-*.json','archive-input-list-*.json']:
  selected.extend(run_dir.glob(pattern))
 for p in sorted(set(selected)):
  data=read(p);rows.append({'source':str(p),'relative':str(p.relative_to(run_dir)),'bytes':len(data),'sha256':sha(data)})
 path=run_dir/('archive-input-list-'+str(attempt)+'.json');write_json(path,{'files':rows,'excludedRuntimeOnly':['tmp','private-git','browser profiles/cache/control files outside named producer folders']});return path,rows

def archive_raw69(run_dir,guard,branch,attempt,receipt_path):
 run_dir=Path(run_dir);need(str(run_dir).startswith('/dev/shm/avoid009-bulbs69-'),'wrong RAM scope');need(branch.startswith('archive/avoid009-bulbs69-') and all(c.isalnum() or c in '/-_' for c in branch),'wrong archive branch');guard.check()
 input_list,rows=scope_files(run_dir,attempt);prefix='tasks/evidence/AVOID-009/bulbs-source69-runs/'+run_dir.name+'/'
 private=run_dir/'private-git'/str(attempt);private.mkdir(parents=True);gd=private/'repo.git';env=guard.env.copy();git(['init','--bare',str(gd)],env)
 se=env.copy();se.update(GIT_DIR=str(gd),GIT_WORK_TREE=str(ROOT),GIT_INDEX_FILE=str(private/'index'),GIT_ALTERNATE_OBJECT_DIRECTORIES=str(ROOT/'.git/objects'))
 def sg(args,data=None):return git(args,se,data)
 sg(['read-tree',guard.head]);expected=[]
 for row in [*rows,{'source':str(input_list),'relative':input_list.name,'bytes':input_list.stat().st_size,'sha256':sha(read(input_list))}]:
  data=read(row['source']);need(len(data)==row['bytes'] and sha(data)==row['sha256'],'archive source changed');need(len(data)<100000000,'Git blob exceeds100MB')
  name=prefix+row['relative'];oid=sg(['hash-object','-w','--stdin'],data).decode().strip();stored=sg(['cat-file','blob',oid]);need(stored==data,'full stored bytes differ');sg(['update-index','--add','--cacheinfo','100644',oid,name]);expected.append({'path':name,'bytes':len(data),'sha256':sha(data),'gitBlob':oid})
 manifest={'baseHEAD':guard.head,'ROOTIndexSHA256':guard.index_sha,'files':expected,'fullStoredBytesVerified':True,'allProducerPrefixIncluded':True,'runtimeBinaryStorage':'hash only','publicChecks':0};data=(json.dumps(manifest,indent=2)+'\n').encode();oid=sg(['hash-object','-w','--stdin'],data).decode().strip();need(sg(['cat-file','blob',oid])==data,'stored archive manifest differs');sg(['update-index','--add','--cacheinfo','100644',oid,prefix+'archive-manifest.json']);tree=sg(['write-tree']).decode().strip()
 for row in expected:need(sg(['rev-parse',tree+':'+row['path']]).decode().strip()==row['gitBlob'],'final archive tree mismatch')
 author=guard.command(['show','-s','--format=%an%x00%ae',guard.head]).decode().strip().split('\0');se.update(GIT_AUTHOR_NAME=author[0],GIT_AUTHOR_EMAIL=author[1],GIT_COMMITTER_NAME=author[0],GIT_COMMITTER_EMAIL=author[1]);commit=sg(['commit-tree',tree,'-p',guard.head],b'AVOID-009 preserve SOURCE69 full producer prefix and inputs\n').decode().strip();remote=guard.command(['config','--get','remote.origin.url']).decode().strip();ref='refs/heads/'+branch
 need(not sg(['ls-remote',remote,ref]).strip(),'archive branch already exists; fresh suffix required');guard.check();output=sg(['push','--porcelain',remote,commit+':'+ref]).decode();guard.check()
 receipt={'state':'RAW69_ALL_PREFIX_PUSH_DONE','commit':commit,'branch':branch,'baseHEAD':guard.head,'ROOTIndexSHA256':guard.index_sha,'ROOTHEADIndexPYCAndOldHTMLUnchanged':True,'scopeFiles':len(expected)+1,'scopeBytes':sum(r['bytes'] for r in expected)+len(data),'allStoredBytesVerified':True,'pushOutput':output,'publicChecks':0}
 write_json(receipt_path,receipt);return receipt
