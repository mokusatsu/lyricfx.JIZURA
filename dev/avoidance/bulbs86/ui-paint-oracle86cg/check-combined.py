"""Independent Fraction geometry/endpoint audit; no Qt, image, model or table read."""
from pathlib import Path
from fractions import Fraction as Q
import json,gzip,hashlib,struct,sys,math
D=Path(sys.argv[1]);E=Path(sys.argv[2]);result=json.loads((D/'result.json').read_text());continued=json.loads((E/'result.json').read_text())
def decode(v):
 if isinstance(v,dict):
  if set(v)=={'$f64'}:return struct.unpack('>d',bytes.fromhex(v['$f64']))[0]
  return {k:decode(x)for k,x in v.items()}
 if isinstance(v,list):return [decode(x)for x in v]
 return v
F=lambda x:Q.from_float(x) if isinstance(x,float) else Q(x)
def dy(v):return Q(int(v['n']))*Q(2)**int(v['e'])
def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
def hull(points):
 points=sorted(set(points));lower=[];upper=[]
 for p in points:
  while len(lower)>1 and cross(lower[-2],lower[-1],p)<=0:lower.pop()
  lower.append(p)
 for p in points[::-1]:
  while len(upper)>1 and cross(upper[-2],upper[-1],p)<=0:upper.pop()
  upper.append(p)
 return lower[:-1]+upper[:-1]
def atom(p):
 assert p['state']['alpha']>0 and p['state']['filter']=='none';pad=Q(0);kind=p['kind'];st=p['state'];m=list(map(F,p['matrix']))
 if kind.endswith('Text'):
  assert st['textAlign']=='center' and st['textBaseline']=='middle';metrics=p['metrics'];x,y=map(F,p['args'][1:3]);pad=Q(1)+(F(st['lineWidth'])*F(st['miterLimit']/2)if kind=='strokeText'else 0);x0=x-F(metrics['actualBoundingBoxLeft'])-pad;x1=x+F(metrics['actualBoundingBoxRight'])+pad;y0=y-F(metrics['actualBoundingBoxAscent'])-pad;y1=y+F(metrics['actualBoundingBoxDescent'])+pad;local=[(x0,y0),(x1,y0),(x1,y1),(x0,y1)];pad=Q(0)
 elif kind.endswith('Rect'):
  x,y,w,h=map(F,p['args']);local=[(x,y),(x+w,y),(x+w,y+h),(x,y+h)];pad=F(st['lineWidth'])*F(st['miterLimit']/2)if kind=='strokeRect'else 0
 else:
  assert kind in ['fill','stroke'];arcs=[c for c in p['path']if c['key']=='arc']
  if arcs:
   assert len(arcs)==1 and kind=='fill' and arcs[0]['matrix']==p['matrix'];x,y,r=map(F,arcs[0]['args'][:3]);assert arcs[0]['args'][3:5]==[0,math.pi*2];local=[(x-r,y-r),(x+r,y-r),(x+r,y+r),(x-r,y+r)]
  else:
   assert all(c['key']in ['moveTo','lineTo','closePath']for c in p['path']);local=[]
   for c in p['path']:
    if c['key']!='closePath':assert c['matrix']==p['matrix'];local.append(tuple(map(F,c['args'][:2])))
   assert len(local)>=3;pad=F(st['lineWidth'])*F(st['miterLimit']/2)if kind=='stroke'else 0
 if pad:
  x0=min(x for x,y in local)-pad;x1=max(x for x,y in local)+pad;y0=min(y for x,y in local)-pad;y1=max(y for x,y in local)+pad;local=[(x0,y0),(x1,y0),(x1,y1),(x0,y1)]
 points=[(m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5])for x,y in local];poly=hull([(x+dx,y+dy)for x,y in points for dx,dy in [(-2,-2),(2,-2),(2,2),(-2,2)]]);return poly,dict(x0=min(x for x,y in poly),x1=max(x for x,y in poly),y0=min(y for x,y in poly),y1=max(y for x,y in poly))
def clear(poly,circle):
 c=(F(circle['cx']),F(circle['cy']));rr=(F(circle['r'])+F(circle['margin']))**2;signs=[]
 for i,a in enumerate(poly):
  b=poly[(i+1)%len(poly)];v=(b[0]-a[0],b[1]-a[1]);w=(c[0]-a[0],c[1]-a[1]);dot=v[0]*w[0]+v[1]*w[1];length=v[0]**2+v[1]**2;cr=cross(a,b,c);signs.append(cr)
  if dot<=0:assert w[0]**2+w[1]**2>rr
  elif dot<length:assert cr**2>rr*length
 assert any(s>0 for s in signs)and any(s<0 for s in signs)
def raw(meta):
 g=(D/meta['file']).read_bytes();b=gzip.decompress(g);assert(len(g),hashlib.sha256(g).hexdigest(),len(b),hashlib.sha256(b).hexdigest())==(meta['gzipBytes'],meta['gzipSHA256'],meta['jsonBytes'],meta['sha256']);return json.loads(b)
assert not result['complete'] and result['postPinsUnchanged'] and len(result['errors'])==1 and result['errors'][0]['message']=='TOTAL128MiB';assert continued['complete'] and not continued['errors'] and continued['postPinsUnchanged'];assert continued['prior']['complete'] is False
for p in result['pins']+continued['pins']:
 b=Path(p['path']).read_bytes();assert(len(b),hashlib.sha256(b).hexdigest())==(p['bytes'],p['sha256'])
for directory,rr in [(D,result),(E,continued)]:
 for meta in rr['raw']:raw({**meta,'file':str((directory/meta['file']).resolve())})
for field in ['source','clock','viewport']:
 a=raw(next({**p,'file':str(D/p['file'])}for p in result['raw']if p['file']=='setup-480.json.gz'))[field]
 b=raw(next({**p,'file':str(E/p['file'])}for p in continued['raw']if p['file']=='setup-480.json.gz'))[field]
 assert a==b,('CROSS_RUN_EXACT_'+field)
metas={p['file']:{**p,'file':str((D/p['file']).resolve())} for p in result['raw']};overlap={p['file'] for p in result['raw']} & {p['file'] for p in continued['raw']};assert not any(n.startswith('frame-')for n in overlap);
for p in continued['raw']:
 if p['file'] not in metas:metas[p['file']]={**p,'file':str((E/p['file']).resolve())}
counts={'frames':0,'own':0,'paint':0,'supports':0};reports=[]
for width in [720,480]:
 setup=raw(metas[f'setup-{width}.json.gz']);source=setup['source'];viewport=setup['viewport'];circle=setup['circle'];clock=setup['clock'];states=clock['states'];assert len(states)<=512
 excluded=['placementTrajectory','fullStagePlacement','placementUnits','placementGlyphs','placementLayoutsA','placementLayoutsB','placementLayoutsC','placementLayoutsD','layoutDRecipe','layoutCRecipe','layoutBRecipe','layoutBRecipe','layoutBEvaluationRange','placementAdaptiveTrial','layoutARecipe','layoutAHoldRange','placementSelectionOrigin']
 formal=json.loads(json.dumps(setup['formal']));formal.pop('placementFinalization',None)
 for cut in formal['cuts']:
  for k in excluded:cut.pop(k,None)
 assert formal==source,('FORMAL_SOURCE_MISMATCH',width)
 editable=json.loads(json.dumps(setup['plan']));assert editable['cuts'][0]['area'] is not None;editable['cuts'][0]['area']=None;assert editable==source,('ONLY_EXISTING_FINALIZER_AREA_NORMALIZATION',width)
 assert viewport['width']==width and viewport['scale']==width/source['W'];r=source['lyricAvoidanceIndex']['regions'][0];canonical=(r['center']['x']*source['W'],r['center']['y']*source['H'],r['radius']*source['H']);scale=F(viewport['scale']);assert circle['margin']==2.7
 center_error=abs(F(canonical[0])*scale-F(circle['cx']))+abs(F(canonical[1])*scale-F(circle['cy']));assert F(circle['r'])>=F(canonical[2])*scale+center_error
 reachable=[p for p in clock['preimages']if p['reachable']];assert [p['n']for p in reachable]==[s['n']for s in states]
 assert int(reachable[0]['firstBits'])==0 and int(reachable[-1]['lastBits'])==int(clock['lastBits']);assert sum(int(p['count'])for p in reachable)==int(clock['domainNumberCount'])
 for a,b in zip(reachable,reachable[1:]):assert int(a['lastBits'])+1==int(b['firstBits'])
 expected_names={f'frame-{width}-{state["n"]}-{endpoint}.json.gz'for state in states for endpoint in ['first','last']};actual_names={n for n in metas if n.startswith(f'frame-{width}-')};assert actual_names==expected_names,('MISSING_OR_EXTRA_ENDPOINTS',width)
 def at(bits):return struct.unpack('>d',int(bits).to_bytes(8,'big'))[0]
 N=lambda t:math.floor(t/clock['h']+1e-6)
 assert struct.pack('>d',clock['last']).hex()==format(int(clock['lastBits']),'016x')and at(int(clock['lastBits'])+1)==clock['end']
 for bits,n in clock['queryBitsAndNs']:assert N(at(bits))==n
 for pre in reachable:
  lo=int(pre['firstBits']);hi=int(pre['lastBits']);assert N(at(lo))==N(at(hi))==pre['n'];assert hi-lo+1==int(pre['count'])
  if lo:assert N(at(lo-1))==pre['n']-1==pre['predecessorN']
  if hi<int(clock['lastBits']):assert N(at(hi+1))==pre['n']+1==pre['nextN']
 for state in states:
  assert state['q']==state['n']*clock['h']
  for own,lag in zip(state['passes'],[1.6/24,.8/24,0]):
   tp=max(0,state['q']-lag);cut=source['cuts'][0];assert own['lag']==lag and own['tp']==tp and own['lt']==tp-cut['start'] and own['ltb']==(tp-cut['start'])+lag and own['step']==math.floor(tp/(1/24)+1e-6);assert own['active']==((cut.get('renderStart')or cut['start'])<=tp<(cut.get('displayEnd')or cut['end']))
  pre=next(p for p in reachable if p['n']==state['n']);expected=[p for p in state['passes']if p['active']]
  for endpoint in ['first','last']:
   data=decode(raw(metas[f'frame-{width}-{state["n"]}-{endpoint}.json.gz']));t=pre[endpoint+'Time'];assert struct.pack('>d',t).hex()==format(int(pre[endpoint+'Bits']),'016x');assert data['time']==t and math.floor(t/clock['h']+1e-6)==state['n'];assert data['equal'];assert data['expectedPasses']==state['passes'];table=data['paintTable'];counts['frames']+=1
   assert [a['pass']for a in data['actual']]==[p['pass']for p in expected]==[o['pass']for o in data['oracle']]
   assert len(data['actual'])==len(data['oracle'])==len(expected)
   for a,o,own in zip(data['actual'],data['oracle'],expected):
    assert a['root']==o['root'] and a['clock']==o['clock'] and a['records']==o['records'];assert a['clock']['realTime']==t and a['clock']['t']==own['tp'] and a['clock']['lt']==own['lt']and a['clock']['ltb']==own['ltb']and a['clock']['step']==own['step'];assert o['stateRestored'];counts['own']+=1
    for i in a['records']:
     p=table[int(i)];assert p['owner'].startswith('bulbs.sign.')and p['role']=='primary'and p['pass']==own['pass'];counts['paint']+=1
   expected_supports=[(a['pass'],ordinal,int(i))for a in data['actual']for ordinal,i in enumerate(a['records'])if table[int(i)]['state']['alpha']>0]
   assert [(s['pass'],int(s['ordinal']),int(s['paint']))for s in data['supports']]==expected_supports
   for s in data['supports']:
    p=table[int(s['paint'])];poly,bounds=atom(p);assert poly==[tuple(map(dy,p))for p in s['polygon']];assert bounds=={k:dy(v)for k,v in s['bounds'].items()};assert 0<=bounds['x0']<=bounds['x1']<=width and 0<=bounds['y0']<=bounds['y1']<=viewport['height'];clear(poly,circle);assert not s['circleConflict']and s['stageContained'];counts['supports']+=1
 invalid=raw(metas[f'invalidate-{width}.json.gz']);assert invalid['after']['generation']>invalid['before']['generation']and not invalid['after']['ready']and invalid['old']['failure']and not invalid['old']['admitted'];assert invalid['released']['owner']['residentModels']==invalid['released']['reservation']['records']==invalid['released']['reservation']['bindings']==0
 reports.append({'width':width,'states':len(states),'endpointFrames':len(states)*2,'normalizedDiffKeys':sorted(set(source)-set(setup['plan']))})
for directory,exitcode in [(D,1),(E,0)]:
 host=json.loads(directory.with_name(directory.name+'-runtime').joinpath('host.json').read_text());assert host['probeExit']==exitcode and host['normalPageClosureConfirmed']and host['cleanup']['complete']and not host['cleanup']['remaining']and not host['cleanup']['signals']and host['debugPortClosed']
assert continued['summaries'][0]['frames']==69
print(json.dumps({'passed':True,'sourcePins':len(result['pins'])+len(continued['pins']),'allRawHashes':len(result['raw'])+len(continued['raw']),'endpointOverlap':0,'missingEndpoints':0,'crossRunSourceClockViewportEqual':True,**counts,'cases':reports,'scope':'all reachable Float64 preimage endpoints and owned source paint; exact Fraction support/circle/stage audit under existing 1fontpx/2devicepx conditional foundation; not all real times or pixel/RGBA coverage'},ensure_ascii=False))
