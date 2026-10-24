from pathlib import Path
import json,lzma,hashlib,math,struct,collections,time
from fractions import Fraction as F
R=Path('/workspace/lyricfx.JIZURA');D=R/'tasks/evidence/AVOID-009/tiles-adapter48';start=time.monotonic();data=lzma.decompress((D/'tiles48.raw.json.xz').read_bytes());assert hashlib.sha256(data).hexdigest()=='10984f19687011df723418b6ab9f06262924ac7729426f229d76453cff970fa5';v=json.loads(data);assert not v['errors'] and len(v['results'])==32;meta=v['metadata'];a=meta['after'];C=a['clocks'];assert meta['before']['sourcePlan']==a['sourcePlan'] and meta['before']['nativeFunction']==a['nativeFunction'];assert meta['before']['canvasAttrs']==a['canvasAttrs'];assert v['regressions']['before']==v['regressions']['after'] and len(v['regressions']['after'])==3
flt=lambda n:struct.unpack('>d',struct.pack('>Q',n))[0];N=lambda t:math.floor(t/(1/60)+1e-6);Q=F.from_float;last=-1;total=0
assert C['h']==1/60 and C['end']==4.150001 and C['last']==math.nextafter(C['end'],-math.inf)
for b,n in C['queryBitsAndNs']:assert N(flt(int(b)))==n
for p in C['preimages']:
 assert p['reachable'];lo,hi=int(p['firstBits']),int(p['lastBits']);assert lo==last+1 and N(flt(lo))==p['n']==N(flt(hi));assert int(p['count'])==hi-lo+1 and flt(lo)==p['firstTime'] and flt(hi)==p['lastTime'];assert p['predecessorN']==(N(flt(lo-1)) if lo else None);assert p['nextN']==(N(flt(hi+1)) if hi<int(C['lastBits']) else None);total+=hi-lo+1;last=hi
assert total==int(C['domainNumberCount'])==int(C['lastBits'])+1
wholeBefore=[x for batch in v['results'] for x in batch['before']['whole']];wholeAfter=[x for batch in v['results'] for x in batch['after']['whole']];before=[x for batch in v['results'] for x in batch['before']['rows']];after=[x for batch in v['results'] for x in batch['after']['rows']];assert len(wholeBefore)==len(wholeAfter)==len(C['states'])==250;assert len(before)==len(after)==727;expected=[]
for state,pre,wb,wa in zip(C['states'],C['preimages'],wholeBefore,wholeAfter):
 assert wb['n']==wa['n']==state['n']==pre['n'] and wb['time']==wa['time']==state['firstTime']==pre['firstTime'];assert state['q']==state['n']*(1/60);assert wb['zeroSHA256']==wa['zeroSHA256'] and wb['movedSHA256']==wa['actualSHA256'];active=[]
 for p,(tag,lag) in zip(state['passes'],[('B',1.6/24),('A',.8/24),('main',0)]):
  tp=max(0,state['q']-lag);assert p['pass']==tag and p['lag']==lag and p['tp']==p['lt']==tp and p['ltb']==tp+lag and p['step']==math.floor(tp/(1/24)+1e-6) and p['active']==(0<=tp<4)
  if p['active']:expected.append((state['n'],tag,p));active.append(tag)
 assert [o['pass'] for o in wa['observations']]==active
assert len(expected)==727
stats=collections.Counter();owners=set();heldByState=collections.defaultdict(list)
def sig(r):
 keys=['alpha','blend','filter','shadowColor','shadowBlur','shadowOffsetX','shadowOffsetY'];keys+=['strokeStyle','lineWidth','lineCap','lineJoin','miterLimit','dash','dashOffset'] if r['kind'].startswith('stroke') else ['fillStyle'];keys+=['font','textAlign','textBaseline'] if r['kind'].endswith('Text') else [];return[r['kind'],r['args'],{k:r['state'][k] for k in keys},[[p['key'],p['args']] for p in r['path']],r['metrics']]
clamp=lambda x:max(0,min(1,x))
for b,r,(n,tag,p) in zip(before,after,expected):
 assert (b['n'],b['pass'],b['clock'])==(n,tag,p) and(r['n'],r['pass'])==(n,tag);assert b['nativeSHA256']==b['zeroSHA256'] and b['movedSHA256']==b['directMovedSHA256'];o=r['observation'];assert o in wholeAfter[n]['observations'];assert [o[k] for k in ['pass','motionTime','lt','ltb']]==[tag,p['tp'],p['lt'],p['ltb']];assert o['realTime']==C['states'][n]['firstTime'] and o['renderScale']==1 and o['safety']=='safe-hold';assert o['delta']==[0,134.1267765772698]
 g=b['catalog'];assert g['complete'] and g['kind']=='tiles-native-catalog' and g['clock']['lt']==p['lt'] and g['clock']['ltb']==p['ltb'] and len(g['tiles'])==4 and not g['independentDecorOwners'] and not g['tiledAuxOwners'];pout=clamp((p['lt']-(4-.4))/.4);assert g['clock']['pOut']==pout
 for t in g['tiles']:
  assert t['i']==t['j'] and t['cnt']==4 and t['sourceRow']==0 and t['t1']==.12+t['i']*.12 and t['f']==clamp((p['lt']-t['t1'])/.28)
  if t['f']>0:
   z=clamp(pout*1.4-t['j']/4*.4);assert t['po']==z*z*z
 assert g['score']==sum(t['pts'] for t in g['tiles'] if t['f']>=1) and g['total']==sum(t['pts'] for t in g['tiles']);heldByState[n].append(all(t['f']>=1 and t.get('po')==0 for t in g['tiles']))
 if tag=='main':assert g['scoreRecord']['value']==str(g['score']).zfill(3)
 paints=o['actualForwardedPaint'];assert len(paints)==len(o['preflightPaint'])==len(o['preflightActual'])==len(b['directPaint']);stats['observations']+=1
 for native,paint,pre,supportQuality in zip(b['directPaint'],paints,o['preflightPaint'],o['preflightActual']):
  assert native['matrix']==paint['matrix']==pre['matrix'];assert sig(native)==sig(paint)==sig(pre);s=supportQuality['support'];quality=supportQuality['quality'];owner=native['owner'];assert s['owner']==quality['owner']==owner;owners.add(owner);assert owner.startswith('tiles.');assert s['actualPaintMatrix']==paint['matrix'];L=s['local'];B=s['bounds'];M=list(map(Q,paint['matrix']))
  if paint['kind']=='fillText':
   tm=paint['metrics'];x,y=map(Q,paint['args'][1:]);base=[x-Q(tm['actualBoundingBoxLeft'])-1,y-Q(tm['actualBoundingBoxAscent'])-1,x+Q(tm['actualBoundingBoxRight'])+1,y+Q(tm['actualBoundingBoxDescent'])+1]
  else:
   if paint['kind'] in ['fillRect','strokeRect']:
    x,y,w,h=map(Q,paint['args']);xy=[(x,y),(x+w,y+h)];pad=Q(paint['state']['lineWidth'])*Q(paint['state']['miterLimit'])/2 if paint['kind']=='strokeRect' else Q(0)
   else:
    xy=[]
    for path in paint['path']:
     assert path['matrix']==paint['matrix']
     if path['key'] in ['moveTo','lineTo']:xy.append(tuple(map(Q,path['args'][:2])))
     elif path['key']=='arcTo':xy.extend([tuple(map(Q,path['args'][:2])),tuple(map(Q,path['args'][2:4]))]);assert path['args'][4]>=0
     else:assert path['key']=='closePath'
    pad=Q(paint['state']['lineWidth'])/2 if paint['kind']=='stroke' else Q(0)
   base=[min(x for x,y in xy)-pad,min(y for x,y in xy)-pad,max(x for x,y in xy)+pad,max(y for x,y in xy)+pad]
  assert Q(L['x0'])<=base[0] and Q(L['y0'])<=base[1] and Q(L['x1'])>=base[2] and Q(L['y1'])>=base[3]
  for x in [L['x0'],L['x1']]:
   for y in [L['y0'],L['y1']]:
    X=M[0]*Q(x)+M[2]*Q(y)+M[4];Y=M[1]*Q(x)+M[3]*Q(y)+M[5];assert Q(B['x0'])<=X-2 and Q(B['x1'])>=X+2 and Q(B['y0'])<=Y-2 and Q(B['y1'])>=Y+2;stats['exactAffineVertices']+=1
  tile=next((t for t in g['tiles'] if owner.startswith('tiles.tile.'+str(t['i'])+'.')),None);phase='entry' if tile and 0<tile['f']<1 else 'exit' if tile and 0<tile['po']<1 else 'tail' if tile and tile['po']>=1 else 'held' if tile else 'strict';assert quality['phase']==phase
  nx=max(B['x0'],min(480,B['x1']));ny=max(B['y0'],min(540*.42,B['y1']));conflict=(Q(nx)-480)**2+(Q(ny)-Q(540*.42))**2<=(Q(108)+Q(2.7))**2;assert conflict==quality['fullCircleEnvelopeConflict'];assert quality['movingPolicyEnvelopeConflict']==(conflict and phase not in ['entry','exit']);stage={'left':B['x0']<0 and not(tile and phase in ['exit','tail']),'right':B['x1']>960 and not(tile and phase=='entry'),'top':B['y0']<0,'bottom':B['y1']>540,'tailReentry':phase=='tail' and B['x1']>=0};assert quality['stage']==stage and quality['notActualInkCollision'];stats['records']+=1;stats[phase]+=1;stats['fullCircleConflicts']+=conflict;stats['movingPolicyConflicts']+=quality['movingPolicyEnvelopeConflict'];stats['stageFailures']+=sum(stage.values())
assert stats['records']==9638 and len(owners)==26 and stats['movingPolicyConflicts']==stats['stageFailures']==0
cert=a['cache']['firstPlan']['cuts'][0]['placementTrajectory']['certificate'];assert cert['coverage']['ownerIDs']==sorted(owners) and cert['coverage']['paintRecords']==stats['records'];assert cert['coverage']['counts']=={k:stats[k] for k in ['fullCircleConflicts','movingPolicyConflicts','stageFailures']};intervals=[];i=0
while i<250:
 if not heldByState[i] or not all(heldByState[i]):i+=1;continue
 lo=C['states'][i]['firstTime']
 while i<250 and heldByState[i] and all(heldByState[i]):i+=1
 hi=min(4,C['states'][i]['firstTime'] if i<250 else C['end'])
 if hi-lo>=.04:intervals.append([lo,hi])
assert cert['holdWindow']==max(intervals,key=lambda x:x[1]-x[0]);cache=a['cache'];first=cache['first'];assert first['proofRuns']==1 and cache['second']['proofRuns']==1;assert first['referenceTemplates']==962 and first['referenceUses']==9638;assert first['proofWorkingBytes']==sum(first[k] for k in ['proofBytes','internKeyBytes','maxInternKeyBytes','clockExtraBytes','maxTransientBytes'])<=first['limits']['atlasBytes']==8388608
ctl=v['controls']['rows'];atomic=[x for x in ctl if 'rootUnchanged' in x];assert len(ctl)==42 and len(atomic)==19
for x in atomic:assert x['error'] and all(x[k] for k in ['bitmapUnchanged','rootUnchanged','langUnchanged','metricsRevisionUnchanged','budgetUnchanged','methodsRestored']) and x['observationCalls']==0
for x,pass_ in [(ctl[0],'A'),(ctl[1],'main')]:assert x['error']['details']['preflightPass']==pass_ and any(d['code']=='GEOMETRY_LIMIT' for d in x['error']['details']['diagnostics'])
assert next(x for x in ctl if x['name']=='serialized-source-requires-replanning')['code']=='SOURCE_PLAN_REQUIRED';clip=next(x for x in ctl if x['name']=='preexisting-clip');assert clip['pixelSHA256']==v['controls']['clipReference']['pixelSHA256'] and clip['postClipProbeSHA256']==v['controls']['clipReference']['postClipProbeSHA256'];assert len([x for x in ctl if x['name'].startswith('bypass-')])==5 and len([x for x in ctl if x['name'].startswith('unsupported-')])==7;assert next(x for x in ctl if x['name']=='changed-loaded-font-fresh-proof')['stats']['proofRuns']>=2 and next(x for x in ctl if x['name']=='fresh-font-revision-replanned')['stats']['proofRuns']>=3;assert v['controls']['sourceUnchanged']
for x in v['invocation']['pins']['files']+v['invocation']['pins']['pycache']:assert hashlib.sha256((R/x['path']).read_bytes()).hexdigest()==x['sha256']
for x in v['invocation']['pins']['absent57']:assert not (R/x).exists()
assert hashlib.sha256((R/'.git/index').read_bytes()).hexdigest()==v['invocation']['pins']['index']['sha256']
report={'state':'PARENT_ACCEPTED_ISOLATED_BOUNDED_SOURCE48_PENDING_CANONICAL_INTEGRATION','rawExactJSONSHA256':hashlib.sha256(data).hexdigest(),'states':250,'passRows':727,'wholeFrameZeroPairs':250,'wholeFrameMovedPairs':250,'nativePerPassZeroPairs':727,'nativePerPassMovedPairs':727,'sourceClockFAndPoCases':2908,'clockQueries':len(C['queryBitsAndNs']),'gapfreeNumberDomainCount':str(total),'statistics':dict(stats),'owners':len(owners),'holdWindow':cert['holdWindow'],'controls':42,'atomicRejections':19,'bypasses':5,'typedUnsupported':7,'unrelatedD':3,'firstRuntimeSerializedAtlasBytes':first['proofBytes'],'firstRuntimeSerializedWorkingBytes':first['proofWorkingBytes'],'capBytes':8388608,'coldMilliseconds':cache['coldMilliseconds'],'warmMilliseconds':cache['warmMilliseconds'],'timings':'one observation, not formalperformance or JSheap/RSS guarantee','postpinsParentChecked':'121source+7PYC+57absent+currentindexsame; runner runtimepostcheck noerrors','canonicalIntegrationAccepted':False,'humanMotionApproval':False,'publicChecks':0,'parentImagesViewed':0,'foundation':'qualifieddefaultCanvas; actualTextMetrics+1localpixel/2devicepixel AA/outwardDouble; no universalCanvas/libm/512bound','seconds':time.monotonic()-start};(D/'parent-review48.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
