from pathlib import Path
import json,hashlib,sys,subprocess
D=Path(__file__).resolve().parent
R=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else next(p for p in D.parents if (p/'src/11zz04_bulbs_scalar80.js').exists())
m=json.loads((D/'manifest.json').read_text())
for group,root in [('files',D),('dependencies',R)]:
 for row in m[group]:
  p=root/row['path'];assert p.stat().st_size==row['bytes'] and hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256'],row['path']
subprocess.run(['node','--check',str(D/'clock-union84.js')],check=True)
subprocess.run(['node',str(D/'compiler-test.cjs'),*[str(R/p) for p in m['testDependencies']]],check=True)
