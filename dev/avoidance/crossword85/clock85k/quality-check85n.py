from pathlib import Path
from fractions import Fraction as F
import sys,json,gzip,hashlib,struct,subprocess,math
R=Path(sys.argv[1]);O=Path(sys.argv[2]);D=Path(__file__).resolve().parent
r=json.loads((O/'result.json').read_text());assert r['complete']and not r['errors']
def dec(v):
 if isinstance(v,dict):
  if list(v)==['$f64']:return struct.unpack('>d',bytes.fromhex(v['$f64']))[0]
  return{k:dec(x)for k,x in v.items()}
 if isinstance(v,list):return[dec(x)for x in v]
 return v
def raw(name):
 row=next(x for x in r['raw']if x['file']==name);g=(O/name).read_bytes();b=gzip.decompress(g);assert len(g)==row['gzipBytes']and hashlib.sha256(g).hexdigest()==row['gzipSHA256'];assert len(b)==row['jsonBytes']and hashlib.sha256(b).hexdigest()==row['sha256'];return dec(json.loads(b))
core=raw('fresh-input.json.gz')['planCore']
js="""const fs=require('fs'),vm=require('vm');const R=process.argv[1],input=JSON.parse(fs.readFileSync(0,'utf8')),c=vm.createContext({window:{}});vm.runInContext(fs.readFileSync(R+'/src/01_util.js','utf8'),c);vm.runInContext('J.placement={}',c);vm.runInContext(fs.readFileSync(R+'/dev/avoidance/crossword85/family85c/family85.js','utf8'),c);c.data=JSON.stringify(input);console.log(JSON.stringify(vm.runInContext('(()=>{const p=JSON.parse(data);return J.placement.crosswordFamily85c.layout58A({W:p.W,H:p.H,cut:p.cut,st:p.style,sc:p.cut.palette,lt:0,ltb:0,pOut:0,pass:\"main\"})})()',c)));"""
layout=json.loads(subprocess.check_output(['node','-e',js,str(R)],input=json.dumps(core).encode()));cell=layout['cell'];gx,gy=layout['gx'],layout['gy'];expectedMain=''.join(''.join(w)for w in layout['words']);own=0;glyphs=0;checks=0;roles={k:0 for k in ['main','number','pencil','clue']};requests={k:0 for k in roles};expectedClues=None;witnesses=[];minPadding=None;clueGroups=0

def boxContact(a,b):return a['x0']<=b['x1']and b['x0']<=a['x1']and a['y0']<=b['y1']and b['y0']<=a['y1']
def union(bs):return{k:(min if k.endswith('0')else max)(x[k]for x in bs)for k in ['x0','x1','y0','y1']}
for row in r['raw']:
 if not row['file'].startswith('batch-'):continue
 for progress in raw(row['file'])['batch']:
  own+=1;assert progress['t']==progress['n']/60;v=progress['inspection'];root=list(map(F,v['shiftedRoot']));a,b,c,d,e,f=root;det=a*d-b*c;assert det!=0;calls=v['program']['calls'];main=[x['args'][0]for x in calls if x['kind']=='mainDraw'];assert ''.join(x['text']for x in main)==expectedMain;clues=[x['args'][0]for x in calls if x['kind']=='draw'and x['args'][0].get('track')==.08];assert len(clues)==4;decl=[(x['text'],x['font'],x['size'])for x in clues];expectedClues=decl if expectedClues is None else expectedClues;assert decl==expectedClues;checks+=3
  groups={};atoms=[]
  for i,part in enumerate(calls):
   if part['kind']not in['mainDraw','draw']:continue
   it=part['args'][0];kind='main'if part['kind']=='mainDraw'else'clue'if it.get('track')==.08 else'number'if it['text'].isdigit()else'pencil';requests[kind]+=1
   if kind=='main':assert it['size']==cell*.65 and it['size']>=18.9
   elif kind=='number':assert it['size']==layout['nativeCell']*.2 and it['size']>=12
   elif kind=='pencil':assert it['size']==cell*.46
   else:assert it['size']==layout['fsC']
   checks+=1;groups[i]={'it':it,'kind':kind,'boxes':[]}
  for record in v['records']:
   if record['kind']!='fillText':continue
   glyphs+=1;i=int(record['owner'].removeprefix('crossword.source.'));group=groups[i];roles[group['kind']]+=1;m=list(map(F,record['matrix']));ink=record['ink'];x0=-F(ink['actualBoundingBoxLeft'])-1;x1=F(ink['actualBoundingBoxRight'])+1;y0=-F(ink['actualBoundingBoxAscent'])-1;y1=F(ink['actualBoundingBoxDescent'])+1;pts=[]
   for x in[x0,x1]:
    for y in[y0,y1]:
     px=m[0]*x+m[2]*y+m[4]-e;py=m[1]*x+m[3]*y+m[5]-f;pts.append(((d*px-c*py)/det,(-b*px+a*py)/det))
   box={'x0':min(x for x,y in pts),'x1':max(x for x,y in pts),'y0':min(y for x,y in pts),'y1':max(y for x,y in pts)};group['boxes'].append(box);atoms.append((group['kind'],box,record['args'][0],i))
  for i,group in groups.items():
   it,kind,bs=group['it'],group['kind'],group['boxes']
   if kind=='clue':continue
   xf=.07 if kind=='number'else.5;yf=.15 if kind=='number'else.64 if kind=='main'else.56;col=math.floor((it['x']-gx)/cell-xf+.5);rr=math.floor((it['y']-gy)/cell-yf+.5);assert 0<=col<layout['C']and 0<=rr<layout['R'];field={k:F(z)for k,z in dict(x0=gx+col*cell,x1=gx+(col+1)*cell,y0=gy+rr*cell,y1=gy+(rr+1)*cell).items()}
   for box in bs:
    pad=min(box['x0']-field['x0'],box['y0']-field['y0'],field['x1']-box['x1'],field['y1']-box['y1']);minPadding=pad if minPadding is None else min(minPadding,pad);checks+=1
    if pad<0 and len(witnesses)<16:witnesses.append({'n':progress['n'],'pass':progress['pass'],'criterion':'cell-containment','kind':kind,'text':it['text'],'glyphs':len(bs),'padding':float(pad),'cell':[rr,col]})
  numbers=[x for x in atoms if x[0]=='number'];letters=[x for x in atoms if x[0]in['main','pencil']]
  for number in numbers:
   for letter in letters:
    checks+=1
    if boxContact(number[1],letter[1])and len(witnesses)<16:witnesses.append({'n':progress['n'],'pass':progress['pass'],'criterion':'number-letter-contact','number':number[2],'letter':letter[2],'numberRequest':number[3],'letterRequest':letter[3]})
  fields=[union(g['boxes'])for g in groups.values()if g['kind']=='clue'and g['boxes']];clueGroups+=len(fields)
  for j,box in enumerate(fields):
   checks+=1
   if box['y0']<=F(gy+layout['gh'])and len(witnesses)<16:witnesses.append({'n':progress['n'],'pass':progress['pass'],'criterion':'clue-board-contact'})
   for other in fields[j+1:]:
    checks+=1
    if boxContact(box,other)and len(witnesses)<16:witnesses.append({'n':progress['n'],'pass':progress['pass'],'criterion':'clue-field-contact'})
result={'passed':not witnesses,'own':own,'glyphs':glyphs,'roles':roles,'potentialRequests':requests,'checks':checks,'clueFields':clueGroups,'minCellPadding':float(minPadding)if minPadding is not None else None,'clueDeclarations':expectedClues,'witnesses':witnesses,'scope':'host-only current sampledj60 fresh sampler data, source-derived current58A cells;1fontpx ink margin/old18.9main12number floors/no extra positive contact floor;not allclockactualpaint/owner/UI'};assert own==727 and glyphs==11822;
if len(sys.argv)>3:Path(sys.argv[3]).write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2));sys.exit(0 if result['passed']else 1)
