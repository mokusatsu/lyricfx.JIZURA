from pathlib import Path
import json,gzip,lzma,hashlib,subprocess,shutil,os
R=Path('/workspace/lyricfx.JIZURA');B=Path('/dev/shm/avoid009-evening-20261024');D=R/'tasks/evidence/AVOID-009/bulbs-native50';p=B/'bulbs50.raw.json.gz';packed=p.read_bytes();sha=lambda b:hashlib.sha256(b).hexdigest();assert len(packed)==19490841 and sha(packed)=='49cb5e90c58465b952279b2738d8ef249a90e3add8dc59a898053d6c2c716f8d';data=gzip.decompress(packed);out=B/'bulbs50.raw.json.xz';assert not out.exists();out.write_bytes(lzma.compress(data,preset=6));assert lzma.decompress(out.read_bytes())==data
check=subprocess.check_output(['/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node','-e',"const f=require('fs'),z=require('zlib'),c=require('crypto');process.stdout.write(c.createHash('sha256').update(z.gzipSync(f.readFileSync(0),{level:9,mtime:0})).digest('hex'))"],input=data);assert check.decode()==sha(packed)
pins=json.loads((D/'source50/evidence/pins50.json').read_text())
for x in pins['files']+pins['pycache']:assert sha((R/x['path']).read_bytes())==x['sha256'],x['path']
assert sha((R/'.git/index').read_bytes())==pins['index']['sha256'];assert all(not(R/x).exists()for x in pins['absent58'])
free=os.statvfs(R).f_bavail*os.statvfs(R).f_frsize;copied=free>out.stat().st_size+1024*1024
if copied:
 target=D/'bulbs50.raw.json.xz';assert not target.exists();shutil.copyfile(out,target);assert sha(target.read_bytes())==sha(out.read_bytes())
report={'gzipBytes':len(packed),'gzipSHA256':sha(packed),'exactJSONBytes':len(data),'exactJSONSHA256':sha(data),'losslessXZBytes':out.stat().st_size,'losslessXZSHA256':sha(out.read_bytes()),'exactNode24OriginalGzipReproduced':True,'ROOTDurableCopy':copied,'retainedSHMPath':str(out),'all123source7PYC58absentAndIndexParentVerifiedAfterActual':True,'parentRawReviewComplete':False,'productAccepted':False,'publicChecks':0,'parentImagesViewed':0};(D/'storage50.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
