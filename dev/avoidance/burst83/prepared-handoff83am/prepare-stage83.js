/* Unregistered stage-only adapter. Deliberately cannot issue a safe trajectory. */
(()=>{'use strict';const A=J.placement,C=A.bulbsScalarCompiler80,P=A.burstFinalizerInput83aj,ID='burst_prepare83aj',need=(v,c)=>{if(!v)throw Object.assign(Error(c),{code:c})};
function create({currentGeneration=()=>0,onCapture=()=>{},externalReservedBytes=()=>0}={}){
 need(typeof currentGeneration==='function'&&typeof onCapture==='function'&&typeof externalReservedBytes==='function','BURST83AJ_GENERATION');let stage=null,busy=false;const refs={project:P.project,codec:C.exact,bytes:C.serializedBytes};
 const fingerprint=()=>({revision:J.metrics.revision,lang:J.lang,fonts:C.exact(J.FONTS),faces:Array.from(document.fonts,face=>({face,family:face.family,weight:face.weight,style:face.style,stretch:face.stretch,status:face.status})),fontSet:document.fonts,generation:currentGeneration()});
 const fingerprintData=f=>({...f,fontSet:true,faces:f.faces.map(({face,...data})=>data)});
 const bytes=(work=null)=>C.serializedBytes({stage:stage?{plan:stage.plan,key:stage.key,fingerprint:fingerprintData(stage.fingerprint)}:null,work})+4096+(stage?64+64*stage.fingerprint.faces.length:0);
 const external=()=>{const n=externalReservedBytes();need(Number.isSafeInteger(n)&&n>=0,'BURST83AM_EXTERNAL_RESERVED');return n};const account=work=>{const n=bytes(work)+64*(work?.fingerprint?.faces?.length??0);need(n<=262144,'BURST83AJ_STAGE_BUDGET');need(external()+n<=8388608,'BURST83AM_COMBINED_BUDGET');return n};
 const sameDeps=(a,b)=>a.fontSet===b.fontSet&&a.faces.length===b.faces.length&&a.faces.every((x,i)=>x.face===b.faces[i].face)&&JSON.stringify(C.exact(fingerprintData(a)))===JSON.stringify(C.exact(fingerprintData(b)));
 function current(){need(A.burstFinalizerInput83aj===P&&P.project===refs.project&&A.bulbsScalarCompiler80===C&&C.exact===refs.codec&&C.serializedBytes===refs.bytes,'BURST83AJ_SOURCE_STALE');const f=fingerprint();need(Number.isSafeInteger(f.generation),'BURST83AJ_GENERATION');return f;}
 const exclusive=fn=>{need(!busy,'BURST83AJ_REENTRANT');busy=true;try{return fn()}finally{busy=false}};
 function capture(plan){const before=current(),projected=P.project(plan,{phase:'working',reservedBytes:external()+bytes()});try{account({projected,fingerprint:fingerprintData(before)});need(sameDeps(before,current()),'BURST83AJ_DEPENDENCY_STALE');const changed=!stage||stage.key!==projected.sourceKey||!sameDeps(stage.fingerprint,before);if(changed)stage={plan:projected.nativePlan,key:projected.sourceKey,fingerprint:before};account();onCapture(Object.freeze({plan:stage.plan,key:stage.key,changed,retainedBytes:bytes()}));}catch(error){stage=null;throw error;}}
 function assertNotFailed(plan){need(!(plan.placementFinalization?.diagnostics||[]).some(d=>d.adapter===ID&&d.runtimeAdmissionRequired===true),'BURST83AJ_PREPARE_REQUIRED');return true;}
 const adapter=Object.freeze({id:ID,finalize({plan,cut}){return exclusive(()=>{need(plan.cuts.length===1&&plan.cuts[0]===cut,'BURST83AJ_ONE_CUT');capture(plan);need(false,'BURST83AJ_PREPARE_REQUIRED')})},runtimeAdmission(){return false},finalizationLifecycle(){},render(){need(false,'BURST83AJ_PREPARE_REQUIRED')}});
 return Object.freeze({adapter,assertNotFailed,
 // Source-only readiness handoff is deliberately absent until genuine owner /
 // final-plan binding and the generic trajectory time-range mismatch are closed.
 staged(){return exclusive(()=>{need(stage,'BURST83AJ_NO_STAGE');const f=current();if(!sameDeps(stage.fingerprint,f)){stage=null;need(false,'BURST83AJ_DEPENDENCY_STALE')}account({fingerprint:fingerprintData(f)});return Object.freeze({staged:true,key:stage.key,reservedBytes:262144,retainedBytes:bytes(),authority:false})})},
 drop(){return exclusive(()=>{stage=null})},stats:()=>Object.freeze({staged:!!stage,retainedBytes:bytes(),sourceOnly:true,canIssue:false})});
}
Object.defineProperty(A,'burstPrepareStage83am',{value:Object.freeze({create,sourceOnly:true,certificateIssuer:false})});})();
