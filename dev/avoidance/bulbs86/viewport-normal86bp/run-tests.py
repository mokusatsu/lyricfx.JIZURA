from pathlib import Path
import subprocess,sys
D=Path(__file__).resolve().parent;R=Path(sys.argv[1]).resolve();names=['controller86.js','post86.js','adapter86.js','fast86.js'];before={n:(D/n).read_bytes()for n in names}
subprocess.run([sys.executable,str(D/'generate.py'),str(R)],check=True);assert all((D/n).read_bytes()==before[n]for n in names)
for n in names:subprocess.run(['node','--check',str(D/n)],check=True)
subprocess.run(['node',str(D/'fast-test.cjs')],check=True)
subprocess.run(['node',str(D/'controller-regression.cjs'),str(R)],check=True)
