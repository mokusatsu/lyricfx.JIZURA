from pathlib import Path
import tempfile,shutil,subprocess,sys,json,hashlib
D=Path(__file__).resolve().parent
R=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else next(p for p in D.parents if (p/'src/11p_layoutsD.js').exists())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads((D/'manifest.json').read_text())
for row in m['files']:
 p=D/row['path'];assert p.stat().st_size==row['bytes'] and sha(p)==row['sha256'],row['path']
for row in m['dependencies']:
 p=R/row['path'];assert p.stat().st_size==row['bytes'] and sha(p)==row['sha256'],row['path']
with tempfile.TemporaryDirectory(prefix='burst83ag-test-') as td:
 t=Path(td)
 for p in D.iterdir():
  if p.is_file():shutil.copy2(p,t/p.name)
 for name in ['prepare-seams.py','prepare-controller.py']:subprocess.run([sys.executable,str(t/name),str(R)],check=True)
 for name in ['private-controller83.js','controller-from83z.patch','controller-boundary.json','11p_layoutsD-controller83.js.patch','09_render-controller83.js.patch','seam-boundary.json']:assert (t/name).read_bytes()==(D/name).read_bytes(),name
 for row in m['generated']:
  p=t/row['path'];assert p.stat().st_size==row['bytes'] and sha(p)==row['sha256'],row['path']
 for name in ['private-controller83.js','11p_layoutsD-controller83.js','09_render-controller83.js']:subprocess.run(['node','--check',str(t/name)],check=True)
 args=[str(R/'src/11zz04_bulbs_scalar80.js'),str(R/'src/11p_layoutsEe_bulbs_geometry68.js')]
 subprocess.run(['node',str(t/'controller-test.cjs'),*args],check=True)
 for mode in ['source-first','frame-first','replaced']:subprocess.run(['node',str(t/'install-test.cjs'),*args,mode],check=True)
 subprocess.run(['node',str(t/'renderer-gate-test.cjs')],check=True)
