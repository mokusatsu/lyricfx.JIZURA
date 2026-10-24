"""Parent artifact preservation: full raw bytes, not a new product test."""
from pathlib import Path
import gzip,hashlib,json,lzma,shutil,subprocess
R=Path('/workspace/lyricfx.JIZURA');B=Path('/dev/shm/avoid009-evening-20261024');D=R/'tasks/evidence/AVOID-009/tiles-canonical49'
sha=lambda b:hashlib.sha256(b).hexdigest()
src=B/'tiles49.raw.json.gz';packed=src.read_bytes();data=gzip.decompress(packed)
# Preserve even failed/partial executions. A false success flag is never synthesized.
v=json.loads(data);dst=D/'tiles49.raw.json.xz';assert not dst.exists();dst.write_bytes(lzma.compress(data,preset=6));assert lzma.decompress(dst.read_bytes())==data
check=subprocess.run(['/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node','-e',"const f=require('fs'),z=require('zlib'),c=require('crypto');process.stdout.write(c.createHash('sha256').update(z.gzipSync(f.readFileSync(0),{level:9,mtime:0})).digest('hex'))"],input=data,stdout=subprocess.PIPE,check=True)
assert check.stdout.decode()==sha(packed)
summary={'rawGzipBytes':len(packed),'rawGzipSHA256':sha(packed),'exactJSONBytes':len(data),'exactJSONSHA256':sha(data),'losslessXZBytes':dst.stat().st_size,'losslessXZSHA256':sha(dst.read_bytes()),'exactNode24OriginalGzipReproduced':True,'errors':v['errors'],'chunks':len(v['results']),'frames':sum(len(r['after']['whole']) for r in v['results']),'passRows':sum(len(r['after']['rows']) for r in v['results']),'parentRawReviewComplete':False,'canonicalAccepted':False,'publicChecks':0,'parentImagesViewed':0}
(D/'storage49.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary))
