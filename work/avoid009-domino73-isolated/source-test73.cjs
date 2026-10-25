'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {patch}=require('./overlay73.cjs'),source=fs.readFileSync('src/11p_layoutsD.js','utf8'),runtime=fs.readFileSync(__dirname+'/runtime73.js','utf8');
const overlay=patch(source);assert.equal(patch(overlay,true),source);
const real=x=>structuredClone(x); // Keep Float64 -0/undefined in the pure observations.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
function environment(code,withRuntime){
 const calls=[],stack=[];let matrix=[1,0,0,1,0,0],env;
 const mul=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
 const add=(kind,args)=>calls.push({kind,args:real(args),matrix:matrix.slice(),owner:env.drawOwnership?.owner??null});
 const J={E:{inCubic:x=>x**3,inQuad:x=>x*x,outExpo:x=>x===1?1:1-2**(-10*x),outBack:(x,s)=>1+(s+1)*(x-1)**3+s*(x-1)**2},placement:{},LAYOUTS:{},DEG:Math.PI/180,clamp,glyphCount:t=>[...t].length,chunkText:t=>[...t],h:(s,i,k)=>(s+i*5+k)%7,mix:(a,b,t)=>a+':'+b+':'+t,lum:c=>c==='white'?1:0,contrast:()=>4,unionBB:(a,b)=>!a?b:!b?a:{x0:Math.min(a.x0,b.x0),y0:Math.min(a.y0,b.y0),x1:Math.max(a.x1,b.x1),y1:Math.max(a.y1,b.y1)},register:(kind,id,def)=>{J.LAYOUTS[id]=def;}};
 J.mainDraw=(e,it)=>{add('glyph',[it]);return{x0:it.x-it.size/2,y0:it.y-it.size/2,x1:it.x+it.size/2,y1:it.y+it.size/2};};
 const context=vm.createContext({J,console});vm.runInContext(code,context);if(withRuntime)vm.runInContext(runtime,context);
 function draw({text='風の先へ',time=1,pOut=0,pips=true,recipe=null,throwPaint=false}={}){
  calls.length=0;stack.length=0;matrix=[1,0,0,1,0,0];
  const ctx={save(){stack.push(matrix.slice());},restore(){matrix=stack.pop();},transform(...m){matrix=mul(matrix,m);}};
  env={W:960,H:540,ctx,sc:{fg:'white',bg:'black',ink:'ink',accent:'red',sub:'gray'},cut:{text,seed:1205,dur:4,outDur:.4,stagger:.04,hold:'still',contentScale:1,params:{font:'test',face:'light',pips}},pass:'main',lt:time,ltb:time,step:0,pIn:1,pOut};
  for(const kind of ['line','poly','rrect','circle'])env[kind]=(...args)=>{if(throwPaint)throw Error('paint failed');add(kind,args);};
  let lease=null;const f=()=>J.LAYOUTS.dominoes.render(env);const result=recipe?(lease=J.domino73.withRecipe(recipe,f)).result:f();
  assert.equal(stack.length,0);assert.equal(Object.hasOwn(env,'drawOwnership'),false);
  return{calls:real(calls),result:real(result),rows:lease?real(lease.rows):null};
 }
 return{J,draw,getEnv:()=>env};
}
const original=environment(source,false),off=environment(overlay,false),on=environment(overlay,true);
let frames=0;
for(const pips of [false,true])for(const time of [0,.03,.1,.26,.59,1,3.3,3.5,3.8,4,4.2])for(const pOut of [0,.75,1]){
 const args={pips,time,pOut},native=original.draw(args),disabled=off.draw(args),zero=on.draw({...args,recipe:{kind:'native'}});
 assert.deepEqual(disabled,native);assert.deepEqual(zero.calls.map(({owner,...v})=>v),native.calls.map(({owner,...v})=>v));assert.deepEqual(zero.result,native.result);frames++;
}
const base=on.draw({recipe:{kind:'native'}}),moved=on.draw({recipe:{kind:'joint-translation',deltas:[[17,-23]]}});
assert.equal(base.calls.length,moved.calls.length);
const model=base.rows[0],w=model.w,h=model.h,g=model.g,thick=model.thick,cnt=model.rowsD[0].length;
let currentGlyph=0;
for(let i=0;i<base.calls.length;i++){
 const a=base.calls[i],b=moved.calls[i];assert.equal(a.kind,b.kind);assert.equal(a.owner,b.owner);
 if(a.kind==='glyph'||a.kind==='rrect'||a.kind==='circle'||a.kind==='line'&&a.matrix[4]!==0){
  assert.deepEqual(a.args,b.args);assert.deepEqual(b.matrix.slice(0,4),a.matrix.slice(0,4));assert.equal(b.matrix[4],a.matrix[4]+17);assert.equal(b.matrix[5],a.matrix[5]-23);
 }else if(a.kind==='poly'){
  const xc=960/2+(currentGlyph-(cnt-1)/2)*(w+g)+17,yF=540/2+h/2-23;
  // Original source's T(local) order: local offset + translated anchor.
  const shadow=b.args[2]===.25;
  const points=shadow?[[-w/2,0],[w/2,0],[w/2+w*.1,w*.04],[-w/2+w*.1,w*.04]]:[[w/2,-h+thick*.4],[w/2+thick,-h+thick*.4+thick*.3],[w/2+thick,thick*.3],[w/2,0]];
  assert.deepEqual(b.args[0],points.map(([x,y])=>[1*x+-0*y+xc,0*x+1*y+yF]));assert.deepEqual(a.args.slice(1),b.args.slice(1));
 }else if(a.kind==='line'){
  const yF=540/2+h/2-23;assert.deepEqual(b.args[0],[[960/2-(cnt*(w+g))/2-w*.4+17,yF],[960/2+(cnt*(w+g))/2+w*.4+17,yF]]);assert.deepEqual(a.args.slice(1),b.args.slice(1));
 }
 if(a.kind==='glyph')currentGlyph++;
}
// Two rows: source membership/global gi retained, row-local fall j unchanged.
const long={text:'風の先へ歩いて行くよ'},a=on.draw({...long,recipe:{kind:'native'}}),b=on.draw({...long,recipe:{kind:'row-translation',deltas:[[0,-9],[0,11]]}});
assert.equal(a.rows.length,2);assert.deepEqual(a.rows.map(({delta,...r})=>r),b.rows.map(({delta,...r})=>r));
assert.deepEqual(a.calls.filter(x=>x.kind==='glyph').map(x=>x.args),b.calls.filter(x=>x.kind==='glyph').map(x=>x.args));
assert.throws(()=>on.draw({recipe:{kind:'joint-translation',deltas:[[1,2]]},throwPaint:true}),/paint failed/);assert.equal(Object.hasOwn(on.getEnv(),'drawOwnership'),false);assert.doesNotThrow(()=>on.draw({recipe:{kind:'native'}}));
assert.throws(()=>on.draw({text:'ABC',recipe:{kind:'native'}}),/DOMINO73_TEXT_UNSUPPORTED/);assert.throws(()=>on.draw({recipe:{kind:'scale',deltas:[]}}),/DOMINO73_RECIPE_UNSUPPORTED/);
console.log(JSON.stringify({state:'PASS_SOURCE73_SEAM_PURE_ONLY',nativeZeroFrames:frames,inverseSourceExact:true,jointPaints:base.calls.length,twoRowGlyphs:a.calls.filter(x=>x.kind==='glyph').length,cleanupAfterThrownPaint:true,unsupportedTyped:true,sourceSHA256:crypto.createHash('sha256').update(source).digest('hex'),browser:false,adapter:false,safetyCertified:false}));
