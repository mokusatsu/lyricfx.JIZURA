"""Minimal media27 gate wrapper; reuse RootGuard + source73 Sites inventory/hold. No network."""
import sys
sys.dont_write_bytecode=True
import argparse,importlib.util,json,os,pathlib,re,subprocess
ROOT=pathlib.Path('/workspace/lyricfx.JIZURA');HERE=pathlib.Path(__file__).parent
SOURCE73=pathlib.Path('/dev/shm/avoid009-resume-20261025c/github/tasks/evidence/AVOID-009/domino73-sourceprepare-20261025/execute73.py')
def module(name,path):
 spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
M=module('runtime69',ROOT/'dev/avoidance/layouts_d_bulbs69_runtime.py');L=module('lifecycle73',SOURCE73)
def main():
 p=argparse.ArgumentParser();p.add_argument('--reviewed-gate',required=True);a=p.parse_args();M.need(os.environ.get('DOMINO27_EXECUTE_RELEASE')=='PARENT_REVIEWED_DOMINO27_MEDIA_AND_PERSISTENCE','execution gate absent');gate_bytes=M.read(a.reviewed_gate);g=json.loads(gate_bytes)
 M.need(g['kind']=='DOMINO27_MEDIA_RUN_GATE' and g['accepted'] is True and g['archiveMode']=='sites-source-pending','unreviewed gate');M.need(g['sourceCommit']=='ddf4086135168d277970751b6254b2e03b8c8e7a','source checkpoint');M.need(re.fullmatch('[A-Za-z0-9_-]+',g['runId']),'run id');M.need(0<g['archiveMaxBytes']<=286261248,'273MiB scope cap')
 guard=M.RootGuard(g['root']['HEAD'],g['root']['indexSHA256']);M.need(guard.summary()==g['root'],'ROOT baseline')
 def pins():
  for pin in g['files']+g['runtime']:
   b=M.read(pin['path']);M.need(len(b)==pin['bytes'] and M.sha(b)==pin['sha256'],'input changed: '+pin['path'])
 paths={p['path'] for p in g['files']};M.need(len(paths)==len(g['files']),'duplicate pins');required={str(HERE/n) for n in ['execute27.py','media27.cjs','browser27.js','media27-comparison.html']}|{str(SOURCE73),str(ROOT/'dev/avoidance/layouts_d_bulbs69_runtime.py')};M.need(required<=paths,'mandatory wrapper inputs');pins();M.need({g['node'],g['browser'],g['ffmpeg'],g['ffprobe'],'/usr/lib/chromium/chromium'}<={p['path'] for p in g['runtime']},'runtime pin missing');M.need(M.node_dependency(pathlib.Path(g['node']))==g['nodeDependency'],'Node dependency')
 run=pathlib.Path('/dev/shm/avoid009-domino27-'+g['runId']);tmp=pathlib.Path(g['browserRuntimeDir']);M.need(not run.exists() and not tmp.exists() and re.fullmatch(r'/dev/shm/d27-[A-Za-z0-9_-]{1,8}',str(tmp)),'fresh run/short TMP');run.mkdir();tmp.mkdir(mode=0o700);(run/'reviewed-gate.json').write_bytes(gate_bytes)
 config={'output':str(run/'raw'),'recipe':g['recipe'],'runtime':g['runtime'],'pins':g['files']+g['runtime'],'ffmpeg':g['ffmpeg'],'ffprobe':g['ffprobe']};M.write_json(run/'producer-config.json',config)
 cmd=[g['node'],str(HERE/'media27.cjs'),str(run/'producer-config.json')];env=os.environ.copy();env.update(TMPDIR=str(tmp),XDG_CACHE_HOME=str(tmp/'c'),DOMINO27_MEDIA_RELEASE='PARENT_REVIEWED_MEDIA27_SOURCE');M.write_json(run/'producer-command.json',{'argv':cmd,'cwd':str(ROOT),'release':'PARENT_REVIEWED_MEDIA27_SOURCE'})
 producer=-1;failure=None;manifest_sha=None;manifest={}
 try:
  with (run/'producer.stdout.txt').open('wb') as so,(run/'producer.stderr.txt').open('wb') as se:producer=subprocess.run(cmd,cwd=ROOT,env=env,stdout=so,stderr=se).returncode
 except BaseException as e:failure={'type':type(e).__name__,'message':str(e)}
 try:
  manifest_bytes=M.read(run/'raw/manifest.json');manifest_sha=M.sha(manifest_bytes);manifest=json.loads(manifest_bytes);pins();guard.check();expected={p['path']:p for p in g['files']+g['runtime']}
  for pin in manifest.get('inputs',[])+manifest.get('pins',[]):M.need(pin['path'] in expected and all(expected[pin['path']][k]==pin[k] for k in ['bytes','sha256']),'unfrozen producer dependency')
 except BaseException as e:failure={'type':type(e).__name__,'message':str(e)}
 completed=producer==0 and failure is None and manifest.get('complete') is True;M.write_json(run/'producer-result.json',{'producerReturnCode':producer,'mediaProducerCompleted':completed,'failure':failure,'manifestSHA256':manifest_sha,'parentRawReview':'PENDING','freshVisualReview':'PENDING','humanMotionReview':'PENDING','adapterRegistered':False})
 input_list,rows=M.scope_files(run,1);scope_bytes=sum(r['bytes'] for r in rows)+input_list.stat().st_size;M.need(scope_bytes<=g['archiveMaxBytes'],'pending Sites scope cap');M.write_json(run/'sites-source-persistence-pending.json',{'state':'DOMINO27_MEDIA_SITES_SOURCE_PENDING','run':str(run),'archiveMode':'sites-source-pending','manifestSHA256':manifest_sha,'mediaProducerCompleted':completed,'files':rows,'scopeBytes':scope_bytes,'inputList':{'path':str(input_list.relative_to(run)),'bytes':input_list.stat().st_size,'sha256':M.sha(M.read(input_list))},'comparisonAssets':'2MP4/6PNG/HTML if completed; inspect inventory on failure','verificationBackupOnly':True,'GitHubRawPush':False,'publicChecks':0,'postSaveReadback':False})
 print(json.dumps({'state':'DOMINO27_MEDIA_PRODUCER_HELD','run':str(run),'completed':completed,'failure':failure,'manifestSHA256':manifest_sha,'scopeBytes':scope_bytes}),flush=True)
 L.hold(run,{'passedRepresentativeSourceFidelity':False,'rawPersisted':False,'archive':None,'scopeBytes':scope_bytes,'parentReview':{'state':'PENDING_PARENT_MEDIA_RAW_REVIEW'},'manifestSHA256':manifest_sha,'geometrySafetyCertified':False,'publicChecks':0})
if __name__=='__main__':main()
