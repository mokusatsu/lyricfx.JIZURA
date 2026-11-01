(() => {
  'use strict';
  const J = window.J || (window.J = {});

  /* ============================================================================
   * Circular Avoidance System (円形領域回避アルゴリズム)
   * Activated when "歌詞が画面中央を避ける" (lyricEffects.avoidCenter) is ON.
   * Implements the 8-group, 184-layout specification from jizura-algorithm-design.html.
   * ============================================================================ */

  // ----------------------------------------------------------------------------
  // 1. 184-Layout Classification Table (LAYOUT_AVOID)
  // ----------------------------------------------------------------------------
  const LAYOUT_AVOID = {
    // Group 1: Orbit / Ring-compatible (7) — recenter on (cx, cy)
    ring:        { mode: 'orbit',     aux: 'none',   notes: 'recenter(cx,cy)' },
    orbit:       { mode: 'orbit',     aux: 'none',   notes: 'recenter(cx,cy)' },
    spiral:      { mode: 'orbit',     aux: 'none',   notes: 'recenter(cx,cy)' },
    arcTop:      { mode: 'orbit',     aux: 'none',   notes: 'recenter(cx,cy)' },
    circleWords: { mode: 'orbit',     aux: 'none',   notes: 'recenter(cx,cy)' },
    knPathRide:  { mode: 'orbit',     aux: 'none',   notes: 'recenter(cx,cy)' },
    knGearWords: { mode: 'orbit',     aux: 'none',   notes: 'recenter(cx,cy)' },

    // Group 2: Tiled / Full-screen aux + Hero primary (14) — radial feather mask on aux + shift primary
    marquee:       { mode: 'tiledAux', aux: 'mask',  notes: 'dual-pass mask+shift' },
    tile:          { mode: 'tiledAux', aux: 'mask',  notes: 'dual-pass mask+shift' },
    gloss:         { mode: 'tiledAux', aux: 'mask',  notes: 'dual-pass mask+shift' },
    diag:          { mode: 'tiledAux', aux: 'mask',  notes: 'dual-pass mask+shift' },
    hrRedacted:    { mode: 'tiledAux', aux: 'mask',  notes: 'dual-pass mask+shift' },
    justified:     { mode: 'tiledAux', aux: 'mask',  notes: 'dual-pass mask+shift' },
    edgeFrame:     { mode: 'tiledAux', aux: 'mask',  notes: 'dual-pass mask+shift' },
    crossBands:    { mode: 'tiledAux', aux: 'mask',  notes: 'dual-pass mask+shift' },
    tyBandHide:    { mode: 'tiledAux', aux: 'mask',  notes: 'dual-pass mask+shift' },
    tyCropGiant:   { mode: 'tiledAux', aux: 'mask',  notes: 'dual-pass mask+shift' },
    hrWallScrawl:  { mode: 'tiledAux', aux: 'mask',  notes: 'dual-pass mask+shift' },
    echo:          { mode: 'tiledAux', aux: 'mask',  notes: 'dual-pass mask+shift' },
    verticalRiver: { mode: 'tiledAux', aux: 'mask',  notes: 'dual-pass mask+shift' },
    scroll:        { mode: 'tiledAux', aux: 'mask',  notes: 'dual-pass mask+shift' },

    // Group 3: Policy A — Re-wrap at same font size + shift (2)
    center: { mode: 'policyA', aux: 'none',  notes: 'rewrap at native size' },
    vcols:  { mode: 'policyA', aux: 'shift', notes: 'split variant: adjust perCol at native size' },

    // Group 4: Policy C — Coupled frame/plate/column layouts (8)
    headlineDeck: { mode: 'policyC', aux: 'shift', notes: 'fit fullBB or shift' },
    columnsBig:   { mode: 'policyC', aux: 'shift', notes: 'fit fullBB or shift' },
    bulbs:        { mode: 'policyC', aux: 'shift', notes: 'fit fullBB or shift' },
    numbered:     { mode: 'policyC', aux: 'shift', notes: 'cols variant: fit fullBB' },
    crossword:    { mode: 'policyC', aux: 'shift', notes: 'scale 0.58 + shift' },
    contour:      { mode: 'policyC', aux: 'split', notes: 'split rings(left 0.5x) & text(right)' },
    dominoes:     { mode: 'policyC', aux: 'shift', notes: 'vertical shift only (tx=0)' },
    splitScreen:  { mode: 'policyC', aux: 'clip',  notes: 'clip & shift to safe region' },

    // Group 5: Corner / Edge / Already-Clear layouts (9) — measure & shift if needed
    lowerThird: { mode: 'shift', aux: 'shift' },
    corners:    { mode: 'shift', aux: 'shift' },
    hanko:      { mode: 'shift', aux: 'shift' },
    subtitleBar:{ mode: 'shift', aux: 'shift' },
    ticker:     { mode: 'shift', aux: 'shift' },
    searchBar:  { mode: 'shift', aux: 'shift' },
    footnote:   { mode: 'shift', aux: 'shift' },
    tyMargin:   { mode: 'shift', aux: 'shift' },
    hrCctv:     { mode: 'shift', aux: 'shift' },

    // Group 6: Multi-Time Sampled Dynamic Layouts (2)
    wave:     { mode: 'shift', aux: 'shift', sampleMulti: true },
    knReflow: { mode: 'shift', aux: 'shift', sampleMulti: true },
  };

  const ORBIT_IDS = new Set([
    'ring', 'orbit', 'spiral', 'arcTop', 'circleWords', 'knPathRide', 'knGearWords',
  ]);

  const TILED_AUX_IDS = new Set([
    'marquee', 'tile', 'gloss', 'diag', 'hrRedacted', 'justified', 'edgeFrame',
    'crossBands', 'tyBandHide', 'tyCropGiant', 'hrWallScrawl', 'echo', 'verticalRiver', 'scroll',
  ]);

  const MULTI_SAMPLE_TIMES = [0.18, 0.35, 0.55, 0.75, 0.90];

  J.LAYOUT_AVOID = LAYOUT_AVOID;

  // ----------------------------------------------------------------------------
  // 2. Circle Avoidance Settings, Timeline Planning & Circle Resolution
  // ----------------------------------------------------------------------------
  J.normalizeAvoidanceCircle = c => {
    if (!c || typeof c !== 'object') return null;
    const hasAny = Number.isFinite(+c.cx) || Number.isFinite(+c.cy) || Number.isFinite(+c.r);
    if (!hasAny) return null;
    return {
      cx: Number.isFinite(+c.cx) ? J.clamp(+c.cx, 0, 1) : 0.5,
      cy: Number.isFinite(+c.cy) ? J.clamp(+c.cy, 0, 1) : 0.5,
      r: Number.isFinite(+c.r) ? J.clamp(+c.r, 0.03, 0.85) : 0.25,
    };
  };

  // 「回避部分をマスク」: decorations / auxiliary effects (not the main lyric) are punched out with a radial
  // gradient. Radius offset and feather are stage px on a 1080px short edge.
  J.AVOID_MASK_CURVES = ['smooth', 'linear', 'steep', 'soft'];
  J.AVOID_MASK_DEFAULTS = { maskAvoidance: false, maskRadiusOffset: 0, maskFeather: 60, maskCurve: 'smooth' };
  const normalizeMaskFields = (src, out, withDefaults) => {
    const d = J.AVOID_MASK_DEFAULTS;
    if (src.maskAvoidance !== undefined) out.maskAvoidance = !!src.maskAvoidance; else if (withDefaults) out.maskAvoidance = d.maskAvoidance;
    if (Number.isFinite(+src.maskRadiusOffset) && src.maskRadiusOffset !== null && src.maskRadiusOffset !== '') out.maskRadiusOffset = J.clamp(Math.round(+src.maskRadiusOffset), -500, 500); else if (withDefaults) out.maskRadiusOffset = d.maskRadiusOffset;
    if (Number.isFinite(+src.maskFeather) && src.maskFeather !== null && src.maskFeather !== '') out.maskFeather = J.clamp(Math.round(+src.maskFeather), 0, 300); else if (withDefaults) out.maskFeather = d.maskFeather;
    if (J.AVOID_MASK_CURVES.includes(src.maskCurve)) out.maskCurve = src.maskCurve; else if (withDefaults) out.maskCurve = d.maskCurve;
    return out;
  };
  J.normalizeAvoidanceMask = (src, withDefaults = true) => normalizeMaskFields(src && typeof src === 'object' ? src : {}, {}, withDefaults);

  J.normalizeAvoidance = a => {
    a = a && typeof a === 'object' ? a : {};
    const manualCuts = !!a.manualCuts;
    const rawCount = Number.isFinite(+a.cutCount) ? J.clamp(+a.cutCount | 0, 0, 1000) : (manualCuts ? 0 : 1);
    const cutCount = manualCuts ? rawCount : Math.max(1, rawCount || 1);
    const lineTimes = {};
    if (a.timing && a.timing.lineTimes && typeof a.timing.lineTimes === 'object') {
      for (const [k, v] of Object.entries(a.timing.lineTimes)) {
        if (v != null && Number.isFinite(+v)) lineTimes[k] = Math.max(0, +v);
      }
    }
    const cutOverrides = {};
    if (a.cutOverrides && typeof a.cutOverrides === 'object') {
      for (const [k, ov] of Object.entries(a.cutOverrides)) {
        if (!ov || typeof ov !== 'object') continue;
        const copy = {};
        if (Number.isFinite(+ov.cx)) copy.cx = J.clamp(+ov.cx, 0, 1);
        if (Number.isFinite(+ov.cy)) copy.cy = J.clamp(+ov.cy, 0, 1);
        if (Number.isFinite(+ov.r)) copy.r = J.clamp(+ov.r, 0.03, 0.85);
        if (Number.isFinite(+ov.pad)) copy.pad = J.clamp(+ov.pad, 0, 0.2);
        if (Number.isFinite(+ov.feather)) copy.feather = J.clamp(+ov.feather, 0, 0.3);
        if (ov.enabled !== undefined) copy.enabled = !!ov.enabled;
        if (ov.avoidEmphasis !== undefined) copy.avoidEmphasis = !!ov.avoidEmphasis;
        normalizeMaskFields(ov, copy, false);
        if (ov.lock) copy.lock = true;
        if (ov.untilNext === false && Number.isFinite(+ov.endTime)) {
          copy.untilNext = false;
          copy.endTime = Math.max(0, +ov.endTime);
        }
        cutOverrides[k] = copy;
      }
    }
    return {
      cutCount,
      manualCuts,
      avoidEmphasis: !!a.avoidEmphasis,
      ...normalizeMaskFields(a, {}, true),
      lyricInsertMode: a.lyricInsertMode === 'cut' ? 'cut' : 'line',
      groupLyricsAsOneCut: a.groupLyricsAsOneCut !== false,
      timing: { lineTimes },
      cutOverrides,
    };
  };

  J.planAvoidance = (project, lyricPlan, audioDuration) => {
    const a = J.normalizeAvoidance(project?.avoidance);
    const fixedDuration = Number.isFinite(+project?.durationOverride) && +project.durationOverride > 0 ? +project.durationOverride : null;
    const count = a.manualCuts ? a.cutCount : Math.max(1, a.cutCount || 1);
    const lines = lyricPlan?.lines || [];
    const baseDur = lyricPlan?.duration || 3;
    const manualEntries = Object.entries(a.timing.lineTimes).filter(([i, t]) => +i < count && Number.isFinite(+t));
    const manualEnd = Math.max(0, ...manualEntries.map(([, t]) => +t + 4));
    const fixedMinimum = Math.max(count * 0.04, ...manualEntries.map(([i, t]) => +t + (count - +i) * 0.04));
    let duration = fixedDuration != null
      ? Math.max(fixedDuration, baseDur, fixedMinimum)
      : Math.max(baseDur, audioDuration || 0, manualEnd, lines.length ? 0 : count * 4);
    const lyricCount = Math.min(count, lines.length);
    const starts = Array.from({ length: count }, (_, i) => {
      const v = a.timing.lineTimes[i];
      if (v != null && Number.isFinite(+v)) return J.clamp(+v, 0, duration);
      if (i === 0 && count === 1) return 0;
      if (lines[i]) return lines[i].start;
      if (lyricCount) return lines[lyricCount - 1].start + (duration - lines[lyricCount - 1].start) * (i - lyricCount + 1) / (count - lyricCount + 1);
      return i * duration / Math.max(1, count);
    });
    const lastTail = count ? Math.max(0.04, duration - starts[count - 1]) : 0;
    for (let i = 1; i < starts.length; i++) {
      starts[i] = Math.max(starts[i], starts[i - 1] + 0.04);
      if (fixedDuration != null && a.timing.lineTimes[i] == null) {
        starts[i] = Math.max(starts[i - 1] + 0.04, Math.min(starts[i], duration - (count - i) * 0.04));
      }
    }
    if (count) duration = Math.max(duration, starts[count - 1] + (fixedDuration == null ? lastTail : 0.04));
    const cuts = Array.from({ length: count }, (_, i) => {
      const ov = a.cutOverrides[i] || {};
      const nextStart = i + 1 < count ? starts[i + 1] : duration;
      const manualEndVal = J.cutEndTime ? J.cutEndTime(ov) : null;
      const customCircle = Number.isFinite(+ov.cx) || Number.isFinite(+ov.cy) || Number.isFinite(+ov.r);
      const cx = Number.isFinite(+ov.cx) ? J.clamp(+ov.cx, 0, 1) : 0.5;
      const cy = Number.isFinite(+ov.cy) ? J.clamp(+ov.cy, 0, 1) : 0.5;
      const r = Number.isFinite(+ov.r) ? J.clamp(+ov.r, 0.03, 0.85) : 0.25;
      const avoidEmphasis = ov.avoidEmphasis !== undefined ? !!ov.avoidEmphasis : !!a.avoidEmphasis;
      return {
        index: i,
        name: `(${Math.round(cx * 100)}%, ${Math.round(cy * 100)}%) r=${Math.round(r * 100)}%`,
        start: starts[i],
        end: manualEndVal != null ? Math.max(starts[i] + 0.04, Math.min(manualEndVal, duration)) : nextStart,
        manualEnd: manualEndVal != null,
        cx,
        cy,
        r,
        pad: Number.isFinite(+ov.pad) ? J.clamp(+ov.pad, 0, 0.2) : null,
        feather: Number.isFinite(+ov.feather) ? J.clamp(+ov.feather, 0, 0.3) : null,
        enabled: ov.enabled !== false,
        avoidEmphasis,
        maskAvoidance: ov.maskAvoidance !== undefined ? !!ov.maskAvoidance : !!a.maskAvoidance,
        maskRadiusOffset: ov.maskRadiusOffset ?? a.maskRadiusOffset,
        maskFeather: ov.maskFeather ?? a.maskFeather,
        maskCurve: ov.maskCurve ?? a.maskCurve,
        lock: !!ov.lock,
        customCircle,
      };
    });
    return { cuts, duration, avoidEmphasis: a.avoidEmphasis, maskAvoidance: a.maskAvoidance };
  };

  J.avoidanceAt = (plan, t) => {
    const cuts = plan?.avoidance?.cuts || [];
    for (let i = cuts.length - 1; i >= 0; i--) {
      if (t >= cuts[i].start && t < cuts[i].end) return cuts[i];
    }
    return null;
  };

  J.avoidanceCutsAt = (plan, t) => (plan?.avoidance?.cuts || []).filter(c => t >= c.start && t < c.end);

  J.circleAvoidanceConfig = (project, plan) => {
    const W = plan?.W || 1920;
    const H = plan?.H || 1080;
    const settings = J.lyricEffectSettings ? J.lyricEffectSettings(project) : {};
    const enabled = !!(settings.autoPlacement && settings.avoidCenter);
    const custom = project?.lyricEffects?.avoidCircle || project?.avoidCircle || null;
    const cx = Number.isFinite(custom?.cx) ? custom.cx : W * 0.5;
    const cy = Number.isFinite(custom?.cy) ? custom.cy : H * 0.5;
    const defaultR = Math.min(W, H) * 0.25; // 270px on 1920x1080 (diameter 540 = 50% of H)
    const r = Number.isFinite(custom?.r) ? custom.r : defaultR;
    const pad = Number.isFinite(custom?.pad) ? custom.pad : Math.round(Math.min(W, H) * (20 / 1080));
    const feather = Number.isFinite(custom?.feather) ? custom.feather : Math.round(Math.min(W, H) * (40 / 1080));
    const avoidEmphasis = !!(project?.avoidance?.avoidEmphasis || custom?.avoidEmphasis);
    return {
      enabled,
      cx,
      cy,
      r,
      pad,
      R: r + pad,
      feather,
      avoidEmphasis,
      ...J.normalizeAvoidanceMask({ ...(project?.avoidance || {}), ...(custom || {}) }),
      hasExplicitPixelCircle: !!(custom && (Number.isFinite(custom.cx) || Number.isFinite(custom.cy) || Number.isFinite(custom.r))),
    };
  };

  J.circleAvoidanceForCut = (plan, cut, t) => {
    const base = plan?.lyricAvoidance;
    if (!base || !base.enabled || plan?.layerVisibility?.avoidance === false) {
      return { enabled: false };
    }
    if (base.hasExplicitPixelCircle) {
      return base;
    }
    const cuts = plan?.avoidance?.cuts;
    if (!cuts) {
      return base;
    }
    if (!cuts.length) {
      return { enabled: false };
    }
    let acut = null;
    if (t != null && Number.isFinite(+t)) {
      acut = J.avoidanceAt(plan, +t);
    }
    if (!acut && cut) {
      const cStart = Number.isFinite(+cut.start) ? +cut.start : 0;
      const cEnd = Number.isFinite(+cut.end) ? +cut.end : cStart + 0.04;
      acut = J.avoidanceAt(plan, cStart);
      if (!acut) {
        let bestOverlap = 0;
        for (const c of cuts) {
          const ov = Math.min(cEnd, c.end) - Math.max(cStart, c.start);
          if (ov > bestOverlap) {
            bestOverlap = ov;
            acut = c;
          }
        }
      }
      if (!acut && cStart < cuts[0].start && cuts.length === 1 && cuts[0].start <= 0.5) {
        acut = cuts[0];
      }
    }
    if (!acut || acut.enabled === false) {
      return { enabled: false };
    }
    const W = plan.W || 1920;
    const H = plan.H || 1080;
    const minWH = Math.min(W, H);
    const cx = acut.cx * W;
    const cy = acut.cy * H;
    const r = acut.r * minWH;
    const pad = acut.pad != null ? acut.pad * minWH : base.pad;
    const feather = acut.feather != null ? acut.feather * minWH : base.feather;
    return {
      enabled: true,
      cx,
      cy,
      r,
      pad,
      R: r + pad,
      feather,
      avoidEmphasis: !!acut.avoidEmphasis,
      maskAvoidance: !!acut.maskAvoidance,
      maskRadiusOffset: Number.isFinite(+acut.maskRadiusOffset) ? +acut.maskRadiusOffset : 0,
      maskFeather: Number.isFinite(+acut.maskFeather) ? +acut.maskFeather : 60,
      maskCurve: acut.maskCurve || 'smooth',
      cutIndex: acut.index,
    };
  };

  // Circle (with mask settings) of the avoidance cut showing at time t, for layers drawn outside the lyric
  // avoidance pass (line background effects, cuts that keep their native place such as *emphasis*).
  J.activeAvoidanceAtTime = (plan, t) => J.circleAvoidanceForCut(plan, null, t);
  J.avoidanceMaskActive = circle => !!(circle && circle.enabled && circle.maskAvoidance);

  // Radial gradient knockout (destination-out) of the mask circle, in stage coordinates.
  // Inside rInner = r + offset is fully cleared; the clearing fades out over `feather` px with the chosen curve.
  const MASK_CURVE_FN = {
    smooth: t => 1 - t * t * (3 - 2 * t),
    linear: t => 1 - t,
    steep: t => (1 - t * t) ** 2,
    soft: t => (1 - t) ** 2,
  };
  J.avoidanceMaskRadii = (circle, W, H) => {
    const scale = Math.min(W || 1920, H || 1080) / 1080;
    const rInner = Math.max(0, (circle.r || 0) + (circle.maskRadiusOffset || 0) * scale);
    const feather = Math.max(0, (circle.maskFeather ?? 60) * scale);
    return { rInner, rOuter: rInner + feather, feather };
  };
  J.applyAvoidanceCircleMask = (ctx, stageTransform, circle, W, H) => {
    if (!ctx || !circle) return;
    const { rInner, rOuter, feather } = J.avoidanceMaskRadii(circle, W, H);
    if (rOuter <= 0.5) return;
    ctx.save();
    if (stageTransform) ctx.setTransform(stageTransform.a, stageTransform.b, stageTransform.c, stageTransform.d, stageTransform.e, stageTransform.f);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.globalAlpha = 1;
    ctx.filter = 'none';
    if (feather <= 0.5) {
      ctx.fillStyle = 'rgba(0,0,0,1)';
    } else {
      const fn = MASK_CURVE_FN[circle.maskCurve] || MASK_CURVE_FN.smooth;
      const grad = ctx.createRadialGradient(circle.cx, circle.cy, rInner, circle.cx, circle.cy, rOuter);
      const steps = 12;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        grad.addColorStop(t, `rgba(0,0,0,${J.clamp(fn(t), 0, 1).toFixed(4)})`);
      }
      ctx.fillStyle = grad;
    }
    ctx.beginPath();
    ctx.arc(circle.cx, circle.cy, rOuter + (feather <= 0.5 ? 0 : 1), 0, J.TAU);
    ctx.fill();
    ctx.restore();
  };
  // Draw `paint(ctx2)` on a scratch canvas sharing ctx's transform, punch the mask (in stage coordinates,
  // `stageMatrix` = stage → canvas pixels), then composite onto ctx with ctx's current blend mode.
  J.drawWithAvoidanceMask = (renderer, ctx, circle, W, H, paint, stageMatrix, key = 'avoidMaskScratch') => {
    const cw = ctx.canvas.width, ch = ctx.canvas.height;
    const make = () => (typeof document !== 'undefined' ? document.createElement('canvas') : null);
    let scratch = renderer && renderer[key];
    if (!scratch) { scratch = make(); if (!scratch) return paint(ctx); if (renderer) renderer[key] = scratch; }
    if (renderer && renderer.ensure) renderer.ensure(scratch, cw, ch);
    else if (scratch.width !== cw || scratch.height !== ch) { scratch.width = cw; scratch.height = ch; }
    const sx = scratch.getContext('2d');
    const m = ctx.getTransform();
    sx.setTransform(1, 0, 0, 1, 0, 0);
    sx.globalAlpha = 1; sx.globalCompositeOperation = 'source-over'; sx.filter = 'none';
    sx.clearRect(0, 0, cw, ch);
    sx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
    let result;
    try { result = paint(sx); } finally {
      J.applyAvoidanceCircleMask(sx, stageMatrix || m, circle, W, H);
      const op = ctx.globalCompositeOperation;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = op;
      ctx.filter = 'none';
      ctx.drawImage(scratch, 0, 0);
      ctx.restore();
    }
    return result;
  };

  function isAuxMainCall(id, idx, it) {
    return (
      (id === 'echo' && idx < 4) ||
      (id === 'verticalRiver' && it && it.alpha !== undefined && it.alpha < 0.75) ||
      (id === 'scroll' && it && it.alpha !== undefined && it.alpha < 0.85) ||
      (id === 'hrWallScrawl' && it && it.alpha !== undefined && it.alpha < 0.85) ||
      (id === 'tyCropGiant' && it && it.alpha !== undefined && it.alpha < 0.5)
    );
  }

  // Lyric cut with 「回避部分をマスク」: everything except the main lyric glyphs (decorations, layout plates,
  // lines, shapes, echo text …) is drawn on a scratch canvas and punched out with the mask circle; the main
  // lyric (J.mainDraw) is then drawn on top, unmasked. `run(env)` draws the cut as usual.
  J.avoidMaskPhase = null;
  const ENV_PRIMITIVES = ['draw', 'rect', 'line', 'polyPartial', 'circle', 'arc', 'rrect', 'poly', 'blob'];
  J.drawCutMaskedAux = (renderer, env, run, circle) => {
    const { cut, plan } = env;
    const W = plan.W, H = plan.H, scale = env.scale || 1;
    const stageMatrix = { a: scale, b: 0, c: 0, d: scale, e: 0, f: 0 };
    const id = cut.layout;
    const auxMain = () => { let i = 0; return it => isAuxMainCall(id, i++, it); };
    const origMainDraw = J.mainDraw;
    const prevPhase = J.avoidMaskPhase;
    // 1. Decorations + auxiliary layout drawing on the scratch canvas, then the radial knockout.
    J.drawWithAvoidanceMask(renderer, env.ctx, circle, W, H, sx => {
      const auxEnv = renderer.makeEnv(sx, plan, cut, env.sc, Object.assign({}, env, { ctx: sx }));
      const isAux = auxMain();
      J.avoidMaskPhase = 'aux';
      J.mainDraw = (envArg, it) => (isAux(it) ? origMainDraw(envArg, it) : (J.itemBox ? J.itemBox(it) : null) || { x0: 0, y0: 0, x1: 0, y1: 0, cx: W / 2, cy: H / 2, boxes: [] });
      try { run(auxEnv); } catch (e) { console.warn('avoid mask aux', id, e); }
      finally { J.mainDraw = origMainDraw; J.avoidMaskPhase = prevPhase; }
    }, stageMatrix, 'avoidAuxScratch');
    if (cut.effectsOnly) return null;
    // 2. Main lyric only, unmasked: env primitives are silenced except inside J.mainDraw.
    const mainEnv = Object.assign({}, env, Object.fromEntries(ENV_PRIMITIVES.map(k => [k, () => {}])), { __real: env });
    const isAux = auxMain();
    const savedDecor = cut.decor;
    let bb = null;
    J.avoidMaskPhase = 'main';
    J.mainDraw = (envArg, it) => (isAux(it) ? (J.itemBox ? J.itemBox(it) : null) : origMainDraw((envArg && envArg.__real) || env, it));
    cut.decor = [];
    const origFillRect = env.ctx.fillRect.bind(env.ctx);
    const origStrokeRect = env.ctx.strokeRect.bind(env.ctx);
    if (id === 'hrRedacted' || id === 'tyBandHide') {
      env.ctx.fillRect = () => {};
      env.ctx.strokeRect = () => {};
    }
    try { bb = run(mainEnv); } catch (e) { console.warn('avoid mask main', id, e); }
    finally {
      env.ctx.fillRect = origFillRect;
      env.ctx.strokeRect = origStrokeRect;
      cut.decor = savedDecor;
      J.mainDraw = origMainDraw;
      J.avoidMaskPhase = prevPhase;
    }
    return bb;
  };

  J.usesCircleAvoidance = (plan, cut, t) => {
    if (!plan?.lyricAvoidance?.enabled || plan?.layerVisibility?.avoidance === false || !cut) return false;
    if (cut.line < 0 || !Number.isInteger(cut.part) || cut.effectsOnly) return false;
    if (cut.areaMode === 'manual') return false;
    if (plan.lockedLines && plan.lockedLines[cut.line]) return false;
    const circle = J.circleAvoidanceForCut(plan, cut, t);
    if (!circle || !circle.enabled) return false;
    if (cut.emphasis && !circle.avoidEmphasis) return false;
    return true;
  };

  // ----------------------------------------------------------------------------
  // 3. Geometric Helpers (Circle-Rect Intersection & Safe Candidate Regions)
  // ----------------------------------------------------------------------------
  function rectCircleDist(bb, cx, cy, R) {
    if (!bb || !Number.isFinite(bb.x0)) return Infinity;
    const nx = J.clamp(cx, bb.x0, bb.x1);
    const ny = J.clamp(cy, bb.y0, bb.y1);
    return Math.hypot(cx - nx, cy - ny) - R;
  }

  function rectHitsCircle(bb, cx, cy, R) {
    return rectCircleDist(bb, cx, cy, R) < -0.5;
  }

  function unionBB(a, b) {
    if (!b || !Number.isFinite(b.x0) || !Number.isFinite(b.y0) || !Number.isFinite(b.x1) || !Number.isFinite(b.y1)) return a;
    if (b.x1 <= b.x0 && b.y1 <= b.y0) return a;
    if (!a || !Number.isFinite(a.x0)) {
      return { x0: b.x0, y0: b.y0, x1: b.x1, y1: b.y1 };
    }
    return {
      x0: Math.min(a.x0, b.x0),
      y0: Math.min(a.y0, b.y0),
      x1: Math.max(a.x1, b.x1),
      y1: Math.max(a.y1, b.y1),
    };
  }

  function finalizeBB(bb) {
    if (!bb || !Number.isFinite(bb.x0)) return null;
    const w = Math.max(1, bb.x1 - bb.x0);
    const h = Math.max(1, bb.y1 - bb.y0);
    return {
      x0: bb.x0,
      y0: bb.y0,
      x1: bb.x1,
      y1: bb.y1,
      w,
      h,
      cx: (bb.x0 + bb.x1) * 0.5,
      cy: (bb.y0 + bb.y1) * 0.5,
    };
  }

  function shiftBB(bb, tx, ty) {
    if (!bb) return null;
    return finalizeBB({
      x0: bb.x0 + tx,
      y0: bb.y0 + ty,
      x1: bb.x1 + tx,
      y1: bb.y1 + ty,
    });
  }

  function scaleAndShiftBB(bb, pivotX, pivotY, s, tx, ty) {
    if (!bb) return null;
    return finalizeBB({
      x0: pivotX + (bb.x0 - pivotX) * s + tx,
      y0: pivotY + (bb.y0 - pivotY) * s + ty,
      x1: pivotX + (bb.x1 - pivotX) * s + tx,
      y1: pivotY + (bb.y1 - pivotY) * s + ty,
    });
  }

  // Build candidate safe rectangular regions around the avoidance circle,
  // plus compute directional priority tiers from circle offset scores:
  // dx = 2*cx/W - 1, dy = 2*cy/H - 1
  // down = -dy, up = +dy, right = -dx, left = +dx
  function getDirectionScores(W, H, circle) {
    const dx = (2 * circle.cx) / W - 1;
    const dy = (2 * circle.cy) / H - 1;
    return {
      down:  -dy,
      up:     dy,
      right: -dx,
      left:   dx,
      tl:    (dy + dx) * 0.5,
      tr:    (dy - dx) * 0.5,
      bl:    (-dy + dx) * 0.5,
      br:    (-dy - dx) * 0.5,
    };
  }

  function getSafeRegions(W, H, circle) {
    const mx = Math.round(W * (48 / 1920));
    const my = Math.round(H * (38 / 1080));
    const { cx, cy, R } = circle;
    const dirScores = getDirectionScores(W, H, circle);
    const raw = [
      // 4 cardinal bands:
      // Down = [m, W-m] x [max(m, cy+R), H-m]
      // Up   = [m, W-m] x [m, min(H-m, cy-R)]
      // Left = [m, min(W-m, cx-R)] x [m, H-m]
      // Right= [max(m, cx+R), W-m] x [m, H-m]
      { name: 'down',  dir: 'down',  x0: mx,          y0: Math.max(my, cy + R), x1: W - mx,      y1: H - my },
      { name: 'up',    dir: 'up',    x0: mx,          y0: my,                   x1: W - mx,      y1: Math.min(H - my, cy - R) },
      { name: 'left',  dir: 'left',  x0: mx,          y0: my,                   x1: Math.min(W - mx, cx - R), y1: H - my },
      { name: 'right', dir: 'right', x0: Math.max(mx, cx + R), y0: my,          x1: W - mx,      y1: H - my },
      // 4 diagonal quadrants (bounded by R / sqrt(2) tangent lines)
      { name: 'tl',    dir: 'tl',    x0: mx,          y0: my,          x1: cx - R * 0.7071, y1: cy - R * 0.25 },
      { name: 'tr',    dir: 'tr',    x0: cx + R * 0.7071, y0: my,      x1: W - mx,      y1: cy - R * 0.25 },
      { name: 'bl',    dir: 'bl',    x0: mx,          y0: cy + R * 0.25, x1: cx - R * 0.7071, y1: H - my },
      { name: 'br',    dir: 'br',    x0: cx + R * 0.7071, y0: cy + R * 0.25, x1: W - mx, y1: H - my },
      // Wide corner shelves
      { name: 'topLeftWide',  dir: 'up',   x0: mx,   y0: my,          x1: cx - R * 0.35, y1: cy - R * 0.88 },
      { name: 'topRightWide', dir: 'up',   x0: cx + R * 0.35, y0: my, x1: W - mx,      y1: cy - R * 0.88 },
      { name: 'botLeftWide',  dir: 'down', x0: mx,   y0: cy + R * 0.88, x1: cx - R * 0.35, y1: H - my },
      { name: 'botRightWide', dir: 'down', x0: cx + R * 0.35, y0: cy + R * 0.88, x1: W - mx, y1: H - my },
    ];
    const out = [];
    for (const r of raw) {
      const x0 = Math.max(mx, Math.min(W - mx, r.x0));
      const y0 = Math.max(my, Math.min(H - my, r.y0));
      const x1 = Math.max(mx, Math.min(W - mx, r.x1));
      const y1 = Math.max(my, Math.min(H - my, r.y1));
      const w = x1 - x0;
      const h = y1 - y0;
      if (w >= 80 && h >= 44) {
        const bb = {
          x0, y0, x1, y1, w, h,
          cx: (x0 + x1) * 0.5,
          cy: (y0 + y1) * 0.5,
          name: r.name,
          dir: r.dir,
          dirScore: dirScores[r.dir] ?? 0,
        };
        if (!rectHitsCircle(bb, cx, cy, R - 1)) out.push(bb);
      }
    }
    return out;
  }

  // Non-overlapping auxiliary regions per Section 05 Step 2:
  // If primary direction is up/down, left/right auxiliary regions are restricted to the middle vertical band [cy - R, cy + R].
  // If primary direction is left/right, up/down auxiliary regions are restricted to the middle horizontal band [cx - R, cx + R].
  function getDisjointAuxiliaryRegions(W, H, circle, primaryDir) {
    const mx = Math.round(W * (48 / 1920));
    const my = Math.round(H * (38 / 1080));
    const { cx, cy, R } = circle;
    const dirScores = getDirectionScores(W, H, circle);
    const raw = (primaryDir === 'up' || primaryDir === 'down')
      ? [
          { name: 'auxLeft',  dir: 'left',  x0: mx, y0: Math.max(my, cy - R), x1: Math.min(W - mx, cx - R), y1: Math.min(H - my, cy + R) },
          { name: 'auxRight', dir: 'right', x0: Math.max(mx, cx + R), y0: Math.max(my, cy - R), x1: W - mx, y1: Math.min(H - my, cy + R) },
        ]
      : [
          { name: 'auxDown',  dir: 'down',  x0: Math.max(mx, cx - R), y0: Math.max(my, cy + R), x1: Math.min(W - mx, cx + R), y1: H - my },
          { name: 'auxUp',    dir: 'up',    x0: Math.max(mx, cx - R), y0: my, x1: Math.min(W - mx, cx + R), y1: Math.min(H - my, cy - R) },
        ];
    return raw
      .map(r => {
        const w = r.x1 - r.x0, h = r.y1 - r.y0;
        return w > 40 && h > 40
          ? { ...r, w, h, cx: (r.x0 + r.x1) * 0.5, cy: (r.y0 + r.y1) * 0.5, dirScore: dirScores[r.dir] ?? 0 }
          : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.dirScore - a.dirScore);
  }

  // Compare two candidate placements according to Section 05 Step 5:
  // 1) Higher direction score (`dirScore`) wins first (rounded to 1e-4 so ties are grouped into same-score tiers).
  // 2) Shape compatibility: horizontal box (w > h * 1.15) prefers up/down; vertical box (h > w * 1.15) prefers left/right.
  // 3) Smaller normalized displacement: sqrt((tx/W)^2 + (ty/H)^2).
  // 4) Previous cut direction (`prevDir`) if tied.
  function rankCandidate(cand, bb, W, H, dirScores, prevDir, seedDir) {
    const dir = cand.dir || cand.name || 'down';
    const dScore = Math.round((dirScores[dir] ?? 0) * 10000) / 10000;
    const isHorizBox = bb.w > bb.h * 1.15;
    const isVertBox = bb.h > bb.w * 1.15;
    const isVertBand = dir === 'up' || dir === 'down' || dir === 'topLeftWide' || dir === 'topRightWide' || dir === 'botLeftWide' || dir === 'botRightWide';
    const isHorizBand = dir === 'left' || dir === 'right';
    const shapeFit = (isHorizBox && isVertBand) || (isVertBox && isHorizBand) ? 1 : ((isHorizBox && isHorizBand) || (isVertBox && isVertBand) ? -1 : 0);
    const normMove = Math.hypot((cand.tx || 0) / W, (cand.ty || 0) / H);
    const prevBonus = prevDir && dir === prevDir ? 1 : 0;
    const seedBonus = seedDir && dir === seedDir ? 1 : 0;
    return (
      dScore * 1e6 +
      shapeFit * 1e4 -
      normMove * 1e2 +
      prevBonus * 10 +
      seedBonus * 0.5
    );
  }

  // Find optimal (tx, ty) inside a safe region that keeps shifted BB inside region
  // while minimizing shift distance from original position
  function clampBoxToRegion(bb, reg) {
    const halfW = bb.w * 0.5;
    const halfH = bb.h * 0.5;
    let cx1, cy1;
    if (bb.w <= reg.w) {
      cx1 = J.clamp(bb.cx, reg.x0 + halfW, reg.x1 - halfW);
    } else {
      cx1 = reg.cx;
    }
    if (bb.h <= reg.h) {
      cy1 = J.clamp(bb.cy, reg.y0 + halfH, reg.y1 - halfH);
    } else {
      cy1 = reg.cy;
    }
    return { tx: cx1 - bb.cx, ty: cy1 - bb.cy, cx1, cy1 };
  }

  // Minimum push vector in 8 directions so that bb clears circle(cx, cy, R)
  // while staying inside stage margins [mx..W-mx, my..H-my].
  function solveDirectionalPush(bb, W, H, circle, opts = {}) {
    const mx = Math.round(W * (44 / 1920));
    const my = Math.round(H * (34 / 1080));
    const { cx, cy, R } = circle;
    const verticalOnly = !!opts.verticalOnly;
    const preferDir = opts.preferDir || null;
    const candidates = [];

    // Pure cardinal pushes
    // Up: bb.y1 + ty <= cy - R  => ty = (cy - R) - bb.y1
    const tyUp = (cy - R) - bb.y1;
    if (bb.y0 + tyUp >= my) {
      const tx = J.clamp(0, mx - bb.x0, (W - mx) - bb.x1);
      candidates.push({ name: 'up', tx, ty: tyUp });
    }
    // Down: bb.y0 + ty >= cy + R => ty = (cy + R) - bb.y0
    const tyDown = (cy + R) - bb.y0;
    if (bb.y1 + tyDown <= H - my) {
      const tx = J.clamp(0, mx - bb.x0, (W - mx) - bb.x1);
      candidates.push({ name: 'down', tx, ty: tyDown });
    }

    if (!verticalOnly) {
      // Left: bb.x1 + tx <= cx - R => tx = (cx - R) - bb.x1
      const txLeft = (cx - R) - bb.x1;
      if (bb.x0 + txLeft >= mx) {
        const ty = J.clamp(0, my - bb.y0, (H - my) - bb.y1);
        candidates.push({ name: 'left', tx: txLeft, ty });
      }
      // Right: bb.x0 + tx >= cx + R => tx = (cx + R) - bb.x0
      const txRight = (cx + R) - bb.x0;
      if (bb.x1 + txRight <= W - mx) {
        const ty = J.clamp(0, my - bb.y0, (H - my) - bb.y1);
        candidates.push({ name: 'right', tx: txRight, ty });
      }

      // Diagonal pushes along angle theta where circle boundary point is (cx + R cos a, cy + R sin a)
      const angles = [
        { name: 'tl', ax: -1, ay: -1 },
        { name: 'tr', ax:  1, ay: -1 },
        { name: 'bl', ax: -1, ay:  1 },
        { name: 'br', ax:  1, ay:  1 },
      ];
      const ratios = [0.35, 0.5, 0.65, 0.7071, 0.82];
      for (const d of angles) {
        for (const kx of ratios) {
          const ky = Math.sqrt(Math.max(0.05, 1 - kx * kx));
          const boundX = cx + d.ax * R * kx;
          const boundY = cy + d.ay * R * ky;
          const tx = d.ax < 0 ? (boundX - bb.x1) : (boundX - bb.x0);
          const ty = d.ay < 0 ? (boundY - bb.y1) : (boundY - bb.y0);
          const sbb = shiftBB(bb, tx, ty);
          if (
            sbb.x0 >= mx - 4 && sbb.x1 <= W - mx + 4 &&
            sbb.y0 >= my - 4 && sbb.y1 <= H - my + 4 &&
            !rectHitsCircle(sbb, cx, cy, R - 0.5)
          ) {
            candidates.push({ name: d.name, tx, ty });
          }
        }
      }
    }

    // Also include safe region placements for regions where bb fits without scaling
    const regions = getSafeRegions(W, H, circle);
    for (const reg of regions) {
      if (verticalOnly && reg.name !== 'up' && reg.name !== 'down') continue;
      if (bb.w <= reg.w + 2 && bb.h <= reg.h + 2) {
        const { tx, ty } = clampBoxToRegion(bb, reg);
        const sbb = shiftBB(bb, tx, ty);
        if (!rectHitsCircle(sbb, cx, cy, R - 0.5)) {
          candidates.push({ name: reg.name, tx: verticalOnly ? 0 : tx, ty, region: reg });
        }
      }
    }

    if (!candidates.length) return null;

    // Score candidates using Section 05 5-Step Priority:
    // 1) Direction score (circle offset) -> 2) Shape compatibility -> 3) Normalized move -> 4) Previous/seed direction
    const dirScores = getDirectionScores(W, H, circle);
    let best = null;
    let bestRank = -Infinity;
    for (const c of candidates) {
      const sbb = shiftBB(bb, c.tx, c.ty);
      if (rectHitsCircle(sbb, cx, cy, R - 1)) continue;
      const rank = rankCandidate(c, bb, W, H, dirScores, opts.prevDir, preferDir);
      if (rank > bestRank) {
        bestRank = rank;
        best = { ...c, scale: 1, bb: sbb };
      }
    }
    return best;
  }

  // Fit bb into the best safe region when it cannot fit at scale 1.0
  function solveScaledRegionFit(bb, W, H, circle, opts = {}) {
    const regions = getSafeRegions(W, H, circle);
    const verticalOnly = !!opts.verticalOnly;
    const minScale = opts.minScale || 0.38;
    const fixedScale = opts.fixedScale || null;
    let best = null;
    let bestScore = -Infinity;

    for (const reg of regions) {
      if (verticalOnly && reg.name !== 'up' && reg.name !== 'down') continue;
      const sFit = Math.min(1, (reg.w * 0.94) / Math.max(1, bb.w), (reg.h * 0.92) / Math.max(1, bb.h));
      const s = fixedScale ? Math.min(fixedScale, sFit) : Math.max(minScale, sFit);
      const scaledW = bb.w * s;
      const scaledH = bb.h * s;
      const tempBB = {
        x0: bb.cx - scaledW * 0.5,
        y0: bb.cy - scaledH * 0.5,
        x1: bb.cx + scaledW * 0.5,
        y1: bb.cy + scaledH * 0.5,
        w: scaledW,
        h: scaledH,
        cx: bb.cx,
        cy: bb.cy,
      };
      const { tx, ty } = clampBoxToRegion(tempBB, reg);
      const finalTX = verticalOnly ? 0 : tx;
      const sbb = scaleAndShiftBB(bb, bb.cx, bb.cy, s, finalTX, ty);
      const clearance = rectCircleDist(sbb, circle.cx, circle.cy, circle.R);
      if (clearance < -2) continue;
      const dist = Math.hypot(finalTX, ty);
      // Prefer larger scale (closer to 1.0) and smaller shift distance
      const score = s * 1000 - dist * 0.35 + Math.min(20, clearance);
      if (score > bestScore) {
        bestScore = score;
        best = {
          name: reg.name,
          tx: finalTX,
          ty,
          scale: s,
          pivotX: bb.cx,
          pivotY: bb.cy,
          region: reg,
          bb: sbb,
        };
      }
    }
    return best;
  }

  // ----------------------------------------------------------------------------
  // 4. Layout Measurement Pass (Captures Main Lyric BB, Aux BB, and Plate BB)
  // ----------------------------------------------------------------------------
  function createMeasureCtx(onRect) {
    let mat = [1, 0, 0, 1, 0, 0];
    const stack = [];
    const mul = (m1, m2) => [
      m1[0] * m2[0] + m1[2] * m2[1],
      m1[1] * m2[0] + m1[3] * m2[1],
      m1[0] * m2[2] + m1[2] * m2[3],
      m1[1] * m2[2] + m1[3] * m2[3],
      m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
      m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
    ];
    const txPt = (x, y) => [
      mat[0] * x + mat[2] * y + mat[4],
      mat[1] * x + mat[3] * y + mat[5],
    ];
    const recordBox = (x0, y0, x1, y1, kind) => {
      if (!Number.isFinite(x0) || !Number.isFinite(y0) || !Number.isFinite(x1) || !Number.isFinite(y1)) return null;
      const pts = [
        txPt(x0, y0),
        txPt(x1, y0),
        txPt(x1, y1),
        txPt(x0, y1),
      ];
      let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
      for (const [px, py] of pts) {
        if (px < bx0) bx0 = px;
        if (py < by0) by0 = py;
        if (px > bx1) bx1 = px;
        if (py > by1) by1 = py;
      }
      const res = { x0: bx0, y0: by0, x1: bx1, y1: by1 };
      onRect(res, kind);
      return res;
    };

    let pathBB = null;
    const addPathPt = (x, y) => {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      const [px, py] = txPt(x, y);
      if (!pathBB) pathBB = { x0: px, y0: py, x1: px, y1: py };
      else {
        if (px < pathBB.x0) pathBB.x0 = px;
        if (py < pathBB.y0) pathBB.y0 = py;
        if (px > pathBB.x1) pathBB.x1 = px;
        if (py > pathBB.y1) pathBB.y1 = py;
      }
    };

    const ctx = {
      canvas: { width: 1920, height: 1080 },
      fillStyle: '#fff',
      strokeStyle: '#fff',
      lineWidth: 1,
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      filter: 'none',
      font: '48px sans-serif',
      textAlign: 'center',
      textBaseline: 'middle',
      lineJoin: 'miter',
      lineCap: 'butt',
      lineDashOffset: 0,
      shadowColor: 'transparent',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      setLineDash() {},
      getLineDash() { return []; },
      save() {
        stack.push({
          mat: mat.slice(),
          globalAlpha: this.globalAlpha,
          font: this.font,
          textAlign: this.textAlign,
          textBaseline: this.textBaseline,
          lineWidth: this.lineWidth,
        });
      },
      restore() {
        const s = stack.pop();
        if (s) {
          mat = s.mat;
          this.globalAlpha = s.globalAlpha;
          this.font = s.font;
          this.textAlign = s.textAlign;
          this.textBaseline = s.textBaseline;
          this.lineWidth = s.lineWidth;
        }
      },
      translate(tx, ty) { mat = mul(mat, [1, 0, 0, 1, tx || 0, ty || 0]); },
      rotate(rad) {
        const c = Math.cos(rad || 0), s = Math.sin(rad || 0);
        mat = mul(mat, [c, s, -s, c, 0, 0]);
      },
      scale(sx, sy) { mat = mul(mat, [sx ?? 1, 0, 0, sy ?? sx ?? 1, 0, 0]); },
      transform(a, b, c, d, e, f) { mat = mul(mat, [a, b, c, d, e, f]); },
      setTransform(a, b, c, d, e, f) {
        if (typeof a === 'number') mat = [a, b, c, d, e, f];
        else mat = [1, 0, 0, 1, 0, 0];
      },
      getTransform() {
        const makeDOMMat = (m) => ({
          a: m[0], b: m[1], c: m[2], d: m[3], e: m[4], f: m[5],
          translate(tx, ty) { return makeDOMMat(mul(m, [1, 0, 0, 1, tx || 0, ty || 0])); },
          rotate(deg) {
            const rad = (deg || 0) * Math.PI / 180;
            const c = Math.cos(rad), s = Math.sin(rad);
            return makeDOMMat(mul(m, [c, s, -s, c, 0, 0]));
          },
          scale(sx, sy) { return makeDOMMat(mul(m, [sx ?? 1, 0, 0, sy ?? sx ?? 1, 0, 0])); },
        });
        return makeDOMMat(mat);
      },
      beginPath() { pathBB = null; },
      closePath() {},
      moveTo(x, y) { addPathPt(x, y); },
      lineTo(x, y) { addPathPt(x, y); },
      quadraticCurveTo(cpx, cpy, x, y) { addPathPt(cpx, cpy); addPathPt(x, y); },
      bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) { addPathPt(cp1x, cp1y); addPathPt(cp2x, cp2y); addPathPt(x, y); },
      arc(cx, cy, r) {
        if (r > 0) {
          addPathPt(cx - r, cy - r);
          addPathPt(cx + r, cy + r);
        }
      },
      arcTo(x1, y1, x2, y2) { addPathPt(x1, y1); addPathPt(x2, y2); },
      rect(x, y, w, h) {
        addPathPt(x, y);
        addPathPt(x + w, y + h);
      },
      clip() {},
      fill() {
        if (pathBB && this.globalAlpha > 0.02) onRect({ ...pathBB }, 'aux');
      },
      stroke() {
        if (pathBB && this.globalAlpha > 0.02) {
          const pad = (this.lineWidth || 1) * 0.5;
          onRect({ x0: pathBB.x0 - pad, y0: pathBB.y0 - pad, x1: pathBB.x1 + pad, y1: pathBB.y1 + pad }, 'aux');
        }
      },
      clearRect() {},
      fillRect(x, y, w, h) {
        if (w > 0 && h > 0 && this.globalAlpha > 0.02) recordBox(x, y, x + w, y + h, 'rect');
      },
      strokeRect(x, y, w, h) {
        if (w > 0 && h > 0 && this.globalAlpha > 0.02) recordBox(x, y, x + w, y + h, 'rect');
      },
      fillText(str, x, y) {
        if (!str || this.globalAlpha <= 0.02) return;
        const m = /(\d+(?:\.\d+)?)px/.exec(this.font || '');
        const sz = m ? parseFloat(m[1]) : 24;
        const w = String(str).length * sz * 0.75;
        const h = sz * 1.15;
        let x0 = x - w * 0.5;
        if (this.textAlign === 'left' || this.textAlign === 'start') x0 = x;
        else if (this.textAlign === 'right' || this.textAlign === 'end') x0 = x - w;
        let y0 = y - h * 0.5;
        if (this.textBaseline === 'top' || this.textBaseline === 'hanging') y0 = y;
        else if (this.textBaseline === 'bottom' || this.textBaseline === 'alphabetic') y0 = y - h;
        recordBox(x0, y0, x0 + w, y0 + h, 'auxText');
      },
      strokeText(str, x, y) { this.fillText(str, x, y); },
      measureText(str) {
        const m = /(\d+(?:\.\d+)?)px/.exec(this.font || '');
        const sz = m ? parseFloat(m[1]) : 24;
        return { width: String(str || '').length * sz * 0.72 };
      },
      createLinearGradient() { return { addColorStop() {} }; },
      createRadialGradient() { return { addColorStop() {} }; },
      drawImage() {},
      _recordBox: recordBox,
    };
    return ctx;
  }

  function itemLocalBounds(it) {
    if (!it || (it.alpha !== undefined && it.alpha <= 0.02) || (it.scale !== undefined && it.scale <= 0.02)) return null;
    const b = J.itemBox ? J.itemBox(it) : null;
    if (!b || !Number.isFinite(b.x0)) return null;
    return b;
  }

  // Run L.render(mEnv) at specific local time `lt` and collect:
  // - mainBB: bounding box of primary lyric (`J.mainDraw` hero calls + returned `bb`)
  // - fullBB: union of mainBB and non-background auxiliary drawings
  function measureCutAtTime(baseEnv, cut, lt) {
    const W = baseEnv.plan.W;
    const H = baseEnv.plan.H;
    const L = J.LAYOUTS[cut.layout] || J.LAYOUTS.center;
    let mainBB = null;
    let auxBB = null;
    const mainCallBoxes = [];

    const isFullBgRect = (bb) => {
      const rw = bb.x1 - bb.x0;
      const rh = bb.y1 - bb.y0;
      return rw >= W * 0.90 && rh >= H * 0.90;
    };

    const mctx = createMeasureCtx((bb, kind) => {
      if (isFullBgRect(bb)) return;
      if (kind === 'main') {
        mainBB = unionBB(mainBB, bb);
      } else {
        auxBB = unionBB(auxBB, bb);
      }
    });

    const mEnv = Object.assign({}, baseEnv, {
      ctx: mctx,
      W,
      H,
      pass: 'main',
      lt,
      ltb: lt,
      t: cut.start + lt,
      pIn: 1,
      pOut: 0,
      draw(it) {
        const lb = itemLocalBounds(it);
        if (lb) mctx._recordBox(lb.x0, lb.y0, lb.x1, lb.y1, 'aux');
      },
      rect(x, y, w, h, c, a = 1) {
        if (!c || a <= 0.02 || w <= 0 || h <= 0) return;
        mctx._recordBox(x, y, x + w, y + h, 'rect');
      },
      rrect(x, y, w, h, r, fill, a = 1, g = true, stroke) {
        if ((!fill && !stroke) || a <= 0.02 || w <= 0 || h <= 0) return;
        mctx._recordBox(x, y, x + w, y + h, 'rrect');
      },
      circle(cx, cy, r, fill, stroke, lw = 1, a = 1) {
        if ((!fill && !stroke) || a <= 0.02 || r <= 0) return;
        mctx._recordBox(cx - r, cy - r, cx + r, cy + r, 'circle');
      },
      arc(cx, cy, r, a0, a1, c, lw = 1, a = 1) {
        if (!c || a <= 0.02 || r <= 0) return;
        mctx._recordBox(cx - r, cy - r, cx + r, cy + r, 'arc');
      },
      line(pts, c, lw = 1, a = 1) {
        if (!c || a <= 0.02 || !pts || pts.length < 2) return;
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (const p of pts) {
          if (p[0] < x0) x0 = p[0];
          if (p[1] < y0) y0 = p[1];
          if (p[0] > x1) x1 = p[0];
          if (p[1] > y1) y1 = p[1];
        }
        mctx._recordBox(x0 - lw, y0 - lw, x1 + lw, y1 + lw, 'line');
      },
      polyPartial(pts, e, c, lw = 1, a = 1) {
        if (e <= 0) return;
        this.line(pts, c, lw, a);
      },
      poly(pts, c, a = 1) {
        if (!c || a <= 0.02 || !pts || !pts.length) return;
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (const p of pts) {
          if (p[0] < x0) x0 = p[0];
          if (p[1] < y0) y0 = p[1];
          if (p[0] > x1) x1 = p[0];
          if (p[1] > y1) y1 = p[1];
        }
        mctx._recordBox(x0, y0, x1, y1, 'poly');
      },
      blob(pts, c, a = 1) { this.poly(pts, c, a); },
    });

    const origMainDraw = J.mainDraw;
    let callIndex = 0;
    try {
      J.mainDraw = (envArg, it) => {
        const idx = callIndex++;
        const lb = itemLocalBounds(it) || (J.itemBox ? J.itemBox({ ...it, alpha: 1, scale: it?.scale || 1 }) : null);
        let tbb = null;
        if (lb) {
          const isGhostMain = (
            (cut.layout === 'echo' && idx < 4) ||
            (cut.layout === 'verticalRiver' && it.alpha !== undefined && it.alpha < 0.75) ||
            (cut.layout === 'scroll' && it.alpha !== undefined && it.alpha < 0.85) ||
            (cut.layout === 'hrWallScrawl' && it.alpha !== undefined && it.alpha < 0.85) ||
            (cut.layout === 'tyCropGiant' && it.alpha !== undefined && it.alpha < 0.5)
          );
          tbb = mctx._recordBox(lb.x0, lb.y0, lb.x1, lb.y1, isGhostMain ? 'aux' : 'main');
          if (!isGhostMain && tbb) mainCallBoxes.push(tbb);
        }
        return lb || { x0: W * 0.35, y0: H * 0.4, x1: W * 0.65, y1: H * 0.6, cx: W * 0.5, cy: H * 0.5, boxes: [] };
      };
      const retBB = L.render(mEnv);
      if (retBB && Number.isFinite(retBB.x0) && Number.isFinite(retBB.x1)) {
        if (!mainBB || TILED_AUX_IDS.has(cut.layout)) {
          const rbb = mctx._recordBox(retBB.x0, retBB.y0, retBB.x1, retBB.y1, 'main');
          if (TILED_AUX_IDS.has(cut.layout) && rbb) mainBB = rbb;
        }
      }
    } catch (e) {
      // Fallback if measurement hits an edge case
    } finally {
      J.mainDraw = origMainDraw;
    }

    if (!mainBB && auxBB) mainBB = { ...auxBB };
    if (!mainBB) {
      mainBB = { x0: W * 0.3, y0: H * 0.4, x1: W * 0.7, y1: H * 0.6 };
    }
    const fullBB = unionBB(mainBB, auxBB) || mainBB;
    return {
      mainBB: finalizeBB(mainBB),
      auxBB: finalizeBB(auxBB),
      fullBB: finalizeBB(fullBB),
      mainCallBoxes: mainCallBoxes.map(finalizeBB).filter(Boolean),
    };
  }

  function measureCutBounds(baseEnv, cut) {
    const rule = LAYOUT_AVOID[cut.layout] || { mode: 'shift', aux: 'shift' };
    const dur = Math.max(0.4, cut.dur || 2.0);
    if (rule.sampleMulti || cut.layout === 'wave' || cut.layout === 'knReflow') {
      let mainBB = null, auxBB = null, fullBB = null;
      for (const frac of MULTI_SAMPLE_TIMES) {
        const m = measureCutAtTime(baseEnv, cut, dur * frac);
        mainBB = unionBB(mainBB, m.mainBB);
        auxBB = unionBB(auxBB, m.auxBB);
        fullBB = unionBB(fullBB, m.fullBB);
      }
      return {
        mainBB: finalizeBB(mainBB),
        auxBB: finalizeBB(auxBB),
        fullBB: finalizeBB(fullBB),
      };
    }
    const settledLT = Math.min(dur * 0.55, Math.max(0.65, (cut.inDur || 0.3) + 0.45));
    return measureCutAtTime(baseEnv, cut, settledLT);
  }

  // ----------------------------------------------------------------------------
  // 5. Solver: Resolve Placement Per Layout Group
  // ----------------------------------------------------------------------------
  const DIR_NAMES = ['up', 'down', 'left', 'right', 'tl', 'tr', 'bl', 'br'];

  function solveCutAvoidance(baseEnv, cut, circle) {
    const W = baseEnv.plan.W;
    const H = baseEnv.plan.H;
    const id = cut.layout;
    const rule = LAYOUT_AVOID[id] || { mode: 'shift', aux: 'shift' };
    const P = cut.circleNativeParams || cut.params || {};

    // Group 1: Orbit / Ring-compatible (7)
    if (ORBIT_IDS.has(id) || rule.mode === 'orbit') {
      return {
        mode: 'orbit',
        tx: circle.cx - W * 0.5,
        ty: circle.cy - H * 0.5,
        scale: 1,
      };
    }

    // Group 3: Policy A — Re-wrap at native font size (`center`, `vcols` split variant)
    if (id === 'center' || (id === 'vcols' && P.variant === 'split')) {
      const policyASol = solvePolicyA(baseEnv, cut, circle, P);
      if (policyASol) return policyASol;
    }

    // Measure native full-stage bounds
    const { mainBB, auxBB, fullBB, mainCallBoxes } = measureCutBounds(baseEnv, cut);
    const seedDir = DIR_NAMES[J.h(cut.seed || 1, 701) % DIR_NAMES.length];

    // Special case: `corners` places two separate text boxes in opposite corners of the stage;
    // their union spans the center, so check if the individual corner text boxes clear the circle!
    if (id === 'corners' && Array.isArray(mainCallBoxes) && mainCallBoxes.length >= 2) {
      const anyCornerHits = mainCallBoxes.some(b => rectHitsCircle(b, circle.cx, circle.cy, circle.R));
      if (!anyCornerHits) {
        return {
          mode: 'transform',
          tx: 0,
          ty: 0,
          scale: 1,
          pivotX: mainBB.cx,
          pivotY: mainBB.cy,
          mainBB,
          fullBB,
          shiftedBB: mainCallBoxes[0],
        };
      }
    }

    // Special case: `ledScroll` — horizontal LED board spans W*0.94 across the stage, so shift vertically (up/down) like `dominoes`!
    if (id === 'ledScroll') {
      if (!rectHitsCircle(fullBB, circle.cx, circle.cy, circle.R)) {
        return { mode: 'transform', tx: 0, ty: 0, scale: 1, pivotX: fullBB.cx, pivotY: fullBB.cy, mainBB, fullBB, shiftedBB: fullBB };
      }
      const pushV = solveDirectionalPush(fullBB, W, H, circle, { verticalOnly: true });
      if (pushV) {
        return { mode: 'transform', tx: 0, ty: pushV.ty, scale: 1, pivotX: fullBB.cx, pivotY: fullBB.cy, mainBB, fullBB, shiftedBB: pushV.bb };
      }
      const fitV = solveScaledRegionFit(fullBB, W, H, circle, { verticalOnly: true, minScale: 0.35 });
      return {
        mode: 'transform',
        tx: 0,
        ty: fitV ? fitV.ty : (circle.cy - circle.R - fullBB.y1),
        scale: fitV ? fitV.scale : 0.45,
        pivotX: fullBB.cx,
        pivotY: fullBB.cy,
        mainBB,
        fullBB,
        shiftedBB: fitV ? fitV.bb : fullBB,
      };
    }

    // Group 2: Tiled / Full-screen aux + Hero primary (14)
    if (TILED_AUX_IDS.has(id) || rule.mode === 'tiledAux') {
      const targetBB = mainBB;
      if (!rectHitsCircle(targetBB, circle.cx, circle.cy, circle.R)) {
        return {
          mode: 'tiledAux',
          tx: 0,
          ty: 0,
          scale: 1,
          pivotX: targetBB.cx,
          pivotY: targetBB.cy,
          mainBB: targetBB,
          shiftedBB: targetBB,
        };
      }
      const push = solveDirectionalPush(targetBB, W, H, circle, { preferDir: seedDir });
      if (push) {
        return {
          mode: 'tiledAux',
          tx: push.tx,
          ty: push.ty,
          scale: 1,
          pivotX: targetBB.cx,
          pivotY: targetBB.cy,
          mainBB: targetBB,
          shiftedBB: push.bb,
        };
      }
      const scaled = solveScaledRegionFit(targetBB, W, H, circle, { minScale: 0.45 });
      return {
        mode: 'tiledAux',
        tx: scaled ? scaled.tx : 0,
        ty: scaled ? scaled.ty : (circle.cy - circle.R - targetBB.y1),
        scale: scaled ? scaled.scale : 0.65,
        pivotX: targetBB.cx,
        pivotY: targetBB.cy,
        mainBB: targetBB,
        shiftedBB: scaled ? scaled.bb : targetBB,
      };
    }

    // Group 4: Policy C — Coupled frame/plate/column layouts (8)
    if (rule.mode === 'policyC') {
      if (id === 'crossword') {
        const fit = solveScaledRegionFit(fullBB, W, H, circle, { fixedScale: 0.58 });
        if (fit) {
          return {
            mode: 'transform',
            tx: fit.tx,
            ty: fit.ty,
            scale: fit.scale,
            pivotX: fullBB.cx,
            pivotY: fullBB.cy,
            mainBB,
            fullBB,
            shiftedBB: fit.bb,
          };
        }
      }
      if (id === 'dominoes') {
        if (!rectHitsCircle(fullBB, circle.cx, circle.cy, circle.R)) {
          return { mode: 'transform', tx: 0, ty: 0, scale: 1, pivotX: fullBB.cx, pivotY: fullBB.cy, mainBB, fullBB, shiftedBB: fullBB };
        }
        const pushV = solveDirectionalPush(fullBB, W, H, circle, { verticalOnly: true });
        if (pushV) {
          return { mode: 'transform', tx: 0, ty: pushV.ty, scale: 1, pivotX: fullBB.cx, pivotY: fullBB.cy, mainBB, fullBB, shiftedBB: pushV.bb };
        }
        const fitV = solveScaledRegionFit(fullBB, W, H, circle, { verticalOnly: true, minScale: 0.48 });
        return {
          mode: 'transform',
          tx: 0,
          ty: fitV ? fitV.ty : (circle.cy - circle.R - fullBB.y1),
          scale: fitV ? fitV.scale : 0.6,
          pivotX: fullBB.cx,
          pivotY: fullBB.cy,
          mainBB,
          fullBB,
          shiftedBB: fitV ? fitV.bb : fullBB,
        };
      }
      if (id === 'contour') {
        const regions = getSafeRegions(W, H, circle);
        const leftReg = regions.find(r => r.name === 'left') || regions[0];
        const rightReg = regions.find(r => r.name === 'right') || regions[1] || leftReg;
        const fitText = solveScaledRegionFit(mainBB, W, H, circle, { minScale: 0.55 });
        return {
          mode: 'contourSplit',
          leftReg,
          rightReg,
          auxTX: leftReg ? (leftReg.cx - W * 0.5) : -W * 0.28,
          auxTY: leftReg ? (leftReg.cy - H * 0.5) : 0,
          auxScale: 0.5,
          tx: rightReg ? clampBoxToRegion(mainBB, rightReg).tx : (fitText ? fitText.tx : W * 0.25),
          ty: rightReg ? clampBoxToRegion(mainBB, rightReg).ty : (fitText ? fitText.ty : 0),
          scale: rightReg && mainBB.w <= rightReg.w ? 1 : (fitText ? fitText.scale : 0.72),
          pivotX: mainBB.cx,
          pivotY: mainBB.cy,
          mainBB,
          fullBB,
        };
      }
      if (id === 'splitScreen') {
        const fit = solveDirectionalPush(mainBB, W, H, circle, { preferDir: seedDir })
          || solveScaledRegionFit(mainBB, W, H, circle, { minScale: 0.5 });
        const regions = getSafeRegions(W, H, circle);
        const reg = fit?.region || regions.find(r => r.name === fit?.name) || regions[0];
        return {
          mode: 'splitScreenClip',
          tx: fit ? fit.tx : 0,
          ty: fit ? fit.ty : (circle.cy - circle.R - mainBB.y1),
          scale: fit?.scale || 1,
          pivotX: mainBB.cx,
          pivotY: mainBB.cy,
          region: reg,
          mainBB,
          fullBB,
        };
      }
      // headlineDeck, columnsBig, bulbs, numbered (cols):
      // Measure coupled fullBB; if already clear, no shift; else push or fit fullBB
      const boxToClear = (id === 'numbered' && P.variant !== 'cols') ? mainBB : fullBB;
      if (!rectHitsCircle(boxToClear, circle.cx, circle.cy, circle.R)) {
        return { mode: 'transform', tx: 0, ty: 0, scale: 1, pivotX: boxToClear.cx, pivotY: boxToClear.cy, mainBB, fullBB, shiftedBB: boxToClear };
      }
      const pushC = solveDirectionalPush(boxToClear, W, H, circle, { preferDir: seedDir });
      if (pushC) {
        return { mode: 'transform', tx: pushC.tx, ty: pushC.ty, scale: 1, pivotX: boxToClear.cx, pivotY: boxToClear.cy, mainBB, fullBB, shiftedBB: pushC.bb };
      }
      const fitC = solveScaledRegionFit(boxToClear, W, H, circle, { minScale: 0.42 });
      return {
        mode: 'transform',
        tx: fitC ? fitC.tx : 0,
        ty: fitC ? fitC.ty : (circle.cy - circle.R - boxToClear.y1),
        scale: fitC ? fitC.scale : 0.55,
        pivotX: boxToClear.cx,
        pivotY: boxToClear.cy,
        mainBB,
        fullBB,
        shiftedBB: fitC ? fitC.bb : boxToClear,
      };
    }

    // Group 5, 6, 7, 8: Standard Shift (153 layouts + corner/edge + wave/knReflow)
    // Prefer checking mainBB against the avoidance circle, and if fullBB isn't fullscreen,
    // check whether fullBB also fits cleanly when shifted by the same vector.
    const fullIsCompact = fullBB.w <= W * 0.78 && fullBB.h <= H * 0.78;
    const checkBB = (fullIsCompact && fullBB.w <= mainBB.w * 1.45 && fullBB.h <= mainBB.h * 1.45) ? fullBB : mainBB;

    if (!rectHitsCircle(checkBB, circle.cx, circle.cy, circle.R) && !rectHitsCircle(mainBB, circle.cx, circle.cy, circle.R)) {
      return {
        mode: 'transform',
        tx: 0,
        ty: 0,
        scale: 1,
        pivotX: mainBB.cx,
        pivotY: mainBB.cy,
        mainBB,
        fullBB,
        shiftedBB: mainBB,
      };
    }

    // First try pure translation without any scaling
    const push = solveDirectionalPush(checkBB, W, H, circle, { preferDir: seedDir })
      || (checkBB !== mainBB ? solveDirectionalPush(mainBB, W, H, circle, { preferDir: seedDir }) : null);
    if (push) {
      return {
        mode: 'transform',
        tx: push.tx,
        ty: push.ty,
        scale: 1,
        pivotX: mainBB.cx,
        pivotY: mainBB.cy,
        mainBB,
        fullBB,
        shiftedBB: shiftBB(mainBB, push.tx, push.ty),
      };
    }

    // Fallback Policy B: uniform scale around primary bbox center + shift into best safe region
    const fit = solveScaledRegionFit(mainBB, W, H, circle, { minScale: 0.42 });
    return {
      mode: 'transform',
      tx: fit ? fit.tx : 0,
      ty: fit ? fit.ty : (circle.cy - circle.R - mainBB.y1),
      scale: fit ? fit.scale : 0.55,
      pivotX: mainBB.cx,
      pivotY: mainBB.cy,
      mainBB,
      fullBB,
      shiftedBB: fit ? fit.bb : mainBB,
    };
  }

  // ----------------------------------------------------------------------------
  // 6. Policy A Solver & Renderer (`center` and `vcols` split variant)
  // ----------------------------------------------------------------------------
  function wrapCharsToWidth(text, maxCharsPerLine) {
    const rawLines = String(text || '').split('\n');
    const out = [];
    const cap = Math.max(1, Math.floor(maxCharsPerLine));
    for (const line of rawLines) {
      const chars = [...line];
      if (chars.length <= cap) {
        out.push(line);
      } else {
        for (let i = 0; i < chars.length; i += cap) {
          out.push(chars.slice(i, i + cap).join(''));
        }
      }
    }
    return out.join('\n');
  }

  function solvePolicyA(baseEnv, cut, circle, P) {
    const W = baseEnv.plan.W;
    const H = baseEnv.plan.H;
    const regions = getSafeRegions(W, H, circle);
    if (!regions.length) return null;

    if (cut.layout === 'center') {
      const nativeText = J.splitLines ? J.splitLines(cut.text, W < H ? 5 : 11) : cut.text;
      const size = Math.min(J.fitSize(nativeText, P.font, W * 0.84, H * 0.5, { sx: P.sx, track: P.track, lead: 1.2 }), H * 0.33);
      const track = P.track || 0;
      const charStep = size * (P.sx || 1) * (1 + track);

      const nativeM = J.measure({
        text: nativeText,
        font: P.font,
        size,
        sx: P.sx,
        track,
        lead: 1.2,
      });
      const nativeCX = W * 0.5 + (P.ox || 0) * W;
      const nativeCY = H * 0.5 + (P.oy || 0) * H;
      const nativeBB = finalizeBB({
        x0: nativeCX - nativeM.w * 0.5,
        y0: nativeCY - nativeM.h * 0.5,
        x1: nativeCX + nativeM.w * 0.5,
        y1: nativeCY + nativeM.h * 0.5,
      });

      if (!rectHitsCircle(nativeBB, circle.cx, circle.cy, circle.R)) {
        return {
          mode: 'policyA_center',
          wrappedText: nativeText,
          size,
          cx1: nativeCX,
          cy1: nativeCY,
          scale: 1,
          bb: nativeBB,
        };
      }

      // Try each safe region ordered by direction score, shape compatibility, and normalized displacement
      const dirScores = getDirectionScores(W, H, circle);
      let best = null;
      let bestScore = -Infinity;
      for (const reg of regions) {
        const maxChars = Math.max(2, Math.floor((reg.w * 0.92) / Math.max(8, charStep)));
        // Preserve explicit newlines and short lines per Section 03 Policy A
        const wrappedText = cut.text.includes('\n')
          ? wrapCharsToWidth(cut.text, maxChars)
          : (J.splitLines ? J.splitLines(cut.text, maxChars) : wrapCharsToWidth(cut.text, maxChars));
        const m = J.measure({
          text: wrappedText,
          font: P.font,
          size,
          sx: P.sx,
          track,
          lead: 1.2,
        });
        if (m.w <= reg.w * 0.98 && m.h <= reg.h * 0.98) {
          const tempBB = finalizeBB({
            x0: nativeCX - m.w * 0.5,
            y0: nativeCY - m.h * 0.5,
            x1: nativeCX + m.w * 0.5,
            y1: nativeCY + m.h * 0.5,
          });
          const { cx1, cy1, tx, ty } = clampBoxToRegion(tempBB, reg);
          const placedBB = finalizeBB({
            x0: cx1 - m.w * 0.5,
            y0: cy1 - m.h * 0.5,
            x1: cx1 + m.w * 0.5,
            y1: cy1 + m.h * 0.5,
          });
          if (!rectHitsCircle(placedBB, circle.cx, circle.cy, circle.R - 1)) {
            const score = rankCandidate({ dir: reg.dir || reg.name, tx, ty }, nativeBB, W, H, dirScores, null, null);
            if (score > bestScore) {
              bestScore = score;
              best = {
                mode: 'policyA_center',
                dir: reg.dir || reg.name,
                wrappedText,
                size,
                cx1,
                cy1,
                scale: 1,
                bb: placedBB,
              };
            }
          }
        }
      }
      if (best) return best;
    }

    if (cut.layout === 'vcols' && P.variant === 'split') {
      const text = (cut.text || '').replace(/\s+/g, '');
      const n = [...text].length;
      const origPer = Math.max(2, Math.min((P.perCol || 4) + 1, Math.ceil(n / Math.ceil(n / 7))));
      const origCols = Math.ceil(n / origPer);
      const size = Math.min(H * 0.78 / (origPer * 1.03), W * 0.8 / (origCols * 1.4));
      const dirScores = getDirectionScores(W, H, circle);
      let bestV = null;
      let bestVScore = -Infinity;

      for (const reg of regions) {
        // Section 04: In vertical writing Policy A, left/right regions use long columns & fewer columns;
        // up/down regions use short columns & more columns.
        const perCol = Math.max(2, Math.floor((reg.h * 0.88) / (size * 1.03)));
        const chars = [...text];
        const cols = [];
        for (let i = 0; i < chars.length; i += perCol) cols.push(chars.slice(i, i + perCol).join(''));
        const gap = size * 1.4;
        const totalW = cols.length * gap;
        const totalH = Math.min(chars.length, perCol) * size * 1.03;
        if (totalW <= reg.w * 0.96 && totalH <= reg.h * 0.96) {
          const placedBB = finalizeBB({
            x0: reg.cx - totalW * 0.5,
            y0: reg.cy - totalH * 0.5,
            x1: reg.cx + totalW * 0.5,
            y1: reg.cy + totalH * 0.5,
          });
          if (!rectHitsCircle(placedBB, circle.cx, circle.cy, circle.R - 1)) {
            const tx = reg.cx - W * 0.5, ty = reg.cy - H * 0.5;
            const origVBB = { w: origCols * gap, h: origPer * size * 1.03 };
            const score = rankCandidate({ dir: reg.dir || reg.name, tx, ty }, origVBB, W, H, dirScores, null, null);
            if (score > bestVScore) {
              bestVScore = score;
              bestV = {
                mode: 'policyA_vcols',
                dir: reg.dir || reg.name,
                perCol,
                size,
                cx1: reg.cx,
                cy1: reg.cy,
                bb: placedBB,
              };
            }
          }
        }
      }
      if (bestV) return bestV;
    }

    return null;
  }

  function renderPolicyACenter(env, sol) {
    const { W, H, cut, sc, pIn, pOut } = env;
    const P = cut.circleNativeParams || cut.params || {};
    const bb = J.mainDraw(env, {
      text: sol.wrappedText,
      font: P.font,
      size: sol.size,
      x: sol.cx1,
      y: sol.cy1,
      sx: P.sx,
      track: P.track,
      lead: 1.2,
      color: P.accent ? sc.accent : sc.fg,
    });
    if (bb && P.sub && cut.lineText !== cut.text) {
      env.draw({
        text: cut.lineText,
        font: env.st.fonts.body[0],
        size: J.clamp(H * 0.026, 16, 34),
        x: sol.cx1,
        y: bb.y1 + H * 0.05,
        track: 0.22,
        color: sc.sub,
        alpha: J.E.outCubic(pIn),
        ghost: false,
      });
    }
    if (bb && P.under) {
      const e = J.E.outExpo(pIn * 1.2 - 0.2), o = J.E.inCubic(pOut);
      if (e > 0 && o < 1) {
        env.line(
          [[J.lerp(bb.x0, bb.x1, o), bb.y1 + sol.size * 0.14], [J.lerp(bb.x0, bb.x1, e), bb.y1 + sol.size * 0.14]],
          sc.accent,
          Math.max(2, sol.size * 0.03),
          1
        );
      }
    }
    return bb;
  }

  function renderPolicyAVcols(env, sol) {
    const { cut, sc } = env;
    const P = cut.circleNativeParams || cut.params || {};
    const text = (cut.text || '').replace(/\s+/g, '');
    const chars = [...text];
    const perCol = sol.perCol;
    const cols = [];
    for (let i = 0; i < chars.length; i += perCol) cols.push(chars.slice(i, i + perCol).join(''));
    const size = sol.size;
    const colH = Math.min(chars.length, perCol) * size * 1.03;
    const t2 = cols.join('\n');
    return J.mainDraw(env, {
      text: t2,
      font: P.font,
      size,
      x: sol.cx1,
      y: sol.cy1 - colH * 0.5,
      vertical: true,
      lead: 1.4,
      align: 'left',
      track: 0.03,
      color: sc.fg,
    });
  }

  // ----------------------------------------------------------------------------
  // 7. Dual-Pass Renderer for Group 2 (`tiledAux`: 14 Layouts)
  // ----------------------------------------------------------------------------
  function applyRadialCirclePunch(ctx, stageTransform, circle, W, H) {
    if (J.avoidanceMaskActive && J.avoidanceMaskActive(circle)) {
      J.applyAvoidanceCircleMask(ctx, stageTransform, circle, W, H);
      return;
    }
    ctx.save();
    ctx.setTransform(
      stageTransform.a, stageTransform.b,
      stageTransform.c, stageTransform.d,
      stageTransform.e, stageTransform.f
    );
    ctx.globalCompositeOperation = 'destination-out';
    ctx.globalAlpha = 1;
    const rInner = Math.max(1, circle.R);
    const rOuter = Math.max(rInner + 1, circle.R + circle.feather);
    const grad = ctx.createRadialGradient(circle.cx, circle.cy, rInner, circle.cx, circle.cy, rOuter);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(circle.cx, circle.cy, rOuter + 2, 0, J.TAU);
    ctx.fill();
    ctx.restore();
  }

  function renderTiledAuxLayout(renderer, env, sol, circle) {
    const { ctx, cut, W, H } = env;
    const id = cut.layout;
    const L = J.LAYOUTS[id] || J.LAYOUTS.center;
    const scale = env.scale || 1;
    const stageMatrix = { a: scale, b: 0, c: 0, d: scale, e: 0, f: 0 };
    const camMatrix = ctx.getTransform();
    const cw = ctx.canvas.width;
    const ch = ctx.canvas.height;

    // 1. Auxiliary Pass (on main pass only so ghosts don't duplicate tiled backgrounds)
    if (env.pass === 'main' && J.avoidMaskPhase !== 'main') {
      const scratch = renderer.ensure(
        renderer.avoidScratch || (renderer.avoidScratch = document.createElement('canvas')),
        cw,
        ch
      );
      const sx = scratch.getContext('2d');
      sx.setTransform(1, 0, 0, 1, 0, 0);
      sx.globalAlpha = 1;
      sx.globalCompositeOperation = 'source-over';
      sx.filter = 'none';
      sx.clearRect(0, 0, cw, ch);
      sx.setTransform(camMatrix.a, camMatrix.b, camMatrix.c, camMatrix.d, camMatrix.e, camMatrix.f);

      const auxEnv = Object.assign({}, env, { ctx: sx });
      // Suppress center knockout plate on aux pass for layouts that draw one immediately before J.mainDraw
      if (id === 'tile' || id === 'crossBands' || id === 'justified' || id === 'edgeFrame' || id === 'tyBandHide') {
        const origRect = auxEnv.rect;
        auxEnv.rect = (x, y, w, h, c, a = 1, g = true) => {
          // Skip background knockout plates that use sc.bg near stage center
          if (c === env.sc.bg && w < W * 0.95 && h < H * 0.95) return;
          origRect(x, y, w, h, c, a, g);
        };
      }

      const origMainDraw = J.mainDraw;
      let mainIdx = 0;
      try {
        J.mainDraw = (envArg, it) => {
          const idx = mainIdx++;
          const isAuxMain = (
            (id === 'echo' && idx < 4) ||
            (id === 'verticalRiver' && it.alpha !== undefined && it.alpha < 0.75) ||
            (id === 'scroll' && it.alpha !== undefined && it.alpha < 0.85) ||
            (id === 'hrWallScrawl' && it.alpha !== undefined && it.alpha < 0.85) ||
            (id === 'tyCropGiant' && it.alpha !== undefined && it.alpha < 0.5)
          );
          if (isAuxMain) return origMainDraw(envArg, it);
          return J.itemBox ? J.itemBox(it) : { x0: 0, y0: 0, x1: 0, y1: 0, cx: W * 0.5, cy: H * 0.5, boxes: [] };
        };
        L.render(auxEnv);
      } catch (e) {
        console.warn('tiledAux pass1', id, e);
      } finally {
        J.mainDraw = origMainDraw;
      }

      // Punch radial feather hole around (circle.cx, circle.cy)
      applyRadialCirclePunch(sx, stageMatrix, circle, W, H);

      // Composite auxiliary layer onto target ctx
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.drawImage(scratch, 0, 0);
      ctx.restore();
    }

    if (J.avoidMaskPhase === 'aux') {
      return sol.shiftedBB || sol.mainBB;
    }

    // 2. Primary Hero Pass: shift (and scale if needed) into safe region
    ctx.save();
    ctx.translate(sol.tx || 0, sol.ty || 0);
    if (sol.scale && sol.scale < 0.999) {
      ctx.translate(sol.pivotX, sol.pivotY);
      ctx.scale(sol.scale, sol.scale);
      ctx.translate(-sol.pivotX, -sol.pivotY);
    }

    const realEnv = (env && env.__real) || env;
    const primEnv = Object.assign({}, env, {
      draw() {}, // suppress tiled env.draw items in primary pass
      line() {},
      circle() {},
      arc() {},
      poly() {},
      blob() {},
      rrect() {},
      rect(x, y, w, h, c, a = 1, g = true) {
        // Keep the immediate knockout plate behind the hero text for tile/crossBands/justified/edgeFrame/tyBandHide
        if (
          (id === 'tile' || id === 'crossBands' || id === 'justified' || id === 'edgeFrame' || id === 'tyBandHide') &&
          c === env.sc.bg && w < W * 0.95 && h < H * 0.95
        ) {
          realEnv.rect(x, y, w, h, c, a, g);
        }
      },
    });

    const origMainDraw = J.mainDraw;
    let mainIdx = 0;
    let heroBB = null;
    try {
      J.mainDraw = (envArg, it) => {
        const idx = mainIdx++;
        const isAuxMain = (
          (id === 'echo' && idx < 4) ||
          (id === 'verticalRiver' && it.alpha !== undefined && it.alpha < 0.75) ||
          (id === 'scroll' && it.alpha !== undefined && it.alpha < 0.85) ||
          (id === 'hrWallScrawl' && it.alpha !== undefined && it.alpha < 0.85) ||
          (id === 'tyCropGiant' && it.alpha !== undefined && it.alpha < 0.5)
        );
        if (isAuxMain) {
          return J.itemBox ? J.itemBox(it) : { x0: 0, y0: 0, x1: 0, y1: 0, cx: W * 0.5, cy: H * 0.5, boxes: [] };
        }
        // Restore real env methods when inside hero mainDraw
        heroBB = origMainDraw(realEnv, it);
        return heroBB;
      };
      // Suppress direct ctx.fillRect / ctx.strokeRect calls produced by hrRedacted / tyBandHide during primary pass
      const origFillRect = ctx.fillRect.bind(ctx);
      const origStrokeRect = ctx.strokeRect.bind(ctx);
      if (id === 'hrRedacted' || id === 'tyBandHide') {
        ctx.fillRect = () => {};
        ctx.strokeRect = () => {};
      }
      try {
        L.render(primEnv);
      } finally {
        ctx.fillRect = origFillRect;
        ctx.strokeRect = origStrokeRect;
      }
    } catch (e) {
      console.warn('tiledAux pass2', id, e);
    } finally {
      J.mainDraw = origMainDraw;
    }
    ctx.restore();

    return sol.shiftedBB || heroBB || sol.mainBB;
  }

  // ----------------------------------------------------------------------------
  // 8. Main Entry Point: `J.drawCutWithCircleAvoidance(renderer, env)`
  // ----------------------------------------------------------------------------
  J.drawCutWithCircleAvoidance = (renderer, env) => {
    const { cut, plan, W, H } = env;
    const circle = J.circleAvoidanceForCut ? J.circleAvoidanceForCut(plan, cut, env.t) : plan.lyricAvoidance;
    if (!circle || !circle.enabled) return renderer.drawCutDirect(env);

    // Temporarily swap in full-stage native layout params while rendering under circle avoidance
    const savedParams = cut.params;
    if (cut.circleNativeParams) cut.params = cut.circleNativeParams;

    try {
      // Snapshot the inputs consumed by native layout measurement, not the live frame time.
      // Params are already swapped to circleNativeParams when those take precedence.
      const cacheKey = JSON.stringify([
        W, H, circle.cx, circle.cy, circle.r, circle.pad, circle.avoidEmphasis,
        cut.layout, cut.seed, cut.text, cut.lineText, cut.words, cut.note, cut.n,
        cut.line, cut.index, cut.start, cut.end, cut.dur, cut.inDur, cut.outDur,
        cut.stagger, cut.enter, cut.exit, cut.hold, cut.params,
        env.st?.fonts, J.lang, J.metrics?.revision,
      ]);
      if (!cut._circleSol || cut._circleSolKey !== cacheKey) {
        cut._circleSol = solveCutAvoidance(env, cut, circle);
        cut._circleSolKey = cacheKey;
      }
      const sol = cut._circleSol;

      const runCut = targetEnv => {
        const tctx = targetEnv.ctx;
        const decor = cut.decor || [];
        for (const d of decor) {
          const D = J.DECOR[d.id];
          if (D && D.layer === 'back') {
            try { D.draw(targetEnv, null, d); } catch (e) { console.warn(e); }
          }
        }

        let bb = null;
        if (!cut.effectsOnly) {
          const L = J.LAYOUTS[cut.layout] || J.LAYOUTS.center;

          if (sol.mode === 'orbit') {
            tctx.save();
            tctx.translate(sol.tx || 0, sol.ty || 0);
            bb = L.render(targetEnv);
            tctx.restore();
            if (bb) bb = shiftBB(bb, sol.tx || 0, sol.ty || 0);
          } else if (sol.mode === 'policyA_center') {
            bb = renderPolicyACenter(targetEnv, sol);
          } else if (sol.mode === 'policyA_vcols') {
            bb = renderPolicyAVcols(targetEnv, sol);
          } else if (sol.mode === 'tiledAux') {
            bb = renderTiledAuxLayout(renderer, targetEnv, sol, circle);
          } else if (sol.mode === 'contourSplit') {
            // 1) Contour rings in left safe region at 0.5x scale
            if (targetEnv.pass === 'main' && J.avoidMaskPhase !== 'main') {
              tctx.save();
              tctx.translate(sol.auxTX, sol.auxTY);
              tctx.translate(W * 0.5, H * 0.5);
              tctx.scale(sol.auxScale, sol.auxScale);
              tctx.translate(-W * 0.5, -H * 0.5);
              const origMainDraw = J.mainDraw;
              try {
                J.mainDraw = () => ({ x0: 0, y0: 0, x1: 0, y1: 0, cx: W * 0.5, cy: H * 0.5, boxes: [] });
                const ringEnv = Object.assign({}, targetEnv, { line() {} });
                L.render(ringEnv);
              } finally {
                J.mainDraw = origMainDraw;
              }
              tctx.restore();
            }
            // 2) Main lyric in right safe region
            tctx.save();
            tctx.translate(sol.tx || 0, sol.ty || 0);
            if (sol.scale && sol.scale < 0.999) {
              tctx.translate(sol.pivotX, sol.pivotY);
              tctx.scale(sol.scale, sol.scale);
              tctx.translate(-sol.pivotX, -sol.pivotY);
            }
            const textEnv = Object.assign({}, targetEnv, {
              draw(it) {
                // Keep the small elevation label if it's not one of the giant contour rings
                if (it && it.size < Math.min(W, H) * 0.04) targetEnv.draw(it);
              },
            });
            bb = L.render(textEnv);
            tctx.restore();
            bb = sol.bb || bb;
          } else if (sol.mode === 'splitScreenClip') {
            tctx.save();
            if (sol.region) {
              tctx.beginPath();
              tctx.rect(sol.region.x0, sol.region.y0, sol.region.w, sol.region.h);
              tctx.clip();
            }
            tctx.translate(sol.tx || 0, sol.ty || 0);
            if (sol.scale && sol.scale < 0.999) {
              tctx.translate(sol.pivotX, sol.pivotY);
              tctx.scale(sol.scale, sol.scale);
              tctx.translate(-sol.pivotX, -sol.pivotY);
            }
            bb = L.render(targetEnv);
            tctx.restore();
            bb = sol.bb || bb;
          } else {
            // Standard transform (pure shift or Policy B/C shift+scale)
            // Note: For layouts that draw a full-stage background fill (e.g. comic, diagonalSplit, noiseGrid),
            // keep full-stage background fills unshifted so the stage stays covered.
            tctx.save();
            const tx = sol.tx || 0;
            const ty = sol.ty || 0;
            const sc = sol.scale || 1;
            const px = sol.pivotX ?? W * 0.5;
            const py = sol.pivotY ?? H * 0.5;

            tctx.translate(tx, ty);
            if (sc < 0.999) {
              tctx.translate(px, py);
              tctx.scale(sc, sc);
              tctx.translate(-px, -py);
            }

            const origRect = targetEnv.rect;
            const shiftedEnv = Object.assign({}, targetEnv, {
              rect(x, y, w, h, c, a = 1, g = true) {
                if (w >= W * 0.92 && h >= H * 0.92) {
                  tctx.save();
                  if (sc < 0.999) {
                    tctx.translate(px, py);
                    tctx.scale(1 / sc, 1 / sc);
                    tctx.translate(-px, -py);
                  }
                  tctx.translate(-tx, -ty);
                  origRect(x, y, w, h, c, a, g);
                  tctx.restore();
                  return;
                }
                origRect(x, y, w, h, c, a, g);
              },
            });

            bb = L.render(shiftedEnv);
            tctx.restore();
            if (sol.shiftedBB) bb = sol.shiftedBB;
            else if (bb) bb = scaleAndShiftBB(bb, px, py, sc, tx, ty);
          }
        }

        const bbForFront = bb || sol.shiftedBB || sol.bb || sol.mainBB;
        for (const d of decor) {
          const D = J.DECOR[d.id];
          if (D && D.layer === 'front') {
            try { D.draw(targetEnv, bbForFront, d); } catch (e) { console.warn(e); }
          }
        }
        return bbForFront;
      };

      if (J.avoidanceMaskActive && J.avoidanceMaskActive(circle)) {
        return J.drawCutMaskedAux(renderer, env, runCut, circle);
      }
      return runCut(env);
    } finally {
      cut.params = savedParams;
    }
  };
})();
