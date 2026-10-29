from pathlib import Path
import json,hashlib,tempfile,shutil,subprocess,sys
D=Path(__file__).resolve().parent
R=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else next(p for p in D.parents if (p/'src/11p_layoutsD.js').exists())
m=json.loads((D/'manifest.json').read_text())
for group,root in [('files',D),('dependencies',R)]:
 for row in m[group]:
  p=root/row['path'];assert p.stat().st_size==row['bytes'] and hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256'],row['path']
with tempfile.TemporaryDirectory(prefix='contour84b-') as td:
 t=Path(td)
 for name in ['prepare-source.py','body-test.cjs']:shutil.copy2(D/name,t/name)
 subprocess.run([sys.executable,str(t/'prepare-source.py'),str(R/'src/11p_layoutsD.js')],check=True)
 for name in ['body-input84.js','native-body-reference.js.txt','native-helpers-reference.js.txt','boundary.json']:assert(t/name).read_bytes()==(D/name).read_bytes(),name
 subprocess.run(['node','--check',str(t/'body-input84.js')],check=True)
 subprocess.run(['node',str(t/'body-test.cjs'),str(R/'src/01_util.js'),str(R/'src/06_layouts.js'),str(R/'src/08_planner.js'),str(R/'dev/avoidance/contour84/native84a/native-geometry84.js')],check=True)
