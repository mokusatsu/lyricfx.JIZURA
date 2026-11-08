const assert=require('node:assert/strict'),{launchBrowser,loadApp}=require('./test_helpers.cjs');
(async()=>{
 const browser=await launchBrowser();
 try{for(const locale of ['','en/']){
  const page=await browser.newPage({viewport:{width:1500,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await loadApp(page,{locale});
  const result=await page.evaluate(()=>{
   const p=J.defaultProject();p.title='Original title';p.artist='';p.lyrics='[00:00]First\n[00:04]Second';p.durationOverride=12;p.overrides={0:{single:true},1:{single:true}};
   p.media.manualCuts=true;p.media.cutCount=2;p.media.timing.lineTimes={0:0,1:4};J.ui.project=p;J.uiApi.syncUI();J.uiApi.replan();
   const svg=document.getElementById('timelineLinks'),action=()=>svg.querySelector('.timeline-action'),checks=[];
   const check=(condition,name)=>{if(!condition)throw Error(name);checks.push(name);};
   const old=action();J.uiApi.replan();check(action()===old,'identical timeline retains controls');
   old.focus();J.uiApi.replan();check(document.activeElement!==old,'redraw preserves focus release');
   p.title='New title';J.uiApi.replan();check(action()===old,'title does not rebuild timeline controls');
   p.durationOverride=16;J.uiApi.replan();check(action()!==old,'duration updates control positions');
   let previous=action();J.uiApi.setTimelineZoom(2);check(action()!==previous,'zoom updates control positions');
   p.timelineLinks=[{a:'l:0:0',b:'m:0'}];J.uiApi.replan();check(svg.querySelectorAll('.link-wire').length===1,'new link shown');check(svg.querySelectorAll('.link-handle.linked').length===2,'linked handles updated');
   p.timelineLinks=[{a:'l:0:0',b:'m:0'},{a:'m:0',b:'l:1:0'},{a:'l:1:0',b:'m:1'},{a:'m:1',b:'l:0:0'}];J.uiApi.replan();check(svg.querySelectorAll('.link-handle.linked').length===4,'connected cycle marks every linked handle');
   p.timelineLinks=[];J.uiApi.replan();check(svg.querySelectorAll('.link-wire,.link-handle.linked').length===0,'removed link cleared');
   J.ui.linkDrag={sourceX:1,sourceY:2,x:3,y:4};J.uiApi.setTimelineZoom(2);check(svg.querySelector('.link-preview')?.getAttribute('x2')==='3','drag preview updated');
   J.ui.linkDrag=null;J.uiApi.setTimelineZoom(2);check(!svg.querySelector('.link-preview'),'drag preview removed');
   p.layerVisibility.media=false;J.uiApi.replan();check(document.querySelector('#layerVisibilityControls [data-layer="media"]').getAttribute('aria-pressed')==='false','visibility control updated');
   return {checks:checks.length};
  });
  assert.equal(result.checks,12);const trigger=page.locator('.timeline-action[data-layer="lyrics"]').first();await trigger.click();await page.locator('#timelineCutMenu').waitFor();await page.evaluate(()=>J.uiApi.replan());assert.equal(await page.locator('#timelineCutMenu').count(),0);assert.equal(await trigger.getAttribute('aria-expanded'),'false');
  const before=await page.locator('#timelineLinks').getAttribute('viewBox');await page.setViewportSize({width:1100,height:900});await page.waitForFunction(old=>document.getElementById('timelineLinks').getAttribute('viewBox')!==old,before);
  assert.deepEqual(errors,[]);console.log(locale||'ja','timeline controls: same content, focus, duration, zoom, links, drag, visibility, menu close and resize passed');await page.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
