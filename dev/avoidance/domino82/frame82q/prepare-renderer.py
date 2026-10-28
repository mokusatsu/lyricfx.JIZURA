from pathlib import Path
import sys,difflib
p=Path(__file__).resolve().parent;before=Path(sys.argv[1]).read_text();s=before
anchor='const bulbs80Frames=new WeakMap();let bulbs80Hooks=null;'
assert s.count(anchor)==1
prefix="""// Unregistered domino current-frame issuer, opt-in ticket only.
const domino82qFrames=new WeakMap();let domino82qHooks=null;
Object.defineProperty(J,'installDominoFrame82q',{configurable:true,value:hooks=>{
 if(domino82qHooks||!hooks||!['needs','prepare','paint','finish','abort'].every(k=>typeof hooks[k]==='function'))throw Error('INVALID_DOMINO82Q_FRAME_HOOKS');
 domino82qHooks=Object.freeze({needs:hooks.needs,prepare:hooks.prepare,paint:hooks.paint,finish:hooks.finish,abort:hooks.abort});delete J.installDominoFrame82q;
 return Object.freeze({take:(renderer,env)=>{const record=domino82qFrames.get(env);if(!record||record.renderer!==renderer||record.ctx!==env.ctx||record.plan!==env.plan||record.cut!==env.cut)throw Object.assign(Error('DOMINO82Q_FRAME_ISSUER_REQUIRED'),{code:'DOMINO82Q_FRAME_ISSUER_REQUIRED'});domino82qFrames.delete(env);return record;}});
}});
"""
s=s.replace(anchor,prefix+anchor)
s=s.replace('    // All pilot B/A/main proofs finish before clearRect, background, or ANY bitmap write.',"    // Reject hook overlap before any prepare can allocate an active lease.\n    const domino82qNeeded=!!domino82qHooks?.needs(plan,opt);\n    if(domino82qNeeded&&(tiles48Hooks?.needs(plan)||bulbs69Hooks?.needs(plan)||bulbs80Hooks?.needs(plan,opt)))throw Object.assign(Error('DOMINO82Q_HOOK_CONFLICT'),{code:'DOMINO82Q_HOOK_CONFLICT'});\n    // All pilot B/A/main proofs finish before clearRect, background, or ANY bitmap write.")
anchor='    try {\n    const foregroundCut ='
assert s.count(anchor)==1
s=s.replace(anchor,"    const domino82qFrame=domino82qNeeded?domino82qHooks.prepare(Object.freeze({renderer:this,ctx,plan,t,opt})):null;\n    try {\n    const foregroundCut =")
anchor='        if(bulbs80Frame){'
assert s.count(anchor)==1
s=s.replace(anchor,"        if(domino82qFrame){\n          domino82qFrames.set(env,Object.freeze({renderer:this,ctx:X,plan,cut,frame:domino82qFrame,pass:P.pass}));\n          // Scope has no decor/effectsOnly: dispatch the original layout and\n          // propagate its error. Only token lifetime cleanup changes here.\n          domino82qHooks.paint(Object.freeze({renderer:this,env}));\n        } else if(bulbs80Frame){")
s=s.replace('    if(bulbs80Frame)bulbs80Hooks.finish(bulbs80Frame);','    if(domino82qFrame)domino82qHooks.finish(domino82qFrame);\n    if(bulbs80Frame)bulbs80Hooks.finish(bulbs80Frame);')
s=s.replace('    } finally {if(bulbs80Frame)bulbs80Hooks.abort(bulbs80Frame);}', '    } finally {if(domino82qFrame)domino82qHooks.abort(domino82qFrame);if(bulbs80Frame)bulbs80Hooks.abort(bulbs80Frame);}')
(p/'09_render-frame82.js').write_text(s);(p/'renderer-frame.diff').write_text(''.join(difflib.unified_diff(before.splitlines(True),s.splitlines(True),fromfile='a/09_render.js',tofile='b/09_render.js',n=0)))
