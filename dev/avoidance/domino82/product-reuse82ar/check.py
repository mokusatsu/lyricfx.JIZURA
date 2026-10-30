"""Read-only product connection, historical source, result and resource checker."""
from pathlib import Path
import json,gzip,hashlib,sys
B=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent;R=U.parents[3];Q=U.parent/'previous-model82aq';sha=lambda b:hashlib.sha256(b).hexdigest()
maps=[p for m in B.glob('domino-product-reuse82ar-sourceprep*/pins.json')for p in json.loads(m.read_text())]
# The AR product assertions are historical after later bulbs integration.
# Execution pins below still resolve their own exact bytes independently.
historical=B/'bulbs-product-reuse86cp-before/pins.json'
productSnapshots={p['path']:p for p in json.loads(historical.read_text())}if historical.exists()else{}
def productBytes(p):
 saved=productSnapshots.get(str(p))
 if not saved:return p.read_bytes()
 b=Path(saved['snapshot']).read_bytes();assert len(b)==saved['bytes']and sha(b)==saved['sha256'];return b
def pin(p):
 b=Path(p['path']).read_bytes()
 if len(b)==p['bytes']and sha(b)==p['sha256']:return False
 candidates=[x for x in maps if all(x[k]==p[k]for k in ['path','bytes','sha256'])];assert candidates,p['path'];b=Path(candidates[0]['snapshot']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256'];return True
runs=[];data={}
for i in ['01','02']:
 d=B/('domino-product-reuse-actual82ar'+i);r=json.loads((d/'result.json').read_text());assert r['complete']and not r['errors']and r['postPinsUnchanged']and len(r['raw'])==2 and r['mediaOutputs']==r['publicChecks']==0
 historical=sum(pin(p)for p in r['pins']);raw={}
 for p in r['raw']:
  g=(d/p['file']).read_bytes();b=gzip.decompress(g);assert len(g)==p['gzipBytes']and sha(g)==p['gzipSHA256']and len(b)==p['jsonBytes']and sha(b)==p['sha256']and len(b)<=8*1024**2;raw[p['file'][:-8]]=json.loads(b)
 assert sum(p['jsonBytes']for p in r['raw'])<=128*1024**2 and sum(p['gzipBytes']for p in r['raw'])<=32*1024**2
 h=json.loads((B/(d.name+'-runtime')/'host.json').read_text());assert h['complete']and h['probeExit']==0 and h['normalPageClosureConfirmed']and h['debugPortClosed']and h['pages']['created']==len(h['pages']['closed'])==3 and h['cleanup']['complete']and all(not h['cleanup'][k]for k in ['remaining','signals','ownershipFailures','signalFailures'])
 for p in h['runtimeSources']:pin(p)
 data[i]=raw['product-ui'];runs.append({'run':i,'pins':len(r['pins']),'historicalPins':historical,'raw':2,'normalWindowsClosed':3,'cleanupComplete':True})
x=data['01'];cases=x['cases'];assert [c['label']for c in cases]==['initial-product','same-input-replan','circle-recheck','circle-cold-fallback']
assert [(c['nativeSamples'],c['shiftedSamples'])for c in cases]==[(500,250),(0,0),(0,0),(500,250)]
assert cases[1]['stats']['sameReuse']==1 and cases[2]['stats']['circleReuse']==1 and cases[2]['stats']['recheckedOwn']==250 and cases[2]['stats']['recheckedSupports']==3064
assert cases[3]['stats']['reuseRejected']==1 and cases[3]['stats']['nativeCompiles']==2 and cases[3]['dy']==227.2677143492043 and cases[3]['frameHash']=='cdc45a7250bb7f50bc7cdb753828d82192d9292454dc0eee07d1674c628cc485'
# Match the committed AQ numerical results for the same inputs, circle and cold fallback.
refs={}
for name in ['domino-previous-model-new-actual82aq03','domino-previous-model-new-actual82aq04']:
 d=B/name;r=json.loads((d/'result.json').read_text());entry=next(p for p in r['raw']if p['file']=='product-ui.json.gz');g=(d/entry['file']).read_bytes();b=gzip.decompress(g);assert sha(g)==entry['gzipSHA256']and sha(b)==entry['sha256']
 for c in json.loads(b)['cases']:refs[c['label']]=c
for c,label in zip(cases,['initial','same-input-replan','circle-only','circle-cold-fallback']):
 for k in ['dy','coverage','modelHash','frameHash']:assert c[k]==refs[label][k],(c['label'],k)
assert all(q['bitmapUnchanged']and q['code']for q in x['stale'])and len(x['stale'])==4 and x['cancelled']['clear']and x['cancelled']['state']['phase']=='cancelled'
assert len(x['outputs'])==4 and all(q['code']=='DOMINO_UI_OUTPUT_UNSUPPORTED'and q['workNotStarted']for q in x['outputs'])
assert all(x['uiOutputs'].values())and x['burst']['state']['ready']and not x['burst']['domino']['active']and x['bulbs']['state']['ready']and not x['bulbs']['domino']['active']and not x['bulbs']['burst']['active']
baselineRun=B/'domino-product-ui-actual82ao03';ledger=json.loads((baselineRun/'result.json').read_text());entry=next(p for p in ledger['raw']if p['file']=='product-ui.json.gz');g=(baselineRun/entry['file']).read_bytes();b=gzip.decompress(g);assert sha(g)==entry['gzipSHA256']and sha(b)==entry['sha256'];previous=json.loads(b)
for effect in ['burst','bulbs']:assert x[effect]['hash']==previous[effect]['hash']
assert x['centerBefore']==x['centerAfter']['hash']and all(not x['centerAfter'][k]['active']for k in ['state','burst','bulbs'])
assert all(not x['cancelResources'][-1][k]for k in ['cached','cachedBytes','resident','pending','active','ticket','preparingSurfaceBytes','ownedPlanBytes'])
routing=data['02'];assert routing['centerInactive']and [c['kind']for c in routing['cases']]==['manual','locked']
for c in routing['cases']:assert c['preserved']and c['finalHash']==c['uiHash']and c['activeBitmapUnchanged']and c['code']and c['areaOpened']and c['detailOpened']
before=json.loads((B/'domino-product-reuse-routing-before82ar02.json').read_text());assert before=={'manualTimeNeeds':True,'activeTimeNeeds':True}
# Four frozen AQ modules are exact. Controller differs only in the reviewed routing predicate.
core=productBytes(R/'src/11zz13_domino_core82.js').decode();ui=productBytes(R/'src/12_ui.js').decode()
for name in ['model82aq.js','owner82aq.js','runtime82aq.js','session82aq.js']:assert core.count((Q/name).read_text())==1,name
old="||planBinding?.needs(plan)||Object.hasOwn(opt,'dominoFrameTicket')";new="||(plan.cuts||[]).some(c=>c.layout==='dominoes'&&c.placementTrajectory?.sourceAdapter===ADAPTER_ID)||Object.hasOwn(opt,'dominoFrameTicket')";controller=(Q/'controller82aq.js').read_text();assert controller.count(old)==1 and core.count(controller.replace(old,new))==1
assert ui.count((Q/'font-phase.js').read_text())==1 and ui.count((Q/'font-wait-method.js').read_text().rstrip())==1
baseline=json.loads((B/'domino-product-ui82ao-before-performance82ap/pins.json').read_text());changed=[]
for p in baseline:
 b=productBytes(Path(p['path']))
 if sha(b)!=p['sha256']:changed.append(Path(p['path']).relative_to(R).as_posix())
 v=Path(p['snapshot']).read_bytes();assert len(v)==p['bytes']and sha(v)==p['sha256']
assert sorted(changed)==['en/index.html','index.html','src/11zz13_domino_core82.js','src/12_ui.js']
export=(R/'src/11_export.js').read_text()
for signature in ['J.exportMP4 = async','J.exportPNGZip = async','J.planForAE =']:
 a=export.index(signature);z=export.index('\n',a);assert export[z+1:].lstrip().startswith('J.assertPlanOutputSupported(plan);')
for p in maps:
 b=Path(p['snapshot']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256']
print(json.dumps({'checked':True,'historicalProductSnapshots':bool(productSnapshots),'runs':runs,'productTimings':[{'label':c['label'],'wallMs':c['wallMs'],'maxStepMs':c['state']['maxStepMs'],'nativeSamples':c['nativeSamples'],'shiftedSamples':c['shiftedSamples']}for c in cases],'AQResultsMatch':True,'oldAuthorityRefused':4,'outputEntrypointsRefused':4,'otherEffectsAndCenterPassed':True,'mixedPreservedLegacyCases':2,'finalPrivateResourcesZero':True,'changedFromPreservedAO':changed,'coldLimitation':'AQ cold17838.7ms/max1157ms remains unresolved; AR product cold6888.9ms/max157.3ms is a separate historical single observation'},indent=2))
