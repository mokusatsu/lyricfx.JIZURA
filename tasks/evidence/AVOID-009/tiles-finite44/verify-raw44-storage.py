from pathlib import Path
import json,lzma,gzip,hashlib,subprocess,datetime
R=Path('/workspace/lyricfx.JIZURA');D=R/'tasks/evidence/AVOID-009/tiles-finite44';B=Path('/dev/shm/avoid009-evening-20261024');sha=lambda b:hashlib.sha256(b).hexdigest();rows=[]
for name in ['finite44','finite44b']:
 p=B/(name+'.raw.json.gz');raw=p.read_bytes();arch=(D/(name+'.raw.json.xz')).read_bytes();data=lzma.decompress(arch);assert data==gzip.decompress(raw)
 q=subprocess.run(['node','-e',"const fs=require('fs'),z=require('zlib'),c=require('crypto'),d=fs.readFileSync(0);process.stdout.write(c.createHash('sha256').update(z.gzipSync(d,{level:9,mtime:0})).digest('hex'));"],input=data,stdout=subprocess.PIPE,check=True);assert q.stdout.decode()==sha(raw);rows.append({'name':name,'originalGzipSHA256':sha(raw),'xzSHA256':sha(arch),'exactJSONSHA256':sha(data),'node24ExactGzipReproduction':True,'rawMtimeUTC':datetime.datetime.fromtimestamp(p.stat().st_mtime,datetime.timezone.utc).isoformat()})
v={'node':subprocess.check_output(['node','--version'],text=True).strip(),'method':'Full exact JSON losslessXZ; Node gzipSync(level9,mtime0) reproduced originalgzip SHA; no selfcontained-runtime claim','rows':rows,'publicChecks':0};(D/'storage-reproduction44.json').write_text(json.dumps(v,indent=2)+'\n');print(json.dumps(v))
