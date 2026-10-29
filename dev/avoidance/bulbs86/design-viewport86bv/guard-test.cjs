'use strict';
// Real finalizer expression + real restricted callback. No model/Canvas authority.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(process.argv[2]||'.'),d=__dirname;
const original=fs.readFileSync(path.join(root,'src/09a_placement.js'),'utf8'),proposal=fs.readFileSync(path.join(d,'09a_placement.js'),'utf8');
const expression=s=>{const rows=s.split('\n').filter(x=>x.includes('const unsupportedPlanFX='));assert.equal(rows.length,1);return rows[0].trim().replace(/^const unsupportedPlanFX=/,'').replace(/;$/,'')};
const c=vm.createContext({assert,console});
vm.runInContext(`class Canvas{get width(){return 720}get height(){return 405}}class Gradient{addColorStop(){}}class Context{constructor(){this._canvas=new Canvas()}get canvas(){return this._canvas}save(){}restore(){}setTransform(){}fillRect(){}createRadialGradient(){return new Gradient()}}class Renderer{post(){}}const HTMLCanvasElement=Canvas,CanvasGradient=Gradient,CanvasRenderingContext2D=Context,J={placement:{},Renderer,cutAt(){},CAMERA:{push:{get(){return{s:1}}}},stepDur:()=>1/60,komaOf:()=>0,lyricCutsAt:()=>[],lyricRenderCut:x=>x,mediaAt:()=>null,mediaCutsAt:()=>[]};J.placement.tilesProof48={clock(){}};`,c);
vm.runInContext(fs.readFileSync(path.join(root,'dev/avoidance/bulbs86/composed-input86bu/compose-scope86.js'),'utf8'),c);
vm.runInContext(fs.readFileSync(path.join(d,'post86.js'),'utf8'),c);
c.oldExpr=expression(original);c.newExpr=expression(proposal);
vm.runInContext(`const oldGuard=new Function('J','A','plan','options','stepDur','maxStep','maxSupportedTransDur','return '+oldExpr),newGuard=new Function('J','A','plan','options','stepDur','maxStep','maxSupportedTransDur','return '+newExpr);let checks=0;const make=()=>({style:{texture:{}},fx:{texture:0},events:[],cuts:[{layout:'bulbs'}]}),call=(fn,p,o={layoutsD:true},h=1/60)=>fn(J,J.placement,p,o,h,1,.6),ok=v=>{assert(v);checks++};
const p=make();ok(call(oldGuard,p));ok(!call(newGuard,p));ok(p.style.glow===undefined&&!Object.hasOwn(p.style,'glow'));
for(const layout of ['dominoes','burst','contour','crossword','center','tiles']){const p=make();p.cuts[0].layout=layout;ok(call(newGuard,p)===call(oldGuard,p));ok(call(newGuard,p));}
for(const glow of [0,.1,1,-1,null,NaN,Infinity]){const p=make();p.style.glow=glow;ok(call(newGuard,p)===call(oldGuard,p));}
for(const texture of [undefined,null,.01,1,-1,NaN]){const p=make();p.fx.texture=texture;ok(call(newGuard,p)===call(oldGuard,p));ok(call(newGuard,p));}
for(const options of [{},{layoutsD:false},{layoutsD:1}])ok(call(newGuard,make(),options)===call(oldGuard,make(),options));
for(const mutate of [p=>p.cuts.push({layout:'bulbs'}),p=>p.cuts[0].effectFx={},p=>p.cuts[0].effectStyle={},p=>p.cuts[0].trans='blur',p=>p.events.push({type:'slice'}),p=>{p.cuts[0].trans='wipe';p.cuts[0].transDur=2}]){const p=make();mutate(p);ok(call(newGuard,p)===call(oldGuard,p));ok(call(newGuard,p));}
for(const h of [0,-1,NaN,Infinity,2])ok(call(newGuard,make(),{layoutsD:true},h)===call(oldGuard,make(),{layoutsD:true},h));
ok(newGuard(J,{},make(),{layoutsD:true},1/60,1,.6));const f=J.Renderer.prototype.post;J.Renderer.prototype.post=()=>{};assert.throws(()=>call(newGuard,make()),e=>e.code==='BULBS86W_POST_SOURCE');checks++;J.Renderer.prototype.post=f;ok(!call(newGuard,make()));console.log(JSON.stringify({checks,scope:'real finalizer guard expression and restricted callback; no actual finalization/Canvas/placement authority'}));`,c);
