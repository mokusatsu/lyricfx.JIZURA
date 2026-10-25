"""Independent offline source30 raw/quality/strict geometry review. No browser/network."""
import sys
sys.dont_write_bytecode=True
import base64,gzip,hashlib,json,math,pathlib,runpy,struct,traceback
from fractions import Fraction as F
ROOT=pathlib.Path('/workspace/lyricfx.JIZURA');HERE=pathlib.Path(__file__).parent
R=runpy.run_path(str(ROOT/'tasks/evidence/AVOID-009/resume-20261025/parent-read-raw69.py'));restore=R['restore'];U=R['UNDEFINED']
def need(v,m):
 if not v:raise AssertionError(m)
def exact(v):
 if v is U:return ('$undefined',)
 if isinstance(v,(int,float)) and not isinstance(v,bool):return ('$f64',struct.pack('>d',v).hex())
 if isinstance(v,list):return tuple(exact(x) for x in v)
 if isinstance(v,dict):return tuple(sorted((k,exact(x)) for k,x in v.items()))
 return v
def point(m,x,y):return [m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]]
def inverse(m):
 a,b,c,d,e,f=m;n=a*d-b*c;return [d/n,-b/n,-c/n,a/n,(c*f-d*e)/n,(b*e-a*f)/n]
def bbox(points):return {'x0':min(p[0] for p in points),'y0':min(p[1] for p in points),'x1':max(p[0] for p in points),'y1':max(p[1] for p in points)}
def rgba(x):
 need(x['encoding']=='literal-RGBA-unorm8-base64' and x['bytes']==2073600,'RGBA schema');b=base64.b64decode(x['data'],validate=True);need(len(b)==x['bytes'],'RGBA bytes');return b
def geometry(rows,circle,delta=(0,0)):
 for i,s in enumerate(rows):
  b={k:F(v)+F(delta[0 if k[0]=='x' else 1]) for k,v in s['bounds'].items()};stage=b['x0']<0 or b['y0']<0 or b['x1']>960 or b['y1']>540;cx,cy,rr=F(circle['cx']),F(circle['cy']),F(circle['effectiveRadius'])**2
  dx=max(b['x0']-cx,cx-b['x1'],0);dy=max(b['y0']-cy,cy-b['y1'],0);conflict=dx*dx+dy*dy<=rr
  if stage or conflict:return {'passed':False,'checked':i+1,'witness':{'ordinal':s['ordinal'],'owner':s['owner'],'stage':stage,'circle':conflict}}
 return {'passed':True,'checked':len(rows),'witness':None}
def support_check(p,s):
 need(p['state']['alpha']>0 and p['role']=='primary' and p['owner'].startswith('crossword28.'),'support primary');st=p['state'];need(st['filter']=='none' and not st['shadowBlur'] and not st['shadowOffsetX'] and not st['shadowOffsetY'] and not st['dash'],'support effects');need(isinstance(st['strokeStyle' if p['kind'].startswith('stroke') else 'fillStyle'],str),'active paint style')
 if p['kind']=='fillText':
  need(len(p['args'])==3 and st['textAlign']=='center' and st['textBaseline']=='middle','qualified source text');x,y=map(F,p['args'][1:]);m=p['metrics'];box=[x-F(m['actualBoundingBoxLeft'])-1,y-F(m['actualBoundingBoxAscent'])-1,x+F(m['actualBoundingBoxRight'])+1,y+F(m['actualBoundingBoxDescent'])+1]
 elif p['kind']=='fillRect':
  x,y,w,h=map(F,p['args']);box=[min(x,x+w),min(y,y+h),max(x,x+w),max(y,y+h)]
 else:
  need(p['kind']=='stroke' and len(p['path'])==2 and [c['key'] for c in p['path']]==['moveTo','lineTo'] and st['lineCap']=='butt' and all(exact(c['matrix'])==exact(p['matrix']) for c in p['path']),'two point stroke');xy=[list(map(F,c['args'][:2])) for c in p['path']];pad=F(st['lineWidth'])/2;box=[min(z[0] for z in xy)-pad,min(z[1] for z in xy)-pad,max(z[0] for z in xy)+pad,max(z[1] for z in xy)+pad]
 x0,y0,x1,y1=box;points=[point(list(map(F,p['matrix'])),x,y) for x,y in [(x0,y0),(x1,y0),(x1,y1),(x0,y1)]];b=bbox(points)
 for k in ['x0','y0']:need(F(s['bounds'][k])<=b[k]-2,'support lower encloses exact source+guard '+k)
 for k in ['x1','y1']:need(F(s['bounds'][k])>=b[k]+2,'support upper encloses exact source+guard '+k)
 need(s['owner']==p['owner'] and s['kind']==p['kind'],'support association')
def quality(row):
 sample=row['actual'];shape=row['shape'];cell=68.26666666666667*shape['scale'];gx=(960-9*cell)/2;gy=(540-5*cell-16.384*5)/2;inv=inverse(sample['root']);delta=row['delta'];sx=inv[0]*delta[0]+inv[2]*delta[1];sy=inv[1]*delta[0]+inv[3]*delta[1];atoms=[]
 for p in sample['records']:
  if not p['kind'].endswith('Text') or p['state']['alpha']<=0:continue
  m=p['metrics'];x,y=p['args'][1:3];vertices=[(x-m['actualBoundingBoxLeft']-1,y-m['actualBoundingBoxAscent']-1),(x+m['actualBoundingBoxRight']+1,y-m['actualBoundingBoxAscent']-1),(x+m['actualBoundingBoxRight']+1,y+m['actualBoundingBoxDescent']+1),(x-m['actualBoundingBoxLeft']-1,y+m['actualBoundingBoxDescent']+1)];b=bbox([point(inv,*point(p['matrix'],*v)) for v in vertices]);atoms.append({'owner':p['owner'],'text':p['args'][0],'local':b})
 need(len(atoms)==len(row['quality']['atoms']),'all text atoms')
 for a,b in zip(atoms,row['quality']['atoms']):
  need(a['owner']==b['owner'] and a['text']==b['text'],'text owner');need(all(abs(a['local'][k]-b['local'][k])<=1e-9 for k in a['local']),'independent text bounds diagnostic values')
 passed=True
 for c in sample['calls']:
  if c['kind']!='main' and c.get('sub') not in ['number','pencil']:continue
  kind='main' if c['kind']=='main' else c['sub'];it=c['item'] if kind=='main' else c['args'][0];xf=.07 if kind=='number' else .5;yf=(.15 if shape['profile']=='A' else .18) if kind=='number' else (.62 if shape['profile']=='B' else .64) if kind=='main' else .56
  col=math.floor((it['x']-gx)/cell-xf+.5);rr=math.floor((it['y']-gy)/cell-yf+.5);need(0<=col<9 and 0<=rr<5,'source cell association domain');box={'x0':gx+col*cell+sx,'y0':gy+rr*cell+sy,'x1':gx+(col+1)*cell+sx,'y1':gy+(rr+1)*cell+sy};floor=18.9 if kind=='main' else 12 if kind=='number' else 0
  if it['size']<floor:passed=False
  for a in [a for a in atoms if a['owner']==c['owner']]:
   b=a['local']
   if min(b['x0']-box['x0'],b['y0']-box['y0'],box['x1']-b['x1'],box['y1']-b['y1'])<0:passed=False
 for a in [a for a in atoms if '.number.' in a['owner']]:
  for b in [b for b in atoms if '.main.' in b['owner'] or '.pencil.' in b['owner']]:
   x,y=a['local'],b['local']
   if x['x0']<=y['x1'] and y['x0']<=x['x1'] and x['y0']<=y['y1'] and y['y0']<=x['y1']:passed=False
 need(passed==row['quality']['passed'],'independent full quality result; tolerance never used for acceptance');return passed
NUMBERS={'1':(0,1),'2':(0,3),'3':(0,4),'4':(0,6),'5':(0,7),'6':(0,8),'7':(1,0),'8':(1,3),'9':(2,1),'10':(2,2),'11':(2,6),'12':(3,0),'13':(3,5),'14':(3,7),'15':(4,0),'16':(4,4)}
def tuple_check(v,policy,cut):
 need(v['shape'] in policy['shapes'],'fixed shape');shape=v['shape'];n=int(v['n']);need(0<=n<250,'state index');a,b=v['actual'],v['expected'];own=v['own'];lag={'B':1.6/24,'A':.8/24,'main':0}[own['pass']];tp=max(0,n*(1/60)-lag);need(tp<4 and own['active'],'selected actual pass');clock=a['clock'];need(clock['pass']==own['pass'] and exact(own['tp'])==exact(tp) and exact(own['lt'])==exact(tp) and exact(own['ltb'])==exact(tp+lag) and exact(own['lag'])==exact(lag) and own['step']==math.floor(tp/(1/24)+1e-6),'all own pass fields');need(exact(clock['t'])==exact(tp) and exact(clock['lt'])==exact(tp) and exact(clock['ltb'])==exact(tp+lag),'own native source clocks');need(math.floor(v['time']/(1/60)+1e-6)==n and exact(clock['realTime'])==exact(v['time']),'realTime selector preimage');need(clock['step']==math.floor(tp/(1/24)+1e-6),'own step');need(exact(clock['pOut'])==exact(max(0,min(1,(tp-3.6)/.4))),'own pOut');need(exact(clock['pIn'])==exact(max(0,min(1,tp/.35))),'own pIn')
 need(exact(a['records'])==exact(b['records']) and exact(a['calls'])==exact(b['calls']) and exact(a['clock'])==exact(b['clock']),'all literal paint/sourcecall/clock values');need(rgba(a['rgba'])==rgba(b['rgba']),'full lossless literal RGBA')
 for x in [a,b]:
  need(not x['paintError'] and x['rootRestored'] and x['allPrimary'],'healthy source draw');need(all(r['role']=='primary' and r['owner'].startswith('crossword28.') for r in x['records']),'all primary paints');need(all(f['passed'] and f['acceptedCSS']==f['actualCSS'] for f in x['fontChecks']),'actual source accepted font')
 mains=[c['item'] for c in a['calls'] if c['kind']=='main'];need(''.join(i['text'] for i in mains)=='風の先へ' and len(mains)==4,'full natural main text');need(all(exact(it['mi'])==exact(max(0,.25+i*.11)/max(.005,cut.get('stagger') or .04)) for i,it in enumerate(mains)),'original stagger/read order')
 cell=68.26666666666667*shape['scale'];gx=(960-9*cell)/2;gy=(540-5*cell-16.384*5)/2;mainRatio=.7 if shape['profile']=='B' else .65;mainY=.62 if shape['profile']=='B' else .64
 for i,it in enumerate(mains):need(exact(it['size'])==exact(cell*mainRatio) and exact(it['x'])==exact(gx+(1+i+.5)*cell) and exact(it['y'])==exact(gy+(2+mainY)*cell),'main fixed cell/size')
 clues=[c['args'][0] for c in a['calls'] if c.get('sub')=='clue'];need([c['text'] for c in clues]==['ヨコのカギ','9  (4)','タテのカギ','3  ─'] and all(exact(c['size'])==exact(16.384) for c in clues),'all native clues')
 for c in [c for c in a['calls'] if c.get('sub')=='number']:
  it=c['args'][0];rr,cc=NUMBERS[it['text']];ny=.15 if shape['profile']=='A' else .18;size=68.26666666666667*.2 if shape['profile']=='A' else 12;need(exact(it['size'])==exact(size) and exact(it['x'])==exact((gx+cc*cell)+cell*.07) and exact(it['y'])==exact((gy+rr*cell)+cell*ny),'fixed topology number ID/cell/size')
 q=quality(v);supports=v['support'];need(not supports['error'],'no unsupported channel accepted');ordinals=[i for i,p in enumerate(a['records']) if p['state']['alpha']>0];need([s['ordinal'] for s in supports['rows']]==ordinals,'all actual paint supports')
 for s in supports['rows']:support_check(a['records'][int(s['ordinal'])],s)
 if v['circle'] is not None:
  need(v['circle'] in policy['circles'],'fixed circle');g=geometry(supports['rows'],v['circle']);need(g['passed']==v['geometry']['passed'] and g['checked']==v['geometry']['checked'],'strict materialized geometry');return q,g['passed']
 need(v['geometry'] is None,'no geometry fabricated');return q,None

def check(folder,output):
 folder=pathlib.Path(folder);result={'state':'FAIL_SOURCE30_PILOT','Canvas':0,'imagesViewed':0,'rawPersistence':'RAM_ONLY','geometrySafetyCertified':False,'publicChecks':0,'restoredValues':0}
 try:
  m=json.loads((folder/'manifest.json').read_bytes());host=json.loads((folder/'host-receipt.json').read_bytes());policy=json.loads((HERE/'policy30.json').read_bytes());need(host['init']['policy']==policy,'source-pinned policy');need(host['init']['clocks']['actualCounts']=={'states':250,'selectedPasses':727} and [s['n'] for s in host['init']['clocks']['states']]==list(range(250)),'fixed complete clock enumeration');need(host['init']['plan']['cuts'][0]['lineText']==host['init']['plan']['cuts'][0]['text']=='風の先へ','natural fixture');need(not host['networkAttempts'] and not host['pageErrors'] and not host['consoleErrors'],'offline/error state');tables={k:[] for k in ['matrix','paint','catalog']};values=[];total=0
  need(len(m['records'])<=96,'record cap')
  for f in m['records']:
   b=(folder/f['file']).read_bytes();need(len(b)==f['bytes'] and hashlib.sha256(b).hexdigest()==f['sha256'],'gzip bytes');raw=gzip.decompress(b);need(len(raw)==f['JSONBytes']<=16777216,'record cap/length');total+=len(raw);need(total<=268435456,'total cap');v=json.loads(raw);need(v['CODEC69']==m['CODEC69']=='source69-root-and-metadata59-gzip-v2' and v['tableEpoch']==0,'existing codec')
   for k,ds in v['tableDeltas'].items():
    for d in ds:need(d['id']==len(tables[k]),'table order');tables[k].append(d['value'])
    need(len(tables[k])<=100000,'table cap')
   batch=restore(v['binding'],tables);need(isinstance(batch,list) and 0<len(batch)<=64 and len(batch)==f['values'],'batch values');values.extend(batch)
  need(total==m['JSONBytes'] and len(values)==m['values']==host['valuesEmitted'],'full lossless stored counts');tuples=[];shapes={};anchorRows=[];finalRows=[];pilot=None;tuple_groups={}
  for v in values:
   if v['kind']=='tuple':
    need(exact(v['time'])==exact(host['init']['clocks']['states'][int(v['n'])]['firstTime']),'original complete clock first preimage');q,g=tuple_check(v,policy,host['init']['plan']['cuts'][0]);key=(v['phase'],v['shape']['id'],v['circle']['id'] if v['circle'] else None,tuple(v['delta']));group=tuple_groups.setdefault(key,[]);need(not group or group[-1][1] and group[-1][2] is not False,'first failure must stop immediately');group.append((v,q,g));tuples.append(v)
   elif v['kind']=='shape-result':
    need(v['shape']['id'] not in shapes,'one screen per shape');rows=[r for r in tuples if r['phase']=='shape-screen' and r['shape']['id']==v['shape']['id']];need(rows,'screen evidence');bad=[r for r in rows if not r['quality']['passed']];need(v['passedSparseQuality']==(not bad) and (not bad or rows[-1] is bad[0]),'first shape witness');expected=[(n,pa) for n in policy['sparseN'] for pa,lag in [('B',1.6/24),('A',.8/24),('main',0)] if max(0,n*(1/60)-lag)<4];actual=[(int(r['n']),r['own']['pass']) for r in rows];need(actual==expected[:len(actual)] and (bad or len(actual)==len(expected)),'screen tuple coverage');shapes[v['shape']['id']]={'result':v,'rows':rows}
   elif v['kind']=='anchor-result':
    screen=shapes[v['shape']['id']];need(screen['result']['passedSparseQuality'],'only quality survivors seed anchors');supports=[s for r in screen['rows'] for s in r['support']['rows']];b=bbox([(s['bounds'][x],s['bounds'][y]) for s in supports for x,y in [('x0','y0'),('x1','y1')]]);side,vertical=v['id'].split('-')[-2:];dx=2-b['x0'] if side=='left' else 958-b['x1'];dy=2-b['y0'] if vertical=='top' else (540-b['y0']-b['y1'])/2 if vertical=='center' else 538-b['y1'];need(exact(v['delta'])==exact([dx,dy]),'fixed sparse-derived anchor');g=geometry(supports,v['circle'],v['delta']);need(g['passed']==v['geometry']['passed'] and g['checked']==v['geometry']['checked'],'independent sparse anchor geometry');anchorRows.append(v)
   elif v['kind']=='finalist-result':
    need(any(a['id']==v['id'] and a['geometry']['passed'] for a in anchorRows),'screened finalist');rows=[r for r in tuples if r['phase']=='finalist' and r['shape']==v['shape'] and r['circle']==v['circle'] and exact(r['delta'])==exact(v['delta'])];expected=[(n,pa) for n in range(250) for pa,lag in [('B',1.6/24),('A',.8/24),('main',0)] if max(0,n*(1/60)-lag)<4];actual=[(int(r['n']),r['own']['pass']) for r in rows];need(actual==expected[:len(actual)],'fullclock prefix coverage');bad=[r for r in rows if not r['quality']['passed'] or not r['geometry']['passed']];passed=not bad and len(rows)==727 and v['statesVisited']==250;need(v['passed']==passed and v['passesChecked']==len(rows),'fullclock finalist acceptance');need(not bad or rows[-1] is bad[0],'first finalist witness');need(not any(f['circle']==v['circle'] and f['passed'] for f in finalRows),'first winner stops circle');finalRows.append(v)
   elif v['kind']=='pilot-result':need(pilot is None,'one terminal result');pilot=v
   else:need(False,'unknown row kind')
  need(pilot is not None and values[-1]['kind']=='pilot-result' and pilot['complete'] and m['complete'] and host['complete'],'complete pilot');need(pilot['phase']==host['phase'] and pilot['phase'] in ['representative','full'],'host and terminal reviewed phase');need(pilot['tupleCount']==len(tuples)==host['CanvasSamples'],'all actual tuple counts');need(len(anchorRows)<=108 and len(finalRows)<=6 and all(sum(f['circle']==c for f in finalRows)<=3 for c in policy['circles']),'finite caps')
  if pilot['phase']=='representative':need(all(r['phase']=='representative' and r['shape']['id']=='55C' and r['n']==90 for r in tuples) and [(r['own']['pass']) for r in tuples]==['B','A','main'][:len(tuples)] and 0<len(tuples)<=3 and not finalRows and not anchorRows,'representative-only scope')
  else:need(len(shapes)==9 and len(anchorRows)==12*sum(s['result']['passedSparseQuality'] for s in shapes.values()),'all bounded shape/anchor screens');need(pilot['finalists']==finalRows and pilot['winners']==[f for f in finalRows if f['passed']],'all terminal finalists/winners')
  result.update(state='PASS_SOURCE30_PILOT_EVIDENCE_ONLY',phase=pilot['phase'],storedJSONBytes=total,restoredValues=len(values),actualTuples=len(tuples),shapeScreens=len(shapes),anchors=len(anchorRows),finalists=len(finalRows),conditionalFullClockWinners=[f['id'] for f in finalRows if f['passed']],fullLiteralPaintSourcecallClockRGBACompared=True,qualityApprovedOnlyWithinAcceptedCandidatePolicy=True,geometrySafetyCertified=False)
 except BaseException as e:result['failure']={'name':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()}
 pathlib.Path(output).write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result,ensure_ascii=False));return 0 if result['state'].startswith('PASS_') else 1
if __name__=='__main__':sys.exit(check(sys.argv[1],sys.argv[2]))
