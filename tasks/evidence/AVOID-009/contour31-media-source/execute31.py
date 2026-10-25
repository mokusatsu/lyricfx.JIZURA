"""Parent-only contour31 media release; existing69 RootGuard/73 Sites hold. No network/Git."""
import sys
sys.dont_write_bytecode=True
import argparse,importlib.util,json,os,pathlib,re,subprocess
ROOT=pathlib.Path('/workspace/lyricfx.JIZURA');HERE=pathlib.Path(__file__).parent;BASE=pathlib.Path('/dev/shm/avoid009-contour26')
LIFECYCLE=pathlib.Path('/dev/shm/avoid009-resume-20261025c/github/tasks/evidence/AVOID-009/domino73-sourceprepare-20261025/execute73.py')
def module(name,path):
 spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
M=module('runtime69',ROOT/'dev/avoidance/layouts_d_bulbs69_runtime.py');L=module('lifecycle73',LIFECYCLE)
def main():
 p=argparse.ArgumentParser();p.add_argument('--reviewed-gate',required=True);a=p.parse_args();M.need(os.environ.get('CONTOUR31_EXECUTE_RELEASE')=='PARENT_REVIEWED_CONTOUR31_MEDIA_AND_PERSISTENCE','execution gate absent');gate_bytes=M.read(a.reviewed_gate);g=json.loads(gate_bytes)
 M.need(g['kind']=='CONTOUR31_MEDIA_RUN_GATE' and g['accepted'] is True and g['archiveMode']=='sites-source-pending','unreviewed gate');M.need(re.fullmatch('[0-9a-f]{40}',g['sourceCommit']),'parent-preserved31 source checkpoint');M.need(g['source30Checkpoint']=='b98f7de3a81ebafb1a8f0c5859abbf65c46fc03e','accepted source30 source checkpoint');M.need(re.fullmatch('[A-Za-z0-9_-]+',g['runId']),'run id');M.need(0<g['archiveMaxBytes']<=286261248,'273MiB scope cap')
 guard=M.RootGuard(g['root']['HEAD'],g['root']['indexSHA256']);M.need(guard.summary()==g['root'],'ROOT baseline')
 def pins():
  for pin in g['files']+g['runtime']:
   b=M.read(pin['path']);M.need(len(b)==pin['bytes'] and M.sha(b)==pin['sha256'],'input changed: '+pin['path'])
 paths={p['path'] for p in g['files']};M.need(len(paths)==len(g['files']),'duplicate pins');required={str(HERE/n) for n in ['execute31.py','media31.cjs','browser31.js','checker31.py','media31-comparison.html','source-inventory31.json']}|{str(LIFECYCLE),str(ROOT/'dev/avoidance/layouts_d_bulbs69_runtime.py')}
 required|={str(BASE/'source27'/n) for n in ['contour27-factory.js','contour27-oracle.js','contour27-observer.js']}|{str(BASE/'source30'/n) for n in ['support30.js','checker30.py','manifest30.json']}
 required|={str(ROOT/n) for n in ['index.html','dev/browser.cjs','dev/package.json','dev/package-lock.json','src/01_util.js','dev/avoidance/layouts-b-fixture.js','dev/avoidance/layouts-c-editorial-fonts/manifest.json','dev/avoidance/layouts-d-bulbs71-media.cjs','tasks/evidence/AVOID-009/bulbs-focused59/source59/runner/kernel59.cjs','tasks/evidence/AVOID-009/bulbs-diagnostic56/parent-review-bulbs56.py']};required|={str(p) for p in (ROOT/'src').glob('*.js')}
 fonts=json.loads(M.read(ROOT/'dev/avoidance/layouts-c-editorial-fonts/manifest.json'))
 for f in fonts['faces']:M.need(f['url'].startswith('/dev/avoidance/layouts-c-editorial-fonts/') and '..' not in pathlib.PurePosixPath(f['url']).parts,'local font');required.add(str(ROOT/f['url'].lstrip('/')))
 e=g['source30Evidence'];required|={e['manifest'],e['report']};M.need(required<=paths,'mandatory media/source30/font dependency');pins();M.need({g['node'],g['browser'],g['ffmpeg'],g['ffprobe'],'/usr/lib/chromium/chromium'}<={p['path'] for p in g['runtime']},'runtime pin missing');M.need(M.node_dependency(pathlib.Path(g['node']))==g['nodeDependency'],'Node dependency')
 report=json.loads(M.read(e['report']));source_manifest=json.loads(M.read(e['manifest']));M.need(e['parentAccepted'] is True and M.sha(M.read(e['manifest']))==e['manifestSHA256'] and report['state']=='PASS_CONTOUR30_CONDITIONAL_SUPPORT_STUDY' and source_manifest['complete'] is True and not source_manifest['errors'],'source30 complete parent accepted raw');winner=next(w for w in report['winners'] if w['circle']=='default');M.need(winner['spec']==g['spec']=={'heroScale':.5,'heroDelta':[-482,0],'bodyDelta':[472,0]} and winner['states']==250 and winner['passes']==727 and winner['oraclePasses']==727,'accepted default only winner')
 run=pathlib.Path('/dev/shm/avoid009-contour31-'+g['runId']);tmp=pathlib.Path(g['browserRuntimeDir']);M.need(not run.exists() and not tmp.exists() and re.fullmatch(r'/dev/shm/c31-[A-Za-z0-9_-]{1,8}',str(tmp)),'fresh run/short TMP');run.mkdir();tmp.mkdir(mode=0o700);(run/'reviewed-seal.json').write_bytes(gate_bytes);(run/'frozen-inputs').mkdir()
 config={'output':str(run/'raw'),'spec':g['spec'],'runtime':g['runtime'],'pins':g['files']+g['runtime'],'ffmpeg':g['ffmpeg'],'ffprobe':g['ffprobe'],'browser':g['browser']};M.write_json(run/'frozen-inputs/producer-config.json',config)
 cmd=[g['node'],str(HERE/'media31.cjs'),str(run/'frozen-inputs/producer-config.json')];env=os.environ.copy();env.update(TMPDIR=str(tmp),XDG_CACHE_HOME=str(tmp/'c'),CONTOUR31_MEDIA_RELEASE='PARENT_REVIEWED_CONTOUR31_MEDIA_SOURCE');M.write_json(run/'producer-command.json',{'argv':cmd,'cwd':str(ROOT),'release':'PARENT_REVIEWED_CONTOUR31_MEDIA_SOURCE'})
 producer=-1;checker=-1;failure=None;manifest_sha=None;manifest={};review={}
 try:
  with (run/'producer.stdout.txt').open('wb') as so,(run/'producer.stderr.txt').open('wb') as se:producer=subprocess.run(cmd,cwd=ROOT,env=env,stdout=so,stderr=se).returncode
 except BaseException as x:failure={'type':type(x).__name__,'message':str(x)}
 try:
  b=M.read(run/'raw/manifest.json');manifest_sha=M.sha(b);manifest=json.loads(b);expected={p['path']:p for p in g['files']+g['runtime']}
  for pin in manifest.get('inputs',[])+manifest.get('pins',[]):M.need(pin['path'] in expected and all(expected[pin['path']][k]==pin[k] for k in ['bytes','sha256']),'unfrozen producer dependency')
 except BaseException as x:failure={'type':type(x).__name__,'message':str(x)}
 try:
  with (run/'parent-local-review.stdout.txt').open('wb') as so,(run/'parent-local-review.stderr.txt').open('wb') as se:checker=subprocess.run([sys.executable,'-B',str(HERE/'checker31.py'),str(run/'raw'),str(run/'parent-local-review.json')],cwd=ROOT,env=env,stdout=so,stderr=se).returncode
  review=json.loads(M.read(run/'parent-local-review.json'))
 except BaseException as x:failure={'type':type(x).__name__,'message':str(x)}
 try:pins();guard.check()
 except BaseException as x:failure={'type':type(x).__name__,'message':str(x)}
 passed=producer==checker==0 and failure is None and manifest.get('complete') is True and review.get('state')=='PASS_CONTOUR31_MEDIA_NUMERIC_LIMITED';M.write_json(run/'producer-result.json',{'producerReturnCode':producer,'checkerReturnCode':checker,'mediaNumericReviewPassed':passed,'failure':failure,'manifestSHA256':manifest_sha,'freshVisualReview':'PENDING','humanMotionReview':'PENDING','adapterRegistered':False})
 input_list,rows=M.scope_files(run,1);scope_bytes=sum(r['bytes'] for r in rows)+input_list.stat().st_size;M.need(scope_bytes<=g['archiveMaxBytes'],'pending Sites scope cap');M.write_json(run/'sites-source-persistence-pending.json',{'state':'CONTOUR31_MEDIA_SITES_SOURCE_PENDING','run':str(run),'archiveMode':'sites-source-pending','manifestSHA256':manifest_sha,'mediaNumericReviewPassed':passed,'files':rows,'scopeBytes':scope_bytes,'inputList':{'path':str(input_list.relative_to(run)),'bytes':input_list.stat().st_size,'sha256':M.sha(M.read(input_list))},'comparisonAssets':'2MP4/6PNG/HTML if complete; inspect retained prefix on failure','verificationBackupOnly':True,'GitHubRawPush':False,'publicChecks':0,'postSaveReadback':False})
 print(json.dumps({'state':'CONTOUR31_MEDIA_HELD','run':str(run),'passed':passed,'failure':failure,'manifestSHA256':manifest_sha,'scopeBytes':scope_bytes}),flush=True);L.hold(run,{'passedRepresentativeSourceFidelity':passed,'rawPersisted':False,'archive':None,'scopeBytes':scope_bytes,'parentReview':review,'manifestSHA256':manifest_sha,'geometrySafetyCertified':False,'publicChecks':0})
if __name__=='__main__':main()
