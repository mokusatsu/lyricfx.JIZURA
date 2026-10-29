from pathlib import Path
import sys
r=Path(sys.argv[1]).resolve();d=Path(__file__).resolve().parent
s=(r/'dev/avoidance/burst83/time-domain83as/renderer-time83.js').read_text().replace('burstRendererTime83ab','crosswordRendererTime85r').replace('BURST83AB','CROSSWORD85R_TIME')
(d/'renderer-time85.js').write_text(s)
s=(r/'dev/avoidance/burst83/formal-binding83av/plan-binding83.js').read_text().replace('burstPlanBinding83av','crosswordPlanBinding85r').replace('burst-owned-plan-certificate83av','crossword-owned-plan-certificate85r').replace("'burst'","'crossword'")
(d/'plan-binding85.js').write_text(s)
# The existing optional frame seam is reused under crossword-only names. No source
# renderer body is changed; controller dispatches the already tested84j path.
source=(r/'src/09_render.js').read_text();anchor='const bulbs80Frames=new WeakMap();let bulbs80Hooks=null;';assert source.count(anchor)==1
prefix="""// Unregistered crossword-only current-frame hook, before bitmap writes.
const crossword85rFrames=new WeakMap();let crossword85rHooks=null;
Object.defineProperty(J,'installCrosswordFrame85r',{configurable:true,value:hooks=>{
 if(crossword85rHooks||!hooks||!['needs','prepare','paint','finish','abort'].every(k=>typeof hooks[k]==='function'))throw Error('INVALID_CROSSWORD85R_HOOKS');
 crossword85rHooks=Object.freeze({...hooks});delete J.installCrosswordFrame85r;
 return Object.freeze({take:(renderer,env)=>{const r=crossword85rFrames.get(env);if(!r||r.renderer!==renderer||r.ctx!==env.ctx||r.plan!==env.plan||r.cut!==env.cut)throw Object.assign(Error('CROSSWORD85R_ISSUER'),{code:'CROSSWORD85R_ISSUER'});crossword85rFrames.delete(env);return r}});
}});
const crossword85rInstall=J.installCrosswordFrame85r;
Object.defineProperty(J,'crosswordFrameInstallerIdentity85r',{value:Object.freeze(()=>crossword85rInstall)});
"""
source=source.replace(anchor,prefix+anchor)
anchor='    // All pilot B/A/main proofs finish before clearRect, background, or ANY bitmap write.';assert source.count(anchor)==1
source=source.replace(anchor,"    const crossword85rNeeded=!!crossword85rHooks?.needs(plan,opt);\n    if(crossword85rNeeded&&(tiles48Hooks?.needs(plan)||bulbs69Hooks?.needs(plan)||bulbs80Hooks?.needs(plan,opt)))throw Object.assign(Error('CROSSWORD85R_HOOK_CONFLICT'),{code:'CROSSWORD85R_HOOK_CONFLICT'});\n"+anchor)
anchor='    try {\n    const foregroundCut =';assert source.count(anchor)==1
source=source.replace(anchor,'    const crossword85rFrame=crossword85rNeeded?crossword85rHooks.prepare(Object.freeze({renderer:this,ctx,plan,t,opt})):null;\n'+anchor)
anchor='        if(bulbs80Frame){';assert source.count(anchor)==1
source=source.replace(anchor,'        if(crossword85rFrame){\n          crossword85rFrames.set(env,Object.freeze({renderer:this,ctx:X,plan,cut,frame:crossword85rFrame,pass:P.pass}));\n          crossword85rHooks.paint(Object.freeze({renderer:this,env}));\n        } else if(bulbs80Frame){')
source=source.replace('    if(bulbs80Frame)bulbs80Hooks.finish(bulbs80Frame);','    if(crossword85rFrame)crossword85rHooks.finish(crossword85rFrame);\n    if(bulbs80Frame)bulbs80Hooks.finish(bulbs80Frame);')
source=source.replace('    } finally {if(bulbs80Frame)bulbs80Hooks.abort(bulbs80Frame);}','    } finally {if(crossword85rFrame)crossword85rHooks.abort(crossword85rFrame);if(bulbs80Frame)bulbs80Hooks.abort(bulbs80Frame);}')
(d/'09_render-frame85.js').write_text(source)
