"""Parent freeze exact current native JAEN bytes. No application/image/public access."""
from pathlib import Path
import hashlib,json,os
R=Path('/workspace/lyricfx.JIZURA');B=Path('/dev/shm/avoid009-evening-20261024/billboard63.before01');E=R/'tasks/evidence/AVOID-009/billboard-canonical63';B.mkdir();E.mkdir(exist_ok=True);H=lambda b:hashlib.sha256(b).hexdigest();pins=json.loads((R/'work/avoid009-billboard62-native/evidence/pins62.json').read_text());rows=[]
for name in ['index.html','en/index.html']:
 b=(R/name).read_bytes();x=next(x for x in pins['files'] if x['path']==name);assert len(b)==x['bytes'] and H(b)==x['sha256'];out=B/('ja.html' if name=='index.html' else 'en.html')
 with out.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 assert out.read_bytes()==b;rows.append({'source':name,'frozen':str(out),'bytes':len(b),'sha256':H(b)})
p=E/'frozen-before63.json';assert not p.exists();p.write_text(json.dumps(rows,indent=2)+'\n');print(json.dumps({'manifest':str(p),'manifestSHA256':H(p.read_bytes()),'rows':rows}))
