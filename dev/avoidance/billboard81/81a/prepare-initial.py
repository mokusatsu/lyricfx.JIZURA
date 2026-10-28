from pathlib import Path
import hashlib,json,difflib
D=Path(__file__).resolve().parent;p=D.parent/'baseline/11p_layoutsD.js';old=p.read_text();s=old
marker="/* ================================================================== 15 billboard — 看板 */"
a=s.index(marker);start=s.index('    const port = isPort(env);',a);end=s.index('    if(captureD)Object.assign(catalog,{port,text,out,bw,bh,bx,by,groundY,rise,y0,a0,steel,faceC,tc});',start)
body=s[start:end];fields='port,text,out,bw,bh,bx,by,groundY,rise,y0,a0,steel,faceC,tc'
helper="""// Source-only extraction proposal. Original normal render calls this at the
// same point. Env is a stock plain record; no getter side-effect guarantee.
function billboardInitial81(env){const {W,H,sc}=env,cut=env.cut,Pm=cut.params,lt=env.lt;
"""+body+'    return {'+fields+'};\n}\nObject.defineProperty(J.placement,\'billboardNativeGeometry81\',{enumerable:true,value:Object.freeze({initial:billboardInitial81,sourceOnly:true,certificateIssuer:false})});\n'
s=s[:start]+'    const {'+fields+'}=billboardInitial81(env);\n'+s[end:];s=s.replace(marker,marker+'\n'+helper,1)
assert s.count(body)==1
(D/'11p_layoutsD-initial81.js').write_text(s);(D/'initial-helper81.js.txt').write_text(helper);(D/'initial81.diff').write_text(''.join(difflib.unified_diff(old.splitlines(True),s.splitlines(True),n=0,fromfile='a/src/11p_layoutsD.js',tofile='b/src/11p_layoutsD.js')))
# Inverse removes only the helper/delegation; all original bytes must return.
inverse=s.replace(marker+'\n'+helper,marker,1).replace('    const {'+fields+'}=billboardInitial81(env);\n',body,1);assert inverse==old
(D/'initial-boundary.json').write_text(json.dumps({'baseProduct':'94023781','sourceSHA256':hashlib.sha256(old.encode()).hexdigest(),'candidateSHA256':hashlib.sha256(s.encode()).hexdigest(),'bodySHA256':hashlib.sha256(body.encode()).hexdigest(),'bodyVerbatim':True,'inverseWholeSourceExact':True,'normalCallPointUnchanged':True,'productApplied':False,'CanvasExecuted':False,'scope':'initial native scalar/pose/colour helper only; no layout-size/parts/clock-envelope/certificate claim'},indent=2)+'\n')
