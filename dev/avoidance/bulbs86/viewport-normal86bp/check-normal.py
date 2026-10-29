from pathlib import Path
import json,gzip,hashlib,sys
sha=lambda b:hashlib.sha256(b).hexdigest()
def load(root):
 r=json.loads((root/'result.json').read_text());assert r['postPinsUnchanged']
 for p in r['pins']:
  b=Path(p['path']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256'],p['path']
 data={}
 for q in r['raw']:
  g=(root/q['file']).read_bytes();b=gzip.decompress(g);assert len(g)==q['gzipBytes']and sha(g)==q['gzipSHA256'];assert len(b)==q['jsonBytes']and sha(b)==q['sha256'];data[q['file']]=json.loads(b)
 return r,data
P,Q=map(lambda s:Path(s).resolve(),sys.argv[1:3]);r,d=load(P);s,e=load(Q)
assert not r['complete']and len(r['raw'])==14 and len(r['errors'])==1 and r['errors'][0]['code']=='ERR_ASSERTION';assert 'BULBS80O_FRAME_OPTIONS'in r['errors'][0]['message']
assert s['complete']and not s['errors']and len(s['raw'])==11
pairs=[];own=0;paint=0
for n in [12,60,231]:
 f=d[f'frame-{n}.json.gz'];normal=d[f'normal-frame-{n}.json.gz'];assert f['failure']is None and normal['failure']is None and f['admitted']and normal['admitted']and f['after']==normal['after']
 assert len(f['rows'])==len(normal['rows'])
 for a,b in zip(f['rows'],normal['rows']):
  assert not a['allowFilter']and b['allowFilter'];assert a['records']==b['records']and a['clock']==b['clock']and a['root']==b['root'];assert a['catalog']['kind']==b['catalog']['kind']=='bulbs-owned-normal-draw80';own+=1;paint+=len(a['records'])
 pairs.append({'n':n,'hash':normal['after'],'fastMs':f['elapsedMs'],'normalMs':normal['elapsedMs']})
normal=d['normal-default.json.gz'];assert normal['failure']is None and normal['admitted']and normal['after']==d['frame-60.json.gz']['after'];assert all(row['allowFilter']for row in normal['rows'])
for value,code in [(d['alias.json.gz'],'STALE_PLACEMENT_PLAN'),(d['unsafe-noGhost.json.gz'],'BULBS80O_FRAME_OPTIONS'),(e['unsafe-scale.json.gz'],'BULBS80O_FRAME_OPTIONS'),(e['generation-rejected.json.gz'],'BULBS86BJ_GENERATION'),(e['generation-old-ticket.json.gz'],'BULBS80N_UNKNOWN_OR_EVICTED')]:
 assert value['failure']['code']==code and value['before']==value['after']and not value['rows']
released=e['released.json.gz'];assert released['owner']['residentModels']==0 and all(released['reservation'][k]==0 for k in ['records','bindings','activeFrameBytes'])
for root in [P,Q]:
 gate=root.parent/('bulbs-viewport-normal-gate-source86bp'if root==P else'bulbs-viewport-normal-gate-source86bq');h=json.loads((gate/(root.name+'-host.json')).read_text());assert h['nodeProcAbsent']and h['serviceProcAbsent']and h['portConnectEx']!=0
assert own==9 and paint==325
print(json.dumps({'passed':True,'bpComplete':False,'bpFailurePreserved':True,'bpPins':len(r['pins']),'bpRaw':len(r['raw']),'bqComplete':True,'bqPins':len(s['pins']),'bqRaw':len(s['raw']),'pairs':pairs,'normalDefault':True,'pairedOwn':own,'pairedPaint':paint,'refusals':5,'prepareMs':d['direct-prepared.json.gz']['prepareMs'],'maxStepMs':d['direct-prepared.json.gz']['maxStep'],'finalizeMs':d['formal-plan.json.gz']['elapsedMs'],'scope':'.75 three normal/fast pairs and omitted-option positive; positive records reused from failed bp aggregate; bq only rejection/release,no repeated positive paints; no UI/performance acceptance'}))
