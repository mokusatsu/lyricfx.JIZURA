/* Kinetic native motion intervals. Keep the source clocks, glyph order and attached objects. */
(() => {
'use strict';
const A=J.placement,S=A.simpleCircle,DEG=J.DEG;
// Word splitting and balanced flow keep the kinetic1 source formulas.
const U=env=>Math.min(env.W,env.H),isPort=env=>env.H>env.W*1.08;
const strip=t=>String(t||'').replace(/\s+/g,''),hasLatin=t=>/[A-Za-z]/.test(String(t||''));
const flat=t=>hasLatin(t)?String(t||'').trim().replace(/\s+/g,' '):strip(t),gcount=t=>[...strip(t)].length;
const monoF=env=>(env.st.fonts.mono&&env.st.fonts.mono[0])||'mono';
const em=(text,font,o)=>J.measure({text,font,size:100,...o}).w/100;
const rotV=(x,y,a)=>{const c=Math.cos(a*DEG),s=Math.sin(a*DEG);return[x*c-y*s,x*s+y*c];};

/* ---- word units: the cut's word chunks, merged / split to a usable count ---- */
const unitCache = new Map();
function splitUnit(s) {
  const t = String(s).trim();
  if (/\s/.test(t)) {                                   // latin phrase: at the space nearest the middle
    const mid = t.length / 2; let bi = -1, bd = 1e9;
    for (let i = 0; i < t.length; i++) if (t[i] === ' ' && Math.abs(i - mid) < bd) { bd = Math.abs(i - mid); bi = i; }
    return [t.slice(0, bi).trim(), t.slice(bi + 1).trim()];
  }
  const n = [...t].length;
  const parts = J.splitLines(t, Math.ceil(n / 2)).split('\n');
  return parts.length >= 2 ? [parts[0], parts.slice(1).join('')] : [t];
}
function unitsOf(cut, maxU = 6, minU = 1) {
  const text = String(cut.text || '');
  const key = text + '\u0002' + (cut.words || []).join('\u0001') + '\u0002' + maxU + ':' + minU;
  let w = unitCache.get(key);
  if (w) return w;
  const lat = hasLatin(text);
  w = (cut.words && cut.words.length ? cut.words : (J.chunkText ? J.chunkText(text) : text.split(/\s+/))).map(s => String(s).trim()).filter(Boolean);
  if (strip(w.join('')) !== strip(text)) w = J.chunkText ? J.chunkText(text).map(s => String(s).trim()).filter(Boolean) : [text.trim()];
  if (!w.length) w = [text.trim() || '…'];
  while (w.length > maxU) {                             // merge the shortest neighbouring pair
    let bi = 0, bv = 1e9;
    for (let i = 0; i < w.length - 1; i++) { const v = gcount(w[i]) + gcount(w[i + 1]); if (v < bv) { bv = v; bi = i; } }
    w.splice(bi, 2, w[bi] + (lat ? ' ' : '') + w[bi + 1]);
  }
  for (let g = 0; g < 8 && w.length < minU; g++) {      // split the longest splittable unit
    let bi = -1, bv = 1;
    w.forEach((s, i) => { const n = gcount(s), ok = /\s/.test(s) || (!hasLatin(s) && n >= 2); if (ok && n > bv) { bv = n; bi = i; } });
    if (bi < 0) break;
    const parts = splitUnit(w[bi]);
    if (parts.length < 2 || !parts[0] || !parts[1]) break;
    w.splice(bi, 1, parts[0], parts[1]);
  }
  if (unitCache.size > 400) unitCache.clear();
  unitCache.set(key, w);
  return w;
}

/* ---- flow units into balanced lines that fit a box; positions are unit centres relative to the box centre ---- */
function partitions(n, L) {
  const out = [];
  const rec = (start, left, acc) => {
    if (left === 1) { out.push(acc.concat([[start, n]])); return; }
    for (let e = start + 1; e <= n - left + 1; e++) rec(e, left - 1, acc.concat([[start, e]]));
  };
  if (L >= 1 && L <= n) rec(0, L, []);
  return out;
}
function flowUnits(units, font, maxW, maxH, o = {}) {
  const lat = units.some(hasLatin), sp = o.sp != null ? o.sp : (lat ? 0.32 : 0.08), lead = o.lead || 1.22, track = o.track || 0;
  const ws = units.map(t => em(t, font, { track }));
  const n = units.length;
  let best = null;
  for (let L = 1; L <= Math.min(n, o.maxLines || 4); L++) {
    let bp = null, bw = 1e9;
    for (const pt of partitions(n, L).slice(0, 80)) {
      const lw = pt.map(([a, b]) => { let w = 0; for (let i = a; i < b; i++) w += ws[i] + (i > a ? sp : 0); return w; });
      const mw = Math.max(...lw);
      if (mw < bw) { bw = mw; bp = { pt, lw }; }
    }
    if (!bp) continue;
    const size = Math.min(maxW / bw, maxH / (L * lead - (lead - 1)), o.maxSize || 1e9);
    if (!best || size > best.size * (o.lineBonus || 1.1)) best = { size, L, pt: bp.pt, lw: bp.lw };
  }
  const size = best.size, pos = new Array(n);
  best.pt.forEach(([a, b], li) => {
    const y = (li - (best.L - 1) / 2) * lead * size;
    let x = -best.lw[li] * size / 2;
    for (let i = a; i < b; i++) { const w = ws[i] * size; pos[i] = { x: x + w / 2, y, w, li }; x += w + sp * size; }
  });
  return { size, pos, L: best.L, w: Math.max(...best.lw) * size, h: (best.L * lead - (lead - 1)) * size, ws };
}

const ids=new Set(['knSlamStack','knQuarterTurn','knSwapCenter','knZoomDive','knFlowSnap','knSeesaw','knTypeSlam','knRhythmCuts','knCollide','knTumble','knReflow','knPadGrid']);
// knPathRide / knGearWords are the approved center-preserving compositions.
const handles=(plan,cut)=>ids.has(cut.layout)&&(S.preparedCut(plan,cut)||A.placementCutPreserved86cm(plan,cut)===false);
const rect=b=>[[b.x0,b.y0],[b.x1,b.y0],[b.x1,b.y1],[b.x0,b.y1]];
function geometry(env){
 const {W,H,cut:c}=env,p=c.params,port=isPort(env),u=U(env),bounds=[],bodies=[];
 const shape=(x0,y0,x1,y1,lw=0)=>{const t=2+5*lw;bounds.push(rect({x0:x0-t,y0:y0-t,x1:x1+t,y1:y1+t}));bodies.push(rect({x0:x0-t,y0:y0-t,x1:x1+t,y1:y1+t}));};
 // A glyph's entire rotation lies in its measured circumcircle. Center ranges come
 // from the source formulas below, never from sampled frames or a common stage box.
 const text=(it,range,turn=false)=>{if(['outlineOffset','kerningWide'].includes(c.treat)){it={...it,_m:null,_lay:null};J.TREAT[c.treat].apply(env,it,c.treatP);}const g=S.itemEnvelope(it,c),metric=J.itemBox(it);g.bounds=A.bounds([rect(g.bounds),rect(metric)]);g.body=A.bounds([rect(g.body),rect(metric)]);for(const [list,b] of [[bounds,g.bounds],[bodies,g.body]]){const r=turn?Math.max(...rect(b).map(([x,y])=>Math.hypot(x,y))):0;list.push(rect({x0:range.x0+(turn?-r:b.x0),y0:range.y0+(turn?-r:b.y0),x1:range.x1+(turn?r:b.x1),y1:range.y1+(turn?r:b.y1)}));}};
 const fixed=(it,x,y,turn=false)=>text(it,{x0:x,y0:y,x1:x,y1:y},turn);
 const item=(t,size,extra={})=>({text:t,font:p.font,size,x:0,y:0,...extra});
 if(c.layout==='knPadGrid'){
  const units=unitsOf(c,6,Math.min(6,Math.max(2,Math.ceil(gcount(c.text)/4)))),n=units.length,cols=port?(n<=3?1:2):(n<=3?n:n===4?2:3),rows=Math.ceil(n/cols),gw=W*(port?.84:.86),gh=H*(port?.62:.72),g=u*.02,cw=(gw-g*(cols-1))/cols,ch=Math.min((gh-g*(rows-1))/rows,cw*(port?.8:.75)),x0=W/2-gw/2,y0=H/2-(ch*rows+g*(rows-1))/2,lw=Math.max(1.5,u*.003),a=1.4,q=1+4*a**3/(27*(a+1)**2),sizes=units.map(t=>Math.min(J.fitSize(t,p.font,cw*.8,ch*.62,{track:.02}),ch*.5)),sz=Math.min(...sizes)*1.25;
  for(let i=0;i<cols*rows;i++){const x=x0+(i%cols)*(cw+g),y=y0+Math.floor(i/cols)*(ch+g),cx=x+cw/2,cy=y+ch/2;shape(cx-cw*q/2,cy-ch*q/2,cx+cw*q/2,cy+ch*q/2,lw);if(i<n)fixed(item(units[i],Math.min(sizes[i],sz)*1.12,{track:.02}),cx,cy);}
 }else if(c.layout==='knReflow'){
  const lat=hasLatin(c.text),t=lat?flat(c.text):strip(c.text),chars=[...t],n=chars.length,cols=n<=(port?7:5)?1:n<=12?2:3,per=Math.ceil(n/cols),vt=[];for(let i=0;i<n;i+=per)vt.push(chars.slice(i,i+per).join(''));
  const vtext=vt.join('\n'),htext=J.splitLines(t,lat?(port?13:20):(port?7:14)),sv=Math.min(J.fitSize(vtext,p.font,W*.5,H*.8,{vertical:true,lead:1.3,track:.04}),W*.3),sh=Math.min(J.fitSize(htext,p.font,W*.84,H*.4,{lead:1.25,track:.04}),H*.24),LV=J.layoutText({text:vtext,font:p.font,size:sv,vertical:true,lead:1.3,track:.04}).filter(g=>g.ch.trim()),LH=J.layoutText({text:htext,font:p.font,size:sh,lead:1.25,track:.04}).filter(g=>g.ch.trim()),aa=p.dir==='h2v'?LH:LV,bb=p.dir==='h2v'?LV:LH,sa=p.dir==='h2v'?sh:sv,sb=p.dir==='h2v'?sv:sh;
  for(let i=0;i<Math.min(aa.length,bb.length);i++){const a=aa[i],b=bb[i],ax=W/2+a.x+a.vx,ay=H/2+a.y+a.vy,bx=W/2+b.x+b.vx,by=H/2+b.y+b.vy,k=p.swirl*.35*(i%2?1:.6),cx=(ax+bx)/2-(by-ay)*k,cy=(ay+by)/2+(bx-ax)*k;text(item(a.ch,Math.max(sa*(a.fs||1),sb*(b.fs||1))),{x0:Math.min(ax,bx,cx),y0:Math.min(ay,by,cy),x1:Math.max(ax,bx,cx),y1:Math.max(ay,by,cy)},true);}
 }else if(c.layout==='knSeesaw'){
  const units=unitsOf(c,6,2),F=flowUnits(units,p.font,W*.78,H*.2,{maxLines:1,maxSize:H*.17,track:.03,sp:hasLatin(c.text)?.4:.22}),s=F.size,th=Math.max(4,s*.1),half=F.w/2+s*.6,px=W/2,py=H*(port?.55:.6),fh=s*.62;
  // Every target is within +-11 degrees; target+(previous-target)*spring
  // therefore stays within +-33 degrees (abs(spring)<=1).
  const angle=33*DEG,sn=Math.sin(angle),rotateBox=(b)=>{const pts=[];for(const [x,y] of rect(b)){const phi=Math.atan2(y,x),r=Math.hypot(x,y),angles=[-angle,angle];for(let k=-2;k<=2;k++){const a=k*Math.PI/2-phi;if(a>-angle&&a<angle)angles.push(a);}for(const a of angles)pts.push([px+x*Math.cos(a)-y*Math.sin(a),py+x*Math.sin(a)+y*Math.cos(a)]);}return A.bounds([pts]);};
  const plank=rotateBox({x0:-half,y0:-th/2,x1:half,y1:th/2});shape(plank.x0,plank.y0,plank.x1,plank.y1);shape(px-fh*.62,py+th/2,px+fh*.62,py+th/2+fh);
  units.forEach((t,i)=>{const x=F.pos[i].x,v=-th/2-s*.54,range=rotateBox({x0:x,y0:v,x1:x,y1:v});range.x0-=sn*s*.11;range.x1+=sn*s*.11;range.y0-=H*.55;range.y1+=s*.11;text(item(t,s,{track:.03,sx:1+.22*.6}),range,true);});
 }else if(c.layout==='knTumble'){
  const units=unitsOf(c,5,2),F=flowUnits(units,p.font,W*.82,H*(port?.4:.3),{maxSize:H*.2,track:.02,sp:hasLatin(c.text)?.5:.3,lead:1.6}),s=F.size,pad=s*.14,h=s+2*pad,lw=Math.max(1.5,u*.0025);
  units.forEach((t,i)=>{const q=F.pos[i],w=q.w+2*pad,base=H/2+q.y+h/2,xf=W/2+q.x-w/2,m=Math.min(3,Math.max(1,Math.ceil((W-xf)/(2*(w+h))))),r=Math.hypot(w,h)/2,range={x0:xf-r,y0:base-r,y1:base+r+h*.05,x1:xf+m*2*(w+h)+r};if(p.box!=='none')shape(range.x0-r*1.05,range.y0-r,range.x1+r*1.05,range.y1+r,lw);text(item(t,s,{track:.02,sx:1.05}),range,true);if(p.floor){const row=F.pos.filter(a=>a.li===q.li);shape(W/2+row[0].x-row[0].w/2-pad*3,base+lw,W/2+row.at(-1).x+row.at(-1).w/2+pad*3,base+lw,lw);}});
 }else if(c.layout==='knCollide'){
  const units=unitsOf(c,8,2),lat=hasLatin(c.text);let best=1,bd=Infinity,acc=0,tot=units.reduce((a,t)=>a+gcount(t),0);for(let i=1;i<units.length;i++){acc+=gcount(units[i-1]);const d=Math.abs(acc-tot/2);if(d<bd){bd=d;best=i;}}const aa=units.slice(0,best).join(lat?' ':''),bb=units.slice(best).join(lat?' ':''),g=lat?.35:.14;let s,pa,pb;
  if(!port){s=Math.min(J.fitSize(aa+(lat?' ':'')+bb,p.font,W*.86,H*.3,{track:.02}),H*.24);const wa=em(aa,p.font,{track:.02})*s,wb=em(bb,p.font,{track:.02})*s,x0=W/2-(wa+wb+g*s)/2;pa=[x0+wa/2,H/2];pb=[x0+wa+g*s+wb/2,H/2];}else{s=Math.min(J.fitSize(aa,p.font,W*.86,H*.2,{track:.02}),J.fitSize(bb,p.font,W*.86,H*.2,{track:.02}),W*.3);pa=[W/2,H/2-s*.62];pb=[W/2,H/2+s*.62];}
  const D=port?Math.max(pa[1],H-pb[1])+s*.7:Math.max(pa[0]+em(aa,p.font,{track:.02})*s/2,W-pb[0]+em(bb,p.font,{track:.02})*s/2)+s*.2;
  [aa,bb].forEach((t,i)=>{const pp=i?pb:pa,sgn=i?-1:1,lo=sgn>0?-Math.max(D,s*.28):-s*.28,hi=sgn>0?s*.28:Math.max(D,s*.28),range={x0:pp[0]-s*.05+(port?0:lo),x1:pp[0]+s*.05+(port?0:hi),y0:pp[1]-s*.05+(port?lo:0),y1:pp[1]+s*.05+(port?hi:0)};text(item(t,s,{track:.02}),range);const len=s*2.8,lw=Math.max(1.5,u*.0028),w=em(t,p.font)*s/2;if(!port)shape(range.x0-w-s*.2-len,pp[1]-s*.42,range.x1+w+s*.2+len,pp[1]+s*.42,lw);else shape(pp[0]-s*.42*1.6,range.y0-s*.7-len,pp[0]+s*.42*1.6,range.y1+s*.7+len,lw);});
  if(p.spark){const r=s*1.74,cx=port?W/2:(pa[0]+em(aa,p.font)*s/2+pb[0]-em(bb,p.font)*s/2)/2;shape(cx-r,H/2-r,cx+r,H/2+r,Math.max(1.5,u*.0028)*1.4);}
 }else if(c.layout==='knSlamStack'){
  const units=unitsOf(c,port?6:5,2),ms=units.map(t=>em(t,p.font,{track:.02})),cap=Math.min(H*.34,W*.44),Hb=H*(port?.66:.8),gap=.08,maxW=W*(p.tilt?.8:.86);
  const lay=k=>{let w=maxW,sizes=[];for(let q=0;q<5;q++){sizes=ms.slice(0,k).map(m=>Math.min(w/m,cap));const lo=Math.min(...sizes)*2.2;sizes=sizes.map(s=>Math.min(s,lo));const h=sizes.reduce((a,b)=>a+b,0)+gap*sizes[0]*(k-1);if(h<=Hb)break;w*=Hb/h;}const g=gap*sizes[0],tot=sizes.reduce((a,b)=>a+b,0)+g*(k-1),ys=[];let y=-tot/2;for(const s of sizes){ys.push(y+s/2);y+=s+g;}return {sizes,ys,sw:Math.max(...sizes.map((s,i)=>s*ms[i]))};};
  for(let k=1;k<=units.length;k++){const aa=lay(k),bb=k>1?lay(k-1):aa,sw=Math.max(aa.sw,bb.sw);for(let i=0;i<k;i++){const fresh=i===k-1,s=Math.max(aa.sizes[i],fresh?0:bb.sizes[i]),y0=Math.min(aa.ys[i],fresh?aa.ys[i]:bb.ys[i])-(p.from==='drop'&&fresh?H*.7:0)-aa.sizes[k-1]*.07,y1=Math.max(aa.ys[i],fresh?aa.ys[i]:bb.ys[i])+aa.sizes[k-1]*.07,side=p.from!=='drop'&&p.from!=='scale'&&fresh?W*.9:0,x0=(p.align==='left'?-sw/2:p.align==='right'?0:0)-side,x1=(p.align==='right'?sw/2:p.align==='left'?0:0)+side;let range={x0:W/2+x0,y0:H/2+y0,x1:W/2+x1,y1:H/2+y1};if(p.tilt){const pts=rect(range).map(([x,y])=>{const r=rotV(x-W/2,y-H/2,p.tilt);return[W/2+r[0],H/2+r[1]];});range=A.bounds([pts]);}text(item(units[i],s*(fresh&&p.from==='scale'?2.6:1),{track:.02,align:p.align==='left'?'left':p.align==='right'?'right':'center'}),range,!!p.tilt||fresh&&p.from==='scale');}if(p.rule&&!p.tilt)shape(W/2-sw/2,H/2-Hb/2,W/2+sw/2,H/2+Hb/2+cap*.6,Math.max(1.5,u*.003));}
 }else if(c.layout==='knSwapCenter'){
  const units=unitsOf(c,6,2),big=units.map(t=>Math.min(J.fitSize(t,p.font,W*.8,H*.4,{track:.02}),H*.34,W*.6)),F=flowUnits(units,p.fontL,W*.84,H*(port?.46:.34),{maxSize:H*(port?.13:.2),track:.03});
  units.forEach((t,i)=>{const s=big[i],range={x0:W/2-(p.mode==='slide'?W*.7:0),x1:W/2+(p.mode==='slide'?W*.7:0),y0:H/2-(p.mode==='roll'?s*1.05:0),y1:H/2+(p.mode==='roll'?s*1.05:0)};text(item(t,s*(p.mode==='punch'?1.9:1),{track:.02}),range);const q=F.pos[i],resolve={x0:W/2+Math.min(0,q.x),x1:W/2+Math.max(0,q.x),y0:H/2+Math.min(0,q.y),y1:H/2+Math.max(0,q.y)};for(const font of [p.font,p.fontL])for(const track of [.02,.03])text(item(t,Math.max(s,F.size),{font,track}),resolve);});
  if(p.ticks){const tw=u*.035,th=Math.max(3,u*.006),gx=tw*1.5;shape(W/2-(units.length-1)*gx/2-tw/2,H/2+Math.min(...big)*.5+u*.08,W/2+(units.length-1)*gx/2+tw/2,Math.min(H*.9,H/2+Math.max(...big)*.5+u*.08)+th);}
 }else if(c.layout==='knTypeSlam'){
  const t=flat(c.text),units=unitsOf(c,6,1);let ki=units.length-1;if(p.key==='long'){let best=-1;units.forEach((t,i)=>{const v=gcount(t)+(/[一-鿿]/.test(t)?.5:0);if(v>best){best=v;ki=i;}});}const key=units[ki],font=monoF(env),ts=Math.min(J.fitSize(t,font,W*.86,H*.08,{track:.06}),u*.065),tm=J.measure({text:t,font,size:ts,track:.06}),ks=Math.min(J.fitSize(key,p.font,W*.84,H*(port?.3:.44),{track:.01}),H*.34,W*.5),ky=H/2+(p.side==='above'?ts*1.2:-ts*1.2),ty=p.side==='above'?ky-ks*.62-ts*1.5:ky+ks*.62+ts*1.5,x0=W/2-tm.w/2;
  text(item(t,ts,{font,align:'left',track:.06}),{x0:x0-ts*.35,y0:ty-ts*.35,x1:x0+ts*.35,y1:ty+ts*.35});fixed(item(key,ks*3.4,{track:.01,sx:1.06}),W/2,ky);shape(x0,ty-ts*.5,x0+tm.w+ts*1.65,ty+ts*.74);if(p.burst){const m=J.measure({text:key,font:p.font,size:ks,track:.01}),r=Math.max(m.w,m.h)*.55+ks*.9*.15+u*.125+u*.05,ry=r*(m.h/Math.max(m.w,m.h)+.35);shape(W/2-r,ky-ry,W/2+r,ky+ry,Math.max(2,u*.004));}
 }else if(c.layout==='knFlowSnap'){
  const lat=hasLatin(c.text),t=flat(c.text),chars=[...t];let ft,trk;if(lat){ft=J.splitLines(t,port?10:18);trk=.02;}else{const n=chars.length,c0=Math.max(2,Math.min(port?4:6,Math.ceil(Math.sqrt(n*(port?.7:1.6))))),cols=Math.ceil(n/Math.ceil(n/c0)),rows=[];for(let i=0;i<n;i+=cols)rows.push(chars.slice(i,i+cols).join(''));ft=rows.join('\n');trk=.3;}const lead=lat?1.25:1.3,fsz=Math.min(J.fitSize(ft,p.font,W*.8,H*(port?.5:.62),{track:trk,lead}),H*.2),lay=J.layoutText({text:ft,font:p.font,size:fsz,track:trk,lead,align:lat?'center':'left'}),ox=W/2-(lat?0:lay.W/2),gl=lay.filter(g=>g.ch!=='\n'),advs=gl.map((g,i)=>J.metrics.adv(p.font,g.ch)*1.08+(i>0&&g.li!==gl[i-1].li?.35:0)),tot=advs.reduce((a,b)=>a+b,0),fs=Math.min(H*.15,W*.95/Math.max(4,tot)),amp=Math.min(H*p.amp,W*.16);let acc=0;
  gl.forEach((g,i)=>{const off=(acc+advs[i]/2)*fs;acc+=advs[i];if(!g.ch.trim())return;const fx=W/2-tot*fs/2+off,tx=ox+g.x,ty=H/2+g.y,s=Math.max(fs,fsz*(g.fs||1));text(item(g.ch,s),{x0:Math.min(fx,tx),x1:Math.max(W+s,tx),y0:Math.min(H/2-amp,ty),y1:Math.max(H/2+amp,ty)},true);});
  // The original rail is a continuous sine trace, then the native grid resolves.
  shape(-20,H/2-amp,W+20,H/2+amp,Math.max(1,u*.0015));if(!lat&&p.grid==='cells'){const cell=fsz*(1+trk),rows=ft.split('\n').length,cols=Math.max(...ft.split('\n').map(r=>[...r].length)),gx=ox-fsz*trk/2,gy=H/2-lay.H/2-(cell-fsz)/2-(fsz*lead-cell)/2;shape(gx,gy,gx+cols*cell,gy+rows*fsz*lead,Math.max(1,u*.0016));}else ft.split('\n').forEach((ln,i)=>{const w=J.measure({text:ln,font:p.font,size:fsz,track:trk}).w,y=H/2+(i-(ft.split('\n').length-1)/2)*fsz*lead+fsz*.62,x=lat?W/2-w/2:ox;shape(x,y,x+w,y,Math.max(1,u*.0016)*1.5);});
 }else if(c.layout==='knQuarterTurn'){
  const units=unitsOf(c,4,2),L=units.map(t=>em(t,p.font,{track:.03})),last=units.map(t=>J.metrics.adv(p.font,[...t.trim()].pop()||'字')),chain=[];let sx=0,sy=0,a=0;
  for(let i=0;i<units.length;i++){if(i){const pd=rotV(1,0,a),na=a+90*p.sgn*(i%2?1:-1),nd=rotV(1,0,na),prev=chain[i-1];sx=prev.ex-pd[0]*last[i-1]*.5+nd[0]*.62;sy=prev.ey-pd[1]*last[i-1]*.5+nd[1]*.62;a=na;}const d=rotV(1,0,a);chain.push({a,cx:sx+d[0]*L[i]/2,cy:sy+d[1]*L[i]/2,ex:sx+d[0]*L[i],ey:sy+d[1]*L[i]});}
  const cams=chain.map((g,i)=>({x:g.cx,y:g.cy,z:Math.min(W*.76/L[i],H*.3,W*.42)})),box={x0:Infinity,y0:Infinity,x1:-Infinity,y1:-Infinity};chain.forEach((g,i)=>{const vertical=Math.abs(g.a%180)>45,rx=vertical?.55:L[i]/2,ry=vertical?L[i]/2:.55;box.x0=Math.min(box.x0,g.cx-rx);box.x1=Math.max(box.x1,g.cx+rx);box.y0=Math.min(box.y0,g.cy-ry);box.y1=Math.max(box.y1,g.cy+ry);});if(p.end!=='last')cams.push({x:(box.x0+box.x1)/2,y:(box.y0+box.y1)/2,z:Math.min(W*.84/(box.x1-box.x0),H*.78/(box.y1-box.y0),H*.3)});
  const z=Math.max(...cams.map(g=>g.z)),pop=1+4*2.2**3/(27*3.2**2);chain.forEach((g,i)=>{const r=Math.max(...cams.map(cam=>Math.hypot(g.cx-cam.x,g.cy-cam.y)))*z;text(item(units[i],z*(i?pop:1),{track:.03}),{x0:W/2-r,y0:H/2-r,x1:W/2+r,y1:H/2+r},true);if(p.joint&&i){const prev=chain[i-1],d=rotV(1,0,prev.a),jx=prev.ex+d[0]*.35,jy=prev.ey+d[1]*.35,rj=Math.max(...cams.map(cam=>Math.hypot(jx-cam.x,jy-cam.y)))*z+z*.16*(1+4*2**3/(27*3**2))/Math.SQRT2;shape(W/2-rj,H/2-rj,W/2+rj,H/2+rj);}});
 }else if(c.layout==='knZoomDive'){
  if(p.cap)return {reason:'KINETIC_FOCUS_CAPTION_BB_RANGE_UNAVAILABLE'};
  const units=unitsOf(c,5,2);units.forEach(t=>{const size=Math.min(J.fitSize(t,p.font,W*.78,H*.4,{track:.02}),H*.34,W*.6),gs=J.layoutText({text:t,font:p.font,size:1,track:.02}).filter(g=>g.ch.trim()),g=gs.find(g=>J.isKanji(g.ch))||gs[Math.floor(gs.length/2)]||{x:0,y:0},xs=[W/2+g.x*size-g.x*size*36,W/2-g.x*size*36,W/2],ys=[H/2+g.y*size-g.y*size*36,H/2-g.y*size*36,H/2];text(item(t,size*36,{track:.02,noHold:true}),{x0:Math.min(...xs),x1:Math.max(...xs),y0:Math.min(...ys),y1:Math.max(...ys)});fixed(item(t,size,{track:.02}),W/2,H/2);});
 }else if(c.layout==='knRhythmCuts'){
  const units=unitsOf(c,5,2),shots=p.shots||['huge','vert','small','crop','band','tilt'];
  units.forEach((t,i)=>{const shot=shots[i%6],vtxt=hasLatin(t)?t:strip(t);let it=item(t,1,{track:.02}),x=W/2,y=H/2;
   if(shot==='huge')it.size=Math.min(J.fitSize(t,p.font,W*.82,H*.6,{track:.02}),H*.54);
   else if(shot==='vert'&&!hasLatin(t)){it={...it,text:vtxt,vertical:true,size:Math.min(J.fitSize(vtxt,p.font,W*.4,H*.8,{vertical:true,track:.02}),W*(port?.34:.26))};x+=p.side*W*(port?.18:.22);}
   else if(shot==='small'||shot==='vert'){it={...it,font:p.fontB,track:.12,size:Math.min(J.fitSize(t,p.fontB,W*.4,H*.12,{track:.12}),H*.1)};const m=J.measure(it),pw=m.w/2+it.size*.8,ph=m.h/2+it.size*.6;shape(W/2-pw*1.3,H/2-ph*1.3,W/2+pw*1.3,H/2+ph*1.3,Math.max(2,u*.003));}
   else if(shot==='crop'){it={...it,track:0,align:'left',size:Math.min(J.fitSize(t,p.font,W*1.02,H*.7,{track:0}),H*.66)};x=W*.97-J.measure(it).w;y+=H*.04;}
   else if(shot==='band'){it={...it,track:.06,size:Math.min(J.fitSize(t,p.font,W*.8,H*.24,{track:.06}),H*.22)};shape(0,H/2-it.size*1.55/2,W,H/2+it.size*1.55/2);}
   else{it.size=Math.min(J.fitSize(t,p.font,W*.72,H*.4,{track:.02}),H*.34);it.rot=-8*p.side;}
   it.size*=1.1;fixed(it,x,y,!!it.rot);
  });const F=flowUnits(units,p.fontB,W*.84,H*(port?.42:.34),{maxSize:H*.16,track:.04}),ox=p.fin==='left'?W*.08+F.w/2:W/2;
  units.forEach((t,i)=>{const pos=F.pos[i];text(item(t,F.size*1.06,{font:p.fontB,track:.04}),{x0:ox+Math.min(pos.x,pos.x*1.06),x1:ox+Math.max(pos.x,pos.x*1.06),y0:H/2+Math.min(pos.y,pos.y*1.06),y1:H/2+Math.max(pos.y,pos.y*1.06)});});const all=A.bounds(bounds),lineX=p.fin==='left'?W*.08:W/2-F.w/2;shape(lineX,all.y0+F.size*.25,lineX+F.w,all.y1+F.size*.25,Math.max(2,u*.004));
 }else return {reason:'KINETIC_SOURCE_RANGE_UNAVAILABLE'};
 return bounds.length?{bounds:A.bounds(bounds),body:A.bounds(bodies)}:{reason:'KINETIC_EMPTY_SOURCE_RANGE'};
}
function prepare(plan,cut,{scale=1,region,previous}={}){
 const reject=(reason,status='unsupported',extra={})=>({diagnostic:{cut:cut.index,status,layout:cut.layout,reason,...extra}});
 if(cut.area?.angle)return reject('UNSUPPORTED_NATIVE_VIEWPORT_ROTATION');
 // Preserve native treatment application; measured items use the same source
 // stroke, offset and tracking before the shared glyph support is computed.
 if(!['cut','flicker','inkBleed','magnet','neonOn','cursorSweep','resolve'].includes(cut.enter)||!['cut','overexposeOut'].includes(cut.exit)||!['still','flashBox'].includes(cut.hold)||!['none','hardShadow','outlineOffset','kerningWide'].includes(cut.treat||'none'))return reject('UNSUPPORTED_KINETIC_GLYPH_FX');
 const area=cut.area,W=plan.W,H=plan.H,sw=area?W*area.w:W,sh=area?H*area.h:H,st={...(cut.effectStyle||plan.style),...(cut.fonts?{fonts:cut.fonts}:{})};let local;
 try{local=geometry({W:sw,H:sh,cut,plan,st,sc:cut.palette||st.schemes[cut.scheme%st.schemes.length]});}catch(e){if(!e.code||!['UNSUPPORTED_','SOURCE_FORMULA_'].some(prefix=>e.code.startsWith(prefix)))throw e;return reject(e.code,'unsupported',{details:e.message});}if(local.reason)return reject(local.reason);
 local.renderScale=scale;const domain=S.domain(plan,{...cut,simpleCircleClip:!!area},region,A.nativeBlockCircle.viewportProject(plan,cut,scale)),candidates=[];
 for(const r of domain.regions){const placed=domain.place(local,r);if(placed)candidates.push({...placed,region:r,distance:Math.hypot(placed.offset[0]/W,placed.offset[1]/H),fitness:Math.abs(Math.log(((local.body.x1-local.body.x0)/(local.body.y1-local.body.y0))/((r.x1-r.x0)/(r.y1-r.y0))))});}
 const old=previous?.policy===S.policy?previous.diagnostics.find(d=>d.cut===cut.index&&d.status==='safe'):null;candidates.sort((a,b)=>b.region.score-a.region.score||a.fitness-b.fitness||a.distance-b.distance||Number(b.region.direction===old?.direction)-Number(a.region.direction===old?.direction));const win=candidates[0];if(!win)return reject('NO_SAFE_KINETIC_NATIVE_RANGE','insufficient-space',{sourceBounds:local.bounds});
 const prior=previous?.plan.cuts.find(c=>c.index===cut.index)?.simpleCircleRecipe?.kinetic;if(old?.direction===win.region.direction&&prior?.layout===cut.layout){const envelope=domain.fit(local,prior.offset,win.region);if(envelope){win.offset=prior.offset.slice();win.envelope=envelope;win.reusedPosition=true;}}
 return {area:area?{...area,x:area.x+win.offset[0]/W,y:area.y+win.offset[1]/H}:null,recipe:{layout:cut.layout,W:sw,H:sh,offset:win.offset,nativeViewport:!!area},diagnostic:{cut:cut.index,status:'safe',method:'kinetic-native-interval',direction:win.region.direction,score:win.region.score,region:win.region,envelope:win.envelope,reusedPosition:!!win.reusedPosition,allClockGeneration:false}};
}
A.kineticCircle=Object.freeze({ids,handles,prepare});
for(const id of ids){const native=J.LAYOUTS[id].render;J.LAYOUTS[id].render=function(env){const r=env.cut.simpleCircleRecipe?.kinetic;if(!r||r.nativeViewport)return native(env);env.ctx.save();try{env.ctx.translate(...r.offset);return native({...env,W:r.W,H:r.H});}finally{env.ctx.restore();}};}
})();
