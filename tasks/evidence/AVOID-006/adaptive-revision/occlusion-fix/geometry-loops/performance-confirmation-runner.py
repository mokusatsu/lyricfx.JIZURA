from pathlib import Path
import os,json,hashlib,subprocess,datetime,time
root=Path('/workspace/lyricfx.JIZURA');out=Path(__file__).parent
h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat();expected=('b2c230268f7731df2201093893397551b3265c8cad9984ef8b517cc1fe8bc696','e4b4c31114221427eb86218e86deed3474395c52a627669c84c985b503f87de7');assert (h(root/'index.html'),h(root/'en/index.html'))==expected
report=out/'performance-confirmation.json';log=out/'performance-confirmation.log';assert not report.exists() and not log.exists(),'Single controlled confirmation only; refusing overwrite'
def read(path):
 try:return {'available':True,'text':Path(path).read_text().strip()}
 except OSError as e:return {'available':False,'error':e.errno,'message':e.strerror}
def host():return {'utc':now(),'files':{name:read('/sys/fs/cgroup/'+name) for name in ['cpu.max','cpu.stat','cpu.pressure','memory.current','memory.peak','memory.max','memory.events','memory.stat','memory.pressure']}}
script=root/'dev/avoidance/layouts-a-adaptive-perf.cjs';fixture=root/'dev/avoidance/layouts-a-fixture.js';env={**os.environ,'NODE_PATH':str(root/'mcp/node_modules'),'JIZURA_BROWSER':'/usr/bin/chromium','JIZURA_ADAPTIVE_BEFORE_ROOT':'/workspace/work/avoid006-adaptive-before','PERF_REPORT':str(report),'PERF_SIZES':'100,1000','PERF_WARMUP':'3','PERF_SAMPLES':'6','PERF_STRESS':'1'}
for name in ['PERF_PROFILE','PERF_RUNTIME_PROFILE']:env.pop(name,None)
start=host();started=now();t=time.monotonic()
with log.open('w') as f:code=subprocess.run(['node',str(script)],cwd=root,env=env,stdout=f,stderr=subprocess.STDOUT).returncode
end=host();(out/'performance-confirmation-host.json').write_text(json.dumps({'referenceOnly':True,'noHostPollingDuringRun':True,'start':start,'end':end},indent=2)+'\n')
r={'model':'gpt-6.1-sol','reasoningEffort':'medium','requestedModel':'gpt-6.1-sol','requestedReasoningEffort':'medium','actualRuntimeMetadata':'unavailable','singleControlledConfirmation':True,'priorFailuresPreserved':True,'trace':False,'profile':False,'pageModifications':False,'compiledJA':h(root/'index.html'),'compiledEN':h(root/'en/index.html'),'runnerSHA256':h(Path(__file__)),'scriptSHA256':h(script),'fixtureSHA256':h(fixture),'logSHA256':h(log),'hostSHA256':h(out/'performance-confirmation-host.json'),'exitCode':code,'startedUTC':started,'finishedUTC':now(),'seconds':round(time.monotonic()-t,3),'sourceHashes':{'src/'+p.name:h(p) for p in sorted((root/'src').glob('*.js'))},'command':'NODE_PATH=mcp/node_modules JIZURA_BROWSER=/usr/bin/chromium JIZURA_ADAPTIVE_BEFORE_ROOT=/workspace/work/avoid006-adaptive-before PERF_SIZES=100,1000 PERF_WARMUP=3 PERF_SAMPLES=6 PERF_STRESS=1 PERF_REPORT='+str(report)+' node dev/avoidance/layouts-a-adaptive-perf.cjs'}
if report.exists():
 d=json.loads(report.read_text());r.update({'reportSHA256':h(report),'passed':d['passed'],'config':d['config'],'comparisons':d['comparisons'],'actualCountsValid':d['actualCountsValid']});assert d['compiledSHA256']['after']==expected[0]
assert (r['compiledJA'],r['compiledEN'])==expected
(out/'performance-confirmation-receipt.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps({k:r.get(k) for k in ['passed','exitCode','comparisons','seconds','compiledJA','compiledEN']}));raise SystemExit(code)
