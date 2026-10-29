from pathlib import Path
import subprocess,sys
r=Path(sys.argv[1]).resolve();d=Path(__file__).resolve().parent
names=['plan-binding83.js','private-controller83.js','prepared-handoff83.js']
before={n:(d/n).read_bytes()for n in names}
subprocess.run([sys.executable,str(d/'generate.py'),str(r)],check=True)
assert all((d/n).read_bytes()==before[n]for n in names)
for p in d.glob('*.js'):subprocess.run(['node','--check',str(p)],check=True)
subprocess.run(['node',str(d/'controller-test.cjs'),str(r/'src/11zz04_bulbs_scalar80.js'),str(r/'src/11p_layoutsEe_bulbs_geometry68.js')],check=True)
subprocess.run(['node',str(d/'handoff-test.cjs'),str(r/'src/11zz04_bulbs_scalar80.js'),str(r/'src/09k_layoutsD_placement.js'),str(r/'dev/avoidance/burst83/prepare-stage83aj/finalizer-input83.js')],check=True)
