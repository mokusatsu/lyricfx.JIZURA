/* Headline + deck: width reflow of one linked native composition, never side splitting. */
(() => {
'use strict';
const A=J.placement,S=A.simpleCircle,ID=[1,0,0,1,0,0],rect=b=>[[b.x0,b.y0],[b.x1,b.y0],[b.x1,b.y1],[b.x0,b.y1]],move=(b,x,y)=>({x0:b.x0+x,y0:b.y0+y,x1:b.x1+x,y1:b.y1+y});
function support(g,env,scale){
 const p=env.cut.params,main={text:g.fb.text,font:p.font,size:g.size,x:g.mx,y:g.hy,align:'left',lead:1.02,track:-.01},head=S.itemEnvelope(main,env.cut),shapes=[],texts=[];
 const shape=(x0,y0,x1,y1,pad=g.lw+1)=>shapes.push(rect({x0:x0-pad,y0:y0-pad,x1:x1+pad,y1:y1+pad})),text=it=>texts.push(...A.itemGeometry(it,ID,{pass:'main',scale:1}).polygons),mono=env.st.fonts.mono?.[0]||'mono',ky=g.hy-g.m.h/2-g.ls*1.1,kt=p.kicker+'  '+String(Math.max(0,env.cut.line|0)+1).padStart(2,'0'),km=J.measure({text:kt,font:mono,size:g.ls,track:.2});
 shape(g.mx,ky-g.ls*.8,g.mx+km.w+g.ls*1.2,ky+g.ls*.8);text({text:kt,font:mono,size:g.ls,track:.2,align:'left',x:g.mx+g.ls*.6,y:ky});
 const last=g.fb.text.split('\n').at(-1),lastW=[...last].reduce((v,c)=>v+J.metrics.adv(p.font,c)*g.size,0),ly=g.hy+(g.fb.text.split('\n').length-1)/2*g.size*1.02;
 if(p.mark==='bar')shape(g.mx,ly+g.size*.5,g.mx+lastW,ly+g.size*.5+Math.max(4,g.size*.07));
 if(p.mark==='dot'){const x=g.mx+lastW+g.size*.25,y=ly+g.size*.3,r=g.size*.09*1.14;shape(x-r,y-r,x+r,y+r);}
 if(g.split){const x=g.mx+g.aw*.64,h=Math.max(g.m.h,g.deckH)/2;shape(x,g.H/2-h,x,g.H/2+h);if(p.dbl)shape(g.mx,g.H*.1,g.mx+g.aw,g.H*.1);}else{shape(g.mx,g.ry,g.mx+g.aw,g.ry);if(p.dbl)shape(g.mx,g.ry+g.lw*2.5,g.mx+g.aw,g.ry+g.lw*2.5);}
 const dx=g.split?g.mx+g.aw*.68:g.mx;
 g.dlines.forEach((line,i)=>{const it={text:line,font:g.dfont,size:g.dsz,track:g.dc?0:.12,align:'left',lead:1.6,x:dx,y:g.dy+g.ds*.8+(g.deckStarts[i]+(g.deckCounts[i]-1)/2)*g.ds*1.6},ink=A.itemGeometry(it,ID,{pass:'main',scale:1}).polygons;texts.push(...ink,...ink.map(poly=>poly.map(v=>[v[0],v[1]+g.ds*.5])));});
 if(g.showByline)text({text:g.bylineText,font:mono,size:g.ls*.85,track:.12,align:g.split?'left':'right',x:g.split?dx:g.mx+g.aw,y:g.by});
 const other=[...shapes,...texts],bounds=A.bounds([...other,rect(move(head.bounds,main.x,main.y))]),body=A.bounds([...other,rect(move(head.body,main.x,main.y))]);return {bounds,body,renderScale:scale};
}
function prepare(plan,cut,{scale,region,previous}){
 const W=plan.W,H=plan.H,area=cut.area,st={...(cut.effectStyle||plan.style),...(cut.fonts?{fonts:cut.fonts}:{})},env={W:area?W*area.w:W,H:area?H*area.h:H,cut,plan,st,sc:cut.palette||st.schemes[cut.scheme%st.schemes.length]},p=cut.params;
 if(!['top','bottom','split'].includes(p.variant)||!['none','bar','dot'].includes(p.mark)||typeof p.kicker!=='string')return {diagnostic:{cut:cut.index,status:'unsupported',reason:'UNSUPPORTED_HEADLINE_VARIANT'}};
 const native=J.headlineDeckGeometry(env),count=[native.fb.text,...native.dlines,native.bylineText,p.kicker].join('').replace(/\n/g,'').length;if(count>256)return {diagnostic:{cut:cut.index,status:'unsupported',reason:'UNSUPPORTED_HEADLINE_GLYPH_BUDGET'}};
 const c={cx:region.center.x*W,cy:region.center.y*H,r:region.radius*Math.min(W,H)},pad=Math.max(2,.005*Math.min(W,H))+1,dx=2*c.cx/W-1,dy=2*c.cy/H-1,regions=[{direction:'down',score:-dy,x0:0,y0:c.cy+c.r+pad,x1:W,y1:H},{direction:'up',score:dy,x0:0,y0:0,x1:W,y1:c.cy-c.r-pad},{direction:'right',score:-dx,x0:c.cx+c.r+pad,y0:0,x1:W,y1:H},{direction:'left',score:dx,x0:0,y0:0,x1:c.cx-c.r-pad,y1:H}],candidates=[];let attempts=0;
 const point={bounds:{x0:-.5,y0:-.5,x1:.5,y1:.5},body:{x0:-.5,y0:-.5,x1:.5,y1:.5},renderScale:scale},tail=A.bounds([S.stageEnvelope(point,{x:W/2,y:H/2},plan,cut)]),tailWidth=tail.x1-tail.x0-1;
 function place(local,offset,r){let b=A.bounds([S.stageEnvelope(local,{x:offset[0],y:offset[1]},plan,cut)]),body=A.bounds([S.stageEnvelope(local,{x:offset[0],y:offset[1]},plan,cut,true)]);b={x0:Math.max(0,b.x0),y0:Math.max(0,b.y0),x1:Math.min(W,b.x1),y1:Math.min(H,b.y1)};if(body.x0<0||body.y0<0||body.x1>W||body.y1>H||b.x0<r.x0||b.y0<r.y0||b.x1>r.x1||b.y1>r.y1||!A.clear([rect(b)],c,pad))return null;return {envelope:rect(b),body};}
 for(const r of regions){if(r.x0>=r.x1||r.y0>=r.y1)continue;const available=Math.max(1,(r.x1-r.x0-tailWidth)/(cut.contentScale??1));for(const width of new Set([native.aw,Math.min(native.aw,available),Math.min(native.aw,available*.75),available])){
  const g=J.headlineDeckGeometry(env,{native,width}),local=support(g,env,scale),b=A.bounds([S.stageEnvelope(local,{x:0,y:0},plan,cut)]),offset=[(r.x0+r.x1-b.x0-b.x1)/2/(cut.contentScale??1),(r.y0+r.y1-b.y0-b.y1)/2/(cut.contentScale??1)];let moved=A.bounds([S.stageEnvelope(local,{x:offset[0],y:offset[1]},plan,cut)]);offset[0]+=(r.x0>0?Math.max(0,r.x0-moved.x0):r.x1<W?-Math.max(0,moved.x1-r.x1):0)/(cut.contentScale??1);offset[1]+=(r.y0>0?Math.max(0,r.y0-moved.y0):r.y1<H?-Math.max(0,moved.y1-r.y1):0)/(cut.contentScale??1);attempts++;const fit=place(local,offset,r);if(fit)candidates.push({geometry:g,local,offset,region:r,...fit,fitness:Math.abs(Math.log(((local.body.x1-local.body.x0)/(local.body.y1-local.body.y0))/((r.x1-r.x0)/(r.y1-r.y0)))),distance:Math.hypot(offset[0]/W,offset[1]/H)});
 }}
 const old=previous?.policy===S.policy?previous.diagnostics.find(d=>d.cut===cut.index&&d.status==='safe'):null;candidates.sort((a,b)=>b.region.score-a.region.score||a.fitness-b.fitness||a.distance-b.distance||Number(b.region.direction===old?.direction)-Number(a.region.direction===old?.direction));const win=candidates[0];if(!win)return {diagnostic:{cut:cut.index,status:'insufficient-space',reason:'NO_SAFE_HEADLINE_COMPOSITION',candidates:attempts}};
 const prior=previous?.plan.cuts.find(c=>c.index===cut.index)?.simpleCircleRecipe?.headlineDeck;if(old?.direction===win.region.direction&&prior?.geometry.variant===p.variant){const fit=place(win.local,prior.offset,win.region);if(fit){win.offset=prior.offset.slice();Object.assign(win,fit);win.reusedPosition=true;}}
 return {recipe:{geometry:win.geometry,offset:win.offset},diagnostic:{cut:cut.index,status:'safe',direction:win.region.direction,score:win.region.score,region:win.region,envelope:win.envelope,headline:win.geometry.fb.text,deck:win.geometry.dlines,headlineSize:native.size,deckSize:native.dsz,width:win.geometry.aw,nativeWidth:native.aw,variant:p.variant,candidates:attempts,reusedPosition:!!win.reusedPosition,sideDispersion:false}};
}
A.headlineCircle=Object.freeze({prepare});
})();
