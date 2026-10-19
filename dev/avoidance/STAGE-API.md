# AVOID-004 internal full-stage foundation

This API is staged verification infrastructure. Normal application generation does
not call it. AVOID-005–012 own broader layout/motion adapters; AVOID-018 owns auxiliary
masking. No final canvas circular erasure or auxiliary mask is implemented here.

## Final plan and fonts

Call `J.finalizePlacementPlan(finalComposedPlan, options)` only after composing final
media duration. It returns a detached deeply frozen plan; the input/project is not
changed. The same finalized plan, font revision and options return that plan again.
`options.cutIndices` restricts admission; `options.params[index]` supplies explicit
verification parameters. Both real layout planners receive original stage W/H.
Center/tile planners have no W/H-dependent random parameters, so their selected
semantic params (font, proportions, treatment, row pattern) are retained after that
full-stage planner invocation. This preserves details/favorite font choices.

`J.metrics.revision` increments on every metrics invalidation and FontFaceSet
`loadingdone`, including replacement fonts with identical advances. Fallback
measurements are usable only at their own revision. After font loading/replacement,
finalize again from a composed `J.plan` result. Render refuses old finalized plans
with `STALE_PLACEMENT_PLAN`; it never repairs or mutates them. Finalized objects are
frozen, so duration/compose changes must produce a new composed plan and new final
result. `J.finalizePlacementPlanAsync(plan, waitPromise, options)` rejects results
superseded by a newer request or any changed composition signature with
`STALE_FINALIZATION`.

Line locks are tracked outside normal plan JSON. Unknown/serialized lineage is
rejected with `SOURCE_PLAN_REQUIRED`; callers must replan from the original project.
This prevents a JSON clone from silently losing legacy locks. OFF, disabled auto
placement, manual/notation areas, locked lines and emphasis retain their exact
original cut values. The diagnostic marks their safety `not-evaluated`.

## Serializable trajectory and time

An admitted cut has `fullStagePlacement: true` and JSON-only
`placementTrajectory: {version:1, kind:'piecewise-stage-translation', revision,
segments, envelope, measurementSupported, safety}`. Each segment contains
`start,end,from,to,status,region`; stage offsets are pixels in original W/H.
Intervals use `[start,end)`. Current bounded adapters produce constant translations,
with intentional switches at region boundaries; smoother redesigned motion belongs
to later adapters. Missing intervals yield zero translation. No tiny area or clip
is used for this path. The saved project does not acquire a trajectory.

At frame entry `avoidanceRealTime` defaults to requested stage time. This value is
carried unchanged through ghost and transition recursion. Existing quantized/lagged
`t` and `lt` remain motion clocks. Ordered replay applies
`stageTranslation × camera/parentAffine × item × glyph` exactly once. The explicit
observation callback reports both clocks, final primary polygons, offsets, ownership
and frame safety. Measurement support and safety are separate fields.

## Adapter and ownership boundaries

- `J.placement.itemGeometry(item,parentAffine,env)` uses the renderer's font and
  center/middle baseline with actual TextMetrics. It includes item rotation/shear,
  parent affine, per-character transforms, negative scales and stroke. The current
  measured envelope adds one font-space pixel for metrics/grid rounding and a
  two-device-pixel grid/AA guard after transformation. Shapes use one device pixel.
  Independent actual Canvas alpha pixels test these envelopes at small scales. Nominal alpha
  is excluded only at the renderer’s <=0.002 cutoff: nominal 0.003 can round to
  an actual 8-bit alpha value of 1 and therefore must remain measured.
- `pieceGeometry(polygons,parentAffine)` is the future piece adapter boundary. It
  requires measured polygons, at least three finite vertices per polygon. Passing
  a piece function into `itemGeometry` is explicitly unsupported.
- `affine`, `inverse`, `multiply`, `point` define the parent transform boundary.
  Singular and overflowing transforms reject, rather than becoming an empty bbox.
- `record(renderer,env)` runs the actual layout/mainDraw/drawFx pipeline into one
  1×1 measurement context, producing ordered `item`, `rect` and `line` events.
  Direct unadapted Canvas painting, clip operations, filters and shape shadows are
  unsupported. It does not allocate a stage image per glyph or a role canvas.
- `replay(env,program,offset)` paints each event directly in its original order and
  blend against the existing destination. It does not batch all primary/auxiliary
  events into separate full-stage images. Existing cut opacity flattening,
  multiply/overlay and foreground/frontmost compositing stay in Renderer.
- `env.withDrawRole(role,owner,fn)` scopes `primary`, `tiledAux`, or
  `independentDecor` ownership with exception-safe restoration. Every unclassified
  lyric event defaults to primary. Owned plates use the owner's role. Real tile
  repetitions use `tiledAux`/`tile.repetitions`; tile's knock-out plate and primary
  lyric remain primary and translate together. Auxiliary events keep placement and
  painter order. They are not certified clear and receive no mask in 004.

## Certified scope and diagnostics

Admission is deliberately narrow: existing `center`/`tile`, cut/still/cut motion,
none/marker treatment, no decor/custom drawing, push/panL/panR/dutch camera and an
optional `wipe` transition. Other spatial transitions and per-cut effectStyle/FX
or global spatial post-FX are unsupported. Chroma/shake event envelopes are bounded
by the sum of nonnegative amplitudes; beat chroma uses its 0.9 upper bound.
Supported numeric inputs are finite; motionScale and fx.motion lie in [0,1],
contentScale is positive, chroma/ghost amplitudes and camera amount are nonnegative,
and camera direction magnitude is at most one. Values are diagnosed, never clamped
to manufacture a certificate. Emphasis/manual/OFF/locks retain the old path.

The interval envelope covers every supported camera time, its maximum scale,
bounded rotation, pan, chroma and shake; marker growth remains within its resting
plate. It is conservative and may report `insufficient-space` even when a broader
adapter could fit. Render scale is certified from 0.1 through 4; other scales raise
`UNSUPPORTED_RENDER_SCALE`. Ten extra stage pixels reserve device-edge coverage at
the minimum scale. Candidate checks use original stage pixels and
`max(2,0.005*min(W,H))` margin; touching is collision. Primary size is not shrunk.
`certifySegment` conservatively checks the entire linear translation sweep; the
regression includes safe endpoints with an unsafe middle.

Diagnostics distinguish `PRESERVED_LEGACY`, `UNSUPPORTED_ADAPTER`,
`UNSUPPORTED_PARAMETER_RANGE`, `UNSUPPORTED_POST_FX`, `UNSUPPORTED_MEASUREMENT`,
`STAGED_ADAPTER` with safe/insufficient-space status, and explicit geometry/draw
errors. Measurement failures restore the original cut completely. A frame cannot
replay an incomplete recorded program. There is no caught-exception safety pass.

The total frame budget, including ghost/transition recursion, is 4,096 events and
16,384 glyphs. The recorder shares one 1-pixel context for its lifetime;
`bufferStats()` exposes the actual allocation and ceiling. Existing renderer
buffers are reused as before; no new stage-sized role buffers are added. Performance
checks measure 100/100 and 1,000/1,000 cuts/regions with all benchmark cuts explicitly
admitted; results are evidence for this bounded scope, not arbitrary later adapters.

## Canvas state boundary

Recording and replay retain each event's line cap/join, miter limit, dash array and
dash offset. Line events explicitly use env.line's miter/butt choice and its exact
color/alpha/minimum-point early returns. The multi-point envelope includes the
inherited miter limit; dash is conservatively bounded by the full stroked path.
Nondefault font kerning, letter/word spacing, text rendering, stretch, caps, RTL
direction or explicit canvas language reject with `UNSUPPORTED_TEXT_STATE` at
record/geometry boundaries and during recording changes. Chromium may report empty
spacing on the real source context versus `0px` on the 1px measurement context;
only empty and zero CSS lengths are treated equivalent, never nonzero values.
The sample keeps its rendering canvas in the font-loaded iframe document and
blits a bitmap into the parent display canvas, preventing DOM adoption from
changing the rendering canvas's font ownership during playback.

## Frame-wide FX and time reach (final 004 admission)

A single pre-loop guard checks the entire plan: every cut must have no individual
effectStyle/effectFx; transitions must be none or wipe; wipe transDur must be finite
and in [0,0.6] (the renderer's zero duration falls back to 0.35). Only explicit
plan.style.glow=0 is admitted, since the renderer defaults missing glow to 0.6.
J.stepDur(plan.fx,plan.fps) must be finite, positive and at most one second. Any
unsupported value diagnoses every otherwise eligible cut as UNSUPPORTED_POST_FX.
This also covers a next/other cut whose frame-wide settings would affect a staged
previous cut. Retained group's effective exit must still be cut.

For each admitted cut the serialized evaluationRange is
[min(start,renderStart)-stepDur,
 max(end,displayEnd)+0.6+2*stepDur+1.6/24+0.06+0.01].
It covers root quantization, one previous-frame quantization, maximum ghost lag,
the permitted transition gap and resting-frame/rounding allowance. Foreground
recursion retains the same motion time; transition recursion disables further
transition recursion. Inserted/retained cuts are conservatively covered by the
minimum start and maximum end. Real avoidance lookup itself remains strict and
unquantized. A regression switches region at 3.7 seconds with one-second motion
steps and real seek 3.95; both current and recursively drawn previous ink are
checked against the independent circle oracle. Longer/unsupported transitions,
other-cut FX/style, missing glow and larger motion steps remain diagnosed.

## Historical AVOID-005 prototype checkpoint (superseded below)

The working tree contains an experimental `basicLayouts:true` option and
`owned-unit-translation` serializer in `09b_basic_placement.js`. Its sixteen basic
IDs are registered for development probes, but the parent rejected this prototype
as AVOID-005 completion: independent unit translations can create overlaps or
invert reading order, and whole-duration envelopes reject common native moving
layouts. No broader production/default coverage is certified by this registration.
The accepted004 API above remains the released foundation contract.

The exact prototype source hashes,144-case outcomes,64 zero-offset native replay
comparisons, unsupported clip tests and open proof obligations are in
`tasks/evidence/AVOID-005/prototype-01/`. Its88 circle-clear envelope cases are
geometric partial evidence, not88 accepted005 cases. Shapes/owned rectangle clips
and gradient reconstruction have zero-offset tests; moved gradient/clip and affine
shape antialiasing still need verification. No005 comparison bundle/public manifest
exists yet. Continue005 in a fresh sequential implementation context.


## AVOID-005 current implementation candidate

The rejected prototype history above remains evidence of the earlier limitations.
The current `basicLayouts:true` candidate implements all sixteen named adapters.
It remains opt-in; parent review/public comparison acceptance is still pending.
The complete per-ID ownership, proof and admission table is
[`adapter-contract.md`](../../tasks/evidence/AVOID-005/adapter-contract.md).

Serialized kinds are `owned-unit-translation`, `ordered-wave-route` and
`ordered-huge-route`. Static ownership uses maximum revealed glyph/shape geometry
with bounded camera motion. Wave uses separated ordered main-glyph cells and a
continuous circle-aware boundary operator, with distinct phase keys for trails.
Huge retains native glyph indices/font/gradient coordinates in row-major cells
and continuously maps original motion into bounded cell motion. Radial labels
can retain their full rotating annulus by translating the orbit center together.
Native clocks remain quantized/lagged t/lt/ltb; realTime alone selects regions.

Exactly four named repeated groups are tiledAux: tile.repetitions, marquee.rows,
gloss.background and diag.secondBand. Wave trails/scatter extras/column and stack
repetitions remain primary. labels.centerOrb is a non-lyric independent background
orb, follows the common orbit translation, and does not exempt center words.
Native oversized diag plates retain their original canvas cropping; no new tiny
clip is introduced. Actual `cut.note` (pipe ruby/note) follows its layout's owner.

Refinalization with changed options rebuilds from composed source fields, including
automatic area/params, and clears all derived flags before rejection. Suppressed
text whose intrinsic scale was represented by an automatic area restores that
intrinsic scale when the basic opt-in removes the area. WeakMap provenance tracks
the actual normalization; explicit contentScale edits clear it. Legacy default
rendering and JSON remain unchanged.

Bounded LRU caches hold detached frozen preparation values (2048 entries/64MiB
serialized size) and callback-free pure geometry solutions (8192 entries/8MiB).
Font revision invalidates both. Preparation keys include the full cut and native
composition/style/fx/stage/time context. Solver keys include exact polygons, circle,
stage, seed and fitBounds. Callback-constrained semantic solves bypass caching.
`preparationCacheStats()` and `solverCacheStats()` expose entries/hits/misses/bytes;
`clearPreparationCache()` clears both for differential/cold verification. No
additional glyph/stage canvas is allocated.

`insufficient-space` means this adapter's conservative geometry/candidate family
cannot certify the requested fixed-size case. In particular candidate exhaustion
is not a claim that all possible ink interlocking is impossible. Eclipse blur and
unsupported motion/draw states remain explicit unsupported diagnostics.
Native matrix and pixel tests deliberately retain unsuccessful conditions as
reported outcomes; a registered ID alone does not imply every variant fits.
