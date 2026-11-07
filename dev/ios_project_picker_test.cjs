const {launchBrowser,loadApp}=require('./test_helpers.cjs');
const assert=require('assert/strict');
(async()=>{const browser=await launchBrowser();try{
for(const lang of ['','en/'])for(const device of [{name:'iPhone Chrome',ua:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/140 Mobile Safari/604.1',platform:'iPhone',touch:5,ios:true},{name:'iPad desktop mode',ua:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Safari/605.1.15',platform:'MacIntel',touch:5,ios:true},{name:'desktop Mac',ua:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)',platform:'MacIntel',touch:0,ios:false}]){
const page=await browser.newPage({userAgent:device.ua});await page.addInitScript(d=>{Object.defineProperty(navigator,'platform',{get:()=>d.platform});Object.defineProperty(navigator,'maxTouchPoints',{get:()=>d.touch});},device);
await loadApp(page,{locale:lang});
await page.evaluate(()=>J.openEffectFavorites({project:J.ui.project,changed(){},closed(){}}));
for(const sel of ['#fileProject','#fileSettings','.favorite-file'])assert.equal(await page.locator(sel).getAttribute('accept')===null,device.ios);
await page.evaluate(()=>document.querySelector('#effectFavoritesDialog').close());
// iOS can select any document; the reader still checks the project extension.
const bytes=Buffer.from(await page.evaluate(async()=>{const p=J.defaultProject();p.title='Compatibility import';p.lyrics='test';return [...new Uint8Array(await (await J.packProject(p)).arrayBuffer())];}));
await page.locator('#fileProject').setInputFiles({name:'compat.json',mimeType:'application/json',buffer:bytes});await page.waitForFunction(()=>!J.ui.projectBusy&&document.querySelector('#projectLoadingDialog button'));
assert.notEqual(await page.evaluate(()=>J.ui.project.title),'Compatibility import');await page.locator('#projectLoadingDialog button').click();
await page.locator('#fileProject').setInputFiles({name:'compat.lyricfx',mimeType:'application/octet-stream',buffer:bytes});await page.waitForFunction(()=>J.ui.project.title==='Compatibility import'&&!J.ui.projectBusy);
console.log(lang||'ja',device.name,'filters, .lyricfx import and legacy rejection passed');await page.close();
}}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
