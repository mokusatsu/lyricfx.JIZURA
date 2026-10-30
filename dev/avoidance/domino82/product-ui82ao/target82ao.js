/* Selection only. Unknown lineage never grants a legacy bypass or frame authority. */
(()=>{'use strict';const A=J.placement;
function targetCut(plan,cut){return cut?.layout==='dominoes'&&A.placementCutPreserved86cm(plan,cut)!==true}
function targetsCut(plan,cut){return !!cut&&plan?.lyricAvoidanceIndex?.enabled===true&&Array.isArray(plan.lyricAvoidanceIndex.regions)&&plan.lyricAvoidanceIndex.regions.length>0&&Array.isArray(plan.cuts)&&plan.cuts.includes(cut)&&targetCut(plan,cut)}
function targetsPreview(plan){return plan?.lyricAvoidanceIndex?.enabled===true&&Array.isArray(plan.lyricAvoidanceIndex.regions)&&plan.lyricAvoidanceIndex.regions.length>0&&Array.isArray(plan.cuts)&&plan.cuts.some(c=>targetCut(plan,c))}
function targetsFrame(plan,t){if(!targetsPreview(plan)||plan.layerVisibility?.lyrics===false)return false;const h=J.stepDur(plan.fx,plan.fps);if(!Number.isFinite(t)||!Number.isFinite(h)||h<=0)return true;const q=Math.floor(t/h+1e-6)*h;return[1.6/24,.8/24,0].some(lag=>J.lyricCutsAt(plan,Math.max(0,q-lag)).some(c=>targetCut(plan,c)))}
Object.defineProperty(A,'dominoUIBoundary82ao',{value:Object.freeze({targetsCut,targetsPreview,targetsFrame})});})();
