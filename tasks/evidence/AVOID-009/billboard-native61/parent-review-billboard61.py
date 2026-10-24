"""Parent independent full raw decoding/native parity/catalog cross-check. No images."""
from pathlib import Path
import json,gzip,hashlib,struct,copy,collections,math,time,os
R=Path('/workspace/lyricfx.JIZURA'); N=os.environ.get('BILLBOARD_PARENT_SOURCE','61');assert N in ['61','62']; B=Path('/dev/shm/avoid009-evening-20261024/billboard'+N+'.raw01');E=R/('tasks/evidence/AVOID-009/billboard-native'+N);H=lambda b:hashlib.sha256(b).hexdigest();U=object();stat=collections.Counter();tables={};started=time.monotonic()
def dec(v):
 if isinstance(v,list):return [dec(x) for x in v]
 if isinstance(v,dict):
  if set(v)=={'$undefined'} and v['$undefined'] is True:return U
  if set(v)=={'$f64'}:return struct.unpack('>d',bytes.fromhex(v['$f64']))[0]
  return {k:dec(x) for k,x in v.items()}
 return v
def key(v):
 if v is U:return ('undefined',)
 if isinstance(v,bool):return ('bool',v)
 if isinstance(v,(float,int)):return ('f64',struct.pack('>d',v).hex())
 if isinstance(v,list):return tuple(key(x) for x in v)
 if isinstance(v,dict):return tuple(sorted((k,key(x)) for k,x in v.items()))
 return v
def eq(a,b):assert key(a)==key(b)
def ix(n):assert isinstance(n,(float,int)) and n==int(n) and n>=0;return int(n)
def unpack(b,field):
 if 'scalar' in b:return b['scalar']
 v=tables[field][ix(b['ref'])]
 if 'array' in v:return [unpack(x,field) for x in v['array']]
 return {k:unpack(x,field) for k,x in v['object']}
def put(v,refs):
 for ref in refs:
  p=v
  for k in ref['path'][:-1]:p=p[ix(k)] if isinstance(p,list) else p[k]
  k=ref['path'][-1];assert k not in p if isinstance(p,dict) else False;p[k]=tables['matrix'][ix(ref['matrixID'])]
 return v
def restore(binding):
 body=put(unpack(binding['dataBinding'],'data'),binding['bodyMatrices']);c=None
 if binding['catalogBinding']:
  b=binding['catalogBinding'];c=unpack(b['intrinsicBinding'],'catalog');root=tables['matrix'][ix(b['catalogRootMatrixID'])];rule=b['callTransformBinding'];assert rule['verifiedCalls']==len(c['sourceCalls'])
  for i,call in enumerate(c['sourceCalls']):
   if rule['kind']=='SAME_ROOT':call['matrixBeforeCall']=root[:];call['matrixAfterCall']=root[:]
   else:
    assert rule['kind']=='PER_CALL';v=rule['calls'][i]
    for prefix,field in [('before','matrixBeforeCall'),('after','matrixAfterCall')]:
     if v[prefix+'Present']:call[field]=tables['matrix'][ix(v[prefix+'MatrixID'])]
  if b['catalogRootPresent']:c['root']=root
  c=put(c,binding['catalogMatrices'])
 body['catalog']=c;return body
def read(row):
 data=[]
 for p in row['parts']:
  assert '/' not in p['path'] and '..' not in p['path'];z=(B/p['path']).read_bytes();assert len(z)==p['bytes'] and H(z)==p['sha256'];b=gzip.decompress(z);assert len(b)==p['JSONBytes']<=1048576 and H(b)==p['JSONSHA256'];data.append(b);stat['fragments']+=1
 b=b''.join(data);assert len(b)==row['JSONBytes'] and H(b)==row['JSONSHA256'] and row['complete'];return json.loads(b)
def crossCheck(v,partial=False):
 c=v['catalog'];assert c['kind']=='billboard-native-catalog' and c['role']=='primary' and not c['independentDecorOwners'];eq(c['root'],v['root']);assert c['nativeOnly']
 if partial:
  assert not c['complete'] and not c['bounded'] and c['unsupported']
  assert not c['sourceCalls'];stat['partialCatalogsRetainingFullNativePaint']+=1
  return
 else:assert c['complete'] and c['bounded'] and c['status']=='complete'
 assert all(p['role']=='primary' and p['owner'].startswith('billboard.') for p in v['paint']);assert all(x['role']=='primary' for x in c['sourceCalls'])
 assert len(v['paint'])<=2048
 for call in c['sourceCalls']:
  assert call['ordinal']<1024;kind=call['kind'];owner=call['owner'];eq(call['matrixBeforeCall'],call['matrixAfterCall']);assert owner in c['primaryOwners']
  if kind in ['rect','line','poly','circle','item','mainDraw']:
   k='draw' if kind=='item' else kind;matches=[x for x in v['trace'] if x['owner']==owner and x['kind']==k];assert matches,(kind,owner);q=matches[0];eq(q['args'],call['arguments']);eq(q['matrix'],call['matrixBeforeCall']);stat['sourcePrimitiveOrItemCalls']+=1
  elif kind=='source-clipped-radial-path':
   paints=[p for p in v['paint'] if p['owner']==owner and p['kind']=='fill'];assert len(paints)==1;paint=paints[0];g=call['gradient'];eq(paint['state']['fillStyle'],{'kind':'radial','args':g['arguments'],'creationMatrix':g['creationMatrix'],'stops':g['stops']});eq(paint['state']['alpha'],call['alphaAtFill']);eq(paint['matrix'],call['fillMatrix']);eq([{'key':q['kind'],'args':q['arguments'],'matrix':q['matrix']} for q in call['path']],paint['path']);assert paint['clips'];stat['radialConeCalls']+=1
  else:
   assert kind=='source-clipped-fillRect';paint=next(p for p in v['paint'] if p['owner']==owner and p['kind']=='fillRect');eq(paint['args'],call['arguments']);eq(paint['state']['alpha'],call['alphaAtFill']);assert paint['clips'];stat['sourceIlluminationCalls']+=1
 for p in v['paint']:
  if p['owner'].endswith('.cone') or p['owner']=='billboard.board.illumination':
   clip=p['clips'][-1];eq(clip['path'],[{'key':'rect','args':c['sourceOwnClip']['rectangle'],'matrix':c['sourceOwnClip']['matrix']}]);assert c['pass']=='main'
  else:assert not p['clips'],'source clip leaked'
 stat['catalogs']+=1;stat['actualPaintCalls']+=len(v['paint']);stat['zeroAlphaCalls']+=sum(p['state']['alpha']==0 for p in v['paint']);stat['weakPointOneStates']+=sum(s['on']==.1 for s in c['lampStates'])
mb=(B/'manifest.json').read_bytes();m=json.loads(mb);failed=N=='61';assert not m['inFlight'] and not m['partialRecords'] and m['postPins']['unchanged'];assert (not m['complete'] and len(m['errors'])==1 and 'SOURCE61_FONT_REVISION_DRIFT' in m['errors'][0]['message']) if failed else (m['complete'] and not m['errors']);assert m['completed']==({'fixtures':3,'nativeTriples':429,'wholeFramePairs':24,'partialControls':2,'contextTriples':8,'otherD':0} if failed else {'fixtures':8,'nativeTriples':657,'wholeFramePairs':64,'partialControls':2,'contextTriples':16,'otherD':3})
fixture=None;total=0;native=contexts=partial=whole=0;keybytes=collections.Counter();tableStats=[]
for row in m['records']:
 raw=read(row);assert raw['encoding']=='finiteF64hex/undefined/full-value refs';j=dec(raw['data']);total+=row['JSONBytes'];rid=row['id']
 if rid.endswith('.init'):
  fixture=rid[:-5];tables={x:[] for x in ['data','catalog','matrix']};keybytes=collections.Counter();eq(j['before']['sourcePlan'],j['after']['sourcePlan']);eq(j['before']['times'],j['after']['times']);eq(j['before']['boundaries'],j['after']['boundaries']);stat['fixtureInitializations']+=1
 if isinstance(j,dict) and 'tables' in j and all(isinstance(x,list) for x in j['tables'].values()):
  for field,items in j['tables'].items():
   for v,original in zip(items,raw['data']['tables'][field]):assert ix(v['id'])==len(tables[field]);tables[field].append(v['value']);keybytes[field]+=len(json.dumps(original['value'],ensure_ascii=False,separators=(',',':')).encode())
 if isinstance(j,dict) and 'refs' in j:
  a,b,c=[restore(j['refs'][k]) for k in ['before','off','on']]
  for k in ['pixelSHA256','root','bb','traceCore','paintCore','gradients','clips','rng']:eq(a[k],b[k]);eq(a[k],c[k])
  assert a['catalog'] is None and b['catalog'] is None;assert not a['flag'] and not b['flag'] and c['flag'];crossCheck(c,'.partial' in rid)
  if '.native' in rid:native+=1
  elif '.context' in rid:contexts+=1
  else:assert '.partial' in rid;partial+=1
 if '.whole' in rid:eq(j['before'],j['after']);whole+=1
 if rid.endswith('.inventory'):
  for k,t in j['tables'].items():assert t['entries']==len(tables[k])<=100000 and t['canonicalKeyBytes']==keybytes[k]<=67108864
  tableStats.append({'fixture':fixture,'tables':j['tables']})
 if rid=='otherD-controls':eq(j['before'],j['after']);assert len(j['before'])==3
 if rid=='parent-pure-data-storage-regression':assert j['rootCases']==128 and j['intrinsicDataAndCatalogEntriesBytesConstant'];stat['dataOnlyRootCases']=128
assert (native,contexts,partial,whole)==((429,8,2,24) if failed else (657,16,2,64));assert total==m['serializedJSONBytes']<=268435456;assert stat['weakPointOneStates']>0 and stat['zeroAlphaCalls']>0 and stat['radialConeCalls']>0
p=m['pins']
for x in p['files']+p['pycache']:assert H((R/x['path']).read_bytes())==x['sha256']
for x in p['protectedAbsent']:assert not(R/x).exists()
assert H((R/p['index']['path']).read_bytes())==p['index']['sha256']
report={'state':'FAILED61_COMPLETED_PREFIX_FULL_RAW_REVIEWED_NOT_ACCEPTED' if failed else 'PARENT_FULL_RAW_NATIVE_ONLY_ACCEPTED','manifestSHA256':H(mb),'completed':m['completed'],'reconstructedSamples':3*(native+contexts+partial),'counters':dict(stat),'serializedJSONBytes':total,'tables':tableStats,'allLiteralFragmentsFullHashAndCRC':True,'independentPythonFullValueDecodeAndMatrixReconstruction':True,'independentOriginalOffOnFullPaintClipGradientRNGAndRGBAExact':True,'catalogComparedToActualTraceAndCanvasPaint':True,'sourcePinsPostVerified':True,'noAppearanceChangeHumanReviewUnneededReason':None if failed else 'Native-only isolated instrumentation preserves every sampled original/OFF/ON full paint/RGBA; canonical integration is separate and not accepted here. No new visual behavior to judge.','canonicalIntegrated':False,'transportQualified':False,'adapter':False,'allTimeOrNumericalCertificate':False,'formalPerformance':False,'savingBodyTested':False,'publicChecks':0,'parentImages':0,'elapsedSeconds':time.monotonic()-started}
(E/('parent-raw-review'+N+'.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='tables'}))
