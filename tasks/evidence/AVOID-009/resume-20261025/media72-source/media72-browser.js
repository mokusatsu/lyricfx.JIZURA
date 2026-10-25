/* Accepted default fixture only; no Canvas wrappers, UI capture, or synthetic clock. */
(()=>{'use strict';
const need=(x,c)=>{if(!x)throw Error(c);},options={noHud:true,noPost:true,noForeground:true,noMedia:true,fast:true};
window.finalizeMedia72=()=>{
 const plan=billboard62Run.plan;need(!plan.lyricAvoidanceIndex.enabled,'MEDIA72_ORIGINAL_CONTROL_OFF');
 plan.lyricAvoidanceIndex.enabled=true;plan.lyricAvoidanceIndex.regions=[{id:'fixed72',start:0,end:plan.duration,center:{x:.5,y:.42},radius:.2}];
 const before=JSON.stringify(plan),final=J.finalizePlacementPlan(plan,{layoutsD:true});need(before===JSON.stringify(plan),'MEDIA72_INPUT_MUTATED');
 const tr=final.cuts[0].placementTrajectory;need(tr?.safety==='certified-bounded-adapter','MEDIA72_NOT_ACCEPTED');
 const recipe=tr.certificate.recipe;need(recipe.id==='reflow2-font0.72-right','MEDIA72_RECIPE');
 window.mediaFinal72=final;window.mediaClock72=J.placement.tilesProof48.clock(plan,plan.cuts[0]);
 return{recipe,clockStates:mediaClock72.states.length,duration:plan.duration,fps:plan.fps,cutParams:plan.cuts[0].params};
};
window.mediaFrame72=async({j,side,png=false})=>{
 need(Number.isInteger(j)&&j>=0&&j<250,'MEDIA72_J');need(['before','off','after'].includes(side),'MEDIA72_SIDE');
 const product=side==='after',run=billboard62Run,plan=product?window.mediaFinal72:run.plan;
 need(plan&&plan.W===960&&plan.H===540,'MEDIA72_DIMENSIONS');if(!product)need(!plan.lyricAvoidanceIndex.enabled,'MEDIA72_NATIVE_OFF');
 const cv=document.createElement('canvas');cv.width=960;cv.height=540;const ctx=cv.getContext('2d'),obs=[];
 try{run.r.renderer.frame(ctx,plan,j/60,{...options,placementObservation:o=>obs.push({pass:o.pass,realTime:o.realTime,root:o.root,sourceAdapter:o.sourceAdapter,safety:o.safety,recipe:o.recipe,excluded:!!o.excluded,paintCount:o.preflightPaint?.length??null})});
 let expected=[];if(product){const state=mediaClock72.states.find(s=>s.n===j);need(state,'MEDIA72_STATE');expected=state.passes.filter(p=>p.active).map(p=>p.pass);need(JSON.stringify(obs.map(o=>o.pass))===JSON.stringify(expected),'MEDIA72_PASS_ORDER');need(obs.every(o=>o.realTime===j/60&&!o.excluded),'MEDIA72_OWN_CLOCK');const recipe=plan.cuts[0].placementTrajectory.certificate.recipe;need(obs.every(o=>o.safety==='safe'&&o.sourceAdapter===J.placement.billboard72Source.revision&&JSON.stringify(o.recipe)===JSON.stringify(recipe)),'MEDIA72_ACTUAL_SAFE_RECIPE');}
 const SHA256=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',ctx.getImageData(0,0,960,540).data))).map(n=>n.toString(16).padStart(2,'0')).join('');
 return{j,time:j/60,side,SHA256,expectedPasses:expected,observations:obs,...(png?{png:cv.toDataURL('image/png')}:{})};
 }finally{cv.width=1;}
};})();
