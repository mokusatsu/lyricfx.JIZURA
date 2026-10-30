"""Independent saved-source/hash/clock/coverage/Fraction check; no browser/network/media."""
from pathlib import Path
from fractions import Fraction as F
import json,gzip,hashlib,struct,math,sys
B=Path(sys.argv[1]).resolve();sha=lambda b:hashlib.sha256(b).hexdigest();saved=json.loads((B/'burst-ui-proof83ba-harness-recovery01/map.json').read_text());snapshots={x['path']:Path(x['snapshot'])for x in saved}
def decode(x):
 if isinstance(x,dict):
  if list(x)==['$f64']:return struct.unpack('>d',bytes.fromhex(x['$f64']))[0]
  return{k:decode(v)for k,v in x.items()}
 if isinstance(x,list):return[decode(v)for v in x]
 return x
def bits(x):
 if isinstance(x,(float,int)) and not isinstance(x,bool):return{'bits':struct.pack('>d',x).hex()}
 if isinstance(x,dict):return{k:bits(v)for k,v in x.items()}
 if isinstance(x,list):return[bits(v)for v in x]
 return x
trials=[];allRaw={}
for name in ['burst-ui-input83az-actual01','burst-ui-proof83ba-actual01','burst-ui-proof83ba-actual02']:
 D=B/name;d=json.loads((D/'result.json').read_text());raw={};differences=[]
 for p in d['pins']:
  q=Path(p['path']);match=lambda q:q.is_file() and q.stat().st_size==p['bytes'] and sha(q.read_bytes())==p['sha256']
  if not match(q):
   q=snapshots[p['path']];assert match(q);differences.append({'recordedPath':p['path'],'executedSnapshot':str(q)})
 for r in d['raw']:
  g=(D/r['file']).read_bytes();b=gzip.decompress(g);assert len(g)==r['gzipBytes'] and sha(g)==r['gzipSHA256'];assert len(b)==r['jsonBytes'] and sha(b)==r['sha256'];assert len(b)<=8*1024**2;raw[r['file'][:-8]]=decode(json.loads(b))
 assert sum(x['jsonBytes']for x in d['raw'])<=128*1024**2 and sum(x['gzipBytes']for x in d['raw'])<=32*1024**2
 assert d['postPinsUnchanged'] and d['mediaOutputs']==0 and d['publicChecks']==0
 if name=='burst-ui-input83az-actual01':assert not d['complete'] and 'BURST83AY_SUPPORT_LIMIT' in d['errors'][0]['message']
 elif name.endswith('actual01'):assert not d['complete'] and 'Expected values to be strictly equal' in d['errors'][0]['message'] and 'proof-640' not in raw
 else:assert d['complete'] and not d['errors']
 h=json.loads((B/(name+'-runtime')/'host.json').read_text());assert h['cleanup']['complete'] and not any(h['cleanup'][k]for k in ['remaining','signals','ownershipFailures','signalFailures']);assert h['normalPageClosureConfirmed'] and h['debugPortClosed'] and h['pages']['created']==3 and len(h['pages']['closed'])==3
 trials.append({'output':str(D),'resultSHA256':sha((D/'result.json').read_bytes()),'complete':d['complete'],'pins':len(d['pins']),'rawRecords':len(d['raw']),'currentPinDifferences':differences,'jsonBytes':sum(x['jsonBytes']for x in d['raw']),'gzipBytes':sum(x['gzipBytes']for x in d['raw']),'normalPagesClosed':3,'ownedCleanupComplete':True});allRaw[name]=raw
old=allRaw['burst-ui-input83az-actual01'];first=allRaw['burst-ui-proof83ba-actual01'];raw=allRaw['burst-ui-proof83ba-actual02']
for name in ['burst-ui-proof83ba-actual01','burst-ui-proof83ba-actual02']:assert gzip.decompress((B/name/'input-640.json.gz').read_bytes())==gzip.decompress((B/'burst-ui-input83az-actual01/input-640.json.gz').read_bytes())
for key in ['counts','sourceUnion','viewport','chosen','circle']:assert bits(raw['compiled-640'][key])==bits(old['compiled-640'][key])
for module in ['new-root83.js','new-compose83.js','new-geometry83.js','new-scalar-support83.js','new-clock-compiler83.js','destination-geometry83.js','new-observer.js']:
 assert (B/'burst-ui-proof-source83ba02'/module).read_bytes()==(B/'burst-ui-input-source83az01'/module).read_bytes(),module
assert bits(first['diagnosis-640'])==bits(raw['diagnosis-640']);diag=raw['diagnosis-640'];f=diag['firstOwner'];assert diag['failureClass']=='empty' and f['n']==0 and f['pass']=='B' and f['time']==0 and f['scalar']['q']==0 and f['scalar']['out']==1
assert f['entrySupportCount']==f['entryGlyphCount']==f['replaySupportCount']==0
w=first['empty-witness-640'];assert w['renderedOwn'] and w['clockMatched'] and w['positiveSupports']==0 and w['records']==[] and w['supports']==[] and w['scalar']['q']==0
inp=raw['input-640'];compiled=raw['compiled-640'];proof=raw['proof-640'];paint=raw['paint-640'];clock=inp['clock'];expected=[(s['n'],p['pass'])for s in clock['states']for p in s['passes']if p['active']]
assert len(expected)==len(set(expected))==250 and [(r['n'],r['pass'])for r in proof['rows']]==expected and proof['own']==250 and compiled['counts']=={'states':112,'own':250,'supports':3392,'glyphs':964,'zeroReplayOwn':250}
assert proof['supports']==sum(len(r['supports'])for r in proof['rows'])==3392 and proof['emptyCount']==8 and proof['chunkedCount']==0 and proof['peak']<=8388608 and not proof['framePermission']
c=compiled['circle'];vw=compiled['viewport'];cx,cy,rr=F(c['cx']),F(c['cy']),F(c['r'])+F(c['margin']);checked=0;empties=[]
def clear(b):
 x0,y0,x1,y1=map(F,[b[k]for k in ['x0','y0','x1','y1']]);assert 0<=x0<=x1<=F(vw['width']) and 0<=y0<=y1<=F(vw['height']);nx=max(x0,min(cx,x1));ny=max(y0,min(cy,y1));assert (nx-cx)**2+(ny-cy)**2>rr**2
for row in proof['rows']:
 state=clock['states'][int(row['n'])];own=next(x for x in state['passes']if x['pass']==row['pass'] and x['active']);assert row['time']==state['firstTime']
 for key,src in [('t','tp'),('lt','lt'),('ltb','ltb'),('step','step')]:assert bits(row['clock'][key])==bits(own[src])
 ev=row['evaluation'];n=len(row['supports']);assert ev['passed'] and ev['checked']==n and ev['failureCount']==0 and not ev['failures'];assert ev['coverage']=={'total':n,'unique':n,'duplicates':0,'omitted':0}
 if not n:
  assert ev['empty'] and not ev['batches'];w=row['emptyWitness'];assert w['renderedOwn'] and w['clockMatched'] and w['positiveSupports']==0 and w['records']==[] and w['supports']==[] and w['scalar']['q']==0
  assert {k:v for k,v in w['clock'].items()if k!='pass'}==row['clock'] and w['clock']['pass']==row['pass'];empties.append([row['n'],row['pass']])
 else:
  assert not ev['empty'] and row['emptyWitness'] is None;covered=[]
  for batch in ev['batches']:
   start,count=int(batch['start']),int(batch['count']);assert 1<=count<=128 and batch['checked']==count and batch['failureCount']==0;covered.extend(range(start,start+count))
  assert covered==list(range(n))
 for support in row['supports']:clear(support['bounds']);checked+=1
paintSupports=0;paintCalls=0;paintOwn=0
assert len(paint['frames'])==6 and paint['selectedNs']==[6,30,80]
for frame in paint['frames']:
 n=int(frame['n']);assert frame['time']==clock['preimages'][n][frame['endpoint']+'Time'];state=clock['states'][n];assert [r['pass']for r in frame['rows']]==[p['pass']for p in state['passes']if p['active']]
 for row in frame['rows']:
  own=next(p for p in state['passes']if p['pass']==row['pass']);paintOwn+=1;paintCalls+=len(row['records']);assert row['clock']['t']==own['tp'] and row['clock']['lt']==own['lt'] and row['clock']['ltb']==own['ltb'] and row['clock']['step']==own['step']
  union=row['replayUnion']
  for support in row['supports']:
   b=support['bounds'];assert union and F(b['x0'])>=F(union['x0']) and F(b['y0'])>=F(union['y0']) and F(b['x1'])<=F(union['x1']) and F(b['y1'])<=F(union['y1']);clear(b);paintSupports+=1
assert raw['cancel-640']['model'] is False and raw['cancel-640']['canvas'] is False and raw['cancel-640']['authority'] is False
print(json.dumps({'checked':True,'trials':trials,'inputBytesIdenticalTo83az':True,'diagnosis':diag,'allOwner':{'states':112,'own':250,'supportsFractionChecked':checked,'emptyOwn':empties,'chunkedOwn':0,'duplicates':0,'omissions':0},'actualPaint':{'frames':6,'own':paintOwn,'paintCalls':paintCalls,'positiveSupportsFractionChecked':paintSupports},'compilerMs':compiled['elapsedMs'],'proofMs':proof['elapsedMs'],'proofPeakSerializedBytes':proof['peak'],'authority':False,'framePermission':False,'scope':'same640 input all-owner test-only destination proof and six numeric source frames; no formal owner/issuer/UI admission'},ensure_ascii=False,indent=2))
