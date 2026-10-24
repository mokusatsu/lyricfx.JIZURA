"""Independent parent raw/provenance and finite-screen geometry review; no imagery."""
from pathlib import Path
import ast,json,gzip,hashlib,struct,math,collections,os,time
from fractions import Fraction as F
R=Path('/workspace/lyricfx.JIZURA');B=Path('/dev/shm/avoid009-evening-20261024/bulbs58.raw01');E=R/'tasks/evidence/AVOID-009/bulbs-reshape58';H=lambda b:hashlib.sha256(b).hexdigest();Q=F.from_float;U=object();stats=collections.Counter();started=time.monotonic()
helper=R/'tasks/evidence/AVOID-009/bulbs-diagnostic56/parent-review-bulbs56.py';tree=ast.parse(helper.read_text());names={'dec','dy','numericID','cross','hull','geom','conflict','stage','clock','core'};nodes=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in names];assert len(nodes)==len(names);exec(compile(ast.Module(body=nodes,type_ignores=[]),str(helper),'exec'),globals())
def exact(v):
 if v is U:return ('$undefined',)
 if isinstance(v,(int,float)) and not isinstance(v,bool):return ('$number',struct.pack('>d',float(v)).hex())
 if isinstance(v,list):return tuple(exact(x) for x in v)
 if isinstance(v,dict):return tuple(sorted((k,exact(x)) for k,x in v.items()))
 return v
def read(folder,row):
 out=[]
 for p in row['parts']:
  assert '/' not in p['path'] and '..' not in p['path'];z=(folder/p['path']).read_bytes();assert len(z)==p['bytes'] and H(z)==p['sha256'];b=gzip.decompress(z);assert len(b)==p['JSONBytes']<=1048576 and H(b)==p['JSONSHA256'];out.append(b);stats['fragments']+=1
 b=b''.join(out);assert len(b)==row['JSONBytes'] and H(b)==row['JSONSHA256'] and row['complete'];return json.loads(b)
T={k:[] for k in ['paint','matrix','catalog']};keyBytes=collections.Counter()
def unpack(binding):
 if 'scalar' in binding:return binding['scalar']
 b=T['catalog'][numericID(binding['ref'])]
 if 'array' in b:return [unpack(x) for x in b['array']]
 return {k:unpack(x) for k,x in b['object']}
def catalog(binding):
 b=unpack(binding['intrinsicBinding']);root=T['matrix'][numericID(binding['catalogRootMatrixID'])];rule=binding['callTransformBinding'];assert rule['verifiedCalls']==len(b['sourceCalls']);calls=[]
 for i,c in enumerate(b['sourceCalls']):
  c=dict(c)
  if rule['kind']=='SAME_ROOT':c.update(matrixBeforeCall=root[:],matrixAfterCall=root[:])
  else:
   assert rule['kind']=='PER_CALL';pair=rule['calls'][i]
   if pair['beforePresent']:c['matrixBeforeCall']=T['matrix'][numericID(pair['beforeMatrixID'])]
   if pair['afterPresent']:c['matrixAfterCall']=T['matrix'][numericID(pair['afterMatrixID'])]
  calls.append(c)
 b['sourceCalls']=calls
 if binding['catalogRootPresent']:b['root']=root
 return b
def observation(o):
 passes=[{**p,'catalog':catalog(p['catalogBinding'])} for p in o['passes']];paints=[]
 for ref in o['paintRefs']:
  assert ref['ordinal']==len(paints);d=T['paint'][numericID(ref['paintID'])];M=T['matrix'][numericID(ref['matrixID'])];p={**d,'matrix':M,'path':[{**{k:v for k,v in c.items() if k!='pathMatrix'},'matrix':M} for c in d['path']]};assert p['owner']==ref['owner'] and p['pass']==ref['pass'] and p['state']['alpha']==ref['alpha']>0 and p['role']=='primary';paints.append(p)
 assert sum(p['actualPaintRecords'] for p in passes)==len(paints);stats['catalogsReconstructed']+=len(passes);stats['paintsReconstructed']+=len(paints);return passes,paints
def bounds(poly):return {'x0':min(x for x,y in poly),'x1':max(x for x,y in poly),'y0':min(y for x,y in poly),'y1':max(y for x,y in poly)}
def circleData(p):
 M=list(map(Q,p['matrix']));arc=next(x for x in p['path'] if x['key']=='arc');x,y,r=map(Q,arc['args'][:3]);assert M[1]==M[2]==0 and M[0]==M[3];return (M[0]*x+M[4],M[3]*y+M[5],abs(M[0])*r)
def boxClear(d,b,gap):
 x,y,r=d;dx=max(b['x0']-x,F(0),x-b['x1']);dy=max(b['y0']-y,F(0),y-b['y1']);return dx*dx+dy*dy>(r+2+Q(gap))**2
mb=(B/'manifest.json').read_bytes();assert H(mb)=='92cd06fd28bce80ae30c1c6d628c5895a7d0556e5443e8ff04701b3e60363328';m=json.loads(mb);assert m['complete'] and not m['errors'] and m['postPins']['unchanged'];assert m['completed']['nativeStates']==250 and m['completed']['nativePasses']==727 and m['completed']['screens']==54 and m['completed']['destinationMaterializations']==m['completed']['fullGeometryAcquisitions']==0
native={};clocks=None;screens=[];inventory=None;jsonBytes=0;seen=set()
for row in m['records']:
 assert row['id'] not in seen;seen.add(row['id']);raw=read(B,row);j=dec(raw['data']);jsonBytes+=row['JSONBytes'];name=row['id']
 if 'tables' in j and all(isinstance(v,list) for v in j['tables'].values()):
  for k,values in j['tables'].items():
   for x,original in zip(values,raw['data']['tables'][k]):
    assert numericID(x['id'])==len(T[k]);T[k].append(x['value']);keyBytes[k]+=len(json.dumps(original['value'],ensure_ascii=False,separators=(',',':')).encode())
 if name=='init':clocks=j['clocks'];clock(clocks)
 if name.startswith('native.state'):
  n=numericID(j['n']);p,paints=observation(j);assert j['actualNativeFrameRecaptured'] and j['nativeZeroObserverEqual'] and j['observerPixelEqual'];assert j['originalSHA256']==j['observedSHA256']==j['nativeReferenceSHA256'];native[n]=(j,p,paints);stats['nativeWholePixelPairs']+=1
 if name.startswith('recipe') and name.endswith('.screen'):
  o=j['observation'];p,paints=observation(o);assert not o['actualNativeFrameRecaptured'] and 'capturedPreviously' in o['originalSHA256Source'] and o['nativeReferenceSHA256']==native[90][0]['originalSHA256'];assert o['recipeUnobservedSHA256']==o['observedSHA256'] and o['observerPixelEqual'];assert j['notFullyEvaluated'];recipe=j['recipe'];polys=[geom(x) for x in paints];stats['independentScreenPaintSupports']+=len(polys);stats['independentScreenVertices']+=sum(map(len,polys));count=collections.Counter()
  for own in p:
   tag=own['pass'];c=own['catalog'];ref=next(x['catalog'] for x in native[90][1] if x['pass']==tag);assert c['nativeOnly'] is False
   for k in ['clock','seed','params','sourceInputs','effectiveFX','primaryOwners','independentDecorOwners','q','out','culled','cullReason','step','beatFlash','ghostFace']:assert exact(c.get(k,U))==exact(ref.get(k,U)),(name,k)
   strip=lambda calls:[{k:v for k,v in q.items() if k not in ['matrixBeforeCall','matrixAfterCall']} for q in calls];assert exact(strip(c['sourceCalls']))==exact(strip(ref['sourceCalls']));assert c['size']==ref['size']*recipe['scale'] and c['ss']==ref['ss'];assert c['text'].replace('\n','')==ref['text'];assert [(x['ch'],x['i']) for x in c['m']['lay']]==[(x['ch'],x['i']) for x in ref['m']['lay']];assert [x['i'] for x in c['m']['lay']]==[0,1,2,3]
   for A,B0 in zip(c['rings'],ref['rings']):
    assert A['N']==B0['N']==len(A['points']);stripLight=lambda lights:[{k:v for k,v in q.items() if k not in ['p','r']} for q in lights];assert exact(stripLight(A['lights']))==exact(stripLight(B0['lights']))
   ids=[i for i,x in enumerate(paints) if x['pass']==tag];glyph=[i for i in ids if paints[i]['owner'].endswith('.lyric')];caption=[i for i in ids if paints[i]['owner'].endswith('.subtitle')];assert [paints[i]['args'][0] for i in glyph]==list('風の先へ');qrow=next(x for x in j['quality']['passes'] if x['pass']==tag);assert qrow['held']==(own['lt']>=.35 and own['pOut']==0 and c['q']==1)
   assert c['lyric']['size']>=129.6*.70 and c['subtitle']['size']==20.736 and c['subtitle']['text']=='No.01'
   boxes={i:bounds(polys[i]) for i in ids};bulbs=[i for i in ids if paints[i]['owner'].endswith('.bulb')];halos=[i for i in ids if paints[i]['owner'].endswith('.halo')]
   if '\n' in c['text']:
    top=[i for i in glyph if paints[i]['args'][0] in ['風','の']];bottom=[i for i in glyph if paints[i]['args'][0] in ['先','へ']];assert min(boxes[i]['y0'] for i in bottom)-max(boxes[i]['y1'] for i in top)>=Q(max(2,.04*c['lyric']['size']))
   if caption:assert min(boxes[i]['y0'] for i in caption)-max(boxes[i]['y1'] for i in glyph)>=Q(5.184)
   for i in bulbs+halos:
    halo=i in halos;d=circleData(paints[i])
    for text in glyph+caption:
     if not boxClear(d,boxes[text],0 if halo else 5.184):count['actual-painted-halo-text-clearance' if halo else 'bulb-body-text-gap']+=1
   for ring in c['rings']:
    entries={int(paints[i]['owner'].split('.')[-2]):i for i in bulbs if paints[i]['owner'].startswith('bulbs.sign.ring.'+str(numericID(ring['ri']))+'.state.'+str(numericID(ring['N']))+'.')}
    if not entries:assert tag!='main';continue
    assert len(entries)==ring['N']
    for i in range(numericID(ring['N'])):
     a=circleData(paints[entries[i]]);b=circleData(paints[entries[(i+1)%len(entries)]]);dist=(a[0]-b[0])**2+(a[1]-b[1])**2
     if dist<(a[2]+b[2]+Q(4.86))**2:count['neighbor-bulb-body-gap']+=1
     stats['independentNeighborPairs']+=1
  expected=collections.Counter(x['criterion'] for x in j['quality']['failures']);assert count==expected,(name,count,expected);assert j['quality']['passed']==(not bool(count))
  chosen=j['screenPlacement']['chosen']
  if chosen:
   delta=list(map(Q,chosen['delta']));shifted=[[(x+delta[0],y+delta[1]) for x,y in poly] for poly in polys];assert all(not stage(poly) and not conflict(poly,m['circle']) for poly in shifted);stats['partialHeldCandidatesIndependentlyChecked']+=1
  screens.append({'recipe':recipe['id'],'qualityPassed':j['quality']['passed'],'heldCandidate':chosen is not None,'criteria':dict(count)});stats['screens']+=1
 if name=='inventory':inventory=j
assert jsonBytes==m['serializedJSONBytes']<=268435456
for k in T:assert len(T[k])==inventory['tables'][k]['entries']<=100000 and keyBytes[k]==inventory['tables'][k]['canonicalKeyBytes']<=67108864,(k,keyBytes[k],inventory['tables'][k])
# Compare the entire fresh native reference with the accepted56 actual capture.
old=B.parent/'bulbs56.raw01';oldBytes=(old/'manifest.json').read_bytes();assert H(oldBytes)=='c0f2224a4620514b6c7b2f537cc0fd71b3f5b09a4b87ae53c1ac247b2427d31e';om=json.loads(oldBytes);t56={k:[] for k in T};compared=0
for row in om['records']:
 if not row['id'].startswith('four-wind.'):continue
 if '.circle' in row['id']:break
 j=read(old,row)
 if row['id'].startswith('four-wind.tables.n'):
  for k,values in j['tables'].items():
   for x in values:assert x['id']==len(t56[k]);t56[k].append(x['value'])
 if row['id'].startswith('four-wind.state'):
  current,passes,paints=native[j['n']];assert current['originalSHA256']==j['originalSHA256']==j['observedSHA256'];oldPaints=[]
  for u in j['paintUses']:
   d=dec(t56['paint'][u['templateID']]);M=dec(t56['matrix'][u['matrixID']]);oldPaints.append({**d,'matrix':M,'pass':u['pass'],'owner':u['owner'],'role':u['role'],'path':[{**{k:v for k,v in c.items() if k!='pathMatrix'},'matrix':M} for c in d['path']]})
  assert exact(paints)==exact(oldPaints)
  for p in j['passes']:
   b=p['catalogBinding'];c=dec(t56['catalog'][b['catalogIntrinsicID']]);M=dec(t56['matrix'][b['catalogRootMatrixID']]);calls=[]
   for call in c['sourceCalls']:calls.append({**call,'matrixBeforeCall':M[:],'matrixAfterCall':M[:]})
   assert b['callTransformBinding']['kind']=='SAME_ROOT';c['sourceCalls']=calls
   if b['catalogRootPresent']:c['root']=M
   assert exact(c)==exact(next(x['catalog'] for x in passes if x['pass']==p['pass']))
  compared+=1
assert compared==250 and stats['screens']==54
for x in m['pins']['files']+m['pins']['pycache']:assert H((R/x['path']).read_bytes())==x['sha256']
for x in m['pins']['absent62']:assert not os.path.lexists(R/x)
assert H((R/'.git/index').read_bytes())==m['pins']['index']['sha256']
report={'state':'PARENT58_COMPLETE_NATIVE_AND_PARTIAL_SCREEN_RAW_ACCEPTED_NO_FULLPHASE_CANDIDATE','manifestSHA256':H(mb),'stats':dict(stats),'native250FullPaintCatalogAndWholeRGBAEqualTo56':compared,'all54SourceGlyphOrderIndicesAndOriginalLightCadenceChecked':True,'all54IndependentNeighborAndActualHaloTextCountsChecked':True,'tableCanonicalBytesIndependentlySummed':dict(keyBytes),'screens':screens,'fullGeometryAcquisitions':0,'destinationMaterializations':0,'newLayoutQualified':False,'noGlobalImpossibilityConclusion':True,'sourcePostpins124PYC7Index62IndependentlyRechecked':True,'numericalFoundationConditional':True,'formalPerformanceAccepted':False,'savingBodyTested':False,'productAccepted':False,'humanApproval':False,'publicChecks':0,'parentImagesViewed':0,'geometryHelperSHA256':H(helper.read_bytes()),'seconds':time.monotonic()-started};(E/'parent-raw-review58.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='screens'},indent=2))
