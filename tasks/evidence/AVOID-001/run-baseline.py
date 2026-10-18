from pathlib import Path
import subprocess,os,json,time
root=Path('/workspace/lyricfx.JIZURA'); work=Path('/workspace/work/avoidance-analysis')
env=dict(os.environ,NODE_PATH='/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules')
tests=['lyric_test.js','lyric_avoid_center_test.cjs','lyric_group_avoidance_test.cjs','lyric_scene_test.cjs','lyric_placement_stability_test.cjs','timeline_boundary_drag_test.cjs','project_file_test.cjs']
results=[]
for name in tests:
 cmd=['node','-r',str(work/'browser-shim.cjs'),str(root/'dev'/name)]
 t=time.monotonic()
 try:
  p=subprocess.run(cmd,cwd=root,env=env,capture_output=True,text=True,timeout=80)
  code=p.returncode; out=p.stdout+p.stderr
 except subprocess.TimeoutExpired as e:
  code=124;out=str(e.stdout or '')+str(e.stderr or '')+'\nTIMEOUT 80s'
 (work/(name+'.log')).write_text(out)
 row={'test':name,'exitCode':code,'seconds':round(time.monotonic()-t,2),'command':cmd,'log':name+'.log'}
 results.append(row); print(json.dumps(row),flush=True)
(work/'baseline-results.json').write_text(json.dumps(results,indent=2))
