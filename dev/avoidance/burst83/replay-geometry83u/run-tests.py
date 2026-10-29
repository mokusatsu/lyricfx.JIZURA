from pathlib import Path
import subprocess,tempfile,shutil,sys
D=Path(__file__).resolve().parent
R=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else next(p for p in D.parents if (p/'src/11p_layoutsD.js').exists())
with tempfile.TemporaryDirectory(prefix='burst83n-') as td:
 t=Path(td);shutil.copy2(R/'dev/avoidance/burst83/native-input83c/prepare-source.py',t/'prepare-source.py')
 subprocess.run([sys.executable,str(t/'prepare-source.py'),str(R/'src/11p_layoutsD.js')],check=True)
 subprocess.run(['node',str(D/'sample-test.cjs'),str(t/'11p_layoutsD-input83.js'),str(R/'src/01_util.js'),str(R/'src/11p_layoutsEe_bulbs_geometry68.js'),str(R/'dev/avoidance/burst83/native83a/native-geometry83.js'),str(R/'dev/avoidance/burst83/native-parts83b/native-parts83.js'),str(R/'dev/avoidance/burst83/half83e/half-layout83.js'),str(R/'dev/avoidance/domino82/affine82c/affine-support82.js'),str(R/'dev/avoidance/domino82/owned-plan82aa/deps/scalar-metrics80k.js')],check=True)

subprocess.run(['node',str(D/'compiler-test.cjs'),str(R/'dev/avoidance/domino82/owned-plan82aa/deps/scalar-metrics80k.js')],check=True)
