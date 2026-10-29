from pathlib import Path
import subprocess,sys,tempfile
root=Path(sys.argv[1]).resolve();d=root/'dev/avoidance/bulbs86/viewport-create-profile86az'
with tempfile.TemporaryDirectory()as t:
 out=Path(t);subprocess.run([sys.executable,str(d/'generate.py'),str(root),str(out)],check=True)
 for name in ['codec86.js','model-owner86.js','replay86.js']:
  assert(out/name).read_bytes()==(d/name).read_bytes();subprocess.run(['node','--check',str(out/name)],check=True)
 s=(root/'dev/avoidance/bulbs86/viewport-handoff86aw/owner-test.cjs').read_text().replace('const context={J,','const context={performance,J,')
 # 8KiB diagnostic reservation now trips the existing external-reservation gate first.
 old="extraBytes=8310000;reject(()=>O.evaluateViewport86am(x.token),'BULBS80N_MEMORY_BUDGET')";assert s.count(old)==1;s=s.replace(old,"extraBytes=8310000;reject(()=>O.evaluateViewport86am(x.token),'BULBS80O_EXTERNAL_RESERVATION')")
 (out/'owner-test.cjs').write_text(s);subprocess.run(['node',str(out/'owner-test.cjs'),str(root/'src/11zz05_bulbs_renderer_time80.js')],check=True)
