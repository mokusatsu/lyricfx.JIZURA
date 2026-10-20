from pathlib import Path
import json,subprocess,os,time,hashlib,datetime,gzip,shutil
r=Path('/workspace/lyricfx.JIZURA');out=r/'tasks/evidence/AVOID-006/adaptive-revision/occlusion-fix/functional';out.mkdir(parents=True,exist_ok=True)
def h(p):
 d=hashlib.sha256()
 with p.open('rb') as f:
  for chunk in iter(lambda:f.read(1024*1024),b''):d.update(chunk)
 return d.hexdigest()
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
names=['layouts-a-adaptive-test','layouts-a-test','layouts-a-acceptance','layouts-a-scales','layouts-a-contrast','basic-test','basic-acceptance','stage-test','stack-test','layouts-a-solver-mode','layouts-a-preparation-cache','layouts-a-native-solver-mode','layouts-a-subtitle-occlusion']
summary={'status':'running','performanceAccepted':False,'performanceStatus':'Formal geometry-loops run failed; functional verification independently authorized after diagnostic trace.','verificationScope':'Functional only; this receipt does not override performance failure.','runnerSHA256':h(Path(__file__)),'startedUTC':now(),'model':'gpt-6.1-sol','reasoningEffort':'medium','requestedModel':'gpt-6.1-sol','requestedReasoningEffort':'medium','actualRuntimeMetadata':'unavailable','modelMetadataNote':'Model and effort fields record the successful parent assignment; requested fields repeat that assignment. Internal runtime metadata is unavailable and is not asserted as observed.','compiledSHA256':h(r/'index.html'),'compiledENSHA256':h(r/'en/index.html'),'fixtureSHA256':h(r/'dev/avoidance/layouts-a-fixture.js'),'sourceHashes':{'src/'+p.name:h(p) for p in sorted((r/'src').glob('*.js'))},'tests':[],'failed':[],'notRun':names.copy()}
env={**os.environ,'NODE_PATH':'/workspace/lyricfx.JIZURA/mcp/node_modules','JIZURA_BROWSER':'/usr/bin/chromium'}
scratch=Path('/tmp/avoid006-occlusion-functional');scratch.mkdir(parents=True,exist_ok=True)
expected=(summary['compiledSHA256'],summary['compiledENSHA256'])
assert expected==('b2c230268f7731df2201093893397551b3265c8cad9984ef8b517cc1fe8bc696','e4b4c31114221427eb86218e86deed3474395c52a627669c84c985b503f87de7')
for name in names:
 assert (h(r/'index.html'),h(r/'en/index.html'))==expected
 script=r/f'dev/avoidance/{name}.cjs';log=out/(name+'.log');testenv=env.copy()
 if name in ['layouts-a-adaptive-test','layouts-a-native-solver-mode','layouts-a-subtitle-occlusion']:testenv['JIZURA_TEST_REPORT']=str((scratch if name=='layouts-a-adaptive-test' else out)/(name+'-report.json'))
 if name=='layouts-a-subtitle-occlusion':testenv['JIZURA_OCCLUSION_OUTPUT']=str(out/'subtitle-regression')
 print('START',name,flush=True);t=time.monotonic()
 with log.open('w') as f:code=subprocess.run(['node',str(script)],cwd=r,env=testenv,stdout=f,stderr=subprocess.STDOUT).returncode
 test={'name':name,'scriptSHA256':h(script),'logSHA256':h(log),'exitCode':code,'seconds':round(time.monotonic()-t,3)}
 if code==0:
  try:
   d=json.loads(log.read_text().splitlines()[-1])
   if name=='layouts-a-adaptive-test':test['counts']={'anchors':sum(d['anchors'].values()),'matrix':sum(d['matrix'].values()),'controls':d['controls'],'explicitScales':d['explicitScales'],'boundaries':d['boundaries'],'anchorFrames':d['anchorFrames'],'motionCases':d['motionCases'],'motionFrames':d['motionFrames'],'motionParity':len(d['motionParity'])}
   elif name=='layouts-a-subtitle-occlusion':test['counts']={'conditions':len(d['rows'])//2,'frames':sum(len(x['overlaps']) for x in d['rows'])}
   else:test['counts']={k:(len(v) if isinstance(v,(list,dict)) else v) for k,v in d.items() if k in ['checks','cases','rows','frames','polygons','layouts','negative','variants','suppression','perID','recordReplay','splitReplay','formerlyScatteredSafe','newDiagonalSafe','alternatingHits','callbackCalls','modeOutputDifferences','scanRequests','records'] and isinstance(v,(int,float,list,dict))}
   test['reportedCandidateSHA256']=d.get('compiledSHA256') or d.get('afterSHA256')
   if isinstance(test['reportedCandidateSHA256'],str):assert test['reportedCandidateSHA256']==expected[0]
  except Exception as e:test['reportError']=str(e);summary['failed'].append(name+':report')
 else:summary['failed'].append(name)
 if name=='layouts-a-adaptive-test' and (scratch/(name+'-report.json')).exists():
  raw=scratch/(name+'-report.json');packed=out/(name+'-report.json.gz')
  with raw.open('rb') as src,gzip.GzipFile(filename=str(packed),mode='wb',mtime=0) as dst:shutil.copyfileobj(src,dst)
  digest=hashlib.sha256()
  with gzip.open(packed,'rb') as src:
   for chunk in iter(lambda:src.read(1024*1024),b''):digest.update(chunk)
  test['rawReport']={'scratch':str(raw),'bytes':raw.stat().st_size,'sha256':h(raw),'gzip':packed.name,'gzipBytes':packed.stat().st_size,'gzipSHA256':h(packed),'lossless':digest.hexdigest()==h(raw)}
  assert test['rawReport']['lossless']
 test['candidateUnchanged']=(h(r/'index.html'),h(r/'en/index.html'))==expected
 assert test['candidateUnchanged']
 summary['notRun'].remove(name);summary['tests'].append(test);(out/'functional-summary.json').write_text(json.dumps(summary,indent=2)+'\n');print('END',name,test,flush=True)
 if code!=0 or 'reportError' in test:break
summary.update({'status':'finished','finishedUTC':now(),'passed':not summary['failed'] and not summary['notRun']})
(out/'functional-summary.json').write_text(json.dumps(summary,indent=2)+'\n')
raise SystemExit(0 if summary['passed'] else 1)
