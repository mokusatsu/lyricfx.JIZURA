"""Parent scoped evidence-only staging/review. Official keeper only."""
from pathlib import Path
import json,subprocess,os,hashlib
R=Path('/workspace/lyricfx.JIZURA');E=R/'tasks/evidence/AVOID-009/billboard-native62';H=lambda b:hashlib.sha256(b).hexdigest();helper=R/'work/avoid009-capacity-objects15/private_index_resume15.py';assert H(helper.read_bytes())=='e0441dae3550e41eb0897f652ec1c6b1f3122c9586ce3a11c3b2fbda964fa2ec';assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip()=='52d26b3ca160995d5940ed0f2c227c37b383c9c2'
files={'AGENTS.md','tasks/AVOID-009.md','tasks/evidence/AVOID-009/batch-20261023/progress.json','tasks/evidence/AVOID-009/batch-20261023/resume-checkpoint.md','tasks/reviews/AVOID-009-billboard-native62.md'}
for base in ['tasks/evidence/AVOID-009/billboard-native61','tasks/evidence/AVOID-009/billboard-native62']:
 for p in (R/base).rglob('*'):
  assert not p.is_symlink()
  if p.is_file():files.add(str(p.relative_to(R)))
for name in ['evening-resume15-index-round-1-receipt.json','push64-operation.json']:files.add('tasks/evidence/AVOID-009/evening-20261024/storage-capacity-objects15/'+name)
for p in (R/'tasks/evidence/AVOID-009/night-20261024/command-receipts').glob('*.json'):
 if p.name.startswith(('billboard61-','billboard62-','night64-')):files.add(str(p.relative_to(R)))
changed=[]
for f in sorted(files):
 assert (R/f).is_file()
 q=subprocess.run(['git','show','HEAD:'+f],cwd=R,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL)
 if q.returncode or q.stdout!=(R/f).read_bytes():changed.append(f)
allow=E/'checkpoint62-allowlist.json';assert not allow.exists();allow.write_text(json.dumps({'files':changed,'noProductChanges':True,'helperRound':2,'priorHEAD':'52d26b3ca160995d5940ed0f2c227c37b383c9c2'},indent=2)+'\n');changed.append(str(allow.relative_to(R)))
subprocess.run(['python','-B',str(helper),'RUN','--round','2','--expected-head','52d26b3ca160995d5940ed0f2c227c37b383c9c2','--argv-json',json.dumps(['add','--',*changed])],cwd=R,check=True)
env=dict(os.environ,GIT_INDEX_FILE='/dev/shm/avoid009-evening-20261024/evening-resume15-index-round-2',GIT_OPTIONAL_LOCKS='0');git=lambda a:subprocess.check_output(['git','-c','gc.auto=0','-c','maintenance.auto=false',*a],cwd=R,env=env);actual=git(['diff','--cached','--name-only','-z']).decode().split('\0')[:-1];assert set(actual)==set(changed),(set(actual)-set(changed),set(changed)-set(actual));rows=[]
for f in actual:
 b=git(['show',':'+f]);assert b==(R/f).read_bytes();rows.append({'path':f,'bytes':len(b),'sha256':H(b)})
check=subprocess.run(['git','diff','--cached','--check'],cwd=R,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT);assert check.returncode==0,check.stdout.decode();receipt={'state':'PARENT_ALL_SCOPED_STAGED_BYTES_REVIEWED','files':len(rows),'totalBytes':sum(x['bytes'] for x in rows),'diffCheckExit':check.returncode,'noProductChanges':True,'ROOTIndexSHA256':H((R/'.git/index').read_bytes()),'privateIndexSHA256':H(Path(env['GIT_INDEX_FILE']).read_bytes()),'inventory':rows};(E/'checkpoint62-staged-review.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({k:v for k,v in receipt.items() if k!='inventory'}))
