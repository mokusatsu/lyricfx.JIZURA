/* Diagnostic-only wrapper around the immutable formal performance tool.
   No browser is started until this file is explicitly executed after CPU release. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),Module=require('node:module');
const root='/workspace/lyricfx.JIZURA',dir=__dirname,mode=process.argv[2],sha=x=>crypto.createHash('sha256').update(x).digest('hex');
if(!['planning','runtime'].includes(mode))throw new Error('Choose planning or runtime diagnostic');
const compiled=fs.readFileSync(root+'/index.html');if(sha(compiled)!=='ca1f21fc55230beab4c44d989fad6e8947d52a5a017ecb9e500675bd05a6569f')throw new Error('Candidate changed');
const tool=root+'/dev/avoidance/layouts-a-adaptive-perf.cjs';let source=fs.readFileSync(tool,'utf8');
const counters="window.occProofStats={decodeCalls:0,decodeJSONBytes:0,chosen:0,rejected:0,cacheHits:0,unpackCalls:0,unpackCoordinates:0};";
let html=compiled.toString();html=html.replace('function decodeProof(payload){',counters+'\nfunction decodeProof(payload){window.occProofStats.decodeCalls++;window.occProofStats.decodeJSONBytes+=payload.json.length*2;');
html=html.replace('const value=JSON.parse(payload.json);','const value=JSON.parse(payload.json);window.occProofStats[value.chosen?\'chosen\':\'rejected\']++;');
html=html.replace('function unpackPolygons(packed){','function unpackPolygons(packed){window.occProofStats.unpackCalls++;window.occProofStats.unpackCoordinates+=packed.coordinates.length;');
html=html.replace('proofHits++;proofCache.delete(context);','proofHits++;window.occProofStats.cacheHits++;proofCache.delete(context);');
// Keep product source hashes separate from this intentionally instrumented HTML.
const instrumented=path.join(dir,mode+'-instrumented.html');fs.writeFileSync(instrumented,html);
process.env.PERF_SIZES=mode==='planning'?'1000':'100';process.env.PERF_WARMUP='1';process.env.PERF_SAMPLES='1';process.env.PERF_STRESS='0';process.env.PERF_PROFILE='1';process.env.PERF_RUNTIME_PROFILE=mode==='runtime'?'1':'0';process.env.PERF_REPORT=path.join(dir,mode+'-report.json');
source=source.replace("const root=require('node:path').resolve(__dirname,'../..')",'const root='+JSON.stringify(root));
source=source.replace("const config={",'const config={diagnosticMode:'+JSON.stringify(mode)+',');
source=source.replace("const html=Object.fromEntries", "raw.after=fs.readFileSync("+JSON.stringify(instrumented)+");\nconst html=Object.fromEntries");
source=source.replace("await profiler.send('Profiler.start');", "if(config.diagnosticMode==='planning')await profiler.send('Profiler.start');");
source=source.replace('report.sides[side]=await page.evaluate',"if(profiler&&config.diagnosticMode==='runtime')await page.exposeFunction('__occStartProfile',async()=>{await profiler.send('Profiler.start');});report.sides[side]=await page.evaluate");
source=source.replace('for(let i=0;i<80;i++){',"if(config.diagnosticMode==='runtime')await window.__occStartProfile();for(let i=0;i<80;i++){");
// Allocation samples include objects collected during the diagnostic window.
source=source.replace("await profiler.send('Profiler.enable');","await profiler.send('HeapProfiler.enable');await profiler.send('Profiler.enable');");
source=source.replace("if(config.diagnosticMode==='planning')await profiler.send('Profiler.start');","if(config.diagnosticMode==='planning'){await profiler.send('HeapProfiler.startSampling',{samplingInterval:32768,includeObjectsCollectedByMajorGC:true,includeObjectsCollectedByMinorGC:true});await profiler.send('Profiler.start');}");
source=source.replace("async()=>{await profiler.send('Profiler.start');}","async()=>{await profiler.send('HeapProfiler.startSampling',{samplingInterval:32768,includeObjectsCollectedByMajorGC:true,includeObjectsCollectedByMinorGC:true});await profiler.send('Profiler.start');}");
source=source.replace("const {profile}=await profiler.send('Profiler.stop');","const {profile}=await profiler.send('Profiler.stop');const {profile:allocation}=await profiler.send('HeapProfiler.stopSampling');fs.writeFileSync("+JSON.stringify(path.join(dir,mode+'-'))+"+side+'.heapprofile',JSON.stringify(allocation));");
source=source.replace('return {results,stress};','return {results,stress,proofDecodeCounters:window.occProofStats||null};');
source=source.replace("fs.writeFileSync('/workspace/work/avoid006-adaptive-perf-'+side+'.cpuprofile'",'fs.writeFileSync('+JSON.stringify(path.join(dir,mode+'-'))+"+side+'.cpuprofile'");
source=source.replace("fs.writeFileSync(process.env.PERF_REPORT||",'report.diagnosticOnly=true;report.formalAcceptance=false;report.productSHA256='+JSON.stringify(sha(compiled))+';report.instrumentedHTMLSHA256='+JSON.stringify(sha(html))+';report.formalToolSHA256='+JSON.stringify(sha(fs.readFileSync(tool)))+';report.wrapperSHA256='+JSON.stringify(sha(fs.readFileSync(__filename)))+';fs.writeFileSync(process.env.PERF_REPORT||');
source=source.replace("assert.ok(report.passed,'adaptive performance contract');",'/* Diagnostic run preserves report.passed, but is not formal acceptance. */');
fs.writeFileSync(path.join(dir,mode+'-generated.cjs'),source);if(process.env.DIAG_PREPARE_ONLY==='1')process.exit(0);
const run=new Module(tool,module);run.filename=tool;run.paths=Module._nodeModulePaths(path.dirname(tool));run._compile(source,tool);
