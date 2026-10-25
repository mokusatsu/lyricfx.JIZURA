"use strict";
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const create=require('./private-binding.cjs');
const binding=create(),native=fs.readFileSync(__dirname+'/burst.native.js','utf8'),overlay=fs.readFileSync(__dirname+'/burst.overlay.js','utf8');
new vm.Script(fs.readFileSync(__dirname+'/layoutsD.overlay.js','utf8'));
const clone=x=>JSON.parse(JSON.stringify(x));
function compile(source,binding){
 let render; const ops=[],rng=[];
 const clamp=x=>Math.max(0,Math.min(1,x));
 const rand=(...a)=>{rng.push(a);return ((a.reduce((s,n)=>s+Number(n)*17,13)%89)+89)%89/89;};
 const J={DEG:Math.PI/180,TAU:Math.PI*2,clamp,r:rand,rs:(...a)=>rand(...a)*2-1,rr:(lo,hi,...a)=>lo+(hi-lo)*rand(...a),fitSize:()=>88,measure:o=>({w:o.size*3,h:o.size*1.1}),contrast:()=>4,mainDraw:(env,o)=>{ops.push(['lyric',clone(o)]);return {x:o.x,y:o.y};}};
 const E={outBack:(x,s)=>1+(s+1)*(x-1)**3+s*(x-1)**2,inCubic:x=>x**3,outCubic:x=>1-(1-x)**3};
 const context={J,E,burst74Binding:binding,reg:(id,d)=>{render=d.render;},U:e=>Math.min(e.W,e.H),isPort:e=>e.H>e.W*1.08,brk:(t,n)=>[...t].reduce((s,c,i)=>s+(i&&i%n===0?'\n':'')+c,''),tout:e=>1-e.pOut**3,plateCol:(s,a)=>a[0],darkOf:s=>s.bg,lightOf:s=>s.fg,onCol:()=> '#fff',gIn:e=>e.lt<.6&&e.pOut<=0};
 vm.runInNewContext(source,context);
 return (env,recipe)=>{ops.length=0;rng.length=0;const e={...env,poly:(...a)=>ops.push(['poly',clone(a)]),line:(...a)=>ops.push(['line',clone(a)]),circle:(...a)=>ops.push(['circle',clone(a)])};const result=recipe===undefined?render(e):binding.withRecipe(e,recipe,()=>render(e));return {ops:clone(ops),rng:clone(rng),result:clone(result),env:e};};
}
// Bind the exact shell env passed to the source for the entire synchronous render.
function run(source,env,recipe){
 const r=compile(source,binding)(env,recipe);delete r.env;return r;
}
const env={W:960,H:540,sc:{accent:'#f00',ink:'#111',bg:'#000',fg:'#fff',sub:'#aaa'},ctx:{},cut:{layout:'burst',areaMode:'auto',seed:1205,text:'風の先へ',params:{font:'dela',spikes:15,sharp:.72,tilt:4,lines:true,debris:true,order:'accent'}},plan:{lyricAvoidanceIndex:{enabled:true}},pass:'main',lt:.2,ltb:.18,step:12,pOut:0};
let cases=0;
for(const [lt,pass,pOut] of [[0,'main',0],[.2,'main',0],[.2,'ghost',0],[.7,'main',0],[1.1,'ghost',.7]]){
 const e={...env,lt,ltb:lt-.02,step:Math.floor(lt*60),pass,pOut};
 const n=run(native,e);
 assert.deepEqual(run(overlay,e),n);assert.deepEqual(run(overlay,e,{dx:0,dy:0}),n);
 assert.deepEqual(run(overlay,e,{dx:37,dy:-23,enabled:false}),n);
 assert.deepEqual(run(overlay,{...e,plan:{lyricAvoidanceIndex:{enabled:false}}},{dx:37,dy:-23}),n);
 // Independent native expression oracle keeps cx/cy addition before all source coordinate arithmetic.
 const oracle=native.replace('const cx = W / 2, cy = H / 2;','const cx = W / 2 + 37, cy = H / 2 + -23;');
 assert.deepEqual(run(overlay,e,{dx:37,dy:-23}),run(oracle,e));
 if(lt===0)assert.equal(n.ops[0][0],'circle');
 if(pass==='ghost')assert.equal(n.ops.some(o=>o[0]==='line'),false);
 cases++;
}
for(const field of [{emphasis:true},{areaMode:'manual'},{placementLocked:true}])assert.throws(()=>binding.withRecipe({...env,cut:{...env.cut,...field}},{dx:1,dy:2},()=>{}),{code:'BURST74_PRESERVED_PRIORITY'});
const sentinel=Error('sentinel');assert.throws(()=>binding.withRecipe(env,{dx:1,dy:2},()=>{throw sentinel;}),e=>e===sentinel);assert.equal(binding.offsetFor(env),null);
assert.equal(binding.offsetFor({...env,cut:{...env.cut,placementLayoutsD:true,layoutDRecipe:{dx:999,dy:999}}}),null);
const report={kind:'burst74-pure-stub-only',cases,nativeOffZeroStrict:true,nonzeroSourceExpressionOracleExact:true,priorityExclusions:true,throwCleanup:true,publicCutBypass:false,canvasRun:false,browserRun:false,geometryCertified:false};
console.log(JSON.stringify(report,null,2));
