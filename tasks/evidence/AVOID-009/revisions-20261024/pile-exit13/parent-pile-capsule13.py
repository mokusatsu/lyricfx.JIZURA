import json,tarfile,hashlib,pathlib,shutil
R=pathlib.Path('/tmp/avoid009-pile-exit13')
m=json.loads((R/'capsule-manifest.json').read_text())
c=json.loads((R/'capsule-receipt.json').read_text())
sha=lambda b:hashlib.sha256(b).hexdigest()
assert sha((R/'pile-exit13-thin.tar.gz').read_bytes())==c['sha256']
assert sha((R/'capsule-manifest.json').read_bytes())==c['manifestSHA256']
got={}
with tarfile.open(R/'pile-exit13-thin.tar.gz','r:gz') as tf:
 for e in tf:
  assert e.isfile() and e.name.startswith('pile-exit13/')
  name=e.name.removeprefix('pile-exit13/'); assert name not in got
  v=tf.extractfile(e).read();got[name]={'bytes':len(v),'sha256':sha(v)}
for name,x in m['members'].items():
 assert got[name]['bytes']==x['bytes'] and got[name]['sha256']==x['sha256'],name
assert len(got)==len(m['members'])+1
external=0
for x in m['inputMap']:
 if x['storage']=='embedded-or-bytealias': assert got[x['member']]['sha256']==x['sha256']
 else:
  assert x['storage']=='canonical-external'
  p=pathlib.Path(x['locator']['actualRetainedPath'])
  assert sha(p.read_bytes())==x['sha256'],str(p)
  external+=1
assert len(m['inputMap'])==706
out=pathlib.Path('/workspace/lyricfx.JIZURA/tasks/evidence/AVOID-009/revisions-20261024/pile-exit13')
for name in ['pile-exit13-thin.tar.gz','capsule-receipt.json','capsule-manifest.json']:
 shutil.copy2(R/name,out/name)
r={'parentArchiveHashVerified':c['sha256'],'allMembers':len(got),'allInputMapping':706,'canonicalExternalActualRehashed':external,'noExtractedCopy':True,'sideCheckpoints':'retained external, canonicalraw embedded','initialParentReaderCorrection':'Initial key lookup omitted pile-exit13/ tar root; fixed reader only, archive unchanged.','publicChecks':0,'parentImagesViewed':0}
(out/'parent-capsule13.json').write_text(json.dumps(r,indent=2)+'\n')
shutil.copy2(__file__,out/pathlib.Path(__file__).name)
print(json.dumps(r))
