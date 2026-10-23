'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'../..'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const target=process.env.JIZURA_D_RASTER_REPORT||'/tmp/avoid009-raster01.json.gz';assert(!fs.existsSync(target));
 const files=['src/09a_placement.js','src/09g_layoutsC_placement.js','src/09k_layoutsD_placement.js','src/09l_layoutsD_fisheye.js','src/11p_layoutsD.js','src/11za_layoutsD_transport.js','index.html','en/index.html','dev/avoidance/layouts-a-fixture.js',path.relative(root,__filename)],pins=files.map(p=>({path:p,sha256:sha(fs.readFileSync(path.join(root,p)))}));
 const snap=target+'.inputs';fs.mkdirSync(snap);for(const file of files)fs.writeFileSync(path.join(snap,file.replaceAll('/','__')+'.gz'),zlib.gzipSync(fs.readFileSync(path.join(root,file)),{mtime:0}));
 const font='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',server=http.createServer((q,r)=>{try{r.end(fs.readFileSync(q.url==='/font.otf'?font:path.join(root,q.url==='/'?'index.html':q.url)));}catch{r.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;let browser;
 try{
 browser=await require('../browser.cjs').launch();const page=await browser.newPage(),warnings=[];page.on('console',m=>{if(m.type()==='warning')warnings.push(m.text());});await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());await page.goto(base);await page.waitForFunction(()=>window.J?.ui?.plan);await page.addScriptTag({content:fs.readFileSync(path.join(__dirname,'layouts-a-fixture.js'),'utf8')});
 const result=await page.evaluate(async()=>{
  const specs=[{W:960,H:540,glass:'none',mode:'sweep',text:'風の先へ'},{W:540,H:960,glass:'lens',mode:'sweep',text:'風の先へ'},{W:540,H:960,glass:'lens',mode:'pingpong',text:'風の先へ'},{W:540,H:960,glass:'none',mode:'sweep',text:'風の先へ夢の向こう'},{W:960,H:540,glass:'none',mode:'pingpong',text:'青空を越えて夢の向こう'},{W:640,H:640,glass:'none',mode:'sweep',text:'風の先へ'}],rows=[];
  const hash=async canvas=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data))).map(v=>v.toString(16).padStart(2,'0')).join('');
  for(const spec of specs){
   const r=await runLayoutsAFixture(J,{layout:'fisheye',W:spec.W,H:spec.H,text:spec.text,cx:.5,cy:.42,radius:.2,params:{glass:spec.glass,mode:spec.mode,amp:.9}},{newPath:false,fontURL:location.origin+'/font.otf'}),plan=J.finalizePlacementPlan(r.plan,{layoutsD:true}),tr=plan.cuts[0].placementTrajectory,segment=tr?.units[0].segments[0],raster=[],parity=[];
   for(const scale of [.1,.25,1,2])for(const time of [.01,.25,.8,1.5,2.2,3.4,3.8,3.99]){
    const pad=Math.ceil(80*scale)+3,width=Math.round(plan.W*scale),height=Math.round(plan.H*scale),canvas=document.createElement('canvas');canvas.width=width+2*pad;canvas.height=height+2*pad;const replay=J.placement.replay;
    try{J.placement.replay=(env,program,offset,...rest)=>replay(env,program,[offset[0]+pad/scale,offset[1]+pad/scale],...rest);r.renderer.frame(canvas.getContext('2d'),plan,time,{scale,noHud:true,noPost:true,noTrans:true,transparent:true});}finally{J.placement.replay=replay;}
    const region=J.resolveAvoidanceAt(plan,time),circle=J.avoidanceCirclePixels(region,plan.W,plan.H),margin=Math.max(2,.005*Math.min(plan.W,plan.H)),pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;let visible=0,outside=0,conflict=0,marginConflict=0;
    for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(pixels[(y*canvas.width+x)*4+3]>=1){visible++;if(x<pad||x>=pad+width||y<pad||y>=pad+height)outside++;const d2=((x+.5-pad)/scale-circle.cx)**2+((y+.5-pad)/scale-circle.cy)**2;if(d2<=circle.r**2)conflict++;if(d2<=(circle.r+margin)**2)marginConflict++;}
    raster.push({time,scale,visible,outside,conflict,marginConflict,sha256:await hash(canvas)});
   }
   // Same finalized native source + selected recipe, camera and clocks. Both
   // renders intentionally omit the chosen offset for zero-offset transport parity.
   for(const camera of ['push','panL','panR','dutch'])for(const time of [.1,1.5,3.8]){
    const p=J.finalizePlacementPlan(r.plan,{layoutsD:true}); // no altered camera on finalized plan
    const source=r.plan.cuts[0].cam;r.plan.cuts[0].cam=camera;const q=J.finalizePlacementPlan(r.plan,{layoutsD:true});r.plan.cuts[0].cam=source;
    const cv=[0,1].map(()=>{const c=document.createElement('canvas');c.width=q.W;c.height=q.H;return c;}),render=J.placement.render,replay=J.placement.replay;
    try{J.placement.render=(renderer,env)=>{const s=env.cut.placementTrajectory.units[0].segments.find(s=>s.start<=env.realTime&&env.realTime<s.end),cut={...env.cut,layoutDRecipe:s?.composition};return renderer.drawCut(renderer.makeEnv(env.ctx,env.plan,cut,env.sc,{...env,cut}));};r.renderer.frame(cv[0].getContext('2d'),q,time,{noHud:true,noPost:true,noTrans:true,transparent:true});}finally{J.placement.render=render;}
    try{J.placement.replay=(env,program,offset,...rest)=>replay(env,program,[0,0],...rest);r.renderer.frame(cv[1].getContext('2d'),q,time,{noHud:true,noPost:true,noTrans:true,transparent:true});}finally{J.placement.replay=replay;}
    const before=await hash(cv[0]),after=await hash(cv[1]);parity.push({camera,time,before,after,equal:before===after});
   }
   rows.push({spec,safety:tr?.safety,composition:segment?.composition,sourceProof:tr?.sourceProof,raster,parity});
  }
  return {rows,scope:'Actual primary source alpha>=1/255 on padded transparent output, circle/stage samples and camera-level zero-offset transport parity. Geometry proof remains separate; this is not visual/font-repertoire acceptance.'};
 });
 for(const pin of pins)assert.equal(sha(fs.readFileSync(path.join(root,pin.path))),pin.sha256);const receipt={...result,pins,browser:browser.version(),warnings,font:{path:font,sha256:sha(fs.readFileSync(font)),scope:'Pinned single-face functional render only; full font repertoire/cmap not certified'}};fs.writeFileSync(target,zlib.gzipSync(JSON.stringify(receipt),{mtime:0}));const failures=result.rows.filter(r=>r.parity.some(p=>!p.equal)||r.safety==='certified-bounded-adapter'&&r.raster.some(p=>p.outside||p.conflict||p.marginConflict));console.log(JSON.stringify({rows:result.rows.length,safe:result.rows.filter(r=>r.safety==='certified-bounded-adapter').length,raster:result.rows.reduce((n,r)=>n+r.raster.length,0),parity:result.rows.reduce((n,r)=>n+r.parity.length,0),failures:failures.map(r=>({spec:r.spec,safety:r.safety,raster:r.raster.filter(p=>p.outside||p.conflict||p.marginConflict),parity:r.parity.filter(p=>!p.equal)})),warnings,report:target}));assert.equal(failures.length,0);
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{const target=process.env.JIZURA_D_RASTER_REPORT||'/tmp/avoid009-raster01.json.gz';fs.writeFileSync(target+'.failure.json',JSON.stringify({name:e.name,message:e.message,stack:e.stack},null,2)+'\n');console.error(e);process.exitCode=1;});
