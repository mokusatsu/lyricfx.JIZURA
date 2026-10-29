from pathlib import Path
import sys,json,hashlib,subprocess
D=Path(__file__).resolve().parent
R=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else next(p for p in D.parents if (p/'src/09k_layoutsD_placement.js').exists())
m=json.loads((D/'manifest.json').read_text())
for group,root in [('files',D),('dependencies',R)]:
 for row in m[group]:
  p=root/row['path'];assert p.stat().st_size==row['bytes'] and hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256'],row['path']
args=[str(R/'src/11zz04_bulbs_scalar80.js'),str(R/'src/09k_layoutsD_placement.js'),str(R/'dev/avoidance/burst83/prepare-stage83aj/finalizer-input83.js')]
subprocess.run(['node',str(D/'handoff-test.cjs'),*args],check=True)
subprocess.run(['node',str(D/'oracle-test.cjs'),*args,str(R/'dev/avoidance/burst83/prepared-handoff83am/prepared-handoff83.js')],check=True)
