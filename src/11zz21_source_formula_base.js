/* Source geometry construction and direct source-role translation.
 * No ownership certificates, renderer replay, clock schedules or regression traces. */
(() => {
'use strict';
const A=J.placement,S=A.simpleCircle,ID=[1,0,0,1,0,0],fail=code=>{throw Object.assign(Error(code),{code});},rect=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]],matrix=c=>{const m=c.getTransform();return[m.a,m.b,m.c,m.d,m.e,m.f];};
// The source declares this interval analytically; constructing its primitives once is not time sampling.
function construct(renderer,plan,cut,{W=plan.W,H=plan.H,scale=1,time=1.5,pass='main',sourceD=false}={}){
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d'),events=[],states=[],clips=[];let path=[],pathRect=null,env,count=0,independent=false,primaryClip=false;
 const transform=points=>points.map(p=>A.point(matrix(ctx),p)),role=()=>env.drawOwnership?.role||'primary';
 function push(kind,args,polygons){if(++count>8192)fail('SOURCE_FORMULA_GEOMETRY_BUDGET');const r=role();if(r==='independentDecor')independent=true;if(r!=='primary')return;if(clips.length)primaryClip=true;const event={kind,args,matrix:matrix(ctx),polygons,clips:clips.map(c=>({...c})),role:'primary',owner:env.drawOwnership?.owner||cut.layout+'.composition',nativeSweep:env.layoutASweep?structuredClone(env.layoutASweep):null,nativeGroup:env.placementBGroup||'composition',nativeCBody:env.placementCBody?structuredClone(env.placementCBody):null};events.push(event);return event;}
 function shape(kind,args,points,stroke=0){const m=matrix(ctx),norm=Math.max(Math.hypot(m[0],m[1]),Math.hypot(m[2],m[3])),blur=ctx.filter==='none'?0:/^blur\(([\d.]+)px\)$/.test(ctx.filter)?Number(RegExp.$1):fail('SOURCE_FORMULA_FILTER'),pad=2+stroke*norm*5+6*(blur+ctx.shadowBlur/2)+Math.max(Math.abs(ctx.shadowOffsetX),Math.abs(ctx.shadowOffsetY)),world=transform(points),b=A.bounds([world.length===2?[world[0],world[1],world[0]]:world]);const event=push(kind,args,[rect(b.x0-pad,b.y0-pad,b.x1+pad,b.y1+pad)]);if(event){const core=2+stroke*norm*5;event.bodyPolygons=[rect(b.x0-core,b.y0-core,b.x1+core,b.y1+core)];}}
 const proxy=new Proxy(ctx,{get(t,k){
  if(k==='save')return()=>{states.push({clips:clips.slice()});t.save();};
  if(k==='restore')return()=>{const s=states.pop();clips.splice(0,clips.length,...(s?.clips||[]));t.restore();};
  if(k==='beginPath')return()=>{path=[];pathRect=null;t.beginPath();};
  if(['moveTo','lineTo'].includes(k))return(x,y)=>{pathRect=null;path.push(...transform([[x,y]]));};
  if(k==='rect')return(x,y,w,h)=>{pathRect=path.length?null:{args:[x,y,w,h],matrix:matrix(t)};path.push(...transform(rect(x,y,x+w,y+h)));};
  if(k==='arc')return(x,y,r)=>{pathRect=null;path.push(...transform(rect(x-r,y-r,x+r,y+r)));};
  if(k==='arcTo')return(x,y,x2,y2,r)=>{pathRect=null;path.push(...transform(rect(Math.min(x,x2)-r,Math.min(y,y2)-r,Math.max(x,x2)+r,Math.max(y,y2)+r)));};
  if(k==='quadraticCurveTo')return(...a)=>{pathRect=null;for(let i=0;i<a.length;i+=2)path.push(...transform([[a[i],a[i+1]]]));};
  if(k==='bezierCurveTo')return(...a)=>{pathRect=null;for(let i=0;i<a.length;i+=2)path.push(...transform([[a[i],a[i+1]]]));};
  if(k==='closePath')return()=>{};
  if(k==='clip')return()=>{if(path.length<3)fail('SOURCE_FORMULA_CLIP');clips.push(pathRect?{...pathRect}:{points:A.convexHull(path),matrix:ID});};
  if(k==='fill'||k==='stroke')return()=>{if(!path.length)return;if(path.length<(k==='stroke'?2:3))fail('SOURCE_FORMULA_PATH');const b=A.bounds([path]),m=matrix(t),core=2+(k==='stroke'?t.lineWidth*5*Math.max(Math.hypot(m[0],m[1]),Math.hypot(m[2],m[3])):0),blur=t.filter==='none'?0:/^blur\(([\d.]+)px\)$/.test(t.filter)?Number(RegExp.$1):fail('SOURCE_FORMULA_FILTER'),pad=core+6*(blur+t.shadowBlur/2)+Math.max(Math.abs(t.shadowOffsetX),Math.abs(t.shadowOffsetY)),event=push('shape',[],[rect(b.x0-pad,b.y0-pad,b.x1+pad,b.y1+pad)]);if(event)event.bodyPolygons=[rect(b.x0-core,b.y0-core,b.x1+core,b.y1+core)];};
  if(k==='fillRect'||k==='strokeRect')return(x,y,w,h)=>shape(k,[],rect(x,y,x+w,y+h),k==='strokeRect'?t.lineWidth:0);
  if(k==='clearRect')return()=>{};
  if(k==='fillText'||k==='strokeText')return(text,x,y)=>{const m=t.measureText(text);shape('nativeText',[text,x,y,{font:t.font,align:t.textAlign,baseline:t.textBaseline}],rect(x-m.actualBoundingBoxLeft,y-m.actualBoundingBoxAscent,x+m.actualBoundingBoxRight,y+m.actualBoundingBoxDescent),k==='strokeText'?t.lineWidth:0);};
  if(k==='drawImage'||k==='putImageData')return()=>fail('SOURCE_FORMULA_NATIVE_RASTER');
  const value=t[k];return typeof value==='function'?value.bind(t):value;
 },set(t,k,v){t[k]=v;return true;}});
 const isD=sourceD||!!A.sourceFormulaD?.[cut.layout],sourceCut={...cut,fullStagePlacement:true,placementUnits:true,placementLayoutsD:isD,placementLayoutsA:!isD,placementLayoutsB:A.layoutsB25?.includes(cut.layout)||A.layoutsC34?.includes(cut.layout),placementLayoutsC:A.layoutsC34?.includes(cut.layout),layoutAEvaluationRange:[Math.min(cut.start,cut.renderStart??cut.start),Math.max(cut.end,cut.displayEnd??cut.end)+.7],layoutBEvaluationRange:[Math.min(cut.start,cut.renderStart??cut.start),Math.max(cut.end,cut.displayEnd??cut.end)+.7]};
 env=renderer.makeEnv(proxy,{...plan,W,H},sourceCut,cut.palette||plan.style.schemes[cut.scheme%plan.style.schemes.length],{pass,t:cut.start+time,realTime:cut.start+time,lt:time,ltb:time,pIn:1,pOut:0,step:0,scale,allowFilter:false,placementEnvelope:true});env.pIn=1;env.pOut=0;env.layoutAEvaluationRange=sourceCut.layoutAEvaluationRange;env.hugeSweep=dir=>{const range=sourceCut.layoutAEvaluationRange.map(t=>(t-cut.start)/cut.dur),xs=range.map(t=>(.5+(.5-t)*.16*dir)*W);return {x0:Math.min(...xs),x1:Math.max(...xs),y0:H*.52,y1:H*.52};};
 env.withDrawRole=(r,key,fn)=>{const old=env.drawOwnership;env.drawOwnership={role:r,owner:key};try{return fn();}finally{env.drawOwnership=old;}};
 env.withDProjectedText=(kind,fn)=>fn();
 env.draw=it=>{if((pass!=='main'&&it.ghost===false)||!it.text||it.size<=.5)return null;if(it.pieceFn||(it.extrude&&cut.treat!=='hardShadow'))fail('SOURCE_FORMULA_ITEM_SHADER');const raw=A.itemGeometry({...it,blur:0,shadow:null,extrude:null},matrix(ctx),{pass:'main',scale:1});if(!raw.polygons.length)return J.itemBox(it);let polygons=raw.polygons;const extra=(6*((it.blur||0)+(it.shadow?.blur||0)/2)+Math.max(Math.abs(it.shadow?.dx||0),Math.abs(it.shadow?.dy||0)))/Math.min(1,cut.contentScale??1);if(extra){const m=matrix(ctx),pad=extra*Math.max(Math.hypot(m[0],m[1]),Math.hypot(m[2],m[3])),b=A.bounds(polygons);polygons=[rect(b.x0-pad,b.y0-pad,b.x1+pad,b.y1+pad)];}if(it.placementMain){const local=S.itemEnvelope(it,cut),b=local.bounds;const a=(it.rot||0)*J.DEG,c=Math.cos(a),sn=Math.sin(a);polygons=[transform(rect(b.x0,b.y0,b.x1,b.y1).map(([x,y])=>[it.x+x*c-y*sn,it.y+x*sn+y*c]))];}if(it.placementSweep){const b=S.itemEnvelope({...it,x:0,y:0,rot:0},cut).bounds,r=it.placementSweep;polygons=[transform(rect(r.x0+b.x0,r.y0+b.y0,r.x1+b.x1,r.y1+b.y1))];}const event=push('item',[{...it}],polygons);if(event){event.inkPolygons=raw.inkPolygons||raw.polygons;event.bodyPolygons=raw.polygons;}return J.itemBox(it);};
 env.sourceGeometryItem=env.draw;
 env.poly=(points,color,alpha=1)=>{if(alpha>0)shape('poly',[points],points);};env.line=(points,color,lw=1,alpha=1)=>{if(alpha>0)shape('line',[points,color,lw,alpha,{miterLimit:ctx.miterLimit}],points,lw);};env.polyPartial=(points,f,color,lw=1,alpha=1)=>{if(alpha>0)shape('line',[points,color,lw,alpha,{miterLimit:ctx.miterLimit}],points,lw);};
 env.rect=(x,y,w,h,color,alpha=1)=>{if(alpha>0)shape('rect',[x,y,w,h,color,alpha],rect(x,y,x+w,y+h));};env.rrect=(x,y,w,h,r,color,alpha=1,ghost=true,stroke,lw=1)=>{if(alpha>0)shape('rrect',[x,y,w,h,r,color,alpha,ghost,stroke,lw],rect(x,y,x+w,y+h),stroke?lw:0);};
 env.circle=(x,y,r,color,stroke,lw=1,alpha=1)=>{if(alpha>0&&r>0)shape('circle',[x,y,r,color,stroke,lw,alpha],rect(x-r,y-r,x+r,y+r),stroke?lw:0);};env.arc=(x,y,r,a,b,color,lw=1,alpha=1)=>{if(alpha>0&&r>0)shape('arc',[x,y,r,a,b,color,lw,alpha],rect(x-r,y-r,x+r,y+r),lw);};
 J.LAYOUTS[cut.layout].render(env);
 if(independent&&primaryClip)fail('SOURCE_FORMULA_COUPLED_FIELD_CLIP');
 return {events,measurementSupported:true,diagnostics:[],nativeGeometry:env.placementBGeometry||null,nativeDGeometry:env.placementDGeometry||null,sourceCut,sourceOnly:true};
}
// Source roles only select a fixed translation. Native source clocks and drawing stay live.
function render(renderer,env,recipe){
 const target=env.ctx,root=matrix(target),dx=recipe.nativeViewport?env.scale*recipe.offset[0]:root[0]*recipe.offset[0]+root[2]*recipe.offset[1],dy=recipe.nativeViewport?env.scale*recipe.offset[1]:root[1]*recipe.offset[0]+root[3]*recipe.offset[1],states=[];let shifted=!!recipe.nativeViewport,proxyEnv;
 const setRole=r=>{const wanted=r==='primary';if(wanted===shifted)return;const m=matrix(target),k=wanted?1:-1;target.setTransform(m[0],m[1],m[2],m[3],m[4]+k*dx,m[5]+k*dy);shifted=wanted;};
 const sourceClip=recipe.sourceArea,clips=sourceClip?[false,true].map(primary=>{const p=new Path2D(),x=(sourceClip.x*env.plan.W+(primary?recipe.offset[0]:0))*env.scale,y=(sourceClip.y*env.plan.H+(primary?recipe.offset[1]:0))*env.scale;p.rect(x,y,recipe.W*env.scale,recipe.H*env.scale);return p;}):null;
 const paint=(key,args)=>{setRole(proxyEnv.drawOwnership?.role||'primary');if(!clips)return target[key](...args);const m=matrix(target);target.save();try{target.setTransform(1,0,0,1,0,0);target.clip(clips[Number(shifted)]);target.setTransform(...m);return target[key](...args);}finally{target.restore();}};
 const proxy=new Proxy(target,{get(t,k){if(k==='save')return()=>{states.push(shifted);t.save();};if(k==='restore')return()=>{t.restore();shifted=states.pop()??false;};if(k==='beginPath')return(...args)=>{setRole(proxyEnv.drawOwnership?.role||'primary');return t[k](...args);};if(['fill','stroke','fillRect','strokeRect','fillText','strokeText','drawImage'].includes(k))return(...args)=>paint(k,args);const v=t[k];return typeof v==='function'?v.bind(t):v;},set(t,k,v){t[k]=v;return true;}});
 const isD=!!A.sourceFormulaD?.[env.cut.layout],cut={...env.cut,fullStagePlacement:true,placementUnits:true,placementLayoutsD:isD,placementLayoutsA:!isD,placementLayoutsB:A.layoutsB25?.includes(env.cut.layout)||A.layoutsC34?.includes(env.cut.layout),placementLayoutsC:A.layoutsC34?.includes(env.cut.layout)};
 const source=renderer.makeEnv(proxy,env.plan,cut,env.sc,{...env,ctx:proxy,cut,W:recipe.W,H:recipe.H});source.W=recipe.W;source.H=recipe.H;
 proxyEnv=new Proxy(source,{set(t,k,v){if(k==='drawOwnership')setRole(v?.role||'primary');t[k]=v;return true;}});proxyEnv.withDProjectedText=(kind,fn)=>fn();proxyEnv.formulaRole=setRole;proxyEnv.withDrawRole=(r,key,fn)=>{const old=proxyEnv.drawOwnership;proxyEnv.drawOwnership={role:r};try{return fn();}finally{proxyEnv.drawOwnership=old;}};
 target.save();try{setRole('primary');return J.LAYOUTS[cut.layout].render(proxyEnv);}finally{target.restore();}
}
A.sourceFormulaBase=Object.freeze({construct,render});
})();
