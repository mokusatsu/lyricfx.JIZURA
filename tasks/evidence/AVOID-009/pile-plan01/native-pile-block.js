/* ================================================================== 8 pile — 文字の山 */
reg('pile', {
  name: '文字の山', tags: ['pop', 'emotional', 'graphic'], w: 0.8, ae: 'scatter', fits: n => n >= 1 && n <= 14,
  enterBias: { cut: 2.4, drop: 1.2, pop: 0.8, slice: 0.2, wipe: 0.2, stretch: 0.3, assemble: 0.4 },
  plan(rng, cut, st) {
    return { font: rng.pick(fontsOf(st, ['display'])), hf: rng.pick(fontsOf(st, ['body', 'display', 'serif'])), peak: rng.range(-0.12, 0.12), hgt: rng.range(0.26, 0.34), order: rng.pick(['ltr', 'random', 'random']), dust: rng.chance(0.7) };
  },
  render(env) {
    const { W, H, sc } = env, cut = env.cut, Pm = cut.params, s = cut.seed, u = U(env), lt = env.lt;
    const port = isPort(env);
    const t0 = flat(cut.text), n = J.glyphCount(t0);
    if (!n) return null;
    const rowsT = n > (port ? 5 : 8) ? chunksK(t0, port ? Math.ceil(n / 5) : 2) : [t0];
    const nR = rowsT.length;
    const out = tout(env);
    let size = Math.min(u * 0.2, H * 0.5 / (nR + 0.6));
    for (const r of rowsT) { let a = 0; for (const ch of r) a += adv(Pm.font, ch) * 1.02; size = Math.min(size, W * (port ? 0.86 : 0.74) / Math.max(1, a)); }
    let maxTot = 0; for (const r of rowsT) { let a = 0; for (const ch of r) a += adv(Pm.font, ch) * 1.02 * size; maxTot = Math.max(maxTot, a); }
    const cx = J.clamp(W * (0.5 + Pm.peak * (port ? 0.2 : 0.6)), W * 0.06 + maxTot / 2, W * 0.94 - maxTot / 2), sig = Math.max(W * 0.26, maxTot * 0.68);
    const yBase = H * 1.04;
    const Hm = yBase - (H * (0.5 + Pm.hgt * 0.25) + nR * size * 0.49);
    const rise = (1 - E.outCubic(J.clamp(lt / 0.5))) * Hm * 1.1 + E.inCubic(env.pOut) * Hm * 0.5;
    const bump = x => Math.sin(x / W * 17 + s % 7) * H * 0.006 + Math.sin(x / W * 31 + (s % 5)) * H * 0.004;
    const surf = x => yBase + rise - Hm / (1 + Math.pow((x - cx) / sig, 4)) + bump(x);
    // heap of small glyphs under the surface (one item, glyphs placed by charFn)
    const pool = poolOf(cut), NP = pool.length;
    const cell = J.clamp(u * 0.045, 16, 60);
    const heap = [];
    // the body of the mound (dim), glyphs only in the top few layers
    const mound = [];
    for (let i = 0; i <= 48; i++) { const x = -W * 0.02 + W * 1.04 * i / 48; mound.push([x, surf(x) + cell * 1.2]); }
    mound.push([W * 1.02, H + 4], [-W * 0.02, H + 4]);
    env.poly(mound, J.mix(sc.bg, sc.sub, 0.14), out, false);
    const colsN = Math.ceil(W / cell) + 2, depth = Math.max(3, Math.min(5, Math.floor(200 / colsN)));
    for (let gx = -1; gx < colsN - 1 && heap.length < 200; gx++) {
      const x = (gx + 0.5) * cell;
      const top = surf(x);
      for (let gy = 0; gy < depth && heap.length < 200; gy++) {
        const y = top + (gy + 0.5) * cell * 0.82;
        if (y > H + cell) break;
        const j = heap.length;
        heap.push({ x: x + J.rs(s, gx, gy, 3) * cell * 0.3, y: y + J.rs(s, gx, gy, 4) * cell * 0.2, r: J.rs(s, gx, gy, 5) * 70, ch: pool[J.h(s, gx, gy, 6) % NP], c: J.r(s, gx, gy, 7) < 0.14 ? 1 : 0, a: (0.35 + 0.5 * J.r(s, gx, gy, 8)) * (1 - gy / (depth + 1)) });
      }
    }
    if (env.pass === 'main' && heap.length) {
      const it = { text: heap.map(q => q.ch).join(''), font: Pm.hf, size: cell * 0.8, x: 0, y: 0, color: sc.sub, ghost: false, alpha: out };
      it._lay = J.layoutText(it);
      it.charFn = (i, g) => { const q = heap[i]; return q ? { dx: q.x - g.x, dy: q.y - g.y, rot: q.r, a: q.a, color: q.c ? sc.accent : null } : { hide: true }; };
      env.draw(it);
    }
    // lyric glyphs fall onto the heap and settle along its slope
    const fd = 0.34, gap = J.clamp(cut.dur * 0.3 / n, 0.03, 0.09);
    let bb = null, idx = 0;
    const order = [];
    for (let ri = nR - 1; ri >= 0; ri--) {                  // lower layers land first
      const chars = [...rowsT[ri]];
      const ord = chars.map((c, i) => i);
      if (Pm.order === 'random') ord.sort((a, b) => J.r(s, ri, a, 21) - J.r(s, ri, b, 21));
      ord.forEach(i => order.push([ri, i]));
    }
    const when = new Map(); order.forEach(([ri, i], q) => when.set(ri * 100 + i, 0.08 + q * gap));
    rowsT.forEach((row, ri) => {
      const layer = nR - 1 - ri;
      const chars = [...row], ads = chars.map(ch => adv(Pm.font, ch) * size * 1.02), tot = ads.reduce((a, b) => a + b, 0);
      let x = cx - tot / 2;
      chars.forEach((ch, i) => {
        const gxp = x + ads[i] / 2; x += ads[i];
        if (ch === ' ') return;
        const ys = surf(gxp);
        const slope = Math.atan2(surf(gxp + size * 0.5) - surf(gxp - size * 0.5), size);
        const tilt = slope / J.DEG * 0.7 + J.rs(s, ri, i, 9) * 6;
        const restY = ys - size * (0.47 + layer * 0.98);
        const t1 = when.get(ri * 100 + i);
        const f = (lt - t1) / fd;
        if (f < 0) return;
        let y, rot, sy = 1;
        if (f < 1) { const e = E.inQuad(f); y = J.lerp(-size * 1.2 - J.r(s, ri, i, 10) * H * 0.2, restY, e); rot = J.lerp(J.rs(s, ri, i, 11) * 50, tilt, e); }
        else {
          const tau = (f - 1) * fd;
          y = restY - size * 0.14 * Math.abs(Math.sin(tau * 16)) * Math.exp(-tau / 0.09); rot = tilt; sy = 1 - 0.16 * Math.exp(-tau / 0.05);
          if (Pm.dust && tau < 0.35 && env.pass === 'main') {
            for (let q = 0; q < 4; q++) {
              const dir = q < 2 ? -1 : 1, sp = J.rr(0.6, 1.2, s, ri, i, q);
              env.circle(gxp + dir * (size * 0.35 + tau * size * 1.6 * sp), restY + size * 0.45 - tau * size * (0.9 - tau * 2.2) * sp, size * 0.035 * (1 - tau / 0.35), sc.sub, null, 0, (1 - tau / 0.35) * out, false);
            }
          }
        }
        idx++;
        bb = UB(bb, J.mainDraw(env, { text: ch, font: Pm.font, size, x: gxp, y: y + size * 0.47 * (1 - sy), sy, rot, color: J.r(s, ri, i, 12) < 0.12 ? sc.accent : sc.fg, mi: miAt(env, t1) }));
      });
    });
    return bb;
  },
});

