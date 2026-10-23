'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'../..'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const target=process.env.JIZURA_D_ORIGAMI_REPORT||'/tmp/avoid009-gate-wide-functional01.json.gz';assert(!fs.existsSync(target));
 const files=['src/09a_placement.js','src/09g_layoutsC_placement.js','src/09k_layoutsD_placement.js','src/09n_layoutsD_origami.js','src/11p_layoutsD.js','src/11za_layoutsD_transport.js','index.html','en/index.html','dev/avoidance/layouts-a-fixture.js',path.relative(root,__filename)],pins=files.map(p=>({path:p,sha256:sha(fs.readFileSync(path.join(root,p)))}));
 const snap=target+'.inputs';fs.mkdirSync(snap);for(const file of files)fs.writeFileSync(path.join(snap,file.replaceAll('/','__')+'.gz'),zlib.gzipSync(fs.readFileSync(path.join(root,file)),{mtime:0}));
 const font='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',server=http.createServer((q,r)=>{try{const b=fs.readFileSync(q.url==='/font.otf'?font:path.join(root,q.url==='/'||q.url==='/before'?'index.html':q.url));r.end(q.url==='/before'?b.toString().replace(fs.readFileSync(path.join(root,'src/09n_layoutsD_origami.js'),'utf8'),fs.readFileSync(path.join(root,'tasks/evidence/AVOID-009/gate-native-before09n.js'),'utf8')):b);}catch{r.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;let browser;
 try{
 browser=await require('../browser.cjs').launch();const page=await browser.newPage(),warnings=[];page.on('console',m=>{if(m.type()==='warning')warnings.push(m.text());});await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());await page.goto(base);await page.waitForFunction(()=>window.J?.ui?.plan);await page.addScriptTag({content:fs.readFileSync(path.join(__dirname,'layouts-a-fixture.js'),'utf8')});
 const exercise=async()=>{
  const rows=[],specs=[];
  const common={layout:'origami',W:960,H:540,cx:.5,cy:.42,radius:.2,text:'ひらく紙に言葉を残して',params:{mode:'gate',order:2}};
  specs.push(common);
  for(const [W,H]of [[960,540],[540,960],[640,640]])for(const text of ['風','風の先へ','ひらく紙に言葉を残して','十四文字の長い言葉を紙に残す'])for(const radius of [.02,.2,.45])specs.push({...common,W,H,text,radius});
  for(const [cx,cy]of [[.1,.1],[.9,.9],[.5,.8]])for(const radius of [.2,.35])specs.push({...common,cx,cy,radius});
  for(const camera of ['panL','panR','dutch'])specs.push({...common,camera,ghost:true});
  specs.push({...common,params:{mode:'blintz',order:2}}, {...common,explicitScale:1.3}, {...common,lyricSize:100}, {...common,control:'manual'}, {...common,control:'lock'});
  for(const [i,spec]of specs.entries()){
   const r=await runLayoutsAFixture(J,spec,{newPath:false,fontURL:location.origin+'/font.otf'});r.plan.fps=60;const source=JSON.stringify(r.plan),final=J.finalizePlacementPlan(r.plan,{layoutsD:true}),tr=final.cuts[0].placementTrajectory,observations=[],errors=[];
   const clocks=i===0?Array.from({length:240},(_,f)=>f/60):[0,.01,.12,.45,.5,1.5,3.5,3.99,4];
   for(const time of clocks)try{r.renderer.frame(r.canvas.getContext('2d'),final,time,{noHud:true,noPost:true,placementObservation:o=>observations.push(o)});}catch(e){errors.push({time,code:e.code,message:e.message});}
   let geometry=null;if(tr){const c={...final.cuts[0],layoutDRecipe:tr.units[0].segments[0].composition},A=J.placement,ctx=A.measurementContext();ctx.reset();const env=r.renderer.makeEnv(ctx,final,c,c.palette||final.style.schemes[c.scheme%final.style.schemes.length],{pass:'main',t:1.5,realTime:1.5,lt:1.5,ltb:1.5,step:0,scale:1,allowFilter:false,placementEnvelope:true});geometry=A.record(r.renderer,env).nativeDGeometry;}
   const legacy=J.finalizePlacementPlan(final,{}),freshLegacy=J.finalizePlacementPlan(r.plan,{});rows.push({spec,sourceUnchanged:source===JSON.stringify(r.plan),diagnostics:final.placementFinalization.diagnostics,tr,geometry,observations,errors,idempotent:J.finalizePlacementPlan(final,{layoutsD:true})===final,legacyEqual:JSON.stringify(legacy)===JSON.stringify(freshLegacy)});
  }
  const pixels=[];
  for(const mode of ['gate','blintz'])for(const [W,H]of [[960,540],[540,960]]){
   const r=await runLayoutsAFixture(J,{...common,W,H,params:{mode,order:2}},{newPath:false,fontURL:location.origin+'/font.otf'});
   for(const t of [0,.12,.5,1.5,3.9,4]){r.renderer.frame(r.canvas.getContext('2d'),r.plan,t,{noHud:true,noPost:true});const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',r.canvas.getContext('2d').getImageData(0,0,W,H).data));pixels.push({mode,W,H,t,sha256:Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')});}
  }
  return {rows,pixels};
 };const result=await page.evaluate(exercise);const beforePage=await browser.newPage();await beforePage.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());await beforePage.goto(base+'/before');await beforePage.waitForFunction(()=>window.J?.ui?.plan);await beforePage.addScriptTag({content:fs.readFileSync(path.join(__dirname,'layouts-a-fixture.js'),'utf8')});const before=await beforePage.evaluate(exercise);
 for(const pin of pins)assert.equal(sha(fs.readFileSync(path.join(root,pin.path))),pin.sha256);const receipt={...result,before,pins,browser:browser.version(),warnings,font:{path:font,sha256:sha(fs.readFileSync(font)),scope:'Pinned single-face functional render only; full font repertoire/cmap not certified'}};fs.writeFileSync(target,zlib.gzipSync(JSON.stringify(receipt),{mtime:0}));const failures=result.rows.filter(r=>!r.sourceUnchanged||r.errors.length||!r.idempotent||!r.legacyEqual);assert.deepEqual(result.pixels,before.pixels,'OFF pixel parity');const regressions=result.rows.filter((r,i)=>before.rows[i].tr?.safety==='certified-bounded-adapter'&&r.tr?.safety!=='certified-bounded-adapter');console.log(JSON.stringify({report:target,rows:result.rows.length,failures:failures.map(r=>({spec:r.spec,errors:r.errors})),safeRegression:regressions.map(r=>r.spec),beforeStates:before.rows.reduce((a,r)=>(a[r.tr?.safety||'unsupported']=(a[r.tr?.safety||'unsupported']||0)+1,a),{}),afterStates:result.rows.reduce((a,r)=>(a[r.tr?.safety||'unsupported']=(a[r.tr?.safety||'unsupported']||0)+1,a),{}),selected:{composition:result.rows[0].tr?.units[0].segments[0].composition,g:result.rows[0].geometry,offset:result.rows[0].tr?.units[0].segments[0].from},offPixels:result.pixels.length}));assert.equal(failures.length,0);assert.equal(regressions.length,0);assert(result.rows[0].geometry.sw>=1.2*result.rows[0].geometry.sh);
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{const target=process.env.JIZURA_D_ORIGAMI_REPORT||'/tmp/avoid009-gate-wide-functional01.json.gz';fs.writeFileSync(target+'.failure.json',JSON.stringify({name:e.name,message:e.message,stack:e.stack},null,2)+'\n');console.error(e);process.exitCode=1;});
