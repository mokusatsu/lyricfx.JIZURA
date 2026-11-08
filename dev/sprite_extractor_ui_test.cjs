const assert=require('node:assert/strict'),{launchBrowser,loadApp}=require('./test_helpers.cjs');
(async()=>{
 const browser=await launchBrowser();
 try{for(const locale of ['','en/']){
  const page=await browser.newPage({viewport:{width:1500,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await loadApp(page,{locale});
  await page.evaluate(()=>{const p=J.defaultProject();p.lyrics='';p.durationOverride=4;J.uiApi.replaceProject(p,null,null,new Map(),true);SpriteExtractor.open('foreground');});
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="512" height="384"><rect width="512" height="384" fill="#00ff00"/><rect x="20" y="20" width="80" height="120" fill="#ff3050"/><rect x="300" y="20" width="80" height="120" fill="#2040e0"/><rect x="20" y="220" width="80" height="120" fill="#c8b020"/><rect x="300" y="220" width="80" height="120" fill="#a030b0"/></svg>';
  await page.locator('#seFileInput').setInputFiles({name:'poses.svg',mimeType:'image/svg+xml',buffer:Buffer.from(svg)});
  await page.waitForFunction(()=>SpriteExtractor.rects.length===4);
  assert.deepEqual(await page.evaluate(()=>SpriteExtractor.rects.map(r=>[r.x,r.y,r.w,r.h,r.checked])),[[16,16,88,128,true],[296,16,88,128,true],[16,216,88,128,true],[296,216,88,128,true]]);
  assert.equal(await page.locator('#seCount').textContent(),'4');assert.equal(await page.locator('#seKeyColor').inputValue(),'#00ff00');
  await page.locator('#seBtnRegister').click();await page.waitForFunction(()=>J.ui.project.foreground.items.length===4&&!document.getElementById('spriteExtractDlg').open);
  const pixels=()=>page.evaluate(()=>J.ui.project.foreground.items.map(item=>{
   const source=J.mediaAssets.get(item.id).element,c=document.createElement('canvas');c.width=item.width;c.height=item.height;const x=c.getContext('2d');x.drawImage(source,0,0);
   return {name:item.name,size:[c.width,c.height],corner:[...x.getImageData(0,0,1,1).data],body:[...x.getImageData(5,5,1,1).data]};
  }));
  const expected=[[255,48,80,255],[32,64,224,255],[200,176,32,255],[160,48,176,255]].map((body,i)=>({name:`poses_${String(i+1).padStart(3,'0')}.png`,size:[88,128],corner:[0,0,0,0],body}));
  assert.deepEqual(await pixels(),expected);assert.equal(await page.evaluate(()=>J.ui.project.media.items.length),0);
  await page.locator('#btnUndo').click();assert.equal(await page.evaluate(()=>J.ui.project.foreground.items.length),0);
  await page.locator('#btnRedo').click();assert.deepEqual(await pixels(),expected);
  assert.deepEqual(errors,[]);console.log(locale||'ja','sprite extraction: four ordered crops, transparent padding, source colors, registration and undo/redo passed');await page.close();
 }}finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
