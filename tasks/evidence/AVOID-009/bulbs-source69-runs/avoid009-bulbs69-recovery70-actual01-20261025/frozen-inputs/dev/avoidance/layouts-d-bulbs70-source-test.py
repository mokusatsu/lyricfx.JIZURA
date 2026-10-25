"""Pure canonical guard/HTML transition tests, no ROOT HTML writes or browser."""
import sys
sys.dont_write_bytecode=True
from pathlib import Path
import argparse,importlib.util,tempfile
HERE=Path(__file__).resolve().parent;s=importlib.util.spec_from_file_location('source70',HERE/'layouts-d-bulbs70-execute.py');C=importlib.util.module_from_spec(s);s.loader.exec_module(C);M=C.M
ap=argparse.ArgumentParser();ap.add_argument('--expected-head',required=True);ap.add_argument('--expected-index',required=True);a=ap.parse_args();g=M.RootGuard(a.expected_head,a.expected_index);g.check();root=M.ROOT;checks=0
def check(v):
 global checks
 assert v;checks+=1
runtime=[Path('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node'),Path('/usr/bin/chromium'),Path('/usr/lib/chromium/chromium')]
reuse=C.before_reuse70(g,runtime,str(runtime[0]));check(reuse['reusedNotRerun'] and len(reuse['tests'])==10);check(len(reuse['matchedRuntimePins'])==466)
old_read=M.read
try:
 M.read=lambda p:b'changed-test' if Path(p)==root/'dev/lyric_test.js' else old_read(p)
 try:C.before_reuse70(g,runtime,str(runtime[0]))
 except RuntimeError as e:check('before6 source changed' in str(e))
 else:raise AssertionError('changed assertion unexpectedly reused')
finally:M.read=old_read
with tempfile.TemporaryDirectory(prefix='source70-html-pure-',dir='/dev/shm') as tmp:
 base=Path(tmp);(base/'en').mkdir();original={'index.html':b'old JA','en/index.html':b'old EN'}
 for n,b in original.items():(base/n).write_bytes(b)
 (base/'unrelated').write_bytes(b'keep')
 class Guard:
  html={n:M.sha(b) for n,b in original.items()}
  def check(self):assert all(M.sha((base/n).read_bytes())==v for n,v in self.html.items())
 guard=Guard();M.ROOT=base
 try:
  built={'index.html':b'normal JA bytes','en/index.html':b'normal EN bytes'};C.install_html70(guard,built);check(all((base/n).read_bytes()==b for n,b in built.items()));check(guard.html=={n:M.sha(b) for n,b in built.items()});check((base/'unrelated').read_bytes()==b'keep')
  try:C.install_html70(guard,{'unrelated':b'bad'})
  except RuntimeError as e:check('only canonical two' in str(e))
  else:raise AssertionError('undeclared HTML target allowed')
  C.install_html70(guard,original);check(all((base/n).read_bytes()==b for n,b in original.items()));check(not list(base.rglob('.bulbs70-*.tmp')))
 finally:M.ROOT=root
g.check();print({'status':'PASS','checks':checks,'before6ReferenceMatched':True,'ROOTHTMLWritten':False,'browserExecuted':False,'buildExecuted':False,'GitModified':False})
