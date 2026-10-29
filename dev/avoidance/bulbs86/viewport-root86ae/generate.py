from pathlib import Path
import sys
root=Path(sys.argv[1]);out=Path(sys.argv[2]);s=(root/'src/11p_layoutsEc_tiles_proof48.js').read_text();body=s[s.index('function makeEnv('):s.index('function contextState(',s.index('function makeEnv('))]
assert body.count('ctx.setTransform(1,0,0,1,0,0)')==1
assert body.count('scale:1,allowFilter:false')==1
body=body.replace('function makeEnv(renderer,plan,cut,ctx,own,realTime){','function makeEnv(renderer,plan,cut,ctx,own,realTime,scale){\n check(renderer,plan,cut,ctx,own,scale);')
body=body.replace('ctx.setTransform(1,0,0,1,0,0)','ctx.setTransform(scale,0,0,scale,0,0)').replace('scale:1,allowFilter:false','scale,allowFilter:false')
header="""/* Source-only viewport root skeleton. No model access, candidate, paint or authority.
   Generated from stock tilesProof48.makeEnv; same camera/chroma operation order.
   Only initial CTM and env.scale vary. Original canonical helper is untouched. */
(()=>{'use strict';const A=J.placement,P=A.tilesProof48,B=A.bulbsProof69,canonical=P.makeEnv,stock=J.Renderer.prototype.makeEnv,push=J.CAMERA.push,get=push.get,lerp=J.lerp,clamp=J.clamp,proto=CanvasRenderingContext2D.prototype,methods=['setTransform','translate','scale'].map(k=>[k,proto[k]]),need=(v,c)=>{if(!v)throw Object.assign(Error(c),{code:c})};
function check(renderer,plan,cut,ctx,own,scale){
 need(A.tilesProof48===P&&A.bulbsProof69===B&&P.makeEnv===canonical&&B.makeEnv===canonical&&J.Renderer.prototype.makeEnv===stock&&renderer.makeEnv===stock&&J.CAMERA.push===push&&push.get===get&&J.lerp===lerp&&J.clamp===clamp,'BULBS86AE_SOURCE');
 need(Number.isFinite(scale)&&scale>0&&scale<=1&&ctx.canvas.width===Math.round(960*scale)&&ctx.canvas.height===Math.round(540*scale),'BULBS86AE_VIEWPORT');
 need(Object.getPrototypeOf(ctx)===proto&&methods.every(([k,f])=>proto[k]===f&&ctx[k]===f),'BULBS86AE_CONTEXT');
 need(cut.cam==='push'&&!cut.area&&cut.contentScale===1&&cut.motionScale===1&&plan.fx.motion===.65&&plan.fx.chroma===.25&&plan.style.ghost===.6&&['B','A','main'].includes(own.pass),'BULBS86AE_SCOPE');
}
"""
footer="\nA.bulbsViewportRoot86ae=Object.freeze({makeEnv,sourceOnly:true,safetyCertified:false,modelAuthority:false});})();\n"
out.mkdir(parents=True,exist_ok=True);(out/'root86.js').write_text(header+body+footer)
