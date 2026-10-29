"""Numeric audit of one saved CDP prefix and actual mid-proof cancellation."""
from pathlib import Path
import collections,gzip,hashlib,json,sys

def load(directory):
 d=Path(directory);r=json.loads((d/'result.json').read_text()); values={}
 for p in r['pins']:
  b=Path(p['path']).read_bytes();assert len(b)==p['bytes'] and hashlib.sha256(b).hexdigest()==p['sha256']
 for p in r['raw']:
  g=(d/p['file']).read_bytes();b=gzip.decompress(g)
  assert (len(g),hashlib.sha256(g).hexdigest(),len(b),hashlib.sha256(b).hexdigest())==(p['gzipBytes'],p['gzipSHA256'],p['jsonBytes'],p['sha256'])
  values[p['file']]=json.loads(b)
 return r,values
r,v=load(sys.argv[1]);assert r['complete'] and not r['errors'] and r['postPinsUnchanged']
assert len(r['pins'])==70 and len(r['raw'])==8 and r['profileStarted']
p=v['proof-prefix.json.gz'];assert len(p['steps'])==240 and [x['i']for x in p['steps']]==list(range(240))
assert p['before']==p['after'] and p['phase']['phase']=='proof'
c=v['cancelled.json.gz'];assert c['before']==c['after']==p['before'] and c['state']['phase']=='empty'
assert c['owner']['residentModels']==c['owner']['residentBytes']==0 and c['owner']['peakSerializedWorkingBytes']<=8388608
assert all(c['reservation'][k]==0 for k in ['records','recordsBytes','activeFrameBytes','bindings'])
assert v['cpu-observation-unavailable.json.gz']['omitted'] is True
profile=v['cpu-profile.json.gz'];assert len(profile['samples'])==len(profile['timeDeltas'])>0
names={n['id']:n['callFrame']['functionName']for n in profile['nodes']};totals=collections.Counter()
for sample,us in zip(profile['samples'],profile['timeDeltas']):assert sample in names and us>=0;totals[names[sample]]+=us
out=dict(proofSteps=240,proofPrefixMs=p['elapsedMs'],maxProofStepMs=max(s['elapsedMs']for s in p['steps']),profileSamples=len(profile['samples']),profileDurationMs=(profile['endTime']-profile['startTime'])/1000,leafSampleMs={k:totals[k]/1000 for k in ['byteLength','keyData','exact','keys','(garbage collector)','(idle)']},actualMidProofCancel=True,scope='CDP inclusive sampling only; no independent process CPU ticks,full proof,formal plan,new frame or UI/performance acceptance')
if len(sys.argv)>2:
 old,_=load(sys.argv[2]);assert not old['complete'] and len(old['errors'])==1 and old['errors'][0]['code']=='ENOENT' and not old.get('profileStarted',False)
 out['preservedPreProfileFailure']=True
print(json.dumps(out))
