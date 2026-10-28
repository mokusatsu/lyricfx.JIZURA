from pathlib import Path
import sys,hashlib,json,difflib
assert len(sys.argv)==2,'Pass unchanged native11p_layoutsD.js'
D=Path(__file__).resolve().parent;source=Path(sys.argv[1]);s=source.read_text();needle="reg('dominoes', {";assert s.count(needle)==1
fragment=(D/'source-input-fragment.js').read_text();out=s.replace(needle,fragment+needle,1);(D/'11p_layoutsD-input82.js').write_text(out)
(D/'source-from-native.diff').write_text(''.join(difflib.unified_diff(s.splitlines(True),out.splitlines(True),fromfile='native/11p_layoutsD.js',tofile='82d/11p_layoutsD-input82.js',n=0)))
assert out.replace(fragment,'',1)==s
(D/'boundary.json').write_text(json.dumps({'nativeSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'onlyAddedInputAccessor':True,'nativeRenderUnchanged':True,'sourceOnly':True,'CanvasQualified':False},indent=2)+'\n')
