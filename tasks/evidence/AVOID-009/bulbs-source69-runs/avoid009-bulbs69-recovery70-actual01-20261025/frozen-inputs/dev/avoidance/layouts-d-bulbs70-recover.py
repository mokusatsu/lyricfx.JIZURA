"""Recover the unfinished independent raw review of one known canonical run.
Fetch is a functional test input, never a push-reachability check. No browser,
encoder, native fixtures or six assertions are rerun. ROOT Git stays read-only.
"""
import sys
sys.dont_write_bytecode=True
from pathlib import Path
import argparse,importlib.util,json,os,re,select,subprocess,time,traceback
HERE=Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('canonical70',HERE/'layouts-d-bulbs70-execute.py');C=importlib.util.module_from_spec(s);s.loader.exec_module(C);M=C.M;R=C.R
SOURCE='3cc4f6d0dcc89a992e22a67395aef1604489d04a'
EXCEPTION='tasks/evidence/AVOID-009/resume-20261025/parent-canonical-review70.py'
HISTORICAL=R/'parent-reviewed-seal70-actual03.json'
REBASE=R/'parent-index-rebaseline70-01.json'
def historical_sources70(old,current):
 old={r['path']:r for r in old};current={r['path']:r for r in current};M.need(len(old)==183 and set(old)==set(current),'historical183 source set changed');M.need(EXCEPTION in old,'expected canonical checker absent')
 for name,pin in old.items():
  if name!=EXCEPTION:M.need(current[name]==pin,'historical source changed: '+name)
 return {'matched':182,'exceptions':[EXCEPTION],'oldChecker':old[EXCEPTION],'currentChecker':current[EXCEPTION]}
def archive_relative70(name,prefix):
 M.need(name.startswith(prefix),'archive member outside source prefix');rel=name[len(prefix):];M.need(rel and not rel.startswith('/') and all(p not in ['', '.', '..'] for p in rel.split('/')),'invalid archive member');return rel
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--prepare-seal');ap.add_argument('--reviewed-seal');ap.add_argument('--run-id');ap.add_argument('--expected-head',required=True);ap.add_argument('--expected-index',required=True);ap.add_argument('--node',required=True);ap.add_argument('--browser-launcher',required=True);ap.add_argument('--browser-engine',required=True);a=ap.parse_args();runtime=[Path(a.node),Path(a.browser_launcher),Path(a.browser_engine)];guard=M.RootGuard(a.expected_head,a.expected_index);historical=json.loads(M.read(HISTORICAL));original={n:M.read(M.ROOT/n) for n in guard.html};initial=dict(guard.html)
 def seal_now():
  current=[{'path':p['path'],'bytes':len(M.read(M.ROOT/p['path'])),'sha256':M.sha(M.read(M.ROOT/p['path']))} for p in historical['files']];matching=historical_sources70(historical['files'],current);M.need(guard.pycs==historical['root']['PYC'] and guard.html==historical['root']['oldHTML'],'historical protected inputs differ');rebase=json.loads(M.read(REBASE));M.need(rebase['state']=='CURRENT_INDEX_SEMANTICS_AND_ALL_PROTECTIONS_VERIFIED' and rebase['stagedDeltaToHEAD']==0 and rebase['flagsMatchRetainedProtectionSnapshot'] is True and rebase['all65PhysicallyAbsent'] is True and len(guard.skips)==65 and rebase['PYC7']==guard.pycs and rebase['oldHTML']==guard.html and guard.stat.st_ino==rebase['currentIndexInode'],'accepted semantic index rebaseline differs');rp=[{'path':str(p),'bytes':p.stat().st_size,'sha256':M.sha(p.read_bytes())} for p in runtime];M.need(rp==historical['runtime'],'historical runtime differs');M.need(C.before_reuse70(guard,runtime,a.node)==historical['before6Reuse'],'historical466/before6 inputs differ')
  extra=[HISTORICAL,REBASE,*HERE.glob('*bulbs70-recover*')];files=current+[{'path':str(p.relative_to(M.ROOT)),'bytes':len(M.read(p)),'sha256':M.sha(M.read(p))} for p in sorted(extra)]
  return {'kind':'SOURCE70_FUNCTIONAL_RAW_RECOVERY_SEAL','root':guard.summary(),'sourceArchiveCommit':SOURCE,'historicalReviewedSealSHA256':M.sha(M.read(HISTORICAL)),'historicalSourceExceptions':[EXCEPTION],'historicalSourceMatching':matching,'files':files,'runtime':rp,'nativeReexecuted':False,'after6Reexecuted':False,'browserExecuted':False,'encoderExecuted':False,'publicChecks':0}
 if a.prepare_seal:M.need(not a.reviewed_seal and not a.run_id,'prepare only');M.write_json(a.prepare_seal,seal_now());guard.check();print(json.dumps({'seal':a.prepare_seal,'functionalFetchExecuted':False,'buildExecuted':False}));return
 M.need(a.reviewed_seal and a.run_id and a.run_id.isascii() and len(a.run_id)<80 and all(c.isalnum() or c in '-_' for c in a.run_id),'fresh safe recovery id/seal required');M.need(os.environ.get('BULBS70_RECOVER_RELEASE')=='PARENT_REVIEWED_FUNCTIONAL_RAW_RECOVERY','parent recovery release missing');review=json.loads(M.read(a.reviewed_seal));M.need(review==seal_now(),'recovery seal changed');run=Path('/dev/shm')/('avoid009-bulbs69-recovery70-'+a.run_id);M.need(not run.exists(),'fresh RAM recovery required');run.mkdir();(run/'tmp').mkdir();(run/'raw').mkdir();(run/'reviewed-seal.json').write_bytes(M.read(a.reviewed_seal));M.write_json(run/'run-start.json',review);guard.env['TMPDIR']=str(run/'tmp');paths=[M.ROOT/p['path'] for p in review['files']];M.input_paths=lambda:paths;rows=None;passed=False;failure=None;oldrun=None
 try:
  rows=M.freeze_inputs(run,runtime);guard.check();gd=run/'functional-input.git';M.git(['init','--bare',str(gd)],guard.env);env=guard.env.copy();env.update(GIT_DIR=str(gd),GIT_ALTERNATE_OBJECT_DIRECTORIES=str(M.ROOT/'.git/objects'));remote=guard.command(['config','--get','remote.origin.url']).decode().strip();M.git(['update-ref','refs/heads/retained-base',guard.head],env);M.git(['fetch','--no-tags','--no-write-fetch-head','--negotiation-tip',guard.head,remote,SOURCE],env)
  def sg(args):return M.git(args,env)
  M.need(sg(['rev-parse',SOURCE]).decode().strip()==SOURCE,'wrong functional input commit');names=sg(['ls-tree','-r','--name-only',SOURCE,'--','tasks/evidence/AVOID-009/bulbs-source69-runs/']).decode().splitlines();matches=[n for n in names if re.fullmatch(r'tasks/evidence/AVOID-009/bulbs-source69-runs/avoid009-bulbs69-canonical70-actual03(?:-[^/]+)?/archive-manifest.json',n)];M.need(len(matches)==1,'one exact canonical actual03 input manifest required');manifest_path=matches[0];prefix=manifest_path[:-len('archive-manifest.json')];blob=sg(['show',SOURCE+':'+manifest_path]);archive=json.loads(blob);oldrun=run/'functional-input'/'historical-run';oldrun.mkdir(parents=True);(oldrun/'archive-manifest.json').write_bytes(blob)
  for item in archive['files']:
   rel=archive_relative70(item['path'],prefix);M.need(sg(['rev-parse',SOURCE+':'+item['path']]).decode().strip()==item['gitBlob'],'archive tree/blob differs');data=sg(['cat-file','blob',item['gitBlob']]);M.need(len(data)==item['bytes'] and M.sha(data)==item['sha256'],'functional input fullbytes differ');dest=oldrun/rel;dest.parent.mkdir(parents=True,exist_ok=True);M.need(not dest.exists(),'duplicate archive member');dest.write_bytes(data)
  M.need(M.read(oldrun/'reviewed-seal.json')==M.read(HISTORICAL),'historical reviewed-seal bytes differ');(oldrun/'recovery-reviewed-seal.json').write_bytes(M.read(a.reviewed_seal));M.write_json(run/'raw/functional-input-reference.json',{'purpose':'unfinished independent functional raw review, not reachability','sourceArchiveCommit':SOURCE,'sourcePrefix':prefix,'archiveManifestSHA256':M.sha(blob),'fullRetrievedFileHashesVerified':True,'files':archive['files'],'nativeReexecuted':False,'after6Reexecuted':False})
  m=json.loads(M.read(oldrun/'raw/manifest.json'));M.need(m['complete'] and not m['errors'] and m['completed']=={'fixtures':30,'tuples':900,'whole':180,'controls':30},'saved native producer not complete');six=json.loads(M.read(oldrun/'raw/baseline6/baseline-results.json'));M.need(len(six['results'])==6 and all(r['exitCode']==0 for r in six['results']),'saved after6 not passed')
  build=M.ram_build(run,guard,historical['baselineHTMLRef']);saved=json.loads(M.read(oldrun/'build/build-receipt.json'));expected={p['path']:p['sha256'] for p in saved['outputs']};outputs={'index.html':M.read(build/'candidate-ja.html'),'en/index.html':M.read(build/'candidate-en/index.html')};M.need(M.sha(outputs['index.html'])==expected['build/candidate-ja.html'] and M.sha(outputs['en/index.html'])==expected['build/candidate-en/index.html'],'fresh normal build differs from accepted native/after6 bytes');guard.html_transition={'initial':initial,'declaredNormalBuild':{n:M.sha(b) for n,b in outputs.items()},'final':dict(guard.html),'state':'recovery-installing'};C.install_html70(guard,outputs);guard.html_transition.update(final=dict(guard.html),state='recovery-installed')
  command=[sys.executable,'-B',str(R/'parent-local-review69.py'),str(oldrun/'raw'),str(run/'parent-local-review.json')];M.write_json(run/'producer-command.json',{'argv':command,'nativeAndAfter6Reexecuted':False,'sourceArchiveCommit':SOURCE});env=os.environ.copy();env.update(TMPDIR=str(run/'tmp'),PYTHONDONTWRITEBYTECODE='1')
  with (run/'parent-local-review.stdout.txt').open('xb') as out,(run/'parent-local-review.stderr.txt').open('xb') as err:
   p=subprocess.Popen(command,cwd=M.ROOT,env=env,stdout=out,stderr=err);last=0
   try:
    while p.poll() is None:
     if time.monotonic()-last>30:print('SOURCE70_RECOVERY_RAW_REVIEW_RUNNING '+str(p.pid),flush=True);last=time.monotonic()
     time.sleep(1)
   finally:
    if p.poll() is None:p.terminate();p.wait(timeout=30)
  report=json.loads(M.read(run/'parent-local-review.json'));print('SOURCE70_RECOVERY_PARENT_REVIEW_JSON '+json.dumps(report),flush=True);M.need(p.returncode==0 and report['state']=='PASS_CANONICAL_JAEN_NATIVE_RAW_AND_AFTER6','corrected raw review did not pass');M.check_inputs(rows);guard.check();passed=True
 except BaseException as e:failure={'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()};M.write_json(run/'orchestrator-failure.json',failure)
 finally:
  try:
   if not passed and guard.html!=initial:C.install_html70(guard,original)
   if hasattr(guard,'html_transition'):guard.html_transition.update(final=dict(guard.html),state='recovery-kept' if passed else 'recovery-rolled-back')
   if rows is not None:M.check_inputs(rows)
   guard.check()
  except BaseException as e:failure=failure or {'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()}
  result={'passed':passed and failure is None,'sourceArchiveCommit':SOURCE,'historicalReviewedSealSHA256':review['historicalReviewedSealSHA256'],'historicalSourceExceptions':[EXCEPTION],'htmlTransition':getattr(guard,'html_transition',None),'failure':failure,'nativeReexecuted':False,'after6Reexecuted':False,'browserExecuted':False,'encoderExecuted':False,'retrievedRawRearchived':False,'publicChecks':0,'postSaveReachabilityChecks':0};M.write_json(run/'raw/recovery-result.json',result);M.write_json(R/('recovery70-result-'+a.run_id+'.json'),result);print('SOURCE70_RECOVERY_RESULT '+json.dumps(result),flush=True)
 # functional-input/ is deliberately excluded by the existing scoped archiver:
 # original raw remains in SOURCE; new reference/full hashes/build/review persist.
 receipt=None;attempt=0;stdin_open=True
 while receipt is None:
  attempt+=1
  try:receipt=M.archive_raw69(run,guard,'archive/avoid009-bulbs69-recovery70-'+a.run_id+'-attempt'+str(attempt),attempt,R/('recovery70-push-'+a.run_id+'-'+str(attempt)+'.json'))
  except BaseException as e:
   M.write_json(run/('persistence-failure-'+str(attempt)+'.json'),{'message':str(e),'rawPersisted':False});print('SOURCE70_RECOVERY_KEEPER_NOT_DURABLE '+str(e),flush=True)
   while True:
    try:
     if stdin_open:
      ready,_,_=select.select([sys.stdin],[],[],30)
      if ready:
       answer=sys.stdin.readline()
       if answer=='':stdin_open=False
       elif answer.strip()=='retry':break
       elif answer.strip()=='stop-unsaved':M.write_json(R/('recovery70-UNSAVED-'+a.run_id+'.json'),result);raise SystemExit(2)
     else:time.sleep(30)
     print('SOURCE70_RECOVERY_KEEPER_RETAINS_RAM',flush=True)
    except KeyboardInterrupt:print('SOURCE70_RECOVERY_KEEPER_RETAINS_RAM',flush=True)
 print(json.dumps({'result':result,'archive':receipt}),flush=True);raise SystemExit(0 if result['passed'] else 1)
if __name__=='__main__':main()
