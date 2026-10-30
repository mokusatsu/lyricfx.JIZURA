from pathlib import Path
import sys
r=Path(sys.argv[1]).resolve();d=Path(__file__).resolve().parent;old=d.parent/'variable-ui86ca'
def swap(s,a,v):
 assert s.count(a)==1,(a,s.count(a));return s.replace(a,v)
for p in old.glob('*.js'):
 s=p.read_text()
 if p.name=='scalar-generator86.js':
  s=swap(s,"heldQualityResults=HQ.check(heldInput,recipes.map(r=>r.id),{onWork:work=>budget({heldInput,qualityWork:work})}),heldQualityMs=performance.now()-qualityStart;", "heldQualityResults=[];for(const qualityRecord of heldInput){const rows=HQ.check([qualityRecord],[qualityRecord.recipe.id],{onWork:work=>budget({heldInput,qualityWork:{...work,sourceRecords:heldInput},previousQualityResults:heldQualityResults})});heldQualityResults.push(...rows);budget({heldInput,heldQualityResults});yield Object.freeze({kind:'bulbs-own-checkpoint80ab',phase:'held-quality',completed:scalarCount,total:clocks.actualCounts.selectedPasses});}const heldQualityMs=performance.now()-qualityStart;")
 if p.name=='controller86.js':
  s=s.replace("need(candidates.length>0,'BULBS86BJ_INSUFFICIENT_SPACE');", "need(candidates.length>0,'BULBS86BJ_INSUFFICIENT_SPACE',{quality:model.heldQualityEvaluation.results.map(q=>({recipe:q.recipe,passed:q.passed,failureCount:q.failureCount,failureCounts:q.failureCounts}))});",1)
 (d/p.name).write_text(s)
