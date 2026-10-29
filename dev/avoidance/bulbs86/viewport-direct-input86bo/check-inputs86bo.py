"""Raw-only changed circle/font formal plan/source comparison review."""
from pathlib import Path
import gzip,hashlib,json,sys,struct
D=Path(sys.argv[1]);r=json.loads((D/'result.json').read_text());assert r['complete']and not r['errors']and r['postPinsUnchanged']and len(r['pins'])==62 and len(r['raw'])==34
for p in r['pins']:
 b=Path(p['path']).read_bytes();assert(len(b),hashlib.sha256(b).hexdigest())==(p['bytes'],p['sha256'])
v={}
for p in r['raw']:
 g=(D/p['file']).read_bytes();b=gzip.decompress(g);assert(len(g),hashlib.sha256(g).hexdigest(),len(b),hashlib.sha256(b).hexdigest())==(p['gzipBytes'],p['gzipSHA256'],p['jsonBytes'],p['sha256']);v[p['file']]=json.loads(b)
number=lambda x:struct.unpack('>d',bytes.fromhex(x['$f64']))[0]
for kind in ['circle','font']:
 for name,code in [('stale','BULBS86BJ_STALE'),('old-plan','BULBS80N_UNKNOWN_OR_EVICTED')]:
  x=v[f'{kind}-{name}.json.gz'];assert x['failure']['code']==code and x['before']==x['after']and not x['rows']and not x['admitted']
 stage=v[kind+'-changed-stage.json.gz'];assert not stage['admitted']and stage['state']['phase']=='unprepared'and any(d['code']=='BULBS86D_PREPARE_REQUIRED'and d['runtimeAdmissionRequired']for d in stage['diagnostics'])
 prepared=v[kind+'-changed-prepared.json.gz'];issued=v[kind+'-changed-issued.json.gz'];actual=v[kind+'-changed-frame.json.gz'];oracle=v[kind+'-changed-oracle.json.gz'];assert prepared['before']==prepared['after']and issued['before']==issued['after']and issued['admitted']and actual['failure']is None and actual['admitted']
 assert issued['sourceProof']['recipe']=='one-row-compact'and oracle['source']==stage['source']and len(actual['rows'])==len(oracle['rows'])==3
 assert sum(len(x['records'])for x in actual['rows'])==126
 for a,b in zip(actual['rows'],oracle['rows']):assert a['records']==b['records']and a['root']==b['root']and b['nativeStateBefore']==b['stateRestored']and b['quality']['passed']
 if kind=='circle':assert number(stage['source']['lyricAvoidanceIndex']['regions'][0]['radius'])==.21 and issued['sourceProof']['deviceDelta']==[0,76.35078826298418]
 else:
  assert stage['fontWeight']==400
  oldFonts={p['state']['font']for row in v['font-baseline-frame.json.gz']['rows']for p in row['records']if p['kind'].endswith('Text')};newFonts={p['state']['font']for row in actual['rows']for p in row['records']if p['kind'].endswith('Text')};assert oldFonts!=newFonts
 released=v[kind+'-final-released.json.gz'];assert released['owner']['residentModels']==released['owner']['residentBytes']==0 and released['owner']['compiles']==2 and released['owner']['peakSerializedWorkingBytes']<=8388608;assert all(released['reservation'][k]==0 for k in ['records','bindings','activeFrameBytes'])
print(json.dumps(dict(changedCircleAndFontFrames=2,exactSourcePaintPerFrame=126,atomicOldAndRestoredRefusals=4,newPlansAdmitted=2,cases=r['cases'],scope='source-only current viewport input/registry change and new plan qualification; no normal UI/performance acceptance')))
