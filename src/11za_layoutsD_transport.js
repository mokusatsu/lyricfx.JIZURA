/* After custom draw/components wrap the renderer, seal D transport separately
   from C. New D source cannot acquire C's private native capabilities. */
(() => {
'use strict';
const drawCut=J.Renderer.prototype.drawCut,makeEnv=J.Renderer.prototype.makeEnv;
J.placement.layoutsDTransportKnown=renderer=>renderer.drawCut===drawCut&&renderer.makeEnv===makeEnv;
})();
