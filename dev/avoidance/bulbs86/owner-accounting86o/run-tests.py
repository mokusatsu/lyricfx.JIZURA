from pathlib import Path
import sys,subprocess,tempfile
D=Path(__file__).resolve().parent
repo=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else next(p for p in D.parents if (p/'src/11zz07_bulbs_owner80.js').exists())
with tempfile.TemporaryDirectory(prefix='bulbs86o-')as tmp:
 out=Path(tmp)/'owner.js';subprocess.run([sys.executable,str(D/'generate.py'),str(repo),str(out)],check=True);assert out.read_bytes()==(D/'model-owner86.js').read_bytes()
for name in ['handoff-test.cjs','audit-test.cjs']:subprocess.run(['node',str(D/name),str(repo/'src/11zz05_bulbs_renderer_time80.js')],check=True)
