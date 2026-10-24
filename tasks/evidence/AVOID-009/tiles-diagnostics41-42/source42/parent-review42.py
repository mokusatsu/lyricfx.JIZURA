import gzip,json,math,struct,sys,time
from fractions import Fraction as F
from pathlib import Path
p=Path(sys.argv[1]);raw=json.load(gzip.open(p,'rt'));assert not raw['errors'] and len(raw['results'])==4
bits=lambda x:struct.unpack('>Q',struct.pack('>d',x))[0]
counts={'fixtures':0,'nativeZeroPairs':0,'movedPairs':0,'sourceEvents':0,'verticesContained':0,'emptyRecordsRetained':0,'RendererRoots':0,'candidatePoliciesRecomputed':0,'ledgerEntries':0,'gapfreeCells':0,'exactSelectedObligations':0}
rows=[];t0=time.monotonic()
def down(x):return math.nextafter(x,-math.inf)
def up(x):return math.nextafter(x,math.inf)
def square_lower(x):
 a,b=down(x),up(x);return down(min(a*a,a*b,b*a,b*b))
for row in raw['results']:
 assert not row['pageErrors'];v=row['value'];pr=v['proof'];assert not v['errors'] and v['sourceUnchanged'] and not v['adapterRegistered'] and not v['certificate'] and not pr['certificate'] and pr['numericalPremisesUncertified'];counts['fixtures']+=1
 dom=pr['domain'];assert sum(dom['operationDerivation'].values())==512 and dom['u']==2**-23
 expect=float(F(17666,16383))+1e-8*960;assert abs(dom['guard']-expect)<1e-14
 br=pr['branches'];cs=br['cells'];assert cs[0]['lo']==0 and cs[-1]['hi']==math.nextafter(4,-math.inf)
 assert all(c['lo']<=c['hi'] and (i==0 or math.nextafter(cs[i-1]['hi'],math.inf)==c['lo']) for i,c in enumerate(cs))
 assert sum(bits(c['hi'])-bits(c['lo'])+1 for c in cs)==bits(br['last'])+1==int(br['coveredPositiveNumberCount']);counts['gapfreeCells']+=len(cs)
 cut=pr['sourceCut'];tiles=pr['sourceCatalog']['tiles'];assert len(tiles)==4
 for q,b in zip(tiles,br['rows']):
  def f(x):return max(0,min(1,(x-q['t1'])/.28))
  def po(x):
   a=max(0,min(1,(x-(cut['dur']-cut['outDur']))/cut['outDur']))*1.4-q['j']/max(1,q['cnt'])*.4;a=max(0,min(1,a));return a*a*a
  for name,pred in [('entry',lambda x:f(x)>0),('held',lambda x:f(x)>=1),('body',lambda x:x-q['delay']>=0),('exit',lambda x:po(x)>0),('tail',lambda x:po(x)>=1)]:
   x=b[name];assert x is not None and pred(x) and (x==0 or not pred(math.nextafter(x,-math.inf))),(name,x)
 ledger=pr['ledger'];counts['ledgerEntries']+=len(ledger);circle=pr['circle'];rr0,rr1=down(circle['r']+circle['margin']),up(circle['r']+circle['margin']);r2=up(max(rr0*rr0,rr0*rr1,rr1*rr0,rr1*rr1));n=len(ledger)
 assert all(e['owner'] in pr['sourceCatalog']['primaryOwners'] for e in ledger)
 for candidate in pr['candidates']:
  assert candidate['full']['delta']==candidate['moving']['delta'];dx,dy=candidate['full']['delta']
  failures={policy:{k:[] for k in ['circle','left','right','top','bottom','tailReentry']} for policy in ['full','moving']};exempt=0
  for i,e in enumerate(ledger):
   b=e['bounds'];x0,x1=down(b['x0']+dx),up(b['x1']+dx);y0,y1=down(b['y0']+dy),up(b['y1']+dy);tile=e['owner'].startswith('tiles.tile.');phase=e['phase'];moving=tile and phase in ['entry','exit'];left=tile and phase in ['exit','tail'];entryR=tile and phase=='entry' and cut['params']['from']=='right';entryT=tile and phase=='entry' and cut['params']['from']=='drop'
   nx=max(x0,min(circle['cx'],x1));ny=max(y0,min(circle['cy'],y1));badCircle=down(square_lower(nx-circle['cx'])+square_lower(ny-circle['cy']))<=r2
   common={'left':x0<0 and not left,'right':x1>960 and not entryR,'top':y0<0 and not entryT,'bottom':y1>540,'tailReentry':phase=='tail' and not x1<0}
   if badCircle and moving:exempt+=1
   for policy in ['full','moving']:
    if badCircle and not(policy=='moving' and moving):failures[policy]['circle'].append(i)
    for k,bad in common.items():
     if bad:failures[policy][k].append(i)
  for policy in ['full','moving']:
   got=candidate[policy];assert got['failures']==failures[policy],(row['spec'],dx,dy,policy);assert got['counts']=={k:len(x) for k,x in failures[policy].items()};assert got['admissible']==all(not x for x in failures[policy].values());assert got['circleExemptions']==(exempt if policy=='moving' else 0);counts['candidatePoliciesRecomputed']+=1
 for selected in [pr['selectedFull'],pr['selectedMoving']]:
  if not selected:continue
  dx,dy=map(F,selected['delta']);cx,cy,radius=F(circle['cx']),F(circle['cy']),F(circle['r'])+F(circle['margin'])
  for e in ledger:
   b=e['bounds'];x0,x1=F(b['x0'])+dx,F(b['x1'])+dx;y0,y1=F(b['y0'])+dy,F(b['y1'])+dy;tile=e['owner'].startswith('tiles.tile.');moving=tile and e['phase'] in ['entry','exit']
   if not(selected['policy']=='moving-tile-only' and moving):
    nx=max(x0,min(cx,x1));ny=max(y0,min(cy,y1));assert (nx-cx)**2+(ny-cy)**2>radius**2
   assert x0>=0 or tile and e['phase'] in ['exit','tail'];assert x1<=960 or tile and e['phase']=='entry' and cut['params']['from']=='right';assert y0>=0 or tile and e['phase']=='entry' and cut['params']['from']=='drop';assert y1<=540;assert e['phase']!='tail' or x1<0;counts['exactSelectedObligations']+=1
 assert len(v['probes'])==87 and any(p['movedSHA256']!=p['zeroSHA256'] for p in v['probes'])
 for p0 in v['probes']:
  assert not p0.get('error') and p0['zeroEqual'] and p0['zeroSHA256']==p0['nativeSHA256'] and p0['movedEqual'] and p0['movedSHA256']==p0['directMovedSHA256'] and p0['eventRootsExact'];counts['nativeZeroPairs']+=1;counts['movedPairs']+=1
  assert all(e['nativeTransform']['root']==p0['root'] and e['role']=='primary' for e in p0['sourceEvents']);counts['sourceEvents']+=len(p0['sourceEvents'])
  for ob in p0['containment']:assert not ob['outside'];counts['verticesContained']+=ob['vertices']
  for ob in p0['sampledRecordedEnvelopeConflicts']:
   if ob['bounds'] is None:
    assert ob['circle'] is None and ob['stageOutside'] is None and ob['itemAlpha']<=.002 and ob['measurementSupported'] and ob['nonemptyTemplate'];assert ob['kind']=='source item alpha-gated empty RECORDED geometry; not certified empty ink';counts['emptyRecordsRetained']+=1
  assert len(p0['sampledRecordedEnvelopeConflicts'])==len(p0['sourceEvents'])
 for probe in v['rendererRootProbes']:assert probe['exact'] and probe['actual']==probe['expected'];counts['RendererRoots']+=1
 rows.append({'fixture':row['spec']['id'],'status':pr['status'],'full':pr['selectedFull']['delta'] if pr['selectedFull'] else None,'moving':pr['selectedMoving']['delta'] if pr['selectedMoving'] else None,'modelGuard':dom['guard'],'holdWindow':pr['holdWindow'],'numericalPremisesUncertified':True})
out={'status':'PARENT_ACCEPTED_CONDITIONAL_DIAGNOSTIC_NOT_PRODUCT_CERTIFICATE','counts':counts,'rows':rows,'seconds':time.monotonic()-t0,'publicChecks':0,'parentImagesViewed':0,'adapterAccepted':False,'formalPerformanceAccepted':False}
Path('/workspace/lyricfx.JIZURA/work/avoid009-tiles42-diagnostic/parent-review42.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out,indent=2))
