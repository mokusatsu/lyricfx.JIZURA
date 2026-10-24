from pathlib import Path
import json,gzip,hashlib,math,os,re,datetime,sys
sys.dont_write_bytecode=True
assert os.environ.get('MAGNETS_FAMILY22_RELEASE')=='PARENT_REVIEWED_SOURCE_MATH_RUNNER','Parent source gate required'
D=Path('/tmp/avoid009-magnets-family22');R=Path('/workspace/lyricfx.JIZURA');sha=lambda b:hashlib.sha256(b).hexdigest();P=D/'evidence/pins22.json';pins=json.loads(P.read_text());seal=json.loads((D/'evidence/seal22.json').read_text());target=D/'evidence/family22.raw.json.gz';assert not target.exists()
def check():
 for p in pins['files']:assert sha((R/p['path']).read_bytes())==p['sha256'],p['path']
 for p in pins['pycache']:assert sha((R/p['path']).read_bytes())==p['sha256'],p['path']
 assert len(pins['absent52'])==52 and all(not(R/p).exists()for p in pins['absent52'])
 for p in seal['files']:assert sha((D/p['path']).read_bytes())==p['sha256'],p['path']
check();proofPath=Path('/tmp/avoid009-magnets-diagnostic21/evidence/diagnostic21.raw.json.gz');proofBytes=proofPath.read_bytes();proofSHA=sha(proofBytes);assert proofSHA=='fc582ae77d1c572329ac6b74adeef45fd72e83da59deda4804fdb671fa1ef827';proof=json.loads(gzip.decompress(proofBytes));assert not proof['errors'] and len(proof['results'])==1
v=proof['results'][0];model=v['result'];plan=v['sourcePlan'];g=model['sourceCatalog'];region=v['region'];assert model['status']=='diagnostic-only' and model['certificate'] is False and not model['adapterRegistered'];assert not v['containmentFailures'] and not v['cameraFailures'];assert model['metricKeys']==23062 and len(model['ledger'])==1324 and len(model['obstacles'])==17;assert model['globalHoldEnough'] and model['retentionTail']['endExpired'];assert g['seed']==1205 and len(g['rows'])==1 and ''.join(x['ch']for x in g['glyphs'])=='風の先へ';assert plan['W']==960 and plan['H']==540 and plan['fps']==60
ledger=model['ledger'];obstacles=model['obstacles'];board=model['boardInner'];circle=region['circle'];W=plan['W'];H=plan['H'];margin=max(2,.005*min(W,H))
def bounds(poly):
 assert poly and all(len(p)==2 and all(math.isfinite(x)for x in p)for p in poly)
 return {'x0':min(p[0]for p in poly),'x1':max(p[0]for p in poly),'y0':min(p[1]for p in poly),'y1':max(p[1]for p in poly)}
def circle_clear(poly,b):
 cx=circle['cx'];cy=circle['cy'];radius=circle['r']+margin;magnitude=max(abs(b[k])for k in b);magnitude=max(magnitude,abs(cx),abs(cy),abs(radius));limit=radius+64*2**-52*(1+magnitude)
 if magnitude<=1e7 and (b['x0']-cx>limit or cx-b['x1']>limit or b['y0']-cy>limit or cy-b['y1']>limit):return True
 inside=False
 for i,point in enumerate(poly):
  a=poly[i-1];b0=point;dx=b0[0]-a[0];dy=b0[1]-a[1];length=dx*dx+dy*dy;u=max(0,min(1,((cx-a[0])*dx+(cy-a[1])*dy)/length))if length else 0
  if math.hypot(cx-a[0]-u*dx,cy-a[1]-u*dy)<=radius:return False
  if (a[1]>cy)!=(b0[1]>cy) and cx<(b0[0]-a[0])*(cy-a[1])/(b0[1]-a[1])+a[0]:inside=not inside
 return not inside
def overlap(a,b):return a['x0']<=b['x1']and a['x1']>=b['x0']and a['y0']<=b['y1']and a['y1']>=b['y0']
obstacleBounds=[bounds(o['polygon'])for o in obstacles];assert obstacles[0]['owner']=='magnets.scene.handle'
for e in ledger:
 m=re.fullmatch(r'magnets\.glyph\.([0-3])\.(depth|body)',e['owner']);assert m and int(m[1])==e['q'] and m[2]==e['part'];assert bounds(e['polygon'])==e['bounds']
def evaluate(delta):
 counts={k:0 for k in['circle','globalStage','board','handle','decoys','sourceBandPolicyOnly']};worst={}
 for e in ledger:
  dx,dy=delta(e);poly=[[p[0]+dx,p[1]+dy]for p in e['polygon']];b=bounds(poly)
  bad={'circle':not circle_clear(poly,b),'globalStage':b['x0']<0 or b['y0']<0 or b['x1']>W or b['y1']>H,'board':b['x0']<board['x0']or b['x1']>board['x1']or b['y0']<board['y0']or b['y1']>board['y1'],'handle':overlap(b,obstacleBounds[0]),'decoys':any(overlap(b,q)for q in obstacleBounds[1:]),'sourceBandPolicyOnly':b['y0']<g['band']['y0']or b['y1']>g['band']['y1']}
  for key,isbad in bad.items():
   if isbad:
    counts[key]+=1
    if key not in worst:worst[key]={'owner':e['owner'],'pass':e['pass'],'range':e['sourceRange']}
 return counts,worst
# Verify Python transport/constraint arithmetic reproduces all accepted source21 common receipts first.
for prior in model['candidates']:
 offset=prior['offset'];counts,worst=evaluate(lambda e:offset);assert counts==prior['counts'] and worst==prior['worst'],offset
attempts=[];step=W*.05
for leftIndex in range(9):
 for rightIndex in range(9):
  left=[0.0 if leftIndex==0 else -leftIndex*step,0.0];right=[rightIndex*step,0.0];counts,worst=evaluate(lambda e:left if e['q']<2 else right);attempts.append({'leftDelta':left,'rightDelta':right,'counts':counts,'worst':worst,'candidateOnly':all(n==0 for k,n in counts.items()if k!='sourceBandPolicyOnly'),'certificate':False})
assert len(attempts)==81 and attempts[0]['counts']==model['nativeZero']['counts'];check();assert sha(proofPath.read_bytes())==proofSHA
result={'kind':'magnets-two-contiguous-groups-family22','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'finite-family-diagnostic-only','certificate':False,'adapterRegistered':False,'sourceProofRef':{'path':str(proofPath),'sha256':proofSHA,'sourceProduct':'c595bbe5','metricKeys':23062,'supports':1324,'obstacles':17,'all81SourceCommonReceiptsReproduced':True,'sourceBranchAndMetricAndCameraModelUnchanged':True},'groups':[{'q':[0,1],'text':'風の','primaryParts':['depth','body']},{'q':[2,3],'text':'先へ','primaryParts':['depth','body']}],'family':{'leftX':'0..-.4W step.05W','rightX':'0..+.4W step.05W','dy':0,'step':step,'count':81,'zeroFirst':True,'withinGroupOffsetsIdentical':True,'sceneDecoysAndHandleFixed':True,'originalFontSizeNativeVelocitiesClocksAndPainterOrderUnchanged':True},'policyRef':{'board':model['boardContainmentModel'],'obstacles':model['obstacleModel'],'band':model['sourceBandPolicy'],'holdWindow':model['holdWindow'],'globalHoldEnough':model['globalHoldEnough'],'retentionTail':model['retentionTail']},'attempts':attempts,'candidateCount':sum(a['candidateOnly']for a in attempts),'nativeZero':attempts[0],'limits':{'finiteFamilyNotImpossibility':True,'noActualNewReplayOrRasterProof':True,'noNewFontMeasurement':True,'noBrowser':True},'pins':pins,'seal':seal,'publicChecks':0}
with target.open('xb')as f:f.write(gzip.compress(json.dumps(result,separators=(',',':'),ensure_ascii=False).encode(),compresslevel=9,mtime=0))
print(json.dumps({'target':str(target),'bytes':target.stat().st_size,'sha256':sha(target.read_bytes()),'attempts':81,'candidateCount':result['candidateCount'],'sourceCommonReceiptsReproduced':81,'certificate':False}))
