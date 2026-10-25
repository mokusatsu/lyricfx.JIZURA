"""Streaming exact-j media evidence checker. Reuses source31 numeric predicates/decoder, no renderer."""
import sys
sys.dont_write_bytecode=True
import collections,gzip,hashlib,json,math,pathlib,resource,runpy,struct,traceback
BASE=pathlib.Path('/dev/shm/avoid009-crossword26');S=runpy.run_path(str(BASE/'source31/checker30.py'));need=S['need'];exact=S['exact'];restore=S['restore'];geometry=S['geometry'];support_check=S['support_check'];point=S['point'];inverse=S['inverse'];bbox=S['bbox'];NUMBERS=S['NUMBERS']
def sha(b):return hashlib.sha256(b).hexdigest()
def native_quality(p):
 cell=68.26666666666667;gx=(960-9*cell-960*.24)/2;gy=(540-5*cell)/2;inv=inverse(p['root']);atoms=[]
 for r in p['records']:
  if not r['kind'].endswith('Text') or r['state']['alpha']<=0:continue
  m=r['metrics'];x,y=r['args'][1:3];q=[(x-m['actualBoundingBoxLeft']-1,y-m['actualBoundingBoxAscent']-1),(x+m['actualBoundingBoxRight']+1,y-m['actualBoundingBoxAscent']-1),(x+m['actualBoundingBoxRight']+1,y+m['actualBoundingBoxDescent']+1),(x-m['actualBoundingBoxLeft']-1,y+m['actualBoundingBoxDescent']+1)];atoms.append({'owner':r['owner'],'local':bbox([point(inv,*point(r['matrix'],*v)) for v in q])})
 passed=cell*.7>=18.9
 for c in p['calls']:
  if c.get('sub')!='number':continue
  it=c['args'][0];col=math.floor((it['x']-gx)/cell-.07+.5);row=math.floor((it['y']-gy)/cell-.15+.5);box={'x0':gx+col*cell,'y0':gy+row*cell,'x1':gx+(col+1)*cell,'y1':gy+(row+1)*cell};owned=[a for a in atoms if a['owner']==c['owner']]
  if not(it['size']>=12 and it['size']==cell*.2):passed=False
  for a in owned:
   b=a['local']
   if min(b['x0']-box['x0'],b['y0']-box['y0'],box['x1']-b['x1'],box['y1']-b['y1'])<0:passed=False
   for other in atoms:
    if not('.main.' in other['owner'] or '.pencil.' in other['owner']):continue
    y=other['local']
    if b['x0']<=y['x1'] and y['x0']<=b['x1'] and b['y0']<=y['y1'] and y['y0']<=b['y1']:passed=False
 need(passed==p['quality']['passed'],'native quality diagnostic independently kept');return passed

def frame_check(f,m):
 j=int(f['j']);need(0<=j<250 and exact(f['time'])==exact(j/60),'exact media time');variant=f['variant'];need(variant in ['native','destination','oracle'],'variant');winner=m['winner'];cut=m['init']['plan']['cuts'][0];state=m['init']['clocks']['states'][j];pre=next(x for x in m['init']['clocks']['preimages'] if x['n']==j and x['reachable']);need(pre['firstTime']<=f['time']<=pre['lastTime'] and math.floor(f['time']/(1/60)+1e-6)==j,'same complete Number preimage');own=[p for p in state['passes'] if p['active']];need(f['expectedPasses']==own and len(f['passes'])==len(own),'actual stock selected pass count');need(f['healthy'] and not f['frameError'],'healthy stock frame');need(f['rgba']['bytes']==2073600 and len(f['rgba']['sha256'])==64 and all(c in '0123456789abcdef' for c in f['rgba']['sha256']),'full native RGBA byte digest');need(exact(f['delta'])==exact([0,0] if variant=='native' else winner['delta']),'fixed delta');native=variant=='native';cell=68.26666666666667*(1 if native else .58);gx=(960-9*cell-(960*.24 if native else 0))/2;gy=(540-5*cell-(0 if native else 16.384*5))/2;qualityFlags=[]
 for p,expected in zip(f['passes'],own):
  need(p['own']==expected,'complete original own tuple');c=p['clock'];n=j;lag={'B':1.6/24,'A':.8/24,'main':0}[expected['pass']];tp=max(0,j*(1/60)-lag);need(c['pass']==expected['pass'] and exact(c['t'])==exact(tp) and exact(c['lt'])==exact(tp) and exact(c['ltb'])==exact(tp+lag) and exact(c['realTime'])==exact(j/60) and c['step']==math.floor(tp/(1/24)+1e-6),'actual own phase and clocks');need(exact(c['pIn'])==exact(max(0,min(1,tp/.35))) and exact(c['pOut'])==exact(max(0,min(1,(tp-3.6)/.4))),'actual independent pIn/pOut');need(p['sourceCalls']==1 and p['rootRestored'] and p['allPrimary'] and not p['paintError'],'source once/root restored');need(all(r['role']=='primary' and r['owner'].startswith('crossword28.') for r in p['records']),'all primary source paints');need(all(x['passed'] and x['acceptedCSS']==x['actualCSS'] for x in p['fontChecks']),'accepted source font');mains=[x['item'] for x in p['calls'] if x['kind']=='main'];need(''.join(x['text'] for x in mains)=='風の先へ' and len(mains)==4,'full main/order')
  for i,it in enumerate(mains):need(exact(it['mi'])==exact(max(0,.25+i*.11)/max(.005,cut.get('stagger') or .04)) and exact(it['size'])==exact(cell*(.7 if native else .65)) and exact(it['x'])==exact(gx+(1+i+.5)*cell) and exact(it['y'])==exact(gy+(2+(.56 if native else .64))*cell),'natural stagger and fixed main cell/size')
  clues=[x['args'][0] for x in p['calls'] if x.get('sub')=='clue'];need([x['text'] for x in clues]==['ヨコのカギ','9  (4)','タテのカギ','3  ─'] and all(exact(x['size'])==exact(16.384) for x in clues),'full4native clues')
  for x in p['calls']:
   if x.get('sub')!='number':continue
   it=x['args'][0];rr,cc=NUMBERS[it['text']];need(exact(it['size'])==exact(68.26666666666667*.2) and exact(it['x'])==exact((gx+cc*cell)+cell*.07) and exact(it['y'])==exact((gy+rr*cell)+cell*.15),'native-size number/topology')
  supports=p['support'];need(not supports['error'],'no unsupported paint accepted');need([s['ordinal'] for s in supports['rows']]==[i for i,r in enumerate(p['records']) if r['state']['alpha']>0],'all actual positive primary supports')
  for s in supports['rows']:support_check(p['records'][int(s['ordinal'])],s)
  if native:qualityFlags.append(native_quality(p));need(p['geometry'] is None,'native geometry not accepted as destination')
  else:
   q=S['quality']({'actual':p,'shape':winner['shape'],'delta':winner['delta'],'quality':p['quality']});qualityFlags.append(q);gg=geometry(supports['rows'],winner['circle']);need(q and gg['passed'] and p['geometry']['passed'] and gg['checked']==p['geometry']['checked'],'strict candidate all phase circle/stage and quality')
 if native:need(f['qualityPassed'] is None and f['geometryPassed'] is None,'native diagnostics only')
 else:need(f['qualityPassed'] is True and f['geometryPassed'] is True,'candidate hard conditions')
 return qualityFlags

def source_semantic(f):
 rows=[]
 for p in f['passes']:
  calls=[]
  for c in p['calls']:
   if c['kind']=='main':calls.append({'kind':'main','item':{k:v for k,v in c['item'].items() if k not in ['x','y','size']}})
   elif c['kind']=='draw':calls.append({'kind':'draw','sub':c['sub'],'item':{k:v for k,v in c['args'][0].items() if k not in ['x','y','size']}})
   elif c['kind']=='rect':calls.append({'kind':'rect','source':c['args'][4:]})
   elif c['kind']=='line':calls.append({'kind':'line','color':c['args'][1],'source':c['args'][3:]})
   else:need(False,'unknown sourcecall')
  rows.append({'clock':p['clock'],'own':p['own'],'calls':calls})
 return rows

def check(folder,output):
 folder=pathlib.Path(folder);output=pathlib.Path(output);need(not output.exists(),'fresh media review output');result={'state':'FAIL_CROSSWORD32_MEDIA_NUMERIC','Canvas':0,'imagesViewed':0,'rawPersistence':'RAM_ONLY','publicChecks':0,'formalPerformanceAccepted':False,'conditionalModelOnly':True,'fullPostFXQualified':False,'adapterRegistered':False};stats=collections.Counter();total=0
 try:
  m=json.loads((folder/'manifest.json').read_bytes());d=json.loads((folder/'details/manifest.json').read_bytes());need(m['complete'] and not m['errors'] and not m['networkAttempts'] and not m['pageErrors'] and d['complete'],'complete/offline');winner=m['winner'];need(winner['id']=='58A-default-left-bottom' and exact(winner['delta'])==exact([-291.6562058007809,141.39171833166608]) and winner['shape']=={'id':'58A','scale':.58,'below':True,'profile':'A'} and winner['circle']=={'id':'default','cx':480,'cy':226.8,'effectiveRadius':110.7},'one fixed accepted winner');cut=m['init']['plan']['cuts'][0];need(cut['lineText']==cut['text']=='風の先へ' and exact(cut['stagger'])==exact(0.03950859557604417),'natural input unmodified');need(m['init']['clocks']['actualCounts']=={'states':250,'selectedPasses':727},'full original clock');need(len(d['records'])<=96,'record cap');tables={k:[] for k in ['matrix','paint','catalog']};current={};hashes={};qualifications=[];lastJ=-1
  for ref in d['records']:
   b=(folder/'details'/ref['file']).read_bytes();need(len(b)==ref['bytes'] and sha(b)==ref['sha256'],'detail gzip integrity');raw=gzip.decompress(b);need(len(raw)==ref['JSONBytes']<=16777216,'detail record cap');total+=len(raw);need(total<=268435456,'detail total cap');record=json.loads(raw);del b,raw;need(record['CODEC69']==d['CODEC69']=='source69-root-and-metadata59-gzip-v2' and record['tableEpoch']==0,'original codec')
   for k,delta in record['tableDeltas'].items():
    for x in delta:need(x['id']==len(tables[k]),'table order');tables[k].append(x['value'])
    need(len(tables[k])<=100000,'table cap')
   binding=record['binding'];need(binding['type']=='array' and 0<len(binding['items'])<=64 and len(binding['items'])==ref['values'],'batch64')
   for item in binding['items']:
    v=restore(item,tables);stats['values']+=1
    if v['kind']=='media-frame':
     need(v['j']==lastJ+1 and v['variant']==['native','destination','oracle'][len(current)],'stream250triple phase/order');frame_check(v,m);current[v['variant']]=v;stats['frames']+=1;stats['passes']+=len(v['passes']);stats['supports']+=sum(len(p['support']['rows']) for p in v['passes'])
    elif v['kind']=='media-qualified':
     need(set(current)=={'native','destination','oracle'} and v['j']==lastJ+1,'complete qualification triple');a,dd,o=[current[k] for k in ['native','destination','oracle']];projection=lambda f:{k:x for k,x in f.items() if k!='variant'};need(exact(projection(dd))==exact(projection(o)),'all literal numeric paint/calls/clock/quality/support values');need(exact(source_semantic(a))==exact(source_semantic(dd)),'native source order/fonts/colors/alpha/mi/phase preserved');need(dd['rgba']['sha256']==o['rgba']['sha256'] and v['rgbaEqual'] and v['fullRGBABytesCompared']==2073600 and v['allNumericEqual'] and v['healthy'] and v['candidateQualityPassed'] and v['strictCircleStagePassed'],'samepage full byte comparison evidence');need(v['nativeSHA256']==a['rgba']['sha256'] and v['destinationSHA256']==dd['rgba']['sha256'] and v['oracleSHA256']==o['rgba']['sha256'] and exact(v['time'])==exact(v['j']/60),'qualified hashes/time');hashes[v['j']]={'before':a['rgba']['sha256'],'after':dd['rgba']['sha256']};qualifications.append(v);lastJ=v['j'];current.clear();stats['qualified']+=1
    else:need(False,'unexpected failed or unknown media row')
    del v
   del record,binding,item
  need(not current and lastJ==249 and stats['qualified']==250 and stats['frames']==750 and stats['values']==1000==d['values']==m['detailValues'] and total==d['JSONBytes'],'all750frames/250qualifications/counts/caps');need(stats['passes']==2181,'all3variants727ownpasses');need(m['detailedFrames']==750 and m['qualified']==250 and m['encoded']==500,'producer coverage');need([r for r in m['records'] if r['kind']=='media-qualified']==qualifications,'all manifest qualifications')
  encoded={}
  for side in ['before','after']:
   rows=[r for r in m['records'] if r['kind']=='encoded-frame' and r['side']==side];need(len(rows)==250,'250encoded each side')
   for j,r in enumerate(rows):need(r['j']==j and exact(r['time'])==exact(j/60) and r['SHA256']==hashes[j][side] and r['PNGBytes']>24 and len(r['PNGSHA256'])==64,'encoded original RGBA/PNG/time');encoded[(side,j)]=r;stats['encoded']+=1
  def integrity(ref):
   p=pathlib.Path(ref['path']);need(p.is_relative_to(folder),'artifact within output');b=p.read_bytes();need(len(b)==ref['bytes'] and sha(b)==ref['sha256'],'artifact byte integrity');return b
  need(len(m['videos'])==2 and {r['side'] for r in m['videos']}=={'before','after'},'2videos')
  for ref in m['videos']:
   integrity(ref);p=ref['probe'];need(len(p['streams'])==1 and len(p['frames'])==250,'probe counts');v=p['streams'][0]
   for k,value in {'codec_name':'h264','width':960,'height':540,'r_frame_rate':'60/1','avg_frame_rate':'60/1','sample_aspect_ratio':'1:1','pix_fmt':'yuv420p'}.items():need(v[k]==value,'native probe '+k)
   need(int(v['nb_read_frames'])==250 and abs(float(v['duration'])-250/60)<=1e-6 and 250/60-1e-6<=float(p['format']['duration'])<=250/60+.001001,'duration')
   for j,f in enumerate(p['frames']):need(f['media_type']=='video' and abs(float(f['best_effort_timestamp_time'])-j/60)<=1e-6 and (j==0 or int(f['best_effort_timestamp'])>int(p['frames'][j-1]['best_effort_timestamp'])),'all250PTS')
   stats['videos']+=1
  need(len(m['statics'])==6 and {(r['side'],r['j']) for r in m['statics']}=={(s,j) for s in ['before','after'] for j in [14,90,231]},'6keyPNGs')
  for ref in m['statics']:
   b=integrity(ref);r=encoded[(ref['side'],ref['j'])];need(b[:8]==bytes.fromhex('89504e470d0a1a0a') and struct.unpack('>II',b[16:24])==(960,540),'nativePNG');need(ref['sha256']==r['PNGSHA256'] and ref['bytes']==r['PNGBytes'] and exact(ref['time'])==exact(ref['j']/60),'PNGencoded integrity');stats['statics']+=1
  integrity(m['comparison']);need(len(list((folder/'images').glob('*.png')))==6 and len(list((folder/'videos').glob('*.mp4')))==2,'artifact scope');result.update(state='PASS_CROSSWORD32_MEDIA_NUMERIC_LIMITED',stats=dict(stats),storedJSONBytes=total,freshVisualReview='PENDING_SEPARATE_SOL',humanMotionReview='PENDING')
 except BaseException as e:result['failure']={'name':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()};result['partialStats']=dict(stats)
 result['peakRSSBytes']=resource.getrusage(resource.RUSAGE_SELF).ru_maxrss*1024;result['RSSMeaning']='Linux ru_maxrss diagnostic only; no formal performance acceptance'
 with output.open('x') as f:json.dump(result,f,ensure_ascii=False,indent=2);f.write('\n')
 print(json.dumps(result,ensure_ascii=False));return 0 if result['state'].startswith('PASS_') else 1
if __name__=='__main__':sys.exit(check(sys.argv[1],sys.argv[2]))
