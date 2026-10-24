#!/usr/bin/env python3
"""Owned PTY official SHM keeper. No automatic clone/open; parent sequential RUN only."""
import json,os,pathlib,subprocess,sys,termios
BASE=pathlib.Path('/dev/shm/avoid009-evening-20261024')
SHELLS={'sh','bash','dash','zsh','ksh','csh','tcsh','fish','pwsh','powershell','cmd','cmd.exe'}
def need(ok):
 if not ok:raise ValueError('invalid request')
def line(fd):
 b=bytearray()
 while True:
  c=os.read(fd,1)
  if not c:return bytes(b) if b else None
  if c==b'\n':return bytes(b)
  b.extend(c);need(len(b)<=1048576)
def command(r):
 need(isinstance(r,dict) and set(r)=={'action','argv','cwd','envUpdates'} and r['action']=='RUN')
 a=r['argv'];need(isinstance(a,list) and 1<=len(a)<=256 and all(isinstance(x,str) and '\0' not in x for x in a))
 need(a[0] and pathlib.Path(a[0]).name.lower() not in SHELLS)
 # This is an orchestration guard, not a Python/Node sandbox. Parent reviews every RUN.
 need(not any(any(w in x.lower() for w in ['authorization:','bearer ','password=','token=']) for x in a))
 cwd=r['cwd'];need(isinstance(cwd,str) and pathlib.Path(cwd).is_absolute() and pathlib.Path(cwd).is_dir())
 changes=r['envUpdates'];need(isinstance(changes,dict));env=os.environ.copy()
 for k,v in changes.items():
  need(isinstance(k,str) and k and '=' not in k and '\0' not in k)
  need(not any(w in k.upper() for w in ['TOKEN','AUTH','PASSWORD','SECRET','CREDENTIAL']))
  need(v is None or isinstance(v,str) and '\0' not in v and 'authorization:' not in v.lower())
  if v is None:env.pop(k,None)
  else:env[k]=v
 return a,cwd,env
def main():
 need(sys.stdin.isatty());fd=sys.stdin.fileno();old=termios.tcgetattr(fd);hidden=termios.tcgetattr(fd);hidden[3]&=~termios.ECHO;termios.tcsetattr(fd,termios.TCSADRAIN,hidden)
 try:
  need(not BASE.is_symlink());BASE.mkdir(mode=0o700,exist_ok=True);need(BASE.is_dir())
  print(json.dumps({'event':'MANAGER_READY','base':str(BASE),'automaticOpen':False}),flush=True)
  while True:
   raw=line(fd)
   if raw is None:return
   try:
    r=json.loads(raw)
    if r=={'action':'EXIT'}:
     print('{"event":"MANAGER_EXIT"}',flush=True);return
    a,cwd,env=command(r)
   except (ValueError,TypeError,OSError,KeyError):
    print('{"event":"COMMAND_REFUSED"}',flush=True);continue
   try:
    p=subprocess.run(a,cwd=cwd,env=env,shell=False)
    print(json.dumps({'event':'RUN_DONE','exitCode':p.returncode}),flush=True)
   except OSError:print('{"event":"RUN_START_FAILED"}',flush=True)
 finally:termios.tcsetattr(fd,termios.TCSADRAIN,old)
if __name__=='__main__':main()

