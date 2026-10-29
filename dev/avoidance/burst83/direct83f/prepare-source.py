from pathlib import Path
import sys,json,hashlib,difflib
D=Path(__file__).resolve().parent;S=Path(sys.argv[1]);source=S.read_text();i=source.index("reg('burst', {");a=source.index('    const port = isPort(env);',i);b=source.index('    const out = tout(env);',a);old=source[a:b]
new="""    // Test-only source-direct half-native candidate. Always uses current input;
    // no retained native input/recipe/certificate is accepted by this path.
    const fresh83f = J.placement.burstSourceInput83c(env);
    const half83f = J.placement.burstHalfLayout83e.layout(env, fresh83f);
    const { text, o, rxM, ryM, size, m, rx, ry, cx, cy, port } = half83f.layout;
"""
modified=source[:a]+new+source[b:];assert modified.replace(new,old,1)==source
(D/'11p_layoutsD-half83.js').write_text(modified)
(D/'source-from83c.diff').write_text(''.join(difflib.unified_diff(source.splitlines(True),modified.splitlines(True),fromfile='83c/11p_layoutsD.js',tofile='83f/11p_layoutsD.js',n=0)))
(D/'boundary.json').write_text(json.dumps(dict(inputSHA256=hashlib.sha256(S.read_bytes()).hexdigest(),oldPrefixSHA256=hashlib.sha256(old.encode()).hexdigest(),newPrefixSHA256=hashlib.sha256(new.encode()).hexdigest(),inverseRestores83c=True,remainingNativeBodyChanges=0,scope='test-only source-direct half-native candidate; no binding/authority/adapter/UI'),indent=2)+'\n')
