from pathlib import Path
import sys,json,hashlib,subprocess
D=Path(__file__).resolve().parent
R=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else next(p for p in D.parents if (p/'src/11zz04_bulbs_scalar80.js').exists())
m=json.loads((D/'manifest.json').read_text())
for group,root in [('files',D),('dependencies',R)]:
 for row in m[group]:
  b=(root/row['path']).read_bytes();assert len(b)==row['bytes'] and hashlib.sha256(b).hexdigest()==row['sha256'],row['path']
subprocess.run(['node','--check',str(D/'candidates85.js')],check=True)
subprocess.run(['node',str(D/'candidate-test.cjs'),str(R/'src/11zz04_bulbs_scalar80.js'),str(R/'src/11p_layoutsEe_bulbs_geometry68.js'),str(R/'dev/avoidance/domino82/affine82c/affine-support82.js')],check=True)
