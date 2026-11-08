const assert=require('node:assert/strict'),{launchBrowser,loadApp}=require('./test_helpers.cjs');
const {openSource}=require('./ui_helpers.cjs');
(async()=>{
 const browser=await launchBrowser();
 try{for(const locale of ['','en/']){
  const page=await browser.newPage({viewport:{width:1500,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{const raf=requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>fn.name==='tick'?0:raf(fn);window.requestIdleCallback=()=>0;const open=IDBFactory.prototype.open;IDBFactory.prototype.open=function(name,...args){if(name==='jizura-media-v1')throw new DOMException('Storage unavailable','UnknownError');return open.call(this,name,...args);};});
  await loadApp(page,{locale});
  const bytes=await page.evaluate(()=>{const samples=new Float32Array(800);for(let i=0;i<samples.length;i++)samples[i]=Math.sin(i*.1)*.25;return Array.from(new Uint8Array(J.audioWavBytes({sampleRate:8000,numberOfChannels:1,length:samples.length,duration:.1,getChannelData:()=>samples},.1)));});
  const cdp=await page.context().newCDPSession(page);await cdp.send('HeapProfiler.enable');
  const collect=async()=>{await page.evaluate(()=>new Promise(resolve=>setTimeout(resolve,0)));await cdp.send('HeapProfiler.collectGarbage');};
  const age=()=>page.evaluate(()=>{for(let i=0;i<105;i++){J.ui.project.title='History '+i;J.uiApi.flushSave();}});
  const stored=()=>page.evaluate(()=>J.loadMedia(window.audioHistory.id).then(file=>file.size,()=>0));
  const fresh=()=>page.evaluate(()=>{const p=J.defaultProject();p.lyrics='[00:00]Audio';p.durationOverride=2;J.uiApi.replaceProject(p,null,null,new Map(),true);});
  const attach=async()=>{
   await page.locator('#audioFile').setInputFiles({name:'history.wav',mimeType:'audio/wav',buffer:Buffer.from(bytes)});
   await page.locator('#audioImportDialog [name=matchDuration]').uncheck();await page.locator('#audioImportDialog button[type=submit]').click();
   await page.waitForFunction(()=>!!J.ui.audio&&!document.getElementById('audioLoadingDialog'));
   await page.evaluate(()=>{window.audioHistory={id:J.ui.project.audioAsset.id,file:new WeakRef(J.ui.audioFile),samples:J.ui.audio.buffer.length};});
   await openSource(page,'lyrics');
  };
  await fresh();await attach();await page.locator('#btnRemoveAudio').click();assert.equal(await stored(),bytes.length,'removed audio stays available for undo');
  await page.locator('#btnUndo').click();await page.waitForFunction(()=>J.ui.audio&&J.ui.project.audioAsset?.id===audioHistory.id);assert(await page.evaluate(()=>J.ui.audio.buffer.length===audioHistory.samples),'undo restores decoded audio');
  await page.locator('#btnRedo').click();await page.waitForFunction(()=>!J.ui.audio);await page.evaluate(()=>J.storeMedia('pending-analysis-mask',new Blob(['pending-mask'])));await age();await collect();
  assert.equal(await stored(),0,'expired audio leaves session storage');assert.equal(await page.evaluate(()=>!!audioHistory.file.deref()),false,'expired audio releases its File');assert.equal(await page.evaluate(async()=>(await J.loadMedia('pending-analysis-mask')).size),12,'uncommitted work stays available');
  await fresh();await attach();await page.evaluate(()=>{J.ui.project.artist=audioHistory.id;J.uiApi.flushSave();});await page.locator('#btnRemoveAudio').click();await age();await collect();assert.equal(await stored(),bytes.length,'references in other saved settings retain the same bytes');
  await page.evaluate(()=>{J.ui.project.artist='';J.uiApi.flushSave();});await age();await collect();assert.equal(await stored(),0,'last saved reference can expire later');
  await fresh();await attach();await page.locator('#btnUndo').click();await page.waitForFunction(()=>!J.ui.audio&&!J.ui.project.audioAsset);assert.equal(await stored(),bytes.length,'redo retains imported audio');
  await page.evaluate(()=>{J.ui.project.title='New branch';J.uiApi.flushSave();});await collect();assert.equal(await page.locator('#btnRedo').isDisabled(),true);assert.equal(await stored(),0,'discarded redo releases audio');assert.equal(await page.evaluate(()=>!!audioHistory.file.deref()),false);
  await cdp.send('HeapProfiler.disable');assert.deepEqual(errors,[]);console.log(locale||'ja','audio history: undo/redo, expiry, shared settings, pending work and discarded redo passed');await page.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
