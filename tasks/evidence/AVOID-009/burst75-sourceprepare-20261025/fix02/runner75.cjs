/* SOURCE75 fidelity only. Parent must review source, persistence and exact inputs before RUN. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),zlib=require('node:zlib'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const ROOT='/workspace/lyricfx.JIZURA',sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const {prepare}=require('./source75.cjs');
const old=ROOT+'/tasks/evidence/AVOID-009/bulbs-focused59/source59/runner',K=require(old+'/kernel59.cjs'),C=require(old+'/catalog59.cjs');
function codec75(){const source=fs.readFileSync(ROOT+'/dev/avoidance/layouts-d-bulbs69-runner.cjs','utf8'),a=source.indexOf("const CODEC69="),b=source.indexOf('function referenceReuse69(',a);assert(a>0&&b>a);const span=source.slice(a,b);return{...new Function('K','C','zlib','assert','sha',span+';return {revision:CODEC69,create:createCodec69};')(K,C,zlib,assert,sha),sourceSpanSHA256:sha(span)};}
async function main(){
 assert.equal(process.env.BURST75_RENDER_RELEASE,'PARENT_REVIEWED_SOURCE75_NATIVE_FIDELITY');
 const argv=process.argv.slice(2),arg=k=>{assert(argv.includes(k));return argv[argv.indexOf(k)+1];},out=arg('--output-dir'),binary=arg('--browser-path');assert(out.startsWith('/dev/shm/')&&!fs.existsSync(out));fs.mkdirSync(out,{recursive:true});
 const html=fs.readFileSync(ROOT+'/index.html','utf8'),source=fs.readFileSync(ROOT+'/src/11p_layoutsD.js','utf8');assert.equal(html.split(source).length,2);
 const prepared=prepare(source),binding='(function(){const module={exports:null};'+fs.readFileSync(__dirname+'/private-binding.cjs','utf8')+';return module.exports;})()',setup=fs.readFileSync(__dirname+'/browser75.js','utf8');
 const replacement=setup+'('+binding+','+prepared.installer+');',overlay=html.replace(source,replacement);assert.equal(overlay.replace(replacement,source),html);
 const fonts=JSON.parse(fs.readFileSync(ROOT+'/dev/avoidance/layouts-c-editorial-fonts/manifest.json')),assets=new Map([['/native.html',Buffer.from(html)],['/overlay.html',Buffer.from(overlay)]]);
 const sources=[__filename,path.join(__dirname,'raw-review75.py'),ROOT+'/tasks/evidence/AVOID-009/resume-20261025/parent-read-raw69.py',path.join(__dirname,'browser75.js'),path.join(__dirname,'source75.cjs'),path.join(__dirname,'private-binding.cjs'),ROOT+'/index.html',ROOT+'/src/11p_layoutsD.js',ROOT+'/dev/avoidance/layouts-b-fixture.js',ROOT+'/dev/avoidance/layouts-d-bulbs69-oracle-primitives.js',ROOT+'/dev/avoidance/layouts-d-bulbs69-runner.cjs',old+'/kernel59.cjs',old+'/catalog59.cjs',ROOT+'/dev/browser.cjs',ROOT+'/dev/package.json',ROOT+'/dev/package-lock.json',ROOT+'/dev/avoidance/layouts-c-editorial-fonts/manifest.json',process.execPath,binary];
 for(const face of fonts.faces){const url=new URL(face.url,'http://127.0.0.1');assert.equal(url.origin,'http://127.0.0.1');const name=path.join(ROOT,url.pathname);assets.set(url.pathname,fs.readFileSync(name));sources.push(name);}
 const pins=[...new Set(sources)].map(name=>({path:name,bytes:fs.statSync(name).size,sha256:sha(fs.readFileSync(name))}));
 const factory=codec75(),manifest={version:75,mode:'native-source-representative-tuples-only',expected:{texts:1,sourceTuplesPerText:18,modes:6,paintAndRGBAReads:108,initRecords:6,frameRecords:108,wholeRendererFrames:0,fullStateSafety:false},complete:false,errors:[],records:[],cases:[],pins,codec:factory.revision,codecFactorySHA256:factory.sourceSpanSHA256,limits:{requestBytes:16777216,serializedOutputBytes:268435456,entriesPerTable:100000,keyBytesPerTable:67108864},serializedBytes:0,publicChecks:0,comparisonAssetsCreated:false,adapterRegistered:false,safetyCertified:false,rawDurability:'RAM_ONLY; parent same-process checker and archiver required, no tool exit before durable save or explicit failure'};
 const save=()=>fs.writeFileSync(out+'/manifest.json',JSON.stringify(manifest,null,2));let codec,epoch=-1,written,activeCase='init',browser,server;
 const reset=()=>{codec=factory.create();written={matrix:0,paint:0,catalog:0};epoch++;};
 function store(value){
  const incoming=Buffer.from(JSON.stringify(K.encode(value)));if(incoming.length>manifest.limits.requestBytes){const b=zlib.gzipSync(incoming);fs.writeFileSync(out+'/failed-incoming.json.gz',b);throw Error('BURST75_REQUEST_BUDGET');}
  let binding;try{binding=codec.pack(value);assert.deepEqual(codec.restore(binding),value);}catch(e){fs.writeFileSync(out+'/failed-incoming-codec.json.gz',zlib.gzipSync(incoming));throw e;}const tableDeltas={};for(const [k,t]of Object.entries(codec.tables)){tableDeltas[k]=t.drain(written[k]);written[k]=t.table.length;const stats=t.stats();assert(stats.entries<=100000&&stats.canonicalKeyBytes<=67108864);}
  const data=Buffer.from(JSON.stringify({storageCodecRevision:factory.revision,tableEpoch:epoch,case:activeCase,sequence:manifest.records.length,binding,tableDeltas,tableStats:Object.fromEntries(Object.entries(codec.tables).map(([k,t])=>[k,t.stats()]))}));manifest.serializedBytes+=data.length;
  const gz=zlib.gzipSync(data),file='record-'+String(manifest.records.length).padStart(5,'0')+'.json.gz';fs.writeFileSync(out+'/'+file,gz);manifest.records.push({file,bytes:gz.length,jsonBytes:data.length,sha256:sha(gz),case:activeCase,tableEpoch:epoch,phase:value.phase,n:value.frame?.n??null});save();assert(manifest.serializedBytes<=manifest.limits.serializedOutputBytes,'BURST75_SERIALIZED_BUDGET');
 }
 const projection=x=>({...x,mode:null});
 save();
 try{
  server=http.createServer((req,res)=>{const item=assets.get(req.url);if(req.method!=='GET'||!item){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':req.url.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream'}).end(item);});await new Promise(ok=>server.listen(0,'127.0.0.1',ok));const origin='http://127.0.0.1:'+server.address().port;
  browser=await require(ROOT+'/dev/browser.cjs').launch({executablePath:binary});
  for(const [fixture,text]of [['four-glyph','風の先へ']]){
   const reference=[],moved=[];
   for(const mode of ['native','off','on-zero','public-recipe','oracle-moved','on-moved']){
    activeCase=fixture+'.'+mode;reset();manifest.cases.push({case:activeCase,text,mode});save();const page=await browser.newPage();page.on('pageerror',e=>{manifest.errors.push({case:activeCase,pageError:e.message});save();});await page.route('**/*',route=>route.request().url().startsWith(origin+'/')?route.continue():route.abort());await page.goto(origin+(mode==='native'?'/native.html':'/overlay.html'));await page.waitForFunction(()=>window.J?.ui?.plan);
    for(const name of ['layouts-b-fixture.js','layouts-d-bulbs69-oracle-primitives.js'])await page.addScriptTag({content:fs.readFileSync(ROOT+'/dev/avoidance/'+name,'utf8')});if(mode==='native')await page.addScriptTag({content:setup+'('+binding+',null);'});const init=await page.evaluate(input=>initBurst75(input),{fonts,text});store({phase:'init',fixture,mode,init});
    const queries=[0,.2,.45,.9,3.8,4.05].flatMap(lt=>['main','A','B'].map(pass=>({lt,pass})));
    for(let n=0;n<queries.length;n++){
     const frame=await page.evaluate(input=>frameBurst75(input),{n,mode,query:queries[n]});store({phase:'frame',fixture,mode,frame});
     if(mode==='native')reference.push(frame);else if(mode==='off'||mode==='on-zero'||mode==='public-recipe')assert.deepEqual(projection(frame),projection(reference[n]),'BURST75_NATIVE_EXACT:'+activeCase+':'+n);else if(mode==='oracle-moved')moved.push(frame);else assert.deepEqual(projection(frame),projection(moved[n]),'BURST75_MOVED_ORACLE_EXACT:'+activeCase+':'+n);
    }
    await page.close();
   }
  }
  for(const pin of pins)assert.equal(sha(fs.readFileSync(pin.path)),pin.sha256,'INPUT_CHANGED:'+pin.path);assert.equal(manifest.errors.length,0);manifest.complete=true;
 }catch(e){manifest.errors.push({case:activeCase,name:e.name,message:e.message,stack:e.stack});process.exitCode=1;}
 finally{if(browser)await browser.close();if(server?.listening)await new Promise(ok=>server.close(ok));save();console.log(JSON.stringify({complete:manifest.complete,records:manifest.records.length,serializedBytes:manifest.serializedBytes,errors:manifest.errors,output:out,rawDurability:manifest.rawDurability}));}
}
module.exports={codec75};if(require.main===module)main();
