from pathlib import Path
import sys
r=Path(sys.argv[1]).resolve();d=Path(__file__).resolve().parent;B=r/'dev/avoidance/bulbs86';old=r/'dev/avoidance/burst83'
def rep(s,a,b):
 assert s.count(a)==1,(a,s.count(a));return s.replace(a,b)
root=(B/'variable-ui86cc/root86.js').read_text().replace('bulbsDesignViewportRoot86bv','burstViewportRoot83ay');root=rep(root,'[plan.W,plan.H].every(x=>Number.isFinite(x)&&x>0&&x<=8192)','plan.W===1920&&plan.H===1080');(d/'root83.js').write_text(root)
(d/'compose83.js').write_text((B/'composed-input86bu/compose-scope86.js').read_text().replace('bulbsComposeScope86bu','burstComposeScope83ay').replace('BULBS86BU','BURST83AY'))
(d/'geometry83.js').write_text((B/'variable-ui86cc/geometry86.js').read_text().replace('bulbsDesignViewportGeometry86bv','burstViewportGeometry83ay').replace('BULBS86AL','BURST83AY'))
s=(old/'replay-geometry83u/scalar-support83u.js').read_text();s=rep(s,"env.W===960&&env.H===540&&env.scale===1", "env.W===1920&&env.H===1080&&Number.isFinite(env.scale)&&env.scale>0&&env.scale<=1&&env.scale===env.ctx.canvas.width/env.W&&env.ctx.canvas.width===Math.round(env.W*env.scale)&&env.ctx.canvas.height===Math.round(env.H*env.scale)");(d/'scalar-support83.js').write_text(s)
s=(old/'compact-frame83x/clock-compiler83x.js').read_text();s=rep(s,'Q=A.tilesProof48,','Q=A.tilesProof48,V=A.burstViewportRoot83ay,CS=A.burstComposeScope83ay,');s=rep(s,"plan.W===960&&plan.H===540&&plan.fps===60&&plan.duration===4.150001", "plan.W===1920&&plan.H===1080&&plan.fps===60&&['ja','en'].includes(plan.lang)&&plan.lang===J.lang&&Number.isFinite(plan.duration)&&plan.duration>0&&plan.duration<=511/60")
s=rep(s,'clocks=Q.clock(plan,cut),',"clocks=CS.clock(plan,cut),viewport=Object.freeze({width:ctx.canvas.width,height:ctx.canvas.height,scale:ctx.canvas.width/plan.W}),")
s=rep(s,"clocks.actualCounts.states===250&&clocks.actualCounts.selectedPasses===727", "clocks.actualCounts.states>0&&clocks.actualCounts.states<=512&&clocks.actualCounts.selectedPasses>0&&clocks.actualCounts.selectedPasses<=1536")
s=rep(s,"let sourceUnion=null;need(","CS.layers(plan);need(Array.isArray(plan.events)&&plan.events.length===0&&Array.isArray(plan.beats)&&plan.beats.length===0&&!plan.energy&&!plan.keyBg&&!plan.ghostPreRoll&&!plan.hud&&(!plan.customEffects||Array.isArray(plan.customEffects)&&plan.customEffects.length===0),'BURST83AY_PROFILE');need(!cut.effectFx&&!cut.effectStyle&&cut.opacity===100&&cut.blend==='normal'&&!cut.frontmost&&!cut.trans&&!cut.placementLocked&&!cut.fullStagePlacement&&!cut.placementLayoutsD&&!cut.placementUnits&&(cut.leadTime??0)===0,'BURST83AY_CUT_PROFILE');let sourceUnion=null;need(")
s=rep(s,'C.serializedBytes({plan,clocks,signature,delta,counts,control:', 'C.serializedBytes({plan,clocks,viewport,signature,delta,counts,control:')
s=rep(s,'const env=Q.makeEnv(renderer,plan,cut,ctx,own,state.firstTime)', 'const env=V.makeEnv(renderer,plan,cut,ctx,own,state.firstTime,viewport.scale)')
s=rep(s,"const metadata={kind:'burst-compact-frame-model83x',", "const metadata={viewport,kind:'burst-compact-frame-model83x',")
# The existing callback must also bind the new modules and current Canvas dimensions.
s=rep(s,"guard=()=>{need(validate()!==false", "guard=()=>{need(A.burstViewportRoot83ay===V&&A.burstComposeScope83ay===CS&&ctx.canvas.width===viewport.width&&ctx.canvas.height===viewport.height,'BURST83AY_STALE_VIEWPORT_SOURCE');need(validate()!==false")
(d/'clock-compiler83.js').write_text(s)
