(function(J){
'use strict';
const E=J.E;
const U = env => Math.min(env.W, env.H);
const isPort = env => env.H > env.W * 1.08;
const strip = t => String(t || '').replace(/\s+/g, '');
const hasLatin = t => /[A-Za-z]/.test(t);
/* text as one run: latin keeps single word spaces, Japanese drops them */
const flat = t => (hasLatin(t) ? String(t || '').trim().replace(/\s+/g, ' ') : strip(t));
/* glyph slots keeping single word gaps (latin lyrics): a ' ' slot is left empty */
const slotsOf = t => [...flat(t)];
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

const recipes=new WeakMap();
function withRecipe(env,recipe,fn){
 if(recipes.has(env)||!env||typeof fn!=='function'||!recipe||![1,.6,.58,.55].includes(recipe.scale)||typeof recipe.below!=='boolean'||Object.keys(recipe).some(k=>!['scale','below','profile'].includes(k)))throw Error('CROSSWORD28_PRIVATE_RECIPE');
 if(recipe.scale===1 ? recipe.below!==false||recipe.profile!==undefined : recipe.below!==true||!['A','B','C'].includes(recipe.profile))throw Error('CROSSWORD30_PROFILE');
 const accepted=Object.freeze({scale:recipe.scale,below:recipe.below,profile:recipe.profile});recipes.set(env,accepted);try{return fn();}finally{recipes.delete(env);}
}
const render=({
  render(env) {
    const { W, H, sc } = env, cut = env.cut, Pm = cut.params, s = cut.seed, u = U(env), lt = env.lt;
    const port = isPort(env);
    const t0 = flat(cut.text);
    const chs = [...t0].filter(c => c !== ' ');
    const n = chs.length;
    if (!n) return null;
    const maxRow = port ? 7 : 12;
    const words = n > maxRow ? chunksK(t0, Math.ceil(n / maxRow)).map(w => [...w].filter(c => c !== ' ')) : [chs];
    const L = Math.max(...words.map(w => w.length));
    const C = Math.max(L + 2, port ? 7 : 9), R = words.length > 1 ? 7 : port ? 7 : 5;
    const below = Pm.clue && H > W * 0.7, clueW = Pm.clue && !below ? 0.24 : 0;
    const nativeCell = Math.min(W * (0.88 - clueW) / C, H * (below ? 0.64 : 0.8) / R, u * 0.14);
    const recipe=recipes.get(env), cell=recipe?nativeCell*recipe.scale:nativeCell;
    const profile=recipe?.profile, numberY=profile&&profile!=='A'?.18:.15, mainRatio=profile?(profile==='B'?.7:.65):.7, mainY=profile?(profile==='B'?.62:.64):.56;
    const gw = C * cell, gh = R * cell;
    const fsC = Math.max(smallSize(env) * 1.15, nativeCell * 0.24);
    const clueBelow=recipe?recipe.below:below;
    const gx=recipe?(W-gw-(clueBelow?0:(clueW?W*clueW:0)))/2:(W-gw-(clueW?W*clueW:0))/2, gy=recipe?(H-gh-(clueBelow?fsC*5:0))/2:(H-gh-(below?fsC*5:0))/2;
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
        if (num.has(kk)) env.draw({ text: String(num.get(kk)), font: monoF(env), size: profile&&profile!=='A'?12:recipe?nativeCell*.2:cell*.2, align: 'left', x: x + cell * 0.07, y: y + cell * numberY, color: inkC, alpha: 0.8 * ra * out, ghost: false });
        const pc = pencil.get(kk);
        if (pc) env.draw({ text: pc, font: bodyF(env), size: cell * 0.46, x: x + cell / 2, y: y + cell * 0.56, color: J.mix(paperC, inkC, 0.38), alpha: tin(env, 0.3 + r * 0.03, 0.3) * out, ghost: false });
      }
    }
    let bb = null;
    order.forEach(([wi, j], q) => {
      const ch = words[wi][j];
      const x = gx + (c0[wi] + j + 0.5) * cell, y = gy + (rowsW[wi] + mainY) * cell;
      bb = UB(bb, J.mainDraw(env, { text: ch, font: Pm.font, size: cell * mainRatio, x, y, color: inkC, noHold: plateHold(env), mi: miAt(env, T1 + q * per) }));
    });
    if (Pm.clue) {
      const fs = fsC;
      const cxl = clueBelow ? gx : gx + gw + W * 0.035, cyl = clueBelow ? gy + gh + fs * 1.6 : gy + fs;
      const a = tin(env, 0.35, 0.4, E.outCubic) * out;
      const n1 = num.get(key(rowsW[0], c0[0])) || 1;
      const lines = [['ヨコのカギ', sc.accent, monoF(env)], [n1 + '  ' + (cut.note || romajiOf(env) || '(' + n + ')'), sc.fg, bodyF(env)], ['タテのカギ', sc.accent, monoF(env)], [(num.size > 3 ? 3 : 2) + '  ─', sc.sub, bodyF(env)]];
      lines.forEach(([t, col, f], i) => {
        const tt = t.length > 22 ? t.slice(0, 21) + '…' : t;
        const yy = clueBelow ? cyl + (i % 2) * fs * 1.7 : cyl + i * fs * 1.9 + (i >= 2 ? fs * 0.8 : 0), xx = clueBelow && i >= 2 ? cxl + gw * 0.55 : cxl;
        env.draw({ text: tt, font: f, size: fs, align: 'left', x: xx, y: yy, track: 0.08, color: col, alpha: a, ghost: false });
      });
    }
    return bb || box(gx, gy, gx + gw, gy + gh);
  }
}).render;return Object.freeze({render,withRecipe});
})
