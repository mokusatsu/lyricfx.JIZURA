from pathlib import Path
import json,subprocess,os,time,hashlib,datetime
r=Path('/workspace/lyricfx.JIZURA');out=r/'tasks/evidence/AVOID-006/adaptive-revision/final-candidate';out.mkdir(parents=True,exist_ok=True)
h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
names=['layouts-a-adaptive-test','layouts-a-test','layouts-a-acceptance','layouts-a-scales','layouts-a-contrast','basic-test','basic-acceptance','stage-test','stack-test','layouts-a-solver-mode','layouts-a-preparation-cache','layouts-a-native-solver-mode']
summary={'runnerSHA256':h(Path(__file__)),'startedUTC':now(),'model':'gpt-6.1-sol','reasoningEffort':'medium','compiledSHA256':h(r/'index.html'),'compiledENSHA256':h(r/'en/index.html'),'fixtureSHA256':h(r/'dev/avoidance/layouts-a-fixture.js'),'sourceHashes':{'src/'+p.name:h(p) for p in sorted((r/'src').glob('*.js'))},'tests':[],'failed':[],'notRun':names.copy()}
env={**os.environ,'NODE_PATH':'/workspace/lyricfx.JIZURA/mcp/node_modules','JIZURA_BROWSER':'/usr/bin/chromium'}
for name in names:
 script=r/f'dev/avoidance/{name}.cjs';log=out/(name+'.log');testenv=env.copy()
 if name in ['layouts-a-adaptive-test','layouts-a-native-solver-mode']:testenv['JIZURA_TEST_REPORT']=str(out/(name+'-report.json'))
 print('START',name,flush=True);t=time.monotonic()
 with log.open('w') as f:code=subprocess.run(['node',str(script)],cwd=r,env=testenv,stdout=f,stderr=subprocess.STDOUT).returncode
 test={'name':name,'scriptSHA256':h(script),'logSHA256':h(log),'exitCode':code,'seconds':round(time.monotonic()-t,3)}
 if code==0:
  try:
   d=json.loads(log.read_text().splitlines()[-1])
   if name=='layouts-a-adaptive-test':test['counts']={'anchors':sum(d['anchors'].values()),'matrix':sum(d['matrix'].values()),'controls':d['controls'],'explicitScales':d['explicitScales'],'boundaries':d['boundaries'],'anchorFrames':d['anchorFrames'],'motionCases':d['motionCases'],'motionFrames':d['motionFrames'],'motionParity':len(d['motionParity'])}
   else:test['counts']={k:v for k,v in d.items() if k in ['checks','cases','rows','frames','polygons'] and isinstance(v,(int,float))}
  except Exception as e:test['reportError']=str(e);summary['failed'].append(name+':report')
 else:summary['failed'].append(name)
 summary['notRun'].remove(name);summary['tests'].append(test);(out/'functional-summary.json').write_text(json.dumps(summary,indent=2)+'\n');print('END',name,test,flush=True)
summary.update({'finishedUTC':now(),'passed':not summary['failed'] and not summary['notRun']})
(out/'functional-summary.json').write_text(json.dumps(summary,indent=2)+'\n')
raise SystemExit(0 if summary['passed'] else 1)
