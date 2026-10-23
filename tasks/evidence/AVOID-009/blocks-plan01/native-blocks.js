/* ================================================================== 9 blocks — 積み木 */
reg('blocks', {
  name: '積み木', tags: ['pop', 'graphic'], w: 0.8, treat: 'safe', ae: 'labels', fits: n => n >= 1 && n <= 14,
  enterBias: { cut: 2.5, drop: 1.4, pop: 1, blur: 0.4, slice: 0.2, wipe: 0.2, stretch: 0.3 },
  plan(rng, cut, st) {
    return { font: rng.pick(fontsOf(st, ['display'])), deco: rng.chance(0.75), tilt: rng.chance(0.5), hop: rng.chance(0.7), side: rng.pick([1, -1]), colOff: rng.int(0, 5) };
  },
  render(env) {
    const { W, H, sc, ctx } = env, cut = env.cut, Pm = cut.params, s = cut.seed, u = U(env), lt = env.lt;
    const n = J.glyphCount(cut.text);
    if (!n) return null;
    const port = isPort(env);
    const rowsB = rowsOf(cut.text, port ? 4 : n <= 6 ? 6 : Math.min(8, Math.ceil(n / 2)));
    const rows = rowsB.length, per = Math.max(...rowsB.map(r => r.length));
    const dk = 0.34, gk = 1.07;                                         // depth of the oblique side / top
    const deco = Pm.deco && (!port || n <= 3);
    const extra = deco ? 2 : 0;
    const k = Math.min(W * 0.84 / (per * gk + extra * 0.95 + dk), H * 0.7 / (rows * 1.02 + dk + 0.2), u * 0.26);
    const dx = k * dk * 0.8 * Pm.side, dy = -k * dk * 0.62;
    const floorY = H / 2 + (rows * k) / 2 + k * 0.1;
    const out = tout(env);
    const cols = objCols(sc);
    const lw = Math.max(1, k * 0.012);
    env.line([[W * 0.08, floorY], [W * 0.92, floorY]], sc.sub, Math.max(1, u * 0.002), 0.6 * tin(env, 0, 0.4) * out, false);
    const blk = [];
    // lyric blocks: bottom row first so the upper rows land on them
    let gi = 0;
    const byRow = rowsB.map(() => []);
    rowsB.forEach((row, r) => row.forEach((ch, j) => {
      if (ch === ' ') return;
      const x = W / 2 + (j - (row.length - 1) / 2) * k * gk - dx / 2;
      const b0 = { ch, x, y: floorY - (rows - r - 0.5) * k * 1.02, r, order: (rows - 1 - r) * per + j, col: cols[(gi++ + Pm.colOff) % cols.length] };
      blk.push(b0); byRow[r].push(b0);
    }));
    // blank blocks under any overhang so the upper rows always rest on something
    for (let r = 0; r < rows - 1; r++) for (const b0 of byRow[r]) {
      if (byRow[r + 1].some(q => Math.abs(q.x - b0.x) < k * 0.6)) continue;
      const f = { ch: null, shape: 3, x: b0.x, y: floorY - (rows - r - 1.5) * k * 1.02, r: r + 1, order: (rows - 2 - r) * per - 1, col: J.mix(b0.col, sc.bg, 0.35) };
      blk.push(f); byRow[r + 1].push(f);
    }
    if (deco) {
      const cntB = Math.min(per, n);
      const xl = W / 2 - (cntB - 1) / 2 * k * gk - dx / 2 - k * 1.05, xr = W / 2 + (cntB - 1) / 2 * k * gk - dx / 2 + k * 1.05;
      blk.push({ ch: null, shape: 0, x: xl, y: floorY - k * 0.5 * 0.8, sz: 0.8, order: -1, col: cols[(Pm.colOff + 2) % cols.length] });
      blk.push({ ch: null, shape: 1, x: xr, y: floorY - k * 0.5 * 0.8, sz: 0.8, order: n + 1, col: cols[(Pm.colOff + 3) % cols.length] });
      if (rows === 1) blk.push({ ch: null, shape: 2, x: xr + J.rs(s, 1) * k * 0.05, y: floorY - k * 0.8 - k * 0.3, sz: 0.6, order: n + 2, col: cols[(Pm.colOff + 1) % cols.length] });
    }
    const gap = J.clamp(cut.dur * 0.3 / (n + 2), 0.035, 0.1), fd = 0.3;
    let bb = null;
    // hop on the beat (or every 0.6 s)
    let hopI = -1, hopF = 0;
    if (Pm.hop && lt > 0.3 + (n + 2) * gap + fd) {
      if (env.beat && env.beat.len > 0.2) { hopI = J.h(s, env.beat.index, 4) % n; hopF = env.beat.since / 0.32; }
      else { const P0 = 0.65, kk = Math.floor(env.ltb / P0); hopI = J.h(s, kk, 4) % n; hopF = (env.ltb - kk * P0) / 0.32; }
    }
    const sorted = blk.slice().sort((a, b) => (b.y - a.y) || (Pm.side > 0 ? a.x - b.x : b.x - a.x));
    for (const b of sorted) {
      const kz = k * (b.sz || 1);
      const t1 = 0.06 + (b.order + 1) * gap;
      const f = (lt - t1) / fd;
      if (f < 0) continue;
      let y = b.y, sq = 1;
      if (f < 1) y = J.lerp(-kz * 2 - (H - b.y) * 0.2, b.y, E.inQuad(f));
      else { const tau = (f - 1) * fd; y = b.y - kz * 0.1 * Math.abs(Math.sin(tau * 14)) * Math.exp(-tau / 0.1); sq = 1 - 0.1 * Math.exp(-tau / 0.05); }
      const bi = blk.indexOf(b);
      if (bi === hopI && hopF < 1) y -= kz * 0.16 * Math.sin(Math.PI * J.clamp(hopF));
      y += E.inQuad(J.clamp(env.pOut * 1.4 - (b.order + 1) / (n + 3) * 0.4)) * H * 0.7;
      const rot = Pm.tilt && b.r === 0 && rows > 1 ? J.rs(s, bi, 3) * 3 : 0;
      ctx.save(); ctx.translate(b.x, y + kz / 2); ctx.rotate(rot * J.DEG); ctx.scale(1, sq); ctx.translate(0, -kz / 2);
      const hk = kz / 2, ddx = dx * (b.sz || 1), ddy = dy * (b.sz || 1);
      const top = shade(sc, b.col, 0.28), side = shade(sc, b.col, -0.3);
      env.poly([[-hk, -hk], [hk, -hk], [hk + ddx, -hk + ddy], [-hk + ddx, -hk + ddy]].map(p => Pm.side > 0 ? p : p), top, out, false);
      env.poly(Pm.side > 0 ? [[hk, -hk], [hk + ddx, -hk + ddy], [hk + ddx, hk + ddy], [hk, hk]] : [[-hk, -hk], [-hk + ddx, -hk + ddy], [-hk + ddx, hk + ddy], [-hk, hk]], side, out, false);
      env.rect(-hk, -hk, kz, kz, b.col, out, gIn(env));
      env.rrect(-hk + kz * 0.08, -hk + kz * 0.08, kz * 0.84, kz * 0.84, kz * 0.06, null, out, false, J.mix(b.col, onCol(sc, b.col), 0.35), lw * 1.5);
      if (b.ch == null) {
        const tcol = J.mix(b.col, onCol(sc, b.col), 0.8), q = kz * 0.26;
        if (b.shape === 3) { /* plain support block */ }
        else if (b.shape === 0) env.circle(0, 0, q, tcol, null, 0, out, false);
        else if (b.shape === 1) env.poly([[0, -q * 1.1], [q * 1.05, q * 0.8], [-q * 1.05, q * 0.8]], tcol, out, false);
        else env.poly([[0, -q], [q, 0], [0, q], [-q, 0]], tcol, out, false);
      }
      ctx.restore();
      if (b.ch != null) {
        const m = [Math.cos(rot * J.DEG), Math.sin(rot * J.DEG), -Math.sin(rot * J.DEG) * sq, Math.cos(rot * J.DEG) * sq, b.x, y + kz / 2];
        bb = UB(bb, drawAff(env, { text: b.ch, font: Pm.font, size: kz * 0.6, x: 0, y: -kz / 2, color: onCol(sc, b.col), noHold: plateHold(env), mi: miAt(env, t1) }, m));
      }
    }
    return bb;
  },
});

