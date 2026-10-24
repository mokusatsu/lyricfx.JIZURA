#!/usr/bin/env python3
"""Parent-gated exact five-file Source Git push only; credential via hidden TTY stdin."""
import argparse,base64,hashlib,json,os,pathlib,re,stat,subprocess,sys,termios
P=pathlib.Path;BASE=P('/dev/shm/avoid009-evening-20261024');SOURCE=BASE/'source'
PROJECT='appgprj_6adbafe9f07c8191ab0b404c53caab16'
REMOTE='https://git.chatgpt-team.site/ca6227f0-be34-40d7-9800-d5b531e94bab/'+PROJECT+'.git'
OLD='92c93064cc8b4fe026c683566407711624fdbd38'
REL='dist/review/AVOID-009/tiles-native-20261025-01/'
NAMES=['index.html','en.html','manifest.json','videos/before.mp4','videos/after.mp4']
OPEN=BASE/'tiles-publication01-source-open.json';LOCAL=BASE/'tiles-publication01-local-receipt.json'
GATE=BASE/'tiles-publication01-push-parent-gate.json';OUT=BASE/'tiles-publication01-push-receipt.json'
def need(x):
 if not x:raise RuntimeError('precondition')
def sha(b):return hashlib.sha256(b).hexdigest()
def safe(p):
 for q in [*reversed(p.parents),p]:need(not q.is_symlink())
def read(p):
 safe(p);need(stat.S_ISREG(p.stat().st_mode));return p.read_bytes()
def tree():
 result={}
 for folder in ['dist','.openai']:
  top=SOURCE/folder;safe(top);need(top.is_dir())
  for p in sorted(top.rglob('*')):
   safe(p);s=p.lstat();need(stat.S_ISREG(s.st_mode) or stat.S_ISDIR(s.st_mode))
   if p.is_file():result[str(p.relative_to(SOURCE))]={'bytes':s.st_size,'sha256':sha(p.read_bytes())}
 return result
def main():
 ap=argparse.ArgumentParser(description=__doc__)
 for n in ['expected-head','local-receipt-sha256','open-receipt-sha256','parent-gate-sha256']:ap.add_argument('--'+n,required=True)
 a=ap.parse_args();need(re.fullmatch('[0-9a-f]{40}',a.expected_head))
 for h in [a.local_receipt_sha256,a.open_receipt_sha256,a.parent_gate_sha256]:need(re.fullmatch('[0-9a-f]{64}',h))
 need(os.environ.get('TILES_PUBLICATION01_PUSH_RELEASE')=='PARENT_REVIEWED_EXACT_FIVE_SOURCE_PUSH')
 need(sys.stdin.isatty());safe(BASE);safe(SOURCE);safe(OUT);need(BASE.is_dir() and (SOURCE/'.git').is_dir() and not (SOURCE/'.git').is_symlink() and not OUT.exists())
 phase='GATE_PRECHECK';result=None;push_returned=False;fd=sys.stdin.fileno();original=termios.tcgetattr(fd);hidden=termios.tcgetattr(fd);hidden[3]&=~termios.ECHO
 try:
  gb=read(GATE);need(sha(gb)==a.parent_gate_sha256);g=json.loads(gb)
  need(g.get('pushExactFiveAccepted') is True and g.get('humanMotionReview')=='PENDING')
  need(g.get('pushScriptSHA256')==sha(read(P(__file__).resolve())))
  need(g.get('expectedSourceOldHEAD')==OLD and g.get('expectedSourceNewHEAD')==a.expected_head)
  need(g.get('localReceiptSHA256')==a.local_receipt_sha256 and g.get('openReceiptSHA256')==a.open_receipt_sha256)
  lb=read(LOCAL);ob=read(OPEN);need(sha(lb)==a.local_receipt_sha256 and sha(ob)==a.open_receipt_sha256=='9cdc14383c319f27116857042930c0b0f4061b6ea15a902ae62d1f950a5f2fd8')
  local=json.loads(lb);opened=json.loads(ob)
  need(local['state']=='LOCAL_SOURCE_FIVE_FILE_COMMIT_ONLY' and local['project_id']==PROJECT and local['priorHEAD']==OLD and local['head']==a.expected_head)
  need(re.fullmatch('[0-9a-f]{64}',g.get('stageScriptSHA256','')) and local.get('stageScriptSHA256')==g['stageScriptSHA256'])
  need(local['humanMotionReview']=='PENDING' and local['visualReview']=='PASS14-static-only' and local['push'] is False and local['publish'] is False)
  need(opened['state']=='OPENED_ONLY_SOURCE_MANAGEMENT_NO_PUBLIC_CHECK' and opened['project_id']==PROJECT and opened['remote']==REMOTE and opened['branch']=='main' and opened['head']==OLD)
  oldtree=opened['protectedTree'];added=local['fiveFiles'];need(set(added)=={REL+n for n in NAMES})
  need(len(oldtree)==opened['protectedTotal']==106 and sum(k.startswith('dist/') for k in oldtree)==opened['protectedDist']==105)
  expected={**oldtree,**added};need(len(expected)==111 and local['expectedProtectedTree']==expected and tree()==expected)
  e=os.environ.copy()
  for k in list(e):
   if k.startswith('GIT_TRACE') or k in ['GIT_CURL_VERBOSE','GIT_DIR','GIT_WORK_TREE','GIT_INDEX_FILE','GIT_COMMON_DIR','GIT_OBJECT_DIRECTORY','GIT_ALTERNATE_OBJECT_DIRECTORIES']:e.pop(k,None)
  e['GIT_TERMINAL_PROMPT']='0';e['GIT_OPTIONAL_LOCKS']='0'
  base_count=int(e.get('GIT_CONFIG_COUNT','0'));need(base_count>=0)
  # Proxy/CA/TLS environment remains inherited and unchanged; no secret files.
  settings=[('gc.auto','0'),('maintenance.auto','false'),('credential.helper',''),('core.hooksPath','/dev/null'),('http.followRedirects','false'),('fetch.recurseSubmodules','false')]
  def install_settings():
   e['GIT_CONFIG_COUNT']=str(base_count+len(settings))
   for i,(k,v) in enumerate(settings):e['GIT_CONFIG_KEY_'+str(base_count+i)]=k;e['GIT_CONFIG_VALUE_'+str(base_count+i)]=v
  install_settings()
  def git(args):return subprocess.run(['git',*args],cwd=SOURCE,env=e,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE).stdout
  def config():
   need(git(['symbolic-ref','--short','HEAD']).decode().strip()=='main')
   need(git(['config','--get-all','remote.origin.url']).decode().strip()==REMOTE)
   for args in [['config','--get-all','remote.origin.pushurl'],['config','--get-regexp',r'^url\..*\.(insteadof|pushinsteadof)$']]:
    q=subprocess.run(['git',*args],cwd=SOURCE,env=e,stdout=subprocess.PIPE,stderr=subprocess.PIPE);need(q.returncode==1 and not q.stdout)
  def invariant():
   config();need(git(['rev-parse','HEAD']).decode().strip()==a.expected_head)
   need(not git(['status','--porcelain=v1','--untracked-files=all']).strip());need(tree()==expected)
   need(git(['rev-parse','HEAD^']).decode().strip()==OLD);need(git(['rev-list','--parents','-n','1','HEAD']).decode().split()==[a.expected_head,OLD])
   need(git(['rev-list','--count',OLD+'..HEAD']).decode().strip()=='1')
   changes=git(['diff-tree','--no-commit-id','--name-status','-r','-z',OLD,'HEAD']).split(b'\0')
   need(changes==[v.encode() for p in sorted(added) for v in ['A',p]]+[b''])
   # Every original tracked/private blob and file mode survives unchanged.
   oldtracked=git(['ls-tree','-rz',OLD]);newtracked=git(['ls-tree','-rz','HEAD'])
   remaining=b'\0'.join(row for row in newtracked.split(b'\0') if row and row.split(b'\t',1)[1].decode() not in added)+b'\0';need(remaining==oldtracked)
   need(sha(read(LOCAL))==a.local_receipt_sha256 and sha(read(OPEN))==a.open_receipt_sha256)
  phase='LOCAL_EXACT_FIVE_PRECHECK';invariant()
  phase='CREDENTIAL_INPUT';termios.tcsetattr(fd,termios.TCSADRAIN,hidden);print('READY',flush=True)
  line=sys.stdin.readline(65537);need(len(line)<=65536 and line.endswith('\n'));c=json.loads(line)
  need(isinstance(c,dict) and (c.get('repo_url') or c.get('remote_url'))==REMOTE)
  for k in ['repo_url','remote_url']:
   if k in c:need(c[k]==REMOTE)
  if 'project_id' in c:need(c['project_id']==PROJECT)
  need(c.get('auth_mode','http_extra_header')=='http_extra_header')
  need(c.get('publish_on_push_accepted') is False)
  header=c.get('http_extra_header')
  if not header:
   token=c.get('token');user=c.get('username');need(isinstance(token,str) and bool(token) and (user is None or isinstance(user,str)))
   header='Authorization: Basic '+base64.b64encode((user+':'+token).encode()).decode() if user else 'Authorization: Bearer '+token
  need(isinstance(header,str) and header.lower().startswith('authorization:') and not any(t in header for t in ['\n','\r','\0']))
  settings.append(('http.'+REMOTE+'.extraHeader',header));install_settings()
  phase='FETCH_SOURCE_MAIN';git(['fetch','--no-tags','--no-recurse-submodules',REMOTE,'refs/heads/main'])
  need(git(['rev-parse','FETCH_HEAD']).decode().strip()==OLD)
  phase='PRE_PUSH_EXACT_FIVE';invariant()
  phase='PUSH_SOURCE_MAIN';git(['push','--no-recurse-submodules',REMOTE,a.expected_head+':refs/heads/main']);push_returned=True
  # Record command return only; no remote result queries or public verification.
  phase='LOCAL_POST_PUSH';invariant()
  result={'state':'SOURCE_EXACT_FIVE_PUSH_COMMAND_SUCCEEDED','project_id':PROJECT,'priorRemoteHEAD':OLD,'head':a.expected_head,'localReceiptSHA256':a.local_receipt_sha256,'openReceiptSHA256':a.open_receipt_sha256,'parentGateSHA256':a.parent_gate_sha256,'fiveFiles':added,'protectedFiles':111,'fullTrackedPrivateTreePreserved':True,'force':False,'humanMotionReview':'PENDING','publicChecks':0,'publish':False,'publishOnPushAccepted':False}
 except BaseException:
  result={'state':'SOURCE_EXACT_FIVE_PUSH_STOPPED','safeReason':phase,'pushCommandReturnedSuccess':push_returned,'expectedHEAD':a.expected_head,'automaticRetry':False,'publicChecks':0,'publish':False}
 finally:
  termios.tcsetattr(fd,termios.TCSADRAIN,original)
  if result:
   with OUT.open('x') as f:json.dump(result,f,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
   print(json.dumps(result),flush=True)
 if result['state']!='SOURCE_EXACT_FIVE_PUSH_COMMAND_SUCCEEDED':raise SystemExit(1)
if __name__=='__main__':
 try:main()
 except BaseException:
  # Never emit exception objects, subprocess stderr, headers or credential input.
  print('Source push helper stopped; sensitive diagnostics suppressed.',flush=True);raise SystemExit(1)
