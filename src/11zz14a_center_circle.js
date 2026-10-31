/* Center composition: retain native attached ink and bound every source clock. */
(() => {
'use strict';
const A=J.placement,ID=[1,0,0,1,0,0];
const union=(...bs)=>({x0:Math.min(...bs.map(b=>b.x0)),y0:Math.min(...bs.map(b=>b.y0)),x1:Math.max(...bs.map(b=>b.x1)),y1:Math.max(...bs.map(b=>b.y1))});
const grow=(b,p)=>({x0:b.x0-p,y0:b.y0-p,x1:b.x1+p,y1:b.y1+p});
const handles=cut=>cut.layout==='center'&&!cut.area&&['cut','flicker','invertBox'].includes(cut.enter)&&['cut','tyStrike'].includes(cut.exit)&&['still','knCounterRock'].includes(cut.hold)&&['none','hardShadow'].includes(cut.treat||'none');
const trigRange=(a,b,lo,hi)=>{const values=[a*Math.cos(lo)+b*Math.sin(lo),a*Math.cos(hi)+b*Math.sin(hi)],root=Math.atan2(b,a);for(let k=-2;k<=2;k++){const t=root+k*Math.PI;if(t>=lo&&t<=hi)values.push(a*Math.cos(t)+b*Math.sin(t));}return [Math.min(...values),Math.max(...values)];};
function sourceUnits(item,cut,plan,{holdOnly=false}={}){
 if(!handles(cut)||(cut.treat||'none')!=='none')return null;
 const rest={...item,x:0,y:0,_m:null,_lay:null,charFns:[]},lay=J.layoutText(rest),geometry=A.itemGeometry(rest,ID,{pass:'main',scale:1}),m=cut.motionScale??1,units=[],bbs=[];
 // itemGeometry omits all trim-whitespace; native returned bb omits only the
 // two source space characters. Keep other whitespace on the full-clip path.
 if(lay.some(g=>!g.ch.trim()&&g.ch!==' '&&g.ch!=='　'))return null;
 if(!geometry.glyphs.length)return null;
 // animateMainItem supplies amt=clamp(...)*(1-pOut), hence 0<=amt<=1.
 // Evaluate the native hold once at sin=1 to obtain its actual word pivots;
 // this constructs charFns only, and performs no painting or frame sampling.
 if(cut.hold==='knCounterRock')J.HOLD.knCounterRock.apply({cut,fx:cut.effectFx||plan.fx,lt:1/(4*.55),ltb:1/(4*.55)},rest,1);
 const fn=rest.charFns[0];
 for(const ink of geometry.glyphs){
  const g=lay.find(g=>g.i===ink.index),gx=(g.x+g.vx)*(item.sx||1),gy=(g.y+g.vy)*(item.sy||1),state=fn?.(g.i,g,lay.N),angle=Math.abs(state?.rot||0)*J.DEG,th=(state?.rot||0)*J.DEG,c=Math.cos(th)-1,s=Math.sin(th),den=c*c+s*s;
  let px=gx,py=gy;if(den>0){const dx=state.dx||0,dy=state.dy||0;px=gx-(c*dx+s*dy)/den;py=gy-(-s*dx+c*dy)/den;}
  const vx=gx-px,vy=gy-py,rx=trigRange(vx,-vy,-angle,angle),ry=trigRange(vy,vx,-angle,angle),shiftX=[m*(rx[0]-vx),m*(rx[1]-vx)],shiftY=[m*(ry[0]-vy),m*(ry[1]-vy)];
  // Strike contracts each glyph's local y toward its own baseline before
  // rotation. Include that complete segment even for punctuation whose ink
  // lies wholly on one side of the baseline.
  const points=[...ink.polygon,...(!holdOnly&&cut.exit==='tyStrike'?ink.polygon.map(([x])=>[x,gy]):[]),[gx,gy]],bounds=[];
  for(const [x,y]of points){
   if(m===1){const xRange=trigRange(x-px,-(y-py),-angle,angle),yRange=trigRange(y-py,x-px,-angle,angle);bounds.push({x0:px+xRange[0],x1:px+xRange[1],y0:py+yRange[0],y1:py+yRange[1]});}
   else{const xRange=trigRange(x-gx,-(y-gy),-angle*m,angle*m),yRange=trigRange(y-gy,x-gx,-angle*m,angle*m);bounds.push({x0:gx+shiftX[0]+xRange[0],x1:gx+shiftX[1]+xRange[1],y0:gy+shiftY[0]+yRange[0],y1:gy+shiftY[1]+yRange[1]});}
  }
  const b=union(...bounds);units.push({owner:'center.glyph.'+g.i,kind:'glyph',bounds:{x0:b.x0+item.x,x1:b.x1+item.x,y0:b.y0+item.y,y1:b.y1+item.y}});
  // Native returned glyph bb ignores character rotation and strike sy shrink.
  bbs.push({x0:gx+shiftX[0]-g.w*(item.sx||1)/2,x1:gx+shiftX[1]+g.w*(item.sx||1)/2,y0:gy+shiftY[0]-g.h*(item.sy||1)/2,y1:gy+shiftY[1]+g.h*(item.sy||1)/2,leftMax:gx+shiftX[1]-g.w*(item.sx||1)/2,rightMin:gx+shiftX[0]+g.w*(item.sx||1)/2,topMax:gy+shiftY[1]-g.h*(item.sy||1)/2,bottomMin:gy+shiftY[0]+g.h*(item.sy||1)/2});
 }
 const bb=union(...bbs),bottomMin=(holdOnly?Math.max:Math.min)(...bbs.map(b=>b.bottomMin)),add=(owner,b)=>units.push({owner,kind:'attached',bounds:{x0:b.x0+item.x,x1:b.x1+item.x,y0:b.y0+item.y,y1:b.y1+item.y}}),z=item.size;
 if(!holdOnly&&cut.enter==='invertBox')add('center.invertBox',grow(J.itemBox(rest),z*.16));
 if(!holdOnly&&cut.exit==='tyStrike'){
  const lines=new Map();for(const g of lay){if(!g.ch.trim())continue;const b={x0:(g.x-g.w/2)*(item.sx||1),x1:(g.x+g.w/2)*(item.sx||1),y0:g.y*(item.sy||1),y1:g.y*(item.sy||1)};lines.set(g.li,lines.has(g.li)?union(lines.get(g.li),b):b);}
  const lw=Math.max(2.5,z*.07)/2;for(const [li,b]of lines)add('center.strike.'+li,{x0:b.x0-z*.1-lw,x1:b.x1+z*.1+lw,y0:b.y0+z*(item.sy||1)*.04-lw,y1:b.y1+z*(item.sy||1)*.04+lw});
 }
 if(cut.params.under){const lw=Math.max(2,z*.03)/2;add('center.under',{x0:bb.x0-lw,x1:bb.x1+lw,y0:bottomMin+z*.14-lw,y1:bb.y1+z*.14+lw});}
 if(cut.params.sub&&cut.lineText!==cut.text){const st={...(cut.effectStyle||plan.style),...(cut.fonts?{fonts:cut.fonts}:{})},sub={text:cut.lineText,font:st.fonts.body[0],size:J.clamp(plan.H*.026,16,34),x:0,y:0,track:.22},b=A.bounds(A.itemGeometry(sub,ID,{pass:'main',scale:1}).polygons);add('center.subtitle',{x0:b.x0,x1:b.x1,y0:bottomMin+plan.H*.07+b.y0,y1:bb.y1+plan.H*.07+b.y1});}
 const ranges=full=>({x0:[bb.x0+item.x,(full?Math.min:Math.max)(...bbs.map(b=>b.leftMax))+item.x],x1:[(full?Math.max:Math.min)(...bbs.map(b=>b.rightMin))+item.x,bb.x1+item.x],y0:[bb.y0+item.y,(full?Math.min:Math.max)(...bbs.map(b=>b.topMax))+item.y],y1:[(full?Math.max:Math.min)(...bbs.map(b=>b.bottomMin))+item.y,bb.y1+item.y]});
 return {units,glyphBB:{x0:bb.x0+item.x,x1:bb.x1+item.x,y0:bb.y0+item.y,y1:bb.y1+item.y},bbRanges:ranges(holdOnly),bbRangesAny:ranges(false),scope:holdOnly?'native-hold':'all-native-clocks'};
}
function envelope(item,cut,plan,local){
 if(!handles(cut))return local;
 const rest={...item,x:0,y:0,_m:null,_lay:null},lay=J.layoutText(rest),nominal=J.itemBox(rest),z=item.size;
 // The native word pivot lies inside the layout glyph-box hull. Its distance
 // to any glyph corner cannot exceed this hull's diameter. Bounding by the
 // full hull avoids duplicating the source word segmentation/cache.
 const boxes=lay.map(g=>{const x=(g.x+g.vx)*(item.sx||1),y=(g.y+g.vy)*(item.sy||1),w=g.w*(item.sx||1),h=g.h*(item.sy||1);return {x0:x-w/2,y0:y-h/2,x1:x+w/2,y1:y+h/2};});
 const layout=union(nominal,...boxes),ink=union(local.bounds,layout),angle=cut.hold==='knCounterRock'?4*(.4+((cut.effectFx||plan.fx).motion??.7))*J.DEG*(cut.motionScale??1):0;
 // The ink overhang is included in the radius as well as nominal glyph boxes.
 const diameter=Math.hypot(ink.x1-ink.x0,ink.y1-ink.y0),rock=2*diameter*Math.sin(angle/2);
 const glyphBB=grow(layout,rock);let main=grow(ink,rock);
 if(cut.enter==='invertBox')main=union(main,grow(nominal,z*.16));
 if(cut.exit==='tyStrike')main=union(main,grow(layout,z*.14+Math.max(2.5,z*.07)/2));
 let attached=main;
 if(cut.params.under)attached=union(attached,{x0:glyphBB.x0,y0:glyphBB.y0+z*.14-Math.max(2,z*.03)/2,x1:glyphBB.x1,y1:glyphBB.y1+z*.14+Math.max(2,z*.03)/2});
 if(cut.params.sub&&cut.lineText!==cut.text){
  const st={...(cut.effectStyle||plan.style),...(cut.fonts?{fonts:cut.fonts}:{})},size=J.clamp(plan.H*.026,16,34),sub={text:cut.lineText,font:st.fonts.body[0],size,x:0,y:0,track:.22},b=A.bounds(A.itemGeometry(sub,ID,{pass:'main',scale:1}).polygons);
  attached=union(attached,{x0:b.x0,y0:glyphBB.y0+plan.H*.07+b.y0,x1:b.x1,y1:glyphBB.y1+plan.H*.07+b.y1});
 }
 // All attached source ink, including subtitles, must remain readable in frame.
 // drawItem's returned bbox describes its glyph boxes only: attached plates,
 // strike lines, ink overhang and filter tails do not move native decorations.
 return {...local,bounds:attached,body:attached,centerMainBounds:glyphBB};
}
function stageBounds(local,item,plan,cut,bodyOnly=false){
 let b=bodyOnly?local.body:local.bounds;
 if(!local.centerMainBounds||!(cut.decor||[]).some(d=>d.id==='memphis'))return b;
 const W=plan.W,H=plan.H,u=Math.min(W,H)/1080,S=J.clamp(Math.min(W,H)*.036,24*u,44*u),m=local.centerMainBounds;
 // Native getBB clips incoming glyph boxes to [-.1,1.1] viewport. Bound the
 // complete possible perimeter, then its native viewport-clamped centers.
 const main={x0:Math.max(m.x0+item.x,-W*.1),x1:Math.min(m.x1+item.x,W*1.1),y0:Math.max(m.y0+item.y,-H*.1),y1:Math.min(m.y1+item.y,H*1.1)},fallback={x0:W*.35,x1:W*.65,y0:H*.4,y1:H*.6},clampX=x=>J.clamp(x,S*1.6,W-S*1.6),clampY=y=>J.clamp(y,S*1.6,H-S*1.6);
 // Every shape, at any rotation, fits this disk. outBack(q,2)<=1+32/243;
 // squiggle radius sqrt(1.3²+.28²) dominates triangles, dots and hatches.
 const radius=Math.max(Math.hypot(1.3,.28),.8*(1+32/243),Math.SQRT1_2+2.6*u/S*(1+32/243))*S+3.4*u/2+2;
 // A fresh/nonmonotonic source clock may have no visible glyph bbox yet.
 // Native getBB then uses centerBB, before it has a resting bbox to remember.
 const decor=[main,fallback].map(bb=>{const pad=34*u+(bb.y1-bb.y0)*.22;return {x0:clampX(bb.x0-pad)-radius-item.x,y0:clampY(bb.y0-pad)-radius-item.y,x1:clampX(bb.x1+pad)+radius-item.x,y1:clampY(bb.y1+pad)+radius-item.y};});
 return union(b,...decor);
}
function render(env,item){
 const P=env.cut.params,{W,H,sc}=env,bb=J.mainDraw(env,{...item,color:P.accent?sc.accent:sc.fg});
 if(bb&&P.sub&&env.cut.lineText!==env.cut.text)env.draw({text:env.cut.lineText,font:env.st.fonts.body[0],size:J.clamp(H*.026,16,34),x:item.x,y:bb.y1+H*.07,track:.22,color:sc.sub,alpha:J.E.outCubic(env.pIn),ghost:false});
 if(bb&&P.under){const e=J.E.outExpo(env.pIn*1.2-.2),o=J.E.inCubic(env.pOut);if(e>0&&o<1)env.line([[J.lerp(bb.x0,bb.x1,o),bb.y1+item.size*.14],[J.lerp(bb.x0,bb.x1,e),bb.y1+item.size*.14]],sc.accent,Math.max(2,item.size*.03),1);}
 return bb;
}
// An existing native viewport is itself a complete source-output certificate:
// drawCut (back decor, layout, front decor) executes inside this exact clip.
// Moving only its origin retains every internal coordinate, size and clock.
// The caller remains responsible for layout targeting and motion/post preflight.
const viewportHandles=cut=>!!cut.area&&!(cut.area.angle||0)&&[cut.area.x,cut.area.y,cut.area.w,cut.area.h].every(Number.isFinite)&&cut.area.x>=0&&cut.area.y>=0&&cut.area.w>0&&cut.area.h>0&&cut.area.x+cut.area.w<=1&&cut.area.y+cut.area.h<=1&&!cut.drawing&&!cut.effectsOnly;
function prepareViewport(plan,cut,{scale,region,previous,holdRange:providedHoldRange=null}){
 const S=A.simpleCircle,activeHold=providedHoldRange||S.centerHoldInterval?.(plan,cut)||null,a=cut.area,W=plan.W,H=plan.H,st=cut.effectStyle||plan.style,fx=cut.effectFx||plan.fx,cw=Math.round(W*scale),quarter=Math.max(1,Math.round(cw/4)),up=cw/quarter;
 // The hold-only path retains the native glow and uses a practical 4.5-sigma
 // support; faint bloom tails beyond that support are not certified.
 const bloomSigma=activeHold?4.5:6,bloom=((plan.style.glow??.6)*.5*(plan.fx.texture??.6)>.05||(plan.cuts||[]).some(c=>((c.effectStyle||plan.style).glow??.6)*.5*((c.effectFx||plan.fx).texture??.6)>.05))?bloomSigma*Math.max(2,Math.round(quarter/160))*up/scale:0,cameraBlur=cut.cam==='rackFocus'?6*(cut.camP?.b||6.5)*Math.min(1,J.clamp((fx.motion??.7)*1.25,0,1.25))*(cut.motionScale??1):0,rgb=(plan.events||[]).filter(e=>e.type==='rgbSplit').reduce((v,e)=>v+J.clamp(e.amp??1,.3,1.6),0),post=S.postMotion(plan,W,H,scale,cut,activeHold?.real),pad=bloom+cameraBlur+(2+2*up)/scale;
 const native={x0:a.x*W,y0:a.y*H,x1:(a.x+a.w)*W,y1:(a.y+a.h)*H};let local={bounds:native,body:native,renderScale:scale};
 let project=(_local,item,_plan,_cut,bodyOnly)=>{const x=bodyOnly?0:pad+W*.016*rgb+post.x,y=bodyOnly?0:pad+H*.004*rgb+post.y;return [[native.x0+item.x-x,native.y0+item.y-y],[native.x1+item.x+x,native.y0+item.y-y],[native.x1+item.x+x,native.y1+item.y+y],[native.x0+item.x-x,native.y1+item.y+y]];};
 let sourceItem=null,partSupports=null,holdWindow=activeHold;
 const sourceCut=J.lyricRenderCut?.({...cut,area:null})||{...cut,area:null},centerSource=handles(sourceCut)&&['push','panL','panR','dutch','dollyIn','beatPunch'].includes(cut.cam)&&(cut.decor||[]).every(d=>d.id==='memphis');
 if(centerSource){
  const sw=W*a.w,sh=H*a.h,sourceStyle={...st,...(cut.fonts?{fonts:cut.fonts}:{})},sourcePlan={...plan,W:sw,H:sh,style:sourceStyle},env={W:sw,H:sh,cut:sourceCut,plan:sourcePlan,st:sourceStyle,sc:cut.palette||sourceStyle.schemes[cut.scheme%sourceStyle.schemes.length]},item=J.basicMainItem(env);
  // Measure the exact native item in its original viewport, including its
  // original subtitle scale, attached rule and native Memphis coordinates.
  const ink=S.itemEnvelope(item,sourceCut,sourcePlan),absolute=body=>{const b=stageBounds(ink,item,sourcePlan,sourceCut,body);return {x0:b.x0+item.x,y0:b.y0+item.y,x1:b.x1+item.x,y1:b.y1+item.y};};
  holdWindow=activeHold;const holdOnly=!!holdWindow;
  sourceItem={unitSupport:sourceUnits(item,sourceCut,sourcePlan,{holdOnly})};
  local={bounds:absolute(false),body:absolute(true),renderScale:scale};
  project=A.nativeBlockCircle.viewportProject(plan,cut,scale,{allCutsBloom:true,allCutsChroma:true,activeRange:holdWindow?.real,bloomSigma});
  if(sourceItem.unitSupport&&A.memphisUnits){const units=sourceItem.unitSupport.units.slice(),cachedPartial=holdOnly&&sourceCut.exit==='cut'&&sourceCut.outDur>0;let complete=true;for(const d of cut.decor||[]){const parts=A.memphisUnits({W:sw,H:sh,P:d,bbRanges:[cachedPartial?sourceItem.unitSupport.bbRangesAny:sourceItem.unitSupport.bbRanges],includeFallback:!holdOnly||cachedPartial,random:J.r});if(!parts?.length){complete=false;break;}units.push(...parts);}if(complete)partSupports=units.map(u=>{const local={bounds:u.bounds,body:u.bounds,renderScale:scale};return {owner:u.owner,bounds:A.bounds([project(local,{x:0,y:0},plan,cut)]),body:A.bounds([project(local,{x:0,y:0},plan,cut,true)])};});}
 }
 if(!centerSource&&holdWindow&&['push','panL','panR','dutch','dollyIn','beatPunch'].includes(cut.cam)&&['pill','neon','magazine','type','condensed','vcols','ticket','labels','swissGrid'].includes(cut.layout)){
  const sw=W*a.w,sh=H*a.h,sourceStyle={...st,...(cut.fonts?{fonts:cut.fonts}:{})},sourcePlan={...plan,W:sw,H:sh,style:sourceStyle},sc=cut.palette||sourceStyle.schemes[cut.scheme%sourceStyle.schemes.length],args={W:sw,H:sh,cut:sourceCut,plan:sourcePlan,st:sourceStyle,sc,holdOnly:true,holdWindow};
  const parts=cut.layout==='pill'?A.pillUnits?.(args):['neon','magazine'].includes(cut.layout)?A.neonMagazineUnits?.(args):cut.layout==='vcols'?A.verticalUnits?.(args):['ticket','labels'].includes(cut.layout)?A.cardsUnits?.(args):cut.layout==='swissGrid'?A.gridUnits?.(args):A.basicUnits?.(args);
  if(parts?.units?.length){const box={x0:0,y0:0,x1:sw,y1:sh};local={bounds:box,body:box,renderScale:scale};project=A.nativeBlockCircle.viewportProject(plan,cut,scale,{allCutsBloom:true,allCutsChroma:true,activeRange:holdWindow.real,bloomSigma});partSupports=parts.units.map(u=>{const local={bounds:u.bounds,body:u.bounds,renderScale:scale};return {owner:u.owner,bounds:A.bounds([project(local,{x:0,y:0},plan,cut)]),body:A.bounds([project(local,{x:0,y:0},plan,cut,true)])};});}
 }
 const domain=S.domain(plan,{...cut,simpleCircleClip:true},region,project),candidates=[];
 for(const r of domain.regions){const placed=domain.place(local,r);if(placed)candidates.push({...placed,region:r,distance:Math.hypot(placed.offset[0]/W,placed.offset[1]/H)});}
 if(!candidates.length&&partSupports){
  const rectangle=b=>[[b.x0,b.y0],[b.x1,b.y0],[b.x1,b.y1],[b.x0,b.y1]],body=union(...partSupports.map(p=>p.body)),xmin=-body.x0,xmax=W-body.x1,ymin=-body.y0,ymax=H-body.y1,c=domain.circle,R=c.r+domain.pad;
  if(xmin<=xmax&&ymin<=ymax){
   const clampX=x=>J.clamp(x,xmin,xmax),clampY=y=>J.clamp(y,ymin,ymax),xs=[xmin,xmax,clampX(0),clampX(c.cx-(body.x0+body.x1)/2)],ys=[ymin,ymax,clampY(0),clampY(c.cy-(body.y0+body.y1)/2)],offsets=[];
   for(const x of xs)for(const y of ys)offsets.push([x,y]);
   // Merge owner branches only to schedule candidates. Acceptance retains each
   // primitive, so empty spaces between native objects remain empty.
   const owners=new Map();for(const p of partSupports)owners.set(p.owner,owners.has(p.owner)?union(owners.get(p.owner),p.bounds):p.bounds);
   for(const b of owners.values()){for(const x of [clampX(c.cx-R-b.x1-1e-5),clampX(c.cx+R-b.x0+1e-5)])for(const y of [ymin,ymax])offsets.push([x,y]);for(const y of [clampY(c.cy-R-b.y1-1e-5),clampY(c.cy+R-b.y0+1e-5)])for(const x of [xmin,xmax])offsets.push([x,y]);}
   for(const offset of new Map(offsets.map(o=>[o.join(','),o])).values()){
    const polygons=[];let safe=true;
    for(const p of partSupports){const b={x0:Math.max(0,p.bounds.x0+offset[0]),x1:Math.min(W,p.bounds.x1+offset[0]),y0:Math.max(0,p.bounds.y0+offset[1]),y1:Math.min(H,p.bounds.y1+offset[1])};if(b.x0>=b.x1||b.y0>=b.y1)continue;const polygon=rectangle(b);if(!A.clear([polygon],c,domain.pad)){safe=false;break;}polygons.push(polygon);}
    if(!safe||!polygons.length)continue;
    const dx=((body.x0+body.x1)/2+offset[0]-c.cx)/W,dy=((body.y0+body.y1)/2+offset[1]-c.cy)/H,direction=Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'up':'down',r=domain.regions.find(r=>r.direction===direction);
    candidates.push({offset,region:r,envelope:rectangle(A.bounds(polygons)),unitEnvelopes:polygons,distance:Math.hypot(offset[0]/W,offset[1]/H)});
   }
  }
 }
 const old=previous?.policy===S.policy?previous.diagnostics.find(d=>d.cut===cut.index&&d.status==='safe'):null;
 candidates.sort((a,b)=>b.region.score-a.region.score||a.distance-b.distance||Number(b.region.direction===old?.direction)-Number(a.region.direction===old?.direction));
 const win=candidates[0];if(!win)return {diagnostic:{cut:cut.index,status:'insufficient-space',reason:'NO_SAFE_NATIVE_VIEWPORT'}};
 return {area:{...a,x:a.x+win.offset[0]/W,y:a.y+win.offset[1]/H},recipe:{nativeIdentity:true,nativeViewportOffset:win.offset.slice(),...(holdWindow?{holdWindow}: {})},diagnostic:{cut:cut.index,status:'safe',safety:holdWindow?'safe-hold':'all-native-clocks',...(holdWindow?{holdWindow,bloomSigma,lightTailBeyondSupport:'not-certified'}:{}),method:win.unitEnvelopes?'translated-native-owned-units':centerSource?'translated-native-center-support':'translated-native-viewport',direction:win.region.direction,score:win.region.score,region:win.region,envelope:win.envelope,...(win.unitEnvelopes?{unitEnvelopes:win.unitEnvelopes}:{}),nativeSourcePreserved:true,sourceArea:{...a},offset:win.offset.slice(),allClockGeneration:false}};
}
A.centerCircle=Object.freeze({handles,envelope,stageBounds,render,viewportHandles,prepareViewport,sourceUnits});
})();
