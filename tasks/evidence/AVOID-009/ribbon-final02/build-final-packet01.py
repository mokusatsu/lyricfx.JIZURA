import pathlib,json,gzip,hashlib,shutil,tarfile,os
root=pathlib.Path('/tmp/avoid009-ribbon01');ev=root/'evidence/ribbon01';out=pathlib.Path('/tmp/avoid009-ribbon-final01');assert not out.exists();out.mkdir();(out/'blobs').mkdir();(out/'evidence').mkdir();(out/'inputs').mkdir();files=[];missing=[]
def sha(b):return hashlib.sha256(b).hexdigest()
def put(data,path):
 p=out/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data);files.append({'path':str(path),'bytes':len(data),'sha256':sha(data)})
def blob(h,sources):
 target=out/'blobs'/f'{h}.gz'
 if target.exists():return True
 for p in sources:
  if p.exists():
   b=p.read_bytes()
   try:raw=gzip.decompress(b)
   except:raw=b
   if sha(raw)==h:
    put(gzip.compress(raw,mtime=0),pathlib.Path('blobs')/f'{h}.gz');return True
 return False
names=['bounded01','bounded02','focused01','focused02','focused04','numeric01','matrix01','matrix02','explicit01']
for name in names:
 raw=ev/(name+'.json.gz');assert raw.exists();put(raw.read_bytes(),pathlib.Path('evidence')/raw.name);j=json.loads(gzip.decompress(raw.read_bytes()));m=[]
 for p in j['pins']:
  h=p['sha256'];candidates=[ev/'blobs'/f'{h}.gz',ev/(name+'.json.gz.inputs')/(h+'.gz')]
  if pathlib.Path(p['path']).is_absolute():candidates.append(pathlib.Path(p['path']))
  else:candidates.append(root/p['path'])
  found=blob(h,candidates);m.append(dict(p,blob='blobs/'+h+'.gz' if found else None))
  if not found:missing.append({'evidence':name,**p})
 put(json.dumps(m,indent=2).encode(),pathlib.Path('inputs')/(name+'.json'))
 for suffix in ['.log','.json.gz.nonimpact.gz']:
  p=ev/(name+suffix)
  if p.exists():put(p.read_bytes(),pathlib.Path('evidence')/p.name)
for name in ['focused01-network.log','focused03.log','matrix02.json.gz.inputs/baselineHTML.json','continuous-proof01.md','final-small-matrix02-summary.json','numeric01-review.json','numeric01-replay-check.py','recovery-handoff01.json']:
 p=ev/name;put(p.read_bytes(),pathlib.Path('evidence')/name.replace('/','__'))
# The failed focused03 invocation has no raw. Preserve its exact four pinned source snapshots/manifest.
for p in sorted((ev/'focused03.json.gz.inputs').glob('*')):
 if p.name=='manifest.json':put(p.read_bytes(),pathlib.Path('inputs')/'focused03.json')
 elif p.name.endswith('.gz'):blob(p.stem,[p])
# Main baseline exactHTML is also a live comparison dependency.
baseline=json.loads((ev/'matrix02.json.gz.inputs/baselineHTML.json').read_text());assert blob(baseline['sha256'],[ev/'blobs'/(baseline['sha256']+'.gz')]);put(json.dumps(dict(baseline,blob='blobs/'+baseline['sha256']+'.gz')).encode(),pathlib.Path('inputs')/'baselineHTML.json')
# Corrected replay-only runner is separate from the original numeric01 exact pinned invocation.
p=root/'dev/avoidance/layouts-d-ribbon-numeric-test.cjs';put(p.read_bytes(),pathlib.Path('review-tools')/p.name)
refs={}
for name in ['parent-native07-review.json','parent-reveal-contract01.md','archive-storage01.json']:
 p=pathlib.Path('/workspace/lyricfx.JIZURA/tasks/evidence/AVOID-009/ribbon-wip')/name;put(p.read_bytes(),pathlib.Path('native07-reference')/name)
 if name=='archive-storage01.json':refs=json.loads(p.read_text())
manifest={'status':'UNACCEPTED bounded ribbon candidate, parent gate; not media/main integration','baseline':'23a62ee','scope':'Final source inputs/raw/proof plus explicit preserved failures, CAS deduplicated. Native07 fullraw remains separate existing durable dependency, not duplicated.','native07ExternalPacket':refs,'historicalMissingExactPinBlobs':missing,'dependencyCoverageNote':'Read final-small-matrix02-summary.json; historical focused04 partial invocation coverage must not be represented as complete. matrix02/explicit01 snapshot actual/full requested dependencies and Noto font.','files':files}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2));archive=pathlib.Path('/tmp/avoid009-ribbon-final01.tar.gz');assert not archive.exists()
with tarfile.open(archive,'w:gz') as t:t.add(out,arcname='avoid009-ribbon-final01')
with tarfile.open(archive,'r:gz') as t:
 for f in files:
  b=t.extractfile('avoid009-ribbon-final01/'+f['path']).read();assert sha(b)==f['sha256']
receipt={'archive':str(archive),'bytes':archive.stat().st_size,'sha256':sha(archive.read_bytes()),'memberFiles':len(files)+1,'missingHistoricalPinnedBlobs':missing,'status':'UNACCEPTED portable bounded packet; native07 fullraw external durable dependency stated'}
(ev/'final-packet01-receipt.json').write_text(json.dumps(receipt,indent=2));print(json.dumps(receipt))
