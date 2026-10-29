from pathlib import Path
import sys,json,hashlib,difflib
D=Path(__file__).resolve().parent;S=Path(sys.argv[1]);source=S.read_text();marker="reg('burst', {";i=source.index(marker);body=source[i:source.index("\nreg('",i+1)]
prefix=body[body.index('    const { W, H, sc, ctx } = env'):body.index('    const star =')]
palette_start=source.index('const onCol = (sc, fill) => {');palette_end=source.index('\n};',palette_start)+3
palette=source[palette_start:palette_end];assert palette.count('  if (_onc.size > 300) _onc.clear();')==1;assert palette.count('  _onc.set(key, v); return v;')==1
peek=palette.replace('const onCol =','const peekBurstOnCol83c =').replace('  if (_onc.size > 300) _onc.clear();\n','').replace('  _onc.set(key, v); return v;','  return v;')
assert prefix.count('onCol(sc, A)')==1
accessor_prefix=prefix.replace('onCol(sc, A)','peekBurstOnCol83c(sc, A)')
fragment="""/* Native burst read-only input accessor83c. Not an adapter/certificate. */
"""+peek+"\n"+"""Object.defineProperty(J.placement,'burstSourceInput83c',{value:Object.freeze(env=>{
"""+accessor_prefix+"""return{kind:'burst-current-native-input83c',layout:{text,font:Pm.font,o,rxM,ryM,size,m:{w:m.w,h:m.h},rx,ry,cx,cy,u,port},scalar:{out,q,rot,boil},colors:{A,B,dark:q>.01?darkOf(sc):null,onA:q>.01?peekBurstOnCol83c(sc,A):null},source:{text:cut.text,params:Pm,seed:s,W,H,lt,ltb:env.ltb,step:env.step,pOut:env.pOut,pass:env.pass}};
})});
"""
assert source.count(marker)==1;modified=source.replace(marker,fragment+marker,1);assert modified.replace(fragment,'',1)==source
(D/'source-input-fragment.js').write_text(fragment);(D/'11p_layoutsD-input83.js').write_text(modified);(D/'source-from-native.diff').write_text(''.join(difflib.unified_diff(source.splitlines(True),modified.splitlines(True),fromfile='native/11p_layoutsD.js',tofile='83c/11p_layoutsD.js',n=0)));(D/'boundary.json').write_text(json.dumps({'nativeFile':S.name,'nativeSHA256':hashlib.sha256(S.read_bytes()).hexdigest(),'prefixSHA256':hashlib.sha256(prefix.encode()).hexdigest(),'fragmentSHA256':hashlib.sha256(fragment.encode()).hexdigest(),'inverseRestoresNative':True,'nativeRenderChanges':0,'paletteAccessor':'reads existing onCol cache and computes misses without set/clear; fit/measure retain their native cache semantics','scope':'read-only native layout/motion/palette accessor; no recipe, draw/support/certificate qualification'},indent=2)+'\n')
