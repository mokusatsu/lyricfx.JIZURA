from pathlib import Path
import json,shutil,subprocess,sys,tempfile,time
root=Path(sys.argv[1]).resolve();d=root/'dev/avoidance/bulbs86/viewport-metadata86at';results={}
with tempfile.TemporaryDirectory() as t:
 out=Path(t)
 subprocess.run([sys.executable,str(d/'generate.py'),str(root),str(out)],check=True)
 assert (out/'model-owner86.js').read_bytes()==(d/'model-owner86.js').read_bytes()
 for variant,source in [('old',root/'dev/avoidance/bulbs86/viewport-aggregate86ao/model-owner86.js'),('new',d/'model-owner86.js')]:
  shutil.copy2(source,out/'model-owner86.js');shutil.copy2(d/'owner-test.cjs',out/'owner-test.cjs')
  start=time.perf_counter();p=subprocess.run(['node',str(out/'owner-test.cjs'),str(root/'src/11zz05_bulbs_renderer_time80.js')],check=True,capture_output=True,text=True)
  results[variant]=json.loads(p.stdout);results[variant]['processMs']=(time.perf_counter()-start)*1000
 assert results['old']['checks']==results['new']['checks']==63
 assert results['new']['metadataEncodes']<results['old']['metadataEncodes']
 shutil.copy2(d/'model-owner86.js',out/'model-owner86.js');shutil.copy2(root/'dev/avoidance/bulbs86/viewport-metrics86ah/handoff-regression.cjs',out/'handoff-regression.cjs')
 subprocess.run(['node',str(out/'handoff-regression.cjs'),str(root/'src/11zz05_bulbs_renderer_time80.js')],check=True)
 print(json.dumps(results))
