/* ================================================================== 7 pendulum — 振り子 */
reg('pendulum', {
  name: '振り子', tags: ['calm', 'pop', 'emotional'], w: 0.8, treat: 'safe', portrait: 1.2, ae: 'labels', fits: n => n >= 1 && n <= 16,
  enterBias: { cut: 2, drop: 1.4, pop: 1.2, blur: 0.8, slice: 0.2, wipe: 0.3, stretch: 0.3 },
  plan(rng, cut, st) {
    const n = cut.n, port = cut.H > cut.W * 1.08, spaced = /\s/.test(String(cut.text).trim());
    const opts = [];
    if (n <= (port ? 5 : 8) && !spaced) opts.push('cradle', 'cradle');
    if (n <= 12 && !spaced) opts.push('fan', port ? 'fan' : 'chunks');
    if (n >= 4) opts.push('chunks');
    const mode = rng.pick(opts.length ? opts : ['chunks']);
    return { mode, chunks: chunksK(cut.text, J.clamp(Math.ceil(n / 4), 2, 4)), font: rng.pick(fontsOf(st, ['display', 'serif'])), period: rng.range(1.05, 1.4), amp: rng.range(22, 30), phase: rng.range(0, 6), side: rng.pick([1, -1]) };
  },
  render(env) {
    const { W, H, sc, ctx } = env, cut = env.cut, Pm = cut.params, s = cut.seed, u = U(env), lt = env.lt;
    const chs = slotsOf(cut.text).filter(c => c !== ' '), n = chs.length;
    if (!n) return null;
    const out = tout(env), mot = env.fx.motion ?? 0.7;
    const port = isPort(env);
    let mode = Pm.mode;
    if (mode === 'cradle' && n > (port ? 6 : 9)) mode = 'fan';
    if (mode === 'fan' && n > 13) mode = 'chunks';
    const lw = Math.max(1, u * 0.0015);
    const pc = plateCol(sc, [sc.ink, sc.fg]), tc = onCol(sc, pc);
    const fa = tin(env, 0, 0.45, E.outCubic) * out;
    let bb = null;
    if (mode === 'cradle') {
      const r = Math.min(W * 0.84 / (n * 2.02 + 1.2), H * 0.13, u * 0.12);
      const L = Math.min(H * 0.42, r * 5.2);
      const cx = W / 2, x0 = cx - (n - 1) * r;
      const py = H / 2 - L * 0.62, by = py + L;
      // frame
      const fw = (n - 1) * r + r * 2.6, fb = by + r + H * 0.06;
      const fc = sc.sub;
      env.line([[cx - fw, fb], [cx - fw, py], [cx + fw, py], [cx + fw, fb]], fc, Math.max(2, u * 0.006), fa, false);
      env.rrect(cx - fw - r * 0.7, fb, fw * 2 + r * 1.4, r * 0.28, r * 0.1, fc, fa, false);
      const T = Pm.period, w = J.TAU / T, A = Pm.amp * J.DEG * (0.6 + 0.5 * mot);
      const t0 = 0.75, tau = env.ltb - t0;
      let sAng = tau > 0 ? -Math.cos(w * tau) : -1;
      const lift = tau > 0 ? 1 : E.inOutCubic(J.clamp((lt - 0.25) / 0.45));
      const decay = 1 - 0.25 * J.clamp(tau / 6);
      chs.forEach((ch, i) => {
        const px = x0 + i * r * 2;
        let th = 0;
        if (i === 0) th = A * decay * Math.min(0, sAng) * (tau > 0 ? 1 : lift);
        if (i === n - 1 && n > 1) th = A * decay * Math.max(0, sAng);
        if (n === 1) th = A * decay * sAng * lift;
        const drop = E.outBack(J.clamp((lt - i * 0.05) / 0.35), 1.4);
        const Lc = L * drop;
        const bx = px + Math.sin(th) * Lc, byy = py + Math.cos(th) * Lc;
        if (drop <= 0) return;
        const d = r * 0.85;
        env.line([[px - d, py], [bx, byy]], sc.sub, lw, 0.9 * out, false);
        env.line([[px + d, py], [bx, byy]], sc.sub, lw, 0.9 * out, false);
        env.circle(bx, byy, r * 0.985, pc, null, 0, out, gIn(env));
        env.circle(bx - r * 0.35, byy - r * 0.38, r * 0.2, lightOf(sc), null, 0, 0.35 * out, false);
        env.circle(bx, byy, r * 0.985, null, J.mix(pc, darkOf(sc), 0.4), lw, out, false);
        // impact sparks
        if (tau > 0 && ((i === 0 && n > 1) || i === n - 1)) {
          const ph = ((w * tau) / Math.PI) % 2, near = Math.min(Math.abs(ph - 0.5), Math.abs(ph - 1.5));
          if (near < 0.08 && ((i === 0) === (Math.abs(ph - 0.5) < 0.08)) ) {
            const k = 1 - near / 0.08, sx = px + (i === 0 ? r : -r);
            for (let q = -1; q <= 1; q++) env.line([[sx + (i === 0 ? r * 0.2 : -r * 0.2), byy + q * r * 0.5], [sx + (i === 0 ? r * 0.55 : -r * 0.55), byy + q * r * 0.9]], sc.accent, Math.max(1.5, r * 0.05), k * out, false);
          }
        }
        bb = UB(bb, J.mainDraw(env, { text: ch, font: Pm.font, size: r * 1.08, x: bx, y: byy, rot: -th / J.DEG, color: tc, noHold: plateHold(env), mi: miAt(env, 0.15 + i * 0.05) }));
      });
      return bb;
    }
    // single pivot: several pendulums of different length (a pendulum wave)
    const items = mode === 'fan' ? chs.map(c => ({ t: c })) : (Pm.chunks && Pm.chunks.length ? Pm.chunks : chunksK(cut.text, 3)).map(c => ({ t: flat(c) }));
    const k = items.length;
    const px = W / 2 + (mode === 'chunks' && !port ? 0 : 0), py = H * 0.06;
    let size, step, L0, plateW = [];
    if (mode === 'fan') {
      step = Math.min(H * 0.84 / (k + 1.2), W * 0.2);
      size = step * 0.84; L0 = step * 1.4;
    } else {
      const wMax = W * (port ? 0.8 : 0.56);
      size = Math.min(...items.map(q => J.fitSize(q.t, Pm.font, wMax, H * 0.8 / (k + 1) * 0.62, { track: 0.03 })), u * 0.14);
      step = size * 1.75; L0 = Math.max(H * 0.9 - step * k, size * 2);
      plateW = items.map(q => J.measure({ text: q.t, font: Pm.font, size, track: 0.03 }).w + size * 0.8);
    }
    const Lmax = L0 + step * (k - 1);
    const A = (mode === 'fan' ? 7 : 5) * J.DEG * (0.5 + 0.7 * mot);
    const rel = E.inOutCubic(J.clamp((lt - 0.1) / 0.6));
    env.circle(px, py, Math.max(3, u * 0.008), sc.accent, null, 0, fa, false);
    env.rect(px - u * 0.06 * fa, py - Math.max(2, u * 0.003), u * 0.12 * fa, Math.max(3, u * 0.005), sc.sub, fa, false);
    const pos = items.map((q, i) => {
      const L = L0 + step * i;
      const Ti = Pm.period * 1.6 * Math.sqrt(L / Lmax);
      const tau = Math.max(0, env.ltb - 0.2);
      const th = A * Pm.side * Math.cos(J.TAU * tau / Ti) * rel + E.inCubic(env.pOut) * 30 * J.DEG * Pm.side * (0.5 + i / k);
      const grow = E.outCubic(J.clamp((lt - i * 0.04) / 0.4));
      return { L: L * grow, th, grow };
    });
    // strings first, bobs on top so the fan never cuts through a glyph
    pos.forEach((q, i) => { if (q.grow > 0) env.line([[px, py], [px + Math.sin(q.th) * q.L, py + Math.cos(q.th) * q.L - (mode === 'fan' ? size * 0.55 : size * 0.62)]], sc.sub, lw, 0.75 * out, false); });
    items.forEach((q, i) => {
      const p = pos[i];
      if (p.grow <= 0) return;
      const bx = px + Math.sin(p.th) * p.L, byy = py + Math.cos(p.th) * p.L;
      const col = i % 2 && J.contrast(sc.accent, sc.bg) > 1.6 ? sc.accent : pc;
      if (mode === 'fan') {
        env.circle(bx, byy, size * 0.62, col, null, 0, out, gIn(env));
      } else {
        const w2 = plateW[i], h2 = size * 1.24;
        ctx.save(); ctx.translate(bx, byy); ctx.rotate(-p.th);
        env.rrect(-w2 / 2, -h2 / 2, w2, h2, h2 * 0.14, col, out, gIn(env));
        env.circle(0, -h2 / 2 + h2 * 0.12, Math.max(2, size * 0.06), sc.bg, null, 0, out, false);
        ctx.restore();
      }
      bb = UB(bb, J.mainDraw(env, { text: q.t, font: Pm.font, size: mode === 'fan' ? size * 0.78 : size, track: 0.03, x: bx, y: byy + (mode === 'fan' ? 0 : size * 0.06), rot: -p.th / J.DEG, color: onCol(sc, col), noHold: plateHold(env), mi: miAt(env, 0.12 + i * 0.05) }));
    });
    return bb;
  },
});

