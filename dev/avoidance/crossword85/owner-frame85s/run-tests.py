from pathlib import Path
import subprocess,sys
r=Path(sys.argv[1]).resolve();d=Path(__file__).resolve().parent
names=['renderer-time85.js','plan-binding85.js','09_render-frame85.js'];before={n:(d/n).read_bytes()for n in names}
subprocess.run([sys.executable,str(d/'generate.py'),str(r)],check=True);assert all((d/n).read_bytes()==before[n]for n in names)
for p in d.glob('*.js'):subprocess.run(['node','--check',str(p)],check=True)
subprocess.run(['node',str(d/'controller-test.cjs'),str(r)],check=True)
subprocess.run(['node',str(d/'renderer-test.cjs')],check=True)
