"""Check all saved86ci/cj/ck hashes and UI/output controls without rendering or network."""
from pathlib import Path
import sys,json,hashlib,gzip
B=Path(sys.argv[1]).resolve();sha=lambda b:hashlib.sha256(b).hexdigest();snapshots={}
for name in ['bulbs-ae-output86cj-pre-edit','bulbs-ae-output86cj-hidden-pre-edit','bulbs-hidden-ui86ck-pre-edit']:
 for x in json.loads((B/name/'map.json').read_text()):snapshots.setdefault(x['path'],[]).append(Path(x['snapshot']))
for key,p in json.loads((B/'bulbs-product-ui86ci-historical-pin-recovery03/map.json').read_text()).items():snapshots.setdefault(key.split('|',1)[1],[]).append(Path(p))
names=['bulbs-product-ui86ci-actual01','bulbs-product-ui86ci-boundary-actual02','bulbs-product-ui86ci-boundary-actual03','bulbs-ae-output86cj-actual01','bulbs-ae-output86cj-actual02','bulbs-hidden-ui86ck-actual01'];trials=[]
for name in names:
 D=B/name;result=D/'result.json';d=json.loads(result.read_text());h=json.loads((B/(name+'-runtime')/'host.json').read_text());differences=[]
 for pin in d['pins']:
  p=Path(pin['path']);matches=lambda q:q.is_file() and q.stat().st_size==pin['bytes'] and sha(q.read_bytes())==pin['sha256']
  if not matches(p):
   original=p;p=next(q for q in snapshots.get(str(p),[]) if matches(q));differences.append({'recordedPath':str(original),'executedSnapshot':str(p)})
  assert matches(p)
 for r in d['raw']:
  g=(D/r['file']).read_bytes();b=gzip.decompress(g);assert len(g)==r['gzipBytes'] and sha(g)==r['gzipSHA256'];assert len(b)==r['jsonBytes'] and sha(b)==r['sha256']
 assert d['postPinsUnchanged'] and d['mediaOutputs']==0 and d['publicChecks']==0
 if name=='bulbs-product-ui86ci-boundary-actual02':assert not d['complete'] and 'RESIZE_STALE' in d['errors'][0]['message']
 else:assert d['complete'] and not d['errors']
 assert h['cleanup']['complete'] and not any(h['cleanup'][key]for key in ['remaining','signals','ownershipFailures','signalFailures'])
 assert h['normalPageClosureConfirmed'] and h['debugPortClosed'] and h['pages']['created']==3 and len(h['pages']['closed'])==3
 if name.startswith('bulbs-ae-output'):
  for lang,r in d['summary'].items():
   assert r['language']==lang and r['resources']==0 and len(r['packs'])==2 and len(r['mcp'])==4 and len(r['direct'])==7
   assert all(s['code']=='BULBS_UI_OUTPUT_UNSUPPORTED'for s in r['direct'])
   assert r['cep']['target']=={'hostCalls':0,'writes':0} and r['cep']['stock']['starts']==1 and r['cep']['stock']['mockedWrites']==(1 if lang=='en' else 0)
   assert r['browser'][0]['targetRejected'] and not r['browser'][0]['filenameOpened']
   if name.endswith('actual02'):assert r['hidden']=={'aeLyrics':0,'filenameSave':True,'mp4DialogOpened':True,'directExportControls':2} and len(r['saves'])==5
 if name=='bulbs-hidden-ui86ck-actual01':
  for lang,r in d['summary'].items():
   assert r['language']==lang and r['baseline']==0
   assert not r['initial']['state']['active'] and not r['initial']['state']['ready'] and r['initial']['stats']['owner']['compiles']==0 and not r['initial']['overlay']
   assert r['resized']['w']!=r['beforeResize']['w'] and not r['resized']['state']['active'] and r['resized']['stats']['owner']['compiles']==0
   assert r['showImmediate']['phase']=='fonts' and r['shown']['state']['phase']=='preparing' and r['shown']['stats']['owner']['compiles']==1 and r['shown']['overlay']
   assert not r['hiddenAgain']['state']['active'] and not r['hiddenAgain']['state']['ready'] and not r['hiddenAgain']['overlay'] and r['hiddenAgain']['stats']['owner']['compiles']==1
   assert r['hiddenAgain']['stats']['owner']['residentModels']==0 and r['hiddenAgain']['stats']['reservation']['records']==0 and r['hiddenAgain']['stats']['reservation']['bindings']==0
   assert r['reshown']['phase']=='fonts' and r['reshown']['generation']>r['shown']['state']['generation']
   assert r['stock']['layout']=='center' and not r['stock']['state']['active'] and not r['stock']['overlay']
 trials.append({'output':str(D),'resultSHA256':sha(result.read_bytes()),'complete':d['complete'],'rawRecords':len(d['raw']),'sourcePins':len(d['pins']),'currentSourcePinDifferences':differences,'normalPagesClosed':3,'ownedCleanupComplete':True,'summary':d['summary'] if name.startswith(('bulbs-ae-output','bulbs-hidden-ui')) else None})
print(json.dumps({'checked':True,'trials':trials,'scope':'executed-source byte/hash snapshots, raw and lifecycle; explicit mocked output assertions only; no output media or actual AE/filesystem writes'},ensure_ascii=False,indent=2))
