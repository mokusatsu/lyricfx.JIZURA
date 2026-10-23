import json,math,pathlib,hashlib,argparse
p=argparse.ArgumentParser();p.add_argument('base',nargs='?',default='/tmp/avoid009-pile01/physical09');p.add_argument('--skip-input-rehash',action='store_true');review_options=p.parse_args();base=pathlib.Path(review_options.base);raw=json.loads((base/'run01/raw.json').read_text());counts=dict(trials=0,owners=0,cells=0,nominalClippedVertices=0,paintFrames=0,actualSettledOwners=0,actualClearanceExtrema=0,declaredSlabs=0,declaredPairChecks=0,declaredFallbacks=0);summary=[]
def eq(x,y):assert math.isclose(x,y,rel_tol=3e-12,abs_tol=3e-8),(x,y)
def hull(points):
 v=sorted(set(tuple(p) for p in points))
 def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
 A=[];B=[]
 for q in v:
  while len(A)>1 and cross(A[-2],A[-1],q)<=0:A.pop()
  A.append(q)
 for q in v[::-1]:
  while len(B)>1 and cross(B[-2],B[-1],q)<=0:B.pop()
  B.append(q)
 return A[:-1]+B[:-1]
def clip(v,x,lower):
 out=[]
 for p,q in zip(v,v[1:]+v[:1]):
  A=p[0]>=x if lower else p[0]<=x;B=q[0]>=x if lower else q[0]<=x
  if A:out.append(p)
  if A!=B:
   t=(x-p[0])/(q[0]-p[0]);out.append((x,p[1]+t*(q[1]-p[1])))
 return out
for pair in raw['rows']:
 old=pair['08-reference'];new=pair['09'];assert old['sourceUnchanged'] and new['sourceUnchanged'] and not old['failures'] and not new['failures'];assert old['off']==new['off'];refs={q['id']:q for q in old['trials']};trials={q['id']:q for q in new['trials']}
 for key,e in trials.items():
  counts['trials']+=1;t=e['trial'];corrected=bool(t.get('sharedYProof'));refkey='a84-split-rho110' if corrected else key;assert (t['sharedYProof']['baselineTrial'] if corrected else t)==refs[refkey]['trial'];g=t['source'];r=t['recipe'];proof=e['correlated'];assert proof['status']=='diagnostic-only' and not proof['safetyCertificate'] and not proof['geometryChanged'] and not proof['recipeChanged'] and proof['groupYImplemented']==corrected;assert e['inputImmutable'];assert proof['oldReports']==dict(native=t['nativeLedger'],candidate=t['candidateLedger'],comparisons=t['comparisons'],layerComparisons=t['layerComparisons']);nativeIDs=[q['id'] for q in g['slots'] if not q['gap']];metrics={(m['font'],m['ch'],m['size']):m for m in t['nativeDiagnostic']['metrics']}
  slabs=0;pairs=0;fallbacks=0
  for variant in ['native','candidate']:
   rows=proof[variant]['rows'];legacy=t['nativeLedger' if variant=='native' else 'candidateLedger'];assert [q['owner'] for q in rows]==nativeIDs;assert proof[variant]['bodyTop']==legacy['bodyTop'];body=legacy['bodyTop'];assert len(body)==49
   for row in rows:
    counts['owners']+=1;src=next(q for q in g['slots'] if q['id']==row['owner']);prev=next(q for q in legacy['rows'] if q['owner']==row['owner']);physical=variant=='candidate' and r['mode']=='physical';x=src['gxp'];
    if physical:x=r['c']+(x-r['c0'])+r.get('rowReflow',{}).get('slots',[{}]*len(g['slots']))[src['slot']].get('offset',0)
    eq(x,row['x']);eq(row['tilt'],prev['tilt']);assert row['horizontalOverhangBudget']==prev['horizontalOverhangBudget'];size=g['size'];theta=row['tilt']*(math.pi/180);cs,sn=math.cos(theta),math.sin(theta);metric=metrics[g['params']['font'],src['ch'],size]
    if physical:
     nx=r['c0']+(x-r['c'])/r['a'];ys=r['B']-r['Hm']/(1+((x-r['c'])/r['sigma'])**4)+r['beta']*(math.sin(nx/g['W']*17+g['seed']%7)*g['H']*.006+math.sin(nx/g['W']*31+g['seed']%5)*g['H']*.004)
    else:ys=g['yBase']-g['Hm']/(1+((x-g['cx'])/g['sig'])**4)+math.sin(x/g['W']*17+g['seed']%7)*g['H']*.006+math.sin(x/g['W']*31+g['seed']%5)*g['H']*.004
    rest=ys-size*(.47+.98*src['layer']);rest+=r['rowReflow']['sharedY']['runs'][r['rowReflow']['slots'][src['slot']]['run']]['dy'] if physical and r.get('rowReflow',{}).get('sharedY') else 0;eq(rest,row['rest']);off=g['cell']*1.2+src['layer']*.98*size
    def vertices(sy):return [[x+cs*vx-sn*sy*vy,rest+size*.47*(1-sy)+sn*vx+cs*sy*vy] for vx,vy in metric['vertices']]
    v1=vertices(1);edges=[(i,(i+1)%4) for i in range(4) if v1[(i+1)%4][0]<v1[i][0]];assert len(row['cells'])==16*len(edges);assert {(tuple(z['sy']),tuple(z['edge'])) for z in row['cells']}=={((.84+.16*k/16,.84+.16*(k+1)/16),edge) for k in range(16) for edge in edges}
    for cell in row['cells']:
     counts['cells']+=1;slabs+=48;pairs+=cell['clippedSegments']*2*120;fallbacks+=cell['fallbacks'];assert cell['QCount']==16 and cell['pairCount']==120
     for cp,epsilon in zip(cell['corners'],cell['sourceCornerEpsilon']):eq(epsilon,512*2**-52*(1+65536+max(map(abs,cp))))
     va,vb=[vertices(sy) for sy in cell['sy']];i,j=cell['edge'];expected=[va[i],va[j],vb[i],vb[j]]
     for p0,q0 in zip(expected,cell['corners']):eq(p0[0],q0[0]);eq(p0[1],q0[1])
     poly=hull(cell['corners']);low=math.inf;high=-math.inf;N=0
     for p0,q0 in zip(body,body[1:]):
      for xx,yy in clip(clip(poly,p0[0],True),q0[0],False):
       line=p0[1]+(q0[1]-p0[1])*(xx-p0[0])/(q0[0]-p0[0]);clear=yy-line+off;low=min(low,clear-.14*size);high=max(high,clear);N+=1
     if N:assert cell['clearance'][0]<=low and cell['clearance'][1]>=high,(key,variant,row['owner'],cell['sy'],low,high,cell['clearance'])
     counts['nominalClippedVertices']+=N
    eq(row['clearance'][0],min(z['clearance'][0] for z in row['cells'] if z['clearance']));eq(row['clearance'][1],max(z['clearance'][1] for z in row['cells'] if z['clearance']));eq(row['gapBudget'],max(0,-row['clearance'][0]));eq(row['penetrationBudget'],max(0,row['clearance'][1]))
  assert proof['budget']['slabs']==slabs<=32768;assert proof['budget']['pairs']==pairs<=8000000;assert proof['budget']['fallbacks']==fallbacks;assert 0<proof['budget']['arithmeticOperations']<=160000000;counts['declaredSlabs']+=slabs;counts['declaredPairChecks']+=pairs;counts['declaredFallbacks']+=fallbacks
  for q in proof['comparisons']:
   n=next(v for v in proof['native']['rows'] if v['owner']==q['owner']);c=next(v for v in proof['candidate']['rows'] if v['owner']==q['owner']);fields=[('gap','gapBudget',.03),('penetration','penetrationBudget',.01),('overhang','horizontalOverhangBudget',.04)]
   for f,k,coef in fields:eq(q['delta'][f],c[k]-n[k]);eq(q['allowance'][f],coef*g['size'])
   assert q['withinTrialEnvelopeAllowance']==all(q['delta'][f]<=q['allowance'][f] for f,_,_ in fields)
  if r['mode']=='native-equivalent':assert proof['native']['rows']==proof['candidate']['rows']
  summary.append(dict(case=pair['id'],recipe=key,strict=sum(q['withinStrictEnvelopeBudget'] for q in proof['comparisons']),allowed=sum(q['withinTrialEnvelopeAllowance'] for q in proof['comparisons']),total=len(proof['comparisons'])))
 for obs in new['observations']:
  counts['paintFrames']+=1;corrected=obs['id']=='a84-split-rho110-groupY';refkey='a84-split-rho110' if corrected else obs['id'];ref=next(v for v in old['observations'] if v['id']==refkey and v['realTime']==obs['realTime'] and v['pass']==obs['pass']);assert obs['eventOrder']==ref['eventOrder'];assert obs['directHash']==obs['replayHash']
  if not corrected:assert obs['catalog']==ref['catalog'] and obs['directHash']==ref['directHash']==ref['replayHash']
  else:assert obs['catalog']['mound']==ref['catalog']['mound'] and obs['catalog']['heap']==ref['catalog']['heap']
  if obs['id']=='native':assert obs['contactActualProbes'] is None;continue
  g=obs['catalog'];entry=trials[obs['id']];proof=entry['correlated'];t=entry['trial'];body=g['mound'][:49];probes=obs['contactActualProbes']['rows'];assert {q['owner'] for q in probes}=={q['id'] for q in g['slots'] if not q['gap'] and q['f']>=1};size=g['size']
  for z in probes:
   counts['actualSettledOwners']+=1;src=next(q for q in g['slots'] if q['id']==z['owner']);bound=next(v for v in proof['candidate']['rows'] if v['owner']==z['owner']);assert z['covered'];assert z['continuousBound']==bound['clearance'];metric=next(q for q in t['nativeDiagnostic']['metrics'] if q['font']==g['params']['font'] and q['ch']==src['ch'] and q['size']==size);a=src['rot']*(math.pi/180);cs,sn=math.cos(a),math.sin(a);p0=[[src['gxp']+cs*x-sn*src['sy']*y,src['itemY']+sn*x+cs*src['sy']*y] for x,y in metric['vertices']]
   for a0,b0 in zip(p0,z['sourceInkVertices']):eq(a0[0],b0[0]);eq(a0[1],b0[1])
   values=[];off=g['cell']*1.2+src['layer']*.98*size
   for p1,q1 in zip(p0,p0[1:]+p0[:1]):
    if q1[0]>=p1[0]:continue
    for u,v in zip(body,body[1:]):
     lo=max(q1[0],u[0]);hi=min(p1[0],v[0])
     if lo>hi:continue
     for x in [lo,hi]:
      y=p1[1]+(q1[1]-p1[1])*(x-p1[0])/(q1[0]-p1[0]);line=u[1]+(v[1]-u[1])*(x-u[0])/(v[0]-u[0]);val=y-line+off;assert bound['clearance'][0]<=val<=bound['clearance'][1];values.append(val);counts['actualClearanceExtrema']+=1
   assert len(values)==len(z['values'])
   for x,y in zip(values,z['values']):eq(x,y['clearance'])
 assert all(q['equal'] for q in next(q for q in raw['comparisons'] if q['id']==pair['id'])['checks'])
assert not raw['errors'];end=json.loads((base/'run01/end-pins.json').read_text());assert end['allInputsUnchanged'];N=len(end['files'])
if not review_options.skip_input_rehash:
 for q in end['files']:assert hashlib.sha256(pathlib.Path(q['path']).read_bytes()).hexdigest()==q['sha256']==q['actualSHA256']
result=dict(status='PASS',rawSHA256=hashlib.sha256((base/'run01/raw.json').read_bytes()).hexdigest(),counts=counts,inputsUnchanged=N,inputsActuallyRehashed=0 if review_options.skip_input_rehash else N,diagnostics=summary,limitations=['Corrected correlated projection budget reproof, not filledink/quality/SAFE/adapter acceptance','SharedY correctedinputs acceptedonlywithfreshproof; controls/nativefont unchanged andbaselinefailures retained','Translated allphasecircle/stage geometry verified separately, no visual/human acceptance','Ordinary numeric model; independent nominal clipping is falsification of interval containment, not formal libm proof']);pathlib.Path('/tmp/parent-pile-contact09.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
