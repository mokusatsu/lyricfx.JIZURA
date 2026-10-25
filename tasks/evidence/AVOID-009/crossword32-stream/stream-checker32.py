"""Existing-raw-only streaming review. Source31 numeric predicates reused byte-for-byte by runpy.
No Canvas, renderer, encoder, network, archive or Git action. Full raw requires a parent gate.
"""
import sys
sys.dont_write_bytecode=True
import argparse,gzip,hashlib,json,os,pathlib,resource,runpy,traceback
BASE=pathlib.Path('/dev/shm/avoid009-crossword26');SOURCE31=BASE/'source31';CHECKER31=SOURCE31/'checker30.py'
S=runpy.run_path(str(CHECKER31));need=S['need'];exact=S['exact'];restore=S['restore'];geometry=S['geometry'];bbox=S['bbox'];tuple_check=S['tuple_check']
def sha(b):return hashlib.sha256(b).hexdigest()
def pin_check(p):
 data=pathlib.Path(p['path']).read_bytes();need(len(data)==p['bytes'] and sha(data)==p['sha256'],'reviewed input bytes '+p['path']);return data
def full_gate(folder,manifestBytes,gatePath):
 need(gatePath is not None,'full raw stream review requires parent gate');g=json.loads(pathlib.Path(gatePath).read_bytes());need(g['kind']=='CROSSWORD32_STREAMING_EXISTING_RAW_GATE' and g['accepted'] is True,'parent raw-only review gate');need(os.environ.get('CROSSWORD32_STREAM_REVIEW_RELEASE')=='PARENT_REVIEWED_EXISTING_RAW_ONLY','parent raw-only release absent');need(g['rawFolder']==str(folder) and g['manifestSHA256']==sha(manifestBytes),'exact original full raw binding');need(g['expectedActualTuples']==1533,'unchanged full producer coverage');need({str(CHECKER31),str(SOURCE31/'policy30.json'),str(pathlib.Path(__file__).resolve())}<={p['path'] for p in g['files']},'mandatory unchanged predicates/policy/stream source pins')
 for p in g['files']+g.get('runtime',[]):pin_check(p)
 return g

def check(folder,output,reviewedGate=None):
 folder=pathlib.Path(folder).resolve();output=pathlib.Path(output).resolve();need(not output.exists(),'fresh review output only');need(folder!=output and folder not in output.parents and folder.parent not in output.parents,'never write producer originals');result={'state':'FAIL_SOURCE30_PILOT','Canvas':0,'imagesViewed':0,'rawPersistence':'RAM_ONLY','geometrySafetyCertified':False,'publicChecks':0,'restoredValues':0};gate=None
 counters={'restoredValues':0,'actualTuples':0,'codecRecords':0,'maximumRestoredRowsHeld':1};total=0
 try:
  manifestBytes=(folder/'manifest.json').read_bytes();m=json.loads(manifestBytes);host=json.loads((folder/'host-receipt.json').read_bytes());policy=json.loads((SOURCE31/'policy30.json').read_bytes())
  if host.get('phase')=='full':gate=full_gate(folder,manifestBytes,reviewedGate)
  else:need(folder==BASE/'run30-representative02-20261025c/raw','only already accepted representative may be reviewed without full gate')
  need(host['init']['policy']==policy,'source-pinned policy');need(host['init']['clocks']['actualCounts']=={'states':250,'selectedPasses':727} and [s['n'] for s in host['init']['clocks']['states']]==list(range(250)),'fixed complete clock enumeration');cut=host['init']['plan']['cuts'][0];need(cut['lineText']==cut['text']=='風の先へ','natural fixture');need(not host['networkAttempts'] and not host['pageErrors'] and not host['consoleErrors'],'offline/error state');tables={k:[] for k in ['matrix','paint','catalog']};need(len(m['records'])<=96,'record cap')
  # Compact bookkeeping only: no actual/expected/RGBA/paint/calls are retained here.
  groups={};screens={};shapes={};anchorRows=[];finalRows=[];pilot=None;lastKind=None;representative=[]
  sparseExpected=[(n,pa) for n in policy['sparseN'] for pa,lag in [('B',1.6/24),('A',.8/24),('main',0)] if max(0,n*(1/60)-lag)<4]
  fullExpected=[(n,pa) for n in range(250) for pa,lag in [('B',1.6/24),('A',.8/24),('main',0)] if max(0,n*(1/60)-lag)<4]
  for ref in m['records']:
   data=(folder/ref['file']).read_bytes();need(len(data)==ref['bytes'] and sha(data)==ref['sha256'],'gzip bytes');raw=gzip.decompress(data);need(len(raw)==ref['JSONBytes']<=16777216,'record cap/length');total+=len(raw);need(total<=268435456,'total cap');record=json.loads(raw);del data,raw
   need(record['CODEC69']==m['CODEC69']=='source69-root-and-metadata59-gzip-v2' and record['tableEpoch']==0,'existing codec')
   for k,delta in record['tableDeltas'].items():
    for d in delta:need(d['id']==len(tables[k]),'table order');tables[k].append(d['value'])
    need(len(tables[k])<=100000,'table cap')
   binding=record['binding'];need(binding['type']=='array' and 0<len(binding['items'])<=64 and len(binding['items'])==ref['values'],'batch values')
   # Restore each array item, not the full64-value decoded batch. This bounds live RGBA to one tuple.
   for item in binding['items']:
    v=restore(item,tables);counters['restoredValues']+=1;lastKind=v['kind']
    if lastKind=='tuple':
     need(exact(v['time'])==exact(host['init']['clocks']['states'][int(v['n'])]['firstTime']),'original complete clock first preimage');q,g=tuple_check(v,policy,cut);key=(v['phase'],v['shape']['id'],v['circle']['id'] if v['circle'] else None,tuple(v['delta']));group=groups.setdefault(key,{'last':None,'sequence':[],'bad':0});need(group['last'] is None or group['last'][0] and group['last'][1] is not False,'first failure must stop immediately');group['last']=(q,g);group['sequence'].append((int(v['n']),v['own']['pass']));group['bad']+=int(not q or g is False);counters['actualTuples']+=1
     if v['phase']=='shape-screen':
      screen=screens.setdefault(v['shape']['id'],{'sequence':[],'bad':0,'lastBad':False,'supports':[]});screen['sequence'].append((int(v['n']),v['own']['pass']));screen['bad']+=int(not v['quality']['passed']);screen['lastBad']=not v['quality']['passed']
      screen['supports'].extend({'ordinal':s['ordinal'],'owner':s['owner'],'bounds':dict(s['bounds'])} for s in v['support']['rows'])
     elif v['phase']=='representative':representative.append((v['phase'],v['shape']['id'],v['n'],v['own']['pass']))
     # Full finalist rows need only group sequence/last flags, never support arrays after tuple validation.
    elif lastKind=='shape-result':
     sid=v['shape']['id'];need(sid not in shapes,'one screen per shape');screen=screens[sid];need(screen['sequence'],'screen evidence');bad=screen['bad']>0;need(v['passedSparseQuality']==(not bad) and (not bad or screen['lastBad'] and screen['bad']==1),'first shape witness');actual=screen['sequence'];need(actual==sparseExpected[:len(actual)] and (bad or len(actual)==len(sparseExpected)),'screen tuple coverage');shapes[sid]={'passedSparseQuality':v['passedSparseQuality'],'supports':screen['supports'] if not bad else []};del screens[sid]
    elif lastKind=='anchor-result':
     screen=shapes[v['shape']['id']];need(screen['passedSparseQuality'],'only quality survivors seed anchors');supports=screen['supports'];b=bbox([(s['bounds'][x],s['bounds'][y]) for s in supports for x,y in [('x0','y0'),('x1','y1')]]);side,vertical=v['id'].split('-')[-2:];dx=2-b['x0'] if side=='left' else 958-b['x1'];dy=2-b['y0'] if vertical=='top' else (540-b['y0']-b['y1'])/2 if vertical=='center' else 538-b['y1'];need(exact(v['delta'])==exact([dx,dy]),'fixed sparse-derived anchor');gg=geometry(supports,v['circle'],v['delta']);need(gg['passed']==v['geometry']['passed'] and gg['checked']==v['geometry']['checked'],'independent sparse anchor geometry');anchorRows.append(v)
    elif lastKind=='finalist-result':
     need(any(a['id']==v['id'] and a['geometry']['passed'] for a in anchorRows),'screened finalist');key=('finalist',v['shape']['id'],v['circle']['id'],tuple(v['delta']));group=groups.get(key,{'sequence':[],'bad':0,'last':None});actual=group['sequence'];need(actual==fullExpected[:len(actual)],'fullclock prefix coverage');bad=group['bad']>0;passed=not bad and len(actual)==727 and v['statesVisited']==250;need(v['passed']==passed and v['passesChecked']==len(actual),'fullclock finalist acceptance');need(not bad or group['bad']==1 and group['last'] is not None and (not group['last'][0] or group['last'][1] is False),'first finalist witness');need(not any(f['circle']==v['circle'] and f['passed'] for f in finalRows),'first winner stops circle');finalRows.append(v)
    elif lastKind=='pilot-result':need(pilot is None,'one terminal result');pilot=v
    else:need(False,'unknown row kind')
    # Only small producer control summaries survive. Actual row object is released before next restore.
    del v
   counters['codecRecords']+=1
   del binding,record,item
  need(total==m['JSONBytes'] and counters['restoredValues']==m['values']==host['valuesEmitted'],'full lossless stored counts');need(pilot is not None and lastKind=='pilot-result' and pilot['complete'] and m['complete'] and host['complete'],'complete pilot');need(pilot['phase']==host['phase'] and pilot['phase'] in ['representative','full'],'host and terminal reviewed phase');need(pilot['tupleCount']==counters['actualTuples']==host['CanvasSamples'],'all actual tuple counts');need(len(anchorRows)<=108 and len(finalRows)<=6 and all(sum(f['circle']==c for f in finalRows)<=3 for c in policy['circles']),'finite caps')
  if pilot['phase']=='representative':need(all(r[0]=='representative' and r[1]=='55C' and r[2]==90 for r in representative) and [r[3] for r in representative]==['B','A','main'][:len(representative)] and 0<len(representative)<=3 and counters['actualTuples']==len(representative) and not finalRows and not anchorRows,'representative-only scope')
  else:
   need(len(shapes)==9 and len(anchorRows)==12*sum(s['passedSparseQuality'] for s in shapes.values()),'all bounded shape/anchor screens');need(pilot['finalists']==finalRows and pilot['winners']==[f for f in finalRows if f['passed']],'all terminal finalists/winners');need(counters['actualTuples']==gate['expectedActualTuples'],'same1533 full producer tuple coverage')
   for p in gate['files']+gate.get('runtime',[]):pin_check(p)
  result.update(state='PASS_SOURCE30_PILOT_EVIDENCE_ONLY',phase=pilot['phase'],storedJSONBytes=total,restoredValues=counters['restoredValues'],actualTuples=counters['actualTuples'],shapeScreens=len(shapes),anchors=len(anchorRows),finalists=len(finalRows),conditionalFullClockWinners=[f['id'] for f in finalRows if f['passed']],fullLiteralPaintSourcecallClockRGBACompared=True,qualityApprovedOnlyWithinAcceptedCandidatePolicy=True,geometrySafetyCertified=False)
 except BaseException as e:result['failure']={'name':type(e).__name__,'message':str(e),'traceback':traceback.format_exc()}
 result['streamingReview']={'version':32,'existingSource31PredicatesReused':str(CHECKER31),'predicateSHA256':sha(CHECKER31.read_bytes()),'maximumRestoredRowsHeld':1,'rowsValidated':counters['actualTuples'],'valuesRestored':counters['restoredValues'],'codecRecordsRead':counters['codecRecords'],'noRetainedRGBAOrPaintOrCalls':True,'peakRSSBytes':resource.getrusage(resource.RUSAGE_SELF).ru_maxrss*1024,'RSSMeaning':'Linux process ru_maxrss high-watermark; diagnostic only, not formal performance acceptance','formalPerformanceAccepted':False,'producerRerendered':False}
 with output.open('x',encoding='utf8')as f:json.dump(result,f,ensure_ascii=False,indent=2);f.write('\n')
 print(json.dumps(result,ensure_ascii=False));return 0 if result['state'].startswith('PASS_') else 1
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('folder');p.add_argument('output');p.add_argument('--reviewed-gate');a=p.parse_args();sys.exit(check(a.folder,a.output,a.reviewed_gate))
