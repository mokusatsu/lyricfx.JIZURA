from pathlib import Path
import shutil,subprocess,sys,tempfile
root=Path(sys.argv[1]).resolve();d=root/'dev/avoidance/bulbs86/viewport-controller86ax'
with tempfile.TemporaryDirectory()as t:
 out=Path(t);subprocess.run([sys.executable,str(d/'generate.py'),str(root),str(out)],check=True)
 for name in ['model-owner86.js','replay86.js','controller86.js']:assert (out/name).read_bytes()==(d/name).read_bytes();subprocess.run(['node','--check',str(out/name)],check=True)
 for p,args in [(d/'controller-regression.cjs',[str(root)]),(d/'replay-test.cjs',[str(out/'replay86.js')]),(root/'dev/avoidance/bulbs86/viewport-handoff86aw/owner-test.cjs',[str(root/'src/11zz05_bulbs_renderer_time80.js')])]:
  shutil.copy2(p,out/p.name);subprocess.run(['node',str(out/p.name),*args],check=True)
