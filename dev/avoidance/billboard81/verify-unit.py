from pathlib import Path
import json,hashlib
D=Path(__file__).resolve().parent;m=json.loads((D/'source-manifest.json').read_text())
for x in m['files']:
 b=(D/x['path']).read_bytes();assert len(b)==x['bytes']and hashlib.sha256(b).hexdigest()==x['sha256'],x['path']
print(json.dumps({'files':len(m['files']),'status':'PASS','CanvasExecuted':False,'productRegistered':False}))
