/* ============================================================
   JIZURA — registries for the newer expression groups + a single
   registration helper used by every expression pack (src/11p_*.js)

   group    registry      order array          picked per
   layout   J.LAYOUTS     J.LAYOUT_ORDER       cut
   enter    J.ENTER       J.ENTER_ORDER        cut
   hold     J.HOLD        J.HOLD_ORDER         cut
   exit     J.EXIT        J.EXIT_ORDER         cut
   decor    J.DECOR       J.DECOR_ORDER        cut (0..n)
   treat    J.TREAT       J.TREAT_ORDER        cut   text treatment (outline, extrude, marker…)
   bg       J.BG          J.BG_ORDER           line  full-screen background graphic
   cam      J.CAMERA      J.CAMERA_ORDER       cut   camera move over the cut
   fx       J.FXE         J.FXE_ORDER          event post-processing / transition effect
   trans    J.TRANS       J.TRANS_ORDER        cut   how this cut takes over from the previous one (both frames composited)

   Common optional fields on every entry:
     name  (Japanese label, required)   tags  (mood keys it suits: glitch calm pop graphic editorial emotional)
     w     (base pick weight, default 1)  pack (set by J.register)
   ============================================================ */
(() => {
'use strict';

J.TREAT = { none: { name: 'なし', apply() {} } };
J.TREAT_ORDER = ['none'];
J.BG = { none: { name: '無地', draw() {} } };
J.BG_ORDER = ['none'];
J.CAMERA = {
  push: { name: 'ゆっくり寄る', tags: ['calm', 'editorial', 'emotional', 'graphic', 'pop', 'glitch'], w: 5,
    get: (env) => ({ s: 1 + 0.03 * (env.fx.motion ?? 0.7) * J.clamp(env.lt / Math.max(0.3, env.cut.dur)) }) },
};
J.CAMERA_ORDER = ['push'];
// post / transition effects. scratch requests a copy of the current canvas.
// Builtin draws retain their original Canvas state and error behavior.
J.FXE = {
  slice: { name: 'スライスグリッチ', builtin: true, scratch: true,
    draw(ctx, ev, k, {cw,ch,S,step:st2}) {
      const n = 6 + (J.h(st2, 3) % 7);
      let y = 0;
      for (let i = 0; i < n && y < ch; i++) {
        const h = Math.max(2, ch * J.rr(0.01, 0.12, st2, i, 1));
        const dx = (J.r(st2, i, 2) < 0.55 ? J.rs(st2, i, 3) * cw * 0.06 * ev.amp : 0);
        if (dx) ctx.drawImage(S, 0, y, cw, h, dx, y, cw, h);
        y += h + ch * J.rr(0, 0.08, st2, i, 4);
      }
    } },
  block: { name: 'ブロックグリッチ', builtin: true, scratch: true,
    draw(ctx, ev, k, {cw,ch,S,sc,step:st2}) {
      for (let i = 0; i < 9; i++) {
        const w = cw * J.rr(0.05, 0.3, st2, i, 5), h = ch * J.rr(0.01, 0.07, st2, i, 6);
        const x = J.r(st2, i, 7) * (cw - w), y = J.r(st2, i, 8) * (ch - h);
        const sx = J.clamp(x + J.rs(st2, i, 9) * cw * 0.08, 0, cw - w), sy = J.clamp(y + J.rs(st2, i, 10) * ch * 0.04, 0, ch - h);
        ctx.drawImage(S, sx, sy, w, h, x, y, w, h);
        if (J.r(st2, i, 11) < 0.35) { ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = J.r(st2, i, 12) < 0.5 ? sc.ghostA : sc.ghostB; ctx.fillRect(x, y, w, h); ctx.globalCompositeOperation = 'source-over'; }
      }
    } },
  invert: { name: '反転', builtin: true,
    draw(ctx, ev, k, {cw,ch}) {
      ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, cw, ch); ctx.globalCompositeOperation = 'source-over';
    } },
  flash: { name: 'フラッシュ', builtin: true,
    draw(ctx, ev, k, {cw,ch,sc}) {
      ctx.globalAlpha = Math.pow(1 - k, 1.5) * 0.92; ctx.fillStyle = J.lum(sc.bg) < 0.5 ? sc.fg : '#ffffff'; ctx.fillRect(0, 0, cw, ch); ctx.globalAlpha = 1;
    } },
  zoom: { name: 'ズームブラー', builtin: true, scratch: true,
    draw(ctx, ev, k, {cw,ch,S}) {
      const a = ev.amp * (1 - k);
      for (let i = 1; i <= 6; i++) {
        const s = 1 + i * 0.022 * a; ctx.globalAlpha = 0.2 * (1 - i / 7) * Math.min(1, a * 1.3);
        ctx.drawImage(S, cw / 2 - cw * s / 2, ch / 2 - ch * s / 2, cw * s, ch * s);
      }
      ctx.globalAlpha = 1;
    } },
  mosaic: { name: 'モザイク', builtin: true, scratch: true,
    draw(ctx, ev, k, {cw,ch,S,renderer}) {
      const T = renderer.ensure(renderer.tiny, Math.max(8, Math.round(cw / 42)), Math.max(8, Math.round(ch / 42))), tx = T.getContext('2d');
      tx.imageSmoothingEnabled = true; tx.drawImage(S, 0, 0, T.width, T.height);
      ctx.imageSmoothingEnabled = false; ctx.globalAlpha = 0.85 * (1 - k); ctx.drawImage(T, 0, 0, cw, ch); ctx.globalAlpha = 1; ctx.imageSmoothingEnabled = true;
    } },
  shake:  { name: '揺れ', builtin: true },
  chroma: { name: '色ズレの跳ね', builtin: true },
};
J.FXE_ORDER = ['chroma', 'shake', 'slice', 'block', 'invert', 'flash', 'zoom', 'mosaic'];
// cut-to-cut transitions: draw(ctx, A, B, p, info) composites the previous cut (A) and this cut (B) in device pixels
J.TRANS = {};
J.TRANS_ORDER = [];

const GROUPS = {
  layout: ['LAYOUTS', 'LAYOUT_ORDER'], enter: ['ENTER', 'ENTER_ORDER'], hold: ['HOLD', 'HOLD_ORDER'], exit: ['EXIT', 'EXIT_ORDER'],
  decor: ['DECOR', 'DECOR_ORDER'], treat: ['TREAT', 'TREAT_ORDER'], bg: ['BG', 'BG_ORDER'], cam: ['CAMERA', 'CAMERA_ORDER'], fx: ['FXE', 'FXE_ORDER'], trans: ['TRANS', 'TRANS_ORDER'],
};
J.GROUP_KEYS = Object.keys(GROUPS);
J.registry = g => J[GROUPS[g][0]];
J.order = g => J[GROUPS[g][1]];

/* J.register('layout', 'myKey', { name: '…', … }, 'packName') */
J.register = (group, key, def, pack) => {
  const G = GROUPS[group];
  if (!G) throw new Error('unknown group ' + group);
  if (!def || !def.name) throw new Error(`${group}.${key}: name is required`);
  const reg = J[G[0]], order = J[G[1]];
  if (reg[key] && reg[key].pack !== pack) console.warn(`JIZURA: ${group}.${key} is being replaced`);
  def.pack = pack || def.pack || 'core';
  reg[key] = def;
  if (!def.special && !order.includes(key)) order.push(key);
  return def;
};
J.registerAll = (group, defs, pack) => { for (const k of Object.keys(defs)) J.register(group, k, defs[k], pack); };

/* items whose tags include a mood key (used by おまかせ) */
J.taggedWith = (group, mood) => J.order(group).filter(k => { const d = J.registry(group)[k]; return d && d.tags && d.tags.includes(mood); });
})();
