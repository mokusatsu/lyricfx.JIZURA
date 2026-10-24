from pathlib import Path
import gzip,lzma,json,hashlib,subprocess
R=Path('/workspace/lyricfx.JIZURA');B=Path('/dev/shm/avoid009-evening-20261024');D=R/'tasks/evidence/AVOID-009/tiles-adapter48';sha=lambda b:hashlib.sha256(b).hexdigest();p=B/'tiles48.raw.json.gz';raw=p.read_bytes();assert sha(raw)=='ac3508bc24c485e6a4a2ac20dbf39885adca55a76b4b2315855fc5485f290d8a';data=gzip.decompress(raw);v=json.loads(data);out=D/'tiles48.raw.json.xz';packed=lzma.compress(data,preset=6);out.write_bytes(packed);assert lzma.decompress(out.read_bytes())==data
q=subprocess.run(['node','-e',"const fs=require('fs'),z=require('zlib'),c=require('crypto');process.stdout.write(c.createHash('sha256').update(z.gzipSync(fs.readFileSync(0),{level:9,mtime:0})).digest('hex'));"],input=data,stdout=subprocess.PIPE,check=True);assert q.stdout.decode()==sha(raw)
rows=v['controls']['rows'];summary={'errors':v['errors'],'gzipBytes':len(raw),'gzipSHA256':sha(raw),'exactJSONBytes':len(data),'exactJSONSHA256':sha(data),'losslessXZBytes':len(packed),'losslessXZSHA256':sha(packed),'exactNode24OriginalGzipReproduced':True,'chunks':len(v['results']),'frames':sum(len(x['after']['whole']) for x in v['results']),'passRows':sum(len(x['after']['rows']) for x in v['results']),'coldWarmMemory':v['metadata']['after']['cache'],'controls':[{k:x[k] for k in ['name','error','code','bitmapUnchanged','rootUnchanged','langUnchanged','metricsRevisionUnchanged','observationCalls','budgetUnchanged','methodsRestored'] if k in x} for x in rows],'parentRawReviewComplete':False,'productAccepted':False,'publicChecks':0}
(D/'storage48.json').write_text(json.dumps({k:x for k,x in summary.items() if k not in ['coldWarmMemory','controls']},indent=2)+'\n');(D/'execution-summary48.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
cache=summary['coldWarmMemory'];print(json.dumps({**{k:x for k,x in summary.items() if k not in ['coldWarmMemory','controls']},'coldMilliseconds':cache['coldMilliseconds'],'warmMilliseconds':cache['warmMilliseconds'],'firstStats':cache['first'],'controlCount':len(rows),'controls':[x['name'] for x in rows]},ensure_ascii=False))
F=B/'tiles48-frozen-native-before';F.mkdir(exist_ok=True);frozen=[]
for src,name in [('index.html','ja.html'),('en/index.html','en.html')]:
 b=(R/src).read_bytes();target=F/name
 if target.exists():assert target.read_bytes()==b
 else:target.write_bytes(b)
 frozen.append({'source':src,'frozen':str(target),'bytes':len(b),'sha256':sha(b)})
(D/'frozen-native-before48.json').write_text(json.dumps(frozen,indent=2)+'\n');print('Frozen nativeJAEN originalbeforeintegration:',json.dumps(frozen))
