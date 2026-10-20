from pathlib import Path
import os,json,hashlib,time,subprocess,datetime
root=Path('/workspace/lyricfx.JIZURA');out=Path(__file__).parent
h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
p=out/'functional-summary.json';summary=json.loads(p.read_text());assert summary.get('status')=='finished' and summary.get('passed') and len(summary['tests'])==13
expected=('b2c230268f7731df2201093893397551b3265c8cad9984ef8b517cc1fe8bc696','e4b4c31114221427eb86218e86deed3474395c52a627669c84c985b503f87de7');assert (h(root/'index.html'),h(root/'en/index.html'))==expected
script=root/'dev/avoidance/layouts-a-continuous-render.cjs';log=out/'layouts-a-continuous-render.log';report=out/'layouts-a-continuous-render-report.json'
summary.update({'status':'running-supplement','passed':False,'performanceAccepted':False,'continuousSupplementRunnerSHA256':h(Path(__file__))});summary['notRun'].append('layouts-a-continuous-render');p.write_text(json.dumps(summary,indent=2)+'\n')
env={**os.environ,'NODE_PATH':str(root/'mcp/node_modules'),'JIZURA_BROWSER':'/usr/bin/chromium','RENDER_REPORT':str(report),'JIZURA_ADAPTIVE_BEFORE_ROOT':'/workspace/work/avoid006-adaptive-before'};start=time.monotonic()
with log.open('w') as f:code=subprocess.run(['node',str(script)],cwd=root,env=env,stdout=f,stderr=subprocess.STDOUT).returncode
entry={'name':'layouts-a-continuous-render','category':'continuous-render-performance-supplement','scriptSHA256':h(script),'logSHA256':h(log),'exitCode':code,'seconds':round(time.monotonic()-start,3),'command':'NODE_PATH=mcp/node_modules JIZURA_BROWSER=/usr/bin/chromium JIZURA_ADAPTIVE_BEFORE_ROOT=/workspace/work/avoid006-adaptive-before RENDER_REPORT='+str(report)+' node dev/avoidance/layouts-a-continuous-render.cjs','compiledSHA256':expected[0],'compiledENSHA256':expected[1]}
if report.exists():
 d=json.loads(report.read_text());entry.update({'reportSHA256':h(report),'reportedCompiledSHA256':d['compiled'],'passed':d['passed'],'comparisons':d['comparisons'],'counts':{'layouts':8,'framesPerSide':768,'totalFrames':1536,'measuredFramesPerSide':640,'warmupPerLayout':16,'samplesPerLayout':80}});assert d['compiled']['after']==expected[0]
if code!=0:summary['failed'].append(entry['name'])
summary['notRun'].remove(entry['name']);summary['tests'].append(entry);summary.update({'status':'finished','finishedUTC':now(),'passed':not summary['failed'] and not summary['notRun'],'suiteCount':14,'performanceAccepted':False,'performanceStatus':'Formal geometry-loops performance failed; a continuous-render supplement does not override that result.'});assert (h(root/'index.html'),h(root/'en/index.html'))==expected;p.write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(entry));raise SystemExit(0 if code==0 else 1)
