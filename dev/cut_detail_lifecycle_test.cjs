const assert=require('node:assert/strict'),{launchBrowser,loadApp}=require('./test_helpers.cjs');
(async()=>{
 const browser=await launchBrowser();
 try{for(const locale of ['','en/']){
  const page=await browser.newPage({viewport:{width:1500,height:1000}}),errors=[];page.on('pageerror',error=>errors.push(error.message));await loadApp(page,{locale});
  await page.evaluate(()=>{
   const Real=ResizeObserver,records=[],byObserver=new WeakMap();window.__detailObservers=records;
   window.ResizeObserver=class extends Real{constructor(callback){super(callback);const record={active:true};byObserver.set(this,record);records.push(record);}disconnect(){byObserver.get(this).active=false;return super.disconnect();}};
   const p=J.defaultProject();p.lyrics='[00:00]First line';p.durationOverride=3;p.overrides={0:{single:true}};J.ui.project=p;J.uiApi.syncUI();J.uiApi.replan();
   document.querySelector('#lineList .lyric-ln:not(.ln-title) .cut-details-open').click();
  });
  const count=()=>page.evaluate(()=>window.__detailObservers.filter(record=>record.active).length);
  assert.equal(await count(),1,'one mask canvas observed');
  for(const value of ['center','vcols','center']){
   await page.locator('#cutDetailsDialog [data-detail-field="layout"]').evaluate((select,value)=>{select.value=value;select.dispatchEvent(new Event('change',{bubbles:true}));},value);
   assert.equal(await count(),1,'replacing the form releases its old canvas observer');
   assert.equal(await page.locator('#cutDetailsDialog [data-detail-field="layout"]').inputValue(),value);
  }
  await page.locator('#cutDetailsDialog [data-detail-undo]').click();assert.equal(await count(),1,'history replacement releases its observer');
  await page.locator('#cutDetailsDialog [data-detail-redo]').click();assert.equal(await count(),1);
  await page.evaluate(()=>document.getElementById('cutDetailsDialog').close());await page.waitForFunction(()=>!document.getElementById('cutDetailsDialog'));
  assert.equal(await count(),0,'closing the dialog releases the remaining observer');
  assert.deepEqual(errors,[]);console.log(locale||'ja','cut detail edits, history and close keep at most one canvas observer');await page.close();
 }}finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
