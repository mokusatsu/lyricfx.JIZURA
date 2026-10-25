"""Independent offline full-value and RGBA checker. No browser/network/product writes."""
import sys
sys.dont_write_bytecode=True
import gzip,hashlib,json,pathlib,runpy,struct,traceback,collections
ROOT=pathlib.Path('/workspace/lyricfx.JIZURA')
D=runpy.run_path(str(ROOT/'tasks/evidence/AVOID-009/resume-20261025/parent-read-raw69.py'));dec=D['dec'];U=D['UNDEFINED']
def need(v,m):
 if not v:raise AssertionError(m)
def sha(b):return hashlib.sha256(b).hexdigest()
def exact(v):
 if v is U:return ('$undefined',)
 if isinstance(v,(int,float)) and not isinstance(v,bool):return ('$f64',struct.pack('>d',v).hex())
 if isinstance(v,list):return tuple(exact(x) for x in v)
 if isinstance(v,dict):return tuple(sorted((k,exact(x)) for k,x in v.items()))
 return v
def main(raw):
 raw=pathlib.Path(raw);m=json.loads((raw/'manifest.json').read_bytes());rows=[];blobs={};counts=collections.Counter()
 for p in m['rgba']:
  gz=(raw/p['file']).read_bytes();need(len(gz)==p['bytes'] and sha(gz)==p['sha256'],'RGBA gzip integrity');b=gzip.decompress(gz);need(len(b)==2073600==p['rawBytes'] and sha(b)==p['rawSHA256'],'RGBA full-byte identity');need(p['rawSHA256'] not in blobs,'duplicate RGBA');blobs[p['rawSHA256']]=b
 for p in m['records']:
  gz=(raw/p['file']).read_bytes();need(len(gz)==p['bytes'] and sha(gz)==p['sha256'],'raw integrity');b=gzip.decompress(gz);need(len(b)==p['jsonBytes'],'raw decoded length');v=dec(json.loads(b));rows.append((p['phase'],v));counts[p['phase']]+=1
 need(m['complete'] and not m['errors'],'producer incomplete/failure');need(counts['init']==counts['result']==1,'init/result count');init=next(v for p,v in rows if p=='init');result=next(v for p,v in rows if p=='result');need(result['status']=='fidelity-only' and result['tuples']==12 and result['geometryCertified'] is False,'bounded result');need(init['plan']['cuts'][0]['text']=='風の先へ','source text')
 by=collections.defaultdict(dict);checks=0
 for phase,r in rows:
  if phase!='mode-or-check':continue
  key=(r['t'],r['own']['pass'])
  if 'name' not in r:checks+=1;need(len(r['checks'])==6,'pair assertion count');continue
  need(r['name'] not in by[key],'duplicate tuple/mode');by[key][r['name']]=r
  a,b=r['observed'],r['plain'];need(a['failure'] is None and b['failure'] is None,'partial renderer failure');need(exact(a['calls'])==exact(b['calls']) and exact(a['actions'])==exact(b['actions']),'observation Canvas action/sourcecall interference');need(blobs[a['pixelSHA256']]==blobs[b['pixelSHA256']],'observation RGBA mismatch')
  for rec in a['records']:
   need(rec['role']=='primary' and rec['owner'].startswith('contour.'),'primary owner');need(rec['pass']==r['own']['pass'],'paint pass');need(len(rec['matrix'])==6,'CTM')
   if rec['kind'] in ['fillText','strokeText']:need(rec['metrics'] and all(isinstance(v,(int,float)) for v in rec['metrics'].values()),'actual metrics')
   if rec['owner']=='contour.hero':need(rec['kind'] in ['fillText','strokeText'] and rec['args'][0]=='風' and rec['state']['lineJoin']=='round','first-kanji contour')
  need(a['calls'][0]['name']=='mainDraw' and a['calls'][0]['args'][0]['text']=='風の先へ','complete body sourcecall')
  if r['t']==1.2 and r['own']['pass']=='main':need([c['name'] for c in a['calls']]==['mainDraw','line','draw'] and a['calls'][-1]['args'][0]['text']=='風  ─  No.01','attached line/No sourcecall')
 need(len(by)==12 and checks==12 and all(len(v)==9 for v in by.values()),'12 tuples x9 modes')
 pairs=[('native','control-off'),('native','original-extracted'),('native','zero'),('zero','zero-oracle'),('joint','joint-oracle'),('related-size','related-size-oracle')]
 for key,v in by.items():
  for an,bn in pairs:
   a,b=v[an]['observed'],v[bn]['observed']
   for field in ['records','calls','actions','result']:need(exact(a[field])==exact(b[field]),'independent full-value '+field+' '+str((key,an,bn)))
   need(blobs[a['pixelSHA256']]==blobs[b['pixelSHA256']],'independent full RGBA '+str((key,an,bn)))
  n=v['native']['observed']['calls'][0]['args'][0]
  for name,dx,dy in [('zero',0,0),('joint',-90,10),('related-size',120,-40)]:
   q=v[name]['observed']['calls'][0]['args'][0];need(q['size']==n['size'] and q['text']==n['text'] and q['x']==n['x']+dx and q['y']==n['y']+dy,'native-size body source translation')
 return {'state':'PASS_CONTOUR29_REPRESENTATIVE_FIDELITY','tuples':12,'modes':108,'independentPairs':72,'rgbaBlobs':len(blobs),'allRGBABytesRecompared':True,'geometryCertified':False,'allClock':False,'adapterRegistered':False,'actualFontPolicy':init['actualFontPolicy'],'rawFiles':len(m['records'])+len(m['rgba'])}
if __name__=='__main__':
 result=None
 try:result=main(sys.argv[1])
 except BaseException as e:result={'state':'FAIL_CONTOUR29_REPRESENTATIVE_FIDELITY','failure':{'type':type(e).__name__,'message':str(e),'stack':traceback.format_exc()},'geometryCertified':False};sys.exitcode=1
 with pathlib.Path(sys.argv[2]).open('x') as f:json.dump(result,f,ensure_ascii=False,indent=2);f.write('\n')
 print(json.dumps(result,ensure_ascii=False));sys.exit(0 if result['state'].startswith('PASS_') else 1)
