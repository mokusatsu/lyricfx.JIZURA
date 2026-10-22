/* Japanese-owned audit: rebind native helpers to each independent audit canvas.
 * Raster samples complement continuous source bounds; they are not interval proofs. */
(() => {
'use strict';
const shapeKinds=new Set(['rrect','circle','arc','blob']);
const settled=(env,e)=>{const m=e.nativeCBody;return !m||env.lt>=m.entryEnd&&env.lt<=m.exitStart&&(m.strictDuringAlphaExit||m.strictExitWithinHold||env.pOut===0);};
const rebound=(renderer,env,ctx)=>renderer.makeEnv(ctx,env.plan,env.cut,env.sc,{...env,ctx,placementRecorder:null});
function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
window.auditLayoutsCPrimary=function(r,time,{scale=1}={}){
 const {plan,renderer}=r,w=Math.round(plan.W*scale),h=Math.round(plan.H*scale),layers=Object.fromEntries(['all','strict','shapes'].map(k=>[k,canvas(w,h)])),original=J.placement.replay;let passes=0,strictPasses=0;const kinds={};
 J.placement.replay=function(env,program,offset,...rest){const primary=program.events.filter(e=>e.role==='primary'),strict=primary.filter(e=>settled(env,e)),shapes=primary.filter(e=>shapeKinds.has(e.kind));for(const e of primary)kinds[e.kind]=(kinds[e.kind]||0)+1;for(const [key,events]of [['all',primary],['strict',strict],['shapes',shapes]])original(rebound(renderer,env,layers[key].getContext('2d')),{...program,events},offset,...rest);passes++;if(strict.length)strictPasses++;return original(env,program,offset,...rest);};
 try{renderer.frame(canvas(w,h).getContext('2d'),plan,time,{scale,noHud:true,noPost:true});}finally{J.placement.replay=original;}
 const region=J.resolveAvoidanceAt(plan,time),circle=region?J.avoidanceCirclePixels(region,plan.W,plan.H):null,margin=Math.max(2,.005*Math.min(plan.W,plan.H));
 const count=c=>{const p=c.getContext('2d').getImageData(0,0,w,h).data;let visible=0,collision=0,marginCollision=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(p[(y*w+x)*4+3]>=1){visible++;if(circle){const d=(x+.5-circle.cx*scale)**2+(y+.5-circle.cy*scale)**2;if(d<=(circle.r*scale)**2)collision++;if(d<=((circle.r+margin)*scale)**2)marginCollision++;}}return {visible,collision,marginCollision};};
 return {time,scale,passes,strictPasses,kinds,all:count(layers.all),strict:count(layers.strict),shapes:count(layers.shapes),scope:'Helper-rebound actual primary raster; per-source-unit strict, all primary and high-level shape-only layers. Sampled raster is separate from full-interval geometry.'};
};
window.auditLayoutsCStage=function(r,time,{scale=1}={}){
 const {plan,renderer}=r,w=Math.round(plan.W*scale),h=Math.round(plan.H*scale),pad=Math.ceil(Math.max(plan.W,plan.H)*.5*scale),c=canvas(w+pad*2,h+pad*2),ctx=c.getContext('2d'),original=J.placement.replay;let passes=0;
 J.placement.replay=function(env,program,offset,...rest){if(!Array.isArray(offset))throw Error('Japanese stage audit expects native joint translation');original(rebound(renderer,env,ctx),{...program,events:program.events.filter(e=>e.role==='primary')},[offset[0]+pad/scale,offset[1]+pad/scale],...rest);passes++;return original(env,program,offset,...rest);};
 try{renderer.frame(canvas(w,h).getContext('2d'),plan,time,{scale,noHud:true,noPost:true});}finally{J.placement.replay=original;}
 const p=ctx.getImageData(0,0,c.width,c.height).data;let visible=0,outside=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(p[(y*c.width+x)*4+3]>=1){visible++;if(x<pad||x>=pad+w||y<pad||y>=pad+h)outside++;}return {time,scale,pad,passes,visible,outside,scope:'Helper-rebound all primary on padded canvas; native stage crop does not hide outside ink.'};
};
})();
/* Deliberately colliding shape-only controls detect closure regressions. */
window.auditJapaneseRasterControls=function(r){
 const circle=J.avoidanceCirclePixels(J.resolveAvoidanceAt(r.plan,1.5),r.plan.W,r.plan.H),x=circle.cx,y=circle.cy,state={lineCap:'butt',lineJoin:'miter',miterLimit:10,dash:[],dashOffset:0},args={circle:[x,y,12,'#fff',null,0,1,false],rrect:[x-12,y-12,24,24,3,'#fff',1,false],arc:[x,y,12,0,Math.PI*2,'#fff',5,1,false],blob:[[[x-12,y-12],[x+12,y-12],[x,y+12]],'#fff',1,false]};
 const run=(kind,eventArgs)=>{const program={measurementSupported:true,events:[{kind,args:eventArgs,role:'primary',matrix:[1,0,0,1,0,0],alpha:1,blend:'source-over',state}]},renderer={makeEnv:r.renderer.makeEnv,frame(ctx,plan,t,o){const env=this.makeEnv(ctx,plan,plan.cuts[0],plan.style.schemes[0],{pass:'main',t,lt:t-plan.cuts[0].start,scale:o.scale||1});J.placement.replay(env,program,[0,0]);}};return {plan:r.plan,renderer};};
 const rows=Object.entries(args).map(([kind,eventArgs])=>({kind,raster:auditLayoutsCPrimary(run(kind,eventArgs),1.5)}));
 const stage=auditLayoutsCStage(run('circle',[-5,y,12,'#fff',null,0,1,false]),1.5);return {rows,stage,scope:'Synthetic intentionally colliding native high-level shape events, no text; not a product rendering acceptance'};
};
