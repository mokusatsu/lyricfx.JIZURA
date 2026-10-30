"""Read saved real UI comparisons only; never starts Qt or modifies evidence."""
from pathlib import Path
import sys,json,gzip,hashlib
B=Path(sys.argv[1]if len(sys.argv)>1 else '/workspace/jizura-logic-evidence-20261027')
sha=lambda b:hashlib.sha256(b).hexdigest()
data={};summary=[]
for mode in ['old','new']:
 for n,variant in [('02','success'),('03','failure')]:
  name=f'bulbs-budget-once-{mode}-actual86cr{n}';D=B/name
  r=json.loads((D/'result.json').read_text())
  assert r['complete']and not r['errors']and r['postPinsUnchanged']
  assert r['mediaOutputs']==r['publicChecks']==0 and len(r['pins'])==182 and len(r['raw'])==2
  for p in r['pins']:
   b=Path(p['path']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256'],p['path']
  for f in r['raw']:
   z=(D/f['file']).read_bytes();b=gzip.decompress(z)
   assert len(z)==f['gzipBytes']and sha(z)==f['gzipSHA256']
   assert len(b)==f['jsonBytes']and sha(b)==f['sha256']
  h=json.loads((B/(name+'-runtime')/'host.json').read_text());c=h['cleanup']
  assert h['probeExit']==0 and h['normalPageClosureConfirmed']and h['debugPortClosed']
  assert c['complete']and not any(c[k]for k in ['remaining','signals','ownershipFailures','signalFailures'])
  assert all(x['exit']==0 for x in c['reaped'])
  assert h['pages']['created']==3 and sorted(h['pages']['closed'])==[0,1,2]
  d=json.loads(gzip.decompress((D/'product-ui.json.gz').read_bytes()));data[mode,variant]=d
  assert d['mode']==mode and d['variant']==variant and d['viewport']==[480,270]
  assert d['recipeOwners']==1000 and len(d['models'])==1
  m=d['models'][0];assert m['recipes']==['native','one-row-compact','two-row-native','two-row-95']
  assert m['counts']['scalarCount']==250 and m['counts']['glyphMatrices']==5456 and m['counts']['pointCount']==19884
  assert d['stats']['owner']['compiles']==1 and d['stats']['owner']['peakSerializedWorkingBytes']<=8388608
  assert d['released']['clear']and d['released']['stats']['owner']['residentModels']==0
  assert d['released']['stats']['reservation']['records']==d['released']['stats']['reservation']['bindings']==0
  if variant=='success':assert d['state']['ready']and not d['clear']and d['proof']['references']==250
  else:assert d['state']['phase']=='unsupported'and d['state']['error']=='BULBS86BJ_INSUFFICIENT_SPACE'and d['clear']
  codec=d['codec'];assert len(codec['budgetSamples'])==5962
  summary.append({'run':name,'wallMs':d['wallMs'],'maxStepMs':d['state']['maxStepMs'],'codec':{k:v for k,v in codec.items()if k!='budgetSamples'},'accountingMs':m['timing']['accountingMs'],'modelBytes':m['modelBytes'],'peakSerializedBytes':d['stats']['owner']['peakSerializedWorkingBytes'],'candidates':d['stats']['reservation']['reuse']['candidates']})
for variant in ['success','failure']:
 a,b=data['old',variant],data['new',variant]
 assert a['models'][0]['counts']==b['models'][0]['counts']
 assert a['models'][0]['modelBytes']==b['models'][0]['modelBytes']
 assert a['state']['details']==b['state']['details']
 assert a['stats']['reservation']['reuse']['candidates']==b['stats']['reservation']['reuse']['candidates']
 assert b['stats']['owner']['peakSerializedWorkingBytes']-a['stats']['owner']['peakSerializedWorkingBytes']==307
 # Exact original transient bytes; only fixed two-reference/two-number metadata added.
 x,y=a['codec']['budgetSamples'],b['codec']['budgetSamples'];assert len(x)==len(y)
 assert all(v[0]-u[0]==307 and v[1]==u[1]for u,v in zip(x,y))
 assert b['codec']['nodes']<a['codec']['nodes']and b['codec']['cacheHits']==10749
 if variant=='success':
  for k in ['modelHash','nativeHash','proof','frameHash']:assert a[k]==b[k],k
print(json.dumps({'pass':True,'runs':4,'pinsPerRun':182,'rawPerRun':2,'budgetSamplesPerRun':5962,'productApplied':False,'summary':summary},indent=2))
