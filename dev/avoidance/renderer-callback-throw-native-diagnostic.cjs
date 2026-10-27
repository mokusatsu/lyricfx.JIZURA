/* Native Canvas diagnosis only: injected drawCut exception; no product fix,
 * adapter qualification, images, network server, or Canvas method replacement. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),out=process.argv[2];
assert(out,'Usage: node diagnostic.cjs <fresh-report.json>');assert(!fs.existsSync(out),'Report must be fresh');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const files=['index.html','src/09_render.js',path.relative(root,__filename),...fs.readdirSync(path.join(root,'src')).filter(n=>n.endsWith('.js')).map(n=>'src/'+n)];
const pins=[...new Set(files)].map(file=>({file,sha256:hash(fs.readFileSync(path.join(root,file)))}));
const rendererSource=fs.readFileSync(path.join(root,'src/09_render.js'),'utf8');
assert.equal(fs.readFileSync(path.join(root,'index.html'),'utf8').split(rendererSource).length-1,1,'work renderer source occurs once, byte-for-byte, in work HTML');
const report={started:new Date().toISOString(),scope:'Injected instance drawCut callback, native Canvas only; known restore omission characterization, NOT product pass or naturally occurring throw; no adapter69 execution',pins};
(async()=>{let browser;try{
 browser=await require('../browser.cjs').launch();report.browser=browser.version();
 const page=await browser.newPage();const blocked=[];const url='http://127.0.0.1:8765/__local_throw_diagnostic__';
 await page.route('**/*',r=>r.request().url()===url?r.fulfill({contentType:'text/html',body:fs.readFileSync(path.join(root,'index.html'))}):(blocked.push(r.request().url()),r.abort()));
 await page.goto(url);await page.waitForFunction(()=>window.J?.Renderer&&J.ui?.plan);
 report.rows=await page.evaluate(()=>{
  const rows=[],snapshot=x=>{const m=x.getTransform();return {matrix:[m.a,m.b,m.c,m.d,m.e,m.f],alpha:x.globalAlpha,blend:x.globalCompositeOperation};};
  // Probe clip by a solid fill and count alpha, never encode or retrieve an image.
  // save/restore confines probe state changes; the frame/callback draw no pixels.
  const clipPixels=x=>{x.save();try{x.setTransform(1,0,0,1,0,0);x.globalAlpha=1;x.globalCompositeOperation='copy';x.fillStyle='#fff';x.fillRect(0,0,64,48);const d=x.getImageData(0,0,64,48).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;return n;}finally{x.restore();}};
  for(const layer of [false,true])for(const ownSave of [false,true])for(const throws of [false,true]){
   const cv=document.createElement('canvas');cv.width=64;cv.height=48;const ctx=cv.getContext('2d');ctx.translate(3,5);ctx.globalAlpha=.625;const initial=snapshot(ctx);
   const project=J.defaultProject();project.lyrics='[00:00]Diagnostic';project.durationOverride=4;project.lyricEffects={autoPlacement:false};
   const plan=J.plan(project);plan.W=64;plan.H=48;plan.media=null;plan.events=[];plan.beats=[];
   const cut=plan.cuts[0];plan.cuts=[cut];Object.assign(cut,{start:0,renderStart:0,end:4,displayEnd:4,dur:4,opacity:layer?50:100,blend:'normal',bg:'none',fullStagePlacement:false,motionScale:0,area:{x:.25,y:.25,w:.5,h:.5,angle:0},mask:null});
   const renderer=new J.Renderer();let callbackCtx,callbackBefore,callbackAfter,calls=0;const marker=Error('INJECTED_RENDER_CALLBACK_THROW');
   renderer.drawCut=env=>{calls++;callbackCtx=env.ctx;callbackBefore=snapshot(callbackCtx);if(ownSave)callbackCtx.save();callbackCtx.translate(7,11);callbackCtx.globalAlpha=.25;callbackCtx.beginPath();callbackCtx.rect(0,0,8,6);callbackCtx.clip();callbackAfter=snapshot(callbackCtx);if(throws)throw marker;if(ownSave)callbackCtx.restore();};
   let caught=null;try{renderer.frame(ctx,plan,1.5,{scale:1,transparent:true,noMedia:true,noGhost:true,noHud:true,noPost:true,noTrans:true});}catch(e){caught={same:e===marker,message:e.message};}
   if(!callbackCtx)throw Error('FIXTURE_CALLBACK_NOT_REACHED');
   const after={outer:snapshot(ctx),callback:snapshot(callbackCtx)},clip={outer:clipPixels(ctx),callback:callbackCtx===ctx?null:clipPixels(callbackCtx)};
   const restores=[];if(throws){const total=layer?1+(ownSave?1:0):2+(ownSave?1:0);for(let i=0;i<total;i++){callbackCtx.restore();restores.push({context:'callback',state:snapshot(callbackCtx)});}if(layer){ctx.restore();restores.push({context:'outer',state:snapshot(ctx)});}}
   rows.push({layer,ownSave,throws,calls,sameContext:callbackCtx===ctx,initial,callbackBefore,callbackAfter,caught,after,clip,manualRecoveryOperationsAttempted:restores.length,restores,finalOuter:snapshot(ctx),finalClipPixels:clipPixels(ctx)});
  }return rows;
 });
 report.blockedRequests=blocked;report.assertions=0;const check=(v,m)=>{assert(v,m);report.assertions++;};
 for(const r of report.rows){check(r.calls===1,'exactly one injected callback');check(r.sameContext===!r.layer,'direct/layer route');if(r.throws){check(r.caught?.same===true,'original error propagated');check(r.after.callback.alpha===.25,'callback alpha leaked');check(r.clip[r.layer?'callback':'outer']<3072,'callback clip leaked');check(r.restores.length===2+Number(r.ownSave),'manual recovery operations attempted (not measured stack depth)');if(!r.layer){check(r.restores.slice(0,-1).every(s=>JSON.stringify(s.state)!==JSON.stringify(r.initial)),'caller state not reached before final direct restore');}else{check(JSON.stringify(r.restores.at(-2).state)===JSON.stringify({matrix:[1,0,0,1,0,0],alpha:1,blend:'source-over'}),'layer callback root restored separately');check(JSON.stringify(r.after.outer)!==JSON.stringify(r.initial),'outer frame state also leaked');}}else{check(r.caught===null,'normal completed');check(JSON.stringify(r.after.outer)===JSON.stringify(r.initial),'normal outer state restored');check(r.clip.outer===3072,'normal outer clip restored');}
 check(JSON.stringify(r.finalOuter)===JSON.stringify(r.initial),'exact restores return caller state');check(r.finalClipPixels===3072,'exact restores return caller clip');}
 for(const p of pins)assert.equal(hash(fs.readFileSync(path.join(root,p.file))),p.sha256,'source mutated: '+p.file);
 report.status='KNOWN_FAILURE_REPRODUCED_WITH_PASSING_CONTROLS';report.finished=new Date().toISOString();
 }catch(e){report.status='DIAGNOSTIC_FAILED';report.error=e.stack;throw e;}finally{fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');await browser?.close();}
 console.log(JSON.stringify({status:report.status,rows:report.rows.length,assertions:report.assertions,browser:report.browser,report:out}));
})().catch(e=>{console.error(e);process.exitCode=1;});
