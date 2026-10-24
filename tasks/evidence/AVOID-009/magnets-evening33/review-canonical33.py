import gzip,json,hashlib,math
from pathlib import Path
base=Path('/dev/shm/avoid009-evening-20261024');x=json.load(gzip.open(base/'canonical33.raw.json.gz','rt'));old=json.load(gzip.open(base/'adapter32.raw.json.gz','rt'))['results'][0]['result'];assert not x['errors'] and len(x['results'])==2
output=[]
for edition in x['results']:
 assert edition['completed'] and not edition['pageErrors'];r=edition['result'];assert len(r['frames'])==18 and len(r['boundaryScales'])==26
 for k in ['ledger','domain','recipe','selectedCounts','sourceCatalog','boardModel','qualityPolicy']:assert r['certificate'][k]==old['certificate'][k],k
 for f in r['frames']:
  n=math.floor(f['time']/(1/60)+1e-6)
  if n<249:
   ref=old['frames'][n];assert f['beforeSHA256']==ref['beforeSHA256'] and f['afterSHA256']==ref['afterSHA256'],(edition['edition'],f['time'])
  assert all(a['circleClear'] and a['stageContained'] for o in f['observations']for a in o['actual'])
 assert all(p['nativeSHA256']==p['replaySHA256']for p in r['zeroReplay']) and all(p['directNativeSHA256']==p['adapterSHA256']for p in r['movedPixelReferences'])
 assert sum(len(b['pairs'])for b in r['bypass'])==20 and all(p['beforeSHA256']==p['afterSHA256']for b in r['bypass']for p in b['pairs'])
 assert all(p['offSHA256']==p['enabledNativeSHA256']for p in r['enabledIndexPairs']);assert r['cache']['decodedCertificateMatches'] and r['stale']['restoredCode']is None
 output.append({'edition':edition['edition'],'frames':len(r['frames']),'zeroPixelPairs':len(r['zeroReplay']),'movedNativePixelPairs':len(r['movedPixelReferences']),'boundaryScaleFrames':26,'bypassPixelPairs':20,'canonicalRasterMatchesIsolated32AtSameQuantizedTimes':True,'continuousCertificateMatches32':True,'cacheAndReplan':True})
r={'status':'PARENT_ACCEPTED_CANONICAL_JAEN_SOURCE_RAW','rawSHA256':hashlib.sha256((base/'canonical33.raw.json.gz').read_bytes()).hexdigest(),'rawBytes':(base/'canonical33.raw.json.gz').stat().st_size,'editions':output,'full250Native32Retained':True,'visualHuman':'pending','formalPerformanceAccepted':False,'publicChecks':0,'parentImagesViewed':0}
Path('/tmp/avoid009-evening-parent/parent-canonical33-review.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))
