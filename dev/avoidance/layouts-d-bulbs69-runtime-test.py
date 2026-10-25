"""SOURCE69 I/O pure checks: no normal build, browser, Git write or network."""
import sys
sys.dont_write_bytecode=True
from pathlib import Path
import argparse,importlib.util,json,tempfile
HERE=Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('source69_io',HERE/'layouts_d_bulbs69_runtime.py');M=importlib.util.module_from_spec(s);s.loader.exec_module(M)
checks=0
def check(v):
 global checks
 assert v;checks+=1
# Guard reads existing state only, preserving all7 dirty bytecode baselines.
parser=argparse.ArgumentParser();parser.add_argument('--expected-head',required=True);parser.add_argument('--expected-index',required=True);expected=parser.parse_args()
g=M.RootGuard(expected.expected_head,expected.expected_index);g.check();check(len(g.skips)==65 and all(not p.exists() for p in g.skips));check(len(g.pycs)==7)
old={k:sys.modules.get(k) for k in ['app','app.english']}
try:
 module=M.fresh_english();check(module.__cached__ is None);check(module.localize_js.__code__.co_filename==str(M.ROOT/'app/english.py'));check(module.localize_js('const x=1;','src/example.js')=='const x=1;')
finally:
 for k,v in old.items():
  if v is None:sys.modules.pop(k,None)
  else:sys.modules[k]=v
g.check();check(True)
with tempfile.TemporaryDirectory(prefix='source69-synthetic-',dir='/dev/shm') as name:
 base=Path(name)
 for folder in ['raw','build','frozen-inputs/src','tmp/profile','private-git/1']: (base/folder).mkdir(parents=True,exist_ok=True)
 inputs={'raw/partial.json.gz':b'failed-producer-prefix','build/candidate-ja.html':b'partial-build','frozen-inputs/src/test.js':b'const a=1;','run-start.json':b'{}','producer.stdout.txt':b'full literal log','producer-summary.json':b'full producer summary'}
 for rel,data in inputs.items():(base/rel).write_bytes(data)
 (base/'tmp/profile/large-cache').write_bytes(b'runtime-only');(base/'private-git/1/config').write_bytes(b'private');(base/'tmp/profile/runtime-symlink').symlink_to('/not-present')
 scope,rows=M.scope_files(base,1);check(set(r['relative'] for r in rows)==set(inputs));check(all((base/r['relative']).read_bytes()==inputs[r['relative']] for r in rows));check(scope.is_file())
 (base/'raw/bad-symlink').symlink_to('/not-present')
 try:M.scope_files(base,2)
 except RuntimeError as e:check('symlink' in str(e))
 else:raise AssertionError('source symlink was accepted')
 (base/'raw/bad-symlink').unlink();scope2,rows2=M.scope_files(base,2);check('archive-input-list-1.json' in {r['relative'] for r in rows2});check(not any('tmp/' in r['relative'] or 'private-git/' in r['relative'] for r in rows2))
 for r in rows2:check(M.sha(M.read(r['source']))==r['sha256'])
 missing=M.producer_summary(base,1);check(not missing['producerPassed'] and missing['manifestReadError'] is not None)
 manifest={'complete':False,'errors':[{'message':'EXPECTED_PRODUCER_FAILURE'}],'records':[{}],'serializedBytes':17,'cases':[{'case':'partial'}]};M.write_json(base/'raw/manifest.json',manifest)
 failed=M.producer_summary(base,1);check(failed['records']==1 and failed['serializedBytes']==17);check(failed['errors']==manifest['errors'] and failed['cases']==manifest['cases'] and not failed['producerPassed'])
 manifest.update(complete=True,errors=[]);(base/'raw/manifest.json').write_text(json.dumps(manifest));check(M.producer_summary(base,0)['producerPassed']);check(not M.producer_summary(base,1)['producerPassed'])
 (base/'raw/manifest.json').write_text('{');check(M.producer_summary(base,0)['manifestReadError'] is not None)
g.check();print(json.dumps({'checks':checks,'status':'PASS','buildExecuted':False,'browserExecuted':False,'GitModified':False,'networkRequests':0}))
