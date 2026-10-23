const overlap = (a, b) =>Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
// Aligned lyric position for a w × h area: thirds, centre and margin-flush anchors, scored.
// Overlapping an obstacle is avoided whenever any candidate can; returns null when none can (the caller
// then falls back to searching free regions).
J.composeLyricArea = (cut, { w, h, obstacles = [], zone = null, fgCenter = null, fixedSize = false, minSize = null }) => {
  const rng = J.rng(J.h(J.placementSeed(cut), 889)), margin = .03, anchors = [1 / 3, .5, 2 / 3];
  if (!zone && !obstacles.length) zone = J.pickSoloZone(cut).zone;
  let best = null;
  // minSize: the smallest area this lyric may shrink to (keeps suppressed lyrics readable).
  for (const k of fixedSize ? [1] : [1, .86, .72, .6, .5, .4].filter(k => k === 1 || !minSize || w * k >= minSize.w && h * k >= minSize.h)) {
    const cw = Math.max(.04, w * k), ch = Math.max(.04, h * k);
    const xs = new Set([...anchors, cw / 2 + margin, 1 - cw / 2 - margin, ...(zone ? [zone.x + cw / 2, zone.x + zone.w / 2, zone.x + zone.w - cw / 2] : [])]);
    const ys = new Set([...anchors, .72, .28, ch / 2 + margin, 1 - ch / 2 - margin, ...(zone ? [zone.y + ch / 2, zone.y + zone.h / 2, zone.y + zone.h - ch / 2] : [])]);
    for (const cx of xs) for (const cy of ys) {
      const x = J.clamp(cx - cw / 2, cw >= 1 - 2 * margin ? (1 - cw) / 2 : margin, cw >= 1 - 2 * margin ? (1 - cw) / 2 : 1 - margin - cw);
      const y = J.clamp(cy - ch / 2, ch >= 1 - 2 * margin ? (1 - ch) / 2 : margin, ch >= 1 - 2 * margin ? (1 - ch) / 2 : 1 - margin - ch);
      const r = { x, y, w: cw, h: ch }, area = cw * ch, covered = obstacles.reduce((sum, b) => sum + overlap(r, b), 0) / area;
      let score = 6 * covered;
      if (zone) score += 2 * (1 - overlap(r, zone) / area);
      if (fgCenter) score -= .8 * Math.hypot(x + cw / 2 - fgCenter.x, y + ch / 2 - fgCenter.y);
      // Prefer the thirds grid; smaller areas cost a little.
      score += .25 * Math.min(...anchors.map(a => Math.abs(x + cw / 2 - a))) + .25 * Math.min(...[...anchors, .72, .28].map(a => Math.abs(y + ch / 2 - a)));
      score += (1 - k) * 1.6 + rng() * .35;
      const clear = covered <= 1e-9;
      if (!best || clear && !best.clear || clear === best.clear && score < best.score) best = { score, r, clear };
    }
  }
  if (obstacles.length && !best.clear) return null;
  return { ...best.r, angle: 0, lockAspect: true };
};
