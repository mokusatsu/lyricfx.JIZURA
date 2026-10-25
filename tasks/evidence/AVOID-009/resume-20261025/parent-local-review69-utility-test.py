"""Run parent checker on four actual archived controls in scalar containers."""
import pathlib,tempfile,gzip,json,hashlib,subprocess,sys
root=pathlib.Path('/workspace/lyricfx.JIZURA');e=root/'tasks/evidence/AVOID-009/resume-20261025'
with tempfile.TemporaryDirectory(dir='/dev/shm',prefix='parent-checker69-pilot-') as tmp:
 p=pathlib.Path(tmp);records=[]
 for i,name in enumerate(['actual01-control-n83.encoded.json.gz','actual01-control-n120.encoded.json.gz','actual01-control-n165.encoded.json.gz','failed-request-0000.encoded.json.gz']):
  v=json.loads(gzip.decompress((e/name).read_bytes()))['value'];r={'case':'candidate-default','tableEpoch':1,'sequence':i,'binding':{'type':'scalar','value':v},'tableDeltas':{k:[] for k in ['matrix','paint','catalog']},'tableStats':{k:{'entries':0,'canonicalKeyBytes':0} for k in ['matrix','paint','catalog']}};raw=json.dumps(r,separators=(',',':'),ensure_ascii=False).encode();z=gzip.compress(raw,mtime=0);name=str(i)+'.json.gz';(p/name).write_bytes(z);records.append({'case':'candidate-default','sequence':i,'file':name,'bytes':len(z),'JSONBytes':len(raw),'sha256':hashlib.sha256(z).hexdigest(),'phase':'historical59A-fresh-control'})
 (p/'manifest.json').write_text(json.dumps({'records':records,'failedRequests':[],'complete':False,'errors':['parent utility fixture only; four original real controls in scalar lossless containers; no fresh rendering']}));out=e/sys.argv[1];assert not out.exists();r=subprocess.run([sys.executable,'-B',str(e/'parent-local-review69.py'),str(p),str(out)],cwd=root);sys.exit(r.returncode)
