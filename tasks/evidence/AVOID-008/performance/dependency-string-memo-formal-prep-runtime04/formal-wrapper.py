from pathlib import Path
import os, subprocess, json, time, hashlib
root=Path('/workspace/avoid008-final-c34')
out=Path('/tmp/avoid008-dependency-string-formal01-execution')
out.mkdir(exist_ok=False)
def scan():
 jobs=[]; zombies=[]
 for p in Path('/proc').iterdir():
  if not p.name.isdigit(): continue
  try:
   stat=(p/'stat').read_text(); tail=stat[stat.rfind(')')+2:].split(); comm=(p/'comm').read_text().strip(); args=(p/'cmdline').read_bytes().split(b'\0'); args=[a.decode(errors='replace') for a in args if a]
   import re
   if comm in ['chromium','ffmpeg'] or comm in ['node','MainThread'] and any(re.search(r'(?:^|/)(dev|mcp)/.*(?:test|perf|profile|preview|capture).*\.(cjs|mjs|js)$',a) for a in args):
    row=dict(pid=int(p.name),ppid=int(tail[1]),state=tail[0],comm=comm,args=args,startTicks=tail[19]); (zombies if tail[0]=='Z' else jobs).append(row)
  except (FileNotFoundError,ProcessLookupError,PermissionError): pass
 return dict(jobs=jobs,zombies=zombies)
record={'before':scan(),'startedUTC':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()}
assert not record['before']['jobs'], record['before']['jobs']
assert os.statvfs(root).f_bavail*os.statvfs(root).f_frsize >=250*1024*1024
cmd=['node','--require','./dev/avoidance/layouts-c-dependency-string-memo-formal-gate-support.cjs','dev/avoidance/layouts-c-perf-shadow-native.cjs','--formal','tasks/evidence/AVOID-008/performance/dependency-string-memo-formal01','tasks/evidence/AVOID-008/performance/dependency-string-memo-formal01-parent-gate.json']
env=dict(os.environ); env['JIZURA_BROWSER']='/usr/bin/chromium'
with (out/'stdout.log').open('wb') as log:
 proc=subprocess.Popen(cmd,cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT)
 stat=Path(f'/proc/{proc.pid}/stat').read_text(); tail=stat[stat.rfind(')')+2:].split()
 record.update(runnerPID=proc.pid,runnerStartTicks=tail[19],command=cmd,parentPythonPID=os.getpid())
 (out/'launch.json').write_text(json.dumps(record,indent=2)+'\n')
 try: code=proc.wait(timeout=1830)
 except subprocess.TimeoutExpired:
  record['outerTimeout']=True; proc.terminate(); code=proc.wait(timeout=20)
 record.update(kernelExitCode=code,reaped=True,runnerGone=not Path(f'/proc/{proc.pid}').exists(),after=scan(),finishedUTC=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()))
 record['diskAvailableBytes']=os.statvfs(root).f_bavail*os.statvfs(root).f_frsize
 (out/'execution.json').write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps({k:record[k] for k in ['runnerPID','runnerStartTicks','kernelExitCode','reaped','runnerGone','diskAvailableBytes']}))
print((out/'stdout.log').read_text())
