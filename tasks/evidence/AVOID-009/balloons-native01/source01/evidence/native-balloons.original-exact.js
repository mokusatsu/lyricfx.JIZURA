/* ================================================================== 10 balloons — 文字風船 */
reg('balloons', {
  name: '文字風船', tags: ['pop', 'emotional', 'calm'], w: 0.8, treat: false, ae: 'scatter', fits: n => n >= 1 && n <= 14,
  enterBias: { cut: 1.8, pop: 1.5, drop: 0.6, blur: 0.8, slice: 0.2, wipe: 0.2, assemble: 0.3 },
  plan(rng, cut, st) {
    return { font: rng.pick(fontsOf(st, ['display'])), tie: rng.pick(['bunch', 'bunch', 'free']), arc: rng.range(0.02, 0.06), colOff: rng.int(0, 4), mono: rng.chance(0.3) };
  },
  render(env) {
    const { W, H, sc } = env, cut = env.cut, Pm = cut.params, s = cut.seed, u = U(env), lt = env.lt;
    const port = isPort(env);
    const t0 = flat(cut.text), n = J.glyphCount(t0);
    if (!n) return null;
    const rowsT = n > (port ? 4 : 7) ? chunksK(t0, port ? Math.ceil(n / 4) : 2) : [t0];
    const nR = rowsT.length;
    const out = tout(env), mot = env.fx.motion ?? 0.7;
    let size = Math.min(u * 0.26, H * 0.56 / (nR * 1.25 + 0.3));
    for (const r of rowsT) { let a = 0; for (const ch of r) a += adv(Pm.font, ch) * 1.2; size = Math.min(size, W * 0.84 / Math.max(1, a)); }
    const cols = objCols(sc);
    const gx = W / 2, gy = H * 0.93;
    const fly = E.inCubic(env.pOut) * H * 0.9;
    const glyphs = [];
    rowsT.forEach((row, ri) => {
      const chars = [...row], ads = chars.map(ch => adv(Pm.font, ch) * size * 1.2), tot = ads.reduce((a, b) => a + b, 0);
      let x = W / 2 - tot / 2;
      const yRow = H * (nR > 1 ? 0.4 : 0.4) + (ri - (nR - 1) / 2) * size * 1.3;
      chars.forEach((ch, i) => {
        const cxp = x + ads[i] / 2; x += ads[i];
        if (ch === ' ') return;
        const q = glyphs.length;
        const ph = J.r(s, q, 1) * J.TAU;
        const u0 = tot > 0 ? (cxp - W / 2) / (tot / 2) : 0;
        const t1 = 0.05 + q * J.clamp(cut.dur * 0.3 / n, 0.03, 0.08);
        const e = J.clamp((lt - t1) / 0.45);
        const bob = Math.sin(env.ltb * 1.4 + ph) * size * 0.05 * (0.4 + mot);
        const y = yRow - Pm.arc * H * (1 - u0 * u0) + bob + (1 - E.outCubic(e)) * H * 0.35 - fly * (0.8 + 0.4 * J.r(s, q, 2));
        glyphs.push({ ch, x: cxp + Math.sin(env.ltb * 0.9 + ph) * size * 0.03, y, rot: Math.sin(env.ltb * 0.8 + ph * 1.3) * 5 * (0.4 + mot) + J.rs(s, q, 3) * 4, e, t1, col: Pm.mono ? cols[Pm.colOff % cols.length] : cols[(q + Pm.colOff) % cols.length], q });
      });
    });
    // strings (behind the balloons)
    const lw = Math.max(1, u * 0.0016);
    for (const g of glyphs) {
      if (g.e <= 0) continue;
      const bx = g.x - Math.sin(g.rot * J.DEG) * size * 0.58, by = g.y + Math.cos(g.rot * J.DEG) * size * 0.58;
      const pts = [];
      const ex = Pm.tie === 'bunch' ? gx + (g.x - gx) * 0.06 : bx + Math.sin(env.ltb * 1.1 + g.q) * size * 0.2, ey = Pm.tie === 'bunch' ? gy - fly : Math.min(H * 1.05, by + H * 0.3);
      for (let k = 0; k <= 10; k++) {
        const f = k / 10, wig = Math.sin(f * 7 + env.ltb * 2 + g.q) * size * 0.05 * f * (1 - f) * 4;
        pts.push([J.lerp(bx, ex, f) + wig, J.lerp(by, ey, f) + Math.sin(f * Math.PI) * size * 0.25]);
      }
      env.line(pts, sc.sub, lw, 0.85 * out * g.e, false);
      env.poly([[bx - size * 0.05, by + size * 0.07], [bx + size * 0.05, by + size * 0.07], [bx, by - size * 0.02]], shade(sc, g.col, -0.35), out * g.e, false);
    }
    if (Pm.tie === 'bunch') env.circle(gx, gy - fly, size * 0.05, sc.sub, null, 0, out * tin(env, 0.2, 0.3), false);
    let bb = null;
    for (const g of glyphs) {
      if (g.e <= 0) continue;
      const q = E.outBack(g.e, 2.2), sz = size * (0.3 + 0.7 * q);
      const dark = shade(sc, g.col, -0.38);
      // puffy rim, body, gloss
      env.draw({ text: g.ch, font: Pm.font, size: sz, x: g.x, y: g.y, rot: g.rot, color: dark, stroke: sz * 0.13, strokeColor: dark, strokeUnder: true, alpha: out, ghost: false });
      bb = UB(bb, J.mainDraw(env, { text: g.ch, font: Pm.font, size: sz, x: g.x, y: g.y, rot: g.rot, color: g.col, stroke: sz * 0.065, strokeColor: g.col, strokeUnder: true, plain: true, mi: miAt(env, g.t1) }));
      env.draw({ text: g.ch, font: Pm.font, size: sz, x: g.x - sz * 0.02, y: g.y - sz * 0.03, rot: g.rot, color: lightOf(sc), alpha: 0.3 * out * Math.min(1, g.e * 2), ghost: false, charFn: () => ({ clipY: [-0.75, -0.22], s: 0.93 }) });
      env.circle(g.x - sz * 0.22, g.y - sz * 0.26, sz * 0.045, lightOf(sc), null, 0, 0.7 * out * g.e, false);
    }
    return bb;
  },
});

