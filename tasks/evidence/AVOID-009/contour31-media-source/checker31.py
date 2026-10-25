"""Numeric-only contour31 media review. Reuse source30 Fraction/interval/clock helpers.
No browser, image viewing/decoding, network or Git. Actual media time is exact j/60.
"""
import sys
sys.dont_write_bytecode=True
from pathlib import Path
import collections,gzip,hashlib,json,math,runpy,struct,traceback
SOURCE=Path('/dev/shm/avoid009-contour26/source30/checker30.py');C=runpy.run_path(str(SOURCE));need=C['need'];exact=C['exact'];dec=C['dec'];U=C['U']
SPEC={'heroScale':.5,'heroDelta':[-482.,0.],'bodyDelta':[472.,0.]};CIRCLE={'cx':480.,'cy':540*.42,'r':108.,'margin':2.7}
def equal(a,b):return exact(a)==exact(b)
def projection(f):return {**f,'mode':None,'byteComparison':None}
def framecheck(f,n,label,init,stats):
 clock=init['clocks'];cut=init['plan']['cuts'][0];state=next(s for s in clock['states'] if s['n']==n);pre=next(p for p in clock['preimages'] if p['n']==n);time=n/60
 need(f['n']==n and equal(f['time'],time) and equal(f['firstTime'],state['firstTime']),'exact j media clock');need(pre['reachable'] and pre['firstTime']<=time<=pre['lastTime'] and math.floor(time/clock['h']+1e-6)==n,'same Number preimage')
 need(f['mode']=={'native':'native','destination':'candidate','oracle':'oracle'}[label] and f['frameFailure'] is None and f['adapterRegistered'] is False,'successful scoped frame');need(equal(f['spec'],None if label=='native' else SPEC),'fixed recipe')
 active=[p for p in state['passes'] if p['active']];need([p['clock']['pass'] for p in f['passes']]==[p['pass'] for p in active],'stock frame active pass order')
 # Source30 helper remains unchanged: a shallow expected-state view substitutes
 # exact media time for firstTime solely in actual-realTime comparison.
 mediaClock={'states':[{**state,'firstTime':time}]}
 for p,own in zip(f['passes'],active):
  C['actual_clock']({'n':n,'own':own,'realTime':time},p,mediaClock,cut);need(equal(p['clock'],{'pass':own['pass'],**p['calls'][0]['clock']}),'actual stock pass clock');need(equal(p['root'],p['finalRoot']) and len(p['root'])==6,'actual live CTM restored');C['supports'](p)
  need(p['calls'][0]['name']=='mainDraw' and p['calls'][0]['args'][0]['text']=='風の先へ','complete original lyric call')
  for call in p['calls']:
   need(call['seed']==1205 and equal(call['params'],cut['params']),'same params/seed')
   if call['name']=='draw':need(call['args'][0]['text']=='風  ─  No.01','full attached metadata')
  for r in p['records']:need(r['pass']==own['pass'],'actual paint pass')
 need(equal(f['records'],[r for p in f['passes'] for r in p['records']]) and equal(f['supports'],[s for p in f['passes'] for s in p['supports']]),'no omitted source paint/support');need(f['positivePaintCount']==sum(r['state']['alpha']>0 for r in f['records'])==len(f['supports']),'all primary positive paints supported');need(len(f['rgbaSHA256'])==64 and all(c in '0123456789abcdef' for c in f['rgbaSHA256']),'full-stage RGBA digest');need('png' not in f and 'base64' not in f,'numeric raw only');stats[label+'Frames']+=1

def check(folder,output):
 folder=Path(folder).resolve();stats=collections.Counter();result={'state':'FAIL_CONTOUR31_MEDIA_NUMERIC','imagesViewed':0,'publicChecks':0,'adapterRegistered':False,'conditionalModelOnly':True,'fullPostFXQualified':False,'freshVisualReview':'PENDING_SEPARATE_SOL','humanMotionReview':'PENDING'}
 def integrity(ref):
  p=Path(ref['path']);p=(p if p.is_absolute() else folder/p).resolve();need(p.is_relative_to(folder),'media evidence path outside run');b=p.read_bytes();need(len(b)==ref['bytes'] and hashlib.sha256(b).hexdigest()==ref['sha256'],'media full-byte integrity');return b
 try:
  m=json.loads((folder/'manifest.json').read_bytes());need(m['complete'] is True and not m['errors'],'producer complete');need(m['kind']=='contour31-one-default-media' and m['fixture']=='hero-half-left-native-body-right-default','fixed fixture');need(equal(m['spec'],SPEC) and equal(m['circle'],CIRCLE),'fixed accepted default winner');need((m['width'],m['height'],m['frames'],m['fps'])==(960,540,250,60) and m['keys']==[14,90,231],'native frame contract');need(m['adapterRegistered'] is False and m['geometryConditional'] is True and m['fullStageStrictClaim'] is True and m['independentCandidateRGBAOracle'] is True,'conditional source media only');need(m['renderOptions']=={'noHud':True,'noPost':True,'noForeground':True,'noMedia':True,'fast':True},'established scoped stock frame options')
  phases=collections.Counter(r['phase'] for r in m['records']);need(phases=={'init':2,'exact-j-evaluation':250,'exact-j-qualified':250,'encoded-frame':500},'complete media record structure');inits={r['side']:r['value'] for r in m['records'] if r['phase']=='init'};need(set(inits)=={'before','after'} and equal(inits['before'],inits['after']),'same exact source/font/plan/clock init');init=inits['before'];C['clock'](init['clocks']);cut=init['plan']['cuts'][0]
  need(init['plan']['W']==960 and init['plan']['H']==540 and len(init['plan']['cuts'])==1 and cut['layout']=='contour' and cut['text']=='風の先へ' and cut['seed']==1205,'original contour fixture');need(equal(cut['params'],{'font':'dela','fb':'dela','side':1.,'rings':6.,'speed':.375,'col':'sub','place':'low'}),'source contour params');need(equal(init['spec'],SPEC) and init['adapterRegistered'] is False,'same controlled recipe');need(init['actualFontPolicy']=='controlled hash-pinned Noto sans-bold under dela ID; not original Dela glyph qualification','controlled font policy')
  frames={};rawbytes=0;qual=[r for r in m['records'] if r['phase']=='exact-j-qualified'];evals=[r for r in m['records'] if r['phase']=='exact-j-evaluation']
  for n,row in enumerate(qual):
   need(row['j']==n and equal(row['time'],n/60) and len(row['evidence'])==3,'exact-j qualification order');values=[]
   for label,ref in zip(['native','destination','oracle'],row['evidence']):
    need(ref['path']=='raw/'+label+'-'+str(n).zfill(3)+'.json.gz','literal750 raw order/path');b=gzip.decompress(integrity(ref));rawbytes+=len(b);need(len(b)<=16777216 and rawbytes<=268435456,'existing media raw caps');f=dec(json.loads(b));framecheck(f,n,label,init,stats);values.append(f);stats['restoredDetailedRaw']+=1
   a,d,o=values;need(equal(projection(d),projection(o)),'destination/source-oracle all paint/call/root/support/RGBA');need(equal(o['byteComparison'],{'n':n,'channels':2073600.,'equal':True,'differentChannels':0.,'first':None}),'producer complete bytewise RGBA comparison');need(a['byteComparison'] is None and d['byteComparison'] is None,'RGBA comparison phase');need(len(a['passes'])==len(d['passes']),'native/destination pass count')
   for before,after in zip(a['passes'],d['passes']):need(equal(before['clock'],after['clock']),'native/destination phase unchanged');C['check_calls'](after,before,SPEC);stats['nativeBodyPairs']+=1
   evaluation=C['evaluation'](d['supports'],CIRCLE);need(evaluation['passed'] and all(equal(row['evaluation'][k],v) for k,v in evaluation.items()),'independent strict default all-primary circle/stage');ev=evals[n];need(ev['j']==n and equal(ev['evaluation'],row['evaluation']) and equal(ev['evidence'],row['evidence']),'preassert evaluation retained');need((row['nativeSHA256'],row['afterSHA256'],row['oracleSHA256'])==(a['rgbaSHA256'],d['rgbaSHA256'],o['rgbaSHA256']),'qualified full-stage digest columns');frames[n]={'before':a['rgbaSHA256'],'after':d['rgbaSHA256']};stats['sourceOraclePairs']+=1
  need(rawbytes==m['rawJSONBytes'] and m['detailedRawCount']==750 and stats['restoredDetailedRaw']==750 and len(list((folder/'raw').glob('*.json.gz')))==750,'all750 numeric detailed raw')
  for side in ['before','after']:
   rows=[r for r in m['records'] if r['phase']=='encoded-frame' and r['side']==side];need(len(rows)==250,'250 encoded source frames')
   for n,row in enumerate(rows):need(row['n']==n and equal(row['time'],n/60) and row['SHA256']==frames[n][side] and row['PNGBytes']>24 and len(row['PNGSHA256'])==64,'all500 encoded RGBA hashes/time/order');stats['encodedFrames']+=1
  need(len(m['videos'])==2 and {r['side'] for r in m['videos']}=={'before','after'},'two video sides')
  for ref in m['videos']:
   integrity(ref);p=ref['probe'];need(len(p['streams'])==1 and len(p['frames'])==250,'probe frame counts');v=p['streams'][0]
   for key,value in {'codec_name':'h264','width':960,'height':540,'r_frame_rate':'60/1','avg_frame_rate':'60/1','sample_aspect_ratio':'1:1','pix_fmt':'yuv420p'}.items():need(v[key]==value,'native probe '+key)
   need(int(v['nb_read_frames'])==250 and abs(float(v['duration'])-250/60)<=1e-6 and 250/60-1e-6<=float(p['format']['duration'])<=250/60+.001001,'probe duration')
   for n,f in enumerate(p['frames']):need(f['media_type']=='video' and abs(float(f['best_effort_timestamp_time'])-n/60)<=1e-6 and (n==0 or int(f['best_effort_timestamp'])>int(p['frames'][n-1]['best_effort_timestamp'])),'probe all PTS')
   stats['videos']+=1
  need(len(m['statics'])==6 and {(r['side'],r['j']) for r in m['statics']}=={(side,n) for side in ['before','after'] for n in [14,90,231]},'six native statics')
  for ref in m['statics']:
   b=integrity(ref);need(b[:8]==bytes.fromhex('89504e470d0a1a0a') and struct.unpack('>II',b[16:24])==(960,540),'PNG native dimensions');row=next(r for r in m['records'] if r['phase']=='encoded-frame' and r['side']==ref['side'] and r['n']==ref['j']);need(ref['sha256']==row['PNGSHA256'] and ref['bytes']==row['PNGBytes'] and equal(ref['time'],ref['j']/60),'static/encoder integrity');stats['statics']+=1
  integrity(m['comparison']);result.update(state='PASS_CONTOUR31_MEDIA_NUMERIC_LIMITED',stats=dict(stats),rawJSONBytes=rawbytes,independentSupportCount=C['stats']['paintSupports'],bodyFontSizePolicy='native unchanged; hero scale0.5 only',RGBAComparison='producer full-byte oracle comparison plus numeric raw/hash review; fullRGBA bytes not archived',allClockMedia='250 exact j/60 frames; source30 Number-preimage proof reused separately')
 except BaseException as e:result['failure']={'type':type(e).__name__,'message':str(e),'stack':traceback.format_exc()};result['partialStats']=dict(stats)
 with Path(output).open('x') as f:json.dump(result,f,ensure_ascii=True,indent=2);f.write('\n')
 print(json.dumps(result),flush=True);return result
if __name__=='__main__':raise SystemExit(0 if check(sys.argv[1],sys.argv[2])['state']=='PASS_CONTOUR31_MEDIA_NUMERIC_LIMITED' else 1)
