/* AVOID-005 route leaves: analytic construction and live native items only.
 * Keep the approved wave phase ordering and huge glyph/caption cell contract;
 * never invoke the historical recording/replay compiler during rendering. */
(() => {
'use strict';
const A=J.placement,S=A.simpleCircle,ID=[1,0,0,1,0,0],ids=new Set(['wave','huge']);
const rect=b=>[[b.x0,b.y0],[b.x1,b.y0],[b.x1,b.y1],[b.x0,b.y1]];
const handles=(plan,cut)=>ids.has(cut.layout)&&!cut.placementTrajectory&&(S.preparedCut(plan,cut)||A.placementCutPreserved86cm(plan,cut)===false);
const boxMove=(b,x,y)=>({x0:b.x0+x,y0:b.y0+y,x1:b.x1+x,y1:b.y1+y});
function support(plan,cut,item,scale,main=true,angle=0){
 const b=item.supportBounds||(main?S.itemEnvelope(item,cut).bounds:A.bounds(A.itemGeometry({...item,x:0,y:0,rot:0},ID,{pass:'main',scale:1}).polygons));
 // Continuous tangent extrema, followed by the shared camera/post envelope.
 const points=[];for(const [x,y] of rect(b)){const angles=[-angle,0,angle];for(const root of [Math.atan2(-y,x),Math.atan2(x,y)])for(let k=-2;k<=2;k++){const a=root+k*Math.PI;if(a>=-angle&&a<=angle)angles.push(a);}for(const a of angles)points.push([x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)]);}
 const rotated=A.bounds([points]),local={bounds:rotated,body:rotated,renderScale:scale},p=A.bounds([S.stageEnvelope(local,{x:plan.W/2,y:plan.H/2},plan,cut)]);let halfWidth=Math.max(plan.W/2-p.x0,p.x1-plan.W/2),halfHeight=Math.max(plan.H/2-p.y0,p.y1-plan.H/2);
 if(cut.area){const area=cut.area,cx=plan.W*area.w/2,cy=plan.H*area.h/2,project=A.nativeBlockCircle.viewportProject(plan,cut,scale,{fixedViewport:true}),q=A.bounds([project(local,{x:cx,y:cy},plan,cut)]),ax=area.x*plan.W+cx,ay=area.y*plan.H+cy;halfWidth=Math.max(halfWidth,ax-q.x0,q.x1-ax);halfHeight=Math.max(halfHeight,ay-q.y0,q.y1-ay);}
 return {halfWidth,halfHeight};
}
function hugeSource(plan,cut){
 const W=plan.W,H=plan.H,p=cut.params,text0=cut.text.replace(/\s+/g,''),n=J.glyphCount(text0),text=n>=5?J.splitLines(text0,Math.ceil(n/2)):text0,rows=text.split('\n').length,size=rows>1?Math.min(H*.56,W*1.2/(Math.ceil(n/2)*.98)):Math.min(H*.98,W*1.3/(n*.96));
 return {text,font:p.font,size,x:W/2,y:H*.52,lead:.98,track:-.02,rows};
}
function prepare(plan,cut,{scale=1,region,previous}={}){
 const no=reason=>({diagnostic:{cut:cut.index,status:'unsupported',reason,layout:cut.layout}}),p=cut.params;
 if(cut.area?.angle||cut.placementTrajectory)return no('ROUTE_ROTATED_NATIVE_VIEWPORT');
 if((cut.decor||[]).some(d=>!J.DECOR[d.id]))return no('ROUTE_UNKNOWN_SOURCE_DECOR');
 if(!Number.isFinite(scale)||scale<=0||scale>4)return no('UNSUPPORTED_RENDER_SCALE');
 if(cut.layout==='huge'&&(cut.enter!=='cut'||cut.exit!=='cut'||cut.hold!=='still'||(cut.treat||'none')!=='none'))return no('HUGE_ROUTE_COUPLED_GLYPH_FX');
 const area=cut.area,W=area?plan.W*area.w:plan.W,H=area?plan.H*area.h:plan.H,ax=area?area.x*plan.W:0,ay=area?area.y*plan.H:0,viewport={W,H,x:ax,y:ay},domain=S.domain(plan,cut,region),old=previous?.policy===S.policy?previous.diagnostics.find(d=>d.cut===cut.index&&d.status==='safe'):null;
 if(cut.layout==='wave'){
  if(![p.amp,p.freq,p.travel,p.trail].every(Number.isFinite)||Math.abs(p.amp)>.17||Math.abs(p.freq)>1.6||Math.abs(p.travel)>.5||!Number.isInteger(p.trail)||p.trail<0||p.trail>9)return no('WAVE_ROUTE_PARAMETER_DOMAIN');
  const chars=[...cut.text.replace(/\s+/g,'')],n=chars.length;if(!n||n>16)return no('WAVE_ROUTE_GLYPH_DOMAIN');
  const size=Math.min(H*.2,W*.72/n);let halfWidth=0,halfHeight=0;
  for(const ch of chars)for(let k=0;k<=p.trail;k++){const v=support(plan,cut,{text:ch,font:p.font,size:size*(1-k*.035),x:0,y:0},scale,k===0,Math.atan(Math.abs(H*p.amp*J.TAU*p.freq/W)));halfWidth=Math.max(halfWidth,v.halfWidth);halfHeight=Math.max(halfHeight,v.halfHeight);}
  const stride=Math.max(size*1.05,2*halfWidth+1),width=(n-1)*stride+2*halfWidth,circle={cx:domain.circle.cx-ax,cy:domain.circle.cy-ay,r:domain.circle.r+domain.pad},candidates=[];
  // Horizontal phase is part of the source's writing direction. Rotating this
  // route into a vertical run would change that contract.
  if(width<=W)for(const r of domain.regions.filter(r=>r.direction==='up'||r.direction==='down')){const side=r.direction==='up'?'above':'below',route={circle,W,H,side,halfWidth,halfHeight};if(A.certifyBasicRoute(route))candidates.push({r,side});}
  candidates.sort((a,b)=>b.r.score-a.r.score||Number(b.r.direction===old?.direction)-Number(a.r.direction===old?.direction));const win=candidates[0];if(!win)return {diagnostic:{cut:cut.index,status:'insufficient-space',reason:'NO_ORDERED_WAVE_ROUTE',layout:cut.layout,width,halfWidth,halfHeight}};
  return {area:area||null,recipe:{layout:'wave',circle,side:win.side,halfWidth,halfHeight,stride,width,n,size,viewport},diagnostic:{cut:cut.index,status:'safe',direction:win.r.direction,region:win.r,method:'005-universal-minkowski-wave-route',allClockGeneration:false,contract:'native glyph/trail phase order; original size and tangent; native trail edge crossing; original viewport clip'}};
 }
 if(![-1,1].includes(p.dir))return no('HUGE_ROUTE_PARAMETER_DOMAIN');
 const native=hugeSource({...plan,W,H},cut),ink=A.itemGeometry({...native,x:0,y:0},ID,{pass:'main',scale:1}),glyphs=[],slack=5;
 for(const g of ink.glyphs){const b=A.bounds([g.polygon]),center=[(b.x0+b.x1)/2,(b.y0+b.y1)/2],halfWidth=(b.x1-b.x0)/2,halfHeight=(b.y1-b.y0)/2;
  // Huge uses each glyph's own cell, retaining its complete laid-out shape.
  const q=support(plan,cut,{supportBounds:boxMove(b,-center[0],-center[1])},scale,false);glyphs.push({index:g.index,localCenter:center,nativeAnchor:[ax+native.x+center[0],ay+native.y+center[1]],halfWidth:Math.max(halfWidth,q.halfWidth)+slack,halfHeight:Math.max(halfHeight,q.halfHeight)+slack});
 }
 if(!glyphs.length||glyphs.length>8)return no('HUGE_ROUTE_GLYPH_DOMAIN');
 const st=cut.effectStyle||plan.style,caption=p.label?(()=>{const size=J.clamp(H*.028,16,30),text=cut.text,font=cut.fonts?.body?.[0]||st.fonts.body[0],m=J.measure({text,font,size,track:.12}),raw=A.bounds([rect({x0:W*.05,y0:H*.86-size,x1:W*.05+m.w+size*1.4,y1:H*.86+size}),...A.itemGeometry({text,font,size,track:.12,align:'left',x:W*.05+size*.7,y:H*.86},ID,{pass:'main',scale:1}).polygons]),center=[(raw.x0+raw.x1)/2,(raw.y0+raw.y1)/2],v=support(plan,cut,{supportBounds:boxMove(raw,-center[0],-center[1])},scale,false);return {localAnchor:center,nativeAnchor:[ax+center[0],ay+center[1]],halfWidth:v.halfWidth+slack,halfHeight:v.halfHeight+slack};})():null;
 const identity=(local,it)=>rect(boxMove(local.bounds,it.x,it.y)),placement=S.domain(plan,{...cut,contentScale:1},region,identity),candidates=[];
 for(let rows=native.rows;rows<=glyphs.length;rows++){
  const per=Math.ceil(glyphs.length/rows),lines=[];for(let i=0;i<glyphs.length;i+=per)lines.push(glyphs.slice(i,i+per));const gap=2,widths=lines.map(line=>line.reduce((s,g)=>s+g.halfWidth*2,0)+gap*(line.length-1)),heights=lines.map(line=>Math.max(...line.map(g=>g.halfHeight*2))),width=Math.max(...widths,caption?caption.halfWidth*2:0),height=heights.reduce((a,b)=>a+b,0)+gap*(lines.length-1)+(caption?gap+caption.halfHeight*2:0),local={bounds:{x0:0,y0:0,x1:width,y1:height},body:{x0:0,y0:0,x1:width,y1:height}},positions=[];let y=0;
  lines.forEach((line,r)=>{let x=(width-widths[r])/2;for(const g of line){positions.push({index:g.index,target:[x+g.halfWidth,y+heights[r]/2]});x+=g.halfWidth*2+gap;}y+=heights[r]+gap;});
  for(const r0 of placement.regions){const r={...r0,x0:Math.max(r0.x0,ax),y0:Math.max(r0.y0,ay),x1:Math.min(r0.x1,ax+W),y1:Math.min(r0.y1,ay+H)},placed=placement.place(local,r);if(placed)candidates.push({r,positions:positions.map(v=>({...v,target:v.target.map((n,i)=>n+placed.offset[i])})),captionTarget:caption?[placed.offset[0]+width/2,placed.offset[1]+height-caption.halfHeight]:null,envelope:placed.envelope,rows:lines.length,distance:Math.hypot(placed.offset[0]/plan.W,placed.offset[1]/plan.H)});}
 }
 candidates.sort((a,b)=>b.r.score-a.r.score||a.rows-b.rows||a.distance-b.distance||Number(b.r.direction===old?.direction)-Number(a.r.direction===old?.direction));const win=candidates[0];if(!win)return {diagnostic:{cut:cut.index,status:'insufficient-space',reason:'NO_FIXED_SIZE_HUGE_CELLS',layout:cut.layout}};
 return {area:area||null,recipe:{layout:'huge',native,glyphs,positions:win.positions,caption,captionTarget:win.captionTarget,slack,viewport},diagnostic:{cut:cut.index,status:'safe',direction:win.r.direction,region:win.r,envelope:win.envelope,rows:win.rows,method:'005-ordered-huge-cells-and-bounded-native-drift',allClockGeneration:false,contract:'native size; row-major glyph order; attached caption plate/text; atan native drift; original viewport clip'}};
}
// Translate in stage coordinates through the actual current camera/root CTM.
// The inverse changes an item's position without replacing its native rotation.
function moved(env,anchor,target,draw){const m=env.ctx.getTransform(),scale=env.scale||1,point=[(m.a*anchor[0]+m.c*anchor[1]+m.e)/scale,(m.b*anchor[0]+m.d*anchor[1]+m.f)/scale],destination=target(point),dx=(destination[0]-point[0])*scale,dy=(destination[1]-point[1])*scale,det=m.a*m.d-m.b*m.c,x=(m.d*dx-m.c*dy)/det,y=(-m.b*dx+m.a*dy)/det;env.ctx.save();try{env.ctx.translate(x,y);const bb=draw();return bb?{...bb,x0:bb.x0+x,x1:bb.x1+x,y0:bb.y0+y,y1:bb.y1+y,cx:bb.cx+x,cy:bb.cy+y}:bb;}finally{env.ctx.restore();}}
function renderWave(env,recipe){
 const {W,H,sc}=env,p=env.cut.params,chars=[...env.cut.text.replace(/\s+/g,'')],n=chars.length,size=recipe.size,du=size*1.05/W,u0=.5-(env.lt/env.cut.dur-.5)*p.travel,path=u=>[W*u,H/2+H*p.amp*Math.sin(J.TAU*p.freq*u+env.ltb*1.3)],angle=u=>{const a=path(u-.002),b=path(u+.002);return Math.atan2(b[1]-a[1],b[0]-a[0])/J.DEG;},available=W-recipe.width,origin=recipe.halfWidth+available/2+(available>0?available/2*Math.tanh(2*(u0-.5)*W/available):0);let bb=null;
 const draw=(ch,i,k)=>{const u=u0+(i-(n-1)/2)*du+k*du*.2*Math.sign(p.travel),[x,y]=path(u),it={placementPhaseIndex:i,placementTrailIndex:k,placementRouteKey:'wave.unit.'+(i*.5)+(k?'.trail.'+k:''),text:ch,font:p.font,size:size*(1-k*.035),x,y,rot:angle(u),color:k?sc.sub:sc.fg,...(k?{alpha:.5*(1-k/(p.trail+1))*J.E.outCubic(env.pIn),ghost:false}:{mi:i*.5})};return moved(env,[x,y],anchor=>A.basicRoutePoint([origin+i*recipe.stride+k*.2*recipe.stride*Math.sign(p.travel),anchor[1]-recipe.viewport.y],{...recipe,W,H,nativeCropAxis:true}).map((v,j)=>v+[recipe.viewport.x,recipe.viewport.y][j]),()=>k?env.draw(it):J.mainDraw(env,it));};
 for(let k=p.trail;k>=1;k--)chars.forEach((ch,i)=>draw(ch,i,k));chars.forEach((ch,i)=>{bb=J.unionBB(bb,draw(ch,i,0));});return bb;
}
function renderHuge(env,recipe){
 const p=env.cut.params,native=recipe.native,it=J.animateMainItem(env,{...native,x:env.W/2+(.5-env.lt/env.cut.dur)*env.W*.16*p.dir,color:env.sc.fg,gradient:p.grad&&env.sc.grad?env.sc.grad:null}),target=(point,unit,dest)=>dest.map((v,i)=>v+recipe.slack*2/Math.PI*Math.atan((point[i]-unit.nativeAnchor[i])/recipe.slack));let bb=null;
 if(it){const lay=J.layoutText(it);for(const g of recipe.glyphs){const one=lay.filter(v=>v.i===g.index);Object.assign(one,{N:lay.N,W:lay.W,H:lay.H});const dest=recipe.positions.find(v=>v.index===g.index).target;bb=J.unionBB(bb,moved(env,[it.x+g.localCenter[0],it.y+g.localCenter[1]],point=>target(point,g,dest),()=>J.drawFx(env,{...it,_lay:one})));}}
 if(recipe.caption){const ls=J.clamp(env.H*.028,16,30),a=J.E.outCubic(J.clamp((env.lt-env.cut.inDur*.5)/.2))*(1-env.pOut),font=env.st.fonts.body[0],m=J.measure({text:env.cut.text,font,size:ls,track:.12});moved(env,recipe.caption.localAnchor,point=>target(point,recipe.caption,recipe.captionTarget),()=>{env.rect(env.W*.05,env.H*.86-ls,m.w+ls*1.4,ls*2,env.sc.ink,a,false);env.draw({text:env.cut.text,font,size:ls,track:.12,align:'left',x:env.W*.05+ls*.7,y:env.H*.86,color:env.sc.bg,alpha:a,ghost:false});});}
 return bb;
}
A.routeCircle=Object.freeze({ids,handles,prepare});
for(const id of ids){const source=J.LAYOUTS[id].render;J.LAYOUTS[id].render=function(env){const recipe=env.cut.simpleCircleRecipe?.route;return recipe?(id==='wave'?renderWave(env,recipe):renderHuge(env,recipe)):source(env);};}
})();
