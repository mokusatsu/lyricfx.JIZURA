'use strict';
const assert=require('assert/strict');
function recipes(){const base={base58RecipeID:'recipe43',field:7,writingText:'風の\n先へ',scale:.95,pad:[.22,.25],sourceGlyphMapping:[0,1,2,3],nativeGeometry:false,neighborPreferredMinimum:4.86};const a=[{...base,id:'fieldA',inventory:0,radiusScale:.8,neighborHardMinimum:3,preferredGapRole:'soft-aesthetic-target'},{...base,id:'fieldB',inventory:1,radiusScale:.7,neighborHardMinimum:4.86,preferredGapRole:'hard-local-pilot'}];assert.equal(a.length,2);return a;}
module.exports={recipes};
