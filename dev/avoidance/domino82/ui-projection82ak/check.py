"""Read saved208 pins/raw/lifecycle and independently check every support with Fraction."""
from pathlib import Path
from fractions import Fraction as F
import json,gzip,hashlib,struct,math,sys
B=Path(sys.argv[1]).resolve();D=B/'domino-ui-projection-actual82ak02';S=B/'domino-ui-projection-source82ak02';U=Path(__file__).resolve().parent;R=U.parents[3];sha=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):
 b=Path(p['path']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256'],p['path']
r=json.loads((D/'result.json').read_text());assert r['complete']and not r['errors']and r['postPinsUnchanged']and r['mediaOutputs']==r['publicChecks']==0
for p in r['pins']:pin(p)
raw={}
for p in r['raw']:
 g=(D/p['file']).read_bytes();b=gzip.decompress(g);assert len(g)==p['gzipBytes']and sha(g)==p['gzipSHA256'];assert len(b)==p['jsonBytes']and sha(b)==p['sha256']and len(b)<=8*1024**2;raw[p['file'][:-8]]=json.loads(b)
assert sum(p['jsonBytes']for p in r['raw'])<=128*1024**2 and sum(p['gzipBytes']for p in r['raw'])<=32*1024**2
s=raw['product-ui'];assert s==r['summary']and s['phase']=='complete'and not s['normalPostQualified']and not s['frameAuthority']and all(x['present']for x in s['preflight']);plan=s['input']['normalized'];editable=s['input']['editable'];changed=json.loads(json.dumps(editable));changed['cuts'][0]['area']=None;assert changed==plan
assert plan['W']==1920 and plan['H']==1080 and plan['duration']==1.85 and plan['cuts'][0]['end']==1.35 and plan['cuts'][0]['camP']=={}and plan['cuts'][0]['layout']=='dominoes';assert s['input']['viewport']==s['model']['viewport']=={'width':480,'height':270,'scale':.25}
clock=s['clock'];assert clock['actualCounts']=={'states':112,'selectedPasses':250};states=clock['states'];preimages=clock['preimages'];assert len(states)==len(preimages)==112
number=lambda b:struct.unpack('>d',int(b).to_bytes(8,'big'))[0];n=lambda t:math.floor(t/(1/60)+1e-6);previous=-1
for i,p in enumerate(preimages):
 assert p['n']==i and p['reachable'];lo,hi=int(p['firstBits']),int(p['lastBits']);assert lo==previous+1 and lo<=hi and n(number(lo))==n(number(hi))==i and p['firstTime']==number(lo)and p['lastTime']==number(hi);assert int(p['count'])==hi-lo+1
 if lo:assert n(number(lo-1))==p['predecessorN']==i-1
 previous=hi
assert previous==int.from_bytes(struct.pack('>d',plan['duration']),'big')-1
expected=[]
for i,state in enumerate(states):
 assert state['n']==i and state['q']==i*(1/60)and state['firstTime']==preimages[i]['firstTime']
 for own,(name,lag)in zip(state['passes'],[('B',1.6/24),('A',.8/24),('main',0)]):
  tp=max(0,state['q']-lag);active=tp<plan['cuts'][0]['end'];assert own['pass']==name and own['lag']==lag and own['tp']==own['lt']==tp and own['ltb']==tp+lag and own['step']==math.floor(tp/(1/24)+1e-6)and own['active']==active
  if active:expected.append((i,name,own))
model=s['model'];rows=model['rows'];assert len(rows)==len(expected)==model['coverage']['own']==250 and sum(len(row['supports'])for row in rows)==model['coverage']['supports']==3064;assert model['circle']=={'cx':240,'cy':27,'r':27,'margin':2.7};assert model['staticInput']['rowsD']and len(model['staticInput']['rowsD'])==1 and model['staticInput']['layout']['n']==4
cx,cy,rr=F(240),F(27),F(27)+F(2.7);checked=empty=outsideX=glyphRows=0;minSlack=None
for row,(index,name,own)in zip(rows,expected):
 assert row['n']==index and row['pass']==name and row['clock']=={'lt':own['lt'],'pOut':0,'pass':name};root=row['root'];assert len(root)==6 and root[0]>0 and root[0]==root[3]and root[1]==root[2]==0
 if not row['supports']:empty+=1
 for support in row['supports']:
  assert support['owner']=='dominoes.row.0';b=support['bounds'];x0,x1,y0,y1=(F(b[k])for k in ['x0','x1','y0','y1']);assert x0<=x1 and 0<=y0<=y1<=270;nx=max(x0,min(cx,x1));ny=max(y0,min(cy,y1));assert(nx-cx)**2+(ny-cy)**2>rr**2;checked+=1;outsideX+=x0<0 or x1>480;slack=min(y0,F(270)-y1);minSlack=slack if minSlack is None else min(minSlack,slack)
 for glyph in row['glyphs']:glyphRows+=len(glyph.get('glyphRows',[]))
assert checked==3064 and empty>0 and model['budget']['limit']==8388608 and model['budget']['peak']<8388608 and model['budget']['residentBytes']<8388608;assert s['prepare']['steps']==501 and s['prepare']['stats']['nativeCompiles']==s['prepare']['stats']['commits']==1 and s['prepare']['stats']['destinationSamples']==250
assert s['oldGeneration']['code']=='DOMINO82P_GENERATION_STALE'and not s['released']['pending']and not s['released']['resident']and s['released']['preparingSurfaceBytes']==s['released']['ownedPlanBytes']==0 and not s['released']['rendererAuthority']
for name,path in [('scalar-support82.js','sampler82d/scalar-support82.js'),('scalar-support-shift82.js','source-shift82j/scalar-support82.js'),('visual-policy82.js','visual-policy82m/visual-policy82.js'),('native-geometry82.js','native82a/native-geometry82.js'),('parts82.js','native-parts82b/parts82.js')]:assert(S/name).read_bytes()==(R/'dev/avoidance/domino82'/path).read_bytes()
candidate=(S/'candidate-ja.html').read_text();fragment=(R/'dev/avoidance/domino82/sampler82d/source-input-fragment.js').read_text();assert candidate.count(fragment)==1;candidate=candidate.replace(fragment,'');a=candidate.index('/* TEST82AK startup');z=candidate.index('/* ============================================================\n   JIZURA — editor UI',a);candidate=candidate[:a]+candidate[z:];assert candidate==(R/'index.html').read_text()
h=json.loads((B/(D.name+'-runtime')/'host.json').read_text());assert h['complete']and h['probeExit']==0 and h['normalPageClosureConfirmed']and h['debugPortClosed']and h['pages']['created']==len(h['pages']['closed'])==3 and h['cleanup']['complete']and all(not h['cleanup'][k]for k in ['remaining','signals','ownershipFailures','signalFailures'])
for p in h['runtimeSources']:pin(p)
for p in sorted(B.glob('domino-ui-projection82ak-sourceprep*-final/pins.json')):
 for row in json.loads(p.read_text()):
  pin(row);b=Path(row['snapshot']).read_bytes();assert len(b)==row['bytes']and sha(b)==row['sha256']
print(json.dumps({'checked':True,'pins':len(r['pins']),'rawRecords':len(r['raw']),'jsonBytes':sum(p['jsonBytes']for p in r['raw']),'gzipBytes':sum(p['gzipBytes']for p in r['raw']),'clockStates':112,'own':250,'emptyOwnRetained':empty,'fractionSupports':checked,'glyphRows':glyphRows,'sourceXOutsideStageRetained':outsideX,'minimumYStageSlack':float(minSlack),'logicalSourceDy':model['dy'],'prepareMs':s['prepare']['elapsedMs'],'maxStepMs':s['prepare']['maxStepMs'],'serializedPeak':model['budget']['peak'],'serializedResident':model['budget']['residentBytes'],'oldGenerationRefused':True,'privateReleased':True,'normalWindowsClosed':3,'cleanupComplete':True,'scope':'fresh input-derived geometry owner only; no frame, normal options, formal plan or product UI qualification'},indent=2))
