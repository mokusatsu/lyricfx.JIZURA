from pathlib import Path
import subprocess,sys,tempfile,shutil
r=Path(sys.argv[1]).resolve();d=Path(__file__).resolve().parent
with tempfile.TemporaryDirectory() as t:
 p=Path(t);shutil.copy2(d/'generate.py',p/'generate.py');subprocess.run([sys.executable,str(p/'generate.py'),str(r)],check=True)
 for x in p.glob('*.js'):
  assert x.read_bytes()==(d/x.name).read_bytes(),x.name
  subprocess.run(['node','--check',str(x)],check=True)
subprocess.run(['node',str(d/'scope-test.cjs')],check=True)
print('exact regeneration and JS syntax passed')
