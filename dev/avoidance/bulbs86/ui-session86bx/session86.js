/* Source-only UI generation coordinator. No model, record or Canvas authority.
   install/begin/frame hooks must be explicitly connected by the candidate UI. */
(()=>{'use strict';const A=J.placement;
function create({runtime,readPlan,waitFonts,schedule,onState,hide,now=()=>0}){
 let generation=0,phase='empty',error=null,details=null,plan=null,ready=false,active=false,start=0,maxStepMs=0,stepCount=0;
 const state=()=>Object.freeze({generation,phase,active,ready,error,details,maxStepMs,stepCount,elapsedMs:now()-start,modelExposed:false,sourceOnly:true});
 function report(){onState(state());return state()}
 function invalidate(reason='input'){generation++;ready=false;plan=null;phase='empty';error=null;details=null;runtime.cancel();return report()}
 function current(g,p){if(g!==generation)return false;if(readPlan()!==p){invalidate('plan');return false}return true}
 function fail(g,e){if(g!==generation)return;ready=false;phase='unsupported';error=String(e.code||e.message||'PREPARATION_FAILED');details=e.details||null;runtime.cancel();report()}
 async function begin(){active=true;invalidate();start=now();maxStepMs=0;stepCount=0;const g=generation,p=readPlan();plan=p;phase='fonts';report();try{
   await waitFonts(p);if(!current(g,p))return state();runtime.stage(p);runtime.begin();phase='preparing';report();
   const resume=()=>{if(!current(g,p))return;try{const stepStart=now();let s;try{s=runtime.step(p)}finally{maxStepMs=Math.max(maxStepMs,now()-stepStart);stepCount++}if(!current(g,p))return;if(s.phase==='complete'){runtime.finalize(p);if(!current(g,p)){runtime.cancel();return}ready=true;phase='ready';report()}else schedule(resume)}catch(e){fail(g,e)}};schedule(resume);
 }catch(e){fail(g,e)}return state()}
 function frame(ctx,t,opt){if(!active)return false;if(!ready||readPlan()!==plan){if(ready&&readPlan()!==plan)invalidate('plan');hide(ctx);return true}try{runtime.draw(ctx,t,opt);return true}catch(e){fail(generation,e);hide(ctx);return true}}
 return Object.freeze({begin,invalidate,frame,state,stop(){active=false;return invalidate()}});
}
Object.defineProperty(A,'bulbsUISession86bx',{value:Object.freeze({create,sourceOnly:true,UIConnected:false})});})();
