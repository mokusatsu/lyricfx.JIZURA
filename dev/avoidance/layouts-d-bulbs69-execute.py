"""SOURCE69 one-session RAM build -> producer -> all-prefix Git persistence.
Default persistence failure keeps this foreground process and its RAM namespace
alive. It is not a detached daemon. Browser execution requires a reviewed seal.
"""
import sys
sys.dont_write_bytecode=True
from pathlib import Path
import argparse,datetime,hashlib,importlib.util,json,os,select,subprocess,tempfile,time,traceback
P=Path;HERE=P(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('bulbs69_runtime',HERE/'layouts_d_bulbs69_runtime.py');M=importlib.util.module_from_spec(spec);spec.loader.exec_module(M)
ap=argparse.ArgumentParser(description=__doc__)
ap.add_argument('--prepare-seal');ap.add_argument('--reviewed-seal');ap.add_argument('--run-id')
ap.add_argument('--focused-boundaries',action='store_true')
ap.add_argument('--expected-head',default='4a76100c63b3a8b55c7c12ad9e98656ba37f9599')
ap.add_argument('--expected-index',default='cbcb5d5fe39c960139c5b25a8d62c66340b7e858b58644a2b1e87930487c8352')
ap.add_argument('--node',required=True);ap.add_argument('--browser-launcher',required=True);ap.add_argument('--browser-engine',required=True)
a=ap.parse_args();runtime=[P(a.node),P(a.browser_launcher),P(a.browser_engine)]
reference_acceptance=M.ROOT/'tasks/evidence/AVOID-009/resume-20261025/parent-actual03-result.json'
reference_seal=M.ROOT/'tasks/evidence/AVOID-009/resume-20261025/parent-reviewed-seal69-actual03.json'
for p in runtime:M.need(p.is_absolute() and p.is_file(),'absolute existing runtime required: '+str(p))
guard=M.RootGuard(a.expected_head,a.expected_index)
def seal_now():
 return {'kind':'SOURCE69_REVIEW_INPUT_SEAL','mode':'focused-ordinary-boundaries' if a.focused_boundaries else 'full-default-and-ordinary-boundaries','root':guard.summary(),'baselineHTMLRef':'4a76100c63b3a8b55c7c12ad9e98656ba37f9599','files':[{'path':str(p.relative_to(M.ROOT)),'bytes':len(M.read(p)),'sha256':M.sha(M.read(p))} for p in M.input_paths()],'runtime':[{'path':str(p),'bytes':p.stat().st_size,'sha256':M.sha(p.read_bytes())} for p in runtime],'resolvedNodeDependency':M.node_dependency(a.node),'publicChecks':0}
if a.prepare_seal:
 M.need(not a.reviewed_seal and not a.run_id,'prepare only');guard.check();M.write_json(P(a.prepare_seal),seal_now());print(json.dumps({'seal':a.prepare_seal,'browserExecuted':False,'buildExecuted':False,'GitModified':False}));sys.exit(0)
M.need(a.reviewed_seal and a.run_id and a.run_id.isascii() and len(a.run_id)<=90 and all(c.isalnum() or c in '-_' for c in a.run_id),'reviewed seal and safe fresh run-id required')
M.need(os.environ.get('BULBS69_EXECUTE_RELEASE')=='PARENT_REVIEWED_BUILD_RUN_PERSIST','parent execution release missing')
review=json.loads(M.read(a.reviewed_seal));M.need(review==seal_now(),'reviewed source/input/runtime seal changed')
run=P('/dev/shm')/('avoid009-bulbs69-'+a.run_id);M.need(not run.exists(),'RAM run-id already exists');run.mkdir();(run/'tmp').mkdir();guard.env['TMPDIR']=str(run/'tmp');(run/'reviewed-seal.json').write_bytes(M.read(a.reviewed_seal))
M.write_json(run/'run-start.json',{'timeUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'ROOT':guard.summary(),'runtime':review['runtime'],'resolvedNodeDependency':review['resolvedNodeDependency'],'sealSHA256':M.sha(M.read(a.reviewed_seal)),'publicChecks':0})
rows=None;producer_return=None;producer=None;run_error=None;producer_ok=False
try:
 rows=M.freeze_inputs(run,runtime);M.need([{k:r[k] for k in ['path','bytes','sha256']} for r in rows]==review['files'],'frozen files do not match reviewed seal');guard.check()
 out=M.ram_build(run,guard,review['baselineHTMLRef']);M.check_inputs(rows);guard.check()
 env=os.environ.copy();env.update(TMPDIR=str(run/'tmp'),PYTHONDONTWRITEBYTECODE='1',BULBS69_RELEASE='PARENT_REVIEWED_SOURCE69_LOCAL_ONLY');env.pop('JIZURA_BROWSER',None)
 command=[a.node,str(HERE/'layouts-d-bulbs69-runner.cjs'),'--candidate-html',str(out/'candidate-ja.html'),'--baseline-html',str(out/'baseline-ja.html'),'--output-dir',str(run/'raw'),'--browser-path',a.browser_launcher]
 if a.focused_boundaries:command+=['--focused-boundaries','--reference-acceptance',str(reference_acceptance),'--reference-seal',str(reference_seal)]
 M.write_json(run/'producer-command.json',{'argv':command,'browserEngineSHA256':review['runtime'][2]['sha256'],'localOnly':True,'publicChecks':0})
 print('SOURCE69_LOCAL_PRODUCER_START '+str(run),flush=True)
 with (run/'producer.stdout.txt').open('xb') as stdout,(run/'producer.stderr.txt').open('xb') as stderr:
  producer=subprocess.Popen(command,cwd=M.ROOT,env=env,stdout=stdout,stderr=stderr)
  last=0
  while producer.poll() is None:
   if time.monotonic()-last>=30:
    status={'pid':producer.pid,'RAM':str(run),'rawPersisted':False}
    p=run/'raw/manifest.json'
    if p.exists():
     try:
      d=json.loads(p.read_text());status.update(phase=d.get('phase'),records=len(d.get('records',[])),serializedBytes=d.get('serializedBytes'))
     except (OSError,ValueError):status['manifestRead']='writing'
    print('SOURCE69_LOCAL_STATUS '+json.dumps(status),flush=True);last=time.monotonic()
   time.sleep(1)
  producer_return=producer.returncode
 manifest=json.loads(M.read(run/'raw/manifest.json'));producer_ok=producer_return==0 and manifest.get('complete') is True and not manifest.get('errors');M.check_inputs(rows);guard.check()
except BaseException as e:
 run_error={'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()}
 if producer is not None and producer.poll() is None:producer.terminate();producer.wait(timeout=30);producer_return=producer.returncode
 M.write_json(run/'orchestrator-failure.json',run_error)
finally:
 M.write_json(run/'producer-result.json',{'returnCode':producer_return,'producerComplete':producer_ok,'orchestratorError':run_error,'rawPersisted':False,'notProductAcceptance':True})
# Parent-authored independent raw checker runs in this same RAM namespace,
# after producer termination and before any archive/push, including failures.
checker_rel='tasks/evidence/AVOID-009/resume-20261025/parent-local-review69.py';checker=M.ROOT/checker_rel
parent_review={'passed':False,'returnCode':None,'error':None};review_process=None
try:
 checker_pin=next(r for r in review['files'] if r['path']==checker_rel);M.need(M.sha(M.read(checker))==checker_pin['sha256'],'parent checker source changed');M.check_inputs(review['files']);guard.check()
 command=[sys.executable,'-B',str(checker),str(run/'raw'),str(run/'parent-local-review.json')];parent_review['argv']=command;parent_review['checkerSHA256']=checker_pin['sha256']
 env=os.environ.copy();env.update(TMPDIR=str(run/'tmp'),PYTHONDONTWRITEBYTECODE='1')
 print('SOURCE69_PARENT_LOCAL_REVIEW_START '+str(run/'raw'),flush=True)
 with (run/'parent-local-review.stdout.txt').open('xb') as stdout,(run/'parent-local-review.stderr.txt').open('xb') as stderr:
  review_process=subprocess.Popen(command,cwd=M.ROOT,env=env,stdout=stdout,stderr=stderr);last=0
  while review_process.poll() is None:
   if time.monotonic()-last>=30:print('SOURCE69_PARENT_LOCAL_REVIEW_RUNNING '+str(review_process.pid),flush=True);last=time.monotonic()
   time.sleep(1)
  parent_review['returnCode']=review_process.returncode
 report=run/'parent-local-review.json';M.need(report.is_file(),'parent checker output JSON missing');decoded=json.loads(M.read(report));M.need(isinstance(decoded,dict),'parent checker output must be an object');print('SOURCE69_PARENT_LOCAL_REVIEW_JSON '+json.dumps(decoded,ensure_ascii=False),flush=True);parent_review['summaryPrinted']=True;M.check_inputs(review['files']);guard.check()
 parent_review['passed']=review_process.returncode==0;parent_review['outputSHA256']=M.sha(M.read(report));parent_review['outputBytes']=report.stat().st_size
except BaseException as e:
 if review_process is not None and review_process.poll() is None:review_process.terminate();review_process.wait(timeout=30);parent_review['returnCode']=review_process.returncode
 parent_review['error']={'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()};parent_review['passed']=False
finally:M.write_json(run/'parent-local-review-execution.json',parent_review)
# All build output, raw prefix, failure logs, manifests and frozen source/assets
# are fixed on disk before this isolated Git operation. No producer is left live.
attempt=0;persisted=None;stdin_open=True
while persisted is None:
 attempt+=1;branch='archive/avoid009-bulbs69-'+a.run_id+'-attempt'+str(attempt);receipt=M.ROOT/'tasks/evidence/AVOID-009/resume-20261025'/('raw69-push-'+a.run_id+'-'+str(attempt)+'.json')
 try:
  print('SOURCE69_ARCHIVE_BEGIN '+branch,flush=True);persisted=M.archive_raw69(run,guard,branch,attempt,receipt)
 except BaseException as e:
  failure={'attempt':attempt,'branch':branch,'type':type(e).__name__,'message':str(e),'producerComplete':producer_ok,'rawPersisted':False,'RAM':str(run)};M.write_json(run/('persistence-failure-'+str(attempt)+'.json'),failure)
  print('RAW69_NOT_DURABLE_KEEPER_ACTIVE '+json.dumps(failure),flush=True)
  # Parent uses the normal live tool session's stdin: retry or stop-unsaved.
  # EOF/timeout is not permission to discard RAM and never means success.
  while True:
   try:
    if stdin_open and select.select([sys.stdin],[],[],10)[0]:
     command=sys.stdin.readline()
     if not command:stdin_open=False
     elif command.strip()=='retry':break
     elif command.strip()=='stop-unsaved':
      stop=M.ROOT/'tasks/evidence/AVOID-009/resume-20261025'/('raw69-UNSAVED-'+a.run_id+'.json');M.write_json(stop,{**failure,'state':'EXPLICIT_STOP_RAW_NOT_PERSISTED','producerPrefixFileList':json.loads(M.read(run/('archive-input-list-'+str(attempt)+'.json'))) if (run/('archive-input-list-'+str(attempt)+'.json')).exists() else None});print('SOURCE69_FAILED_RAW_UNSAVED '+str(stop),flush=True);sys.exit(2)
    elif not stdin_open:time.sleep(10)
   except KeyboardInterrupt:print('KEEPER_RETAINS_RAM: use retry or stop-unsaved in this session',flush=True)
print(json.dumps({'state':'LOCAL_PRODUCER_REVIEW_AND_RAW_DURABLE' if producer_ok and not run_error and parent_review['passed'] else 'PRODUCER_OR_REVIEW_FAILED_ALL_PREFIX_DURABLE','producerReturn':producer_return,'producerComplete':producer_ok,'parentReview':parent_review,'rawPersisted':True,'archive':persisted,'RAMRetained':str(run),'publicChecks':0}),flush=True)
sys.exit(0 if producer_ok and not run_error and parent_review['passed'] else 1)
