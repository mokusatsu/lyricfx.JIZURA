'use strict';
const fs=require('node:fs'),vm=require('node:vm'),zlib=require('node:zlib'),assert=require('node:assert/strict'),path=require('node:path');
const evidence=process.argv[2],repo=path.resolve(__dirname,'../../../..');assert.ok(evidence,'Pass old burst-time83ac-actual01 directory');
const decode=x=>Array.isArray(x)?x.map(decode):x&&typeof x==='object'?Object.keys(x).length===1&&typeof x.$f64==='string'?Buffer.from(x.$f64,'hex').readDoubleBE():Object.keys(x).length===1&&x.$undefined===true?undefined:Object.fromEntries(Object.entries(x).map(([k,v])=>[k,decode(v)])):x;
const read=n=>decode(JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(evidence,n+'.json.gz')))));
const initial=read('time-init'),clock=initial.clocks,plan={...initial.planCore,cuts:[initial.planCore.cut],duration:clock.end};
const J={placement:{}};
// Use the original selector and render-cut definitions, not a modeled selector.
const features=fs.readFileSync(path.join(repo,'src/08e_lyric_features.js'),'utf8'),start=features.indexOf('J.lyricCutsAt ='),end=features.indexOf('\n})();',start);assert.ok(start>=0&&end>start);
vm.runInNewContext(features.slice(start,end),{J,Object});
vm.runInNewContext(fs.readFileSync(__dirname+'/renderer-time83.js','utf8'),{J,Object,Number,Array,Math,Error});
const T=J.placement.burstRendererTime83ab,range=T.evaluationRange(plan,clock),lag=1.6/24,tail=.6+2/60+lag+.06+.01;
assert.equal(range.length,2);assert.ok(Object.is(range[0],-1/60)&&Object.is(range[1],4+tail));
let checks=0;
for(let i=0;i<10;i++){
 const old=read('case-'+String(i).padStart(2,'0')),v=T.select({plan,clock,t:old.t,range});
 for(const k of ['kind','sourceN','actualN','actualRealTime'])assert.ok(Object.is(v[k],k==='actualRealTime'?old.t:old.projection[k]),`${i}:${k}`);
 assert.equal(v.state.passes.length,3);checks++;
}
for(const p of clock.preimages.filter(p=>p.reachable))for(const t of[p.firstTime,p.lastTime]){
 const s=T.select({plan,clock,t,range});assert.equal(s.kind,'model');assert.equal(s.sourceN,p.n);assert.equal(s.state,clock.states[p.n]);assert.ok(Object.is(s.actualRealTime,t));
 // Renderer activeCuts: no layer/noLyrics restriction in the admitted scope.
 for(const own of s.state.passes){const cuts=J.lyricCutsAt(plan,own.tp).map(J.lyricRenderCut);assert.equal(cuts.length,own.active?1:0);if(own.active)assert.equal(cuts[0].index,plan.cuts[0].index)}checks++;
}
for(const t of[range[0],-Number.MIN_VALUE,-.001,-0]){const s=T.select({plan,clock,t,range});assert.equal(s.sourceN,0);assert.equal(s.state,clock.states[0]);assert.equal(s.state.passes.length,3);assert.ok(s.state.passes.every(p=>p.tp===0&&p.active));assert.ok(Object.is(s.actualRealTime,t));checks++;}
// floor(t/h+epsilon) is monotone for nonnegative finite t. The earliest tail
// already puts even the slowest B pass past displayEnd; larger times select no
// cut in the original selector. This concerns primary content, not background.
const q0=Math.floor(plan.duration/clock.h+1e-6)*clock.h;
assert.ok(q0-lag>=plan.cuts[0].displayEnd);
for(let i=0;i<=64;i++){const t=i===64?range[1]:plan.duration+(range[1]-plan.duration)*i/64,s=T.select({plan,clock,t,range});assert.equal(s.kind,'empty');assert.equal(s.state.passes.length,3);assert.ok(s.state.passes.every(p=>!p.active&&J.lyricCutsAt(plan,p.tp).length===0));checks++;}
for(const t of[range[0]-.001,range[1]+.001]){assert.throws(()=>T.select({plan,clock,t,range}),e=>e.code==='BURST83AB_TIME_RANGE');checks++;}
console.log(JSON.stringify({checks,oldActualCasesReused:10,preimageEndpoints:clock.preimages.filter(p=>p.reachable).length*2,range,earliestTailQuantized:q0,earliestTailSlowestPass:q0-lag,scope:'original selector, saved actual clock/raw projection checks only; no new Canvas/model/trajectory authority; background RGBA deliberately not equated'}));
