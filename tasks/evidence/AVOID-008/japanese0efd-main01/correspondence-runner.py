from pathlib import Path
import json,hashlib
D=Path('tasks/evidence/AVOID-008/japanese0efd-main01');R=Path('tasks/evidence/AVOID-008/japanese');pairs=[('probe01.json','probe20.json'),('route02.json','route-probe04.json'),('station01.json','station-probe03.json'),('shoji01.json','shoji-probe02.json'),('karuta01.json','karuta-probe04.json'),('noren01.json','noren-probe07.json')];results=[]
noren=json.loads((D/'noren01.json').read_text())
def normalize(v):
 if isinstance(v,dict):return {k:normalize(x)for k,x in v.items()if k not in ['minMetadataPx','minMetadataNativeFontRatio']}
 if isinstance(v,list):return [normalize(x)for x in v]
 return v
for cur,old in pairs:
 a=json.loads((R/old).read_text());b=json.loads((D/cur).read_text());assert len(a['rows'])==len(b['rows']);rows=[]
 for i,(x,y) in enumerate(zip(a['rows'],b['rows'])):
  
  if cur=='probe01.json' and y.get('layout')=='noren':
   fixed=next(r for r in noren['rows']if r['variant']=='native' and r['dims']==y['dims'] and r['radius']==y['radius']);assert y['safety']==fixed['safety']=='insufficient-space';assert y['segments']==fixed['segments'] and y['sourceProof']==fixed['sourceProof'];rows.append({'case':i,'layout':'noren','oldProbe20Safety':x['safety'],'currentSafety':y['safety'],'geometryProofExactFinalNoren07':True,'historicalSourceDifferent':True});continue
  equal=normalize(x)==normalize(y);assert equal,(cur,i);rows.append({'case':i,'layout':y.get('layout',y.get('spec',{}).get('layout',cur.split('01')[0])),'safety':y.get('safety'),'allGeometryRecipeSampleFieldsExact':True,'exactFullRow':x==y,'onlyAdditionalMetadataFloorDiagnostics':x!=y})
 results.append({'current':cur,'fixed0efd':old,'rows':rows,'controls':len(b.get('controls',[])),'sourceStartEndEqual':b['sourceStart']==b['sourceEnd']})
result={'scope':'Current Japanese90bounded cases plus18partially-overlapping noren cases, non-noren geometry/proof/recipe/sample fields exact previous fixed source, except two additional metadata floor observation fields; main noren6 matches final noren07 rather than earlier probe20.90is case count; old94was polygon count, controls are separate. Supplemental negative/resource root records remain independently asserted by original drivers.','pairs':results,'boundedRows':sum(len(x['rows']) for x in results[:-1]),'extraNorenRows':len(results[-1]['rows']),'passed':True};(D/'correspondence02.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'boundedRows':result['boundedRows'],'extraNorenRows':result['extraNorenRows'],'allGeometryCorrespondenceChecksPassed':True}))
