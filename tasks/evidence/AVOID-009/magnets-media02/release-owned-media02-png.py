from pathlib import Path
import json,hashlib,subprocess,os
b=Path('/dev/shm/avoid009-evening-20261024');repo=b/'source';root=Path('/workspace/lyricfx.JIZURA');ev=root/'tasks/evidence/AVOID-009/magnets-media02';r=json.loads((ev/'parent-media02-review.json').read_text());head='1bbb2fb78737dbfa34d15f85b919d97bbb68d345';prefix='private-evidence/AVOID-009/magnets-media02-tiles34-20261024/magnets-media02/evidence/images/'
assert json.loads((ev/'private-media02-push-receipt.json').read_text())['head']==head
assert json.loads((ev/'visual02-review.json').read_text())
e=os.environ.copy()
for k in ['GIT_INDEX_FILE','GIT_DIR','GIT_WORK_TREE','GIT_COMMON_DIR','GIT_OBJECT_DIRECTORY','GIT_ALTERNATE_OBJECT_DIRECTORIES']:e.pop(k,None)
def git(args):return subprocess.check_output(['git','-c','gc.auto=0','-c','maintenance.auto=false','-C',str(repo),*args],env=e)
def h(v):return hashlib.sha256(v).hexdigest()
assert git(['rev-parse','HEAD']).decode().strip()==head
pins=[]
for p in r['proofImages']:
 q=Path(p['path']);assert q.parent==ev/'local-proof/images' and not q.is_symlink();raw=q.read_bytes();rel=prefix+q.name;blob=git(['rev-parse',head+':'+rel]).decode().strip();data=git(['cat-file','blob',blob]);assert data==raw==(b/'magnets-media02/evidence/images'/q.name).read_bytes();assert len(raw)==p['bytes'] and h(raw)==p['sha256'];assert not subprocess.check_output(['git','-C',str(root),'ls-files','--',str(q.relative_to(root))],env=e).strip();pins.append({**p,'sourceCommit':head,'sourcePath':rel,'blob':blob,'allocatedBytes':q.stat().st_blocks*512})
assert len(pins)==14
receipt={'kind':'owned-untracked-working-png-release-after-private-source-push','files':pins,'sourceCommit':head,'bytes':sum(x['bytes'] for x in pins),'allocatedBytes':sum(x['allocatedBytes'] for x in pins),'old54FlagsUntouched':True,'parentImagesViewed':0,'publicChecks':0,'restore':'Read each exact blob from existing private Source Git commit, verify SHA256 and byte count, recreate original local proof path. No public asset fetch needed.'}
(ev/'owned-proof-png-release02.json').write_text(json.dumps(receipt,indent=2)+'\n')
for p in pins:Path(p['path']).unlink()
print(json.dumps({k:v for k,v in receipt.items() if k!='files'}))
