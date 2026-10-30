/* One private owner/controller and one registration per realm; no model adoption. */
(()=>{'use strict';const A=J.placement,need=(v,c,d)=>{if(!v)throw Object.assign(Error(c),{code:c,details:d})};
function create({renderer,readViewport}){let ctrl=null,api=null,job=null,editable=null,formal=null,viewport=null,generation=0,steps=0,initializationFailed=false,cleanupFailed=false;
 function cancel(){generation++;formal=null;job=null;editable=null;if(ctrl){try{if(api)api.cancelPrepared();else ctrl.drop()}catch(e){cleanupFailed=true;throw e}}viewport=null}
 function stage(plan){need(!initializationFailed,'DOMINO_UI_INITIALIZATION_FAILED');need(!cleanupFailed&&!editable&&!job&&!formal,'DOMINO_UI_STAGE_BUSY');const v=readViewport(plan);need(Number.isSafeInteger(v.width)&&v.width>0&&Number.isSafeInteger(v.height)&&v.height>0&&v.scale===v.width/plan.W,'DOMINO_UI_VIEWPORT');viewport=Object.freeze({...v});
  if(ctrl)ctrl.configureViewport(viewport);else try{ctrl=A.dominoUIFrameController82ao.create({viewport,currentGeneration:()=>generation});api=ctrl.installPreparedAdapter();A.registerLayoutsDAdapter('dominoes',api.adapter)}catch(e){initializationFailed=true;throw e}
  editable=plan;const p=J.finalizePlacementPlan(plan,{layoutsD:true});if(!p.placementFinalization.diagnostics.some(d=>d.code==='DOMINO82AC_PREPARE_REQUIRED')){const d=p.placementFinalization.diagnostics.find(d=>d.safety==='unsupported');need(false,d?.code||'DOMINO_UI_STAGE_REQUIRED',d)}steps=0
 }
 function begin(){need(api&&editable&&!job,'DOMINO_UI_STAGE_REQUIRED');job=api.beginPrepared()}
 function step(p){need(p===editable&&job,'DOMINO_UI_JOB');const v=api.stepPrepared(job);steps++;if(v.done){api.commitPrepared(job);job=null}return{phase:v.done?'complete':'preparing',progress:v.progress}}
 function finalize(p){need(p===editable&&api&&!job,'DOMINO_UI_FINALIZE');const result=J.finalizePlacementPlan(p,{layoutsD:true});need(api.adapter.runtimeAdmission({plan:result}),'DOMINO_UI_FORMAL_REQUIRED');formal=result}
 function draw(ctx,t,opt){need(formal,'DOMINO_UI_NOT_READY');const v=readViewport(editable);need(v.width===viewport.width&&v.height===viewport.height&&v.scale===viewport.scale,'DOMINO_UI_VIEWPORT_CHANGED');return renderer.frame(ctx,formal,t,{...opt,scale:viewport.scale})}
 return Object.freeze({stage,begin,step,finalize,draw,cancel,state:()=>Object.freeze({generation,steps,viewport,initializationFailed,cleanupFailed,ready:!!formal,stats:ctrl?.stats()||null,adapter:api?.stats()||null})})
}
Object.defineProperty(A,'dominoUIRuntime82ao',{value:Object.freeze({create,UIConnected:false})});})();
