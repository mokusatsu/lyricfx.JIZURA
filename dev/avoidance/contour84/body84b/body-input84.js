/* Source-only contour body requests; measurement cache side effects remain possible. */
(()=>{'use strict';const A=J.placement,E=J.E,H84=A.contourNativeGeometry84a;
const U = env => Math.min(env.W, env.H);
const isPort = env => env.H > env.W * 1.08;
const strip = t => String(t || '').replace(/\s+/g, '');
const hasLatin = t => /[A-Za-z]/.test(t);
const flat = t => (hasLatin(t) ? String(t || '').trim().replace(/\s+/g, ' ') : strip(t));
const monoF = env => (env.st.fonts.mono && env.st.fonts.mono[0]) || 'mono';
const tin = (env, d = 0, len = 0.4, ease = E.outExpo) => ease(J.clamp((env.lt - d) / Math.max(0.01, len)));
const tout = env => 1 - E.inCubic(env.pOut);
const pad2 = n => String(n).padStart(2, '0');
const lineNo = env => pad2(Math.max(0, env.cut.line | 0) + 1);
const smallSize = env => J.clamp(U(env) * 0.024, 13, 32);
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

function layout(env){const{W,H,sc}=env,cut=env.cut,Pm=cut.params,{port,u}=H84.header(env);
    const text = brk(cut.text, port ? 6 : 8);
    const o = { track: 0.06, lead: 1.25 };
    const size = Math.min(J.fitSize(text, Pm.font, W * (port ? 0.8 : 0.5), H * 0.3, o), u * 0.12);
    const m = J.measure(Object.assign({ text, font: Pm.font, size }, o));
    const tx = port ? W / 2 : W / 2 - Pm.side * W * 0.2, ty = Pm.place === 'low' ? H * (port ? 0.78 : 0.7) : H / 2;
    const mx = J.clamp(tx, W * 0.06 + m.w / 2, W * 0.94 - m.w / 2);
return{args:Object.assign({ text, font: Pm.font, size, x: mx, y: ty, color: sc.fg }, o),measurement:m,layout:{text,size,tx,ty,mx},sourceOnly:true,qualified:false};}
function after(env,bb){const calls=[],input=env;env={...input,line(...args){calls.push({kind:'line',args})},draw(...args){calls.push({kind:'draw',args})}};const{out,u,big}=H84.header(env),sc=env.sc,lineC=env.cut.params.col==='accent'?sc.accent:sc.sub;
    const la = tin(env, 0.3, 0.4, E.outCubic) * out;
    if (bb && la > 0) {
      const ls = smallSize(env) * 0.9;
      env.line([[bb.x0, bb.y0 - ls * 1.2], [bb.x0 + (bb.x1 - bb.x0) * la, bb.y0 - ls * 1.2]], lineC, Math.max(1, u * 0.0015), 0.8, false);
      env.draw({ text: `${big}  ─  No.${lineNo(env)}`, font: monoF(env), size: ls, track: 0.2, align: 'left', x: bb.x0, y: bb.y0 - ls * 2.3, color: sc.sub, alpha: la, ghost: false });
    }
    return{bb,calls,sourceOnly:true,qualified:false};
}
Object.defineProperty(A,'contourBodyInput84b',{value:Object.freeze({layout,after,sourceOnly:true,certificateIssuer:false})});})();
