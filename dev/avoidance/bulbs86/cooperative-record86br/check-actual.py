from pathlib import Path
from fractions import Fraction as F
import json,gzip,hashlib,struct,sys
P=Path(sys.argv[1]).resolve();r=json.loads((P/'result.json').read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
def dec(v):
 if isinstance(v,dict):
  if list(v)==['$f64']:return struct.unpack('>d',bytes.fromhex(v['$f64']))[0]
  return{k:dec(x)for k,x in v.items()}
 if isinstance(v,list):return[dec(x)for x in v]
 return v
def read(q,path):
 g=path.read_bytes();b=gzip.decompress(g);assert len(g)==q['gzipBytes']and sha(g)==q['gzipSHA256'];assert len(b)==q['jsonBytes']and sha(b)==q['sha256'];return dec(json.loads(b))
assert r['complete']and not r['errors']and r['postPinsUnchanged']and len(r['pins'])==73 and len(r['raw'])==15
for q in r['pins']:
 b=Path(q['path']).read_bytes();assert len(b)==q['bytes']and sha(b)==q['sha256'],q['path']
d={q['file']:read(q,P/q['file'])for q in r['raw']};refs={Path(q['path']).name:read(q,Path(q['path']))for q in r['referenceRaw']};assert len(refs)==3
model=d['direct-prepared.json.gz'];same=d['same-model-sync.json.gz'];issued=d['formal-plan.json.gz'];assert model['before']==model['after']and issued['before']==issued['after'];assert model['model']['own']==727 and model['model']['metrics']==405
assert same['equal']and same['cooperative']==same['synchronous'];a=same['cooperative'];assert a['recipeId']=='one-row-compact'and a['delta']==[0,72.3007882629842]and len(a['referenceEntries'])==727 and len(a['groups'])==10
c=a['circle'];circle={k:F(v)for k,v in c.items()}
for g in a['groups']:
 b={k:F(v)for k,v in g['bounds'].items()};assert b['x0']>=0 and b['y0']>=0 and b['x1']<=720 and b['y1']<=405
 dx=max(b['x0']-circle['cx'],F(0),circle['cx']-b['x1']);dy=max(b['y0']-circle['cy'],F(0),circle['cy']-b['y1']);assert dx*dx+dy*dy>(circle['r']+circle['margin'])**2
assert issued['frozen']and issued['sourceProof']['recipe']==a['recipeId']and issued['sourceProof']['deviceDelta']==a['delta'];assert issued['trajectory']['from']==issued['trajectory']['to']==[v/.75 for v in a['delta']]
own=paint=0
for n in [12,60,231]:
 v=d[f'normal-frame-{n}.json.gz'];old=refs[f'normal-frame-{n}.json.gz'];assert v['failure']is None and v['admitted']and v['after']==old['after']and v['rows']==old['rows'];assert all(x['allowFilter']for x in v['rows']);own+=len(v['rows']);paint+=sum(len(x['records'])for x in v['rows'])
assert own==9 and paint==325
for name,code in [('unsafe-scale','BULBS80O_FRAME_OPTIONS'),('generation-rejected','BULBS86BJ_GENERATION'),('generation-old-ticket','BULBS80N_UNKNOWN_OR_EVICTED')]:
 v=d[name+'.json.gz'];assert v['failure']['code']==code and v['before']==v['after']and not v['rows']
released=d['released.json.gz'];assert released['owner']['residentModels']==released['owner']['residentBytes']==0 and all(released['reservation'][k]==0 for k in ['records','bindings','activeFrameBytes']);assert model['owner']['peakSerializedWorkingBytes']==7981163<=8388608
h=json.loads((P.parent/'bulbs-cooperative-record-gate-source86br'/f'{P.name}-host.json').read_text());assert h['nodeExit']==0 and h['nodeProcAbsent']and h['serviceProcAbsent']and h['portConnectEx']!=0
steps=model['steps'];assert len(steps)==1457;worst=max(range(len(steps)),key=steps.__getitem__);assert worst==966
print(json.dumps({'passed':True,'pins':73,'raw':15,'sameModelExact':True,'groups':len(a['groups']),'referenceEntries':727,'own':own,'paint':paint,'peak':model['owner']['peakSerializedWorkingBytes'],'prepareMs':model['prepareMs'],'modelSyncMs':sum(steps[:728]),'modelMaxStepMs':max(steps[:728]),'proofSyncMs':sum(steps[728:]),'maxStepMs':steps[worst],'maxStepIndex':worst,'sameModelSyncReplayMs':same['syncMs'],'finalizeMs':issued['elapsedMs'],'scope':'cooperative/same-model synchronous record geometry/held exact;normal3frame oldbp exact;postfinal normal generation refusal and release;prep cancel/input/font/context aremock-only;no UI/performance acceptance;wall step cannot identify CPU or OS wait'}))
