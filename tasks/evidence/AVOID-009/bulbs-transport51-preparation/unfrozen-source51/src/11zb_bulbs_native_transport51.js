/* Bulbs-only late stock witness. No placement adapter or C capability. */
(()=>{'use strict';
 const A=J.placement,source=J.LAYOUTS.bulbs.render,drawCut=J.Renderer.prototype.drawCut,makeEnv=J.Renderer.prototype.makeEnv;
 const keys=['mainDraw','drawFx','drawItem','layoutText','fontCSS','measure','fitSize','clamp','lerp','h','r','rs','combineChar','combinePiece'],core=keys.map(k=>[k,J[k]]),holds=['still','jitter','breathe'].map(k=>[k,J.HOLD[k],J.HOLD[k].apply]),enter=J.ENTER.cut,exit=J.EXIT.cut,enterApply=enter.apply,exitApply=exit.apply,E=J.E,eases=['outBack','inCubic','inOutCubic','outExpo'].map(k=>[k,E[k]]),degree=J.DEG,tau=J.TAU,PID=J.PID,imul=Math.imul;
 const known=renderer=>J.LAYOUTS.bulbs.render===source&&renderer.drawCut===drawCut&&renderer.makeEnv===makeEnv&&core.every(([k,v])=>J[k]===v)&&holds.every(([k,v,fn])=>J.HOLD[k]===v&&v.apply===fn)&&J.ENTER.cut===enter&&enter.apply===enterApply&&J.EXIT.cut===exit&&exit.apply===exitApply&&J.E===E&&eases.every(([k,v])=>E[k]===v)&&J.DEG===degree&&J.TAU===tau&&J.PID===PID&&Math.imul===imul;
 Object.defineProperty(A,'bulbsTransport51Known',{value:Object.freeze(known),enumerable:true,writable:false,configurable:false});
})();
