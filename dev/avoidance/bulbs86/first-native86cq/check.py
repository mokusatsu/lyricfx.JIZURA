"""Read-only checker for four historical CQ runs; no drawing or generation."""
from pathlib import Path
import sys,json,gzip,hashlib
B=Path(sys.argv[1] if len(sys.argv)>1 else '/workspace/jizura-logic-evidence-20261027')
U=Path(__file__).resolve().parent
M=json.loads((U/'historical-source-map.json').read_text())
sha=lambda x:hashlib.sha256(x).hexdigest()
data={};summary=[]
for mode in ['old','new']:
 for n,variant in [('01','success'),('02','failure')]:
  name=f'bulbs-first-native-{mode}-actual86cq{n}';D=B/name
  r=json.loads((D/'result.json').read_text())
  assert r['complete'] and not r['errors'] and r['postPinsUnchanged']
  assert len(r['pins'])==187 and len(r['raw'])==2
  assert r['mediaOutputs']==0 and r['publicChecks']==0
  for p in r['pins']:
   q=Path(p['path'])
   if not q.exists() or sha(q.read_bytes())!=p['sha256']:
    entry=M[p['sha256']];assert entry['original']==str(q);q=Path(entry['snapshot'])
   b=q.read_bytes();assert len(b)==p['bytes'] and sha(b)==p['sha256'],str(q)
  for f in r['raw']:
   z=(D/f['file']).read_bytes();b=gzip.decompress(z)
   assert len(z)==f['gzipBytes'] and sha(z)==f['gzipSHA256']
   assert len(b)==f['jsonBytes'] and sha(b)==f['sha256']
  h=json.loads((B/(name+'-runtime')/'host.json').read_text())
  assert h['probeExit']==0 and h['normalPageClosureConfirmed'] and h['debugPortClosed']
  c=h['cleanup'];assert c['complete'] and not c['remaining'] and not c['signals'] and not c['ownershipFailures'] and not c['signalFailures']
  assert all(p['exit']==0 for p in c['reaped'])
  assert h['pages']['created']==3 and sorted(h['pages']['closed'])==[0,1,2]
  d=json.loads(gzip.decompress((D/'product-ui.json.gz').read_bytes()));data[mode,variant]=d
  assert d['mode']==mode and d['variant']==variant and d['viewport']==[480,270]
  released=d['released'];assert released['clear'] and released['stats']['owner']['residentModels']==0
  assert released['stats']['reservation']['records']==released['stats']['reservation']['bindings']==0
  assert d['stats']['owner']['peakSerializedWorkingBytes']<=8388608
  models=d['models'];assert all(m['counts']['scalarCount']==250 for m in models)
  assert d['recipeOwners']==sum(250*len(m['recipes']) for m in models)
  if variant=='success':
   assert d['state']['ready'] and not d['clear'] and d['proof']['recipeId']=='native' and d['proof']['references']==250
  else:
   assert d['state']['phase']=='unsupported' and d['state']['error']=='BULBS86BJ_INSUFFICIENT_SPACE' and d['clear']
  if mode=='new':
   assert models[0]['recipes']==['native']
   assert d['stats']['search']=={'nativeStarts':1,'fullStarts':int(variant=='failure'),'fallbacks':int(variant=='failure')}
  summary.append({'run':name,'wallMs':d['wallMs'],'maxStepMs':d['state']['maxStepMs'],'recipeOwners':d['recipeOwners'],'models':len(models),'glyphMatrices':sum(m['counts']['glyphMatrices'] for m in models),'ringPoints':sum(m['counts']['pointCount'] for m in models),'peakSerializedBytes':d['stats']['owner']['peakSerializedWorkingBytes'],'candidateCount':d['stats']['reservation']['reuse']['candidates']})
a,b=data['old','success'],data['new','success']
assert a['nativeHash']==b['nativeHash'] and a['frameHash']==b['frameHash'] and a['proof']==b['proof']
a,b=data['old','failure'],data['new','failure']
assert a['state']['details']==b['state']['details']
assert a['models'][0]==b['models'][1]
print(json.dumps({'pass':True,'historicalRuns':4,'pinsPerRun':187,'rawPerRun':2,'sourceMapVersions':len(M),'productApplied':False,'summary':summary},indent=2))
