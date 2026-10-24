/* SOURCE PREPARATION ONLY: pending SOURCE29 and parent runner gate. */
window.magnetsMedia29 = {
 async setup({fonts, after, expectedRevision}) {
  const spec={layout:'magnets',control:'off',ghost:true,W:960,H:540,text:'風の先へ',seed:1205,fps:60};
  const r=await runLayoutsBFixture(J,spec,{newPath:false,fonts,renderInitial:false,exportDataURL:false});
  r.plan.duration=4.150001;r.plan.fps=60;r.plan.fx.koma=0;r.plan.lyricAvoidanceIndex.regions[0].end=4.150001;
  const clean=v=>JSON.parse(JSON.stringify(v,(_,x)=>typeof x==='function'?undefined:x));
  if(r.plan.lyricAvoidanceIndex.enabled!==false)throw Error('Exact raw21 OFF source generation required');
  r.plan.lyricAvoidanceIndex.enabled=true;
  const sourceActual=r.plan,sourcePlan=clean(r.plan),sourceJSON=JSON.stringify(r.plan),cut=sourcePlan.cuts[0];
  if(cut.start!==0||cut.end!==4||cut.dur!==4||cut.displayEnd!==4||cut.seed!==1205||cut.text!=='風の先へ')throw Error('Exact raw21 source fixture required');
  if(after){J.placement.clearLayoutsCFinalCache();r.plan=J.finalizePlacementPlan(r.plan,{layoutsD:true});
   const tr=r.plan.cuts[0].placementTrajectory;if(tr?.revision!==expectedRevision||tr.safety!=='certified-bounded-adapter')throw Error('Accepted SOURCE29 bounded trajectory required');
  }else{r.plan=structuredClone(r.plan);Object.assign(r.plan.cuts[0],{area:null,fullStagePlacement:false,placementLayoutsD:true});}
  const state={r,after,sourceActual,sourcePlan,sourceJSON,sourceOriginal:sourceJSON,renderJSON:JSON.stringify(r.plan),observations:[],warnings:[]};window.media29State=state;
  const warn=console.warn.bind(console);console.warn=(...args)=>{state.warnings.push(args.map(v=>v?.message||String(v)));warn(...args);};
  if(!after){const native=J.LAYOUTS.magnets.render;J.LAYOUTS.magnets.render=function(env){try{return native(env);}finally{const m=env.ctx.getTransform();state.observations.push(clean({pass:env.pass,lt:env.lt,ltb:env.ltb,realTime:env.realTime,nativeGeometry:env.placementDGeometry,root:[m.a,m.b,m.c,m.d,m.e,m.f]}));}};}
  state.clean=clean;return {sourcePlan,renderPlan:clean(r.plan),fontAudit:window.layoutsBFixtureFontAudit,fontLoaded:r.observation.fontLoaded,dpr:devicePixelRatio,sourceCut:cut,enabledInput:'RAW21 OFF generation then enabled=true on both sides; no automatic planning'};
 },
 async frame(n){const s=media29State,r=s.r;s.observations=[];s.warnings=[];
  r.renderer.frame(r.canvas.getContext('2d'),r.plan,n/60,{noHud:true,noPost:true,scale:1,allowFilter:false,placementObservation:o=>s.observations.push(o)});
  if(JSON.stringify(r.plan)!==s.renderJSON||JSON.stringify(s.sourceActual)!==s.sourceOriginal)throw Error('Source or render plan mutated');
  const bytes=r.canvas.getContext('2d').getImageData(0,0,960,540).data;
  const pixelHash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(v=>v.toString(16).padStart(2,'0')).join('');
  if(s.after)for(const o of s.observations){if(!Array.isArray(o.actual))throw Error('Complete SOURCE29 actual geometry required');for(const a of o.actual)if(!a.circleClear||!a.stageContained)throw Error('Actual bounded geometry failure');}
  return {frame:n,time:n/60,pixelHash,observations:s.clean(s.observations),warnings:s.warnings,png:r.canvas.toDataURL('image/png')};
 }
};
