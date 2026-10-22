/* Seal C's native recorder to the stock renderer after the normal custom-draw
   wrapper is installed. Runtime prototype replacements cannot certify C ink. */
(() => {
'use strict';
const drawCut=J.Renderer.prototype.drawCut,makeEnv=J.Renderer.prototype.makeEnv;
J.placement.layoutsCTransportKnown=renderer=>renderer.drawCut===drawCut&&renderer.makeEnv===makeEnv;
})();
