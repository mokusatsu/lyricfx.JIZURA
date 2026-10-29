from pathlib import Path
import subprocess,tempfile,shutil,sys
D=Path(__file__).resolve().parent
R=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else next(p for p in D.parents if (p/'src/11p_layoutsD.js').exists())
with tempfile.TemporaryDirectory(prefix='burst83f-') as td:
 t=Path(td);c=t/'83c';f=t/'83f';c.mkdir();f.mkdir()
 shutil.copy2(R/'dev/avoidance/burst83/native-input83c/prepare-source.py',c/'prepare-source.py')
 shutil.copy2(D/'prepare-source.py',f/'prepare-source.py')
 subprocess.run([sys.executable,str(c/'prepare-source.py'),str(R/'src/11p_layoutsD.js')],check=True)
 subprocess.run([sys.executable,str(f/'prepare-source.py'),str(c/'11p_layoutsD-input83.js')],check=True)
 for n in ['boundary.json','source-from83c.diff']:assert (f/n).read_bytes()==(D/n).read_bytes(),n
 subprocess.run(['node',str(D/'bounds-test.cjs'),str(R/'dev/avoidance/domino82/affine82c/affine-support82.js')],check=True)
