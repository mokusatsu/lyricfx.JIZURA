# AVOID-005 prototype checkpoint — rejected for completion

The parent requested a fresh sequential implementation context. No user permission is missing. Keep task005 active; do not start006, publish, commit or mark005 complete from this checkpoint.

Baseline: `3d8f52c7ce3f8efec25f5f0d7ad4c71bdb225173`, archive `/workspace/work/avoid005-before` frozen before edits. Exact current code, generated JA/EN and test hashes are in `checkpoint.json`; raw evidence is retained here. No comparison bundle or manifest exists.

## Current implementation

- `src/09b_basic_placement.js` adds experimental `basicLayouts:true` admission for exactly center,mixed,vcols,marquee,tile,scatter,wave,huge,labels,condensed,gloss,type,diag,circle,stack,pill. The architecture records maximal layout geometry, groups primary units, derives a conservative full-duration camera envelope per owner, then solves constant stage translations per region. This is too conservative for useful wave/labels/native broad phrases and is not the final005 architecture.
- `src/06_layouts.js` annotates marquee rows/gloss background/diag second band as named reviewed tiledAux; tile existing role remains. Wave trails remain primary and share glyph owners. Scatter extras remain separate primary owners. Main units use layout + mi. **vcols repeated symmetric columns currently share mi and collapse into one owner; stable ownership IDs need redesign.** No ruby syntax was found in base text layout; do not infer actual ruby acceptance from generic annotations.
- `src/09a_placement.js` records high-level circle/arc/rrect shapes, clips and gradient metadata. Replays ownership-specific offsets without changing order/blend. Only placementUnits opt-in admits argument-free single-rectangle clip; compound paths/arguments reject. Shape geometry is conservative bbox and needs independent affine/AA verification. Shared 1pixel measurement context is reused; no percut context allocation remains.
- `placementUnits` is now stripped at refinalization and excluded from plan signature; option-toggle regression still missing. Normal application/default generation and the004 option path retain their admission rules. No changes to earlier public artifacts/tools.

## Evidence and limits

- `stage-regression.log`: existing004 stage suite **118 checks pass**, including fixed004 baseline pixels, locks, immutable finalization/font revision, real-time recursion, independent glyph alpha raster. This is not the005 acceptance suite and its before archive is004's own baseline.
- `basic-test.log`: prototype matrix144 =16×landscape/square/portrait×upper/center/lower, native seed704 and actual native params, text「風の先へ」. Geometric envelope certificate88, insufficient56, unsupported0, runtime errors0. Five extra draw times per case are empirical regression checks; the geometric subset uses the full envelope and independent002 oracle. **88 is not a005 success count**: reading order, new overlaps and many acceptance cases are absent.
- Landscape center seed704: geometric safe only mixed/marquee/scatter/condensed/stack; all other11 insufficient. Full perID counts in `summary.json`.
- Native record/replay offset0:64/64 pixel identity (16×4 times). Five unsupported clip path cases explicitly reject. Circle eclipse shadow is intentionally unsupported but was not selected by seed704.
- Parent probe additionally verified gradient rect and singleRectClip zero-offset identity; compound paths rejected. Parent owns that probe evidence outside this folder.
- Required after-side emphasis/features/placement_stability tests have not run here. Parent already proved baseline emphasis/stability pass and features line24 failure because title adds a second active cut. Keep assertions unchanged. Known project_file initialcut failure belongs013; areaeffect withoutMedia failure belongs017.

## Parent findings

- R05-01: only four circle-bbox carrier rectangles is forbidden. `solveBasic` adds polygon-circle / angular / corner candidates, but final useful trajectories still require redesign. Do not call exhausted bounded candidates a proof that no geometric solution exists.
- R05-02: named auxiliary roles added; no primary wave/scatter/vcols/condensed/stack exclusions. Unit ownership and attached ruby/annotations/plates still need exact testing.
- R05-03: no comparison pages generated yet; Japanese case-specific「見る箇所」「変化すべき所」「維持すべき所」and explicit unchanged control labels remain required.
- R05-04: native pill clip was restored and recorded.64 zero-offset identity cases include pill. Shifted pill gradient/clip, nonunit affine and actual shape pixel alpha bounds at scale0.1 remain unverified.
- R05-05: **open and blocks completion.** Units solved independently can overlap/invert reading order. Need whole-interval unit spacing/order constraints or ordered common route. placementUnits reset was fixed but not directly tested; shared context reuse implemented but additional lifetime/performance checks pending.
- R05-06: strict clip path guards and gradient resolver for rect/rrect/shape paints implemented. Five negative tests and64 zero-offset native tests pass. Nonfinite clip args, other geometric boundary inputs, shifted gradient behavior and affine AA remain pending; do not extend unsupported draw-program scope silently.

## Next architecture and proof obligations

A circle-aware continuous route operator was discussed, not implemented. Preserve native size/seed/timing/palette and native motion whenever possible. Use full revealed/overshoot-bounded owner dimensions, never currently visible subset dimensions, so type/alpha/growing plates do not change routes discontinuously. Owned text/plate/underline/annotation units must follow exactly the same transform; repeated auxiliary geometry stays original until018.

A fixed side of circle⊕unit bounds can give a curved profile, e.g. vertical clearance sqrt(max(0,R²−horizontalGap²)) + unitHalfHeight. A naive branch「if already clear use native」jumps near the vertical tangent: required shift tends to halfHeight then disappears when gap reachesR. Extend the selected route continuously into a guard outside the circle before joining the native path. Prove the universal inequality and stage containment over the whole interval, continuous joins, no jumps except contracted region switches, and ordered spacing across primary glyph/word units. If no feasible path exists at preserved size, diagnose honestly; don't clip, mask, shrink or silently fallback.

Full required tests still include all native variants, central four directions/up-down100seed, enter/hold/exit, long/multiline/annotation/ruby/suppression/explicit size, camera and ghosts with actual time, font revision/async/replan immutability, manual/locks/emphasis/OFF, independent geometric counterexamples and meaningful performance. Only after these are stable should immutable before/after native+UI PNGs, Japanese comparison/sample, marquee/wave/scatter/diag recording, manifest and raw-byte validator be produced. Parent handles review/commits/push/public verification.
