from pathlib import Path
import sys
root=Path(sys.argv[1]);out=Path(sys.argv[2]);d=root/'dev/avoidance/bulbs86/viewport-candidates86am';s=(root/'dev/avoidance/bulbs86/viewport-ready86aj/model-owner86.js').read_text();g=(root/'dev/avoidance/bulbs86/viewport-geometry86al/geometry86.js').read_text();g=g.replace("(()=>{'use strict';const A=J.placement", "const privateViewportGeometry86am=(()=>{'use strict';const A=J.placement",1).replace('A.bulbsViewportGeometry86al=Object.freeze','return Object.freeze');assert 'A.bulbsViewportGeometry86al='not in g
key='function beginViewport86ag(';assert s.count(key)==1;s=s.replace(key,g+'\n'+(d/'fragment.js').read_text()+'\n'+key)
s=s.replace('+viewportWork86ag+viewportMeta86ag;', '+viewportWork86ag+viewportMeta86ag+viewportEvaluation86am;')
s=s.replace('viewportMeta86ag=0;if(!r)return;', 'viewportMeta86ag=0;viewportEvaluation86am=0;if(!r)return;').replace('r.value=null;r.plan=null;', 'r.value=null;r.candidateEvaluation=null;r.plan=null;')
s=s.replace('Object.freeze({viewportSummary86aj,','Object.freeze({evaluateViewport86am,viewportSummary86aj,')
s=s.replace('viewportProposalBytes:viewportWork86ag+viewportMeta86ag,','viewportProposalBytes:viewportWork86ag+viewportMeta86ag+viewportEvaluation86am,')
out.mkdir(parents=True,exist_ok=True);(out/'model-owner86.js').write_text(s)
