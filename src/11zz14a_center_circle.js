/* Center composition: retain native attached ink and bound every source clock. */
(() => {
'use strict';
const A=J.placement,ID=[1,0,0,1,0,0];
const union=(...bs)=>({x0:Math.min(...bs.map(b=>b.x0)),y0:Math.min(...bs.map(b=>b.y0)),x1:Math.max(...bs.map(b=>b.x1)),y1:Math.max(...bs.map(b=>b.y1))});
const grow=(b,p)=>({x0:b.x0-p,y0:b.y0-p,x1:b.x1+p,y1:b.y1+p});
const handles=cut=>cut.layout==='center'&&!cut.area&&['cut','flicker','invertBox'].includes(cut.enter)&&['cut','tyStrike'].includes(cut.exit)&&['still','knCounterRock'].includes(cut.hold)&&['none','hardShadow'].includes(cut.treat||'none');
// Ruby entrance has no remaining operation once pIn reaches one. ScanBand
// is certified only in the native hold, including its independent accent bar.
const holdHandles=cut=>cut.layout==='center'&&!cut.area&&['cut','flicker','invertBox','tyRubyDrop'].includes(cut.enter)&&['cut','tyStrike'].includes(cut.exit)&&['still','knCounterRock','scanBand'].includes(cut.hold)&&(cut.treat||'none')==='none';
const trigRange=(a,b,lo,hi)=>{const values=[a*Math.cos(lo)+b*Math.sin(lo),a*Math.cos(hi)+b*Math.sin(hi)],root=Math.atan2(b,a);for(let k=-2;k<=2;k++){const t=root+k*Math.PI;if(t>=lo&&t<=hi)values.push(a*Math.cos(t)+b*Math.sin(t));}return [Math.min(...values),Math.max(...values)];};
function sourceUnits(item,cut,plan,{holdOnly=false}={}){
 if(!(handles(cut)||holdOnly&&holdHandles(cut))||(cut.treat||'none')!=='none'||(cut.hold==='scanBand'||cut.enter==='tyRubyDrop')&&(!holdOnly||item.vertical||item.rot||item.skew))return null;
 const rest={...item,x:0,y:0,_m:null,_lay:null,charFns:[]},lay=J.layoutText(rest),geometry=A.itemGeometry(rest,ID,{pass:'main',scale:1}),m=cut.motionScale??1,ruby=cut.enter==='tyRubyDrop',rubyScale=ruby?1-.68*m:1,units=[],bbs=[];
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
  // A lagged A/B pass may still be in RubyDrop at the main hold boundary.
  // Include its full .32..1 scale sweep and unrotated upward .8-height
  // displacement; hidden glyphs also require any-subset attached/decor bb.
  const points=[...ink.polygon,...(ruby?ink.polygon.map(([x,y])=>[gx+(x-gx)*rubyScale,gy+(y-gy)*rubyScale]):[]),...(!holdOnly&&cut.exit==='tyStrike'?ink.polygon.map(([x])=>[x,gy]):[]),[gx,gy]],bounds=[];
  for(const [x,y]of points){
   if(m===1){const xRange=trigRange(x-px,-(y-py),-angle,angle),yRange=trigRange(y-py,x-px,-angle,angle);bounds.push({x0:px+xRange[0],x1:px+xRange[1],y0:py+yRange[0],y1:py+yRange[1]});}
   else{const xRange=trigRange(x-gx,-(y-gy),-angle*m,angle*m),yRange=trigRange(y-gy,x-gx,-angle*m,angle*m);bounds.push({x0:gx+shiftX[0]+xRange[0],x1:gx+shiftX[1]+xRange[1],y0:gy+shiftY[0]+yRange[0],y1:gy+shiftY[1]+yRange[1]});}
  }
  // Native bands translate only the intersecting stripe. Across the scan's
  // phase either sign is reachable. motionScale does not damp bands/post.
  const b=union(...bounds),scan=cut.hold==='scanBand'?item.size*.075*J.clamp(((cut.effectFx||plan.fx).motion??.7)/.7,0,1.6):0;units.push({owner:'center.glyph.'+g.i,kind:'glyph',bounds:{x0:b.x0+item.x-scan,x1:b.x1+item.x+scan,y0:b.y0+item.y-(ruby?g.h*(item.sy||1)*.8*m:0),y1:b.y1+item.y}});
  // Native returned glyph bb ignores character rotation and strike sy shrink.
  bbs.push({x0:gx+shiftX[0]-g.w*(item.sx||1)/2,x1:gx+shiftX[1]+g.w*(item.sx||1)/2,y0:gy+shiftY[0]-g.h*(item.sy||1)/2-(ruby?g.h*(item.sy||1)*.8*m:0),y1:gy+shiftY[1]+g.h*(item.sy||1)/2,leftMax:gx+shiftX[1]-g.w*(item.sx||1)*rubyScale/2,rightMin:gx+shiftX[0]+g.w*(item.sx||1)*rubyScale/2,topMax:gy+shiftY[1]-g.h*(item.sy||1)*rubyScale/2,bottomMin:gy+shiftY[0]+g.h*(item.sy||1)*rubyScale/2-(ruby?g.h*(item.sy||1)*.8*m:0)});
 }
 const bb=union(...bbs),bottomMin=(holdOnly&&!ruby?Math.max:Math.min)(...bbs.map(b=>b.bottomMin)),add=(owner,b)=>units.push({owner,kind:'attached',bounds:{x0:b.x0+item.x,x1:b.x1+item.x,y0:b.y0+item.y,y1:b.y1+item.y}}),z=item.size;
 if(cut.hold==='scanBand'){
  const b=grow(J.itemBox(rest),z*.1),h=b.y1-b.y0,bh=Math.max(z*.24,h*.12),lw=Math.max(1,z*.012);
  // v in [0,1): y+bh sweeps from bb.y0 to bb.y1+bh. Native
  // drawFx returns an unshifted glyph bbox, so decor ranges stay unchanged.
  add('center.scanBand',{x0:b.x0,x1:b.x1,y0:b.y0-lw,y1:b.y1+bh});
 }
 if(!holdOnly&&cut.enter==='invertBox')add('center.invertBox',grow(J.itemBox(rest),z*.16));
 if(!holdOnly&&cut.exit==='tyStrike'){
  const lines=new Map();for(const g of lay){if(!g.ch.trim())continue;const b={x0:(g.x-g.w/2)*(item.sx||1),x1:(g.x+g.w/2)*(item.sx||1),y0:g.y*(item.sy||1),y1:g.y*(item.sy||1)};lines.set(g.li,lines.has(g.li)?union(lines.get(g.li),b):b);}
  const lw=Math.max(2.5,z*.07)/2;for(const [li,b]of lines)add('center.strike.'+li,{x0:b.x0-z*.1-lw,x1:b.x1+z*.1+lw,y0:b.y0+z*(item.sy||1)*.04-lw,y1:b.y1+z*(item.sy||1)*.04+lw});
 }
 if(cut.params.under){const lw=Math.max(2,z*.03)/2;add('center.under',{x0:bb.x0-lw,x1:bb.x1+lw,y0:bottomMin+z*.14-lw,y1:bb.y1+z*.14+lw});}
 if(cut.params.sub&&cut.lineText!==cut.text){const st={...(cut.effectStyle||plan.style),...(cut.fonts?{fonts:cut.fonts}:{})},sub={text:cut.lineText,font:st.fonts.body[0],size:J.clamp(plan.H*.026,16,34),x:0,y:0,track:.22},b=A.bounds(A.itemGeometry(sub,ID,{pass:'main',scale:1}).polygons);add('center.subtitle',{x0:b.x0,x1:b.x1,y0:bottomMin+plan.H*.07+b.y0,y1:bb.y1+plan.H*.07+b.y1});}
 const ranges=full=>({x0:[bb.x0+item.x,(full?Math.min:Math.max)(...bbs.map(b=>b.leftMax))+item.x],x1:[(full?Math.max:Math.min)(...bbs.map(b=>b.rightMin))+item.x,bb.x1+item.x],y0:[bb.y0+item.y,(full?Math.min:Math.max)(...bbs.map(b=>b.topMax))+item.y],y1:[(full?Math.max:Math.min)(...bbs.map(b=>b.bottomMin))+item.y,bb.y1+item.y]});
 return {units,glyphBB:{x0:bb.x0+item.x,x1:bb.x1+item.x,y0:bb.y0+item.y,y1:bb.y1+item.y},bbRanges:ranges(holdOnly&&!ruby),bbRangesAny:ranges(false),scope:holdOnly?'native-hold':'all-native-clocks'};
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
 const P=env.cut.params,{W,sc}=env,H=env.cut.simpleCircleRecipe?.centerNativeDims?.H??env.H,bb=J.mainDraw(env,{...item,color:P.accent?sc.accent:sc.fg});
 if(bb&&P.sub&&env.cut.lineText!==env.cut.text)env.draw({text:env.cut.lineText,font:env.st.fonts.body[0],size:J.clamp(H*.026,16,34),x:item.x,y:bb.y1+H*.07,track:.22,color:sc.sub,alpha:J.E.outCubic(env.pIn),ghost:false});
 if(bb&&P.under){const e=J.E.outExpo(env.pIn*1.2-.2),o=J.E.inCubic(env.pOut);if(e>0&&o<1)env.line([[J.lerp(bb.x0,bb.x1,o),bb.y1+item.size*.14],[J.lerp(bb.x0,bb.x1,e),bb.y1+item.size*.14]],sc.accent,Math.max(2,item.size*.03),1);}
 return bb;
}
// An existing native viewport is itself a complete source-output certificate:
// drawCut (back decor, layout, front decor) executes inside this exact clip.
// Moving only its origin retains every internal coordinate, size and clock.
// The caller remains responsible for layout targeting and motion/post preflight.
const viewportHandles=cut=>!!cut.area&&!(cut.area.angle||0)&&[cut.area.x,cut.area.y,cut.area.w,cut.area.h].every(Number.isFinite)&&cut.area.x>=0&&cut.area.y>=0&&cut.area.w>0&&cut.area.h>0&&cut.area.x+cut.area.w<=1&&cut.area.y+cut.area.h<=1&&!cut.drawing&&!cut.effectsOnly;
// mixed calls mainDraw once per character. Its returned bbox is the union of
// characters whose stagger has started and which tyStrike has not hidden.
// Keep each reachable set as a separate getBB input: combining edge ranges
// from different sets invents boxes that never existed. During exit BBC
// may contain any previously sought set, including on a backwards seek.
function mixedVisibilityRanges(delays,start,end,out,hidden){
 const times=[...new Set([start,end,out,...hidden,...delays].filter(t=>t>=start&&t<=end).sort((a,b)=>a-b))],sets=[],keys=new Set();let fallback=false;
 function add(indices){if(!indices.length)return;const key=indices.join(',');if(!keys.has(key)){keys.add(key);sets.push(indices);}}
 const liveAt=t=>delays.map((d,j)=>d<=t&&t<hidden[j]?j:-1).filter(j=>j>=0);
 for(let i=0;i<times.length;i++){const at=liveAt(times[i]);add(at);if(!at.length)fallback=true;if(i+1<times.length){const live=liveAt((times[i]+times[i+1])/2);add(live);if(!live.length)fallback=true;}}
 // A direct seek can populate BBC at any earlier or later source time and
 // then seek back into exit. Include event boundaries as well as intervals.
 let cacheEventCount=0;if(end>out){const all=[...new Set([0,...delays,...hidden].sort((a,b)=>a-b))];cacheEventCount=all.length;for(let i=0;i<all.length;i++){add(liveAt(all[i]));if(i+1<all.length)add(liveAt((all[i]+all[i+1])/2));}}
 return {times,sets,fallback,cacheEventCount};
}
function scatterSourceItems({W,H,cut,st}){
 const chars=[...cut.text.replace(/\s+/g,'')],n=chars.length,p=cut.params,s=cut.seed,base=Math.min(H*.3,W*.9/n*1.15),items=chars.map((text,i)=>({text,font:i%3===1?p.fontB:p.font,size:base*(.62+J.r(s,i,73)*.85*(J.isKanji(text)?1:.7)),x:W*(.1+.8*(i+.5)/n)+J.rs(s,i,71)*W*.035,y:H/2+J.rs(s,i,72)*H*.18,rot:J.rs(s,i,74)*24,mi:i})),extras=[];
 if(p.extras)for(let k=0;k<9;k++){const top=J.r(s,k,82)<.5;extras.push({text:cut.text,font:st.fonts.body[0],size:J.rr(H*.022,H*.045,s,k,83),x:J.rr(W*.08,W*.92,s,k,84),y:top?J.rr(H*.08,H*.26,s,k,85):J.rr(H*.74,H*.92,s,k,85),rot:J.rs(s,k,86)*18,appear:J.r(s,k,81)*cut.dur*.5});}
 return {items,extras};
}
function mixedHoldUnits({W,H,cut,plan,st,holdWindow}){
 if(!['mixed','scatter'].includes(cut.layout)||cut.enter!=='invertBox'||cut.exit!=='tyStrike'||cut.hold!=='knCounterRock'||(cut.treat||'none')!=='none'||!(cut.decor||[]).every(d=>d.id==='memphis')||!Number.isFinite(cut.stagger||0)||(cut.stagger||0)<0||/[\p{Extended_Pictographic}\u200d\ufe0f]/u.test(cut.text))return null;
 const env={W,H,cut,plan,st,sc:cut.palette||st.schemes[cut.scheme%st.schemes.length]},scatter=cut.layout==='scatter'?scatterSourceItems({W,H,cut,st}):null,items=scatter?scatter.items:A.nativeBlockCircle.geometry(env).items,source={...cut,layout:'center',area:null,params:{}},parts=[];
 if(items.length<2||items.length>(cut.layout==='mixed'?16:14))return null; // native layout admission bounds
 for(const item of items){
  const part=sourceUnits(item,source,plan,{holdOnly:false});if(!part)return null;
  // sourceUnits' center path assumes an unrotated main item. mixed has a
  // native per-item rotation, so bound its complete paint in item space and
  // rotate the box once. Keep mixed's existing conservative plate/line bound.
  // invertBox's plate exists only while this item is entering, and tyStrike's
  // line only while it exits. The scatter hold model must not require either
  // entry/exit-only paint to avoid the circle during its own relaxed phase.
  const local=A.simpleCircle.itemEnvelope(item,cut),native=J.itemBox({...item,x:0,y:0,rot:0}),raw=union(local.bounds,cut.layout==='scatter'?native:grow(native,item.size*.3)),rock=2*Math.hypot(raw.x1-raw.x0,raw.y1-raw.y0)*Math.sin(Math.min(Math.PI,4*(.4+((cut.effectFx||plan.fx).motion??.7))*J.DEG)/2),b=grow(raw,rock),angle=(item.rot||0)*J.DEG,cs=Math.cos(angle),sn=Math.sin(angle),points=[[b.x0,b.y0],[b.x1,b.y0],[b.x1,b.y1],[b.x0,b.y1]].map(([x,y])=>[item.x+x*cs-y*sn,item.y+x*sn+y*cs]);
  part.units=[{owner:cut.layout+'.item.'+item.mi,kind:'primary',bounds:A.bounds([points])}];parts.push(part);
 }
 if(!parts.length)return null;
 const start=holdWindow.real.start-cut.start,end=holdWindow.real.end-cut.start,out=cut.dur-cut.outDur,n=Math.max(1,J.glyphCount(cut.text)),alphaEnd=Math.pow(.998,1/6),hidden=items.map(it=>out+(.3+.3*(n>1?J.clamp((+it.mi||0)/(n-1)):0)+.4*alphaEnd)*cut.outDur),delays=items.map(it=>(it.mi|0)*(cut.stagger||0)),guard=1e-7*Math.max(1,Math.abs(out),Math.abs(cut.outDur));
 // drawItem drops bbox as soon as alpha <= .002, before tyStrike's HIDE.
 // Bound floating-point threshold uncertainty on both sides. Distinct exit
 // windows must not overlap, so those two alternatives cover each event.
 if(!(cut.outDur>0)||hidden.some((h,i)=>i&&h-hidden[i-1]<=2*guard))return null;
 const early=mixedVisibilityRanges(delays,start,end,out,hidden.map(h=>h-guard)),late=mixedVisibilityRanges(delays,start,end,out,hidden.map(h=>h+guard)),seen=new Set(),sets=[...early.sets,...late.sets].filter(v=>{const k=v.join(',');if(seen.has(k))return false;seen.add(k);return true;}),visibility={sets,fallback:early.fallback||late.fallback,times:early.times,cacheEventCount:early.cacheEventCount},ranges=[],units=parts.flatMap((part,i)=>part.units.map(u=>({...u,owner:cut.layout+'.'+i+'.'+u.owner})));
 // Extras use env.draw, never enter the returned main bbox, and are not ghosted.
 // Retain every native extra, even if it has not appeared at the hold start.
 if(scatter)for(let k=0;k<scatter.extras.length;k++){
  const item=scatter.extras[k];
  for(const glyph of A.itemGeometry(item,ID,{pass:'main',scale:1}).glyphs)units.push({owner:'scatter.extra.'+k+'.'+glyph.index,kind:'extra',ghost:false,bounds:A.bounds([glyph.polygon])});
 }
 for(const indices of visibility.sets){const bb=indices.map(i=>parts[i].bbRangesAny),r={};for(const k of ['x0','y0'])r[k]=[Math.min(...bb.map(b=>b[k][0])),Math.min(...bb.map(b=>b[k][1]))];for(const k of ['x1','y1'])r[k]=[Math.max(...bb.map(b=>b[k][0])),Math.max(...bb.map(b=>b[k][1]))];ranges.push(r);}
 for(const d of cut.decor||[]){const more=A.memphisUnits?.({W,H,P:d,cut,st,bbRanges:ranges,includeFallback:visibility.fallback});if(!more?.length)return null;units.push(...more);}
 return {units,eventCount:visibility.times.length,cacheEventCount:visibility.cacheEventCount,rangeCount:ranges.length,scope:cut.layout+'-hold-reachable-sets'};
}
function prepareViewport(plan,cut,{scale,region,previous,holdRange:providedHoldRange=null,reflowItem=null,nativeDims=null}){
 const S=A.simpleCircle,activeHold=providedHoldRange||S.centerHoldInterval?.(plan,cut)||null,a=cut.area,W=plan.W,H=plan.H,st=cut.effectStyle||plan.style,fx=cut.effectFx||plan.fx,cw=Math.round(W*scale),quarter=Math.max(1,Math.round(cw/4)),up=cw/quarter;
 // The hold-only path retains the native glow and uses a practical 4.5-sigma
 // support; faint bloom tails beyond that support are not certified.
 const bloomSigma=activeHold?4.5:6,bloom=((plan.style.glow??.6)*.5*(plan.fx.texture??.6)>.05||(plan.cuts||[]).some(c=>((c.effectStyle||plan.style).glow??.6)*.5*((c.effectFx||plan.fx).texture??.6)>.05))?bloomSigma*Math.max(2,Math.round(quarter/160))*up/scale:0,cameraBlur=cut.cam==='rackFocus'?6*(cut.camP?.b||6.5)*Math.min(1,J.clamp((fx.motion??.7)*1.25,0,1.25))*(cut.motionScale??1):0,rgb=(plan.events||[]).filter(e=>e.type==='rgbSplit').reduce((v,e)=>v+J.clamp(e.amp??1,.3,1.6),0),post=S.postMotion(plan,W,H,scale,cut,activeHold?.real),pad=bloom+cameraBlur+(2+2*up)/scale;
 const native={x0:a.x*W,y0:a.y*H,x1:(a.x+a.w)*W,y1:(a.y+a.h)*H};let local={bounds:native,body:native,renderScale:scale};
 let project=(_local,item,_plan,_cut,bodyOnly)=>{const x=bodyOnly?0:pad+W*.016*rgb+post.x,y=bodyOnly?0:pad+H*.004*rgb+post.y;return [[native.x0+item.x-x,native.y0+item.y-y],[native.x1+item.x+x,native.y0+item.y-y],[native.x1+item.x+x,native.y1+item.y+y],[native.x0+item.x-x,native.y1+item.y+y]];};
 let sourceItem=null,partSupports=null,holdWindow=activeHold,usedJellyUnits=false,supportInfo=null;
 const roleSeparated=['marquee','tile'].includes(cut.layout);
 // Bubble motes are an independent background. The whole viewport may only
 // remain unchanged until a role-separated move is available.
 if(cut.layout==='bubbles'&&cut.params.motes){const unchanged=S.nativeViewportIdentity(plan,cut,scale,region,previous);return unchanged?{area:{...a},...unchanged}:{diagnostic:{cut:cut.index,status:'unsupported',reason:'UNSUPPORTED_INDEPENDENT_MOTES'}};}
 const sourceCut=J.lyricRenderCut?.({...cut,area:null})||{...cut,area:null},jellyClock=cut.cam==='jelly'&&activeHold&&activeHold.native.start-activeHold.step-1.6/24>=cut.start,jellyHold=jellyClock&&holdHandles(sourceCut),centerSource=(handles(sourceCut)||activeHold&&holdHandles(sourceCut))&&(['push','panL','panR','dutch','dollyIn','beatPunch'].includes(cut.cam)||jellyHold)&&(cut.decor||[]).every(d=>d.id==='memphis'||activeHold&&d.id==='starburst');
 if(centerSource){
  const sw=W*a.w,sh=H*a.h,sourceStyle={...st,...(cut.fonts?{fonts:cut.fonts}:{})},sourcePlan={...plan,W:nativeDims?.W??sw,H:nativeDims?.H??sh,style:sourceStyle},env={W:sw,H:sh,cut:sourceCut,plan:sourcePlan,st:sourceStyle,sc:cut.palette||sourceStyle.schemes[cut.scheme%sourceStyle.schemes.length]},item=reflowItem||J.basicMainItem(env);
  // Measure the exact native item in its original viewport, including its
  // original subtitle scale, attached rule and native Memphis coordinates.
  holdWindow=activeHold;const holdOnly=!!holdWindow;
  sourceItem={unitSupport:jellyHold&&(item.shadow||item.blur||item.extrude)?null:sourceUnits(item,sourceCut,sourcePlan,{holdOnly})};
  if(!handles(sourceCut)){
   // Hold-only additions must not pass through the older all-clock envelope.
   // Keep the complete native clip for the coarse candidate; the owned-unit
   // candidate below also requires every retained native decoration.
   const b={x0:0,y0:0,x1:sw,y1:sh};
   local={bounds:b,body:b,renderScale:scale};
  }else{
   const ink=S.itemEnvelope(item,sourceCut,sourcePlan),absolute=body=>{const b=stageBounds(ink,item,sourcePlan,sourceCut,body);return {x0:b.x0+item.x,y0:b.y0+item.y,x1:b.x1+item.x,y1:b.y1+item.y};};
   local={bounds:absolute(false),body:absolute(true),renderScale:scale};
  }
  project=A.nativeBlockCircle.viewportProject(plan,cut,scale,{allCutsBloom:true,allCutsChroma:true,activeRange:holdWindow?.real,bloomSigma,jellyHoldOnly:!!jellyHold});
  if(reflowItem){
   // Reflow must not create new clip loss in primary source ink. Unlike
   // decoration, these units represent the legible text, rule and subtitle.
   if(!sourceItem.unitSupport||item.shadow||item.blur||item.extrude)return {diagnostic:{cut:cut.index,status:'insufficient-space',reason:'UNMEASURED_REFLOW_INK'}};
   const preClip=A.nativeBlockCircle.viewportProject(plan,cut,scale,{allCutsChroma:true,activeRange:holdWindow.real,jellyHoldOnly:!!jellyHold,preClip:true});
   for(const u of sourceItem.unitSupport.units){const local={bounds:u.bounds,body:u.bounds,renderScale:scale,ghost:u.ghost},b=A.bounds([preClip(local,{x:0,y:0},plan,cut)]);if(b.x0<native.x0||b.y0<native.y0||b.x1>native.x1||b.y1>native.y1)return {diagnostic:{cut:cut.index,status:'insufficient-space',reason:'REFLOW_CLIPS_PRIMARY_INK'}};}
  }
  if(sourceItem.unitSupport){
   const units=sourceItem.unitSupport.units.slice(),shiftX=nativeDims?(sw-nativeDims.W)/2:0,shiftY=nativeDims?(sh-nativeDims.H)/2:0,cachedPartial=holdOnly&&(sourceCut.enter==='tyRubyDrop'||sourceCut.exit==='cut'&&sourceCut.outDur>0),baseRanges=cachedPartial?sourceItem.unitSupport.bbRangesAny:sourceItem.unitSupport.bbRanges,bbRanges=[Object.fromEntries(Object.entries(baseRanges).map(([k,v])=>[k,v.map(x=>x-(k[0]==='x'?shiftX:shiftY))]))];
   const preClip=A.nativeBlockCircle.viewportProject(plan,cut,scale,{allCutsChroma:true,activeRange:holdWindow?.real,jellyHoldOnly:!!jellyHold,preClip:true}),intersects=(b,clip)=>b.x0<clip.x1&&b.x1>clip.x0&&b.y0<clip.y1&&b.y1>clip.y0,box=(u,projector)=>{const local={bounds:u.bounds,body:u.bounds,renderScale:scale,ghost:u.ghost};return A.bounds([projector(local,{x:0,y:0},plan,cut)]);};
   let original=null,originalProject=null,originalClip=null,complete=true;
   if(nativeDims&&(cut.decor||[]).length){
    const oldArea=cut.simpleCircleSourceArea,oldCut={...cut,area:oldArea},oldItem=J.basicMainItem({W:nativeDims.W,H:nativeDims.H,cut:sourceCut,sc:env.sc});
    original=sourceUnits(oldItem,sourceCut,sourcePlan,{holdOnly});
    if(!original||!oldArea)complete=false;
    else{originalProject=A.nativeBlockCircle.viewportProject(plan,oldCut,scale,{allCutsChroma:true,activeRange:holdWindow.real,jellyHoldOnly:!!jellyHold,preClip:true});originalClip={x0:oldArea.x*W,y0:oldArea.y*H,x1:(oldArea.x+oldArea.w)*W,y1:(oldArea.y+oldArea.h)*H};}
   }
   for(const d of cut.decor||[]){
    if(!complete)break;
    const make=(ranges)=>{const args={W:nativeDims?.W??sw,H:nativeDims?.H??sh,P:d,cut:sourceCut,st:sourceStyle,bbRanges:[ranges],includeFallback:!holdOnly||cachedPartial,random:J.r};return d.id==='memphis'?A.memphisUnits?.(args):A.starburstUnits?.(args);},parts=make(bbRanges[0]);
    if(!parts?.length){complete=false;break;}
    const shifted=parts.map(u=>({...u,bounds:{x0:u.bounds.x0+shiftX,x1:u.bounds.x1+shiftX,y0:u.bounds.y0+shiftY,y1:u.bounds.y1+shiftY}}));
    if(nativeDims){
     const oldParts=make(cachedPartial?original.bbRangesAny:original.bbRanges);if(!oldParts?.length){complete=false;break;}
     const oldMayAppear=oldParts.some(u=>intersects(box(u,originalProject),originalClip)),newMayAppear=shifted.some(u=>intersects(box(u,preClip),native));
     if(oldMayAppear&&!newMayAppear){complete=false;break;}
    }
    units.push(...shifted);
   }
   if(complete)partSupports=units.filter(u=>!nativeDims||intersects(box(u,preClip),native)).map(u=>{const local={bounds:u.bounds,body:u.bounds,renderScale:scale,ghost:u.ghost},bounds=A.bounds([project(local,{x:0,y:0},plan,cut)]),rawBody=A.bounds([preClip(local,{x:0,y:0},plan,cut,true)]),body=nativeDims&&!intersects(rawBody,native)?bounds:A.bounds([project(local,{x:0,y:0},plan,cut,true)]);return {owner:u.owner,bounds,body};});
  }
 }
 if(!centerSource&&holdWindow&&(['push','panL','panR','dutch','dollyIn','beatPunch'].includes(cut.cam)||jellyClock&&['pill','neon','magazine','vcols','ticket','labels','swissGrid'].includes(cut.layout))&&['mixed','scatter','pill','neon','magazine','type','condensed','stack','marquee','tile','headlineDeck','dictionary','contents','footnote','proofread','poster','numbered','vcols','ticket','labels','swissGrid','lowerThird','frameBox','quote','ruler','tyMargin','tyBaseline','tyJustify','tyRuby','tyIndexTable','tySquare','tyLineFocus','tyVRuler','tyFullTrack','tyStatCount','tyScaleSteps','corners','staircase','zigzag','gridCells','genkou','typeSpecimen','kanjiFocus','searchBar','notification','chat'].includes(cut.layout)){
  const sw=W*a.w,sh=H*a.h,sourceStyle={...st,...(cut.fonts?{fonts:cut.fonts}:{})},sourcePlan={...plan,W:nativeDims?.W??sw,H:nativeDims?.H??sh,style:sourceStyle},sc=cut.palette||sourceStyle.schemes[cut.scheme%sourceStyle.schemes.length],args={W:sw,H:sh,cut:sourceCut,plan:sourcePlan,st:sourceStyle,sc,holdOnly:true,holdWindow};
  const parts=['mixed','scatter'].includes(cut.layout)?mixedHoldUnits(args):cut.layout==='pill'?A.pillUnits?.(args):['neon','magazine'].includes(cut.layout)?A.neonMagazineUnits?.(args):cut.layout==='vcols'?A.verticalUnits?.(args):['ticket','labels'].includes(cut.layout)?A.cardsUnits?.(args):cut.layout==='swissGrid'?A.gridUnits?.(args):cut.layout==='stack'?A.stackUnits?.(args):cut.layout==='lowerThird'?A.lowerThirdUnits?.(args):['frameBox','quote','ruler'].includes(cut.layout)?A.framedUnits?.(args):['tyMargin','tyBaseline','tyJustify','tyRuby','tyIndexTable','tySquare','tyLineFocus','tyVRuler','tyFullTrack','tyStatCount','tyScaleSteps'].includes(cut.layout)?A.typoStaticUnits?.(args):['corners','staircase','zigzag','gridCells','genkou'].includes(cut.layout)?A.multirowUnits?.(args):['typeSpecimen','kanjiFocus'].includes(cut.layout)?A.bSpecimenFocusUnits?.(args):['searchBar','notification','chat'].includes(cut.layout)?A.uiUnits?.(args):roleSeparated?A.repeatedUnits?.(args):['headlineDeck','dictionary','contents','footnote','proofread','poster','numbered'].includes(cut.layout)?A.editorialUnits?.(args):A.basicUnits?.(args);
  if(parts?.units?.length){if(['mixed-hold-reachable-sets','scatter-hold-reachable-sets'].includes(parts.scope))supportInfo={scope:parts.scope,eventCount:parts.eventCount,cacheEventCount:parts.cacheEventCount,rangeCount:parts.rangeCount,unitCount:parts.units.length};const box={x0:0,y0:0,x1:sw,y1:sh};local={bounds:box,body:box,renderScale:scale};usedJellyUnits=!!jellyClock;project=A.nativeBlockCircle.viewportProject(plan,cut,scale,{allCutsBloom:true,allCutsChroma:true,activeRange:holdWindow.real,bloomSigma,jellyHoldOnly:usedJellyUnits});partSupports=parts.units.map(u=>{const local={bounds:u.bounds,body:u.bounds,renderScale:scale,ghost:u.ghost};return {owner:u.owner,bounds:A.bounds([project(local,{x:0,y:0},plan,cut)]),body:A.bounds([project(local,{x:0,y:0},plan,cut,true)])};});}
 }
 // The nativeIdentity viewport would also move tiledAux; never use it here.
 if(roleSeparated&&!partSupports){const unchanged=S.nativeViewportIdentity(plan,cut,scale,region,previous);return unchanged?{area:{...a},...unchanged}:{diagnostic:{cut:cut.index,status:'unsupported',reason:'UNSUPPORTED_ROLE_SEPARATED_UNITS'}};}
 const domain=S.domain(plan,{...cut,simpleCircleClip:true},region,project),candidates=[];
 if(!reflowItem&&!jellyHold&&!usedJellyUnits&&!(partSupports&&!centerSource)&&!(centerSource&&(cut.decor||[]).some(d=>d.id==='starburst')))for(const r of domain.regions){const placed=domain.place(local,r);if(placed)candidates.push({...placed,region:r,distance:Math.hypot(placed.offset[0]/W,placed.offset[1]/H)});}
 if(!candidates.length&&partSupports){
  const rectangle=b=>[[b.x0,b.y0],[b.x1,b.y0],[b.x1,b.y1],[b.x0,b.y1]],body=union(...partSupports.map(p=>p.body)),xmin=-body.x0,xmax=W-body.x1,ymin=-body.y0,ymax=H-body.y1,c=domain.circle,R=c.r+domain.pad;
  if(xmin<=xmax&&ymin<=ymax){
   const clampX=x=>J.clamp(x,xmin,xmax),clampY=y=>J.clamp(y,ymin,ymax),xs=[xmin,xmax,clampX(0),clampX(c.cx-(body.x0+body.x1)/2)],ys=[ymin,ymax,clampY(0),clampY(c.cy-(body.y0+body.y1)/2)],offsets=[];
   for(const x of xs)for(const y of ys)offsets.push([x,y]);
   // Merge owner branches only to schedule candidates. Acceptance retains each
   // primitive, so empty spaces between native objects remain empty.
   const owners=new Map();for(const p of partSupports)owners.set(p.owner,owners.has(p.owner)?union(owners.get(p.owner),p.bounds):p.bounds);
   // Include side-tangent placements at the natural/centered coordinates.
   // Existing endpoint-only pairs can miss clear placements in the middle.
   if(cut.layout==='center'){
    const all=union(...partSupports.map(p=>p.bounds));
    for(const b of [...owners.values(),all]){
     for(const x of xs)for(const y of [clampY(c.cy-R-b.y1-1e-5),clampY(c.cy+R-b.y0+1e-5)])offsets.push([x,y]);
     for(const y of ys)for(const x of [clampX(c.cx-R-b.x1-1e-5),clampX(c.cx+R-b.x0+1e-5)])offsets.push([x,y]);
    }
   }
   for(const b of owners.values()){
    for(const x of [clampX(c.cx-R-b.x1-1e-5),clampX(c.cx+R-b.x0+1e-5)])for(const y of [ymin,ymax])offsets.push([x,y]);
    for(const y of [clampY(c.cy-R-b.y1-1e-5),clampY(c.cy+R-b.y0+1e-5)])for(const x of [xmin,xmax])offsets.push([x,y]);
    // A rectangle can also clear the circle at a diagonal corner. These are
    // candidate positions only; every owner is still checked by A.clear.
    for(const sx of [-1,1])for(const sy of [-1,1])offsets.push([clampX(c.cx+sx*(R+1e-5)*Math.SQRT1_2-(sx>0?b.x0:b.x1)),clampY(c.cy+sy*(R+1e-5)*Math.SQRT1_2-(sy>0?b.y0:b.y1))]);
   }
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
 const fitness=(envelope,r)=>{const b=A.bounds([envelope]),w=b.x1-b.x0,h=b.y1-b.y0,rw=r.x1-r.x0,rh=r.y1-r.y0;return w>0&&h>0&&rw>0&&rh>0?Math.abs(Math.log((w/h)/(rw/rh))):Infinity;};
 candidates.sort((a,b)=>b.region.score-a.region.score||fitness(a.envelope,a.region)-fitness(b.envelope,b.region)||a.distance-b.distance||Number(b.region.direction===old?.direction)-Number(a.region.direction===old?.direction));
 const win=candidates[0];if(!win){
  if(!reflowItem&&centerSource&&holdWindow&&sourceItem?.unitSupport&&!cut.text.includes('\n')&&typeof Intl.Segmenter==='function'){
   const sw=W*a.w,sh=H*a.h,sourceStyle={...st,...(cut.fonts?{fonts:cut.fonts}:{})},sc=cut.palette||sourceStyle.schemes[cut.scheme%sourceStyle.schemes.length],native=J.basicMainItem({W:sw,H:sh,cut:sourceCut,sc}),chars=[...cut.text],n=chars.length,step=native.size*(native.lead||1.2),advance=Math.max(...chars.map(c=>J.metrics.adv(native.font,c)*native.size))+native.size*Math.max(0,native.track||0),boundaries=new Set([...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(cut.text)].map(x=>x.index)),results=[];
   const graphemes=[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(cut.text)],wordSegments=[...new Intl.Segmenter(undefined,{granularity:'word'}).segment(cut.text)],balanced=(per,front)=>{
    const n=graphemes.length,rows=Math.ceil(n/per),base=Math.floor(n/rows),extra=n%rows,lines=[];let i=0;
    for(let row=0;row<rows;row++){const len=base+(front?row<extra:row>=rows-extra?1:0),end=i+len;if(end<n){const next=graphemes[end],pos=next.index;if(/^[\s\p{P}ぁぃぅぇぉっゃゅょゎゕゖァィゥェォッャュョヮヵヶㇰ-ㇿー]/u.test(next.segment)||wordSegments.some(w=>w.isWordLike&&/[\p{Script=Latin}0-9]/u.test(w.segment)&&pos>w.index&&pos<w.index+w.segment.length))return null;}lines.push(graphemes.slice(i,end).map(g=>g.segment).join(''));i=end;}
    return lines.join('\n');
   };
   for(const r of [...domain.regions].sort((a,b)=>b.score-a.score)){
    if(results.length&&r.score<results[0].diagnostic.score)break;
    const rw=r.x1-r.x0,rh=r.y1-r.y0,ratio=rw/rh;if(!(rw>0&&rh>0))continue;
    const ideal=Math.sqrt(n*step*ratio/Math.max(1,advance)),variants=new Set([Math.max(1,Math.min(n,Math.floor(ideal))),Math.max(1,Math.min(n,Math.ceil(ideal)))]),seenTexts=new Set();
    for(const per of variants)for(const text of [J.splitLines(cut.text,per),balanced(per,true),balanced(per,false)]){if(text==null||seenTexts.has(text)||text.replaceAll('\n','')!==cut.text)continue;seenTexts.add(text);let pos=0,valid=true;const lines=text.split('\n');for(let i=0;i<lines.length-1;i++){pos+=lines[i].length;if(!boundaries.has(pos)||/[A-Za-z0-9]/.test(cut.text[pos-1])&&/[A-Za-z0-9]/.test(cut.text[pos])){valid=false;break;}}if(!valid)continue;
     const area={x:r.x0/W,y:r.y0/H,w:rw/W,h:rh/H},item={...native,text,x:native.x+(rw-sw)/2,y:native.y+(rh-sh)/2};delete item._lay;delete item._m;const result=prepareViewport(plan,{...cut,area,simpleCircleSourceArea:{...a}},{scale,region,previous,holdRange:holdWindow,reflowItem:item,nativeDims:{W:sw,H:sh}});if(result.recipe&&result.diagnostic.direction===r.direction)results.push(result);
    }
   }
   results.sort((a,b)=>{const x=a.diagnostic,y=b.diagnostic;return y.score-x.score||fitness(x.envelope,x.region)-fitness(y.envelope,y.region)||Math.hypot(x.offset[0]/W,x.offset[1]/H)-Math.hypot(y.offset[0]/W,y.offset[1]/H)||Number(y.direction===old?.direction)-Number(x.direction===old?.direction);});if(results.length)return results[0];
  }
  return {diagnostic:{cut:cut.index,status:'insufficient-space',reason:'NO_SAFE_NATIVE_VIEWPORT',...(supportInfo?{supportInfo}:{})}};
 }
 return {area:{...a,x:a.x+win.offset[0]/W,y:a.y+win.offset[1]/H},recipe:roleSeparated?{sourceFormula:{layout:cut.layout,W:W*a.w,H:H*a.h,offset:win.offset.slice(),nativeViewport:true,sourceArea:{...a},roleSeparated:true},holdWindow}:{nativeIdentity:true,nativeViewportOffset:win.offset.slice(),...(reflowItem?{centerViewportItem:reflowItem,...(nativeDims?{centerNativeDims:nativeDims}:{})}:{}),...(holdWindow?{holdWindow}: {})},diagnostic:{cut:cut.index,status:'safe',safety:holdWindow?'safe-hold':'all-native-clocks',...(holdWindow?{holdWindow,bloomSigma,lightTailBeyondSupport:'not-certified'}:{}),method:win.unitEnvelopes?'translated-native-owned-units':centerSource?'translated-native-center-support':'translated-native-viewport',direction:win.region.direction,score:win.region.score,region:win.region,envelope:win.envelope,...(win.unitEnvelopes?{unitEnvelopes:win.unitEnvelopes}:{}),...(supportInfo?{supportInfo}:{}),nativeSourcePreserved:!reflowItem,...(reflowItem?{reflowText:reflowItem.text,nativeSize:reflowItem.size}:{}),sourceArea:nativeDims?{...cut.simpleCircleSourceArea}: {...a},offset:win.offset.slice(),allClockGeneration:false}};
}
A.centerCircle=Object.freeze({handles,envelope,stageBounds,render,viewportHandles,prepareViewport,sourceUnits,mixedVisibilityRanges,scatterSourceItems});
})();
