'use strict';
const fs=require('fs'),path=require('path'),http=require('http'),zlib=require('zlib'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'tasks/evidence/AVOID-009/accordion01'),out=path.join(dir,process.env.ACCORDION_REPORT||'nonimpact01.json'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 assert(!fs.existsSync(out));const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),before=require('child_process').execFileSync('git',['show','90909a0:index.html'],{cwd:'/workspace/lyricfx.JIZURA',maxBuffer:16*1024*1024}).toString();assert(before!==html);
 const pins=['index.html',path.relative(root,__filename),'dev/avoidance/layouts-b-fixture.js',...fs.readdirSync(path.join(root,'src')).filter(f=>f.endsWith('.js')).map(f=>'src/'+f),...fs.readdirSync(path.join(__dirname,'layouts-c-editorial-fonts')).filter(f=>/\.(json|ttf|otf)$/.test(f)).map(f=>'dev/avoidance/layouts-c-editorial-fonts/'+f)].map(file=>({file,sha256:sha(fs.readFileSync(path.join(root,file)))}));
 fs.writeFileSync(out.replace('.json','-invocation.json'),JSON.stringify({at:new Date().toISOString(),base:'90909a0',baselineHTML:sha(before),method:'Exact read-only git show90909a0:index.html canonical baseline',pins},null,2));
 const server=http.createServer((req,res)=>{try{res.end(req.url==='/before.html'?before:fs.readFileSync(path.join(root,req.url==='/'?'index.html':req.url)));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;let browser;
 try{
  browser=await require('../browser.cjs').launch({executablePath:'/usr/bin/chromium'});const pages=[await browser.newPage(),await browser.newPage()];
  for(let i=0;i<2;i++){await pages[i].route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());await pages[i].goto(base+(i?'/before.html':''));await pages[i].waitForFunction(()=>J?.ui?.plan);await pages[i].addScriptTag({content:fs.readFileSync(path.join(__dirname,'layouts-b-fixture.js'),'utf8')});}
  const fonts=JSON.parse(fs.readFileSync(path.join(__dirname,'layouts-c-editorial-fonts/manifest.json'))),specs=[
   {layout:'accordion',params:{font:'gothic_black',fold:32,breathe:5,covers:true,plate:'ink',start:1,orient:'v'},W:540,H:960},
   {layout:'accordion',params:{font:'gothic_black',fold:38,breathe:7,covers:false,plate:'ink',start:-1,orient:'h'}},
   {layout:'nameTag',family:'C',params:{variant:'school'}},
   {layout:'magazine',family:'C',params:{variant:'headline'}},
   {layout:'ema',family:'C'},
   {layout:'fisheye',family:'D'},
   {layout:'cube',family:'D'},
   {layout:'cylinder',family:'D',params:{rings:2,band:true,glass:true}},
   {layout:'origami',family:'D',params:{mode:'gate',order:0}},
   {layout:'flipCards',family:'D'}
  ],rows=[];
  for(const spec of specs)for(const control of ['off','on']){if(spec.layout==='accordion'&&control==='on')continue;const values=[];
   for(const p of pages)values.push(await p.evaluate(async({fonts,spec,control})=>{
    const r=await runLayoutsBFixture(J,{W:960,H:540,text:'風の先へ',radius:.2,...spec,control:control==='off'?'off':undefined},{newPath:false,fonts,renderInitial:false,exportDataURL:false}),plan=control==='on'?J.finalizePlacementPlan(r.plan,{[spec.family==='C'?'layoutsC':'layoutsD']:true}):r.plan,frames=[];
    for(const t of [.05,.75,1.5,3.7]){const ctx=r.canvas.getContext('2d');r.renderer.frame(ctx,plan,t,{noHud:true,noPost:true});const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',ctx.getImageData(0,0,r.canvas.width,r.canvas.height).data))).map(x=>x.toString(16).padStart(2,'0')).join('');frames.push({t,hash});}
    let transport=null;if(control==='on'){const cut={...r.plan.cuts[0],fullStagePlacement:true,placementUnits:true,[spec.family==='C'?'placementLayoutsC':'placementLayoutsD']:true},ctx=r.canvas.getContext('2d');ctx.reset();const env=r.renderer.makeEnv(ctx,r.plan,cut,r.plan.style.schemes[0],{pass:'main',t:1.5,realTime:1.5,lt:1.5,ltb:1.5,step:0,scale:1,allowFilter:false}),program=J.placement.record(r.renderer,env);transport={supported:program.measurementSupported,diagnostics:program.diagnostics,kinds:[...new Set(program.events.map(e=>e.kind))],owners:[...new Set(program.events.map(e=>e.owner).filter(Boolean))],gradients:program.events.filter(e=>JSON.stringify(e).includes('placementGradient')).length};}
    r.canvas.width=r.canvas.height=1;return {frames,safety:plan.cuts[0].placementTrajectory?.safety||null,transport};
   },{fonts,spec,control}));
   rows.push({spec,control,after:values[0],canonical:values[1],equal:JSON.stringify(values[0])===JSON.stringify(values[1])});
  }
  const cache=await pages[0].evaluate(async fonts=>{const result=[];for(const layout of ['accordion','cylinder','flipCards']){const params=layout==='accordion'?{font:'gothic_black',fold:32,breathe:5,covers:true,plate:'ink',start:1,orient:'v'}:layout==='cylinder'?{rings:2,band:true,glass:true}:{};const r=await runLayoutsBFixture(J,{layout,W:540,H:960,params},{newPath:false,fonts,renderInitial:false,exportDataURL:false}),original=JSON.stringify(r.plan);J.placement.clearLayoutsCFinalCache();const cold=J.finalizePlacementPlan(r.plan,{layoutsD:true}),coldStats=J.placement.layoutsCFinalCacheStats(),warm=J.finalizePlacementPlan(r.plan,{layoutsD:true}),warmStats=J.placement.layoutsCFinalCacheStats();result.push({layout,equal:JSON.stringify(cold)===JSON.stringify(warm),detached:cold!==warm&&cold.cuts[0]!==warm.cuts[0],frozen:Object.isFrozen(warm)&&Object.isFrozen(warm.cuts[0].placementTrajectory),inputUnchanged:JSON.stringify(r.plan)===original,coldStats,warmStats});}return result;},fonts);
  const failures=[...rows.filter(r=>!r.equal),...cache.filter(r=>!r.equal||!r.detached||!r.frozen||!r.inputUnchanged||r.warmStats.hits<=r.coldStats.hits)];for(const pin of pins)if(sha(fs.readFileSync(path.join(root,pin.file)))!==pin.sha256)failures.push({changed:pin.file});const summary={conditions:rows.length,pixelPairs:rows.length*4,cacheCases:cache.length,failures:failures.length};fs.writeFileSync(out,JSON.stringify({scope:'Exact full canonical90909a0 vs limited accordion composition OFF/other C and D nonimpact; no media or performance assertion',summary,rows,cache,pins},null,2));console.log(summary);assert.equal(failures.length,0);
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
