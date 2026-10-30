/* Approved58A: native topology and clocks, 58% board, native number/clue size.
 * Input-derived left/bottom anchor. Full post processing is outside this family. */
(()=>{'use strict';
const A=J.placement,E=J.E,ID=[1,0,0,1,0,0],ids=new Set(['crossword']);
const U=e=>Math.min(e.W,e.H),isPort=e=>e.H>e.W*1.08,strip=t=>String(t||'').replace(/\s+/g,''),hasLatin=t=>/[A-Za-z]/.test(t),flat=t=>hasLatin(t)?String(t||'').trim().replace(/\s+/g,' '):strip(t);
const bodyF=e=>e.st.fonts.body?.[0]||'gothic_med',monoF=e=>e.st.fonts.mono?.[0]||'mono',smallSize=e=>J.clamp(U(e)*.024,13,32),tin=(e,d=0,l=.4,f=E.outExpo)=>f(J.clamp((e.lt-d)/Math.max(.01,l))),tout=e=>1-E.inCubic(e.pOut),gIn=e=>e.lt<.6&&e.pOut<=0,plateHold=e=>!['still','jitter','breathe','glitchtick'].includes(e.cut.hold),miAt=(e,t)=>Math.max(0,t)/Math.max(.005,e.cut.stagger||.04);
const box=(x0,y0,x1,y1)=>({x0,y0,x1,y1,cx:(x0+x1)/2,cy:(y0+y1)/2,boxes:[]}),UB=J.unionBB,lightOf=s=>J.lum(s.fg)>J.lum(s.bg)?s.fg:s.bg,darkOf=s=>J.lum(s.fg)>J.lum(s.bg)?s.bg:s.fg;
const romajiOf=e=>{const c=strip(e.cut.text);if(hasLatin(c)||!/[ぁ-ヿ]/.test(c))return null;const r=J.romaji(c);return r?r.toUpperCase():null};
const KANA='あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';
const poolOf=c=>[...strip((c.lineText||'')+c.text)].filter(t=>!J.isPunct(t)&&!J.isSmallKana(t)&&t!=='ー'&&!J.isLatin(t)).concat([...KANA].filter((t,i)=>i%3===0));
const rect=b=>[[b.x0,b.y0],[b.x1,b.y0],[b.x1,b.y1],[b.x0,b.y1]],shift=(b,x,y)=>({x0:b.x0+x,y0:b.y0+y,x1:b.x1+x,y1:b.y1+y});
const handles=(plan,cut)=>ids.has(cut.layout);
function render58A(env, mainDraw=J.mainDraw){
    const { W, H, sc } = env, cut = env.cut, Pm = cut.params, s = cut.seed, u = U(env), lt = env.lt;
    const port = isPort(env);
    const t0 = flat(cut.text);
    const chs = [...t0].filter(c => c !== ' ');
    const n = chs.length;
    if (!n) return null;
    const maxRow = port ? 7 : 12;
    const words = [chs]; // Admission limits this approved family to seven nonspace glyphs.
    const L = Math.max(...words.map(w => w.length));
    const C = Math.max(L + 2, port ? 7 : 9), R = words.length > 1 ? 7 : port ? 7 : 5;
    const below = Pm.clue && H > W * 0.7, clueW = Pm.clue && !below ? 0.24 : 0;
    const nativeCell = Math.min(W * (0.88 - clueW) / C, H * (below ? 0.64 : 0.8) / R, u * 0.14);
    const cell=nativeCell*0.58;
    const gw = C * cell, gh = R * cell;
    const fsC = Math.max(smallSize(env) * 1.15, nativeCell * 0.24);
    const gx=(W-gw)/2, gy=(H-gh-fsC*5)/2;
    const rowsW = words.length > 1 ? [1, 5] : [Math.floor(R / 2)];
    const c0 = words.map(w => Math.floor((C - w.length) / 2) - (J.h(s, w.length) % 2 && C - w.length > 2 ? 1 : 0));
    // black cells: symmetric scatter that keeps the lyric entries (and their end caps) intact
    const key = (r, c) => r * 64 + c;
    const lyr = new Map();
    words.forEach((w, wi) => w.forEach((ch, j) => lyr.set(key(rowsW[wi], c0[wi] + j), { ch, wi, j })));
    const black = new Set();
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const r2 = R - 1 - r, c2 = C - 1 - c;
      if (lyr.has(key(r, c)) || lyr.has(key(r2, c2))) continue;
      if (J.r(s, Math.min(key(r, c), key(r2, c2)), 3) < Pm.dens) { black.add(key(r, c)); black.add(key(r2, c2)); }
    }
    words.forEach((w, wi) => { const r = rowsW[wi]; if (c0[wi] > 0) black.add(key(r, c0[wi] - 1)); if (c0[wi] + w.length < C) black.add(key(r, c0[wi] + w.length)); });
    const isW = (r, c) => r >= 0 && c >= 0 && r < R && c < C && !black.has(key(r, c));
    // numbering
    const num = new Map(); let k = 1;
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      if (!isW(r, c)) continue;
      const ac = !isW(r, c - 1) && isW(r, c + 1), dn = !isW(r - 1, c) && isW(r + 1, c);
      if (ac || dn) num.set(key(r, c), k++);
    }
    // pencilled crossing entries (down words through some lyric cells)
    const pool = poolOf(cut), NP = pool.length;
    const pencil = new Map();
    let fills = 0;
    words.forEach((w, wi) => w.forEach((ch, j) => {
      if (fills >= Pm.fill * words.length || J.r(s, wi, j, 5) > 0.45) return;
      const c = c0[wi] + j, r = rowsW[wi];
      let a = r, b = r; while (isW(a - 1, c)) a--; while (isW(b + 1, c)) b++;
      if (b - a < 2) return;
      fills++;
      for (let rr = a; rr <= b; rr++) if (!lyr.has(key(rr, c))) pencil.set(key(rr, c), pool[J.h(s, rr, c, 6) % NP]);
    }));
    const out = tout(env);
    const ga = tin(env, 0, 0.35, E.outCubic) * out;
    const paperC = lightOf(sc), inkC = darkOf(sc);
    const lw = Math.max(1, cell * 0.035);
    env.rect(gx - lw * 2, gy - lw * 2, gw + lw * 4, gh * ga + lw * 4, inkC, out, false);
    env.rect(gx, gy, gw, gh * ga, paperC, out, gIn(env));
    // typing progress
    const T1 = 0.25, per = J.clamp(cut.dur * 0.4 / n, 0.04, 0.11);
    const typed = Math.floor((lt - T1) / per);
    let cur = -1, gi = 0;
    const order = [];
    words.forEach((w, wi) => w.forEach((ch, j) => order.push([wi, j])));
    if (typed >= 0 && typed < n) cur = typed;
    const curWi = cur >= 0 ? order[cur][0] : -1;
    for (let r = 0; r < R; r++) {
      const ra = J.clamp((ga * R - r));
      if (ra <= 0) continue;
      for (let c = 0; c < C; c++) {
        const x = gx + c * cell, y = gy + r * cell;
        const kk = key(r, c);
        if (black.has(kk)) { env.rect(x, y, cell, cell, inkC, ra * out, false); continue; }
        const L0 = lyr.get(kk);
        if (L0 && (L0.wi === curWi || typed >= n)) env.rect(x, y, cell, cell, sc.accent, (L0.wi === curWi ? 0.2 : 0.12) * out, false);
        if (L0 && order[cur] && order[cur][0] === L0.wi && order[cur][1] === L0.j) env.rect(x, y, cell, cell, sc.accent, 0.5 * out, false);
        env.line([[x, y + cell], [x + cell, y + cell]], inkC, lw * 0.6, 0.55 * ra * out, false);
        env.line([[x + cell, y], [x + cell, y + cell]], inkC, lw * 0.6, 0.55 * ra * out, false);
        if (num.has(kk)) env.draw({ text: String(num.get(kk)), font: monoF(env), size: nativeCell*.2, align: 'left', x: x + cell * 0.07, y: y + cell * 0.15, color: inkC, alpha: 0.8 * ra * out, ghost: false });
        const pc = pencil.get(kk);
        if (pc) env.draw({ text: pc, font: bodyF(env), size: cell * 0.46, x: x + cell / 2, y: y + cell * 0.56, color: J.mix(paperC, inkC, 0.38), alpha: tin(env, 0.3 + r * 0.03, 0.3) * out, ghost: false });
      }
    }
    let bb = null;
    order.forEach(([wi, j], q) => {
      const ch = words[wi][j];
      const x = gx + (c0[wi] + j + 0.5) * cell, y = gy + (rowsW[wi] + .64) * cell;
      bb = UB(bb, mainDraw(env, { text: ch, font: Pm.font, size: cell * .65, x, y, color: inkC, noHold: plateHold(env), mi: miAt(env, T1 + q * per) }));
    });
    if (Pm.clue) {
      const fs = fsC;
      const cxl = true ? gx : gx + gw + W * 0.035, cyl = true ? gy + gh + fs * 1.6 : gy + fs;
      const a = tin(env, 0.35, 0.4, E.outCubic) * out;
      const n1 = num.get(key(rowsW[0], c0[0])) || 1;
      const lines = [['ヨコのカギ', sc.accent, monoF(env)], [n1 + '  ' + (cut.note || romajiOf(env) || '(' + n + ')'), sc.fg, bodyF(env)], ['タテのカギ', sc.accent, monoF(env)], [(num.size > 3 ? 3 : 2) + '  ─', sc.sub, bodyF(env)]];
      lines.forEach(([t, col, f], i) => {
        const tt = t.length > 22 ? t.slice(0, 21) + '…' : t;
        const yy = true ? cyl + (i % 2) * fs * 1.7 : cyl + i * fs * 1.9 + (i >= 2 ? fs * 0.8 : 0), xx = true && i >= 2 ? cxl + gw * 0.55 : cxl;
        env.draw({ text: tt, font: f, size: fs, align: 'left', x: xx, y: yy, track: 0.08, color: col, alpha: a, ghost: false });
      });
    }
    return bb || box(gx, gy, gx + gw, gy + gh);
}

function prepare(plan,cut,{scale=1,region}={}){
 const fail=(status,reason)=>({diagnostic:{cut:cut.index,status,reason,family:'58A',strategy:'default-left-bottom'}}),W=plan.W,H=plan.H,st={...(cut.effectStyle||plan.style),...(cut.fonts?{fonts:cut.fonts}:{})},fx=cut.effectFx||plan.fx,n=[...flat(cut.text)].filter(c=>c!==' ').length;
 if(!n||n>7||cut.area||!Number.isFinite(scale)||scale<=0||scale>4)return fail('unsupported','UNSUPPORTED_CROSSWORD_INPUT');
 if(cut.cam!=='push'||cut.enter!=='cut'||cut.exit!=='cut'||(cut.groupExit??cut.exit)!==cut.exit||cut.hold!=='still'||(cut.treat||'none')!=='none'||(cut.decor||[]).length||cut.drawing||cut.effectsOnly||J.activeMask?.(cut)||cut.trans&&cut.trans!=='none'||(plan.events||[]).length)return fail('unsupported','UNSUPPORTED_CROSSWORD_MOTION');
 if(!Number.isFinite(cut.params.dens)||cut.params.dens<0||cut.params.dens>1||!Number.isInteger(cut.params.fill)||cut.params.fill<0||cut.params.fill>3||!Number.isFinite(cut.contentScale??1)||(cut.contentScale??1)<=0||!Number.isFinite(cut.motionScale??1)||(cut.motionScale??1)<0||(cut.motionScale??1)>1||!Number.isFinite(fx.motion??.7)||(fx.motion??.7)<0||(fx.motion??.7)>1||!Number.isFinite(fx.chroma??.7)||(fx.chroma??.7)<0||!Number.isFinite(st.ghost??1)||(st.ghost??1)<0)return fail('unsupported','UNSUPPORTED_CROSSWORD_PARAMETERS');
 const env={W,H,cut,plan,st,sc:cut.palette||st.schemes[cut.scheme%st.schemes.length],lt:cut.dur+1,pOut:0,pass:'main'},polys=[],textGroups=[];
 const shape=(x0,y0,x1,y1,pad=1)=>polys.push(rect({x0:x0-pad,y0:y0-pad,x1:x1+pad,y1:y1+pad}));
 env.rect=(x,y,w,h)=>shape(x,y,x+w,y+h);
 env.line=(ps,c,lw)=>{const b=A.bounds([ps]);shape(b.x0,b.y0,b.x1,b.y1,lw/2+1)};
 env.draw=it=>{const ink=A.itemGeometry(it,ID,{pass:'main',scale:1});polys.push(...ink.polygons);textGroups.push({it,b:A.bounds(ink.inkPolygons)});return null};
 render58A(env,(e,it)=>{const local=A.simpleCircle.itemEnvelope(it,cut);polys.push(rect(shift(local.bounds,it.x,it.y)));textGroups.push({it,b:A.bounds(A.itemGeometry(it,ID,{pass:'main',scale:1}).inkPolygons)});return null});
 const C=Math.max(n+2,isPort(env)?7:9),R=isPort(env)?7:5,nativeCell=Math.min(W*(.88-(cut.params.clue&&H<=W*.7?.24:0))/C,H*(cut.params.clue&&H>W*.7?.64:.8)/R,U(env)*.14),cell=nativeCell*.58;
 // Numbers keep their native size; reject inputs whose actual ink no longer fits
 // the smaller cell or touches any lyric/pencil ink. Never reduce them to fit.
 const numbered=textGroups.filter(g=>/^\d+$/.test(g.it.text)&&g.it.track!==.08),letters=textGroups.filter(g=>g.it.track!==.08&&!numbered.includes(g));
 const contact=(a,b)=>a.x0<=b.x1&&a.x1>=b.x0&&a.y0<=b.y1&&a.y1>=b.y0;
 for(const g of textGroups.filter(g=>g.it.track!==.08)){const num=numbered.includes(g),x=g.it.x-cell*(num?.07:.5),y=g.it.y-cell*(num?.15:g.it.mi!=null?.64:.56),b=g.b;if(b.x0<x||b.y0<y||b.x1>x+cell||b.y1>y+cell)return fail('unsupported','UNSUPPORTED_CROSSWORD_CELL_INK');}
 if(numbered.some(a=>letters.some(b=>contact(a.b,b.b))))return fail('unsupported','UNSUPPORTED_CROSSWORD_NUMBER_CONTACT');
 const clues=textGroups.filter(g=>g.it.track===.08),fsC=Math.max(smallSize(env)*1.15,nativeCell*.24),bottom=(H-R*cell-fsC*5)/2+R*cell;
 if(clues.some((g,i)=>g.b.y0<=bottom||clues.slice(i+1).some(h=>contact(g.b,h.b))))return fail('unsupported','UNSUPPORTED_CROSSWORD_CLUE_CONTACT');
 const bounds=A.bounds(polys),local={bounds,body:bounds,renderScale:scale};
 // The common camera envelope with bodyOnly retains push scaling and raster pad.
 // noPost removes bloom/resampling; ghost pass offsets still belong to the paper.
 const ghost=(fx.chroma??.7)*(st.ghost??1)*1.9*(cut.motionScale??1)*H/1080,gx=3.4*ghost,gy=1.9*ghost;
 function projected(offset){const b=A.bounds([A.simpleCircle.stageEnvelope(local,{x:offset[0],y:offset[1]},plan,cut,true)]);return {x0:b.x0-gx,y0:b.y0-gy,x1:b.x1+gx,y1:b.y1+gy};}
 const margin=2/scale,base=cut.contentScale??1,K=J.clamp((fx.motion??.7)*1.25,0,1.25),cameraScales=[1,1+.03*Math.max(1,K)],raster=2/scale;
 const offset=[Math.max(...cameraScales.map(k=>(margin+raster+gx-W/2)/(base*k)+W/2-bounds.x0)),Math.min(...cameraScales.map(k=>(H-margin-raster-gy-H/2)/(base*k)+H/2-bounds.y1))],b=projected(offset);
 const circle={cx:region.center.x*W,cy:region.center.y*H,r:region.radius*Math.min(W,H)},pad=Math.max(2,.005*Math.min(W,H))+1;
 if(b.x0<margin-1e-7||b.y0<margin||b.x1>W-margin||b.y1>H-margin+1e-7||!A.clear([rect(b)],circle,pad))return fail('insufficient-space','NO_SAFE_CROSSWORD_LEFT_BOTTOM');
 return {area:null,recipe:{family:'58A',offset,requiresNoPost:true},diagnostic:{cut:cut.index,status:'safe',family:'58A',direction:'left',strategy:'default-left-bottom',envelope:rect(b),boardScale:.58,nativeNumberSize:nativeCell*.2,requiresNoPost:true,candidates:1,sideDispersion:false}};
}
A.crosswordCircle=Object.freeze({ids,handles,prepare});
const native=J.LAYOUTS.crossword.render;
J.LAYOUTS.crossword.render=function(env){const r=env.cut.simpleCircleRecipe?.crossword;if(!r)return native(env);const ctx=env.ctx;ctx.save();try{ctx.translate(...r.offset);const bb=render58A(env);return bb?{...bb,...shift(bb,...r.offset),cx:bb.cx+r.offset[0],cy:bb.cy+r.offset[1]}:bb}finally{ctx.restore()}};
})();
