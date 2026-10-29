from pathlib import Path
import subprocess,sys,tempfile
root=Path(sys.argv[1]).resolve();raw=Path(sys.argv[2]);d=root/'dev/avoidance/bulbs86/viewport-held-account86bh'
with tempfile.TemporaryDirectory()as t:
 out=Path(t);subprocess.run([sys.executable,str(d/'generate.py'),str(root),str(out)],check=True)
 assert(out/'scalar-generator86.js').read_bytes()==(d/'scalar-generator86.js').read_bytes();subprocess.run(['node','--check',str(out/'scalar-generator86.js')],check=True)
 subprocess.run(['node',str(d/'held-test.cjs'),str(root),str(raw)],check=True)
