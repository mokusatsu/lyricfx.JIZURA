import json,math,pathlib,hashlib,argparse
parser=argparse.ArgumentParser();parser.add_argument('base',nargs='?',default='/tmp/avoid009-pile01/physical07');parser.add_argument('--skip-input-rehash',action='store_true');review_options=parser.parse_args();base=pathlib.Path(review_options.base);raw=json.loads((base/'run02/raw.json').read_text())
def h(a,b=0,c=0,d=0,e=0):
 mask=2**32-1;x=(0x9e3779b9^(int(a)&mask))&mask;x=((x^(x>>16))*0x85ebca6b)&mask;x=(x+(int(b)+0x632be5ab)*0xc2b2ae35)&mask;x=((x^(x>>13))*0xc2b2ae35)&mask;x=(x+(int(c)+0x5bd1e995)*0x27d4eb2f)&mask;x=((x^(x>>15))*0x165667b1)&mask;x=(x+(int(d)+0x1b873593)*0x85ebca6b)&mask;x=((x^(x>>16))*0x27d4eb2f)&mask;x=(x+(int(e)+0x68e31da4)*0x9e3779b1)&mask;x^=x>>15;x=(x*0x2c1b3c6d)&mask;x^=x>>12;x=(x*0x297a2d39)&mask;x^=x>>15;return x
r=lambda *a:h(*a)/2**32
rs=lambda *a:2*r(*a)-1

clamp=lambda x:max(0,min(1,x))
def eq(a,b):assert math.isclose(a,b,rel_tol=3e-12,abs_tol=3e-8),(a,b)
def inside(p,poly):
 crosses=[(poly[(i+1)%len(poly)][0]-v[0])*(p[1]-v[1])-(poly[(i+1)%len(poly)][1]-v[1])*(p[0]-v[0]) for i,v in enumerate(poly)]
 return min(crosses)>=-1e-6 or max(crosses)<=1e-6
def extremum(A,B,lo,hi):
 values=[A*math.cos(lo)+B*math.sin(lo),A*math.cos(hi)+B*math.sin(hi)];phase=math.atan2(B,A);R=math.hypot(A,B)
 if math.ceil((lo-phase)/(2*math.pi))<=math.floor((hi-phase)/(2*math.pi)):values.append(R)
 if math.ceil((lo-phase-math.pi)/(2*math.pi))<=math.floor((hi-phase-math.pi)/(2*math.pi)):values.append(-R)
 return min(values),max(values)
n={'cases':0,'offFrames':0,'sourceFrames':0,'moundVertices':0,'heapMemberships':0,'mainSlots':0,'dust':0,'actualPolygons':0,'stageHullVertices':0,'circleHullVertices':0,'fullLaunchLedgers':0,'floorBounds':0,'projectedComparisons':0,'analyticTrigSupports':0,'settledVertices':0,'fallHeightBudgets':0}
for pair in raw['rows']:
 n['cases']+=1;before=pair['06-reference'];after=pair['07'];assert before['sourceUnchanged'] and after['sourceUnchanged'] and not before['failures'] and not after['failures'];assert before['off']==after['off'];n['offFrames']+=len(after['off']);plan=json.loads(after['before']['json']);cut=plan['cuts'][0];W,H=plan['W'],plan['H'];trials={a['id']:a['trial'] for a in after['trials']}
 for key,t in trials.items():
  assert t['status']=='trial-only' and not t['safetyCertificate'] and not t['adapterRegistered'];g=t['source'];recipe=t['recipe'];r0=recipe if recipe['mode']=='physical' else None;metrics={(m['font'],m['ch'],m['size']):m for m in t['nativeDiagnostic']['metrics']}
  def surf0(x):
   if r0:xx=r0['c0']+(x-r0['c'])/r0['a'];B=r0['B'];amp=r0['Hm'];center=r0['c'];sigma=r0['sigma'];beta=r0['beta']
   else:xx=x;B=g['yBase'];amp=g['Hm'];center=g['cx'];sigma=g['sig'];beta=1
   return B-amp/(1+((x-center)/sigma)**4)+beta*(math.sin(xx/W*17+g['seed']%7)*H*.006+math.sin(xx/W*31+g['seed']%5)*H*.004)
  if r0:
   maxRise=max(r0['Ain'],r0['Aout']);top=[]
   for i in range(49):x=r0['c']+r0['a']*(-.02*W+1.04*W*i/48-r0['c0']);top.append(surf0(x)+1.2*g['cell']+maxRise)
   eq(max(top),r0['floorLedger']['maxBodyTop']);assert r0['floor']>=max(top)+.82*g['cell'];bottom=[]
   for q in t['sourceMembership']['possible']:
    bx=r0['c']+r0['a']*(q['x']-g['cx']);metric=metrics[(g['params']['hf'],q['ch'],g['cell']*.8)];a=q['rot']*math.pi/180;bottom.append(surf0(bx)+maxRise+(q['gy']+.5)*g['cell']*.82+q['jy']+max(math.sin(a)*v[0]+math.cos(a)*v[1] for v in metric['vertices']))
   eq(max(bottom),r0['floorLedger']['maxHeapBottom']);assert r0['floor']>=max(bottom);n['floorBounds']+=1
   for q in r0['launchLedger']:
    source=next(v for v in g['slots'] if v['id']==q['owner']);lt=source['when']+.34;out=clamp((lt-(cut['dur']-cut['outDur']))/cut['outDur']);rise=r0['Ain']*(1-clamp(lt/.5))**3+r0['Aout']*out**3;x=r0['c']+(source['gxp']-g['cx'])+(r0.get('rowReflow',{}).get('slots',[{}]*len(g['slots']))[source['slot']].get('offset',0));rest=surf0(x)+rise-g['size']*(.47+.98*source['layer']);launch=r0['Lcenter']+r0['kLaunch']*(source['launchY']-r0['Lreference']);eq(q['impactRest'],rest);eq(q['candidateLaunch'],launch);eq(q['drop'],rest-launch);assert q['drop']>=q['guardHeightBudget'];n['fullLaunchLedgers']+=1
  units={u['owner']:u for u in t['continuous']['units']};riseMax=max(r0['Ain'],r0['Aout']) if r0 else 1.1*g['Hm']
  for slot in g['slots']:
   if slot['gap']:continue
   u=units[slot['id']];metric=metrics[(g['params']['font'],slot['ch'],g['size'])];x=(r0['c']+(slot['gxp']-g['cx'])) if r0 else slot['gxp'];x+=r0.get('rowReflow',{}).get('slots',[{}]*len(g['slots']))[slot['slot']].get('offset',0) if r0 else 0;rest=surf0(x)-g['size']*(.47+.98*slot['layer']);theta=math.atan2(surf0(x+.5*g['size'])-surf0(x-.5*g['size']),g['size'])/math.pi*180*.7+rs(g['seed'],slot['row'],slot['slot'],9)*6;lo=min(slot['launchRot'],theta)*math.pi/180;hi=max(slot['launchRot'],theta)*math.pi/180;fall=u['fallSupport'];eq(fall['analytic']['angleRange'][0],lo);eq(fall['analytic']['angleRange'][1],hi)
   for axis in ['x','y']:
    for v,support in zip(metric['vertices'],fall['analytic'][axis]):
     A,B=(v[0],-v[1]) if axis=='x' else (v[1],v[0]);low,high=extremum(A,B,lo,hi);assert support['range'][0]<=low and support['range'][1]>=high;n['analyticTrigSupports']+=1
   eq(u['settledSupport']['rotation'],theta);a=theta*math.pi/180;vertices=[]
   for sy,label in [(1,'verticesAt1'),(.84,'verticesAt084')]:
    for v,p in zip(metric['vertices'],u['settledSupport'][label]):
     xx=x+math.cos(a)*v[0]-math.sin(a)*sy*v[1];yy=rest+g['size']*.47*(1-sy)+math.sin(a)*v[0]+math.cos(a)*sy*v[1];eq(p[0],xx);eq(p[1],yy);vertices.append([xx,yy]);n['settledVertices']+=1
   b=u['sourceCircleStrict'];assert b['x'][0]<=min(p[0] for p in vertices) and b['x'][1]>=max(p[0] for p in vertices);assert b['y'][0]<=min(p[1] for p in vertices)-g['size']*.14 and b['y'][1]>=max(p[1] for p in vertices)+riseMax
   if r0:
    q=next(q for q in r0['launchLedger'] if q['owner']==slot['id']);width=max(v[0] for v in metric['vertices'])-min(v[0] for v in metric['vertices']);height=max(v[1] for v in metric['vertices'])-min(v[1] for v in metric['vertices']);phi=math.atan2(width,height);candidates=[lo,hi]
    for sign in [-1,1]:
     for k in range(-5,6):
      angle=sign*phi+k*math.pi
      if lo<=angle<=hi:candidates.append(angle)
    actual=max(width*abs(math.sin(a))+height*abs(math.cos(a)) for a in candidates);assert q['guardHeightBudget']>=actual;eq(q['fallHeight']['width'],width);eq(q['fallHeight']['unrotatedHeight'],height);n['fallHeightBudgets']+=1
  for q in t['comparisons']:
   a=next(v for v in t['nativeLedger']['rows'] if v['owner']==q['owner']);b=next(v for v in t['candidateLedger']['rows'] if v['owner']==q['owner']);assert q['withinEnvelopeBudget']==(b['gapBudget']<=a['gapBudget'] and b['penetrationBudget']<=a['penetrationBudget'] and b['horizontalOverhangBudget']<=a['horizontalOverhangBudget']);n['projectedComparisons']+=1
  assert all('PENDING' in q['verticalEnvelopeBudgetComparison'] for q in t['layerComparisons'])
 for obs in after['observations']:
  n['sourceFrames']+=1;g=obs['catalog'];lt=obs['lt'];size=g['size'];seed=g['seed'];t=trials.get(obs['id']);rec=t['recipe'] if t else None;phys=rec if rec and rec['mode']=='physical' else None
  eq(g['lt'],lt);eq(g['pOut'],clamp((lt-(cut['dur']-cut['outDur']))/cut['outDur']));eq(g['cell'],max(16,min(60,min(W,H)*.045)));rise=(1-clamp(lt/.5))**3*g['Hm']*1.1+g['pOut']**3*g['Hm']*.5;eq(g['rise'],rise)
  def nativeSurf(x):return g['yBase']+rise-g['Hm']/(1+((x-g['cx'])/g['sig'])**4)+math.sin(x/W*17+seed%7)*H*.006+math.sin(x/W*31+seed%5)*H*.004
  def physicalSurf(x):
   if not phys:return nativeSurf(x)
   xx=phys['c0']+(x-phys['c'])/phys['a'];pr=phys['Ain']*(1-clamp(lt/.5))**3+phys['Aout']*g['pOut']**3
   return phys['B']+pr-phys['Hm']/(1+((x-phys['c'])/phys['sigma'])**4)+phys['beta']*(math.sin(xx/W*17+seed%7)*H*.006+math.sin(xx/W*31+seed%5)*H*.004)
  for i,p in enumerate(g['mound']):
   nx=-.02*W+1.04*W*i/48 if i<49 else (1.02*W if i==49 else -.02*W);x=phys['c']+phys['a']*(nx-phys['c0']) if phys else nx;y=physicalSurf(x)+1.2*g['cell'] if i<49 else (phys['floor'] if phys else H+4);eq(p[0],x);eq(p[1],y);n['moundVertices']+=1
  expected=[]
  for gx in range(-1,g['colsN']-1):
   if len(expected)>=200:break
   nx=(gx+.5)*g['cell']
   for gy in range(g['depth']):
    if len(expected)>=200:break
    y=nativeSurf(nx)+(gy+.5)*g['cell']*.82
    if y>H+g['cell']:break
    v=g['heap'][len(expected)];assert v['id']==f'pile.heap.{gx}.{gy}' and v['gx']==gx and v['gy']==gy and v['ordinal']==len(expected);ch=g['pool'][h(seed,gx,gy,6)%len(g['pool'])];assert v['ch']==ch;jx=rs(seed,gx,gy,3)*g['cell']*.3;jy=rs(seed,gx,gy,4)*g['cell']*.2;eq(v.get('originalX',v['x']),nx+jx);eq(v.get('originalY',v['y']),y+jy)
    bx=phys['c']+phys['a']*(nx-phys['c0']) if phys else nx;eq(v['x'],bx+jx);eq(v['y'],physicalSurf(bx)+(gy+.5)*g['cell']*.82+jy);eq(v['r'],rs(seed,gx,gy,5)*70);eq(v['a'],(.35+.5*r(seed,gx,gy,8))*(1-gy/(g['depth']+1)));expected.append(v['id']);n['heapMemberships']+=1
  assert len(expected)==len(g['heap'])
  for q in g['slots']:
   n['mainSlots']+=1;eq(q['f'],(lt-q['when'])/.34)
   if q['gap']:continue
   x=q['nativeGxp'];x=phys['c']+(x-phys['c0']) if phys else x;x+=phys.get('rowReflow',{}).get('slots',[{}]*len(g['slots']))[q['slot']].get('offset',0) if phys else 0;eq(q['gxp'],x);ys=physicalSurf(x);eq(q['ys'],ys);theta=math.atan2(physicalSurf(x+.5*size)-physicalSurf(x-.5*size),size)/math.pi*180*.7+rs(seed,q['row'],q['slot'],9)*6;eq(q['tilt'],theta);rest=ys-size*(.47+q['layer']*.98);eq(q['restY'],rest);launch=-size*1.2-r(seed,q['row'],q['slot'],10)*H*.2;eq(q['originalLaunchY'],launch);launch=phys['Lcenter']+phys['kLaunch']*(launch-phys['Lreference']) if phys else launch;eq(q['launchY'],launch);f=q['f']
   if f<0:continue
   if f<1:y=launch+(rest-launch)*f*f;rot=rs(seed,q['row'],q['slot'],11)*50+(theta-rs(seed,q['row'],q['slot'],11)*50)*f*f;sy=1
   else:tau=(f-1)*.34;y=rest-size*.14*abs(math.sin(16*tau))*math.exp(-tau/.09);rot=theta;sy=1-.16*math.exp(-tau/.05)
   eq(q['y'],y);eq(q['rot'],rot);eq(q['sy'],sy);eq(q['itemY'],y+size*.47*(1-sy))
  for particle in g['dust']:
   slot=next(q for q in g['slots'] if q['row']==particle['row'] and q['slot']==particle['slot']);tau=(slot['f']-1)*.34;sp=.6+.6*r(seed,particle['row'],particle['slot'],particle['q']);direction=-1 if particle['q']<2 else 1;eq(particle['tau'],tau);eq(particle['sp'],sp);eq(particle['gxp'],slot['gxp']);eq(particle['restY'],slot['restY']);a=next(a for a in obs['actual'] if a['owner']==particle['id']);args=a['args'];eq(args[0],slot['gxp']+direction*(size*.35+tau*size*1.6*sp));eq(args[1],slot['restY']+size*.45-tau*size*(.9-tau*2.2)*sp);eq(args[2],size*.035*(1-tau/.35));eq(args[6],(1-tau/.35)*(1-g['pOut']**3));n['dust']+=1
  assert obs['directHash']==obs['replayHash'];assert obs['shifted'] is None or obs['shifted']['directHash']==obs['shifted']['replayHash']
  if t:
   units={u['owner']:u for u in t['continuous']['units']}
   for a in obs['actual']:
    u=units[a['owner']];n['actualPolygons']+=1
    for p in a['polygon']:
     assert inside(p,u['stageEnvelope']['polygon']),(pair['id'],obs['id'],a['owner'],p);n['stageHullVertices']+=1
     if a['circleApplies']:assert inside(p,u['circleStrictEnvelope']['polygon']);n['circleHullVertices']+=1
 assert all(c['equal'] for c in next(v for v in raw['comparisons'] if v['id']==pair['id'])['checks'])
end=json.loads((base/'run02/end-pins.json').read_text());assert end['allInputsUnchanged']
if not review_options.skip_input_rehash:
 for f in end['files']:assert hashlib.sha256(pathlib.Path(f['path']).read_bytes()).hexdigest()==f['sha256']==f['actualSHA256']
result={'status':'PASS','rawSHA256':hashlib.sha256((base/'run02/raw.json').read_bytes()).hexdigest(),'counts':n,'inputPinsUnchanged':len(end['files']),'inputPinsActualRehashed':0 if review_options.skip_input_rehash else len(end['files']),'limitations':['Trial only, physical geometry anchoredB0; clipped raster parity is not fullvisible transport.','Independent hull coverage is not circle clearance or stage containment.','Conservative foot/projection budget compliance varies; prior-layer vertical budget PENDING.','No new font, quality, SAFE, adapter, visual/human/public/performance acceptance.']};pathlib.Path('/tmp/parent-pile-physical07-base.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
