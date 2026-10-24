from pathlib import Path
import json,hashlib,shutil,subprocess,os
b=Path('/dev/shm/avoid009-evening-20261024');repo=b/'source';dest=repo/'private-evidence/AVOID-009/magnets-media02-tiles34-20261024';assert not dest.exists()
e=os.environ.copy()
for k in ['GIT_INDEX_FILE','GIT_DIR','GIT_WORK_TREE','GIT_COMMON_DIR','GIT_OBJECT_DIRECTORY','GIT_ALTERNATE_OBJECT_DIRECTORIES']:e.pop(k,None)
def git(args):return subprocess.run(['git','-c','gc.auto=0','-c','maintenance.auto=false','-C',str(repo),*args],env=e,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE).stdout
assert git(['rev-parse','HEAD']).decode().strip()=='33de9dfdc2844c8cb7497712b4773d23d36b6f65'
assert not git(['status','--porcelain=v1','--untracked-files=all']).strip()
protected=json.loads((b/'source-open-evening03.json').read_text())['protectedTree']
def h(p):return hashlib.sha256(p.read_bytes()).hexdigest()
for rel,v in protected.items():assert (repo/rel).stat().st_size==v['bytes'] and h(repo/rel)==v['sha256']
assert h(b/'magnets-media02/manifest.json')=='673c547f2cf2b5eee64db3ec33aa5a5d5db55e492a7861b6107b6e522a13e9ab'
assert h(b/'native34.raw.json.gz')=='cc5902485d1e1151b126e0db7f485ed43fbddb9916db2cfd9ddc29d8a38c09e5'
dest.mkdir(parents=True)
for name in ['magnets-media01','magnets-media02']:shutil.copytree(b/name,dest/name)
for path,name in [('/tmp/avoid009-magnets-media-prep01','prep01'),('/tmp/avoid009-magnets-media-prep02','prep02'),('/tmp/avoid009-tiles-native34','tiles34')]:shutil.copytree(path,dest/name)
p=dest/'parent-review';p.mkdir()
root=Path('/workspace/lyricfx.JIZURA/tasks/evidence/AVOID-009/magnets-media02')
for name in ['parent-media02-review.json','visual02-review.json','seal.media02.json','parent-media-gate02.json']:shutil.copy2(root/name,p/name)
for name in ['review-media02.py','freeze-magnets-media02.py']:shutil.copy2(Path('/tmp/avoid009-evening-parent')/name,p/name)
files=[]
for f in sorted(dest.rglob('*')):
 assert not f.is_symlink()
 if f.is_file():files.append({'path':str(f.relative_to(dest)),'bytes':f.stat().st_size,'sha256':h(f)})
manifest={'kind':'private-unserved-source-raw-media-backup','files':files,'failedMedia01Preserved':True,'media02NativeRawAccepted':True,'visual02':'PASS14-static-only','humanMotion':'PENDING','tiles34':'native-catalog-under-parent-review; three-zero-replay-transport-failures-not-qualified','publicChecks':0,'parentImagesViewed':0}
(dest/'backup-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
git(['add','--',str(dest.relative_to(repo))]);git(['-c','user.name=Codex','-c','user.email=codex@openai.com','commit','-m','AVOID-009 preserve magnets native media and tiles34 diagnostics privately'])
head=git(['rev-parse','HEAD']).decode().strip();assert not git(['status','--porcelain=v1','--untracked-files=all']).strip()
for rel,v in protected.items():assert h(repo/rel)==v['sha256']
r={'sourceHEAD':head,'privatePrefix':str(dest.relative_to(repo)),'files':len(files)+1,'bytes':sum(x['bytes'] for x in files),'push':'pending','publicChecks':0};(b/'private-media02-stage-receipt.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))
