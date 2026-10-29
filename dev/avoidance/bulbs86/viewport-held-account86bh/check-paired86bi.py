"""Raw-only paired current-viewport preparation review."""
from pathlib import Path
import gzip,hashlib,json,sys
D=Path(sys.argv[1]);r=json.loads((D/'result.json').read_text());assert r['complete']and not r['errors']and r['postPinsUnchanged']
assert len(r['pins'])==52 and len(r['raw'])==12 and len(r['referenceRaw'])==3
for p in r['pins']:
 b=Path(p['path']).read_bytes();assert(len(b),hashlib.sha256(b).hexdigest())==(p['bytes'],p['sha256'])
def raw(p,external=False):
 g=(Path(p['path'])if external else D/p['file']).read_bytes();b=gzip.decompress(g);assert(len(g),hashlib.sha256(g).hexdigest(),len(b),hashlib.sha256(b).hexdigest())==(p['gzipBytes'],p['gzipSHA256'],p['jsonBytes'],p['sha256']);return json.loads(b)
values={p['file']:raw(p)for p in r['raw']};old=[raw(p,True)for p in r['referenceRaw']];own=sum(len(v['rows'])for v in old);supports=sum(len(row['supports'])for v in old for row in v['rows']);glyphs=sum(rec['kind'].endswith('Text')for v in old for row in v['rows']for rec in row['records']);assert(own,supports,glyphs)==(9,325,46)
semantics=[]
for variant in ['baseline','heldMemo']:
 got=values[variant+'-direct-model.json.gz'];compared=values[variant+'-check.json.gz'];final=values[variant+'-final.json.gz'];assert got['phase']=='ready'and compared==dict(frames=3,own=own,supports=supports,glyphs=glyphs)
 assert got['summary']['own']==727 and got['summary']['metricMeasurements']==405 and got['boot']['hash']==got['snapshot']['hash']==final['complete']['hash']
 semantics.append({k:v for k,v in got['summary'].items()if k not in ['timing','budget']})
 assert final['changed']['accepted']is False and final['changed']['error']['code']=='BULBS86BE_VIEWPORT_CONTEXT'
 assert final['old']['accepted']is False and final['old']['error']['code']=='DIRECT86BF_READY'
 assert final['final']['owner']['residentModels']==0 and final['final']['owner']['residentBytes']==0 and final['final']['owner']['compiles']==1 and final['final']['owner']['peakSerializedWorkingBytes']<=8388608
assert semantics[0]==semantics[1]
print(json.dumps(dict(comparedExistingFramesPerArm=3,ownPerArm=own,supportsPerArm=supports,glyphsPerArm=glyphs,prepareMs=[x['prepareMs']for x in r['arms']],maxStepMs=[x['maxStep']for x in r['arms']],scope='fixed-order single paired preparation, no time improvement or UI acceptance')))
