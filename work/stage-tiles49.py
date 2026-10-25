"""Parent Git orchestration: one reviewed literal allowlist, private index only."""
from pathlib import Path
import json,hashlib,subprocess,sys
R=Path('/workspace/lyricfx.JIZURA');S=R/'tasks/evidence/AVOID-009/tiles-canonical49/parent-commit-selection49.json';a=json.loads(S.read_text());helper=R/'work/avoid009-capacity-pilethin07/private_index_resume07.py'
assert hashlib.sha256(helper.read_bytes()).hexdigest()=='63172e88307e9d1d38953432ec59709b60cdd76012bff0b6e433c868f2bb3cd8'
assert hashlib.sha256((R/'.git/index').read_bytes()).hexdigest()==a['baseROOTIndexSHA256']
for p in a['selection']:
 q=R/p['path'];assert not q.is_symlink();b=q.read_bytes();assert len(b)==p['bytes'] and hashlib.sha256(b).hexdigest()==p['sha256'],q
args=['add','--']+[p['path'] for p in a['selection']]+[str(S.relative_to(R))]
subprocess.run([sys.executable,'-B',str(helper),'RUN','--round','2','--expected-head',a['baseHEAD'],'--argv-json',json.dumps(args)],check=True)
