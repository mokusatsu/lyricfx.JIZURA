"""Raw-only bounded burst review: independent Float64 clock + Fraction/interval support geometry.
No browser/image/network/Git. A finite-family shortage is a completed diagnostic, not success of avoidance.
"""
import collections,gzip,hashlib,json,math,pathlib,runpy,struct,sys,traceback
from fractions import Fraction as F
ROOT=pathlib.Path('/workspace/lyricfx.JIZURA')
R=runpy.run_path(str(ROOT/'tasks/evidence/AVOID-009/resume-20261025/parent-read-raw69.py'));restore=R['restore'];UNDEFINED=R['UNDEFINED']
def need(v,msg):
 if not v:raise AssertionError(msg)
def exact(a,b):
 if a is UNDEFINED or b is UNDEFINED:return a is b
 if isinstance(a,bool) or isinstance(b,bool):return type(a) is type(b) and a==b
 if isinstance(a,(int,float)) and isinstance(b,(int,float)):return struct.pack('>d',a)==struct.pack('>d',b)
 if isinstance(a,dict) and isinstance(b,dict):return a.keys()==b.keys() and all(exact(a[k],b[k]) for k in a)
 if isinstance(a,list) and isinstance(b,list):return len(a)==len(b) and all(exact(x,y) for x,y in zip(a,b))
 return type(a) is type(b) and a==b
def bits(v):return struct.unpack('>Q',struct.pack('>d',v))[0]
def number(v):return struct.unpack('>d',struct.pack('>Q',int(v)))[0]
def directed(v,up):
 x=float(v)
 if (F(x)<v if up else F(x)>v):x=math.nextafter(x,math.inf if up else -math.inf)
 need(F(x)>=v if up else F(x)<=v,'outward Fraction conversion');return x
def interval(a,b):return [math.nextafter(a,-math.inf),math.nextafter(b,math.inf)]
def iadd(a,b):return interval(a[0]+b[0],a[1]+b[1])
def imul(a,b):
 p=[a[0]*b[0],a[0]*b[1],a[1]*b[0],a[1]*b[1]];return interval(min(p),max(p))
def ray_bounds(p):
 path=p['path'];need(len(path)==2 and [x['key'] for x in path]==['moveTo','lineTo'] and p['state']['lineCap']=='butt','T48 ray literal');M=list(map(float,p['matrix']));need(all(exact(x['matrix'],p['matrix']) for x in path),'ray same CTM');xy=[list(map(float,x['args'])) for x in path];pad=float(p['state']['lineWidth'])/2
 X=interval(min(x[0] for x in xy)-pad,max(x[0] for x in xy)+pad);Y=interval(min(x[1] for x in xy)-pad,max(x[1] for x in xy)+pad)
 wx=iadd(iadd(imul([M[0]]*2,X),imul([M[2]]*2,Y)),[M[4]]*2);wy=iadd(iadd(imul([M[1]]*2,X),imul([M[3]]*2,Y)),[M[5]]*2)
 return dict(x0=math.nextafter(wx[0]-2,-math.inf),x1=math.nextafter(wx[1]+2,math.inf),y0=math.nextafter(wy[0]-2,-math.inf),y1=math.nextafter(wy[1]+2,math.inf))
def bounds(p):
 st=p['state'];need(st['alpha']>0 and st['filter']=='none' and st['dash']==[] and st['blend']=='source-over' and not st['shadowBlur'] and not st['shadowOffsetX'] and not st['shadowOffsetY'],'paint effects');need(p['role']=='primary' and p['owner']=='burst.native-plate','primary');kind=p['kind'];M=list(map(F,p['matrix']));ring=False;pad=F(0)
 if kind=='stroke' and len(p['path'])==2 and all(c['key'] in ['moveTo','lineTo'] for c in p['path']):return ray_bounds(p),'none-existing-T48-two-point-line-support'
 if kind.endswith('Text'):
  need(st['textBaseline']=='middle' and st['textAlign']=='center','text alignment');x,y=map(F,p['args'][1:3]);m=p['metrics'];tp=F(1)+(F(st['lineWidth'])*F(float(st['miterLimit'])/2) if kind=='strokeText' else F(0));x0=x-F(m['actualBoundingBoxLeft'])-tp;x1=x+F(m['actualBoundingBoxRight'])+tp;y0=y-F(m['actualBoundingBoxAscent'])-tp;y1=y+F(m['actualBoundingBoxDescent'])+tp;local=[(x0,y0),(x1,y0),(x1,y1),(x0,y1)]
 elif kind.endswith('Rect'):
  x,y,w,h=map(F,p['args']);local=[(x,y),(x+w,y),(x+w,y+h),(x,y+h)];pad=F(st['lineWidth'])*F(float(st['miterLimit'])/2) if kind=='strokeRect' else F(0)
 else:
  need(kind in ['fill','stroke'],'paint kind');arcs=[c for c in p['path'] if c['key']=='arc']
  if arcs:
   need(len(arcs)==1 and len(p['path'])==1 and exact(arcs[0]['matrix'],p['matrix']),'ring full path');a=arcs[0]['args'];need(len(a)==5 and a[3]==0 and exact(a[4],math.pi*2),'full ring arc');x,y,r=map(F,a[:3]);need(r>=0,'radius');local=[(x-r,y-r),(x+r,y-r),(x+r,y+r),(x-r,y+r)];ring=kind=='stroke';need(not ring or st['lineCap']=='butt','full ring cap')
  else:
   local=[]
   for c in p['path']:
    need(c['key'] in ['moveTo','lineTo','closePath'],'polygon path')
    if c['key']!='closePath':need(exact(c['matrix'],p['matrix']),'path CTM');local.append(tuple(map(F,c['args'][:2])))
   need(len(local)>=3,'polygon vertices');pad=F(st['lineWidth'])*F(float(st['miterLimit'])/2) if kind=='stroke' else F(0)
 if pad:
  xs=[v[0] for v in local];ys=[v[1] for v in local];x0=min(xs)-pad;x1=max(xs)+pad;y0=min(ys)-pad;y1=max(ys)+pad;local=[(x0,y0),(x1,y0),(x1,y1),(x0,y1)]
 points=[(M[0]*x+M[2]*y+M[4],M[1]*x+M[3]*y+M[5]) for x,y in local];px=py=F(0)
 if ring:px=(abs(M[0])+abs(M[2]))*F(st['lineWidth'])/2;py=(abs(M[1])+abs(M[3]))*F(st['lineWidth'])/2
 raw=dict(x0=min(x for x,y in points)-2-px,x1=max(x for x,y in points)+2+px,y0=min(y for x,y in points)-2-py,y1=max(y for x,y in points)+2+py)
 return {k:directed(v,k.endswith('1')) for k,v in raw.items()},'ring-stroke-existing-circle-atom-plus-exact-affine-halfwidth' if ring else 'none'
def geometry(supports,c):
 failures=[];cx,cy=F(c['cx']),F(c['cy']);rr=(F(c['r'])+F(c['margin']))**2
 for i,s in enumerate(supports):
  b={k:F(v) for k,v in s['bounds'].items()};nx=max(b['x0'],min(cx,b['x1']));ny=max(b['y0'],min(cy,b['y1']));hit=(nx-cx)**2+(ny-cy)**2<=rr;stage=b['x0']<0 or b['x1']>960 or b['y0']<0 or b['y1']>540
  if hit or stage:failures.append({'index':i,'owner':s['owner'],'circle':hit,'stage':stage,'conservativeEnvelope':True})
 return failures
def clocks(c):
 h=c['h'];need(exact(h,1/60) and exact(c['end'],4.150001),'clock scope');last=math.nextafter(c['end'],-math.inf);need(exact(last,c['last']) and bits(last)==int(c['lastBits']),'last time');N=lambda x:math.floor(x/h+1e-6);lastbits=bits(last);need(int(c['domainNumberCount'])==lastbits+1,'Number count');need(len(c['preimages'])==len(c['states'])==250,'all states');count=0;previous=-1;passes=0
 for i,(p,s) in enumerate(zip(c['preimages'],c['states'])):
  lo,hi=int(p['firstBits']),int(p['lastBits']);need(p['reachable'] and int(p['n'])==i==int(s['n']) and lo==previous+1 and lo<=hi,'preimage adjacency');need(N(number(lo))==N(number(hi))==i and (lo==0 or N(number(lo-1))==i-1) and (hi==lastbits or N(number(hi+1))==i+1),'preimage Number boundaries');need(int(p['count'])==hi-lo+1 and exact(p['firstTime'],number(lo)) and exact(p['lastTime'],number(hi)) and exact(s['firstTime'],number(lo)),'preimage values');need(int(c['thresholds'][i]['firstBits'])==lo,'threshold');q=i*h;need(exact(s['q'],q),'q');expected=[]
  for name,lag in [('B',1.6/24),('A',.8/24),('main',0)]:
   tp=max(0,q-lag);expected.append({'pass':name,'lag':lag,'tp':tp,'lt':tp,'ltb':tp+lag,'step':math.floor(tp/(1/24)+1e-6),'active':tp<4})
  need(exact(s['passes'],expected),'actual selector finite family');passes+=sum(p['active'] for p in expected);previous=hi;count+=hi-lo+1
 need(previous==lastbits and count==lastbits+1 and passes==727 and c['actualCounts']=={'states':250,'selectedPasses':727},'clock total coverage')
 for b,n in c['queryBitsAndNs']:need(N(number(b))==n,'clock binary search query')
def frame_check(f,init,summary,mode=None):
 n=int(f['n']);state=init['clocks']['states'][n];need(exact(f['firstTime'],state['firstTime']) and f['sourceUnchanged'] and not f['adapterRegistered'],'frame context');expected=[p for p in state['passes'] if p['active']];need(len(expected)==len(f['passes']),'pass count');need(len(f['rgbaSHA256'])==64,'RGBA digest');need(len(f['records'])<=2048,'paint budget')
 for e,p in zip(expected,f['passes']):
  a=p['clock'];need(a['pass']==e['pass'] and exact(a['realTime'],state['firstTime']) and exact(a['t'],e['tp']),'actual clock');need(exact(p['root'],p['finalRoot']),'root restored')
  for k in ['lt','ltb','step']:need(exact(a[k],e[k]),'clock '+k)
  need(exact(a['pIn'],max(0,min(1,e['lt']/.35))) and exact(a['pOut'],max(0,min(1,(e['lt']-(4-.4))/.4))),'phase clock')
 supports=[]
 for ordinal,p in enumerate(f['records']):
  need(p['role']=='primary' and p['owner']=='burst.native-plate','all raw paint ownership')
  if p['state']['alpha']<=0:continue
  b,normalization=bounds(p);s=f['supports'][len(supports)];need(int(s['ordinal'])==ordinal and s['owner']==p['owner'] and s['role']==p['role'] and s['kind']==p['kind'] and exact(s['bounds'],b) and s['normalization']==normalization,'independent support values');supports.append(s)
 need(len(supports)==len(f['supports'])==f['positivePaintCount'],'all positive primary paint supports')
 text='風の先へ' if f['recipe'] is None else next(r['recipe']['text'] for r in init['recipes'] if r['recipe']['id']==f['recipe'])
 for g in f['glyphs']:
  need(g['item']['text']==text and g['item']['font']=='dela','full lyric');p=next(p['clock'] for p in f['passes'] if p['clock']['pass']==g['pass'])
  for k in ['lt','ltb','step','pIn','pOut']:need(exact(g[k],p[k]),'glyph clock')
 summary['paintRecordsChecked']+=len(f['records']);summary['positiveSupportsChecked']+=len(supports);summary['actualPassesChecked']+=len(f['passes']);summary['glyphItemsChecked']+=len(f['glyphs'])
def digest(b):return hashlib.sha256(b).hexdigest()
def canonical(v):return json.dumps(v,ensure_ascii=False,separators=(',',':')).encode('utf-8','backslashreplace')
def review(folder,out):
 folder=pathlib.Path(folder);summary={'state':'FAIL_BURST26_FULLCLOCK_RAW','restoredRecords':0,'paintRecordsChecked':0,'positiveSupportsChecked':0,'actualPassesChecked':0,'glyphItemsChecked':0,'nativeFrames':0,'nativePasses':0,'firstFailureWitnesses':0,'oraclePairs':0,'geometrySafetyCertified':False,'publicChecks':0,'imagesViewed':0};init=None
 try:
  m=json.loads((folder/'manifest.json').read_bytes());need(m['version']==26 and m['mode']=='burst-bounded-fullclock-source' and not m['adapterRegistered'] and not m['safetyCertified'] and not m['comparisonAssetsCreated'],'manifest scope');summary['producerComplete']=m['complete'];summary['producerErrors']=m['errors'];tables={};keybytes={};epoch=-1;case=None;total=0;native={};families={};trials={};results={};circle_results={};recipes_done=collections.defaultdict(set);oracle_count=collections.Counter();seed={}
  for seq,row in enumerate(m['records']):
   summary['lastRecord']={'sequence':seq,'case':row['case'],'phase':row['phase']};b=(folder/row['file']).read_bytes();need(len(b)==row['bytes'] and digest(b)==row['sha256'],'stored gzip integrity');raw=gzip.decompress(b);need(len(raw)==row['jsonBytes'],'json bytes');total+=len(raw);need(total<=268435456,'serialized byte limit');rec=json.loads(raw);need(rec['sequence']==seq and rec['case']==row['case'] and rec['tableEpoch']==row['tableEpoch'] and rec['storageCodecRevision']==m['codec']=='source69-root-and-metadata59-gzip-v2','codec binding')
   if rec['tableEpoch']!=epoch:need(rec['tableEpoch']==epoch+1,'table epoch');epoch=rec['tableEpoch'];case=rec['case'];tables={k:[] for k in ['matrix','paint','catalog']};keybytes={k:0 for k in tables}
   need(rec['case']==case and set(rec['tableDeltas'])==set(tables),'table lifetime')
   for k,delta in rec['tableDeltas'].items():
    for entry in delta:need(entry['id']==len(tables[k]),'continuous table IDs');tables[k].append(entry['value']);keybytes[k]+=len(canonical(entry['value']))
    stats=rec['tableStats'][k];need(stats['entries']==len(tables[k])<=100000 and stats['canonicalKeyBytes']==keybytes[k]<=67108864 and stats['entryLimit']==100000 and stats['keyByteLimit']==67108864,'codec limits')
   v=restore(rec['binding'],tables);phase=v['phase'];need(phase==row['phase'],'phase restore');summary['restoredRecords']+=1
   if phase=='init':
    need(init is None,'one source initialization');init=v['init'];p=init['plan'];need(p['lang']=='ja' and p['W']==960 and p['H']==540 and len(p['cuts'])==1 and p['cuts'][0]['text']=='風の先へ' and p['cuts'][0]['layout']=='burst','initial scope');clocks(init['clocks']);need(len(init['recipes'])==9,'recipe budget')
   elif phase=='native-frame':
    f=v['frame'];need(int(f['n'])==len(native) and f['mode']=='native' and f['recipe'] is None,'native sequence');frame_check(f,init,summary);native[int(f['n'])]=f;summary['nativeFrames']+=1;summary['nativePasses']+=len(f['passes'])
   elif phase=='recipe-seed':
    frame_check(v['frame'],init,summary);need(v['frame']['n']==90 and v['frame']['recipe']==v['recipe']['id'] and exact(v['frame']['delta'],[0,0]),'seed scope');seed[(v['circle']['id'],v['recipe']['id'])]=v['frame']
   elif phase=='recipe-rejected':
    key=(v['circle']['id'],v['recipe']['id']);need(v['reason']=='writing-field-insufficient' and not v['dimensions']['writingFieldFits'],'quality rejection');recipes_done[key[0]].add(key[1])
   elif phase=='candidate-family':
    key=(v['circle']['id'],v['recipe']['id']);need(key not in families and 1<=len(v['family']['candidates'])<=9 and v['family']['maximumTotal']==81,'family bounded');families[key]=v;recipes_done[key[0]].add(key[1])
   elif phase=='candidate-frame':
    f=v['frame'];circle=v['circle'];key=(circle['id'],v['recipe']['id'],int(v['candidateOrdinal']));trial=trials.setdefault(key,[]);need(f['n']==len(trial),'candidate chronological order');family=families[key[:2]]['family']['candidates'][key[2]];need(exact(f['delta'],family['delta']),'candidate fixed delta')
    if v['reusedNative']:need(exact(f,native[int(f['n'])]),'cached native bytes')
    else:frame_check(f,init,summary);need(f['recipe']==key[1] and f['mode']=='candidate','candidate renderer')
    failures=geometry(f['supports'],circle);ev=v['evaluation'];need(exact(ev['failures'],failures) and ev['passed']==(len(failures)==0) and not ev['certificateIssued'] and not ev['allClockCoverageEstablished'] and not ev['entryExitRelaxation'],'actual destination geometry');trial.append((int(f['n']),len(f['passes']),failures));need(not any(x[2] for x in trial[:-1]),'early failure must stop')
   elif phase=='candidate-result':
    key=(v['circle']['id'],v['recipe']['id'],int(v['candidateOrdinal']));need(key not in results and key in trials,'candidate result unique');trial=trials[key];need(v['checked']==len(trial) and v['passes']==sum(x[1] for x in trial),'candidate counts');failed=trial[-1][2]
    if failed:need(v['status']=='rejected-first-witness' and v['failed']['n']==trial[-1][0] and exact(v['failed']['failures'],failed),'first failure witness');summary['firstFailureWitnesses']+=1
    else:need(v['status']=='all-clocks-geometry-passed' and v['checked']==250 and v['passes']==727 and v['failed'] is None,'complete candidate clocks')
    results[key]=v
   elif phase=='winner-oracle-pair':
    a,b=v['direct'],v['oracle'];frame_check(a,init,summary);frame_check(b,init,summary);need(a['mode']=='candidate' and b['mode']=='oracle' and exact({**a,'mode':None},{**b,'mode':None}),'independent original-source oracle equality');need(not geometry(a['supports'],v['circle']),'winner destination recheck');key=(v['circle']['id'],v['recipe']['id']);need(a['n']==oracle_count[key],'oracle chronological');oracle_count[key]+=1;summary['oraclePairs']+=1
   elif phase=='circle-result':
    cid=v['circle']['id'];need(cid in ['default','upper'] and cid not in circle_results and not v['certificateIssued'] and v['notGlobalImpossibility'],'circle outcome');winner=v['winner'];local=[r for k,r in results.items() if k[0]==cid];need(len(local)==len(v['outcomes'])-sum(1 for r in v['outcomes'] if r['status']=='quality-rejected'),'all candidate outcomes')
    if winner:need(v['status']=='bounded-source-candidate-awaiting-parent-review' and oracle_count[(cid,winner['recipe'])]==250 and winner['oraclePairs']==250 and winner['checked']==250 and winner['passes']==727,'winner full clocks')
    else:need(v['status']=='insufficient-space-in-evaluated-finite-family' and len(recipes_done[cid])==9,'all finite recipes considered')
    for key,family in families.items():
     if key[0]!=cid:continue
     got=[k[2] for k in results if k[:2]==key];expected=list(range(len(family['family']['candidates'])))
     if winner and winner['recipe']==key[1]:need(got==list(range(len(got))) and local[-1]['status']=='all-clocks-geometry-passed','winner stops future candidates')
     else:need(got==expected,'all declared candidates evaluated')
    circle_results[cid]=v
   else:need(False,'unknown phase '+phase)
  need(m['complete'] and not m['errors'] and init is not None and summary['nativeFrames']==m['nativeFrames']==250 and summary['nativePasses']==m['nativePasses']==727,'native full clock coverage');need(set(circle_results)=={'default','upper'} and total==m['serializedBytes'],'two circles/bytes');need(exact(list(circle_results.values()),m['outcomes']),'manifest outcomes');summary.update(state='PASS_BURST26_FULLCLOCK_RAW',serializedBytes=total,circleOutcomes={k:{'status':v['status'],'winner':v['winner']} for k,v in circle_results.items()},conditionalCapturedGeometryOnly=True,notGlobalImpossibility=True)
 except BaseException as e:summary['failure']={'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()}
 pathlib.Path(out).write_text(json.dumps(summary,ensure_ascii=True,indent=2)+'\n');print(json.dumps(summary,ensure_ascii=True),flush=True);return summary
if __name__=='__main__':
 r=review(sys.argv[1],sys.argv[2]);raise SystemExit(0 if r['state']=='PASS_BURST26_FULLCLOCK_RAW' else 1)
