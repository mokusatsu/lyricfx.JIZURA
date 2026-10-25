"""Offline independent decoder/clock/full-paint/RGBA subset checker. No execution on import."""
import sys
sys.dont_write_bytecode=True
import base64,gzip,hashlib,json,math,pathlib,runpy,struct,traceback
ROOT=pathlib.Path('/workspace/lyricfx.JIZURA')
R=runpy.run_path(str(ROOT/'tasks/evidence/AVOID-009/resume-20261025/parent-read-raw69.py'));restore=R['restore'];U=R['UNDEFINED']
def need(v,message):
 if not v:raise AssertionError(message)
def exact(v):
 if v is U:return ('$undefined',)
 if isinstance(v,(float,int)) and not isinstance(v,bool):return ('$f64',struct.pack('>d',v).hex())
 if isinstance(v,list):return tuple(exact(x) for x in v)
 if isinstance(v,dict):return tuple(sorted((k,exact(x)) for k,x in v.items()))
 return v
def rgba(v):
 need(v['encoding']=='literal-RGBA-unorm8-base64' and v['bytes']==960*540*4,'RGBA encoding');b=base64.b64decode(v['data'],validate=True);need(len(b)==v['bytes'],'RGBA bytes');return b
def projection(rows):return [{k:v for k,v in p.items() if k not in ['owner','role']} for p in rows]
def check(folder,output):
 folder=pathlib.Path(folder);result={'state':'FAIL_CROSSWORD28_SPARSE_FIDELITY','restoredRecords':0,'allCrosswordCertified':False,'geometrySafetyCertified':False,'publicChecks':0,'imagesViewed':0,'qualityNotApproved':True};total=0;tables={k:[] for k in ['matrix','paint','catalog']};seen=set();quality_failures=0
 try:
  manifest=json.loads((folder/'manifest.json').read_bytes());host=json.loads((folder/'host-receipt.json').read_bytes());init=host['init'];cut=init['plan']['cuts'][0];need(cut['lineText']==cut['text']=='風の先へ','natural lineText preserved');need(not host['networkAttempts'],'network forbidden')
  for seq,row in enumerate(manifest['records']):
   data=(folder/row['file']).read_bytes();need(len(data)==row['bytes'] and hashlib.sha256(data).hexdigest()==row['sha256'],'gzip integrity');raw=gzip.decompress(data);need(len(raw)==row['JSONBytes']<=16777216,'raw length cap');total+=len(raw);need(total<=268435456,'total cap');record=json.loads(raw);need(record['tableEpoch']==0 and record['CODEC69']==manifest['CODEC69']=='source69-root-and-metadata59-gzip-v2','codec')
   for key,delta in record['tableDeltas'].items():
    for entry in delta:need(entry['id']==len(tables[key]),'table index');tables[key].append(entry['value'])
    need(len(tables[key])<=100000,'table cap')
   v=restore(record['binding'],tables);n=int(v['n']);mode=v['caseId'];own=v['own'];key=(mode,n,own['pass']);need(key not in seen,'duplicate tuple');seen.add(key)
   need(mode in ['off','zero','move','cell60below'] and n in [0,18,24,90,231,249],'subset scope');a=v['actual'];b=v['expected'];c=v['registered'];need(exact(a['records'])==exact(b['records']) and exact(a['calls'])==exact(b['calls']) and exact(a['clock'])==exact(b['clock']),'independent oracle full values');need(rgba(a['rgba'])==rgba(b['rgba']),'oracle full RGBA')
   need(not a['paintError'] and not b['paintError'] and a['rootRestored'] and b['rootRestored'],'no partial paint accepted')
   for sample in [a,b]+([c] if c is not None else []):
    need(not sample['paintError'] and sample['rootRestored'],'healthy sample');need(all(p['role']=='primary' and p['owner'].startswith('crossword28.') for p in sample['records']),'all primary');need(all(f['passed'] and (f.get('unboundRegisteredNative') or f['acceptedCSS']==f['actualCSS']) for f in sample['fontChecks']),'font source acceptance')
   if mode in ['off','zero']:need(c is not None and exact(projection(a['records']))==exact(projection(c['records'])) and rgba(a['rgba'])==rgba(c['rgba']),'registered native full paint/RGBA')
   else:need(c is None,'extra baseline unexpectedly absent/present')
   clock=a['clock'];q=n*(1/60);lag={'B':1.6/24,'A':.8/24,'main':0}[own['pass']];tp=max(0.,q-lag);need(tp<4 and exact(own['tp'])==exact(tp),'native selector');need(math.floor(clock['realTime']/(1/60)+1e-6)==n,'realTime quantized preimage');need(exact(clock['t'])==exact(tp) and exact(clock['lt'])==exact(tp) and exact(clock['ltb'])==exact(tp+lag) and clock['step']==math.floor(tp/(1/24)+1e-6),'own clock');need(exact(clock['pOut'])==exact(max(0.,min(1.,(tp-(4-.4))/.4))),'pOut')
   mains=[x['item'] for x in a['calls'] if x['kind']=='main'];need(''.join(it['text'] for it in mains)=='風の先へ','full source lyric/order');need(all(exact(it['mi'])==exact(max(0.,.25+i*.11)/max(.005,cut.get('stagger') or .04)) for i,it in enumerate(mains)),'main native mi')
   clues=[x['args'][0] for x in a['calls'] if x.get('sub')=='clue'];need([it['text'] for it in clues]==['ヨコのカギ','9  (4)','タテのカギ','3  ─'] and len(clues)==4,'all source clues');need(all(exact(it['size'])==exact(16.384) for it in clues),'native clue sizes');numbers=[x['args'][0] for x in a['calls'] if x.get('sub')=='number'];need(all(it['size']>=12 and exact(it['size'])==exact(68.26666666666667*.2) for it in numbers),'number native size')
   quality_failures+=int(not v['quality']['passed']);result['restoredRecords']+=1
  expected={(mode,n,pa) for mode in ['off','zero','move','cell60below'] for n in [0,18,24,90,231,249] for pa,lag in [('B',1.6/24),('A',.8/24),('main',0)] if max(0.,n*(1/60)-lag)<4}
  need(seen==expected and manifest['complete'] and host['complete'],'complete sparse tuple coverage');need(total==manifest['JSONBytes'],'all bytes counted');result.update(state='PASS_CROSSWORD28_SPARSE_FIDELITY_ONLY',storedJSONBytes=total,allPaintAndSourcecallAndClockValuesCompared=True,fullRGBABytesCompared=True,naturalLineTextPreserved=True,qualityDiagnosticFailures=quality_failures,geometrySafetyCertified=False)
 except BaseException as e:result['failure']={'type':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()}
 pathlib.Path(output).write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result));return 0 if result['state'].startswith('PASS_') else 1
if __name__=='__main__':sys.exit(check(sys.argv[1],sys.argv[2]))
