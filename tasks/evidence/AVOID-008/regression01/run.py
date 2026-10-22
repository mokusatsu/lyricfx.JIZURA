from pathlib import Path
import os, subprocess, concurrent.futures, json,time,hashlib
root=Path(__file__).resolve().parent;snap=root/'snapshot';evidence=root.parents[1]/'tasks/evidence/AVOID-008/regression01'
suites=['drawing_frames_test.cjs','palette_stability_test.cjs','cut_detail_audit_test.cjs','effect_copy_fidelity_test.cjs','lyric_area_effects_test.cjs']
env=os.environ.copy();env['JIZURA_BROWSER']='/usr/bin/chromium'
preload=str(root/'environment-preload.cjs')
def run(pair):
 variant,suite=pair; local=env.copy();local['JIZURA_REGRESSION_ROOT']=str(snap/('baseline' if variant=='baseline' else '.'));local['JIZURA_REGRESSION_READ_LOG']=str(evidence/(variant+'-'+suite+'.reads.jsonl'))
 cmd=['node','-r',preload,str(snap/'dev'/suite)];t=time.time()
 try:
  p=subprocess.run(cmd,cwd=snap,env=local,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=240);code=p.returncode;output=p.stdout.decode(errors='replace')
 except subprocess.TimeoutExpired as e:code=124;output=(e.stdout or b'').decode(errors='replace')+'\nRUNNER TIMEOUT 240s\n'
 result={'variant':variant,'suite':suite,'command':cmd,'cwd':str(snap),'startUTC':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime(t)),'seconds':round(time.time()-t,3),'exitCode':code,'status':'PASS' if code==0 else 'FAIL'}
 (evidence/(variant+'-'+suite+'.log')).write_text(output);(evidence/(variant+'-'+suite+'.result.json')).write_text(json.dumps(result,indent=2));print(json.dumps(result),flush=True);return result
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:results=list(pool.map(run,[(v,s) for s in suites for v in ['baseline','after']]))
(evidence/'results.json').write_text(json.dumps(results,indent=2))
