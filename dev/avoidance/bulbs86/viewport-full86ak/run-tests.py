from pathlib import Path
import subprocess,sys,tempfile
root=Path(sys.argv[1]).resolve();d=root/'dev/avoidance/bulbs86/viewport-full86ak'
with tempfile.TemporaryDirectory()as t:
 out=Path(t);subprocess.run([sys.executable,str(d/'generate.py'),str(root),str(out)],check=True);assert (out/'adapter-test86.js').read_bytes()==(d/'adapter-test86.js').read_bytes()
 subprocess.run(['node','--check',str(out/'adapter-test86.js')],check=True)
 subprocess.run(['node','--check',str(d/'diagnostic86.js')],check=True)
print('test-only adapter generation byte-equal and syntax PASS; not a new behavioral test')
