function createViewport86ax({viewportToken,index,renderer,plan,timing=null}){
 need(activeFrame===null,'BULBS80O_FRAME_ACTIVE');need(!plan.placementFinalization&&plan.cuts.length===1&&plan.cuts.every(c=>!c.placementTrajectory&&!c.fullStagePlacement&&!c.placementLayoutsA&&!c.placementLayoutsB&&!c.placementLayoutsC&&!c.placementLayoutsD),'BULBS80O_UNBOUND_NATIVE_PLAN');
 const frozenPlan=freeze(clone(plan));let record,ownerReservation=0;
 access.withViewportCandidate86aw(viewportToken,index,{renderer,plan:frozenPlan},(model,binding,onWork)=>{
  const {handle,ctx,viewport,recipeId,delta,circle}=binding,profile=context(ctx,viewport),evaluationRange=timing===null?null:RT.range(frozenPlan.cuts[0],timing);
  need(viewport.scale===.75&&viewport.width===720&&viewport.height===405,'BULBS86AX_VIEWPORT_SCOPE');
  const referenceIndex=new Map(),scheduleIndex=new Map(model.schedule.map((e,i)=>[e.n+':'+e.pass,i]));
  for(const ref of model.localTable.references)if(ref.recipe===recipeId){const i=scheduleIndex.get(ref.n+':'+ref.pass);need(i!==undefined&&!referenceIndex.has(i),'BULBS80O_REFERENCE_INDEX');referenceIndex.set(i,{template:ref.template})}
  need(referenceIndex.size===model.schedule.length,'BULBS80O_REFERENCE_COVERAGE');
  const retained=C.serializedBytes({referenceEntries:[...referenceIndex],scheduleEntries:[...scheduleIndex],frozenPlan,profile,circle,recipeId,delta,evaluationRange,timing,viewport});ownerReservation=onWork(retained);
  const proof=VR.replay({renderer,plan:frozenPlan,ctx,model,recipeId,delta,viewport,ownerReservation:()=>ownerReservation,beforeResume:()=>need(A.bulbsViewportRoot86ae===V&&A.bulbsViewportCandidateReplay86ax===VR,'BULBS86AX_SOURCE'),onAccounting:n=>onWork(retained+n)});
  need(proof.quality.every(q=>q.passed)&&VG.evaluation(proof.groups.map(g=>({owner:g.pass+'.'+g.semantic,bounds:g.bounds})),circle,[0,0],viewport).passed,'BULBS86AX_DESTINATION');
  record={id:++serial,referenceIndex,handle,modelId:access.residentId(handle),renderer,plan:frozenPlan,evaluationRange,circle,recipeId,delta:delta.slice(),viewport:Object.freeze({...viewport}),viewportToken,viewportCandidateIndex:index,profile,groups:freeze(clone(proof.groups)),held:freeze(clone(proof.heldInput[0])),deps:deps(renderer),sourceKey:planBindings?planBindings.sourceKey(frozenPlan):null};
  record.serializedBytes=C.serializedBytes({id:record.id,sourceKey:record.sourceKey,evaluationRange,circle,recipeId,delta:record.delta,viewport,viewportBinding:{token:viewportToken,index,referenceSlots:2},profile,groups:record.groups,held:record.held,referenceEntries:[...referenceIndex],dependency:record.deps,plan:frozenPlan});
  onWork(C.serializedBytes({referenceEntries:[...referenceIndex],scheduleEntries:[...scheduleIndex],proof,newRecord:{sourceKey:record.sourceKey,plan:frozenPlan,evaluationRange,timing,circle,recipeId,delta,viewport,viewportBinding:{token:viewportToken,index,referenceSlots:2},profile,groups:record.groups,held:record.held,dependency:record.deps}}));return null;
 });
 while(records.size>=2){const old=records.values().next().value;tickets.delete(old.ticket);records.delete(old.id);recordsBytes-=old.serializedBytes}
 const ticket=Object.freeze({kind:'bulbs-source-only-frame-ticket80',id:record.id});record.ticket=ticket;record.serializedBytes+=C.serializedBytes({ticketBinding:[ticket,record.id],mapKey:record.id,containerFraming:[null,null]});need(Math.max(ownerReservation,O.stats().residentBytes)+recordsBytes+record.serializedBytes<=8388608,'BULBS80O_RECORD_BUDGET');tickets.set(ticket,record.id);records.set(record.id,record);recordsBytes+=record.serializedBytes;return{ticket,plan:frozenPlan,sourceOnly:true,safetyCertified:false};
}
