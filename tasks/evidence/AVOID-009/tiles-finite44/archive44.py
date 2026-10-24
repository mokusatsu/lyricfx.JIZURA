import pathlib,gzip,lzma,json,hashlib,datetime
B=pathlib.Path('/dev/shm/avoid009-evening-20261024');R=pathlib.Path('/workspace/lyricfx.JIZURA');D=R/'tasks/evidence/AVOID-009/tiles-finite44'
sha=lambda b:hashlib.sha256(b).hexdigest()
for name in ['finite44','finite44b']:
 p=B/(name+'.raw.json.gz')
 if not p.exists():continue
 raw=p.read_bytes();data=gzip.decompress(raw);v=json.loads(data);out=D/(name+'.raw.json.xz');packed=lzma.compress(data,preset=6);out.write_bytes(packed)
 summary={'name':name,'rawGzipBytes':len(raw),'rawGzipSHA256':sha(raw),'exactJSONBytes':len(data),'exactJSONSHA256':sha(data),'canonicalXZBytes':len(packed),'canonicalXZSHA256':sha(packed),'errors':v.get('errors'),'results':[],'parentFullRawReviewComplete':False,'certificate':False,'adapterAccepted':False,'publicChecks':0}
 for r in v.get('results',[]):
  a=r.get('value') or {};rows=a.get('results',[]);summary['results'].append({'spec':r.get('spec'),'error':r.get('error'),'pageErrors':r.get('pageErrors'),'admission':a.get('admission'),'clocks':a.get('clocks',{}).get('actualCounts'),'rowCount':len(rows),'zeroMismatch':sum(x.get('zeroEqual') is not True for x in rows),'movedMismatch':sum(x.get('movedEqual') is not True for x in rows),'valueErrors':a.get('errors')})
 (D/(name+'-execution.json')).write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n');print(json.dumps(summary,ensure_ascii=False))
