const {launchBrowser,tempDirectory,loadApp}=require('./test_helpers.cjs'),path=require('path'),assert=require('assert/strict');
const output=tempDirectory('compact-preview-');
(async()=>{const browser=await launchBrowser();try{for(const lang of ['','en/']){
 const page=await browser.newPage({viewport:{width:1366,height:600}}),errors=[];page.on('pageerror',e=>errors.push(e.message));const url='http://localhost:8765/'+lang;
 await loadApp(page,{locale:lang,origin:'http://localhost:8765'});await page.waitForTimeout(300);
 assert.equal(await page.locator('#app').evaluate(e=>e.classList.contains('compact-ui')),true);let box=await page.locator('#view').boundingBox();assert.ok(Math.min(box.width,box.height)>=269);
 assert.equal(await page.locator('#lyrics').isVisible(),false);await page.locator('#sourceLyrics').click();assert.equal(await page.locator('#lyrics').isVisible(),true);
 await page.locator('#lyrics').fill('Preserved draft');await page.locator('#sourceForeground').click();assert.equal(await page.locator('#mediaPane').isVisible(),true);await page.locator('#sourceMedia').click();assert.equal(await page.evaluate(()=>J.ui.sourceTab),'media');
 await page.locator('#sourceMedia').click();assert.equal(await page.locator('#mediaPane').isVisible(),false);
 await page.locator('#sourceLyrics').click();assert.equal(await page.locator('#lyrics').inputValue(),'Preserved draft');await page.locator('#modePro').click();assert.equal(await page.locator('#lyrics').isVisible(),false);assert.equal(await page.locator('#settingsDrawer').isVisible(),true);await page.locator('#sourceLyrics').click();assert.equal(await page.locator('#settingsDrawer').isVisible(),false);await page.locator('#closeSourceDrawer').click();
 if(!lang)await page.screenshot({path:path.join(output,'compact-laptop.png')});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(300);box=await page.locator('#view').boundingBox();assert.ok(box.width>270&&box.x>=0&&box.x+box.width<=390);
 await page.locator('#sourceLyrics').click();assert.equal(await page.locator('#lyrics').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#lyrics').isVisible(),false);
 await page.setViewportSize({width:1920,height:1080});await page.waitForTimeout(400);assert.equal(await page.locator('#app').evaluate(e=>e.classList.contains('compact-ui')),false);assert.equal(await page.locator('#lyrics').isVisible(),true);
 assert.deepEqual(errors,[]);console.log(lang||'ja','responsive preview passed');await page.close();
}}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
