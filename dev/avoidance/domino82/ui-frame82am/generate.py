from pathlib import Path
import sys
R=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent;D=R/'dev/avoidance/domino82'
def rep(s,a,b):
 assert s.count(a)==1,(a,s.count(a));return s.replace(a,b)
s=(D/'dependency-static82ah/controller82.js').read_text()
for a,b in [('dominoDestinationModel82p','dominoUIDestinationModel82ak'),('dominoPrivateOwner82ah','dominoUIPrivateOwner82ak'),('dominoRendererTime82v','dominoUIRendererTime82am'),('dominoFrameController82ac','dominoUIFrameController82am'),('dominoPlanBinding82ac','dominoUIPlanBinding82am')]:s=s.replace(a,b)
s=rep(s,'Renderer=J.Renderer,stock=', 'Root=A.dominoUIRoot82ak,Renderer=J.Renderer,stock=')
s=rep(s,'function create(options={}){',"function create(options={}){const viewport=frozenCopy(options.viewport);need(viewport&&viewport.width===Math.round(1920*viewport.scale)&&viewport.height===Math.round(1080*viewport.scale)&&viewport.scale>0&&viewport.scale<=1,'DOMINO82AM_VIEWPORT');")
s=rep(s,'(opt.scale??1)===1','(opt.scale??1)===viewport.scale');s=rep(s,'ctx.canvas.width===960&&ctx.canvas.height===540','ctx.canvas.width===viewport.width&&ctx.canvas.height===viewport.height')
s=rep(s,'Q.makeEnv(renderer,plan,selected.cuts[0],ctx,selected.own,t)','Root.makeEnv(renderer,plan,selected.cuts[0],ctx,selected.own,t,viewport.scale)')
s=rep(s,"need(renderer.frame===stock.frame", "need(A.dominoUIRoot82ak===Root,'DOMINO82AM_ROOT_SOURCE');need(renderer.frame===stock.frame")
s=rep(s,"const region=plan.lyricAvoidanceIndex.regions[0],circle={cx:region.center.x*plan.W,cy:region.center.y*plan.H,r:region.radius*Math.min(plan.W,plan.H)};need(['cx','cy','r'].every(k=>Object.is(circle[k],model.circle[k])),'DOMINO82AC_REGION');", "const region=plan.lyricAvoidanceIndex.regions[0],circle={cx:region.center.x*plan.W,cy:region.center.y*plan.H,r:region.radius*Math.min(plan.W,plan.H)},deviceCircle=A.dominoUIScope82ak.circleOf(r.plan,viewport);need(['cx','cy','r','margin'].every(k=>Object.is(deviceCircle[k],model.circle[k])),'DOMINO82AC_REGION');")
s=rep(s,"own:model.coverage.own,timePolicy:","own:model.coverage.own,viewport,deviceCircle,timePolicy:")
s=rep(s,'end:region.end,region:', 'end:region.end??plan.duration,region:')
s=rep(s,"const ADAPTER_ID='domino_prepared82ac'", "const ADAPTER_ID='domino_prepared82am'")
s=s.replace("d.adapter==='domino_prepared82ac'", "d.adapter==='domino_prepared82am'")
(U/'controller82am.js').write_text(s)
s=(D/'dependency-static82ah/renderer-time82.js').read_text().replace('dominoRendererTime82v','dominoUIRendererTime82am');s=rep(s,'plan.cuts[0].end===4','Number.isFinite(plan.cuts[0].end)&&plan.cuts[0].end>0');(U/'renderer-time82am.js').write_text(s)
s=(D/'dependency-static82ah/plan-binding82.js').read_text().replace('dominoPlanBinding82ac','dominoUIPlanBinding82am');(U/'plan-binding82am.js').write_text(s)
# Candidate-only renderer issuer, no product registration.
s=(R/'src/09_render.js').read_text();old=(D/'frame-inspection82r/09_render-frame82.js').read_text();a=old.index('// Unregistered domino current-frame issuer');z=old.index('const bulbs80Frames',a);s=rep(s,'const bulbs80Frames=new WeakMap();let bulbs80Hooks=null;',old[a:z]+'const bulbs80Frames=new WeakMap();let bulbs80Hooks=null;')
s=rep(s,'    const burst83adNeeded=!!burst83adHooks?.needs(plan,opt);',"    const domino82qNeeded=!!domino82qHooks?.needs(plan,opt);\n    if(domino82qNeeded&&(tiles48Hooks?.needs(plan)||bulbs69Hooks?.needs(plan)||bulbs80Hooks?.needs(plan,opt)||burst83adHooks?.needs(plan,opt)))throw Object.assign(Error('DOMINO82Q_HOOK_CONFLICT'),{code:'DOMINO82Q_HOOK_CONFLICT'});\n    const burst83adNeeded=!!burst83adHooks?.needs(plan,opt);")
s=rep(s,'    try {\n    const foregroundCut =', '    const domino82qFrame=domino82qNeeded?domino82qHooks.prepare(Object.freeze({renderer:this,ctx,plan,t,opt})):null;\n    try {\n    const foregroundCut =')
s=rep(s,'        if(burst83adFrame){',"        if(domino82qFrame){\n          domino82qFrames.set(env,Object.freeze({renderer:this,ctx:X,plan,cut,frame:domino82qFrame,pass:P.pass}));\n          domino82qHooks.paint(Object.freeze({renderer:this,env}));\n        } else if(burst83adFrame){")
s=rep(s,'    if(burst83adFrame)burst83adHooks.finish(burst83adFrame);','    if(domino82qFrame)domino82qHooks.finish(domino82qFrame);\n    if(burst83adFrame)burst83adHooks.finish(burst83adFrame);')
s=rep(s,'    } finally {if(burst83adFrame)', '    } finally {if(domino82qFrame)domino82qHooks.abort(domino82qFrame);if(burst83adFrame)')
(U/'renderer82am.js').write_text(s)
s=(R/'dev/avoidance/burst83/ui-owned83bb/post-scope83bb.js').read_text().replace('burstComposeScope83ay','dominoUICompose82ak').replace("layout!=='burst'","layout!=='dominoes'").replace('burstPostScope83bb','dominoPostScope82am');(U/'post-scope82am.js').write_text(s)
