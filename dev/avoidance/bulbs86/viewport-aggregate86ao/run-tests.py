from pathlib import Path
import shutil,subprocess,sys,tempfile
root=Path(sys.argv[1]).resolve();d=root/'dev/avoidance/bulbs86/viewport-aggregate86ao'
with tempfile.TemporaryDirectory()as t:
 out=Path(t);subprocess.run([sys.executable,str(d/'generate.py'),str(root),str(out)],check=True);assert(out/'model-owner86.js').read_bytes()==(d/'model-owner86.js').read_bytes()
 for src in [d/'owner-test.cjs',root/'dev/avoidance/bulbs86/viewport-metrics86ah/handoff-regression.cjs']:
  shutil.copy2(src,out/src.name);subprocess.run(['node',str(out/src.name),str(root/'src/11zz05_bulbs_renderer_time80.js')],check=True)
