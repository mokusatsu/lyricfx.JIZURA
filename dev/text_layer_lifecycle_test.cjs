const assert=require('node:assert/strict'),{launchBrowser,loadApp}=require('./test_helpers.cjs');
async function drawLayers(names){
 const create=document.createElement,layers=[];let drawing=false;
 document.createElement=function(name,...args){const element=create.call(this,name,...args);if(drawing&&name==='canvas')layers.push(element);return element;};
 try{
  const rows=[];
  for(const name of names){
   const canvas=document.createElement('canvas');canvas.width=960;canvas.height=540;
   const ctx=canvas.getContext('2d',{alpha:false});ctx.fillStyle='#111';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.scale(.5,.5);
   drawing=true;
   try{J.drawItem({ctx,pass:'main',scale:.5,allowFilter:true},{text:'夜'.repeat(name==='small'?4:24),font:'gothic_black',size:name==='small'?72:180,x:960,y:540,vertical:name==='tall',blur:8,color:'#fff'});}finally{drawing=false;}
   const bytes=ctx.getImageData(0,0,canvas.width,canvas.height).data;
   const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
   rows.push({name,hash,area:Math.max(...layers.map(layer=>layer.width*layer.height)),limit:canvas.width*canvas.height*1.6});
  }
  return rows;
 }finally{document.createElement=create;}
}
(async()=>{
 const browser=await launchBrowser();
 try{
  const page=await browser.newPage();
  await page.addInitScript(()=>{const raf=requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>fn.name==='tick'?0:raf(fn);window.requestIdleCallback=()=>0;});
  await loadApp(page);
  const sequence=await page.evaluate(drawLayers,['wide','tall','small','wide','tall']);
  assert(sequence.every(row=>row.area>0&&row.area<=row.limit),'cached layer must respect the output area budget');
  for(const name of ['wide','tall','small']){
   await page.reload();await page.waitForFunction(()=>!!window.J?.ui?.plan);
   const [fresh]=await page.evaluate(drawLayers,[name]);
   assert(sequence.filter(row=>row.name===name).every(row=>row.hash===fresh.hash),name+' pixels equal a fresh workspace');
  }
  console.log('Text layer: mixed aspect ratios stay within the area budget and match fresh workspace pixels');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
