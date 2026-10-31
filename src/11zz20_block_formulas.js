/* Native typography/plate formulas. No source recording or clock enumeration. */
(() => {
'use strict';
const A=J.placement,S=A.simpleCircle,ID=[1,0,0,1,0,0],rect=b=>[[b.x0,b.y0],[b.x1,b.y0],[b.x1,b.y1],[b.x0,b.y1]],move=(b,x,y)=>({x0:b.x0+x,y0:b.y0+y,x1:b.x1+x,y1:b.y1+y}),ids=new Set(['type','pill','circle','condensed','mixed']);
function geometry(env){
 const {W,H,cut,st}=env,p=cut.params,items=[],plain=[],shapes=[],bodies=[],box=(x0,y0,x1,y1,tail=0)=>{bodies.push(rect({x0,y0,x1,y1}));shapes.push(rect({x0:x0-tail,y0:y0-tail,x1:x1+tail,y1:y1+tail}));};
 if(cut.layout==='type'){
  const text=J.splitLines(cut.text,14),size=Math.min(H*.11,J.fitSize(text,p.font,W*.74,H*.36,{track:.06,lead:1.35})),left=p.align==='left',x=left?W*.13:W/2;
  items.push({text,font:p.font,size,x,y:H/2,align:left?'left':'center',track:.06,lead:1.35});
  if(p.prompt)plain.push({text:'>',font:st.fonts.mono[0]||'mono',size:size*.8,x:(left?x:x-J.measure({text,font:p.font,size,track:.06}).w/2)-size*.9,y:H/2-(text.split('\n').length-1)*size*.67});
  const font=st.fonts.mono[0]||'mono',sizeLabel=J.clamp(H*.02,12,20),digits='0123456789'.split('').sort((a,b)=>J.metrics.adv(font,b)-J.metrics.adv(font,a)),timeLength=Math.max(J.fmtTime(cut.start).length,J.fmtTime(cut.end+.6).length);
  plain.push({text:`LINE ${String((cut.line|0)+1).padStart(2,'0')} ─ `+digits[0].repeat(timeLength),font,size:sizeLabel,align:'left',x:W*.13,y:H*.8});
 }else if(cut.layout==='pill'){
  const text=cut.text,size=Math.min(J.fitSize(text,p.font,W*.62,H*.2,{track:.04}),H*.17),m=J.measure({text,font:p.font,size,track:.04}),w=m.w+size*1.3,h=size*1.6,ww=Math.max(h,w);
  items.push({text,font:p.font,size,x:W/2,y:H/2,track:.04,clipX:[W/2-ww/2,W/2+ww/2]});box(W/2-ww/2,H/2-h/2,W/2+ww/2,H/2+h/2);
  if(p.smalls){const labs=[J.romaji(text.replace(/\s+/g,''))||'LYRIC','No.'+String((cut.line|0)+1).padStart(2,'0'),J.fmtTime(cut.start)],fs=J.clamp(H*.022,13,24),q=1+4*2**3/(27*3**2);for(let i=0;i<labs.length;i++){const text=labs[i],font=st.fonts.body[0],m=J.measure({text,font,size:fs,track:.1}),x=W/2+(i===0?-w*.3:i===1?w*.42:w*.1),y=H/2+(i===1?-h*.95:h*.95);plain.push({text,font,size:fs,track:.1,x,y});box(x-(m.w/2+fs*.8)*q,y-fs*.85,x+(m.w/2+fs*.8)*q,y+fs*.85,1.3/2+1);}}
 }else if(cut.layout==='circle'){
  const text=cut.text.replace(/\s+/g,''),cx=W/2+p.off*W,cy=H/2;
  if(p.variant==='eclipse'){const size=Math.min(J.fitSize(text,p.font,W*.82,H*.46,{track:.02}),H*.36),R=H*.19;items.push({text:J.splitLines(text,6),font:p.font,size,x:W/2,y:H/2,lead:1.05});box(W*.42-R*1.01,H*.62-R*1.01,W*.58+R*1.01,H*.62+R*1.01,6*38/2/Math.min(1,cut.contentScale??1)+1.5+1);}
  else{const R=Math.min(H*.3,W*.4),q=1+4*1.5**3/(27*2.5**2),size=p.vertical?Math.min(J.fitSize(text,p.font,R*1.1,R*1.35,{vertical:true}),R*.9):Math.min(J.fitSize(text,p.font,R*1.45,R*.9),R*.8);box(cx-R*q,cy-R*q,cx+R*q,cy+R*q,2.5);items.push({text,font:p.font,size,x:cx,y:cy,vertical:p.vertical,color:env.sc.fg});}
 }else if(cut.layout==='condensed'){
  const text=cut.text.replace(/\s+/g,''),slot=W*.92/p.count,size=Math.min(J.fitSize(text,p.font,slot*.94,H*.8,{sx:p.sx,sy:p.sy,track:.04}),H*.62),order=[1,0,2,3];for(let i=0;i<p.count;i++)items.push({text,font:p.font,size,sx:p.sx,sy:p.sy,track:.04,x:W/2+(i-(p.count-1)/2)*slot,y:H/2,mi:p.count>1?order[i]*2:0});
 }else if(cut.layout==='mixed'){
  const chars=[...cut.text.replace(/\s+/g,'')],n=chars.length,rows=n>9?2:1,per=Math.ceil(n/rows),parts=chars.map((ch,i)=>{let k=J.isKanji(ch)?1:J.isKata(ch)?.88:J.isLatin(ch)?.8:J.isPunct(ch)?.42:p.smallK+J.r(cut.seed,i,3)*.14;if(J.isSmallKana(ch))k*=.8;const font=J.isKanji(ch)||J.isKata(ch)?p.fontBig:J.r(cut.seed,i,4)<.55?p.fontSmall:p.fontBig;return {ch,k,font,w:J.metrics.adv(font,ch)*k*.96};});for(let r=0;r<rows;r++){const row=parts.slice(r*per,(r+1)*per),sum=row.reduce((a,c)=>a+c.w,0),base=Math.min(W*.86/sum,H*(rows>1?.3:.4)),baseline=H/2+base*.38+(r-(rows-1)/2)*base*1.05;let x=W/2-sum*base/2;row.forEach((c,j)=>{const i=r*per+j,size=c.k*base;let y=baseline-size/2+J.rs(cut.seed,i,5)*base*.06;if(p.mode==='stair')y+=(j-(row.length-1)/2)*base*.12;if(p.mode==='wave')y+=Math.sin(j*1.1)*base*.1;items.push({text:c.ch,font:c.font,size,x:x+c.w*base/2,y,rot:J.rs(cut.seed,i,6)*p.rotAmp,mi:i});x+=c.w*base;});}
 }
 return {items,plain,shapes,bodies};
}
const handles=(plan,cut)=>ids.has(cut.layout)&&(S.preparedCut(plan,cut)||A.placementCutPreserved86cm(plan,cut)===false);
function viewportProject(plan,cut,scale,{fixedViewport=false,allCutsBloom=false,allCutsChroma=false,activeRange=null,bloomSigma=6,jellyHoldOnly=false}={}){
 const area=cut.area,W=plan.W,H=plan.H,sw=area?W*area.w:W,sh=area?H*area.h:H,st=cut.effectStyle||plan.style;
 const fx=cut.effectFx||plan.fx,maxChroma=allCutsChroma?Math.max((plan.fx.chroma??.7)*(plan.style.ghost??1),...(plan.cuts||[]).map(c=>((c.effectFx||plan.fx).chroma??.7)*((c.effectStyle||plan.style).ghost??1))):(fx.chroma??.7),smallFx={...fx,texture:0,chroma:maxChroma*H/sh},smallStyle={...st,glow:0,...(allCutsChroma?{ghost:1}:{})},smallPlan={...plan,W:sw,H:sh,fx:smallFx,style:smallStyle,events:(plan.events||[]).filter(e=>!['rgbSplit','slice','block','zoom','splitSlide','whipBlur','zoomPunch','heartbeat','edgeDetect'].includes(e.type)).map(e=>e.type==='shake'?{...e,amp:e.amp*H/sh}:e)},smallCut={...cut,layout:'bulbs',effectFx:smallFx,effectStyle:smallStyle,sourceExcludeCameraBlur:!!area,jellyHoldOnly},cw=Math.round(W*scale),quarter=Math.max(1,Math.round(cw/4)),up=cw/quarter,bloomEnabled=allCutsBloom?((plan.style.glow??.6)*.5*(plan.fx.texture??.6)>.05||(plan.cuts||[]).some(c=>((c.effectStyle||plan.style).glow??.6)*.5*((c.effectFx||plan.fx).texture??.6)>.05)):(st.glow??.6)*.5*(fx.texture??.6)>.05,bloom=bloomEnabled?bloomSigma*Math.max(2,Math.round(quarter/160))*up/scale:0,rgb=(plan.events||[]).filter(e=>e.type==='rgbSplit').reduce((a,e)=>a+J.clamp(e.amp??1,.3,1.6),0);
 const post=S.postMotion(plan,W,H,scale,cut,activeRange),cameraBlur=area&&cut.cam==='rackFocus'?6*(cut.camP?.b||6.5)*Math.min(1,J.clamp((fx.motion??.7)*1.25,0,1.25))*(cut.motionScale??1):0;
 const project=(local,item,plan,cut,body)=>{let b=A.bounds([S.stageEnvelope(local,area&&!fixedViewport?{x:0,y:0}:item,smallPlan,smallCut,body)]);if(area)b={x0:Math.max(0,b.x0),y0:Math.max(0,b.y0),x1:Math.min(sw,b.x1),y1:Math.min(sh,b.y1)};const x=area?area.x*W+(fixedViewport?0:item.x):0,y=area?area.y*H+(fixedViewport?0:item.y):0,tx=body?0:bloom+cameraBlur+W*.016*rgb+post.x,ty=body?0:bloom+cameraBlur+H*.004*rgb+post.y;return rect({x0:b.x0+x-tx,y0:b.y0+y-ty,x1:b.x1+x+tx,y1:b.y1+y+ty});};
 return project;
}
function prepare(plan,cut,{scale,region,previous}){
 const area=cut.area,W=plan.W,H=plan.H,sw=area?W*area.w:W,sh=area?H*area.h:H,st={...(cut.effectStyle||plan.style),...(cut.fonts?{fonts:cut.fonts}:{})},env={W:sw,H:sh,cut,plan,st,sc:cut.palette||st.schemes[cut.scheme%st.schemes.length]},g=geometry(env),polygons=g.shapes.slice(),bodies=g.bodies.slice();
 for(const item of g.items){if(['outlineOffset','kerningWide'].includes(cut.treat))J.TREAT[cut.treat].apply(env,item,cut.treatP);const local=S.itemEnvelope(item,cut);let b=move(local.bounds,item.x,item.y),body=move(local.body,item.x,item.y);if(item.clipX){b={...b,x0:Math.max(b.x0,item.clipX[0]),x1:Math.min(b.x1,item.clipX[1])};body={...body,x0:Math.max(body.x0,item.clipX[0]),x1:Math.min(body.x1,item.clipX[1])};}const angle=(item.rot||0)*J.DEG,rotate=box=>rect(box).map(([x,y])=>[item.x+(x-item.x)*Math.cos(angle)-(y-item.y)*Math.sin(angle),item.y+(x-item.x)*Math.sin(angle)+(y-item.y)*Math.cos(angle)]);polygons.push(rotate(b));bodies.push(rotate(body));}
 for(const item of g.plain){const ps=A.itemGeometry(item,ID,{pass:'main',scale:1}).polygons;polygons.push(...ps);bodies.push(...ps);}
 const local={bounds:A.bounds(polygons),body:A.bounds(bodies),renderScale:scale};
 const project=viewportProject(plan,cut,scale);
 const domain=S.domain(plan,{...cut,simpleCircleClip:!!area},region,project),candidates=[];
 for(const r of domain.regions){const placed=domain.place(local,r);if(placed)candidates.push({...placed,region:r,fitness:Math.abs(Math.log(((local.body.x1-local.body.x0)/(local.body.y1-local.body.y0))/((r.x1-r.x0)/(r.y1-r.y0)))),distance:Math.hypot(placed.offset[0]/W,placed.offset[1]/H)});}
 const old=previous?.policy===S.policy?previous.diagnostics.find(d=>d.cut===cut.index&&d.status==='safe'):null;candidates.sort((a,b)=>b.region.score-a.region.score||a.fitness-b.fitness||a.distance-b.distance||Number(b.region.direction===old?.direction)-Number(a.region.direction===old?.direction));const win=candidates[0];if(!win)return {diagnostic:{cut:cut.index,status:'insufficient-space',reason:'NO_SAFE_NATIVE_BLOCK'}};
 const prior=previous?.plan.cuts.find(c=>c.index===cut.index)?.simpleCircleRecipe?.nativeBlock;if(old?.direction===win.region.direction&&prior?.layout===cut.layout){const envelope=domain.fit(local,prior.offset,win.region);if(envelope){win.offset=prior.offset.slice();win.envelope=envelope;win.reusedPosition=true;}}
 return {area:area?{...area,x:area.x+win.offset[0]/W,y:area.y+win.offset[1]/H}:null,recipe:{layout:cut.layout,W:sw,H:sh,offset:win.offset,nativeViewport:!!area},diagnostic:{cut:cut.index,status:'safe',method:'native-block-formula',direction:win.region.direction,score:win.region.score,region:win.region,envelope:win.envelope,reusedPosition:!!win.reusedPosition,allClockGeneration:false}};
}
A.nativeBlockCircle=Object.freeze({ids,geometry,handles,prepare,viewportProject});
for(const id of ids){const render=J.LAYOUTS[id].render;J.LAYOUTS[id].render=function(env){const recipe=env.cut.simpleCircleRecipe?.nativeBlock;if(!recipe||recipe.nativeViewport)return render(env);env.ctx.save();try{env.ctx.translate(...recipe.offset);return render({...env,W:recipe.W,H:recipe.H});}finally{env.ctx.restore();}};}
})();
