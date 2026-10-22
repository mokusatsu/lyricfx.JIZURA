from pathlib import Path
import json,gzip,hashlib,subprocess
D=Path('tasks/evidence/AVOID-008/writingC861-main01');sha=lambda b:hashlib.sha256(b).hexdigest();G=lambda *a:subprocess.check_output(['git',*a]);cache={};base='tasks/evidence/AVOID-008/objects/'
# Already immutable raw/gzip pairs, never use live source bytes as old references.
for fp in ['tasks/evidence/AVOID-008/objects859-main01/freeze01/manifest.json','tasks/evidence/AVOID-008/proofread4d72-main01/freeze01/manifest.json']:
 m=json.loads(Path(fp).read_text())
 for e in m['files']:cache.setdefault(e['rawSHA256'],e['snapshotRepoPath'])
for prefix in ['matrix04-sourcepins','matrix05-sourcepins','integrated01/raw']:
 p=Path(base+prefix)
 if p.exists():
  for f in p.rglob('*.gz'):
   try:cache.setdefault(sha(gzip.decompress(f.read_bytes())),str(f))
   except (gzip.BadGzipFile,EOFError):pass
F=D/'legacy-source-dedup';F.mkdir();rows=[];added=[]
for label in ['matrix14','writing11','default-circle04']:
 source=Path(base+label+'-sourcepins/startup.json');m=json.loads(source.read_text())
 for e in m['pins']:
  h=e['sha256'];ref=cache.get(h)
  if ref is None:
   old=base+label+'-sourcepins/'+e['snapshot'];rawz=G('show','c861:'+old);raw=gzip.decompress(rawz);assert sha(raw)==h;dest=F/(h+'.gz');dest.write_bytes(rawz);ref=str(dest);cache[h]=ref;added.append({'path':ref,'rawSHA256':h,'gzipSHA256':sha(rawz),'bytes':len(rawz)})
  rawz=Path(ref).read_bytes();raw=gzip.decompress(rawz);assert sha(raw)==h and len(raw)==e['bytes'];rows.append({'startup':str(source),'oldSnapshotPath':base+label+'-sourcepins/'+e['snapshot'],'sourcePath':e['file'],'rawSHA256':h,'rawBytes':len(raw),'snapshotRepoPath':ref,'gzipSHA256':sha(rawz)})
out={'scope':'Lossless fixedc861315 legacy startup pins resolve to immutable hash-identical main gzip sources. Only missing unique sources copied; no live-source substitutes or26historical archive imports.','pins':rows,'additionalUniqueSnapshots':added,'all315Verified':len(rows)==315};assert out['all315Verified'];p=D/'legacy-source-dedup01.json';p.write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'pins':len(rows),'additional':len(added),'additionalBytes':sum(x['bytes']for x in added),'sha256':sha(p.read_bytes())}))
