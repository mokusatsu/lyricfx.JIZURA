from pathlib import Path
import shutil,subprocess,sys,tempfile
root=Path(sys.argv[1]).resolve();d=root/'dev/avoidance/bulbs86/binding-account86bc';old=root/'dev/avoidance/bulbs80/binding80t'
with tempfile.TemporaryDirectory()as t:
 out=Path(t);subprocess.run([sys.executable,str(d/'generate.py'),str(root),str(out)],check=True);assert(out/'plan-binding86.js').read_bytes()==(d/'plan-binding86.js').read_bytes();subprocess.run(['node','--check',str(out/'plan-binding86.js')],check=True)
 for audit in [False,True]:
  s=(out/'plan-binding86.js').read_text();(out/'plan-binding80.js').write_text(s.replace('const audit86bc=false;','const audit86bc=true;')if audit else s)
  for file in ['plan-binding80-test.cjs','09k_layoutsD_placement.js']:shutil.copy2(old/file,out/file)
  test=(out/'plan-binding80-test.cjs').read_text()+'\n'+(d/'cache-test-fragment.cjs').read_text();(out/'plan-binding80-test.cjs').write_text(test)
  subprocess.run(['node',str(out/'plan-binding80-test.cjs'),'audit' if audit else 'normal'],check=True)
