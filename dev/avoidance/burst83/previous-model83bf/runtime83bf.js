/* dev/avoidance/burst83/viewport-session83bd/runtime83bd.js */
/* Candidate source-only façade: current editable plan, input viewport, private owner. */
(()=>{'use strict';const A=J.placement,need=(v,c)=>{if(!v)throw Object.assign(Error(c),{code:c})};
function create({renderer,readViewport}){let unit=null,job=null,editable=null,formal=null,viewport=null,steps=0,cleanupFailed=false,initializationFailed=false;
 function cancel(reason){formal=null;job=null;editable=null;if(unit){try{if(['replan','begin','debounce'].includes(reason))unit.park();else unit.drop()}catch(e){cleanupFailed=true;throw e}}viewport=null}
 function stage(plan){need(!initializationFailed,'BURST83BD_INITIALIZATION_FAILED');need(!cleanupFailed&&!editable&&!job&&!formal,'BURST83BD_STAGE_BUSY');const v=readViewport(plan);need(Number.isSafeInteger(v.width)&&v.width>0&&Number.isSafeInteger(v.height)&&v.height>0&&v.scale===v.width/plan.W,'BURST83BD_VIEWPORT');viewport=Object.freeze({...v});if(unit)unit.configureViewport(viewport);else{try{unit=A.burstPreparedHandoff83ap.create({viewport});unit.connect();A.registerLayoutsDAdapter('burst',unit.adapter);}catch(e){initializationFailed=true;throw e}}editable=plan;const p=J.finalizePlacementPlan(plan,{layoutsD:true});need(p.placementFinalization.diagnostics.some(d=>d.code==='BURST83AJ_PREPARE_REQUIRED'),'BURST83BD_STAGE_REQUIRED');steps=0}
 function begin(){need(unit&&editable&&!job,'BURST83BD_STAGE_REQUIRED');job=unit.beginPreparation(renderer,{reservedBytes:262144})}
 function step(p){need(p===editable&&job,'BURST83BD_JOB');const v=job.step();steps++;if(v.done)job=null;return{phase:v.done?'complete':'preparing',progress:v.progress}}
 function finalize(p){need(p===editable&&unit&&!job,'BURST83BD_FINALIZE');const result=J.finalizePlacementPlan(p,{layoutsD:true});need(unit.adapter.runtimeAdmission({plan:result}),'BURST83BD_FORMAL_REQUIRED');formal=result}
 function draw(ctx,t,opt){need(formal,'BURST83BD_NOT_READY');const v=readViewport(editable);need(v.width===viewport.width&&v.height===viewport.height&&v.scale===viewport.scale,'BURST83BD_VIEWPORT_CHANGED');return renderer.frame(ctx,formal,t,{...opt,scale:viewport.scale})}
 return Object.freeze({stage,begin,step,finalize,draw,cancel,state:()=>({steps,viewport,initializationFailed,ready:!!formal,stats:unit?.stats()||null})});
}
Object.defineProperty(A,'burstUIRuntime83bd',{value:Object.freeze({create,sourceOnly:true,UIConnected:false})});})();

