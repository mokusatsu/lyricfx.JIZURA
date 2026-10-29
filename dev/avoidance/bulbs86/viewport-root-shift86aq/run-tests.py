from pathlib import Path
import subprocess,sys
root=Path(sys.argv[1]).resolve();d=root/'dev/avoidance/bulbs86/viewport-root-shift86aq';subprocess.run(['node','--check',str(d/'diagnostic86.js')],check=True)
if len(sys.argv)>2:
 for file in ['check-roots.py','check-shift.py']:subprocess.run([sys.executable,str(d/file),sys.argv[2]],check=True)
print('syntax PASS; optional raw audits require original external pinned files')
