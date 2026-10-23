'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'../..'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const target=process.env.JIZURA_D_FLIPCARDS_PARITY_REPORT||'/tmp/avoid009-flipcards-parity01.json.gz';assert(!fs.existsSync(target));
 const files=['src/09a_placement.js','src/09g_layoutsC_placement.js','src/09k_layoutsD_placement.js','src/09p_layoutsD_flipCards.js','src/11p_layoutsD.js','src/11za_layoutsD_transport.js','index.html','en/index.html','dev/avoidance/layouts-a-fixture.js',path.relative(root,__filename)],pins=files.map(p=>({path:p,sha256:sha(fs.readFileSync(path.join(root,p)))}));
 const snap=target+'.inputs';fs.mkdirSync(snap);for(const file of files)fs.writeFileSync(path.join(snap,file.replaceAll('/','__')+'.gz'),zlib.gzipSync(fs.readFileSync(path.join(root,file)),{mtime:0}));
 const font='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',server=http.createServer((q,r)=>{try{const b=fs.readFileSync(q.url==='/font.otf'?font:path.join(root,q.url==='/'||q.url==='/before'?'index.html':q.url));r.end(q.url==='/before'?b.toString().replace(fs.readFileSync(path.join(root,'tasks/evidence/AVOID-009/flipcards-registration-current01.txt'),'utf8'),fs.readFileSync(path.join(root,'tasks/evidence/AVOID-009/flipcards-registration-before01.txt'),'utf8')):b);}catch{r.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;let browser;
 try{
 browser=await require('../browser.cjs').launch();const page=await browser.newPage(),warnings=[];page.on('console',m=>{if(m.type()==='warning')warnings.push(m.text());});await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());await page.goto(base);await page.waitForFunction(()=>window.J?.ui?.plan);await page.addScriptTag({content:fs.readFileSync(path.join(__dirname,'layouts-a-fixture.js'),'utf8')});
 const exercise=async()=>{
  const rows=[];const hash=async ctx=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height).data)),b=>b.toString(16).padStart(2,'0')).join('');
  for(const [W,H]of [[960,540],[540,960]])for(const order of ['ltr','random'])for(const table of [false,true]){
   const spec={layout:'flipCards',W,H,cx:.5,cy:.42,text:'風の先へ',params:{order,back:'accent',table,peek:true,idx:true}},r=await runLayoutsAFixture(J,spec,{newPath:false,fontURL:location.origin+'/font.otf'});r.plan.fps=60;
   const pixels=[],nativeD=[];
   for(const t of [.01,.3-1e-10,.3,.3+1e-10,.5,1.5,2.5,3.9]){r.renderer.frame(r.canvas.getContext('2d'),r.plan,t,{noHud:true,noPost:true});pixels.push({t,sha256:await hash(r.canvas.getContext('2d'))});}
   for(const pass of ['main','A','B'])for(const t of [.3-1e-10,.3,.3+1e-10,.5,1.5,2.5,3.9]){
    const ctx=r.canvas.getContext('2d'),c=r.plan.cuts[0],sc=c.palette||r.plan.style.schemes[c.scheme%r.plan.style.schemes.length],options={pass,passColor:'#ff00ff',t,realTime:t,lt:t,ltb:t,step:0,scale:1,allowFilter:false};
    ctx.reset();const off=r.renderer.makeEnv(ctx,r.plan,c,sc,options);r.renderer.drawCut(off);const offSHA=await hash(ctx);
    ctx.reset();const cut={...c,placementLayoutsD:true,placementUnits:true},on=r.renderer.makeEnv(ctx,r.plan,cut,sc,options),program=J.placement.record(r.renderer,on);if(program.measurementSupported)J.placement.replay(on,program,[0,0]);nativeD.push({pass,t,measurementSupported:program.measurementSupported,diagnostics:program.diagnostics,offSHA,onSHA:await hash(ctx),events:program.events.length});
   }
   const counts={measure:0,fit:0},measure=J.measure,fit=J.fitSize;J.measure=(...args)=>(counts.measure++,measure(...args));J.fitSize=(...args)=>(counts.fit++,fit(...args));for(let i=0;i<120;i++)r.renderer.frame(r.canvas.getContext('2d'),r.plan,i/30,{noHud:true,noPost:true});J.measure=measure;J.fitSize=fit;
   rows.push({spec,pixels,nativeD,counts});
  }
  return {rows};
 };const result=await page.evaluate(exercise);const p2=await browser.newPage();await p2.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());await p2.goto(base+'/before');await p2.waitForFunction(()=>window.J?.ui?.plan);await p2.addScriptTag({content:fs.readFileSync(path.join(__dirname,'layouts-a-fixture.js'),'utf8')});const before=await p2.evaluate(exercise);
 for(const pin of pins)assert.equal(sha(fs.readFileSync(path.join(root,pin.path))),pin.sha256);const receipt={...result,before,pins,browser:browser.version(),warnings,font:{path:font,sha256:sha(fs.readFileSync(font)),scope:'Pinned single-face functional render only; full font repertoire/cmap not certified'}};fs.writeFileSync(target,zlib.gzipSync(JSON.stringify(receipt),{mtime:0}));const offParity=result.rows.every((r,i)=>JSON.stringify(r.pixels)===JSON.stringify(before.rows[i].pixels)&&JSON.stringify(r.counts)===JSON.stringify(before.rows[i].counts)),nativeFailures=result.rows.flatMap(r=>r.nativeD.filter(x=>!x.measurementSupported||x.offSHA!==x.onSHA).map(x=>({spec:r.spec,...x})));console.log(JSON.stringify({report:target,rows:result.rows.length,offParity,nativeDFrames:result.rows.reduce((n,r)=>n+r.nativeD.length,0),nativeFailures:nativeFailures.slice(0,6)}));assert(offParity);assert.equal(nativeFailures.length,0);
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{const target=process.env.JIZURA_D_FLIPCARDS_PARITY_REPORT||'/tmp/avoid009-flipcards-parity01.json.gz';fs.writeFileSync(target+'.failure.json',JSON.stringify({name:e.name,message:e.message,stack:e.stack},null,2)+'\n');console.error(e);process.exitCode=1;});
