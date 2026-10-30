/* Small center / split-column composition path. No frame atlas or ownership model. */
(() => {
'use strict';
const A=J.placement,ID=[1,0,0,1,0,0],policy='direction-region-arrangement-20261030';
const sourceCuts=new WeakMap();
const intervals=(plan,cut)=>{const h=J.stepDur(plan.fx,plan.fps),start=Math.min(cut.start,cut.renderStart??cut.start)-h,end=Math.max(cut.end,cut.displayEnd??cut.end)+.6+2*h+1.6/24+.07;return {start,end,regions:(plan.lyricAvoidanceIndex?.regions||[]).filter((r,i)=>r.start<end&&Math.min(r.end??plan.lyricAvoidanceIndex.regions[i+1]?.start??plan.duration,plan.duration)>start)};};
const targets=(plan,cut)=>plan.layerVisibility?.lyrics!==false&&(['center','vcols'].includes(cut.layout)||cut.layout==='numbered'&&cut.params.variant==='cols')&&!(cut.layout==='vcols'&&cut.params.variant==='repeat')&&(sourceCuts.get(plan)?.has(cut.index)||A.placementCutPreserved86cm(plan,cut)===false)&&intervals(plan,cut).regions.length>0;
const activeCut=(plan,c,t)=>{const r=intervals(plan,c);return targets(plan,c)&&t>=r.start&&t<r.end;};
const active=(plan,t)=>plan?.cuts.some(c=>activeCut(plan,c,t));
const rectangle=b=>[[b.x0,b.y0],[b.x1,b.y0],[b.x1,b.y1],[b.x0,b.y1]];
// One engineering support policy: six standard deviations, plus raster/resampling guard.
// shadow sigma=shadowBlur/2; successive filters/shadows add their support widths.
const SUPPORT_SIGMA=6,MAX_GLYPHS=256,MAX_PAINTS=8192;
function localEnvelope(item,cut){
 const n=J.layoutText(item).length;if(n>MAX_GLYPHS)throw Object.assign(Error('Glyph budget'),{code:'UNSUPPORTED_GLYPH_BUDGET'});
 const paints=3*(8*n+16);if(paints>MAX_PAINTS)throw Object.assign(Error('Paint budget'),{code:'UNSUPPORTED_PAINT_BUDGET'});
 const inkBleed=cut.enter==='inkBleed',magnet=cut.enter==='magnet',exit=cut.exit==='overexposeOut',flash=cut.hold==='flashBox',z=item.size,rest={...item,x:0,y:0},box=J.itemBox(rest),points=[],steady=[],light=[];
 const glyphScale=(inkBleed?1.023:1)*(magnet?1.14:1)*(flash?1.05:1),travel=magnet?z*2.8:0;
 for(const k of exit?[1,1.07]:[1])for(const track of exit?[item.track||0,(item.track||0)+.06]:[item.track||0]){
  const it={...rest,_m:null,_lay:null,size:z*k,track,x:box.cx*(1-k),y:box.cy*(1-k)},lay=J.layoutText(it),geometry=A.itemGeometry(it,ID,{pass:'main',scale:1});
  for(const g of geometry.glyphs){const p=g.polygon,b=A.bounds([p]),glyph=lay[g.index],cx=it.x+(glyph.x+glyph.vx)*(it.sx||1),cy=it.y+(glyph.y+glyph.vy)*(it.sy||1),rx=Math.max(Math.abs(b.x0-cx),Math.abs(b.x1-cx))*glyphScale,ry=Math.max(Math.abs(b.y0-cy),Math.abs(b.y1-cy))*glyphScale,r=magnet?Math.hypot(rx,ry):null;points.push(...rectangle({x0:cx-(r??rx)-travel,y0:cy-(r??ry)-travel,x1:cx+(r??rx)+travel,y1:cy+(r??ry)+travel}));const ss=flash?1.05:1,ex=Math.max(Math.abs(b.x0-cx),Math.abs(b.x1-cx))*ss,ey=Math.max(Math.abs(b.y0-cy),Math.abs(b.y1-cy))*ss;steady.push(...rectangle({x0:cx-ex,y0:cy-ey,x1:cx+ex,y1:cy+ey}));}
  if(flash)for(const g of lay){const cx=it.x+(g.x+g.vx)*(it.sx||1),cy=it.y+(g.y+g.vy)*(it.sy||1),w=(it.vertical?it.size*(it.sx||1):g.w*(it.sx||1))*1.224,h=(it.vertical?g.h*(it.sy||1):it.size*(it.sy||1))*1.224;light.push(...rectangle({x0:cx-w/2,y0:cy-h/2,x1:cx+w/2,y1:cy+h/2}));}
  if(exit){const b=J.itemBox(it),w=b.w*3.06;light.push(...rectangle({x0:b.cx-w/2,y0:it.y-z*.09,x1:b.cx+w/2,y1:it.y+z*.09}));}
 }
 const b=A.bounds([points]),filter=inkBleed?Math.min(36,z*.16):0,shadow=Math.max(inkBleed?z*.3:0,exit?z*.9:0),d=cut.treat==='hardShadow'?z*1.07*cut.treatP.d:0,ox=d*Math.abs(cut.treatP?.dir?.[0]||0),oy=d*Math.abs(cut.treatP?.dir?.[1]||0);
 // This deliberately adds filter and shadow tails, including enter/exit overlap.
 const separated=(cut.inDur??0)+(cut.outDur??0)<=cut.dur,entryTail=filter+(inkBleed?z*.3/2:0),exitTail=exit?z*.9/2:0,blurPad=SUPPORT_SIGMA*(separated?Math.max(entryTail,exitTail):filter+shadow/2),pad=(blurPad+2)/Math.min(1,cut.contentScale??1);
 const entryBox=A.bounds([points]),exitBox=A.bounds([steady]),entryPad=(SUPPORT_SIGMA*entryTail+2)/Math.min(1,cut.contentScale??1),exitPad=(SUPPORT_SIGMA*exitTail+2)/Math.min(1,cut.contentScale??1),expand=(b,p)=>rectangle({x0:b.x0-p-ox,y0:b.y0-p-oy,x1:b.x1+p+ox,y1:b.y1+p+oy}),glyphBounds=separated?[expand(entryBox,entryPad),expand(exitBox,exitPad)]:[expand(b,pad)],bounds=A.bounds([...glyphBounds,...(light.length?[light]:[])]);const body=A.bounds(A.itemGeometry(rest,ID,{pass:'main',scale:1}).polygons),bodyPad=flash?z*.06:0;return {bounds,body:{x0:body.x0-bodyPad,y0:body.y0-bodyPad,x1:body.x1+bodyPad,y1:body.y1+bodyPad},paintBudget:paints,blurPad,glyphs:n};
}
function stageEnvelope(local,item,plan,cut,bodyOnly=false){
 const scale=local.renderScale,fx=cut.effectFx||plan.fx,st=cut.effectStyle||plan.style,W=plan.W,H=plan.H,K=J.clamp((fx.motion??.7)*1.25,0,1.25),motion=cut.motionScale??1,base=cut.contentScale??1,P=cut.camP||{},camScale=cut.cam==='dollyIn'?Math.min(.14,(P.a||.1)*K):cut.cam==='beatPunch'?(P.a||.035)*K:.03*Math.max(1,K),maxScale=1+camScale;
 const points=[],b=bodyOnly?local.body:local.bounds;for(const x of [b.x0+item.x,b.x1+item.x])for(const y of [b.y0+item.y,b.y1+item.y])for(const scale of [base,base*maxScale])points.push([W/2+(x-W/2)*scale,H/2+(y-H/2)*scale]);
 const box=A.bounds([points]),chroma=(fx.chroma??.7)*(st.ghost??1)*(1+(plan.events||[]).filter(e=>e.type==='chroma').reduce((a,e)=>a+e.amp,0)+.9),shake=(plan.events||[]).filter(e=>e.type==='shake').reduce((a,e)=>a+e.amp,0),rgb=(plan.events||[]).filter(e=>e.type==='rgbSplit').reduce((a,e)=>a+J.clamp(e.amp??1,.3,1.6),0),turn=cut.cam==='dutch'?Math.max(...points.map(p=>Math.hypot(p[0]-W/2,p[1]-H/2)))*2*Math.sin(2.5*J.DEG):0;
 if(bodyOnly){const dx=2/scale+turn+(cut.cam==='panL'||cut.cam==='panR'?W*Math.abs(P.a||.022)*K*motion:0)+16*shake*H/1080*motion,dy=2/scale+turn+11*shake*H/1080*motion+(cut.cam==='dollyIn'?H*.008*K:cut.cam==='beatPunch'?H*.004*K:0);return rectangle({x0:box.x0-dx,y0:box.y0-dy,x1:box.x1+dx,y1:box.y1+dy});}
 const cw=Math.round(W*scale),sw=Math.max(1,Math.round(cw/4)),upscale=cw/sw,rasterPad=2/scale,resamplePad=2*upscale/scale;
 const dx=rasterPad+turn+(3.4*chroma+16*shake)*H/1080*motion+W*.016*rgb+resamplePad+(cut.cam==='panL'||cut.cam==='panR'?W*Math.abs(P.a||.022)*K*motion:0),dy=rasterPad+turn+(1.9*chroma+11*shake)*H/1080*motion+H*.004*rgb+resamplePad+(cut.cam==='dollyIn'?H*.008*K:cut.cam==='beatPunch'?H*.004*K:0);
 // Existing quarter-size post bloom: sigma is max(2,round(width/4/160))*4.
 const bloom=SUPPORT_SIGMA*Math.max(2,Math.round(sw/160))*upscale/scale;
 return rectangle({x0:box.x0-dx-bloom,y0:box.y0-dy-bloom,x1:box.x1+dx+bloom,y1:box.y1+dy+bloom});
}
function prepare(plan,previous=null,{scale=1}={}){
 if(!Number.isFinite(scale)||scale<=0||scale>4)throw Object.assign(Error('Positive render scale through4 required'),{code:'UNSUPPORTED_RENDER_SCALE'});
 const started=performance.now(),cuts=plan.cuts.map(c=>({...c})),diagnostics=[];
 for(const cut of cuts){const original=plan.cuts.find(c=>c.index===cut.index);if(!targets(plan,original))continue;
  let reason=null;
  const fx=cut.effectFx||plan.fx,st=cut.effectStyle||plan.style;
  const numeric=[plan.W,plan.H,cut.contentScale??1,cut.motionScale??1,fx.motion??.7,fx.chroma??.7,st.ghost??1,cut.camP?.a??0,cut.camP?.dir??1,cut.treatP?.d??0,...(cut.treatP?.dir||[]),...Object.values(cut.params).filter(v=>typeof v==='number')];if(!numeric.every(Number.isFinite)||plan.W<=0||plan.H<=0||(cut.contentScale??1)<=0||(cut.motionScale??1)<0||(cut.motionScale??1)>1||(fx.motion??.7)<0||(fx.motion??.7)>1||(fx.chroma??.7)<0||(st.ghost??1)<0||cut.text.length===0||(cut.camP?.a??0)<0||Math.abs(cut.camP?.dir??1)>1||(cut.treatP?.d??0)<0)reason='UNSUPPORTED_PARAMETER_RANGE';
  if(!['cut','flicker','inkBleed','magnet'].includes(cut.enter)||!['cut','overexposeOut'].includes(cut.exit)||(cut.groupExit??cut.exit)!==cut.exit||!['still','flashBox'].includes(cut.hold)||!['none','hardShadow'].includes(cut.treat||'none')||(cut.decor||[]).some(d=>!['verticalStrip','dataColumns','sonarArcs'].includes(d.id))||cut.drawing||cut.effectsOnly||J.activeMask?.(cut)||!['push','panL','panR','dutch','dollyIn','beatPunch'].includes(cut.cam))reason='UNSUPPORTED_MOTION';
  if((plan.events||[]).some(e=>!['chroma','shake','rgbSplit'].includes(e.type))||cut.trans&&cut.trans!=='none')reason='UNSUPPORTED_EFFECT';
  if(cut.layout==='center'&&(cut.params.under||cut.params.sub&&cut.lineText!==cut.text))reason='UNSUPPORTED_AUXILIARY';
  const regions=intervals(plan,original).regions;
  if(regions.length!==1)reason='UNSUPPORTED_REGION_CHANGE';
  if(cut.layout==='numbered'&&((cut.decor||[]).length||cut.params.chunks?.length>3))reason='UNSUPPORTED_NUMBERED_COLUMNS';
  if(reason){diagnostics.push({cut:cut.index,status:'unsupported',reason});continue;}
  if(cut.layout==='numbered'){const result=A.numberedCircle.prepare(plan,cut,{scale,previous,region:regions[0]});diagnostics.push(result.diagnostic);if(result.recipe){cut.area=null;cut.simpleCircleRecipe={sourceCut:original,numberedColumns:result.recipe,renderScale:scale,policy};}continue;}
  const area=cut.area,W0=area?plan.W*area.w:plan.W,H0=area?plan.H*area.h:plan.H;
  const native=J.basicMainItem({W:W0,H:H0,cut,sc:cut.palette||st.schemes[cut.scheme%st.schemes.length]});
  const r=regions[0],circle={cx:r.center.x*plan.W,cy:r.center.y*plan.H,r:r.radius*Math.min(plan.W,plan.H)},W=plan.W,H=plan.H,pad=Math.max(2,.005*Math.min(W,H))+1,dx=2*circle.cx/W-1,dy=2*circle.cy/H-1;
  const regionsByDirection=[{direction:'down',score:-dy,x0:0,y0:circle.cy+circle.r+pad,x1:W,y1:H},{direction:'up',score:dy,x0:0,y0:0,x1:W,y1:circle.cy-circle.r-pad},{direction:'right',score:-dx,x0:circle.cx+circle.r+pad,y0:0,x1:W,y1:H},{direction:'left',score:dx,x0:0,y0:0,x1:circle.cx-circle.r-pad,y1:H}];
  const source=cut.layout==='vcols'?cut.text.split('\n').map(s=>s.replace(/\s+/g,'')).join('\n'):cut.text,explicit=source.includes('\n'),chars=[...source],n=chars.length;
  const candidates=[];let measured=0;const old=previous?.policy===policy?previous.diagnostics.find(d=>d.cut===cut.index&&d.status==='safe'):null;
  const advance=Math.max(...chars.filter(c=>c!=='\n').map(c=>J.metrics.adv(native.font,c)*native.size))+native.size*Math.max(0,native.track||0),step=native.size*(native.vertical?native.lead||1.4:native.lead||1.2);
  for(const region of regionsByDirection){if(region.x0>=region.x1||region.y0>=region.y1)continue;
   const ratio=(region.x1-region.x0)/(region.y1-region.y0),ideal=native.vertical?Math.sqrt(n*step/(native.size*ratio)):Math.sqrt(n*step*ratio/Math.max(1,advance)),perValues=explicit?[null]:[Math.max(1,Math.min(n,Math.floor(ideal))),Math.max(1,Math.min(n,Math.ceil(ideal))),Math.max(...native.text.split('\n').map(s=>[...s].length))];
   for(const per of new Set(perValues)){
    let text=source;if(!explicit){const rows=[];for(let i=0;i<n;i+=per)rows.push(chars.slice(i,i+per).join(''));text=rows.join('\n');}
    const item={...native,text,x:0,y:0};delete item._lay;delete item._m;
    const local={...localEnvelope(item,cut),renderScale:scale},b=local.bounds,cx=(b.x0+b.x1)/2,cy=(b.y0+b.y1)/2;
    const next={...item,x:(region.x0+region.x1)/2-cx,y:(region.y0+region.y1)/2-cy};let envelope=stageEnvelope(local,next,plan,cut),box=A.bounds([envelope]);
    // Correct the center once for camera scaling about the stage center.
    next.x+=((region.x0+region.x1-box.x0-box.x1)/2)/(cut.contentScale??1);next.y+=((region.y0+region.y1-box.y0-box.y1)/2)/(cut.contentScale??1);envelope=stageEnvelope(local,next,plan,cut);box=A.bounds([envelope]);measured++;
    // Canvas already clips effect tails at its bitmap edges. Keep the readable
    // body inside; constrain only the circle-facing edge of each free region.
    const shiftX=region.x0>0?Math.max(0,region.x0-box.x0):region.x1<W?-Math.max(0,box.x1-region.x1):0,shiftY=region.y0>0?Math.max(0,region.y0-box.y0):region.y1<H?-Math.max(0,box.y1-region.y1):0;
    next.x+=shiftX/(cut.contentScale??1);next.y+=shiftY/(cut.contentScale??1);envelope=stageEnvelope(local,next,plan,cut);box=A.bounds([envelope]);
    const body=A.bounds([stageEnvelope(local,next,plan,cut,true)]);if(body.x0<0||body.x1>W||body.y0<0||body.y1>H)continue;
    box={x0:Math.max(0,box.x0),y0:Math.max(0,box.y0),x1:Math.min(W,box.x1),y1:Math.min(H,box.y1)};if(box.x0>=box.x1||box.y0>=box.y1)continue;envelope=rectangle(box);
    if(box.x0<region.x0||box.x1>region.x1||box.y0<region.y0||box.y1>region.y1||!A.clear([envelope],circle,pad))continue;
    candidates.push({item:next,local,envelope,region,direction:region.direction,score:region.score,fitness:Math.abs(Math.log(((b.x1-b.x0)/(b.y1-b.y0))/ratio)),distance:Math.hypot((next.x-native.x)/W,(next.y-native.y)/H)});
   }
  }
  candidates.sort((a,b)=>b.score-a.score||a.fitness-b.fitness||a.distance-b.distance||Number(b.direction===old?.direction)-Number(a.direction===old?.direction));
  let winner=candidates[0];if(winner&&old&&old.direction===winner.direction&&old.text===winner.item.text){const prior=previous.plan.cuts.find(c=>c.index===cut.index)?.simpleCircleRecipe?.item;if(prior){const item={...winner.item,x:prior.x,y:prior.y},raw=A.bounds([stageEnvelope(winner.local,item,plan,cut)]),body=A.bounds([stageEnvelope(winner.local,item,plan,cut,true)]),envelope=rectangle({x0:Math.max(0,raw.x0),y0:Math.max(0,raw.y0),x1:Math.min(W,raw.x1),y1:Math.min(H,raw.y1)});if(body.x0>=0&&body.x1<=W&&body.y0>=0&&body.y1<=H&&envelope[0][0]>=winner.region.x0&&envelope[1][0]<=winner.region.x1&&envelope[0][1]>=winner.region.y0&&envelope[2][1]<=winner.region.y1&&A.clear([envelope],circle,pad))winner={...winner,item,envelope,reusedPosition:true};}}
  if(!winner){diagnostics.push({cut:cut.index,status:'insufficient-space',reason:'NO_SAFE_ARRANGEMENT',candidates:measured,nativeSize:native.size});continue;}
  cut.area=null;cut.simpleCircleRecipe={item:winner.item,sourceCut:original,renderScale:scale,policy};
  diagnostics.push({cut:cut.index,status:'safe',direction:winner.direction,region:winner.region,envelope:winner.envelope,text:winner.item.text,size:winner.item.size,candidates:measured,score:winner.score,fitness:winner.fitness,distance:winner.distance,reusedPosition:!!winner.reusedPosition,paintBudget:winner.local.paintBudget,blurPad:winner.local.blurPad});
 }
 const resultPlan={...plan,cuts};sourceCuts.set(resultPlan,new Set(cuts.filter(c=>c.simpleCircleRecipe).map(c=>c.index)));return {plan:resultPlan,diagnostics,revision:J.metrics.revision||0,elapsedMs:performance.now()-started,renderScale:scale,policy};
}
function drawDecor(renderer,ctx,plan,cut,sc,options,root,layer){
 const source=cut.simpleCircleRecipe.sourceCut;if(source.layout==='numbered')return;const env=renderer.makeEnv(ctx,plan,source,sc,options),area=source.area,W=env.W,H=env.H,ax=area?area.x*plan.W:0,ay=area?area.y*plan.H:0,motion=source.motionScale??1,cam=J.CAMERA[source.cam].get(env,source.camP||{}),scale=J.lerp(1,cam.s??1,motion)*(source.contentScale??1);
 ctx.save();try{if(area){ctx.translate(ax+W/2,ay+H/2);ctx.rotate((area.angle||0)*J.DEG);ctx.translate(-ax-W/2,-ay-H/2);ctx.beginPath();ctx.rect(ax,ay,W,H);ctx.clip();}ctx.translate(ax+W/2+(root.x+(cam.x||0))*motion,ay+H/2+(root.y+(cam.y||0))*motion);if(cam.rot)ctx.rotate(cam.rot*J.DEG*motion);ctx.scale(scale,scale);ctx.translate(-W/2,-H/2);ctx.globalCompositeOperation=root.blend;
  const item=J.animateMainItem(env,J.basicMainItem(env));let bb=null;
  if(item){const lay=J.layoutText(item),boxes=[];for(const g of lay){if(!g.ch.trim())continue;const c=item.charFn?.(g.i,g,lay.N);if(c?.hide||(item.alpha??1)*(c?.a??1)<=.002)continue;const k=c?.s??1;boxes.push({x:(g.x+g.vx)*(item.sx||1)+(c?.dx||0),y:(g.y+g.vy)*(item.sy||1)+(c?.dy||0),w:g.w*(item.sx||1)*k,h:g.h*(item.sy||1)*k});}if(boxes.length)bb={x0:item.x+Math.min(...boxes.map(b=>b.x-b.w/2)),x1:item.x+Math.max(...boxes.map(b=>b.x+b.w/2)),y0:item.y+Math.min(...boxes.map(b=>b.y-b.h/2)),y1:item.y+Math.max(...boxes.map(b=>b.y+b.h/2)),cx:item.x,cy:item.y,boxes};}
  for(const d of source.decor||[]){const D=J.DECOR[d.id];if(D?.layer===layer)D.draw(env,bb,d);}
 }finally{ctx.restore();}
}
function outputPlan(plan,{scale=1}={}){if(!plan.cuts.some(c=>targets(plan,c)))return plan;const prepared=prepare(plan,null,{scale}),failed=prepared.diagnostics.find(d=>d.status==='insufficient-space');if(failed)throw Object.assign(Error(J.mediaLabel('この条件では回避配置を出力できません。円の位置・サイズや演出を変更してください。','Avoidance cannot be exported for these conditions. Change the circle position, size or effects.')),{code:'SIMPLE_CIRCLE_'+failed.status.toUpperCase().replaceAll('-','_'),details:failed});const unsupported=prepared.diagnostics.filter(d=>d.status==='unsupported');prepared.plan.circleAvoidanceStatus={status:unsupported.length?'partial':'applied',unsupportedCuts:unsupported.map(d=>d.cut),diagnostics:prepared.diagnostics};return prepared.plan;}
A.simpleCircle=Object.freeze({targets,active,activeCut,prepare,drawDecor,outputPlan,itemEnvelope:localEnvelope,stageEnvelope,policy});
for(const name of ['center','vcols']){const render=J.LAYOUTS[name].render;J.LAYOUTS[name].render=function(env){const recipe=env.cut.simpleCircleRecipe;if(!recipe)return render(env);return J.mainDraw(env,{...recipe.item,color:env.cut.params.accent?env.sc.accent:env.sc.fg});};}
})();
