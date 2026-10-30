/* Remaining layoutsD source families: finite shape/clip supports, live native clocks.
 * Source chunk partition is copied verbatim from layoutsD; no frame recorder.
 * Full-stage cloth/planes and unbounded coupled projection keep typed unsupported.
 */
(() => {
'use strict';
const A=J.placement,S=A.simpleCircle,ID=[1,0,0,1,0,0];
const ids=new Set(['ledScroll','sliceStack','glitchGrid','mosaicTiles','maskReveal','halftoneBig','stencil']);
const hasLatin=t=>/[A-Za-z]/.test(t),strip=t=>String(t||'').replace(/\s+/g,''),flat=t=>hasLatin(t)?String(t||'').trim().replace(/\s+/g,' '):strip(t);
const splitWord = w => {
  const n = [...w].length;
  if (/[A-Za-z]/.test(w)) {
    if (/[^\x00-\x7F]/.test(w)) { const c = J.chunkText(w).filter(Boolean); if (c.length > 1) return c; }
    return n > 10 ? [w.slice(0, Math.ceil(w.length / 2)), w.slice(Math.ceil(w.length / 2))] : [w];
  }
  return n < 2 ? [w] : J.splitLines(w, Math.ceil(n / 2)).split('\n').filter(Boolean);
};
function chunksK(text, k) {
  const t = String(text || '').trim();
  if (!t) return [''];
  let words = [];
  if (/\s/.test(t) && hasLatin(t)) { const ws = t.split(/\s+/).filter(Boolean); ws.forEach((w, i) => words.push({ t: w, sp: i < ws.length - 1 })); }
  else words = J.chunkText(strip(t)).map(w => ({ t: w.trim(), sp: false })).filter(w => w.t);
  if (!words.length) words = [{ t, sp: false }];
  k = Math.max(1, Math.min(k, J.glyphCount(t)));
  const gl = w => J.glyphCount(w.t);
  const hard = new Set();
  const splitAt = idx => {
    const w = words[idx], parts = splitWord(w.t);
    if (parts.length < 2) { hard.add(w.t); return false; }
    words.splice(idx, 1, ...parts.map((q, i) => ({ t: q, sp: i === parts.length - 1 ? w.sp : false })));
    return true;
  };
  for (let guard = 0; words.length < k && guard < 20; guard++) {
    let bi = -1, bl = 1;
    words.forEach((w, i) => { if (!hard.has(w.t) && gl(w) > bl) { bl = gl(w); bi = i; } });
    if (bi < 0) break;
    splitAt(bi);
  }
  // contiguous partition into k groups with the most even glyph counts (small DP)
  const part = () => {
    const n = words.length, kk = Math.min(k, n), L = words.map(w => gl(w) + 0.4);
    const pre = [0]; L.forEach(l => pre.push(pre[pre.length - 1] + l));
    const tgt = pre[n] / kk;
    const dp = Array.from({ length: kk + 1 }, () => new Array(n + 1).fill(Infinity)), by = Array.from({ length: kk + 1 }, () => new Array(n + 1).fill(0));
    dp[0][0] = 0;
    for (let g = 1; g <= kk; g++) for (let i = g; i <= n; i++) for (let j = g - 1; j < i; j++) {
      const d = pre[i] - pre[j] - tgt, v = dp[g - 1][j] + d * d;
      if (v < dp[g][i]) { dp[g][i] = v; by[g][i] = j; }
    }
    const cuts = []; let i = n;
    for (let g = kk; g >= 1; g--) { cuts.unshift(i); i = by[g][i]; }
    const out = []; let prev = 0;
    for (const c of cuts) { out.push(words.slice(prev, c)); prev = c; }
    return out;
  };
  let groups = part();
  for (let it = 0; it < 3 && groups.length > 1; it++) {
    const lens = groups.map(g => g.reduce((a, w) => a + gl(w), 0)), mx = Math.max(...lens), mn = Math.min(...lens);
    if (mx <= mn * 1.7 + 1) break;
    const big = groups[lens.indexOf(mx)];
    let bw = null; for (const w of big) if (!hard.has(w.t) && gl(w) >= 4 && (!bw || gl(w) > gl(bw))) bw = w;
    if (!bw || !splitAt(words.indexOf(bw))) break;
    groups = part();
  }
  return groups.map(g => g.map((w, i) => w.t + (i < g.length - 1 && w.sp ? ' ' : '')).join('')).filter(Boolean);
}
const brk=(text,maxPer)=>{const t=flat(text),n=J.glyphCount(t);return n<=maxPer?t:chunksK(t,Math.ceil(n/maxPer)).join('\n');};
const rect=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
const unsupported=new Map([['shadowPlay','SOURCE_SHADOW_FULL_STAGE_PLANE'],['kaleido','SOURCE_KALEIDO_FULL_STAGE_WEDGES'],['wall','SOURCE_WALL_COUPLED_PERSPECTIVE'],['zipper','SOURCE_ZIPPER_FULL_STAGE_CLOTH'],['fisheye','SOURCE_FISHEYE_DYNAMIC_GLYPH_FONT']]);
const handles=(plan,cut)=>ids.has(cut.layout)&&!preflight(cut)&&(S.preparedCut(plan,cut)||A.placementCutPreserved86cm(plan,cut)===false);
function geometry(plan,cut,W,H,scale){
 const p=cut.params,u=Math.min(W,H),port=H>W*1.08,st={...(cut.effectStyle||plan.style),...(cut.fonts?{fonts:cut.fonts}:{})},bodyFont=st.fonts.body?.[0]||'gothic_med',mono=st.fonts.mono?.[0]||'mono',polys=[],bodies=[];
 const box=(x0,y0,x1,y1,pad=2)=>{bodies.push(rect(x0,y0,x1,y1));polys.push(rect(x0-pad,y0-pad,x1+pad,y1+pad));};
 const rotated=(b,x,y,deg=0)=>{const a=deg*J.DEG,c=Math.cos(a),s=Math.sin(a);return rect(b.x0,b.y0,b.x1,b.y1).map(([px,py])=>[x+px*c-py*s,y+px*s+py*c]);};
 const item=(it,main=true)=>{const q=main?S.itemEnvelope(it,cut):{bounds:A.bounds(A.itemGeometry({...it,x:0,y:0,rot:0},ID,{pass:'main',scale:1}).polygons)};polys.push(rotated(q.bounds,it.x,it.y,it.rot));bodies.push(rotated(q.body||q.bounds,it.x,it.y,it.rot));return q;};
 const label=()=>{const line=String(Math.max(0,cut.line|0)+1).padStart(2,'0'),raw=cut.lineText&&strip(cut.lineText)!==strip(cut.text)?flat(cut.lineText):(!hasLatin(strip(cut.text))&&/[ぁ-ヿ]/.test(strip(cut.text))?J.romaji(strip(cut.text))?.toUpperCase():null)||'No.'+line;return raw.length>30?raw.slice(0,29)+'…':raw;};
 if(cut.layout==='ledScroll'){
  const text=flat(cut.text),fw=W*.94,adv=J.measure({text,font:p.font,size:100,track:.08}).w/100,size=J.clamp((fw-W*.04)*.9/Math.max(.5,adv),u*.1,Math.min(u*.2,H*.2)),ph=size*1.36,infoH=p.info==='none'?0:size*.56,fr=size*.2,fh=ph+infoH+fr*2+(infoH?fr*.6:0),y=H*p.y-fh/2;
  // All scrolling main and info text is clipped to the attached panel.
  box(W*.03,y,W*.97,y+fh);
 }else if(cut.layout==='sliceStack'){
  const text=brk(cut.text,port?5:8),blinds=p.mode==='blinds',o={track:.02,lead:1.02},size=Math.min(J.fitSize(text,p.font,W*(blinds?.74:.78),H*(blinds?.46:.42),o),u*.3),m=J.measure({text,font:p.font,size,...o}),N=p.slices;
  if(blinds){const bh=m.h+size*.6,hs=bh/N,x=W/2-m.w/2-size*.45,y=H/2-bh/2,w=m.w+size*.9;box(x-size*.08,y-hs*.55,x+w+size*.08,y+bh,Math.max(1,u*.0015,hs*.04)*5+2);}
  else{
   const hs=(m.h+size*.1)/N,gp=hs*p.gap,h=N*hs+(N-1)*gp,dep=Math.min(gp*.9,size*.08),amp=size*p.amp*(.5+.7*((cut.effectFx||plan.fx).motion??.7)),q=S.itemEnvelope({text,font:p.font,size,x:0,y:0,noHold:true,...o},cut).bounds;
   // Entry and exit displacement can overlap: add both entire bounded terms.
   box(W/2+q.x0-amp*1.4-W*1.5,H/2-h/2,W/2+q.x1+amp*1.4+W*1.5+dep*.5,H/2+h/2+dep+1);
  }
 }else if(cut.layout==='mosaicTiles'){
  const text=brk(cut.text,port?4:7),lay=J.layoutText({text,font:p.font,size:p.D*4,lead:1.15}),cols=Math.ceil(lay.W/4)+2,rows=Math.ceil(lay.H/4)+2,pitch=Math.min(W*.88/cols,H*.66/rows),gw=cols*pitch,gh=rows*pitch;
  // Every possible lit tile is within its sampled grid cell; outBack(1.8)
  // has maximum 1+4*s^3/(27*(s+1)^2), and arbitrary rotation uses sqrt(2).
  const q=1+4*1.8**3/(27*2.8**2),tail=Math.max(p.floor?pitch:0,pitch*.43*q*Math.SQRT2);
  box(W/2-gw/2-tail,H/2-gh/2-tail,W/2+gw/2+tail,H/2+gh/2+tail);
 }else if(cut.layout==='maskReveal'){
  const text=brk(cut.text,port?4:7),o={track:0,lead:1},size=Math.min(J.fitSize(text,p.font,W*.88,H*(port?.56:.66),o),u*.46),it={text,font:p.font,size,x:W/2,y:H/2,...o},m=J.measure(it);item(it);if(p.rim)item({...it,fill:false,stroke:Math.max(1.5,size*.012)});
  // Moving patterns and gradients only change the fill within source glyphs.
  if(p.label){const ls=J.clamp(u*.024,13,32);item({text:label(),font:bodyFont,size:ls,track:.2,align:'left',x:W/2-m.w/2,y:Math.min(H*.95,H/2+m.h/2+ls*1.8)},false);}
 }else if(cut.layout==='halftoneBig'){
  const text=brk(cut.text,port?4:5),o={track:-.02,lead:.98},size=Math.min(J.fitSize(text,p.font,W*(p.crop?1.12:.9),H*(port?.6:.8),o),u*.7),pitch=Math.max(6,size*.068),it={text,font:p.font,size,x:W/2,y:H/2,...o};
  // Source screen clips its moving dots/lines, including the fat glyph stroke.
  item({...it,stroke:pitch*.5});if(p.mode==='duo')item({...it,x:W/2+size*.045,y:H/2+size*.045});
 }else if(cut.layout==='stencil'){
  const text=brk(cut.text,port?4:7),o={track:.08,lead:1.12},size=Math.min(J.fitSize(text,p.font,W*.84,H*(port?.5:.56),o),u*.32),m=J.measure({text,font:p.font,size,...o}),x0=W/2-m.w/2,x1=W/2+m.w/2,y0=H/2-m.h/2,y1=H/2+m.h/2;item({text,font:p.font,size,x:W/2,y:H/2,rot:p.tilt,...o});
  // Mist <=.85*.62 glyph extent; drips <=.55size +.021size tip.
  // Both are in the original tilt matrix, independently of the moving head.
  const corners=[];for(const g of m.lay)if(g.ch!==' '&&g.ch!=='　'&&!J.isPunct(g.ch)){const b={x0:g.x-g.w*.55-size*.02,y0:g.y-g.h*.55-size*.02,x1:g.x+g.w*.55+size*.02,y1:g.y+Math.max(g.h*.55+size*.02,g.h*.35+size*.571)};corners.push(...rotated(b,W/2,H/2,p.tilt));}if(corners.length){const b=A.bounds([corners]);box(b.x0,b.y0,b.x1,b.y1);}
  box(x0-size*.58,y0-size*.03,x1+size*.58,y1+size*.03);
  if(p.marks){const L=size*.18,lw=Math.max(1,u*.0016),pd=size*.28;box(x0-pd-L,y0-pd-L,x1+pd+L,y1+pd+L,lw*5+2);item({text:'No.'+String(Math.max(0,cut.line|0)+1).padStart(2,'0')+'  /  '+J.fmtTime(cut.start),font:mono,size:J.clamp(u*.024,13,32),track:.25,align:'left',x:x0-pd+L*1.4,y:y0-pd},false);}
 }else if(cut.layout==='glitchGrid'){
  const C=port?3:W<H*1.45?3:4,R=port?5:3,g=u*p.gut,mx=W*.04,my=H*.05,cw=(W-2*mx-g*(C-1))/C,ch=(H-2*my-g*(R-1))/R,lw=Math.max(2,u*.003);
  // Each noisy cell retains its original clip; border stroke is outside it.
  box(mx,my,W-mx,H-my,lw*5+2);
  if(p.labels){const f=Math.max(10,u*.013);for(let r=0;r<R;r++)for(let c=0;c<C;c++)for(let z=14;z<=36;z++)item({text:'CH.'+String(r*C+c+1).padStart(2,'0')+'  x'+(z/10).toFixed(1),font:mono,size:f,align:'left',x:mx+c*(cw+g)+u*.01,y:my+r*(ch+g)+u*.016},false);item({text:'REC ● CLEAN',font:mono,size:Math.max(10,u*.014),align:'left',x:mx+(C===4?1:0)*(cw+g)+u*.012,y:my+Math.floor(R/2)*(ch+g)+u*.018},false);}
  const w=(C===4?2:C)*cw+(C===4?1:C-1)*g,text=brk(cut.text,port?5:8),o={track:.04,lead:1.1},size=Math.min(J.fitSize(text,p.font,w*.88,ch*.8,o),u*.24);item({text,font:p.font,size,x:mx+(C===4?1:0)*(cw+g)+w/2,y:my+Math.floor(R/2)*(ch+g)+ch/2,...o});
 }else return null;
 return {bounds:A.bounds(polys),body:A.bounds(bodies),renderScale:scale};
}
function preflight(cut){const p=cut.params;
 if(unsupported.has(cut.layout))return (unsupported.get(cut.layout));
 if(cut.area?.angle||cut.placementTrajectory)return ('REMAINING_ROTATED_NATIVE_VIEWPORT');
 if((cut.decor||[]).some(d=>!J.DECOR[d.id]))return ('REMAINING_UNDECLARED_DECOR');
 if(!['none','hardShadow'].includes(cut.treat||'none'))return ('REMAINING_COUPLED_TREATMENT');
 if(cut.layout==='ledScroll'&&(!['none','top','bottom'].includes(p.info)||![.42,.5,.58].includes(p.y)||!Number.isInteger(p.mods)||p.mods<3||p.mods>6)||cut.layout==='sliceStack'&&(!['blinds','stack','wave'].includes(p.mode)||!Number.isInteger(p.slices)||p.slices<6||p.slices>9||!Number.isFinite(p.gap)||p.gap<.3||p.gap>.55||!Number.isFinite(p.amp)||p.amp<.08||p.amp>.16)||cut.layout==='mosaicTiles'&&(!Number.isInteger(p.D)||p.D<9||p.D>12)||cut.layout==='stencil'&&(!Number.isFinite(p.tilt)||Math.abs(p.tilt)>3||!Number.isInteger(p.drips)||p.drips<1||p.drips>3||![-1,1].includes(p.dir))||cut.layout==='glitchGrid'&&(!Number.isFinite(p.gut)||p.gut<.008||p.gut>.016))return ('REMAINING_SOURCE_PARAMETER_DOMAIN');
 return null;
}
function prepare(plan,cut,{scale=1,region,previous}={}){
 const no=reason=>({diagnostic:{cut:cut.index,status:'unsupported',reason,layout:cut.layout}}),p=cut.params;
 const reason=preflight(cut);if(reason)return no(reason);
 const area=cut.area,W=area?plan.W*area.w:plan.W,H=area?plan.H*area.h:plan.H,local=geometry(plan,cut,W,H,scale);if(!local)return no('REMAINING_SOURCE_GEOMETRY_UNAVAILABLE');
 const domain=S.domain(plan,{...cut,simpleCircleClip:!!area},region,A.nativeBlockCircle.viewportProject(plan,cut,scale)),candidates=[];
 for(const r of domain.regions){const v=domain.place(local,r);if(v)candidates.push({...v,region:r,fitness:Math.abs(Math.log(((local.bounds.x1-local.bounds.x0)/(local.bounds.y1-local.bounds.y0))/((r.x1-r.x0)/(r.y1-r.y0)))),distance:Math.hypot(v.offset[0]/plan.W,v.offset[1]/plan.H)});}
 const old=previous?.policy===S.policy?previous.diagnostics.find(d=>d.cut===cut.index&&d.status==='safe'):null;candidates.sort((a,b)=>b.region.score-a.region.score||a.fitness-b.fitness||a.distance-b.distance||Number(b.region.direction===old?.direction)-Number(a.region.direction===old?.direction));const win=candidates[0];
 if(!win)return {diagnostic:{cut:cut.index,status:'insufficient-space',reason:'NO_SAFE_REMAINING_SOURCE_COMPOSITION',layout:cut.layout,sourceBounds:local.bounds}};
 const prior=previous?.plan.cuts.find(c=>c.index===cut.index)?.simpleCircleRecipe?.remainingEffects;if(old?.direction===win.region.direction&&prior?.layout===cut.layout){const envelope=domain.fit(local,prior.offset,win.region);if(envelope){win.offset=prior.offset.slice();win.envelope=envelope;win.reusedPosition=true;}}
 return {area:area?{...area,x:area.x+win.offset[0]/plan.W,y:area.y+win.offset[1]/plan.H}:null,recipe:{layout:cut.layout,W,H,offset:win.offset,nativeViewport:!!area},diagnostic:{cut:cut.index,status:'safe',method:'remaining-native-clip-and-shape-formulas',direction:win.region.direction,region:win.region,envelope:win.envelope,reusedPosition:!!win.reusedPosition,allClockGeneration:false}};
}
A.remainingEffectsCircle=Object.freeze({ids,handles,prepare,geometry,unsupported,preflight});
for(const id of ids){if(unsupported.has(id))continue;const render=J.LAYOUTS[id].render;J.LAYOUTS[id].render=function(env){const recipe=env.cut.simpleCircleRecipe?.remainingEffects;if(!recipe||recipe.nativeViewport)return render(env);env.ctx.save();try{env.ctx.translate(...recipe.offset);return render({...env,W:recipe.W,H:recipe.H});}finally{env.ctx.restore();}};}
})();
