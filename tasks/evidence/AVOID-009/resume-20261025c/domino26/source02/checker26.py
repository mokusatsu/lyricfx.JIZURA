"""Offline independent raw check. No browser, network, images or product writes."""
import collections,gzip,hashlib,json,math,pathlib,runpy,struct,sys,traceback
from fractions import Fraction as F
sys.dont_write_bytecode=True
ROOT=pathlib.Path('/workspace/lyricfx.JIZURA')
R=runpy.run_path(str(ROOT/'tasks/evidence/AVOID-009/resume-20261025/parent-read-raw69.py'));restore=R['restore'];U=R['UNDEFINED']
Q=F.from_float
def need(v,m):
 if not v:raise AssertionError(m)
def exact(v):
 if v is U:return ('$undefined',)
 if isinstance(v,(int,float)) and not isinstance(v,bool):return ('$f64',struct.pack('>d',v).hex())
 if isinstance(v,list):return tuple(exact(x) for x in v)
 if isinstance(v,dict):return tuple(sorted((k,exact(x)) for k,x in v.items()))
 return v
def bits(x):return struct.unpack('>Q',struct.pack('>d',x))[0]
def number(x):return struct.unpack('>d',struct.pack('>Q',int(x)))[0]
def nextf(x,up):return math.nextafter(x,math.inf if up else -math.inf)
def interval(a,b):return [nextf(a,False),nextf(b,True)]
def plus(a,b):return interval(a[0]+b[0],a[1]+b[1])
def times(a,b):
 p=[x*y for x in a for y in b];return interval(min(p),max(p))
def directed(x,up):
 v=float(x)
 return nextf(v,up) if (Q(v)<x if up else Q(v)>x) else v
def support(p,primitive):
 M=p['matrix'];s=p['state'];active='strokeStyle' if p['kind'].startswith('stroke') else 'fillStyle';need(isinstance(s[active],str),'active paint style');need(s['alpha']>0 and s['filter']=='none' and not s['shadowBlur'] and not s['shadowOffsetX'] and not s['shadowOffsetY'] and not s['dash'],'paint effects');kind=p['kind'];arc=[c for c in p['path'] if c['key']=='arc']
 if kind=='fillText' or arc:
  if kind=='fillText':
   m=p['metrics'];x,y=map(Q,p['args'][1:3]);x0=x-Q(m['actualBoundingBoxLeft'])-1;x1=x+Q(m['actualBoundingBoxRight'])+1;y0=y-Q(m['actualBoundingBoxAscent'])-1;y1=y+Q(m['actualBoundingBoxDescent'])+1
  else:
   need(kind=='fill' and primitive['kind']=='circle' and len(p['path'])==len(arc)==1 and arc[0]['args'][3:]==[0,math.pi*2] and exact(arc[0]['matrix'])==exact(M),'fullcircle literal');x,y,r=map(Q,arc[0]['args'][:3]);x0,x1,y0,y1=x-r,x+r,y-r,y+r
  mm=list(map(Q,M));points=[(mm[0]*x+mm[2]*y+mm[4],mm[1]*x+mm[3]*y+mm[5]) for x in [x0,x1] for y in [y0,y1]]
  return {k:directed(op(p[i] for p in points)+(-2 if low else 2),not low) for k,i,op,low in [('x0',0,min,True),('x1',0,max,False),('y0',1,min,True),('y1',1,max,False)]}
 need(kind in ['fill','stroke'] and primitive['kind'] in ['rrect','poly','line'],'primitive scope');xy=[]
 for c in p['path']:
  need(exact(c['matrix'])==exact(M),'path matrix')
  if c['key'] in ['moveTo','lineTo']:xy.append(c['args'][:2])
  elif c['key']=='arcTo':need(primitive['kind']=='rrect','arcTo');xy.extend([c['args'][:2],c['args'][2:4]])
  else:need(c['key']=='closePath','path command')
 pad=0
 if kind=='stroke':need(primitive['kind']=='line' and len(xy)==2 and s['lineCap']=='butt','two point line');pad=s['lineWidth']/2
 X=interval(min(p[0] for p in xy)-pad,max(p[0] for p in xy)+pad);Y=interval(min(p[1] for p in xy)-pad,max(p[1] for p in xy)+pad)
 wx=plus(plus(times([M[0]]*2,X),times([M[2]]*2,Y)),[M[4]]*2);wy=plus(plus(times([M[1]]*2,X),times([M[3]]*2,Y)),[M[5]]*2)
 return {'x0':nextf(wx[0]-2,False),'x1':nextf(wx[1]+2,True),'y0':nextf(wy[0]-2,False),'y1':nextf(wy[1]+2,True)}
def clocks(c):
 h=1/60;N=lambda t:math.floor(t/h+1e-6);last=math.nextafter(c['end'],-math.inf);need(c['h']==h and bits(last)==int(c['lastBits']),'clock domain');pre=c['preimages'];need(len(pre)==250 and len(c['states'])==250,'250 states');previous=-1;passes=0
 for i,(p,s) in enumerate(zip(pre,c['states'])):
  lo,hi=int(p['firstBits']),int(p['lastBits']);need(lo==previous+1 and hi>=lo and N(number(lo))==N(number(hi))==i and int(p['count'])==hi-lo+1,'Number preimage adjacency');need((lo==0 or N(number(lo-1))==i-1) and (hi==bits(last) or N(number(hi+1))==i+1),'Number neighboring preimages');need(exact(s['firstTime'])==exact(number(lo)) and s['n']==i and exact(s['q'])==exact(i*h),'state first');previous=hi
  for own,(name,lag) in zip(s['passes'],[('B',1.6/24),('A',.8/24),('main',0)]):
   tp=max(0.,i*h-lag);need(own['pass']==name and exact(own['tp'])==exact(tp) and exact(own['lt'])==exact(tp) and exact(own['ltb'])==exact(tp+lag) and own['step']==math.floor(tp/(1/24)+1e-6) and own['active']==(0<=tp<4),'source selector clock');passes+=int(own['active'])
 need(previous==bits(last) and int(c['domainNumberCount'])==previous+1 and passes==727,'complete domain/pass count')
def rowcheck(frame,cut):
 if frame['oracle']:return
 rows=frame['rows'];glyphs=frame['glyphs'];need(len(rows)==len(frame['passes'])*(1 if cut['text']=='風の先へ' else 2),'row count')
 visible=[]
 for p in frame['passes']:
  rs=[r for r in rows if r['pass']==p['pass']];need([r['r'] for r in rs]==list(range(len(rs))),'row order')
  need(''.join(''.join(r['rowsD'][i]) for i,r in enumerate(rs))==cut['text'],'row membership text')
  for ri,r in enumerate(rs):
   gi=sum(len(v) for v in r['rowsD'][:ri]);dT=max(.04,min(.09,cut['dur']*.3/len(cut['text'])));need(r['gi']==gi and exact(r['dT'])==exact(dT) and exact(r['T0'])==exact(.1),'gi/dT source')
   need(all(exact(r[k])==exact(p[k]) for k in ['lt','ltb','step','pIn','pOut']),'row ownclock')
   recipe=frame['recipe'];dy=0 if recipe['kind']=='native' else recipe['deltas'][0 if recipe['kind']=='joint-translation' else ri][1];need(exact(r['delta'])==exact([0,dy]),'vertical recipe')
   for j,text in enumerate(r['rowsD'][ri]):
    ti=.1+(gi+j)*dT;clamp=lambda x:max(0.,min(1.,x));fade=clamp((p['pOut']-.7)/.3);vis=clamp((p['lt']-ti+.08)/.1)*(1-fade*fade*fade)
    if vis>0:visible.append((p,text,max(0.,ti)/max(.005,cut.get('stagger') or .04)))
 need(len(glyphs)==len(visible),'all visible source glyph items')
 for g,(p,text,mi) in zip(glyphs,visible):need(g['item']['text']==text and g['item']['font']=='dela' and exact(g['item']['mi'])==exact(mi) and all(exact(g[k])==exact(p[k]) for k in ['pass','lt','ltb','step','pIn','pOut']),'glyph text/mi/clock')
def projection(f):return {k:f[k] for k in ['n','time','passes','glyphs']}|{'records':[{k:v for k,v in p.items() if k not in ['owner','role']} for p in f['records']]}
def pair(a,b,c):
 need(len(a)==len(b),'support pair count');fails=[]
 for i,(x,y) in enumerate(zip(a,b)):
  need(all(exact(x[k])==exact(y[k]) for k in ['role','owner','ordinal','semanticKey']),'pair semantics');a0=x['bounds'];bb=y['bounds'];same=exact(a0['x0'])==exact(bb['x0']) and exact(a0['x1'])==exact(bb['x1']);stage=bb['y0']<0 or bb['y1']>540;cx,cy,r=Q(c['cx']),Q(c['cy']),Q(c['r'])+Q(c['margin']);nx=min(max(cx,Q(bb['x0'])),Q(bb['x1']));ny=min(max(cy,Q(bb['y0'])),Q(bb['y1']));hit=(nx-cx)**2+(ny-cy)**2<=r*r
  if not same or stage or hit:fails.append({'index':i,'owner':y['owner'],'sourceXChanged':not same,'yStageFailure':stage,'circleFailure':hit})
 return fails
def check(folder,output):
 folder=pathlib.Path(folder);result={'state':'FAIL_DOMINO26_RAW','adapterRegistered':False,'fullStageStrictClaim':False,'publicChecks':0,'imagesViewed':0};stats=collections.Counter()
 try:
  m=json.loads((folder/'manifest.json').read_bytes());need(m['mode']=='domino26-bounded-all-number-clock-source-pilot' and not m['adapterRegistered'] and not m['safetyCertified'],'scope');need(m['limits']=={'requestBytes':16777216,'serializedOutputBytes':268435456,'entriesPerTable':100000,'keyBytesPerTable':67108864},'caps');epoch=-1;tables={};kb={};total=0;init={};native={};destination={};oracle={};plans={};evaluations=collections.defaultdict(list);results={};regions={}
  for seq,row in enumerate(m['records']):
   b=(folder/row['file']).read_bytes();need(len(b)==row['bytes'] and hashlib.sha256(b).hexdigest()==row['sha256'],'gzip integrity');raw=gzip.decompress(b);need(len(raw)==row['jsonBytes'],'json bytes');total+=len(raw);need(total<=268435456,'serialized cap');r=json.loads(raw);need(r['sequence']==seq and r['case']==row['case'] and r['storageCodecRevision']==m['codec']=='source69-root-and-metadata59-gzip-v2','record binding')
   if r['tableEpoch']!=epoch:need(r['tableEpoch']==epoch+1,'epoch');epoch=r['tableEpoch'];tables={k:[] for k in ['matrix','paint','catalog']};kb={k:0 for k in tables}
   for k,delta in r['tableDeltas'].items():
    for entry in delta:need(entry['id']==len(tables[k]),'table IDs');tables[k].append(entry['value']);kb[k]+=len(json.dumps(entry['value'],ensure_ascii=False,separators=(',',':')).encode('utf-8','backslashreplace'))
    s=r['tableStats'][k];need(s['entries']==len(tables[k])<=100000 and s['canonicalKeyBytes']==kb[k]<=67108864,'table caps')
   v=restore(r['binding'],tables);phase=v['phase'];fixture=v['fixture'];need(row['phase']==phase and row['case']==fixture,'case phase');stats[phase]+=1
   if phase=='init':init[fixture]=v['init'];clocks(v['init']['clocks']);native[fixture]=[]
   elif phase.endswith('-frame'):
    f=v['frame'];need(not f.get('supportError'),'preserved support failure: '+json.dumps(f.get('supportError')));n=int(f['n']);expected=init[fixture]['clocks']['states'][n];need(exact(f['time'])==exact(expected['firstTime']) and len(f['passes'])==sum(p['active'] for p in expected['passes']),'actual passes');
    for a,p in zip(f['passes'],[p for p in expected['passes'] if p['active']]):need(all(exact(a[k])==exact(p[k]) for k in ['pass','tp','lt','ltb','step']),'actual clock')
    need(len(f['records'])==len(f['paintPrimitives'])<=2048,'paint counts');rowcheck(f,init[fixture]['plan']['cuts'][0])
    if not f['oracle']:
     need(len(f['supports'])==len(f['records']),'all positive paints supported')
     for i,(p,primitive,s) in enumerate(zip(f['records'],f['paintPrimitives'],f['supports'])):need(exact(support(p,primitive))==exact(s['bounds']) and s['ordinal']==i and s['role']==p['role']=='primary' and s['owner']==p['owner'],'independent support bounds');stats['supports']+=1
    if phase=='native-frame':need(n==len(native[fixture]),'native order');native[fixture].append(f)
    else:
     if not f['oracle']:
      strip=lambda rs:[{k:v for k,v in r.items() if k!='delta'} for r in rs]
      need(exact(strip(f['rows']))==exact(strip(native[fixture][n]['rows'])),'unchanged row pitch/lean/gi/source model')
     key=(fixture,v['region'],f['recipe']['id'],n);(oracle if f['oracle'] else destination)[key]=f
     if key in oracle and key in destination:need(exact(projection(oracle[key]))==exact(projection(destination[key])),'original closure equality');stats['oraclePairs']+=1
   elif phase=='candidate-plan':plans[(fixture,v['region'])]=v
   elif phase=='pair-evaluation':
    key=(fixture,v['region'],v['recipe']['id']);n=int(v['n']);f=native[fixture][n] if v['recipe']['kind']=='native' else destination[key+(n,)];need(v['recipe']['kind']=='native' or key+(n,) in oracle,'oracle required');e=v['evaluation'];fail=pair(native[fixture][n]['supports'],f['supports'],plans[(fixture,v['region'])]['circle']);need(e['passed']==(not fail) and exact(e.get('failures',[]))==exact(fail),'independent pair decision');evaluations[key].append((n,e['passed']))
   elif phase=='candidate-result':
    key=(fixture,v['region'],v['recipe']['id']);ev=evaluations[key];need([n for n,_ in ev]==list(range(int(v['checked']))) and (len(ev)==250 and all(p for _,p in ev))==v['accepted'],'candidate complete');need(v['accepted'] or ev and not ev[-1][1] and all(p for _,p in ev[:-1]),'early first witness');results[key]=v
   elif phase=='region-result':
    key=(fixture,v['region']);regions[key]=v
    if v['winner']:need(results[key+(v['winner']['id'],)]['accepted'],'winner must pass250')
   else:need(phase=='source-held-heuristic','known phase')
  need(total==m['serializedBytes'] and m['complete'] and not m['errors'],'producer complete');need(len(init)==2 and all(len(f)==250 for f in native.values()) and len(regions)==4,'two families four regions');result.update(state='PASS_DOMINO26_LIMITED_RAW',stats=dict(stats),serializedBytes=total,winners={str(k):v['winner'] for k,v in regions.items()},conditionalModelOnly=True,whole009Complete=False)
 except BaseException as e:result['failure']={'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()}
 pathlib.Path(output).write_text(json.dumps(result,ensure_ascii=True,indent=2)+'\n');print(json.dumps(result),flush=True);return result
if __name__=='__main__':raise SystemExit(0 if check(sys.argv[1],sys.argv[2])['state']=='PASS_DOMINO26_LIMITED_RAW' else 1)
