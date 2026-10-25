"""SOURCE73 only: reviewed gate -> producer -> independent raw review -> narrow archive -> hold.
No build, asset export, source mutation, public check, fetch or work-branch write.
"""
import sys
sys.dont_write_bytecode=True
import argparse,datetime,hashlib,importlib.util,json,os,pathlib,re,subprocess,time
ROOT=pathlib.Path('/workspace/lyricfx.JIZURA');HERE=pathlib.Path(__file__).parent
spec=importlib.util.spec_from_file_location('runtime69',ROOT/'dev/avoidance/layouts_d_bulbs69_runtime.py');M=importlib.util.module_from_spec(spec);spec.loader.exec_module(M)
def check_files(files,guard,checkpoint):
 for pin in files:
  p=pathlib.Path(pin['path']);data=M.read(p);M.need(len(data)==pin['bytes'] and M.sha(data)==pin['sha256'],'input changed: '+str(p));ref=pin['git'];M.need(re.fullmatch('[0-9a-f]{40}',ref['commit']) and not pathlib.PurePosixPath(ref['path']).is_absolute() and '..' not in pathlib.PurePosixPath(ref['path']).parts,'invalid source Git reference')
  if pin['origin']=='root-head':
   M.need(p.is_relative_to(ROOT) and ref=={'commit':guard.head,'path':str(p.relative_to(ROOT))},'root reference mismatch');M.need(guard.command(['show',ref['commit']+':'+ref['path']])==data,'root Git source differs')
  else:M.need(pin['origin']=='source-checkpoint' and ref['commit']==checkpoint['commit'],'source checkpoint mismatch')
def brief(result):
 review=result.get('parentReview',{});archive=result.get('archive') or {};return {'passedRepresentativeSourceFidelity':result.get('passedRepresentativeSourceFidelity',False),'rawPersisted':result.get('rawPersisted',False),'scopeBytes':result.get('scopeBytes'),'parentReviewState':review.get('state'),'restoredRecords':review.get('restoredRecords',0),'archiveCommit':archive.get('commit'),'archiveBranch':archive.get('branch'),'geometrySafetyCertified':False}
def hold(run,result):
 print(json.dumps({'state':'SOURCE73_HOLD','run':str(run),**brief(result)}),flush=True)
 eof=False
 while True:
  if eof:time.sleep(30);continue
  try:line=sys.stdin.readline()
  except KeyboardInterrupt:print('SOURCE73_HOLD retained; only status/finish accepted.',flush=True);continue
  if not line:eof=True;print('SOURCE73_HOLD_STDIN_EOF_RAM_RETAINED',flush=True);continue
  cmd=line.strip()
  if cmd=='status':print(json.dumps(brief(result)),flush=True)
  elif cmd=='finish' and result['rawPersisted']:return
  elif cmd=='finish':print('SOURCE73_UNPERSISTED_CANNOT_FINISH; parent must preserve RAM or explicitly record failure.',flush=True)
  else:print('SOURCE73_HOLD_COMMAND_REFUSED',flush=True)
def main():
 a=argparse.ArgumentParser();a.add_argument('--reviewed-gate',required=True);a=a.parse_args();M.need(os.environ.get('DOMINO73_EXECUTE_RELEASE')=='PARENT_REVIEWED_SOURCE73_RAW_ONLY_RUN','execution gate absent')
 gate_bytes=M.read(a.reviewed_gate);g=json.loads(gate_bytes);M.need(g['kind']=='SOURCE73_REPRESENTATIVE_RAW_RUN_GATE' and g['accepted'] is True,'unreviewed gate');M.need(re.fullmatch('[A-Za-z0-9_-]+',g['runId']),'runId');M.need(0<g['archiveMaxBytes']<=286261248,'archive policy max exceeds273MiB');guard=M.RootGuard(g['root']['HEAD'],g['root']['indexSHA256']);M.need(guard.summary()==g['root'],'ROOT strict baseline');M.need(guard.command(['config','--get','remote.origin.url']).decode().strip()=='https://github.com/mokusatsu/lyricfx.JIZURA.git','archive destination must be authorized GitHub repository');files=g['files'];M.need(len(files)==len({p['path'] for p in files}),'duplicate input pins');check_files(files,guard,g['sourceCheckpoint'])
 required={str(HERE/n) for n in ['runner73.cjs','browser73.js','oracle-source73.cjs','execute73.py','parent-raw-review73.py']}|{str(ROOT/n) for n in ['index.html','src/11p_layoutsD.js','work/avoid009-domino73-isolated/overlay73.cjs','work/avoid009-domino73-isolated/runtime73.js','dev/avoidance/layouts_d_bulbs69_runtime.py','dev/avoidance/layouts-b-fixture.js','dev/avoidance/layouts-d-bulbs69-oracle-primitives.js','dev/avoidance/layouts-d-bulbs69-runner.cjs','tasks/evidence/AVOID-009/resume-20261025/parent-read-raw69.py']}
 required|={str(ROOT/n) for n in ['dev/browser.cjs','dev/package.json','dev/package-lock.json','tasks/evidence/AVOID-009/bulbs-focused59/source59/runner/kernel59.cjs','tasks/evidence/AVOID-009/bulbs-focused59/source59/runner/catalog59.cjs','dev/avoidance/layouts-c-editorial-fonts/manifest.json']}
 fonts=json.loads(M.read(ROOT/'dev/avoidance/layouts-c-editorial-fonts/manifest.json'))
 for face in fonts['faces']:
  M.need(face['url'].startswith('/dev/avoidance/layouts-c-editorial-fonts/') and '..' not in pathlib.PurePosixPath(face['url']).parts,'nonlocal font');required.add(str(ROOT/face['url'].lstrip('/')))
 M.need(required<={p['path'] for p in files},'missing mandatory source pin')
 node=pathlib.Path(g['node']);browser=pathlib.Path(g['browser']);M.need({str(node),str(browser)}<={p['path'] for p in g['runtime']},'runtime pins');
 for pin in g['runtime']:data=M.read(pin['path']);M.need(len(data)==pin['bytes'] and M.sha(data)==pin['sha256'],'runtime changed')
 M.need(M.node_dependency(node)==g['nodeDependency'],'resolved dependency changed');run=pathlib.Path('/dev/shm/avoid009-bulbs69-domino73-native-'+g['runId']);M.need(not run.exists(),'fresh run required');browser_tmp=pathlib.Path(g['browserRuntimeDir']);M.need(re.fullmatch(r'/dev/shm/d73-[A-Za-z0-9_-]{1,8}',str(browser_tmp)) and not os.path.lexists(browser_tmp),'fresh short browser runtime path required');run.mkdir();browser_tmp.mkdir(mode=0o700);(run/'frozen-inputs').mkdir();(run/'raw').mkdir()
 # Runner requires a fresh raw directory and will create it itself.
 (run/'raw').rmdir();(run/'reviewed-seal.json').write_bytes(gate_bytes);M.write_json(run/'frozen-inputs/source-refs.json',{'files':files,'runtime':g['runtime'],'sourceCheckpoint':g['sourceCheckpoint'],'currentRoot':guard.summary(),'RootSourceBytesDuplicated':False,'comparisonAssets':0,'noRemoteWorkWrite':True})
 for name in ['execute73.py','parent-raw-review73.py']:(run/'frozen-inputs'/name).write_bytes(M.read(HERE/name))
 M.write_json(run/'run-start.json',{'time':datetime.datetime.now(datetime.timezone.utc).isoformat(),'kind':'source73-representative-fidelity-only','gateSHA256':M.sha(gate_bytes),'Root':guard.summary(),'sourceCheckpoint':g['sourceCheckpoint'],'oldRejectedBillboardPayloadIncluded':False,'comparisonAssets':0,'publicChecks':0,'browserRuntimeDir':str(browser_tmp),'browserRuntimeExcludedFromArchive':True})
 command=[str(node),str(HERE/'runner73.cjs'),'--output-dir',str(run/'raw'),'--browser-path',str(browser)];M.write_json(run/'producer-command.json',{'argv':command,'cwd':str(ROOT),'release':'PARENT_REVIEWED_SOURCE73_NATIVE_FIDELITY','sourceRefs':'frozen-inputs/source-refs.json'});env=os.environ.copy();env.update(TMPDIR=str(browser_tmp),XDG_CACHE_HOME=str(browser_tmp/'c'),DOMINO73_RENDER_RELEASE='PARENT_REVIEWED_SOURCE73_NATIVE_FIDELITY');producer=-1;checker=-1;manifest_sha=None;failure=None;receipt=None
 try:
  with (run/'producer.stdout.txt').open('wb') as so,(run/'producer.stderr.txt').open('wb') as se:producer=subprocess.run(command,cwd=ROOT,env=env,stdout=so,stderr=se).returncode
 except BaseException as e:failure={'type':type(e).__name__,'message':str(e)};M.write_json(run/'orchestrator-failure.json',failure)
 summary=M.producer_summary(run,producer,failure);M.write_json(run/'producer-summary.json',summary);errors=summary.get('errors',[]) or [];first=errors[0] if errors else {};message=first.get('message','') if isinstance(first,dict) else str(first);print(json.dumps({'state':'SOURCE73_PRODUCER_EXIT','returnCode':producer,'complete':summary.get('complete',False),'records':summary.get('records',0),'firstError':message.splitlines()[0][:240] if message else None,'summaryFile':str(run/'producer-summary.json'),'manifestFile':str(run/'raw/manifest.json')}),flush=True)
 try:
  manifest_bytes=M.read(run/'raw/manifest.json');manifest_sha=M.sha(manifest_bytes);manifest=json.loads(manifest_bytes);pins={p['path']:p for p in files};runtime_pins={p['path']:p for p in g['runtime']}
  for pin in manifest['pins']:
   expected=pins.get(pin['path'],runtime_pins.get(pin['path']));M.need(expected is not None and all(expected[k]==pin[k] for k in ['path','bytes','sha256']),'producer dependency not frozen')
  check_files(files,guard,g['sourceCheckpoint']);guard.check()
 except BaseException as e:failure={'type':type(e).__name__,'message':str(e)}
 try:
  with (run/'parent-local-review.stdout.txt').open('wb') as so,(run/'parent-local-review.stderr.txt').open('wb') as se:checker=subprocess.run([sys.executable,'-B',str(HERE/'parent-raw-review73.py'),str(run/'raw'),str(run/'parent-local-review.json')],cwd=ROOT,env=env,stdout=so,stderr=se).returncode
  review=json.loads((run/'parent-local-review.json').read_bytes())
 except BaseException as e:review={'state':'CHECKER_DID_NOT_WRITE_VALID_REPORT','producerErrors':summary.get('errors',[]),'failure':{'type':type(e).__name__,'message':str(e)}}
 M.write_json(run/'parent-local-review-execution.json',{'returnCode':checker,'manifestSHA256':manifest_sha,'sameNamespace':True});print(json.dumps({'state':review.get('state'),'restoredRecords':review.get('restoredRecords',0),'firstError':str(review.get('failure',{}).get('message','')).splitlines()[0][:240] if review.get('failure') else None,'reportFile':str(run/'parent-local-review.json'),'manifestSHA256':manifest_sha}),flush=True)
 try:
  M.need(manifest_sha is not None and M.sha(M.read(run/'raw/manifest.json'))==manifest_sha,'manifest mutated after producer');guard.check()
 except BaseException as e:failure={'type':type(e).__name__,'message':str(e)}
 passed=producer==0 and checker==0 and failure is None and review['state']=='PASS_SOURCE73_REPRESENTATIVE_RAW_FIDELITY';M.write_json(run/'producer-result.json',{'producerReturnCode':producer,'parentReviewReturnCode':checker,'passedRepresentativeSourceFidelity':passed,'failure':failure,'manifestSHA256':manifest_sha,'geometrySafe':False,'productAdapterRegistered':False})
 # Scope identical to existing69 archiver: raw + two small new utilities/refs + named root logs only.
 archive_scope=[p for folder in ['raw','frozen-inputs'] for p in (run/folder).rglob('*') if p.is_file()]+[p for p in run.iterdir() if p.is_file()];scope_bytes=sum(p.stat().st_size for p in archive_scope)
 receipt_path=run/'archive-receipt73.json';original_write=M.write_json;push_returned=[]
 def write_receipt(path,value):
  if path==receipt_path:push_returned.append(value);print(json.dumps({'state':'SOURCE73_RAW_PUSH_RETURNED_BEFORE_RECEIPT_WRITE','commit':value['commit'],'branch':value['branch'],'scopeFiles':value['scopeFiles'],'scopeBytes':value['scopeBytes'],'receiptFile':str(receipt_path)}),flush=True)
  return original_write(path,value)
 try:
  M.need(scope_bytes<=g['archiveMaxBytes'],'raw-only archive preflight byte bound');M.write_json=write_receipt;receipt=M.archive_raw69(run,guard,'archive/avoid009-bulbs69-domino73-native-'+g['runId']+'-attempt1',1,receipt_path)
 except BaseException as e:
  if push_returned:receipt=push_returned[0]
  detail={'type':type(e).__name__,'message':str(e),'scopeBytes':scope_bytes,'rawUnpersisted':receipt is None,'pushAlreadyReturned':receipt is not None,'automaticRetry':False};print(json.dumps({'state':'SOURCE73_ARCHIVE_EXCEPTION_HOLD','scopeBytes':scope_bytes,'rawUnpersisted':receipt is None,'firstError':str(e).splitlines()[0][:240],'failureFile':str(run/'persistence-failure-1.json')}),flush=True)
  try:original_write(run/'persistence-failure-1.json',detail)
  except OSError:print('SOURCE73_RAM_FAILURE_RECEIPT_WRITE_FAILED; original push return above is authoritative.',flush=True)
 finally:M.write_json=original_write
 hold(run,{'passedRepresentativeSourceFidelity':passed,'rawPersisted':receipt is not None,'archive':receipt,'scopeBytes':scope_bytes,'parentReview':review,'geometrySafetyCertified':False,'publicChecks':0})
if __name__=='__main__':main()
