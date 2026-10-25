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
window.frameDomino73=async({n,mode})=>{
 const local=window.domino73Local,{run,plan}=local,canvas=run.canvas,ctx=canvas.getContext('2d');need(local.source===JSON.stringify(plan)&&local.fontRevision===J.metrics.revision&&J.LAYOUTS.dominoes.render===local.native,'DOMINO73_INPUT_DRIFT');
 const original=local.native,drawOwn=Object.getOwnPropertyDescriptor(J.LAYOUTS.dominoes,'render'),mainOwn=Object.getOwnPropertyDescriptor(J,'mainDraw'),main=J.mainDraw,passes=[],glyphs=[],wrapperErrors=[],saved=[];let current=null,observer,rows=[];
 function wrap(key){const own=Object.getOwnPropertyDescriptor(ctx,key),fn=ctx[key];need(typeof fn==='function','DOMINO73_CANVAS_METHOD:'+key);saved.push([key,own]);ctx[key]=function(...args){if(current)throw Error('DOMINO73_UNSUPPORTED_PAINT:'+key);return Reflect.apply(fn,this,args);};}
 try{
  observer=P.spy(ctx,()=>current);for(const key of ['clip','drawImage','putImageData','clearRect','createPattern','createLinearGradient','createRadialGradient','createConicGradient'])if(key in ctx)wrap(key);
  J.mainDraw=function(env,it){if(current===env)glyphs.push({pass:env.pass,item:P.clean(it),matrix:P.matrix(ctx),lt:env.lt,ltb:env.ltb,step:env.step,pIn:env.pIn,pOut:env.pOut});return Reflect.apply(main,this,[env,it]);};
  J.LAYOUTS.dominoes.render=function(env){const previous=current,ownership=Object.getOwnPropertyDescriptor(env,'drawOwnership');current=env;env.drawOwnership={role:'primary',owner:'dominoes.native-chain'};passes.push({pass:env.pass,t:env.t,lt:env.lt,ltb:env.ltb,step:env.step,pIn:env.pIn,pOut:env.pOut,root:P.matrix(ctx)});try{return Reflect.apply(mode==='oracle-moved'?J.domino73Oracle:original,this,[env]);}catch(e){wrapperErrors.push({message:e.message,pass:env.pass});throw e;}finally{if(ownership)Object.defineProperty(env,'drawOwnership',ownership);else delete env.drawOwnership;current=previous;}};
  const frame=()=>run.renderer.frame(ctx,plan,n/60,{noHud:true,noPost:true,noForeground:true,noMedia:true,fast:true});
  if(mode==='on-zero'||mode==='on-moved'){need(J.domino73,'DOMINO73_RUNTIME_MISSING');const value=J.domino73.withRecipe(mode==='on-zero'?{kind:'native'}:{kind:'joint-translation',deltas:[[17,-23]]},frame);rows=value.rows;}else frame();
 }finally{
  for(const [key,own]of saved.reverse())if(own)Object.defineProperty(ctx,key,own);else delete ctx[key];observer?.restore();if(mainOwn)Object.defineProperty(J,'mainDraw',mainOwn);else delete J.mainDraw;if(drawOwn)Object.defineProperty(J.LAYOUTS.dominoes,'render',drawOwn);else delete J.LAYOUTS.dominoes.render;
 }
 need(wrapperErrors.length===0,'DOMINO73_WRAPPER_ERROR');need(J.LAYOUTS.dominoes.render===original&&J.mainDraw===main,'DOMINO73_RESTORE');
 need(observer.records.every(p=>p.role==='primary'&&p.owner?.startsWith('dominoes.')),'DOMINO73_PRIMARY_OWNERS');
 return{n,time:n/60,mode,passes,glyphs,rows,records:observer.records,rgbaSHA256:await P.hash(ctx),wrapperErrors,sourceUnchanged:local.source===JSON.stringify(plan),adapterRegistered:false};
};
})();
