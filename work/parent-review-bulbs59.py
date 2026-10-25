"""Independent parent raw/provenance and full-state geometry review; no imagery."""
from pathlib import Path
import ast,json,gzip,hashlib,struct,math,collections,os,time
from fractions import Fraction as F
R=Path('/workspace/lyricfx.JIZURA');B=Path('/dev/shm/avoid009-evening-20261024/bulbs59.raw01');E=R/'tasks/evidence/AVOID-009/bulbs-focused59';H=lambda b:hashlib.sha256(b).hexdigest();Q=F.from_float;U=object();stats=collections.Counter();started=time.monotonic()
helper=R/'tasks/evidence/AVOID-009/bulbs-diagnostic56/parent-review-bulbs56.py';tree=ast.parse(helper.read_text());names={'dec','dy','numericID','cross','hull','geom','conflict','stage','clock','core'};nodes=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in names];assert len(nodes)==len(names);exec(compile(ast.Module(body=nodes,type_ignores=[]),str(helper),'exec'),globals())
def exact(v):
 if v is U:return ('$undefined',)
 if isinstance(v,(int,float)) and not isinstance(v,bool):return ('$number',struct.pack('>d',float(v)).hex())
 if isinstance(v,list):return tuple(exact(x) for x in v)
 if isinstance(v,dict):return tuple(sorted((k,exact(x)) for k,x in v.items()))
 return v
def dy(v):
 e=v['e'];assert isinstance(e,(int,float)) and math.isfinite(e) and e==int(e)
 return F(int(v['n']))*F(2)**int(e)
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
def sourceInvariant(p,ref,recipe):
 assert len(p)==len(ref)
 for own,original in zip(p,ref):
  assert own['pass']==original['pass'];c=own['catalog'];r=original['catalog']
  for k in ['pass','tp','lt','ltb','step','pIn','pOut','energy','beat','beatPulse']:assert exact(own[k])==exact(original[k]),k
  for k in ['clock','seed','params','sourceInputs','effectiveFX','primaryOwners','independentDecorOwners','q','out','culled','cullReason','step','beatFlash','ghostFace']:assert exact(c.get(k,U))==exact(r.get(k,U)),k
  strip=lambda calls:[{k:v for k,v in x.items() if k not in ['matrixBeforeCall','matrixAfterCall']} for x in calls];assert exact(strip(c['sourceCalls']))==exact(strip(r['sourceCalls']))
  assert c['nativeOnly'] is False and c['size']==r['size']*recipe['scale'] and c['ss']==r['ss'];assert c['text'].replace('\n','')==r['text'];assert len(c['rings'])==len(r['rings'])
  for a,b in zip(c['rings'],r['rings']):
   assert a['N']==b['N']==len(a['points'])==a['originalN'];light=lambda v:[{k:q for k,q in x.items() if k not in ['p','r']} for x in v];assert exact(light(a['lights']))==exact(light(b['lights']))
  if not c['culled']:
   assert c['r']==r['r']*recipe['radiusScale']
   for k in ['original','text','UTF16Length','truncated','fs','size']:assert exact(c['subtitle'][k])==exact(r['subtitle'][k])
def qualityCheck(p,paints,polys,q,recipe):
 expectedAll=collections.Counter();neighbors=shortfalls=0
 for own in p:
  tag=own['pass'];c=own['catalog'];saved=next(x for x in q['passes'] if x['pass']==tag);held=own['lt']>=.35 and own['pOut']==0 and c['q']==1;assert saved['held']==held
  if not held:
   assert saved['passed'] is None and not saved['neighborRecords'] and not saved['preferredShortfalls'] and not saved['failures'];continue
  ids=[i for i,x in enumerate(paints) if x['pass']==tag];glyph=[i for i in ids if paints[i]['owner'].endswith('.lyric')];caption=[i for i in ids if paints[i]['owner'].endswith('.subtitle')];assert [paints[i]['args'][0] for i in glyph]==list('風の先へ');assert c['lyric']['size']==129.6*recipe['scale']>=129.6*.70 and c['subtitle']['text']=='No.01' and c['subtitle']['size']==20.736
  boxes={i:bounds(polys[i]) for i in ids};top=[i for i in glyph if paints[i]['args'][0] in ['風','の']];bottom=[i for i in glyph if paints[i]['args'][0] in ['先','へ']];assert min(boxes[i]['y0'] for i in bottom)-max(boxes[i]['y1'] for i in top)>=Q(max(2,.04*129.6*recipe['scale']))
  face=next((i for i in ids if paints[i]['owner'].endswith('.face') and paints[i]['kind']=='fill'),None);count=collections.Counter()
  if face is not None:
   M=list(map(Q,paints[face]['matrix']));points=[]
   for cmd in paints[face]['path']:
    if cmd['key'] in ['moveTo','lineTo']:
     x,y=map(Q,cmd['args'][:2]);points.append((M[0]*x+M[2]*y+M[4],M[1]*x+M[3]*y+M[5]))
   outline=next((i for i in ids if paints[i]['owner'].endswith('.outline') and paints[i]['kind']=='stroke'),None);pad=Q(2+3.24)
   if outline is not None:pad+=Q(paints[outline]['state']['lineWidth'])*Q(paints[outline]['state']['miterLimit']/2)*abs(Q(paints[outline]['matrix'][0]))
   for i in glyph+caption:
    for a,b in zip(points,points[1:]+points[:1]):
     length=(b[0]-a[0])**2+(b[1]-a[1])**2
     if length and any(cross(a,b,v)<0 or cross(a,b,v)**2<pad**2*length for v in polys[i]):count['text-outline-clearance']+=1
   if caption and min(boxes[i]['y0'] for i in caption)-max(boxes[i]['y1'] for i in glyph)<Q(5.184):count['main-caption-gap']+=1
   bulbs=[i for i in ids if paints[i]['owner'].endswith('.bulb')];halos=[i for i in ids if paints[i]['owner'].endswith('.halo')]
   for i in bulbs+halos:
    halo=i in halos;disk=circleData(paints[i])
    for t in glyph+caption:
     if not boxClear(disk,boxes[t],0 if halo else 5.184):count['actual-painted-halo-text-clearance' if halo else 'bulb-body-text-gap']+=1
   savedNeighbors=[];pref=[]
   for ring in c['rings']:
    prefix='bulbs.sign.ring.'+str(numericID(ring['ri']))+'.state.'+str(numericID(ring['N']))+'.';entries={int(paints[i]['owner'].split('.')[-2]):i for i in bulbs if paints[i]['owner'].startswith(prefix)}
    if not entries:assert tag!='main';continue
    assert len(entries)==ring['N']
    for i in range(numericID(ring['N'])):
     a=circleData(paints[entries[i]]);b=circleData(paints[entries[(i+1)%len(entries)]]);d2=(a[0]-b[0])**2+(a[1]-b[1])**2;rs=a[2]+b[2];hard=d2>=(rs+Q(recipe['neighborHardMinimum']))**2;preferred=d2>=(rs+Q(4.86))**2;row=saved['neighborRecords'][len(savedNeighbors)];assert row['ri']==ring['ri'] and row['N']==ring['N'] and row['i']==i and row['next']==(i+1)%len(entries);assert dy(row['squaredCenterDistance'])==d2 and dy(row['sumLogicalRadii'])==rs;assert row['hardPassed']==hard and row['preferredMet']==preferred and row['hardMinimumLogicalGap']==recipe['neighborHardMinimum'] and row['preferredMinimumLogicalGap']==4.86
     if not preferred:pref.append(len(savedNeighbors))
     if not hard:count['neighbor-bulb-body-gap']+=1
     savedNeighbors.append(row)
   assert saved['preferredShortfalls']==pref and len(saved['neighborRecords'])==len(savedNeighbors);neighbors+=len(savedNeighbors);shortfalls+=len(pref)
  else:assert tag!='main' and not caption and not saved['neighborRecords']
  assert count==collections.Counter(x['criterion'] for x in saved['failures']) and saved['passed']==(not count),(tag,count,saved['failures']);expectedAll.update(count)
 assert expectedAll==collections.Counter(x['criterion'] for x in q['failures']);assert q['passed']==(not expectedAll) and q['neighborInventory']=={'records':neighbors,'preferredShortfalls':shortfalls};stats['independentNeighborPairs']+=neighbors;stats['preferredShortfallsPreserved']+=shortfalls;return q['passed']
def evaluate(p,paints,polys,delta=(F(0),F(0))):
 counts=collections.Counter({'circleStrict':0,'circleMovingPolicy':0,'stage':0})
 for paint,poly in zip(paints,polys):
  shifted=[(x+delta[0],y+delta[1]) for x,y in poly];hit=conflict(shifted,m['circle']);own=next(x for x in p if x['pass']==paint['pass']);moving=not paint['owner'].endswith(('.lyric','.subtitle')) and (own['lt']<.35 or 0<own['pOut']<1);counts['circleStrict']+=hit;counts['circleMovingPolicy']+=hit and not moving;counts['stage']+=stage(shifted)
 return counts
mb=(B/'manifest.json').read_bytes();assert H(mb)=='9c228e33ddea86851c4cf6cae5ffe61bc7debfddb0ca1b30121a2760844976b1';m=json.loads(mb);assert m['complete'] and not m['errors'] and m['postPins']['unchanged'] and not m['inFlight'] and not m['partialRecords'];assert m['completed']['nativeStates']==250 and m['completed']['nativePasses']==727 and m['completed']['untranslatedFields']==2 and m['completed']['untranslatedStates']==500 and m['completed']['untranslatedPasses']==1454 and m['completed']['modelFamilies']==2
native={};untranslated=collections.defaultdict(dict);families={};summaries=[];inventory=None;jsonBytes=0;seen=set();fullFields=0;deltaStarted=False;qualityTotals=collections.defaultdict(collections.Counter);destTotals=collections.defaultdict(collections.Counter)
for row in m['records']:
 assert row['id'] not in seen;seen.add(row['id']);raw=read(B,row);j=dec(raw['data']);jsonBytes+=row['JSONBytes'];name=row['id']
 if 'tables' in j and all(isinstance(v,list) for v in j['tables'].values()):
  for k,values in j['tables'].items():
   for x,original in zip(values,raw['data']['tables'][k]):
    assert numericID(x['id'])==len(T[k]);T[k].append(x['value']);keyBytes[k]+=len(json.dumps(original['value'],ensure_ascii=False,separators=(',',':')).encode())
 if name=='init':clock(j['clocks'])
 if name.startswith('native.state'):
  n=numericID(j['n']);p,paints=observation(j);assert j['actualNativeFrameRecaptured'] and j['nativeZeroObserverEqual'] and j['observerPixelEqual'];assert j['originalSHA256']==j['observedSHA256']==j['nativeReferenceSHA256'];native[n]=(j,p,paints);stats['nativeWholePixelPairs']+=1
 if '.untranslated.state' in name or '.destination.state' in name:
  o=j['observation'];n=numericID(o['n']);recipe=o['recipe'];field=recipe['id'];p,paints=observation(o);sourceInvariant(p,native[n][1],recipe);assert o['originalSHA256']==o['nativeReferenceSHA256']==native[n][0]['originalSHA256'] and not o['actualNativeFrameRecaptured'];assert 'capturedPreviously' in o['originalSHA256Source'] and o['recipeUnobservedSHA256']==o['observedSHA256'] and o['observerPixelEqual'];polys=[geom(x) for x in paints];stats['independentPaintSupports']+=len(polys);stats['independentVertices']+=sum(map(len,polys));passed=qualityCheck(p,paints,polys,j['quality'],recipe);key=(field,'destination' if '.destination.' in name else 'untranslated');qualityTotals[key]['states']+=1;qualityTotals[key]['passes']+=len(p);qualityTotals[key]['failedStates']+=not passed;qualityTotals[key]['neighborRecords']+=j['quality']['neighborInventory']['records'];qualityTotals[key]['preferredShortfalls']+=j['quality']['neighborInventory']['preferredShortfalls'];qualityTotals[key]['hardFailures']+=len(j['quality']['failures'])
  if '.untranslated.' in name:assert not deltaStarted;untranslated[field][n]=(p,paints,polys)
  else:
   deltaStarted=True;assert fullFields==2;before=untranslated[field][n];strip=lambda paint:{**{k:v for k,v in paint.items() if k!='matrix'},'path':[{k:v for k,v in c.items() if k!='matrix'} for c in paint['path']]};assert exact([strip(x) for x in paints])==exact([strip(x) for x in before[1]]);counts=evaluate(p,paints,polys);destTotals[field].update(counts);v=j['circleStage'];assert counts==v['counts'] and v['checked']==v['total']==len(paints) and v['complete'] and v['notEvaluated']==0;assert v['strictPass']==(counts['circleStrict']==counts['stage']==0) and v['movingPolicyPass']==(counts['circleMovingPolicy']==counts['stage']==0);stats['destinationStates']+=1
 if name.endswith('.untranslated-summary'):
  assert not deltaStarted;field=j['recipe']['id'];tot=qualityTotals[(field,'untranslated')];assert tot['states']==250 and tot['passes']==727;assert j['heldQualityPassed']==(tot['failedStates']==0);assert all(j[k]==tot[k] for k in ['neighborRecords','preferredShortfalls','hardFailures']);fullFields+=1
 if name.endswith('.fullphase-family'):
  assert fullFields==2;field=j['recipe']['id'];f=j['fullPlacement'];families[field]=j;chosen=f['chosen'];assert len(f['outcomes'])==len(f['family']['rows'])<=512
  strict=next((x for x in f['outcomes'] if x['strictPass']),None);moving=next((x for x in f['outcomes'] if x['movingPolicyPass']),None);pick=strict or moving;assert (pick is None)==(chosen is None)
  if chosen:
   assert pick['i']==chosen['i'] and pick['delta']==chosen['delta'];counts=collections.Counter();delta=tuple(map(Q,chosen['delta']))
   for p,paints,polys in untranslated[field].values():counts.update(evaluate(p,paints,polys,delta))
   assert counts==pick['counts'];assert counts['stage']==0 and counts['circleStrict' if strict else 'circleMovingPolicy']==0
  stats['fullPhaseFamilies']+=1
 if name.endswith('.destination-summary'):
  field=j['recipe']['id'];tot=qualityTotals[(field,'destination')];counts=destTotals[field];assert tot['states']==250 and tot['passes']==727;assert j['evaluation']['counts']==counts and j['evaluation']['complete'];assert j['destinationQualityPassed']==(tot['failedStates']==0);assert all(j[k]==tot[k] for k in ['neighborRecords','preferredShortfalls','hardFailures']);passed=counts['stage']==0 and counts['circleStrict' if j['policy']=='full-circle-strict' else 'circleMovingPolicy']==0 and tot['failedStates']==0;assert j['acceptedConditionalDiagnostic']==passed;summaries.append({'field':field,'delta':j['delta'],'policy':j['policy'],'counts':dict(counts),'acceptedConditionalDiagnostic':passed,'preferredShortfalls':j['preferredShortfalls']})
 if name=='inventory':inventory=j
assert len(native)==stats['nativeWholePixelPairs']==250 and jsonBytes==m['serializedJSONBytes']<=268435456
for k in T:assert len(T[k])==inventory['tables'][k]['entries']<=100000 and keyBytes[k]==inventory['tables'][k]['canonicalKeyBytes']<=67108864
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
assert compared==250 and fullFields==2 and stats['fullPhaseFamilies']==2 and len(summaries)==m['completed']['destinationFields']
for x in m['pins']['files']+m['pins']['pycache']:assert H((R/x['path']).read_bytes())==x['sha256']
for x in m['pins']['absent62']:assert not os.path.lexists(R/x)
assert H((R/'.git/index').read_bytes())==m['pins']['index']['sha256']
report={'state':'PARENT59_FULL_RAW_REVIEW_COMPLETE_CONDITIONAL_ONLY','manifestSHA256':H(mb),'stats':dict(stats),'native250FullPaintCatalogAndWholeRGBAEqualTo56':compared,'bothUntranslatedCompleteBeforeAnyDelta':True,'tableCanonicalBytesIndependentlySummed':dict(keyBytes),'destinationSummaries':summaries,'sourcePostpins124PYC7Index62IndependentlyRechecked':True,'allNeighborWitnessesAndPreferredShortfallsIndependentlyChecked':True,'fullOwnPassTextFaceRimCaptionQualityIndependentlyChecked':True,'circleAndStageActualDestinationsExactFractionChecked':True,'numericalFoundationConditional':True,'independentRecipeOraclePending':True,'productAdapterAdded':False,'formalPerformanceAccepted':False,'savingBodyTested':False,'humanApproval':False,'publicChecks':0,'parentImagesViewed':0,'seconds':time.monotonic()-started}
(E/'parent-raw-review59.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n');print(json.dumps(report,indent=2))
