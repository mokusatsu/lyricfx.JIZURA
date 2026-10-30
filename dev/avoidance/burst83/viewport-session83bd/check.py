"""Saved failure/success chain, authority/lifecycle checks; no Qt or model imports."""
from pathlib import Path
import json,gzip,hashlib,struct,sys
B=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent;R=U.parents[3];sha=lambda b:hashlib.sha256(b).hexdigest();snapshots={}
manifests=sorted(B.glob('burst-viewport-session83bd-sourceprep*/pins.json'))
for m in manifests:
 for p in json.loads(m.read_text()):
  q=Path(p['snapshot']);b=q.read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256'];snapshots.setdefault(p['path'],[]).append(q)
def pin(p):
 q=Path(p['path']);match=lambda q:q.is_file()and q.stat().st_size==p['bytes']and sha(q.read_bytes())==p['sha256']
 if match(q):return None
 q=next(q for q in snapshots.get(p['path'],[])if match(q));return{'recordedPath':p['path'],'executedSnapshot':str(q)}
def decode(x):
 if isinstance(x,dict):return struct.unpack('>d',bytes.fromhex(x['$f64']))[0]if list(x)==['$f64']else{k:decode(v)for k,v in x.items()}
 if isinstance(x,list):return[decode(v)for v in x]
 return x
records={};trials=[]
for suffix in ['01','03','04','05']:
 D=B/('burst-viewport-session-actual83bd'+suffix);r=json.loads((D/'result.json').read_text());diff=[v for p in r['pins']if(v:=pin(p))];raw={}
 for p in r['raw']:
  g=(D/p['file']).read_bytes();b=gzip.decompress(g);assert len(g)==p['gzipBytes']and sha(g)==p['gzipSHA256'];assert len(b)==p['jsonBytes']and sha(b)==p['sha256']and len(b)<=8*1024**2;raw[p['file'][:-8]]=json.loads(b)
 assert sum(p['jsonBytes']for p in r['raw'])<=128*1024**2 and sum(p['gzipBytes']for p in r['raw'])<=32*1024**2 and r['postPinsUnchanged']and r['mediaOutputs']==r['publicChecks']==0
 assert raw['dependency-preflight']['ready']and not raw['dependency-preflight']['ownerCreated']and all(x['present']for x in raw['dependency-preflight']['rows'])
 h=json.loads((B/(D.name+'-runtime')/'host.json').read_text());assert h['complete']==(suffix=='05')and h['probeExit']==(0 if suffix=='05'else 1);assert h['normalPageClosureConfirmed']and h['debugPortClosed']and h['pages']['created']==len(h['pages']['closed'])==3;assert h['cleanup']['complete']and all(not h['cleanup'][k]for k in ['remaining','signals','ownershipFailures','signalFailures'])and all(x['exit']==0 for x in h['cleanup']['reaped'])
 for p in h['runtimeSources']:assert pin(p)is None
 if suffix=='05':assert r['complete']and not r['errors'];records[suffix]=raw['owned-ui'];assert r['summary']==raw['owned-ui']
 else:
  assert not r['complete']and r['errors'];f=raw['owned-ui']['failure'];partial=f['details']['partial'];records[suffix]=partial
  if suffix in ['01','03']:
   assert f['code']=='INITIAL_NOT_READY'and f['details']['original']['error']=={'01':'BURST83AG_OTHER_CONTROLLER','03':'INVALID_D_ADAPTER_REGISTRATION'}[suffix]
  else:
   assert f['code']=='BURST83AJ_INPUT_NORMALIZED_NATIVE'and len(r['errors'])==2 and 'BURST83AG_PREPARE_REQUIRED'in r['errors'][0]['message']
 trials.append({'output':str(D),'complete':r['complete'],'resultSHA256':sha((D/'result.json').read_bytes()),'pins':len(r['pins']),'pinRecovery':diff,'jsonBytes':sum(p['jsonBytes']for p in r['raw']),'gzipBytes':sum(p['gzipBytes']for p in r['raw']),'normalPagesClosed':3,'cleanupComplete':True})
#04 prefix is real success, followed by explicit failure; never relabel the run complete.
p=records['04'];assert p['cancel']['phase']=='cancelled'and p['cancel']['clear']and p['cancel']['runtime']['steps']==3;z=p['cancel']['runtime']['stats'];assert z['owner']=={'models':0,'activeFrame':False,'preparing':False}and z['formal']['bindings']==z['formal']['certificates']==0
assert [(x['label'],x['code'])for x in p['viewportBusy']]==[('preparing','BURST83BD_VIEWPORT_BUSY'),('ready','BURST83BD_VIEWPORT_BUSY')];assert p['stale']==[{'label':'input-invalidated','code':'BULBS80T_OWNED_PLAN_REQUIRED','bitmapUnchanged':True}]
assert len(p['generations'])==1;g=p['generations'][0];assert g['kind']=='initial480'and g['viewport']=={'width':480,'height':270,'scale':.25}and g['state']['ready']and g['state']['stepCount']==501;assert [f['time']for f in g['frames']]==[0,.123456,.5,4/3];tr=decode(g['trajectory']);assert tr['sourceProof']['checkedOwn']==250 and tr['sourceProof']['checkedSupports']==3392
s=records['05'];assert s['ownerCreations']==1 and [g['width']for g in s['generations']]==[480,640];assert s['changedProject']['lyrics']!=s['initialInput']['editable']['cuts'][0]['text'];assert s['changedProject']['avoidance']['regions'][0]['center']['x']==.72
for g in s['generations']:
 vp=g['viewport'];width=g['width'];assert vp=={'width':width,'height':width*9/16,'scale':width/1920};st=g['state'];assert st['ready']and st['phase']=='ready'and st['stepCount']==553 and not st['error']and not st['cleanupError'];assert g['runtime']['stats']['owner']=={'models':1,'activeFrame':False,'preparing':False};tr=decode(g['trajectory']);proof=tr['sourceProof'];assert tr['sourceAdapter']=='burst_prepared83av'and proof['allPrimary']and proof['completeOwnedClockModel']and proof['checkedOwn']==276 and proof['checkedSupports']==3959 and proof['viewport']==vp and proof['timePolicy']=='exact-model-preimages/initial-clamp/empty-tail'and not proof['formalPerformanceAccepted'];assert [x['time']for x in g['frames']]==[.123456,.5]and all(len(x['hash'])==64 for x in g['frames']);segment=tr['units'][0]['segments'][0];assert segment['from']==segment['to']==[x/vp['scale']for x in proof['deviceDelta']];assert proof['deviceCircle']['cx']==.72*width
 assert any(x.get('ready')and x['width']==width and x['fast']is False for x in s['uiCalls'])
assert [(x['label'],x['code'])for x in s['stale']]==[('resize-before-prepare','BULBS80T_OWNED_PLAN_REQUIRED'),('resize-new-ready','STALE_PLACEMENT_PLAN')];assert all(x['bitmapUnchanged']for x in s['stale']);assert all(not x.get('ready')for x in s['uiCalls']if x['phase']in ['empty','fonts','preparing'])
z=s['final'];assert z['clear']and z['session']['phase']=='cancelled'and z['statusText']=='Preparation cancelled.'and not z['runtime']['ready'];assert z['runtime']['stats']['owner']=={'models':0,'activeFrame':False,'preparing':False}and z['runtime']['stats']['formal']['bindings']==z['runtime']['stats']['formal']['certificates']==0
# Original proof/compiler/body and normal-post guard remain unchanged. Only test UI boundary is added.
D=B/'burst-viewport-session-source83bd05';old=B/'burst-normal-options-source83bc01';line='\n  if(window.burstPreviewBoundary83bd?.({ctx,plan:S.plan,t:S.t,renderer,fast}))return;';assert (D/'candidate-ja.html').read_text().replace(line,'')==(old/'candidate-ja.html').read_text()
for name in ['new-root83.js','new-compose83.js','new-geometry83.js','new-scalar-support83.js','new-clock-compiler83.js','destination-geometry83.js','post-scope83bc.js','fast-scope83bc.js','renderer-time83.js','post-scope83bb.js','plan-binding83.js','prepare-stage83.js','finalizer-input83.js']:
 assert(D/name).read_bytes()==(old/name).read_bytes(),name
assert (D/'private-controller83.js').read_bytes()==(U/'private-controller83.js').read_bytes();assert(D/'prepared-handoff83.js').read_text().replace('window.inspectSessionOwner83bd?.(owner);','').replace('const owner=createOwner({viewport});const guard=','const owner=createOwner({viewport}),guard=')==(U/'prepared-handoff83.js').read_text()
assert (D/'runtime83bd.js').read_text().replace('window.beforeSessionDraw83bd?.(formal);','')==(B/'burst-viewport-session83bd-sourceprep05/runtime83bd.js').read_text()
current=(U/'runtime83bd.js').read_text();current=current.replace('cleanupFailed=false,initializationFailed=false;','cleanupFailed=false;').replace("need(!initializationFailed,'BURST83BD_INITIALIZATION_FAILED');",'').replace("else{try{unit=A.burstPreparedHandoff83ap.create({viewport});unit.connect();A.registerLayoutsDAdapter('burst',unit.adapter);}catch(e){initializationFailed=true;throw e}}","else{unit=A.burstPreparedHandoff83ap.create({viewport});unit.connect();A.registerLayoutsDAdapter('burst',unit.adapter);}").replace('state:()=>({steps,viewport,initializationFailed,ready:','state:()=>({steps,viewport,ready:');assert current==(B/'burst-viewport-session83bd-sourceprep05/runtime83bd.js').read_text()
assert (U/'session83bd.js').read_text()==(R/'src/11zz11_bulbs_session86.js').read_text().replace('bulbsUISession86bx','burstUISession83bd').replace('BULBS_UI_CLEANUP_FAILED','BURST_UI_CLEANUP_FAILED')
for path in sorted(B.glob('burst-viewport-session-preflight83bd*.json')):
 pre=json.loads(path.read_text());assert pre['qtCount']==pre['zombieCount']==1132 and pre['liveQtCount']==0 and pre['latestQtZombieStartTicks']==20062245;assert all(q['state']=='Z'and q['ppid']==1 for q in pre['qtProcesses'])
post=json.loads((B/'burst-viewport-session-postflight83bd05.json').read_text());assert post['qtCount']==post['zombieCount']==1132 and post['liveQtCount']==0 and post['latestQtZombieStartTicks']==20062245
finals=sorted(B.glob('burst-viewport-session83bd-sourceprep*-final/pins.json'))
if finals:
 for p in json.loads(finals[-1].read_text()):assert pin(p)is None
source06=B/'burst-viewport-session-source83bd06'
if source06.exists():
 for p in json.loads((source06/'pins.json').read_text()):assert pin(p)is None
 assert (source06/'runtime83bd.js').read_text().replace('window.beforeSessionDraw83bd?.(formal);','')==(U/'runtime83bd.js').read_text()
print(json.dumps({'checked':True,'trials':trials,'completed04Prefix':{'cancelSteps':3,'frames':4,'inputInvalidation':True,'viewportBusyRefused':True},'completed05Suffix':{'actualNormalUISizes':[480,640],'changedInput':True,'singleOwner':True,'checkedOwnPerGeneration':276,'checkedSupportsPerGeneration':3959,'resizeOldTokensRefused':True,'finalReleased':True},'prepareMs':[g['state']['elapsedMs']for g in s['generations']],'maxStepMs':[g['state']['maxStepMs']for g in s['generations']],'scope':'candidate UI/session normal path only; no product registration, full domain or performance acceptance'},indent=2))
