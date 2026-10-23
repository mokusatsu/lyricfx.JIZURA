import os,sys,json,time,tempfile,signal
from pathlib import Path
root='/workspace/avoid008-final-c34';logs=Path(tempfile.mkdtemp(prefix='jizura-native-matrix-diagnose01-',dir='/tmp'));beg=time.time()
pid=os.fork()
if pid==0:
 os.setsid();os.chdir(root)
 stat=Path('/proc/self/stat').read_text();tail=stat[stat.rfind(')')+2:].split();(logs/'preexec.json').write_text(json.dumps({'pid':os.getpid(),'pgid':os.getpgrp(),'startTicks':tail[19],'stat':stat,'cwd':root,'argv':['node','--require','./dev/avoidance/layouts-c-native-command-matrix-perf-gate-support.cjs','dev/avoidance/layouts-c-perf-shadow-native.cjs','--diagnose100','tasks/evidence/AVOID-008/performance/native-command-matrix-diagnose01']},indent=2)+'\n')
 out=os.open(logs/'stdout.log',os.O_WRONLY|os.O_CREAT,0o600);err=os.open(logs/'stderr.log',os.O_WRONLY|os.O_CREAT,0o600);os.dup2(out,1);os.dup2(err,2);os.close(out);os.close(err)
 os.environ['JIZURA_BROWSER']='/usr/bin/chromium';os.execvp('node',['node','--require','./dev/avoidance/layouts-c-native-command-matrix-perf-gate-support.cjs','dev/avoidance/layouts-c-perf-shadow-native.cjs','--diagnose100','tasks/evidence/AVOID-008/performance/native-command-matrix-diagnose01'])
print(json.dumps({'launchedPID':pid,'logs':str(logs)}),flush=True)
timedout=False
while True:
 got,status=os.waitpid(pid,os.WNOHANG)
 if got:break
 if time.time()-beg>330:
  timedout=True
  try:os.killpg(pid,signal.SIGTERM)
  except ProcessLookupError:pass
  got,status=os.waitpid(pid,0);break
 time.sleep(.2)
proc=Path('/proc/'+str(pid));after=None
if proc.exists():
 try:after=(proc/'stat').read_text()
 except FileNotFoundError:pass
record={'pid':pid,'waitpid':got,'kernelWaitStatus':status,'WIFEXITED':os.WIFEXITED(status),'exitCode':os.WEXITSTATUS(status) if os.WIFEXITED(status) else None,'WIFSIGNALED':os.WIFSIGNALED(status),'signal':os.WTERMSIG(status) if os.WIFSIGNALED(status) else None,'supervisorTimeout':timedout,'elapsedSeconds':time.time()-beg,'afterProcStat':after,'reapedByWaitpid':True,'logs':str(logs)}
(logs/'wait.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record),flush=True)
sys.exit(record['exitCode'] if record['exitCode'] is not None else 1)
