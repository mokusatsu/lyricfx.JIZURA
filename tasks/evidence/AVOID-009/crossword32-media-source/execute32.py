"""Thin parent-only media gate: existing69 RootGuard, same-process checker,73 Sitespending hold."""
import sys
sys.dont_write_bytecode=True
import argparse,importlib.util,json,os,pathlib,re,subprocess
ROOT=pathlib.Path('/workspace/lyricfx.JIZURA');HERE=pathlib.Path(__file__).parent;BASE=pathlib.Path('/dev/shm/avoid009-crossword26');LIFECYCLE=pathlib.Path('/dev/shm/avoid009-resume-20261025c/github/tasks/evidence/AVOID-009/domino73-sourceprepare-20261025/execute73.py')
def module(name,path):
 spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
M=module('runtime69',ROOT/'dev/avoidance/layouts_d_bulbs69_runtime.py');L=module('lifecycle73',LIFECYCLE)
def main():
 p=argparse.ArgumentParser();p.add_argument('--reviewed-gate',required=True);a=p.parse_args();M.need(os.environ.get('CROSSWORD32_EXECUTE_RELEASE')=='PARENT_REVIEWED_CROSSWORD32_MEDIA_AND_PERSISTENCE','execution gate absent');gateBytes=M.read(a.reviewed_gate);g=json.loads(gateBytes)
 M.need(g['kind']=='CROSSWORD32_FIXED_WINNER_MEDIA_GATE' and g['accepted'] is True and g['archiveMode']=='sites-source-pending','unreviewed gate');M.need(re.fullmatch('[0-9a-f]{40}',g['sourceCommit']),'parent-preserved media32 checkpoint');M.need(g['source31Checkpoint']=='7c08b89fca1b51eb788d4bc666ddb8363ef1145a','accepted source31 checkpoint');M.need(re.fullmatch('[A-Za-z0-9_-]+',g['runId']),'runId');M.need(0<g['archiveMaxBytes']<=286261248,'273MiB scope cap');guard=M.RootGuard(g['root']['HEAD'],g['root']['indexSHA256']);M.need(guard.summary()==g['root'],'ROOT baseline')
 def pins():
  for pin in g['files']+g['runtime']:
   b=M.read(pin['path']);M.need(len(b)==pin['bytes'] and M.sha(b)==pin['sha256'],'input changed: '+pin['path'])
 paths={p['path'] for p in g['files']};M.need(len(paths)==len(g['files']),'duplicate pins');required={str(HERE/n) for n in ['execute32.py','media32.cjs','browser32.js','checker32.py','winner32.cjs','viewer32.html','source-inventory32.json']}|{str(LIFECYCLE),str(ROOT/'dev/avoidance/layouts_d_bulbs69_runtime.py')}
 required|={str(BASE/'source31'/n) for n in ['storage30.cjs','private-factory.js','native-factory.js','observer-factory.js','oracle-58A-factory.js','browser30.js','checker30.py','policy30.json','manifest31.json']}|{str(BASE/'source29/browser28.js')}
 required|={str(ROOT/n) for n in ['dev/browser.cjs','dev/package.json','dev/package-lock.json','dev/avoidance/layouts-b-fixture.js','dev/avoidance/layouts-c-editorial-fonts/manifest.json','dev/avoidance/layouts-d-bulbs71-media.cjs','dev/avoidance/layouts-d-bulbs69-runner.cjs','tasks/evidence/AVOID-009/bulbs-focused59/source59/runner/kernel59.cjs','tasks/evidence/AVOID-009/bulbs-focused59/source59/runner/catalog59.cjs','tasks/evidence/AVOID-009/resume-20261025/parent-read-raw69.py','assets/effect-preview.png']};required|={str(p) for p in (ROOT/'src').glob('*.js')}
 fonts=json.loads(M.read(ROOT/'dev/avoidance/layouts-c-editorial-fonts/manifest.json'))
 for f in fonts['faces']:M.need(f['url'].startswith('/dev/avoidance/layouts-c-editorial-fonts/') and '..' not in pathlib.PurePosixPath(f['url']).parts,'local font');required.add(str(ROOT/f['url'].lstrip('/')))
 for ref in g['fullEvidence'].values():required.add(ref['path'])
 M.need(required<=paths,'mandatory media/source31/font/evidence dependency');pins();M.need({g['node'],g['browser'],g['ffmpeg'],g['ffprobe'],'/usr/lib/chromium/chromium'}<={p['path'] for p in g['runtime']},'runtime pins');M.need(M.node_dependency(pathlib.Path(g['node']))==g['nodeDependency'],'Node dependency');parent=json.loads(M.read(g['fullEvidence']['parent']['path']));M.need(parent['accepted'] is True and parent['winner']==g['selection'],'separate accepted parent marker required')
 run=BASE/('media32-'+g['runId']);tmp=pathlib.Path(g['browserRuntimeDir']);M.need(not run.exists() and not tmp.exists() and re.fullmatch(r'/dev/shm/c32-[A-Za-z0-9_-]{1,8}',str(tmp)),'fresh run/short TMP');run.mkdir();tmp.mkdir(mode=0o700);(run/'reviewed-seal.json').write_bytes(gateBytes);(run/'frozen-inputs').mkdir();config={'output':str(run/'raw'),'gate':g,'runtime':g['runtime'],'pins':g['files']+g['runtime'],'ffmpeg':g['ffmpeg'],'ffprobe':g['ffprobe'],'browser':g['browser']};M.write_json(run/'frozen-inputs/producer-config.json',config)
 cmd=[g['node'],str(HERE/'media32.cjs'),str(run/'frozen-inputs/producer-config.json')];env=os.environ.copy();env.update(JIZURA_BROWSER=g['browser'],TMPDIR=str(tmp),XDG_CACHE_HOME=str(tmp/'c'),CROSSWORD32_MEDIA_RELEASE='PARENT_REVIEWED_CROSSWORD32_MEDIA_SOURCE');M.write_json(run/'producer-command.json',{'argv':cmd,'cwd':str(ROOT),'release':env['CROSSWORD32_MEDIA_RELEASE']});producer=-1;checker=-1;failure=None;manifest_sha=None;manifest={};review={}
 try:
  with (run/'producer.stdout.txt').open('wb')as so,(run/'producer.stderr.txt').open('wb')as se:producer=subprocess.run(cmd,cwd=ROOT,env=env,stdout=so,stderr=se).returncode
 except BaseException as e:failure={'name':type(e).__name__,'message':str(e)}
 try:
  data=M.read(run/'raw/manifest.json');manifest_sha=M.sha(data);manifest=json.loads(data);expected={p['path']:p for p in g['files']+g['runtime']}
  for pin in manifest.get('inputs',[])+manifest.get('pins',[]):M.need(pin['path'] in expected and all(expected[pin['path']][k]==pin[k] for k in ['bytes','sha256']),'unfrozen producer dependency')
 except BaseException as e:failure={'name':type(e).__name__,'message':str(e)}
 try:
  with (run/'parent-local-review.stdout.txt').open('wb')as so,(run/'parent-local-review.stderr.txt').open('wb')as se:checker=subprocess.run([sys.executable,'-B',str(HERE/'checker32.py'),str(run/'raw'),str(run/'parent-local-review.json')],cwd=ROOT,env=env,stdout=so,stderr=se).returncode
  review=json.loads(M.read(run/'parent-local-review.json'))
 except BaseException as e:failure={'name':type(e).__name__,'message':str(e)}
 try:pins();guard.check()
 except BaseException as e:failure={'name':type(e).__name__,'message':str(e)}
 passed=producer==checker==0 and failure is None and manifest.get('complete') is True and review.get('state')=='PASS_CROSSWORD32_MEDIA_NUMERIC_LIMITED';M.write_json(run/'producer-result.json',{'producerReturnCode':producer,'checkerReturnCode':checker,'mediaNumericReviewPassed':passed,'failure':failure,'manifestSHA256':manifest_sha,'freshVisualReview':'PENDING','humanMotionReview':'PENDING','conditionalModelOnly':True,'fullPostFXQualified':False,'adapterRegistered':False})
 input_list,rows=M.scope_files(run,1);scope_bytes=sum(r['bytes'] for r in rows)+input_list.stat().st_size;M.need(scope_bytes<=g['archiveMaxBytes'],'pending Sites scope cap');M.write_json(run/'sites-source-persistence-pending.json',{'state':'CROSSWORD32_MEDIA_SITES_SOURCE_PENDING','run':str(run),'archiveMode':'sites-source-pending','manifestSHA256':manifest_sha,'mediaNumericReviewPassed':passed,'files':rows,'scopeBytes':scope_bytes,'inputList':{'path':str(input_list.relative_to(run)),'bytes':input_list.stat().st_size,'sha256':M.sha(M.read(input_list))},'comparisonAssets':'2MP4/6PNG/HTML Sites-only; retain failed prefix','verificationBackupOnly':True,'GitHubRawPush':False,'publicChecks':0,'postSaveReadback':False});print(json.dumps({'state':'CROSSWORD32_MEDIA_HELD','run':str(run),'passed':passed,'failure':failure,'manifestSHA256':manifest_sha,'scopeBytes':scope_bytes}),flush=True);L.hold(run,{'passedRepresentativeSourceFidelity':passed,'rawPersisted':False,'archive':None,'scopeBytes':scope_bytes,'parentReview':review,'manifestSHA256':manifest_sha,'geometrySafetyCertified':False,'publicChecks':0})
if __name__=='__main__':main()
