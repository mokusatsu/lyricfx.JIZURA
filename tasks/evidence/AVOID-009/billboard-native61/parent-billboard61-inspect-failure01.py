from pathlib import Path
import json,gzip,hashlib
R=Path('/workspace/lyricfx.JIZURA');B=Path('/dev/shm/avoid009-evening-20261024/billboard61.raw01');E=R/'tasks/evidence/AVOID-009/billboard-native61';m=json.loads((B/'manifest.json').read_text());rows=[]
for row in m['records']:
 if row['id'].endswith('.init'):
  j=json.loads(b''.join(gzip.decompress((B/p['path']).read_bytes()) for p in row['parts']))['data'];rows.append({'record':row['id'],'beforePlanLang':j['before']['sourcePlan']['lang'],'afterPlanLang':j['after']['sourcePlan']['lang']})
r={'state':'PARENT_FAILED61_SOURCE_CAUSE_AND_PRESERVATION','failure':m['errors'],'completedPrefix':m['completed'],'rawPlanLanguages':rows,'sourceCause':'initBillboard61 unconditionally setLang ja; Renderer.frame sets plan.lang. Fourth native Latin fixture is en and changes metrics revision; strict guard correctly fails. No predicate relaxed.','nextFix':'prepare separate62 honoring original plan.lang before metrics snapshot; preserve61 failure','fullStageAccepted':False,'sourceProductUnchanged':True,'publicChecks':0,'parentImages':0};(E/'parent-failure-cause61.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))
