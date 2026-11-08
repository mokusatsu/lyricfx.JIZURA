const assert=require('node:assert/strict'),{launchBrowser,loadApp}=require('./test_helpers.cjs');
(async()=>{
 const browser=await launchBrowser();
 try{for(const locale of ['','en/']){
  const page=await browser.newPage({viewport:{width:1500,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{const raf=requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>{if(fn.name==='tick'){window.testTick=fn;return 0;}return raf(fn);};window.requestIdleCallback=()=>0;});
  await loadApp(page,{locale});
  const result=await page.evaluate(()=>{
   const p=J.defaultProject();p.title='';p.artist='';p.lyrics='[00:00]First\n[00:04]Second';p.durationOverride=12;
   for(const layer of ['media','foreground'])Object.assign(p[layer],{manualCuts:true,cutCount:3,timing:{lineTimes:{0:0,1:4,2:8}}});
   p.avoidance={...J.normalizeAvoidance(null),timelineMode:true,manualCuts:true,cutCount:2,timing:{lineTimes:{0:0,1:5}},cutOverrides:{0:{untilNext:false,endTime:3},1:{kind:'person',source:{layer:'media',index:1},untilNext:false,endTime:9}}};
   J.ui.project=p;J.uiApi.syncUI();J.uiApi.replan();
   const active=rows=>rows.flatMap((el,i)=>el.classList.contains('cur')?[i]:[]),cases=[];
   const check=time=>{
    J.ui.t=time;J.ui.need=true;testTick(performance.now());
    const layer=J.ui.sourceTab==='foreground'?'foreground':'media',media=J.mediaAt(J.ui.plan,time,layer),avoidance=J.avoidanceAt(J.ui.plan,time);
    const actual=[active(J.ui.mediaLineEls),active(J.ui.avoidanceLineEls)];
    const expected=[media?[media.index]:[],avoidance?[avoidance.index]:[]];
    if(JSON.stringify(actual)!==JSON.stringify(expected))throw Error(JSON.stringify({time,layer,actual,expected}));
    cases.push({time,layer,actual});
   };
   for(const time of [0,2.9,3,4,4.99,5,8,9,11.9,1])check(time);
   for(const tab of ['sourceForeground','sourceMedia','sourceAvoidance','sourceLyrics']){document.getElementById(tab).click();check(6);check(10);}
   const previous=J.ui.mediaLineEls[2];J.uiApi.replan();check(10);
   if(previous===J.ui.mediaLineEls[2])throw Error('Expected list replacement');
   if(previous.classList.contains('cur'))throw Error('Detached active row retained its marker');
   p.media.cutCount=1;p.media.timing.lineTimes={0:0};J.uiApi.replan();check(10);
   return {cases:cases.length};
  });
  assert.equal(result.cases,20);assert.deepEqual(errors,[]);console.log(locale||'ja',result.cases,'list highlights: seek, gaps, tab changes, replacement and shorter list passed');await page.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
