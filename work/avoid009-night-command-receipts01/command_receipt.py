#!/usr/bin/env python3
"""Parent-only, shell-free command receipts. Each actual argv needs parent review."""
import argparse,datetime,hashlib,json,os,pathlib,re,subprocess,sys
ROOT=pathlib.Path('/workspace/lyricfx.JIZURA')
OUT=ROOT/'tasks/evidence/AVOID-009/night-20261024/command-receipts'
def stamp():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def require(x):
 if not x:raise ValueError('invalid receipt request')
def safe_directory():
 for p in [*reversed(OUT.parents),OUT]:require(not p.is_symlink())
 OUT.mkdir(mode=0o700,parents=True,exist_ok=True)
 require(OUT.is_dir())
def publish(path,data):
 # Hard-link publication is atomic and refuses replacement. Only our staging
 # link is removed; START/DONE records and reserved IDs are never removed.
 staging=path.with_name(path.name+'.pending')
 fd=os.open(staging,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 try:
  with os.fdopen(fd,'w',encoding='utf-8') as f:
   json.dump(data,f,sort_keys=True);f.write('\n');f.flush();os.fsync(f.fileno())
  os.link(staging,path,follow_symlinks=False)
  directory=os.open(OUT,os.O_RDONLY|os.O_DIRECTORY)
  try:os.fsync(directory)
  finally:os.close(directory)
 finally:
  # Never discard an unpublished pending record: it documents an interrupted
  # reservation and prevents this ID from being retried blindly.
  if os.path.lexists(path):staging.unlink()
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--receipt-id',required=True);ap.add_argument('--argv-json',required=True);a=ap.parse_args()
 require(re.fullmatch('[A-Za-z0-9][A-Za-z0-9_-]{0,95}',a.receipt_id))
 argv=json.loads(a.argv_json)
 require(isinstance(argv,list) and 1<=len(argv)<=256 and all(isinstance(x,str) and '\0' not in x for x in argv) and bool(argv[0]))
 require(sum(len(x) for x in argv)<=262144)
 safe_directory();start=OUT/(a.receipt_id+'-START.json');done=OUT/(a.receipt_id+'-DONE.json')
 require(all(not os.path.lexists(p) for p in [start,done,start.with_name(start.name+'.pending'),done.with_name(done.name+'.pending')]))
 encoded=json.dumps(argv,ensure_ascii=False,separators=(',',':')).encode('utf-8')
 identity={'receiptId':a.receipt_id,'argvSHA256':hashlib.sha256(encoded).hexdigest(),'argvCount':len(argv),'cwd':os.getcwd(),'wrapperPID':os.getpid()}
 publish(start,{**identity,'event':'START','startedAt':stamp()})
 code=None;launch_error=None
 try:
  # No cwd/env overrides, shell, output capture, timeout, or retry. Stdin/stdout/
  # stderr stream directly between the owned keeper and the child.
  code=subprocess.call(argv,shell=False)
 except OSError as error:
  code=127;launch_error=type(error).__name__ # Never persist error text or argv.
 finally:
  if code is not None:
   result={**identity,'event':'DONE','finishedAt':stamp(),'returnCode':code,'exitCode':code if code>=0 else 128-code,'signal':-code if code<0 else None,'launchErrorType':launch_error}
   publish(done,result)
 return code if code>=0 else 128-code
if __name__=='__main__':
 try:status=main()
 except BaseException:
  # Parsing/receipt-write errors can contain arguments: suppress raw details.
  sys.stderr.write('Command receipt wrapper failed; inspect START/DONE/pending records. No automatic retry.\n');status=125
 raise SystemExit(status)
