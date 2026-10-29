from pathlib import Path
import subprocess,sys,tempfile
root=Path(sys.argv[1]).resolve();d=root/'dev/avoidance/bulbs86/viewport-replay86af'
with tempfile.TemporaryDirectory()as t:
 out=Path(t);subprocess.run([sys.executable,str(d/'generate.py'),str(root),str(out)],check=True);assert (out/'replay86.js').read_bytes()==(d/'replay86.js').read_bytes()
 subprocess.run(['node',str(d/'replay-test.cjs'),str(out/'replay86.js')],check=True)
subprocess.run(['node',str(d/'index-audit.cjs'),str(root/'src/11zz04_bulbs_scalar80.js')],check=True)
