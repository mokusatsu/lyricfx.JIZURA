/* SOURCE73 fidelity only. Parent must review source, persistence and exact inputs before RUN. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),zlib=require('node:zlib'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const ROOT='/workspace/lyricfx.JIZURA',sha=b=>crypto.createHash('sha256').update(b).digest('hex'),local=ROOT+'/work/avoid009-domino73-isolated';
const {patch,END}=require(local+'/overlay73.cjs'),{oracleAlias73}=require('./oracle-source73.cjs');
const old=ROOT+'/tasks/evidence/AVOID-009/bulbs-focused59/source59/runner',K=require(old+'/kernel59.cjs'),C=require(old+'/catalog59.cjs');
function codec73(){const source=fs.readFileSync(ROOT+'/dev/avoidance/layouts-d-bulbs69-runner.cjs','utf8'),a=source.indexOf("const CODEC69="),b=source.indexOf('function referenceReuse69(',a);assert(a>0&&b>a);const span=source.slice(a,b);return{...new Function('K','C','zlib','assert','sha',span+';return {revision:CODEC69,create:createCodec69};')(K,C,zlib,assert,sha),sourceSpanSHA256:sha(span)};}
async function main(){
 assert.equal(process.env.DOMINO73_RENDER_RELEASE,'PARENT_REVIEWED_SOURCE73_NATIVE_FIDELITY');
 const argv=process.argv.slice(2),arg=k=>{assert(argv.includes(k));return argv[argv.indexOf(k)+1];},out=arg('--output-dir'),binary=arg('--browser-path');assert(out.startsWith('/dev/shm/')&&!fs.existsSync(out));fs.mkdirSync(out,{recursive:true});
 const html=fs.readFileSync(ROOT+'/index.html','utf8'),source=fs.readFileSync(ROOT+'/src/11p_layoutsD.js','utf8'),runtime=fs.readFileSync(local+'/runtime73.js','utf8');assert.equal(html.split(source).length,2);
 const alias=oracleAlias73(source),patched=patch(source).replace(END,alias+END);assert.equal(patch(patched.replace(alias,''),true),source);const overlay=html.replace(source,patched);
 const fonts=JSON.parse(fs.readFileSync(ROOT+'/dev/avoidance/layouts-c-editorial-fonts/manifest.json')),assets=new Map([['/native.html',Buffer.from(html)],['/overlay.html',Buffer.from(overlay)]]);
 const sources=[__filename,path.join(__dirname,'browser73.js'),path.join(__dirname,'oracle-source73.cjs'),ROOT+'/index.html',ROOT+'/src/11p_layoutsD.js',local+'/overlay73.cjs',local+'/runtime73.js',ROOT+'/dev/avoidance/layouts-b-fixture.js',ROOT+'/dev/avoidance/layouts-d-bulbs69-oracle-primitives.js',ROOT+'/dev/avoidance/layouts-d-bulbs69-runner.cjs',old+'/kernel59.cjs',old+'/catalog59.cjs',ROOT+'/dev/browser.cjs',ROOT+'/dev/package.json',ROOT+'/dev/package-lock.json',ROOT+'/dev/avoidance/layouts-c-editorial-fonts/manifest.json',process.execPath,binary];
 for(const face of fonts.faces){const url=new URL(face.url,'http://127.0.0.1');assert.equal(url.origin,'http://127.0.0.1');const name=path.join(ROOT,url.pathname);assets.set(url.pathname,fs.readFileSync(name));sources.push(name);}
 const pins=[...new Set(sources)].map(name=>({path:name,bytes:fs.statSync(name).size,sha256:sha(fs.readFileSync(name))}));
 const factory=codec73(),manifest={version:73,mode:'native-source-representative-tuples-only',expected:{texts:2,sourceTuplesPerText:26,modes:5,paintAndRGBAReads:260,initRecords:10,frameRecords:260,wholeRendererFrames:0,fullStateSafety:false},complete:false,errors:[],records:[],cases:[],pins,codec:factory.revision,codecFactorySHA256:factory.sourceSpanSHA256,limits:{requestBytes:16777216,serializedOutputBytes:268435456,entriesPerTable:100000,keyBytesPerTable:67108864},serializedBytes:0,publicChecks:0,comparisonAssetsCreated:false,adapterRegistered:false,safetyCertified:false,rawDurability:'RAM_ONLY; parent same-process checker and archiver required, no tool exit before durable save or explicit failure'};
 const save=()=>fs.writeFileSync(out+'/manifest.json',JSON.stringify(manifest,null,2));let codec,epoch=-1,written,activeCase='init',browser,server;
 const reset=()=>{codec=factory.create();written={matrix:0,paint:0,catalog:0};epoch++;};
 function store(value){
  const incoming=Buffer.from(JSON.stringify(K.encode(value)));if(incoming.length>manifest.limits.requestBytes){const b=zlib.gzipSync(incoming);fs.writeFileSync(out+'/failed-incoming.json.gz',b);throw Error('DOMINO73_REQUEST_BUDGET');}
  let binding;try{binding=codec.pack(value);assert.deepEqual(codec.restore(binding),value);}catch(e){fs.writeFileSync(out+'/failed-incoming-codec.json.gz',zlib.gzipSync(incoming));throw e;}const tableDeltas={};for(const [k,t]of Object.entries(codec.tables)){tableDeltas[k]=t.drain(written[k]);written[k]=t.table.length;const stats=t.stats();assert(stats.entries<=100000&&stats.canonicalKeyBytes<=67108864);}
  const data=Buffer.from(JSON.stringify({storageCodecRevision:factory.revision,tableEpoch:epoch,case:activeCase,sequence:manifest.records.length,binding,tableDeltas,tableStats:Object.fromEntries(Object.entries(codec.tables).map(([k,t])=>[k,t.stats()]))}));manifest.serializedBytes+=data.length;
  const gz=zlib.gzipSync(data),file='record-'+String(manifest.records.length).padStart(5,'0')+'.json.gz';fs.writeFileSync(out+'/'+file,gz);manifest.records.push({file,bytes:gz.length,jsonBytes:data.length,sha256:sha(gz),case:activeCase,tableEpoch:epoch,phase:value.phase,n:value.frame?.n??null});save();assert(manifest.serializedBytes<=manifest.limits.serializedOutputBytes,'DOMINO73_SERIALIZED_BUDGET');
 }
 const projection=x=>({...x,mode:null,rows:null,records:x.records.map(({owner,role,...p})=>p)});
 save();
 try{
  server=http.createServer((req,res)=>{const item=assets.get(req.url);if(req.method!=='GET'||!item){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':req.url.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream'}).end(item);});await new Promise(ok=>server.listen(0,'127.0.0.1',ok));const origin='http://127.0.0.1:'+server.address().port;
  browser=await require(ROOT+'/dev/browser.cjs').launch({executablePath:binary});
  for(const [fixture,text]of [['one-row','風の先へ'],['two-row','風の先へ歩いて行くよ']]){
   const reference=[],moved=[];
   for(const mode of ['native','off','on-zero','oracle-moved','on-moved']){
    activeCase=fixture+'.'+mode;reset();manifest.cases.push({case:activeCase,text,mode});save();const page=await browser.newPage();page.on('pageerror',e=>{manifest.errors.push({case:activeCase,pageError:e.message});save();});await page.route('**/*',route=>route.request().url().startsWith(origin+'/')?route.continue():route.abort());await page.goto(origin+(mode==='native'?'/native.html':'/overlay.html'));await page.waitForFunction(()=>window.J?.ui?.plan);
    for(const name of ['layouts-b-fixture.js','layouts-d-bulbs69-oracle-primitives.js'])await page.addScriptTag({content:fs.readFileSync(ROOT+'/dev/avoidance/'+name,'utf8')});if(mode.startsWith('on-'))await page.addScriptTag({content:runtime});await page.addScriptTag({content:fs.readFileSync(path.join(__dirname,'browser73.js'),'utf8')});const init=await page.evaluate(input=>initDomino73(input),{fonts,text});store({phase:'init',fixture,mode,init});
    const queries=[...[0,.15,.35,.55,.76,1.5,3.8,4.05].flatMap(lt=>['main','A','B'].map(pass=>({lt,pass,scale:1,fractional:false}))),{lt:.23,pass:'B',scale:.5,fractional:true},{lt:1.5,pass:'main',scale:2,fractional:true}];
    for(let n=0;n<queries.length;n++){
     const frame=await page.evaluate(input=>frameDomino73(input),{n,mode,query:queries[n]});store({phase:'frame',fixture,mode,frame});
     if(mode==='native')reference.push(frame);else if(mode==='off'||mode==='on-zero')assert.deepEqual(projection(frame),projection(reference[n]),'DOMINO73_NATIVE_EXACT:'+activeCase+':'+n);else if(mode==='oracle-moved')moved.push(frame);else assert.deepEqual(projection(frame),projection(moved[n]),'DOMINO73_MOVED_ORACLE_EXACT:'+activeCase+':'+n);
     if(mode.startsWith('on-'))assert(frame.rows.every(r=>r.rowsD.length===(fixture==='one-row'?1:2)),'DOMINO73_EXPECTED_ROW_COUNT');
    }
    await page.close();
   }
  }
  for(const pin of pins)assert.equal(sha(fs.readFileSync(pin.path)),pin.sha256,'INPUT_CHANGED:'+pin.path);assert.equal(manifest.errors.length,0);manifest.complete=true;
 }catch(e){manifest.errors.push({case:activeCase,name:e.name,message:e.message,stack:e.stack});process.exitCode=1;}
 finally{if(browser)await browser.close();if(server?.listening)await new Promise(ok=>server.close(ok));save();console.log(JSON.stringify({complete:manifest.complete,records:manifest.records.length,serializedBytes:manifest.serializedBytes,errors:manifest.errors,output:out,rawDurability:manifest.rawDurability}));}
}
module.exports={codec73};if(require.main===module)main();
