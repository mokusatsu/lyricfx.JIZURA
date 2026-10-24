from pathlib import Path
import hashlib,json
root=Path('/workspace/lyricfx.JIZURA');d=root/'work/avoid009-bulbs60-oracle';b=(root/'work/avoid009-bulbs59-focused/runner/browser59.js').read_text();native=(root/'src/11p_layoutsD.js').read_text()
util=b[b.index('const need='):b.index('function arithmetic()')]
cv=b[b.index('const cv='):b.index('function snapshot()')]
stability=b[b.index('function snapshot()'):b.index('function spy(')]
spy=b[b.index('function spy('):b.index('window.initBulbs59=')]
rr=native[native.index('const rrPts ='):native.index('/* ================================================================== 13 bulbs')]
(d/'runner/shared60.js').write_text("/* SOURCE60 primitive capture shared with59; no renderer/recipe implementation. */\n(()=>{'use strict';\n"+util+cv+stability+spy+rr+"\nwindow.oracle60Primitives=Object.freeze({need,clean,matrix,same,hash,cv,spy,rrPts,options,stable});\n})();\n")
(d/'evidence/extraction60.json').write_text(json.dumps({'kind':'SOURCE60-static-helper-extraction','source59BrowserSHA256':hashlib.sha256(b.encode()).hexdigest(),'canonicalDSHA256':hashlib.sha256(native.encode()).hexdigest(),'shared':['actualCanvas paint spy','default context qualification','rawRGBA SHA','rounded24 primitive ONLY'],'notShared':['geometry selection','point segment lookup','original native source painter']},indent=2)+'\n')
print('SOURCE60 shared primitive extraction only; no app')
