from pathlib import Path
import sys,json,hashlib,tempfile,shutil,subprocess
D=Path(__file__).resolve().parent
R=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else next(p for p in D.parents if (p/'src/11p_layoutsD.js').exists())
m=json.loads((D/'manifest.json').read_text())
for group,root in [('files',D),('dependencies',R)]:
 for row in m[group]:
  p=root/row['path'];assert p.stat().st_size==row['bytes'] and hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256'],row['path']
with tempfile.TemporaryDirectory(prefix='contour84d-') as td:
 t=Path(td)
 for name in ['prepare-family.py','hero-support84.js','hero-test.cjs']:shutil.copy2(D/name,t/name)
 native=R/'dev/avoidance/contour84/native84a/native-geometry84.js'
 subprocess.run([sys.executable,str(t/'prepare-family.py'),str(native)],check=True)
 for name in ['hero-family84.js','family-from84a.patch','boundary.json']:assert(t/name).read_bytes()==(D/name).read_bytes(),name
 for name in ['hero-family84.js','hero-support84.js']:subprocess.run(['node','--check',str(t/name)],check=True)
 subprocess.run(['node',str(t/'hero-test.cjs'),str(R/'src/01_util.js'),str(R/'src/11zz04_bulbs_scalar80.js'),str(R/'dev/avoidance/domino82/affine82c/affine-support82.js'),str(native)],check=True)
