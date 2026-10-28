'use strict';const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');let checks=0;
const eq=(a,b)=>{assert.deepEqual(a,b);checks++},ok=x=>{assert.ok(x);checks++},reject=(fn,code)=>{assert.throws(fn,e=>e.code===code);checks++};
function setup(){class Renderer{frame(){}makeEnv(){}drawCut(){}}const proto=Renderer.prototype,trace=[];
 const cut={index:0,start:0,end:4},plan={cuts:[cut],duration:4.2};
 const schedule=['B','A','main'].map((pass,i)=>({n:0,pass,t:0,q:0}));
 const model={schedule,frameData:{clock:{h:1/60}}};
 const FD={select(m,t){trace.push(['select',t]);if(!(t>=0&&t<4.2))throw Object.assign(Error(),{code:'BULBS80O_NUMBER_PREIMAGE'});return{n:Math.floor(t*60+1e-6),ownIndices:t===0?[0,1,2]:[2]}}};
 const J={Renderer,placement:{bulbsFrameData80:FD,layoutsDTransportKnown:r=>r.makeEnv===proto.makeEnv&&r.drawCut===proto.drawCut,bulbsTransport51Known:r=>r.makeEnv===proto.makeEnv},lyricCutsAt(p,t){trace.push(['selector',t]);return t>=0&&t<4?[cut]:[]},lyricRenderCut:c=>c};
 vm.runInNewContext(fs.readFileSync(__dirname+'/renderer-time80.js','utf8'),{J});return{J,R:J.placement.bulbsRendererTime80,Renderer,plan,cut,model,trace,FD};}
let s=setup(),a=new s.Renderer(),b=new s.Renderer();ok(s.R.renderer(a,b)===b);ok(s.R.renderer(a)===a);
for(const k of ['frame','makeEnv','drawCut']){const r=new s.Renderer();r[k]=()=>{};reject(()=>s.R.renderer(r,a),'BULBS80R_STOCK_RENDERER')}
reject(()=>s.R.renderer({},a),'BULBS80R_STOCK_RENDERER');class Sub extends s.Renderer{}reject(()=>s.R.renderer(new Sub(),a),'BULBS80R_STOCK_RENDERER');
{const save=s.Renderer.prototype.frame;s.Renderer.prototype.frame=()=>{};reject(()=>s.R.renderer(a,b),'BULBS80R_STOCK_RENDERER');s.Renderer.prototype.frame=save}
{const save=s.J.placement.layoutsDTransportKnown;s.J.placement.layoutsDTransportKnown=()=>true;reject(()=>s.R.renderer(a,b),'BULBS80R_RENDERER_DEPENDENCY');s.J.placement.layoutsDTransportKnown=save}
const range=s.R.range(s.cut,{stepDur:1/60,reachTail:.4});eq([...range],[-1/60,4.4]);
eq([...s.R.range({...s.cut,renderStart:-.1,displayEnd:4.1},{stepDur:1/60,reachTail:.4})],[-.1-1/60,4.1+.4]);
for(const timing of [{stepDur:1/24,reachTail:.4},{stepDur:1/60,reachTail:-1},{stepDur:1/60,reachTail:Infinity}])reject(()=>s.R.range(s.cut,timing),'BULBS80R_TIMING');
for(const t of [-1/60,-.001,-Number.MIN_VALUE]){s.trace.length=0;const row=s.R.select(s.model,s.plan,t,range);eq(row.n,Math.floor(t/(1/60)+1e-6));eq(row.sourceN,0);eq([...row.ownIndices],[0,1,2]);eq(row.domain,'negative-clamped-zero');eq(s.trace.filter(r=>r[0]==='selector').length,3);ok(s.trace.filter(r=>r[0]==='selector').every(r=>Object.is(r[1],0)))}
for(const t of [0,-0,1,4.19]){const row=s.R.select(s.model,s.plan,t,range);eq(row.domain,'positive-preimage');eq(row.n,row.sourceN);eq(row.n,Math.floor(t/(1/60)+1e-6))}
for(const t of [4.2,4.3,range[1]]){s.trace.length=0;const row=s.R.select(s.model,s.plan,t,range);eq(row.domain,'expired-empty');eq([...row.ownIndices],[]);eq(s.trace.filter(r=>r[0]==='selector').length,3);eq(s.trace.filter(r=>r[0]==='select').length,0)}
for(const t of [-1,4.5,NaN,Infinity])reject(()=>s.R.select(s.model,s.plan,t,range),'BULBS80R_TIME_DOMAIN');
{const p={...s.plan,duration:4};reject(()=>s.R.select(s.model,p,4,range),'BULBS80R_EXPIRED_CLOCK')}
{const old=s.J.lyricCutsAt;s.J.lyricCutsAt=()=>[s.cut];reject(()=>s.R.select(s.model,s.plan,4.3,range),'BULBS80R_EXPIRED_SELECTOR');s.J.lyricCutsAt=()=>[];reject(()=>s.R.select(s.model,s.plan,-.001,range),'BULBS80R_NEGATIVE_SELECTOR');s.J.lyricCutsAt=old}
for(const pass of ['B','A','main']){const e=s.model.schedule.find(e=>e.pass===pass);e.q=.02;reject(()=>s.R.select(s.model,s.plan,-.001,range),'BULBS80R_NEGATIVE_SELECTOR');e.q=0}
{const saved=s.J.placement.bulbsFrameData80;s.J.placement.bulbsFrameData80={...saved};reject(()=>s.R.select(s.model,s.plan,1,range),'BULBS80R_CLOCK_DEPENDENCY');s.J.placement.bulbsFrameData80=saved}
{const original=s.R;const alternate=setup();alternate.J.placement.bulbsTransport51Known=()=>false;reject(()=>alternate.R.renderer(new alternate.Renderer()),'BULBS80R_RENDERER_DEPENDENCY');ok(s.R===original)}
// Exact endpoint neighbours; no sampling/rounded-time equivalence is assumed.
const dv=new DataView(new ArrayBuffer(8));function next(x,up){if(x===0)return up?Number.MIN_VALUE:-Number.MIN_VALUE;dv.setFloat64(0,x);dv.setBigUint64(0,dv.getBigUint64(0)+((x>0)===up?1n:-1n));return dv.getFloat64(0)}
reject(()=>s.R.select(s.model,s.plan,next(range[0],false),range),'BULBS80R_TIME_DOMAIN');reject(()=>s.R.select(s.model,s.plan,next(range[1],true),range),'BULBS80R_TIME_DOMAIN');
eq(s.R.select(s.model,s.plan,next(s.plan.duration,false),range).domain,'positive-preimage');eq(s.R.select(s.model,s.plan,next(s.plan.duration,true),range).domain,'expired-empty');
let observed=[];s.R.select(s.model,s.plan,-.001,range,w=>observed.push(w));eq(observed.length,4);ok(observed.slice(1).every(w=>w.nativeActive.length===1&&w.active.length===1&&w.entry));
observed=[];s.R.select(s.model,s.plan,4.3,range,w=>observed.push(w));eq(observed.length,3);ok(observed.every(w=>w.nativeActive.length===0&&w.active.length===0));
reject(()=>s.R.select(s.model,s.plan,-.001,range,()=>{throw Object.assign(Error(),{code:'TEST_WORK_BUDGET'})}),'TEST_WORK_BUDGET');reject(()=>s.R.select(s.model,s.plan,0,range,7),'BULBS80R_WORK_CALLBACK');
console.log(JSON.stringify({checks,passed:true,scope:'pure renderer identity/clock policy; no Canvas, frame, certificate or product qualification'}));
