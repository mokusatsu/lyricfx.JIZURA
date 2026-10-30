from pathlib import Path
import sys
R=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent;D=R/'dev/avoidance/domino82';B=R/'dev/avoidance/burst83'
def rep(s,a,b):
 assert s.count(a)==1,(a,s.count(a));return s.replace(a,b)
s=(D/'ui-projection82ak/owner82ak.js').read_text().replace('dominoUIPrivateOwner82ak','dominoUIPrivateOwner82ao')
start=s.index('const viewport=denseCopy(inputViewport);');end=s.index("need(typeof currentGeneration",start);block=s[start:end]
validation=block[block.index('need(viewport&&'):block.index('const viewportBytes=')]
s=s[:start]+"const checkedViewport=input=>{const viewport=denseCopy(input);"+validation+"return viewport;};let viewport=checkedViewport(inputViewport),viewportBytes=C.serializedBytes(viewport)+128;"+s[end:]
s=rep(s,'function drop(){idle();dispose();}return Object.freeze({begin,', "function configureViewport(input){idle();need(!job&&!record,'DOMINO82AO_VIEWPORT_BUSY');const candidate=checkedViewport(input);viewport=candidate;viewportBytes=C.serializedBytes(viewport)+128;epoch++;return Object.freeze({width:viewport.width,height:viewport.height,scale:viewport.scale});}\n function drop(){idle();dispose();}return Object.freeze({configureViewport,begin,")
(U/'owner82ao.js').write_text(s)
s=(D/'normal-options82an/controller82an.js').read_text().replace('dominoUIPrivateOwner82ak','dominoUIPrivateOwner82ao').replace('dominoUIFrameController82am','dominoUIFrameController82ao').replace('domino_prepared82am','domino_prepared82ao')
s=rep(s,'const viewport=frozenCopy(options.viewport);','let viewport=frozenCopy(options.viewport);')
s=rep(s,'return Object.freeze({begin,step:owner.step,', "function configureViewport(input){need(!active&&!ticketRecord&&!stage&&!provisional&&certificates.length===0,'DOMINO82AO_VIEWPORT_BUSY');const candidate=frozenCopy(input);owner.configureViewport(candidate);viewport=candidate;return viewport;}\n return Object.freeze({configureViewport,begin,step:owner.step,")
# Normal frame routing never trusts mutable UI metadata as a ready-plan binding.
s=rep(s,"needs:(plan,opt)=>failedStage(plan)||planBinding?.needs(plan)||Object.hasOwn(opt,'dominoFrameTicket')", "needs:(plan,opt)=>failedStage(plan)||(plan.placementFinalization?.diagnostics||[]).some(d=>d.adapter===ADAPTER_ID&&d.runtimeAdmissionRequired===true)||planBinding?.needs(plan)||Object.hasOwn(opt,'dominoFrameTicket')")
s=rep(s,"||Object.hasOwn(opt,'dominoFrameTicket'),prepare", "||Object.hasOwn(opt,'dominoFrameTicket')||J.dominoFrameTarget82ao?.(plan,opt),prepare")
s=rep(s,"(plan.placementFinalization?.diagnostics||[]).some(d=>d.adapter===ADAPTER_ID&&d.runtimeAdmissionRequired===true)||planBinding?.needs(plan)", "((plan.placementFinalization?.diagnostics||[]).some(d=>d.adapter===ADAPTER_ID&&d.runtimeAdmissionRequired===true)&&J.dominoFrameTarget82ao?.(plan,opt))||planBinding?.needs(plan)")
(U/'controller82ao.js').write_text(s)
s=(B/'viewport-session83bd/session83bd.js').read_text().replace('burstUISession83bd','dominoUISession82ao').replace('BURST_UI','DOMINO_UI');(U/'session82ao.js').write_text(s)
s=(B/'product-ui83be/target83be.js').read_text().replace("layout==='burst'","layout==='dominoes'").replace('burstUIBoundary83be','dominoUIBoundary82ao');(U/'target82ao.js').write_text(s)
s=(D/'normal-options82an/post-scope82an.js').read_text().replace('domino_prepared82am','domino_prepared82ao');(U/'post-scope82ao.js').write_text(s)

render=(D/'ui-frame82am/renderer82am.js').read_text();needle='const domino82qFrames=new WeakMap();let domino82qHooks=null;';render=rep(render,needle,needle+"""
let dominoRequired82ao=false;
Object.defineProperty(J,'dominoFrameTarget82ao',{value:(plan,opt={})=>dominoRequired82ao&&(J.placement.dominoUIBoundary82ao?J.placement.dominoUIBoundary82ao.targetsFrame(plan,opt.avoidanceRealTime):plan?.layerVisibility?.lyrics!==false&&plan?.lyricAvoidanceIndex?.enabled===true&&(plan.cuts||[]).some(c=>c.layout==='dominoes'))});
Object.defineProperty(J,'requireDominoProof82ao',{configurable:true,value:()=>{dominoRequired82ao=true;delete J.requireDominoProof82ao}});
""")
render=rep(render,'  frame(ctx, plan, t, opt = {}) {',"""  frame(ctx, plan, t, opt = {}) {
    if(!domino82qHooks&&J.dominoFrameTarget82ao(plan,{...opt,avoidanceRealTime:opt.avoidanceRealTime??t}))throw Object.assign(Error('DOMINO_UI_PREPARE_REQUIRED'),{code:'DOMINO_UI_PREPARE_REQUIRED'});""")
render=rep(render,'  post(ctx, plan, t, tq, step, sc, scale, opt, allowFilter) {',"""  post(ctx, plan, t, tq, step, sc, scale, opt, allowFilter) {
    if(J.placement.dominoNormalPostScope82an?.needs(plan))J.placement.dominoNormalPostScope82an.assertBeforePost(plan,{...opt,scale},this,ctx);""")
(U/'renderer82ao.js').write_text(render)
