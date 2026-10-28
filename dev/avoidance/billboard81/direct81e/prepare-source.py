from pathlib import Path
import difflib,json,hashlib,subprocess
D=Path(__file__).resolve().parent;E=D.parent;old=D/'baseline/11p_layoutsD-descriptor81.js';a=old.read_text();s=a
helpers='''// Source-only declared recipe seam. The unbound route returns the original helper.
function billboardDrawInitial81(env){const recipe=J.placement.billboardRecipe81For?.(env)||null,d=billboardInitial81(env);if(!recipe)return d;const text=brk(env.cut.text,recipe.columns),bw=recipe.bw,bh=recipe.bh,bx=recipe.bx,by=recipe.by,y0=by+d.rise;if(!(d.groundY>y0+bh*1.125)||![bw,bh,bx,by,y0,recipe.mainSize].every(Number.isFinite)||bw<=0||bh<=0||recipe.mainSize<=0)throw Object.assign(Error('BILLBOARD81E_CONNECTION'),{code:'BILLBOARD81E_CONNECTION'});if(text!==recipe.writingText)throw Object.assign(Error('BILLBOARD81E_WRITING_TEXT'),{code:'BILLBOARD81E_WRITING_TEXT'});return{...d,text,bw,bh,bx,by,y0};}
function billboardDrawSize81(env,d){const recipe=J.placement.billboardRecipe81For?.(env)||null;return recipe?recipe.mainSize:billboardMainSize81(env,d);}
function billboardDrawMainItem81(env,d,size){const it=billboardMainItem81(env,d,size),recipe=J.placement.billboardRecipe81For?.(env)||null;if(recipe)it.x=d.bx+d.bw/2;return it;}

'''
marker="reg('billboard', {";assert s.count(marker)==1;s=s.replace(marker,helpers+marker)
changes=[('const {port,text,out,bw,bh,bx,by,groundY,rise,y0,a0,steel,faceC,tc}=billboardInitial81(env);','const {port,text,out,bw,bh,bx,by,groundY,rise,y0,a0,steel,faceC,tc}=billboardDrawInitial81(env);'),('if(captureD)Object.assign(catalog,{port,text,out,bw,bh,bx,by,groundY,rise,y0,a0,steel,faceC,tc});',"if(captureD){Object.assign(catalog,{port,text,out,bw,bh,bx,by,groundY,rise,y0,a0,steel,faceC,tc});const recipe81=J.placement.billboardRecipe81For?.(env)||null;if(recipe81)Object.assign(catalog,{nativeOnly:false,recipe81:clone(recipe81)});}"),('const size = billboardMainSize81(env,{text,bw,bh});','const size = billboardDrawSize81(env,{text,bw,bh});'),('J.mainDraw(env,item(billboardMainItem81(env,{text,y0,bh,tc},size)))','J.mainDraw(env,item(billboardDrawMainItem81(env,{text,y0,bh,tc,bx,bw},size)))')]
for x,y in changes:assert s.count(x)==1,x;s=s.replace(x,y)
inverse=s
for x,y in reversed(changes):assert inverse.count(y)==1;inverse=inverse.replace(y,x)
assert inverse.replace(helpers,'')==a
p=D/'11p_layoutsD-direct81.js';p.write_text(s);(D/'direct-source.diff').write_text(''.join(difflib.unified_diff(a.splitlines(True),s.splitlines(True),fromfile='81d/11p_layoutsD.js',tofile='81e/11p_layoutsD.js',n=0)))
(D/'boundary.json').write_text(json.dumps({'priorSource':str(old),'priorSHA256':hashlib.sha256(a.encode()).hexdigest(),'inverseExact':True,'unboundArithmeticExpressionsUnchanged':True,'boardAndTypeStageOnly':True,'groundFixed':True,'originalClipMaterialsRNGPaintOrderUnchanged':True,'productRegistration':False,'CanvasQualified':False},indent=2)+'\n');subprocess.run(['node','--check',str(p)],check=True)
