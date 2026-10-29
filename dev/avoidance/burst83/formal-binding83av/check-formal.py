"""Formal source-only plan audit from numeric raw and previous source hashes."""
from pathlib import Path
import gzip,hashlib,json,struct,sys
d=Path(sys.argv[1]);r=json.loads((d/'result.json').read_text());assert r['complete']and not r['errors']and r['postPinsUnchanged']
assert len(r['pins'])==80 and len(r['raw'])==3
for p in r['pins']:
 b=Path(p['path']).read_bytes();assert len(b)==p['bytes']and hashlib.sha256(b).hexdigest()==p['sha256']
def raw(root,p):
 g=(root/p['file']).read_bytes();b=gzip.decompress(g)
 assert (len(g),hashlib.sha256(g).hexdigest(),len(b),hashlib.sha256(b).hexdigest())==(p['gzipBytes'],p['gzipSHA256'],p['jsonBytes'],p['sha256'])
 return json.loads(b)
values={p['file']:raw(d,p)for p in r['raw']};v=values['formal.json.gz']
def decode(x):
 if isinstance(x,list):return[decode(v)for v in x]
 if isinstance(x,dict):
  if set(x)=={'$f64'}:return struct.unpack('>d',bytes.fromhex(x['$f64']))[0]
  return{k:decode(v)for k,v in x.items()}
 return x
v=decode(v);tr=v['formal']['trajectory']
assert v['formal']['admitted']and v['formal']['sourceNative']and v['formal']['placementUnitsAbsent']
assert tr['safety']=='certified-bounded-adapter'and tr['sourceAdapter']=='burst_prepared83av'and tr['certificate']['kind']=='burst-owned-plan-certificate83av'
assert tr['evaluationRange']==[-1/60,4.77]and tr['sourceProof']['checkedOwn']==727 and tr['sourceProof']['checkedSupports']==9047
assert not tr['sourceProof']['formalPerformanceAccepted']and not tr['sourceProof']['uiConnected']
old=d.parent/'burst-default-destination83m-actual01';oldR=json.loads((old/'result.json').read_text());assert oldR['complete']and not oldR['errors']
assert [f['n']for f in v['rows']]==[6,60,231]
for f in v['rows']:
 assert f['t']==f['n']/60
 p=next(p for p in oldR['raw']if p['file']==f"state-{f['n']:03}.json.gz")
 assert f['hash']==raw(old,p)['hash']
expected=['STALE_PLACEMENT_PLAN','BURST83AG_FRAME_SCOPE','BULBS80T_OWNED_PLAN_REQUIRED','BULBS80T_OWNED_PLAN_REQUIRED']
assert len(v['rejects'])==4
for x,code in zip(v['rejects'],expected):assert x['code']==code and x['before']==x['after']
s=v['afterStats'];assert not s['staged']and not s['preparing']and not s['ready']and s['formal']['bindings']==s['formal']['certificates']==0
assert v['ready']['peak']<=8388608
print(json.dumps(dict(formalFrames=3,rgbaExact=3,atomicRefusals=4,prepareMs=v['prepareMs'],maxStepMs=max(v['steps']),finalizeMs=v['finalizeMs'],scope='restricted source-only formal burst; no current ordinary UI/performance acceptance')))
