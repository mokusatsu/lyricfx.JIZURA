"""Read-only paired-source/performance/result/cleanup check; never invokes a browser."""
from pathlib import Path
import json,gzip,hashlib,struct,sys
B=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent;sha=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):
 b=Path(p['path']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256'],p['path']
def dec(x):
 if isinstance(x,dict):return struct.unpack('>d',bytes.fromhex(x['$f64']))[0]if set(x)=={'$f64'}else{k:dec(v)for k,v in x.items()}
 if isinstance(x,list):return[dec(v)for v in x]
 return x
data={};runs=[]
for mode in ['old','new']:
 d=B/('domino-native-reuse-'+mode+'-actual82ap01');r=json.loads((d/'result.json').read_text());assert r['complete']and not r['errors']and r['postPinsUnchanged']and len(r['raw'])==3 and r['mediaOutputs']==r['publicChecks']==0
 for p in r['pins']:pin(p)
 raw={}
 for p in r['raw']:
  g=(d/p['file']).read_bytes();b=gzip.decompress(g);assert len(g)==p['gzipBytes']and sha(g)==p['gzipSHA256']and len(b)==p['jsonBytes']and sha(b)==p['sha256']and len(b)<=8*1024**2;raw[p['file'][:-8]]=dec(json.loads(b))
 assert sum(p['jsonBytes']for p in r['raw'])<=128*1024**2 and sum(p['gzipBytes']for p in r['raw'])<=32*1024**2
 h=json.loads((B/(d.name+'-runtime')/'host.json').read_text());assert h['complete']and h['probeExit']==0 and h['normalPageClosureConfirmed']and h['debugPortClosed']and h['pages']['created']==len(h['pages']['closed'])==3 and h['cleanup']['complete']and all(not h['cleanup'][k]for k in ['remaining','signals','ownershipFailures','signalFailures'])
 for p in h['runtimeSources']:pin(p)
 prep,finish=raw['product-ui'],raw['finish'];assert prep['mode']==mode and prep['phase']=='formal-ready'and prep['prepare']['steps']==501 and prep['prepare']['stats']['nativeCompiles']==1 and prep['prepare']['stats']['destinationSamples']==250
 assert prep['nativeSampleCalls']==finish['nativeSampleCalls']==(500 if mode=='old'else 250)and prep['shiftedSampleCalls']==finish['shiftedSampleCalls']==250
 assert finish['candidateCount']==1 and finish['own']==250 and finish['proof']['own']==250 and finish['stats']['preparedFrames']==1 and finish['stats']['drawnPasses']==finish['stats']['frameSampleCalls']==3
 assert finish['stale']=='DOMINO82P_GENERATION_STALE'and all(not finish['released'][k]for k in ['resident','pending','active','ticket','preparingSurfaceBytes','ownedPlanBytes'])
 data[mode]=raw;runs.append({'mode':mode,'pins':len(r['pins']),'raw':3,'wallMs':prep['totalPrepareWallMs'],'ownerLoopMs':prep['prepare']['elapsedMs'],'maxStepMs':prep['prepare']['maxStepMs'],'nativeSamples':prep['nativeSampleCalls'],'shiftedSamples':prep['shiftedSampleCalls'],'normalWindowsClosed':3,'cleanupComplete':True})
old,new=data['old'],data['new'];assert old['product-ui']['input']==new['product-ui']['input']
for k in ['modelHash','clockHash','frameHash','proof','own','candidateCount']:assert old['finish'][k]==new['finish'][k],k
assert old['finish']['frameHash']=='2bd27d22abbe581d046c7e575c3b6b7f15721bd89b929d11122146c56ad59f9d'
# Complete semantic model is committed to the checksum: no row/support/glyph/time filter.
fragment=(U/'finish-fragment.js').read_text();assert 'value={...stateCapture.model};delete value.budget;'in fragment and 'JSON.stringify(C.exact(value))'in fragment and 'JSON.stringify(C.exact(stateCapture.clock))'in fragment
# All dynamic geometry/rendering/normal-option/issuer algorithms are unchanged.
a=B/'domino-native-reuse-old-source82ap01';b=B/'domino-native-reuse-new-source82ap01'
same=['candidate-ja.html','root82ak.js','compose82ak.js','geometry82ak.js','scope82ak.js','vertical82ak.js','model82ak.js','scalar-support82.js','scalar-support-shift82.js','native-geometry82.js','parts82.js','visual-policy82.js','controller82am.js','renderer-time82am.js','plan-binding82am.js','post-scope82am.js','post-scope82an.js','fast-scope82an.js']
for name in same:assert(a/name).read_bytes()==(b/name).read_bytes(),name
assert "candidates:[{kind:'source-y',dx:0,dy}]"in(b/'vertical82ak.js').read_text()
compiler=(b/'compiler82ak.js').read_text();owner=(b/'owner82ak.js').read_text();assert 'baseBytes+nativeBytes+currentBytes()'in compiler and 'baseBytes+nativeBytes+acc.retainedBytes()+currentBytes()'in compiler and 'nativeBytes+=(nativeRows.length?1:0)+C.serializedBytes(row)'in compiler
assert 'nativeResult=proposal.nativeRows[nativeIndex++].sample;'in owner and 'proposal.nativeRows[nativeIndex-1]=null;'in owner and 'nativeResult=S.sample'not in owner
# Preserve all pre-existing uncommitted product work exactly.
checkpoint=B/'domino-product-ui82ao-before-performance82ap/pins.json'
for p in json.loads(checkpoint.read_text()):
 pin(p);v=Path(p['snapshot']).read_bytes();assert len(v)==p['bytes']and sha(v)==p['sha256']
for manifest in B.glob('domino-native-reuse82ap-sourceprep*-final/pins.json'):
 for p in json.loads(manifest.read_text()):
  pin(p);v=Path(p['snapshot']).read_bytes();assert len(v)==p['bytes']and sha(v)==p['sha256']
ow,nw=runs[0]['wallMs'],runs[1]['wallMs'];assert ow>nw
print(json.dumps({'checked':True,'runs':runs,'wallReductionMs':ow-nw,'wallReductionPercent':100*(ow-nw)/ow,'candidateCount':1,'acceptedOwn':250,'allSemanticModelPartsAndTimesHashEqual':old['finish']['modelHash'],'fullClockHashEqual':old['finish']['clockHash'],'normalFrameHashEqual':old['finish']['frameHash'],'sourceDy':old['finish']['proof']['sourceDy'],'estimatedRetainedNativeSampleBytes':2395124,'productCheckpointUnchanged':True,'limitation':'one fixed-order old/new observation; +about2.4MB transient retention and max synchronous step worsened; no stable performance or product-adoption claim'},indent=2))
