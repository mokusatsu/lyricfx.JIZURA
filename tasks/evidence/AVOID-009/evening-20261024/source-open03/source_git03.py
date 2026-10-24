#!/usr/bin/env python3
"""Explicit owner Source Git OPEN/PUSH only. No publication or public checks."""
import argparse,base64,hashlib,json,os,pathlib,re,stat,subprocess,sys,termios
P=pathlib.Path;BASE=P('/dev/shm/avoid009-evening-20261024');DEST=BASE/'source'
PROJECT='appgprj_6adbafe9f07c8191ab0b404c53caab16'
REMOTE='https://git.chatgpt-team.site/ca6227f0-be34-40d7-9800-d5b531e94bab/'+PROJECT+'.git'
RECEIPT=BASE/'source-open-evening03.json'
def need(x):
 if not x:raise RuntimeError('precondition')
def sha(b):return hashlib.sha256(b).hexdigest()
def safe(p):
 for q in [*reversed(p.parents),p]:need(not q.is_symlink())
def sealed_tree():
 result={}
 for folder in ['.openai','dist']:
  top=DEST/folder;safe(top);need(top.is_dir())
  for p in sorted(top.rglob('*')):
   safe(p);s=p.lstat();need(stat.S_ISDIR(s.st_mode) or stat.S_ISREG(s.st_mode))
   if p.is_file():result[str(p.relative_to(DEST))]={'bytes':s.st_size,'sha256':sha(p.read_bytes())}
 cfg=json.loads((DEST/'.openai/hosting.json').read_bytes());need(cfg['project_id']==PROJECT and cfg['static']['directory']=='dist')
 need(any(x.startswith('dist/') for x in result));return result
def git(a,e,cwd=DEST):return subprocess.run(['git',*a],cwd=cwd,env=e,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE).stdout
def config_ok(e):
 safe(DEST);need(DEST.is_dir() and (DEST/'.git').is_dir() and not (DEST/'.git').is_symlink())
 need(git(['symbolic-ref','--short','HEAD'],e).decode().strip()=='main')
 need(git(['config','--get-all','remote.origin.url'],e).decode().strip()==REMOTE)
 # Refuse custom push URLs; the explicit endpoint is still used below.
 p=subprocess.run(['git','config','--get-all','remote.origin.pushurl'],cwd=DEST,env=e,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 need(p.returncode==1 and not p.stdout)
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('action',choices=['OPEN','PUSH']);ap.add_argument('--expected-head',required=True);ap.add_argument('--open-receipt-sha256');a=ap.parse_args()
 need(re.fullmatch('[0-9a-f]{40}',a.expected_head));need(sys.stdin.isatty());safe(BASE);need(BASE.is_dir())
 fd=sys.stdin.fileno();old=termios.tcgetattr(fd);hidden=termios.tcgetattr(fd);hidden[3]&=~termios.ECHO;termios.tcsetattr(fd,termios.TCSADRAIN,hidden)
 try:
  print('READY',flush=True);line=sys.stdin.readline(65537);need(len(line)<=65536 and line.endswith('\n'));c=json.loads(line)
  need(isinstance(c,dict) and (c.get('repo_url') or c.get('remote_url'))==REMOTE)
  for key in ['repo_url','remote_url']:
   if key in c:need(c[key]==REMOTE)
  if 'project_id' in c:need(c['project_id']==PROJECT)
  mode=c.get('auth_mode','http_extra_header');need(mode in ['http_extra_header','work_proxy'])
  e=os.environ.copy()
  for key in list(e):
   if key.startswith('GIT_TRACE') or key in ['GIT_CURL_VERBOSE','GIT_CONFIG_PARAMETERS']:e.pop(key)
  for key in ['GIT_INDEX_FILE','GIT_DIR','GIT_WORK_TREE','GIT_COMMON_DIR','GIT_OBJECT_DIRECTORY','GIT_ALTERNATE_OBJECT_DIRECTORIES']:e.pop(key,None)
  e['GIT_TERMINAL_PROMPT']='0';e['GIT_OPTIONAL_LOCKS']='0'
  settings=[('gc.auto','0'),('maintenance.auto','false'),('credential.helper','')]
  if mode=='work_proxy':need(not c.get('token') and not c.get('http_extra_header'))
  else:
   header=c.get('http_extra_header')
   if not header:
    token=c.get('token');need(isinstance(token,str) and bool(token));user=c.get('username')
    need(user is None or isinstance(user,str))
    header='Authorization: Basic '+base64.b64encode((user+':'+token).encode()).decode() if user else 'Authorization: Bearer '+token
   need(isinstance(header,str) and header.lower().startswith('authorization:') and '\n' not in header and '\r' not in header and '\0' not in header)
   settings.append(('http.'+REMOTE+'.extraHeader',header))
  n=int(e.get('GIT_CONFIG_COUNT','0'))
  for i,(key,value) in enumerate(settings):e['GIT_CONFIG_KEY_'+str(n+i)]=key;e['GIT_CONFIG_VALUE_'+str(n+i)]=value
  e['GIT_CONFIG_COUNT']=str(n+len(settings))
  # Proxy, CA and TLS variables/settings are inherited unchanged. No credentials persist.
  if a.action=='OPEN':
   need(not os.path.lexists(DEST) and not os.path.lexists(RECEIPT))
   git(['clone','--depth','1','--single-branch','--branch','main','--',REMOTE,str(DEST)],e,BASE)
   config_ok(e);head=git(['rev-parse','HEAD'],e).decode().strip();need(head==a.expected_head)
   need(not git(['status','--porcelain=v1','--untracked-files=all'],e).strip());tree=sealed_tree()
   r={'state':'OPENED_ONLY','project_id':PROJECT,'remote':REMOTE,'head':head,'branch':'main','protectedTree':tree,'publicChecks':0,'publish':False,'push':False}
   with RECEIPT.open('x') as f:json.dump(r,f,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
   print(json.dumps({'action':'OPEN','head':head,'project_id':PROJECT,'protectedFiles':len(tree),'receipt':str(RECEIPT),'receiptSHA256':sha(RECEIPT.read_bytes()),'publicChecks':0,'publish':False,'push':False}),flush=True)
  else:
   config_ok(e);safe(RECEIPT);need(RECEIPT.is_file());rb=RECEIPT.read_bytes();need(a.open_receipt_sha256 and sha(rb)==a.open_receipt_sha256);r=json.loads(rb)
   need(r['state']=='OPENED_ONLY' and r['project_id']==PROJECT and r['remote']==REMOTE and r['branch']=='main')
   need(sealed_tree()==r['protectedTree']);need(not git(['status','--porcelain=v1','--untracked-files=all'],e).strip())
   head=git(['rev-parse','HEAD'],e).decode().strip();need(head==a.expected_head)
   git(['fetch','--no-tags',REMOTE,'refs/heads/main'],e)
   remote=git(['rev-parse','FETCH_HEAD'],e).decode().strip();git(['merge-base','--is-ancestor','FETCH_HEAD','HEAD'],e)
   need(head!=remote)
   changed=[x.decode() for x in git(['diff','--name-only','-z','FETCH_HEAD','HEAD','--'],e).split(b'\0') if x]
   need(changed and all(x.startswith('private-evidence/') and '..' not in P(x).parts for x in changed))
   changes=git(['diff','--name-status','-z','FETCH_HEAD','HEAD','--'],e).split(b'\0');changes=[x for x in changes if x]
   need(len(changes)==2*len(changed) and all(changes[i]==b'A' for i in range(0,len(changes),2)))
   # Include all commits, forbidding transient hosting/dist changes hidden by a later revert.
   history=git(['log','--format=','--name-only','-z','FETCH_HEAD..HEAD','--'],e)
   paths=[x.decode().strip('\n') for x in history.split(b'\0') if x.strip(b'\n')]
   need(paths and all(x.startswith('private-evidence/') and '..' not in P(x).parts for x in paths))
   for rel in changed:
    p=DEST/rel
    if os.path.lexists(p):safe(p);need(p.is_file())
   need(git(['rev-parse','HEAD'],e).decode().strip()==head and sealed_tree()==r['protectedTree'])
   git(['push',REMOTE,head+':refs/heads/main'],e)
   print(json.dumps({'action':'PUSH','push':'succeeded','head':head,'priorRemoteHead':remote,'privateEvidencePaths':len(changed),'force':False,'hostingAndDistUnchanged':True,'publicChecks':0,'publish':False}),flush=True)
 except BaseException:
  print('Source Git operation failed; sensitive diagnostics suppressed. No automatic retry or cleanup.',flush=True);raise SystemExit(1)
 finally:termios.tcsetattr(fd,termios.TCSADRAIN,old)
if __name__=='__main__':
 try:main()
 except BaseException:raise SystemExit(1)
