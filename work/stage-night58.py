from pathlib import Path
import hashlib,json,subprocess
R=Path('/workspace/lyricfx.JIZURA');P=R/'tasks/evidence/AVOID-009/evening-20261024/storage-capacity-card08/stage58-allowlist.json';a=json.loads(P.read_text());H=R/'work/avoid009-capacity-card08/private_index_resume08.py';assert hashlib.sha256(H.read_bytes()).hexdigest()==a['helperSHA256'];assert hashlib.sha256((R/'.git/index').read_bytes()).hexdigest()==a['ROOTIndexSHA256']
for p in a['files']:assert hashlib.sha256((R/p['path']).read_bytes()).hexdigest()==p['sha256']
subprocess.run(['python','-B',str(H),'RUN','--round','1','--expected-head',a['head'],'--argv-json',json.dumps(['add','--',*[p['path']for p in a['files']],str(P.relative_to(R))])],check=True)
