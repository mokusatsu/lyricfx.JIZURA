/* Explicit opt-in only. No UI installation and no compile in finalize/frame. */
(()=>{'use strict';const A=J.placement,C=A.bulbsScalarCompiler80,F=A.billboardPrivatePrepare81n2;
const need=(v,code)=>{if(!v)throw Object.assign(Error(code),{code})};
function create({adapterId='billboard_prepared81ab',generation,currentGeneration,signal=null}){
 need(typeof currentGeneration==='function'&&Number.isSafeInteger(generation),'BILLBOARD81AB_ARGUMENTS');
 const owner=F.createOwner();let stage=null,prepared=null,work=null,certificates=[],closed=false,busy=false;
 const key=x=>JSON.stringify(C.exact(x)),clone=x=>Array.isArray(x)?x.map(clone):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,clone(v)])):x;
 const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x)}return x};
 // Conservative multiple representations include stage clone, source string,
 // fingerprint string, wrapper/framing and current issue/cleanup metadata.
 const bytes=()=>4*C.serializedBytes({stage,prepared,work,certificates,generation,closed,busy})+4096;
 const account=()=>{need(bytes()<=131072,'BILLBOARD81AB_STAGE_BUDGET');return bytes()};
 const bridge=owner.installPlanBridge({adapterId,adapterReservedBytes:bytes});
 const live=()=>{need(!closed&&!signal?.aborted,'BILLBOARD81AB_CANCELLED');need(Object.is(currentGeneration(),generation),'BILLBOARD81AB_GENERATION_STALE');need(A.billboardPrivatePrepare81n2===F&&A.bulbsScalarCompiler80===C,'BILLBOARD81AB_SOURCE_STALE')};
 const guard=()=>{live();need(stage&&F.stageFingerprint()===stage.fingerprint,'BILLBOARD81AB_DEPENDENCY_STALE');account()};
 const exclusive=fn=>{need(!busy,'BILLBOARD81AB_REENTRANT');busy=true;try{return fn()}finally{busy=false}};
 function releaseCertificate(certificate){const index=certificates.indexOf(certificate);if(index>=0)certificates.splice(index,1);bridge.release(certificate)}
 function cleanup(){const old=work;work=null;if(!old)return;try{if(old.certificate)releaseCertificate(old.certificate);else if(old.ticket)bridge.releaseTicket(old.ticket)}finally{account()}}
 function capture(plan,signature){
  // sourceKey validates dense data descriptors before any recursive clone.
  const fingerprint=F.stageFingerprint();need(4*C.serializedBytes({plan,signature,fingerprint,generation})+bytes()<=131072,'BILLBOARD81AB_STAGE_BUDGET');
  for(const certificate of certificates.slice())releaseCertificate(certificate);owner.drop();prepared=null;stage=null;const canonical=clone(plan);delete canonical.placementFinalization;
  const cut=canonical.cuts[0];for(const k of ['placementTrajectory','layoutDRecipe'])delete cut[k];cut.placementLayoutsD=true;cut.fullStagePlacement=true;cut.placementUnits=true;
  stage={plan:freeze(canonical),signature,fingerprint};try{account();need(bridge.sourceKey(stage.plan)===signature,'BILLBOARD81AB_SOURCE_KEY')}catch(error){stage=null;throw error}
 }
 const adapter=Object.freeze({id:adapterId,
  finalize({plan,cut}){return exclusive(()=>{live();need(plan.cuts.length===1&&plan.cuts[0]===cut&&cut.layout==='billboard','BILLBOARD81AB_ONE_CUT');cleanup();const signature=bridge.sourceKey(plan);
   if(!stage||signature!==stage.signature||F.stageFingerprint()!==stage.fingerprint){capture(plan,signature);need(false,'BILLBOARD81AB_PREPARE_REQUIRED')}
   guard();need(prepared&&prepared.signature===signature,'BILLBOARD81AB_PREPARE_REQUIRED');owner.validate(prepared.handle);
   for(const certificate of certificates.slice())releaseCertificate(certificate);work={plan,ticket:null,certificate:null};account();try{work.ticket=owner.ticketForPlan(prepared.handle,plan);account();const issued=bridge.issue({plan,ticket:work.ticket});work.certificate=issued.certificate;certificates.push(issued.certificate);account();return {...issued.trajectory,certificate:issued.certificate}}catch(error){try{cleanup()}catch{}throw error}
  })},
  runtimeAdmission:({plan})=>bridge.admit(plan),
  finalizationLifecycle({phase,trajectory}){return exclusive(()=>{if(phase==='failed'||phase==='aborted'){if(work)cleanup();else if(trajectory?.certificate&&certificates.includes(trajectory.certificate))releaseCertificate(trajectory.certificate);account();return}guard();if(phase==='finalized'){bridge.checkBudget();work=null;account()}else if(phase==='validated'){bridge.checkBudget();account()}})},
  render(){need(false,'BILLBOARD81AB_PRIVATE_FRAME_REQUIRED')}
 });
 return Object.freeze({adapter,
  begin(){return exclusive(()=>{guard();cleanup();prepared=null;owner.begin({plan:stage.plan,generation,currentGeneration,signal,callerReservedBytes:account()});return {sourceOnly:true}})},
  step(){return exclusive(()=>{guard();try{return owner.step()}catch(error){prepared=null;throw error}})},
  commit(){return exclusive(()=>{guard();const handle=owner.commit();prepared={handle,signature:stage.signature};guard();owner.validate(handle);return Object.freeze({ready:true,sourceOnly:true})})},
  cancel(){return exclusive(()=>{closed=true;try{cleanup()}finally{try{for(const certificate of certificates.slice())releaseCertificate(certificate)}finally{try{owner.drop()}finally{stage=null;prepared=null;work=null}}}})},
  stats:()=>({staged:!!stage,prepared:!!prepared,retainedSerializedBytes:bytes(),owner:owner.stats(),sourceOnly:true,uiConnected:false}),
  // A failed marker is handled by the same genuine private frame needs gate.
  needs:plan=>bridge.needs(plan),admit:plan=>bridge.admit(plan)
 });
}
Object.defineProperty(A,'billboardPreparedAdapter81ab',{value:Object.freeze({create,sourceOnly:true,uiConnected:false})});})();
