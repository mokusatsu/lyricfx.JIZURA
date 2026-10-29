from pathlib import Path
import tempfile,subprocess,sys
D=Path(__file__).resolve().parent;repo=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else next(p for p in D.parents if (p/'src/09_render.js').exists())
with tempfile.TemporaryDirectory(prefix='bulbs86z-')as tmp:
 subprocess.run([sys.executable,str(D/'generate.py'),str(repo),tmp],check=True)
 for f in ['controller86.js','post86.js','adapter86.js']:assert (Path(tmp)/f).read_bytes()==(D/f).read_bytes()
subprocess.run(['node',str(D/'fast-test.cjs')],check=True);subprocess.run(['node',str(D/'controller-regression.cjs'),str(repo)],check=True)
