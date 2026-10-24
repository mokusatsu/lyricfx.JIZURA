from pathlib import Path
import json,gzip,hashlib,math
from fractions import Fraction as F
rawPath=Path('/workspace/lyricfx.JIZURA/work/avoid009-magnets32-raw-cache/adapter32.raw.json.gz');x=json.load(gzip.open(rawPath,'rt'));assert not x['errors'] and len(x['results'])==1 and x['results'][0]['completed'];r=x['results'][0]['result'];cert=r['certificate'];prior=json.load(open('/tmp/avoid009-evening-parent/parent-certificate31-math-review.json'));ld=hashlib.sha256(json.dumps(cert['ledger'],separators=(',',':'),ensure_ascii=False).encode()).hexdigest();assert ld==prior['selectedLedgerSHA256'];assert cert['recipe']==prior['recipe'] and cert['selectedCounts']==prior['recomputedCounts']
assert len(r['frames'])==250 and len(r['zeroReplay'])==727 and r['rootRebuildExactCount']==1536
ledger={(e['owner'],e['pass'],tuple(e['sourceRange'])):e for e in cert['ledger']};events=points=0;passes=set();minClear=1e9
C=(480,226.8);R=110.7
def inside(point,poly):
 px,py=map(F,point)
 return all((F(b[0])-F(a[0]))*(py-F(a[1]))-(F(b[1])-F(a[1]))*(px-F(a[0]))>=0 for a,b in zip(poly,poly[1:]+poly[:1]))
def clear(poly):
 for a,b in zip(poly,poly[1:]+poly[:1]):
  dx,dy=b[0]-a[0],b[1]-a[1];den=dx*dx+dy*dy;t=min(1,max(0,((C[0]-a[0])*dx+(C[1]-a[1])*dy)/den))if den else 0;dd=math.hypot(C[0]-a[0]-t*dx,C[1]-a[1]-t*dy)
  if dd<=R:return False
 return not inside(C,poly)
for i,f in enumerate(r['frames']):
 assert f['index']==i and f['time']==(i/60 if i<249 else 4.150001);q=math.floor(f['time']/(1/60)+1e-6)*(1/60);expected=[n for n,l in [('B',1.6/24),('A',.8/24),('main',0)]if max(0,q-l)<4];assert [o['pass']for o in f['observations']]==expected
 for o in f['observations']:
  passes.add(o['pass']);lag={'B':1.6/24,'A':.8/24,'main':0}[o['pass']];assert o['realTime']==f['time'] and o['motionTime']==o['lt']==max(0,q-lag) and o['ltb']==o['lt']+lag
  for a in o['actual']:
   support=ledger[(a['owner'],o['pass'],tuple(a['sourceRange']))];assert support['sourceRange'][0]<=o['lt']<=support['sourceRange'][1] and a['entry']==support['entry']==(a['sourceF']<1);assert a['delta']==(cert['recipe']['left']if a['q']<2 else cert['recipe']['right'])
   assert all(inside(p,support['polygon'])for poly in a['polygons']for p in poly)
   moved=[[[p[0]+a['delta'][0],p[1]+a['delta'][1]]for p in poly]for poly in a['polygons']];assert moved==a['movedPolygons']
   assert all(clear(poly)and all(0<=p[0]<=960 and 0<=p[1]<=540 for p in poly)for poly in moved);events+=1;points+=sum(map(len,moved));assert a['circleClear'] and a['stageContained']
assert passes=={'B','A','main'}
assert all(z['nativeSHA256']==z['replaySHA256']for z in r['zeroReplay']);assert len(r['movedPixelReferences'])==41 and all(z['directNativeSHA256']==z['adapterSHA256']and z['referenceUsesRecordReplay']is False for z in r['movedPixelReferences']);assert {z['scale']for z in r['movedPixelReferences']}=={.5,1,2}
assert len(r['boundaryScales'])==26 and {b['control']for b in r['bypass']}=={'off','manual','lock','emphasis'} and sum(len(b['pairs'])for b in r['bypass'])==20
assert all(z['beforeSHA256']==z['afterSHA256']for b in r['bypass']for z in b['pairs']);assert len(r['enabledIndexPairs'])==6 and all(z['offSHA256']==z['enabledNativeSHA256']for z in r['enabledIndexPairs']);assert len(r['unsupported'])==4
assert r['cache']['after']['hits']>=1 and r['cache']['decodedCertificateMatches'] and r['cache']['decodeCode']is None and r['cache']['tamperCode']=='MAGNETS_DECODED_PROOF';assert r['stale']=={'staleFont':'MAGNETS_STALE_DEPENDENCY','staleProof':'MAGNETS_STALE_DEPENDENCY','staleRevision':'STALE_PLACEMENT_PLAN','restoredCode':None}
assert r['rootImportNegativeControl']['liveRoot']==r['rootImportNegativeControl']['operationRebuiltRoot'] and r['rootImportNegativeControl']['importedRoot']!=r['rootImportNegativeControl']['liveRoot']
out={'status':'PARENT_ACCEPTED_ISOLATED_NATIVE_SOURCE_RAW_ONLY','rawSHA256':hashlib.sha256(rawPath.read_bytes()).hexdigest(),'rawBytes':rawPath.stat().st_size,'continuousMathRef':'parent-certificate31-math-review.json','continuousLedgerExactSame':True,'frames':250,'nativePassObservations':727,'primaryPaintEventsRechecked':events,'actualPrimaryVerticesRechecked':points,'zeroNativePixelPairs':727,'movedIndependentNativePixelPairs':41,'exactSourceRootReconstructions':1536,'boundaryScaleFrames':26,'bypassPixelPairs':20,'enabledIndexNativePixelPairs':6,'unsupportedCases':4,'cacheDecodedAndFreshReplan':True,'recipe':cert['recipe'],'selectedCounts':cert['selectedCounts'],'limitedColdFinalizeMilliseconds':r['finalizeMilliseconds'],'formalPerformanceAccepted':False,'visualAndHumanReview':'pending','canonicalIntegration':'not yet authorized','publicChecks':0,'parentImagesViewed':0}
Path('/tmp/avoid009-evening-parent/parent-native32-review.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
