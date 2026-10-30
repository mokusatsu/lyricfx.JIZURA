/* Numbered columns: preserve each native number/label/lyric/clip as one unit. */
(() => {
'use strict';
const A=J.placement,S=A.simpleCircle,ID=[1,0,0,1,0,0],rect=b=>[[b.x0,b.y0],[b.x1,b.y0],[b.x1,b.y1],[b.x0,b.y1]],box=(x0,y0,x1,y1)=>({x0,y0,x1,y1}),moved=(b,x,y)=>box(b.x0+x,b.y0+y,b.x1+x,b.y1+y),clip=(b,W,H)=>box(Math.max(0,b.x0),Math.max(0,b.y0),Math.min(W,b.x1),Math.min(H,b.y1)),within=(b,r)=>b.x0>=r.x0&&b.x1<=r.x1&&b.y0>=r.y0&&b.y1<=r.y1;
function prepare(plan,cut,{scale,region,previous}){
 const W=plan.W,H=plan.H,area=cut.area,sw=area?W*area.w:W,sh=area?H*area.h:H,p=cut.params,chunks=p.chunks;
 const unsupported=reason=>({diagnostic:{cut:cut.index,status:'unsupported',reason}});
 if(p.variant!=='cols'||H>W*1.08||sh>sw*1.08||!Array.isArray(chunks)||chunks.length<1||chunks.length>3)return unsupported('UNSUPPORTED_NUMBERED_COLUMNS');
 if(chunks.some(s=>typeof s!=='string'||!s.trim())||chunks.join('').replace(/\s/g,'')!==cut.text.replace(/\s/g,''))return unsupported('UNSUPPORTED_NUMBERED_SOURCE');
 if(typeof p.label!=='string'||[...cut.text.replace(/\s/g,'')].length+chunks.length*([...p.label].length+2)>256)return unsupported('UNSUPPORTED_NUMBERED_GLYPH_BUDGET');
 if(cut.exit==='overexposeOut'&&J.glyphCount(cut.text)>1&&chunks.some(s=>[...s.replace(/\n/g,'')].length===1))return unsupported('UNSUPPORTED_NUMBERED_GLOBAL_LIGHT');
 const st={...(cut.effectStyle||plan.style),...(cut.fonts?{fonts:cut.fonts}:{})},sc=cut.palette||st.schemes[cut.scheme%st.schemes.length],g=J.numberedColumnGeometry({W:sw,H:sh,cut,st,sc}),units=[];
 for(let i=0;i<g.k;i++){
  const x=g.xs[i],xl=x+g.cw*.07,main={text:chunks[i],font:p.font,size:g.csize,x:xl,y:g.top+g.nsz*1.05+g.csize*.85,align:'left',track:.02,color:sc.fg,mi:i*3},label={text:p.label==='No.'?'No.':p.label,font:st.fonts.mono?.[0]||'mono',size:g.ls*.85,track:.3,align:'left',x:xl,y:g.top-g.ls*.9},labelInk=A.itemGeometry(label,ID,{pass:'main',scale:1}).polygons,lyric=S.itemEnvelope(main,cut),numberClip=box(x,g.top,x+g.cw,g.top+g.nsz*1.02),stroke=g.lw*1.4/2+1;
  const furniture=[rect(numberClip),...labelInk,rect(box(xl-stroke,g.top+g.nsz*1.05-stroke,xl+g.cw*.82+stroke,g.top+g.nsz*1.05+stroke))];
  if(i>0)furniture.push(rect(box(x-g.lw/2-1,g.H*.22-g.lw/2-1,x+g.lw/2+1,g.H*.78+g.lw/2+1)));
  const bounds=A.bounds([...furniture,rect(moved(lyric.bounds,main.x,main.y))]),body=A.bounds([...furniture,rect(moved(lyric.body,main.x,main.y))]);units.push({i,main,numberClip,local:{bounds,body,renderScale:scale,paintBudget:lyric.paintBudget+12}});
 }
 const circle={cx:region.center.x*W,cy:region.center.y*H,r:region.radius*Math.min(W,H)},pad=Math.max(2,.005*Math.min(W,H))+1,dx=2*circle.cx/W-1,dy=2*circle.cy/H-1,L=circle.cx-circle.r-pad,R=circle.cx+circle.r+pad,T=circle.cy-circle.r-pad,B=circle.cy+circle.r+pad,gap=pad;
 const directions=[{direction:'down',score:-dy,main:box(0,B,W,H),sides:[box(0,0,L,H),box(R,0,W,H)]},{direction:'up',score:dy,main:box(0,0,W,T),sides:[box(0,0,L,H),box(R,0,W,H)]},{direction:'right',score:-dx,main:box(R,0,W,H),sides:[box(0,0,L,H)]},{direction:'left',score:dx,main:box(0,0,L,H),sides:[box(R,0,W,H)]}];
 const positive=r=>r.x0>=0&&r.y0>=0&&r.x1<=W&&r.y1<=H&&r.x1>r.x0&&r.y1>r.y0;
 let attempts=0;
 function pack(indices,r){
  if(!positive(r))return null;let cursor=r.x0;const out=[];
  for(const index of indices){const u=units[index],item={x:0,y:0};let b=A.bounds([S.stageEnvelope(u.local,item,plan,cut)]);item.x=(cursor-b.x0)/(cut.contentScale??1);item.y=((r.y0+r.y1-b.y0-b.y1)/2)/(cut.contentScale??1);b=A.bounds([S.stageEnvelope(u.local,item,plan,cut)]);item.x+=Math.max(0,cursor-b.x0)/(cut.contentScale??1);item.y+=((r.y0+r.y1-b.y0-b.y1)/2)/(cut.contentScale??1);b=clip(A.bounds([S.stageEnvelope(u.local,item,plan,cut)]),W,H);const body=A.bounds([S.stageEnvelope(u.local,item,plan,cut,true)]);
   if(!within(b,r)||!within(body,r)||!A.clear([rect(b)],circle,pad))return null;out.push({i:index,offset:[item.x,item.y],bounds:b,body,region:r});cursor=b.x1+gap;
  }
  return out;
 }
 const all=units.map(u=>u.i),candidates=[];
 for(const d of directions){
  const whole=pack(all,d.main);attempts++;
  if(whole){candidates.push({...d,placements:whole,auxiliary:false});continue;}
  // Main-only is decided first. A side region never shares its space with main.
  for(const side of d.sides){if(!positive(side)||!positive(d.main))continue;
   for(let split=1;split<g.k;split++){const sideFirst=side.x1<=d.main.x0||side.x0===0&&d.direction!=='left',orderedMain=sideFirst?box(Math.max(d.main.x0,side.x1+gap),d.main.y0,d.main.x1,d.main.y1):box(d.main.x0,d.main.y0,Math.min(d.main.x1,side.x0-gap),d.main.y1),first=all.slice(0,split),rest=all.slice(split),a=pack(first,sideFirst?side:orderedMain),b=pack(rest,sideFirst?orderedMain:side);attempts++;if(!a||!b)continue;const placements=[...a,...b];if(placements.some((v,i)=>i&&placements[i-1].bounds.x1+gap>v.bounds.x0))continue;candidates.push({...d,main:orderedMain,placements,auxiliary:true,side});}
  }
 }
 const old=previous?.policy===S.policy?previous.diagnostics.find(d=>d.cut===cut.index&&d.status==='safe'):null;
 for(const c of candidates){const b=A.bounds(c.placements.map(p=>rect(p.bounds)));c.fitness=Math.abs(Math.log(((b.x1-b.x0)/(b.y1-b.y0))/((c.main.x1-c.main.x0)/(c.main.y1-c.main.y0))));c.distance=c.placements.reduce((n,p)=>n+Math.hypot(p.offset[0]/W,p.offset[1]/H),0);}
 candidates.sort((a,b)=>b.score-a.score||Number(a.auxiliary)-Number(b.auxiliary)||a.fitness-b.fitness||a.distance-b.distance||Number(b.direction===old?.direction)-Number(a.direction===old?.direction));const win=candidates[0];
 if(!win)return {diagnostic:{cut:cut.index,status:'insufficient-space',reason:'NO_SAFE_NUMBERED_COLUMNS',candidates:attempts}};
 // Reuse the complete previous arrangement only if the new unit geometry,
 // region assignment and reading order still admit all of its offsets.
 const prior=old&&previous.plan.cuts.find(c=>c.index===cut.index)?.simpleCircleRecipe?.numberedColumns,keys=['x0','y0','x1','y1'];
 if(prior?.offsets.length===g.k&&old.direction===win.direction&&old.auxiliary===win.auxiliary&&old.placements?.length===g.k&&win.placements.every((p,i)=>old.placements[i].i===p.i&&keys.every(k=>p.region[k]===win.main[k])===keys.every(k=>old.placements[i].region[k]===old.mainRegion[k]))){
  const retained=[];let valid=true;
  for(const p of win.placements){const offset=prior.offsets[p.i],item={x:offset[0],y:offset[1]},u=units[p.i],bounds=clip(A.bounds([S.stageEnvelope(u.local,item,plan,cut)]),W,H),body=A.bounds([S.stageEnvelope(u.local,item,plan,cut,true)]);if(!within(bounds,p.region)||!within(body,p.region)||!A.clear([rect(bounds)],circle,pad)||retained.length&&retained.at(-1).bounds.x1+gap>bounds.x0){valid=false;break;}retained.push({i:p.i,offset:offset.slice(),bounds,body,region:p.region});}
  if(valid){win.placements=retained;win.reusedPosition=true;}
 }

 return {recipe:{geometry:g,offsets:win.placements.map(p=>p.offset)},diagnostic:{cut:cut.index,status:'safe',direction:win.direction,score:win.score,auxiliary:win.auxiliary,reusedPosition:!!win.reusedPosition,mainRegion:win.main,sideRegion:win.side||null,placements:win.placements,candidates:attempts,chunks:chunks.slice(),fontSize:g.csize,numberSize:g.nsz,order:'left-to-right; source index and clocks unchanged'}};
}
A.numberedCircle=Object.freeze({prepare});
})();
