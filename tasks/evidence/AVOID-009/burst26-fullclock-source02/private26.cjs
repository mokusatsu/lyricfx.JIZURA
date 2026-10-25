'use strict';
module.exports=function(){
 const bindings=new WeakMap(),need=(v,c)=>{if(!v)throw Object.assign(Error(c),{code:c});};
 const excluded=e=>e.cut.emphasis||e.cut.placementLocked||e.cut.areaMode!=='auto'||e.cut.lockedAreas||e.cut.lockedEffects;
 const off=e=>e.plan?.lyricAvoidanceIndex?.enabled!==true||e.cut.autoPlacement===false;
 return Object.freeze({withRecipe(env,r,fn){
  need(env?.cut?.layout==='burst'&&typeof fn==='function'&&!bindings.has(env),'BURST26_BINDING');need(!excluded(env),'BURST26_PRIORITY');
  need(r&&Number.isFinite(r.dx)&&Number.isFinite(r.dy),'BURST26_OFFSET');
  const shape=r.shape??null;need(shape===null||['風の先へ','風の\n先へ'].includes(shape.text)&&[1,.9,.8,.72].includes(shape.fontRatio)&&[.15,.1].includes(shape.padEm),'BURST26_SHAPE');
  const b=Object.freeze({cut:env.cut,W:env.W,H:env.H,dx:r.dx,dy:r.dy,shape:shape?Object.freeze({...shape}):null});bindings.set(env,b);try{return fn();}finally{bindings.delete(env);}
 },recipeFor(env){const b=bindings.get(env);if(!b)return null;need(b.cut===env.cut&&b.W===env.W&&b.H===env.H,'BURST26_ENV_CHANGED');if(excluded(env)||off(env)||(!b.shape&&b.dx===0&&b.dy===0))return null;return b;}});
};
