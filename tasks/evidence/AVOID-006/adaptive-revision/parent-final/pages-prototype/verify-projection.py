import json,os,subprocess,hashlib,collections
base='work/avoid006-pages-size-prototype/';p=json.load(open(base+'projection.json'));inventory={x['url']:x for x in p['inventory']};manifests=[os.fsdecode(x) for x in subprocess.check_output(['git','ls-files','-z','review']).split(b'\0') if x and x.endswith(b'/manifest.json')];manifests.append('review/AVOID-006/local-20261020-03/manifest.json');required={};historicalRootClaims=[]
for mp in manifests:
 m=json.load(open(mp));required[mp]=hashlib.sha256(open(mp,'rb').read()).hexdigest();root=os.path.dirname(mp)
 for path,sha in m['assets'].items():
  url=os.path.normpath(root+'/'+path)
  if path.startswith('../'):
   historicalRootClaims.append(dict(manifest=mp,url=url,historicalSHA256=sha,currentProjectedSHA256=inventory[url]['sha256']));continue
  assert inventory[url]['sha256']==sha,(url,'asset hash or projection mismatch')
  if url in required:assert required[url]==sha
  required[url]=sha
for url in ['index.html','en/index.html','id/index.html','ko/index.html','zh-hans/index.html','zh-hant/index.html','JIZURA_AE.jsx','JIZURA_AE_en.jsx','JIZURA_CEP.zip','JIZURA_CEP_en.zip','muscle_lofi_optimized.jizuraichi']:
 assert url in inventory;required[url]=inventory[url]['sha256']
result=dict(passed=True,scope='file projection only; Jekyll not executed',manifests=len(manifests),mandatoryURLs=len(required),mandatoryBytes=sum(inventory[u]['bytes'] for u in required),mandatoryURLSHA256=required,historicalMutableRootClaims=historicalRootClaims,notes=['Every immutable old review asset and manifest is retained at the same URL and encoded SHA256.','Historical manifests reference mutable root app SHA values; those historical values cannot all match simultaneously. The current root app bytes are preserved separately.','New03 is a tooling prototype only; replace its one projected bundle with the next accepted build, do not publish both.'])
open(base+'required-url-inventory.json','w').write(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k not in ['mandatoryURLSHA256','historicalMutableRootClaims']}))
