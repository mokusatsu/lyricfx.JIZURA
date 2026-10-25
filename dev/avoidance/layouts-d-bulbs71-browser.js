/* Two already qualified representative layouts; exact media time j/60. */
(()=>{'use strict';const need=(v,c)=>{if(!v)throw Error(c);},options={noHud:true,noPost:true,noForeground:true,noMedia:true,fast:true};
window.mediaState71=j=>{need(Number.isInteger(j)&&j>=0&&j<250,'MEDIA71_FRAME_DOMAIN');const s=bulbs69Local.clocks.states.find(s=>s.n===j);need(s,'MEDIA71_CLOCK_STATE');return{...s,firstTime:j/60};};
const hash=async c=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',c.getImageData(0,0,960,540).data))).map(v=>v.toString(16).padStart(2,'0')).join('');
window.mediaFrame71=async({j,side,candidate=null,detailed=false,png=false})=>{
 const local=bulbs69Local,state=mediaState71(j),product=side==='after';need(['before','native','after'].includes(side),'MEDIA71_SIDE');need(!product||local.final&&candidate&&!candidate.recipe.native,'MEDIA71_TWO_REPRESENTATIVE_RECIPES');const plan=product?local.final:local.run.plan,canvas=document.createElement('canvas');canvas.width=960;canvas.height=540;const ctx=canvas.getContext('2d'),observations=[];window.media71Partial={j,side,time:j/60,observations};
 try{local.run.renderer.frame(ctx,plan,j/60,{...options,placementObservation:o=>observations.push(detailed?o:{pass:o.pass,realTime:o.realTime,root:o.root,sourceAdapter:o.sourceAdapter,safety:o.safety})});const SHA256=await hash(ctx);window.media71Partial.SHA256=SHA256;const expectedPasses=state.passes.filter(p=>p.active).map(p=>p.pass);if(product)need(JSON.stringify(observations.map(o=>o.pass))===JSON.stringify(expectedPasses)&&observations.every(o=>o.realTime===j/60),'MEDIA71_OWN_CLOCK_ORDER');
 let oracle=null;if(detailed&&product){oracle=await oracleFrame69({state,candidate,mediaJ:j});need(SHA256===oracle.oracleSHA256&&!window.bulbs69OraclePartial.wrapperErrors.length,'MEDIA71_INDEPENDENT_ORACLE_RGBA');window.media71Partial.oracle=oracle;}
 return{j,time:j/60,side,SHA256,expectedPasses,observations,oracle,...(png?{png:canvas.toDataURL('image/png')}:{})};}finally{canvas.width=1;}
};
})();
