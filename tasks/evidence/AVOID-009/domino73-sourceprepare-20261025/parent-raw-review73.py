"""Independent raw-only SOURCE73 representative-fidelity checker; no network/image/Git."""
import collections,gzip,hashlib,json,math,pathlib,runpy,struct,sys,traceback
ROOT=pathlib.Path('/workspace/lyricfx.JIZURA')
R=runpy.run_path(str(ROOT/'tasks/evidence/AVOID-009/resume-20261025/parent-read-raw69.py'))
restore=R['restore'];UNDEFINED=R['UNDEFINED']
def exact(a,b):
 if a is UNDEFINED or b is UNDEFINED:return a is b
 if isinstance(a,bool) or isinstance(b,bool):return type(a) is type(b) and a==b
 if isinstance(a,(int,float)) and isinstance(b,(int,float)):return struct.pack('>d',a)==struct.pack('>d',b)
 if isinstance(a,dict) and isinstance(b,dict):return a.keys()==b.keys() and all(exact(a[k],b[k]) for k in a)
 if isinstance(a,list) and isinstance(b,list):return len(a)==len(b) and all(exact(x,y) for x,y in zip(a,b))
 return type(a) is type(b) and a==b
def need(v,message):
 if not v:raise AssertionError(message)
def digest(b):return hashlib.sha256(b).hexdigest()
def canonical_bytes(v):return json.dumps(v,ensure_ascii=False,separators=(',',':')).encode('utf-8','backslashreplace')
def project(frame):return {**frame,'mode':None,'rows':None,'records':[{k:v for k,v in p.items() if k not in ['owner','role']} for p in frame['records']]}
def queries():return [{'lt':t,'pass':p,'scale':1,'fractional':False} for t in [0,.15,.35,.55,.76,1.5,3.8,4.05] for p in ['main','A','B']]+[{'lt':.23,'pass':'B','scale':.5,'fractional':True},{'lt':1.5,'pass':'main','scale':2,'fractional':True}]
def review(folder,out):
 folder=pathlib.Path(folder);summary={'state':'FAIL_SOURCE73_RAW_FIDELITY','geometrySafetyCertified':False,'producerComplete':False,'producerErrors':[],'restoredRecords':0,'phases':{},'cases':{},'pairedNativeFrames':0,'pairedMovedFrames':0,'allPaints':0,'glyphItems':0,'rowClocksChecked':0,'publicChecks':0,'imagesViewed':0}
 try:
  m=json.loads((folder/'manifest.json').read_bytes());summary.update(producerComplete=m.get('complete',False),producerErrors=m.get('errors',[]),producerRecordCount=len(m.get('records',[])))
  need(m['mode']=='native-source-representative-tuples-only' and not m['adapterRegistered'] and not m['safetyCertified'] and not m['comparisonAssetsCreated'],'manifest scope')
  limits={'requestBytes':16777216,'serializedOutputBytes':268435456,'entriesPerTable':100000,'keyBytesPerTable':67108864};need(m['limits']==limits,'unchanged limits')
  last_epoch=-1;case=None;tables={};keybytes={};init={};frames={};phases=collections.Counter();total=0
  for seq,row in enumerate(m['records']):
   summary['lastRecord']={'sequence':seq,'case':row['case'],'phase':row['phase'],'n':row['n']};b=(folder/row['file']).read_bytes();need(len(b)==row['bytes'] and digest(b)==row['sha256'],'gzip hash/bytes')
   raw=gzip.decompress(b);need(len(raw)==row['jsonBytes'],'JSON bytes');total+=len(raw);need(total<=limits['serializedOutputBytes'],'serialized cap');record=json.loads(raw)
   need(record['storageCodecRevision']==m['codec']=='source69-root-and-metadata59-gzip-v2' and record['sequence']==seq and record['case']==row['case'] and record['tableEpoch']==row['tableEpoch'],'codec record binding')
   if record['tableEpoch']!=last_epoch:
    need(record['tableEpoch']==last_epoch+1 and record['case']!=case,'epoch transition');last_epoch=record['tableEpoch'];case=record['case'];tables={k:[] for k in ['matrix','paint','catalog']};keybytes={k:0 for k in tables}
   need(record['case']==case and set(record['tableDeltas'])==set(tables),'case lifetime')
   for k,delta in record['tableDeltas'].items():
    for entry in delta:
     need(entry['id']==len(tables[k]),'continuous table IDs');tables[k].append(entry['value']);keybytes[k]+=len(canonical_bytes(entry['value']))
    stats=record['tableStats'][k];need(stats['entries']==len(tables[k])<=100000 and stats['canonicalKeyBytes']==keybytes[k]<=67108864 and stats['entryLimit']==100000 and stats['keyByteLimit']==67108864,'table cap/stats')
   value=restore(record['binding'],tables);need(value['phase']==row['phase'],'phase restore');phases[value['phase']]+=1
   fixture,mode=value['fixture'],value['mode'];need(case==fixture+'.'+mode,'fixture/case');summary['cases'][case]=summary['cases'].get(case,0)+1
   if value['phase']=='init':
    need(case not in init,'unique init');init[case]=value['init'];plan=init[case]['plan'];need(plan['lang']=='ja' and plan['W']==960 and plan['H']==540 and len(plan['cuts'])==1 and not init[case]['adapterRegistered'],'init family');need(plan['cuts'][0]['text']==('風の先へ' if fixture=='one-row' else '風の先へ歩いて行くよ'),'text fixture')
    reference=init.get(fixture+'.native')
    if reference:need(exact(plan,reference['plan']),'exact source plan')
   else:
    need(value['phase']=='frame' and case in init,'frame after init');frame=value['frame'];n=int(frame['n']);need(n==len(frames.setdefault(case,[])) and exact(frame['query'],queries()[n]),'query/order');frames[case].append(frame);need(row['n']==n and frame['mode']==mode,'frame binding');cut=init[case]['plan']['cuts'][0];q=frame['query'];clock=frame['clock'];lag=1.6/24 if q['pass']=='B' else .8/24 if q['pass']=='A' else 0;t=q['lt']+cut['start']
    need(exact(clock['lt'],q['lt']) and exact(clock['ltb'],q['lt']+lag) and clock['pass']==q['pass'] and exact(clock['t'],t) and exact(clock['realTime'],t+lag) and clock['step']==math.floor(t/(1/24)+1e-6),'own clock')
    need(frame['sourceUnchanged'] and not frame['adapterRegistered'] and exact(frame['root'],frame['finalRoot']) and len(frame['rgbaSHA256'])==64,'identity/root/hash');need(len(frame['records'])<=2048,'paint bound')
    for paint in frame['records']:need(paint['role']=='primary' and paint['owner'].startswith('dominoes.') and paint['kind'] in ['fill','stroke','fillRect','strokeRect','fillText','strokeText'],'all paints primary')
    if mode.startswith('on-'):need(all(p['owner'] in ['dominoes.row.0','dominoes.row.1'] for p in frame['records']),'row primary owners')
    summary['allPaints']+=len(frame['records']);summary['glyphItems']+=len(frame['glyphs'])
    if mode in ['off','on-zero']:need(exact(project(frame),project(frames[fixture+'.native'][n])),'native/off/zero all raw equality');summary['pairedNativeFrames']+=1
    if mode=='on-moved':need(exact(project(frame),project(frames[fixture+'.oracle-moved'][n])),'independent moved all raw equality');summary['pairedMovedFrames']+=1
    if mode.startswith('on-'):
     rows=frame['rows'];need(len(rows)==(1 if fixture=='one-row' else 2),'source row count');need(''.join(''.join(r['rowsD'][r['r']]) for r in rows)==cut['text'],'all source text/rows');visible=[]
     for ri,r in enumerate(rows):
      gi=sum(len(v) for v in r['rowsD'][:ri]);need(r['r']==ri and r['gi']==gi and exact(r['lt'],clock['lt']) and exact(r['ltb'],clock['ltb']) and r['pass']==clock['pass'] and exact(r['step'],clock['step']) and exact(r['pIn'],clock['pIn']) and exact(r['pOut'],clock['pOut']),'row ownclock/gi');need(exact(r['delta'],[0,0] if mode=='on-zero' else [17,-23]),'recipe delta');dT=max(.04,min(.09,cut['dur']*.3/len(cut['text'])));need(exact(r['dT'],dT) and exact(r['T0'],.1),'source stagger');summary['rowClocksChecked']+=1
      for j,text in enumerate(r['rowsD'][ri]):
       ti=.1+(gi+j)*dT;clamp=lambda x:max(0.,min(1.,x));fade=clamp((clock['pOut']-.7)/.3);vis=clamp((clock['lt']-ti+.08)/.1)*(1-fade*fade*fade)
       if vis>0:visible.append((text,max(0.,ti)/max(.005,(cut.get('stagger') or .04))))
     need(len(frame['glyphs'])==len(visible),'visible glyph coverage')
     for glyph,(text,mi) in zip(frame['glyphs'],visible):need(glyph['item']['text']==text and exact(glyph['item']['mi'],mi) and glyph['item']['font']=='dela' and exact(glyph['lt'],clock['lt']) and exact(glyph['ltb'],clock['ltb']),'glyph source/mi/clock')
   summary['restoredRecords']+=1;summary['phases']=dict(phases)
  need(total==m['serializedBytes'],'total byte sum');need(m['complete'] and not m['errors'] and len(m['records'])==270 and phases=={'init':10,'frame':260},'complete representative run');need(len(init)==10 and len(frames)==10 and all(len(f)==26 for f in frames.values()),'all cases complete');summary.update(state='PASS_SOURCE73_REPRESENTATIVE_RAW_FIDELITY',serializedBytes=total,rawAllValuesRestored=True)
 except BaseException as e:summary['failure']={'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()}
 pathlib.Path(out).write_text(json.dumps(summary,ensure_ascii=True,indent=2)+'\n');print(json.dumps(summary,ensure_ascii=True),flush=True);return summary
if __name__=='__main__':
 result=review(pathlib.Path(sys.argv[1]),pathlib.Path(sys.argv[2]));raise SystemExit(0 if result['state']=='PASS_SOURCE73_REPRESENTATIVE_RAW_FIDELITY' else 1)
