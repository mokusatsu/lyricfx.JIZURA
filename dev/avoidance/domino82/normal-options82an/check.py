"""Read-only normal-option comparison and proof-chain checker; no browser/media generation."""
from pathlib import Path
import json,gzip,hashlib,struct,sys
B=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent;R=U.parents[3];sha=lambda b:hashlib.sha256(b).hexdigest();maps=[p for m in sorted(B.glob('domino-normal-options82an-sourceprep*/pins.json'))for p in json.loads(m.read_text())]
def pin(p):
 b=Path(p['path']).read_bytes()
 if len(b)==p['bytes']and sha(b)==p['sha256']:return False
 candidates=[x for x in maps if all(x[k]==p[k]for k in ['path','bytes','sha256'])];assert candidates,p['path'];b=Path(candidates[0]['snapshot']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256'];return True
def dec(x):
 if isinstance(x,dict):return struct.unpack('>d',bytes.fromhex(x['$f64']))[0]if set(x)=={'$f64'}else{k:dec(v)for k,v in x.items()}
 if isinstance(x,list):return[dec(v)for v in x]
 return x
def bits(x):
 if isinstance(x,(int,float))and not isinstance(x,bool):return struct.pack('>d',float(x)).hex()
 if isinstance(x,dict):return{k:bits(v)for k,v in x.items()}
 if isinstance(x,list):return[bits(v)for v in x]
 return x
runs=[];data={};encoded={}
for i,complete,nraw in [(1,False,3),(2,True,4)]:
 d=B/('domino-normal-options-actual82an%02d'%i);r=json.loads((d/'result.json').read_text());assert r['complete']==complete and len(r['raw'])==nraw and r['postPinsUnchanged']and r['mediaOutputs']==r['publicChecks']==0
 historical=sum(pin(p)for p in r['pins']);raw={};raw0={}
 for p in r['raw']:
  g=(d/p['file']).read_bytes();b=gzip.decompress(g);assert len(g)==p['gzipBytes']and sha(g)==p['gzipSHA256']and len(b)==p['jsonBytes']and sha(b)==p['sha256']and len(b)<=8*1024**2;raw0[p['file'][:-8]]=json.loads(b);raw[p['file'][:-8]]=dec(json.loads(b))
 assert sum(p['jsonBytes']for p in r['raw'])<=128*1024**2 and sum(p['gzipBytes']for p in r['raw'])<=32*1024**2
 h=json.loads((B/(d.name+'-runtime')/'host.json').read_text());assert h['complete']==complete and h['probeExit']==(0 if complete else 1)and h['normalPageClosureConfirmed']and h['debugPortClosed']and h['pages']['created']==len(h['pages']['closed'])==3 and h['cleanup']['complete']and all(not h['cleanup'][k]for k in ['remaining','signals','ownershipFailures','signalFailures'])
 for p in h['runtimeSources']:pin(p)
 prep=raw['product-ui'];assert prep['phase']=='formal-ready'and prep['before']['bitmapUnchanged']and prep['before']['stats']['nativeCompiles']==0 and prep['prepare']['stats']['nativeCompiles']==1 and prep['prepare']['stats']['destinationSamples']==250
 assert prep['final']['cuts'][0]['placementTrajectory']['sourceAdapter']=='domino_prepared82am'
 if i==1:
  assert r['errors']and raw['frames']['failure']['code']=='DOMINO82AN_BAD_FRAME_STATE';raw['frames']=raw['frames']['failure']['details']['partial'];raw0['frames']=raw0['frames']['failure']['details']['partial']
 else:assert not r['errors']
 data[i]=raw;encoded[i]=raw0;runs.append({'run':i,'complete':complete,'pins':len(r['pins']),'historicalPinMatches':historical,'raw':nraw,'jsonBytes':sum(p['jsonBytes']for p in r['raw']),'normalWindowsClosed':3,'cleanupComplete':True})
a=data[1]['frames'];assert len(a['pairs'])==16 and not a['rejects'];modeOrder=['baseline','post-only','filter-only','normal'];postCount=0;paints=0
for i,t in enumerate([.2,0,1.34,1.75]):
 group=a['pairs'][i*4:i*4+4];assert [p['mode']for p in group]==modeOrder and all(p['t']==t for p in group)
 baseline=group[0]
 for j,p in enumerate(group):
  assert p['hash']==baseline['hash']and p['sourceTraceHash']==baseline['sourceTraceHash'];assert p['prepared']=={'matrixUnchanged':True,'stateChanges':[]}and p['prefix']['wrappersRestored']
  assert p['filterFlags']==([j>=2]*3 if t!=1.75 else []) # actual filterOK was true
  assert (p['post']is not None)==(j in [1,3]);paints+=int(p['paintCount'])
  if p['post']:
   postCount+=1;q=p['post'];assert q['guarded']and q['sourceAdapter']=='domino_prepared82am'and q['bitmapUnchanged']and q['stateUnchanged']and q['beforeHash']==q['afterHash'];assert q['entry']['alpha']==1 and q['entry']['composite']=='source-over'and q['entry']['filter']=='none'and q['entry']['matrix']==[1,0,0,1,0,0];assert q['paints']==[{'args':[0,0,480,270],'gradient':True,'stops':[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,0)']],'alpha':1,'composite':'source-over','filter':'none'}]
  if j==0:
   trace=[{k:v for k,v in p0.items()if k!='allowFilter'}for p0 in encoded[1]['frames']['pairs'][i*4]['passes']];assert sha(json.dumps(trace,ensure_ascii=False,separators=(',',':')).encode())==p['sourceTraceHash']
assert postCount==8 and paints==264
b=data[2]['frames'];assert b['residualOnly']and len(b['pairs'])==1;new=b['pairs'][0];old=a['pairs'][3]
for k in ['hash','sourceTraceHash','paintCount','prepared','filterFlags','post']:assert bits(new[k])==bits(old[k]),k
assert [(r['label'],r['code'],r['bitmapUnchanged'])for r in b['rejects']]==[(kind+'-'+comp,'DOMINO82AN_POST_STATE',True)for comp in ['copy','multiply']for kind in ['frame','post']]
assert len(b['scopeRefusals'])==7 and all(not q['allowed']for q in b['scopeRefusals']);assert b['clip']['beforeHash']==b['clip']['afterHash']and b['clip']['stateUnchanged'];assert b['nonTarget']['needs']==b['nonTarget']['intercepted']==False and b['nonTarget']['actualHash']==b['nonTarget']['stockHash']
release=data[2]['release'];assert [(q['label'],q['code'])for q in release['negatives']]==[('decoded-alias','STALE_PLACEMENT_PLAN'),('old-generation','DOMINO82P_GENERATION_STALE'),('cancelled-authority','BULBS80T_OWNED_PLAN_REQUIRED')];assert all(q['bitmapUnchanged']and q['compileDelta']==0 for q in release['negatives']);assert release['canvasReleased']and all(not release['stats'][k]for k in ['resident','pending','active','ticket','preparingSurfaceBytes','ownedPlanBytes'])and not release['api']['prepared']and not release['api']['staged']
# The source change after successful 16-frame comparisons is exactly one bitmap-preflight state check.
d1=B/'domino-normal-options-source82an01';d2=B/'domino-normal-options-source82an02';guard='if(opt.noPost!==true)NS.assertBeforePost(plan,opt,renderer,ctx);';s1=(d1/'controller82am.js').read_text();s2=(d2/'controller82am.js').read_text();assert s2.count(guard)==1 and s2.replace(guard,'')==s1
assert(d1/'candidate-ja.html').read_bytes()==(d2/'candidate-ja.html').read_bytes()
html=(d2/'candidate-ja.html').read_text();assert html.count('const scoped82an=')==1 and html.count('if(scoped82an)J.placement.dominoNormalPostScope82an.assertBeforePost')==1 and 'A.dominoPostScope82am?.neutralMissingGlow?.(plan)'in html and 'dominoNormalPostScope82an?.neutralMissingGlow'not in html
source=(R/'src/09_render.js').read_text();start=source.index('  post(ctx, plan, t, tq, step, sc, scale, opt, allowFilter) {');end=source.index('\n}\n/* beat context',start);method=source[start:end];body=method[method.index('{')+1:method.rfind('}')];start=html.index('    const run82an=()=>{');end=html.index('\n    };\n    return scoped82an',start);assert html[start+len('    const run82an=()=>{'):end]==body
for p in maps:
 b=Path(p['snapshot']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256']
print(json.dumps({'checked':True,'runs':runs,'comparisonFrames':16,'oldVersionSuccessfulSourcePaints':264,'newGuardNormalFrames':1,'actualFramePostIdentityCalls':9,'clippedPostIdentityCalls':1,'badCompositionBitmapRefusals':4,'scopeRefusals':7,'oldNormalAuthorityRefusals':3,'postBodyUnchanged':True,'strictMissingGlow82amRetained':True,'scope':'480 input normal options only; native X clip retained, not all-direction stage-clear; UI/general inputs/performance unqualified'},indent=2))
