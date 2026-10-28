from pathlib import Path
import sys,difflib
p=Path(__file__).resolve().parent;before=Path(sys.argv[1]).read_text();s=before
anchor='const bulbs80Frames=new WeakMap();let bulbs80Hooks=null;'
assert s.count(anchor)==1
prefix="""// Unregistered billboard current-frame issuer, opt-in ticket only.
const billboard81Frames=new WeakMap();let billboard81Hooks=null;
Object.defineProperty(J,'installBillboardFrame81',{configurable:true,value:hooks=>{
 if(billboard81Hooks||!hooks||!['needs','prepare','paint','finish','abort'].every(k=>typeof hooks[k]==='function'))throw Error('INVALID_BILLBOARD81_FRAME_HOOKS');
 billboard81Hooks=Object.freeze({needs:hooks.needs,prepare:hooks.prepare,paint:hooks.paint,finish:hooks.finish,abort:hooks.abort});delete J.installBillboardFrame81;
 return Object.freeze({take:(renderer,env)=>{const record=billboard81Frames.get(env);if(!record||record.renderer!==renderer||record.ctx!==env.ctx||record.plan!==env.plan||record.cut!==env.cut)throw Object.assign(Error('BILLBOARD81S_FRAME_ISSUER_REQUIRED'),{code:'BILLBOARD81S_FRAME_ISSUER_REQUIRED'});billboard81Frames.delete(env);return record;}});
}});
"""
s=s.replace(anchor,prefix+anchor)
s=s.replace('    // All pilot B/A/main proofs finish before clearRect, background, or ANY bitmap write.',"    // Reject hook overlap before any prepare can allocate an active lease.\n    const billboard81Needed=!!billboard81Hooks?.needs(plan,opt);\n    if(billboard81Needed&&(tiles48Hooks?.needs(plan)||bulbs69Hooks?.needs(plan)||bulbs80Hooks?.needs(plan,opt)))throw Object.assign(Error('BILLBOARD81S_HOOK_CONFLICT'),{code:'BILLBOARD81S_HOOK_CONFLICT'});\n    // All pilot B/A/main proofs finish before clearRect, background, or ANY bitmap write.")
anchor='    try {\n    const foregroundCut ='
assert s.count(anchor)==1
s=s.replace(anchor,"    const billboard81Frame=billboard81Needed?billboard81Hooks.prepare(Object.freeze({renderer:this,ctx,plan,t,opt})):null;\n    try {\n    const foregroundCut =")
anchor='        if(bulbs80Frame){'
assert s.count(anchor)==1
s=s.replace(anchor,"        if(billboard81Frame){\n          billboard81Frames.set(env,Object.freeze({renderer:this,ctx:X,plan,cut,frame:billboard81Frame,pass:P.pass}));\n          // Scope has no decor/effectsOnly: dispatch the original layout and\n          // propagate its error. Only token lifetime cleanup changes here.\n          billboard81Hooks.paint(Object.freeze({renderer:this,env}));\n        } else if(bulbs80Frame){")
s=s.replace('    if(bulbs80Frame)bulbs80Hooks.finish(bulbs80Frame);','    if(billboard81Frame)billboard81Hooks.finish(billboard81Frame);\n    if(bulbs80Frame)bulbs80Hooks.finish(bulbs80Frame);')
s=s.replace('    } finally {if(bulbs80Frame)bulbs80Hooks.abort(bulbs80Frame);}', '    } finally {if(billboard81Frame)billboard81Hooks.abort(billboard81Frame);if(bulbs80Frame)bulbs80Hooks.abort(bulbs80Frame);}')
(p/'09_render-frame81.js').write_text(s);(p/'renderer-frame.diff').write_text(''.join(difflib.unified_diff(before.splitlines(True),s.splitlines(True),fromfile='a/09_render.js',tofile='b/09_render.js',n=0)))
