"""Independent all-owner actual-paint containment/X/clip check; no browser/media/remote access."""
from pathlib import Path
from fractions import Fraction as F
import json,gzip,hashlib,struct,sys
B=Path(sys.argv[1]).resolve();D=B/'domino-source-paint-actual82al02';S=B/'domino-source-paint-source82al02';U=Path(__file__).resolve().parent;R=U.parents[3];sha=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):
 b=Path(p['path']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256'],p['path']
def decode(x):
 if isinstance(x,dict):return struct.unpack('>d',bytes.fromhex(x['$f64']))[0]if list(x)==['$f64']else{k:decode(v)for k,v in x.items()}
 if isinstance(x,list):return[decode(v)for v in x]
 return x
def bits(x):
 if isinstance(x,(int,float))and not isinstance(x,bool):return{'f64':struct.pack('>d',float(x)).hex()}
 if isinstance(x,dict):return{k:bits(v)for k,v in x.items()}
 if isinstance(x,list):return[bits(v)for v in x]
 return x
def inside(box,m,x,y,pad=0):
 a,b,c,d,e,f=map(F,m);x,y,pad=map(F,[x,y,pad]);x0,x1,y0,y1=(F(box[k])for k in ['x0','x1','y0','y1'])
 for dx in [-pad,pad]:
  for dy in [-pad,pad]:
   X=a*(x+dx)+c*(y+dy)+e;Y=b*(x+dx)+d*(y+dy)+f;assert x0<=X<=x1 and y0<=Y<=y1
r=json.loads((D/'result.json').read_text());assert r['complete']and r['first32Passed']and not r['errors']and r['postPinsUnchanged']and r['mediaOutputs']==r['publicChecks']==0
for p in r['pins']:pin(p)
raw={}
for p in r['raw']:
 g=(D/p['file']).read_bytes();b=gzip.decompress(g);assert len(g)==p['gzipBytes']and sha(g)==p['gzipSHA256'];assert len(b)==p['jsonBytes']and sha(b)==p['sha256']and len(b)<=8*1024**2;raw[p['file'][:-8]]=decode(json.loads(b))
assert sum(p['jsonBytes']for p in r['raw'])<=128*1024**2 and sum(p['gzipBytes']for p in r['raw'])<=32*1024**2
prepared=raw['product-ui'];assert prepared['phase']=='prepared-for-source-paint'and not prepared['normalPostQualified']and not prepared['frameAuthority'];model=prepared['model'];previous=json.loads(gzip.decompress((B/'domino-ui-projection-actual82ak02/product-ui.json.gz').read_bytes()))
for k in ['coverage','viewport','circle','dy','staticInput','rows']:assert bits(model[k])==bits(previous['model'][k]),k
for k in ['normalized','editable','viewport']:assert bits(prepared['input'][k])==bits(previous['input'][k]),k
assert prepared['prepare']['stats']['nativeCompiles']==1 and prepared['prepare']['stats']['destinationSamples']==250
chunks=[raw[k]for k in sorted(raw)if k.startswith('paint-')];assert len(chunks)==16;offset=0;counts={'own':0,'paint':0,'glyph':0,'emptyOwn':0,'supportOutsideX':0,'explicitClipCalls':0};circle=model['circle'];cx,cy,rr=F(circle['cx']),F(circle['cy']),F(circle['r'])+F(circle['margin'])
for chunk in chunks:
 assert chunk['start']==offset and chunk['end']==offset+len(chunk['rows'])and chunk['total']==250
 for row in chunk['rows']:
  index=int(row['index']);assert index==offset;offset+=1;entry=model['rows'][index];a,b=row['native'],row['destination'];assert row['n']==entry['n']and row['pass']==entry['pass'];assert bits(a['clock'])==bits(b['clock'])and a['clock']['n']==entry['n']and a['clock']['pass']==entry['pass'];assert bits(a['root'])==bits(b['root'])==bits(entry['root']);assert a['viewport']==b['viewport']=={'width':480,'height':270}and a['implicitClip']==b['implicitClip']=='unchanged native canvas viewport'
  assert bits(a['sample']['input'])==bits(b['sample']['input']);assert bits(b['sample']['supports'])==bits(entry['supports']);assert b['sample']['sourceDy']==model['dy']and a['sample'].get('sourceDy',0)==0
  old,new=a['sample']['supports'],b['sample']['supports'];pa,pb=a['observed']['paint'],b['observed']['paint'];assert len(old)==len(new)==len(pa)==len(pb);assert bits(a['observed']['rng'])==bits(b['observed']['rng'])and bits(a['observed']['fits'])==bits(b['observed']['fits'])and bits(a['observed']['clips'])==bits(b['observed']['clips']);assert not b['observed']['clips'];counts['explicitClipCalls']+=len(b['observed']['clips']);counts['emptyOwn']+=not pb
  glyphs=[g for item in b['sample']['glyphs']for g in item['glyphRows']];gi=0
  for original,paint,native,support in zip(pa,pb,old,new):
   assert original['kind']==paint['kind']and original['role']==paint['role']=='primary'and original['owner']==paint['owner']=='dominoes.row.0';assert bits(original['matrix'][:5])==bits(paint['matrix'][:5])and bits(original['state'])==bits(paint['state'])and bits(original['metrics'])==bits(paint['metrics'])and bits(original['clips'])==bits(paint['clips'])and bits(original['args'])==bits(paint['args']);assert native['kind']==support['kind']and native['owner']==support['owner']=='dominoes.row.0';assert bits(native['bounds']['x0'])==bits(support['bounds']['x0'])and bits(native['bounds']['x1'])==bits(support['bounds']['x1'])
   assert len(original['path'])==len(paint['path'])
   for p,q in zip(original['path'],paint['path']):
    assert p['key']==q['key']and bits(p['matrix'][:5])==bits(q['matrix'][:5]);xs=[0,2]if p['key']=='arcTo'else[0]if p['key']in ['moveTo','lineTo','arc']else[]
    for i in xs:assert bits(p['args'][i])==bits(q['args'][i])
    if p['key']=='arc':assert bits(p['args'][2:])==bits(q['args'][2:])
    if p['key']=='arcTo':assert bits(p['args'][4])==bits(q['args'][4])
   box=support['bounds'];x0,x1,y0,y1=(F(box[k])for k in ['x0','x1','y0','y1']);assert x0<=x1 and 0<=y0<=y1<=270;nx=max(x0,min(cx,x1));ny=max(y0,min(cy,y1));assert(nx-cx)**2+(ny-cy)**2>rr**2;counts['supportOutsideX']+=x0<0 or x1>480
   kind=support['kind']
   if kind=='glyph':
    assert paint['kind']=='fillText';g=glyphs[gi];gi+=1;counts['glyph']+=1;assert bits(g['matrix'])==bits(paint['matrix'])and g['ch']==paint['args'][0]and g['font']==paint['state']['font']and bits(g['ink'])==bits(paint['metrics']);ink=g['ink']
    for x in [-F(ink['actualBoundingBoxLeft'])-1,F(ink['actualBoundingBoxRight'])+1]:
     for y in [-F(ink['actualBoundingBoxAscent'])-1,F(ink['actualBoundingBoxDescent'])+1]:inside(box,paint['matrix'],x,y)
   else:
    assert paint['kind']==('stroke'if kind=='line'else'fill')
    for seg in paint['path']:
     args=seg['args'];matrix=seg['matrix'];key=seg['key'];pad=F(paint['state']['lineWidth'])*F(paint['state']['miterLimit'])/2 if kind=='line'else 0
     if key in ['moveTo','lineTo']:inside(box,matrix,args[0],args[1],pad)
     elif key=='arcTo':
      for x,y in [(args[0],args[1]),(args[2],args[3])]:inside(box,matrix,x,y)
     elif key=='arc':
      for x in [F(args[0])-F(args[2]),F(args[0])+F(args[2])]:
       for y in [F(args[1])-F(args[2]),F(args[1])+F(args[2])]:inside(box,matrix,x,y)
     else:assert key=='closePath'
   counts['paint']+=1
  assert gi==len(glyphs);counts['own']+=1
 assert chunk['done']==(offset==250)and chunk['stats']['nativeCompiles']==1
assert counts=={'own':250,'paint':3064,'glyph':808,'emptyOwn':11,'supportOutsideX':43,'explicitClipCalls':0},counts
release=raw['release'];assert release['code']=='DOMINO82P_GENERATION_STALE'and not release['stats']['pending']and not release['stats']['resident']and release['stats']['preparingSurfaceBytes']==0
for n in ['root82ak','compose82ak','geometry82ak','scope82ak','vertical82ak','compiler82ak','model82ak','owner82ak']:assert(S/(n+'.js')).read_bytes()==(R/'dev/avoidance/domino82/ui-projection82ak'/(n+'.js')).read_bytes()
observer=json.loads((U/'observer-provenance.json').read_text());assert sha((U/'observer81.js').read_bytes())==observer['sha256']==sha((S/'observer81.js').read_bytes())
fragment=(R/'dev/avoidance/domino82/source-shift82j/shift-fragment.js').read_text();old='const yF = H / 2 + (r - (rows - 1) / 2) * (h + w * 0.35) + h / 2;';new=old[:-1]+' + J.placement.dominoSourceShift82j.read(env,rows);';candidate=(S/'candidate-ja.html').read_text();assert candidate.count(fragment)==candidate.count(new)==1;assert candidate.replace(fragment,'').replace(new,old)==(B/'domino-ui-projection-source82ak02/candidate-ja.html').read_text()
h=json.loads((B/(D.name+'-runtime')/'host.json').read_text());assert h['complete']and h['probeExit']==0 and h['normalPageClosureConfirmed']and h['debugPortClosed']and h['pages']['created']==len(h['pages']['closed'])==3 and h['cleanup']['complete']and all(not h['cleanup'][k]for k in ['remaining','signals','ownershipFailures','signalFailures'])
for p in h['runtimeSources']:pin(p)
for m in sorted(B.glob('domino-source-paint82al-sourceprep*-final/pins.json')):
 for p in json.loads(m.read_text()):pin(p);b=Path(p['snapshot']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256']
print(json.dumps({'checked':True,'pins':len(r['pins']),'rawRecords':len(r['raw']),'jsonBytes':sum(p['jsonBytes']for p in r['raw']),'gzipBytes':sum(p['gzipBytes']for p in r['raw']),'first32PassedBeforeRemainder':True,'counts':counts,'fractionPaintContainment':True,'actualNativeXAndClipUnchanged':True,'modelExactlyMatches82ak':True,'prepareMs':prepared['prepare']['elapsedMs'],'maxStepMs':prepared['prepare']['maxStepMs'],'generationRefused':True,'privateReleased':True,'normalWindowsClosed':3,'cleanupComplete':True,'scope':'all owned source-paint equivalence and Y/circle support, native X clipping retained; not all-direction stage-clear, Renderer-frame/formal-plan/normal-options/product UI qualification'},indent=2))
