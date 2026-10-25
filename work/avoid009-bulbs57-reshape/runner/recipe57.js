/* SOURCE57 isolated diagnostic geometry; no registration, adapter, or native source replacement. */
(()=>{'use strict';const E=J.E;
const U = env => Math.min(env.W, env.H);
const isPort = env => env.H > env.W * 1.08;
const strip = t => String(t || '').replace(/\s+/g, '');
const hasLatin = t => /[A-Za-z]/.test(t);
/* text as one run: latin keeps single word spaces, Japanese drops them */
const flat = t => (hasLatin(t) ? String(t || '').trim().replace(/\s+/g, ' ') : strip(t));
/* glyph slots keeping single word gaps (latin lyrics): a ' ' slot is left empty */
const slotsOf = t => [...flat(t)];
const fontsOf = (st, roles) => J.fontsOf(st, roles);
const bodyF = env => (env.st.fonts.body && env.st.fonts.body[0]) || 'gothic_med';
const monoF = env => (env.st.fonts.mono && env.st.fonts.mono[0]) || 'mono';
const tin = (env, d = 0, len = 0.4, ease = E.outExpo) => ease(J.clamp((env.lt - d) / Math.max(0.01, len)));
const tout = env => 1 - E.inCubic(env.pOut);
const box = (x0, y0, x1, y1) => ({ x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, boxes: [] });
const UB = J.unionBB;
const pad2 = n => String(n).padStart(2, '0');
const lineNo = env => pad2(Math.max(0, env.cut.line | 0) + 1);
const smallSize = env => J.clamp(U(env) * 0.024, 13, 32);
/* motion index that makes J.mainDraw start this item's entrance at local time t */
const miAt = (env, t) => Math.max(0, t) / Math.max(0.005, env.cut.stagger || 0.04);
/* chromatic ghosts on big plates only while they fly in */
const gIn = env => env.lt < 0.6 && env.pOut <= 0;
/* text printed on an object only takes holds that keep it in place */
const plateHold = env => !['still', 'jitter', 'breathe', 'glitchtick'].includes(env.cut.hold);
const romajiOf = env => { const c = strip(env.cut.text); if (hasLatin(c) || !/[ぁ-ヿ]/.test(c)) return null; const r = J.romaji(c); return r ? r.toUpperCase() : null; };
const altCopy = env => { const c = env.cut; if (c.lineText && strip(c.lineText) !== strip(c.text)) return flat(c.lineText); return romajiOf(env) || 'No.' + lineNo(env); };
const lightOf = sc => (J.lum(sc.fg) > J.lum(sc.bg) ? sc.fg : sc.bg);
const darkOf = sc => (J.lum(sc.fg) > J.lum(sc.bg) ? sc.bg : sc.fg);
const _onc = new Map();
/* best-contrast scheme colour for text on a plate of colour `fill` */
const onCol = (sc, fill) => {
  const key = fill + sc.bg + sc.fg + sc.ink + sc.accent;
  let v = _onc.get(key);
  if (v) return v;
  let best = null, bv = 0;
  for (const c of [sc.bg, sc.fg, sc.ink, sc.accent, sc.sub]) { if (!c || c === fill) continue; const k = J.contrast(c, fill); if (k > bv) { bv = k; best = c; } }
  v = bv >= 2.4 ? best : (J.lum(fill) > 0.5 ? '#111111' : '#FFFFFF');
  if (_onc.size > 300) _onc.clear();
  _onc.set(key, v); return v;
};
/* first scheme colour that stands out from the background (for plates / objects) */
const plateCol = (sc, pref) => { for (const c of pref) if (c && J.contrast(c, sc.bg) >= 1.6) return c; return sc.fg; };
/* shade a plate colour towards the scheme's light (s > 0) or dark (s < 0) end */
const shade = (sc, c, s) => (s >= 0 ? J.mix(c, lightOf(sc), Math.min(0.9, s)) : J.mix(c, darkOf(sc), Math.min(0.9, -s)));
/* palette of object colours (plates, magnets, balloons …) that read on the bg */
const objCols = sc => { const out = []; for (const c of [sc.accent, sc.fg, sc.accent2, sc.ink, sc.sub]) if (c && J.contrast(c, sc.bg) >= 1.7 && !out.includes(c)) out.push(c); return out.length ? out : [sc.fg]; };
const adv = (font, ch) => (ch === ' ' ? 0.34 : J.metrics.adv(font, ch));

/* ---- chunking: k balanced groups of words (J.chunkText / latin words), long words split at natural points ---- */
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
/* rows of glyph slots (a ' ' slot is a word gap) broken at chunk boundaries */
const rowsOf = (text, maxPer) => { const t = flat(text), n = J.glyphCount(t); return (n > maxPer ? chunksK(t, Math.ceil(n / maxPer)) : [t]).map(r => [...r.trim()]); };
/* balanced display line breaks at chunk boundaries */
const brk = (text, maxPer) => { const t = flat(text), n = J.glyphCount(t); return n <= maxPer ? t : chunksK(t, Math.ceil(n / maxPer)).join('\n'); };

/* ---- affine helpers: draw the lyric through a matrix, map its bbox back to design space ---- */
const mapPt = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
const mapBB = (bb, m) => {
  if (!bb) return null;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of [[bb.x0, bb.y0], [bb.x1, bb.y0], [bb.x1, bb.y1], [bb.x0, bb.y1]]) { const p = mapPt(m, x, y); x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  return box(x0, y0, x1, y1);
};
const drawAff = (env, it, m) => { const c = env.ctx; c.save(); c.transform(m[0], m[1], m[2], m[3], m[4], m[5]); const bb = J.mainDraw(env, it); c.restore(); return mapBB(bb, m); };
const drawAffPlain = (env, it, m) => { const c = env.ctx; c.save(); c.transform(m[0], m[1], m[2], m[3], m[4], m[5]); env.draw(it); c.restore(); };
const polyPts = (m, pts) => pts.map(([x, y]) => mapPt(m, x, y));
/* rounded-rect path */
const rrPath = (ctx, x, y, w, h, r) => {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
};
/* outline of a polygon (main pass) */
const outline = (env, pts, col, lw, a = 1) => { if (pts.length > 1) env.line(pts.concat([pts[0]]), col, lw, a, false); };
/* pool of glyphs taken from the line (for decoys / fillers) */
const KANA = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';
const _pool = new Map();
const poolOf = cut => {
  const key = (cut.lineText || '') + '|' + cut.text;
  let p = _pool.get(key);
  if (!p) {
    const own = [...strip((cut.lineText || '') + cut.text)].filter(c => !J.isPunct(c) && !J.isSmallKana(c) && c !== 'ー' && !J.isLatin(c));
    p = own.concat([...KANA].filter((c, i) => i % 3 === 0));
    if (_pool.size > 100) _pool.clear();
    _pool.set(key, p);
  }
  return p;
};
/* per-font glyph memo reset when font metrics are rebuilt (fonts loading late) */
const MEMO = new Map(), SENT = '\u0001layoutsD';
const memo = (key, fn) => {
  const mm = J.metrics && J.metrics.m;
  if (mm && !mm.has(SENT)) { MEMO.clear(); mm.set(SENT, 1); }
  let v = MEMO.get(key);
  if (v === undefined) { v = fn(); if (MEMO.size > 300) MEMO.clear(); MEMO.set(key, v); }
  return v;
};
const rrPts = (x, y, w, h, r, nc = 5) => {
  r = Math.min(r, w / 2, h / 2);
  const out = [], C = [[x + w - r, y + r, -90], [x + w - r, y + h - r, 0], [x + r, y + h - r, 90], [x + r, y + r, 180]];
  for (const [cx, cy, a0] of C) for (let i = 0; i <= nc; i++) { const a = (a0 + 90 * i / nc) * J.DEG; out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return out;
};

const resampleCount57 = (pts, N) => {
  if(!Number.isInteger(N)||N<4||N>140)throw Error('RECIPE57_ORIGINAL_N');
  const seg = []; let L = 0;
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]); seg.push(l); L += l; }
  const step = L / N, out = [];
  let si = 0, acc = 0;
  for (let k = 0; k < N; k++) {
    const t = k * step;
    while (si < seg.length - 1 && acc + seg[si] < t) { acc += seg[si]; si++; }
    const a = pts[si], b = pts[(si + 1) % pts.length], f = seg[si] > 0 ? (t - acc) / seg[si] : 0;
    out.push([J.lerp(a[0], b[0], f), J.lerp(a[1], b[1], f)]);
  }
  return out;
};

window.renderBulbsRecipe57=function(env,recipe,reference){
    const { W, H, sc, ctx } = env, cut = env.cut, Pm = cut.params, s = cut.seed, u = U(env), lt = env.lt;
    const nativeD = cut.placementLayoutsD === true;
    if (!recipe || !reference || cut.text!=='風の先へ' || Pm.shape!=='board' || !Pm.sub || env.W!==960 || env.H!==540) throw Error('RECIPE57_FIXED_SCOPE');
    const matrixNow = () => {const v=ctx.getTransform();return [v.a,v.b,v.c,v.d,v.e,v.f];};
    const clone = v => Array.isArray(v)?v.map(clone):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,clone(x)])):v;
    const freeze = v => {if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
    const captureD = nativeD && typeof cut.text==='string' && cut.text.length<=4096 && [...cut.text].length<=512;
    const catalog = nativeD?{kind:'bulbs-reshape57-diagnostic-catalog',version:1,nativeOnly:false,sourceNativeClockUnchanged:true,complete:false,bounded:captureD,status:captureD?'collecting':'partial-budget',unsupported:captureD?null:'catalog-budget:max4096UTF16/512codepoints/1024calls',limits:{textUTF16:4096,textCodepoints:512,calls:1024},owner:'bulbs.sign',role:'primary',stage:[env.plan?.W??W,env.plan?.H??H],environmentSize:[W,H],root:matrixNow(),pass:env.pass,clock:{t:env.t,realTime:env.realTime,lt,ltb:env.ltb,step:env.step,pIn:env.pIn,pOut:env.pOut,beat:clone(env.beat),beatPulse:env.beatPulse},seed:s,params:clone(Pm),effectiveFX:clone(env.fx),sourceInputs:{text:captureD?cut.text:null,lineText:captureD?cut.lineText:null,line:cut.line,inDur:cut.inDur,outDur:cut.outDur,dur:cut.dur,start:cut.start,end:cut.end,stagger:cut.stagger,enter:cut.enter,hold:cut.hold,exit:cut.exit,treat:cut.treat,motionScale:cut.motionScale},sourceCalls:[],primaryOwners:[],independentDecorOwners:[],rings:[],motionUnchanged:true,painterOrder:'shadow,face,outline; each ring each light halo,bulb,glint; full mainDraw; subtitle'}:null;
    if(nativeD)env.placementDGeometry=catalog;
    let finished=false;
    const owned=(owner,kind,fn)=>{if(!nativeD)return fn();const id='bulbs.sign.'+owner;let call=null;if(captureD&&catalog.sourceCalls.length<1024){call={ordinal:catalog.sourceCalls.length,owner:id,role:'primary',kind,matrixBeforeCall:matrixNow()};catalog.sourceCalls.push(call);if(!catalog.primaryOwners.includes(id))catalog.primaryOwners.push(id);}else if(captureD){catalog.bounded=false;catalog.status='partial-budget';catalog.unsupported='catalog-budget:1024calls';}try{return env.withDrawRole('primary',id,fn);}finally{if(call)call.matrixAfterCall=matrixNow();}};
    try {
    const port = isPort(env);
    const text = recipe.writingText;
    const o = { track: 0.06, lead: 1.12 };
    const arrow = Pm.shape === 'arrow' && !port;
    const maxW = W * (arrow ? 0.62 : 0.72), maxH = H * (port ? 0.36 : 0.42);
    const m100 = J.measure(Object.assign({ text, font: Pm.font, size: 100 }, o));
    const subT = Pm.sub ? altCopy(env) : null;
    const size = reference.size * recipe.scale;
    const m = J.measure(Object.assign({ text, font: Pm.font, size }, o));
    const ss = reference.ss;
    const padX = size * recipe.pad[0], padY = size * recipe.pad[1];
    const bw = m.w + padX * 2, bh = m.h + padY * 2 + (subT ? ss * 1.8 : 0);
    const ax = arrow ? bh * 0.42 * Pm.dir : 0;
    const cx = W / 2 - ax / 2, cy = H / 2;
    const x0 = cx - bw / 2, y0 = cy - bh / 2;
    const out = tout(env);
    const q = E.outBack(J.clamp(lt / 0.35), 1.4) * (1 - 0.1 * E.inCubic(env.pOut));
    const dark = J.lum(sc.bg) < 0.4;
    const board = dark ? J.mix(sc.bg, sc.fg, 0.1) : darkOf(sc);
    const bulbC = [sc.accent, lightOf(sc), sc.accent2].find(c => c && J.contrast(c, board) >= 2) || lightOf(sc);
    const textC = [lightOf(sc), sc.fg, sc.accent].find(c => J.contrast(c, board) >= 3) || onCol(sc, board);
    // outline of the sign
    let shape;
    if (arrow) {
      const tip = Pm.dir > 0 ? [x0 + bw + bh * 0.5, cy] : [x0 - bh * 0.5, cy];
      shape = Pm.dir > 0 ? [[x0, y0], [x0 + bw, y0], [x0 + bw, y0 - bh * 0.12], tip, [x0 + bw, y0 + bh * 1.12], [x0 + bw, y0 + bh], [x0, y0 + bh]]
        : [[x0 + bw, y0], [x0, y0], [x0, y0 - bh * 0.12], tip, [x0, y0 + bh * 1.12], [x0, y0 + bh], [x0 + bw, y0 + bh]];
    } else shape = rrPts(x0, y0, bw, bh, size * 0.3);
    const sp = shape.map(([x, y]) => [cx + (x - cx) * q, cy + (y - cy) * q]);
    if(captureD)Object.assign(catalog,{port,text,m100:clone(m100),subT,size,m:clone(m),ss,padX,padY,bw,bh,ax,cx,cy,x0,y0,arrow,maxW,maxH,out,q,dark,board,bulbC,textC,shape:clone(shape),sp:clone(sp),culled:q<=0.01||out<=0,cullReason:q<=0.01?'q<=.01':out<=0?'out<=0':null});
    if (q <= 0.01 || out <= 0) {finished=true;return null;}
    owned('shadow','poly',()=>env.poly(sp.map(([x, y]) => [x + u * 0.012, y + u * 0.016]), darkOf(sc), 0.3 * out, false));
    owned('face','poly',()=>env.poly(sp, board, out, gIn(env)));
    owned('outline','outline',()=>outline(env, sp, J.mix(board, bulbC, 0.35), Math.max(1.5, u * 0.003), out));
    // bulbs round the rim (and an inner ring for 'double')
    const r = reference.r * recipe.radiusScale;
    const inset = (k) => { if (arrow) return sp.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]); const d = size * 0.3 * (1 - k); return rrPts(x0 + d, y0 + d * (bh / bw), bw - d * 2, bh - d * 2 * (bh / bw), size * 0.3 * k).map(([x, y]) => [cx + (x - cx) * q, cy + (y - cy) * q]); };
    const rings = Pm.shape === 'double' && !arrow ? [0.95, 0.86] : [arrow ? 0.93 : 0.95];
    const beatFlash = env.beat && env.beat.since < 0.12 ? 1 : 0;
    const step = Math.floor(env.ltb * 9);
    if(captureD)Object.assign(catalog,{r,ringInsets:rings.slice(),beatFlash,step,ghostFace:gIn(env),outlineWidth:Math.max(1.5,u*.003),shadowOffset:[u*.012,u*.016]});
    rings.forEach((k, ri) => {
      const insetPoints = inset(k);
      const pts = resampleCount57(insetPoints, reference.rings[ri].N);
      const N = pts.length;
      let ring=null;if(captureD){const segments=insetPoints.map((a,i)=>{const b=insetPoints[(i+1)%insetPoints.length];return Math.hypot(b[0]-a[0],b[1]-a[1]);});ring={ri,k,insetPoints:clone(insetPoints),points:clone(pts),N,nominalRecipeSpacing:r*3.3,sourceNativeSpacing:reference.rings[ri].spacing,originalN:reference.rings[ri].N,actualArcStep57:segments.reduce((a,b)=>a+b,0)/N,maxN:140,segmentsRecomputedMetadata:segments,totalLengthRecomputedMetadata:segments.reduce((a,b)=>a+b,0),derivation:'new inset evaluated once; fixed source-original N; actualArcStep57 from separately recomputed segment lengths; geometry changed, not native resample result',lights:[]};catalog.rings.push(ring);}
      pts.forEach((p, i) => {
        const on0 = (i / N) < E.inOutCubic(J.clamp((lt - 0.1 - ri * 0.1) / 0.6)) && (i / N) >= E.inCubic(env.pOut);
        let lit = 0;
        if (on0) {
          const j = (i * Pm.dir + N * 4) % N;
          if(ring)ring.pendingJ=j;
          if (Pm.chase === 'chase') lit = ((j + (ri ? 0 : 1) - step + 300 * 3) % 3) === 0 ? 1 : 0.18;
          else if (Pm.chase === 'alt') lit = ((i + Math.floor(env.ltb * 3) + ri) % 2) ? 1 : 0.2;
          else lit = 0.2 + 0.8 * Math.pow(0.5 + 0.5 * Math.sin(i / N * J.TAU * 3 - env.ltb * 5 * Pm.dir + ri), 2);
          lit = Math.max(lit, beatFlash);
        }
        const col = ri ? (J.contrast(sc.accent2 || bulbC, board) > 2 ? (sc.accent2 || bulbC) : bulbC) : bulbC;
        const owner='ring.'+ri+'.state.'+N+'.'+i;
        if(ring){ring.lights.push({i,N,fraction:i/N,p:clone(p),on0,j:on0?ring.pendingJ:null,lit,col,halo:lit>.5,glint:lit>.5,out,r});delete ring.pendingJ;}
        if (lit > 0.5) owned(owner+'.halo','circle',()=>env.circle(p[0], p[1], r * 2.1, col, null, 0, 0.16 * lit * out, false));
        owned(owner+'.bulb','circle',()=>env.circle(p[0], p[1], r, lit > 0 ? J.mix(J.mix(board, col, 0.3), col, lit) : J.mix(board, col, 0.22), null, 0, out, false));
        if (lit > 0.5) owned(owner+'.glint','circle',()=>env.circle(p[0] - r * 0.25, p[1] - r * 0.3, r * 0.35, '#FFFFFF', null, 0, 0.7 * lit * out, false));
      });
    });
    const ty = cy - (subT ? ss * 0.9 : 0);
    if(captureD)catalog.lyric={owner:'bulbs.sign.lyric',text,font:Pm.font,size:size*Math.min(1,q),x:cx,y:ty,track:o.track,lead:o.lead};
    const bb = owned('lyric','mainDraw',()=>J.mainDraw(env, Object.assign({ text, font: Pm.font, size: size * Math.min(1, q), x: cx, y: ty, color: textC, noHold: plateHold(env) }, o)));
    if (subT) {
      const fs = ss * Math.min(1, q);
      const t = subT.length > 28 ? subT.slice(0, 27) + '…' : subT;
      const sz = reference.subtitle.size;
      if(captureD)catalog.subtitle={owner:'bulbs.sign.subtitle',original:subT,text:t,UTF16Length:subT.length,truncated:subT.length>28,fs,size:sz,x:cx,y:cy+m.h/2+padY*.1};
      owned('subtitle','draw',()=>env.draw({ text: t, font: bodyF(env), size: sz, x: cx, y: cy + m.h / 2 + padY * 0.1, track: 0.18, color: bulbC, alpha: tin(env, 0.3, 0.3) * out, ghost: false }));
    }
    if(captureD){catalog.bb=clone(bb);catalog.reshape57={recipe:clone(recipe),originalSize:reference.size,originalRadius:reference.r,originalN:reference.rings.map(r=>r.N),sourceCaption:clone(reference.subtitle),notNativeGeometry:true};}
    finished=true;return bb;
    } finally {if(nativeD){catalog.complete=finished&&catalog.bounded;catalog.status=catalog.complete?'complete':finished?'partial-budget':'native-threw';freeze(catalog);}}

};
})();
