from pathlib import Path
import sys,json,hashlib
D=Path(__file__).resolve().parent;S=Path(sys.argv[1]);source=S.read_text();i=source.index("reg('burst', {");body=source[i:source.index("\nreg('",i+1)]
draw=body[body.index('    // shock ring + speed lines + debris'):body.index('\n  },\n});')]
native_draw=draw
assert draw.count('if (q <= 0.01) return null;')==1
assert [draw.count('env.'+k+'(') for k in ['circle','line','poly']]==[1,1,5]
for kind in ['circle','line','poly']:draw=draw.replace('env.'+kind+'(',"emit('"+kind+"',")
draw=draw.replace('if (q <= 0.01) return null;','if (q <= 0.01) return {parts,culled:true};')
assert draw.count('return J.mainDraw(env, ')==1;draw=draw.replace('return J.mainDraw(env, ',"emit('glyph', ")
text="""/* Source-only burst call descriptors. Potential source calls, not paint count. */
(()=>{'use strict';const A=J.placement,G=A.burstNativeGeometry83a,E=J.E;
function describe(env,geometry,scalar,colors){const {W,H,sc}=env,cut=env.cut,Pm=cut.params,s=cut.seed,u=Math.min(W,H),lt=env.lt,{text,o,size,rx,ry,cx,cy}=geometry,{out,q,rot,boil}=scalar,{A,B}=colors,parts=[],emit=(kind,...args)=>parts.push({kind,args}),darkOf=()=>colors.dark,onCol=()=>colors.onA,gIn=e=>e.lt<.6&&e.pOut<=0,star=(k,scale,jit)=>G.star(env,geometry,scalar,k,scale,jit);
"""+draw+"\nreturn{parts,culled:false};}\nObject.defineProperty(A,'burstNativeParts83b',{value:Object.freeze({describe,sourceOnly:true,certificateIssuer:false})});})();\n"
(D/'native-parts83.js').write_text(text);(D/'boundary.json').write_text(json.dumps({'nativeFile':S.name,'nativeSHA256':hashlib.sha256(S.read_bytes()).hexdigest(),'nativeDrawFragmentSHA256':hashlib.sha256(native_draw.encode()).hexdigest(),'descriptorFragmentSHA256':hashlib.sha256(draw.encode()).hexdigest(),'changes':'native primitive calls become descriptors; native cull retains already emitted calls; mainDraw item becomes glyph descriptor; colors/layout supplied by caller','sourceOnly':True,'paintQualified':False},indent=2)+'\n')
