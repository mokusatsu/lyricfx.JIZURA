from pathlib import Path
import sys
r=Path(sys.argv[1]).resolve();d=Path(__file__).resolve().parent;s=(r/'dev/avoidance/burst83/formal-binding83av/private-controller83.js').read_text()
helper="""// Input-derived proposal only. The unchanged whole-owner replay still grants readiness.
function chooseDestination83ax(sourceUnion,circle){const supports=[{bounds:sourceUnion}],choices=G.positions(supports,circle,{evaluate:false}),zero=G.evaluation(supports,circle,[0,0]);const clear=p=>G.evaluation(supports,circle,p.delta).passed;const chosen=zero.passed?{side:'zero',delta:[0,0]}:choices.find(p=>p.side==='right'&&clear(p))||choices.find(clear)||null;return{choices,chosen,sourceUnion,zeroClear:zero.passed,policy:'zero-if-clear; preserve first valid existing right; remaining existing finite order'};}
"""
a='let installed83ag=null;';assert s.count(a)==1;s=s.replace(a,helper+'\n'+a)
a="choices=G.positions([{bounds:model.sourceUnion}],circle,{evaluate:false});const chosen=choices.find(x=>x.side==='right');need(chosen,'BURST83Z_FINITE_RIGHT_INSUFFICIENT');";assert s.count(a)==1;s=s.replace(a,"const selection=chooseDestination83ax(model.sourceUnion,circle);choices=selection.choices;const chosen=selection.chosen;need(chosen,'BURST83AX_FINITE_CANDIDATE_INSUFFICIENT');")
a="proof={circle,delta,checkedOwn:0";assert s.count(a)==1;s=s.replace(a,"proof={circle,delta,selection:{side:chosen.side,sourceUnion:selection.sourceUnion,zeroClear:selection.zeroClear,finiteCount:choices.length,policy:selection.policy},checkedOwn:0")
a='residentBytes=C.serializedBytes(model)+C.serializedBytes(choices);';assert s.count(a)==1;s=s.replace(a,'residentBytes=C.serializedBytes(model)+C.serializedBytes(choices)+C.serializedBytes(selection)+4096;')
(d/'private-controller83.js').write_text(s)
