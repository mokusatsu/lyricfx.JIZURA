from pathlib import Path
import hashlib,json
root=Path('/workspace/lyricfx.JIZURA'); out=Path('/dev/shm/avoid009-crossword26')
src=(root/'src/11p_layoutsD.js').read_text(); util=(root/'src/01_util.js').read_text()
def between(s,a,b):return s[s.index(a):s.index(b,s.index(a))]
helpers=between(src,'const U = env','const fontsOf =')+between(src,'const smallSize = env','/* motion index')+between(src,'const KANA =','/* per-font glyph memo')
helperutil=between(util,'J.clamp =','J.lerp =')+between(util,'J.h = function','J.rs =')+between(util,'J.isSmallKana =','J.toHiragana =') if 'J.toHiragana =' in util else ''
# Use exact named classifier declarations only, without pulling unrelated functions.
helperutil=between(util,'J.clamp =','J.lerp =')+between(util,'J.h = function','J.rs =')+'\n'.join(x for x in util.splitlines() if x.startswith(('J.isSmallKana =','J.isPunct =','J.isLatin =')))+'\n'
body=between(src[src.index("reg('crossword'"):],'    const { W, H, sc } = env','    const out = tout(env);')
seam='''/* Isolated SOURCE-only seam; no registry, Canvas, renderer or product modification. */
const J={};
'''+helperutil+helpers+'''
export function topology(env) {
 if(env.W!==960||env.H!==540||env.cut.text!=='風の先へ'||env.cut.seed!==1205||env.cut.params.font!=='dela'||env.cut.params.dens!==.18||env.cut.params.fill!==2||env.cut.params.clue!==true)throw Error('CROSSWORD26_INITIAL_FAMILY');
'''+body+''' return {W,H,text:t0,n,words,L,C,R,below,clueW,cell,gw,gh,fsC,gx,gy,rowsW,c0,lyr:[...lyr],black:[...black],num:[...num],pencil:[...pencil],fills,pool};
}
export const fixture=Object.freeze({W:960,H:540,cut:{text:'風の先へ',seed:1205,params:{font:'dela',dens:.18,fill:2,clue:true}}});
// Candidate geometry retains topology and cell square ratio. Does not certify ink/FX.
export function candidate(t,{clue='side',cellScale=1,dx=0,dy=0}={}) {
 if(!['side','below'].includes(clue)||![1,.8,.7,.6].includes(cellScale)||![dx,dy].every(Number.isFinite))throw Error('CROSSWORD26_RECIPE');
 const cell=t.cell*cellScale,gw=t.C*cell,gh=t.R*cell,fs=t.fsC;
 const gx=(t.W-gw-(clue==='side'?t.W*.24:0))/2+dx,gy=(t.H-gh-(clue==='below'?fs*5:0))/2+dy;
 const cxl=clue==='below'?gx:gx+gw+t.W*.035,cyl=clue==='below'?gy+gh+fs*1.6:gy+fs;
 return {cell,gw,gh,gx,gy,clue:clue,clues:Array.from({length:4},(_,i)=>[clue==='below'&&i>=2?cxl+gw*.55:cxl,clue==='below'?cyl+(i%2)*fs*1.7:cyl+i*fs*1.9+(i>=2?fs*.8:0)])};
}
'''
(out/'seam.mjs').write_text(seam)
inputs={p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in ['src/11p_layoutsD.js','src/01_util.js','src/09k_layoutsD_placement.js','src/09_render.js','src/11p_layoutsEg_bulbs_adapter69.js','src/11p_layoutsCb_blocks_adapter.js','tasks/avoidance-playbook.md','tasks/implementation-review-policy.md','dev/avoidance/contract.json']}
(out/'source-pins.json').write_text(json.dumps({'inputs':inputs,'extraction':'topology body verbatim src11p start render through before const out; helper definitions exact source slices; no native paint changes','scope':'fixed 4JA chars / seed1205 / dela / dens.18 fill2 clue true only','status':'SOURCE_PREPARATION; no Canvas/render/media execution; no avoidance certificate'},indent=2)+'\n')
