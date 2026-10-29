from pathlib import Path
import subprocess,sys
D=Path(__file__).resolve().parent
R=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else next(p for p in D.parents if (p/'src/11p_layoutsD.js').exists())
subprocess.run(['node',str(D/'bounds-test.cjs'),str(R/'dev/avoidance/domino82/affine82c/affine-support82.js')],check=True)
