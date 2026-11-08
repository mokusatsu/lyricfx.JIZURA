const assert=require('node:assert/strict'),{launchBrowser,loadApp}=require('./test_helpers.cjs');
(async()=>{
 const browser=await launchBrowser();
 try{for(const locale of ['','en/']){
  const page=await browser.newPage({viewport:{width:1500,height:1000}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));await loadApp(page,{locale});
  await page.evaluate(()=>{const p=J.defaultProject();p.title='Title';p.lyrics='[00:00]First\n[00:02]Second\n[00:04]Third';p.durationOverride=6;p.overrides={0:{single:true},1:{single:true},2:{single:true}};J.ui.project=p;J.uiApi.syncUI();J.uiApi.replan();});
  const selector='#lineList li.lyric-ln:not(.ln-title) > .meta > .tools > select',selects=page.locator(selector);
  assert.equal(await selects.count(),3);
  const expected=await page.evaluate(()=>['',...J.LAYOUT_ORDER]);
  for(let i=0;i<3;i++)assert.deepEqual(await selects.nth(i).locator('option').evaluateAll(options=>options.map(option=>option.value)),expected);
  assert.equal(await selects.nth(1).getAttribute('aria-label'),locale?'Choose layout':'レイアウト指定');
  await selects.nth(1).evaluate(select=>{window.previousLayoutSelect=select;window.previousLayoutRow=select.closest('li');});
  await page.evaluate(()=>J.uiApi.replan());
  assert(await selects.nth(1).evaluate(select=>select===window.previousLayoutSelect),'unchanged choices reuse the selector');
  // The first reconstruction also restores the newly captured automatic effects.
  await selects.nth(1).evaluate(select=>{window.previousLayoutRow=select.closest('li');});
  await page.evaluate(()=>J.uiApi.replan());
  assert(await selects.nth(1).evaluate(select=>select.closest('li')===window.previousLayoutRow),'unchanged rows retain their controls');
  await page.evaluate(()=>{window.lyricListResets=0;new MutationObserver(records=>{if(records.some(record=>record.removedNodes.length||record.addedNodes.length))window.lyricListResets++;}).observe(document.getElementById('lineList'),{childList:true});});
  await selects.nth(1).selectOption('center');
  assert.equal(await page.evaluate(()=>window.lyricListResets),1,'one change triggers one update');
  assert.equal(await page.evaluate(()=>J.ui.project.overrides[1].layout),'center');
  assert.equal(await selects.nth(1).inputValue(),'center');assert.equal(await selects.nth(0).inputValue(),'');
  await selects.nth(1).selectOption('vcols');
  assert.equal(await page.evaluate(()=>J.ui.plan.cuts.find(c=>c.line===1).layout),'vcols');
  assert.equal(await selects.nth(1).inputValue(),'vcols');
  await selects.nth(1).selectOption('');
  assert.equal(await page.evaluate(()=>J.ui.project.overrides[1].layout),undefined);
  assert.equal(await page.evaluate(()=>window.lyricListResets),3,'reused selectors do not accumulate handlers');
  const firstTime=page.locator('#lineList li:not(.ln-title) .time').first();
  await firstTime.fill('');await firstTime.dispatchEvent('change');
  assert.equal(await firstTime.inputValue(),'0.00','an invalid manual time restores the resolved automatic value');
  await page.evaluate(()=>{J.ui.project.lyricCutOptions['0:0'].opacity=100;J.uiApi.replan();});
  const firstOpacity=page.locator('#lineList .lyric-cut-opacity').first();
  await firstOpacity.fill('200');await firstOpacity.dispatchEvent('change');
  assert.equal(await firstOpacity.inputValue(),'100','clamping also restores the input when the saved value was already 100');
  await page.evaluate(()=>{J.LAYOUTS.__listProbe={...J.LAYOUTS.center,name:'Added layout'};J.LAYOUT_ORDER.push('__listProbe');J.LAYOUTS.center.name='Renamed layout';J.uiApi.replan();});
  for(let i=0;i<3;i++){
   assert.equal(await selects.nth(i).locator('option[value="__listProbe"]').textContent(),'Added layout');
   assert.equal(await selects.nth(i).locator('option[value="center"]').textContent(),'Renamed layout');
  }
  assert(await selects.nth(1).evaluate(select=>select!==window.previousLayoutSelect),'changed definitions rebuild the choices');
  await selects.nth(2).evaluate(select=>{window.removedLayoutSelect=new WeakRef(select);});
  await page.evaluate(()=>{J.ui.project.lyrics='[00:00]Second\n[00:02]Third';J.uiApi.replan();});
  assert.equal(await selects.count(),2);await selects.nth(1).selectOption('vcols');
  assert.equal(await page.evaluate(()=>J.ui.project.overrides[1].layout),'vcols','selection still targets its row after removal');
  const cdp=await page.context().newCDPSession(page);await cdp.send('HeapProfiler.enable');await cdp.send('HeapProfiler.collectGarbage');
  assert.equal(await page.evaluate(()=>!!window.removedLayoutSelect.deref()),false,'removed rows release their selectors');await cdp.send('HeapProfiler.disable');
  assert.deepEqual(errors,[]);console.log(locale||'ja','lyric layout choices, independent selection, automatic reset and updated definitions passed');await page.close();
 }}finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
