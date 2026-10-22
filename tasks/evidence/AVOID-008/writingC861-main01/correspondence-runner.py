from pathlib import Path
import json,gzip,hashlib,collections,gc,subprocess
D=Path('tasks/evidence/AVOID-008/writingC861-main01');sha=lambda b:hashlib.sha256(b).hexdigest();read=lambda p:json.loads(gzip.decompress(Path(p).read_bytes()));fields=['spec','safety','diagnostics','bodyPhases','segments','observations','candidateBudget'];summary=[];detail=[]
for oldname,newname in [('matrix14','matrix01'),('writing11','writing01'),('default-circle04','default01')]:
 a=read('tasks/evidence/AVOID-008/objects/'+oldname+'.json.gz');b=read(D/(newname+'.json.gz'));assert len(a['rows'])==len(b['rows']);by=collections.Counter();nonvinyl=[];admission=[];rows=[]
 for i,(x,y)in enumerate(zip(a['rows'],b['rows'])):
  eq={k:x.get(k)==y.get(k)for k in fields};rows.append({'row':i,'layout':y['spec']['layout'],'exact':eq});assert eq['spec'];
  if not all(eq.values()):by[y['spec']['layout']]+=1
  if y['spec']['layout']!='vinyl'and not all(eq.values()):nonvinyl.append(i)
  if x['safety']!=y['safety']:admission.append({'row':i,'spec':y['spec'],'oldSafety':x['safety'],'currentSafety':y['safety'],'oldSegments':x.get('segments'),'currentSegments':y.get('segments'),'oldDiagnostics':x['diagnostics'],'currentDiagnostics':y['diagnostics']})
 assert not nonvinyl,(newname,nonvinyl);summary.append({'dataset':newname,'old':oldname,'cases':len(b['rows']),'oldSummary':a['summary'],'freshSummary':b['summary'],'changedRowLayouts':dict(by),'nonVinylAllSelectedFieldsExact':True,'admissionChanges':admission,'rows':rows})
 del a,b;gc.collect()
a=read('tasks/evidence/AVOID-008/objects/integrated01/matrix01.json.gz');key=lambda r:json.dumps(r['spec'],sort_keys=True);prior={key(r):r for r in a['rows']};b=read(D/'matrix01.json.gz');domains=[];offsets=[];other8=0
for i,y in enumerate(b['rows']):
 if y['spec']['layout']in ['postcard','letterPaper']or key(y)not in prior:continue
 other8+=1;x=prior[key(y)];assert x['safety']==y['safety'];
 for j,(s,t)in enumerate(zip(x.get('segments')or[],y.get('segments')or[])):
  assert s['quality']==t['quality'];assert all(s.get(k)==t.get(k)for k in ['start','end','region','status','composition','circle','envelopes'])
  if s.get('domain')!=t.get('domain'):
   a,b=s['domain'],t['domain'];assert all(a.get(k)==b.get(k)for k in ['minX','maxX','minY','maxY']);domains.append({'row':i,'segment':j,'oldRule':a.get('rule'),'newRule':b.get('rule'),'numericDomainExact':True})
  if s['from']!=t['from']:offsets.append({'row':i,'layout':y['spec']['layout'],'segment':j,'old':s['from'],'current':t['from'],'delta':[v-u for u,v in zip(s['from'],t['from'])]})
out={'scope':'Raw exact comparison to fixedc861, without rounding or epsilon equivalence. All nonvinyl selected data exact in all3datasets. Prior main8unrelated object IDs checked separately: unchanged safety/quality/envelopes/numericdomain, exact offset differences retained below.','datasets':summary,'other8PriorMain':{'rows':other8,'domainDescriptionChanges':domains,'numericDomainExact':True,'offsetDifferences':offsets,'maximumAbsoluteOffsetDifference':max(abs(v)for x in offsets for v in x['delta']),'cause':'Fixedc861 solve changes fitBounds lower x0/y0 construction Math.max to Math.min and adds independent accepted-domain validation. Even unchanged selected recipes can reach same solver point through different floating arithmetic. Not rounded as identical. Fresh independent clearance/stage/domain checks are required separately.','sourceDiffCommand':'git diff257f8da c861 -- src/09i_layoutsC_objects.js'},'passed':True};p=D/'correspondence02.json';assert not p.exists();p.write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'datasets':[{ 'name':x['dataset'],'cases':x['cases'],'admissionChanges':len(x['admissionChanges']),'changedLayouts':x['changedRowLayouts']}for x in summary],'other8Rows':other8,'offsetDifferenceCount':len(offsets),'maxAbsoluteOffsetDifference':out['other8PriorMain']['maximumAbsoluteOffsetDifference']}))
