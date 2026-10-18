const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root='/workspace/lyricfx.JIZURA',source=fs.readFileSync(root+'/src/09a_placement.js','utf8');
const J={DEG:Math.PI/180,plan:()=>({}),clamp:(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),lerp:(a,b,t)=>a+(b-a)*t};
vm.runInNewContext(source,{J,console});const A=J.placement,oracle=require(root+'/dev/avoidance/oracle.cjs');
let seed=912401;const rand=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
let polygonChecks=0,inverseChecks=0,invalidChecks=0,sweepChecks=0;
for(let i=0;i<12000;i++){const x=(rand()-.5)*2000,y=(rand()-.5)*1000,w=1+rand()*300,h=1+rand()*300,a=rand()*Math.PI*2,c=Math.cos(a),s=Math.sin(a);const polygon=[[-w,-h],[w,-h],[w,h],[-w,h]].map(([px,py])=>[x+c*px-s*py,y+s*px+c*py]);const circle={cx:(rand()-.5)*2000,cy:(rand()-.5)*1000,r:rand()*200},margin=rand()*10;assert.equal(A.clear([polygon],circle,margin),oracle.polygonClear(circle,polygon,margin));polygonChecks++;
const m=[(rand()+.1)*c,(rand()+.1)*s,-(rand()+.1)*s,(rand()+.1)*c,x,y],n=A.inverse(m);for(const point of [[0,0],[w,h],[-w,-h]]){const actual=A.point(n,A.point(m,point));for(let k=0;k<2;k++)assert.ok(Math.abs(actual[k]-point[k])<1e-7);}inverseChecks++;
const from=[(rand()-.5)*1000,(rand()-.5)*1000],to=[(rand()-.5)*1000,(rand()-.5)*1000];if(A.certifySegment([polygon],from,to,circle,margin)){for(let step=0;step<=10;step++){const t=step/10,dx=from[0]+(to[0]-from[0])*t,dy=from[1]+(to[1]-from[1])*t;assert.equal(oracle.polygonClear(circle,polygon.map(([px,py])=>[px+dx,py+dy]),margin),true);sweepChecks++;}}
}
for(const fn of [()=>A.clear([[[0,0],[1,0],[1,1]]],{cx:0,cy:0,r:NaN}),()=>A.clear([[[0,0],[1,0],[1,1]]],{cx:0,cy:0,r:-1}),()=>A.clear([[[0,0],[1,0],[1,1]]],null,NaN),()=>A.affine([1e200,0,0,1e200,0,0]),()=>A.affine([1,0,0,0,0,0]),()=>A.inverse([5,0,0,5,1e308,1e308]),()=>A.bounds([[[0,0],[NaN,1],[1,0]]])]){assert.throws(fn);invalidChecks++;}
const result={reviewer:'parent',checkedUTC:new Date().toISOString(),sourceSHA256:crypto.createHash('sha256').update(source).digest('hex'),passed:true,polygonChecks,inverseChecks,invalidChecks,sweepChecks,method:'Independent 002 oracle versus production geometry on random rotated polygons; inverse roundtrip on unrelated points; certified sweeps checked at 11 independently transformed samples; invalid/nonfinite/overflow rejection'};
fs.writeFileSync('/workspace/work/jizura-handoff/avoid004-parent-geometry.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
