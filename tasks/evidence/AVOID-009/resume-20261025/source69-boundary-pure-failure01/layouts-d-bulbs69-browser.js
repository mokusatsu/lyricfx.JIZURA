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
 local.unionTables=[];try{result=A.withBulbs69Diagnostic(value=>{if(value.phase==='recipe-complete')local.unionTables.push(value.table);store(value);},()=>J.finalizePlacementPlan(local.run.plan,{layoutsD:true}));}catch(e){store({phase:'finalize-exception',name:e.name,message:e.message,details:e.details});throw e;}
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
// Ordinary playback/state boundaries. These records have separate phases so the
// original ordered 250-frame source/oracle evidence remains unchanged.
const frameOptions69={noHud:true,noPost:true,noForeground:true,noMedia:true,fast:true};
async function hash69(ctx){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',ctx.getImageData(0,0,960,540).data))).map(n=>n.toString(16).padStart(2,'0')).join('');}
window.boundaryFrame69=async({n,label,plan=window.bulbs69Local.final})=>{
 const local=window.bulbs69Local,state=local.clocks.states.find(s=>s.n===n);need(state,'BULBS69_BOUNDARY_STATE');const canvas=document.createElement('canvas');canvas.width=960;canvas.height=540;const ctx=canvas.getContext('2d'),observations=[];
 const proof=[];try{A.withBulbs69Diagnostic(value=>{if(value.phase==='recipe-complete'||value.phase==='complete')proof.push(value);},()=>local.run.renderer.frame(ctx,plan,state.firstTime,{...frameOptions69,placementObservation:o=>observations.push(o)}));for(const v of proof.filter(v=>v.phase==='recipe-complete'))need(A.bulbsProof69.same(v.table,local.unionTables.find(t=>t.recipe===v.table.recipe)),'BULBS69_REDECODE_UNION_CHANGED');const hash=await hash69(ctx),winner=plan.cuts[0].placementTrajectory.certificate.winner;let oracle;
 if(winner.recipe.native){const cv=document.createElement('canvas');cv.width=960;cv.height=540;try{local.run.renderer.frame(cv.getContext('2d'),local.run.plan,state.firstTime,frameOptions69);oracle={oracleSHA256:await hash69(cv.getContext('2d')),wrapperErrors:[]};}finally{cv.width=1;}}
 else oracle=await window.oracleFrame69({state,candidate:winner});
 need(hash===oracle.oracleSHA256&&!oracle.wrapperErrors?.length,'BULBS69_BOUNDARY_ORACLE');const passes=state.passes.filter(p=>p.active).map(p=>p.pass);need(JSON.stringify(observations.map(o=>o.pass))===JSON.stringify(passes)&&observations.every(o=>o.realTime===state.firstTime),'BULBS69_BOUNDARY_OWNPASS');
 const row={phase:'boundary-frame',label,n,time:state.firstTime,hash,observations,oracle,expectedPasses:passes,recomputedProof:proof,stats:A.bulbs69Stats()};store(row);return{n,hash,passes};}finally{canvas.width=1;}
};
window.negativeBoundaries69=async()=>{
 const local=window.bulbs69Local,plan=local.final,rows=[];
 for(const kind of['stale-plan','font-revision','helper-reference','frame-options','frame-context']){
  const canvas=document.createElement('canvas');canvas.width=960;canvas.height=540;const ctx=canvas.getContext('2d');ctx.fillStyle='#812345';ctx.fillRect(0,0,960,540);const before=await hash69(ctx),observations=[];let target=plan,opt={...frameOptions69,placementObservation:o=>observations.push(o)},error=null,restore=()=>{};
  if(kind==='stale-plan')target={...plan,cuts:plan.cuts.map(c=>({...c,text:c.text+'!'}))};
  if(kind==='font-revision'){const old=J.metrics.revision;J.metrics.revision=(old||0)+1;restore=()=>{J.metrics.revision=old;};}
  if(kind==='helper-reference'){const old=J.measure;J.measure=function(...args){return old.apply(this,args);};restore=()=>{J.measure=old;};}
  if(kind==='frame-options')opt.noPost=false;
  if(kind==='frame-context')ctx.letterSpacing='1px';
  try{local.run.renderer.frame(ctx,target,1.5,opt);}catch(e){error={code:e.code,name:e.name,message:e.message};}finally{restore();}
  const after=await hash69(ctx);need(error&&before===after&&!observations.length,'BULBS69_NEGATIVE_NOT_ATOMIC:'+kind);const expected={'stale-plan':'STALE_PLACEMENT_PLAN','font-revision':'STALE_PLACEMENT_PLAN','helper-reference':'BULBS69_STALE_DEPENDENCY','frame-options':'BULBS69_FRAME_OPTIONS','frame-context':'BULBS69_ACTUAL_CONTEXT'}[kind];need(error.code===expected||error.message===expected,'BULBS69_NEGATIVE_REASON:'+kind);rows.push({kind,error,before,after,observations});canvas.width=1;
 }
 const unsupported=A.bulbsProof69.clone(local.run.plan);unsupported.cuts[0].lyricSize=40;const finalized=J.finalizePlacementPlan(unsupported,{layoutsD:true}),trajectory=finalized.cuts[0].placementTrajectory;need(trajectory?.safety!=='certified-bounded-adapter'&&!trajectory?.units?.some(u=>u.segments?.some(s=>s.status==='safe')),'BULBS69_UNSUPPORTED_SILENT_SAFE');
 store({phase:'boundary-negatives',rows,unsupported:{input:unsupported,trajectory,diagnostics:finalized.placementFinalization?.diagnostics},stats:A.bulbs69Stats()});return{cases:rows.length,unsupportedSafe:false};
};
window.cacheCircle69=({cx,cy,label})=>{
 const local=window.bulbs69Local,plan=A.bulbsProof69.clone(local.run.plan);plan.lyricAvoidanceIndex.regions[0].center={x:cx,y:cy};const before=A.bulbs69Stats(),proof=[],result=A.withBulbs69Diagnostic(value=>{if(value.phase==='recipe-complete'||value.phase==='complete')proof.push(value);},()=>J.finalizePlacementPlan(plan,{layoutsD:true})),trajectory=result.cuts[0].placementTrajectory,after=A.bulbs69Stats(),tables=proof.filter(v=>v.phase==='recipe-complete');
 need(tables.length===4&&tables.every(v=>A.bulbsProof69.same(v.table,local.unionTables.find(t=>t.recipe===v.table.recipe))),'BULBS69_CIRCLE_UNION_CHANGED');need(after.cacheEntries===2&&after.proofRuns===before.proofRuns+1,'BULBS69_CACHE_CIRCLE_PROOF');local.cachePlans??=[];local.cachePlans.push(result);store({phase:'boundary-cache-circle',label,input:plan,trajectory,proof,before,after,allSourceUnionValuesEqual:true,fullPaintsResaved:false});return{accepted:trajectory?.safety==='certified-bounded-adapter',winner:trajectory?.certificate?.winner,before,after};
};
window.cacheHit69=()=>{const local=window.bulbs69Local,before=A.bulbs69Stats(),result=J.finalizePlacementPlan(local.run.plan,{layoutsD:true}),after=A.bulbs69Stats();need(after.proofRuns===before.proofRuns&&after.proofHits===before.proofHits+1&&after.cacheEntries<=2,'BULBS69_CACHE_HIT');need(A.bulbsProof69.same(result.cuts[0].placementTrajectory.certificate,local.final.cuts[0].placementTrajectory.certificate),'BULBS69_CACHE_CERTIFICATE_CHANGED');store({phase:'boundary-cache-hit',before,after,certificate:result.cuts[0].placementTrajectory.certificate});return{before,after};};
})();
