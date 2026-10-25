/* Prepared host: do not run without parent full-source and persistence review. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),zlib=require('node:zlib'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const ROOT='/workspace/lyricfx.JIZURA',HERE=__dirname,sha=b=>crypto.createHash('sha256').update(b).digest('hex'),B=require('./bounded73.cjs');
const old=ROOT+'/tasks/evidence/AVOID-009/bulbs-focused59/source59/runner',K=require(old+'/kernel59.cjs'),C=require(old+'/catalog59.cjs');
const {patch,END}=require(ROOT+'/work/avoid009-domino73-isolated/overlay73.cjs'),{oracle26}=require('./oracle26.cjs');
const {createCodec69,CODEC69}=require(ROOT+'/dev/avoidance/layouts-d-bulbs69-runner.cjs');
const limits={requestBytes:16777216,serializedOutputBytes:268435456,entriesPerTable:100000,keyBytesPerTable:67108864};
function geometry(){const vm=require('node:vm'),window={J:{}},context=vm.createContext({window});vm.runInContext(fs.readFileSync(ROOT+'/src/01_util.js','utf8'),context);window.J.placement={};vm.runInContext(fs.readFileSync(ROOT+'/src/11p_layoutsEe_bulbs_geometry68.js','utf8'),context);return window.J.placement.bulbsGeometry68;}
function oracleProjection(frame){return{n:frame.n,time:frame.time,passes:frame.passes,glyphs:frame.glyphs,records:frame.records.map(({owner,role,...p})=>p)};}
function heldRows(frame){
 const pass=frame.rows.filter(r=>r.pass==='main');assert(pass.length>=1&&pass.length<=2);return pass.map(r=>{const cnt=r.rowsD[r.r].length,y=270+(r.r-(r.rowsD.length-1)/2)*(r.h+r.w*.35)+r.h/2;return{x0:480-cnt*(r.w+r.g)/2-r.w*.4-2,x1:480+cnt*(r.w+r.g)/2+r.w*.4+2,y0:y-r.h-2,y1:y+r.w*.04+2};});
}
async function main(){
 assert.equal(process.env.DOMINO26_RENDER_RELEASE,'PARENT_REVIEWED_DOMINO26_BOUNDED_SOURCE');
 const args=process.argv.slice(2),arg=k=>{assert(args.includes(k));return args[args.indexOf(k)+1];},out=arg('--output-dir'),binary=arg('--browser-path');assert(out.startsWith('/dev/shm/avoid009-domino26-')&&!fs.existsSync(out));fs.mkdirSync(out,{recursive:true});
 const html=fs.readFileSync(ROOT+'/index.html','utf8'),source=fs.readFileSync(ROOT+'/src/11p_layoutsD.js','utf8'),alias=oracle26(source),patched=patch(source).replace(END,alias+END);assert.equal(html.split(source).length,2);assert.equal(patch(patched.replace(alias,''),true),source);
 const fonts=JSON.parse(fs.readFileSync(ROOT+'/dev/avoidance/layouts-c-editorial-fonts/manifest.json')),assets=new Map([['/candidate.html',Buffer.from(html.replace(source,patched))]]);
 const inputs=[...fs.readdirSync(HERE).filter(n=>/\.(js|cjs|py|md)$/.test(n)).map(n=>HERE+'/'+n),ROOT+'/index.html',...fs.readdirSync(ROOT+'/src').filter(n=>n.endsWith('.js')).map(n=>ROOT+'/src/'+n),ROOT+'/work/avoid009-domino73-isolated/overlay73.cjs',ROOT+'/work/avoid009-domino73-isolated/runtime73.js',ROOT+'/dev/avoidance/layouts-d-bulbs69-runner.cjs',ROOT+'/dev/avoidance/layouts-b-fixture.js',ROOT+'/dev/avoidance/layouts-d-bulbs69-oracle-primitives.js',old+'/kernel59.cjs',old+'/catalog59.cjs',ROOT+'/dev/browser.cjs',ROOT+'/dev/package.json',ROOT+'/dev/package-lock.json',ROOT+'/dev/avoidance/layouts-c-editorial-fonts/manifest.json',process.execPath,binary];
 for(const f of fonts.faces){assert(f.url.startsWith('/dev/avoidance/layouts-c-editorial-fonts/')&&!f.url.includes('..'));const p=ROOT+f.url;assets.set(f.url,fs.readFileSync(p));inputs.push(p);}
 const pins=[...new Set(inputs)].map(p=>({path:p,bytes:fs.statSync(p).size,sha256:sha(fs.readFileSync(p))})),G=geometry();
 const manifest={version:26,mode:'domino26-bounded-all-number-clock-source-pilot',codec:CODEC69,complete:false,errors:[],records:[],cases:[],pins,limits,serializedBytes:0,adapterRegistered:false,safetyCertified:false,comparisonAssetsCreated:false,publicChecks:0,rawDurability:'RAM_ONLY_SITES_PENDING; controller must run parent checker then inventory and hold',scope:'2fixedtext/2fixedcircle; conditional48/69support; x-preserved/y-stage/circle-strict; no fullstage-strict claim'};
 const save=()=>fs.writeFileSync(out+'/manifest.json',JSON.stringify(manifest,null,2));let codec,written,epoch=-1,activeCase='init',browser,server;
 const reset=()=>{codec=createCodec69();written={matrix:0,paint:0,catalog:0};epoch++;};
 function store(value){
  const incoming=Buffer.from(JSON.stringify(K.encode(value)));if(incoming.length>limits.requestBytes){fs.writeFileSync(out+'/failed-incoming.json.gz',zlib.gzipSync(incoming));throw Error('DOMINO26_REQUEST_CAP');}let binding;try{binding=codec.pack(value);assert.deepEqual(codec.restore(binding),value);}catch(e){fs.writeFileSync(out+'/failed-incoming-codec.json.gz',zlib.gzipSync(incoming));throw e;}const tableDeltas={};for(const[k,t]of Object.entries(codec.tables)){tableDeltas[k]=t.drain(written[k]);written[k]=t.table.length;const s=t.stats();assert(s.entries<=limits.entriesPerTable&&s.canonicalKeyBytes<=limits.keyBytesPerTable);}
  const data=Buffer.from(JSON.stringify({storageCodecRevision:CODEC69,tableEpoch:epoch,case:activeCase,sequence:manifest.records.length,binding,tableDeltas,tableStats:Object.fromEntries(Object.entries(codec.tables).map(([k,t])=>[k,t.stats()]))}));
  const file='record-'+String(manifest.records.length).padStart(5,'0')+'.json.gz',gz=zlib.gzipSync(data);fs.writeFileSync(out+'/'+file,gz);manifest.serializedBytes+=data.length;manifest.records.push({file,bytes:gz.length,jsonBytes:data.length,sha256:sha(gz),case:activeCase,tableEpoch:epoch,phase:value.phase,n:value.frame?.n??null});save();assert(manifest.serializedBytes<=limits.serializedOutputBytes,'DOMINO26_SERIALIZED_CAP');
 }
 save();try{
  server=http.createServer((req,res)=>{const item=assets.get(req.url);if(req.method!=='GET'||!item){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':req.url.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream'}).end(item);});await new Promise(ok=>server.listen(0,'127.0.0.1',ok));const origin='http://127.0.0.1:'+server.address().port;browser=await require(ROOT+'/dev/browser.cjs').launch({executablePath:binary});
  for(const[fixture,text]of[['one-row','風の先へ'],['two-row','風の先へ歩いて行くよ']]){
   activeCase=fixture;reset();const page=await browser.newPage();page.on('pageerror',e=>{manifest.errors.push({case:activeCase,pageError:e.message});save();});await page.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());await page.goto(origin+'/candidate.html');await page.waitForFunction(()=>window.J?.ui?.plan);
   for(const p of[ROOT+'/dev/avoidance/layouts-b-fixture.js',ROOT+'/dev/avoidance/layouts-d-bulbs69-oracle-primitives.js',ROOT+'/work/avoid009-domino73-isolated/runtime73.js',HERE+'/support26.js',HERE+'/browser26.js'])await page.addScriptTag({content:fs.readFileSync(p,'utf8')});
   await page.addScriptTag({content:'window.domino26Bounded=(()=>{const module={exports:{}};'+fs.readFileSync(HERE+'/bounded73.cjs','utf8')+';return module.exports;})();'});
   const init=await page.evaluate(input=>initDomino26(input),{fonts,text});B.family(init.plan.cuts[0]);store({phase:'init',fixture,init});const native=[];
   for(let n=0;n<250;n++){const frame=await page.evaluate(n=>frameDomino26({n}),n);store({phase:'native-frame',fixture,frame});assert(!frame.supportError,'DOMINO26_SUPPORT_FAILED:'+JSON.stringify(frame.supportError));native.push(frame);}
   const held=heldRows(native[90]);store({phase:'source-held-heuristic',fixture,held,provenance:'source row w/h/g formula at held native state90; seed only, not support certificate'});
   const results=[];
   for(const[region,circle]of[['default',{cx:480,cy:.42*540,r:108,margin:2.7}],['upper',{cx:480,cy:.2*540,r:108,margin:2.7}]]){
    const plan=B.candidates(held,circle,G);store({phase:'candidate-plan',fixture,region,circle,plan});let winner=null;
    for(const recipe of plan.candidates){let checked=0,witness=null;for(let n=0;n<250;n++){
     const frame=recipe.kind==='native'?native[n]:await page.evaluate(x=>frameDomino26(x),{n,recipe});
     if(recipe.kind!=='native'){store({phase:'destination-frame',fixture,region,frame});assert(!frame.supportError,'DOMINO26_SUPPORT_FAILED:'+JSON.stringify(frame.supportError));const oracle=await page.evaluate(x=>frameDomino26({...x,oracle:true}),{n,recipe});store({phase:'oracle-frame',fixture,region,frame:oracle});assert(!oracle.supportError,'DOMINO26_ORACLE_SUPPORT_FAILED');assert.deepEqual(oracleProjection(frame),oracleProjection(oracle),'DOMINO26_ORIGINAL_CLOSURE_ORACLE');}
     const evaluation=B.evaluatePairs(native[n].supports,frame.supports,circle,G,{emptyPositivePaintSource:native[n].records.length===0&&frame.records.length===0});store({phase:'pair-evaluation',fixture,region,recipe,n,evaluation});checked++;if(!evaluation.passed){witness={n,evaluation};break;}
    }
    const accepted=checked===250&&!witness;store({phase:'candidate-result',fixture,region,recipe,checked,notEvaluated:250-checked,accepted,witness,conditional:true,allNumberPreimagesCovered:accepted,certificateIssued:false});if(accepted){winner=recipe;break;}}
    const result={region,circle,winner,remainingCandidatesNotEvaluated:winner?plan.candidates.slice(plan.candidates.findIndex(r=>r.id===winner.id)+1).map(r=>r.id):[],status:winner?'conditional-source-x-preserved-y-stage-circle-strict-pilot':'insufficient-space-in-finite-tested-family',globalImpossibility:false,adapterRegistered:false};store({phase:'region-result',fixture,...result});results.push(result);
   }
   manifest.cases.push({fixture,text,nativeStates:250,selectedPasses:init.clocks.actualCounts.selectedPasses,results});save();await page.close();
  }
  for(const pin of pins)assert.equal(sha(fs.readFileSync(pin.path)),pin.sha256,'INPUT_CHANGED:'+pin.path);assert.equal(manifest.errors.length,0);manifest.complete=true;
 }catch(e){manifest.errors.push({case:activeCase,name:e.name,message:e.message,stack:e.stack});process.exitCode=1;}
 finally{if(browser)await browser.close();if(server?.listening)await new Promise(ok=>server.close(ok));save();console.log(JSON.stringify({complete:manifest.complete,records:manifest.records.length,serializedBytes:manifest.serializedBytes,errors:manifest.errors,output:out}));}
}
module.exports={oracleProjection,heldRows,limits};if(require.main===module)main();
