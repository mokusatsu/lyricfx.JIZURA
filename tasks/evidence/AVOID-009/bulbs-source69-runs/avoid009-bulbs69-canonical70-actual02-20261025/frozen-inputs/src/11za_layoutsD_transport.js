/* After custom draw/components wrap the renderer, seal D transport separately
   from C. New D source cannot acquire C's private native capabilities. */
(() => {
'use strict';
const drawCut=J.Renderer.prototype.drawCut,makeEnv=J.Renderer.prototype.makeEnv;
J.placement.layoutsDTransportKnown=renderer=>renderer.drawCut===drawCut&&renderer.makeEnv===makeEnv;
// Late stock camera identity lookup for pile source diagnostics and the strict adapter guard.
const pileCameras=new Map(['push','panL','panR','dutch'].map(id=>[id,J.CAMERA[id]?.get]));
Object.defineProperty(J.placement,'pileNativeCameraKnown',{value:id=>pileCameras.has(id)&&typeof pileCameras.get(id)==='function'&&pileCameras.get(id)===J.CAMERA[id]?.get});
})();
