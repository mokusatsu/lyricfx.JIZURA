from pathlib import Path
import json,gzip,hashlib,math,os,re,datetime,sys
sys.dont_write_bytecode=True
assert os.environ.get('MAGNETS_CAMERA25_RELEASE')=='PARENT_REVIEWED_SOURCE_MATH_RUNNER','Parent source gate required'
D=Path('/tmp/avoid009-evening-magnets25');R=Path('/workspace/lyricfx.JIZURA');sha=lambda b:hashlib.sha256(b).hexdigest();P=D/'evidence/pins25.json';pins=json.loads(P.read_text());seal=json.loads((D/'evidence/seal25.json').read_text());target=D/'evidence/camera25.raw.json.gz';assert not target.exists()
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

from board24 import geometry,classify_polygon,contract_cases
# Baseline must finish ALL accepted21 common and ALL486 accepted23 receipts
# before invoking new geometry or fixtures. No camera/obstacle change.
for prior in model['candidates']:
 counts,worst=evaluate(lambda e:prior['offset'])
 assert counts==prior['counts'] and worst==prior['worst']
priorPath=Path('/tmp/avoid009-magnets-family23/evidence/family23.raw.json.gz');priorBytes=priorPath.read_bytes();priorSHA=sha(priorBytes)
assert priorSHA=='8c825b96e88134d195ce1f0a3a65b242ddec28c76f3fcbb19ef51ec4817a03e8'
prior=json.loads(gzip.decompress(priorBytes));assert prior['candidateCount']==0 and len(prior['attempts'])==486 and prior['sourceProofRef']['sha256']==proofSHA
step=W*.05;yValues=[i*(H*.05)for i in range(6)];baseline=[]
for sharedY in yValues:
 for leftIndex in range(9):
  for rightIndex in range(9):
   left=[0.0 if leftIndex==0 else -leftIndex*step,sharedY];right=[rightIndex*step,sharedY]
   counts,worst=evaluate(lambda e:left if e['q']<2 else right)
   p=prior['attempts'][len(baseline)]
   assert p['leftDelta']==left and p['rightDelta']==right and p['sharedY']==sharedY and p['counts']==counts and p['worst']==worst
   baseline.append(p)
assert len(baseline)==486 and baseline[0]['counts']==model['nativeZero']['counts']
core,radius,boardModel=geometry(W,H,g,model['domain']);fixtures=contract_cases();attempts=[]
for old in baseline:
 counts=dict(old['counts']);worst=dict(old['worst']);counts['board']=0;worst.pop('board',None)
 states={k:0 for k in ['contained','outside','inconclusive']};verticesTested=0;firstVertex=None
 for e in ledger:
  dx,dy=old['leftDelta']if e['q']<2 else old['rightDelta'];poly=[[p[0]+dx,p[1]+dy]for p in e['polygon']]
  result=classify_polygon(poly,core,radius);states[result['state']]+=1;verticesTested+=result['verticesTested']
  if result['state']!='contained':
   counts['board']+=1
   if 'board'not in worst:
    worst['board']={'owner':e['owner'],'pass':e['pass'],'range':e['sourceRange']};firstVertex=result['firstRejectedVertex']
 assert sum(states.values())==1324
 assert all(counts[k]==old['counts'][k] for k in counts if k!='board')
 assert all(worst.get(k)==old['worst'].get(k)for k in counts if k!='board')
 attempts.append({'leftDelta':old['leftDelta'],'rightDelta':old['rightDelta'],'sharedY':old['sharedY'],'counts':counts,'worst':worst,'oldBoardCount':old['counts']['board'],'oldBoardWorst':old['worst'].get('board'),'boardSupportStates':states,'firstBoardRejectedVertex':firstVertex,'boardVerticesTested':verticesTested,'candidateOnly':all(n==0 for k,n in counts.items()if k!='sourceBandPolicyOnly'),'certificate':False})

# All unchanged24 receipts are reconstructed before ANY new camera support.
board24Path=Path('/tmp/avoid009-evening-magnets24/evidence/board24.raw.json.gz');board24Bytes=board24Path.read_bytes();board24SHA=sha(board24Bytes)
assert board24SHA=='06ededb1090cb43f3f93bee212db3294e6bedd298247d47ed79e099a4c62831f'
prior24=json.loads(gzip.decompress(board24Bytes));assert prior24['attempts']==json.loads(json.dumps(attempts)) and prior24['candidateCount']==0 and prior24['boardModel']==json.loads(json.dumps(boardModel))
assert sha((D/'board24.py').read_bytes())=='9d9333257053dc17556734fe5f183f5cd6fc853b78ba135338849b7d71677a6e'
from camera25 import camera_support,audit_actual
oldLedger=ledger;newLedger=[];d=model['domain'];cut=model['sourceCutSnapshot']
assert plan['fx']['motion']==.65 and d['effectiveMotion']==.65 and d['motion']==d['base']==cut['motionScale']==cut['contentScale']==1
assert len(plan['cuts'])==1 and not plan['events'] and not plan['beats'] and cut['cam']=='push' and not cut['effectFx'] and not cut['effectStyle']
for e in oldLedger:
 poly,S,receipt=camera_support(e,plan,d)
 newLedger.append({**e,'polygon':poly,'bounds':bounds(poly),'scaleInterval':S,'cameraRefinement':receipt})
assert len(newLedger)==1324
audits=audit_actual(v,newLedger,d);ledger=newLedger;attempts25=[]
for old in attempts:
 counts,worst=evaluate(lambda e:old['leftDelta']if e['q']<2 else old['rightDelta'])
 # evaluate remains copied old logic; replace ONLY board result with accepted24
 # rounded-board classifier on new primary camera supports.
 counts['board']=0;worst.pop('board',None);states={k:0 for k in ['contained','outside','inconclusive']};verticesTested=0;firstVertex=None
 for e in ledger:
  dx,dy=old['leftDelta']if e['q']<2 else old['rightDelta'];poly=[[p[0]+dx,p[1]+dy]for p in e['polygon']];result=classify_polygon(poly,core,radius);states[result['state']]+=1;verticesTested+=result['verticesTested']
  if result['state']!='contained':
   counts['board']+=1
   if 'board'not in worst:worst['board']={'owner':e['owner'],'pass':e['pass'],'range':e['sourceRange']};firstVertex=result['firstRejectedVertex']
 assert sum(states.values())==1324
 attempts25.append({'leftDelta':old['leftDelta'],'rightDelta':old['rightDelta'],'sharedY':old['sharedY'],'counts':counts,'worst':worst,'prior24Counts':old['counts'],'boardSupportStates':states,'firstBoardRejectedVertex':firstVertex,'boardVerticesTested':verticesTested,'candidateOnly':all(n==0 for k,n in counts.items()if k!='sourceBandPolicyOnly'),'certificate':False})
check();assert sha(proofPath.read_bytes())==proofSHA and sha(priorPath.read_bytes())==priorSHA and sha(board24Path.read_bytes())==board24SHA
result={'kind':'magnets-primary-camera25-only-refinement','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'finite-family-diagnostic-only','certificate':False,'adapterRegistered':False,'sourceProofRef':{'path':str(proofPath),'sha256':proofSHA,'sourceProduct':'c595bbe5','metricKeys':23062,'supports':1324,'obstacles':17,'all81CommonReceiptsReproduced':True},'family23Ref':{'path':str(priorPath),'sha256':priorSHA,'all486ReceiptsReproduced':True},'board24Ref':{'path':str(board24Path),'sha256':board24SHA,'all486FullReceiptsReproducedBeforeNewCameraEvaluation':True,'exactBoardHelperSHA':'9d9333257053dc17556734fe5f183f5cd6fc853b78ba135338849b7d71677a6e'},'family':prior['family'],'groups':prior['groups'],'unchangedPolicyRef':prior['policyRef'],'boardModel':boardModel,'boardArithmeticContractCases':fixtures,'ledger':ledger,'actualAudits':audits,'attempts':attempts25,'nativeZero':attempts25[0],'candidateCount':sum(a['candidateOnly']for a in attempts25),'limits':{'finiteFamilyNotImpossibility':True,'obstaclesAll17Exact21Alltime':True,'noActualNewReplayOrRasterProof':True,'noNewFontMeasurement':True,'noBrowser':True,'inconclusiveCountsAsBoardRejection':True,'everyNewHullSubsetOld21ExactFraction':True},'pins':pins,'seal':seal,'publicChecks':0}
with target.open('xb')as f:f.write(gzip.compress(json.dumps(result,separators=(',',':'),ensure_ascii=False).encode(),compresslevel=9,mtime=0))
print(json.dumps({'target':str(target),'bytes':target.stat().st_size,'sha256':sha(target.read_bytes()),'supports':1324,'auditedTargetVertices':8736,'roots':54,'attempts':486,'candidateCount':result['candidateCount'],'baseline24Reproduced':486,'certificate':False}))
