/* Source-only stock-renderer and registered-clock admission. No certificate,
   adapter/cache registration, paint, compilation, or Canvas qualification. */
(()=>{'use strict';
const A=J.placement,FD=A.bulbsFrameData80,proto=J.Renderer.prototype,
 methods=Object.freeze(['frame','makeEnv','drawCut'].map(k=>Object.freeze([k,proto[k]]))),
 guards=Object.freeze([A.layoutsDTransportKnown,A.bulbsTransport51Known]),
 need=(v,c)=>{if(!v)throw Object.assign(Error(c),{code:c})};
function renderer(actual,canonical=actual){
 need(J.Renderer.prototype===proto&&guards[0]===A.layoutsDTransportKnown&&guards[1]===A.bulbsTransport51Known,'BULBS80R_RENDERER_DEPENDENCY');
 for(const r of [canonical,actual]){
  need(r&&Object.getPrototypeOf(r)===proto&&methods.every(([k,f])=>typeof f==='function'&&proto[k]===f&&r[k]===f),'BULBS80R_STOCK_RENDERER');
  need(guards.every(g=>typeof g==='function'&&g(r)===true),'BULBS80R_TRANSPORT');
 }
 // Only the instance token is normalized; full owner dependency snapshots still
 // compare all method identities, fonts, descriptors, revision and source helpers.
 return canonical;
}
function range(cut,{stepDur,reachTail}){
 need(Number.isFinite(stepDur)&&stepDur===1/60&&Number.isFinite(reachTail)&&reachTail>=0,'BULBS80R_TIMING');
 const r=[Math.min(cut.start,cut.renderStart??cut.start)-stepDur,Math.max(cut.end,cut.displayEnd??cut.end)+reachTail];
 need(r.every(Number.isFinite)&&r[0]<=r[1],'BULBS80R_RANGE');return r;
}
function select(model,plan,t,evaluationRange,onWork=null){
 need(onWork===null||typeof onWork==='function','BULBS80R_WORK_CALLBACK');
 const report=current=>{if(onWork)onWork(current)};
 need(A.bulbsFrameData80===FD,'BULBS80R_CLOCK_DEPENDENCY');
 need(Number.isFinite(t)&&Array.isArray(evaluationRange)&&evaluationRange.length===2&&evaluationRange.every(Number.isFinite)&&t>=evaluationRange[0]&&t<=evaluationRange[1],'BULBS80R_TIME_DOMAIN');
 const h=model.frameData.clock.h,n=Math.floor(t/h+1e-6),cut=plan.cuts[0];
 need(h===1/60&&plan.cuts.length===1&&cut.start===0,'BULBS80R_CLOCK_SCOPE');
 if(t<0){
  need(n<=0,'BULBS80R_NEGATIVE_CLOCK');
  const row=FD.select(model,0);report({n,row,evaluationRange});
  for(const [pass,lag]of [['B',1.6/24],['A',.8/24],['main',0]]){
   const tp=Math.max(0,n*h-lag),nativeActive=J.lyricCutsAt(plan,tp),active=nativeActive.map(J.lyricRenderCut);
   const index=row.ownIndices.find(i=>model.schedule[i].pass===pass),e=model.schedule[index];
   report({n,row,evaluationRange,pass,lag,tp,nativeActive,active,index,entry:e});
   need(Object.is(tp,0)&&active.length===1&&active[0].index===cut.index&&e&&e.q<=.01&&Object.is(e.t,tp),'BULBS80R_NEGATIVE_SELECTOR');
  }
  return{n,sourceN:0,ownIndices:row.ownIndices,domain:'negative-clamped-zero'};
 }
 if(t>=plan.duration){
  need(Math.max(0,n*h-1.6/24)>=cut.end,'BULBS80R_EXPIRED_CLOCK');
  for(const lag of [1.6/24,.8/24,0]){const tp=Math.max(0,n*h-lag),nativeActive=J.lyricCutsAt(plan,tp),active=nativeActive.map(J.lyricRenderCut);report({n,evaluationRange,lag,tp,nativeActive,active});need(active.length===0,'BULBS80R_EXPIRED_SELECTOR')}
  return{n,sourceN:n,ownIndices:[],domain:'expired-empty'};
 }
 return{...FD.select(model,t),sourceN:n,domain:'positive-preimage'};
}
A.bulbsRendererTime80=Object.freeze({renderer,range,select,sourceOnly:true,safetyCertified:false});
})();
