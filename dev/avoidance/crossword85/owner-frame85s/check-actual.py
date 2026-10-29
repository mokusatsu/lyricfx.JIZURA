"""Independent host audit; no image/media/public access or model recompilation."""
from pathlib import Path
from fractions import Fraction as F
import json,gzip,hashlib,struct,sys,subprocess,math
D=Path(__file__).resolve().parent;R=D.parents[3];E=Path(sys.argv[1]).resolve();r=json.loads((E/'result.json').read_text())
sha=lambda b:hashlib.sha256(b).hexdigest()
def dec(v):
 if isinstance(v,dict):
  if list(v)==['$f64']:return struct.unpack('>d',bytes.fromhex(v['$f64']))[0]
  return{k:dec(x)for k,x in v.items()}
 if isinstance(v,list):return[dec(x)for x in v]
 return v
def raw(root,manifest,name):
 row=next(x for x in manifest['raw']if x['file']==name);g=(root/name).read_bytes();b=gzip.decompress(g)
 assert len(g)==row['gzipBytes']and sha(g)==row['gzipSHA256'];assert len(b)==row['jsonBytes']and sha(b)==row['sha256'];return dec(json.loads(b))
assert r['complete']and not r['errors']and r['postPinsUnchanged']and len(r['pins'])==52 and len(r['raw'])==2
for p in r['pins']:
 b=Path(p['path']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256'],p['path']
for x in r['raw']:raw(E,r,x['file'])
x=raw(E,r,'formal.json.gz');ready=x['ready'];assert ready['counts']==dict(states=250,own=727,supports=32304,glyphs=11822,sourceRequests=79619)
assert ready['proof']['checkedOwn']==727 and ready['proof']['supports']==32304 and ready['proof']['glyphs']==11822
assert ready['proof']['minimum']>=2 and ready['peak']<=8388608
assert x['formal']['admitted']and x['formal']['placementUnitsAbsent'];tr=x['formal']['trajectory'];assert tr['sourceAdapter']=='crossword_owned85s'and tr['sourceProof']['checkedOwn']==727
assert tr['sourceProof']['stageInset']==2 and not tr['sourceProof']['formalPerformanceAccepted']and not tr['sourceProof']['uiConnected']
old=E.parent/'crossword-whole-destination85o-actual01';om=json.loads((old/'result.json').read_text());assert om['complete']and not om['errors']
# Reconstruct the native source58A cells, exactly as the older85n quality audit.
model=E.parent/'crossword-clock85m-actual01';mm=json.loads((model/'result.json').read_text());evidence=json.loads((D.parent/'clock85k/actual85m-evidence.json').read_text());assert sha((model/'result.json').read_bytes())==evidence['resultSHA256']
core=raw(model,mm,'fresh-input.json.gz')['planCore']
js="""const fs=require('fs'),vm=require('vm');const R=process.argv[1],p=JSON.parse(fs.readFileSync(0,'utf8')),c=vm.createContext({window:{}});vm.runInContext(fs.readFileSync(R+'/src/01_util.js','utf8'),c);vm.runInContext('J.placement={}',c);vm.runInContext(fs.readFileSync(R+'/dev/avoidance/crossword85/family85c/family85.js','utf8'),c);c.input=p;console.log(JSON.stringify(vm.runInContext('J.placement.crosswordFamily85c.layout58A({W:input.W,H:input.H,cut:input.cut,st:input.style,sc:input.cut.palette,lt:0,ltb:0,pOut:0,pass:"main"})',c)))"""
layout=json.loads(subprocess.check_output(['node','-e',js,str(R)],input=json.dumps(core).encode()))
contact=lambda a,b:a['x0']<=b['x1']and b['x0']<=a['x1']and a['y0']<=b['y1']and b['y0']<=a['y1']
union=lambda bs:{k:(min if k.endswith('0')else max)(b[k]for b in bs)for k in ['x0','y0','x1','y1']}
own=0;supports=0;glyphs=0;qualityChecks=0;minimum=None
assert [f['n']for f in x['rows']]==[14,90,231]
for frame in x['rows']:
 prior=raw(old,om,f"frame-{frame['n']:03}.json.gz");assert frame['hash']==prior['hash']and frame['t']==frame['n']/60
 assert len(frame['samples'])==len(prior['samples'])
 for s,o,paint in zip(frame['samples'],prior['samples'],prior['rows']):
  own+=1;assert s['pass']==o['pass'];v=o['value']
  for k in ['records','supports','shiftedRoot']:assert s[k]==v[k],(frame['n'],s['pass'],k)
  calls=[{k:q[k]for k in ['kind','args']}for q in paint['trace']if q['kind']in['mainDraw','draw','rect','line']];assert s['program']['calls']==calls
  assert s['clock']==paint['clock']and s['root']==v['root']
  for support in s['supports']:
   supports+=1;b={k:F(z)for k,z in support['bounds'].items()};assert b['x0']>=2 and b['y0']>=2 and b['x1']<=958 and b['y1']<=538
   c=prior['circle'];cx,cy,rr=F(c['cx']),F(c['cy']),F(c['r'])+F(c['margin']);dx=max(b['x0']-cx,F(0),cx-b['x1']);dy=max(b['y0']-cy,F(0),cy-b['y1']);assert dx*dx+dy*dy>rr*rr
  # Existing85n exact quality criterion: actual glyph CTM with ink±1fontpx,
  # inverse actual shiftedRoot into source cells; no device2px cell padding.
  a,b,c,d,e,f=map(F,s['shiftedRoot']);assert b==c==0 and a>0 and d>0;det=a*d-b*c;groups={};letters=[];numbers=[];clues=[]
  for i,part in enumerate(calls):
   if part['kind']not in ['mainDraw','draw']:continue
   it=part['args'][0];kind='main'if part['kind']=='mainDraw'else'clue'if it.get('track')==.08 else'number'if it['text'].isdigit()else'pencil'
   assert it['size']==(layout['cell']*.65 if kind=='main'else layout['nativeCell']*.2 if kind=='number'else layout['cell']*.46 if kind=='pencil'else layout['fsC'])
   assert kind!='main'or it['size']>=18.9;assert kind!='number'or it['size']>=12;groups[f'crossword.source.{i}']={'it':it,'kind':kind,'boxes':[]}
  assert ''.join(q['args'][0]['text']for q in calls if q['kind']=='mainDraw')==''.join(''.join(w)for w in layout['words'])
  for record in s['records']:
   if record['kind']!='fillText':continue
   glyphs+=1;g=groups[record['owner']];ink=record['ink'];m=list(map(F,record['matrix']));pts=[]
   for xx in [-F(ink['actualBoundingBoxLeft'])-1,F(ink['actualBoundingBoxRight'])+1]:
    for yy in [-F(ink['actualBoundingBoxAscent'])-1,F(ink['actualBoundingBoxDescent'])+1]:
     px=m[0]*xx+m[2]*yy+m[4]-e;py=m[1]*xx+m[3]*yy+m[5]-f;pts.append(((d*px-c*py)/det,(-b*px+a*py)/det))
   box=dict(x0=min(z[0]for z in pts),x1=max(z[0]for z in pts),y0=min(z[1]for z in pts),y1=max(z[1]for z in pts));g['boxes'].append(box)
   if g['kind']=='number':numbers.append(box)
   elif g['kind']in['main','pencil']:letters.append(box)
  for g in groups.values():
   it,kind,bs=g['it'],g['kind'],g['boxes']
   if not bs:continue
   if kind=='clue':clues.append(union(bs));continue
   xf=.07 if kind=='number'else.5;yf=.15 if kind=='number'else.64 if kind=='main'else.56;col=math.floor((it['x']-layout['gx'])/layout['cell']-xf+.5);row=math.floor((it['y']-layout['gy'])/layout['cell']-yf+.5);assert 0<=col<layout['C']and 0<=row<layout['R']
   field={k:F(z)for k,z in dict(x0=layout['gx']+col*layout['cell'],x1=layout['gx']+(col+1)*layout['cell'],y0=layout['gy']+row*layout['cell'],y1=layout['gy']+(row+1)*layout['cell']).items()}
   for box in bs:
    pad=min(box['x0']-field['x0'],box['y0']-field['y0'],field['x1']-box['x1'],field['y1']-box['y1']);assert pad>=0;minimum=pad if minimum is None else min(minimum,pad);qualityChecks+=1
  for n in numbers:
   for l in letters:assert not contact(n,l);qualityChecks+=1
  for i,clue in enumerate(clues):
   assert clue['y0']>F(layout['gy']+layout['gh']);qualityChecks+=1
   for other in clues[i+1:]:assert not contact(clue,other);qualityChecks+=1
assert own==9 and supports==370 and glyphs>0
expected=['STALE_PLACEMENT_PLAN','CROSSWORD85S_FRAME_SCOPE','BULBS80T_OWNED_PLAN_REQUIRED','BULBS80T_OWNED_PLAN_REQUIRED'];assert [v['code']for v in x['rejects']]==expected and all(v['before']==v['after']for v in x['rejects'])
st=x['afterStats'];assert all(not st[k]for k in ['staged','preparing','ready','bindings','certificates','residentModels','activeFrame'])
h=json.loads((E.parent/'crossword-owned-gate-source85s'/f'{E.name}-host.json').read_text());assert h['nodeExit']==0 and h['nodeProcAbsent']and h['serviceProcAbsent']and h['portConnectEx']!=0
print(json.dumps(dict(passed=True,pins=len(r['pins']),raw=len(r['raw']),own=own,supports=supports,glyphs=glyphs,fractionQualityChecks=qualityChecks,minCellPadding=float(minimum),prepareMs=x['prepareMs'],maxStepMs=max(x['steps']),peak=ready['peak'],frameMs=[f['elapsedMs']for f in x['rows']],scope='3actual formal frames/old85o exactRGBA+sample records+source order; finite727own preparation proof; 1fontpx Fraction quality,stage/circle2devicepx; invalidation only,no UI/performance acceptance'),ensure_ascii=False))
