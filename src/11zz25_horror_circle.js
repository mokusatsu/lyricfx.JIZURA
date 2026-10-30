/* Horror source compositions: original sizes, drawing order and live clocks.
 * Native formulas below bound the whole attached composition, without sampling.
 * Full-stage veils and the rising pool remain explicit unsupported until
 * their primary/ambient source roles have a declared boundary. */
(() => {
'use strict';
const A=J.placement,S=A.simpleCircle,ID=[1,0,0,1,0,0],ids=new Set(['hrFlashlight','hrDoorGap','hrWallScrawl','hrCctv','hrOuija','hrMissing','hrWrongOne','hrRisingDark','hrRedacted','hrStaticTv','hrSpiritPhoto','hrWrongShadow']);
const unsupported=new Map([['hrFlashlight','HORROR_FULL_STAGE_VEIL'],['hrDoorGap','HORROR_FULL_STAGE_VEIL'],['hrRisingDark','HORROR_FULL_STAGE_POOL']]);
const rect=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]],flat=t=>/[A-Za-z]/.test(t)?String(t||'').trim().replace(/\s+/g,' '):String(t||'').replace(/\s+/g,''),pad2=n=>String(n).padStart(2,'0');
const handles=(plan,cut)=>!cut.placementTrajectory&&ids.has(cut.layout)&&(S.preparedCut(plan,cut)||A.placementCutPreserved86cm(plan,cut)===false);
function geometry(plan,cut,W,H,scale){
 const p=cut.params,u=Math.min(W,H),port=H>W*1.08,st={...(cut.effectStyle||plan.style),...(cut.fonts?{fonts:cut.fonts}:{})},mono=st.fonts.mono?.[0]||'mono',body=st.fonts.body?.[0]||'gothic_med',polys=[],bodies=[];
 function box(x0,y0,x1,y1,pad=2){bodies.push(rect(x0,y0,x1,y1));polys.push(rect(x0-pad,y0-pad,x1+pad,y1+pad));}
 function rotated(b,cx,cy,angle,q=1){const a=angle*J.DEG,c=Math.cos(a),s=Math.sin(a);return rect(b.x0,b.y0,b.x1,b.y1).map(([x,y])=>[cx+q*(x*c-y*s),cy+q*(x*s+y*c)]);}
 function item(it,main=false,{radial=false,dx=0,dy=0}={}){
  const g=main?S.itemEnvelope(it,cut):{bounds:A.bounds(A.itemGeometry({...it,x:0,y:0,rot:0},ID,{pass:'main',scale:1}).polygons)};const b=g.bounds,bb=g.body||b;
  const project=b=>{if(radial){const r=Math.max(...rect(b.x0,b.y0,b.x1,b.y1).map(([x,y])=>Math.hypot(x,y)));return rect(it.x-r-dx,it.y-r,it.x+r+dx,it.y+r+dy);}return rotated(b,it.x,it.y,it.rot||0);};polys.push(project(b));bodies.push(project(bb));return g;
 }
 if(cut.layout==='hrWrongOne'){
  const text=J.splitLines(flat(cut.text),port?5:9),o={track:.22,lead:1.5},size=Math.min(J.fitSize(text,p.font,W*.82,H*.46,o),H*.2),native={text,font:p.font,size,x:W/2,y:H/2,...o},lay=J.layoutText(native);
  // The selected glyph turns through an arbitrary angle, twitches +/-14deg,
  // sinks by size*sink, and drifts horizontally +/- .015size. Bounding every
  // glyph by its rotation disc also covers any source index/space selection.
  for(const g of lay){if(!g.ch.trim())continue;item({text:g.ch,font:p.font,size,x:native.x+g.x,y:native.y+g.y},true,{radial:true,dx:size*.015,dy:size*p.sink});if(p.nums){const fs=J.clamp(size*.14,9,22);for(const text of [pad2(g.i+1),'??'])item({text,font:mono,size:fs,x:native.x+g.x,y:native.y+g.y+size*.72,track:.1});}}
 }else if(cut.layout==='hrMissing'){
  const ph=H*.9,pw=Math.min(W*(port?.86:.5),ph*.72),cx=W/2+p.off*W*(port?.3:1),cy=H/2;
  // Paper, shadow, stains, silhouette, tape and tabs share the paper matrix.
  // sq=1.06-.06*outBack: its largest value is 1.06.
  const native=rect(-pw*.56,-ph*.5-pw*.08,pw*.56+u*.012,ph*.5+u*.016),b=A.bounds([native]);polys.push(rotated(b,cx,cy,p.ang,1.06));bodies.push(rotated(b,cx,cy,p.ang,1.06));
  const fw=pw*.52,fh=fw*1.18,fy=-ph*.5+ph*.17,ly=fy+fh+ph*.24,fs=pw*.034,seed=cut.seed|0,date=`${1987+J.h(seed,1)%19}.${pad2(1+J.h(seed,2)%12)}.${pad2(1+J.h(seed,3)%28)}`,sec=2*3600+J.h(seed,4)%7200,time=pad2(Math.floor(sec/3600)%24)+':'+pad2(Math.floor(sec/60)%60),sub=flat(cut.lineText||cut.text);
  const labels=[{text:'MISSING',font:p.fontH,size:pw*.15,y:-ph*.5+ph*.09,track:.08,sx:.92},{text:'LAST SEEN '+date+'  '+time,font:mono,size:fs,y:ly,track:.06},{text:sub.length>22?sub.slice(0,21)+'…':sub,font:body,size:fs*1.05,y:ly+fs*1.7,track:.05}];
  for(const it of labels){const b=A.bounds(A.itemGeometry({...it,x:0},ID,{pass:'main',scale:1}).polygons);polys.push(rotated(b,cx,cy,p.ang,1.06));bodies.push(rotated(b,cx,cy,p.ang,1.06));}
  const text=J.splitLines(flat(cut.text),port?6:7),size=Math.min(J.fitSize(text,p.font,pw*.86,ph*.13,{track:.04,lead:1.1}),pw*.16),lyY=fy+fh+ph*.1;
  for(const sq of [.99,1.06]){const a=p.ang*J.DEG;item({text,font:p.font,size:size*sq,x:cx-lyY*sq*Math.sin(a),y:cy+lyY*sq*Math.cos(a),rot:p.ang,track:.04,lead:1.1},true);}
 }else if(cut.layout==='hrSpiritPhoto'){
  const pw=port?W*.78:Math.min(W*.46,H*.86*1.25),ph=pw/1.25,cx=port?W/2:p.side>0?W*.3:W*.7,cy=port?H*.33:H*.5,bw=u*.018;
  const photo={x0:-pw/2-bw,y0:-ph/2-bw,x1:pw/2+bw+u*.01,y1:ph/2+bw*2.2+u*.012};const pts=rotated(photo,cx,cy,p.ang);polys.push(pts);bodies.push(pts);
  const seed=cut.seed|0,date="'"+String(1987+J.h(seed,1)%19).slice(2)+' '+pad2(1+J.h(seed,2)%12)+' '+pad2(1+J.h(seed,3)%28),dateItem={text:date,font:mono,size:ph*.055,align:'right',x:pw/2-ph*.05,y:ph/2-ph*.06,track:.1},dateBounds=A.bounds(A.itemGeometry(dateItem,ID,{pass:'main',scale:1}).polygons),datePoly=rotated(dateBounds,cx,cy,p.ang);polys.push(datePoly);bodies.push(datePoly);
  // Ring: rr=1.5sr, w<=1+.12+1.15*.08. Date is inside the photo.
  const sr=pw*.09,spx=-pw/2+pw*p.spot[0],spy=-ph/2+ph*p.spot[1],r=sr*1.5*1.212+Math.max(2,u*.005)*5+2;
  const ring=rotated({x0:spx-r,y0:spy-r,x1:spx+r,y1:spy+r},cx,cy,p.ang);polys.push(ring);bodies.push(ring);
  const text=J.splitLines(flat(cut.text),port?7:6),nx=port?W/2:p.side>0?W*.76:W*.24,ny=port?H*.75:H*.5,size=Math.min(J.fitSize(text,p.hand,port?W*.84:W*.38,H*(port?.26:.46),{track:.02,lead:1.2}),H*.14),nm=J.measure({text,font:p.hand,size,track:.02,lead:1.2});item({text,font:p.hand,size,x:nx,y:ny,track:.02,lead:1.2,rot:-p.ang*.4},true);
  const a=p.ang*J.DEG,ax=cx+(spx+sr*1.4*(port?.3:p.side))*Math.cos(a)-(spy+sr*(port?1.6:.3))*Math.sin(a),ay=cy+(spx+sr*1.4*(port?.3:p.side))*Math.sin(a)+(spy+sr*(port?1.6:.3))*Math.cos(a),tx=port?nx:nx-p.side*(nm.w/2+size*.35),ty=port?ny-nm.h/2-size*.35:ny,mx=(ax+tx)/2+(port?W*.1:0),my=(ay+ty)/2-(port?0:H*.1),margin=u*.03+Math.max(2,u*.004)*5+2;
  box(Math.min(ax,tx,mx)-margin,Math.min(ay,ty,my)-margin,Math.max(ax,tx,mx)+margin,Math.max(ay,ty,my)+margin);
 }else if(cut.layout==='hrStaticTv'){
  const tw=Math.min(W*(port?.86:.62),H*(port?.5:.8)*1.3),th=tw/1.3,cx=W/2+p.off*W,cy=H/2+th*.06,lw=Math.max(1,u*.0018);
  // The room glow really is painted over the native viewport. The noise and
  // moving lyric retain their original screen clips; antenna tips range over
  // the full .45th disc, which includes every source angle and idle sway.
  box(0,0,W,H);box(cx-tw/2,cy-th/2-th*.45,cx+tw/2,cy+th*.56,lw*10+2);
 }else if(cut.layout==='hrWallScrawl'){
  const unit=flat(cut.text),font=p.mainHand?p.hand:p.font,mt=J.splitLines(unit,port?5:10),size=Math.min(J.fitSize(mt,font,W*.8,H*.3,{track:.04,lead:1.1}),H*.2),rh=H/p.rows,fs=rh*.58,cw=J.measure({text:unit,font:p.hand,size:fs,track:.02}).w,seed=cut.seed|0;
  // Every potential source slot contains the later cleared/budgeted subset.
  for(let r=0;r<p.rows;r++){const y=(r+.5)*rh+J.rs(seed,r,1)*rh*.12;let x=W*.03+J.r(seed,r,2)*fs*2;for(let k=0;k<16&&x<W*.97;k++){const sz=fs*J.rr(.75,1.3,seed,r,k,3),w=cw*sz/fs,b=A.bounds(A.itemGeometry({text:unit,font:p.hand,size:sz,x:0,y:0,track:.02},ID,{pass:'main',scale:1}).polygons),radius=(Math.max(Math.abs(b.x0),Math.abs(b.x1))+Math.max(Math.abs(b.y0),Math.abs(b.y1)))*1.12+sz*.12+2;box(x+w/2-radius,y-radius,x+w/2+radius,y+radius);x+=w+fs*J.rr(.4,1.4,seed,r,k,4);}}
  item({text:mt,font,size,x:W/2,y:H/2,track:.04,lead:1.1},true);
 }else if(cut.layout==='hrRedacted'){
  const mx=W*(port?.08:.12),mw=W-2*mx,fs=J.clamp(u*.028,12,34),seed=cut.seed|0,date=String(1987+J.h(seed,1)%19)+'.'+pad2(1+J.h(seed,2)%12)+'.'+pad2(1+J.h(seed,3)%28);
  item({text:'FILE No. '+(J.h(seed,1)%9000+1000)+'   '+date,font:mono,size:fs*.8,align:'left',x:mx,y:H*.08,track:.08});
  // Filler glyphs have an original row clip and every black bar is inside mw.
  box(mx,H*.08+fs,mx+mw,H*.84+fs*2.1,Math.max(1,u*.0012)*5+2);
  const text=J.splitLines(flat(cut.text),port?7:16),size=Math.min(J.fitSize(text,p.font,mw,H*.24,{track:.06,lead:1.3}),H*.1,fs*3.4),ly=H*p.row,it={text,font:p.font,size,x:mx,y:ly,align:'left',track:.06,lead:1.3},m=J.measure(it);item(it,true);box(mx-size*.2,ly-m.h/2-size*.12,mx+m.w+size*.2,ly+m.h/2+size*.12);
  if(p.stamp){const ss=fs*1.6,tw=J.measure({text:'CLASSIFIED',font:mono,size:ss,track:.2}).w,cx=W-mx-tw*.55,cy=H*.8,lw=Math.max(2,ss*.1),b={x0:-tw/2-ss*.5-lw*5-2,y0:-ss*.9-lw*5-2,x1:tw/2+ss*.5+lw*5+2,y1:ss*.9+lw*5+2};for(const q of [1,1.6]){const ps=rotated(b,cx,cy,p.stampAng,q);polys.push(ps);bodies.push(ps);const tb=A.bounds(A.itemGeometry({text:'CLASSIFIED',font:mono,size:ss,x:0,y:0,track:.2},ID,{pass:'main',scale:1}).polygons),tp=rotated(tb,cx,cy,p.stampAng,q);polys.push(tp);bodies.push(tp);}}
 }else if(cut.layout==='hrWrongShadow'){
  const text=J.splitLines(flat(cut.text),port?4:7),o={track:.05,lead:1.1},size=Math.min(J.fitSize(text,p.font,W*.66,H*.26,o),H*.16),m=J.measure({text,font:p.font,size,...o}),cy=H*.66-m.h*.2,shS=Math.min(size*p.k,J.fitSize(text,p.font,W*.92,H*.42,o)),shM=J.measure({text,font:p.font,size:shS,...o}),sy=Math.max(H*.06+shM.h/2,cy-m.h*.5-shM.h*.42),R=Math.max(shM.w,shS*2.2)*.75;
  box(W/2-R,sy-R*.72,W/2+R,sy+R*.72);
  // Source reflection has |sx|<=1, arbitrary lean+twitch rotation, and
  // bounded +/-10deg skew. The rotation disc contains both reflections.
  const b=A.bounds(A.itemGeometry({text,font:p.font,size:shS,x:0,y:0,...o},ID,{pass:'main',scale:1}).polygons),r=Math.max(...rect(b.x0,b.y0,b.x1,b.y1).map(([x,y])=>Math.hypot(Math.abs(x)+Math.abs(y)*Math.tan(10*J.DEG),y))),tail=(6*shS*.03+2)/Math.min(1,cut.contentScale??1);
  box(W/2-r-size*.5,sy-r-size*.1,W/2+r+size*.5,sy+r+size*.1,tail);item({text,font:p.font,size,x:W/2,y:cy,...o},true);
  box(W/2-m.w*.8,cy+m.h/2+size*.2,W/2+m.w*.8,cy+m.h/2+size*.2,Math.max(1,size*.012)*5+2);
 }else if(cut.layout==='hrOuija'){
  const bw=Math.min(W*.88,H*(port?.62:1.2)),bh=bw*(port?.72:.52),bx=W/2,by=port?H*.34:H*.36,lw=Math.max(1,u*.0018),bf=bh*(p.latin?.1:.085),kana='あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん',abc='ABCDEFGHIJKLMNOPQRSTUVWXYZ',rows=p.latin?[abc.slice(0,13),abc.slice(13),'1234567890']:[kana.slice(0,16),kana.slice(16,32),kana.slice(32)],cells=[];
  box(bx-bw/2,by-bh/2,bx+bw/2,by+bh/2,lw*5+2);
  rows.forEach((row,r)=>{const arr=[...row],n=arr.length,R=bw*(.64-r*.17),cy=by+bh*(.52+r*.04),span=(r?96:112)*(port?.95:1);arr.forEach((ch,i)=>{const a=(-90-span/2+span*(n>1?i/(n-1):.5))*J.DEG,c=r===2?{ch,x:bx+(i-(n-1)/2)*bw*.6/Math.max(1,n-1),y:by+bh*.3,rot:0}:{ch,x:bx+Math.cos(a)*R*.78,y:cy+Math.sin(a)*R*.62,rot:(a/J.DEG+90)*.7};cells.push(c);item({...c,text:ch,font:p.fontB,size:bf});item({...c,text:ch,font:p.fontB,size:bf*1.25});});});
  for(const [text,x,y,track] of [['YES',bx-bw*.36,by-bh*.36,.2],['NO',bx+bw*.36,by-bh*.36,.2],['GOOD BYE',bx,by+bh*.42,.3]])item({text,font:p.fontB,size:bf*.9,x,y,track});
  // Cubic interpolation is within the endpoints, with the source's positive
  // .06bh horizontal arc, then the +/- .12bf/.1bf idle displacement.
  const xs=[bx,...cells.map(c=>c.x)],ys=[by+bh*.1,...cells.map(c=>c.y)],pr=bf*1.2,pad=lw*7+2;
  box(Math.min(...xs)-bf*.12-pr*1.5,Math.min(...ys)+bf*1.2-bf*.1-pr*2.3,Math.max(...xs)+bh*.06+bf*.12+pr*1.5,Math.max(...ys)+bf*1.2+bf*.1+pr*1.3,pad);
  const text=flat(cut.text),n=[...text].filter(c=>c!==' ').length,lines=n>(port?6:12)?J.splitLines(text,Math.ceil(n/2)):text,size=Math.min(J.fitSize(lines,p.font,W*.86,H*(port?.26:.2),{track:.18,lead:1.2}),H*.13),rowY=port?H*.74:H*.8,lay=J.layoutText({text:lines,font:p.font,size,x:bx,y:rowY,track:.18,lead:1.2});
  for(const g of lay)if(g.ch.trim())item({text:g.ch,font:p.font,size,x:bx+g.x,y:rowY+g.y},true);
 }else if(cut.layout==='hrCctv'){
  const fs=J.clamp(u*.022,11,28),m=u*.03,lw=Math.max(1,u*.0016),gap=lw*3,cw=(W-m*2-gap)/2,ch=(H-m*2-gap)/2;
  const digit='0123456789'.split('').sort((a,b)=>J.metrics.adv(mono,b)-J.metrics.adv(mono,a))[0];
  const osd=(x0,y0,x1,y1,f,live)=>{item({text:'CAM '+String(p.cam0+3).replace(/\d/g,digit),font:mono,size:f,align:'left',x:x0+f*.8,y:y0+f*1.2,track:.1});item({text:digit.repeat(4)+'/'+digit.repeat(2)+'/'+digit.repeat(2)+' '+digit.repeat(2)+':'+digit.repeat(2)+':'+digit.repeat(2),font:mono,size:f*.9,align:'right',x:x1-f*.8,y:y1-f*1.1,track:.06});if(live){item({text:'REC',font:mono,size:f,align:'left',x:x1-f*3.3,y:y0+f*1.2});box(x1-f*4.22,y0+f*.88,x1-f*3.58,y0+f*1.52);}};
  let fx=m,fy=m,fw=W-2*m,fh=H-2*m;
  for(let k=0;k<(p.v==='quad'?4:1);k++){const x0=p.v==='quad'?m+k%2*(cw+gap):m,y0=p.v==='quad'?m+Math.floor(k/2)*(ch+gap):m,w=p.v==='quad'?cw:W-2*m,h=p.v==='quad'?ch:H-2*m;box(x0,y0,x0+w,y0+h,lw*8+2);const active=p.v!=='quad'||k===p.act%4;if(active){fx=x0;fy=y0;fw=w;fh=h;osd(x0,y0,x0+w,y0+h,fs,true);}else{osd(x0,y0,x0+w,y0+h,fs*.8,false);item({text:'NO SIGNAL',font:mono,size:fs*1.1,x:x0+w/2,y:y0+h/2,track:.2});}}
  const text=J.splitLines(flat(cut.text),p.v==='quad'?(port?4:7):(port?5:11)),size=Math.min(J.fitSize(text,p.font,fw*.82,fh*.46,{track:.05,lead:1.2}),fh*.3),it={text,font:p.font,size,x:fx+fw/2,y:fy+fh/2,track:.05,lead:1.2};item(it,true);
  box(fx,fy,fx+fw,fy+fh*1.05);
  if(p.box){const raw=S.itemEnvelope(it,cut).bounds,b={x0:it.x+raw.x0,y0:it.y+raw.y0,x1:it.x+raw.x1,y1:it.y+raw.y1},pd=size*.33,tail=Math.max(1.2,lw*1.4)*5+2,label=J.measure({text:'MOTION '+digit.repeat(2),font:mono,size:fs*.75,track:.1});box(b.x0-pd,b.y0-pd-fs*.7-label.h,b.x1+pd+label.w,b.y1+pd,tail);}

 }else return null;
 return {bounds:A.bounds(polys),body:A.bounds(bodies),renderScale:scale};
}
function prepare(plan,cut,{scale=1,region,previous}={}){
 const no=reason=>({diagnostic:{cut:cut.index,status:'unsupported',reason,layout:cut.layout}});
 if(unsupported.has(cut.layout))return no(unsupported.get(cut.layout));
 const p=cut.params;
 if(cut.layout==='hrStaticTv'&&(!Number.isFinite(p.off)||Math.abs(p.off)>.06)||cut.layout==='hrWallScrawl'&&(!Number.isInteger(p.rows)||p.rows<7||p.rows>10)||cut.layout==='hrRedacted'&&(!Number.isFinite(p.row)||p.row<.42||p.row>.58||!Number.isFinite(p.stampAng))||cut.layout==='hrWrongShadow'&&(!Number.isFinite(p.k)||p.k<1.5||p.k>1.9)||cut.layout==='hrWrongOne'&&(!Number.isFinite(p.sink)||p.sink<0||p.sink>.2)||cut.layout==='hrMissing'&&(!Number.isFinite(p.ang)||Math.abs(p.ang)>3.5||!Number.isFinite(p.off)||Math.abs(p.off)>.06)||cut.layout==='hrSpiritPhoto'&&(!Number.isFinite(p.ang)||Math.abs(p.ang)>5||!Array.isArray(p.spot)||p.spot.length!==2||!p.spot.every(v=>Number.isFinite(v)&&v>=0&&v<=1)||![-1,1].includes(p.side))||cut.layout==='hrCctv'&&(!['quad','single'].includes(p.v)||!Number.isInteger(p.act)||p.act<0||p.act>3||!Number.isInteger(p.cam0)||p.cam0<1||p.cam0>12))return no('HORROR_PARAMETER_DOMAIN');
 if(cut.area?.angle||cut.placementTrajectory)return no('UNSUPPORTED_NATIVE_VIEWPORT_ROTATION');
 if((cut.decor||[]).some(d=>!J.DECOR[d.id]))return no('HORROR_UNDECLARED_DECOR');
 if(!['none','hardShadow'].includes(cut.treat||'none'))return no('HORROR_COUPLED_TREATMENT');
 const area=cut.area,W=area?plan.W*area.w:plan.W,H=area?plan.H*area.h:plan.H,local=geometry(plan,cut,W,H,scale);if(!local)return no('HORROR_SOURCE_BODY_UNAVAILABLE');
 const domain=S.domain(plan,{...cut,simpleCircleClip:!!area},region,A.nativeBlockCircle.viewportProject(plan,cut,scale)),candidates=[];
 for(const r of domain.regions){const v=domain.place(local,r);if(v)candidates.push({...v,region:r,fitness:Math.abs(Math.log(((local.bounds.x1-local.bounds.x0)/(local.bounds.y1-local.bounds.y0))/((r.x1-r.x0)/(r.y1-r.y0)))),distance:Math.hypot(v.offset[0]/plan.W,v.offset[1]/plan.H)});}
 const old=previous?.policy===S.policy?previous.diagnostics.find(d=>d.cut===cut.index&&d.status==='safe'):null;candidates.sort((a,b)=>b.region.score-a.region.score||a.fitness-b.fitness||a.distance-b.distance||Number(b.region.direction===old?.direction)-Number(a.region.direction===old?.direction));const win=candidates[0];if(!win)return {diagnostic:{cut:cut.index,status:'insufficient-space',reason:'NO_SAFE_HORROR_COMPOSITION',layout:cut.layout,sourceBounds:local.bounds}};
 const prior=previous?.plan.cuts.find(c=>c.index===cut.index)?.simpleCircleRecipe?.horror;if(old?.direction===win.region.direction&&prior?.layout===cut.layout){const envelope=domain.fit(local,prior.offset,win.region);if(envelope){win.offset=prior.offset.slice();win.envelope=envelope;win.reusedPosition=true;}}
 return {area:area?{...area,x:area.x+win.offset[0]/plan.W,y:area.y+win.offset[1]/plan.H}:null,recipe:{layout:cut.layout,W,H,offset:win.offset,nativeViewport:!!area},diagnostic:{cut:cut.index,status:'safe',method:'horror-native-composition-formula',direction:win.region.direction,region:win.region,envelope:win.envelope,reusedPosition:!!win.reusedPosition,allClockGeneration:false}};
}
A.horrorCircle=Object.freeze({ids,handles,prepare,geometry});
for(const id of ids){const render=J.LAYOUTS[id].render;J.LAYOUTS[id].render=function(env){const recipe=env.cut.simpleCircleRecipe?.horror;if(!recipe||recipe.nativeViewport)return render(env);env.ctx.save();try{env.ctx.translate(...recipe.offset);return render({...env,W:recipe.W,H:recipe.H});}finally{env.ctx.restore();}};}
})();
