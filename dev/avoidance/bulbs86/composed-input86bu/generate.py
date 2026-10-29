from pathlib import Path
import sys
r=Path(sys.argv[1]).resolve();d=Path(__file__).resolve().parent
s=(r/'dev/avoidance/bulbs86/viewport-direct-model86be/scalar-generator86.js').read_text()
s=s.replace('const A=J.placement,FA=', 'const A=J.placement,CS=A.bulbsComposeScope86bu,FA=',1)
a="need(cut.start===0&&(cut.renderStart??0)===0&&cut.end===4&&(cut.displayEnd??4)===4&&cut.dur===4&&cut.inDur===.35&&cut.outDur===.4&&cut.contentScale===1&&cut.motionScale===1&&cut.cam==='push'&&same(cut.camP,{a:.022,dir:1})&&cut.enter==='cut'&&cut.exit==='cut'&&cut.hold==='still'&&cut.treat==='none','BULBS80_FIXED_SOURCE_OPERATIONS');"
b="need(CS&&A.bulbsComposeScope86bu===CS,'BULBS86BU_SCOPE_SOURCE');CS.timing(plan,cut);need(cut.contentScale===1&&cut.motionScale===1&&cut.cam==='push'&&cut.enter==='cut'&&cut.exit==='cut'&&cut.hold==='still'&&cut.treat==='none','BULBS80_FIXED_SOURCE_OPERATIONS');"
assert s.count(a)==1;s=s.replace(a,b)
a='!plan.media&&!plan.foreground&&!plan.energy';assert s.count(a)==1;s=s.replace(a,'CS.layers(plan)&&!plan.energy')
a='plan.style.glow===0';assert s.count(a)==1;s=s.replace(a,'(plan.style.glow===0||plan.style.glow===undefined)')
a="need(plan.duration===4.150001,'BULBS80_DURATION_DOMAIN');";assert s.count(a)==1;s=s.replace(a,'')
a='clocks=P.clock(plan,cut)';assert s.count(a)==1;s=s.replace(a,'clocks=CS.clock(plan,cut)')
(d/'scalar-generator86.js').write_text(s)
s=(r/'dev/avoidance/bulbs86/viewport-direct-controller86bj/model-owner86.js').read_text();s=s.replace('const A=J.placement,C=', 'const A=J.placement,CS=A.bulbsComposeScope86bu,C=',1)
a='function dependency(renderer,canonical=renderer){';assert s.count(a)==1;s=s.replace(a,a+"need(A.bulbsComposeScope86bu===CS&&CS&&typeof CS.clock==='function'&&typeof CS.layers==='function','BULBS86BU_SCOPE_SOURCE');CS.source();")
a='const refs=[viewportRoot86be,';assert s.count(a)==1;s=s.replace(a,'const refs=[CS,CS.source,CS.clock,CS.layers,CS.timing,viewportRoot86be,')
(d/'model-owner86.js').write_text(s)
s=(r/'dev/avoidance/bulbs86/viewport-normal86bp/post86.js').read_text();s=s.replace('A=J.placement,R=', 'A=J.placement,CS=J.placement.bulbsComposeScope86bu,R=',1)
a="if(!s||!same(read(s,'glow'),0))return false";assert s.count(a)==1;s=s.replace(a,"if(!s||!(same(read(s,'glow'),0)||read(s,'glow')===undefined))return false")
a="read(plan,'media')!=null||read(plan,'foreground')!=null";assert s.count(a)==1;s=s.replace(a,"!CS.layers(plan)")
a="need(J===runtimeJ&&Math===mathRef";assert s.count(a)==1;s=s.replace(a,"need(A.bulbsComposeScope86bu===CS,'BULBS86BU_SCOPE_SOURCE');CS.source();need(J===runtimeJ&&Math===mathRef")
(d/'post86.js').write_text(s)
