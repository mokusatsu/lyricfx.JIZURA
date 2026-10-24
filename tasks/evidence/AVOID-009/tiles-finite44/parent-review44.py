import json,lzma,hashlib,struct,math,collections,time
from pathlib import Path
from fractions import Fraction as F
R=Path('/workspace/lyricfx.JIZURA');D=R/'tasks/evidence/AVOID-009/tiles-finite44';start=time.monotonic();data=lzma.decompress((D/'finite44b.raw.json.xz').read_bytes());assert hashlib.sha256(data).hexdigest()=='ea98cb6c5305878e0f17f289e25fb7859e9b2050a40f2d0b2cf6b18acc20e7a7';raw=json.loads(data);assert not raw['errors'];a=raw['results'][0]['value'];assert not a['errors'] and not raw['results'][0]['pageErrors'] and a['sourceUnchanged'] and not a['adapterRegistered'];C=a['clocks'];bits=lambda x:struct.unpack('>Q',struct.pack('>d',x))[0];flt=lambda n:struct.unpack('>d',struct.pack('>Q',n))[0];N=lambda t:math.floor(t/(1/60)+1e-6)
assert C['h']==1/60 and C['end']==4.150001 and C['last']==math.nextafter(C['end'],-math.inf);assert bits(C['last'])==int(C['lastBits']);count=0;prev=-1
for b,n in C['queryBitsAndNs']:assert N(flt(int(b)))==n
for p in C['preimages']:
 assert p['reachable'];lo,hi=int(p['firstBits']),int(p['lastBits']);assert lo==prev+1 and lo<=hi;assert N(flt(lo))==p['n']==N(flt(hi));assert int(p['count'])==hi-lo+1;assert flt(lo)==p['firstTime'] and flt(hi)==p['lastTime'];assert p['predecessorN']==(N(flt(lo-1)) if lo else None);assert p['nextN']==(N(flt(hi+1)) if hi<int(C['lastBits']) else None);count+=hi-lo+1;prev=hi
assert count==int(C['domainNumberCount'])==int(C['lastBits'])+1
expected=[];frames={f['n']:f for f in a['frameRoots']};assert len(frames)==len(C['states'])==250
for s,p in zip(C['states'],C['preimages']):
 assert s['n']==p['n'] and s['q']==s['n']*(1/60) and s['firstTime']==p['firstTime'];frame=frames[s['n']];wanted=[]
 for c,(tag,lag) in zip(s['passes'],[('B',1.6/24),('A',.8/24),('main',0)]):
  tp=max(0,s['q']-lag)
  assert c['pass']==tag and c['lag']==lag and c['tp']==tp and c['lt']==tp and c['ltb']==tp+lag and c['step']==math.floor(tp/(1/24)+1e-6) and c['active']==(0<=tp<4)
  if c['active']:expected.append((s['n'],tag,c));wanted.append([tag,tp,tp,tp+lag,c['step']])
 assert [[x[k] for k in ['pass','tp','lt','ltb','step']] for x in frame['actual']]==wanted
assert len(expected)==len(a['results'])==727
q=F.from_float;stats=collections.Counter();roundingNear=0;primary=set();maxShiftError=0
for row,(n,tag,c) in zip(a['results'],expected):
 assert (row['n'],row['pass'],row['clock'])==(n,tag,c);assert row['zeroEqual'] and row['movedEqual'];assert row['nativeSHA256']==row['zeroSHA256'] and row['movedSHA256']==row['directMovedSHA256'];frame=next(f for f in frames[n]['actual'] if f['pass']==tag);assert row['originalRoot']==frame['root'];assert all(not frame[k] for k in ['energy','beat','beatPulse'])
 assert all(x['signatureEqual'] and x['matrixEqual'] is not False for x in row['paintComparisons']);assert row['measurementProgram']['supported'] and all(x['nativeTransform']['root']==row['originalRoot'] for x in row['measurementProgram']['events'])

 def signature(t):
  keys=['alpha','blend','filter','shadowColor','shadowBlur','shadowOffsetX','shadowOffsetY'];keys+=['strokeStyle','lineWidth','lineCap','lineJoin','miterLimit','dash','dashOffset'] if t['kind'].startswith('stroke') else ['fillStyle'];keys+=['font','textAlign','textBaseline'] if t['kind'].endswith('Text') else [];return [t['kind'],t['args'],{k:t['state'][k] for k in keys},[[p['key'],p['args']] for p in t['path']],t['metrics']]
 records=row['native']['records'];assert len(records)==len(row['zeroPaint']['records'])==len(row['movedPaint']['records'])==len(row['directMovedPaint']['records'])==len(row['supports'])==len(row['classifications']);assert len(row['paintComparisons'])==3*len(records)
 for i,(base,dest,pair,cl) in enumerate(zip(records,row['movedPaint']['records'],row['supports'],row['classifications'])):
  assert all(signature(t['records'][i])==signature(base) for t in [row['zeroPaint'],row['movedPaint'],row['directMovedPaint']]);assert row['zeroPaint']['records'][i]['matrix']==base['matrix'];assert row['directMovedPaint']['records'][i]['matrix']==dest['matrix'];assert base['owner'].startswith('tiles.') and dest['owner'] is None;primary.add(base['owner']);assert base['ordinal']==dest['ordinal']==i;assert pair['native']['actualPaintMatrix']==base['matrix'] and pair['moved']['actualPaintMatrix']==dest['matrix'];assert base['matrix'][:4]==dest['matrix'][:4];maxShiftError=max(maxShiftError,abs((dest['matrix'][5]-base['matrix'][5])-a['delta'][1]));assert abs(dest['matrix'][4]-base['matrix'][4])<1e-9
  for record,support in [(base,pair['native']),(dest,pair['moved'])]:
   if record['kind']=='fillText':
    m=record['metrics'];x,y=record['args'][1:];local=[x-m['actualBoundingBoxLeft']-1,y-m['actualBoundingBoxAscent']-1,x+m['actualBoundingBoxRight']+1,y+m['actualBoundingBoxDescent']+1];assert (record['nativeTextSource'] is None if record is dest else record['nativeTextSource']['acceptedCSS']==record['state']['font']);assert record['args']==base['args'] and record['state']['font']==base['state']['font']
   else:
    xy=[]
    if record['kind'] in ['fillRect','strokeRect']:
     x,y,w,h=record['args'];xy=[(x,y),(x+w,y+h)];pad=record['state']['lineWidth']*record['state']['miterLimit']/2 if record['kind']=='strokeRect' else 0
    else:
     for path in record['path']:
      assert path['matrix']==record['matrix']
      if path['key'] in ['moveTo','lineTo']:xy.append(path['args'][:2])
      elif path['key']=='arcTo':xy.extend([path['args'][:2],path['args'][2:4]])
      else:assert path['key']=='closePath'
     pad=record['state']['lineWidth']/2 if record['kind']=='stroke' else 0
    local=[min(x[0] for x in xy)-pad,min(x[1] for x in xy)-pad,max(x[0] for x in xy)+pad,max(x[1] for x in xy)+pad]
   L=support['local'];assert [L[k] for k in ['x0','y0','x1','y1']]==[math.nextafter(local[0],-math.inf),math.nextafter(local[1],-math.inf),math.nextafter(local[2],math.inf),math.nextafter(local[3],math.inf)]
   M=list(map(q,record['matrix']));B=support['bounds'];corners=[(q(x),q(y)) for x in [L['x0'],L['x1']] for y in [L['y0'],L['y1']]]
   xs=[M[0]*x+M[2]*y+M[4] for x,y in corners];ys=[M[1]*x+M[3]*y+M[5] for x,y in corners];assert q(B['x0'])<=min(xs)-2 and q(B['x1'])>=max(xs)+2 and q(B['y0'])<=min(ys)-2 and q(B['y1'])>=max(ys)+2;stats['exactAffineSupportVertices']+=4
  B=pair['moved']['bounds'];tile=None
  if base['owner'].startswith('tiles.tile.'):tile=next(t for t in row['native']['catalog']['tiles'] if t['i']==int(base['owner'].split('.')[2]))
  phase='entry' if tile and 0<tile['f']<1 else 'exit' if tile and 0<tile['po']<1 else 'tail' if tile and tile['po']>=1 else 'held' if tile else 'strict';assert cl['phase']==phase
  circle=a['circle'];nx=max(B['x0'],min(circle['cx'],B['x1']));ny=max(B['y0'],min(circle['cy'],B['y1']));dist=(q(nx)-q(circle['cx']))**2+(q(ny)-q(circle['cy']))**2;rr=(q(circle['r'])+q(circle['margin']))**2;exactConflict=dist<=rr
  if exactConflict!=cl['fullCircleEnvelopeConflict']:assert cl['fullCircleEnvelopeConflict'] and abs(float(dist-rr))<1e-7;roundingNear+=1
  assert cl['movingPolicyEnvelopeConflict']==(cl['fullCircleEnvelopeConflict'] and phase not in ['entry','exit'])
  stage={'left':B['x0']<0 and not(tile and phase in ['exit','tail']),'right':B['x1']>960 and not(tile and phase=='entry'),'top':B['y0']<0,'bottom':B['y1']>540,'tailReentry':phase=='tail' and B['x1']>=0};assert stage==cl['stage'];assert cl['notActualInkCollision'];stats['records']+=1;stats[phase]+=1;stats['fullCircleEnvelopeConflict']+=cl['fullCircleEnvelopeConflict'];stats['movingPolicyEnvelopeConflict']+=cl['movingPolicyEnvelopeConflict'];stats['stageFailures']+=sum(stage.values())
assert stats['movingPolicyEnvelopeConflict']==0 and stats['stageFailures']==0
report={'state':'PARENT_ACCEPTED_FIXED_FINITE_DIAGNOSTIC_NOT_PRODUCT_CERTIFICATE','rawJSONSHA256':hashlib.sha256(data).hexdigest(),'clockQueriesChecked':len(C['queryBitsAndNs']),'gapfreeFiniteFloat64DomainCount':str(count),'states':250,'selectedPasses':727,'zeroPairs':727,'movedPairs':727,'statistics':dict(stats),'primaryOwnerCount':len(primary),'roundingNearConflict':roundingNear,'maxObservedStageDeltaError':maxShiftError,'existingFoundationAssumptions':'actual live Canvas matrix, native TextMetrics+1 local pixel,2 device AA pixels, fixed font/runtime; not universal raster or libm certificate','adapterAccepted':False,'fullPublicChecks':0,'parentImagesViewed':0,'seconds':time.monotonic()-start,'followup':'bounded product admission/cache design; preserve all native source paint/clocks; unsupported other text/params/scale'}
(D/'parent-review44.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
