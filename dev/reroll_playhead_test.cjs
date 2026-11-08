const {launchBrowser,loadApp}=require('./test_helpers.cjs');
const assert=require('node:assert/strict');
const {proMode,openSource,timelineAction}=require('./ui_helpers.cjs');
(async()=>{
  const browser=await launchBrowser();
  try { for(const locale of ['', 'en/']) {
    const page=await browser.newPage({viewport:{width:1500,height:1100}}), errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await loadApp(page,{locale,origin:'http://127.0.0.1:8765'});await proMode(page);
    await page.evaluate(()=>{
      const p=J.defaultProject();p.lyrics='[00:00]First line\n[00:04]Second line';p.durationOverride=8;
      for(const layer of ['foreground','media'])Object.assign(p[layer],{manualCuts:true,cutCount:2,timing:{lineTimes:{0:0,1:4}},cutOverrides:{0:{technique:'pushIn'},1:{technique:'beatPulse'}}});
      J.ui.project=p;J.uiApi.syncUI();J.uiApi.replan();
    });
    for(const layer of ['lyrics','foreground','media']) {
      for(const action of ['dice','disableReroll']) {
        await page.evaluate(()=>J.uiApi.seek(6.25));
        const seed=await page.evaluate(layer=>(layer==='lyrics'?J.ui.plan.lines:J.ui.plan[layer].cuts)[0].seed,layer);
        await timelineAction(page,`[data-layer="${layer}"][data-index="0"]`,action);
        assert.equal(await page.evaluate(()=>J.ui.t),6.25,`${layer} ${action} preserves playhead outside target`);
        assert.notEqual(await page.evaluate(layer=>(layer==='lyrics'?J.ui.plan.lines:J.ui.plan[layer].cuts)[0].seed,layer),seed);
      }
      await openSource(page,layer);
      await page.evaluate(()=>J.uiApi.seek(2.25));
      await page.locator(layer==='lyrics'?'#lineList .dice':'#mediaLineList .dice').first().click();
      assert.equal(await page.evaluate(()=>J.ui.t),2.25,`${layer} list reroll preserves playhead inside target`);
    }
    assert.deepEqual(errors,[]);console.log(locale||'ja','reroll and disable-reroll preserve playhead across all layers');await page.close();
  }} finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
