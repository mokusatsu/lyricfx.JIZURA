/* SOURCE_PENDING Node host. No execution until parent full-source gate.
   In-memory source/font injection, no HTTP server, no URL navigation. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {createStore}=require('./storage30.cjs'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
async function run({root,source=__dirname,out,browserPath,release,phase}){
 assert.equal(release,'PARENT_REVIEWED_CROSSWORD30_LOCAL_ONLY');assert(['representative','full'].includes(phase));assert(!process.env.JIZURA_BROWSER||process.env.JIZURA_BROWSER===browserPath,'UNPINNED_BROWSER_ENV');for(const p of[root,source,out,browserPath])assert(path.isAbsolute(p));assert(out.startsWith('/dev/shm/avoid009-crossword26/')&&!fs.existsSync(out));
 const names=fs.readdirSync(root+'/src').filter(n=>n.endsWith('.js')).sort(),fontManifestPath=root+'/dev/avoidance/layouts-c-editorial-fonts/manifest.json',fonts=JSON.parse(fs.readFileSync(fontManifestPath)),bytes=p=>fs.readFileSync(p),pins=[];
 const pin=p=>{const b=bytes(p);pins.push({path:p,bytes:b.length,sha256:sha(b)});return b;};
 const preview=pin(root+'/assets/effect-preview.png').toString('base64'),engine=names.map(n=>pin(root+'/src/'+n).toString('utf8')).join('\n').replaceAll('__EFFECT_PREVIEW_IMAGE__','data:image/png;base64,'+preview);
 const fontInputs=fonts.faces.map(face=>{const u=new URL(face.url,'http://127.0.0.1');assert.equal(u.origin,'http://127.0.0.1');const b=pin(path.join(root,u.pathname));assert.equal(sha(b),face.sourceSHA256);return{face,data:b.toString('base64')};});pin(fontManifestPath);
 const policy=JSON.parse(pin(source+'/policy30.json')),sources={native:pin(source+'/native-factory.js').toString('utf8'),private:pin(source+'/private-factory.js').toString('utf8'),observer:pin(source+'/observer-factory.js').toString('utf8'),oracles:Object.fromEntries(policy.shapes.map(s=>[s.id,pin(source+'/oracle-'+s.id+'-factory.js').toString('utf8')]))},harness=pin(source+'/browser30.js').toString('utf8'),fixture=pin(root+'/dev/avoidance/layouts-b-fixture.js').toString('utf8');
 for(const p of[__filename,source+'/storage30.cjs',root+'/dev/browser.cjs',browserPath,process.execPath,root+'/dev/avoidance/layouts-d-bulbs69-runner.cjs',root+'/tasks/evidence/AVOID-009/bulbs-focused59/source59/runner/kernel59.cjs',root+'/tasks/evidence/AVOID-009/bulbs-focused59/source59/runner/catalog59.cjs'])pin(p);
 const store=createStore({root,out,release});let browser,context,page,error;const receipt={status:'RUNNING_PARENT_RAW_REVIEW_REQUIRED',sourcePendingExecutionRelease:release,node:process.version,inputs:pins,networkAttempts:[],pageErrors:[],consoleErrors:[],checks:[],CanvasSamples:0,recordsExpected:0,complete:false,productChanges:0,publicChecks:0,safetyCertified:false};
 const save=()=>fs.writeFileSync(out+'/host-receipt.json',JSON.stringify(receipt,null,2)+'\n');save();
 try{
  browser=await require(root+'/dev/browser.cjs').launch({executablePath:browserPath,args:['--disable-background-networking','--disable-component-update','--disable-sync','--no-first-run','--no-default-browser-check']});
  context=await browser.newContext({serviceWorkers:'block',offline:true});await context.route('**/*',route=>{receipt.networkAttempts.push(route.request().url());return route.abort('blockedbyclient');});page=await context.newPage();
  page.on('pageerror',e=>receipt.pageErrors.push(e.message));page.on('console',m=>{if(m.type()==='error')receipt.consoleErrors.push(m.text());});
  await page.setContent('<!doctype html><html lang="ja"><head><meta charset="utf-8"></head><body></body></html>');
  await page.addScriptTag({content:engine});await page.addScriptTag({content:fixture});
  await page.exposeBinding('emitCrossword30',async(_,row)=>{store.emit(row);receipt.valuesEmitted=(receipt.valuesEmitted||0)+1;if(row.kind==='tuple')receipt.CanvasSamples++;save();});
  const init=await page.evaluate(async({fonts,fontInputs,sources,harness,policy})=>{
   const J=window.J;J.setLang?.('ja');const loaded=[];
   for(const {face:f,data}of fontInputs){const b=Uint8Array.from(atob(data),c=>c.charCodeAt(0)),face=new FontFace(f.family,b,{weight:String(f.weight),style:f.style||'normal'});await face.load();document.fonts.add(face);loaded.push({id:f.id,url:f.url,sha256:f.sourceSHA256,family:f.family,weight:f.weight,label:f.label,status:face.status});}
   const byID=Object.fromEntries(fonts.faces.map(f=>[f.id,f]));for(const[name,f]of Object.entries(J.FONTS)){const a=byID[fonts.assignments[name]];if(!a)throw Error('FONT_ASSIGNMENT:'+name);Object.assign(f,{family:'"'+a.family+'"',weight:a.weight,label:a.label,name:a.label,gf:null,fb:fonts.fallbackFamily?'"'+fonts.fallbackFamily+'"':'sans-serif',user:true});}
   await document.fonts.ready;window.layoutsBFixtureFontAudit={mode:'pinned-multiface-no-network-bytes',faces:loaded,assignments:fonts.assignments};window.layoutsBFixtureFontsKey=JSON.stringify(fonts);window.layoutsBFixtureFont=false;J.metrics.clear();J.glyphs.clear();
   const run=await window.runLayoutsBFixture(J,{layout:'crossword',control:'fullstage',ghost:true,W:960,H:540,seed:1205,text:'風の先へ',params:{font:'dela',dens:.18,fill:2,clue:true}},{newPath:false,fonts,renderInitial:false,exportDataURL:false});
   const p=run.plan;p.duration=4.150001;p.fps=60;p.fx.koma=0;p.lyricAvoidanceIndex.regions[0].end=p.duration;
   if(p.cuts[0].lineText!=='風の先へ')throw Error('NATURAL_LINETEXT_CHANGED');
   // Natural sourcepool input is retained in both native and private/oracle paths.
   const create=Function('return ('+harness+'\n)')();window.crossword30Local={run,driver:create({J,renderer:run.renderer,plan:p,project:run.project,sources,policy})};
   return{plan:p,project:run.project,naturalLineText:p.cuts[0].lineText,clocks:window.crossword30Local.driver.clock,policy,fontAudit:window.layoutsBFixtureFontAudit};
  },{fonts,fontInputs,sources,harness,policy});
  receipt.init=init;receipt.phase=phase;save();
  receipt.pilot=await page.evaluate(async phase=>window.crossword30Local.driver.pilot({phase,emit:row=>window.emitCrossword30(row)}),phase);save();
  assert.equal(receipt.networkAttempts.length,0,'NETWORK_REQUEST_ATTEMPT_NOT_ALLOWED');assert.equal(receipt.pageErrors.length,0,'PAGE_ERRORS');assert.equal(receipt.consoleErrors.length,0,'CONSOLE_ERRORS');for(const pin0 of pins){const b=bytes(pin0.path);assert.equal(b.length,pin0.bytes);assert.equal(sha(b),pin0.sha256,'INPUT_DRIFT:'+pin0.path);}
  store.finish(receipt.valuesEmitted);receipt.complete=true;receipt.status='LOCAL_CANDIDATE_PILOT_DONE_PARENT_RAW_REVIEW_PENDING';
 }catch(e){error=e;store.abort(e);receipt.status='FAILED_PARTIAL_ALL_EMITTED_RAW_RETAINED';receipt.error={name:e.name,message:e.message,stack:e.stack};}
 finally{if(page)await page.close().catch(e=>{receipt.closeError=e.message;});if(context)await context.close().catch(()=>{});if(browser)await browser.close().catch(()=>{});save();}
 if(error)throw error;return receipt;
}
module.exports={run};
if(require.main===module){const argv=process.argv.slice(2),arg=k=>argv[argv.indexOf(k)+1];run({root:arg('--root'),source:arg('--source')||__dirname,out:arg('--out'),browserPath:arg('--browser-path'),release:process.env.CROSSWORD30_RELEASE,phase:arg('--phase')}).then(r=>console.log(JSON.stringify({complete:r.complete,status:r.status,CanvasSamples:r.CanvasSamples,safetyCertified:false}))).catch(e=>{console.error(e.stack);process.exitCode=1;});}
