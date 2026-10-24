"""SAME-n MAIN obstacle geometry; continuous primary supports are immutable."""
import math,struct,hashlib
from board24 import point as P,add,sub,outward
from camera26 import mul,hull,first_subset_violation,contained

def bounds(poly):
 return {'x0':min(p[0]for p in poly),'x1':max(p[0]for p in poly),'y0':min(p[1]for p in poly),'y1':max(p[1]for p in poly)}
def box(x0,y0,x1,y1):return [[x0,y0],[x1,y0],[x1,y1],[x0,y1]]
def metric_values(metrics,record):
 it=record['item'];receipt=next(m for m in metrics if m['font']==it['font']and m['ch']==it['text'])
 queries=record['queriedBins'];assert len(queries)==3 and [q['bin']for q in queries]==list(range(record['actualCSSBin']-1,record['actualCSSBin']+2))
 assert any(q['requestedCSS']==record['css']for q in queries)
 values=[]
 for q in queries:
  b=q['bin'];assert receipt['min']<=b<=receipt['max'];offset=4*(b-receipt['min']);values.append(receipt['fullBinValues'][offset:offset+4])
 assert all(len(v)==4 and all(math.isfinite(q)for q in v)for v in values)
 m=[max(v[k]for v in values)for k in range(4)]
 return m,{'font':it['font'],'ch':it['text'],'actualRequestedCSS':record['css'],'actualCSSBin':record['actualCSSBin'],'queriedBins':queries,'perBinMetrics':values,'componentwiseMetricMaxima':m,'fontMetricDigest':receipt['digestSHA256'],'actualCSSExactlyInMeasuredRequests':True}
def local_glyph(metrics,record):
 it=record['item'];m,receipt=metric_values(metrics,record)
 # Same accepted21 font-space guard (+2), now literal non-animated source stroke.
 # No metrics scaling: use actual measured CSS bins at the actual animated size.
 pad=it['stroke']/2+2
 x0=sub(P(-m[0]),P(pad));x1=add(P(m[1]),P(pad));y0=sub(P(-m[2]),P(pad));y1=add(P(m[3]),P(pad))
 # Captured source Math.sin/cos, with the accepted21 arithmeticGuard covering
 # fixed bounded source trig/transform implementation residual. Extra +/-1e-13
 # is conservative and never used to force subset membership.
 c=outward(record['cos']-1e-13,record['cos']+1e-13);s=outward(record['sin']-1e-13,record['sin']+1e-13)
 xs=[];ys=[]
 for x,y in [(x0,y0),(x1,y0),(x1,y1),(x0,y1)]:
  xs.append(add(P(it['x']),sub(mul(c,x),mul(s,y))));ys.append(add(P(it['y']),add(mul(s,x),mul(c,y))))
 poly=box(min(x[0]for x in xs),min(y[0]for y in ys),max(x[1]for x in xs),max(y[1]for y in ys))
 return poly,{**receipt,'stroke':it['stroke'],'fontSpacePad':pad,'staticDepthOffsetPreserved':True,'sourceItem':it,'sourceTrig':[record['cos'],record['sin']]}
def stage_hull(local,scale,W,H,d):
 aa=2/d['minRenderScale']+d['rootGuard']+d['arithmeticGuard'];points=[]
 for q in local:
  assert max(map(abs,q))<=d['coordinateCeiling']
  x=add(P(W/2),mul(sub(P(q[0]),P(W/2)),P(scale)));y=add(P(H/2),mul(sub(P(q[1]),P(H/2)),P(scale)))
  x=(sub(x,P(aa))[0],add(x,P(aa))[1]);y=(sub(y,P(aa))[0],add(y,P(aa))[1])
  points.extend([[a,b]for a in x for b in y])
 return hull(points),aa

def construct(model,clock,source):
 catalog=model['sourceCatalog'];old=model['obstacles'];d=model['domain'];W,H=catalog['stage'];metrics=model['metricReceipts']
 assert len(old)==17 and old[0]['owner']=='magnets.scene.handle'
 rows=[];modes={'same-n-refinement':0,'old21-fallback':0,'main-selector-inactive':0,'source-e-nonpositive':0};states={s['n']:s for s in clock['states']}
 assert len(source['rows'])==len(states)
 for row in source['rows']:
  state=states[row['n']];main=state['passes'][2];assert row['selectorActive']==main['selectorActive']and row['mainClock']==main['lt']
  entries=[]
  if row['selectorActive']:
   sourceState=row['source'];assert sourceState['lt']==main['lt']and 0<=sourceState['pOut']<=1
   sourceItems={e['owner']:e for e in sourceState['items']};assert len(sourceItems)==len(sourceState['items'])
   decoys=sourceState['decoys'];assert len(decoys)==8
  else:assert row['source']is None
  for previous in old:
   owner=previous['owner'];receipt={};reason=None;local=None
   if not row['selectorActive']:reason='main-selector-inactive'
   elif owner=='magnets.scene.handle':
    h=catalog['scene']['handle'];handleArgs=sourceState['handle']['args'];assert sourceState['handle']['owner']==owner and handleArgs[:5]==[h[k]for k in ['x','y','w','h','r']] and handleArgs[7]is False;x1=add(P(h['x']),P(h['w']));y1=add(P(h['y']),P(h['h']));local=box(h['x'],h['y'],x1[1],y1[1]);receipt={'handleSource':h,'noStroke':True,'alphaIgnoredConservatively':True,'sourceBA':sourceState['ba'],'literalHandleArgs':handleArgs}
   else:
    index=int(owner.split('.')[2]);decoy=decoys[index];assert decoy['d']==index and decoy['emitted']==(decoy['e']>0)
    if decoy['e']<=0:
     assert owner not in sourceItems;reason='source-e-nonpositive';receipt={'decoy':decoy}
    else:
     record=sourceItems[owner];assert record['item']['ghost']is False and record['item']['size']==decoy['animatedSize']and decoy['k']>=1
     local,receipt=local_glyph(metrics,record);receipt['decoy']=decoy;receipt['positiveAlphaNeverPruned']=True
   if reason:
    modes[reason]+=1;entries.append({'owner':owner,'activeForConservativeObligation':False,'absenceReason':reason,'sourceReceipt':receipt});continue
   proposed,aa=stage_hull(local,main['contentScale'],W,H,d);violation=first_subset_violation(proposed,previous['polygon'])
   mode='old21-fallback'if violation else'same-n-refinement';polygon=previous['polygon']if violation else proposed
   assert all(contained(p,previous['polygon'])for p in polygon)
   modes[mode]+=1;entries.append({'owner':owner,'activeForConservativeObligation':True,'mode':mode,'mainClock':main['lt'],'cameraScale':main['contentScale'],'aaGuardUnchanged':aa,'localPolygon':local,'proposedPolygon':proposed,'proposedOldSubsetViolation':violation,'polygon':polygon,'bounds':bounds(polygon),'sourceReceipt':receipt,'selectedSubsetOldExactFraction':True})
  assert [e['owner']for e in entries]==[e['owner']for e in old]
  rows.append({'n':row['n'],'mainClock':main['lt'],'mainSelectorActive':main['selectorActive'],'entries':entries})
 return rows,modes

def relations(clock,rows,old):
 byN={r['n']:r for r in rows};result=[]
 for cell in clock['all279CellPassMappings']:
  ns=[r['n']for r in cell['stateRefs']];assert len(ns)==len(set(ns));owners=[]
  for obstacle in old:
   records=[next(e for e in byN[n]['entries']if e['owner']==obstacle['owner'])for n in ns]
   present=[(n,e)for n,e in zip(ns,records)if e['activeForConservativeObligation']]
   bb=None
   if present:
    bb={k:(min if k in ['x0','y0']else max)(e['bounds'][k]for n,e in present)for k in ['x0','x1','y0','y1']}
    oldBounds=bounds(obstacle['polygon']);assert oldBounds['x0']<=bb['x0']<=bb['x1']<=oldBounds['x1']and oldBounds['y0']<=bb['y0']<=bb['y1']<=oldBounds['y1']
   owners.append({'owner':obstacle['owner'],'activeStateNs':[n for n,e in present],'absentStates':[{'n':n,'reason':e['absenceReason']}for n,e in zip(ns,records)if not e['activeForConservativeObligation']],'allSameNBounds':bb,'stateUnionConservative':True})
  result.append({'cellIndex':cell['cellIndex'],'pass':cell['pass'],'sourceRange':cell['sourceRange'],'allReachableNs':ns,'rendererNumberCoTimeReachable':bool(ns),'continuousPrimaryObligationsKept':True,'obstacles':owners})
 return result
