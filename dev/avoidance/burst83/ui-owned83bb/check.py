"""Saved source/raw/lifecycle and genuine formal-gate checks; never launches Qt or imports models."""
from pathlib import Path
from fractions import Fraction as F
import json,gzip,hashlib,struct,sys
B=Path(sys.argv[1]).resolve();sha=lambda b:hashlib.sha256(b).hexdigest();snapshots={}
for m in sorted(B.glob('burst-ui-owned83bb-sourceprep*/pins.json')):
 for p in json.loads(m.read_text()):snapshots.setdefault(p['path'],[]).append(Path(p['snapshot']))
def decode(x):
 if isinstance(x,dict):
  if list(x)==['$f64']:return struct.unpack('>d',bytes.fromhex(x['$f64']))[0]
  return{k:decode(v)for k,v in x.items()}
 if isinstance(x,list):return[decode(v)for v in x]
 return x
def bits(x):
 if isinstance(x,(int,float))and not isinstance(x,bool):return{'f64':struct.pack('>d',x).hex()}
 if isinstance(x,dict):return{k:bits(v)for k,v in x.items()}
 if isinstance(x,list):return[bits(v)for v in x]
 return x
trials=[];records={}
for suffix in ['01','02','05','06','07','08']:
 D=B/('burst-ui-owned83bb-actual'+suffix);h=json.loads((B/(D.name+'-runtime')/'host.json').read_text());assert h['cleanup']['complete']and not any(h['cleanup'][k]for k in ['remaining','signals','ownershipFailures','signalFailures']);assert h['normalPageClosureConfirmed']and h['debugPortClosed']and h['pages']['created']==3 and len(h['pages']['closed'])==3
 for p in h['runtimeSources']:
  b=Path(p['path']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256']
 if suffix=='01':
  assert not (D/'result.json').exists()and h['cleanup']['roots']['node']['exit']==1;trials.append({'output':str(D),'complete':False,'stage':'builder uniqueness failure then stale-pin producer startup refusal; no product gate executed','rawRecords':0,'normalPagesClosed':3,'ownedCleanupComplete':True});continue
 d=json.loads((D/'result.json').read_text());differences=[];raw={}
 for p in d['pins']:
  q=Path(p['path']);match=lambda f:f.is_file()and f.stat().st_size==p['bytes']and sha(f.read_bytes())==p['sha256']
  if not match(q):
   q=next(f for f in snapshots.get(str(q),[])if match(f));differences.append({'recordedPath':p['path'],'executedSnapshot':str(q)})
  assert match(q)
 for r in d['raw']:
  g=(D/r['file']).read_bytes();b=gzip.decompress(g);assert len(g)==r['gzipBytes']and sha(g)==r['gzipSHA256'];assert len(b)==r['jsonBytes']and sha(b)==r['sha256'];assert len(b)<=8*1024**2;raw[r['file'][:-8]]=decode(json.loads(b))
 assert sum(r['jsonBytes']for r in d['raw'])<=128*1024**2 and sum(r['gzipBytes']for r in d['raw'])<=32*1024**2 and d['postPinsUnchanged']and d['mediaOutputs']==0 and d['publicChecks']==0
 if suffix=='08':assert d['complete']and not d['errors']
 else:
  assert not d['complete']and d['errors'];failure=raw['owned-ui']['failure'];assert ['sample','BURST83Z_CUT_PROFILE','BURST83Q_PLAN_SCOPE','BURST83N_PROVEN_ZERO_SURFACE'][['02','05','06','07'].index(suffix)]in failure['message']
 if suffix in ['05','06','07','08']:
  pre=raw['dependency-preflight'];assert pre['ready']and pre['ownerCreated']is False and all(r['present']for r in pre['rows'])
 records[suffix]=raw;trials.append({'output':str(D),'resultSHA256':sha((D/'result.json').read_bytes()),'complete':d['complete'],'pins':len(d['pins']),'rawRecords':len(d['raw']),'currentPinDifferences':differences,'jsonBytes':sum(r['jsonBytes']for r in d['raw']),'gzipBytes':sum(r['gzipBytes']for r in d['raw']),'normalPagesClosed':3,'ownedCleanupComplete':True})
partial=records['07']['owned-ui']['failure']['details']['partial'];assert partial['formal']['admitted']and partial['formal']['glowMissing']and partial['formal']['stats']['formal']['bindings']==1 and not partial['frames']
r=records['08']['owned-ui'];old=decode(json.loads(gzip.decompress((B/'burst-ui-proof83ba-actual02/input-640.json.gz').read_bytes())));compiled=decode(json.loads(gzip.decompress((B/'burst-ui-proof83ba-actual02/compiled-640.json.gz').read_bytes())))
for key in ['editable','normalized','viewport','circle']:assert bits(r['input'][key])==bits(old[key]),key
assert r['originalGlowMissing']and r['formal']['admitted']and r['formal']['glowMissing'];ready=r['prepare']['ready'];proof=ready['proof'];tr=r['formal']['trajectory'];assert ready['counts']=={'states':112,'own':250,'supports':3392,'glyphs':964,'zeroReplayOwn':250}and proof['checkedOwn']==250 and proof['checkedSupports']==3392 and proof['peak']<=8388608
assert bits(proof['circle'])==bits(compiled['circle'])and bits(proof['delta'])==bits(compiled['chosen']['delta'])and bits(proof['selection']['sourceUnion'])==bits(compiled['sourceUnion'])and proof['selection']['side']=='left'
# Whole sourceUnion remains strictly clear under the selected device translation.
b=proof['selection']['sourceUnion'];dx,dy=map(F,proof['delta']);x0,x1=F(b['x0'])+dx,F(b['x1'])+dx;y0,y1=F(b['y0'])+dy,F(b['y1'])+dy;c=proof['circle'];cx,cy,rr=F(c['cx']),F(c['cy']),F(c['r'])+F(c['margin']);assert 0<=x0<=x1<=640 and 0<=y0<=y1<=360;nx=max(x0,min(cx,x1));ny=max(y0,min(cy,y1));assert (nx-cx)**2+(ny-cy)**2>rr**2
assert tr['sourceProof']['viewport']==r['viewport']and bits(tr['sourceProof']['deviceCircle'])==bits(proof['circle'])and bits(tr['sourceProof']['deviceDelta'])==bits(proof['delta']);unit=tr['units'][0]['segments'][0];scale=r['viewport']['scale'];assert bits(unit['from'])==bits([x/scale for x in proof['delta']])and unit['from']==unit['to']and unit['end']==old['normalized']['duration']
expectedRange=[-1/60,old['normalized']['cuts'][0]['end']+.6+2/60+1.6/24+.06+.01];assert all(abs(a-b)<1e-15 for a,b in zip(tr['evaluationRange'],expectedRange))
assert [x['time']for x in r['frames']]==[0,.1,.5,4/3]and all(x['preflightStateUnchanged']and len(x['hash'])==64 for x in r['frames'])
assert [x['kind']for x in r['prefixExceptions']]==['before-replay','after-prepare']and all(x['code']=='TEST_PREFIX'and x['bitmapUnchanged']and x['stateUnchanged']and not x['activeFrame']for x in r['prefixExceptions']);assert r['clipPreserved']['hash']==r['clipPreserved']['controlHash']
assert [(x['label'],x['error'])for x in r['rejects']]==[('unprepared','BULBS80T_OWNED_PLAN_REQUIRED'),('alias','STALE_PLACEMENT_PLAN'),('normal-post','BURST83AG_FRAME_SCOPE'),('viewport','BURST83AG_CONTEXT'),('changed-circle-old','BULBS80T_OWNED_PLAN_REQUIRED'),('restored-old','BULBS80T_OWNED_PLAN_REQUIRED')];assert all(x['unchanged']and x['before']==x['after']for x in r['rejects'])
for name in ['cancelled','released']:
 s=r[name];assert not s['ready']and not s['preparing']and s['formal']['bindings']==0 and s['formal']['certificates']==0
assert r['released']['owner']=={'models':0,'activeFrame':False,'preparing':False}
# New compiler/root/sampler and original source body remain the accepted83ba input path.
D=B/'burst-ui-owned-source83bb08';previous=B/'burst-ui-proof-source83ba02'
for name in ['new-root83.js','new-compose83.js','new-geometry83.js','new-scalar-support83.js','new-clock-compiler83.js','destination-geometry83.js']:
 assert(D/name).read_bytes()==(previous/name).read_bytes(),name
candidate=(D/'candidate-ja.html').read_text();candidate=candidate.replace("||(plan.events||[]).some(e=>!['chroma','shake'].includes(e.type))||(plan.style?.glow!==0&&!(A.burstPostScope83bb?.neutralMissingGlow?.(plan)===true));","||(plan.events||[]).some(e=>!['chroma','shake'].includes(e.type))||plan.style?.glow!==0;");candidate=candidate.replace('\n    if(burst83adFrame)window.afterBurstPrepare83bb?.();','');assert candidate==(previous/'candidate-ja.html').read_text()
canonical=Path(__file__).with_name('private-controller83.js').read_text();test=(D/'private-controller83.js').read_text().replace('window.beforeBurstReplay83bb?.();','');assert canonical==test
print(json.dumps({'checked':True,'trials':trials,'formal07Preserved':True,'inputUnchangedFrom83ba':True,'ownerCounts':ready['counts'],'deviceDelta':proof['delta'],'logicalDelta':unit['from'],'trajectoryRange':tr['evaluationRange'],'frames':r['frames'],'prefixExceptions':r['prefixExceptions'],'clipPreserved':r['clipPreserved'],'rejects':r['rejects'],'released':r['released'],'prepareMs':r['prepare']['elapsedMs'],'maxStepMs':r['prepare']['maxStepMs'],'peakSerializedBytes':proof['peak'],'finalizeMs':r['finalizeMs'],'scope':'genuine private UI projection/formal current-frame gate at640 fast/noPost; source-only, no product registration or normal-post/other input certification'},ensure_ascii=False,indent=2))
