/* Source-only UI generation coordinator. No model, record or Canvas authority.
   install/begin/frame hooks must be explicitly connected by the candidate UI. */
(()=>{'use strict';const A=J.placement;
function create({runtime,readPlan,waitFonts,schedule,onState,hide,now=()=>0}){
 let generation=0,phase='empty',error=null,details=null,cleanupError=null,plan=null,ready=false,active=false,start=0,maxStepMs=0,stepCount=0,stepProfile={};
 const state=()=>Object.freeze({generation,phase,active,ready,error,details,cleanupError,maxStepMs,stepCount,stepProfile:JSON.parse(JSON.stringify(stepProfile)),elapsedMs:now()-start,modelExposed:false,sourceOnly:true});
 function report(){onState(state());return state()}
 // Thrown JavaScript values need not be Error objects; even their getters/stringifiers may throw.
 function errorCode(e,fallback){try{const v=e?.code||e?.message;if(v)return String(v)}catch{}try{if(e!==null&&e!==undefined)return String(e)}catch{}return fallback}
 function cancelRuntime(){try{runtime.cancel();return true}catch(e){if(!cleanupError)cleanupError=errorCode(e,'CLEANUP_FAILED');return false}}
 function invalidate(reason='input'){generation++;ready=false;plan=null;phase='empty';error=null;details=null;cancelRuntime();if(cleanupError){phase='unsupported';error='BULBS_UI_CLEANUP_FAILED'}return report()}
 function current(g,p){if(g!==generation)return false;if(readPlan()!==p){invalidate('plan');return false}return true}
 function fail(g,e){if(g!==generation)return;ready=false;phase='unsupported';error=errorCode(e,'PREPARATION_FAILED');try{details=e?.details||null}catch{details=null}cancelRuntime();report()}
 async function begin(){active=true;invalidate();if(cleanupError)return state();start=now();maxStepMs=0;stepCount=0;stepProfile={};const g=generation,p=readPlan();plan=p;phase='fonts';report();try{
   await waitFonts(p,()=>current(g,p));if(!current(g,p))return state();runtime.stage(p);runtime.begin();phase='preparing';report();
   const resume=()=>{if(!current(g,p))return;try{const stepStart=now();let s;try{s=runtime.step(p);const v=s.lastStep;if(v){const row=stepProfile[v.phase]||(stepProfile[v.phase]={count:0,totalMs:0,maxMs:0,maxIteratorMs:0});row.count++;row.totalMs+=v.ms;row.maxMs=Math.max(row.maxMs,v.ms);row.maxIteratorMs=Math.max(row.maxIteratorMs,v.iteratorMs||0)}}finally{maxStepMs=Math.max(maxStepMs,now()-stepStart);stepCount++}if(!current(g,p))return;if(s.phase==='complete'){runtime.finalize(p);if(!current(g,p))return;ready=true;phase='ready';report()}else schedule(resume)}catch(e){fail(g,e)}};schedule(resume);
 }catch(e){fail(g,e)}return state()}
 function frame(ctx,t,opt){if(!active)return false;if(!ready||readPlan()!==plan){if(ready&&readPlan()!==plan)invalidate('plan');hide(ctx);return true}const g=generation;try{runtime.draw(ctx,t,opt);return true}catch(e){try{fail(g,e)}finally{hide(ctx)}return true}}
 return Object.freeze({begin,invalidate,frame,state,cancel(){active=true;invalidate('cancel');if(!cleanupError)phase='cancelled';return report()},reject(code){active=true;invalidate('unsupported');fail(generation,{code});return state()},stop(){active=false;return invalidate()}});
}
Object.defineProperty(A,'bulbsUISession86bx',{value:Object.freeze({create,sourceOnly:true,UIConnected:false})});})();
