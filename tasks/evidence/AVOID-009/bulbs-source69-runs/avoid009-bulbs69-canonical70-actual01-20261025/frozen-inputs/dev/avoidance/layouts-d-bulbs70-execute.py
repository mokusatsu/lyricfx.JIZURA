"""SOURCE70: canonical JAEN/native + unchanged six assertions, one RAM session.
Only two ROOT HTML outputs may move to declared normal-build bytes. Failures
restore their original bytes; every prefix is archived before this session exits.
Browser/Git operations require a parent-reviewed seal and explicit release.
"""
import sys
sys.dont_write_bytecode=True
from pathlib import Path
import argparse,hashlib,importlib.util,json,os,select,shutil,subprocess,tempfile,time,traceback
HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('source70_io',HERE/'layouts_d_bulbs69_runtime.py');M=importlib.util.module_from_spec(spec);spec.loader.exec_module(M)
E=M.ROOT/'tasks/evidence/AVOID-009';R=E/'resume-20261025';C63=E/'billboard-canonical63'
TESTS=['lyric_test.js','lyric_avoid_center_test.cjs','lyric_group_avoidance_test.cjs','lyric_scene_test.cjs','lyric_placement_stability_test.cjs','timeline_boundary_drag_test.cjs']
def before_reuse70(guard,runtime,node):
 receipt=json.loads(M.read(C63/'baseline-after63/baseline63-receipt.json'));results=json.loads(M.read(C63/'baseline-after63/baseline-results.json'));post=json.loads(M.read(C63/'build63/post-pins63.json'));external=json.loads(M.read(E/'balloons-diagnostic03/evidence/baseline-pins03.json'))
 M.need(receipt['exitCode']==0 and receipt['postPinsError'] is None and len(results['results'])==6 and all(r['exitCode']==0 for r in results['results']),'old six assertions not accepted')
 M.need([r['test'] for r in results['results']]==TESTS,'old six assertion set changed')
 for p in receipt['testsUnchanged']:M.need(M.sha(M.read(M.ROOT/p['path']))==p['sha256'],'before6 source changed: '+p['path'])
 prior={p['path']:p for p in post['files']}
 for name,digest in guard.html.items():M.need(prior[name]['sha256']==digest,'before6 HTML mismatch')
 M.need(M.sha(runtime[0].read_bytes())==post['localNode']['sha256'] and M.sha(runtime[2].read_bytes())==receipt['actualBrowser']['sha256'],'before6 Node/browser mismatch')
 matched=[]
 for p in external['runtimeExternalPins']:
  b=Path(p['path']).read_bytes();M.need(len(b)==p['bytes'] and M.sha(b)==p['sha256'],'before6 runtime dependency mismatch: '+p['path']);matched.append({k:p[k] for k in ['path','bytes','sha256']})
 M.need(M.node_dependency(node)['nodeVersion']==results['node'],'before6 Node version mismatch')
 return {'reusedNotRerun':True,'scope':'old ROOT HTML two hashes + same six assertions/util/planner/browser/runtime; after6 remains fresh','references':[{'path':str(p.relative_to(M.ROOT)),'sha256':M.sha(M.read(p))} for p in [C63/'baseline-after63/baseline63-receipt.json',C63/'baseline-after63/baseline-results.json',C63/'build63/post-pins63.json',E/'balloons-diagnostic03/evidence/baseline-pins03.json']],'oldHTML':dict(guard.html),'tests':receipt['testsUnchanged'],'matchedRuntimePins':matched}
def install_html70(guard,targets):
 """Replace only declared two files; expected hashes move with each replacement."""
 M.need(set(targets)=={'index.html','en/index.html'},'only canonical two HTML outputs')
 for name,data in targets.items():
  guard.check();dest=M.ROOT/name;M.need(shutil.disk_usage(dest.parent).free>len(data)+1048576,'insufficient workspace for atomic HTML transition')
  fd,tmp=tempfile.mkstemp(prefix='.bulbs70-',suffix='.tmp',dir=dest.parent)
  try:
   os.fchmod(fd,dest.stat().st_mode&0o777)
   with os.fdopen(fd,'wb') as f:f.write(data);f.flush();os.fsync(f.fileno())
   M.need(Path(tmp).read_bytes()==data,'HTML temporary bytes differ');os.replace(tmp,dest);guard.html[name]=M.sha(data);guard.check()
  finally:
   if os.path.exists(tmp):os.unlink(tmp)
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--prepare-seal');ap.add_argument('--reviewed-seal');ap.add_argument('--run-id');ap.add_argument('--expected-head',required=True);ap.add_argument('--expected-index',required=True);ap.add_argument('--node',required=True);ap.add_argument('--browser-launcher',required=True);ap.add_argument('--browser-engine',required=True);a=ap.parse_args();runtime=[Path(a.node),Path(a.browser_launcher),Path(a.browser_engine)]
 for p in runtime:M.need(p.is_absolute() and p.is_file(),'absolute existing runtime')
 guard=M.RootGuard(a.expected_head,a.expected_index);original={n:M.read(M.ROOT/n) for n in guard.html};initial=dict(guard.html)
 base_inputs=M.input_paths();extra=[*HERE.glob('*bulbs70*'),*(M.ROOT/'dev'/n for n in TESTS),HERE/'baseline.py',E/'bulbs-transport51/source51/runner/exercise51.js',E/'bulbs-transport51/source51/runner/specs51.cjs',E/'bulbs-canonical53/source53/runner/oracle53.cjs',C63/'baseline-after63/baseline63-receipt.json',C63/'baseline-after63/baseline-results.json',C63/'build63/post-pins63.json',E/'balloons-diagnostic03/evidence/baseline-pins03.json',R/'parent-canonical-review70.py'];paths=sorted(set(base_inputs+extra));M.input_paths=lambda:paths
 def seal_now():return {'kind':'SOURCE70_CANONICAL_REVIEW_SEAL','mode':'canonical-JAEN-native70','root':guard.summary(),'baselineHTMLRef':'4a76100c63b3a8b55c7c12ad9e98656ba37f9599','files':[{'path':str(p.relative_to(M.ROOT)),'bytes':len(M.read(p)),'sha256':M.sha(M.read(p))} for p in paths],'runtime':[{'path':str(p),'bytes':p.stat().st_size,'sha256':M.sha(p.read_bytes())} for p in runtime],'resolvedNodeDependency':M.node_dependency(a.node),'before6Reuse':before_reuse70(guard,runtime,a.node),'publicChecks':0}
 if a.prepare_seal:
  M.need(not a.reviewed_seal and not a.run_id,'prepare only');M.write_json(a.prepare_seal,seal_now());guard.check();print(json.dumps({'seal':a.prepare_seal,'browserExecuted':False,'buildExecuted':False}));return
 M.need(a.reviewed_seal and a.run_id and a.run_id.isascii() and all(c.isalnum() or c in '-_' for c in a.run_id),'fresh safe run-id and seal required');M.need(os.environ.get('BULBS70_EXECUTE_RELEASE')=='PARENT_REVIEWED_CANONICAL70_BUILD_RUN_PERSIST','parent release missing');review=json.loads(M.read(a.reviewed_seal));M.need(review==seal_now(),'source/runtime seal changed')
 run=Path('/dev/shm')/('avoid009-bulbs69-canonical70-'+a.run_id);M.need(not run.exists(),'fresh RAM run required');run.mkdir();(run/'tmp').mkdir();(run/'reviewed-seal.json').write_bytes(M.read(a.reviewed_seal));M.write_json(run/'run-start.json',{'ROOT':guard.summary(),'before6Reuse':review['before6Reuse'],'publicChecks':0});guard.env['TMPDIR']=str(run/'tmp');rows=None;env=os.environ.copy();env.update(TMPDIR=str(run/'tmp'),PYTHONDONTWRITEBYTECODE='1',PATH=str(runtime[0].parent)+os.pathsep+env.get('PATH',''),JIZURA_BROWSER=str(runtime[2]),BULBS70_RELEASE='PARENT_REVIEWED_CANONICAL70_LOCAL_ONLY');producer_return=None;producer_ok=False;error=None;parent_pass=False
 def child(command,stdout,stderr):
  with stdout.open('xb') as out,stderr.open('xb') as err:
   p=subprocess.Popen(command,cwd=M.ROOT,env=env,stdout=out,stderr=err);last=0
   try:
    while p.poll() is None:
     if time.monotonic()-last>=30:print('SOURCE70_CHILD_RUNNING '+json.dumps({'pid':p.pid,'command':command[:3]}),flush=True);last=time.monotonic()
     time.sleep(1)
    return p.returncode
   finally:
    if p.poll() is None:p.terminate();p.wait(timeout=30)
 try:
  rows=M.freeze_inputs(run,runtime);M.need([{k:r[k] for k in ['path','bytes','sha256']} for r in rows]==review['files'],'frozen input mismatch');build=M.ram_build(run,guard,review['baselineHTMLRef']);command=[a.node,str(HERE/'layouts-d-bulbs70-canonical.cjs'),'--build-dir',str(build),'--output-dir',str(run/'raw'),'--browser-path',a.browser_launcher];M.write_json(run/'producer-command.json',{'argv':command,'localOnly':True});producer_return=child(command,run/'producer.stdout.txt',run/'producer.stderr.txt');summary=M.producer_summary(run,producer_return);M.write_json(run/'producer-summary.json',summary);print('SOURCE70_PRODUCER_SUMMARY '+json.dumps(summary),flush=True);M.write_json(R/('producer70-summary-'+a.run_id+'.json'),summary);M.need(summary['producerPassed'],'canonical producer failed');M.check_inputs(rows);guard.check()
  outputs={'index.html':M.read(build/'candidate-ja.html'),'en/index.html':M.read(build/'candidate-en/index.html')};guard.html_transition={'initial':initial,'declaredNormalBuild':{n:M.sha(b) for n,b in outputs.items()},'final':dict(guard.html),'state':'installing-normal-build'};install_html70(guard,outputs);guard.html_transition.update(final=dict(guard.html),state='normal-build-installed')
  basic=run/'raw/baseline6';basic.mkdir();code=child([sys.executable,'-B',str(HERE/'baseline.py'),'--out',str(basic)],basic/'controller.stdout.txt',basic/'controller.stderr.txt');M.write_json(basic/'controller-result.json',{'returnCode':code,'unmodifiedBaselineScript':True});baseline=json.loads(M.read(basic/'baseline-results.json'));M.write_json(run/'raw/html-transition.json',guard.html_transition);M.need(code==0 and len(baseline['results'])==6 and all(r['exitCode']==0 for r in baseline['results']),'after6 failed');M.check_inputs(rows);guard.check()
  for pin in review['before6Reuse']['matchedRuntimePins']:
   b=Path(pin['path']).read_bytes();M.need(len(b)==pin['bytes'] and M.sha(b)==pin['sha256'],'runtime dependency changed during canonical run')
  producer_ok=True
 except BaseException as e:
  error={'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()};M.write_json(run/'orchestrator-failure.json',error)
 # Review failed prefixes too, before any rollback/archive and without fetching.
 parent_execution={'returnCode':None,'producerStagePassed':producer_ok,'error':None}
 try:
  if rows is not None:M.check_inputs(rows)
  guard.check();(run/'raw').mkdir(exist_ok=True);checker=R/'parent-local-review69.py';code=child([sys.executable,'-B',str(checker),str(run/'raw'),str(run/'parent-local-review.json')],run/'parent-local-review.stdout.txt',run/'parent-local-review.stderr.txt');parent_execution['returnCode']=code;report=json.loads(M.read(run/'parent-local-review.json'));print('SOURCE70_PARENT_LOCAL_REVIEW_JSON '+json.dumps(report),flush=True);M.need(code==0,'parent canonical raw review failed');parent_pass=True
 except BaseException as e:
  failure={'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()};parent_execution['error']=failure;error=error or failure
 finally:
  M.write_json(run/'parent-local-review-execution.json',parent_execution)
  try:
   if not producer_ok or not parent_pass:
    if guard.html!=initial:install_html70(guard,original)
   if hasattr(guard,'html_transition'):guard.html_transition.update(final=dict(guard.html),state='normal-build-kept' if producer_ok and parent_pass else 'rolled-back-to-original');M.write_json(run/'raw/html-transition-final.json',guard.html_transition)
   if rows is not None:M.check_inputs(rows)
   guard.check()
  except BaseException as e:
   failure={'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()};M.write_json(run/'raw/final-guard-error.json',failure);error=error or failure
  M.write_json(run/'producer-result.json',{'returnCode':producer_return,'producerComplete':producer_ok,'parentPassed':parent_pass,'orchestratorError':error,'htmlTransition':getattr(guard,'html_transition',None),'publicChecks':0})
 # Success and failures use the already reviewed isolated-Git archiver; ROOT Git
 # is read-only and runtime binaries remain hashes. No remote readback follows push.
 attempt=0;receipt=None;stdin_open=True
 while receipt is None:
  attempt+=1
  try:receipt=M.archive_raw69(run,guard,'archive/avoid009-bulbs69-canonical70-'+a.run_id+'-attempt'+str(attempt),attempt,R/('raw70-push-'+a.run_id+'-'+str(attempt)+'.json'))
  except BaseException as e:
   failure={'type':type(e).__name__,'message':str(e),'RAM':str(run),'rawPersisted':False};M.write_json(run/('persistence-failure-'+str(attempt)+'.json'),failure);print('SOURCE70_RAW_NOT_DURABLE_KEEPER '+json.dumps(failure),flush=True)
   while True:
    try:
     if stdin_open:
      ready,_,_=select.select([sys.stdin],[],[],30)
      if ready:
       answer=sys.stdin.readline()
       if answer=='':stdin_open=False
       elif answer.strip()=='retry':break
       elif answer.strip()=='stop-unsaved':M.write_json(R/('raw70-UNSAVED-'+a.run_id+'.json'),failure);raise SystemExit(2)
     else:time.sleep(30)
     print('SOURCE70_KEEPER_RETAINS_RAM',flush=True)
    except KeyboardInterrupt:print('SOURCE70_KEEPER_RETAINS_RAM: retry or stop-unsaved required',flush=True)
 print(json.dumps({'producerPassed':producer_ok,'parentPassed':parent_pass,'error':error,'archive':receipt,'htmlTransition':getattr(guard,'html_transition',None),'publicChecks':0}),flush=True);raise SystemExit(0 if producer_ok and parent_pass and error is None else 1)
if __name__=='__main__':main()
