"""Per-job Linux process ownership and pidfd cleanup; never signals foreign groups."""
from pathlib import Path
import os,json,time,signal,subprocess,threading,uuid,ctypes,errno

def identity(pid):
 try:
  fields=Path('/proc',str(pid),'stat').read_text().rpartition(')')[2].strip().split()
  return {'pid':int(pid),'startTicks':fields[19],'ppid':int(fields[1]),'pgid':int(fields[2]),'session':int(fields[3]),'state':fields[0]}
 except (OSError,ValueError,IndexError):return None

def snapshot():
 rows={}
 for p in Path('/proc').iterdir():
  if p.name.isdigit():
   row=identity(p.name)
   if row:rows[row['pid']]=row
 return rows

def key(row):return (row['pid'],row['startTicks'])

def become_subreaper():
 libc=ctypes.CDLL(None,use_errno=True)
 if libc.prctl(36,1,0,0,0)!=0:raise OSError(ctypes.get_errno(),'PR_SET_CHILD_SUBREAPER failed')

class JobProcesses:
 def __init__(self,folder):
  if not hasattr(os,'pidfd_open')or not hasattr(signal,'pidfd_send_signal')or not hasattr(os,'P_PIDFD'):raise RuntimeError('Linux pidfd required; unsafe PID/group fallback prohibited')
  become_subreaper();self.folder=Path(folder);self.token=uuid.uuid4().hex;self.registry=self.folder/'spawn-registry.jsonl';self.before={key(x)for x in snapshot().values()};self.owned={};self.fds={};self.root=None;self.proc=None;self.actions=[];self.reaped=[];self.errors=[];self.stop=threading.Event();self.lock=threading.RLock();self.thread=None
 def add(self,row,proof):
  k=key(row)
  if k in self.before or k in self.owned:return
  try:
   fd=os.pidfd_open(row['pid'],0);current=identity(row['pid'])
   if not current or key(current)!=k:os.close(fd);return
  except OSError as e:
   if e.errno!=errno.ESRCH:self.errors.append({'operation':'pidfd_open','pid':row['pid'],'errno':e.errno})
   return
  self.owned[k]={'identity':row,'proof':proof};self.fds[k]=fd
 def token_matches(self,pid):
  try:return ('JIZURA_CORE_JOB_TOKEN='+self.token).encode()in Path('/proc',str(pid),'environ').read_bytes().split(b'\0')
  except OSError:return False
 def observe(self):
  with self.lock:
   rows=snapshot()
   if self.registry.exists():
    for line in self.registry.read_text().splitlines():
     try:r=json.loads(line)
     except json.JSONDecodeError:continue
     parent=r.get('parent');child=r.get('child')
     if r.get('token')!=self.token or not parent or not child or not self.root or key(parent)!=key(self.root):continue
     current=rows.get(child['pid'])
     if current and key(current)==key(child)and child['ppid']==parent['pid']:self.add(current,'Node spawn registry with root PID/start identity')
   # Descendants require the currently matching parent identity, never PID alone.
   for _ in range(4):
    changed=False
    for row in rows.values():
     if key(row)in self.before or key(row)in self.owned:continue
     parent=rows.get(row['ppid'])
     if parent and key(parent)in self.owned:self.add(row,'Observed descendant of live owned PID/start identity');changed=True
    if not changed:break
   # Detached/reparented grandchildren retain a unique job token. Only newly born
   # processes are considered, and no pre-existing process can be adopted.
   if self.root:
    for row in rows.values():
     if key(row)not in self.before and key(row)not in self.owned and int(row['startTicks'])>=int(self.root['startTicks'])and self.token_matches(row['pid']):self.add(row,'Exact unique inherited job token plus start identity')
 def attach(self,proc):
  self.proc=proc;self.root=identity(proc.pid)
  if not self.root:raise RuntimeError('Root process identity unavailable')
  self.add(self.root,'Direct Popen child with PID/start identity');self.observe()
  def monitor():
   while not self.stop.wait(.04):
    try:self.observe()
    except Exception as e:self.errors.append({'operation':'observe','error':repr(e)})
  self.thread=threading.Thread(target=monitor,daemon=True);self.thread.start()
 def reap(self):
  for k in list(self.owned):
   if self.root and k==key(self.root):continue
   try:
    status=os.waitid(os.P_PIDFD,self.fds[k],os.WEXITED|os.WNOHANG)
    if status:self.reaped.append({'pid':status.si_pid,'startTicks':k[1],'waitCode':status.si_code,'waitStatus':status.si_status})
   except ChildProcessError:pass
  if self.proc:self.proc.poll() # Popen retains ownership of its own wait status.
 def survivors(self):
  result=[]
  for k,record in self.owned.items():
   current=identity(k[0])
   if current and key(current)==k:result.append(current)
  return result
 def cleanup(self):
  began=time.monotonic();sent=set();stable=0
  try:
   while time.monotonic()-began<2.5:
    self.observe();self.reap();rows=self.survivors();phase=signal.SIGTERM if time.monotonic()-began<.18 else signal.SIGKILL
    for row in rows:
     k=key(row);mark=(k,int(phase))
     if row['state']=='Z'or mark in sent:continue
     # pidfd is pinned to the checked process, so PID reuse cannot redirect a signal.
     current=identity(row['pid'])
     if not current or key(current)!=k:continue
     try:signal.pidfd_send_signal(self.fds[k],phase,None,0);self.actions.append({'identity':current,'signal':int(phase),'method':'pidfd_send_signal'});sent.add(mark)
     except ProcessLookupError:pass
     except OSError as e:self.errors.append({'operation':'pidfd_send_signal','pid':row['pid'],'errno':e.errno})
    self.reap();rows=self.survivors();stable=stable+1 if not rows else 0
    if stable>=2:break
    time.sleep(.025)
  finally:
   self.stop.set()
   if self.thread:self.thread.join(timeout=.5)
   with self.lock:
    self.observe();self.reap();remaining=self.survivors()
    for fd in self.fds.values():os.close(fd)
   receipt={'token':self.token,'root':self.root,'preexistingIdentityCount':len(self.before),'owned':[v for v in self.owned.values()],'actions':self.actions,'reapedAdoptedChildren':self.reaped,'remainingOwnedIdentities':remaining,'errors':self.errors,'complete':not remaining and not self.errors,'seconds':time.monotonic()-began,'policy':'No killpg and no PID-only signal. Direct spawn/descendant/unique-token ownership plus start identity; signal uses pinned pidfd. Python process subreaper reaps only owned adopted children.'}
   (self.folder/'cleanup.json').write_text(json.dumps(receipt,indent=2)+'\n')
  return receipt

def execute_process(cmd,*,cwd,env,folder,timeout=240,after_launch=None):
 folder=Path(folder);tracker=JobProcesses(folder);proc=None;code=97;error=None;start=time.monotonic()
 childenv={**env,'JIZURA_CORE_JOB_TOKEN':tracker.token,'JIZURA_CORE_SPAWN_REGISTRY':str(tracker.registry),'JIZURA_CORE_JOB_DIR':str(folder)}
 with (folder/'stdout-stderr.log').open('wb')as output:
  try:
   proc=subprocess.Popen(cmd,cwd=cwd,env=childenv,stdout=output,stderr=subprocess.STDOUT,start_new_session=True);tracker.attach(proc)
   if after_launch:after_launch(proc)
   try:code=proc.wait(timeout=max(0,timeout-(time.monotonic()-start)))
   except subprocess.TimeoutExpired:code=124;error='TIMEOUT'+str(timeout)+'s'
  except Exception as e:error=type(e).__name__+': '+str(e)
  finally:cleanup=tracker.cleanup()
 if not cleanup['complete']:error=(error+'; 'if error else'')+'OWNED_PROCESS_CLEANUP_INCOMPLETE';code=code or 98
 return {'exitCode':code,'runnerError':error,'cleanup':cleanup,'seconds':time.monotonic()-start}
