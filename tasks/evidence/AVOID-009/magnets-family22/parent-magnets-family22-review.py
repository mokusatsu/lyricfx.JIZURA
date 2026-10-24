import sys,json,gzip,pathlib,hashlib
sys.argv=['parent-magnets-diagnostic-full-review.py','/tmp/avoid009-magnets-diagnostic21/evidence/diagnostic21.raw.json.gz','/tmp/parent-magnets-diagnostic21-review.json']
exec(compile(pathlib.Path('/tmp/parent-magnets-diagnostic-full-review.py').read_text(),'parent-oracle21','exec'))
f=pathlib.Path('/tmp/avoid009-magnets-family22/evidence/family22.raw.json.gz');a=json.load(gzip.open(f));assert a['sourceProofRef']['sha256']=='fc582ae77d1c572329ac6b74adeef45fd72e83da59deda4804fdb671fa1ef827';total=0
for candidate in a['attempts']:
 counts=dict.fromkeys(candidate['counts'],0)
 for e in r['ledger']:
  dx,dy=candidate['leftDelta']if e['q']<2 else candidate['rightDelta'];poly=[[x+dx,y+dy]for x,y in e['polygon']];b=box(poly);bad={'circle':not clear(poly,circle,radius),'globalStage':b[0]<0 or b[1]<0 or b[2]>P['W']or b[3]>P['H'],'board':b[0]<bi['x0']or b[2]>bi['x1']or b[1]<bi['y0']or b[3]>bi['y1'],'handle':overlap(b,obs[0]),'decoys':any(overlap(b,o)for o in obs[1:]),'sourceBandPolicyOnly':b[1]<G['band']['y0']or b[3]>G['band']['y1']}
  for k,bb in bad.items():counts[k]+=bb
 assert counts==candidate['counts'];assert candidate['candidateOnly']==all(n==0 for k,n in counts.items()if k!='sourceBandPolicyOnly');assert candidate['certificate']is False;total+=1
out={'raw':str(f),'rawSHA256':hashlib.sha256(f.read_bytes()).hexdigest(),'independentTwoGroupCandidateConstraintSets':total,'candidateCount':sum(x['candidateOnly']for x in a['attempts']),'verifiedFullSource21Proof':True,'fullCircleAndBoardObstaclesUnchanged':True,'newNativeReplayNotPerformed':True,'noAdapterOrCertificate':True,'finiteFamilyNotImpossibility':True,'publicChecks':0,'parentImages':0};pathlib.Path('/tmp/parent-magnets-family22-review.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
