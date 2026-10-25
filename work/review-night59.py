from pathlib import Path
import os,json,subprocess,hashlib
R=Path('/workspace/lyricfx.JIZURA'); B=Path('/dev/shm/avoid009-evening-20261024');a=json.loads((R/'tasks/evidence/AVOID-009/evening-20261024/storage-capacity-writing09/stage59-allowlist.json').read_text());e=os.environ.copy();e['GIT_INDEX_FILE']=str(B/'evening-resume09-index-round-1');e['GIT_OPTIONAL_LOCKS']='0'
def g(args):return subprocess.run(['git','-c','gc.auto=0','-c','maintenance.auto=false',*args],cwd=R,env=e,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
p=g(['diff','--cached','--name-only','-z']);assert p.returncode==0;names=p.stdout.decode().strip('\0').split('\0');allowed={x['path'] for x in a['files']}|{'tasks/evidence/AVOID-009/evening-20261024/storage-capacity-writing09/stage59-allowlist.json'};assert set(names)<=allowed;assert not any(x.startswith(('src/','app/')) or x in ['index.html','en/index.html'] for x in names)
for x in a['files']:
 if x['path'] in names:
  q=g(['show',':'+x['path']]);assert q.returncode==0 and hashlib.sha256(q.stdout).hexdigest()==x['sha256']
c=g(['diff','--cached','--check']);print(json.dumps({'paths':len(names),'exactAllowlistAndBytes':True,'diffCheckReturnCode':c.returncode,'diffCheck':c.stdout.decode(),'stderr':c.stderr.decode(),'privateIndexSHA256':hashlib.sha256((B/'evening-resume09-index-round-1').read_bytes()).hexdigest()},indent=2))
