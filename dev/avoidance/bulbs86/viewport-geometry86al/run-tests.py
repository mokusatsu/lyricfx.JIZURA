from pathlib import Path
from fractions import Fraction as F
import json,subprocess,sys,tempfile
root=Path(sys.argv[1]).resolve();d=root/'dev/avoidance/bulbs86/viewport-geometry86al'
with tempfile.TemporaryDirectory()as t:
 out=Path(t);subprocess.run([sys.executable,str(d/'generate.py'),str(root),str(out)],check=True);assert(out/'geometry86.js').read_bytes()==(d/'geometry86.js').read_bytes()
 fixture=out/'circles.json';subprocess.run(['node',str(d/'geometry-test.cjs'),str(root/'src/11p_layoutsEe_bulbs_geometry68.js'),str(out/'geometry86.js'),str(fixture)],check=True)
 rows=json.loads(fixture.read_text())
 for r in rows:
  c=r['canonical'];x=r['circle'];s=F(r['baseScale']);error=abs(F(x['cx'])-F(c['cx'])*s)+abs(F(x['cy'])-F(c['cy'])*s)
  assert F(x['r'])>=F(c['r'])*s+error;assert F(x['margin'])>=F(c['margin'])*s;assert F(x['margin'])>=2
 print(json.dumps({'fractionChecks':len(rows)*3,'circles':len(rows)}))
