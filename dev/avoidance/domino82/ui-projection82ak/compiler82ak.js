/* Unregistered whole-clock candidate exploration. No paint/spy or authority. */
(()=>{'use strict';const A=J.placement,Q=A.tilesProof48,VR=A.dominoUIRoot82ak,CS=A.dominoUICompose82ak,S=A.dominoScalarSupport82d,V=A.dominoUIVerticalCandidates82ak,C=A.bulbsScalarCompiler80,need=(v,c)=>{if(!v)throw Object.assign(Error(c),{code:c})};
function* compile({plan,cut,renderer,ctx,circle,reservedBytes=0}){
 need(Number.isSafeInteger(reservedBytes)&&reservedBytes>=0,'DOMINO82I_RESERVED');need(plan.W===1920&&plan.H===1080&&plan.cuts.length===1&&plan.cuts[0]===cut&&cut.layout==='dominoes'&&cut.area==null,'DOMINO82I_NATIVE_INPUT');
 const viewport={width:ctx.canvas.width,height:ctx.canvas.height,scale:ctx.canvas.width/plan.W},clocks=CS.clock(plan,cut),expected=[];let sample=null,env=null,work=null,acc=null,peak=0,processed=0;
 const signature=JSON.stringify(C.exact({plan,cut})),revision=J.metrics.revision,envKeys=new Set(['ctx','plan','cut']);
 need(clocks.states.length===clocks.actualCounts.states,'DOMINO82I_STATE_COUNT');
 for(const state of clocks.states){const p=clocks.preimages.find(p=>p.n===state.n);need(p?.reachable&&Object.is(p.firstTime,state.firstTime)&&p.lastTime>=p.firstTime,'DOMINO82I_PREIMAGE');for(const own of state.passes)if(own.active)expected.push({n:state.n,pass:own.pass});}
 need(expected.length===clocks.actualCounts.selectedPasses&&expected.length>0,'DOMINO82I_PASS_COUNT');
 const baseBytes=reservedBytes+C.serializedBytes({plan,cut,viewport,clocks,expected,signature,revision,envKeys:[...envKeys]});
 const currentBytes=()=>C.serializedBytes({processed,work,environment:env?Object.fromEntries(Object.entries(env).filter(([k,v])=>!envKeys.has(k)&&typeof v!=='function')):null});
 const check=()=>{need(A.dominoUIRoot82ak===VR&&A.dominoUICompose82ak===CS&&ctx.canvas.width===viewport.width&&ctx.canvas.height===viewport.height,'DOMINO82AK_VIEWPORT_SOURCE');need(J.metrics.revision===revision&&JSON.stringify(C.exact({plan,cut}))===signature,'DOMINO82I_STALE_INPUT');const bytes=baseBytes+currentBytes()+(acc?acc.retainedBytes():0)+(sample?C.serializedBytes(sample):0);peak=Math.max(peak,bytes);need(bytes<=8388608,'DOMINO82I_SERIALIZED_WORKING_BUDGET');};
 try{acc=V.create({W:viewport.width,H:viewport.height,circle,expected,reservedBytes:baseBytes});check();
 for(const state of clocks.states)for(const own of state.passes)if(own.active){check();work={state,own};ctx.save();try{env=VR.makeEnv(renderer,plan,cut,ctx,own,state.firstTime,viewport.scale);const reservation=baseBytes+acc.retainedBytes()+currentBytes();sample=S.sample(env,{reservedBytes:reservation});check();acc.add({n:state.n,pass:own.pass,sample});processed++;check();}finally{sample=null;env=null;work=null;ctx.restore();ctx.beginPath();}yield Object.freeze({processed,expected:expected.length});}
 check();const selection=acc.finish();acc=null;const result={kind:'domino-current-clock-candidates82i',selection,coverage:{states:clocks.states.length,own:processed},sourceOnly:true,safetyAccepted:false,actualDestinationRequired:true,paintCalls:0,paintObservations:0,budget:{limit:8388608,peak,definition:'conservative serialized plan/cut/full clock including queries and preimages/expected list/signature/accumulator/current env data/current sample/current own work; overlapping reservations counted twice, function closures/context/encoder heap excluded'}};
 const finalBytes=baseBytes+C.serializedBytes({result});peak=Math.max(peak,finalBytes);need(finalBytes<=8388608,'DOMINO82I_SERIALIZED_WORKING_BUDGET');result.budget.peak=peak;return result;
 }finally{sample=null;env=null;work=null;if(acc)acc.cancel();}
}
Object.defineProperty(A,'dominoUIClockCompiler82ak',{value:Object.freeze({compile,sourceOnly:true,certificateIssuer:false})});})();
