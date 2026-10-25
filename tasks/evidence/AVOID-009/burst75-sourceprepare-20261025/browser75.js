/* SOURCE ONLY: direct render fidelity, no automatic eligibility or safe adapter. */
(function setupBurst75(createBinding,installer){'use strict';
const P=window.oracle69Primitives,need=(v,c)=>{if(!v)throw Error(c);},binding=createBinding();if(installer)installer(binding);
window.initBurst75=async input=>{
 const run=await runLayoutsBFixture(J,{layout:'burst',control:'fullstage',ghost:true,W:960,H:540,seed:1205,text:'風の先へ',params:{font:'dela',spikes:15,sharp:.72,tilt:4,lines:true,debris:true,order:'accent'}},{newPath:false,fonts:input.fonts,renderInitial:false,exportDataURL:false});
 const plan=run.plan;plan.duration=4.150001;plan.fps=60;plan.fx.koma=0;plan.lyricAvoidanceIndex.regions[0].end=plan.duration;if(J.lang!==plan.lang)J.setLang(plan.lang);
 need(plan.lang==='ja'&&plan.cuts.length===1,'BURST75_INITIAL_SCOPE');
 window.burst75Local={run,plan,source:JSON.stringify(plan),native:J.LAYOUTS.burst.render,fontRevision:J.metrics.revision};
 return{plan,fontAudit:window.layoutsBFixtureFontAudit,rendererWitness:String(J.LAYOUTS.burst.render),oracleWitness:J.burst75Oracle?String(J.burst75Oracle):null,adapterRegistered:false};
};
window.frameBurst75=async({n,mode,query})=>{
 const local=window.burst75Local,{run,plan}=local;need(local.source===JSON.stringify(plan)&&local.fontRevision===J.metrics.revision&&J.LAYOUTS.burst.render===local.native,'BURST75_INPUT_DRIFT');
 const {lt,pass}=query,canvas=P.cv(),ctx=canvas.getContext('2d'),cut=plan.cuts[0],lag=pass==='B'?1.6/24:pass==='A'?.8/24:0,t=lt+cut.start;
 const env=run.renderer.makeEnv(ctx,plan,cut,cut.palette,{pass,passColor:pass==='A'?cut.palette.ghostA:pass==='B'?cut.palette.ghostB:null,t,realTime:t+lag,lt,ltb:lt+lag,step:Math.floor(t/(1/24)+1e-6),scale:1,allowFilter:false,energy:null,beat:null,beatPulse:0}),root=P.matrix(ctx),mainOwn=Object.getOwnPropertyDescriptor(J,'mainDraw'),main=J.mainDraw,glyphs=[],saved=[];let observer,bb;
 env.drawOwnership={role:'primary',owner:'burst.native-plate'};
 function reject(key){const own=Object.getOwnPropertyDescriptor(ctx,key),fn=ctx[key];need(typeof fn==='function','BURST75_CANVAS_METHOD:'+key);saved.push([key,own]);ctx[key]=function(){throw Error('BURST75_UNSUPPORTED_PAINT:'+key);};}
 try{
  observer=P.spy(ctx,()=>env);for(const key of ['clip','drawImage','putImageData','clearRect','createPattern','createLinearGradient','createRadialGradient','createConicGradient'])if(key in ctx)reject(key);
  J.mainDraw=function(e,it){if(e===env)glyphs.push({pass:e.pass,item:P.clean(it),matrix:P.matrix(ctx),lt:e.lt,ltb:e.ltb,step:e.step,pIn:e.pIn,pOut:e.pOut});return Reflect.apply(main,this,[e,it]);};
  const draw=()=>Reflect.apply(mode==='oracle-moved'?J.burst75Oracle:local.native,J.LAYOUTS.burst,[env]);
  if(mode==='off')env.plan={...env.plan,lyricAvoidanceIndex:{...env.plan.lyricAvoidanceIndex,enabled:false}};
  if(mode==='on-zero'||mode==='on-moved'||mode==='off')bb=binding.withRecipe(env,{dx:mode==='on-zero'?0:17,dy:mode==='on-zero'?0:-23},draw);
  else if(mode==='public-recipe'){
   // Mutate only the ephemeral makeEnv cut clone; actual saved plan must remain byte exact.
   const original=env.cut;env.cut={...original,placementLayoutsD:true,layoutDRecipe:{dx:999,dy:-999}};try{bb=draw();}finally{env.cut=original;}
  }else bb=draw();
 }finally{
  for(const [key,own]of saved.reverse())if(own)Object.defineProperty(ctx,key,own);else delete ctx[key];observer?.restore();if(mainOwn)Object.defineProperty(J,'mainDraw',mainOwn);else delete J.mainDraw;
 }
 need(J.LAYOUTS.burst.render===local.native&&J.mainDraw===main&&binding.offsetFor(env)===null,'BURST75_RESTORE');need(observer.records.length<=2048,'BURST75_PAINT_BUDGET');
 need(observer.records.every(p=>p.role==='primary'&&p.owner==='burst.native-plate'),'BURST75_PRIMARY_OWNERS');need(observer.records.every(p=>typeof p.state.fillStyle==='string'&&typeof p.state.strokeStyle==='string'),'BURST75_UNKNOWN_STYLE');
 const out={n,query,mode,clock:{pass:env.pass,t:env.t,realTime:env.realTime,lt:env.lt,ltb:env.ltb,step:env.step,pIn:env.pIn,pOut:env.pOut},root,finalRoot:P.matrix(ctx),bb:P.clean(bb??null),glyphs,records:observer.records,rgbaSHA256:await P.hash(ctx),sourceUnchanged:local.source===JSON.stringify(plan),adapterRegistered:false};canvas.width=1;return out;
};
})
