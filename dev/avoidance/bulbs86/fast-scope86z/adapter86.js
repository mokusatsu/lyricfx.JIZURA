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
// Reserve three64KiB serialized slots: previous report, current bounded
// witnesses, replacement report (16 witnesses;64code/256message UTF16).
let preparedStage=null,stageGeneration=0;let work=null;const reservedBytes=()=>C.serializedBytes({work,stage:preparedStage&&{generation:preparedStage.generation,key:preparedStage.key,plan:preparedStage.plan,phase:preparedStage.phase,handle:preparedStage.handle}})+3*65536+4096;
function runtimeAdmission({plan}){return issuer.admit(plan)}
function finalizationLifecycle({phase,plan,trajectory}){
 if(phase==='validated'){need(work&&work.workingPlan===plan,'BULBS80W_LIFECYCLE_PLAN');work.lifecyclePhase='validated';issuer.checkBudget(work.ownerReservedBytes);return}
 if(phase==='finalized'){if(work?.workingPlan===plan){issuer.checkBudget(work.ownerReservedBytes);work=null}return}
 if(phase==='failed'||phase==='aborted'){const current=work?.workingPlan===plan?work:null,certificate=current?.certificate||trajectory?.certificate;try{if(certificate)issuer.drop(certificate);else if(current?.created)issuer.releaseTicket(current.created.ticket)}finally{if(current)work=null}return}
 need(false,'BULBS80V_LIFECYCLE_PHASE');
}
const issuer=F.installPlanIssuer80({adapterId:REV,runtimeAdmission,finalizationLifecycle,reservedBytes});
// Exact private canonical context; no context-equivalence or raw model seam.

const stageKey=p=>JSON.stringify(C.exact(p));
function revokeStage(){const old=preparedStage;preparedStage=null;stageGeneration++;if(old){try{old.job?.cancel()}finally{if(old.handle)try{O.drop(old.handle)}catch(e){if(e.code!=='BULBS80N_UNKNOWN_OR_EVICTED')throw e}old.plan=null;old.key=null;old.handle=null;old.job=null}}}
function requirePrepared(native){const key=stageKey(native);if(work)work.stageKey=key;if(preparedStage?.key===key&&preparedStage.phase==='complete'){try{O.withPreparedModel(preparedStage.handle,{renderer,plan:native,ctx},()=>null)}catch(e){try{revokeStage()}finally{if(!['BULBS80N_STALE_MODEL','BULBS80N_UNKNOWN_OR_EVICTED'].includes(e?.code))throw e}}}if(!preparedStage||preparedStage.key!==key){revokeStage();preparedStage={generation:stageGeneration,key,plan:native,phase:'unprepared',job:null,handle:null};try{issuer.checkBudget(0)}catch(e){try{revokeStage()}finally{throw e}}}need(preparedStage.phase==='complete'&&preparedStage.handle,'BULBS86D_PREPARE_REQUIRED');return preparedStage.handle}
function stageState(){return Object.freeze({generation:stageGeneration,phase:preparedStage?.phase||'empty',modelExposed:false,sourceOnly:true,UIConnected:false})}
const preparationApi=Object.freeze({state:stageState,cancel(){revokeStage();return stageState()},begin(){need(preparedStage&&preparedStage.phase==='unprepared','BULBS86D_STAGE_REQUIRED');const current=preparedStage;try{current.job=O.beginPreparation86c({renderer,plan:current.plan,ctx,isCurrent:()=>preparedStage===current&&stageGeneration===current.generation});current.phase='preparing';issuer.checkBudget(0);return stageState()}catch(e){revokeStage();throw e}},step(){const current=preparedStage;need(current?.phase==='preparing','BULBS86D_STAGE_REQUIRED');try{const status=current.job.step();if(status.phase==='complete'){current.handle=current.job.finish();current.phase='complete'}issuer.checkBudget(0);return stageState()}catch(e){revokeStage();throw e}}});
Object.defineProperty(A,'bulbsPreparedAdapter86d',{value:preparationApi});

function finalize({plan,cut,revision,stepDur,reachTail,explicitSize}){
 need(work===null,'BULBS80V_REENTRANT');need(!explicitSize,'BULBS80V_EXPLICIT_SIZE_UNSUPPORTED');
 work={workingPlan:plan,nativePlan:nativePlan(plan),candidates:[],failures:[],geometry:null,ownerReservedBytes:0,current:null,created:null,certificate:null,trajectory:null};
 // Core lifecycle owns clearing work on both success and failure, including a
 // failure after this function returns but before09k validates/assigns the result.
 const handle=requirePrepared(work.nativePlan);
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
