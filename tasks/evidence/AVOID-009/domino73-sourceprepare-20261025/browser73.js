/* SOURCE73 local fidelity only; no safe adapter or export assets. */
(()=>{'use strict';
const P=window.oracle69Primitives,need=(v,c)=>{if(!v)throw Error(c);};
window.initDomino73=async input=>{
 const run=await runLayoutsBFixture(J,{layout:'dominoes',control:'fullstage',ghost:true,W:960,H:540,seed:1205,text:input.text,params:{font:'dela',face:'light',pips:true}},{newPath:false,fonts:input.fonts,renderInitial:false,exportDataURL:false});
 const plan=run.plan;plan.duration=4.150001;plan.fps=60;plan.fx.koma=0;plan.lyricAvoidanceIndex.regions[0].end=plan.duration;if(J.lang!==plan.lang)J.setLang(plan.lang);
 need(plan.lang==='ja'&&plan.cuts.length===1,'DOMINO73_INITIAL_SCOPE');
 window.domino73Local={run,plan,source:JSON.stringify(plan),native:J.LAYOUTS.dominoes.render,fontRevision:J.metrics.revision};
 return{plan,fontAudit:window.layoutsBFixtureFontAudit,rendererWitness:String(J.LAYOUTS.dominoes.render),originalOracleWitness:J.domino73Oracle?String(J.domino73Oracle):null,adapterRegistered:false};
};
window.frameDomino73=async({n,mode,query})=>{
 const local=window.domino73Local,{run,plan}=local;need(local.source===JSON.stringify(plan)&&local.fontRevision===J.metrics.revision&&J.LAYOUTS.dominoes.render===local.native,'DOMINO73_INPUT_DRIFT');
 const {lt,pass,scale=1,fractional=false}=query,canvas=document.createElement('canvas');canvas.width=Math.round(960*scale);canvas.height=Math.round(540*scale);const ctx=canvas.getContext('2d'),cut=plan.cuts[0],lag=pass==='B'?1.6/24:pass==='A'?.8/24:0,t=lt+cut.start;
 ctx.setTransform(scale,0,0,scale,0,0);if(fractional){ctx.translate(.137,.281);ctx.rotate(.013);ctx.scale(1.013,.987);}
 const env=run.renderer.makeEnv(ctx,plan,cut,cut.palette,{pass,passColor:pass==='A'?cut.palette.ghostA:pass==='B'?cut.palette.ghostB:null,t,realTime:t+lag,lt,ltb:lt+lag,step:Math.floor(t/(1/24)+1e-6),scale,allowFilter:false,energy:null,beat:null,beatPulse:0}),root=P.matrix(ctx),mainOwn=Object.getOwnPropertyDescriptor(J,'mainDraw'),main=J.mainDraw,glyphs=[],saved=[];let observer,rows=[],bb;
 env.drawOwnership={role:'primary',owner:'dominoes.native-chain'};
 function wrap(key){const own=Object.getOwnPropertyDescriptor(ctx,key),fn=ctx[key];need(typeof fn==='function','DOMINO73_CANVAS_METHOD:'+key);saved.push([key,own]);ctx[key]=function(){throw Error('DOMINO73_UNSUPPORTED_PAINT:'+key);};}
 try{
  observer=P.spy(ctx,()=>env);for(const key of ['clip','drawImage','putImageData','clearRect','createPattern','createLinearGradient','createRadialGradient','createConicGradient'])if(key in ctx)wrap(key);
  J.mainDraw=function(e,it){if(e===env)glyphs.push({pass:e.pass,item:P.clean(it),matrix:P.matrix(ctx),lt:e.lt,ltb:e.ltb,step:e.step,pIn:e.pIn,pOut:e.pOut});return Reflect.apply(main,this,[e,it]);};
  const draw=()=>Reflect.apply(mode==='oracle-moved'?J.domino73Oracle:local.native,J.LAYOUTS.dominoes,[env]);
  if(mode==='on-zero'||mode==='on-moved'){need(J.domino73,'DOMINO73_RUNTIME_MISSING');const value=J.domino73.withRecipe(mode==='on-zero'?{kind:'native'}:{kind:'joint-translation',deltas:[[17,-23]]},draw);rows=value.rows;bb=value.result;}else bb=draw();
 }finally{
  for(const [key,own]of saved.reverse())if(own)Object.defineProperty(ctx,key,own);else delete ctx[key];observer?.restore();if(mainOwn)Object.defineProperty(J,'mainDraw',mainOwn);else delete J.mainDraw;
 }
 need(J.LAYOUTS.dominoes.render===local.native&&J.mainDraw===main,'DOMINO73_RESTORE');need(observer.records.length<=2048,'DOMINO73_PAINT_BUDGET');
 need(observer.records.every(p=>p.role==='primary'&&p.owner?.startsWith('dominoes.')),'DOMINO73_PRIMARY_OWNERS');
 need(observer.records.every(p=>typeof p.state.fillStyle==='string'&&typeof p.state.strokeStyle==='string'),'DOMINO73_UNKNOWN_STYLE');
 const out={n,query,mode,clock:{pass:env.pass,t:env.t,realTime:env.realTime,lt:env.lt,ltb:env.ltb,step:env.step,pIn:env.pIn,pOut:env.pOut},root,finalRoot:P.matrix(ctx),bb:P.clean(bb??null),glyphs,rows,records:observer.records,rgbaSHA256:await P.hash(ctx),sourceUnchanged:local.source===JSON.stringify(plan),adapterRegistered:false};canvas.width=1;return out;
};
})();
