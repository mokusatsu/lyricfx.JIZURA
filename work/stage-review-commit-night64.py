from pathlib import Path
import subprocess,json,os,hashlib
R=Path('/workspace/lyricfx.JIZURA');A=R/'tasks/evidence/AVOID-009/evening-20261024/storage-capacity-objects15/stage64-allowlist.json';a=json.loads(A.read_text());files=[x['path'] for x in a['files']]+[str(A.relative_to(R))];helper=['python','-B','work/avoid009-capacity-objects15/private_index_resume15.py','RUN','--round','1','--expected-head',a['head'],'--argv-json']
subprocess.run(helper+[json.dumps(['add','--',*files])],check=True)
e=os.environ.copy();e['GIT_INDEX_FILE']='/dev/shm/avoid009-evening-20261024/evening-resume15-index-round-1';e['GIT_OPTIONAL_LOCKS']='0'
def g(args):return subprocess.check_output(['git','-c','gc.auto=0','-c','maintenance.auto=false',*args],cwd=R,env=e)
changed=g(['diff','--cached','--name-only','-z']).decode().strip('\0').split('\0');assert set(changed)<=set(files) and len(changed)>50;assert not any(x.startswith(('src/','app/')) or x in ['index.html','en/index.html'] for x in changed)
for x in changed:assert g(['show',':'+x])==(R/x).read_bytes(),x
for x in a['files']:assert (R/x['path']).stat().st_size==x['bytes'] and hashlib.sha256((R/x['path']).read_bytes()).hexdigest()==x['sha256']
q=subprocess.run(['git','diff','--cached','--check'],cwd=R,env=e,stdout=subprocess.PIPE,stderr=subprocess.PIPE);assert q.returncode==0,(q.stdout.decode(),q.stderr.decode())
print(json.dumps({'stagedFiles':len(changed),'everyStagedByteReviewedAgainstROOT':True,'explicitAllowlistOnly':True,'diffCheck':0}),flush=True)
subprocess.run(helper+[json.dumps(['commit','-m','AVOID-009 prepare native bulbs comparison and queue human motion review'])],check=True)
