from pathlib import Path
import json,gzip,hashlib,collections,gc
D=Path('tasks/evidence/AVOID-008/writingC861-main01');sha=lambda b:hashlib.sha256(b).hexdigest();read=lambda p:json.loads(gzip.decompress(Path(p).read_bytes()));canon=lambda x:json.dumps(x,sort_keys=True,separators=(',',':'));papers={'postcard','letterPaper'};out=[]
prior=read('tasks/evidence/AVOID-008/objects/integrated01/matrix01.json.gz');oldmain={canon(x['spec']):x for x in prior['rows']};fields=['safety','bodyPhases','segments','observations','candidateBudget','diagnostics'];geometry=['start','end','region','status','from','composition','circle','envelopes'];other8=[]
for name in ['matrix','writing','default']:
 old=read(D/(name+'01.json.gz'));new=read(D/(name+'02.json.gz'));rows=[]
 for i,(a,b)in enumerate(zip(old['rows'],new['rows'])):
  assert a['spec']==b['spec'];eq={k:a.get(k)==b.get(k)for k in fields};rows.append({'row':i,'layout':b['spec']['layout'],'safety':b['safety'],'candidate01Exact':eq})
  if b['spec']['layout']in papers:assert all(eq.values()),(name,i,eq)
  if name=='matrix'and b['spec']['layout']not in papers:
   x=oldmain[canon(b['spec'])];sg=x.get('segments')or[];tg=b.get('segments')or[];assert len(sg)==len(tg);proof=[]
   for s,t in zip(sg,tg):
    same={k:s.get(k)==t.get(k)for k in geometry};same['quality']=s.get('quality')==t.get('quality');same['numericDomain']=all(s['domain'].get(k)==t['domain'].get(k)for k in ['minX','maxX','minY','maxY']);assert all(same.values()),(i,same);proof.append(same)
   assert x['safety']==b['safety'];assert x.get('bodyPhases')==b.get('bodyPhases');assert [{k:v for k,v in o.items()if k!='phaseCorrect'}for o in x['observations']]==b['observations'];assert all(o.get('phaseCorrect',True)for o in x['observations']);other8.append({'row':i,'layout':b['spec']['layout'],'oldMainSafety':x['safety'],'currentSafety':b['safety'],'allSelectedOffsetsAndGeometryExact':proof,'allActualObservedPolygonsClockPhaseExact':True,'domainDescriptionOnlyMayDiffer':True})
 out.append({'dataset':name+'02','rows':rows,'summary':new['summary'],'paperRowsAllSelectedFieldsExactCandidate01':True})
 del old,new;gc.collect()
r={'scope':'Candidate02 paper-scoped enumeration. Allpaper selected rawgeometry/domain/quality/recipe/clock/attempts match candidate01 and fixedc861 through correspondence02; unrelated8 matched accepted859main geometry/offset/quality/numericdomains and allactualobservedpolygons/clock, no epsilon equivalence. Domain rule prose may differ due stricter writing-code description.','datasets':out,'other8Main859Rows':other8,'other8OffsetDifferences':0,'passed':True};p=D/'correspondence03.json';assert not p.exists();p.write_text(json.dumps(r,indent=2)+'\n');print(json.dumps({'other8Rows':len(other8),'other8OffsetsExact':True,'datasets':[{ 'name':x['dataset'],'summary':x['summary']}for x in out]}))
