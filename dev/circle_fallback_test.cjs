const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
let source = fs.readFileSync('src/08ca_lyric_avoidance.js', 'utf8');
source = source.replace('const { mainBB, auxBB, fullBB, mainCallBoxes } = measureCutBounds(baseEnv, cut);', 'const { mainBB, auxBB, fullBB, mainCallBoxes } = baseEnv.bounds;');
source = source.replace('  // 4. Layout Measurement Pass', '  window.testHelpers = { solveCornerFallback, solveScaledRegionFit, solveCutAvoidance, rectCircleDist };\n  // 4. Layout Measurement Pass');
const window = { J: { clamp: (n, a, b) => Math.max(a, Math.min(b, n)), h: () => 0 } };
vm.runInNewContext(source, { window, console });
const { solveCornerFallback, solveScaledRegionFit, solveCutAvoidance, rectCircleDist } = window.testHelpers;
const box = (x0,y0,x1,y1) => ({x0,y0,x1,y1,w:x1-x0,h:y1-y0,cx:(x0+x1)/2,cy:(y0+y1)/2});
const W=100, H=100, circle={cx:50,cy:50,R:45}, large=box(-100,-100,200,200);
const valid = fit => { assert.ok(fit && fit.scale > 0); const b=fit.bb; assert.ok(b.x0>=-1e-6 && b.y0>=-1e-6 && b.x1<=W+1e-6 && b.y1<=H+1e-6); assert.ok(rectCircleDist(b,circle.cx,circle.cy,circle.R)>=-1e-7); };
assert.equal(solveScaledRegionFit(large,W,H,circle,{minScale:.42}),null);
valid(solveCornerFallback(large,W,H,circle));
const edge={cx:95,cy:50,R:45}; assert.ok(solveCornerFallback(large,W,H,edge).scale > 0);
assert.equal(solveCornerFallback(large,W,H,{cx:50,cy:50,R:100}),null);
for (const layout of ['ordinary', 'marquee', 'dominoes', 'ledScroll']) {
 const env={plan:{W,H}, bounds:{mainBB:large,fullBB:large,auxBB:large,mainCallBoxes:[]}};
 const sol=solveCutAvoidance(env,{layout,seed:1,params:{}},circle);
 assert.equal(sol.mode,layout==='marquee'?'tiledAux':'transform');
 valid({scale:sol.scale,bb:sol.shiftedBB});
 assert.ok(sol.scale < .42, layout);
}
const clear=box(0,0,5,5);
const normal=solveCutAvoidance({plan:{W,H},bounds:{mainBB:clear,fullBB:clear,auxBB:clear,mainCallBoxes:[]}},{layout:'ordinary',seed:1},circle);
assert.equal(normal.scale,1); assert.equal(normal.tx,0); assert.equal(normal.ty,0);
console.log('circle fallback regressions passed');
