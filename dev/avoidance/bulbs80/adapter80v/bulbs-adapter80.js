/* Actual opt-in D adapter source proposal. Requires80u+data lifecycle bridge;
   no product application/build/Canvas qualification. Load late, after11wa stock
   frame wrapper, all transport witnesses and80 dependencies, before12_ui. */
(()=>{'use strict';
const A=J.placement,O=A.bulbsModelOwner80,F=A.bulbsFrameController80,C=A.bulbsScalarCompiler80,G=A.bulbsGeometry68,REV='bulbs-owned-source80-v1',need=(v,c,d)=>{if(!v)throw Object.assign(Error(c),{code:c,details:d})};
need(!A.layoutsDRegisteredAdapters().some(a=>a.layout==='bulbs'),'BULBS80V_REGISTRATION_CONFLICT');
const cv=document.createElement('canvas');cv.width=960;cv.height=540;const ctx=cv.getContext('2d'),renderer=Object.create(J.Renderer.prototype);
const excluded=['placementTrajectory','fullStagePlacement','placementUnits','placementGlyphs','placementLayoutsA','placementLayoutsB','placementLayoutsC','placementLayoutsD','layoutDRecipe','layoutCRecipe','layoutBRecipe','layoutBEvaluationRange','placementAdaptiveTrial','layoutARecipe','layoutAHoldRange','placementSelectionOrigin'];
const copy=x=>Array.isArray(x)?x.map(copy):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,copy(v)])):x;
function nativePlan(plan){const p=copy(plan);delete p.placementFinalization;p.cuts=p.cuts.map(c=>{for(const k of excluded)delete c[k];return c});return p}
let work=null;const reservedBytes=()=>C.serializedBytes({work});
function runtimeAdmission({plan}){return issuer.admit(plan)}
function finalizationLifecycle({phase,trajectory}){
 if(!work)return;
 if(phase==='validated'){work=null;return}
 if(phase==='failed'){const current=work;try{if(current.certificate)issuer.drop(current.certificate);else if(current.created)issuer.releaseTicket(current.created.ticket)}finally{work=null}return}
 need(false,'BULBS80V_LIFECYCLE_PHASE');
}
const issuer=F.installPlanIssuer80({adapterId:REV,runtimeAdmission,finalizationLifecycle,reservedBytes});
function finalize({plan,cut,revision,stepDur,reachTail,explicitSize}){
 need(work===null,'BULBS80V_REENTRANT');need(!explicitSize,'BULBS80V_EXPLICIT_SIZE_UNSUPPORTED');
 work={workingPlan:plan,nativePlan:nativePlan(plan),candidates:[],failures:[],geometry:null,ownerReservedBytes:0,current:null,created:null,certificate:null,trajectory:null};
 // Core lifecycle owns clearing work on both success and failure, including a
 // failure after this function returns but before09k validates/assigns the result.
 const handle=O.prepare({renderer,plan:work.nativePlan,ctx});
 O.withPreparedModel(handle,{renderer,plan:work.nativePlan,ctx},(model,resource)=>{work.ownerReservedBytes=resource.reservedSerializedBytes;
  const region=plan.lyricAvoidanceIndex.regions[0],circle={cx:region.center.x*960,cy:region.center.y*540,r:region.radius*540,margin:2.7};
  for(const q of model.heldQualityEvaluation.results){if(!q.passed)continue;work.geometry={region,circle,quality:q,selectedGroups:model.groups.filter(g=>g.recipe===q.recipe),supports:null,zero:null,positions:null,currentPosition:null};work.geometry.supports=work.geometry.selectedGroups.map(g=>({owner:g.pass+'.'+g.semantic,bounds:g.bounds}));issuer.checkBudget(work.ownerReservedBytes);work.geometry.zero=G.evaluation(work.geometry.supports,circle,[0,0]);issuer.checkBudget(work.ownerReservedBytes);if(work.geometry.zero.passed){work.candidates.push({recipeId:q.recipe,delta:[0,0]});issuer.checkBudget(work.ownerReservedBytes)}work.geometry.positions=G.positions(work.geometry.supports,circle);issuer.checkBudget(work.ownerReservedBytes);for(const position of work.geometry.positions){work.geometry.currentPosition=position;if(position.evaluation.passed)work.candidates.push({recipeId:q.recipe,delta:position.delta.slice()});issuer.checkBudget(work.ownerReservedBytes)}}work.geometry=null;
  need(work.candidates.length<=28,'BULBS80V_CANDIDATE_DOMAIN');return work.candidates;
 });
 need(work.candidates.length>0,'BULBS80V_INSUFFICIENT_SPACE');
 const failures=work.failures;
 for(const candidate of work.candidates){work.current=candidate;issuer.checkBudget(work.ownerReservedBytes);try{
  work.created=F.create({handle,renderer,plan:work.nativePlan,ctx,...candidate,timing:{stepDur,reachTail}});
  const r=plan.lyricAvoidanceIndex.regions[0],end=Math.min(r.end??plan.duration,plan.duration);
  work.trajectory={kind:'layouts-d-source-native',version:1,revision,evaluationRange:[Math.min(cut.start,cut.renderStart??cut.start)-stepDur,Math.max(cut.end,cut.displayEnd??cut.end)+reachTail],measurementSupported:true,safety:'certified-bounded-adapter',units:[{owner:'bulbs.sign',segments:[{start:r.start,end,region:r.id,circle:{cx:r.center.x*960,cy:r.center.y*540,r:r.radius*540},from:candidate.delta.slice(),to:candidate.delta.slice(),status:'safe',decision:'certified'}]}],sourceProof:{kind:REV,allPrimary:true,completeOwnedClockModel:true,currentFrameOwnLimit:3,recipe:candidate.recipeId,formalPerformanceAccepted:false,uiConnected:false}};
  work.certificate=issuer.issue({plan,ticket:work.created.ticket,trajectory:work.trajectory});return{...work.trajectory,certificate:work.certificate};
 }catch(e){if(work.certificate){issuer.drop(work.certificate);work.certificate=null}else if(work.created)issuer.releaseTicket(work.created.ticket);work.created=null;work.trajectory=null;failures.push({candidate,code:e.code||'DRAW_PROGRAM_ERROR'});issuer.checkBudget(work.ownerReservedBytes);if(e.code!=='BULBS80O_DESTINATION')throw e}}
 need(false,'BULBS80V_INSUFFICIENT_SPACE',{attempts:failures});
}
A.registerLayoutsDAdapter('bulbs',{id:REV,finalize,render(){need(false,'BULBS80V_PRIVATE_FRAME_REQUIRED')},runtimeAdmission,finalizationLifecycle});
Object.defineProperty(A,'bulbs80Stats',{enumerable:true,value:Object.freeze(()=>Object.freeze({owner:O.stats(),reservation:issuer.resources(),sourceOnly:true,safetyCertified:false,outerFinalizerCleanupQualified:false}))});
F.connectRenderer();
})();
