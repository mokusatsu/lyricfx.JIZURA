from pathlib import Path
import sys,json,hashlib,subprocess,tempfile,shutil
D=Path(__file__).resolve().parent
R=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else next(p for p in D.parents if (p/'src/11p_layoutsD.js').exists())
m=json.loads((D/'manifest.json').read_text())
for group,root in [('files',D),('dependencies',R)]:
 for row in m[group]:
  b=(root/row['path']).read_bytes();assert len(b)==row['bytes'] and hashlib.sha256(b).hexdigest()==row['sha256'],row['path']
with tempfile.TemporaryDirectory(prefix='crossword85a-')as t:
 T=Path(t)
 for name in ['prepare-source.py','native-test.cjs']:shutil.copyfile(D/name,T/name)
 subprocess.run([sys.executable,str(T/'prepare-source.py'),str(R/'src/11p_layoutsD.js')],check=True)
 for name in ['native-input85.js','native-reference.js.txt','boundary.json']:assert (T/name).read_bytes()==(D/name).read_bytes(),name
 subprocess.run(['node','--check',str(T/'native-input85.js')],check=True)
 subprocess.run(['node',str(T/'native-test.cjs'),str(R/'src/01_util.js'),str(R/'src/11p_layoutsD.js')],check=True)
