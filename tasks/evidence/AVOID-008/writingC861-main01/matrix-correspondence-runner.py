from pathlib import Path
import json,gzip,hashlib,collections,gc
D=Path('tasks/evidence/AVOID-008/writingC861-main01');sha=lambda b:hashlib.sha256(b).hexdigest();canon=lambda x:sha(json.dumps(x,sort_keys=True,separators=(',',':')).encode());read=lambda p:json.loads(gzip.decompress(Path(p).read_bytes()));fields=['spec','safety','bodyPhases','segments','observations','candidateBudget']
old=read('tasks/evidence/AVOID-008/objects/matrix14.json.gz');new=read(D/'matrix01.json.gz');rows=[];changed=[]
for i,(a,b)in enumerate(zip(old['rows'],new['rows'])):
 eq={k:a.get(k)==b.get(k)for k in fields};rows.append({'row':i,'layout':b['spec']['layout'],'safety':b['safety'],'exact':eq})
 if a['safety']!=b['safety']:changed.append({'row':i,'spec':b['spec'],'oldSafety':a['safety'],'newSafety':b['safety'],'oldDiagnostics':a['diagnostics'],'newDiagnostics':b['diagnostics'],'oldSegments':a['segments'],'newSegments':b['segments'],'bodyPhasesExact':a['bodyPhases']==b['bodyPhases']})
assert len(old['rows'])==len(new['rows'])==323;assert len(changed)==9 and all(x['spec']['layout']=='vinyl'for x in changed);assert all(all(r['exact'].values())for r in rows if r['layout']!='vinyl')
del old;gc.collect();prior=read('tasks/evidence/AVOID-008/objects/integrated01/matrix01.json.gz');key=lambda r:canon(r['spec']);priorBy={key(r):r for r in prior['rows']};earlier=[];other8=[]
for i,b in enumerate(new['rows']):
 if key(b)not in priorBy:continue
 a=priorBy[key(b)]
 if any(x['row']==i for x in changed):earlier.append({'row':i,'prior333Safety':a['safety'],'currentSafety':b['safety'],'sameSpec':True,'allObjectSizeCandidatesRejectedMetadataFloor':all(t.get('reason')=='C_OBJECT_METADATA_FLOOR'for t in b['segments'][0]['attempts']if t.get('objectScale')is not None),'priorMetadataFloorPresent':any(t.get('reason')=='C_OBJECT_METADATA_FLOOR'for t in a['segments'][0]['attempts'])})
 if b['spec']['layout']in ['postcard','letterPaper']:continue
 geom=lambda r:[{k:s.get(k)for k in ['start','end','region','status','from','composition','circle','envelopes','domain']}for s in r.get('segments')or[]]
 other8.append({'row':i,'layout':b['spec']['layout'],'safetyExact':a['safety']==b['safety'],'selectedGeometryDomainRecipeExact':geom(a)==geom(b),'qualityExact':[s.get('quality')for s in a.get('segments')or[]]==[s.get('quality')for s in b.get('segments')or[]]})
write=lambda p,x:Path(p).write_text(json.dumps(x,indent=2)+'\n');write(D/'matrix-correspondence01.json',{'scope':'Exact comparisons, no epsilon rounding. Fixedc861323 rows versus combined main;31vinyl attempted candidate/budget differences,9old-safe now insufficient. All nonvinyl fields exact. Prior333main matching spec geometry/quality separately reported. C exact-measure header retained; metadata floor not relaxed.','currentGzipSHA256':sha((D/'matrix01.json.gz').read_bytes()),'rows':rows,'changedAdmission':changed,'priorAcceptedMainNine':earlier,'other8VersusPriorMain':other8,'passed':True});print(json.dumps({'changed':len(changed),'other8Rows':len(other8),'other8SafetyChanges':sum(not r['safetyExact']for r in other8),'other8GeometryChanges':sum(not r['selectedGeometryDomainRecipeExact']for r in other8),'other8QualityChanges':sum(not r['qualityExact']for r in other8),'priorNine':earlier}))
