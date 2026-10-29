// Only the once-installed frame controller receives this synchronous capability.
// No public proposal/model payload can substitute for the owner's opaque token.
function withViewportCandidate86aw(token,index,{renderer,plan},fn){return viewportOperation86ag(()=>{
 const r=viewportRecord86ag(token);try{
  need(typeof fn==='function'&&Object.prototype.toString.call(fn)!=='[object AsyncFunction]','BULBS86AW_SYNC_CALLBACK');
  viewportCheck86ag(r);RT.renderer(renderer,r.renderer);need(keys(plan)===r.fullKey,'BULBS86AW_PLAN');
  need(r.phase==='ready'&&r.value&&r.candidateEvaluation&&r.value.recipe===r.recipeId&&r.value.delta.every(x=>Object.is(x,0))&&r.value.quality.every(q=>q.passed===true),'BULBS86AW_NOT_READY');
  const e=r.candidateEvaluation,candidates=[];if(e.zero.passed)candidates.push({side:'zero',delta:[0,0]});for(const p of e.positions)if(p.evaluation.passed)candidates.push(p);
  need(Number.isInteger(index)&&index>=0&&index<candidates.length,'BULBS86AW_CANDIDATE');const selected=candidates[index];
  const binding=Object.freeze({viewport:r.viewport,recipeId:r.recipeId,delta:Object.freeze(selected.delta.slice()),circle:e.circle.circle,renderer:r.renderer,ctx:r.ctx,sourceOnly:true,framePermission:false});
  borrowWork.viewportCandidate={index,viewport:r.viewport,recipeId:r.recipeId,delta:binding.delta,circle:binding.circle,privateReferenceSlots:6};account(6*96);
  let callbackActive=true;const onWork=n=>{need(callbackActive&&viewportBusy86ag&&borrowed&&viewportJob86ag===r,'BULBS86AW_CALLBACK_EXPIRED');need(Number.isSafeInteger(n)&&n>=0,'BULBS86AW_WORK');return account(n+6*96)};
  let value;try{value=fn(r.entry.model,binding,onWork)}finally{callbackActive=false}need(!value||typeof value.then!=='function','BULBS86AW_SYNC_CALLBACK');borrowWork.value=value;account(6*96);
  viewportCheck86ag(r);RT.renderer(renderer,r.renderer);need(keys(plan)===r.fullKey,'BULBS86AW_PLAN');return value;
 }catch(error){try{viewportClear86ag()}catch{}throw error}
})}
