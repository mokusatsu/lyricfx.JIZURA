import pathlib,json,gzip,hashlib,shutil,tarfile,base64
src=pathlib.Path('/tmp/avoid009-ribbon-final01');out=pathlib.Path('/tmp/avoid009-ribbon-final02');assert not out.exists();shutil.copytree(src,out);sha=lambda b:hashlib.sha256(b).hexdigest();m=json.loads((out/'inputs/matrix02.json').read_text());bases={}
for lang,p in [('ja','index.html'),('en','en/index.html')]:
 pin=next(x for x in m if x['path']==p);bases[lang]=(pin['sha256'],gzip.decompress((out/pin['blob']).read_bytes()))
deltas={}
for p in list((out/'blobs').glob('*.gz')):
 raw=gzip.decompress(p.read_bytes())
 if not raw.lower().startswith(b'<!doctype html>'):continue
 lang='en' if b'<html lang="en">' in raw[:100] else 'ja';bh,base=bases[lang]
 if p.stem==bh:continue
 a=0
 while a<min(len(base),len(raw)) and base[a]==raw[a]:a+=1
 b=0
 while b<min(len(base),len(raw))-a and base[-1-b]==raw[-1-b]:b+=1
 middle=raw[a:len(raw)-b if b else len(raw)];d={'format':'exact-html-prefix-suffix-delta-v1','targetSHA256':p.stem,'targetBytes':len(raw),'baseSHA256':bh,'baseBlob':'blobs/'+bh+'.gz','prefixBytes':a,'suffixBytes':b,'middleGzipBase64':base64.b64encode(gzip.compress(middle,mtime=0)).decode()};rebuilt=base[:a]+gzip.decompress(base64.b64decode(d['middleGzipBase64']))+(base[len(base)-b:] if b else b'');assert rebuilt==raw;new=out/'blobs'/(p.stem+'.delta.json');new.write_text(json.dumps(d,separators=(',',':')));deltas['blobs/'+p.name]='blobs/'+new.name;p.unlink()
# All source input manifests point to exact reconstruction descriptors when necessary.
for p in (out/'inputs').glob('*.json'):
 s=p.read_text()
 for a,b in deltas.items():s=s.replace(a,b)
 p.write_text(s)
restore='''import pathlib,json,gzip,base64,hashlib\nroot=pathlib.Path(__file__).parent\ndef read(blob):\n p=root/blob\n if p.name.endswith('.gz'):return gzip.decompress(p.read_bytes())\n d=json.loads(p.read_text());base=read(d['baseBlob']);b=d['suffixBytes'];raw=base[:d['prefixBytes']]+gzip.decompress(base64.b64decode(d['middleGzipBase64']))+(base[len(base)-b:] if b else b'');assert hashlib.sha256(raw).hexdigest()==d['targetSHA256'];return raw\nif __name__=='__main__':\n for p in (root/'inputs').glob('*.json'):\n  m=json.loads(p.read_text());m=m if isinstance(m,list) else [m]\n  for q in m:\n   if q.get('blob'):assert hashlib.sha256(read(q['blob'])).hexdigest()==q['sha256']\n print('All available exact input blobs/deltas verified; explicitly missing historical focused01 runner remains absent.')\n'''
(out/'restore-input.py').write_text(restore);exec(compile(restore,str(out/'restore-input.py'),'exec'),{'__file__':str(out/'restore-input.py'),'__name__':'__main__'})
manifest=json.loads((out/'manifest.json').read_text());manifest['storage']='Final JA/EN/font/latest sources are gzip CAS; historical HTML variants use exact prefix/suffix deltas. restore-input.py verifies every available input against its target SHA. Native07 fullraw remains externaldurable packet.';manifest['historicalHTMLDeltas']=len(deltas);manifest['files']=[{'path':str(p.relative_to(out)),'bytes':p.stat().st_size,'sha256':sha(p.read_bytes())} for p in sorted(out.rglob('*')) if p.is_file() and p.name!='manifest.json'];(out/'manifest.json').write_text(json.dumps(manifest,indent=2));archive=pathlib.Path('/tmp/avoid009-ribbon-final02.tar.gz');assert not archive.exists()
with tarfile.open(archive,'w:gz') as t:t.add(out,arcname=out.name)
with tarfile.open(archive,'r:gz') as t:
 for f in manifest['files']:assert sha(t.extractfile(out.name+'/'+f['path']).read())==f['sha256']
receipt={'archive':str(archive),'bytes':archive.stat().st_size,'sha256':sha(archive.read_bytes()),'memberFiles':len(manifest['files'])+1,'historicalHTMLDeltas':len(deltas),'missingHistoricalPinnedBlobs':manifest['historicalMissingExactPinBlobs'],'status':'UNACCEPTED parent gate; exact latest source/fullmatrix/final font snapshots; native07 external durable dependency'};pathlib.Path('/tmp/avoid009-ribbon01/evidence/ribbon01/final-packet02-receipt.json').write_text(json.dumps(receipt,indent=2));print(json.dumps(receipt))
