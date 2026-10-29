from pathlib import Path
import sys
root=Path(sys.argv[1]);out=Path(sys.argv[2]);s=(root/'dev/avoidance/bulbs86/viewport-candidates86am/model-owner86.js').read_text()
s=s.replace('function positions(supports,c,{evaluate=true,viewport}={})','function positions(supports,c,{evaluate=true,viewport,onTrace=null}={})')
key='const feasible={x0:-b.x0,x1:viewport.width-b.x1,y0:-b.y0,y1:viewport.height-b.y1};';assert s.count(key)==1;s=s.replace(key,key+"if(onTrace)onTrace({union:{...b},feasible:{...feasible},ranges:null});")
key='for(const[side,axis,lo,hi,other]of ranges)';assert s.count(key)==1;s=s.replace(key,"if(onTrace)onTrace({union:{...b},feasible:{...feasible},ranges:ranges.map(([side,axis,lo,hi,other])=>({side,axis,lo,hi,other,feasible:lo<=hi}))});\n "+key)
s=s.replace('positions:null,result:null};borrowWork.viewportEvaluation=work;', 'positions:null,result:null,aggregate:null};borrowWork.viewportEvaluation=work;')
s=s.replace('positions(work.supports,work.circle.circle,{viewport:r.viewport})', 'positions(work.supports,work.circle.circle,{viewport:r.viewport,onTrace:x=>{work.aggregate=x}})')
s=s.replace('work.result={circle:work.circle,zero:', 'work.result={aggregate:work.aggregate,circle:work.circle,zero:')
s=s.replace('const e=r.candidateEvaluation,candidates=[];', "const copyDiag=x=>Array.isArray(x)?Object.freeze(x.map(copyDiag)):x&&typeof x==='object'?Object.freeze(Object.fromEntries(Object.entries(x).map(([k,v])=>[k,copyDiag(v)]))):x,e=r.candidateEvaluation,candidates=[];")
s=s.replace('checkedGroups:e.checkedGroups,zeroPassed:', 'aggregate:copyDiag(e.aggregate),checkedGroups:e.checkedGroups,zeroPassed:')
s=s.replace('serializedViewportBytes:viewportWork86ag+viewportMeta86ag,', 'serializedViewportBytes:viewportWork86ag+viewportMeta86ag+viewportEvaluation86am,')
assert 'work.aggregate=x' in s and 'aggregate:copyDiag' in s
out.mkdir(parents=True,exist_ok=True);(out/'model-owner86.js').write_text(s)
