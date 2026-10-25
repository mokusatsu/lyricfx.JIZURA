"""Thin established Sourcepending lifecycle. SOURCE only until parent gate.
Producer -> independent same-process raw checker -> M.scope_files -> Sitespending -> L.hold.
No build, archive/Git/storage framework or network operation added.
"""
import sys
sys.dont_write_bytecode=True
import argparse,importlib.util,json,os,pathlib,re,subprocess
ROOT=pathlib.Path('/workspace/lyricfx.JIZURA');HERE=pathlib.Path(__file__).parent
SOURCE73=pathlib.Path('/dev/shm/avoid009-resume-20261025c/github/tasks/evidence/AVOID-009/domino73-sourceprepare-20261025/execute73.py')
def module(name,path):
 spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
M=module('runtime69',ROOT/'dev/avoidance/layouts_d_bulbs69_runtime.py');L=module('lifecycle73',SOURCE73)
def main():
 p=argparse.ArgumentParser();p.add_argument('--reviewed-gate',required=True);a=p.parse_args();M.need(os.environ.get('CROSSWORD28_EXECUTE_RELEASE')=='PARENT_REVIEWED_CROSSWORD28_SOURCE_AND_PERSISTENCE','execution gate absent');gate=M.read(a.reviewed_gate);g=json.loads(gate)
 M.need(g['kind']=='CROSSWORD28_SPARSE_FIDELITY_GATE' and g['accepted'] is True and g['archiveMode']=='sites-source-pending','unreviewed gate');M.need(re.fullmatch('[A-Za-z0-9_-]+',g['runId']),'runId');M.need(0<g['archiveMaxBytes']<=286261248,'original273MiB cap');guard=M.RootGuard(g['root']['HEAD'],g['root']['indexSHA256']);M.need(guard.summary()==g['root'],'ROOT baseline')
 required={str(HERE/n) for n in ['host28.cjs','browser28.js','storage28.cjs','native-factory.js','private-factory.js','oracle-zero-factory.js','oracle-cell60below-factory.js','observer-factory.js','checker28.py','controller28.py']}|{str(SOURCE73),str(ROOT/'dev/avoidance/layouts_d_bulbs69_runtime.py'),str(ROOT/'tasks/evidence/AVOID-009/resume-20261025/parent-read-raw69.py')};M.need(required<={p['path'] for p in g['files']},'mandatory pins');M.need(len(g['files'])==len({p['path'] for p in g['files']}),'duplicate pins')
 def pins():
  for pin in g['files']+g['runtime']:
   data=M.read(pin['path']);M.need(len(data)==pin['bytes'] and M.sha(data)==pin['sha256'],'input changed: '+pin['path'])
 pins();M.need({g['node'],g['browser']}<={p['path'] for p in g['runtime']},'runtime pins');M.need(M.node_dependency(pathlib.Path(g['node']))==g['nodeDependency'],'Node dependency')
 run=pathlib.Path('/dev/shm/avoid009-crossword26/run28-'+g['runId']);tmp=pathlib.Path(g['browserRuntimeDir']);M.need(not run.exists() and not tmp.exists() and re.fullmatch(r'/dev/shm/c28-[A-Za-z0-9_-]{1,8}',str(tmp)),'fresh run/TMP');run.mkdir();tmp.mkdir(mode=0o700);(run/'reviewed-seal.json').write_bytes(gate);(run/'frozen-inputs').mkdir();M.write_json(run/'frozen-inputs/source-refs.json',{'files':g['files'],'runtime':g['runtime'],'Root':guard.summary(),'noRemoteWrites':True})
 env=os.environ.copy();env.update(JIZURA_BROWSER=g['browser'],TMPDIR=str(tmp),XDG_CACHE_HOME=str(tmp/'c'),CROSSWORD28_RELEASE='PARENT_REVIEWED_CROSSWORD28_LOCAL_ONLY');cmd=[g['node'],str(HERE/'host28.cjs'),'--root',str(ROOT),'--source',str(HERE),'--out',str(run/'raw'),'--browser-path',g['browser']];M.write_json(run/'producer-command.json',{'argv':cmd,'cwd':str(ROOT),'release':env['CROSSWORD28_RELEASE']});failure=None;producer=-1;checker=-1;review={}
 try:
  with (run/'producer.stdout.txt').open('wb') as so,(run/'producer.stderr.txt').open('wb') as se:producer=subprocess.run(cmd,cwd=ROOT,env=env,stdout=so,stderr=se).returncode
 except BaseException as e:failure={'type':type(e).__name__,'message':str(e)};M.write_json(run/'orchestrator-failure.json',failure)
 try:
  with (run/'parent-local-review.stdout.txt').open('wb') as so,(run/'parent-local-review.stderr.txt').open('wb') as se:checker=subprocess.run([sys.executable,'-B',str(HERE/'checker28.py'),str(run/'raw'),str(run/'parent-local-review.json')],cwd=ROOT,env=env,stdout=so,stderr=se).returncode
  review=json.loads(M.read(run/'parent-local-review.json'));pins();guard.check();expected={p['path']:p for p in g['files']+g['runtime']}
  for pin in json.loads(M.read(run/'raw/host-receipt.json'))['inputs']:M.need(pin['path'] in expected and all(expected[pin['path']][k]==pin[k] for k in ['bytes','sha256']),'unfrozen producer dependency')
 except BaseException as e:failure={'type':type(e).__name__,'message':str(e)}
 manifest_sha=M.sha(M.read(run/'raw/manifest.json')) if (run/'raw/manifest.json').exists() else None;passed=producer==checker==0 and failure is None and review.get('state')=='PASS_CROSSWORD28_SPARSE_FIDELITY_ONLY';M.write_json(run/'producer-result.json',{'producerReturnCode':producer,'checkerReturnCode':checker,'passedRepresentativeSourceFidelity':passed,'failure':failure,'manifestSHA256':manifest_sha,'geometrySafetyCertified':False,'adapterRegistered':False})
 input_list,rows=M.scope_files(run,1);scope_bytes=sum(r['bytes'] for r in rows)+input_list.stat().st_size;M.need(scope_bytes<=g['archiveMaxBytes'],'pending scope cap');M.write_json(run/'sites-source-persistence-pending.json',{'state':'CROSSWORD28_SITES_SOURCE_PENDING','archiveMode':'sites-source-pending','run':str(run),'manifestSHA256':manifest_sha,'passedRepresentativeSourceFidelity':passed,'files':rows,'scopeBytes':scope_bytes,'inputList':{'path':str(input_list.relative_to(run)),'bytes':input_list.stat().st_size,'sha256':M.sha(M.read(input_list))},'comparisonAssets':0,'verificationBackupOnly':True,'GitHubRawPush':False,'publicChecks':0,'postSaveReadback':False});print(json.dumps({'state':'CROSSWORD28_SPARSE_FIDELITY_HELD','run':str(run),'passedRepresentativeSourceFidelity':passed,'scopeBytes':scope_bytes,'failure':failure}),flush=True)
 L.hold(run,{'passedRepresentativeSourceFidelity':passed,'rawPersisted':False,'archive':None,'scopeBytes':scope_bytes,'parentReview':review,'manifestSHA256':manifest_sha,'geometrySafetyCertified':False,'publicChecks':0})
if __name__=='__main__':main()
