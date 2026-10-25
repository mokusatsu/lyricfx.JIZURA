"""Prepared offline controller: producer -> parent checker -> existing Sites inventory/hold.
Uses the established73 lifecycle, no new storage implementation. No network/remote writes.
Do not execute before parent reviews source and supplies the exact gate.
"""
import sys
sys.dont_write_bytecode=True
import argparse,hashlib,importlib.util,json,os,pathlib,re,subprocess
ROOT=pathlib.Path('/workspace/lyricfx.JIZURA');HERE=pathlib.Path(__file__).parent
SOURCE73=pathlib.Path('/dev/shm/avoid009-resume-20261025c/github/tasks/evidence/AVOID-009/domino73-sourceprepare-20261025/execute73.py')
def module(name,path):
 spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
M=module('runtime69',ROOT/'dev/avoidance/layouts_d_bulbs69_runtime.py')
L=module('lifecycle73',SOURCE73)
def main():
 p=argparse.ArgumentParser();p.add_argument('--reviewed-gate',required=True);a=p.parse_args();M.need(os.environ.get('CONTOUR29_EXECUTE_RELEASE')=='PARENT_REVIEWED_CONTOUR29_SOURCE_AND_PERSISTENCE','execution gate absent');gate_bytes=M.read(a.reviewed_gate);g=json.loads(gate_bytes)
 M.need(g['kind']=='CONTOUR29_BOUNDED_RAW_GATE' and g['accepted'] is True and g['archiveMode']=='sites-source-pending','unreviewed gate');M.need(re.fullmatch('[A-Za-z0-9_-]+',g['runId']),'run id');M.need(0<g['archiveMaxBytes']<=286261248,'original273MiB cap')
 guard=M.RootGuard(g['root']['HEAD'],g['root']['indexSHA256']);M.need(guard.summary()==g['root'],'ROOT baseline')
 paths={pin['path'] for pin in g['files']};M.need(len(paths)==len(g['files']),'duplicate pins');required={str(HERE/n) for n in ['runner29.cjs','browser29.js','driver29.js','checker29.py','controller29.py','NOTES29.txt','manifest29.json']}|{str(SOURCE73),str(ROOT/'dev/avoidance/layouts_d_bulbs69_runtime.py')};required|={str(HERE.parent/'source27'/n) for n in ['contour27-factory.js','contour27-oracle.js','contour27-observer.js']}|{str(HERE.parent/'source28/contour28-browser.js')}
 required|={str(ROOT/n) for n in ['index.html','dev/browser.cjs','dev/package.json','dev/package-lock.json','dev/avoidance/layouts-b-fixture.js','dev/avoidance/layouts-c-editorial-fonts/manifest.json','tasks/evidence/AVOID-009/bulbs-focused59/source59/runner/kernel59.cjs','tasks/evidence/AVOID-009/resume-20261025/parent-read-raw69.py']}
 required|={str(p) for p in (ROOT/'src').glob('*.js')}
 fonts=json.loads(M.read(ROOT/'dev/avoidance/layouts-c-editorial-fonts/manifest.json'))
 for face in fonts['faces']:
  M.need(face['url'].startswith('/dev/avoidance/layouts-c-editorial-fonts/') and '..' not in pathlib.PurePosixPath(face['url']).parts,'nonlocal font');required.add(str(ROOT/face['url'].lstrip('/')))
 M.need(required<=paths,'controller mandatory pins')
 def pins():
  for pin in g['files']+g['runtime']:
   b=M.read(pin['path']);M.need(len(b)==pin['bytes'] and M.sha(b)==pin['sha256'],'input changed: '+pin['path'])
 pins();M.need({g['node'],g['browser']}<={p['path'] for p in g['runtime']},'runtime pins');M.need(M.node_dependency(pathlib.Path(g['node']))==g['nodeDependency'],'Node dependency')
 run=pathlib.Path('/dev/shm/avoid009-contour29-'+g['runId']);tmp=pathlib.Path(g['browserRuntimeDir']);M.need(not run.exists() and not tmp.exists() and re.fullmatch(r'/dev/shm/c29-[A-Za-z0-9_-]{1,8}',str(tmp)),'fresh short TMP');run.mkdir();tmp.mkdir(mode=0o700);(run/'reviewed-seal.json').write_bytes(gate_bytes)
 env=os.environ.copy();env.update(TMPDIR=str(tmp),XDG_CACHE_HOME=str(tmp/'c'),CONTOUR29_RENDER_RELEASE='PARENT_REVIEWED_CONTOUR29_REPRESENTATIVE_SOURCE');cmd=[g['node'],str(HERE/'runner29.cjs'),'--output-dir',str(run/'raw'),'--browser-path',g['browser']];M.write_json(run/'producer-command.json',{'argv':cmd,'cwd':str(ROOT),'release':'PARENT_REVIEWED_CONTOUR29_REPRESENTATIVE_SOURCE'})
 failure=None;producer=-1;checker=-1;review={}
 try:
  with (run/'producer.stdout.txt').open('wb') as so,(run/'producer.stderr.txt').open('wb') as se:producer=subprocess.run(cmd,cwd=ROOT,env=env,stdout=so,stderr=se).returncode
 except BaseException as e:failure={'type':type(e).__name__,'message':str(e)}
 try:
  with (run/'parent-local-review.stdout.txt').open('wb') as so,(run/'parent-local-review.stderr.txt').open('wb') as se:checker=subprocess.run([sys.executable,'-B',str(HERE/'checker29.py'),str(run/'raw'),str(run/'parent-local-review.json')],cwd=ROOT,env=env,stdout=so,stderr=se).returncode
  review=json.loads(M.read(run/'parent-local-review.json'));pins();guard.check()
  expected={p['path']:p for p in g['files']+g['runtime']}
  for pin in json.loads(M.read(run/'raw/manifest.json'))['pins']:
   M.need(pin['path'] in expected and all(expected[pin['path']][k]==pin[k] for k in ['bytes','sha256']),'producer used unfrozen dependency')
 except BaseException as e:failure={'type':type(e).__name__,'message':str(e)}
 manifest_sha=M.sha(M.read(run/'raw/manifest.json')) if (run/'raw/manifest.json').exists() else None;passed=producer==checker==0 and failure is None and review.get('state')=='PASS_CONTOUR29_REPRESENTATIVE_FIDELITY';M.write_json(run/'producer-result.json',{'producerReturnCode':producer,'checkerReturnCode':checker,'passedBoundedPilotRaw':passed,'failure':failure,'manifestSHA256':manifest_sha,'adapterRegistered':False,'geometryUnconditionalClaim':False})
 input_list,rows=M.scope_files(run,1);scope_bytes=sum(r['bytes'] for r in rows)+input_list.stat().st_size;M.need(scope_bytes<=g['archiveMaxBytes'],'pending scope cap');M.write_json(run/'sites-source-persistence-pending.json',{'state':'CONTOUR29_SITES_SOURCE_PENDING','run':str(run),'archiveMode':'sites-source-pending','manifestSHA256':manifest_sha,'passedBoundedPilotRaw':passed,'files':rows,'scopeBytes':scope_bytes,'inputList':{'path':str(input_list.relative_to(run)),'bytes':input_list.stat().st_size,'sha256':M.sha(M.read(input_list))},'comparisonAssets':0,'verificationBackupOnly':True,'GitHubRawPush':False,'publicChecks':0,'postSaveReadback':False})
 print(json.dumps({'state':'CONTOUR29_BOUNDED_PILOT_HELD','run':str(run),'passedBoundedPilotRaw':passed,'review':review.get('state'),'failure':failure,'scopeBytes':scope_bytes}),flush=True)
 # Deliberately reuse source73 exact receipt validation and status/finish loop.
 # Existing73 receipt/status semantics remain unchanged; representative fidelity explicitly scoped.
 L.hold(run,{'passedRepresentativeSourceFidelity':passed,'rawPersisted':False,'archive':None,'scopeBytes':scope_bytes,'parentReview':review,'manifestSHA256':manifest_sha,'geometrySafetyCertified':False,'publicChecks':0})
if __name__=='__main__':main()
