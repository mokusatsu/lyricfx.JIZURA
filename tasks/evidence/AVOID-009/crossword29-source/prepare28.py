from pathlib import Path
import hashlib,json,difflib
r=Path('/workspace/lyricfx.JIZURA');b=Path('/dev/shm/avoid009-crossword26/source28');s=(r/'src/11p_layoutsD.js').read_text()
def cut(a,z):return s[s.index(a):s.index(z,s.index(a))]
helpers=cut('const U = env','const fontsOf =')+cut('const bodyF = env','const onCol =')+cut('const KANA =','/* per-font glyph memo')
# The onCol comment tail in helper slice is harmless; no Canvas-created font probe.
start=s.index('  render(env) {',s.index("reg('crossword'"));end=s.index('\n});',start);render=s[start:end].rstrip(',\n')
base="'use strict';\nconst E=J.E;\n"+helpers+'\n'
(b/'native-factory.js').write_text('(function(J){\n'+base+'return ({\n'+render+'\n}).render;\n})\n')
cell='    const cell = Math.min(W * (0.88 - clueW) / C, H * (below ? 0.64 : 0.8) / R, u * 0.14);'
gx='    const gx = (W - gw - (clueW ? W * clueW : 0)) / 2, gy = (H - gh - (below ? fsC * 5 : 0)) / 2;'
fs='    const fsC = Math.max(smallSize(env) * 1.15, cell * 0.24);'
num='size: cell * 0.2'
# Patch only source-local geometry. Every source topology/hash/order/clock expression remains verbatim.
p=render.replace(cell,cell.replace('const cell','const nativeCell')+'\n    const recipe=recipes.get(env), cell=recipe?nativeCell*recipe.scale:nativeCell;')
p=p.replace(fs,fs.replace('cell * 0.24','nativeCell * 0.24'))
p=p.replace(gx,"    const clueBelow=recipe?recipe.below:below;\n    const gx=recipe?(W-gw-(clueBelow?0:(clueW?W*clueW:0)))/2:(W-gw-(clueW?W*clueW:0))/2, gy=recipe?(H-gh-(clueBelow?fsC*5:0))/2:(H-gh-(below?fsC*5:0))/2;")
p=p.replace(num,'size: recipe ? nativeCell * 0.2 : cell * 0.2')
# Only the clue block reads the changed clue-placement choice, never topology or native cell computation.
i=p.index('    if (Pm.clue) {'); p=p[:i]+p[i:].replace('below ?','clueBelow ?').replace('below &&','clueBelow &&')
private="""const recipes=new WeakMap();
function withRecipe(env,recipe,fn){
 if(recipes.has(env)||!env||typeof fn!=='function'||!recipe||![1,.6].includes(recipe.scale)||typeof recipe.below!=='boolean'||Object.keys(recipe).some(k=>!['scale','below'].includes(k)))throw Error('CROSSWORD28_PRIVATE_RECIPE');
 const accepted=Object.freeze({scale:recipe.scale,below:recipe.below});recipes.set(env,accepted);try{return fn();}finally{recipes.delete(env);}
}
"""
(b/'private-factory.js').write_text('(function(J){\n'+base+private+'const render=({\n'+p+'\n}).render;return Object.freeze({render,withRecipe});\n})\n')
# Independent literal direct substitutions into original source: no private WeakMap or shared candidate builder.
for name,scale,below in [('zero',1,False),('cell60below',.6,True)]:
 q=render
 if name!='zero':
  q=q.replace(cell,cell.replace('const cell','const nativeCell')+f'\n    const cell=nativeCell*{scale};')
  q=q.replace(fs,fs.replace('cell * 0.24','nativeCell * 0.24'))
  q=q.replace(gx,'    const gx=(W-gw)/2, gy=(H-gh-fsC*5)/2;')
  q=q.replace(num,'size: nativeCell * 0.2')
  i=q.index('    if (Pm.clue) {');q=q[:i]+q[i:].replace('below ?','true ?').replace('below &&','true &&')
 (b/('oracle-'+name+'-factory.js')).write_text('(function(J){\n'+base+'return ({\n'+q+'\n}).render;\n})\n')
(b/'private.diff').write_text(''.join(difflib.unified_diff(render.splitlines(True),p.splitlines(True),fromfile='native-extracted-render',tofile='private-render')))
# Exact accepted generic paint spy, scoped only in independent harness; no new shared09a capability.
bs=(r/'src/11p_layoutsEf_bulbs_proof69.js').read_text();spy=bs[bs.index('function spy('):bs.index('\n\nconst recipeQuality=')]
(b/'observer-factory.js').write_text('(function(J){\nconst P=J.placement.bulbsProof69,need=(v,c)=>{if(!v)throw Error(c);},clean=P.clone,matrix=P.matrix;\n'+spy+'\nreturn spy;\n})\n')
inputs=['src/11p_layoutsD.js','src/01_util.js','src/09_render.js','src/09k_layoutsD_placement.js','src/11p_layoutsEc_tiles_proof48.js','src/11p_layoutsEf_bulbs_proof69.js','dev/avoidance/layouts-d-bulbs69-runner.cjs','dev/avoidance/layouts-b-fixture.js','dev/avoidance/layouts-c-editorial-fonts/manifest.json']
(b/'inputs.json').write_text(json.dumps({'status':'SOURCE_PENDING_NO_CANVAS','inputs':[{'path':x,'bytes':(r/x).stat().st_size,'sha256':hashlib.sha256((r/x).read_bytes()).hexdigest()} for x in inputs]},indent=2)+'\n')
