"""Read-only checker: historical pins, failed/successful raw, formal lineage, exact frame replay."""
from pathlib import Path
import json,gzip,hashlib,struct,sys,collections
B=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent;R=U.parents[3];sha=lambda b:hashlib.sha256(b).hexdigest()
maps=[p for m in sorted(B.glob('domino-ui-frame82am-sourceprep*/pins.json'))for p in json.loads(m.read_text())]
def pin(p):
 b=Path(p['path']).read_bytes()
 if len(b)==p['bytes']and sha(b)==p['sha256']:return False
 matches=[x for x in maps if x['path']==p['path']and x['bytes']==p['bytes']and x['sha256']==p['sha256']];assert matches,p['path']
 b=Path(matches[0]['snapshot']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256'];return True
def dec(x):
 if isinstance(x,dict):return struct.unpack('>d',bytes.fromhex(x['$f64']))[0]if set(x)=={'$f64'}else{k:dec(v)for k,v in x.items()}
 if isinstance(x,list):return[dec(v)for v in x]
 return x
def bits(x):
 if isinstance(x,(float,int))and not isinstance(x,bool):return struct.pack('>d',float(x)).hex()
 if isinstance(x,dict):return{k:bits(v)for k,v in x.items()}
 if isinstance(x,list):return[bits(v)for v in x]
 return x
def load(p):return dec(json.loads(gzip.decompress(p.read_bytes())))
runs=[];records={}
for i,complete,count,error in [(1,False,2,'SOURCE_PLAN_REQUIRED'),(2,False,3,'DOMINO82E_MEASURED_MATERIAL'),(3,True,4,None)]:
 d=B/('domino-ui-frame-actual82am%02d'%i);r=json.loads((d/'result.json').read_text());assert r['complete']==complete and len(r['raw'])==count and r['postPinsUnchanged']and r['mediaOutputs']==r['publicChecks']==0
 historical=sum(pin(p)for p in r['pins']);raw={}
 for p in r['raw']:
  g=(d/p['file']).read_bytes();b=gzip.decompress(g);assert len(g)==p['gzipBytes']and sha(g)==p['gzipSHA256']and len(b)==p['jsonBytes']and sha(b)==p['sha256']and len(b)<=8*1024**2;raw[p['file'][:-8]]=dec(json.loads(b))
 assert sum(p['jsonBytes']for p in r['raw'])<=128*1024**2 and sum(p['gzipBytes']for p in r['raw'])<=32*1024**2
 if error:assert raw['product-ui'if i==1 else'frames']['failure']['code']==error and r['errors']
 else:assert not r['errors']
 h=json.loads((B/(d.name+'-runtime')/'host.json').read_text());assert h['complete']==complete and h['probeExit']==(0 if complete else 1)and h['normalPageClosureConfirmed']and h['debugPortClosed']and h['pages']['created']==len(h['pages']['closed'])==3 and h['cleanup']['complete']and all(not h['cleanup'][k]for k in ['signals','remaining','ownershipFailures','signalFailures'])
 for p in h['runtimeSources']:pin(p)
 records[i]=raw;runs.append({'run':i,'complete':complete,'pins':len(r['pins']),'historicalPinMatches':historical,'raw':count,'jsonBytes':sum(p['jsonBytes']for p in r['raw']),'normalWindowsClosed':3,'signalCount':0,'cleanupComplete':True})
for i in [2,3]:
 p=records[i]['product-ui'];assert p['phase']=='formal-ready'and p['before']['code']=='DOMINO82AC_PREPARE_REQUIRED'and p['before']['bitmapUnchanged']and p['before']['stats']['nativeCompiles']==0
 assert p['prepare']['stats']['nativeCompiles']==1 and p['prepare']['stats']['destinationSamples']==250
 tr=p['final']['cuts'][0]['placementTrajectory'];assert tr['sourceAdapter']=='domino_prepared82am'and tr['safety']=='certified-bounded-adapter'and tr['certificate']['adapterId']==tr['sourceAdapter']and tr['sourceProof']['viewport']=={'width':480,'height':270,'scale':.25}
 assert p['final']['placementFinalization']['diagnostics']==[{'cut':0,'code':'STAGED_D_ADAPTER','adapter':'domino_prepared82am','safety':'certified-bounded-adapter'}]
 assert not p['normalPostQualified']and not p['frameAuthority'] # stage flag is not a normal/UI claim
prior={(r['n'],r['pass']):r['destination']for p in (B/'domino-source-paint-actual82al02').glob('paint-*.json.gz')for r in load(p)['rows']}
baseline=load(B/'domino-source-paint-actual82al02/product-ui.json.gz')
for i in [2,3]:
 p=records[i]['product-ui'];assert bits(p['input']['normalized'])==bits(baseline['input']['normalized'])
 proof=p['final']['cuts'][0]['placementTrajectory']['sourceProof'];assert bits(proof['sourceDy'])==bits(baseline['model']['dy'])and bits(proof['deviceCircle'])==bits(baseline['model']['circle'])and proof['own']==250
frames=records[3]['frames'];assert not frames['normalOptionsQualified']and not frames['UIConnected'];assert [r['t']for r in frames['rows']]==[0,.2,1.34,1.75];counts=collections.Counter()
for row in frames['rows']:
 n=int(row['t']/(1/60)+1e-6);assert row['prefix']['wrappersRestored']
 for p in row['passes']:
  counts['passes']+=1;q=prior[(n,p['pass'])];assert bits(p['root'])==bits(q['root'])
  for k in ['t','realTime','lt','ltb','step']:
   assert bits(p[k])==bits(row['t']if k=='realTime'else q['clock'][k])
  a,z=p['observed'],q['observed'];assert bits(a['rng'])==bits(z['rng'])and bits(a['fits'])==bits(z['fits'])and bits(a['clips'])==bits(z['clips'])and len(a['paint'])==len(z['paint'])
  for actual,old in zip(a['paint'],z['paint']):
   counts['paint']+=1
   for k in actual:
    if k!='state':assert bits(actual[k])==bits(old[k]),k
   for k in actual['state']:
    v,w=actual['state'][k],old['state'][k]
    if bits(v)==bits(w):continue
    if k=='fillStyle'and actual['kind']=='stroke':
     assert isinstance(v,dict)and v['origin']=='native-frame-prefix82e'and v['kind']=='radial'and w=='#000000';counts['unusedStrokeFillStyle']+=1
    elif k in ['letterSpacing','wordSpacing']and actual['kind']in ['stroke','fill']:
     assert v==''and w=='0px';counts['nonTextSpacingProperties']+=1
    else:raise AssertionError((actual['kind'],k,v,w))
assert dict(counts)=={'passes':9,'paint':66,'unusedStrokeFillStyle':2,'nonTextSpacingProperties':28},counts
f=frames['stats'];assert f['preparedFrames']==4 and f['drawnPasses']==9 and f['frameSampleCalls']==9 and f['nativeCompiles']==1 and not f['active'];assert not frames['rows'][-1]['passes']
release=records[3]['release'];assert [(x['label'],x['code'])for x in release['negatives']]==[('normal-options','DOMINO82Q_OPTIONS'),('decoded-alias','STALE_PLACEMENT_PLAN'),('old-generation','DOMINO82P_GENERATION_STALE'),('cancelled-authority','BULBS80T_OWNED_PLAN_REQUIRED')];assert all(x['bitmapUnchanged']and x['compileDelta']==0 for x in release['negatives'])
assert release['canvasReleased']and all(not release['stats'][k]for k in ['resident','pending','active','ticket','preparingSurfaceBytes','ownedPlanBytes'])and not release['api']['staged']and not release['api']['prepared']
# Verify isolated renderer generation and exact old consume-once issuer contract.
s=(U/'renderer82am.js').read_text();old=(R/'dev/avoidance/domino82/frame-inspection82r/09_render-frame82.js').read_text();a=old.index('// Unregistered domino current-frame issuer');z=old.index('const bulbs80Frames',a);assert old[a:z]in s
assert s.index('const domino82qFrame=')<s.index('const foregroundCut =')and s.index("DOMINO82Q_HOOK_CONFLICT")<s.index('const domino82qFrame=')
assert s.count('domino82qFrames.set(')==s.count('domino82qHooks.prepare(')==1
for p in maps:
 b=Path(p['snapshot']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256']
print(json.dumps({'checked':True,'runs':runs,'frameComparison':dict(counts),'oldPlanRefusedBeforeBitmap':True,'privateResourcesReleased':True,'sourceXClip':'82al unchanged native clipping, not all-direction stage-clear','scope':'formal private plan and four current-frame times; normal options/UI/performance unqualified'},indent=2))
