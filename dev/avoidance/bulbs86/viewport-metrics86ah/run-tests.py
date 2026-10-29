from pathlib import Path
import shutil,subprocess,sys,tempfile
root=Path(sys.argv[1]).resolve();d=root/'dev/avoidance/bulbs86/viewport-metrics86ah'
with tempfile.TemporaryDirectory()as t:
 out=Path(t);subprocess.run([sys.executable,str(d/'generate.py'),str(root),str(out)],check=True)
 for file in ['model-owner86.js','replay86.js']:assert(out/file).read_bytes()==(d/file).read_bytes()
 subprocess.run(['node',str(d/'metrics-test.cjs'),str(out/'replay86.js')],check=True)
 for file in ['owner-test.cjs','handoff-regression.cjs']:
  shutil.copy2(d/file,out/file);subprocess.run(['node',str(out/file),str(root/'src/11zz05_bulbs_renderer_time80.js')],check=True)
