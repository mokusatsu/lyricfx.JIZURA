from pathlib import Path
import sys
r=Path(sys.argv[1]).resolve();d=Path(__file__).resolve().parent
s=(r/'dev/avoidance/burst83/time-domain83as/renderer-time83.js').read_text().replace('burstRendererTime83ab','contourRendererTime84q').replace('BURST83AB','CONTOUR84Q_TIME')
(d/'renderer-time84.js').write_text(s)
s=(r/'dev/avoidance/burst83/formal-binding83av/plan-binding83.js').read_text().replace('burstPlanBinding83av','contourPlanBinding84q').replace('burst-owned-plan-certificate83av','contour-owned-plan-certificate84q').replace("'burst'","'contour'")
(d/'plan-binding84.js').write_text(s)
# The existing optional frame seam is reused under contour-only names. No source
# renderer body is changed; controller dispatches the already tested84j path.
source=(r/'src/09_render.js').read_text();anchor='const bulbs80Frames=new WeakMap();let bulbs80Hooks=null;';assert source.count(anchor)==1
prefix="""// Unregistered contour-only current-frame hook, before bitmap writes.
const contour84qFrames=new WeakMap();let contour84qHooks=null;
Object.defineProperty(J,'installContourFrame84q',{configurable:true,value:hooks=>{
 if(contour84qHooks||!hooks||!['needs','prepare','paint','finish','abort'].every(k=>typeof hooks[k]==='function'))throw Error('INVALID_CONTOUR84Q_HOOKS');
 contour84qHooks=Object.freeze({...hooks});delete J.installContourFrame84q;
 return Object.freeze({take:(renderer,env)=>{const r=contour84qFrames.get(env);if(!r||r.renderer!==renderer||r.ctx!==env.ctx||r.plan!==env.plan||r.cut!==env.cut)throw Object.assign(Error('CONTOUR84Q_ISSUER'),{code:'CONTOUR84Q_ISSUER'});contour84qFrames.delete(env);return r}});
}});
const contour84qInstall=J.installContourFrame84q;
Object.defineProperty(J,'contourFrameInstallerIdentity84q',{value:Object.freeze(()=>contour84qInstall)});
"""
source=source.replace(anchor,prefix+anchor)
anchor='    // All pilot B/A/main proofs finish before clearRect, background, or ANY bitmap write.';assert source.count(anchor)==1
source=source.replace(anchor,"    const contour84qNeeded=!!contour84qHooks?.needs(plan,opt);\n    if(contour84qNeeded&&(tiles48Hooks?.needs(plan)||bulbs69Hooks?.needs(plan)||bulbs80Hooks?.needs(plan,opt)))throw Object.assign(Error('CONTOUR84Q_HOOK_CONFLICT'),{code:'CONTOUR84Q_HOOK_CONFLICT'});\n"+anchor)
anchor='    try {\n    const foregroundCut =';assert source.count(anchor)==1
source=source.replace(anchor,'    const contour84qFrame=contour84qNeeded?contour84qHooks.prepare(Object.freeze({renderer:this,ctx,plan,t,opt})):null;\n'+anchor)
anchor='        if(bulbs80Frame){';assert source.count(anchor)==1
source=source.replace(anchor,'        if(contour84qFrame){\n          contour84qFrames.set(env,Object.freeze({renderer:this,ctx:X,plan,cut,frame:contour84qFrame,pass:P.pass}));\n          contour84qHooks.paint(Object.freeze({renderer:this,env}));\n        } else if(bulbs80Frame){')
source=source.replace('    if(bulbs80Frame)bulbs80Hooks.finish(bulbs80Frame);','    if(contour84qFrame)contour84qHooks.finish(contour84qFrame);\n    if(bulbs80Frame)bulbs80Hooks.finish(bulbs80Frame);')
source=source.replace('    } finally {if(bulbs80Frame)bulbs80Hooks.abort(bulbs80Frame);}','    } finally {if(contour84qFrame)contour84qHooks.abort(contour84qFrame);if(bulbs80Frame)bulbs80Hooks.abort(bulbs80Frame);}')
(d/'09_render-frame84.js').write_text(source)
