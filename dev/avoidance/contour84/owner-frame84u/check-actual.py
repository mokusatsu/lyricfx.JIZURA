"""Numeric-only audit of the restricted owned contour formal route."""
from pathlib import Path
from fractions import Fraction as F
import gzip,hashlib,json,struct,sys
d=Path(sys.argv[1]);r=json.loads((d/'result.json').read_text());assert r['complete']and not r['errors']and r['postPinsUnchanged']
assert len(r['pins'])==71 and len(r['raw'])==2
for p in r['pins']:
 b=Path(p['path']).read_bytes();assert len(b)==p['bytes']and hashlib.sha256(b).hexdigest()==p['sha256']
def raw(root,p):
 g=(root/p['file']).read_bytes();b=gzip.decompress(g)
 assert (len(g),hashlib.sha256(g).hexdigest(),len(b),hashlib.sha256(b).hexdigest())==(p['gzipBytes'],p['gzipSHA256'],p['jsonBytes'],p['sha256'])
 return json.loads(b)
def decode(x):
 if isinstance(x,list):return[decode(v)for v in x]
 if isinstance(x,dict):
  if set(x)=={'$f64'}:return struct.unpack('>d',bytes.fromhex(x['$f64']))[0]
  return{k:decode(v)for k,v in x.items()}
 return x
v=decode(raw(d,next(p for p in r['raw']if p['file']=='formal.json.gz')))
assert v['privateBefore']==v['privateAfter']and v['privateBefore']['hash']=='144f0c0f905139a27793ebe4eadca93c71b96e2458f7d5da8cc47f986a050908'
assert v['formal']['admitted']and v['formal']['placementUnitsAbsent']
tr=v['formal']['trajectory'];assert tr['sourceAdapter']=='contour_owned84q'and tr['safety']=='certified-bounded-adapter'and tr['sourceProof']['heroScale']==.5 and tr['sourceProof']['checkedOwn']==727
assert tr['evaluationRange']==[-1/60,4.77]and not tr['sourceProof']['formalPerformanceAccepted']and not tr['sourceProof']['uiConnected']
proof=v['ready']['proof'];assert proof['checkedOwn']==727 and proof['heroSupports']==3338 and proof['bodySupports']==4676 and v['ready']['peak']<=8388608
circle=tr['units'][0]['segments'][0]['circle'];cx,cy=F(circle['cx']),F(circle['cy']);radius=F(circle['r'])+F(540*.005);slack=[]
for b in proof['groups'].values():
 x0,x1,y0,y1=(F(b[k])for k in['x0','x1','y0','y1']);assert 0<=x0<=x1<=960 and 0<=y0<=y1<=540
 nx=max(x0,min(cx,x1));ny=max(y0,min(cy,y1));assert(nx-cx)**2+(ny-cy)**2>radius**2
 slack.append(min(x0,y0,F(960)-x1,F(540)-y1))
h,b=proof['groups']['hero'],proof['groups']['body'];assert F(h['x1'])<F(b['x0'])or F(b['x1'])<F(h['x0'])
old=d.parent/'contour-j60-84n-actual01';oldR=json.loads((old/'result.json').read_text());assert oldR['complete']and not oldR['errors']
assert[f['n']for f in v['rows']]==[14,90,231]
for f in v['rows']:
 assert f['t']==f['n']/60;p=next(p for p in oldR['raw']if p['file']==f"frame-{f['n']:03}.json.gz");ref=decode(raw(old,p));assert f['hash']==ref['hash']
 assert tr['units'][0]['segments'][0]['from']==ref['recipe']['heroDelta']and tr['units'][1]['segments'][0]['from']==ref['recipe']['bodyDelta']
for x,code in zip(v['rejects'],['STALE_PLACEMENT_PLAN','CONTOUR84Q_FRAME_SCOPE','BULBS80T_OWNED_PLAN_REQUIRED','BULBS80T_OWNED_PLAN_REQUIRED']):assert x['code']==code and x['before']==x['after']
s=v['afterStats'];assert not s['staged']and not s['preparing']and not s['ready']and not s['activeFrame']and s['bindings']==s['certificates']==s['residentModels']==0
print(json.dumps(dict(formalFrames=3,rgbaExact=3,wholeProofOwn=727,wholeShiftedSupports=8014,approxMinStagePx=float(min(slack)),atomicRefusals=4,privateBitmapContextRestored=True,prepareMs=v['prepareMs'],maxStepMs=max(v['steps']),scope='source-only restricted contour formal route; UI/performance and changed-input new-plan qualification remain separate')))
