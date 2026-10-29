from pathlib import Path
import sys
root=Path(sys.argv[1]);out=Path(sys.argv[2]);d=root/'dev/avoidance/bulbs86/viewport-controller86ax';out.mkdir(parents=True,exist_ok=True)
s=(root/'dev/avoidance/bulbs86/viewport-handoff86aw/model-owner86.js').read_text();key='const binding=Object.freeze({viewport:r.viewport,';assert s.count(key)==1;s=s.replace(key,'const binding=Object.freeze({handle:r.handle,viewport:r.viewport,');(out/'model-owner86.js').write_text(s)
s=(root/'dev/avoidance/bulbs86/viewport-replay86af/replay86.js').read_text().replace('function* replay(', 'function replay(').replace('yield checkpoint;', '').replace('A.bulbsViewportReplay86af=','A.bulbsViewportCandidateReplay86ax=');(out/'replay86.js').write_text(s)
s=(root/'dev/avoidance/bulbs86/fast-scope86z/controller86.js').read_text();key='const A=J.placement,';assert s.count(key)==1;s=s.replace(key,'const A=J.placement,V=A.bulbsViewportRoot86ae,VR=A.bulbsViewportCandidateReplay86ax,',1)
g=(root/'dev/avoidance/bulbs86/viewport-geometry86al/geometry86.js').read_text().replace("(()=>{'use strict';const A=J.placement", "const VG=(()=>{'use strict';const A=J.placement",1).replace('A.bulbsViewportGeometry86al=Object.freeze','return Object.freeze');assert 'A.bulbsViewportGeometry86al=' not in g
key='function create({';assert s.count(key)==1;s=s.replace(key,g+'\n'+(d/'create-fragment.js').read_text()+'\n'+key)
s=s.replace('function context(ctx){', 'function context(ctx,viewport=null){').replace('ctx.canvas.width===960&&ctx.canvas.height===540', 'ctx.canvas.width===(viewport?.width??960)&&ctx.canvas.height===(viewport?.height??540)')
s=s.replace("function check(rec,renderer){", "function check(rec,renderer){if(rec.viewport){need(A.bulbsViewportRoot86ae===V&&A.bulbsViewportCandidateReplay86ax===VR,'BULBS86AX_SOURCE');access.withViewportCandidate86aw(rec.viewportToken,rec.viewportCandidateIndex,{renderer,plan:rec.plan},()=>null);}")
s=s.replace('(opt.scale??1)===1&&!opt.noLyrics', '(opt.scale??1)===(rec.viewport?.scale??1)&&!opt.noLyrics').replace('P.same(context(ctx),rec.profile)', 'P.same(context(ctx,rec.viewport),rec.profile)')
s=s.replace('const env=P.makeEnv(renderer,plan,active[0],ctx,own,t),root=P.matrix(ctx);', 'const env=rec.viewport?V.makeEnv(renderer,plan,active[0],ctx,own,t,rec.viewport.scale):P.makeEnv(renderer,plan,active[0],ctx,own,t),root=P.matrix(ctx);')
s=s.replace('&&same(root,entry.root)', '&&(rec.viewport?rec.viewport.scale===.75:same(root,entry.root))')
s=s.replace('Object.freeze({installPlanIssuer80,create,', 'Object.freeze({installPlanIssuer80,createViewport86ax,create,')
(out/'controller86.js').write_text(s)
