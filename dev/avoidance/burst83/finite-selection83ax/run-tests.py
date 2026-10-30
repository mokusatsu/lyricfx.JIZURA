from pathlib import Path
import subprocess,sys,tempfile,shutil
r=Path(sys.argv[1]).resolve();d=Path(__file__).resolve().parent;before=(d/'private-controller83.js').read_bytes();subprocess.run([sys.executable,str(d/'generate.py'),str(r)],check=True);assert (d/'private-controller83.js').read_bytes()==before
subprocess.run(['node','--check',str(d/'private-controller83.js')],check=True);subprocess.run(['node',str(d/'selection-test.cjs')],check=True)
with tempfile.TemporaryDirectory(prefix='burst83ax-controller-')as t:
 p=Path(t);old=r/'dev/avoidance/burst83/formal-binding83av'
 for n in ['plan-binding83.js','controller-test.cjs']:shutil.copy2(old/n,p/n)
 shutil.copy2(d/'private-controller83.js',p/'private-controller83.js');subprocess.run(['node',str(p/'controller-test.cjs'),str(r/'src/11zz04_bulbs_scalar80.js'),str(r/'src/11p_layoutsEe_bulbs_geometry68.js')],check=True)
print('exact regeneration, syntax, 1681 proposal assertions and unchanged35 controller/registry mocks passed')
