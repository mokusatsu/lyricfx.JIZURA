from pathlib import Path
import hashlib,json,subprocess,time,os
root=Path('/workspace/lyricfx.JIZURA');out=Path(__file__).resolve().parent
names=['lyric_test.js','lyric_avoid_center_test.cjs','lyric_group_avoidance_test.cjs','lyric_scene_test.cjs','lyric_placement_stability_test.cjs','timeline_boundary_drag_test.cjs']
report={'compiledSHA256':hashlib.sha256((root/'index.html').read_bytes()).hexdigest(),'compiledENSHA256':hashlib.sha256((root/'en/index.html').read_bytes()).hexdigest(),'rows':[],'excluded':'Known project_file_test initial cut-count failure is not rerun or claimed successful.'}
for name in names:
 started=time.monotonic();log=out/(name+'.log')
 with log.open('wb') as stream:
  result=subprocess.run(['node',str(root/'dev'/name)],cwd=root,stdout=stream,stderr=subprocess.STDOUT,env={**os.environ,'JIZURA_BROWSER':'/usr/bin/chromium'})
 row={'test':name,'command':['node','dev/'+name],'exitCode':result.returncode,'seconds':round(time.monotonic()-started,3),'scriptSHA256':hashlib.sha256((root/'dev'/name).read_bytes()).hexdigest(),'logSHA256':hashlib.sha256(log.read_bytes()).hexdigest()}
 report['rows'].append(row);(out/'baseline-results.json').write_text(json.dumps(report,indent=2));print(json.dumps(row),flush=True)
report['passed']=all(r['exitCode']==0 for r in report['rows']);(out/'baseline-results.json').write_text(json.dumps(report,indent=2))
raise SystemExit(0 if report['passed'] else 1)
