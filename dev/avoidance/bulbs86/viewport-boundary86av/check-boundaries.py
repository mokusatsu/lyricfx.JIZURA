"""Remaining finite boundary roots linked to unchanged Float64 preimage source."""
import gzip,hashlib,json,math,struct,sys
from pathlib import Path
D=Path(sys.argv[1]);prior=Path(sys.argv[2]);r=json.loads((D/'result.json').read_text());assert r['complete'] and not r['errors']
for p in r['pins']:
 b=Path(p['path']).read_bytes();assert len(b)==p['bytes'] and hashlib.sha256(b).hexdigest()==p['sha256']
for p in r['raw']:
 g=(D/p['file']).read_bytes();b=gzip.decompress(g);assert len(g)==p['gzipBytes'] and hashlib.sha256(g).hexdigest()==p['gzipSHA256'];assert len(b)==p['jsonBytes'] and hashlib.sha256(b).hexdigest()==p['sha256']
prior_result=json.loads((prior/'result.json').read_text());assert prior_result['complete'] and not prior_result['errors']
record=next(p for p in prior_result['raw'] if p['file']=='stock-roots.json.gz');g=(prior/record['file']).read_bytes();b=gzip.decompress(g);assert len(g)==record['gzipBytes'] and hashlib.sha256(g).hexdigest()==record['gzipSHA256'];assert len(b)==record['jsonBytes'] and hashlib.sha256(b).hexdigest()==record['sha256']
x=json.load(gzip.open(D/'stock-boundaries.json.gz'));old=json.loads(b)
def decode(x):
 if isinstance(x,dict):
  if '$f64' in x:return struct.unpack('>d',bytes.fromhex(x['$f64']))[0]
  return {k:decode(v) for k,v in x.items()}
 if isinstance(x,list):return [decode(v) for v in x]
 return x
bits=lambda x:struct.pack('>d',float(x));h=1/60
assert x['before']==x['after']==old['before'] and x['sentinelBefore']==x['sentinelAfter']
assert x['revisionBefore']==x['revisionAfter'] and x['statsBefore']['owner']['compiles']==x['statsAfter']['owner']['compiles']==0
preimages=x['preimages'];assert len(preimages)==250
oldcases=[(c,decode(c)) for c in old['cases']];by_n={int(c['n']):(enc,c) for enc,c in oldcases if 'firstTime' in c['modes']};assert set(by_n)==set(range(250))
for i,p in enumerate(preimages):
 assert p['n']==i and p['reachable'] and math.floor(p['firstTime']/h+1e-6)==i and math.floor(p['lastTime']/h+1e-6)==i
 assert bits(p['firstTime'])==bits(by_n[i][1]['time'])
 assert int.from_bytes(bits(p['firstTime']),'big')==int(p['firstBits']) and int.from_bytes(bits(p['lastTime']),'big')==int(p['lastBits'])
 if i:assert bits(math.nextafter(p['firstTime'],-math.inf))==bits(preimages[i-1]['lastTime'])
cases=[(c,decode(c)) for c in x['cases']];last=set();count=0;empty=0;negative=0
for enc,c in cases:
 t=c['time'];n=int(c['n']);assert n==math.floor(t/h+1e-6);sn=0 if t<0 else n;assert sn==c['sourceN'];reference=by_n.get(sn)
 for mode in c['modes']:
  if mode.startswith('lastTime:'):
   i=int(mode.split(':')[1]);assert i not in last;last.add(i);assert bits(t)==bits(preimages[i]['lastTime'])
  if mode.startswith('predecessorFirst:'):
   i=int(mode.split(':')[1]);assert bits(t)==bits(math.nextafter(preimages[i]['firstTime'],-math.inf))
  if mode.startswith('successorLast:'):
   i=int(mode.split(':')[1]);assert bits(t)==bits(math.nextafter(preimages[i]['lastTime'],math.inf))
 expected=reference[0]['rows'] if reference else []
 assert len(c['rows'])==len(expected)
 if not c['rows']:empty+=1
 if t<0:negative+=1
 for erow,row,want in zip(enc['rows'],c['rows'],expected):
  assert erow['root']==erow['helperRoot']==want['root'] and row['same'] and row['W']==960 and row['H']==540
  assert erow['clock']==erow['helperClock'] and bits(row['clock']['realTime'])==bits(t)
  assert {k:v for k,v in erow['clock'].items() if k!='realTime'}=={k:v for k,v in want['clock'].items() if k!='realTime'}
  count+=1
assert last==set(range(250)) and len(x['reused'])==249
for reused in decode(x['reused']):
 assert reused['reference']=='86aq-firstTime';n=int(reused['n']);assert bits(reused['time'])==bits(by_n[n][1]['time'])
assert count==x['ownComparisons'] and len(cases)==x['frames']
print(json.dumps(dict(frames=len(cases),lastTimeStates=len(last),reusedAdjacentFirstTime=249,negativeFrames=negative,emptyFrames=empty,ownComparisons=count,compileDelta=0,scope='actual root/clock equivalence at remaining boundaries; source guard proof still required before all-realTime authority')))
