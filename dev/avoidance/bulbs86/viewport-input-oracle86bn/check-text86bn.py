"""Reuse changed-text formal paint; audit corrected independent oracle only."""
from pathlib import Path
import gzip,hashlib,json,sys
D=Path(sys.argv[1]);oldD=Path(sys.argv[2]);r=json.loads((D/'result.json').read_text());oldR=json.loads((oldD/'result.json').read_text());assert r['complete']and not r['errors']and r['postPinsUnchanged'];assert not oldR['complete']and len(oldR['errors'])==1
for result in [r,oldR]:
 for p in result['pins']:
  b=Path(p['path']).read_bytes();assert(len(b),hashlib.sha256(b).hexdigest())==(p['bytes'],p['sha256'])
def raw(directory,p):
 g=(directory/p['file']).read_bytes();b=gzip.decompress(g);assert(len(g),hashlib.sha256(g).hexdigest(),len(b),hashlib.sha256(b).hexdigest())==(p['gzipBytes'],p['gzipSHA256'],p['jsonBytes'],p['sha256']);return json.loads(b)
v={p['file']:raw(D,p)for p in r['raw']};old={p['file']:raw(oldD,p)for p in oldR['raw']};oracle=v['text-oracle.json.gz'];frame=old['text-changed-frame.json.gz'];issued=old['text-changed-issued.json.gz'];stage=old['text-changed-stage.json.gz'];assert oracle['source']==stage['source']and oracle['source']['cuts'][0]['text']=='風風先先';assert oracle['owner']['compiles']==0 and issued['admitted']and issued['sourceProof']['recipe']=='one-row-compact'
count=0
for actual,reference in zip(frame['rows'],oracle['rows']):
 assert actual['records']==reference['records']and actual['root']==reference['root']and reference['nativeStateBefore']==reference['stateRestored']and reference['quality']['passed'];count+=len(actual['records'])
assert count==126 and len(frame['rows'])==len(oracle['rows'])==3
for name,code in [('text-stale','BULBS86BJ_STALE'),('text-old-plan','BULBS80N_UNKNOWN_OR_EVICTED')]:
 x=old[name+'.json.gz'];assert x['failure']['code']==code and x['before']==x['after']and not x['rows']and not x['admitted']
assert stage['diagnostics'][0]['code']=='BULBS86D_PREPARE_REQUIRED'and not stage['admitted'];assert old['text-baseline-released.json.gz']['owner']['residentModels']==0
# Preserve the first oracle's exact state mismatch; no fields are dropped.
failed=old['text-changed-oracle.json.gz'];differences=[]
for actual,reference in zip(frame['rows'],failed['rows']):
 for a,b in zip(actual['records'],reference['records']):
  if a!=b:
   assert {k:v for k,v in a.items()if k!='state'}=={k:v for k,v in b.items()if k!='state'}
   fields={k for k in a['state']if a['state'][k]!=b['state'][k]};assert fields=={'strokeStyle','lineWidth'};differences.append(a['owner'])
assert differences==['bulbs.sign.shadow','bulbs.sign.face']
print(json.dumps(dict(reusedChangedTextFormalFrame=1,exactPaintRecords=count,own=3,newCompiles=0,atomicOldPlanRefusals=2,preservedFailedOracleStateFields=['strokeStyle','lineWidth'],scope='text new plan admitted; corrected current source oracle only, no repeated model/paint or UI acceptance')))
