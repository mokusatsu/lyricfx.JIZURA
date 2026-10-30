"""Per-owner native/per-recipe geometry byte counts only; no search changes."""
from pathlib import Path
import sys
R=Path(sys.argv[1]).resolve();U=Path(__file__).resolve().parent
s=(R/'src/11zz06d_bulbs_generator86.js').read_text()
def rep(a,b):
 global s
 assert s.count(a)==1,(a[:100],s.count(a));s=s.replace(a,b)
rep('function byteLength(x){',"function byteLength(x,scalar=null){if(scalar&&x!==null){if(x===scalar.native)return scalar.nativeBytes;if(x===scalar.current)return scalar.currentBytes;}")
rep('byteLength(x[i]):4','byteLength(x[i],scalar):4')
rep('byteLength(x[k]);','byteLength(x[k],scalar);')
rep('const measuredBytes=x=>', 'const scalarSizes={native:null,nativeBytes:0,current:null,currentBytes:0};const scalarSizeMeta=byteLength(scalarSizes)+2*96;\n const measuredBytes=x=>')
rep('try{return byteLength(x)}','try{return byteLength(x,scalarSizes)}')
rep('const retainedBytes=()=>framingBytes+', 'const retainedBytes=()=>scalarSizeMeta+framingBytes+')
rep('const native=D.nativeAt(env,nativeLayout,preparedSubtitle),key=', 'const native=D.nativeAt(env,nativeLayout,preparedSubtitle);scalarSizes.nativeBytes=measuredBytes(native);scalarSizes.native=native;const key=')
rep('currentLocal={kind:', 'scalarSizes.currentBytes=measuredBytes(d);scalarSizes.current=d;currentLocal={kind:')
# The old current reference remains valid only to the end of this recipe.
rep('geometryMs+=performance.now()-t;', 'scalarSizes.native=null;scalarSizes.current=null;geometryMs+=performance.now()-t;')
# Release the prior recipe before measuring the next one; native equality needs no rescan.
rep('for(const recipe of recipes){activeHeld=null;', 'for(const recipe of recipes){scalarSizes.current=null;activeHeld=null;')
rep('}finally{ctx.restore();metrics.clear();', '}finally{scalarSizes.native=null;scalarSizes.current=null;ctx.restore();metrics.clear();')
(U/'compiler86cr.js').write_text(s)
