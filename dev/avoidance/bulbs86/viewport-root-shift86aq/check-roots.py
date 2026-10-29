import gzip,hashlib,json,math,struct,sys
from pathlib import Path
D=Path(sys.argv[1]);r=json.loads((D/'result.json').read_text());assert r['complete'] and not r['errors']
for p in r['pins']:
 b=Path(p['path']).read_bytes();assert len(b)==p['bytes']and hashlib.sha256(b).hexdigest()==p['sha256']
for p in r['raw']:
 g=(D/p['file']).read_bytes();b=gzip.decompress(g);assert len(g)==p['gzipBytes']and hashlib.sha256(g).hexdigest()==p['gzipSHA256'];assert len(b)==p['jsonBytes']and hashlib.sha256(b).hexdigest()==p['sha256']
v=json.loads(gzip.decompress((D/'stock-roots.json.gz').read_bytes()));assert not v['failure'] and v['before']==v['after'] and v['sentinelBefore']==v['sentinelAfter'];assert v['statsBefore']['owner']['compiles']==v['statsAfter']['owner']['compiles']==0 and v['revisionBefore']==v['revisionAfter']
def decode(x):
 if isinstance(x,dict):
  if '$f64'in x:return struct.unpack('>d',bytes.fromhex(x['$f64']))[0]
  return{k:decode(z)for k,z in x.items()}
 if isinstance(x,list):return[decode(z)for z in x]
 return x
bits=lambda x:struct.pack('>d',float(x))
seen={'firstTime':set(),'j60':set()};count=0;empty=0;checks=0;h=1/60
for encoded in v['cases']:
 case=decode(encoded);n=case['n'];assert n.is_integer()and 0<=n<250;n=int(n);t=case['time']
 for mode in case['modes']:
  assert n not in seen[mode];seen[mode].add(n)
  if mode=='j60':assert bits(t)==bits(n/60)
  else:
   assert math.floor(t/h+1e-6)==n
   if n:assert math.floor(math.nextafter(t,-math.inf)/h+1e-6)==n-1
 q=n*h;expected=[]
 for p,lag in [('B',1.6/24),('A',.8/24),('main',0)]:
  tp=max(0.,q-lag)
  if tp<4:expected.append((p,tp,lag))
 assert [x['pass']for x in case['rows']]==[x[0]for x in expected]
 if not expected:empty+=1
 for row,enc,(p,tp,lag)in zip(case['rows'],encoded['rows'],expected):
  assert enc['root']==enc['helperRoot'] and enc['clock']==enc['helperClock'] and row['same'];assert row['W']==960 and row['H']==540
  want={'t':tp,'realTime':t,'lt':tp,'ltb':tp+lag,'step':math.floor(tp/(1/24)+1e-6),'pIn':max(0.,min(1.,tp/.35)),'pOut':max(0.,min(1.,(tp-(4-.4))/.4))}
  for k,x in want.items():assert bits(row['clock'][k])==bits(x),(n,p,k,row['clock'][k],x);checks+=1
  count+=1
assert len(v['cases'])==499 and count==1451 and empty==10 and all(s==set(range(250))for s in seen.values())
print(json.dumps({'frames':499,'firstTimeStates':250,'j60States':250,'own':count,'clockChecks':checks,'emptyFrames':empty,'scope':'finite firstTime/j60 roots+selectors only; no all-realTime/shifted/support authority'}))
