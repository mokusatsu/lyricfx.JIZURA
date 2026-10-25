"""Independent parent raw/provenance and full-state geometry review; no imagery."""
from pathlib import Path
import ast,json,gzip,hashlib,struct,math,collections,os,time
from fractions import Fraction as F
R=Path('/workspace/lyricfx.JIZURA');B=Path('/dev/shm/avoid009-evening-20261024/bulbs60.oracle01');E=R/'tasks/evidence/AVOID-009/bulbs-oracle60';H=lambda b:hashlib.sha256(b).hexdigest();Q=F.from_float;U=object();stats=collections.Counter();started=time.monotonic()
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
oldObservation=observation
def observation(o):
 ps,paints=oldObservation(o);drop={'rootID','catalogBinding','actualPaintRecords','sourceCull','cullReason'}
 return [{**{k:v for k,v in p.items() if k not in drop},'root':T['matrix'][numericID(p['rootID'])]} for p in ps],paints
def stripCatalog(c):
 return {**{k:v for k,v in c.items() if k not in ['root','bb','sourceCalls']},'sourceCalls':[{k:v for k,v in call.items() if k not in ['matrixBeforeCall','matrixAfterCall']} for call in c['sourceCalls']]}
def loadTables(raw,j,keys=True):
 if 'tables' not in j or not all(isinstance(v,list) for v in j['tables'].values()):return
 for k,values in j['tables'].items():
  for x,original in zip(values,raw['data']['tables'][k]):
   assert numericID(x['id'])==len(T[k]);T[k].append(x['value'])
   if keys:keyBytes[k]+=len(json.dumps(original['value'],ensure_ascii=False,separators=(',',':')).encode())
def geometryAndCalls(np,rp,op,extras,recipe):
 assert [p['pass'] for p in np]==[p['pass'] for p in rp]==[p['pass'] for p in op]==[p['pass'] for p in extras['geometries']];expectedCalls=[]
 for n,r,o in zip(np,rp,op):
  assert exact(stripCatalog(o['catalog']))==exact(stripCatalog(n['catalog']))
  for k in ['pass','tp','lt','ltb','step','pIn','pOut','energy','beat','beatPulse','root']:assert exact(n[k])==exact(r[k])==exact(o[k])
  c=r['catalog'];orig=n['catalog'];g=next(q['geometry'] for q in extras['geometries'] if q['pass']==n['pass']);assert c['text']==g['writingText']
  for k in ['size','m100','m','ss','padX','padY','bw','bh','cx','cy','x0','y0','shape','sp','q','out']:assert exact(c[k])==exact(g[k]),k
  for k in ['dark','board','bulbC','textC','maxW','maxH','ax','arrow','port']:assert exact(c[k])==exact(orig[k]),k
  assert [(x['ch'],x['i'],x['li'],x['ci'],x['n']) for x in g['glyphMapping']]==[('風',0,0,0,2),('の',1,0,1,2),('先',2,1,0,2),('へ',3,1,1,2)]
  for call in orig['sourceCalls']:expectedCalls.append((n['pass'],call,g,orig))
  if c['culled']:assert not c['rings'];continue
  assert exact(c['lyric'])==exact(g['lyric']) and exact(c['subtitle'])==exact(g['subtitle']) and exact(c['bb'])==exact(g['bb'])
  assert len(c['rings'])==len(g['rings'])==len(orig['rings'])
  for a,b,z in zip(c['rings'],g['rings'],orig['rings']):
   for k in ['ri','k','N','insetPoints','points']:assert exact(a[k])==exact(b[k])
   assert a['N']==a['originalN']==z['N'] and a['sourceNativeSpacing']==z['spacing'];assert a['nominalRecipeSpacing']==b['r']*3.3 and b['r']==orig['r']*recipe['radiusScale'];assert exact(a['segmentsRecomputedMetadata'])==exact(b['segments']);assert exact(a['totalLengthRecomputedMetadata'])==exact(b['totalLength']);assert exact(a['actualArcStep59'])==exact(b['actualArcStep'])
   cumulative=[0.0]
   for length in b['segments']:cumulative.append(cumulative[-1]+length)
   assert exact(cumulative)==exact(b['cumulative']) and cumulative[-1]==b['totalLength'];step=cumulative[-1]/a['N'];assert exact(step)==exact(b['actualArcStep'])
   for k,row in enumerate(b['rows']):
    t=k*step;i=next((i for i,end in enumerate(cumulative[1:]) if end>=t),len(cumulative)-2);f=(t-cumulative[i])/b['segments'][i] if b['segments'][i]>0 else 0;A=b['insetPoints'][i];BB=b['insetPoints'][(i+1)%len(b['insetPoints'])];point=[x+(y-x)*f for x,y in zip(A,BB)];assert row['i']==k and row['segment']==i and exact(row['t'])==exact(t) and exact(row['f'])==exact(f) and exact(row['p'])==exact(point)==exact(b['points'][k]);stats['thirdStructureArcPointsChecked']+=1
   expectedLights=[{**v,'p':b['points'][i],'r':b['r']} for i,v in enumerate(z['lights'])];assert exact(a['lights'])==exact(expectedLights)
 assert len(extras['substitutions'])==len(expectedCalls)
 for sub,(tag,call,g,orig) in zip(extras['substitutions'],expectedCalls):
  method='line' if call['kind']=='outline' else call['kind'];assert sub['pass']==tag and sub['owner']==call['owner'] and sub['method']==method;old,new=sub['original'],sub['replacement'];owner=call['owner']
  if method in ['poly','line']:
   assert exact(old[1:])==exact(new[1:]);before=orig['sp'];after=g['sp']
   if owner.endswith('.shadow'):
    dx,dy=orig['shadowOffset'];before=[[x+dx,y+dy] for x,y in before];after=[[x+dx,y+dy] for x,y in after]
   if method=='line':before=before+[before[0]];after=after+[after[0]]
   assert exact(old[0])==exact(before) and exact(new[0])==exact(after)
  elif method=='circle':
   parts=owner.split('.');ri=numericID(int(parts[3]));i=numericID(int(parts[6]));part=parts[-1];ring=orig['rings'][ri];ind=g['rings'][ri];assert int(parts[5])==ring['N'];p=ring['points'][i];q=ind['points'][i];r=orig['r'];s=ind['r']
   def args(p,r):
    if part=='halo':return [*p,r*2.1]
    if part=='glint':return [p[0]-r*.25,p[1]-r*.3,r*.35]
    assert part=='bulb';return [*p,r]
   assert exact(old[:3])==exact(args(p,r)) and exact(new[:3])==exact(args(q,s)) and exact(old[3:])==exact(new[3:])
  else:
   assert method in ['mainDraw','draw'];a=old if method=='mainDraw' else old[0];b=new if method=='mainDraw' else new[0];allowed={'text','size','x','y'} if method=='mainDraw' else {'x','y'};assert set(a)==set(b);assert exact({k:v for k,v in a.items() if k not in allowed})==exact({k:v for k,v in b.items() if k not in allowed});source=orig['lyric' if method=='mainDraw' else 'subtitle'];target=g['lyric' if method=='mainDraw' else 'subtitle']
   for k in ['text','size','x','y']:assert exact(a[k])==exact(source[k]) and exact(b[k])==exact(target[k])
  stats['allOriginalReplacementCallsChecked']+=1
oracle=B;B=oracle.parent/'bulbs60.media01';omb=(oracle/'manifest.json').read_bytes();om=json.loads(omb);assert om['complete'] and om['oraclePassed'] and not om['errors'];review=json.loads((E/'parent-raw-review60.json').read_text());assert review['state']=='PARENT_SOURCE60_ORACLE_FULL_RAW_ACCEPTED_CONDITIONAL_ONLY' and review['manifestSHA256']==H(omb);gateBytes=(E/'parent-media-gate60.json').read_bytes();gate=json.loads(gateBytes);assert gate['oracleManifestSHA256']==H(omb) and gate['independentRawReviewAccepted'] and gate['mediaSourceReviewed'];expectedNative={}
for row in om['records']:
 if not ('tables' in row['id'] or row['id'].startswith('media-time.state')):continue
 raw=read(oracle,row);j=dec(raw['data']);loadTables(raw,j,False)
 if row['id'].startswith('media-time.state'):expectedNative[numericID(j['j'])]=(j['native'],*observation(j['native']))
assert len(expectedNative)==250;T={k:[] for k in T};mb=(B/'manifest.json').read_bytes();m=json.loads(mb);assert m['complete'] and not m['errors'] and not m['inFlight'] and m['postPins']['unchanged'];assert m['sourceSealSHA256']==om['sealSHA256']==gate['sourceSealSHA256'] and m['candidateSHA256']==om['candidateSHA256']==gate['candidateSHA256'];assert m['oracleManifestSHA256']==H(omb) and m['parentGateSHA256']==H(gateBytes);assert m['completed']=={'freshNativeReferences':250,'beforeFrames':250,'afterFrames':250};frames={k:{} for k in ['before','after']};jsonBytes=0;inventory=None;fresh=0;seen=set()
for row in m['records']:
 assert row['id'] not in seen;seen.add(row['id']);raw=read(B,row);j=dec(raw['data']);jsonBytes+=row['JSONBytes'];loadTables(raw,j);name=row['id']
 if name.startswith('fresh-native.j'):
  n=numericID(j['j']);o=j['observation'];p,paints=observation(o);expected,ep,ePaints=expectedNative[n];assert j['fullValuesEqualAcceptedOracleNative'] and o['originalSHA256']==o['observedSHA256']==expected['originalSHA256'];assert o['actualNativeFrameRecaptured'] and o['nativeZeroObserverEqual'];assert exact(p)==exact(ep) and exact(paints)==exact(ePaints);fresh+=1;stats['freshNativeFullPaintRecordsCompared']+=len(paints)
 if name=='before-media-gate':assert fresh==250 and j['freshNative250FullValuesQualified'] and j['encodersNotStartedYet']
 for side in frames:
  if name.startswith(side+'.frame'):
   assert fresh==250;n=numericID(j['j']);assert n not in frames[side];expected=om['expectedMedia'][n];assert j['time']==n/60 and j['side']==side and j['acceptedOracleRecordID']==expected['recordID'];assert j['pixelSHA256']==expected['nativeSHA256' if side=='before' else 'oracleSHA256'];frames[side][n]=j
 if name=='inventory':inventory=j
assert fresh==250 and all(set(x)==set(range(250)) for x in frames.values()) and jsonBytes==m['serializedJSONBytes']<=268435456
for k in T:assert len(T[k])==inventory['tables'][k]['entries']<=100000 and keyBytes[k]==inventory['tables'][k]['canonicalKeyBytes']<=67108864
c=m['capture'];assert (c['frames'],c['fps'],c['width'],c['height'],c['sourceCutDuration'],c['nominalEncodedDuration'],c['lastSample'],c['circleBurnedIn'])==(250,60,960,540,4,250/60,249/60,False);keys=[6,14,36,90,216,231,244];imageFiles=[]
for side in frames:
 for n in keys:
  p=B/'images'/f'{side}-{n:03}.png';b=p.read_bytes();assert H(b)==frames[side][n]['PNGSHA256'] and b[:8]==b'\x89PNG\r\n\x1a\n' and struct.unpack('>II',b[16:24])==(960,540);imageFiles.append({'path':str(p.relative_to(B)),'bytes':len(b),'sha256':H(b)})
 assert (B/'public/posters'/f'{side}.png').read_bytes()==(B/'images'/f'{side}-090.png').read_bytes()
assert len(imageFiles)==14 and len(list((B/'images').iterdir()))==14
for side in frames:
 v=m['videos'][side];p=B/'public'/v['path'];b=p.read_bytes();assert len(b)==v['bytes'] and H(b)==v['sha256'];probe=v['probe'];assert len(probe['streams'])==1 and len(probe['frames'])==250;s=probe['streams'][0];assert (s['codec_name'],s['width'],s['height'],s['r_frame_rate'],s['avg_frame_rate'],s['sample_aspect_ratio'],s['pix_fmt'],int(s['nb_read_frames']))==('h264',960,540,'60/1','60/1','1:1','yuv420p',250);assert abs(float(s['duration'])-250/60)<=1e-6 and 250/60-1e-6<=float(probe['format']['duration'])<=250/60+.001001
 for n,f in enumerate(probe['frames']):
  assert f['media_type']=='video' and abs(float(f['best_effort_timestamp_time'])-n/60)<=1e-6
  if n:assert float(f['best_effort_timestamp'])>float(probe['frames'][n-1]['best_effort_timestamp'])
 assert not v['stderr'];stats['nativePTSFramesVerified']+=250
assert (B/'public/index.html').read_bytes()==(E/'source60/index.html').read_bytes();expectedFiles={'index.html','videos/before.mp4','videos/after.mp4','posters/before.png','posters/after.png'};assert {x['path'] for x in m['publicFiles']}==expectedFiles and len(m['publicFiles'])==5;assert {p.relative_to(B/'public').as_posix() for p in (B/'public').rglob('*') if p.is_file()}==expectedFiles
for x in m['publicFiles']:
 b=(B/'public'/x['path']).read_bytes();assert len(b)==x['bytes'] and H(b)==x['sha256']
pins=json.loads((R/'work/avoid009-bulbs60-oracle/evidence/pins60.json').read_text());assert len(pins['protectedAbsent'])==63
for x in pins['files']+pins['pycache']:assert H((R/x['path']).read_bytes())==x['sha256']
for x in pins['protectedAbsent']:assert not os.path.lexists(R/x)
assert H((R/'.git/index').read_bytes())==pins['index']['sha256']
report={'state':'PARENT_SOURCE60_NATIVE_MEDIA_RAW_ACCEPTED_FRESH_VISUAL_AND_HUMAN_PENDING','manifestSHA256':H(mb),'oracleManifestSHA256':H(omb),'parentMediaGateSHA256':H(gateBytes),'stats':dict(stats),'freshNative250FullPaintCatalogAndWholeRGBAEqualAcceptedOracle':True,'all500EmittedCanvasRGBAHashesEqualAcceptedReferences':True,'two250FrameNative60fpsMP4AndAllPTSValidated':True,'MP4EncodedLossyNotPixelEqualityClaim':True,'tableKeyBytesIndependentlySummed':dict(keyBytes),'publicFiles':m['publicFiles'],'staticImages':imageFiles,'source124PYC7Protected63IndexPostpinsChecked':True,'freshVisualReviewAccepted':False,'humanApproval':False,'productAdmission':False,'conditionalNumericalFoundation':True,'formalPerformanceAccepted':False,'savingBodyTested':False,'publicChecks':0,'parentImagesViewed':0,'seconds':time.monotonic()-started};(E/'parent-media-raw-review60.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n');print(json.dumps({k:v for k,v in report.items() if k not in ['staticImages','publicFiles']},indent=2))
