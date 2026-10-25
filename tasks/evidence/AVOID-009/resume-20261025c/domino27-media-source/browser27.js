/* SOURCE26 bounded pilot. Every winning state is actual Renderer.frame/drawCut output. */
(()=>{'use strict';
const A=J.placement,T=A.tilesProof48,P=window.oracle69Primitives,Q=A.bulbsProof69,need=P.need,clean=P.clean;
let local;
function refs(){return[J.LAYOUTS.dominoes.render,J.Renderer.prototype.frame,J.Renderer.prototype.drawCut,J.Renderer.prototype.makeEnv,J.mainDraw,J.drawItem,J.drawFx,J.layoutText,J.measure,J.fontCSS,J.metrics.adv,J.CAMERA.push.get,J.lyricCutsAt,J.lyricRenderCut,J.stepDur,J.komaOf,J.glyphCount,J.chunkText,J.splitLines,J.clamp,J.lerp,J.h,J.r,J.rs,J.mix,J.lum,J.contrast,J.fontForChar,J.faceOf,...Object.values(J.E),T.clock,T.support,Q.kernel.atom,A.bulbsGeometry68.evaluation,J.domino73.enter,J.domino73.withRecipe];}
function snapshot(){return{refs:refs(),revision:J.metrics.revision,fonts:JSON.stringify(J.FONTS),faces:JSON.stringify([...document.fonts].map(f=>[f.family,f.style,f.weight,f.status])),plan:JSON.stringify(local.run.plan),lang:J.lang};}
function stable(){const s=snapshot(),b=local.binding;need(s.refs.length===b.refs.length&&s.refs.every((r,i)=>r===b.refs[i])&&s.revision===b.revision&&s.fonts===b.fonts&&s.faces===b.faces&&s.plan===b.plan&&s.lang===b.lang,'DOMINO26_SOURCE_FONT_HELPER_DRIFT');}
function scope(plan){
 const c=plan.cuts[0];need(plan.W===960&&plan.H===540&&plan.lang==='ja'&&plan.cuts.length===1&&plan.fps===60&&plan.duration===4.150001&&plan.fx.koma===0,'DOMINO26_PLAN_SCOPE');
 need(!plan.events.length&&!plan.energy&&!plan.beats?.length&&!c.effectsOnly&&!c.drawing&&!(c.decor||[]).length&&c.treat==='none'&&!c.area&&!c.fullStagePlacement&&!c.mask&&(!c.blend||c.blend==='normal')&&(c.opacity??100)===100,'DOMINO26_SOURCE_CHANNEL_SCOPE');
 need(c.cam==='push'&&!c.effectFx&&!c.effectStyle&&!c.trans&&!(c.effects||[]).length&&(plan.fx.shake??0)===0,'DOMINO26_SOURCE_FX_SCOPE');
 need((plan.fx.chroma??.7)>.02&&(plan.style.ghost??1)>.02,'DOMINO26_THREE_PASS_SCOPE');return window.domino26Bounded.family(c);
}
window.initDomino26=async input=>{
 const run=await runLayoutsBFixture(J,{layout:'dominoes',control:'fullstage',ghost:true,W:960,H:540,seed:1205,text:input.text,params:{font:'dela',face:'light',pips:true}},{newPath:false,fonts:input.fonts,renderInitial:false,exportDataURL:false});
 run.plan.duration=4.150001;run.plan.fps=60;run.plan.fx.koma=0;run.plan.lyricAvoidanceIndex.regions[0].end=run.plan.duration;if(J.lang!==run.plan.lang)J.setLang(run.plan.lang);
 local={run};const family=scope(run.plan);local.clocks=T.clock(run.plan,run.plan.cuts[0]);need(local.clocks.actualCounts.states===250&&local.clocks.actualCounts.selectedPasses===727,'DOMINO26_CLOCK_COUNTS');local.binding=snapshot();
 return{plan:run.plan,family,clocks:local.clocks,fontAudit:window.layoutsBFixtureFontAudit,source:String(J.LAYOUTS.dominoes.render),oracle:String(J.domino26Oracle),helperSources:local.binding.refs.map(String),conditionalFoundation:'48/69 actualCTM and TextMetrics with1fontpx/2devicepx guard; conditional Canvas/font/libm foundation',adapterRegistered:false};
};
window.frameDomino26=async({n,recipe={kind:'native',deltas:[]},oracle=false,media=false,png=false})=>{
 stable();scope(local.run.plan);const state=local.clocks.states[n];const renderTime=media?n/60:state.firstTime;if(media){const pre=local.clocks.preimages.find(p=>p.n===n&&p.reachable);need(pre&&pre.firstTime<=renderTime&&renderTime<=pre.lastTime&&Math.floor(renderTime/local.clocks.h+1e-6)===n,'MEDIA27_SAME_NUMBER_PREIMAGE');}need(state&&state.n===n,'DOMINO26_STATE');const canvas=P.cv(),ctx=canvas.getContext('2d');Q.pristine(ctx);const context=T.contextState(ctx),r=local.run.renderer,oldOwn=Object.getOwnPropertyDescriptor(r,'drawCut'),stock=r.drawCut,native=J.LAYOUTS.dominoes.render,mainOwn=Object.getOwnPropertyDescriptor(J,'mainDraw'),main=J.mainDraw,oldDY=Object.getOwnPropertyDescriptor(window,'domino26OracleDY'),passes=[],glyphs=[],primitiveCalls=[],paintPrimitives=[];let envNow=null,primitive=null,spy,rows=[];
 const expected=state.passes.filter(p=>p.active),deltaAt=i=>recipe.kind==='native'?0:recipe.deltas[recipe.kind==='joint-translation'?0:i][1];
 try{
  spy=P.spy(ctx,()=>envNow);
  // Attach primitive metadata in a parallel column; paint records retain codec69 shape.
  const savedPaint=[];for(const k of['fill','stroke','fillText','strokeText','fillRect','strokeRect']){const f=ctx[k];savedPaint.push([k,f]);ctx[k]=function(...args){if(envNow)paintPrimitives.push(primitive?clean(primitive):null);return Reflect.apply(f,this,args);};}
  J.mainDraw=function(env,it){if(env===envNow)glyphs.push({pass:env.pass,item:clean(it),matrix:P.matrix(ctx),lt:env.lt,ltb:env.ltb,step:env.step,pIn:env.pIn,pOut:env.pOut});return Reflect.apply(main,this,[env,it]);};
  r.drawCut=function(env){
   need(env.ctx===ctx&&env.cut.layout==='dominoes','DOMINO26_ACTUAL_TARGET');envNow=env;const own=expected[passes.length];need(own,'DOMINO26_EXTRA_PASS');
   const clock={pass:env.pass,tp:env.t,lt:env.lt,ltb:env.ltb,step:env.step,pIn:env.pIn,pOut:env.pOut};for(const k of['pass','tp','lt','ltb','step'])need(Object.is(clock[k],own[k]),'DOMINO26_ACTUAL_CLOCK:'+k);need((env.energy??null)===null&&(env.beat??null)===null&&(env.beatPulse??0)===0,'DOMINO26_ENERGY_BEAT');
   passes.push({...clock,root:P.matrix(ctx)});env.drawOwnership={role:'primary',owner:'dominoes.oracle-chain'};
   const saved=[];for(const k of['poly','rrect','line','circle']){const f=env[k];saved.push([k,f]);env[k]=(...args)=>{const before=primitive;primitive={kind:k,args:clean(args),owner:env.drawOwnership?.owner,pass:env.pass,paintStart:spy.records.length};primitiveCalls.push({...primitive,matrix:P.matrix(ctx)});try{return f(...args);}finally{primitive=before;}};}
   const forbidden=[];for(const k of['clip','drawImage','putImageData','clearRect','createPattern','createLinearGradient','createRadialGradient','createConicGradient'])if(k in ctx){const own=Object.getOwnPropertyDescriptor(ctx,k);forbidden.push([k,own]);ctx[k]=()=>{throw Error('DOMINO26_UNSUPPORTED_PAINT_CHANNEL:'+k);};}
   const placement=Object.getOwnPropertyDescriptor(env,'placementRecording');env.placementRecording=true; // stock drawCut propagates errors; output expression unchanged.
   try{if(oracle){window.domino26OracleDY=deltaAt;J.LAYOUTS.dominoes.render=J.domino26Oracle;}return Reflect.apply(stock,this,[env]);}
   finally{J.LAYOUTS.dominoes.render=native;for(const[k,fn]of saved)env[k]=fn;for(const[k,d]of forbidden.reverse())if(d)Object.defineProperty(ctx,k,d);else delete ctx[k];if(placement)Object.defineProperty(env,'placementRecording',placement);else delete env.placementRecording;envNow=null;}
  };
  try{if(oracle)local.run.renderer.frame(ctx,local.run.plan,renderTime,P.options);else{const v=J.domino73.withRecipe(recipe,()=>local.run.renderer.frame(ctx,local.run.plan,renderTime,P.options));rows=v.rows;}}
  finally{for(const[k,f]of savedPaint)ctx[k]=f;}
  need(passes.length===expected.length&&spy.records.length===paintPrimitives.length&&spy.records.length<=2048,'DOMINO26_PASS_PAINT_COUNTS');
 }finally{J.LAYOUTS.dominoes.render=native;spy?.restore();if(oldOwn)Object.defineProperty(r,'drawCut',oldOwn);else delete r.drawCut;if(mainOwn)Object.defineProperty(J,'mainDraw',mainOwn);else delete J.mainDraw;if(oldDY)Object.defineProperty(window,'domino26OracleDY',oldDY);else delete window.domino26OracleDY;}
 Q.pristine(ctx);stable();const records=spy.records;need(records.every(p=>p.state.alpha>0),'DOMINO26_ZERO_ALPHA_PAINT');
 const supports=[];let supportError=null;
 if(!oracle)for(let i=0;i<records.length;i++){try{supports.push(window.domino26Support.support(records[i],paintPrimitives[i],i));}catch(e){const paint=records[i],activeStyle=paint.kind.startsWith('stroke')?'strokeStyle':'fillStyle';supportError={name:e.name,message:e.message,code:e.code??null,ordinal:i,kind:paint.kind,pass:paint.pass,owner:paint.owner,activeStyle,activeStyleValue:clean(paint.state[activeStyle]),supportsCompleted:supports.length};break;}}
 const out={n,time:renderTime,recipe,oracle,context,passes,rows,glyphs,records,paintPrimitives,primitiveCalls,supports,supportError,sourceUnchanged:true,adapterRegistered:false};if(media){out.SHA256=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',ctx.getImageData(0,0,960,540).data))).map(n=>n.toString(16).padStart(2,'0')).join('');if(png)out.png=canvas.toDataURL('image/png');}canvas.width=1;return out;
};
})();
