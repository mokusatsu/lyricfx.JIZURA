"""One parent-run normal-route Source fetch diagnostic. No asset save or publication."""
import sys
sys.dont_write_bytecode=True
from pathlib import Path
import base64,hashlib,json,os,re,signal,stat,subprocess,tempfile,termios
PROJECT='appgprj_6adbafe9f07c8191ab0b404c53caab16'
REMOTE='https://git.chatgpt-team.site/ca6227f0-be34-40d7-9800-d5b531e94bab/'+PROJECT+'.git'
EXPECTED_HEAD='7e27ad1166c66e0e4ec13f85fdbf5c4c38cf9e66'
def need(v):
 if not v:raise RuntimeError('precondition')
def sanitize_git_stderr(stderr,header):
 text=stderr.decode('utf-8','replace')
 secrets=[header,header.split(':',1)[-1].strip()]
 value=header.split(':',1)[-1].strip()
 if ' ' in value:
  secrets.append(value.split(' ',1)[1])
  if value.lower().startswith('basic '):
   try:
    decoded=base64.b64decode(value.split(' ',1)[1],validate=True).decode('utf-8');secrets.extend([decoded,*decoded.split(':')])
   except (ValueError,UnicodeError):pass
 for secret in sorted(set(secrets),key=len,reverse=True):
  if secret:text=text.replace(secret,'[REDACTED]')
 lines=[]
 for line in text.splitlines():
  if re.search(r'authorization|extraheader|credential|cookie|bearer|token',line,re.I):line='[AUTHENTICATION DIAGNOSTIC REDACTED]'
  line=re.sub(r'https?://[^\s]+','[URL REDACTED]',line)
  line=re.sub(r'[A-Za-z0-9_+/=.-]{24,}','[LONG VALUE REDACTED]',line)
  line=''.join(c if c.isprintable() else '?' for c in line)
  lines.append(line)
 return '\n'.join(lines)[:8192]
def main():
 need(len(sys.argv)==1 and sys.stdin.isatty())
 phase='NORMAL_PRIVATE_RUNTIME';runtime=None;result=None;fd=None;original=None;failure=None;fetch_attempts=0;metadata={}
 try:
  runtime=Path(tempfile.mkdtemp(prefix='avoid009-sites36-fetch-retry-20261026-',dir='/dev/shm'));need(stat.S_IMODE(runtime.stat().st_mode)==0o700);tmp=runtime/'tmp';tmp.mkdir(mode=0o700);repo=runtime/'repo.git'
  fd=sys.stdin.fileno();original=termios.tcgetattr(fd);hidden=termios.tcgetattr(fd);hidden[3]&=~termios.ECHO;termios.tcsetattr(fd,termios.TCSADRAIN,hidden);need(not termios.tcgetattr(fd)[3]&termios.ECHO);phase='CREDENTIAL_INPUT';print('SITES36_FETCH_RETRY_CREDENTIAL_READY_ECHO_OFF',flush=True)
  line=sys.stdin.readline(65537);need(len(line)<=65536 and line.endswith('\n'));c=json.loads(line);need(isinstance(c,dict) and (c.get('repo_url') or c.get('remote_url'))==REMOTE)
  for key in ['repo_url','remote_url']:
   if key in c:need(c[key]==REMOTE)
  need(c.get('project_id',PROJECT)==PROJECT and c.get('branch','main')=='main' and c.get('auth_mode')=='http_extra_header');need(c.get('publish_on_push') is False or c.get('publish_on_push_accepted') is False)
  for key in ['publish_on_push','publish_on_push_accepted']:
   if key in c:need(c[key] is False)
  need('token' not in c);header=c.get('http_extra_header');need(isinstance(header,str) and len(header)<16384 and header.lower().startswith('authorization:') and not any(t in header for t in ['\n','\r','\0']));del line,c
  env=os.environ.copy()
  for key in list(env):
   if key.startswith('GIT_TRACE') or key in ['GIT_ASKPASS','SSH_ASKPASS','GIT_CURL_VERBOSE','CURL_VERBOSE','CURL_TRACE','CURL_TRACE_ASCII','GIT_DIR','GIT_WORK_TREE','GIT_INDEX_FILE','GIT_COMMON_DIR','GIT_OBJECT_DIRECTORY','GIT_ALTERNATE_OBJECT_DIRECTORIES']:env.pop(key,None)
  env.update(GIT_TERMINAL_PROMPT='0',GIT_OPTIONAL_LOCKS='0',GIT_AUTHOR_NAME='Codex',GIT_AUTHOR_EMAIL='codex@openai.com',GIT_COMMITTER_NAME='Codex',GIT_COMMITTER_EMAIL='codex@openai.com',TMPDIR=str(tmp));settings=[('gc.auto','0'),('maintenance.auto','false'),('credential.helper',''),('core.hooksPath','/dev/null'),('http.followRedirects','false'),('fetch.recurseSubmodules','false'),('http.'+REMOTE+'.extraHeader',header)]
  base_count=int(env.get('GIT_CONFIG_COUNT','0'));need(base_count>=0);env['GIT_CONFIG_COUNT']=str(base_count+len(settings))
  for i,(key,value) in enumerate(settings):env['GIT_CONFIG_KEY_'+str(base_count+i)]=key;env['GIT_CONFIG_VALUE_'+str(base_count+i)]=value
  def git(args,allow_absent=False):
   nonlocal failure
   process=subprocess.run(['git',*args],cwd=runtime,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
   if allow_absent and process.returncode==1 and not process.stdout:return b''
   if process.returncode:
    failure={'phase':phase,'exitCode':process.returncode,'sanitizedStderr':sanitize_git_stderr(process.stderr,header)};raise RuntimeError('git-command-failed')
   return process.stdout
  phase='SOURCE_RUNTIME_INIT';git(['init','--bare','--initial-branch=main',str(repo)]);env.update(GIT_DIR=str(repo),GIT_INDEX_FILE=str(runtime/'index'));need(not git(['config','--get-regexp',r'^url\..*\.(insteadof|pushinsteadof)$'],allow_absent=True))
  phase='FETCH_EXISTING_SOURCE_MAIN';fetch_attempts+=1;git(['fetch','--depth=1','--no-tags','--no-recurse-submodules',REMOTE,'refs/heads/main'])
  phase='LOCAL_FETCHED_OBJECT_METADATA';head=git(['rev-parse','FETCH_HEAD']).decode().strip();need(re.fullmatch('[0-9a-f]{40}',head));rows=[row for row in git(['ls-tree','-rz',head]).split(b'\0') if row];hosting=json.loads(git(['show',head+':.openai/hosting.json']));metadata={'fetchedHEAD':head,'expectedHEADMatches':head==EXPECTED_HEAD,'trackedFileCount':len(rows),'hostingProjectMatches':hosting.get('project_id')==PROJECT,'hostingStaticDirectory':hosting.get('static',{}).get('directory')};need(metadata['expectedHEADMatches'] and metadata['hostingProjectMatches'] and metadata['hostingStaticDirectory']=='dist')
  result={'state':'SITES36_FETCH_RETRY_DIAGNOSTIC_SUCCEEDED','phase':phase,'fetchAttempts':fetch_attempts,'gitFailure':None,**metadata}
 except BaseException:
  result={'state':'SITES36_FETCH_RETRY_DIAGNOSTIC_STOPPED','phase':phase,'fetchAttempts':fetch_attempts,'gitFailure':failure,**metadata}
 finally:
  if original is not None:termios.tcsetattr(fd,termios.TCSADRAIN,original)
  if result:
   result.update(project_id=PROJECT,branch='main',assetSave=False,push=False,publish=False,publicChecks=0,automaticRetry=False)
   if runtime is not None:
    with (runtime/'result.json').open('x',encoding='utf-8') as out:json.dump(result,out,indent=2);out.write('\n');out.flush();os.fsync(out.fileno())
    result['privateRuntime']=str(runtime)
   print(json.dumps(result),flush=True)
 while True:signal.pause()
if __name__=='__main__':
 try:main()
 except BaseException:print('Source fetch diagnostic stopped; sensitive diagnostics suppressed.',flush=True);raise SystemExit(1)
