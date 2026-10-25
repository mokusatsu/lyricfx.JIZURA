"""Local-only media controller. No action on import. Parent source review precedes --run."""
from pathlib import Path
import argparse,hashlib,importlib.util,json,os,subprocess,sys
sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent
CANON=Path('/dev/shm/avoid009-bulbs69-billboard72-canonical-source01/canonical72_ram.py')
CANON_SHA='bb38a9002f0cf025c974a0c3bc946ad9a52858f8c4b1f3604913e2c0329c92e8'
def need(x,c):
 if not x:raise RuntimeError(c)
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--run',action='store_true');ap.add_argument('--run-dir',required=True);ap.add_argument('--ffmpeg',required=True);ap.add_argument('--ffprobe',required=True);ap.add_argument('--latest-known-code-commit',required=True);a=ap.parse_args()
 need(a.run and os.environ.get('BILLBOARD72_MEDIA_RELEASE')=='PARENT_REVIEWED_MEDIA72_SOURCE','parent media source release required')
 need(hashlib.sha256(CANON.read_bytes()).hexdigest()==CANON_SHA,'accepted canonical helper source changed')
 spec=importlib.util.spec_from_file_location('canonical72_media_dependency',CANON);C=importlib.util.module_from_spec(spec);spec.loader.exec_module(C)
 run=Path(a.run_dir);need(str(run).startswith('/dev/shm/') and not run.exists(),'fresh dedicated RAM root required');run.mkdir();(run/'t').mkdir();env=C.environment(run);guard=C.root_guard(a.latest_known_code_commit)
 result={'complete':False,'publicChecks':0,'postSaveReadback':0,'RootWrites':0,'GitWrites':0,'networkActions':0,'RootGuardBefore':guard.summary(),'latestKnownCodeCommit':a.latest_known_code_commit,'independentCandidateRGBAOracle':False,'humanMotionReview':'pending'}
 try:
  runtime=C.runtime(env);inputs=C.inputs(guard);C.write_json(run/'build-inputs.json',inputs);C.extract(guard,run/'before',inputs);before=C.normal_build(run/'before',run/'build-log',env,'before',guard)
  after=Path('/dev/shm/b72c01/a/index.html');need(C.file_pin(after)['sha256']==C.EXPECTED['after']['index.html'],'canonical after HTML changed')
  planpath=Path('/dev/shm/avoid009-billboard72-media-plan01/media72-plan.json');need(C.file_pin(planpath)['sha256']=='85e8996fa52d811ebdb7e024c18b773ecc5a16556b77cf4fb124e99b5ab619f4','accepted media plan changed');plan=json.loads(planpath.read_text());recipe=plan['winnerLiteral']['recipe'];need(recipe['id']=='reflow2-font0.72-right','accepted winner changed')
  pins=[C.file_pin(p) for p in [CANON,planpath,*sorted(HERE.iterdir()),Path(a.ffmpeg),Path(a.ffprobe),after]]
  config={'before':str(run/'before/index.html'),'after':str(after),'output':str(run/'media'),'recipe':recipe,'ffmpeg':a.ffmpeg,'ffprobe':a.ffprobe,'pins':pins,'runtime':runtime}
  C.write_json(run/'media-config.json',config);guard.check()
  cp=subprocess.run([str(C.NODE),str(HERE/'media72.cjs'),str(run/'media-config.json')],cwd=HERE,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
  (run/'node.stdout.txt').write_bytes(cp.stdout);(run/'node.stderr.txt').write_bytes(cp.stderr);result['nodeExit']=cp.returncode
  need(cp.returncode==0,'media producer failed; retain literal logs');m=json.loads((run/'media/manifest.json').read_text());need(m['complete'] and len(m['videos'])==2 and len(m['statics'])==6,'media incomplete');result.update(complete=True,manifest=C.file_pin(run/'media/manifest.json'),runtime=runtime,before=before,after=C.file_pin(after),mediaFiles={'MP4':2,'PNG':6})
 except Exception as e:result['error']=str(e);raise
 finally:
  try:guard.check();C.runtime(env);result['RootGuardAfter']='unchanged'
  except Exception as e:result['complete']=False;result['RootGuardAfter']={'error':str(e)}
  C.write_json(run/'result.json',result)
if __name__=='__main__':main()
