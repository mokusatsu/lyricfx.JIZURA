/* Source-only viewport root skeleton. No model access, candidate, paint or authority.
   Generated from stock tilesProof48.makeEnv; same camera/chroma operation order.
   Only initial CTM and env.scale vary. Original canonical helper is untouched. */
(()=>{'use strict';const A=J.placement,P=A.tilesProof48,B=A.bulbsProof69,canonical=P.makeEnv,stock=J.Renderer.prototype.makeEnv,push=J.CAMERA.push,get=push.get,lerp=J.lerp,clamp=J.clamp,proto=CanvasRenderingContext2D.prototype,methods=['setTransform','translate','scale'].map(k=>[k,proto[k]]),need=(v,c)=>{if(!v)throw Object.assign(Error(c),{code:c})};
function check(renderer,plan,cut,ctx,own,scale){
 need(A.tilesProof48===P&&A.bulbsProof69===B&&P.makeEnv===canonical&&B.makeEnv===canonical&&J.Renderer.prototype.makeEnv===stock&&renderer.makeEnv===stock&&J.CAMERA.push===push&&push.get===get&&J.lerp===lerp&&J.clamp===clamp,'BULBS86AE_SOURCE');
 need(Number.isFinite(scale)&&scale>0&&scale<=1&&ctx.canvas.width===Math.round(960*scale)&&ctx.canvas.height===Math.round(540*scale),'BULBS86AE_VIEWPORT');
 need(Object.getPrototypeOf(ctx)===proto&&methods.every(([k,f])=>proto[k]===f&&ctx[k]===f),'BULBS86AE_CONTEXT');
 need(cut.cam==='push'&&!cut.area&&cut.contentScale===1&&cut.motionScale===1&&plan.fx.motion===.65&&plan.fx.chroma===.25&&plan.style.ghost===.6&&['B','A','main'].includes(own.pass),'BULBS86AE_SCOPE');
}
function makeEnv(renderer,plan,cut,ctx,own,realTime,scale){
 check(renderer,plan,cut,ctx,own,scale);
 need(plan.W===960&&plan.H===540,'TILES48_STAGE');const pass=own.pass,lt=own.lt,lag=own.lag;
 ctx.setTransform(scale,0,0,scale,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.filter='none';
 const env=renderer.makeEnv(ctx,plan,cut,cut.palette,{pass,passColor:pass==='A'?cut.palette.ghostA:pass==='B'?cut.palette.ghostB:null,t:own.tp,realTime,lt,ltb:own.ltb,step:own.step,scale,allowFilter:false,energy:null,beat:null,beatPulse:0});
 const motion=cut.motionScale??1,cam=J.CAMERA.push.get(env,cut.camP||{});need(Object.keys(cam).length===1&&Object.keys(cam)[0]==='s','TILES48_CAMERA');const cs=J.lerp(1,cam.s??1,motion)*(cut.contentScale??1),u=plan.H/1080,chroma=(plan.fx.chroma??.7)*(plan.style.ghost??1)*(1+0+0),off=pass==='B'?[-3.4*chroma*u,-1.3*chroma*u]:pass==='A'?[3.2*chroma*u,1.9*chroma*u]:[0,0];
 ctx.translate(plan.W/2+(0+off[0]+0)*motion,plan.H/2+(0+off[1]+0)*motion);ctx.scale(cs*J.lerp(1,cam.sx??1,motion),cs*J.lerp(1,cam.sy??1,motion));ctx.translate(-plan.W/2,-plan.H/2);return env;
}

A.bulbsViewportRoot86ae=Object.freeze({makeEnv,sourceOnly:true,safetyCertified:false,modelAuthority:false});})();
