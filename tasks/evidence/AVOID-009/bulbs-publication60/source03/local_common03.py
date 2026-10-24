"""Local Source-only primitives. No network commands or credential handling."""
import hashlib,json,os,pathlib,stat,subprocess
P=pathlib.Path;BASE=P('/dev/shm/avoid009-evening-20261024');SOURCE=BASE/'source'
PROJECT='appgprj_6adbafe9f07c8191ab0b404c53caab16'
REMOTE='https://git.chatgpt-team.site/ca6227f0-be34-40d7-9800-d5b531e94bab/'+PROJECT+'.git'
REL='dist/review/AVOID-009/bulbs-native-reflow-20261025-01/'
NAMES=['index.html','videos/before.mp4','videos/after.mp4','posters/before.png','posters/after.png']
def need(x,message='precondition'):
 if not x:raise RuntimeError(message)
def sha(b):return hashlib.sha256(b).hexdigest()
def safe(p):
 for q in [*reversed(p.parents),p]:need(not q.is_symlink(),'symlink alias')
def read(p):
 safe(p);need(stat.S_ISREG(p.stat().st_mode),'regular input required');return p.read_bytes()
def output(p,value):
 safe(p);need(not p.exists(),'fresh output required')
 with p.open('x') as f:json.dump(value,f,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
def tree():
 result={}
 for folder in ['dist','.openai']:
  top=SOURCE/folder;safe(top);need(top.is_dir())
  for p in sorted(top.rglob('*')):
   safe(p);s=p.lstat();need(stat.S_ISREG(s.st_mode) or stat.S_ISDIR(s.st_mode))
   if p.is_file():result[str(p.relative_to(SOURCE))]={'bytes':s.st_size,'sha256':sha(p.read_bytes())}
 return result
def environment():
 e=os.environ.copy()
 for k in list(e):
  if k.startswith('GIT_TRACE') or k in ['GIT_CURL_VERBOSE','GIT_DIR','GIT_WORK_TREE','GIT_INDEX_FILE','GIT_COMMON_DIR','GIT_OBJECT_DIRECTORY','GIT_ALTERNATE_OBJECT_DIRECTORIES']:e.pop(k,None)
 e['GIT_TERMINAL_PROMPT']='0';e['GIT_OPTIONAL_LOCKS']='0';return e
def git(args):
 # Whitelist local commands; this module cannot fetch, push, clone or ls-remote.
 need(args and args[0] in ['symbolic-ref','config','rev-parse','status','ls-tree','ls-files','diff','diff-tree','add','commit'])
 return subprocess.run(['git','-c','gc.auto=0','-c','maintenance.auto=false','-c','core.hooksPath=/dev/null',*args],cwd=SOURCE,env=environment(),check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE).stdout
def clean():need(not git(['status','--porcelain=v1','--untracked-files=all']).strip(),'checkout must be clean')
def config():
 safe(BASE);safe(SOURCE);need((SOURCE/'.git').is_dir() and not (SOURCE/'.git').is_symlink())
 need(git(['symbolic-ref','--short','HEAD']).decode().strip()=='main')
 need(git(['config','--get-all','remote.origin.url']).decode().strip()==REMOTE)
 cfg=json.loads(read(SOURCE/'.openai/hosting.json'));need(cfg['project_id']==PROJECT and cfg['static']['directory']=='dist')
def prior_subset(g,current):
 p=P(g['priorTilesLocalReceiptPath']);need(p.is_absolute())
 b=read(p);need(sha(b)==g['priorTilesLocalReceiptSHA256']=='c7c695069e9ca7aa24065ce30b7ba69417d8533f6e8f56689b99c05103e33817')
 old=json.loads(b)['expectedProtectedTree'];need(len(old)==111 and all(current.get(k)==v for k,v in old.items()),'original106 and tiles5 must survive')
