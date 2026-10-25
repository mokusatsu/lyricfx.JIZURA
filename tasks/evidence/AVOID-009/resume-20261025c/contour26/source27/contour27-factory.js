(function createContour27(J){'use strict';const bindings=new WeakMap();
const E=J.E;
const U = env => Math.min(env.W, env.H);
const isPort = env => env.H > env.W * 1.08;
const strip = t => String(t || '').replace(/\s+/g, '');
const hasLatin = t => /[A-Za-z]/.test(t);
const flat = t => (hasLatin(t) ? String(t || '').trim().replace(/\s+/g, ' ') : strip(t));
const fontsOf = (st, roles) => J.fontsOf(st, roles);
const bodyF = env => (env.st.fonts.body && env.st.fonts.body[0]) || 'gothic_med';
const monoF = env => (env.st.fonts.mono && env.st.fonts.mono[0]) || 'mono';
const tin = (env, d = 0, len = 0.4, ease = E.outExpo) => ease(J.clamp((env.lt - d) / Math.max(0.01, len)));
const tout = env => 1 - E.inCubic(env.pOut);
const pad2 = n => String(n).padStart(2, '0');
const lineNo = env => pad2(Math.max(0, env.cut.line | 0) + 1);
const smallSize = env => J.clamp(U(env) * 0.024, 13, 32);
const brk = (text, maxPer) => { const t = flat(text), n = J.glyphCount(t); return n <= maxPer ? t : chunksK(t, Math.ceil(n / maxPer)).join('\n'); };
const chunksK=()=>{throw Error("OUTSIDE_FOUR_GLYPH_SOURCE");};
const original=({
  name: '等高線', tags: ['calm', 'graphic', 'emotional'], w: 0.9, ae: 'huge', fits: n => n >= 1 && n <= 16,
  enterBias: { blur: 1.3, cut: 1.2, wipe: 1, slice: 0.6 },
  plan(rng, cut, st) {
    return { font: rng.pick(fontsOf(st, ['display', 'serif'])), fb: rng.pick(fontsOf(st, ['display'])), side: rng.pick([1, -1]), rings: rng.int(4, 6), speed: rng.range(0.25, 0.5), col: rng.pick(['sub', 'accent', 'sub']), place: rng.pick(['low', 'center', 'low']) };
  },
  render(env) {
    const { W, H, sc, ctx } = env, cut = env.cut, Pm = cut.params, u = U(env), lt = env.lt;
    const port = isPort(env);
    const out = tout(env);
    const t0 = strip(cut.text);
    const kan = [...t0].filter(c => J.isKanji(c));
    const big = kan.length ? kan[0] : [...t0].filter(c => !J.isPunct(c) && !J.isSmallKana(c))[0] || [...t0][0] || '';
    const bs = Math.min(H * 0.95, W * (port ? 1.05 : 0.7));
    const bx = W / 2 + Pm.side * W * (port ? 0.12 : 0.2), by = H * 0.5;
    const lineC = Pm.col === 'accent' ? sc.accent : sc.sub;
    // contour rings: a fat stroke in the line colour, then a slightly thinner one in the ground colour → one thin line per level
    const cin = tin(env, 0, 0.5, E.outCubic) * out;
    if (env.pass === 'main' && big && cin > 0.01) {
      const K = Pm.rings, gap = bs * 0.03, lw = Math.max(1.2, bs * 0.0028);
      const ph = ((env.ltb * Pm.speed) % 1 + 1) % 1;
      const grow = E.outCubic(J.clamp(lt / 0.9));
      ctx.save();
      ctx.font = J.fontCSS(Pm.fb, bs); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      for (let k = K; k >= 1; k--) {
        const wk = 2 * gap * (k - 1 + ph) * grow + gap * 0.6;
        const a = (k === K ? 1 - ph : 1) * (1 - 0.1 * k) * cin;
        if (a <= 0.01) continue;
        ctx.globalAlpha = a * 0.8; ctx.strokeStyle = lineC; ctx.lineWidth = wk + lw; ctx.strokeText(big, bx, by);
        ctx.globalAlpha = 0.94 * cin; ctx.strokeStyle = sc.bg; ctx.lineWidth = Math.max(0.1, wk - lw); ctx.strokeText(big, bx, by);
      }
      ctx.globalAlpha = 0.94 * cin; ctx.fillStyle = sc.bg; ctx.fillText(big, bx, by);
      ctx.globalAlpha = cin; ctx.strokeStyle = lineC; ctx.lineWidth = lw * 1.6; ctx.strokeText(big, bx, by);
      ctx.restore();
    }
    // the lyric, small and solid, in the calm area beside the big character
    const text = brk(cut.text, port ? 6 : 8);
    const o = { track: 0.06, lead: 1.25 };
    const size = Math.min(J.fitSize(text, Pm.font, W * (port ? 0.8 : 0.5), H * 0.3, o), u * 0.12);
    const m = J.measure(Object.assign({ text, font: Pm.font, size }, o));
    const tx = port ? W / 2 : W / 2 - Pm.side * W * 0.2, ty = Pm.place === 'low' ? H * (port ? 0.78 : 0.7) : H / 2;
    const mx = J.clamp(tx, W * 0.06 + m.w / 2, W * 0.94 - m.w / 2);
    const bb = J.mainDraw(env, Object.assign({ text, font: Pm.font, size, x: mx, y: ty, color: sc.fg }, o));
    const la = tin(env, 0.3, 0.4, E.outCubic) * out;
    if (bb && la > 0) {
      const ls = smallSize(env) * 0.9;
      env.line([[bb.x0, bb.y0 - ls * 1.2], [bb.x0 + (bb.x1 - bb.x0) * la, bb.y0 - ls * 1.2]], lineC, Math.max(1, u * 0.0015), 0.8, false);
      env.draw({ text: `${big}  ─  No.${lineNo(env)}`, font: monoF(env), size: ls, track: 0.2, align: 'left', x: bb.x0, y: bb.y0 - ls * 2.3, color: sc.sub, alpha: la, ghost: false });
    }
    return bb;
  },
});
const candidate=({
  name: '等高線', tags: ['calm', 'graphic', 'emotional'], w: 0.9, ae: 'huge', fits: n => n >= 1 && n <= 16,
  enterBias: { blur: 1.3, cut: 1.2, wipe: 1, slice: 0.6 },
  plan(rng, cut, st) {
    return { font: rng.pick(fontsOf(st, ['display', 'serif'])), fb: rng.pick(fontsOf(st, ['display'])), side: rng.pick([1, -1]), rings: rng.int(4, 6), speed: rng.range(0.25, 0.5), col: rng.pick(['sub', 'accent', 'sub']), place: rng.pick(['low', 'center', 'low']) };
  },
  render(env) {
    const { W, H, sc, ctx } = env, cut = env.cut, Pm = cut.params, u = U(env), lt = env.lt;
    const r = bindings.get(env) || null;
    const port = isPort(env);
    const out = tout(env);
    const t0 = strip(cut.text);
    const kan = [...t0].filter(c => J.isKanji(c));
    const big = kan.length ? kan[0] : [...t0].filter(c => !J.isPunct(c) && !J.isSmallKana(c))[0] || [...t0][0] || '';
    const nativeBS = Math.min(H * 0.95, W * (port ? 1.05 : 0.7));
    const bs = r && r.heroScale !== 1 ? nativeBS * r.heroScale : nativeBS;
    const nx = W / 2 + Pm.side * W * (port ? 0.12 : 0.2), ny = H * 0.5;
    const bx = r && r.heroDelta[0] !== 0 ? nx + r.heroDelta[0] : nx, by = r && r.heroDelta[1] !== 0 ? ny + r.heroDelta[1] : ny;
    const lineC = Pm.col === 'accent' ? sc.accent : sc.sub;
    // contour rings: a fat stroke in the line colour, then a slightly thinner one in the ground colour → one thin line per level
    const cin = tin(env, 0, 0.5, E.outCubic) * out;
    if (env.pass === 'main' && big && cin > 0.01) {
      const K = Pm.rings, gap = bs * 0.03, lw = Math.max(1.2, bs * 0.0028);
      const ph = ((env.ltb * Pm.speed) % 1 + 1) % 1;
      const grow = E.outCubic(J.clamp(lt / 0.9));
      ctx.save();
      ctx.font = J.fontCSS(Pm.fb, bs); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      for (let k = K; k >= 1; k--) {
        const wk = 2 * gap * (k - 1 + ph) * grow + gap * 0.6;
        const a = (k === K ? 1 - ph : 1) * (1 - 0.1 * k) * cin;
        if (a <= 0.01) continue;
        ctx.globalAlpha = a * 0.8; ctx.strokeStyle = lineC; ctx.lineWidth = wk + lw; ctx.strokeText(big, bx, by);
        ctx.globalAlpha = 0.94 * cin; ctx.strokeStyle = sc.bg; ctx.lineWidth = Math.max(0.1, wk - lw); ctx.strokeText(big, bx, by);
      }
      ctx.globalAlpha = 0.94 * cin; ctx.fillStyle = sc.bg; ctx.fillText(big, bx, by);
      ctx.globalAlpha = cin; ctx.strokeStyle = lineC; ctx.lineWidth = lw * 1.6; ctx.strokeText(big, bx, by);
      ctx.restore();
    }
    // the lyric, small and solid, in the calm area beside the big character
    const text = brk(cut.text, port ? 6 : 8);
    const o = { track: 0.06, lead: 1.25 };
    const size = Math.min(J.fitSize(text, Pm.font, W * (port ? 0.8 : 0.5), H * 0.3, o), u * 0.12);
    const m = J.measure(Object.assign({ text, font: Pm.font, size }, o));
    const tx = port ? W / 2 : W / 2 - Pm.side * W * 0.2, ty = Pm.place === 'low' ? H * (port ? 0.78 : 0.7) : H / 2;
    const nativeMX = J.clamp(tx, W * 0.06 + m.w / 2, W * 0.94 - m.w / 2);
    const mx = r && r.bodyDelta[0] !== 0 ? nativeMX + r.bodyDelta[0] : nativeMX, bodyY = r && r.bodyDelta[1] !== 0 ? ty + r.bodyDelta[1] : ty;
    const bb = J.mainDraw(env, Object.assign({ text, font: Pm.font, size, x: mx, y: bodyY, color: sc.fg }, o));
    const la = tin(env, 0.3, 0.4, E.outCubic) * out;
    if (bb && la > 0) {
      const ls = smallSize(env) * 0.9;
      env.line([[bb.x0, bb.y0 - ls * 1.2], [bb.x0 + (bb.x1 - bb.x0) * la, bb.y0 - ls * 1.2]], lineC, Math.max(1, u * 0.0015), 0.8, false);
      env.draw({ text: `${big}  ─  No.${lineNo(env)}`, font: monoF(env), size: ls, track: 0.2, align: 'left', x: bb.x0, y: bb.y0 - ls * 2.3, color: sc.sub, alpha: la, ghost: false });
    }
    return bb;
  },
});
const need=(v,c)=>{if(!v)throw Object.assign(Error(c),{code:c});};
function withRecipe(e,r,fn){const c=e.cut,p=c.params;
 need(!bindings.has(e)&&typeof fn==='function','CONTOUR27_BINDING');
 need(e.W===960&&e.H===540&&e.plan.lang==='ja'&&J.lang==='ja'&&c.layout==='contour'&&c.text==='風の先へ'&&c.seed===1205,'CONTOUR27_FAMILY');
 need(p.font==='dela'&&p.fb==='dela'&&p.side===1&&p.rings===6&&p.speed===.375&&p.col==='sub'&&p.place==='low'&&Object.keys(p).length===7,'CONTOUR27_PARAMS');
 need(c.lyricSize==null&&c.contentScale===1&&c.motionScale===1&&!c.drawing&&!c.effectsOnly&&!c.area,'CONTOUR27_SIZE_DRAWING');
 need(c.enter==='cut'&&c.exit==='cut'&&c.hold==='still'&&c.treat==='none'&&c.cam==='push'&&c.camP.a===.022&&c.camP.dir===1,'CONTOUR27_OPERATIONS');
 need(r&&[1,.85,.7,.55,.5].includes(r.heroScale)&&['heroDelta','bodyDelta'].every(k=>Array.isArray(r[k])&&r[k].length===2&&r[k].every(Number.isFinite))&&Object.keys(r).length===3,'CONTOUR27_RECIPE');
 bindings.set(e,Object.freeze({heroScale:r.heroScale,heroDelta:Object.freeze([...r.heroDelta]),bodyDelta:Object.freeze([...r.bodyDelta])}));try{return fn();}finally{bindings.delete(e);}
}
return Object.freeze({render:candidate.render,original:original.render,withRecipe,geometryCertified:false});
})