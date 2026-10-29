from pathlib import Path
import subprocess,sys,tempfile
root=Path(sys.argv[1]).resolve();d=root/'dev/avoidance/bulbs86/viewport-work-account86ba'
with tempfile.TemporaryDirectory()as t:
 out=Path(t);subprocess.run([sys.executable,str(d/'generate.py'),str(root),str(out)],check=True);assert(out/'replay86.js').read_bytes()==(d/'replay86.js').read_bytes();subprocess.run(['node','--check',str(out/'replay86.js')],check=True)
 for variant,audit in [('normal',False),('audit',True)]:
  p=out/(variant+'.js');s=(out/'replay86.js').read_text();assert s.count('const audit86ba=false;')==1;p.write_text(s.replace('const audit86ba=false;','const audit86ba=true;')if audit else s)
  subprocess.run(['node',str(d/'replay-test.cjs'),str(p),str(root/'dev/avoidance/bulbs86/viewport-controller86ax/replay86.js'),str(root/'src/11zz04_bulbs_scalar80.js')],check=True)
