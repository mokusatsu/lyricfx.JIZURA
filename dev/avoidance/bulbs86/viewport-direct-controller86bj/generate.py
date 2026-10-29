from pathlib import Path
import sys
root=Path(sys.argv[1]);out=Path(sys.argv[2]);d=root/'dev/avoidance/bulbs86/viewport-direct-controller86bj';out.mkdir(parents=True,exist_ok=True)
s=(root/'dev/avoidance/bulbs86/viewport-direct-model86be/model-owner86.js').read_text();a='function installFrameAccess80(';assert s.count(a)==1;s=s.replace(a,(d/'owner-fragment.js').read_text()+'\n'+a)
a='return Object.freeze({dependencySnapshot(renderer,canonical=renderer)';assert s.count(a)==1;s=s.replace(a,'return Object.freeze({withDirectViewport86bj,assertDirectViewport86bj:directEntry86bj,dependencySnapshot(renderer,canonical=renderer)')
a='data={id:serial,key:r.key,depKey:r.depKey,';assert s.count(a)==1;s=s.replace(a,'data={id:serial,key:r.key,fullKey:r.fullKey,depKey:r.depKey,')
a='entry={...data,renderer,ctx,handle,bytes:bytes(data)+bytes({key:r.key,handle})}';assert s.count(a)==1;s=s.replace(a,'entry={...data,renderer,ctx,handle,currentGeneration86bj:isCurrent,sourcePlan86bj:plan,bytes:bytes(data)+bytes({key:r.key,handle,currentGenerationCallbackSlots:1,currentInputReferenceSlots:1})+2*96}')
(out/'model-owner86.js').write_text(s)
s=(root/'dev/avoidance/bulbs86/viewport-controller86ax/controller86.js').read_text();a='function createViewport86ax(';assert s.count(a)==1;s=s.replace(a,(d/'create-fragment.js').read_text()+'\n'+a)
a='function check(rec,renderer){if(rec.viewport){';assert s.count(a)==1;s=s.replace(a,"function check(rec,renderer){if(rec.directViewport86bj){need(A.bulbsViewportRoot86ae===V&&A.bulbsViewportCandidateReplay86ax===VR,'BULBS86BJ_SOURCE');access.assertDirectViewport86bj(rec.handle,{renderer,plan:rec.plan});}else if(rec.viewport){")
a='(rec.viewport?rec.viewport.scale===.75:same(root,entry.root))';assert s.count(a)==1;s=s.replace(a,'(rec.directViewport86bj?same(root,entry.root):rec.viewport?rec.viewport.scale===.75:same(root,entry.root))')
a='Object.freeze({installPlanIssuer80,createViewport86ax,';assert s.count(a)==1;s=s.replace(a,'Object.freeze({installPlanIssuer80,createDirectViewport86bj,createViewport86ax,')
a="check(rec,renderer);if(!rec.evaluationRange)";assert s.count(a)==1;s=s.replace(a,"check(rec,renderer);if(rec.directViewport86bj)need(opt.noPost===true&&opt.fast===true,'BULBS86BJ_FRAME_OPTIONS');if(!rec.evaluationRange)")
(out/'controller86.js').write_text(s)
s=(root/'dev/avoidance/bulbs86/prepared-adapter86d/adapter86.js').read_text().replace("REV='bulbs-owned-source80-v1'","REV='bulbs-owned-direct86bj-v1'")
a='cv.width=960;cv.height=540;';assert s.count(a)==1;s=s.replace(a,'cv.width=720;cv.height=405;')
a=s.index('function finalize({');b=s.index("A.registerLayoutsDAdapter('bulbs'",a);s=s[:a]+(d/'finalize-fragment.js').read_text()+'\n'+s[b:]
(out/'adapter86.js').write_text(s)

