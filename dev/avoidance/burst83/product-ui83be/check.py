"""Independent saved source/raw/lifecycle chain; no browser, rendering or remote access."""
from pathlib import Path
import json,gzip,hashlib,struct,sys
B=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent;R=U.parents[3];sha=lambda b:hashlib.sha256(b).hexdigest();snapshots={}
for m in sorted(B.glob('burst-product-ui83be-sourceprep*/pins.json')):
 for p in json.loads(m.read_text()):
  q=Path(p['snapshot']);b=q.read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256'];snapshots.setdefault(p['path'],[]).append(q)
def resolve(p):
 q=Path(p['path']);matches=lambda q:q.is_file()and q.stat().st_size==p['bytes']and sha(q.read_bytes())==p['sha256']
 if matches(q):return q,None
 q=next(q for q in snapshots.get(p['path'],[])if matches(q));return q,{'recordedPath':p['path'],'snapshot':str(q)}
def product(name):
 for m in sorted(B.glob('burst-product-ui83be-sourceprep*-final/pins.json'),reverse=True):
  for p in json.loads(m.read_text()):
   if p['path']==str(R/name):return resolve(p)[0]
 raise AssertionError('Missing historical 83be product pin: '+name)
def decode(x):
 if isinstance(x,dict):return struct.unpack('>d',bytes.fromhex(x['$f64']))[0]if list(x)==['$f64']else{k:decode(v)for k,v in x.items()}
 if isinstance(x,list):return[decode(v)for v in x]
 return x
trials=[];records={}
for suffix in ['02','04','05','06','07','09','10','11']:
 name=('burst-product-baseline-actual83be'if suffix=='05'else'burst-product-ui-actual83be')+suffix;D=B/name;r=json.loads((D/'result.json').read_text());diff=[]
 for p in r['pins']:
  _,d=resolve(p)
  if d:diff.append(d)
 raw={}
 for p in r['raw']:
  g=(D/p['file']).read_bytes();b=gzip.decompress(g);assert len(g)==p['gzipBytes']and sha(g)==p['gzipSHA256'];assert len(b)==p['jsonBytes']and sha(b)==p['sha256'];assert len(b)<=8*1024**2;raw[p['file'][:-8]]=json.loads(b)
 assert sum(p['jsonBytes']for p in r['raw'])<=128*1024**2 and sum(p['gzipBytes']for p in r['raw'])<=32*1024**2 and r['postPinsUnchanged']and r['mediaOutputs']==r['publicChecks']==0
 h=json.loads((B/(name+'-runtime')/'host.json').read_text());complete=suffix in ['05','07','11'];assert r['complete']==h['complete']==complete and h['probeExit']==(0 if complete else 1);assert h['normalPageClosureConfirmed']and h['debugPortClosed']and h['pages']['created']==len(h['pages']['closed'])==3;assert h['cleanup']['complete']and all(not h['cleanup'][k]for k in ['remaining','signals','ownershipFailures','signalFailures'])and all(x['exit']==0 for x in h['cleanup']['reaped'])
 for p in h['runtimeSources']:assert resolve(p)[1]is None
 if complete:assert not r['errors'];s=raw['product-ui'];assert s==r['summary']
 else:
  assert r['errors'];failure=raw['product-ui']['failure'];s=failure['details']['partial']
  if suffix=='09':assert failure['message']=='unknown group style'
  else:assert failure['code']=={'02':'OUTPUT_NOT_REFUSED','04':'BULBS_REGRESSION','06':'BOUNDARY_MUTATION','10':'CASE_NOT_REPRODUCED'}[suffix]
 records[suffix]=s;trials.append({'output':str(D),'complete':complete,'pins':len(r['pins']),'rawRecords':len(r['raw']),'resultSHA256':sha((D/'result.json').read_bytes()),'pinRecovery':diff,'jsonBytes':sum(p['jsonBytes']for p in r['raw']),'gzipBytes':sum(p['gzipBytes']for p in r['raw']),'normalWindowsClosed':3,'ownedCleanup':True})
p=records['02'];assert p['fontCancel']['state']['phase']=='cancelled'and p['fontCancel']['clear'];assert [(x['label'],x['code'])for x in p['stale']]==[('unregistered-fonts','BURST83AG_BOOTSTRAP_BLOCKED'),('preparing-no-formal','BURST83AG_PREPARE_REQUIRED')];assert p['ready'][0]['state']['ready']and p['ready'][0]['state']['stepCount']==501
p=records['04'];assert p['noMedia']=={'blobs':0,'saves':0};assert [(x['kind'],x['code'])for x in p['boundary']]==[(k,'BURST_UI_OUTPUT_UNSUPPORTED')for k in ['PNG','MP4','AE']]
p=records['06'];assert p['cancelResources'][-1]['owner']['models']==0 and p['cancelResources'][-1]['formal']['bindings']==p['cancelResources'][-1]['formal']['certificates']==0;assert [(x['kind'],x['code'])for x in p['boundary']]==[(k,'BURST_UI_OUTPUT_UNSUPPORTED')for k in ['PNG','MP4','AE']]
# Same640 baseline identifies an existing guard limitation, never a successful replacement size.
p=records['05'];assert p['state']['phase']=='unsupported'and p['state']['error']=='BULBS86AL_PLAN'and p['state']['stepCount']==287;assert p['viewport']=={'width':640,'height':360,'scale':1/3};assert p['matrix'][0]==p['matrix'][3]==0.3333333432674408 and p['guard']['scaleEqual']is False and all(v for k,v in p['guard'].items()if k!='scaleEqual')and p['circleError']=='BULBS86AL_PLAN'
baseline=B/'burst-product-baseline-source83be05';meta=json.loads((baseline/'baseline-head.json').read_text());assert sha((baseline/'baseline-original.html').read_bytes())==meta['originalHTMLSHA256']and b'burstUIBoundary83be'not in(baseline/'baseline-original.html').read_bytes()
s=records['07'];assert [x['label']for x in s['ready']]==['initial480','changed640'];assert [x['size']for x in s['ready']]==[[480,270],[640,360]]
for row,count,support in zip(s['ready'],[250,276],[3392,3959]):
 tr=decode(row['trajectory']);proof=tr['sourceProof'];assert row['state']['ready']and not row['overlay']and tr['sourceAdapter']=='burst_prepared83av'and proof['allPrimary']and proof['completeOwnedClockModel']and proof['checkedOwn']==count and proof['checkedSupports']==support;assert proof['viewport']['width']==row['size'][0]and proof['viewport']['height']==row['size'][1];assert proof['timePolicy']=='exact-model-preimages/initial-clamp/empty-tail'and not proof['formalPerformanceAccepted']
assert [(x['label'],x['code'])for x in s['stale']]==[('unregistered-fonts','BURST83AG_BOOTSTRAP_BLOCKED'),('preparing-no-formal','BURST83AG_PREPARE_REQUIRED'),('input-invalidated','BULBS80T_OWNED_PLAN_REQUIRED'),('input-new-size-ready','STALE_PLACEMENT_PLAN'),('resize-before-ready','STALE_PLACEMENT_PLAN')];assert all(x['bitmapUnchanged']for x in s['stale'])
assert s['unsupported']['state']['phase']=='unsupported'and s['unsupported']['clear']and s['unsupported']['overlay'];assert not s['hidden']['state']['active']and s['hidden']['outputAllowed']and not s['locked']['state']['active']and s['locked']['outputAllowed'];assert s['mixed']['burst']['error']==s['mixed']['bulbs']['error']=='MIXED_AVOIDANCE_UNSUPPORTED'and s['mixed']['clear'];assert s['bulbs']['state']['ready']and s['bulbs']['size']==[480,270]and not s['bulbs']['burst']['active'];assert s['centerBefore']==s['centerAfter']['hash']and not s['centerAfter']['burst']['active']and not s['centerAfter']['bulbs']['active']and s['centerArea'];z=s['cancelResources'][-1];assert z['owner']=={'models':0,'activeFrame':False,'preparing':False}and z['formal']['bindings']==z['formal']['certificates']==0
# New routing version: normal09 bitmap equals previous07 exactly; mixed11 uses official finalization.
assert records['09']['normal']['state']['ready']and records['09']['normal']['hash']==s['ready'][0]['hash'];p=records['11'];assert [x['kind']for x in p['cases']]==['locked','manual'];assert [x['selectedMode']for x in p['cases']]==['auto','manual'];assert all(x['runtimeDiagnostic']and x['finalLegacyDrawn']and x['activeCode']=='BULBS80T_OWNED_PLAN_REQUIRED'and x['activeBitmapUnchanged']and x['selectedPreserved']and not x['frameTarget']and x['areaOpened']for x in p['cases']);assert not p['center']['state']['active']
# Only the one target-routing function separates07's product code from09/11/current.
oldTarget="function target(plan,opt={}){return published.has(plan)||formalBinding83av?.needs(plan)||J.burstFrameTarget83ag(plan,opt)}";newTarget="function target(plan,opt={}){return published.has(plan)||(plan.cuts||[]).some(c=>c.placementTrajectory?.sourceAdapter==='burst_prepared83av')||J.burstFrameTarget83ag(plan,opt)}"
prior=B/'burst-product-ui83be-sourceprep07';current=(R/'src/11zz12_burst_core83.js').read_text();assert current.replace(newTarget,oldTarget)==(prior/'src/11zz12_burst_core83.js').read_text()
for name in ['src/09_render.js','src/09a_placement.js','src/11p_layoutsD.js','src/11_export.js','src/12_ui.js','app/body.html']:
 assert product(name).read_bytes()==(prior/name).read_bytes(),name
for name in ['index.html','en/index.html']:assert product(name).read_text().replace(newTarget,oldTarget)==(prior/name).read_text()
# Guarded post body preserves original statements byte-for-byte.
guard="\n    if(J.placement.burstNormalPostScope83bc?.needs(plan))J.placement.burstNormalPostScope83bc.assertBeforePost(plan,{...opt,scale},this,ctx);";base=(U/'base/src/09_render.js').read_text();ren=product('src/09_render.js').read_text();method=lambda s:s[s.index('  post(ctx, plan,'):s.index('\n}\n/* beat context',s.index('  post(ctx, plan,'))];assert method(ren).replace(guard,'')==method(base)
# Candidate instrumentation is test-only, never present in production bundle/HTML.
for name in ['index.html','en/index.html','src/11zz12_burst_core83.js']:assert 'observeProductFormal83be'not in(R/name).read_text()and 'observeProductCancel83be'not in(R/name).read_text()
for suffix in ['02','04','06','07','09','10','11']:
 D=B/('burst-product-ui-source83be'+suffix);s=(D/'candidate-ja.html').read_text();s=s.replace("window.observeProductFormal83be?.(formal,unit.stats());",'').replace('viewport=null;window.observeProductCancel83be?.(unit?.stats()||null)}','viewport=null}');a=s.index('/* TEST83BE startup');z=s.index('/* ============================================================\n   JIZURA — editor UI',a);s=s[:a]+s[z:];assert s==(prior/'index.html').read_text()if suffix in ['02','04','06','07']else s==product('index.html').read_text()
for path in sorted(B.glob('*preflight83be*.json')):
 q=json.loads(path.read_text());assert q['qtCount']==q['zombieCount']==1132 and q['liveQtCount']==0 and all(r['state']=='Z'and r['ppid']==1 and r['startTicks']<=20062245 for r in q['qtProcesses'])
finals=sorted(B.glob('burst-product-ui83be-sourceprep*-final/pins.json'))
if finals:
 for p in json.loads(finals[-1].read_text()):resolve(p)
print(json.dumps({'checked':True,'trials':trials,'product07':{'normalSizes':[480,640],'checkedOwn':[250,276],'checkedSupports':[3392,3959],'inputAndResizeRevoked':True,'hiddenLockedMixed':True,'bulbsReadyAt480':True,'centerHashRestored':True,'released':True},'routingFix':{'pureReproduction':30,'normal09Matches07':True,'mixed11LockedManualDraw':True,'activeUnpreparedRefused':True,'genuineOldTokenEvidence':'07 plus exact protected-path source/pure continuity; not falsely claimed a new live old-token test in11'},'existingBulbs640':{'baselineHead':meta['head'],'unsupported':'BULBS86AL_PLAN','scale':1/3,'readback':records['05']['matrix'][0]},'prepareMs':[x['state']['elapsedMs']for x in records['07']['ready']],'maxStepMs':[x['state']['maxStepMs']for x in records['07']['ready']],'historicalProductSnapshots':True,'scope':'historical bounded product main UI; source/raw all retained; no broad input/performance/media acceptance'},indent=2))
