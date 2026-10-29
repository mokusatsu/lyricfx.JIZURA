"""Raw-only boundary audit; no media or rendering."""
from pathlib import Path
import gzip,hashlib,json,math,struct,sys
d=Path(sys.argv[1]);r=json.loads((d/'result.json').read_text())
assert r['complete'] and not r['errors'] and r['postPinsUnchanged']
assert len(r['pins'])==54 and len(r['raw'])==3
for p in r['pins']:
 b=Path(p['path']).read_bytes();assert len(b)==p['bytes'] and hashlib.sha256(b).hexdigest()==p['sha256']
values={}
for p in r['raw']:
 g=(d/p['file']).read_bytes();b=gzip.decompress(g)
 assert len(g)==p['gzipBytes'] and hashlib.sha256(g).hexdigest()==p['gzipSHA256']
 assert len(b)==p['jsonBytes'] and hashlib.sha256(b).hexdigest()==p['sha256'];values[p['file']]=json.loads(b)
def decode(x):
 if isinstance(x,list):return [decode(v)for v in x]
 if isinstance(x,dict):
  if set(x)=={'$f64'}:return struct.unpack('>d',bytes.fromhex(x['$f64']))[0]
  return {k:decode(v)for k,v in x.items()}
 return x
v=decode(values['time-domain.json.gz']);assert v['sourceOnly'] and not v['genericSafeTrajectoryIssued']
assert v['range']==[-1/60,4.77] and len(v['rows'])==5
rows={x['label']:x for x in v['rows']};assert len(rows)==5
assert rows['negative-interior']['kind']=='initial-model' and rows['negative-interior']['sourceN']==0
assert rows['first-next-state']['kind']=='model' and rows['first-next-state']['sourceN']==1
assert rows['last-reachable']['kind']=='model' and rows['last-reachable']['sourceN']==249
for row in v['rows']:
 assert row['actualN']==math.floor(row['t']/(1/60)+1e-6) and row['actualRealTime']==row['t']
 assert [p['pass']for p in row['own']]==['B','A','main']
 if row['label']=='negative-interior':assert all(p['active'] and p['tp']==0 and p['selected']==[0]for p in row['own'])
 if row['label'] in ['last-reachable','expanded-tail-before','expanded-tail-end']:
  assert all(not p['active'] and not p['selected']for p in row['own'])
 if row['label'].startswith('expanded-tail'):
  assert row['kind']=='empty' and row['sourceN']is None and row['frameHash']==row['backgroundHash']
for x,code in zip(v['rejects'],['BURST83AB_TIME_RANGE','BURST83AB_TIME_RANGE','BURST83AG_PREPARE_REQUIRED']):
 assert x['code']==code and x['before']==x['after']
assert v['ready']['counts']['states']==250 and v['ready']['counts']['own']==727 and v['ready']['counts']['supports']==9047
assert v['ready']['peak']<=8388608 and not v['afterStats']['ready'] and not v['afterStats']['preparing']
print(json.dumps(dict(boundaryFrames=5,emptyBackgroundMatches=2,atomicRefusals=3,range=v['range'],prepareMs=v['elapsedMs'],maxStepMs=max(v['steps']),scope='private source-only time-domain; no formal plan or UI acceptance')))
