"""Check the isolated reference source provenance after the full numeric audit."""
from pathlib import Path
import json,hashlib,gzip,subprocess,sys
D=Path(sys.argv[1]).resolve();R=Path('/workspace/jizura-bulbs-product-20261029');U=Path(__file__).resolve().parent

S=Path(json.loads((D/'result.json').read_text())['pins'][0]['path']).parent
# Locate the one frozen HTML source pin rather than infer a published URL.
r=json.loads((D/'result.json').read_text());S=next(Path(p['path']).parent for p in r['pins']if Path(p['path']).name=='reference-diff.json')
m=json.loads((S/'reference-diff.json').read_text());original=Path(m['source']).read_bytes();changed=(S/'reference-layoutsD.js').read_bytes();assert hashlib.sha256(original).hexdigest()==m['beforeSHA256'];assert hashlib.sha256(changed).hexdigest()==m['afterSHA256'];assert original.count(m['before'].encode())==changed.count(m['after'].encode())==1;assert changed.replace(m['after'].encode(),m['before'].encode())==original
reference=(R/'index.html').read_text().replace(original.decode(),changed.decode());root=(R/'dev/avoidance/bulbs86/variable-ui86cc/root86.js').read_text();reference=reference.replace('</body>','<script>'+root+'\n'+(U/'oracle.js').read_text()+'</script></body>');assert reference==(S/'reference-ja.html').read_text()
def raw(name):return json.loads(gzip.decompress((D/(name+'.json.gz')).read_bytes()))
a=raw('page-init');b=raw('reference-init');assert a['fonts']==b['fonts'];assert b['stats']['owner']['compiles']==b['stats']['owner']['residentModels']==0
widths=sorted(int(p['file'].split('-')[2].split('.')[0])for p in r['raw']if p['file'].startswith('reference-setup-'));assert widths==([480]if 'prior'in r else [480,720])
for width in widths:assert raw('reference-setup-'+str(width))['stats']['owner']['compiles']==0
print(json.dumps({'referenceSourceSingleDimensionDomainReplacement':True,'referenceSeparatePage':True,'sourceBeforeSHA256':m['beforeSHA256'],'sourceAfterSHA256':m['afterSHA256'],'sameAssignedFontAudit':True,'referenceCompileCountAtSetups':0}))
