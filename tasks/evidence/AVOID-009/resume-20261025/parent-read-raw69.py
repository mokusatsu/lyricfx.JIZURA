"""Parent-only read of archived SOURCE69 actual01; no browser or product mutation."""
import base64, gzip, hashlib, json, os, pathlib, struct, subprocess, sys, tempfile, zlib
ROOT=pathlib.Path('/workspace/lyricfx.JIZURA')
REF='archive/avoid009-bulbs69-actual01-20261025-attempt1'
PREFIX='tasks/evidence/AVOID-009/bulbs-source69-runs/avoid009-bulbs69-actual01-20261025/'
UNDEFINED=object()
def need(v):
 if not v: raise AssertionError('raw integrity/restore assertion')
def dec(x):
 if isinstance(x,list): return [dec(v) for v in x]
 if isinstance(x,dict):
  if set(x)=={'$f64'}: return struct.unpack('>d',bytes.fromhex(x['$f64']))[0]
  if x=={'$undefined':True}: return UNDEFINED
  return {k:dec(v) for k,v in x.items()}
 return x
def idx(x):
 need(isinstance(x,(int,float)) and int(x)==x and x>=0);return int(x)
def restore(b,t):
 def table(k,i):
  i=idx(i);need(i<len(t[k]));return dec(t[k][i])
 def dag(b):
  if 'scalar' in b:return dec(b['scalar'])
  body=table('catalog',b['ref'])
  if 'array' in body:return [dag(v) for v in body['array']]
  return {k:dag(v) for k,v in body['object']}
 typ=b['type']
 if typ=='scalar':return dec(b['value'])
 if typ=='array':return [restore(v,t) for v in b['items']]
 if typ=='object':return {k:restore(v,t) for k,v in b['entries']}
 if typ=='metadata59-gzip-v2':
  need(isinstance(b['jsonBytes'],int) and 0<=b['jsonBytes']<=16777216)
  z=zlib.decompressobj(31);raw=z.decompress(base64.b64decode(b['gzipBase64'],validate=True),16777217)
  need(z.eof and not z.unused_data and not z.unconsumed_tail and len(raw)==b['jsonBytes'] and hashlib.sha256(raw).hexdigest()==b['jsonSHA256'])
  return dec(json.loads(raw))
 if typ=='paint-v2':
  d=table('paint',b['descriptor']);m=table('matrix',b['matrix']);pb=b['pathBinding'];need(pb['kind'] in ['PAINT_ROOT','PER_COMMAND'])
  if pb['kind']=='PER_COMMAND':need(len(pb['matrixIDs'])==len(d['path']))
  d['matrix']=m;d['path']=[{**c,'matrix':m[:] if pb['kind']=='PAINT_ROOT' else table('matrix',pb['matrixIDs'][i])} for i,c in enumerate(d['path'])];return d
 if typ=='paint':
  d=table('paint',b['descriptor']);d['matrix']=table('matrix',b['matrix'])
  d['path']=[{**{k:v for k,v in c.items() if k!='matrixID'},'matrix':table('matrix',c['matrixID'])} for c in d['path']];return d
 need(typ=='catalog');binding=b['binding'];body=dag(binding['intrinsicBinding']);root=table('matrix',binding['catalogRootMatrixID']);calls=body['sourceCalls'];cb=binding['callTransformBinding'];out=[]
 for i,call in enumerate(calls):
  c=dict(call)
  if cb['kind']=='SAME_ROOT':
   need(cb['verifiedCalls']==len(calls));c.update(matrixBeforeCall=root[:],matrixAfterCall=root[:])
  else:
   need(cb['kind']=='PER_CALL' and len(cb['calls'])==len(calls));p=cb['calls'][i]
   if p['beforePresent']:c['matrixBeforeCall']=table('matrix',p['beforeMatrixID'])
   if p['afterPresent']:c['matrixAfterCall']=table('matrix',p['afterMatrixID'])
  out.append(c)
 body['sourceCalls']=out
 if binding['catalogRootPresent']:body['root']=root
 return body
def main():
 with tempfile.TemporaryDirectory(prefix='parent-raw69-',dir='/dev/shm') as tmp:
  env=os.environ.copy();env.update(GIT_DIR=tmp+'/repo.git',GIT_ALTERNATE_OBJECT_DIRECTORIES=str(ROOT/'.git/objects'),TMPDIR=tmp,GIT_CONFIG_COUNT='2',GIT_CONFIG_KEY_0='gc.auto',GIT_CONFIG_VALUE_0='0',GIT_CONFIG_KEY_1='maintenance.auto',GIT_CONFIG_VALUE_1='false')
  def g(*a):return subprocess.check_output(['git',*a],env=env,cwd=ROOT,stderr=subprocess.PIPE)
  g('init','--bare',tmp+'/repo.git');g('update-ref','refs/heads/base','4a76100c63b3a8b55c7c12ad9e98656ba37f9599');g('fetch','--no-tags','https://github.com/mokusatsu/lyricfx.JIZURA.git','refs/heads/'+REF+':refs/heads/raw')
  def blob(name):return g('show','raw:'+PREFIX+name)
  m=json.loads(blob('raw/manifest.json'));case=None;tables={};native={};phases={};count=0;total=0;lastseq={}
  for row in m['records']:
   raw=blob('raw/'+row['file']);need(len(raw)==row['bytes'] and hashlib.sha256(raw).hexdigest()==row['sha256']);data=gzip.decompress(raw);need(len(data)==row['JSONBytes']);total+=len(data);r=json.loads(data)
   if r['case']!=case:case=r['case'];tables={k:[] for k in ['matrix','paint','catalog']}
   need(r['sequence']==row['sequence'] and r['sequence']==lastseq.get(case,-1)+1);lastseq[case]=r['sequence']
   for k,delta in r['tableDeltas'].items():
    for entry in delta:need(entry['id']==len(tables[k]));tables[k].append(entry['value'])
    need(r['tableStats'][k]['entries']==len(tables[k]))
   v=restore(r['binding'],tables);need(v['phase']==row['phase']);phases[v['phase']]=phases.get(v['phase'],0)+1
   if v['phase']=='native-frame':native.setdefault(case,[]).append((idx(v['n']),v['hash'],v['time']))
   count+=1
  a=native['baseline-original'];b=native['candidate-default'];need(len(a)==len(b)==250 and a==b and [v[0] for v in a]==list(range(250)))
  failed=[]
  for row in m['failedRequests']:
   raw=blob('raw/'+row['file']);need(len(raw)==row['bytes'] and hashlib.sha256(raw).hexdigest()==row['sha256']);data=gzip.decompress(raw);need(len(data)==row['rawBytes']);v=json.loads(data);need('value'in v and row['completeIncomingRequest']);target=ROOT/'tasks/evidence/AVOID-009/resume-20261025'/row['file'];need(not target.exists() or target.read_bytes()==raw);target.write_bytes(raw);failed.append({'phase':dec(v['value'])['phase'],'fullEncodedBytes':len(data)})
  result={'archiveCommit':g('rev-parse','raw').decode().strip(),'allStoredRecordHashesAndLengthsVerified':True,'allStoredRecordsIndependentlyRestored':count,'native250HashClockAndOrderEqual':True,'phases':phases,'storedJSONBytes':total,'failedIncomingRequests':failed,'producerComplete':m['complete'],'newRecipeProofAccepted':False,'fullGeometryAccepted':False,'publicChecks':0,'parentImages':0}
  out=ROOT/'tasks/evidence/AVOID-009/resume-20261025/parent-actual01-raw-integrity.json';out.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
if __name__=='__main__':main()
