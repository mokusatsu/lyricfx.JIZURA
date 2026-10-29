from pathlib import Path
import sys,difflib,json,hashlib
p=Path(__file__).resolve().parent;before=Path(sys.argv[1]).read_text();s=before
anchor='const bulbs80Frames=new WeakMap();let bulbs80Hooks=null;'
assert s.count(anchor)==1
prefix="""// Unregistered burst current-frame issuer, opt-in ticket only.
const burst83adFrames=new WeakMap();let burst83adHooks=null;
Object.defineProperty(J,'installBurstFrame83ad',{configurable:true,value:hooks=>{
 if(burst83adHooks||!hooks||!['needs','prepare','paint','finish','abort'].every(k=>typeof hooks[k]==='function'))throw Error('INVALID_BURST83AD_FRAME_HOOKS');
 burst83adHooks=Object.freeze({needs:hooks.needs,prepare:hooks.prepare,paint:hooks.paint,finish:hooks.finish,abort:hooks.abort});delete J.installBurstFrame83ad;
 return Object.freeze({take:(renderer,env)=>{const record=burst83adFrames.get(env);if(!record||record.renderer!==renderer||record.ctx!==env.ctx||record.plan!==env.plan||record.cut!==env.cut)throw Object.assign(Error('BURST83AD_FRAME_ISSUER_REQUIRED'),{code:'BURST83AD_FRAME_ISSUER_REQUIRED'});burst83adFrames.delete(env);return record;}});
}});
"""
s=s.replace(anchor,prefix+anchor)
s=s.replace('    // All pilot B/A/main proofs finish before clearRect, background, or ANY bitmap write.',"    // Reject hook overlap before any prepare can allocate an active lease.\n    const burst83adNeeded=!!burst83adHooks?.needs(plan,opt);\n    if(burst83adNeeded&&(tiles48Hooks?.needs(plan)||bulbs69Hooks?.needs(plan)||bulbs80Hooks?.needs(plan,opt)))throw Object.assign(Error('BURST83AD_HOOK_CONFLICT'),{code:'BURST83AD_HOOK_CONFLICT'});\n    // All pilot B/A/main proofs finish before clearRect, background, or ANY bitmap write.")
anchor='    try {\n    const foregroundCut ='
assert s.count(anchor)==1
s=s.replace(anchor,"    const burst83adFrame=burst83adNeeded?burst83adHooks.prepare(Object.freeze({renderer:this,ctx,plan,t,opt})):null;\n    try {\n    const foregroundCut =")
anchor='        if(bulbs80Frame){'
assert s.count(anchor)==1
s=s.replace(anchor,"        if(burst83adFrame){\n          burst83adFrames.set(env,Object.freeze({renderer:this,ctx:X,plan,cut,frame:burst83adFrame,pass:P.pass}));\n          // Scope has no decor/effectsOnly: dispatch the original layout and\n          // propagate its error. Only token lifetime cleanup changes here.\n          burst83adHooks.paint(Object.freeze({renderer:this,env}));\n        } else if(bulbs80Frame){")
s=s.replace('    if(bulbs80Frame)bulbs80Hooks.finish(bulbs80Frame);','    if(burst83adFrame)burst83adHooks.finish(burst83adFrame);\n    if(bulbs80Frame)bulbs80Hooks.finish(bulbs80Frame);')
s=s.replace('    } finally {if(bulbs80Frame)bulbs80Hooks.abort(bulbs80Frame);}', '    } finally {if(burst83adFrame)burst83adHooks.abort(burst83adFrame);if(bulbs80Frame)bulbs80Hooks.abort(bulbs80Frame);}')
(p/'09_render-frame83.js').write_text(s);(p/'renderer-frame.patch').write_text(''.join(difflib.unified_diff(before.splitlines(True),s.splitlines(True),fromfile='a/09_render.js',tofile='b/09_render.js',n=0)))

(p/'renderer-boundary.json').write_text(json.dumps({'stockRendererSHA256':hashlib.sha256(before.encode()).hexdigest(),'candidateRendererSHA256':hashlib.sha256(s.encode()).hexdigest(),'scope':'uninstalled optional hook seam; no controller/authority/Canvas regression qualification'},indent=2)+'\n')
