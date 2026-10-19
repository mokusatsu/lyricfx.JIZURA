/* AVOID-006 native A26 matrix: certified, insufficient and unsupported remain distinct. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const crypto=require('node:crypto'),root=path.resolve(__dirname,'../..'),oracle=require('./oracle.cjs');
(async()=>{
 const compiled=fs.readFileSync(path.join(root,'index.html')),fixtureSource=fs.readFileSync(path.join(__dirname,'layouts-a-fixture.js'),'utf8'),compiledSHA256=crypto.createHash('sha256').update(compiled).digest('hex'),fixtureSHA256=crypto.createHash('sha256').update(fixtureSource).digest('hex');
 const server=http.createServer((req,res)=>{try{const file=req.url==='/font.otf'?'/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc':path.join(root,req.url==='/'?'index.html':req.url.split('?')[0]);res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.js')?'text/javascript':'application/octet-stream');res.end(file===path.join(root,'index.html')?compiled:fs.readFileSync(file));}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port,browser=await require('../browser.cjs').launch();
 try{
  const page=await browser.newPage();await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());await page.goto(base);await page.waitForFunction(()=>J?.ui?.plan);await page.addScriptTag({content:fixtureSource});
  const rows=[];let polygons=0;
  for(const spec of Object.values(require('./layouts-a-anchors.json'))){
   const row=await page.evaluate(async spec=>{const r=await runLayoutsAFixture(J,spec,{fontURL:location.origin+'/font.otf'}),canvas=document.createElement('canvas'),frames=[];for(const scale of [.1,.5,2,4])for(const time of [.001,.07,.31,.77,1.91,3.49,3.93,3.999]){canvas.width=Math.round(r.plan.W*scale);canvas.height=Math.round(r.plan.H*scale);const observations=[];try{r.renderer.frame(canvas.getContext('2d'),r.plan,time,{scale,noHud:true,noPost:true,placementObservation:o=>observations.push(o)});frames.push({scale,time,observations});}catch(e){frames.push({scale,time,error:{code:e.code,message:e.message}});}}return {spec,frames};},spec);
   const circle={cx:spec.W*spec.cx,cy:spec.H*spec.cy,r:Math.min(spec.W,spec.H)*spec.radius},margin=Math.max(2,.005*Math.min(spec.W,spec.H));
   for(const frame of row.frames){assert.ok(!frame.error,JSON.stringify({layout:spec.layout,...frame}));assert.ok(frame.observations.length);for(const observation of frame.observations){assert.equal(observation.envelopeCovered,true,spec.layout+' full primitive containment');assert.equal(observation.safety,'safe',spec.layout+' actual scaled draw');for(const p of observation.polygons){polygons++;assert.equal(oracle.polygonClear(circle,p,margin),true,'independent scaled actual polygon '+JSON.stringify({layout:spec.layout,scale:frame.scale,time:frame.time}));}}}
   rows.push({spec,frames:row.frames.length,polygons:row.frames.reduce((n,f)=>n+f.observations.reduce((n,o)=>n+o.polygons.length,0),0)});
  }
  console.log(JSON.stringify({passed:true,layouts:rows.length,frames:rows.reduce((n,r)=>n+r.frames,0),polygons,rows,compiledSHA256,fixtureSHA256}));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
