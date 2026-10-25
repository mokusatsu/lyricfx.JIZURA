"""Run unchanged baseline assertions from any cwd, with explicit local runtime."""
import os,subprocess,json,time,argparse
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--out',required=True);a=p.parse_args();root=Path(__file__).resolve().parents[2];out=Path(a.out).resolve();out.mkdir(parents=True,exist_ok=True)
tests=['lyric_test.js','lyric_avoid_center_test.cjs','lyric_group_avoidance_test.cjs','lyric_scene_test.cjs','lyric_placement_stability_test.cjs','timeline_boundary_drag_test.cjs'];rows=[]
for t in tests:
 start=time.time();r=subprocess.run(['node',str(root/'dev'/t)],cwd=root,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=300);(out/(t+'.log')).write_bytes(r.stdout);rows.append({'test':t,'exitCode':r.returncode,'seconds':time.time()-start});print(t,r.returncode,flush=True)
(out/'baseline-results.json').write_text(json.dumps({'browser':os.environ.get('JIZURA_BROWSER'),'node':subprocess.check_output(['node','--version'],text=True).strip(),'results':rows},indent=2)+'\n')
raise SystemExit(any(r['exitCode'] for r in rows))
