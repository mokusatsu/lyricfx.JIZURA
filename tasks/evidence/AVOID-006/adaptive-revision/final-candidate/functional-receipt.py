from pathlib import Path
import json,hashlib,shutil
r=Path('/workspace/lyricfx.JIZURA');out=r/'tasks/evidence/AVOID-006/adaptive-revision/final-candidate';h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
p=out/'functional-summary.json';s=json.loads(p.read_text());assert s['passed'] and s['failed']==[] and s['notRun']==[] and len(s['tests'])==12
assert s['compiledSHA256']==h(r/'index.html') and s['compiledENSHA256']==h(r/'en/index.html')
assert all(h(r/k)==v for k,v in s['sourceHashes'].items())
original=out/'functional-executed-summary.json';shutil.copyfile(p,original)
runner=Path('/workspace/work/avoid006-adaptive-final-functional-v2.py');assert h(runner)==s['runnerSHA256'];shutil.copyfile(runner,out/'functional-runner.py')
for t in s['tests']:
 assert t['exitCode']==0 and t['scriptSHA256']==h(r/('dev/avoidance/'+t['name']+'.cjs')) and t['logSHA256']==h(out/(t['name']+'.log'))
 d=json.loads((out/(t['name']+'.log')).read_text().splitlines()[-1])
 if t['name']!='layouts-a-adaptive-test':
  t['counts']={k:v for k,v in d.items() if type(v) in [int,float]}
  t['arrayCounts']={k:len(v) for k,v in d.items() if isinstance(v,list)}
  t['objectEntryCounts']={k:len(v) for k,v in d.items() if isinstance(v,dict)}
s['receiptEnrichment']={'scriptSHA256':h(Path(__file__)),'executedSummarySHA256':h(original),'method':'Direct numeric fields, array lengths and object entry counts from each executed log final JSON; no test re-execution or outcome changes.'}
p.write_text(json.dumps(s,indent=2)+'\n');shutil.copyfile(__file__,out/'functional-receipt.py');print(json.dumps({'passed':True,'tests':len(s['tests']),'compiled':s['compiledSHA256'],'failed':s['failed'],'notRun':s['notRun'],'receiptSHA256':h(p)}))
