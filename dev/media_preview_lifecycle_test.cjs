const assert=require('node:assert/strict'),{launchBrowser,loadApp}=require('./test_helpers.cjs');
(async()=>{
 const browser=await launchBrowser();
 try{for(const locale of ['','en/']){
  const page=await browser.newPage();await page.addInitScript(()=>{const raf=requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>fn.name==='tick'?0:raf(fn);window.requestIdleCallback=()=>0;});await loadApp(page,{locale});
  const primed=await page.evaluate(async()=>{
   const image=document.createElement('canvas');image.width=image.height=64;image.getContext('2d').fillRect(0,0,64,64);const blob=await new Promise(resolve=>image.toBlob(resolve,'image/png'));
   const p=J.defaultProject();p.lyrics='';p.durationOverride=4;
   for(const layer of ['media','foreground']){const item={id:'preview-'+layer,name:layer+'.png',type:'image'};await J.attachMedia(item,new File([blob],item.name,{type:'image/png'}));Object.assign(p[layer],{items:[item],manualCuts:true,cutCount:1,cutOverrides:{0:{itemId:item.id,technique:'none'}}});}
   J.ui.project=p;J.uiApi.syncUI();J.uiApi.replan();const old=J.ui.plan;J.syncMediaPreview(old,.5,false);
   window.retiredPreviewPlan=new WeakRef(old);const result=[J._previewMediaCut?.plan===old,J._previewForegroundCut?.plan===old];
   const next=J.defaultProject();next.lyrics='';next.layerVisibility={media:false,foreground:false,lyrics:true,avoidance:true};J.uiApi.replaceProject(next,null,null,new Map(),true);return result;
  });assert.deepEqual(primed,[true,true]);
  const cdp=await page.context().newCDPSession(page);await cdp.send('HeapProfiler.enable');
  for(let i=0;i<3;i++){await page.evaluate(()=>new Promise(resolve=>setTimeout(resolve,0)));await cdp.send('HeapProfiler.collectGarbage');}
  assert.deepEqual(await page.evaluate(()=>({planAlive:!!retiredPreviewPlan.deref(),media:J._previewMediaCut,foreground:J._previewForegroundCut,mediaFrame:J.mediaTransitionFrame,foregroundFrame:J.foregroundTransitionFrame})),{planAlive:false,media:null,foreground:null,mediaFrame:null,foregroundFrame:null});
  await cdp.send('HeapProfiler.disable');console.log(locale||'ja','hidden replacement layers release both previous preview records and the old plan');await page.close();
 }}finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
