from pathlib import Path
import difflib,hashlib,json,subprocess
D=Path(__file__).resolve().parent;old=D.parent/'billboard-runtime-source81c/11p_layoutsD-parts81.js';a=old.read_text();marker="reg('billboard', {";assert a.count(marker)==1
addition="// Descriptor-only access to the original brk operation; normal render unchanged.\nObject.defineProperty(J.placement,'billboardRecipeText81',{value:(text,columns)=>brk(text,columns)});\n\n"
b=a.replace(marker,addition+marker);assert b.replace(addition,'')==a
p=D/'11p_layoutsD-descriptor81.js';p.write_text(b);(D/'source-access.diff').write_text(''.join(difflib.unified_diff(a.splitlines(True),b.splitlines(True),fromfile='81c/11p_layoutsD.js',tofile='81d/11p_layoutsD.js',n=0)))
for p in [p,D/'recipe-descriptor81.js']:subprocess.run(['node','--check',str(p)],check=True)
(D/'source-boundary.json').write_text(json.dumps({'priorSource':str(old),'priorSHA256':hashlib.sha256(a.encode()).hexdigest(),'normalRenderBytesUnchanged':True,'newSourceOnlyAccess':'readonly original brk wrapper','newRenderOrAdapterRegistration':False,'CanvasQualified':False},indent=2)+'\n')
