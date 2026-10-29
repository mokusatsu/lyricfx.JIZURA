from pathlib import Path
import sys
r=Path(sys.argv[1]).resolve();d=Path(__file__).resolve().parent
s=(r/'dev/avoidance/bulbs86/viewport-controller86ax/replay86.js').read_text().replace('function replay({','function* replayGenerator86br({',1)
a='const checkpoint=Object.freeze({completed:rootCount});budget({checkpoint});}';assert s.count(a)==1;s=s.replace(a,'const checkpoint=Object.freeze({completed:rootCount});budget({checkpoint});yield checkpoint;}')
a='A.bulbsViewportCandidateReplay86ax=Object.freeze({replay});';assert s.count(a)==1;s=s.replace(a,"function replay(args){const iterator=replayGenerator86br(args);for(;;){const value=iterator.next();if(value.done)return value.value;}}\nA.bulbsViewportCandidateReplay86ax=Object.freeze({replay,replayGenerator86br});");(d/'replay86.js').write_text(s)
s=(r/'dev/avoidance/bulbs86/viewport-normal86bp/controller86.js').read_text();a='function createDirectViewport86bj(';assert s.count(a)==1;s=s.replace(a,(d/'record-iterator86.js').read_text()+'\n'+(d/'record-job86.js').read_text()+'\n'+a).replace('installPlanIssuer80,createDirectViewport86bj,','installPlanIssuer80,beginDirectViewport86br,createDirectViewport86bj,')
a='function prepare({ticket,renderer,ctx,plan,t,opt}){need(activeFrame===null,';assert s.count(a)==1;s=s.replace(a,'function prepare({ticket,renderer,ctx,plan,t,opt}){need(activeFrame===null&&activeRecordJob86br===null,')
a='function createDirectViewport86bj({handle,index=0,renderer,plan,timing=null}){';assert s.count(a)==1;s=s.replace(a,a+"need(activeRecordJob86br===null,'BULBS86BR_JOB_ACTIVE');");(d/'controller86.js').write_text(s)
