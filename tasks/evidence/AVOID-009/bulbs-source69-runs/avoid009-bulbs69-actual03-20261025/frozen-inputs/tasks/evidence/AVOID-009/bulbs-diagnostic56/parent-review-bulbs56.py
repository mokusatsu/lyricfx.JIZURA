"""Independent parent inspection of diagnostic raw; no product/browser/network writes."""
from pathlib import Path
import json,gzip,hashlib,struct,math,collections,time,os
from fractions import Fraction as F
R=Path('/workspace/lyricfx.JIZURA');B=Path('/dev/shm/avoid009-evening-20261024/bulbs56.raw01');E=R/'tasks/evidence/AVOID-009/bulbs-diagnostic56'
H=lambda b:hashlib.sha256(b).hexdigest();Q=F.from_float;U=object();stats=collections.Counter();start=time.monotonic()
def exact(v):
 if v is U:return ('$undefined',)
 if isinstance(v,float):return ('$f64',struct.pack('>d',v).hex())
 if isinstance(v,list):return tuple(exact(x) for x in v)
 if isinstance(v,dict):return tuple(sorted((k,exact(x)) for k,x in v.items()))
 return v
def read(row,folder=B):
 out=[]
 for x in row['parts']:
  b=(folder/x['path']).read_bytes();assert len(b)==x['bytes'] and H(b)==x['sha256'];d=gzip.decompress(b);assert len(d)==x['JSONBytes'] and H(d)==x['JSONSHA256'];out.append(d);stats['gzipParts']+=1
 b=b''.join(out);assert row['complete'] and len(b)==row['JSONBytes'] and H(b)==row['JSONSHA256'];stats['records']+=1;stats['JSONBytes']+=len(b);return json.loads(b)
def dec(v):
 if isinstance(v,list):return [dec(x) for x in v]
 if isinstance(v,dict):
  if set(v)=={'$undefined'} and v['$undefined'] is True:return U
  if set(v)=={'$f64'}:return struct.unpack('>d',bytes.fromhex(v['$f64']))[0]
  return {k:dec(x) for k,x in v.items()}
 return v
def dy(v):return F(int(v['n']))*F(2)**v['e']
def numericID(v):
 assert isinstance(v,(int,float)) and not isinstance(v,bool) and math.isfinite(v) and v==int(v) and v>=0
 return int(v)
def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
def hull(points):
 pts=sorted(set(points));lo=[];hi=[]
 for out,rows in [(lo,pts),(hi,reversed(pts))]:
  for p in rows:
   while len(out)>1 and cross(out[-2],out[-1],p)<=0:out.pop()
   out.append(p)
 return lo[:-1]+hi[:-1]
def geom(p):
 k=p['kind'];s=p['state'];pad=F(0);assert s['alpha']>0 and s['filter']=='none' and not any(s[x] for x in ['shadowBlur','shadowOffsetX','shadowOffsetY'])
 if k.endswith('Text'):
  m=p['metrics'];x,y=map(Q,p['args'][1:3]);pad=F(1)
  if k=='strokeText':pad+=Q(s['lineWidth'])*Q(s['miterLimit']/2)
  a=x-Q(m['actualBoundingBoxLeft'])-pad;b=x+Q(m['actualBoundingBoxRight'])+pad;c=y-Q(m['actualBoundingBoxAscent'])-pad;d=y+Q(m['actualBoundingBoxDescent'])+pad;xy=[(a,c),(b,c),(b,d),(a,d)];pad=F(0)
 elif k.endswith('Rect'):
  x,y,w,h=map(Q,p['args']);xy=[(x,y),(x+w,y),(x+w,y+h),(x,y+h)]
  if k=='strokeRect':pad=Q(s['lineWidth'])*Q(s['miterLimit']/2)
 else:
  arcs=[c for c in p['path'] if c['key']=='arc']
  if arcs:
   assert len(arcs)==1 and k=='fill';x,y,r=map(Q,arcs[0]['args'][:3]);xy=[(x-r,y-r),(x+r,y-r),(x+r,y+r),(x-r,y+r)]
  else:
   xy=[]
   for c in p['path']:
    assert c['matrix']==p['matrix']
    if c['key'] in ['moveTo','lineTo']:xy.append(tuple(map(Q,c['args'][:2])))
    else:assert c['key']=='closePath'
   if k=='stroke':pad=Q(s['lineWidth'])*Q(s['miterLimit']/2)
 if pad:
  a=min(x for x,y in xy)-pad;b=max(x for x,y in xy)+pad;c=min(y for x,y in xy)-pad;d=max(y for x,y in xy)+pad;xy=[(a,c),(b,c),(b,d),(a,d)]
 M=list(map(Q,p['matrix']));points=[]
 for x,y in xy:
  X=M[0]*x+M[2]*y+M[4];Y=M[1]*x+M[3]*y+M[5]
  points.extend([(X-2,Y-2),(X+2,Y-2),(X+2,Y+2),(X-2,Y+2)])
 return hull(points)
def conflict(poly,c):
 center=(Q(c['cx']),Q(c['cy']));rr=Q(c['effectiveRadius'])**2;signs=[]
 for a,b in zip(poly,poly[1:]+poly[:1]):
  vx,vy=b[0]-a[0],b[1]-a[1];wx,wy=center[0]-a[0],center[1]-a[1];dot=vx*wx+vy*wy;length=vx*vx+vy*vy;cr=vx*wy-vy*wx;signs.append(cross(a,b,center))
  if dot<=0 and wx*wx+wy*wy<=rr:return True
  if 0<dot<length and cr*cr<=rr*length:return True
 return not(any(x>0 for x in signs) and any(x<0 for x in signs))
def stage(poly):return any(x<0 or x>960 or y<0 or y>540 for x,y in poly)
def core(p):
 s=p['state'];keys=['alpha','blend','filter','shadowColor','shadowBlur','shadowOffsetX','shadowOffsetY'];keys+=['strokeStyle','lineWidth','lineCap','lineJoin','miterLimit','dash','dashOffset'] if p['kind'].startswith('stroke') else ['fillStyle'];keys+=['font','textAlign','textBaseline','direction'] if p['kind'].endswith('Text') else [];return {**{k:p.get(k,U) for k in ['kind','args','matrix','path','metrics']},'state':{k:s.get(k,U) for k in keys}}
def clock(C):
 flt=lambda n:struct.unpack('>d',struct.pack('>Q',n))[0];N=lambda t:math.floor(t/(1/60)+1e-6);last=-1;total=0;passes=0
 assert C['h']==1/60 and C['end']==4.150001 and C['last']==math.nextafter(C['end'],-math.inf)
 for b,n in C['queryBitsAndNs']:assert N(flt(int(b)))==n
 for p,s in zip(C['preimages'],C['states']):
  lo,hi=int(p['firstBits']),int(p['lastBits']);assert p['reachable'] and lo==last+1 and N(flt(lo))==p['n']==N(flt(hi));assert int(p['count'])==hi-lo+1;assert s['firstTime']==flt(lo)==p['firstTime'] and p['lastTime']==flt(hi);assert p['predecessorN']==(N(flt(lo-1)) if lo else None);assert p['nextN']==(N(flt(hi+1)) if hi<int(C['lastBits']) else None);total+=hi-lo+1;last=hi;assert s['q']==s['n']*(1/60)
  for p,(tag,lag) in zip(s['passes'],[('B',1.6/24),('A',.8/24),('main',0)]):
   t=max(0,s['q']-lag);assert p['pass']==tag and p['lag']==lag and p['tp']==p['lt']==t and p['ltb']==t+lag and p['step']==math.floor(t/(1/24)+1e-6) and p['active']==(0<=t<4);passes+=p['active']
 assert total==int(C['domainNumberCount'])==int(C['lastBits'])+1 and len(C['states'])==250 and passes==727;stats['clockStates']+=250;stats['clockSelectedPasses']+=passes
mb=(B/'manifest.json').read_bytes();m=json.loads(mb);assert m['complete'] and not m['errors'] and m['postPins']['unchanged'] and not m['inFlight'] and not m['partialRecords'];assert m['completed']['fixtures']==2 and m['completed']['candidateFamilies']==6
tables={};native={};clocks={};families=[];dest=collections.defaultdict(list);destinationReports=[];transport=0
for row in m['records']:
 j=read(row);name=row['id'];spec=name.split('.')[0]
 if name.endswith('.init'):clock(j['clocks']);clocks[spec]=j['clocks'];tables[spec]={'paint':[],'matrix':[],'catalog':[]}
 if 'tables' in j and isinstance(j['tables'],dict) and all(isinstance(x,list) for x in j['tables'].values()):
  for k,values in j['tables'].items():
   for x in values:assert x['id']==len(tables[spec][k]);tables[spec][k].append(x['value'])
 if name.endswith('.family'):
  assert len(j['outcomes'])==len(j['family']['rows'])<=512
  strict=next((x for x in j['outcomes'] if x['strictPass']),None);moving=next((x for x in j['outcomes'] if x['movingPolicyPass']),None);chosen=strict or moving;assert (chosen is None)==(j['chosen'] is None)
  if chosen:assert chosen['i']==j['chosen']['i'] and chosen['delta']==j['chosen']['delta'] and chosen['complete']
  families.append({'id':name,'chosen':j['chosen'],'selectedPolicy':j['selectedPolicy'],'conditional':True})
 if name.endswith('.excludedEnd'):assert not j['records'] and not j['passes']
 if 'zeroObserverEqual' in j and not name.endswith('.excludedEnd'):
  if any(j['delta']):assert j['zeroObserverEqual'] is None
  else:assert j['zeroObserverEqual'] and j['originalSHA256']==j['observedSHA256']
  T=tables[spec];state=clocks[spec]['states'][j['n']];assert j['firstTime']==state['firstTime'];expected=[x for x in state['passes'] if x['active']];assert len(j['passes'])==len(expected);cats={}
  for p,own in zip(j['passes'],expected):
   for k in ['pass','tp','lt','ltb','step']:assert p[k]==own[k]
   binding=p['catalogBinding'];cat=dec(T['catalog'][binding['catalogIntrinsicID']]);root=dec(T['matrix'][binding['catalogRootMatrixID']]);calls=[];b=binding['callTransformBinding'];assert b['verifiedCalls']==len(cat['sourceCalls'])
   for i,c in enumerate(cat['sourceCalls']):
    c=dict(c)
    if b['kind']=='SAME_ROOT':c.update(matrixBeforeCall=root[:],matrixAfterCall=root[:])
    else:
     pair=b['calls'][i]
     if pair['beforePresent']:c['matrixBeforeCall']=dec(T['matrix'][pair['beforeMatrixID']])
     if pair['afterPresent']:c['matrixAfterCall']=dec(T['matrix'][pair['afterMatrixID']])
    calls.append(c)
   cat['sourceCalls']=calls
   if binding['catalogRootPresent']:cat['root']=root
   cats[p['pass']]=cat;assert cat['clock']['lt']==p['lt'] and cat['clock']['ltb']==p['ltb'] and cat['clock']['step']==p['step'];stats['catalogsReconstructed']+=1
  paints=[]
  for u in j['paintUses']:
   p=dec(T['paint'][u['templateID']]);M=dec(T['matrix'][u['matrixID']]);p.update(pass_=u['pass']);p.pop('pass_',None);p.update({'pass':u['pass'],'owner':u['owner'],'role':u['role'],'matrix':M});p['path']=[{**{k:v for k,v in c.items() if k!='pathMatrix'},'matrix':M} for c in p['path']];poly=geom(p);saved=[tuple(dy(x) for x in point) for point in u['support']['polygon']];assert poly==saved;bounds={k:dy(v) for k,v in u['support']['bounds'].items()};assert bounds=={'x0':min(x for x,y in poly),'x1':max(x for x,y in poly),'y0':min(y for x,y in poly),'y1':max(y for x,y in poly)};stats['independentExactSupportPaints']+=1;stats['independentExactSupportVertices']+=len(poly);paints.append(p)
   if '.moved' in name:
    circleID=name.split('.')[1];c=next(x for x in m['circles'] if x['id']==circleID);own=cats[u['pass']]['clock'];moving=not u['owner'].endswith(('.lyric','.subtitle')) and (own['lt']<.35 or 0<own['pOut']<1);hit=conflict(poly,c);dest[(spec,circleID)].append((hit,hit and not moving,stage(poly)))
  if '.state' in name:native[(spec,j['n'])]=(j,paints,cats);stats['nativeWholePairs']+=1
  elif '.moved' in name:
   baseline,originalPaints,originalCats=native[(spec,j['n'])];assert j['originalSHA256']==baseline['originalSHA256'];assert len(paints)==len(originalPaints)
   for a,b in zip(paints,originalPaints):
    def strip(p):return {**{k:v for k,v in p.items() if k!='matrix'},'path':[{k:v for k,v in c.items() if k!='matrix'} for c in p['path']]}
    assert exact(strip(a))==exact(strip(b))
   for k,cat in cats.items():
    def strip(c):return {**{k:v for k,v in c.items() if k!='root'},'sourceCalls':[{k:v for k,v in v.items() if k not in ['matrixBeforeCall','matrixAfterCall']} for v in c['sourceCalls']]}
    assert exact(strip(cat))==exact(strip(originalCats[k]))
   assert j['nativeArgumentTemplatesAndPainterOrderExact'] and j['nativeClockNAndCadenceCatalogExact'] and j['intrinsicCatalogEntriesUnchangedByMovedRoot'];stats['materializedWholeStates']+=1
 if name.endswith('.actual-destination'):
  rows=dest[(spec,name.split('.')[1])];counts=dict(zip(['circleStrict','circleMovingPolicy','stage'],map(sum,zip(*rows))));assert counts==j['counts'] and j['complete'] and j['checked']==len(rows) and not j['notEvaluated'];assert j['strictPass']==(counts['circleStrict']==counts['stage']==0);assert j['movingPolicyPass']==(counts['circleMovingPolicy']==counts['stage']==0);destinationReports.append({'id':name,'counts':counts,'strictPass':j['strictPass'],'movingPolicyPass':j['movingPolicyPass'],'conditional':True})
 if '.transport' in name and 'paintRefs' in j:
  meta=dec(j['metadata']);assert j['status']=={'stockSynchronousTransportExact':True};assert meta['nativeSHA256']==meta['zeroSHA256'] and meta['movedSHA256']==meta['directSHA256'];assert all(len(j['paintRefs'][k])==len(j['paintRefs']['nativePaint']) for k in j['paintRefs']);pairs={}
  for k,refs in j['paintRefs'].items():
   ps=[]
   for ref in refs:
    paint=dec(tables[spec]['paint'][ref['fullRecordTemplateID']]);paint['matrix']=dec(tables[spec]['matrix'][ref['matrixID']]);ps.append(core(paint))
   pairs[k]=ps
  assert exact(pairs['nativePaint'])==exact(pairs['zeroPaint']) and exact(pairs['movedPaint'])==exact(pairs['directPaint']);stats['stockTransportFullPaintRecords']+=len(pairs['nativePaint']);transport+=1
old=B.parent/'bulbs55.raw01';om=json.loads((old/'manifest.json').read_bytes());assert H((old/'manifest.json').read_bytes())=='f14038b8cd31bfc87c313e9009510ed0e3bc930f609aeda9bd9562b1ea14a0e5';oldT={'paint':[],'matrix':[],'catalog':[]}
for row in om['records']:
 name=row['id']
 if name.startswith('one-wind.circle'):break
 j=read(row,old)
 if 'tables' in j:
  for k,values in j['tables'].items():
   for x in values:assert x['id']==len(oldT[k]);oldT[k].append(x['value'])
 if name.startswith('one-wind.state'):
  current,paints,cats=native[('one-wind',j['n'])];assert j['originalSHA256']==current['originalSHA256'] and j['observedSHA256']==current['observedSHA256'];oldPaints=[]
  for u in j['paintUses']:
   p=dec(oldT['paint'][u['templateID']]);M=dec(oldT['matrix'][u['matrixID']]);p.update({'pass':u['pass'],'owner':u['owner'],'role':u['role'],'matrix':M});p['path']=[{**{k:v for k,v in c.items() if k!='pathMatrix'},'matrix':M} for c in p['path']];oldPaints.append(p)
  assert exact(oldPaints)==exact(paints)
  for p in j['passes']:
   c=dec(oldT['catalog'][p['catalogID']]);c['root']=dec(oldT['matrix'][numericID(c.pop('rootMatrixID'))]);calls=[]
   for call in c['sourceCalls']:
    call['matrixBeforeCall']=dec(oldT['matrix'][numericID(call.pop('beforeMatrixID'))]);call['matrixAfterCall']=dec(oldT['matrix'][numericID(call.pop('afterMatrixID'))]);calls.append(call)
   c['sourceCalls']=calls;assert exact(c)==exact(cats[p['pass']])
  stats['oneWindNativeFramesFullValuesEqualToFailed55']+=1
assert stats['oneWindNativeFramesFullValuesEqualToFailed55']==250
for p in m['pins']['files']+m['pins']['pycache']:assert H((R/p['path']).read_bytes())==p['sha256']
for p in m['pins']['absent61']:assert not os.path.lexists(R/p)
assert H((R/'.git/index').read_bytes())==m['pins']['index']['sha256'];assert stats['nativeWholePairs']==500 and stats['clockSelectedPasses']==1454 and len(families)==6 and stats['materializedWholeStates']==250*m['completed']['materializations'] and transport==m['completed']['transportPairs']
report={'state':'PARENT_COMPLETE56_CONDITIONAL_DIAGNOSTIC_RAW_REVIEWED_NOT_PRODUCT_OR_RASTER_CERTIFICATE','manifestSHA256':H(mb),'stats':dict(stats),'families':families,'destinations':destinationReports,'stockTransportSubsetPairs':transport,'notAllTimeFullRendererTransport':True,'numericalFoundationConditional':True,'noGlobalImpossibilityConclusion':True,'adapterAdded':False,'sourcePostpinsIndependentlyRechecked':True,'formalPerformanceAccepted':False,'savingBodyTested':False,'humanMotionApproval':False,'publicChecks':0,'parentImagesViewed':0,'seconds':time.monotonic()-start};E.mkdir(exist_ok=True);(E/'parent-raw-review56.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n');print(json.dumps(report,indent=2,ensure_ascii=False))
