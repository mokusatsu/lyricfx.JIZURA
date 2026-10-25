async function exerciseTiles36({spec,fonts,instrumented}){
 const progress=window.tiles36Partial={spec,instrumented,phase:'fixture-setup',lastContext:null,lastNative:null};
 const r=await runLayoutsBFixture(J,{layout:'tiles',control:'off',ghost:true,...spec},{newPath:false,fonts,renderInitial:false,exportDataURL:false}),plan=r.plan,base=plan.cuts[0],A=J.placement,clean=v=>JSON.parse(JSON.stringify(v,(_,x)=>typeof x==='function'?undefined:x)),assert=(v,m)=>{if(!v)throw Error(m);},matrix=ctx=>{const m=ctx.getTransform();return [m.a,m.b,m.c,m.d,m.e,m.f];},hash=async ctx=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height).data))).map(x=>x.toString(16).padStart(2,'0')).join('');
 plan.duration=4.150001;plan.fps=60;plan.fx.koma=0;plan.lyricAvoidanceIndex.regions[0].end=4.150001;const source=JSON.stringify(plan),calls=[],wholeFrames=[],transport=[];
 const canvas=scale=>{const c=document.createElement('canvas');c.width=plan.W*scale;c.height=plan.H*scale;return c;};
 const times=[0,.12,.120000001,.25,.4,.4535449257,.6,1.5,3.8,3.9999999999999996,4,4.05];
 function environment(cv,lt,pass,scale,nativeD,fractional=false){
  const ctx=cv.getContext('2d'),cut={...base,...(nativeD?{placementLayoutsD:true,fullStagePlacement:true}:{})},lag=pass==='B'?1.6/24:pass==='A'?.8/24:0;ctx.setTransform(scale,0,0,scale,0,0);
  const env=r.renderer.makeEnv(ctx,plan,cut,cut.palette,{pass,passColor:pass==='A'?base.palette.ghostA:pass==='B'?base.palette.ghostB:null,t:lt,realTime:lt+lag,lt,ltb:lt+lag,step:Math.floor(lt/(1/24)+1e-6),scale,allowFilter:false});
  const motion=cut.motionScale??1,cam=J.CAMERA.push.get(env,cut.camP||{}),cs=J.lerp(1,cam.s??1,motion)*(cut.contentScale??1),u=plan.H/1080,chroma=(plan.fx.chroma??.7)*(plan.style.ghost??1),off=pass==='B'?[-3.4*chroma*u,-1.3*chroma*u]:pass==='A'?[3.2*chroma*u,1.9*chroma*u]:[0,0];ctx.translate(plan.W/2+off[0]*motion,plan.H/2+off[1]*motion);ctx.scale(cs,cs);ctx.translate(-plan.W/2,-plan.H/2);
  if(fractional){ctx.translate(.137,.281);ctx.rotate(.013);ctx.scale(1.013,1.013);}return env;
 }
 async function native(lt,pass,scale,nativeD,fractional=false){
  const cv=canvas(scale),env=environment(cv,lt,pass,scale,nativeD,fractional),ctx=env.ctx,trace=[],primitive=['poly','rect','rrect','line','draw'],old={},main=J.mainDraw;
  const capture=(kind,args)=>trace.push({kind,args:clean(args),matrix:matrix(ctx),role:env.drawOwnership?.role||null,owner:env.drawOwnership?.owner||null});
  for(const key of primitive){old[key]=env[key];env[key]=(...args)=>{capture(key==='draw'?'item':key,args);return old[key](...args);};}
  J.mainDraw=(e,it)=>{if(e===env)capture('glyph',[it]);return main(e,it);};let bb;
  try{bb=J.LAYOUTS.tiles.render(env);}finally{J.mainDraw=main;for(const key of primitive)env[key]=old[key];}
  const catalog=env.placementDGeometry||null;progress.phase='native-catalog-check';progress.lastContext={lt,pass,scale,nativeD,fractional};progress.lastNative={catalog:clean(catalog),bb:clean(bb??null),trace:clean(trace),root:matrix(ctx)};if(nativeD&&instrumented){assert(catalog?.kind==='tiles-native-catalog'&&catalog.complete,'COMPLETE_TILE_NATIVE_CATALOG');assert(Object.isFrozen(catalog)&&Object.isFrozen(catalog.tiles)&&Object.isFrozen(catalog.sourceCalls),'CATALOG_NOT_IMMUTABLE');assert(catalog.independentDecorOwners.length===0&&catalog.tiledAuxOwners.length===0,'PRIMARY_OWNERSHIP_EXEMPTION');assert(catalog.sourceCalls.length===trace.length,'SOURCE_CALL_COUNT_CHANGED');
   for(let i=0;i<trace.length;i++){const call=catalog.sourceCalls[i],actual=trace[i];assert(actual.role==='primary'&&actual.owner===call.owner,'SOURCE_CALL_OWNER_MAPPING');assert((call.kind==='drawAff-mainDraw'?'glyph':call.kind)===actual.kind,'SOURCE_CALL_KIND_ORDER');if(actual.kind!=='glyph')assert(JSON.stringify(call.matrixBeforeCall)===JSON.stringify(actual.matrix),'SOURCE_CALL_ACTUAL_MATRIX');}
   assert(catalog.tiles.every(t=>t.pts>=0&&t.i>=0&&t.j<t.cnt&&t.mi===Math.max(0,t.t1)/Math.max(.005,base.stagger||.04)&&t.delay===(t.mi|0)*(base.stagger||0)),'SOURCE_SLOT_MI_DELAY');
   if(!base.params.score&&pass==='main'&&lt===1.5){const pts=catalog.tiles.filter(t=>t.emitted&&t.pts>0);assert(trace.filter(t=>t.owner?.endsWith('.points')).length===pts.length,'SCORE_FALSE_DROPPED_TILE_POINTS');assert(!trace.some(t=>t.owner?.startsWith('tiles.score.')),'SCORE_FALSE_ADDED_GLOBAL_LABEL');}
  }
  const result={lt,pass,scale,nativeD,fractional,ownSelectorActive:lt>=base.start&&lt<base.end,pixelSHA256:await hash(ctx),bb:clean(bb??null),root:matrix(ctx),trace:clean(trace),paintCore:trace.map(({owner,role,...core})=>core),catalog:clean(catalog)};cv.width=1;return result;
 }
 for(const lt of times)for(const pass of ['main','A','B']){
  const off=await native(lt,pass,1,false),on=instrumented?await native(lt,pass,1,true):null;if(on){assert(off.pixelSHA256===on.pixelSHA256,'D_FLAG_NATIVE_PIXELS_CHANGED');assert(JSON.stringify(off.bb)===JSON.stringify(on.bb),'D_FLAG_NATIVE_BB_CHANGED');assert(JSON.stringify(off.paintCore)===JSON.stringify(on.paintCore),'D_FLAG_NATIVE_PAINT_CHANGED');}calls.push({lt,pass,off,on});
 }
 // Existing generic record/replay is tested, not presumed. No transport code
 // changed here. Capture actual unsupported diagnostics or pixel mismatches.
 const transportSchedule=[...times.flatMap(lt=>['main','A','B'].map(pass=>[lt,pass,1,false])),...[.5,2].flatMap(scale=>[.25,1.5,3.8].flatMap(lt=>['main','A','B'].map(pass=>[lt,pass,scale,false]))),...[.5,1,2].flatMap(scale=>['main','A','B'].map(pass=>[1.5,pass,scale,true]))];
 if(instrumented)for(const [lt,pass,scale,fractional]of transportSchedule){
  const expected=await native(lt,pass,scale,true,fractional),cv=canvas(scale),env=environment(cv,lt,pass,scale,true,fractional);let program,error=null,pixelSHA256=null;
  try{program=A.record(r.renderer,env);if(program.measurementSupported){A.replay(env,program,[0,0]);pixelSHA256=await hash(env.ctx);}}catch(e){error={code:e.code||e.name,message:e.message};}
  const eventOriginalRootsExact=!!program?.measurementSupported&&program.events.every(e=>JSON.stringify(e.nativeTransform?.root)===JSON.stringify(expected.root));
  transport.push({lt,pass,scale,fractional,expectedNativeRoot:expected.root,eventOriginalRootsExact,measurementSupported:program?.measurementSupported??false,diagnostics:clean(program?.diagnostics||[]),error,pixelSHA256,expectedNativeSHA256:expected.pixelSHA256,pixelsEqual:pixelSHA256===expected.pixelSHA256,catalog:clean(program?.nativeDGeometry||null),events:clean(program?.events||[]),status:error?'actual-transport-error':!program?.measurementSupported?'actual-unsupported':pixelSHA256===expected.pixelSHA256?'zero-replay-pixel-match':'zero-replay-pixel-mismatch'});cv.width=1;
 }
 for(const time of [0,.25,.6,1.5,3.8,4,4.05,4.15]){const cv=canvas(1),p=instrumented?{...plan,cuts:[{...base,placementLayoutsD:true}]}:plan;r.renderer.frame(cv.getContext('2d'),p,time,{noHud:true,noPost:true,allowFilter:false});wholeFrames.push({time,pixelSHA256:await hash(cv.getContext('2d'))});cv.width=1;}
 const admission=[];
 if(instrumented)for(const fault of ['unknown-source','modified-source','modified-makeEnv','modified-drawCut']){const cv=canvas(1),env=environment(cv,1.5,'main',1,true),original=J.LAYOUTS.tiles.render;let renderer=r.renderer,code=null;
  try{if(fault==='unknown-source')env.cut={...env.cut,layout:'unknown-tiles-layout'};if(fault==='modified-source')J.LAYOUTS.tiles.render=(...args)=>original(...args);if(fault==='modified-makeEnv'){renderer=Object.create(r.renderer);renderer.makeEnv=(...args)=>r.renderer.makeEnv(...args);}if(fault==='modified-drawCut'){renderer=Object.create(r.renderer);renderer.drawCut=(...args)=>r.renderer.drawCut(...args);}A.record(renderer,env);}catch(e){code=e.code||e.name;}finally{J.LAYOUTS.tiles.render=original;}
  assert(code==='UNSUPPORTED_DRAW_PROGRAM','NATIVE_IDENTITY_GUARD_NOT_RETAINED:'+fault+':'+code);admission.push({fault,code,canvasUntouched:!env.ctx.getImageData(0,0,cv.width,cv.height).data.some(v=>v!==0)});cv.width=1;
 }
 assert(JSON.stringify(plan)===source,'SOURCE_PLAN_MUTATED');return {spec,sourcePlan:clean(plan),params:clean(base.params),fontAudit:window.layoutsBFixtureFontAudit,calls,wholeFrames,transport,admission,nativeSourceFunction: J.LAYOUTS.tiles.render.toString(),otherDSourceFunctions:Object.fromEntries(['blocks','balloons','magnets'].map(k=>[k,J.LAYOUTS[k].render.toString()])),sourceUnchanged:true,catalogOnly:true,adapterRegistered:A.layoutsDRegisteredAdapters().some(a=>a.layout==='tiles'),certificate:false};
}
async function unrelatedD36({fonts}){
 const A=J.placement,rows=[],hash=async ctx=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height).data))).map(x=>x.toString(16).padStart(2,'0')).join('');
 for(const layout of ['blocks','balloons','magnets']){
  const r=await runLayoutsBFixture(J,{layout,control:'off',ghost:true,W:960,H:540,text:'風の先へ',seed:704},{newPath:false,fonts,renderInitial:false,exportDataURL:false}),plan=r.plan,cut={...plan.cuts[0],placementLayoutsD:true,fullStagePlacement:true},run=async replay=>{const cv=document.createElement('canvas');cv.width=960;cv.height=540;const ctx=cv.getContext('2d');ctx.translate(480+.137,270+.281);ctx.rotate(.013);ctx.scale(1.013,1.013);ctx.translate(-480,-270);const m=ctx.getTransform(),root=[m.a,m.b,m.c,m.d,m.e,m.f],env=r.renderer.makeEnv(ctx,plan,cut,cut.palette,{pass:'main',t:1.5,realTime:1.5,lt:1.5,ltb:1.5,step:36,scale:1,allowFilter:false});let program=null;if(replay){program=A.record(r.renderer,env);if(!program.measurementSupported)throw Error('UNRELATED_D_RECORD_UNSUPPORTED:'+layout);A.replay(env,program,[0,0]);}else J.LAYOUTS[layout].render(env);const value={pixelSHA256:await hash(ctx),root,events:program?.events.length||0};cv.width=1;return value;};
  const native=await run(false),replay=await run(true);if(native.pixelSHA256!==replay.pixelSHA256)throw Error('UNRELATED_D_ZERO_PIXEL_MISMATCH:'+layout);rows.push({layout,native,replay,zeroPixelsExact:true});
 }
 return rows;
}
