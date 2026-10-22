"""Bounded focused-core runner. Requires a separate explicit parent execution gate."""
from pathlib import Path
import argparse,os,http.server,threading,json,time,hashlib,datetime
from process_cleanup import execute_process
D=Path(__file__).resolve().parent;sha=lambda b:hashlib.sha256(b).hexdigest()
class Server(http.server.ThreadingHTTPServer):allow_reuse_address=True
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
 def do_GET(self):
  # The preload independently blocks external destinations; serve only this snapshot.
  return super().do_GET()
def verify(plan):
 for row in plan['preparedFiles']:
  assert sha((D/row['path']).read_bytes())==row['sha256'],row['path']
 env=json.loads((D/'environment-pins.json').read_text())
 for row in env['executableFingerprints']:
  assert sha(Path(row['path']).read_bytes())==row['sha256'],row['path']
 for package in env['packageDependencies']:
  assert Path(package['linkPath']).resolve()==Path(package['realPath'])
  for row in package['files']:assert sha(Path(row['path']).read_bytes())==row['sha256'],row['path']
 for row in env['systemFontDependencies']:
  assert sha(Path(row['path']).read_bytes())==row['sha256'],row['path']
 c=json.loads((D/'candidate-manifest.json').read_text());C=D/'snapshots/candidate'
 for row in c['files']:assert sha((C/row['path']).read_bytes())==row['sha256']
 for row in plan['testInputs']:assert sha((C/row['path']).read_bytes())==row['sha256']
 return c
def run_job(variant,suite,R,base_env,out):
 J=out/(variant+'-'+Path(suite).stem);J.mkdir();t=time.time();cmd=['node','-r',str(D/'environment-preload.cjs'),str(R/'dev'/suite)];env={**base_env,'JIZURA_CORE_VARIANT_ROOT':str(R),'JIZURA_CORE_JOB_DIR':str(J)};server=None;managed=None
 try:
  server=Server(('127.0.0.1',8765),lambda*a,**kw:Handler(*a,directory=str(R),**kw));threading.Thread(target=server.serve_forever,daemon=True).start();managed=execute_process(cmd,cwd=R,env=env,folder=J,timeout=240)
 except Exception as e:
  managed={'exitCode':97,'runnerError':type(e).__name__+': '+str(e),'cleanup':None};(J/'stdout-stderr.log').write_text(managed['runnerError']+'\n')
 finally:
  if server:server.shutdown();server.server_close()
 log=(J/'stdout-stderr.log').read_bytes();result={'variant':variant,'suite':suite,'command':cmd,'cwd':str(R),'startedUTC':datetime.datetime.fromtimestamp(t,datetime.timezone.utc).isoformat(),'seconds':time.time()-t,'exitCode':managed['exitCode'],'status':'PASS'if managed['exitCode']==0 else'FAIL','runnerError':managed['runnerError'],'cleanupComplete':managed['cleanup']['complete']if managed['cleanup']else None,'cleanupReceipt':str(J/'cleanup.json')if managed['cleanup']else None,'logSHA256':sha(log),'scope':'Original assertions unchanged; failures remain failures. Original lyricarea JA may block remaining body/EN; EN-selector derivative is separate.'};(J/'result.json').write_text(json.dumps(result,indent=2)+'\n');return result

def main():
 p=argparse.ArgumentParser();p.add_argument('--execute-parent-gate',required=True,help='Explicit parent gate/reference; never inferred from candidate snapshot');p.add_argument('--candidate-manifest-sha256',required=True);a=p.parse_args();plan=json.loads((D/'plan02.json').read_text());assert sha((D/'candidate-manifest.json').read_bytes())==a.candidate_manifest_sha256;c=verify(plan);out=D/'runs01';assert not out.exists(),'Fresh run only; earlier results preserved';out.mkdir();env={**os.environ,'JIZURA_BROWSER':'/usr/bin/chromium','NODE_PATH':str(D/'common/dependencies'),'PYTHONDONTWRITEBYTECODE':'1'};rows=[]
 for suite in plan['suites']+['lyric_area_effects_en_only.cjs']:
  for variant in ['baseline','candidate']:
   verify(plan);r=run_job(variant,suite,D/'snapshots'/variant,env,out);rows.append(r);(out/'results.json').write_text(json.dumps({'parentExecutionGate':a.execute_parent_gate,'candidateManifest':c,'complete':False,'rows':rows},indent=2)+'\n');print(json.dumps({k:r[k]for k in ['variant','suite','exitCode','status']}),flush=True)
 # No known-failure exception changes the original exit status.
 checks=[]
 for suite in plan['suites']+['lyric_area_effects_en_only.cjs']:
  arow,brow=[x for x in rows if x['suite']==suite];aLog=(out/('baseline-'+Path(suite).stem)/'stdout-stderr.log').read_bytes();bLog=(out/('candidate-'+Path(suite).stem)/'stdout-stderr.log').read_bytes();checks.append({'suite':suite,'baselineExit':arow['exitCode'],'candidateExit':brow['exitCode'],'rawLogsExact':aLog==bLog,'failureReviewRequired':arow['exitCode']!=0 or brow['exitCode']!=0,'classification':'PENDING_ACTUAL_BASELINE_SIGNATURE_REVIEW'if arow['exitCode']or brow['exitCode']else'BOTH_PASS'})
 verify(plan);result={'parentExecutionGate':a.execute_parent_gate,'complete':True,'allInputsUnchanged':True,'all22JobsFinished':len(rows)==22,'rows':rows,'comparisons':checks,'save013':'Not executed: inherited pre-save expected0/actual1 remains AVOID-013, no save-body success.','publicVerification':'Prohibited/not performed'};(out/'results.json').write_text(json.dumps(result,indent=2)+'\n');raise SystemExit(any(r['exitCode']for r in rows))
if __name__=='__main__':main()
