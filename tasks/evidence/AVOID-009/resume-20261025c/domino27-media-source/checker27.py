"""Media27 numeric-only parent check. Reuses accepted checker26 support/clock/row/pair math.
The sole timing reinterpretation is frame.time=j/60 inside the same verified T48
Number preimage, replacing checker26's frame.time==state.firstTime obligation.
No browser, image decode/display, network, Git, or product writes.
"""
import sys
sys.dont_write_bytecode=True
import collections,gzip,hashlib,json,math,pathlib,runpy,struct,traceback
C=runpy.run_path('/dev/shm/avoid009-domino26/source02/checker26.py')
need=C['need'];exact=C['exact'];dec=C['R']['dec']
CIRCLE={'cx':480,'cy':108,'r':108,'margin':2.7}
DY=109.18999999999997

def check(folder,output):
 folder=pathlib.Path(folder);stats=collections.Counter();result={'state':'FAIL_DOMINO27_MEDIA_RAW','imagesViewed':0,'publicChecks':0,'adapterRegistered':False,'conditionalModelOnly':True,'fullStageStrictClaim':False,'whole009Complete':False,'nativeBefore':'isolated patched source native recipe branch; not a separate product baseline build','timing':'j/60 belongs to independently verified T48 number preimage; all actual pass/glyph clocks unchanged'}
 def integrity(ref):
  path=pathlib.Path(ref['path']);path=path if path.is_absolute() else folder/path
  need(path.is_relative_to(folder),'media evidence path escaped folder');b=path.read_bytes();need(len(b)==ref['bytes'] and hashlib.sha256(b).hexdigest()==ref['sha256'],'file bytes/hash '+str(path));return b
 try:
  m=json.loads((folder/'manifest.json').read_bytes());need(m['complete'] is True and not m['errors'],'producer completion');need(m['kind']=='domino27-one-upper-media' and m['fixture']=='one-row-upper' and m['circle']=={'cx':.5,'cy':.2,'radius':.2},'single accepted condition');need((m['width'],m['height'],m['frames'],m['fps'])==(960,540,250,60),'capture contract');need(m['adapterRegistered'] is False and m['fullStageStrictClaim'] is False,'limited scope');need(m['keys']==[14,90,231],'three static times');need(m['independentCandidateRGBAOracle'] is True,'oracle required')
  phases=collections.Counter(r['phase']for r in m['records']);need(phases=={'init':2,'exact-j-qualified':250,'encoded-frame':500},'complete records');initial={r['side']:r['value']for r in m['records']if r['phase']=='init'};need(set(initial)=={'before','after'},'two init pages')
  for init in initial.values():
   C['clocks'](init['clocks']);cut=init['plan']['cuts'][0];need(cut['text']=='風の先へ' and cut['seed']==1205 and all(cut['params'].get(k)==v for k,v in {'font':'dela','face':'light','pips':True}.items()),'source fixture')
  need(exact(initial['before']['clocks'])==exact(initial['after']['clocks']) and exact(initial['before']['plan'])==exact(initial['after']['plan']),'same source clock and plan');clock=initial['before']['clocks'];cut=initial['before']['plan']['cuts'][0]
  frames={};rawbytes=0
  def framecheck(f,n,label):
   need(int(f['n'])==n and exact(f['time'])==exact(n/60),'exact media time');pre=clock['preimages'][n];need(pre['reachable'] and C['number'](pre['firstBits'])<=n/60<=C['number'](pre['lastBits']) and math.floor((n/60)/clock['h']+1e-6)==n,'same number preimage');expected=clock['states'][n];active=[p for p in expected['passes']if p['active']];need(len(f['passes'])==len(active),'actual selected pass count')
   for a,p in zip(f['passes'],active):need(all(exact(a[k])==exact(p[k])for k in ['pass','tp','lt','ltb','step']),'actual pass clock/order')
   need(f['oracle']==(label=='oracle') and not f.get('supportError'),'frame mode/support complete');need('png' not in f and 'base64' not in f,'no PNG payload in detailed raw');need(len(f['records'])==len(f['paintPrimitives'])<=2048,'paint scope');need(len(f['SHA256'])==64 and all(c in '0123456789abcdef'for c in f['SHA256']),'RGBA digest')
   C['rowcheck'](f,cut)
   if label!='oracle':
    need(len(f['records'])==len(f['supports']),'all paint supports')
    for i,(p,primitive,s)in enumerate(zip(f['records'],f['paintPrimitives'],f['supports'])):
     need(exact(C['support'](p,primitive))==exact(s['bounds']) and s['ordinal']==i and s['role']==p['role']=='primary' and s['owner']==p['owner'],'independent Fraction/48 support');stats['supports']+=1
   stats[label+'Frames']+=1
  qualification=[r for r in m['records']if r['phase']=='exact-j-qualified']
  for n,r in enumerate(qualification):
   need(r['j']==n and exact(r['time'])==exact(n/60),'qualification order');need(len(r['evidence'])==3,'three literal frames');fs=[]
   for label,ref in zip(['native','destination','oracle'],r['evidence']):
    need(ref['path']=='raw/'+label+'-'+str(n).zfill(3)+'.json.gz','raw name/order');raw=gzip.decompress(integrity(ref));need(len(raw)<=16777216,'single raw cap');rawbytes+=len(raw);need(rawbytes<=268435456,'total raw cap');f=dec(json.loads(raw));framecheck(f,n,label);fs.append(f);stats['restoredDetailedRaw']+=1
   a,b,o=fs;need(a['recipe']=={'kind':'native','deltas':[]},'native branch recipe');recipe=b['recipe'];need(recipe['kind']=='joint-translation' and exact(recipe['deltas'])==exact([[0,DY]]) and exact(recipe)==exact(o['recipe']),'same fixed joint dy');need(exact(C['projection'](b))==exact(C['projection'](o)) and b['SHA256']==o['SHA256'],'independent source closure paint/glyph/clock/RGBA');stats['oraclePairs']+=1
   strip=lambda rows:[{k:v for k,v in row.items()if k!='delta'}for row in rows]
   need(exact(strip(a['rows']))==exact(strip(b['rows'])),'source rows unchanged apart from common dy');need(exact([{k:v for k,v in g.items()if k!='matrix'}for g in a['glyphs']])==exact([{k:v for k,v in g.items()if k!='matrix'}for g in b['glyphs']]),'source glyph/mi/ownclock/order unchanged')
   fails=C['pair'](a['supports'],b['supports'],CIRCLE);need(not fails,'native X/y-stage/strict circle');e=r['evaluation'];need(e['passed'] is True and not e.get('failures',[]) and e['checked']==len(a['supports']),'producer pair decision');need((r['nativeSHA256'],r['afterSHA256'],r['oracleSHA256'])==(a['SHA256'],b['SHA256'],o['SHA256']),'qualification digests');frames[n]={'before':a['SHA256'],'after':b['SHA256']}
  need(rawbytes==m['rawJSONBytes'] and m['detailedRawCount']==750 and stats['restoredDetailedRaw']==750,'all750 literal raws/bytes');need(len(list((folder/'raw').glob('*.json.gz')))==750,'no omitted detailed raw')
  for side in ['before','after']:
   encoded=[r for r in m['records']if r['phase']=='encoded-frame' and r['side']==side];need(len(encoded)==250,'encoded count')
   for n,r in enumerate(encoded):need(r['n']==n and exact(r['time'])==exact(n/60) and r['SHA256']==frames[n][side] and r['PNGBytes']>24 and len(r['PNGSHA256'])==64,'encoded source hash/time/order');stats['encodedFrames']+=1
  need(len(m['videos'])==2 and {r['side']for r in m['videos']}=={'before','after'},'video sides')
  for ref in m['videos']:
   integrity(ref);p=ref['probe'];need(len(p['streams'])==1 and len(p['frames'])==250,'probe counts');v=p['streams'][0]
   for k,value in {'codec_name':'h264','width':960,'height':540,'r_frame_rate':'60/1','avg_frame_rate':'60/1','sample_aspect_ratio':'1:1','pix_fmt':'yuv420p'}.items():need(v[k]==value,'probe '+k)
   need(int(v['nb_read_frames'])==250 and abs(float(v['duration'])-250/60)<=1e-6 and 250/60-1e-6<=float(p['format']['duration'])<=250/60+.001001,'probe duration')
   for n,f in enumerate(p['frames']):need(f['media_type']=='video' and abs(float(f['best_effort_timestamp_time'])-n/60)<=1e-6 and (n==0 or int(f['best_effort_timestamp'])>int(p['frames'][n-1]['best_effort_timestamp'])),'probe PTS')
   stats['videos']+=1
  need(len(m['statics'])==6 and {(r['side'],r['j'])for r in m['statics']}=={(s,n)for s in ['before','after']for n in [14,90,231]},'six statics')
  for ref in m['statics']:
   b=integrity(ref);need(b[:8]==bytes.fromhex('89504e470d0a1a0a') and struct.unpack('>II',b[16:24])==(960,540),'PNG native dimensions');r=next(r for r in m['records']if r['phase']=='encoded-frame' and r['side']==ref['side'] and r['n']==ref['j']);need(ref['sha256']==r['PNGSHA256'] and ref['bytes']==r['PNGBytes'] and exact(ref['time'])==exact(ref['j']/60),'static encoded integrity');stats['statics']+=1
  integrity(m['comparison']);result.update(state='PASS_DOMINO27_MEDIA_NUMERIC_LIMITED',stats=dict(stats),rawJSONBytes=rawbytes,freshVisualReview='PENDING_SEPARATE_SOL',humanMotionReview='PENDING')
 except BaseException as e:result['failure']={'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()};result['partialStats']=dict(stats)
 pathlib.Path(output).write_text(json.dumps(result,ensure_ascii=True,indent=2)+'\n');print(json.dumps(result),flush=True);return result
if __name__=='__main__':raise SystemExit(0 if check(sys.argv[1],sys.argv[2])['state']=='PASS_DOMINO27_MEDIA_NUMERIC_LIMITED'else 1)
