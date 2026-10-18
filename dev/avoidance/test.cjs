const assert=require('node:assert/strict'),{polygonClear,circlePixels,segmentDistance}=require('./oracle.cjs');
let checks=0;
const check=(v,m)=>{assert.ok(v,m);
  checks++};
const c={cx:50,cy:50,r:20};
check(!polygonClear(c,[[0,49],[100,49],[100,51],[0,51]]),'crossing line with both endpoints outside rejected');
check(!polygonClear(c,[[69,49],[90,49],[90,51],[69,51]]),'glyph center outside but ink intrudes rejected');
check(!polygonClear(c,[[70,45],[90,45],[90,55],[70,55]]),'touch collision');
check(polygonClear(c,[[70.01,45],[90,45],[90,55],[70.01,55]]),'just outside accepted');
check(!polygonClear(c,[[0,0],[100,0],[100,100],[0,100]]),'circle enclosed rejected');
check(!polygonClear(c,[[50,10],[90,50],[50,90],[10,50]]),'rotated polygon enclosing rejected');
check(polygonClear(c,[[5,5],[10,10],[5,15],[0,10]]),'rotated clear polygon');
check(segmentDistance([50,50],[0,50],[100,50])===0,'segment interpolation independent of endpoints');
check(segmentDistance([1,1],[0,0],[0,0])===Math.SQRT2,'degenerate edge');
for(const [W,H] of [[1920,1080],[1080,1920],[2560,1080],[1000,1000],[800,1000]]){const p=circlePixels(W,H,{x:.5,y:.42},.2);
  check(p.r===Math.min(W,H)*.2,'pixel circle');
  check(!polygonClear(p,[[p.cx+p.r-.1,p.cy-1],[p.cx+p.r+10,p.cy-1],[p.cx+p.r+10,p.cy+1],[p.cx+p.r-.1,p.cy+1]]),'anisotropic normalized-distance bug rejected');
}
// A circular trajectory uses separate glyph polygons: its empty central hole is not a filled bbox.
check([[[10,45],[20,45],[20,55],[10,55]],[[80,45],[90,45],[90,55],[80,55]]].every(p=>polygonClear(c,p)),'ring hole preserved');
for(const points of [[],[[NaN,2],[2,3],[3,2]],[[0,0],[1,1]]]){assert.throws(()=>polygonClear(c,points),/invalid ink/);
  checks++;
}
for(const bad of [{cx:0,cy:0,r:-1},{cx:Infinity,cy:0,r:1}]){assert.throws(()=>polygonClear(bad,[[0,0],[1,0],[1,1]]));
  checks++;
}
console.log(JSON.stringify({suite:'independent geometry oracle',checks,productionImports:0}));
