'use strict';
// SOURCE/MATH/runner preparation only. Parent releases a separate single run.
const fs=require('fs'),path=require('path'),http=require('http'),crypto=require('crypto'),zlib=require('zlib'),assert=require('assert/strict');
const dir=path.resolve(__dirname,'..'),root=path.resolve(dir,'../..'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const specs=[
 {id:'ordinary-four-exact-font-first',ghost:true,fps:60,koma:0,probeScales:[.5,1,2],W:960,H:540,text:'風の先へ',seed:704,params:{side:1,deco:true,tilt:false,hop:false,colOff:0}},
 {id:'long-native-hop-tilt',W:960,H:540,text:'風の先へ続く青い空',seed:705,params:{side:-1,deco:true,tilt:true,hop:true,colOff:5}},
 {id:'portrait-gap-support',W:720,H:1280,text:'GO GO GO',seed:706,params:{side:1,deco:false,tilt:true,hop:true,colOff:2}},
 {id:'support-all-enabled-copies',W:960,H:540,text:'BBBBBBBBB AAAA',seed:707,ghost:true,params:{side:-1,deco:true,tilt:false,hop:true,colOff:1}},
 {id:'global-hold-insufficient',W:960,H:540,text:'風の先へ',duration:.8,seed:708,expectHold:false,params:{side:1,deco:true,tilt:false,hop:false,colOff:0}},
 {id:'region-hold-intersection-insufficient',W:960,H:540,text:'風の先へ',seed:709,shortRegion:true,params:{side:-1,deco:true,tilt:false,hop:false,colOff:0}},
 {id:'q-boundaries-partial-and-fully-exited-tail',forcedOwnClockProbes:true,W:960,H:540,text:'風の先へ続く青い空',seed:710,ghost:true,params:{side:1,deco:true,tilt:true,hop:true,colOff:3}},
 {id:'typed-unsupported-camera',W:960,H:540,text:'風の先へ',seed:711,camera:'orbitDrift',expectCode:'BLOCKS_INITIAL_DOMAIN',params:{side:1,deco:true,tilt:false,hop:false,colOff:0}},
];
async function exercise({spec,fonts,helper}){
 const r=await runLayoutsBFixture(J,{layout:'blocks',control:'off',...spec},{newPath:false,fonts,renderInitial:false,exportDataURL:false}),original=r.plan.cuts[0],cut={...original,area:null,fullStagePlacement:true,placementLayoutsD:true};if(spec.fps!=null)r.plan.fps=spec.fps;if(spec.koma!=null)r.plan.fx.koma=spec.koma;const before=JSON.stringify(r.plan);
 const originalRefs=new Set(),flags=[],collect=o=>{if(o&&typeof o==='object'&&!originalRefs.has(o)){originalRefs.add(o);flags.push([o,Object.isFrozen(o),Object.isSealed(o),Object.isExtensible(o)]);for(const v of Object.values(o))collect(v);}};collect(r.plan);
 const circle={cx:.5*r.plan.W,cy:.42*r.plan.H,r:.2*Math.min(r.plan.W,r.plan.H)},regions=spec.shortRegion?[{id:'short',start:1.5,end:1.52,circle}]:[{id:'fixture',start:0,end:cut.end,circle}];
 let diagnostic=null,typed=null;if(helper){try{diagnostic=J.placement.blocksNativeProofDiagnostic(r.renderer,r.plan,cut,{renderScale:1,regions});}catch(e){typed={code:e.code||'ERROR',message:e.message};}}
 const diagnosticsByScale={1:diagnostic};if(helper&&diagnostic)for(const renderScale of spec.probeScales||[]){if(renderScale!==1)diagnosticsByScale[renderScale]=J.placement.blocksNativeProofDiagnostic(r.renderer,r.plan,cut,{renderScale,regions});}
 const metrics=diagnostic?.metrics||[],errors=[];
 if(helper){if(spec.expectCode){if(typed?.code!==spec.expectCode)errors.push({expectedCode:spec.expectCode,actual:typed});}else if(typed)errors.push({unexpectedTyped:typed});
  if(diagnostic){if(diagnostic.adapterRegistered!==false||diagnostic.safetyCertificate!==false||diagnostic.status!=='diagnostic-only')errors.push({invalidProductClaim:true});
   if(spec.expectHold===false&&diagnostic.globalHoldEnough)errors.push({unexpectedHold:true});if(spec.shortRegion&&diagnostic.trials.some(t=>t.holdEnough))errors.push({shortRegionAccepted:true});
   const walk=v=>{if(v&&typeof v==='object'){if(originalRefs.has(v))errors.push({sourceAlias:true});for(const x of Object.values(v))walk(x);}};walk(diagnostic);
   if(!metrics.length||metrics.some(m=>m.size!==diagnostic.sourceCatalog.k*diagnostic.sourceCatalog.blocks[m.sourceIndex].sz*.6))errors.push({exactNativeFontSizeMissing:true});}}
 const matrix=c=>{const m=c.getTransform();return [m.a,m.b,m.c,m.d,m.e,m.f];},hash=async c=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',c.getImageData(0,0,c.canvas.width,c.canvas.height).data))).map(x=>x.toString(16).padStart(2,'0')).join('');
 const times=[0,.06,.4,1.5,Math.max(0,cut.dur-cut.outDur),cut.end,cut.end+.2],calls=[];
 if(diagnostic){const g=diagnostic.sourceCatalog,first=g.blocks[0];for(const b of [first,g.blocks.at(-1)]){const when=.06+(b.order+1)*g.gap,a=(b.order+1)/(g.n+3)*.4;for(const t of [when,when+.3,cut.dur-cut.outDur+cut.outDur*a/1.4,cut.dur-cut.outDur+cut.outDur*(1+a)/1.4])for(const eps of [-1e-9,0,1e-9])times.push(t+eps);}}
 for(const t of [...new Set(times.filter(t=>t>=0))])for(const pass of ['main',...(spec.ghost?['A','B']:[])])for(const renderScale of spec.probeScales||[1])calls.push({realTime:t,pass,renderScale});
 const observations=[];
 for(const call of calls){const lag=call.pass==='B'?1.6/24:call.pass==='A'?.8/24:0,step=J.stepDur(r.plan.fx,r.plan.fps),tq=Math.floor(call.realTime/step+1e-6)*step,tp=Math.max(0,tq-lag),lt=tp-cut.start;
  const cv=document.createElement('canvas');cv.width=r.plan.W*call.renderScale;cv.height=r.plan.H*call.renderScale;const ctx=cv.getContext('2d');ctx.scale(call.renderScale,call.renderScale);const env=r.renderer.makeEnv(ctx,r.plan,cut,cut.palette,{pass:call.pass,passColor:call.pass==='A'?'#e9529e':'#4bcade',t:tp,realTime:call.realTime,lt,ltb:lt+lag,step:Math.floor(tp/(1/24)+1e-6),scale:call.renderScale,allowFilter:false});
  const cam=(J.CAMERA[cut.cam]||J.CAMERA.push).get(env,cut.camP||{}),chroma=(r.plan.fx.chroma??.7)*(r.plan.style.ghost??1),off=call.pass==='B'?[-3.4,-1.3]:call.pass==='A'?[3.2,1.9]:[0,0],u=r.plan.H/1080;
  ctx.translate(r.plan.W/2+off[0]*chroma*u+(cam.x||0),r.plan.H/2+off[1]*chroma*u+(cam.y||0));if(cam.rot)ctx.rotate(cam.rot*J.DEG);ctx.scale((cam.s??1)*(cut.contentScale??1),(cam.s??1)*(cut.contentScale??1));ctx.translate(-r.plan.W/2,-r.plan.H/2);
  const actualRoot=matrix(ctx),p=J.placement.record(r.renderer,env);if(!p.measurementSupported)throw Error('Native observation failed '+JSON.stringify(p.diagnostics));J.placement.replay(env,p,[0,0]);
  const active=J.lyricCutsAt(r.plan,tp).some(c=>c.index===cut.index),phase=helper&&diagnostic?J.placement.blocksNativeSourcePhaseAt(r.plan,cut,diagnostic.sourceCatalog,call.realTime,call.pass):null;
  if(phase&&(phase.active!==active||phase.lt!==lt||phase.tp!==tp))errors.push({phaseMismatch:call,phase,active,lt,tp});
  const chosenDiagnostic=diagnosticsByScale[call.renderScale],coverage=[];if(active&&chosenDiagnostic){for(const e of p.events){const cells=chosenDiagnostic.ledger.filter(u=>u.owner===e.owner&&u.pass===call.pass&&u.sourceRange[0]-1e-9<=lt&&u.sourceRange[1]+1e-9>=lt),contains=(poly,v)=>{let a=false,b=false;for(let i=0;i<poly.length;i++){const x=poly[i],y=poly[(i+1)%poly.length],c=(y[0]-x[0])*(v[1]-x[1])-(y[1]-x[1])*(v[0]-x[0]);a||=c>1e-7;b||=c< -1e-7;}return !(a&&b);},covered=e.polygons.every(poly=>poly.every(v=>cells.some(c=>contains(c.polygon,[v[0]/call.renderScale,v[1]/call.renderScale]))));coverage.push({owner:e.owner,covered});if(!covered)errors.push({actualPolygonEscapedDiagnosticHull:call,lt,owner:e.owner});}}
  // Forced direct outside selector remains source-event evidence only, never a
  // successful containment/phase waiver count. Source paint/events are preserved.
  observations.push({...call,tp,lt,ltb:lt+lag,actualRoot,active,forcedDirectOutsideSelector:!active,coverageEligible:active&&!!chosenDiagnostic,pixelHash:await hash(ctx),phase,coverage,events:p.events.map(e=>({kind:e.kind,owner:e.owner,role:e.role,matrix:e.matrix,polygons:e.polygons,args:e.args}))});cv.width=cv.height=1;
 }
 const forcedCalls=[];
 if(helper&&diagnostic&&spec.forcedOwnClockProbes){
  const g=diagnostic.sourceCatalog;for(const pass of ['main','A','B']){
   const lag=pass==='B'?1.6/24:pass==='A'?.8/24:0,gate=.3+(g.n+2)*g.gap+g.fd,period=Math.ceil((gate+lag)/.65)*.65-lag;
   const boundaries=[{label:'native-hop-gate',t:gate},{label:'native-hop-period',t:period},{label:'native-hop-pulse-end',t:period+.32}];
   for(const b of [g.blocks[0],g.blocks.at(-1)]){const t1=.06+(b.order+1)*g.gap,a=(b.order+1)/(g.n+3)*.4,mi=Math.max(0,t1)/Math.max(.005,cut.stagger||.04);boundaries.push({label:b.id+':f0',t:t1},{label:b.id+':f1',t:t1+.3},{label:b.id+':mi-delay',t:(mi|0)*(cut.stagger||0)},{label:b.id+':q0',t:cut.dur-cut.outDur+cut.outDur*a/1.4},{label:b.id+':q1',t:cut.dur-cut.outDur+cut.outDur*(1+a)/1.4});}
   for(const b of boundaries)for(const eps of [-1e-9,0,1e-9])forcedCalls.push({pass,ownLt:b.t+eps,sourceBoundaryLabel:b.label,epsilon:eps});
  }
 }else if(spec.forcedClocks)forcedCalls.push(...spec.forcedClocks);
 const forcedRows=[];
 for(const call of forcedCalls){
  const lag=call.pass==='B'?1.6/24:call.pass==='A'?.8/24:0,cv=document.createElement('canvas');cv.width=r.plan.W;cv.height=r.plan.H;const ctx=cv.getContext('2d'),env=r.renderer.makeEnv(ctx,r.plan,cut,cut.palette,{pass:call.pass,passColor:call.pass==='A'?'#e9529e':'#4bcade',t:cut.start+call.ownLt,realTime:cut.start+call.ownLt,lt:call.ownLt,ltb:call.ownLt+lag,step:0,scale:1,allowFilter:false}),program=J.placement.record(r.renderer,env);if(!program.measurementSupported)throw Error('Forced source probe failed '+JSON.stringify(program.diagnostics));
  const g=program.nativeDGeometry,selectorActive=J.lyricCutsAt(r.plan,cut.start+call.ownLt).some(c=>c.index===cut.index);
  forcedRows.push({...call,kind:'forced-direct-own-clock-source-only',engineReachabilityNotClaimed:true,coverageEligible:false,selectorActiveAtUnquantizedSourceTime:selectorActive,expiryOutsideSourceLifetime:!selectorActive,cameraApplied:false,pOut:env.pOut,hop:g.hop,blocks:g.blocks.map(b=>({id:b.id,t1:b.t1,f:b.f,emitted:b.emitted,mi:b.mi,q:J.clamp(env.pOut*1.4-(b.order+1)/(g.n+3)*.4),glyphPainted:program.events.some(e=>e.owner==='blocks.'+b.id+'.glyph')})),events:program.events.map(e=>({kind:e.kind,owner:e.owner,role:e.role,matrix:e.matrix,polygons:e.polygons,args:e.args}))});cv.width=cv.height=1;
 }
 if(JSON.stringify(r.plan)!==before||flags.some(([o,f,s,e])=>Object.isFrozen(o)!==f||Object.isSealed(o)!==s||Object.isExtensible(o)!==e))errors.push({sourceMutatedOrFrozen:true});
 delete diagnosticsByScale[1];return {spec:{...spec,forcedClocks:undefined},typed,diagnostic,additionalScaleDiagnostics:diagnosticsByScale,observations,forcedDirect:{calls:forcedCalls,rows:forcedRows},errors,fontAudit:window.layoutsBFixtureFontAudit};
}
(async()=>{
 assert.equal(process.env.BLOCKS_BOUNDED01_RELEASE,'PARENT_REVIEWED_SOURCE_MATH_RUNNER');const out=path.join(dir,'evidence/diagnostic01.raw.json.gz');assert(!fs.existsSync(out));
 const pins=JSON.parse(fs.readFileSync(path.join(dir,'evidence/baseline-pins.json'))),seal=JSON.parse(fs.readFileSync(path.join(dir,'evidence/pre-run-seal.json')));
 for(const p of pins.files)assert.equal(sha(fs.readFileSync(path.join(root,p.path))),p.sha256,p.path);for(const p of pins.runtimeExternalPins)assert.equal(sha(fs.readFileSync(p.path)),p.sha256,p.path);for(const p of seal.files)assert.equal(sha(fs.readFileSync(path.join(dir,p.path))),p.sha256,p.path);
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),source=fs.readFileSync(path.join(root,'src/11p_layoutsD.js'),'utf8'),helper=fs.readFileSync(path.join(dir,'src/09y_layoutsD_blocks_diagnostic.js'),'utf8');assert.equal(html.split(source).length,2);
 const after=html.replace(source,helper+'\n'+source),fonts=JSON.parse(fs.readFileSync(path.join(root,'dev/avoidance/layouts-c-editorial-fonts/manifest.json'))),assets=new Map([['/before.html',Buffer.from(html)],['/after.html',Buffer.from(after)]]),fontAudit=[];
 for(const face of fonts.faces){const url=new URL(face.url,'http://127.0.0.1'),file=url.pathname.slice(1),p=pins.files.find(p=>p.path===file);assert.equal(url.origin,'http://127.0.0.1');assert(p);const b=fs.readFileSync(path.join(root,file));assert.equal(sha(b),p.sha256);assert.equal(sha(b),face.sourceSHA256);assets.set(url.pathname,b);fontAudit.push({id:face.id,file,bytes:b.length,sha256:sha(b)});}
 const invocation={at:new Date().toISOString(),pins,seal,specs,fontAudit,htmlSHA256:{before:sha(html),after:sha(after)},scope:'diagnostic-only exact native source, no adapter/safety claim'};fs.writeFileSync(path.join(dir,'evidence/diagnostic01.invocation.json'),JSON.stringify(invocation,null,2),{flag:'wx'});
 let browser,server,results=[],errors=[];const requests=[];
 try{server=http.createServer((req,res)=>{const url=new URL(req.url,'http://127.0.0.1'),b=assets.get(url.pathname);requests.push({path:url.pathname,status:b?200:404,bytes:b?.length||0});if(!b){res.writeHead(404).end();return;}res.setHeader('Content-Type',url.pathname.endsWith('.html')?'text/html':url.pathname.endsWith('.ttf')?'font/ttf':'font/otf');res.end(b);});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
  browser=await require(path.join(root,'dev/browser.cjs')).launch({executablePath:'/usr/bin/chromium'});const pages=[];for(const variant of ['before','after']){const p=await browser.newPage();await p.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());await p.goto(base+'/'+variant+'.html');await p.waitForFunction(()=>window.J?.ui?.plan);await p.addScriptTag({content:fs.readFileSync(path.join(root,'dev/avoidance/layouts-b-fixture.js'),'utf8')});pages.push(p);}
  for(const spec of specs){const current=await pages[1].evaluate(exercise,{spec,fonts,helper:true}),original=await pages[0].evaluate(exercise,{spec:{...spec,forcedClocks:current.forcedDirect.calls},fonts,helper:false});
   // Independent original observations only share the fixed baseline times.
   const matches=[];for(const a of original.observations){const b=current.observations.find(b=>b.realTime===a.realTime&&b.pass===a.pass&&b.renderScale===a.renderScale);if(!b||a.pixelHash!==b.pixelHash||JSON.stringify(a.events)!==JSON.stringify(b.events))errors.push({nativeSourceRegression:spec.id,time:a.realTime,pass:a.pass});else matches.push({realTime:a.realTime,pass:a.pass,renderScale:a.renderScale,equal:true});}
   if(JSON.stringify(current.forcedDirect.rows)!==JSON.stringify(original.forcedDirect.rows))errors.push({forcedOwnSourceEventRegression:spec.id});
   errors.push(...current.errors.map(e=>({fixture:spec.id,...e})));results.push({current,original,matches});}
 }catch(e){errors.push({name:e.name,message:e.message,stack:e.stack});}finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));}
 for(const p of pins.files)if(sha(fs.readFileSync(path.join(root,p.path)))!==p.sha256)errors.push({changedCanonical:p.path});for(const p of pins.runtimeExternalPins)if(sha(fs.readFileSync(p.path))!==p.sha256)errors.push({changedRuntime:p.path});for(const p of seal.files)if(sha(fs.readFileSync(path.join(dir,p.path)))!==p.sha256)errors.push({changedSealed:p.path});
 fs.writeFileSync(out,zlib.gzipSync(JSON.stringify({invocation,requests,results,errors}),{mtime:0}),{flag:'wx'});console.log(JSON.stringify({out,fixtures:results.length,errors:errors.length,first:errors.slice(0,3)}));assert.equal(errors.length,0);assert.equal(results.length,8);
})().catch(e=>{console.error(e);process.exitCode=1;});
