'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'../..'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const target=process.env.JIZURA_D_FLAG_REFLOW_REPORT||'/tmp/avoid009-flag-reflow10.json.gz';assert(!fs.existsSync(target));
 const files=['src/09a_placement.js','src/09g_layoutsC_placement.js','src/09k_layoutsD_placement.js','src/09r_layoutsD_flag.js','src/11p_layoutsD.js','src/11za_layoutsD_transport.js','index.html','en/index.html','dev/avoidance/layouts-a-fixture.js',path.relative(root,__filename)],pins=files.map(p=>({path:p,sha256:sha(fs.readFileSync(path.join(root,p)))}));
 const snap=target+'.inputs';fs.mkdirSync(snap);for(const file of files)fs.writeFileSync(path.join(snap,file.replaceAll('/','__')+'.gz'),zlib.gzipSync(fs.readFileSync(path.join(root,file)),{mtime:0}));
 const font='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',server=http.createServer((q,r)=>{try{r.end(fs.readFileSync(q.url==='/font.otf'?font:path.join(root,q.url==='/'?'index.html':q.url)));}catch{r.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;let browser;
 try{
 browser=await require('../browser.cjs').launch();const page=await browser.newPage(),warnings=[];page.on('console',m=>{if(m.type()==='warning')warnings.push(m.text());});await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());await page.goto(base);await page.waitForFunction(()=>window.J?.ui?.plan);await page.addScriptTag({content:fs.readFileSync(path.join(__dirname,'layouts-a-fixture.js'),'utf8')});
 const result=await page.evaluate(async()=>{
  const rows=[];
  const base={layout:'flag',W:960,H:540,cx:.5,cy:.42,radius:.2,text:'風',params:{mode:'raise',cloth:'accent',trim:'none',tail:'rect',wind:.7,side:1}};
  const specs=[{...base,text:'風の先へ'},{...base,text:'風風風風'},{...base,W:540,H:960,text:'風の先へ'},{...base,explicitScale:.5}];
  for(const spec of specs){
   const r=await runLayoutsAFixture(J,spec,{newPath:false,fontURL:location.origin+'/font.otf'});r.plan.fps=60;const source=JSON.stringify(r.plan),final=J.finalizePlacementPlan(r.plan,{layoutsD:true}),tr=final.cuts[0].placementTrajectory,observations=[],errors=[];
   if(tr)for(const time of [0,.01,.12,.4,.8,1.5,2.5,3.5,3.99,4])try{r.renderer.frame(r.canvas.getContext('2d'),final,time,{noHud:true,noPost:true,placementObservation:o=>observations.push(o)});}catch(e){errors.push({time,code:e.code,message:e.message});}
   rows.push({spec,sourceUnchanged:source===JSON.stringify(r.plan),diagnostics:final.placementFinalization.diagnostics,tr,observations,errors});
  }
  return {rows};
 });
 for(const pin of pins)assert.equal(sha(fs.readFileSync(path.join(root,pin.path))),pin.sha256);const receipt={...result,pins,browser:browser.version(),warnings,font:{path:font,sha256:sha(fs.readFileSync(font)),scope:'Pinned single-face functional render only; full font repertoire/cmap not certified'}};fs.writeFileSync(target,zlib.gzipSync(JSON.stringify(receipt),{mtime:0}));const failures=result.rows.filter(r=>!r.sourceUnchanged||r.errors.length||r.tr?.units.some(u=>u.segments.some(s=>s.status==='safe'&&s.attempts.filter(a=>a.status==='safe').some(a=>!a.quality.physicalAttachmentEstablished||a.quality.poleEndClearance<0))));console.log(JSON.stringify({report:target,rows:result.rows.map(r=>({spec:r.spec,status:r.tr?.safety,diagnostics:r.diagnostics,errors:r.errors,selected:r.tr?.units[0].segments[0].composition,attempts:r.tr?.units[0].segments[0].attempts.length}))}));assert.equal(failures.length,0);
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{const target=process.env.JIZURA_D_FLAG_REFLOW_REPORT||'/tmp/avoid009-flag-reflow10.json.gz';fs.writeFileSync(target+'.failure.json',JSON.stringify({name:e.name,message:e.message,stack:e.stack},null,2)+'\n');console.error(e);process.exitCode=1;});
