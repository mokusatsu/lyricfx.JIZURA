from pathlib import Path
import tempfile,shutil,subprocess,sys
D=Path(__file__).resolve().parent
R=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else next(p for p in D.parents if (p/'src/11p_layoutsD.js').exists())
with tempfile.TemporaryDirectory(prefix="burst83z-") as td:
 t=Path(td)
 for n in ["prepare-source.py","owner-test.cjs"]:shutil.copy2(D/n,t/n)
 subprocess.run([sys.executable,str(t/'prepare-source.py'),str(R)],check=True)
 for n in ["private-proof-owner83.js","source-from83s.patch","boundary.json"]:assert(t/n).read_bytes()==(D/n).read_bytes(),n
 subprocess.run(["node",str(t/'owner-test.cjs'),str(R/'dev/avoidance/domino82/owned-plan82aa/deps/scalar-metrics80k.js'),str(R/'src/11p_layoutsEe_bulbs_geometry68.js')],check=True)
