from pathlib import Path
import tempfile,shutil,subprocess,sys
D=Path(__file__).resolve().parent
R=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else next(p for p in D.parents if (p/'src/11p_layoutsD.js').exists())
with tempfile.TemporaryDirectory(prefix="burst83ad-") as td:
 t=Path(td)
 for n in ["prepare-source.py","prepare-renderer.py","seam-test.cjs","renderer-prefix-test.cjs"]:shutil.copy2(D/n,t/n)
 shutil.copy2(R/'dev/avoidance/burst83/native-input83c/prepare-source.py',t/'prepare-native.py')
 subprocess.run([sys.executable,str(t/'prepare-native.py'),str(R/'src/11p_layoutsD.js')],check=True)
 subprocess.run([sys.executable,str(t/'prepare-source.py'),str(R)],check=True)
 subprocess.run([sys.executable,str(t/'prepare-renderer.py'),str(R/'src/09_render.js')],check=True)
 for n in ["source-from83c.patch","renderer-frame.patch","boundary.json","renderer-boundary.json"]:assert(t/n).read_bytes()==(D/n).read_bytes(),n
 subprocess.run(["node",str(t/'seam-test.cjs'),str(t/'11p_layoutsD-input83.js'),str(R/'src/01_util.js'),str(R/'src/11p_layoutsEe_bulbs_geometry68.js'),str(R/'dev/avoidance/burst83/half83e/half-layout83.js'),str(R/'dev/avoidance/domino82/owned-plan82aa/deps/scalar-metrics80k.js')],check=True)
 subprocess.run(["node",str(t/'renderer-prefix-test.cjs')],check=True)
