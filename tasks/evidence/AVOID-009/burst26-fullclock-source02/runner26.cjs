'use strict';
// Source-only full-clock host. Gated; no execution during source preparation.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),zlib=require('node:zlib'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const ROOT='/workspace/lyricfx.JIZURA',sha=b=>crypto.createHash('sha256').update(b).digest('hex'),{prepare}=require('./source26.cjs');
const old=ROOT+'/tasks/evidence/AVOID-009/bulbs-focused59/source59/runner',K=require(old+'/kernel59.cjs'),C=require(old+'/catalog59.cjs');
function codec26(){const source=fs.readFileSync(ROOT+'/dev/avoidance/layouts-d-bulbs69-runner.cjs','utf8'),a=source.indexOf('const CODEC69='),b=source.indexOf('function referenceReuse69(',a);assert(a>0&&b>a);const span=source.slice(a,b);return{...new Function('K','C','zlib','assert','sha',span+';return {revision:CODEC69,create:createCodec69};')(K,C,zlib,assert,sha),sourceSpanSHA256:sha(span)};}
function projection(f){return{...f,mode:null};}
function acceptSample(frame,store){if(frame.supportError){store({phase:'support-error-frame',frame});assert.fail('BURST26_SUPPORT_ERROR:'+frame.supportError.message);}return frame;}
async function main(){
 assert.equal(process.env.BURST26_RENDER_RELEASE,'PARENT_REVIEWED_BURST26_FULLCLOCK');
 const argv=process.argv.slice(2),arg=k=>{assert(argv.includes(k));return argv[argv.indexOf(k)+1];},out=arg('--output-dir'),binary=arg('--browser-path');assert(out.startsWith('/dev/shm/')&&!fs.existsSync(out));fs.mkdirSync(out,{recursive:true});
 const html=fs.readFileSync(ROOT+'/index.html','utf8'),source=fs.readFileSync(ROOT+'/src/11p_layoutsD.js','utf8');assert.equal(html.split(source).length,2);
 const prepared=prepare(source),binding='(function(){const module={exports:null};'+fs.readFileSync(__dirname+'/private26.cjs','utf8')+';return module.exports;})()',setup=fs.readFileSync(__dirname+'/browser26.js','utf8'),replacement=setup+'('+binding+','+prepared.installer+');',overlay=html.replace(source,replacement);assert.equal(overlay.replace(replacement,source),html);
 const pure='(function(){const module={exports:{}};'+fs.readFileSync(__dirname+'/../bounded26.cjs','utf8')+';window.burst26Pure=module.exports;})()';
 const fonts=JSON.parse(fs.readFileSync(ROOT+'/dev/avoidance/layouts-c-editorial-fonts/manifest.json')),assets=new Map([['/overlay.html',Buffer.from(overlay)]]);
 const sources=[__filename,__dirname+'/source26.cjs',__dirname+'/private26.cjs',__dirname+'/browser26.js',__dirname+'/checker26.py',__dirname+'/execute26.py',path.resolve(__dirname,'../bounded26.cjs'),ROOT+'/index.html',ROOT+'/src/11p_layoutsD.js',ROOT+'/src/11p_layoutsEc_tiles_proof48.js',ROOT+'/src/11p_layoutsEe_bulbs_geometry68.js',ROOT+'/src/11p_layoutsEf_bulbs_proof69.js',ROOT+'/dev/avoidance/layouts-b-fixture.js',ROOT+'/dev/avoidance/layouts-d-bulbs69-oracle-primitives.js',ROOT+'/dev/avoidance/layouts-d-bulbs69-runner.cjs',ROOT+'/tasks/evidence/AVOID-009/resume-20261025/parent-read-raw69.py',old+'/kernel59.cjs',old+'/catalog59.cjs',ROOT+'/dev/browser.cjs',ROOT+'/dev/package.json',ROOT+'/dev/package-lock.json',ROOT+'/dev/avoidance/layouts-c-editorial-fonts/manifest.json',process.execPath,binary];
 for(const face of fonts.faces){const url=new URL(face.url,'http://127.0.0.1');assert.equal(url.origin,'http://127.0.0.1');const name=path.join(ROOT,url.pathname);assets.set(url.pathname,fs.readFileSync(name));sources.push(name);}
 const pins=[...new Set(sources)].map(name=>({path:name,bytes:fs.statSync(name).size,sha256:sha(fs.readFileSync(name))})),factory=codec26();
 const m={version:26,mode:'burst-bounded-fullclock-source',complete:false,errors:[],records:[],pins,codec:factory.revision,codecFactorySHA256:factory.sourceSpanSHA256,limits:{requestBytes:16777216,serializedOutputBytes:268435456,entriesPerTable:100000,keyBytesPerTable:67108864},serializedBytes:0,publicChecks:0,comparisonAssetsCreated:false,adapterRegistered:false,safetyCertified:false,rawDurability:'RAM_ONLY; same-process checker and Sites Source pending hold required',nativeFrames:0,nativePasses:0,outcomes:[]};
 const save=()=>fs.writeFileSync(out+'/manifest.json',JSON.stringify(m,null,2));let codec,epoch=-1,written,activeCase='init',browser,server;
 const reset=c=>{activeCase=c;codec=factory.create();written={matrix:0,paint:0,catalog:0};epoch++;};
 function store(value){
  const incoming=Buffer.from(JSON.stringify(K.encode(value)));if(incoming.length>m.limits.requestBytes){fs.writeFileSync(out+'/failed-incoming.json.gz',zlib.gzipSync(incoming));throw Error('BURST26_REQUEST_BUDGET');}
  let binding;try{binding=codec.pack(value);assert.deepEqual(codec.restore(binding),value);}catch(e){fs.writeFileSync(out+'/failed-codec.json.gz',zlib.gzipSync(incoming));throw e;}
  const tableDeltas={};for(const[k,t]of Object.entries(codec.tables)){tableDeltas[k]=t.drain(written[k]);written[k]=t.table.length;const s=t.stats();assert(s.entries<=100000&&s.canonicalKeyBytes<=67108864);}
  const data=Buffer.from(JSON.stringify({storageCodecRevision:factory.revision,tableEpoch:epoch,case:activeCase,sequence:m.records.length,binding,tableDeltas,tableStats:Object.fromEntries(Object.entries(codec.tables).map(([k,t])=>[k,t.stats()]))}));m.serializedBytes+=data.length;const gz=zlib.gzipSync(data),file='record-'+String(m.records.length).padStart(5,'0')+'.json.gz';fs.writeFileSync(out+'/'+file,gz);m.records.push({file,bytes:gz.length,jsonBytes:data.length,sha256:sha(gz),case:activeCase,tableEpoch:epoch,phase:value.phase,n:value.frame?.n??null});save();assert(m.serializedBytes<=m.limits.serializedOutputBytes,'BURST26_SERIALIZED_BUDGET');
 }
 save();
 try{
  server=http.createServer((req,res)=>{const item=assets.get(req.url);if(req.method!=='GET'||!item){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':req.url.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream'}).end(item);});await new Promise(ok=>server.listen(0,'127.0.0.1',ok));const origin='http://127.0.0.1:'+server.address().port;
  browser=await require(ROOT+'/dev/browser.cjs').launch({executablePath:binary});const page=await browser.newPage();page.on('pageerror',e=>{m.errors.push({case:activeCase,pageError:e.message});save();});await page.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());await page.goto(origin+'/overlay.html');await page.waitForFunction(()=>window.J?.ui?.plan);
  for(const name of ['layouts-b-fixture.js','layouts-d-bulbs69-oracle-primitives.js'])await page.addScriptTag({content:fs.readFileSync(ROOT+'/dev/avoidance/'+name,'utf8')});await page.addScriptTag({content:pure});reset('native');const init=await page.evaluate(input=>initBurst26(input),{fonts});store({phase:'init',init});
  assert.equal(init.clocks.actualCounts.states,250);assert.equal(init.clocks.actualCounts.selectedPasses,727);const states=init.clocks.states,native=new Map();
  const sample=async(n,mode,recipe=null,delta=[0,0])=>acceptSample(await page.evaluate(input=>frameBurst26(input),{n,mode,recipe,delta}),store);
  const evaluate=async(supports,circle)=>await page.evaluate(input=>evaluateBurst26(input),{supports,circle});
  for(const s of states){const frame=await sample(s.n,'native');store({phase:'native-frame',frame});native.set(s.n,frame);m.nativeFrames++;m.nativePasses+=frame.passes.length;}
  save();const circles=[{id:'default',cx:480,cy:540*.42,r:108,margin:2.7},{id:'upper',cx:480,cy:540*.2,r:108,margin:2.7}],seedN=90;
  for(const circle of circles){let winner=null;const outcomes=[];
   for(const row of init.recipes){const recipe=row.recipe;if(!row.dimensions.writingFieldFits){reset(circle.id+'.'+recipe.id+'.quality');const v={phase:'recipe-rejected',circle,recipe,reason:'writing-field-insufficient',dimensions:row.dimensions};store(v);outcomes.push({recipe:recipe.id,status:'quality-rejected'});continue;}
    let seed;if(recipe.id==='native')seed=native.get(seedN);else{reset(circle.id+'.'+recipe.id+'.seed');seed=await sample(seedN,'candidate',recipe);store({phase:'recipe-seed',circle,recipe,frame:seed});}
    const family=await page.evaluate(input=>candidatesBurst26(input),{recipe,supports:seed.supports,circle});reset(circle.id+'.'+recipe.id+'.family');store({phase:'candidate-family',circle,recipe,seedN,family});
    for(let ordinal=0;ordinal<family.candidates.length;ordinal++){
     const candidate=family.candidates[ordinal],delta=candidate.delta;reset(circle.id+'.'+recipe.id+'.candidate-'+ordinal);let failed=null,checked=0,passes=0;
     for(const state of states){
      const reused=recipe.id==='native'&&delta.every(x=>x===0),frame=reused?native.get(state.n):state.n===seedN&&delta.every(x=>x===0)?seed:await sample(state.n,'candidate',recipe,delta),evaluation=await evaluate(frame.supports,circle);
      store({phase:'candidate-frame',circle,recipe,candidateOrdinal:ordinal,reusedNative:reused,frame,evaluation});checked++;passes+=frame.passes.length;
      if(!evaluation.passed){failed={n:state.n,failures:evaluation.failures};break;}
     }
     const result={phase:'candidate-result',circle,recipe,candidateOrdinal:ordinal,delta,checked,passes,status:failed?'rejected-first-witness':'all-clocks-geometry-passed',failed};store(result);const {phase:discardPhase,...resultSummary}=result;outcomes.push(resultSummary);
     if(!failed){
      // Only the selected geometric winner receives a second full pass against the independent closure.
      // All destination values are persisted. The actual direct destination is rechecked at this point.
      for(const state of states){const direct=await sample(state.n,'candidate',recipe,delta),oracle=await sample(state.n,'oracle',recipe,delta);store({phase:'winner-oracle-pair',circle,recipe,delta,direct,oracle});assert.deepEqual(projection(direct),projection(oracle),'BURST26_INDEPENDENT_ORACLE');assert((await evaluate(direct.supports,circle)).passed,'BURST26_WINNER_RECHECK');}
      winner={recipe:recipe.id,delta,checked,passes,oraclePairs:states.length};break;
     }
    }
    if(winner)break;
   }
   reset(circle.id+'.complete');const outcome={phase:'circle-result',circle,winner,outcomes,status:winner?'bounded-source-candidate-awaiting-parent-review':'insufficient-space-in-evaluated-finite-family',notGlobalImpossibility:true,certificateIssued:false};store(outcome);m.outcomes.push(outcome);save();
  }
  for(const p of pins)assert.equal(sha(fs.readFileSync(p.path)),p.sha256,'INPUT_CHANGED:'+p.path);assert.equal(m.errors.length,0);m.complete=true;await page.close();
 }catch(e){m.errors.push({case:activeCase,name:e.name,message:e.message,stack:e.stack});process.exitCode=1;}
 finally{if(browser)await browser.close();if(server?.listening)await new Promise(ok=>server.close(ok));save();console.log(JSON.stringify({complete:m.complete,records:m.records.length,nativeFrames:m.nativeFrames,nativePasses:m.nativePasses,outcomes:m.outcomes.map(o=>({circle:o.circle.id,status:o.status,winner:o.winner})),errors:m.errors,output:out}));}
}
module.exports={codec26,acceptSample};if(require.main===module)main();
