"""Raw-only audit of source-reviewed private direct-model comparisons."""
from pathlib import Path
import gzip,hashlib,json,sys
D=Path(sys.argv[1]);r=json.loads((D/'result.json').read_text())
assert r['complete'] and not r['errors'] and r['postPinsUnchanged']
assert len(r['pins'])==48 and len(r['raw'])==31 and len(r['referenceRaw'])==250
assert sum(x['jsonBytes']for x in r['raw'])<=128*1024**2
assert sum(x['gzipBytes']for x in r['raw'])<=32*1024**2
for x in r['pins']:
 b=Path(x['path']).read_bytes();assert len(b)==x['bytes']and hashlib.sha256(b).hexdigest()==x['sha256']
def raw(x,external=False):
 p=Path(x['path'])if external else D/x['file'];g=p.read_bytes();b=gzip.decompress(g)
 assert len(b)<=8*1024**2 and (len(g),hashlib.sha256(g).hexdigest(),len(b),hashlib.sha256(b).hexdigest())==(x['gzipBytes'],x['gzipSHA256'],x['jsonBytes'],x['sha256'])
 return json.loads(b)
values={x['file']:raw(x)for x in r['raw']};got=values['direct-model.json.gz'];final=values['direct-final.json.gz'];model=got['summary']
assert got['phase']=='ready' and got['boot']['hash']==got['snapshot']['hash']==final['complete']['hash']
assert got['boot']['width']==720 and got['boot']['height']==405
assert model['viewport']==dict(scale=.75,width=720,height=405)
assert model['own']==727 and model['metricMeasurements']==model['metricMapEntries']==405
assert model['glyphMatrices']==16268 and model['sourceOnly'] and not model['framePermission']
quality=next(x for x in model['quality']if x['recipe']=='one-row-compact');assert quality['passed'] and quality['failureCount']==quality['preferredLowerBoundShortfalls']==0
assert len(model['compactGroups'])==10 and len(model['positions'])==2 and all(x['evaluation']['passed']for x in model['positions'])
numbers=[];own=supports=glyphs=0
for x in r['referenceRaw']:
 v=raw(x,True);name=Path(x['path']).name;n=60 if name=='shift-pilot.json.gz'else int(name[6:9]);assert n not in numbers;numbers.append(n)
 assert v['before']==v['after']==model['source'] and v['scale']==.75 and (v['width'],v['height'])==(720,405)
 for row in v['rows']:
  assert row['catalog']['clock']['realTime']==n/60
  own+=1;supports+=len(row['supports']);glyphs+=sum(p['kind'].endswith('Text')for p in row['records'])
assert set(numbers)==set(range(250))and (own,supports,glyphs)==(727,28840,3977)
checks=[v for k,v in values.items()if k.startswith('check-')]
counts=dict(frames=sum(x['frames']for x in checks),own=sum(x['own']for x in checks),supports=sum(x['supports']for x in checks),glyphs=sum(x['glyphs']for x in checks))
assert counts==dict(frames=250,own=own,supports=supports,glyphs=glyphs)
assert final['complete']['counts']==dict(checkedFrames=250,own=own,supports=supports,glyphs=glyphs)
assert final['changed']['accepted']is False and final['changed']['error']['code']=='BULBS86BE_VIEWPORT_CONTEXT'
assert final['old']['accepted']is False and final['old']['error']['code']=='DIRECT86BF_READY'
assert final['final']['owner']['residentModels']==final['final']['owner']['residentBytes']==0
assert final['final']['owner']['compiles']==1 and final['final']['owner']['peakSerializedWorkingBytes']<=8388608
print(json.dumps(dict(comparedExistingFrames=250,own=own,supports=supports,paintedGlyphs=glyphs,prepareMs=got['prepareMs'],maxStepMs=max(got['steps']),metricMeasurements=405,scope='source-reviewed current-viewport private model compared to old paint; no 250 new draws/continuous frame/issuer/UI acceptance')))
