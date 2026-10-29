// Inserted inside the candidate adapter closure, before connectRenderer.
cv.style.cssText='position:fixed;left:-100000px;top:-100000px;width:1px;height:1px;visibility:hidden;pointer-events:none';cv.setAttribute('aria-hidden','true');document.body.append(cv);
let uiFormal86bx=null;var uiInputKey86bx=null;
function currentUI86bx(plan){need(cv.isConnected&&cv.parentNode===document.body,'BULBS86BX_CONTEXT_BINDING');need(preparedStage&&stageKey(plan)===uiInputKey86bx,'BULBS86BX_INPUT');}
Object.defineProperty(A,'bulbsUIRuntime86bx',{value:Object.freeze({
 stage(plan){const view=document.getElementById('view');need(view&&view.width===720&&view.height===405,'BULBS86BX_VIEWPORT_UNSUPPORTED');uiFormal86bx=null;uiInputKey86bx=stageKey(plan);J.finalizePlacementPlan(plan,{layoutsD:true});need(preparedStage?.phase==='unprepared','BULBS86BX_UNSUPPORTED');},
 begin(){return preparationApi.begin()},
 step(plan){currentUI86bx(plan);return preparationApi.step()},
 finalize(plan){currentUI86bx(plan);const f=J.finalizePlacementPlan(plan,{layoutsD:true});need(A.layoutsDRuntimeAdmission(f),'BULBS86BX_NOT_ADMITTED');uiFormal86bx=f;},
 draw(ctx,t,opt){need(uiFormal86bx,'BULBS86BX_NOT_READY');currentUI86bx(J.ui.plan);return J.ui.renderer.frame(ctx,uiFormal86bx,t,opt)},
 cancel(){uiFormal86bx=null;uiInputKey86bx=null;return preparationApi.cancel()}
})});
