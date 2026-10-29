from pathlib import Path
import tempfile,shutil,subprocess,sys,json,hashlib
D=Path(__file__).resolve().parent
R=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else next(p for p in D.parents if (p/'src/11p_layoutsD.js').exists())
m=json.loads((D/'manifest.json').read_text())
for group,root in [('files',D),('dependencies',R)]:
 for row in m[group]:
  p=root/row['path'];assert p.stat().st_size==row['bytes'] and hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256'],row['path']
with tempfile.TemporaryDirectory(prefix='contour84a-') as td:
 t=Path(td);shutil.copy2(D/'prepare-source.py',t/'prepare-source.py');shutil.copy2(D/'native-test.cjs',t/'native-test.cjs')
 subprocess.run([sys.executable,str(t/'prepare-source.py'),str(R/'src/11p_layoutsD.js')],check=True)
 for name in ['native-geometry84.js','native-ring-reference.js.txt','boundary.json']:assert(t/name).read_bytes()==(D/name).read_bytes(),name
 subprocess.run(['node','--check',str(t/'native-geometry84.js')],check=True)
 subprocess.run(['node',str(t/'native-test.cjs'),str(R/'src/01_util.js')],check=True)
