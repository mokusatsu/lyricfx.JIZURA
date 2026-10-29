/* Actual opt-in D adapter source proposal. Requires80u+data lifecycle bridge;
   no product application/build/Canvas qualification. Load late, after11wa stock
   frame wrapper, all transport witnesses and80 dependencies, before12_ui. */
(()=>{'use strict';
const A=J.placement,O=A.bulbsModelOwner80,F=A.bulbsFrameController80,C=A.bulbsScalarCompiler80,G=A.bulbsGeometry68,REV='bulbs-design-cooperative86bw-v1',need=(v,c,d)=>{if(!v)throw Object.assign(Error(c),{code:c,details:d})};
need(!A.layoutsDRegisteredAdapters().some(a=>a.layout==='bulbs'),'BULBS80V_REGISTRATION_CONFLICT');
const cv=document.createElement('canvas');cv.width=720;cv.height=405;const ctx=cv.getContext('2d'),renderer=Object.create(J.Renderer.prototype);
const excluded=['placementTrajectory','fullStagePlacement','placementUnits','placementGlyphs','placementLayoutsA','placementLayoutsB','placementLayoutsC','placementLayoutsD','layoutDRecipe','layoutCRecipe','layoutBRecipe','layoutBEvaluationRange','placementAdaptiveTrial','layoutARecipe','layoutAHoldRange','placementSelectionOrigin'];
const copy=x=>Array.isArray(x)?x.map(copy):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,copy(v)])):x;
function nativePlan(plan){const p=copy(plan);delete p.placementFinalization;p.cuts=p.cuts.map(c=>{for(const k of excluded)delete c[k];return c});return p}
// Reserve three64KiB serialized slots: previous report, current bounded
// witnesses, replacement report (16 witnesses;64code/256message UTF16).
let preparedStage=null,stageGeneration=0;let work=null;const reservedBytes=()=>C.serializedBytes({work,stage:preparedStage&&{generation:preparedStage.generation,key:preparedStage.key,plan:preparedStage.plan,phase:preparedStage.phase,handle:preparedStage.handle,readyRecordReferenceSlots:preparedStage.created?2:0,certificate:preparedStage.certificate??null}})+3*65536+4096+(preparedStage?.proofReservation||0);
function runtimeAdmission({plan}){return issuer.admit(plan)}
function finalizationLifecycle({phase,plan,trajectory}){
 if(phase==='validated'){need(work&&work.workingPlan===plan,'BULBS80W_LIFECYCLE_PLAN');work.lifecyclePhase='validated';issuer.checkBudget(work.ownerReservedBytes);return}
 if(phase==='finalized'){if(work?.workingPlan===plan){issuer.checkBudget(work.ownerReservedBytes);work=null}return}
 if(phase==='failed'||phase==='aborted'){const current=work?.workingPlan===plan?work:null,certificate=current?.certificate||trajectory?.certificate;try{if(certificate)issuer.drop(certificate);else if(current?.created)issuer.releaseTicket(current.created.ticket)}finally{if(current){work=null;if(current.created&&preparedStage?.created===current.created){preparedStage.created=null;preparedStage.certificate=null;revokeStage()}}}return}
 need(false,'BULBS80V_LIFECYCLE_PHASE');
}
const issuer=F.installPlanIssuer80({adapterId:REV,runtimeAdmission,finalizationLifecycle,reservedBytes});
// Exact private canonical context; no context-equivalence or raw model seam.

const stageKey=p=>JSON.stringify(C.exact(p));
function revokeStage(){const old=preparedStage;preparedStage=null;stageGeneration++;if(old){let failure=null;try{if(old.job)old.job.cancel();if(old.recordJob&&!old.recordJob.state().closed)old.recordJob.cancel()}catch(error){failure=error}try{if(old.certificate)issuer.drop(old.certificate);else if(old.created)issuer.releaseTicket(old.created.ticket)}catch(error){failure??=error}try{if(old.handle)O.drop(old.handle)}catch(error){if(error?.code!=='BULBS80N_UNKNOWN_OR_EVICTED')failure??=error}finally{old.plan=null;old.key=null;old.handle=null;old.job=null;old.recordJob=null;old.created=null;old.certificate=null;old.proofReservation=0}if(failure)throw failure}}
function requirePrepared(native){const key=stageKey(native);if(preparedStage?.key===key&&preparedStage.certificate)revokeStage();if(work)work.stageKey=key;if(preparedStage?.key===key&&preparedStage.phase==='complete'){try{O.withPreparedModel(preparedStage.handle,{renderer,plan:native,ctx},()=>null)}catch(e){try{revokeStage()}finally{if(!['BULBS80N_STALE_MODEL','BULBS80N_UNKNOWN_OR_EVICTED'].includes(e?.code))throw e}}}if(!preparedStage||preparedStage.key!==key){revokeStage();preparedStage={generation:stageGeneration,key,plan:native,phase:'unprepared',job:null,handle:null,recordJob:null,created:null,certificate:null,proofReservation:0,timing:null};try{issuer.checkBudget(0)}catch(e){try{revokeStage()}finally{throw e}}}need(preparedStage.phase==='complete'&&preparedStage.handle,'BULBS86D_PREPARE_REQUIRED');return preparedStage.handle}
function stageState(){return Object.freeze({generation:stageGeneration,phase:preparedStage?.phase||'empty',modelExposed:false,sourceOnly:true,UIConnected:false})}
const preparationApi=Object.freeze({state:stageState,cancel(){revokeStage();return stageState()},begin(){need(preparedStage&&preparedStage.phase==='unprepared','BULBS86D_STAGE_REQUIRED');const current=preparedStage;try{current.job=O.beginPreparation86c({renderer,plan:current.plan,ctx,isCurrent:()=>preparedStage===current&&stageGeneration===current.generation});current.phase='preparing';issuer.checkBudget(0);return stageState()}catch(e){revokeStage();throw e}},step(){const current=preparedStage;need(current&&['preparing','proof'].includes(current.phase),'BULBS86D_STAGE_REQUIRED');try{if(current.phase==='preparing'){const status=current.job.step();if(status.phase==='complete'){current.handle=current.job.finish();current.job=null;current.proofReservation=2097152;current.phase='proof';const stepDur=J.stepDur(current.plan.fx,current.plan.fps),reachTail=.6+2*stepDur+1.6/24+.06+.01;current.timing=Object.freeze({stepDur,reachTail});issuer.checkBudget(0);current.recordJob=F.beginDirectViewport86br({handle:current.handle,index:0,renderer,plan:current.plan,timing:current.timing})}}else{const status=current.recordJob.step();if(status.phase==='complete'){current.created=current.recordJob.finish();current.recordJob=null;current.proofReservation=0;current.phase='complete'}}issuer.checkBudget(0);return stageState()}catch(e){try{revokeStage()}catch{}throw e}}});
Object.defineProperty(A,'bulbsPreparedAdapter86d',{value:preparationApi});

function finalize({plan,cut,revision,stepDur,reachTail,explicitSize}){
 need(work===null,'BULBS80V_REENTRANT');need(!explicitSize,'BULBS80V_EXPLICIT_SIZE_UNSUPPORTED');
 work={workingPlan:plan,nativePlan:nativePlan(plan),ownerReservedBytes:0,created:null,certificate:null,trajectory:null};const handle=requirePrepared(work.nativePlan);
 need(preparedStage?.created&&Object.is(stepDur,preparedStage.timing.stepDur)&&Object.is(reachTail,preparedStage.timing.reachTail),'BULBS86BR_READY_RECORD');work.created=preparedStage.created;work.ownerReservedBytes=work.created.ownerReservedBytes;issuer.checkBudget(work.ownerReservedBytes);
 const r=plan.lyricAvoidanceIndex.regions[0],end=Math.min(r.end??plan.duration,plan.duration),viewport=work.created.viewport,deviceDelta=work.created.deviceDelta,logicalDelta=deviceDelta.map(v=>v/viewport.scale);need(logicalDelta.every(Number.isFinite),'BULBS86BJ_LOGICAL_DELTA');
 work.trajectory={kind:'layouts-d-source-native',version:1,revision,evaluationRange:[Math.min(cut.start,cut.renderStart??cut.start)-stepDur,Math.max(cut.end,cut.displayEnd??cut.end)+reachTail],measurementSupported:true,safety:'certified-bounded-adapter',units:[{owner:'bulbs.sign',segments:[{start:r.start,end,region:r.id,circle:{cx:r.center.x*plan.W,cy:r.center.y*plan.H,r:r.radius*plan.H},from:logicalDelta.slice(),to:logicalDelta.slice(),status:'safe',decision:'certified'}]}],sourceProof:{kind:REV,allPrimary:true,completeOwnedClockModel:true,currentFrameOwnLimit:3,recipe:work.created.recipeId,currentViewport:{...viewport},deviceDelta:deviceDelta.slice(),trajectoryCoordinateSpace:'logical-stage; actual private source shift uses deviceDelta',formalPerformanceAccepted:false,uiConnected:false}};
 work.certificate=issuer.issue({plan,ticket:work.created.ticket,trajectory:work.trajectory});preparedStage.certificate=work.certificate;return{...work.trajectory,certificate:work.certificate};
}

A.registerLayoutsDAdapter('bulbs',{id:REV,finalize,render(){need(false,'BULBS80V_PRIVATE_FRAME_REQUIRED')},runtimeAdmission,finalizationLifecycle});
Object.defineProperty(A,'bulbs80Stats',{enumerable:true,value:Object.freeze(()=>Object.freeze({owner:O.stats(),reservation:issuer.resources(),sourceOnly:true,safetyCertified:false,outerFinalizerCleanupQualified:false}))});
F.connectRenderer();
})();
