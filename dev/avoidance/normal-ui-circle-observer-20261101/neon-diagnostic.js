/* Diagnostic re-invocation only after ordinary UI has reported an error. */
window.inspectNormalNeonPrepare=()=>{
 const ui=J.ui,state=J.uiApi.simpleCircleState(),view=document.querySelector('#view'),c=ui.plan.cuts.find(x=>x.line===0&&x.part===0);
 if(c?.layout!=='neon'||!state.error||state.pending||state.dirty)return{status:'not-run',reason:'NEON_UI_FAILURE_NOT_READY',state};
 const plan=ui.plan,time=ui.t,revision=J.metrics.revision||0,scale=view.width/plan.W,fonts=document.fonts.status;let signature;
 try{signature=JSON.stringify({cuts:plan.cuts,events:plan.events,fx:plan.fx,style:plan.style,regions:plan.lyricAvoidanceIndex})}catch(e){return{status:'not-run',reason:'PLAN_NOT_SERIALIZABLE',message:e.message}}
 let value,error;try{const r=J.placement.simpleCircle.prepare(plan,null,{scale});value={diagnostics:r.diagnostics,revision:r.revision,elapsedMs:r.elapsedMs};}catch(e){error={name:e?.name||null,code:e?.code||null,message:e?.message||String(e),stack:e?.stack||null,details:e?.details??null}}
 let samePlan=false;try{samePlan=signature===JSON.stringify({cuts:plan.cuts,events:plan.events,fx:plan.fx,style:plan.style,regions:plan.lyricAvoidanceIndex})&&ui.plan===plan}catch{}
 return{status:error?'thrown':'returned',uiError:state.error,error,result:value,time,scale,fonts,revisionBefore:revision,revisionAfter:J.metrics.revision||0,samePlan,timeUnchanged:ui.t===time,source:'same normal UI plan and scale; previous=null is explicit and may differ from private previous generation; re-invocation is diagnostic, not the original caught exception'};
};
