"""Independent offline contour30 numeric support review. No browser/Git/network."""
import sys
sys.dont_write_bytecode=True
from pathlib import Path
from fractions import Fraction as F
import ast,collections,gzip,hashlib,json,math,struct,traceback
R=Path('/workspace/lyricfx.JIZURA');Q=F.from_float;U=object();stats=collections.Counter()
helper=R/'tasks/evidence/AVOID-009/bulbs-diagnostic56/parent-review-bulbs56.py'
tree=ast.parse(helper.read_text());names={'dec','cross','hull','geom','clock'};nodes=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in names];assert len(nodes)==len(names);exec(compile(ast.Module(body=nodes,type_ignores=[]),str(helper),'exec'),globals())
def need(v,m):
 if not v:raise AssertionError(m)
def sha(b):return hashlib.sha256(b).hexdigest()
def exact(v):
 if v is U:return ('$undefined',)
 if isinstance(v,(int,float)) and not isinstance(v,bool):return ('$f64',struct.pack('>d',v).hex())
 if isinstance(v,list):return tuple(exact(x) for x in v)
 if isinstance(v,dict):return tuple(sorted((k,exact(x)) for k,x in v.items()))
 return v
def dy(v):return F(int(v['n']))*F(2)**int(v['e'])
def bound(poly):return {'x0':min(p[0] for p in poly),'x1':max(p[0] for p in poly),'y0':min(p[1] for p in poly),'y1':max(p[1] for p in poly)}
def directed(v,up):
 x=float(v)
 if (Q(x)<v if up else Q(x)>v):x=math.nextafter(x,math.inf if up else -math.inf)
 return x
def interval(a,b):return [math.nextafter(a,-math.inf),math.nextafter(b,math.inf)]

def iadd(a,b):return interval(a[0]+b[0],a[1]+b[1])

def imul(a,b):
 p=[a[0]*b[0],a[0]*b[1],a[1]*b[0],a[1]*b[1]];return interval(min(p),max(p))

def ray_bounds(p):
 path=p['path'];need(len(path)==2 and [x['key'] for x in path]==['moveTo','lineTo'] and p['state']['lineCap']=='butt','T48 ray literal');M=list(map(float,p['matrix']));need(all(exact(x['matrix'])==exact(p['matrix']) for x in path),'ray same CTM');xy=[list(map(float,x['args'])) for x in path];pad=float(p['state']['lineWidth'])/2
 X=interval(min(x[0] for x in xy)-pad,max(x[0] for x in xy)+pad);Y=interval(min(x[1] for x in xy)-pad,max(x[1] for x in xy)+pad)
 wx=iadd(iadd(imul([M[0]]*2,X),imul([M[2]]*2,Y)),[M[4]]*2);wy=iadd(iadd(imul([M[1]]*2,X),imul([M[3]]*2,Y)),[M[5]]*2)
 return dict(x0=math.nextafter(wx[0]-2,-math.inf),x1=math.nextafter(wx[1]+2,math.inf),y0=math.nextafter(wy[0]-2,-math.inf),y1=math.nextafter(wy[1]+2,math.inf))
def supports(r):
 need(r['failure'] is None and r['supportFailure'] is None,'render/support failure');expected=[]
 for ordinal,p in enumerate(r['records']):
  s=p['state'];k=p['kind'];need(p['role']=='primary' and p['owner'] in ['contour.hero','contour.body','contour.metadata','contour.line'],'source primary owner')
  need(k in ['fillText','strokeText','stroke'] and isinstance(s['strokeStyle' if k.startswith('stroke') else 'fillStyle'],str),'active paint style')
  need(s['blend']=='source-over' and s['filter']=='none' and not s['dash'] and not any(s[x] for x in ['shadowBlur','shadowOffsetX','shadowOffsetY']) and s['shadowColor'] in ['rgba(0, 0, 0, 0)','transparent'],'plain conditional effects')
  need(0<=s['alpha']<=1,'finite alpha')
  if not s['alpha']:continue
  q={**p,'state':dict(s)};rule='unchanged-fill-text'
  if k.endswith('Text'):
   need(len(p['args'])==3 and s['textAlign']=='center' and s['textBaseline']=='middle','measured text scope')
   need(all(isinstance(v,(int,float)) and math.isfinite(v) for v in p['metrics'].values()),'finite actual metrics')
   for key,allowed in {'fontKerning':['auto'],'textRendering':['auto'],'fontStretch':['normal'],'fontVariantCaps':['normal'],'direction':['inherit','ltr'],'lang':['inherit']}.items():
    if s.get(key,U) is not U:need(s[key] in allowed,'text state '+key)
   for key in ['letterSpacing','wordSpacing']:
    if s.get(key,U) is not U:need(s[key] in ['','0px','0','+0px','-0px'],'zero text spacing')
  if k=='strokeText':
   need(p['owner']=='contour.hero' and s['lineJoin']=='round' and s['lineWidth']>0,'round hero stroke');q['state']['miterLimit']=1.;rule='round-text-exact-half-linewidth'
  if k=='stroke':
   need(p['owner']=='contour.line' and s['lineCap']=='butt' and len(p['path'])==2 and [x['key'] for x in p['path']]==['moveTo','lineTo'] and all(exact(x['matrix'])==exact(p['matrix']) for x in p['path']),'two-point source line');rule='existing48-two-point-butt-line'
  poly=None if k=='stroke' else geom(q);b=ray_bounds(p) if k=='stroke' else bound(poly);expected.append((ordinal,p,rule,poly,b))
 need(len(expected)==len(r['supports']),'all positive primary paints supported')
 for (ordinal,p,rule,poly,b),saved in zip(expected,r['supports']):
  need(saved['ordinal']==ordinal and saved['owner']==p['owner'] and saved['pass']==p['pass'] and saved['rule']==rule,'support binding')
  if poly is None:
   need(saved['polygon'] is None and saved['exactBounds'] is None and exact(saved['bounds'])==exact(b),'existing48 two-point line interval bounds')
  else:
   need([tuple(map(dy,v)) for v in saved['polygon']]==poly,'independent exact Fraction polygon')
   need({k:dy(v) for k,v in saved['exactBounds'].items()}==b,'independent exact Fraction bounds')
   need(all(exact(saved['bounds'][k])==exact(directed(v,k.endswith('1'))) for k,v in b.items()),'tight outward Float64 box')
 stats['paintSupports']+=len(expected);return r['supports']
def evaluation(rows,c):
 failures=[];cx,cy=Q(c['cx']),Q(c['cy']);radius=Q(c['r'])+Q(c['margin'])
 for i,s in enumerate(rows):
  b={k:Q(v) for k,v in s['bounds'].items()};dx=max(b['x0']-cx,F(0),cx-b['x1']);dy=max(b['y0']-cy,F(0),cy-b['y1']);hit=dx*dx+dy*dy<=radius*radius;stage=b['x0']<0 or b['x1']>960 or b['y0']<0 or b['y1']>540
  if hit or stage:failures.append({'index':i,'owner':s['owner'],'circle':hit,'stage':stage,'conservativeEnvelope':True})
 return {'passed':not failures,'checked':len(rows),'failures':failures}
def actual_clock(row,r,C,cut):
 state=next((s for s in C['states'] if exact(s['n'])==exact(row['n'])),None);need(state is not None,'actual clock state')
 own=next((p for p in state['passes'] if p['pass']==row['own']['pass']),None);need(own is not None and own['active'],'actual active own-pass')
 for key,value in own.items():need(key in row['own'] and exact(row['own'][key])==exact(value),'actual own clock '+key)
 if 'realTime' in row:need(exact(row['realTime'])==exact(state['firstTime']),'actual row realTime')
 clamp=lambda x:max(0.,min(1.,x))
 start=cut.get('renderStart',cut['start']);lead=cut['start']-start
 pin=(clamp((own['tp']-start)/lead) if own['tp']<cut['start'] else 1.) if lead>.01 else clamp(own['lt']/max(.01,cut['inDur']))
 pout=clamp((own['lt']-(cut['dur']-cut['outDur']))/cut['outDur']) if cut['outDur']>0 else 0.
 expected={'t':own['tp'],'realTime':state['firstTime'],'lt':own['lt'],'ltb':own['ltb'],'step':own['step'],'pIn':pin,'pOut':pout}
 need(bool(r['calls']),'actual clock sourcecalls')
 for call in r['calls']:
  for key,value in expected.items():need(key in call['clock'] and exact(call['clock'][key])==exact(value),'actual sourcecall clock '+key)
def check_calls(r,n,spec):
 a,b=r['calls'][0],n['calls'][0];need(a['name']==b['name']=='mainDraw' and a['args'][0]['text']==b['args'][0]['text']=='風の先へ' and exact(a['args'][0]['size'])==exact(b['args'][0]['size']),'complete native-size body')
 for i,k in enumerate(['x','y']):need(exact(a['args'][0][k])==exact(b['args'][0][k]+spec['bodyDelta'][i]),'actual body translation')
 need(len(r['calls'])==len(n['calls']),'metadata/line ownership count')
 for a,b in zip(r['calls'],n['calls']):
  need(a['name']==b['name'] and exact(a['clock'])==exact(b['clock']) and exact(a['params'])==exact(b['params']),'source clocks/params')
  if a['name']=='draw':need(a['args'][0]['text']=='風  ─  No.01','full No metadata')
def main(folder):
 folder=Path(folder);m=json.loads((folder/'manifest.json').read_bytes());records=[];total=0
 for pin in m['records']:
  z=(folder/pin['file']).read_bytes();need(len(z)==pin['bytes'] and sha(z)==pin['sha256'],'raw gzip integrity');b=gzip.decompress(z);need(len(b)==pin['jsonBytes'],'raw full JSON length');total+=len(b);records.append((pin['phase'],dec(json.loads(b))))
 need(m['complete'] and not m['errors'] and total==m['serializedBytes'],'complete source30 producer and stream budget')
 need(not m['rgba'] and total<=286261248,'numeric-only original budget');init=[v for p,v in records if p=='init'];result=[v for p,v in records if p=='result'];need(len(init)==len(result)==1,'init/result count')
 stream=[v for p,v in records if p=='mode-or-check'];first=stream[0];need(first['phase']=='clock','clock first');C=first['clock'];clock(C);need(exact(first['specification'])==exact(json.loads((Path(__file__).parent/'specification30.json').read_bytes())),'frozen finite recipe specification')
 circles=first['circles'];need([(c['id'],c['cx'],c['cy'],c['r'],c['margin']) for c in circles]==[('default',480.,226.79999999999998,108.,2.7),('upper',480.,118.8,108.,2.7)],'two exact normalized circles')
 seq=[(s['n'],p['pass']) for s in C['states'] for p in s['passes'] if p['active']];need(len(seq)==727,'727 active own-clocks')
 native={};attempts={};summaries={};families={};winners={};oracles=collections.Counter();lastattempt=None;specs={x['id']:x for x in first['specification']['recipeOrder']}
 for row in stream[1:]:
  phase=row['phase']
  if phase=='native':
   key=(row['n'],row['own']['pass']);need(key==seq[len(native)] and key not in native,'native exact sequence');actual_clock(row,row['render'],C,first['input']['cut']);supports(row['render']);native[key]=row['render']
  elif phase=='seed':
   need(row['n']==72 and len(native)==727,'heuristic seed clock only');actual_clock(row,row['render'],C,first['input']['cut']);supports(row['render']);check_calls(row['render'],native[(row['n'],row['own']['pass'])],specs[row['recipe']])
  elif phase=='family':
   recipe=row['recipe'];c=row['circle'];positions=row['positions'];need(len(native)==727 and 1<=len(positions)<=8 and positions[0]==[0.,0.] and len({tuple(p) for p in positions})==len(positions),'bounded translation seeds');need(exact(recipe)==exact(specs[recipe['id']]) and c in circles,'fixed recipe/circle');families[(c['id'],recipe['id'])]=row
  elif phase=='attempt':
   ident=row['id'];parts=ident.split('/');ci,rid,pi=parts[0],parts[1],int(parts[2]);family=families[(ci,rid)];base=family['recipe'];delta=family['positions'][pi];expected={'heroScale':base['heroScale'],'heroDelta':[v+d for v,d in zip(base['heroDelta'],delta)],'bodyDelta':[v+d for v,d in zip(base['bodyDelta'],delta)]};need(exact(expected)==exact(row['spec']) and row['circle']==family['circle'],'source-coordinate recipe')
   rows=attempts.setdefault(ident,[]);key=(row['n'],row['own']['pass']);need(key==seq[len(rows)] and not (rows and not rows[-1]['check']['passed']),'attempt stops at first failure')
   if row['nativeRef'] is not None:need(rid=='native-joint' and pi==0 and row['nativeRef']==str(int(row['n']))+':'+row['own']['pass'] and row['render'] is None,'native reuse binding');r=native[key]
   else:r=row['render'];supports(r)
   actual_clock(row,r,C,first['input']['cut']);check_calls(r,native[key],expected);e=evaluation(r['supports'],row['circle']);need(all(exact(row['check'][k])==exact(v) for k,v in e.items()),'independent exact circle/stage predicate');need(row['quality']['diagnosticOnly'] and row['quality']['notAcceptancePredicate'],'quality separated');rows.append({**row,'actual':r})
  elif phase=='attempt-summary':
   ident=row['id'];rows=attempts[ident];need(ident not in summaries and row['checkedPasses']==len(rows),'unique attempt summary');bad=next((x for x in rows if not x['check']['passed']),None);need(row['passed']==(bad is None) and ((row['rejected'] is None)==(bad is None)),'attempt classification')
   if bad:need(row['rejected']['n']==bad['n'] and row['rejected']['pass']==bad['own']['pass'] and exact(row['rejected']['failures'])==exact(bad['check']['failures']),'first failure retained')
   else:need(len(rows)==727,'complete winning full-clock candidate')
   summaries[ident]=row
  elif phase=='winner-oracle':
   ident=row['id'];i=oracles[ident];expected=attempts[ident][i];need(summaries[ident]['passed'] and (row['n'],row['own']['pass'])==seq[i],'winner oracle exact full-clock sequence');r=row['render'];actual_clock(row,r,C,first['input']['cut']);supports(r)
   for field in ['records','calls','result','root','supports']:need(exact(expected['actual'][field])==exact(r[field]) and row['comparisons'][field] is True,'independent source oracle '+field)
   oracles[ident]+=1
  elif phase=='winner':
   ci=row['circle'];need(ci not in winners and oracles[row['id']]==727 and row['passes']==727 and row['states']==250,'first full-clock winner only');winners[ci]=row
  elif phase=='study-summary':study=row
  else:raise AssertionError('unreviewed stream phase '+str(phase))
 need(len(native)==727 and len(attempts)==len(summaries)<=176,'bounded complete attempt inventory')
 need(study['status']==result[0]['status']=='complete-bounded-geometry-study' and study['attempted']==len(attempts) and len(study['winners'])==len(winners),'complete study summary')
 need(set(study['unresolved'])=={c['id'] for c in circles}-set(winners),'unresolved circles truthful')
 # Every unresolved circle exhausts its fixed finite family; winners stop at the
 # first accepted recipe/position, and every candidate begins at own-clock zero.
 order=list(specs)
 for c in circles:
  ci=c['id'];fs=[f for (cc,_),f in families.items() if cc==ci]
  winning=winners.get(ci);lastRecipe=winning['id'].split('/')[1] if winning else order[-1]
  need([f['recipe']['id'] for f in fs]==order[:order.index(lastRecipe)+1],'fixed finite recipe prefix/exhaustion')
  for f in fs:
   rid=f['recipe']['id'];ids=[a for a in attempts if a.startswith(ci+'/'+rid+'/')]
   winpi=int(winning['id'].split('/')[-1]) if winning and rid==lastRecipe else None
   expectedCount=winpi+1 if winpi is not None else len(f['positions'])
   need(ids==[ci+'/'+rid+'/'+str(i) for i in range(expectedCount)],'fixed position prefix/exhaustion')
   for ident in ids:need(summaries[ident]['passed']==(winning is not None and ident==winning['id']),'only first winner accepted')

 return {'state':'PASS_CONTOUR30_CONDITIONAL_SUPPORT_STUDY','clockStates':250,'activePasses':727,'attempts':len(attempts),'winners':list(winners.values()),'unresolved':study['unresolved'],'independentFractionPaintSupports':stats['paintSupports'],'geometryCertified':False,'conditionalSupportModel':True,'adapterRegistered':False,'pixelsNewlyQualified':False,'publicChecks':0}
if __name__=='__main__':
 try:result=main(sys.argv[1])
 except BaseException as e:result={'state':'FAIL_CONTOUR30_CONDITIONAL_SUPPORT_STUDY','failure':{'type':type(e).__name__,'message':str(e),'stack':traceback.format_exc()},'geometryCertified':False}
 with Path(sys.argv[2]).open('x') as f:json.dump(result,f,ensure_ascii=False,indent=2);f.write('\n')
 print(json.dumps(result,ensure_ascii=False));sys.exit(0 if result['state'].startswith('PASS_') else 1)
