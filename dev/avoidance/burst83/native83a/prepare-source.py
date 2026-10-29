from pathlib import Path
import sys,json,hashlib
D=Path(__file__).resolve().parent
S=Path(sys.argv[1]);source=S.read_text();start=source.index("reg('burst', {");end=source.index("\nreg('",start+1);body=source[start:end]
motion=body[body.index('    const out = tout(env);'):body.index('    const A = plateCol')]
star=body[body.index('      const N = Pm.spikes, pts = [];'):body.index('    // shock ring + speed lines + debris')]
assert star.endswith('    };\n');star=star[:-7]
text="""/* Source-only native burst scalar/star extraction. No Canvas/support/adapter. */
(()=>{'use strict';const A=J.placement,E=J.E,tout=env=>1-E.inCubic(env.pOut);
function motion(env){const Pm=env.cut.params,lt=env.lt;
"""+motion+"return{out,q,rot,boil};}\nfunction star(env,geometry,scalar,k,scale,jit){const Pm=env.cut.params,s=env.cut.seed,{cx,cy,rx,ry}=geometry,{q,rot,boil}=scalar;\n"+star+"\n}\nObject.defineProperty(A,'burstNativeGeometry83a',{value:Object.freeze({motion,star,sourceOnly:true,certificateIssuer:false})});})();\n"
(D/'native-geometry83.js').write_text(text)
(D/'boundary.json').write_text(json.dumps({'nativeFile':S.name,'nativeSHA256':hashlib.sha256(S.read_bytes()).hexdigest(),'burstBodySHA256':hashlib.sha256(body.encode()).hexdigest(),'motionFragmentSHA256':hashlib.sha256(motion.encode()).hexdigest(),'starFragmentSHA256':hashlib.sha256(star.encode()).hexdigest(),'sourceOnly':True,'scope':'literal native scalar/star expressions; no layout text metrics, paint/support/quality/candidate/runtime qualification'},indent=2)+'\n')
