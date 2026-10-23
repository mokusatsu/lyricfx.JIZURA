from pathlib import Path
import json,gzip,collections,hashlib
out=Path('tasks/evidence/AVOID-008/performance/own-slot-original-pipeline-profile01');packed=(out/'on-original-pipeline.cpuprofile.json.gz').read_bytes();p=json.loads(gzip.decompress(packed));nodes={n['id']:n for n in p['nodes']};parents={c:n['id']for n in p['nodes']for c in n.get('children',[])};labels={}
for id in nodes:
 names=set();seen=set();i=id
 while i in nodes:
  assert i not in seen;seen.add(i);names.add(nodes[i]['callFrame']['functionName']);i=parents.get(i)
 labels[id]='final'if'profileFinal'in names else'source'if'profileSource'in names else None
counts=collections.defaultdict(lambda:{'samples':0,'signedUs':0,'negativeCount':0,'negativeSignedUs':0});rows=collections.defaultdict(dict);outside=collections.defaultdict(lambda:{'samples':0,'signedUs':0,'negativeCount':0,'negativeSignedUs':0});iteration=-1;last=None;transitions=[];negative=[]
for ix,(id,w)in enumerate(zip(p['samples'],p['timeDeltas'])):
 label=labels[id];f=nodes[id]['callFrame']
 if label:
  if label=='source'and last!='source':
   if last is None:iteration=0
   else:assert last=='final';iteration+=1
   transitions.append({'sampleIndex':ix,'iteration':iteration,'phase':'source'})
  elif label=='final'and last!='final':
   assert last=='source';transitions.append({'sampleIndex':ix,'iteration':iteration,'phase':'final'})
  last=label;key=(iteration,label);c=counts[key];r=rows[key];fkey=json.dumps([f['functionName'],f['url'],f['lineNumber'],f['columnNumber']],ensure_ascii=False)
  if fkey not in r:r[fkey]={'functionName':f['functionName'],'url':f['url'],'lineNumberZeroBased':f['lineNumber'],'columnNumberZeroBased':f['columnNumber'],'selfSignedUs':0,'samples':0}
  r[fkey]['selfSignedUs']+=w;r[fkey]['samples']+=1
 else:
  c=outside['outsideGC'if f['functionName']=='(garbage collector)'else'outsideSourceFinalControlRenderQualification'];key=None
 c['samples']+=1;c['signedUs']+=w
 if w<0:c['negativeCount']+=1;c['negativeSignedUs']+=w;negative.append({'sampleIndex':ix,'weight':w,'classifiedIteration':iteration if label else None,'phase':label})
assert iteration==8 and len(transitions)==18;assert sum(c['samples']for c in counts.values())+sum(c['samples']for c in outside.values())==len(p['samples']);allRows=[];warm={}
for (i,label),c in sorted(counts.items()):allRows.append({'iteration':i,'warmup':i<3,'phase':label,**c,'topSelf':sorted(rows[(i,label)].values(),key=lambda r:r['selfSignedUs'],reverse=True)[:30]})
for label in ['source','final']:
 joined={};samples=signed=0
 for (i,phase),r in rows.items():
  if i<3 or phase!=label:continue
  samples+=counts[(i,phase)]['samples'];signed+=counts[(i,phase)]['signedUs']
  for k,v in r.items():
   if k not in joined:joined[k]={**v,'selfSignedUs':0,'samples':0}
   joined[k]['selfSignedUs']+=v['selfSignedUs'];joined[k]['samples']+=v['samples']
 warm[label]={'iterations':list(range(3,9)),'samples':samples,'signedUs':signed,'topSelf':sorted(joined.values(),key=lambda r:r['selfSignedUs'],reverse=True)[:40]}
result={'scope':'Read-only original sample-order source→final phase transitions. Outside samples never allocated into source/final phases; iteration increments only when next source follows observed final. No wrapper timestamps or causal outside-GC attribution.','CPUgzipSHA256':hashlib.sha256(packed).hexdigest(),'negativeCount':len(negative),'negativeSignedSumUs':sum(x['weight']for x in negative),'absoluteNegativeUncertaintyUs':sum(abs(x['weight'])for x in negative),'dropCount':0,'clampCount':0,'negativeAssignments':negative,'transitions':transitions,'iterations':allRows,'measuredIterations3to8':warm,'outsideSourceFinalAllIterations':dict(outside),'warmupExcludedOnlyFromMeasuredView':[0,1,2],'rawAndFullWindowUnchanged':True,'qualification':False};(out/'iteration-ancestor-readonly-aggregate.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'iterations':iteration+1,'sourceFinalTransitions':len(transitions),'negative':negative,'measured':{label:{'signedUs':r['signedUs'],'samples':r['samples'],'topSelf':r['topSelf'][:9]}for label,r in warm.items()},'outside':dict(outside)}))
