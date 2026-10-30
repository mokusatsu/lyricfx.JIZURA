"""Read saved hashes and numerical assertions only; never launches a browser."""
from pathlib import Path
from fractions import Fraction as F
import json,gzip,hashlib,struct,sys
B=Path(sys.argv[1]).resolve();D=B/'burst-normal-options-actual83bc01';S=B/'burst-normal-options-source83bc01';U=Path(__file__).resolve().parent
sha=lambda b:hashlib.sha256(b).hexdigest()
def decode(x):
 if isinstance(x,dict):
  if list(x)==['$f64']:return struct.unpack('>d',bytes.fromhex(x['$f64']))[0]
  return{k:decode(v)for k,v in x.items()}
 if isinstance(x,list):return[decode(v)for v in x]
 return x
def pin(p):
 b=Path(p['path']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256'],p['path']
r=json.loads((D/'result.json').read_text());assert r['complete']and r['postPinsUnchanged']and not r['errors']and r['mediaOutputs']==r['publicChecks']==0
for p in r['pins']:pin(p)
raw={}
for p in r['raw']:
 g=(D/p['file']).read_bytes();b=gzip.decompress(g);assert len(g)==p['gzipBytes']and sha(g)==p['gzipSHA256'];assert len(b)==p['jsonBytes']and sha(b)==p['sha256'];assert len(b)<=8*1024**2;raw[p['file'][:-8]]=json.loads(b)
assert sum(p['jsonBytes']for p in r['raw'])<=128*1024**2 and sum(p['gzipBytes']for p in r['raw'])<=32*1024**2
assert raw['dependency-preflight']['ready']and not raw['dependency-preflight']['ownerCreated']and all(x['present']for x in raw['dependency-preflight']['rows'])
s=raw['owned-ui'];assert s==r['summary'];assert s['formal']['admitted']and s['formal']['postNeeds']and s['filterOK']
old=json.loads(gzip.decompress((B/'burst-ui-owned83bb-actual08/owned-ui.json.gz').read_bytes()))
for k in ['normalized','circle','clockCounts']:assert s['input'][k]==old['input'][k],k
ready=decode(s['prepare']['ready']);proof=ready['proof'];tr=decode(s['formal']['trajectory'])
assert ready['counts']=={'states':112,'own':250,'supports':3392,'glyphs':964,'zeroReplayOwn':250};assert proof['checkedOwn']==250 and proof['checkedSupports']==3392 and proof['peak']<=8388608
prior=decode(old['prepare']['ready']);assert ready['peak']==proof['peak']==prior['peak']+140
for k in ['counts','done']:assert ready[k]==prior[k]
assert {k:v for k,v in proof.items()if k!='peak'}=={k:v for k,v in prior['proof'].items()if k!='peak'}
assert tr['sourceAdapter']=='burst_prepared83av'and tr['sourceProof']['viewport']==s['viewport']and tr['sourceProof']['deviceDelta']==proof['delta']and tr['sourceProof']['deviceCircle']==proof['circle']
b=proof['selection']['sourceUnion'];dx,dy=map(F,proof['delta']);x0,x1=F(b['x0'])+dx,F(b['x1'])+dx;y0,y1=F(b['y0'])+dy,F(b['y1'])+dy;c=proof['circle'];cx,cy,rr=F(c['cx']),F(c['cy']),F(c['r'])+F(c['margin']);assert 0<=x0<=x1<=640 and 0<=y0<=y1<=360;nx=max(x0,min(cx,x1));ny=max(y0,min(cy,y1));assert(nx-cx)**2+(ny-cy)**2>rr**2
assert len(s['pairs'])==16
for mi,mode in enumerate(['baseline','post-only','filter-only','normal']):
 for i,t in enumerate([0,.1,.5,4/3]):
  p=s['pairs'][mi*4+i];base=s['pairs'][i];assert p['mode']==mode and p['time']==t and p['preflightStateUnchanged'];assert p['hash']==base['hash']and p['sourceTraceHash']==base['sourceTraceHash'];assert p['sourcePaints']==[31,53,52,35][i];assert all(v==(mi>=2)for v in p['sourceFilterFlags'])
  if mode in ['baseline','filter-only']:assert p['post']is None
  else:
   q=p['post'];assert q['guarded']and q['sourceAdapter']=='burst_prepared83av'and q['bitmapUnchanged']and q['stateUnchanged']and q['beforeHash']==q['afterHash'];e=q['entry'];assert e=={'alpha':1,'composite':'source-over','filter':'none','shadowBlur':0,'shadowOffsetX':0,'shadowOffsetY':0,'shadowColor':'rgba(0, 0, 0, 0)','matrix':[1,0,0,1,0,0]};assert q['paints']==[{'args':[0,0,640,360],'gradient':True,'stops':[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,0)']],'alpha':1,'composite':'source-over','filter':'none'}]
assert len(s['scopeRefusals'])==6 and all(not x['allowed']for x in s['scopeRefusals'])
assert [(x['kind'],x['code'])for x in s['rejects']]==[('frame-copy','BURST83BB_FRAME_STATE_DRIFT'),('post-copy','BURST83BC_POST_STATE'),('frame-multiply','BURST83BB_FRAME_STATE_DRIFT'),('post-multiply','BURST83BC_POST_STATE'),('old-after-circle-change','BULBS80T_OWNED_PLAN_REQUIRED')];assert all(x['bitmapUnchanged']for x in s['rejects'])
assert s['clip']['stateUnchanged']and s['clip']['beforeHash']==s['clip']['afterHash'];n=s['nonTarget'];assert not n['needs']and not n['intercepted']and n['actualHash']==n['stockHash']
assert s['released']['owner']=={'models':0,'activeFrame':False,'preparing':False};assert not s['released']['ready']and not s['released']['preparing']and s['released']['formal']['bindings']==s['released']['formal']['certificates']==0
# The only Renderer.post change wraps the byte-identical previous method body.
candidate=(S/'candidate-ja.html').read_text();before=(B/'burst-ui-owned-source83bb08/candidate-ja.html').read_text();start=candidate.index('  post(ctx, plan, t, tq, step, sc, scale, opt, allowFilter) {');end=candidate.index('\n}\n/* beat context',start);a=before.index('  post(ctx, plan, t, tq, step, sc, scale, opt, allowFilter) {');z=before.index('\n}\n/* beat context',a);method=before[a:z];assert (S/'stock-post-reference83bc.js').read_text()=='window.stockPostReference83bc=({'+method.strip()+'}).post;\n';body=method[method.index('{')+1:method.rfind('}')];wrapped=candidate[start:end];assert body in wrapped and wrapped.count(body)==1;assert 'if(scoped83bc)J.placement.burstNormalPostScope83bc.assertBeforePost' in wrapped;assert candidate[:start]+method+candidate[end:]==before
assert 'burstPostScope83bb?.neutralMissingGlow' in candidate and 'burstNormalPostScope83bc?.neutralMissingGlow'not in candidate
for name in ['new-root83.js','new-compose83.js','new-geometry83.js','new-scalar-support83.js','new-clock-compiler83.js','destination-geometry83.js','post-scope83bb.js','prepared-handoff83.js','renderer-time83.js']:
 assert(S/name).read_bytes()==(B/'burst-ui-owned-source83bb08'/name).read_bytes(),name
assert (S/'private-controller83.js').read_text().replace('const out=window.inspectBurstPaint83bc?window.inspectBurstPaint83bc(env,draw):draw();p.done=true;','const out=draw();p.done=true;')==(U/'private-controller83.js').read_text()
h=json.loads((B/(D.name+'-runtime')/'host.json').read_text());assert h['complete']and h['probeExit']==0 and h['normalPageClosureConfirmed']and h['debugPortClosed']and h['pages']['created']==len(h['pages']['closed'])==3
assert h['cleanup']['complete']and all(not h['cleanup'][k]for k in ['remaining','signals','ownershipFailures','signalFailures'])and all(x['exit']==0 for x in h['cleanup']['reaped'])
for p in h['runtimeSources']:pin(p)
manifests=sorted(B.glob('burst-normal-options83bc-sourceprep*/pins.json'));assert manifests
for manifest in manifests:
 for p in json.loads(manifest.read_text()):
  b=Path(p['snapshot']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256']
for p in json.loads(manifests[-1].read_text()):pin(p)
print(json.dumps({'checked':True,'pins':len(r['pins']),'rawRecords':len(r['raw']),'jsonBytes':sum(p['jsonBytes']for p in r['raw']),'gzipBytes':sum(p['gzipBytes']for p in r['raw']),'pairs':16,'actualTargetPosts':8,'unchangedStockBody':True,'strict83bbGlowHelperUnchanged':True,'ownerCounts':ready['counts'],'prepareMs':s['prepare']['elapsedMs'],'maxStepMs':s['prepare']['maxStepMs'],'released':s['released'],'normalPagesClosed':3,'cleanupComplete':True,'scope':'restricted source-only normal-option admission; no product UI or full-input/performance claim'},indent=2))
