# AVOID-006 native adapter contract

This is implementation and automated evidence, not human behavior acceptance. The application default remains legacy. AVOID-006 admits the 26 `layoutsA26` IDs through explicit `J.finalizePlacementPlan(plan,{layoutsA:true})`; `{basicLayouts:true,layoutsA:true}` also admits the existing basic16. `basicLayouts` retains its original sixteen-ID API. `arcTop` and `spiral` belong to011 and are not admitted here.

## Ownership and preserved composition

The adjacent machine-readable [inventory](../../../dev/avoidance/layouts-a-inventory.json) lists every ID, current source line/hash, primary, owned plates, actual note path, explicit tiled auxiliary, independent decoration and temporal proof. Every unclassified lyric event is primary. One owner `<id>.composition` translates all primary glyphs, copied phrases, frames, meaningful labels and attached notes jointly. Native font, size, glyph order, relative geometry, paint order, seed, clocks, opacity and reveal timing remain native. No font scaling, whole-effect scaling, new primary mask, new product clip or video mask implements avoidance.

Only justified filler rows, ticker's scrolling repeated band (including its plate), and edgeFrame's four perimeter repeated rows are tiledAux. Their native placement, clipping and motion are unchanged for018. EdgeFrame corner/outline marks are independent decor. SplitScreen's inversion field and subtitleBar's picture/letterbox/camera UI are independent decor; actual subtitle and huge lyric copy remain primary. lowerThird is the only A26 registry entry declaring supportsNote; `label:'copy'` consumes supplied `cut.note`. dropCap's existing fallback altCopy may consume an already-present note, but this does not invent note support for other IDs.

SplitScreen retains both original complement clips in world coordinates with its stationary inversion field. Text moves through those clips and retains the original correct light/dark half colors. Owned bubble/panel/reflection clips move with their owner. SubtitleBar `place:'bar'` restricts joint vertical displacement to zero, preserving its stationary bottom contrast field; `place:'band'` owns and moves its local band. Focused tests cover both light/dark palettes, actual opaque glyph colors and actual before collision/after clearance.

## Full-interval certificate

`src/09c_layoutsA_placement.js` prepares the real native event program at complete reveal, with native source hooks expressing skipped branches and motion bounds. This is not a sample-only safety claim. Each measured primitive supplies convex conservative ink geometry. Original owned clips intersect ink conservatively with one-device-pixel clip-AA expansion. World-fixed complementary clips do not truncate the planning ink. Item AA includes the existing one-font-pixel guard and two device pixels. Shape guard is one device pixel. Raw Canvas fastRow text has its own actual measured font/spacing/align/baseline and device-space guard. Numeric live labels derive maximum digit advance/ink over0–9 and the maximum interval digit count, rather than assuming the prepared digits persist.

Native analytic sweeps are taken before the same camera/contentScale transforms as the recorded program. `cameraEnvelope` covers full camera, chroma/shake and minimum-render-scale AA reserves (20 text/10 shape stage units at scale.1). Native rotation extrema are evaluated analytically for every corner over the angle interval; scale endpoints and sine/cosine stationary angles define its convex hull. Filmstrip uses a correlated rotated displacement vector and its endpoint hull, not independent arbitrary x/y motion. For each region the pure geometry solver tests all envelopes against circle plus contractual margin `max(2,.005*min(W,H))`, and stage fit bounds. It returns a shared constant translation over that region, or an explicit insufficient-space result. Region selection uses realTime; native t/lt/ltb remain unchanged.

At playback every actual primary convex primitive must be wholly inside ONE stored convex envelope. Checking vertices across an arbitrary union is insufficient and is not used. Actual-time circle checks and observation geometry supplement this guard. An escaped certified primitive throws `ENVELOPE_VIOLATION`; it is never silently reclassified as unsupported. Accepted render scales are exactly.1 through4. Below/above this range rendering reports `UNSUPPORTED_RENDER_SCALE`.

### Source temporal bounds

- lowerThird: labels translate horizontally by at most twice the bounded small size. Retracting bar traversal includes the square marker halfsize `th*1.3` on both axes. A thin full bar alone does not contain the square.
- corners/staircase/zigzag/gridCells/frameBox/genkou: full polylines/frame/grid contain all partial reveals; glyph positions remain joint. Grid cell outBack1.6 overshoot is `4s^3/(27(s+1)^2)<.09`; cell<=.3U gives half-cell excess<.014U, conservatively reserved.018U.
- dropCap/justified: glyph and metadata anchors are static; full rules/mark bands bound reveal. Filler is explicitly tiledAux.
- bubble/chat: outBack maximum is below1.11, including native tail/center pivot. Bubble angular sweep is at most3.33 times abs(tilt). Thought bubble quadratics lie in their recorded control-point hull. Chat includes the complete initial-to-rest lift due to every later message, plus.012U typing-dot oscillation.
- subtitleBar: explicit source metadata tags the huge copy and bounds its x drift over the complete evaluation range, including long text whose native size is small. No size-based ownership/motion heuristic is used. Fixed-bar lyric dy is constrained to zero.
- ticker: complete LIVE pop reserve.01U; live numeric ink is bounded as above. Scrolling repeated copy retains native clip/placement.
- splitScreen: full primary copies stay joint; the original complementary world-fixed clips retain correct inversion colors.
- mirror: all nine reflected strip owners/clips remain joint. Ripple is prepared at neutral dx=0; full amplitude<=.035size<=.0077U is reserved by.008U. The complete moving horizon includes endpoint dot radius.005U, not merely its centerline.
- sideways: secondary slide magnitude<=.03U. Native90degree transform remains unchanged.
- edgeFrame: central primary moves jointly; its perimeter repeats and stage decor remain native.
- perspective: q=r^(j+phase) stays in[0,1], so copy centers lie between the full front and vanishing point. Shear<=14degrees gives x reserve `tan(14deg)*maxAbsFrontLocalY+4px`. Explicit copy metadata excludes unrelated events from this derivation.
- hanko: seal scale in[.94,1.55], shake<=.012S, rotation around the source seal pivot. All seal glyphs/erosion/frame stay joint.
- panels: each partial reveal is a convex subset of the full source panel and native owned clip. Acute native wedge joins exceed the Canvas miterLimit and are bevelled; recorder uses the actual miter/bevel ratio. Tone pattern is unsupported.
- filmstrip: along displacement<=2.4A plus maximum interval drift `.03U*abs(ltb-dur/2)`; native tilt rotates the same vector. Empty-slot countdown and all lyric slots remain primary.
- quote: copied quote marks fly at most.35U horizontally and.21U vertically; all marks, attribution and leader remain joint.
- ruler: moving heads stay along the full dimension line expanded by.8smallSize; all labels use the live numeric bound where applicable.
- searchBar: full control and suggestion plate/line geometry contain all reveals; native typing only hides glyphs at fixed positions. Suggestion count is bounded before construction.
- notification: complete vertical entry displacement<=2*(target+cardHeight+30). Card, app/title/time/icon/stack remain primary.
- ticket: outBack1.2 overshoot<.053 bounds main y delta[-.04H,.7H]. Main rotation<=10+abs(tilt)/2; stub additionally12degrees and displacement norm hypot(.12tw,.2th). Main/stub plates and all serial/gate metadata remain primary.

## Visibility and honest failure

The conservative joint family can be insufficient even when another hypothetical rearrangement might fit. `insufficient-space` describes this bounded family, not a geometric impossibility theorem. Native default-radius dense full-stage compositions often report this result. All26 have a genuine admitted native anchor; the anchors file distinguishes meaningful moved cases from conservative small-corner cases. Nonzero movement by itself is not evidence that a before-circle conflict was resolved: raster before/after results record that distinction.

Filmstrip, notification, ticket and quote retain their source's natural entry/exit crop. Their fit policy uses camera/contentScale-transformed full held primary geometry, including meaningful labels/plates. Filmstrip alone permits its native full strip band/edge-code repetitions to crop; all held lyric/countdown ink remains inside stage. Tilted film may use both native crop axes; a vertical/horizontal entry uses its actual source axis. No held meaningful text is discarded by clipping fit bounds to the stage. A held envelope too large for the stage is insufficient-space. All full animated sweeps still participate in circle clearance, even during native crop.

Unknown draw states, unsupported treatment, malformed/nonfinite/resource-excess parameters, arbitrary Canvas paths/filters/patterns and the panel tone effect have explicit unsupported diagnostics. They are not safe successes. Source default matrix rows have no unsupported results in the final494-row run.

## Admitted domains and recorder limits

The adapter validates before native renderer allocation. Parameter arrays<=64, strings/text/note<=4096 code points, recorder glyph budget16,384 and existing event/polygon ceilings apply. Source native ranges include justified dens.062–.078; search suggestions integer1–4; subtitle bar.1–.13 and drift±1; film dir±1/tilt±3; perspective speed.25–.45, copies1–16, vx±1, floor/side; grid gap0–.16; lowerThird lift0–.04; zigzag amplitude.24–.34 and phase±1; genkou pad2–4; panels slant5–11 and exactly3widths.8–1.25; corners ratio.76–1; staircase shrink.82–.9; bubble offset±.05/tail±1/tilt±3; ticker speed.8–1.3; split tilt12–22/side±1; mirror strength.34–.5/squash>0–1; edge abs speed.6–1.2; hanko rotation±7; ticket integer serial1–999999/tilt±5. Treatment must be none. Additional raw native Canvas states remain restricted to the declared recorder subset.

Recorder extension is scoped to A26. Finite closed single polygon fills/clips, native fastRow text, and highlevel thought blob control-point hulls are supported. Mixed rect/polygon paths, transform changes during path construction, unclosed fills, nonfinite/unsupported text states and unknown replay events reject. Native transform command history is replayed for A26, preserving Canvas edge raster rounding exactly. Other adapters retain their drawing/replay behavior and default path; recorder metadata additions do not establish byte-identical serialized event programs. Refinalization clears stale trajectories/flags before any rejection; finite-option caching prevents Infinity/null JSON aliasing; actual font revision invalidates preparation. Standalone layoutsA opt-in restores intrinsic suppression scale for automatic areas, preserving explicit1/.85 values.

## Reproduction and evidence

The frozen compiled JA SHA256 is `38b8edf31aaecaa667e1e0248ccc5fa3bbf68380333f819683fdfb6494f3ebe4`; EN is `9fe491dc1bf791b8567fa8e088ba4e705d78de04556c9439891e1ec51c5e9cb5`. The fixture and all test hashes are recorded in `final-candidate/functional-summary.json`.

The focused low-scale reproducer in `native-scale-reproducer/` preserves before/after outcomes: lowerThird .1 at.07/3.93 and mirror .1 at.31/3.93 previously escaped. Complete marker/dot traversal and neutral ripple origin fix the source-derived missing geometry, rather than enlarging AA arbitrarily. The corrected48-case reproducer passes; final scale test additionally checks832actual frames/15,156 polygons over all26 and scales.1,.5,2,4. Parent independently checks624actual frames and exact126 native/basic PNG comparisons.

`final-candidate/layouts-a-test.log` contains494 conditions (26 anchors plus26×3aspects×6circle positions including contractual.5/.42/.2), actual-time polygon checks,26 native/after primary raster audits (including.1 scale), and104 exact native zero-offset replay PNG comparisons. `layouts-a-acceptance.log` contains targeted lifecycle/cache/suppression/recorder/owned-plate corruption tests and69native variants. `layouts-a-contrast.log` contains light/dark fixed-field checks. The sibling basic/stage/Stack logs retain old assertions. Automated evidence does not replace public raw-asset validation or human H01–H03 acceptance.

The later opt-in adaptive revision is specified separately in
[adaptive-revision/adapter-contract.md](adaptive-revision/adapter-contract.md).
This original joint-native proof remains the baseline; the adaptive revision
preserves existing joint-safe segments and adds explicit native-source recipes
and event-specific entrance/exit relaxation for eight previously unapproved cases.
