# Isolated cylinder and native band bridge — functional review checkpoint

Owner: mandated gpt-6.1-sol / medium; same isolated `/tmp/avoid009-cube-worktree-01` after preserved cube08 checkpoint. Parent approved the cylinder plan and separately approved the narrow isolated09a bridge. No main-tree edits, commits, push, public checks, visual/media inspection or security/proxy probes. No formal performance acceptance is claimed. Parent source/functional/intent review and integration remain pending.

## Transfer scope and dependency

- New `src/09o_layoutsD_cylinder.js` (09n is reserved for origami).
- ONLY cylinder registration block in `src/11p_layoutsD.js`: `cylinder-source.patch`, against `src__11p_layoutsD.js.before.gz` (cube08 preserved). Do not overwrite the full main11p file with this worktree copy.
- SEPARATE shared bridge `cylinder-band-bridge09a.patch`, against `src__09a_placement.js.bridge-before.gz` SHA256 `2c2767719f26a93f8aeaa1685ee008af10499c272b42825f7a9f9b1c9be3ca80`. Parent must review this separately; main owner rebases/integrates it. No C/B capabilities or other-D route were expanded.
- Tests: `dev/avoidance/layouts-d-cylinder-test.cjs`, `layouts-d-cylinder-parity.cjs`, `layouts-d-cylinder-band-bridge.cjs`.
- Scoped evidence here. No parent task documents were edited. Bandtrue declines explicitly if the family source is used without the new bridge; do not call that partial combination complete.

## Source and continuous geometry

All front lyric glyphs and EVERY native secondary-ring slot are primary. Full and partial repeated copies, separator slots, mirrored/dim back halves, optional gradient band and glass remain protected. Native ring count, native cnt, repeated source sequence, source font names, opposite ring directions, k, speed, rot0/seam and alpha clocks are retained. cnt is computed from ORIGINAL radius/font and never reduced by a radius candidate. Each front glyph carries its original mi and native-row transient phase through reflow. Source declarations are independently checked against cut.text, normalized cut.lineText+separator, expected slot count and actual recorded text/font/mi.

For front glyph local ink point (u,v): x=cx+R*sin(theta)+u*cos(theta), y=yrow−ek*R+v+ek*(R*cos(theta)−u*sin(theta)). Exact extrema of a*cos(theta)+b*sin(theta) are evaluated at endpoints and stationary angles over theta in [−acos(.03),acos(.03)]; this covers every real source phase modulo2pi whenever native cos(theta)>=.03. Each glyph is measured at its actual fixed CSS font/size.

Secondary centers range over x=cx+R*sin(theta), y=ringY−ekR+ekR*cos(theta). Native charFn has signed horizontal scale cos(theta), and rotation .8*atan2(−ek*sin(theta),1), whose magnitude is at most .8*atan(ek). Thus fixed local extents x/y have conservative continuous support rx=abs(x)+abs(y)*sin(maxAngle), ry=abs(x)*sin(maxAngle)+abs(y). These cover mirrored negative-cos halves and all phases, including visibility thresholds |cos|=.06; no sampled union is used. Every ring's entire source string remains in its source proof.

Glass top and bottom ellipse bounds, growing side segments, stroke/miter support and the band's FULL PRE-CLIP gradient rectangle are protected. Native clip never supplies a circle mask or geometry exemption. Camera/ghost support uses per-cut effect overrides and20 pixels of reserve for admitted render scales .1..4. Runtime checks actual recorded owner geometry against continuous envelopes, circle clearance and stage containment before certified replay.

## Composition and quality

The schedule tries native joint translation, then natural row wraps/pitch and physical drum-radius candidates with unchanged nominal fonts, before discrete independent main/ring font reductions. Original tilt remains unchanged. W/H, viewport, glyph horizontal scales and native orbital clocks are not replaced with an effect scale. Radius candidates preserve all native ring slots; they are rejected if measured adjacent-slot separation worsens the declared native/minimum gap. Primary ink stays within the original2.1-radian writing field (only explicitly measured original outline overhang is retained); vertical row inset and native/readable primary/secondary floors are enforced. Row pitch stays >=1.45*mainSize and ring pitch remains1.6*secondarySize. Explicit content/notation size forbids font reduction.

Dense cases truthfully remain insufficient-space with original source and zero offset. Current supported domain is cut/cut/still, no treatment/decor; native rings2/4/6, finite tilt .05.. .3 and speed magnitude<=1. A source ring unit longer than the native72-slot cap is explicitly unsupported, rather than claiming full secondary-unit coverage.

## Narrow shared band bridge

Admission requires literal registered/sealed D cylinder, bandtrue, main pass, no A/B/C flags, drawing, effectsOnly or decor. Only one74-point finite straight closed moveTo/lineTo/closePath polygon clip is admitted. It rejects changed matrix/ops, local operations, nesting, second move, missing move, commands after close, repeated close, arguments/Path2D and curved/complex commands. The clipped paint is restricted to primary owner cylinder.band, a positive fillRect with the native four-stop linear gradient at offsets0/.35/.55/1; clip/event/gradient root-world coordinates must agree exactly.

The measurement canvas rounds a setTransform copy of the live camera. Failed bridge02 explicitly recorded live root[0] `0.10130000265389683` versus measurement root[0] `0.10130000114440918` at scale.1. This was an actual unsupported replay failure, preserved in bridge02.json. The fix captures the original env.ctx camera root BEFORE resetting measurement, ONLY for the admitted cylinder-band main route, while keeping the separate rounded measurement root for geometric bounds/collector invariants. Clip/gradient local coordinates and exact nativeRoot are stored separately. Replay never resets the live camera CTM: it requires exact original-root identity, applies one inverse-root postcamera translation, recreates the linear gradient and74-point clip on that live shifted root, and paints the original rectangle. Other D/C/B routes retain their prior behavior.

## Final functional evidence

```
PYTHONDONTWRITEBYTECODE=1 python3 build.py
CYLINDER_REPORT=matrix03.json JIZURA_BROWSER=/usr/bin/chromium node dev/avoidance/layouts-d-cylinder-test.cjs
CYLINDER_BAND_ONLY=1 CYLINDER_REPORT=band04.json JIZURA_BROWSER=/usr/bin/chromium node dev/avoidance/layouts-d-cylinder-test.cjs
CYLINDER_REPORT=parity03.json JIZURA_BROWSER=/usr/bin/chromium node dev/avoidance/layouts-d-cylinder-parity.cjs
CYLINDER_REPORT=bridge03.json JIZURA_BROWSER=/usr/bin/chromium node dev/avoidance/layouts-d-cylinder-band-bridge.cjs
```

Evidence is frozen; re-execution uses a fresh report filename. matrix03 ran the pinned pre-bandOnly test version; band04 ran the final test version, with exactly the same frozen product sources.

- matrix03:151 cases,55 certified/95 insufficient/1 explicitly unsupported long80-character unit exceeding native72 cap; zero failures. Includes rings2/4/6, band/glass toggles, dir+/−, four aspects, Japanese/Latin/longline/named fonts, radius .02/.12/.2/.32/.45 and changing positions/regions. All bandtrue source variants stage after the bridge.
- band04:24 additional bandtrue actual-default-circle (.5,.42,.2) cases,11 certified/13 insufficient/0 unsupported; zero failures. Portrait Japanese/Latin rings2 certify unchanged native type; landscape Latin and several wide/portrait variants certify through retained-slot physical radius/wrap/type candidates. Square/dense cases remain explicit insufficient-space.
- Combined175 matrix cases:66 certified cuts,108 insufficient,1 supported-range exclusion.68 safe region segments,1231 certified envelopes,141035 actual safe polygons independently checked by Node circle/stage oracle; those counts exclude extra scale cases. No visual appearance claim follows from geometry checks.
- band04 extra cases: bandfalse AND bandtrue × scales .1/.5/2/4, all CERTIFIED, negative-dir portrait rings2 with ghost;45 observations each (15 clock boundaries ×3 passes), no errors. Ordinary unsupported parameter/treatment/decor checks decline staging; OFF/manual/locked/emphasis preserve input and decline staging; explicit contentScale .8/1/1.2 is preserved without font reductions.
- parity03:12 true-before OFF cases ×6 times match exact pixels including native bands/glass.108 bandfalse native-vs-D zero-offset probes (rings2/4/6, dir+/−, scale .5/1/2,6 times) match exact pixels. Ownership sentinel restores. OFF120-frame ×3 diagnostic repeats preserve both fitSize and advance-call counts (0 and36960 respectively, before/after); timings are informational only.
- bridge03:324 exact pixel pairs,108 zero-offset/216 nonzero. The reference uses ORIGINAL PREIMPLEMENTATION source drawn directly on an independently calculated inverse-shifted camera root, with no recorder/replay path. Covers rings2/4/6, zoom/dutch/pan roots, scale .1/1/2,4 clocks, offsets[0,0]/[13,−17]/[−21,9]. Each record verifies74 points, exact gradient coordinates and full preclip rectangle. Ordinary singular measurement stays unsupported; changed live camera root produces typed UNSUPPORTED_D_BAND_REPLAY. No arbitrary malformed-program/prototype/security fuzz was performed.

Invocation manifests and gzip snapshots in matrix03-pins, band04-pins and bridge03-pins include exact source/test/index/font bytes before execution. parity03-invocation.json includes source/font hashes and true-before source/HTML hashes. Full snapshots remain in this isolated worktree; a small review packet can reference the already-repository-owned font bytes by those hashes without duplicating all assets into main.

Shared API baseline: 09a2c276771 above,09kd5776c9ad249b83b2fb75065168de6e089622e28c28662fc31e13b46c0afbc5a,11za3abd1b35040a83861a5328797fc41f78f6730f2e8a72c4d95348491dbdec67f1. Only the separately scoped09a bridge changes that baseline.

Historical quick01/matrix01/matrix02 retain explicit unsupported band results from before bridge capability. bridge01/bridge02 are failed-root records, not passing runs. No history was overwritten or converted to success. Parent review, any shared integration/regression/performance work and separate intent review remain outstanding; this checkpoint is functional evidence, not whole AVOID-009 completion.
