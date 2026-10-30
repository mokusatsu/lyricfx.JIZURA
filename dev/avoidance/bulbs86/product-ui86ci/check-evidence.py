"""Read-only check of saved UI evidence; never opens Qt, public URLs or media."""
from pathlib import Path
import json,hashlib,gzip,sys
B=Path(sys.argv[1]).resolve(); names=['bulbs-product-ui86ci-actual01','bulbs-product-ui86ci-boundary-actual02','bulbs-product-ui86ci-boundary-actual03'];out=[]
def sha(b):return hashlib.sha256(b).hexdigest()
recovery=B/'bulbs-product-ui86ci-historical-pin-recovery03';recovered=json.loads((recovery/'map.json').read_text())
for name in names:
 D=B/name; result=D/'result.json';d=json.loads(result.read_text());h=json.loads((B/(name+'-runtime')/'host.json').read_text())
 pinDifferences=[]
 for pin in d['pins']:
  original=Path(pin['path']);b=original.read_bytes()
  if len(b)!=pin['bytes'] or sha(b)!=pin['sha256']:
   snapshot=Path(recovered[name+'|'+pin['path']]);b=snapshot.read_bytes();pinDifferences.append({'recordedPath':pin['path'],'executedSnapshot':str(snapshot)})
  assert len(b)==pin['bytes'] and sha(b)==pin['sha256'],pin['path']
 for r in d['raw']:
  g=(D/r['file']).read_bytes();b=gzip.decompress(g);assert len(g)==r['gzipBytes'] and sha(g)==r['gzipSHA256'];assert len(b)==r['jsonBytes'] and sha(b)==r['sha256']
 assert d['postPinsUnchanged'] and d['mediaOutputs']==0 and d['publicChecks']==0
 assert h['cleanup']['complete'] and not h['cleanup']['remaining'] and not h['cleanup']['signals'] and not h['cleanup']['ownershipFailures'] and not h['cleanup']['signalFailures']
 assert h['normalPageClosureConfirmed'] and h['debugPortClosed'] and h['pages']['created']==3 and len(h['pages']['closed'])==3
 if name.endswith('actual02'):
  assert not d['complete'] and d['errors'] and 'RESIZE_STALE' in d['errors'][0]['message']
 else:assert d['complete'] and not d['errors']
 if name.endswith('actual03'):
  for lang,r in d['summary'].items():
   assert r['language']==lang
   assert r['cancelledFont']['released'] and r['cancelledFont']['alpha']==0
   assert r['resized']['released'] and r['resized']['alpha']==0 and r['resized']['state']['generation']>r['beforeResize']['generation']
   assert r['resized']['w']!=r['beforeResize']['w']
   for key,code in [('fontFailure','TEST_FONT_FAILURE'),('drawFailure','TEST_DRAW_FAILURE')]:
    s=r[key];assert s['state']['phase']=='unsupported' and s['state']['error']==code and not s['state']['ready'] and s['released'] and s['alpha']==0 and s['overlay']
   assert r['ready']['state']['ready'] and r['ready']['alpha']>0
   assert [s['layout'] for s in r['stock']]==['center','bulbs','dominoes','burst','contour','crossword']
   assert all(not s['active'] and s['alpha']>0 and not s['overlay'] for s in r['stock'])
 out.append({'output':str(D),'resultSHA256':sha(result.read_bytes()),'complete':d['complete'],'rawRecords':len(d['raw']),'sourcePins':len(d['pins']),'currentHarnessPinDifferences':pinDifferences,'normalPagesClosed':3,'ownedCleanupComplete':True,'errors':d['errors'] if not d['complete'] else [],'summary':d['summary'] if name.endswith('actual03') else None})
print(json.dumps({'checked':True,'trials':out,'scope':'saved bytes/hash/source pins and explicitly asserted UI state only; no independent all-time paint or broad exception recovery certification'},ensure_ascii=False,indent=2))
