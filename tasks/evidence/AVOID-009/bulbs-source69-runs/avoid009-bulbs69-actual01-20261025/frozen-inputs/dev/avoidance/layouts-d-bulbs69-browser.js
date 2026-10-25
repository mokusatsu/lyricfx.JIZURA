/* Local SOURCE69 harness. Independent oracle never calls recipe binding/record. */
(()=>{'use strict';
const need=(v,c)=>{if(!v)throw Error(c);},A=J.placement,view=new DataView(new ArrayBuffer(8));
const encode=x=>{if(x===undefined)return{$undefined:true};if(typeof x==='number'){need(Number.isFinite(x),'BULBS69_RAW_FINITE');view.setFloat64(0,x);return{$f64:view.getBigUint64(0).toString(16).padStart(16,'0')};}if(Array.isArray(x))return x.map(encode);if(x&&typeof x==='object')return Object.fromEntries(Object.entries(x).map(([k,v])=>[k,encode(v)]));need(typeof x!=='function','BULBS69_RAW_FUNCTION');return x;};
let sequence=0;
function store(value){const xhr=new XMLHttpRequest();xhr.open('POST','/raw',false);xhr.setRequestHeader('Content-Type','application/json');xhr.send(JSON.stringify({sequence:sequence++,value:encode(value)}));need(xhr.status===200,'BULBS69_RAW_STORAGE_FAILURE');}
window.initBulbs69=async({fonts,cx=.5,cy=.42,radius=.2,nativeOnly=false})=>{
 const run=await runLayoutsBFixture(J,{layout:'bulbs',control:'fullstage',ghost:true,W:960,H:540,seed:1205,text:'風の先へ',cx,cy,radius,params:{font:'dela',shape:'board',chase:'chase',dir:1,sub:true}},{newPath:false,fonts,renderInitial:false,exportDataURL:false}),p=run.plan;
 p.duration=4.150001;p.fps=60;p.fx.koma=0;p.lyricAvoidanceIndex.regions[0].end=p.duration;
 // Match the actual plan's language; no forced language for a different plan.
 if(J.lang!==p.lang)J.setLang(p.lang);need(p.lang==='ja','BULBS69_INITIAL_LANGUAGE_UNSUPPORTED');
 const primitives=window.oracle69Primitives;
 // Snapshot for independent native-closure oracle, not a saved native geometry input.
 const helpers=[J.mainDraw,J.drawFx,J.drawItem,J.layoutText,J.fontCSS,J.measure,J.fitSize,J.stepDur,J.komaOf,J.lyricCutsAt,J.lyricRenderCut,J.CAMERA.push.get,J.clamp,J.lerp,J.h,J.r,J.rs,J.Renderer.prototype.frame,J.Renderer.prototype.makeEnv,J.Renderer.prototype.drawCut,A.inverse,A.record,A.replay,A.withRole,J.metrics.adv,J.faceOf,J.fontForChar,J.mix,J.lum,J.contrast,J.romaji];
 window.bulbs59Run={r:run,plan:p,cut:p.cuts[0],source:JSON.stringify(p),binding:{revision:J.metrics.revision,fonts:JSON.stringify(J.FONTS),faces:JSON.stringify([...document.fonts].map(f=>[f.family,f.style,f.weight,f.status])),source:J.LAYOUTS.bulbs.render,helpers}};
 const clocks=A.tilesProof48.clock(p,p.cuts[0]);window.bulbs69Local={run,clocks,nativeOnly,primitives};store({phase:'init',plan:p,clocks,fontAudit:window.layoutsBFixtureFontAudit,nativeOnly});return{language:p.lang,clocks:clocks.actualCounts};
};
window.finalizeBulbs69=()=>{const local=window.bulbs69Local;need(!local.nativeOnly,'BULBS69_NATIVE_ONLY');const before=JSON.stringify(local.run.plan);let result;
 try{result=A.withBulbs69Diagnostic(store,()=>J.finalizePlacementPlan(local.run.plan,{layoutsD:true}));}catch(e){store({phase:'finalize-exception',name:e.name,message:e.message,details:e.details});throw e;}
 need(JSON.stringify(local.run.plan)===before,'BULBS69_ORIGINAL_PLAN_MUTATED');local.final=result;const tr=result.cuts[0].placementTrajectory;store({phase:'finalized',trajectory:tr,diagnostics:result.placementFinalization?.diagnostics,stats:A.bulbs69Stats()});return{accepted:tr?.safety==='certified-bounded-adapter',winner:tr?.certificate?.winner,diagnostics:result.placementFinalization?.diagnostics};
};
window.frameBulbs69=async({n,useProduct=true})=>{const local=window.bulbs69Local,state=local.clocks.states.find(s=>s.n===n);need(state,'BULBS69_STATE');const plan=useProduct?local.final:local.run.plan;need(plan,'BULBS69_PLAN');const canvas=document.createElement('canvas');canvas.width=960;canvas.height=540;const ctx=canvas.getContext('2d'),observations=[];
 local.run.renderer.frame(ctx,plan,state.firstTime,{noHud:true,noPost:true,noForeground:true,noMedia:true,fast:true,placementObservation:o=>observations.push(o)});
 const rgba=ctx.getImageData(0,0,960,540).data,hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',rgba))).map(n=>n.toString(16).padStart(2,'0')).join('');store({phase:useProduct?'product-frame':'native-frame',n,time:state.firstTime,hash,observations});canvas.width=1;return{n,hash,observations:observations.length};
};
window.independentBulbs69=async({n,candidate})=>{const local=window.bulbs69Local,state=local.clocks.states.find(s=>s.n===n);need(state,'BULBS69_ORACLE_STATE');
 if(candidate.recipe.native)return window.frameBulbs69({n,useProduct:false});
 const result=await window.oracleFrame69({state,candidate});store({phase:'independent-native-closure-oracle',n,result});return{n,hash:result.oracleSHA256};
};
// Previously approved fixed candidate is a control, never the production winner assertion.
window.historicalControl69=async({n})=>{const local=window.bulbs69Local,state=local.clocks.states.find(s=>s.n===n),ctx=document.createElement('canvas').getContext('2d');ctx.canvas.width=960;ctx.canvas.height=540;const recipe=A.bulbsGeometry68.recipes.find(r=>r.id==='two-row-95'),delta=[293.1329669691148,0],samples=[];
 for(const own of state.passes.filter(p=>p.active)){ctx.save();try{const cut={...local.run.plan.cuts[0],placementLayoutsD:true,fullStagePlacement:true},env=A.bulbsProof69.makeEnv(local.run.renderer,local.run.plan,cut,ctx,own,state.firstTime),sample=A.bulbsProof69.sample(local.run.renderer,env,recipe,delta,{fidelity:true}),r=local.run.plan.lyricAvoidanceIndex.regions[0],circle={cx:r.center.x*960,cy:r.center.y*540,r:r.radius*540,margin:2.7},evaluation=sample.supports.length?A.bulbsGeometry68.evaluation(sample.supports,circle,[0,0]):{passed:sample.reference.culled};samples.push({own,sample,evaluation});}finally{ctx.restore();ctx.beginPath();}}
 store({phase:'historical59A-fresh-control',n,delta,samples,notWinnerConstraint:true});ctx.canvas.width=1;return{n,passed:samples.every(s=>s.sample.quality.passed&&s.evaluation.passed)};
};
})();
