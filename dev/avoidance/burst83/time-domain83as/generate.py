from pathlib import Path
D=Path(__file__).resolve().parent
B=D.parent

def replace(s,a,b):
 assert s.count(a)==1,a
 return s.replace(a,b)
s=(B/'renderer-time83ab/renderer-time83.js').read_text()
s=replace(s,"const range=[-clock.h,Math.max(plan.duration,cut.end+lags[0][1])+clock.h];", "const reachTail=.6+2*clock.h+lags[0][1]+.06+.01;const range=[Math.min(cut.start,cut.renderStart??cut.start)-clock.h,Math.max(cut.end,cut.displayEnd??cut.end)+reachTail];")
(D/'renderer-time83.js').write_text(s)
s=(B/'frame-controller83ag/private-controller83.js').read_text()
s=replace(s,"need(selection.kind==='model'&&(Object.is(t,selection.sourceN/60)||Object.is(t,-0)),'BURST83AG_TIME_NOT_QUALIFIED');", "need(['model','initial-model','empty'].includes(selection.kind)&&selection.state&&Array.isArray(selection.state.passes),'BURST83AG_TIME_NOT_QUALIFIED');if(selection.kind==='empty')need(selection.sourceN===null&&selection.state.passes.length===3&&selection.state.passes.every(p=>p.active===false),'BURST83AS_TAIL_ACTIVE');else need(Number.isInteger(selection.sourceN)&&selection.sourceN>=0&&selection.state===clock.states[selection.sourceN],'BURST83AS_SOURCE_STATE');")
s=replace(s,'canonicalFramesOnly:true','canonicalFramesOnly:false,timeDomain83as:true')
(D/'private-controller83.js').write_text(s)
s=(B/'frame-controller83ag/controller-test.cjs').read_text()
s=replace(s,"s=fs.readFileSync(__dirname+'/private-controller83.js','utf8')","s=fs.readFileSync(__dirname+'/private-controller83.js','utf8')")
s=replace(s,"evaluationRange:()=>[0,1],select({t,clock}){return t===0?{kind:'model',sourceN:0,state:clock.states[0]}:{kind:'empty'}}", "evaluationRange:()=>[-1/60,4.77],select({t,clock}){return t<0?{kind:'initial-model',sourceN:0,state:clock.states[0]}:t<1?{kind:'model',sourceN:0,state:clock.states[0]}:{kind:'empty',sourceN:null,state:{passes:[{pass:'B',active:false},{pass:'A',active:false},{pass:'main',active:false}]}}}")
s=replace(s,"reject(()=>hooks.prepare({...args(published),t:-.001,opt:{...args(published).opt,avoidanceRealTime:-.001}}),'BURST83AG_TIME_NOT_QUALIFIED');ok(paintCount===1);", "for(const t of[-.001,.001,4.77]){const token=hooks.prepare({...args(published),t,opt:{...args(published).opt,avoidanceRealTime:t}});if(t>=1)ok(hooks.finish(token));else hooks.abort(token);ok(paintCount===1)}")
(D/'controller-test.cjs').write_text(s)
