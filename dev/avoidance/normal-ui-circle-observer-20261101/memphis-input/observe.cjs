'use strict';
// Pass this function directly to page.evaluate after selecting a layout and
// seeking to its active time using the ordinary UI. It performs no UI writes.
module.exports = function observeCircleRoute() {
  const plan=J.ui.plan, time=J.ui.t, A=J.placement, api=J.uiApi;
  const cut=plan.cuts.find(c=>c.line===0&&c.part===0);
  const simple=api.simpleCircleState();
  const specs=[
    ['domino',A.dominoUIBoundary82ao,api.dominoSessionState82ao,'dominoPreparation'],
    ['burst',A.burstUIBoundary83be,api.burstSessionState83be,'burstPreparation'],
    ['bulbs',A.bulbsFrameController80,api.bulbsSessionState86ci,'bulbsPreparation'],
  ];
  const legacy=specs.map(([name,boundary,state,id])=>{
    const node=document.getElementById(id);
    return {name,targetsPreview:boundary.targetsPreview(plan),targetsFrame:boundary.targetsFrame(plan,time),
      targetsCut:!!cut&&boundary.targetsCut(plan,cut),session:state(),
      warning:{visible:!!node&&!node.hidden,text:node?.textContent?.trim()||''}};
  });
  const active=A.simpleCircle.active(plan,time), simpleCut=!!cut&&A.simpleCircle.activeCut(plan,cut,time),
    legacyFrame=legacy.find(x=>x.targetsFrame), route=!J.ui.areaEdit&&active?'simple':legacyFrame?.name||'native';
  const diagnostic=simple.prepared?.diagnostics?.find(d=>d.cut===cut?.index)||null;
  let wait;
  if(route==='simple') wait=simple.dirty||simple.pending||(!simple.prepared&&!simple.error);
  else if(legacyFrame){const s=legacyFrame.session;wait=s.active&&!s.ready&&!s.error&&!s.cleanupError&&!['unsupported','cancelled'].includes(s.phase);}
  else wait=false;
  return {time,areaEdit:!!J.ui.areaEdit,cut:cut?{index:cut.index,layout:cut.layout,start:cut.start,end:cut.end,renderStart:cut.renderStart,areaMode:cut.areaMode,enter:cut.enter,hold:cut.hold,exit:cut.exit,cam:cut.cam}:null,
    route,simple:{active,activeCut:simpleCut,dirty:simple.dirty,pending:simple.pending,error:simple.error,prepared:!!simple.prepared,diagnostic},legacy,wait,
    observation:'route and state only; ready is not clearance, complete paint, or human acceptance'};
};
