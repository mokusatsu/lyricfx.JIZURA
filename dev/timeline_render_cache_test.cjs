const assert=require('node:assert/strict');
const {launchBrowser,loadApp}=require('./test_helpers.cjs');
(async()=>{
 const browser=await launchBrowser();
 try{
  const page=await browser.newPage({viewport:{width:1500,height:1000}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{const raf=requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>{if(fn.name==='tick'){window.drawTestTick=fn;return 0;}return raf(fn);};window.requestIdleCallback=()=>0;});
  await loadApp(page);
  await page.evaluate(()=>{
   const p=J.defaultProject();p.lyrics='Alpha\nBeta\nGamma';p.durationOverride=20;p.timing.lineTimes={0:0,1:3,2:6};
   p.overrides={0:{single:true},1:{single:true},2:{single:true}};p.lyricCutOptions={'0:0':{untilNext:false,endTime:8}};
   for(const layer of ['media','foreground']){p[layer].manualCuts=true;p[layer].cutCount=2;p[layer].timing.lineTimes={0:0,1:5};}
   J.ui.project=p;J.uiApi.syncUI();J.uiApi.replan();
   window.checkTimeline=name=>{
    const ids=['timeline','mediaTimeline','foregroundTimeline','avoidanceTimeline'];
    const draw=()=>{J.ui.need=true;window.drawTestTick(performance.now());return ids.map(id=>{const c=document.getElementById(id);return c.getContext('2d').getImageData(0,0,c.width,c.height).data;});};
    const cached=draw();J.ui.plan={...J.ui.plan};const fresh=draw();
    return {name,equal:cached.every((data,index)=>data.length===fresh[index].length&&data.every((value,pixel)=>value===fresh[index][pixel]))};
   };
  });
  const results=await page.evaluate(()=>{
   const results=[];J.ui.t=1.5;results.push(checkTimeline('initial'));J.ui.t=4.5;results.push(checkTimeline('playhead'));
   J.uiApi.setTimelineZoom(2);results.push(checkTimeline('zoom'));
   J.metrics.clear();results.push(checkTimeline('font metrics'));
   J.ui.audio={duration:20,peaks:Float32Array.from({length:512},(_,i)=>(i%13)/13)};results.push(checkTimeline('waveform'));
   J.ui.plan.duration=30;for(const layer of ['media','foreground','avoidance']){J.ui.plan[layer].duration=30;const last=J.ui.plan[layer].cuts.at(-1);if(last)last.end=30;}
   results.push(checkTimeline('extended duration'));
   J.ui.timelineDrag={mode:'end',layer:'lyrics',moved:true,preview:4,ref:'l:0:0'};results.push(checkTimeline('drag guide'));J.ui.timelineDrag=null;
   J.uiApi.replan();results.push(checkTimeline('replanned lanes'));return results;
  });
  await page.setViewportSize({width:1200,height:800});
  results.push(await page.evaluate(()=>checkTimeline('resize')));
  assert(results.every(result=>result.equal),JSON.stringify(results));assert.deepEqual(errors,[]);
  console.log(`Timeline cache: ${results.length} state changes match a fresh render on all four timelines`);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
