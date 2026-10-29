"""Raw-only review of source-only formal viewport plan and source dispatch."""
from pathlib import Path
import gzip,hashlib,json,sys,struct
D=Path(sys.argv[1]);r=json.loads((D/'result.json').read_text());assert r['complete']and not r['errors']and r['postPinsUnchanged']
assert len(r['pins'])==58 and len(r['raw'])==15 and len(r['referenceRaw'])==3
for p in r['pins']:
 b=Path(p['path']).read_bytes();assert(len(b),hashlib.sha256(b).hexdigest())==(p['bytes'],p['sha256'])
def raw(p,external=False):
 g=(Path(p['path'])if external else D/p['file']).read_bytes();b=gzip.decompress(g);assert(len(g),hashlib.sha256(g).hexdigest(),len(b),hashlib.sha256(b).hexdigest())==(p['gzipBytes'],p['gzipSHA256'],p['jsonBytes'],p['sha256']);return json.loads(b)
v={p['file']:raw(p)for p in r['raw']};prepared=v['direct-prepared.json.gz'];issued=v['formal-plan.json.gz'];assert prepared['before']==prepared['after']and issued['before']==issued['after']and issued['frozen']
assert prepared['model']['own']==727 and prepared['model']['metrics']==405
proof=issued['sourceProof'];tr=issued['trajectory'];assert proof['kind']=='bulbs-owned-direct86bj-v1'and proof['recipe']=='one-row-compact'
assert proof['currentViewport']==dict(scale=.75,width=720,height=405)and proof['deviceDelta']==[0,72.3007882629842]
assert tr['from']==tr['to']==[x/.75 for x in proof['deviceDelta']]and [x*.75 for x in tr['from']]==proof['deviceDelta']
assert issued['final']['cuts'][0]['placementTrajectory']['sourceAdapter']==proof['kind']
count=0
for p,n in zip(r['referenceRaw'],[12,60,231]):
 old=raw(p,True);now=v[f'frame-{n}.json.gz'];assert now['failure']is None and now['admitted']and now['time']==n/60 and now['after']==old['shiftHash']
 assert len(now['rows'])==len(old['rows'])==3
 for a,b in zip(now['rows'],old['rows']):
  assert a['pass']==b['pass']and a['root']==b['root']and a['records']==b['records']
  assert a['catalog']['kind']=='bulbs-owned-normal-draw80'and a['catalog']['sourceDrawFinished']and not a['catalog']['detailedPaintCollected'];count+=len(a['records'])
 assert now['owner']['compiles']==1
for name,code in [('alias','STALE_PLACEMENT_PLAN'),('unsupported-post','BULBS86BJ_FRAME_OPTIONS'),('generation-rejected','BULBS86BJ_GENERATION'),('generation-old-ticket','BULBS80N_UNKNOWN_OR_EVICTED')]:
 x=v[name+'.json.gz'];assert x['failure']['code']==code and x['before']==x['after']and not x['rows']
released=v['released.json.gz'];assert released['owner']['residentModels']==released['owner']['residentBytes']==0
assert released['owner']['peakSerializedWorkingBytes']<=8388608
assert all(released['reservation'][k]==0 for k in ['records','bindings','activeFrameBytes'])
print(json.dumps(dict(formalFrames=3,own=9,exactPaintRecords=count,rgbaExact=3,atomicRefusals=4,deviceDelta=proof['deviceDelta'],logicalDelta=tr['from'],prepareMs=prepared['prepareMs'],finalizeMs=issued['elapsedMs'],scope='formal source-only720x405/noPost/fast input-specific plan; UI/performance and changed input normal paths remain separate')))
