"""Parent-gated nine-file Source Git update; credential only via hidden TTY stdin.
No publish, public request, automatic retry, or any post-push readback.
"""
import sys
sys.dont_write_bytecode=True
from pathlib import Path
import base64,hashlib,json,os,re,stat,subprocess,termios
PROJECT='appgprj_6adbafe9f07c8191ab0b404c53caab16'
REMOTE='https://git.chatgpt-team.site/ca6227f0-be34-40d7-9800-d5b531e94bab/'+PROJECT+'.git'
ROUTE='dist/review/AVOID-009/bulbs-auto-layout-20261025-01/'
NAMES=['index.html']+[folder+'/'+case+'-'+side+suffix for case in ['upper','right'] for side in ['before','after'] for folder,suffix in [('videos','.mp4'),('posters','.png')]]
def need(v):
 if not v:raise RuntimeError('precondition')
def sha(b):return hashlib.sha256(b).hexdigest()
def read(p):
 p=Path(p)
 for q in [*reversed(p.parents),p]:need(not q.is_symlink())
 need(stat.S_ISREG(p.stat().st_mode));return p.read_bytes()
def write(p,v):
 with Path(p).open('x',encoding='utf-8') as f:json.dump(v,f,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
def safe_git_error(stderr):
 low=stderr.lower()
 for pattern,label in [(b'non-fast-forward','NON_FAST_FORWARD'),(b'authentication failed','AUTHENTICATION_FAILED'),(b'403','HTTP403'),(b'401','HTTP401'),(b'could not resolve','RESOLUTION_FAILED'),(b'timed out','TIMEOUT')]:
  if pattern in low:return label
 return 'UNCLASSIFIED_GIT_FAILURE'
def main():
 need(len(sys.argv)==3);public=Path(sys.argv[1]);out=Path(sys.argv[2]);root=Path.cwd();run=public.parent.parent;need(public.is_absolute() and public.name=='public' and public.parent.name=='raw' and str(run).startswith('/dev/shm/avoid009-bulbs69-media71-'));need(out.is_absolute() and out.is_relative_to(run) and out.is_dir() and not (out/'result.json').exists());gate_path=root/'tasks/evidence/AVOID-009/resume-20261025/source71/parent-source-save-gate71.json';phase='PARENT_AND_ASSET_GATE';result=None;fd=None;original=None;safe_error=None;oldhead=None;newhead=None;push_returned=False
 try:
  gate_bytes=read(gate_path);gate=json.loads(gate_bytes);need(gate['state']=='PARENT_MEDIA71_NUMERIC_AND_FRESH_VISUAL_ACCEPTED_SOURCE_SAVE' and gate['project_id']==PROJECT and gate['humanMotionReview']=='PENDING');need(all(gate.get(k) is True for k in ['sourceRawAccepted','nativeMediaAccepted','freshVisualAccepted','exactNineSourceSaveAccepted']));need(gate['sourceSaveHelperSHA256']==sha(read(Path(__file__))))
  old_expected=gate['expectedSourceOldHEAD'];need(re.fullmatch('[0-9a-f]{40}',old_expected));manifest_bytes=read(public.parent/'manifest.json');numeric_name=gate.get('numericReviewPath','parent-local-review.json');need(isinstance(numeric_name,str) and Path(numeric_name).name==numeric_name and re.fullmatch(r'[A-Za-z0-9_.-]+\.json',numeric_name));numeric_bytes=read(run/numeric_name);m=json.loads(manifest_bytes);numeric=json.loads(numeric_bytes);need(sha(manifest_bytes)==gate['mediaManifestSHA256'] and sha(numeric_bytes)==gate['numericReviewSHA256']);need(m['complete'] and not m['errors'] and numeric['state']=='PASS_MEDIA71_RAW_NUMERIC' and numeric['producerComplete'] and not numeric['producerErrors']);visual=gate['freshVisualReview'];vp=root/visual['path'];need(vp.is_relative_to(root) and sha(read(vp))==visual['sha256'])
  inventory={p['path']:{'bytes':p['bytes'],'sha256':p['sha256']} for p in m['publicFiles']};expected={p['path']:{'bytes':p['bytes'],'sha256':p['sha256']} for p in gate['publicFiles']};need(set(inventory)==set(NAMES) and inventory==expected);actual=set()
  for p in public.rglob('*'):
   need(not p.is_symlink())
   if p.is_file():actual.add(str(p.relative_to(public)))
  need(actual==set(NAMES));payload={}
  for name,pin in inventory.items():b=read(public/name);need(len(b)==pin['bytes'] and sha(b)==pin['sha256']);payload[ROUTE+name]=b
  need(sys.stdin.isatty());fd=sys.stdin.fileno();original=termios.tcgetattr(fd);hidden=termios.tcgetattr(fd);hidden[3]&=~termios.ECHO;termios.tcsetattr(fd,termios.TCSADRAIN,hidden);need(not termios.tcgetattr(fd)[3]&termios.ECHO);phase='CREDENTIAL_INPUT';print('SOURCE71_HELPER_CREDENTIAL_READY_ECHO_OFF',flush=True)
  line=sys.stdin.readline(65537);need(len(line)<=65536 and line.endswith('\n'));c=json.loads(line);need(isinstance(c,dict) and (c.get('repo_url') or c.get('remote_url'))==REMOTE)
  for key in ['repo_url','remote_url']:
   if key in c:need(c[key]==REMOTE)
  need(c.get('project_id',PROJECT)==PROJECT and c.get('branch','main')=='main' and c.get('auth_mode','http_extra_header')=='http_extra_header');need(c.get('publish_on_push') is False or c.get('publish_on_push_accepted') is False);header=c.get('http_extra_header')
  if not header:
   token=c.get('token');user=c.get('username');need(isinstance(token,str) and bool(token) and (user is None or isinstance(user,str)));header='Authorization: Basic '+base64.b64encode((user+':'+token).encode()).decode() if user else 'Authorization: Bearer '+token
  need(isinstance(header,str) and len(header)<16384 and header.lower().startswith('authorization:') and not any(t in header for t in ['\n','\r','\0']));del line,c
  env=os.environ.copy()
  for key in list(env):
   if key.startswith('GIT_TRACE') or key in ['GIT_ASKPASS','SSH_ASKPASS','GIT_CURL_VERBOSE','CURL_VERBOSE','CURL_TRACE','CURL_TRACE_ASCII','GIT_DIR','GIT_WORK_TREE','GIT_INDEX_FILE','GIT_COMMON_DIR','GIT_OBJECT_DIRECTORY','GIT_ALTERNATE_OBJECT_DIRECTORIES']:env.pop(key,None)
  env.update(GIT_TERMINAL_PROMPT='0',GIT_OPTIONAL_LOCKS='0',GIT_AUTHOR_NAME='Codex',GIT_AUTHOR_EMAIL='codex@openai.com',GIT_COMMITTER_NAME='Codex',GIT_COMMITTER_EMAIL='codex@openai.com');settings=[('gc.auto','0'),('maintenance.auto','false'),('credential.helper',''),('core.hooksPath','/dev/null'),('http.followRedirects','false'),('fetch.recurseSubmodules','false'),('http.'+REMOTE+'.extraHeader',header)]
  base_count=int(env.get('GIT_CONFIG_COUNT','0'));need(base_count>=0);env['GIT_CONFIG_COUNT']=str(base_count+len(settings))
  for i,(key,value) in enumerate(settings):env['GIT_CONFIG_KEY_'+str(base_count+i)]=key;env['GIT_CONFIG_VALUE_'+str(base_count+i)]=value
  runtime=run/'source-runtime'/out.name;need(not runtime.exists());runtime.mkdir(parents=True);repo=runtime/'repo.git';phase='SOURCE_RUNTIME_INIT'
  def git(args,data=None,allow_absent=False):
   nonlocal safe_error
   p=subprocess.run(['git',*args],cwd=runtime,env=env,input=data,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
   if allow_absent and p.returncode==1 and not p.stdout:return b''
   if p.returncode:safe_error=safe_git_error(p.stderr);raise RuntimeError('git-command-failed')
   return p.stdout
  git(['init','--bare','--initial-branch=main',str(repo)]);env.update(GIT_DIR=str(repo),GIT_INDEX_FILE=str(runtime/'index'));need(not git(['config','--get-regexp',r'^url\..*\.(insteadof|pushinsteadof)$'],allow_absent=True));phase='FETCH_EXISTING_SOURCE_MAIN';git(['fetch','--depth=1','--no-tags','--no-recurse-submodules',REMOTE,'refs/heads/main']);oldhead=git(['rev-parse','FETCH_HEAD']).decode().strip();need(oldhead==old_expected);git(['update-ref','refs/heads/main',oldhead]);oldtree=git(['ls-tree','-rz',oldhead]);oldrows=[r for r in oldtree.split(b'\0') if r];hosting_config=json.loads(git(['show',oldhead+':.openai/hosting.json']));need(hosting_config['project_id']==PROJECT and hosting_config['static']['directory']=='dist');oldpaths={r.split(b'\t',1)[1] for r in oldrows};added={p.encode() for p in payload};need(not oldpaths&added)
  phase='EXACT_NINE_LOCAL_COMMIT';git(['read-tree',oldhead]);asset_blobs={}
  for name,data in payload.items():oid=git(['hash-object','-w','--stdin'],data).decode().strip();need(git(['cat-file','blob',oid])==data);git(['update-index','--add','--cacheinfo','100644',oid,name]);asset_blobs[name]=oid
  tree=git(['write-tree']).decode().strip();newhead=git(['commit-tree',tree,'-p',oldhead],b'Add two native60fps bulbs avoidance comparisons\n').decode().strip();need(re.fullmatch('[0-9a-f]{40}',newhead));newtree=git(['ls-tree','-rz',newhead]);newrows=[r for r in newtree.split(b'\0') if r];remaining=b'\0'.join(r for r in newrows if r.split(b'\t',1)[1] not in added)+b'\0';need(remaining==oldtree);changes=git(['diff-tree','--no-commit-id','--name-status','-r','-z',oldhead,newhead]).split(b'\0');need(changes==[v.encode() for name in sorted(payload) for v in ['A',name]]+[b'']);need(git(['rev-list','--parents','-n','1',newhead]).decode().split()==[newhead,oldhead]);need(set(asset_blobs)==set(payload))
  for name,oid in asset_blobs.items():need(git(['rev-parse',newhead+':'+name]).decode().strip()==oid)
  git(['update-ref','refs/heads/main',newhead,oldhead]);hosting=[r for r in oldrows if r.split(b'\t',1)[1].split(b'/')[-1]==b'hosting.json'];phase='PUSH_SOURCE_MAIN';git(['push','--porcelain','--no-recurse-submodules',REMOTE,newhead+':refs/heads/main']);push_returned=True
  # No Git command/readback follows push. All invariants above are pre-push.
  result={'state':'SOURCE71_EXACT_NINE_PUSH_COMMAND_RETURNED_SUCCESS','project_id':PROJECT,'remote':REMOTE,'branch':'main','priorHEAD':oldhead,'head':newhead,'route':ROUTE,'files':[{**inventory[name],'path':ROUTE+name,'gitBlob':asset_blobs[ROUTE+name]} for name in NAMES],'parentGateSHA256':sha(gate_bytes),'protectedTrackedFiles':len(oldrows),'protectedTrackedTreeSHA256':sha(oldtree),'allOriginalTrackedModesAndPrivateBlobsPreserved':True,'originalHostingRowsSHA256':sha(b'\0'.join(hosting)),'pushReturnCode':0,'pushCommandReturnedSuccess':True,'force':False,'automaticRetry':False,'publish':False,'publishOnPush':False,'sourceOnlyRemoteBuildFallback':True,'fullExistingDistPackaged':False,'humanMotionReview':'PENDING','publicChecks':0,'postPushReadback':False}
 except BaseException:result={'state':'SOURCE71_SOURCE_SAVE_STOPPED','safePhase':phase,'safeGitError':safe_error,'priorHEAD':oldhead,'head':newhead,'pushCommandReturnedSuccess':push_returned,'automaticRetry':False,'publish':False,'publicChecks':0,'postPushReadback':False}
 finally:
  if original is not None:termios.tcsetattr(fd,termios.TCSADRAIN,original)
  if result:write(out/'result.json',result);print(json.dumps(result),flush=True)
 if not result or result['state']!='SOURCE71_EXACT_NINE_PUSH_COMMAND_RETURNED_SUCCESS':raise SystemExit(1)
if __name__=='__main__':
 try:main()
 except BaseException:print('Source save helper stopped; sensitive diagnostics suppressed.',flush=True);raise SystemExit(1)
