# AVOID-007 incremental motion code review

2026-10-22 UTC. Auxiliary read-only mathematics/code comparison for the parent, using `motion-bound-advisory.md`'s immutable e96cbb2 derivations. No product/test edits, test execution, browser/image inspection, network or Git operations were performed in this additional review. The source was copied once to temporary immutable read snapshots; this document is the only repository file written. No acceptance or successful full-time verification is asserted.

## Identity and freshness

Primary source snapshots, SHA-256:

| Source | Reviewed snapshot SHA-256 |
|---|---|
| src/09e_layoutsB_placement.js | 65ad2cf630d27d9b5f68970e9f9e24d83a04c1d0da68cc2dca48b62757cbc169 |
| src/11p_layoutsB.js | 072c8b98cabe007a7b2b661f6eaec89bde2896c58da929233dedde807e841e6d |

All line references to those two files below refer to these snapshots, not a mutable current file. At the closing read/hash check, the source had already changed:

| Source | Closing working-source SHA-256 |
|---|---|
| src/09e_layoutsB_placement.js | ca2a328c833fa9a4b70704cc05b21356c91703ba976cdfae43c22e5f13957565 |
| src/11p_layoutsB.js | e558147f6dd0974dabb6d04f22e4fdbea5eda48aa7bcd3fd4473587c45d212c8 |

**The closing/current implementation is unverified by this review.** These findings apply only to the reviewed snapshots; the implementer was informed of the stale hashes. No extra adaptive snapshot/review was silently substituted.

Supporting files read, with closing SHA-256 (their earlier read bytes were not independently pre-pinned):

* `03_text.js`: 52963f5f4643711e55d428e95ded297b83fd503deed6ca3604ee165a190bb56c.
* `09a_placement.js`: 125dccdd6b4198cf2661a4446f670e942ef3775b63dce3c3a7e9d2434baac0c1.
* `09b_basic_placement.js`: e971a85d5304683fec040bcb23641be5c02a95922e679c8efb4bf2edb7f58aa8.
* `09c_layoutsA_placement.js`: ff603fe43f54296865ae59ab1268c581cbfbbf7a489d02aafbfda83221b03c36.
* `02_fonts.js`: 3e687cfd1045349f36eb65f4fa802973ad4303f48b21069cf6dcc68a546c0415.

## Result and limits

In the reviewed snapshots, no new definite source-motion underbound was identified in hanging's suspension/rail proof or bounceLine's profile/line/shadow proof. Rain's maximum-size-only lead bound had already been replaced by a min/max-size union, and its pool/trail construction admits a source-specific proof because vertical advances are fixed. These are mathematical/code observations, not test outcomes. Font-size interpolation/raster guard assumptions, source mapping beyond observed event sets, full shared camera/FX semantics, stage overflow policy and final receipt/source identity remain separate review obligations.

The six-family advisory applies to elastic/equalizer too, but this reviewed 09e snapshot has no corresponding interval adapter: :90–91 explicitly throws `B_INTERVAL_ADAPTER_PENDING` for those IDs. Their native source blocks existing in B does not mean they were certified here. Their pending status is honest in this snapshot. Curtain/slate is outside this review as requested. Bubbles was not re-reviewed here.

## hanging: geometry, clocks and ownership

Reviewed implementation: 09e:64–74, :113, :122, :138, :147; B:215–282.

* Angle bound at 09e:66 is `(amp+kick)*abs(dk*ampK)*angleScale` in degrees. Guard :138 restricts amp/kick to positive native ranges, so the sum is a conservative absolute bound on both the persistent sinusoid and decaying kick. It does not incorrectly discard kick after an arbitrary settling time. `layoutsASweep` receives a symmetric interval, so native orientation sign does not cause a missing sweep side.
* Rope envelope :67 includes radial lengths from 0 to 1.05L, rather than only settled .95L..1.05L. This covers grow during `ta-.3<lt<ta`. Tag/glyph envelopes :70–71 use .95L..1.05L; their actual draw availability is tau>=0 at B:270, where grow is already1. Thus these narrower radial bounds do not omit a visible growing tag/glyph.
* Native `bounce=1+.05exp(-tau/.18)cos(30tau)` for tau>0 stays in [.95,1.05]; the source includes the residual at all positive tau. Scale overshoot of the tag is included by exact `B(1.4)=1+4*1.4^3/[27*(1+1.4)^2]` at :65/:70. Multiplying by outK only shrinks that supported tag scale. Hole offset/radius are included in hy/hx; glyph separately includes its .06tagH radial offset. The glyph is not incorrectly forced to share the tag's pop scale.
* Native tag transform rotates the tag and its center vector consistently by -th; a symmetric ±angle sweep of the unswung rectangle is conservative. Font-origin offsets are retained by using actual glyphBox x0/y0/x1/y1 at :71. Exact sine/cosine extrema in the shared sweep, followed by its final bounding rectangle, cover intervening arc points; this is not a convex hull of sampled angles alone.
* Pin circles at each suspension anchor are included at :68; strings and the global rail are primary. Rope ±strokeW is at least the source rope half-stroke. Rail y padding ±strokeW is also at least the separate rail half-width for all positive M: max(1,.0016M)>=.5max(1.2,.0022M). The extra camera/AA reserve is separate.
* Native railSpan=.52W at B:223 creates endpoints -.02W and1.02W after full reveal. 09e:73 retains those full extents for collision checking. It does not clip the rail away from the protected circle. `fitBounds` :147 relaxes only rail-derived horizontal stage-fit bounds; the full collision envelopes still go to solveBasic. This preserves a source-native screen-edge overflow instead of pretending rail fits inside [0,W]. The parent must retain an explicit distinction between permitted native overflow and newly lost owned content after translation; this review does not independently approve a general overflow policy.
* Reflow uses full W/H, changes row anchors/railSpan/sp/size and an explicitly declared .65 angular amplitude at :122/B:254. Native global i, ta, w, dk and ampK are retained via `suspensionIdentity`; sourceMapping :113 compares those values. Keeping the original w/dk despite a new rope length is an intentional clock/phase-preserving recipe, not the physics of a newly planned native rope. The parent should judge that amplitude/path recipe on its declared intent; `sourceClocksUnchanged` does not mean all original geometry/amplitudes are unchanged.
* Source snapshot uses tau=2 and grow=1 only in `placementEnvelope` mode (B:249,257), ensuring every future glyph/tag/rope can be enumerated. The analytic bounds, not that forced source time, supply the all-time geometry.

There is no safe-hold relaxation in this reviewed 09e code: all primary envelopes go through strict circle clearance, and accepted segments are `safe`, not `safe-hold`. This avoids incorrectly relaxing stationary rail/pins, fading tags or ongoing hold sway. A later relaxation implementation would need independent review of every event's phase.

## rain: full pool, falling origin and stationary fade

Reviewed implementation: 09e:44–53, :114, :125, :147; B:131–193.

* Final main glyphs are separately bounded at 09e:47. Delivery lead and full trail get additional envelopes; the grid alone is tiledAux at B:145, with primary restored at :166. No delivery copy is treated as auxiliary.
* 09e:48 measures lead glyph at **both** min(ts,base.size) and max(ts,base.size), takes coordinate min/max together with zero, and adds a pixel. This addresses the parent's previously identified fact that an ink box at maximum size need not contain a smaller glyph's offset ink. The center quadratic lies between -2tsp and gy. Thus, **under the same font-size interpolation/metric-rounding assumptions discussed below**, independent center and local-ink products enclose the whole lead path.
* Trail origin uses min/max center and min/max half-size independently at :51. This is looser than solving the coupled cubic's interior root, but is mathematically conservative: if yh∈[lo,hi] and hs∈[smin,smax], then `yh-hs/2-8tsp` lies `[lo-smax/2-8tsp,hi-smin/2-8tsp]`. It covers both the moving u<1 interval and the **stationary fade** 1<=u<2, whose origin is gy-base.size/2-8tsp. The snapshot adds no fade-based relaxation.
* The repeated-character construction at :46 is source-specific rather than a generic arbitrary-string theorem. `poolOf` rejects `J.isLatin`, which is `/[A-Za-z0-9]/`; the KATA additions are also outside that class. `03_text.js:38–59` uses vAdv=size for every such pool codepoint. Consequently all eight top-aligned vertical slot centers are identical across all possible pool substitutions. The small-kana/punctuation/vertical-rotation adjustments depend only on the glyph in the current slot, not prior slots. Each mixed trail glyph in slot j therefore equals the local placement of that same character in slot j of its eight-repeated-character probe. Unioning **all pool characters' repeated eight-slot ink** bounds every mixed eight-slot trail. This proof would fail if future pool changes admit ASCII letters/digits with font-dependent vertical advance; guard the premise or replace it with per-slot prefix-advance interval bounds.
* Bounds for rf pool ink use the actual vertical=true, track=.12, align=left layout. They do not assume tsp itself equals an arbitrary font's ink height. Main and lead retain their source orientation and different fonts.
* `placementEnvelope` uses u=.5 at B:179 to enumerate all delivery groups even if native sourceRestTime is later. That does not itself bound all future pool substitutions; the explicit pool proof above is necessary. SourceMapping :114 retains pool/rank/span/fd/trailN/vertical; same text/order count keeps original i and random rank clocks after wrap. For vertical reflow, the recipe must preserve the original vertical delivery order, as this snapshot does through the orientation and unchanged glyph order.
* Rain stage-fit bounds use final main ink only at :125/:147 so above-screen falling/trailing delivery is not required to fit the stage before entry. Full delivery envelopes remain in collision clearance, so stage overflow allowance does not remove circle constraints. This is distinct from safe-hold relaxation.

Unclosed general font-size assumption: `J.fontCSS` rounds sizes with `px.toFixed(2)` and glyph ink is obtained through target-browser TextMetrics. Linear geometric scaling would make endpoint+zero union sufficient for every intermediate hs. This review did **not** establish a browser-independent theorem that all hinted/intermediate-size TextMetrics ink lies within the min/max-size union plus its extra one pixel, especially arbitrary user fonts. The shared itemGeometry already has font-space/device-pixel raster guards; whether those guards plus the extra pixel are adequate for the supported pinned font/browser domain needs the existing font/raster evidence or a stronger font-metric support bound. This is an explicit unverified premise, not a newly reproduced failing case. No numerical test was run here.

## bounceLine: all profiles and phase preservation

Reviewed implementation: 09e:55–63, :108, :139; B:537–594.

* Native profile yields h∈[0,1], sx∈[.94,1.2], sy∈[.76,1.08], for every real finite tau including startup/negative-remainder branches. Hop/tempo guards :139 restrict to the native positive domain. Source glyph center relative to q.y is `.5S-.5S*sy-h*S*hop`, therefore lies `[-.04S-S*hop,.12S]`. The envelope :57 uses exactly this independent interval.
* GlyphBox local x/y maxima are made symmetric about the item origin. Scaling those maxima by1.2/1.08, then adding cross-axis amounts times sin7°, conservatively covers all native sx/sy and all tilt signs in [-7°,7°]. Replacing |cos(theta)| by1 enlarges the bound. It does not rely on tilt being maximal at maximum hop, nor on font ink being centered.
* Shadow :58 uses center `(gx,gy+.56S)` and rx=.408S, ry=.0816S, containing radius `.34S*(1-.55h)*sx` under ctx.scale(1,.2). It covers the stationary-center shadow's hold squash as well as airborne shrink. No sign-dependent omission was identified.
* Baselines/dots :59–62 retain each reflowed row's glyph min/max width plus .35S each end and pad1.6lw at y=gy+.6S. This exceeds native line halfwidth and dot radius1.2lw. Full line bounds contain every partial reveal. Source mapping intentionally excludes baseline event cardinality changes at :108 because rows may change; the explicit per-row bound and source renderer are consequently required, not source mapping's observed shape-count equivalence alone.
* Reflow keeps the original gl ordering and original i for mi, wave gap/index, beat selection, seeded random hop period and parity tilt. g.li changes only row geometry and grouping; n stays the same. There is no per-row reset of global hop phases in the reviewed snapshot. The profile-bound proof does not depend on sampling beats, modulo boundaries or hop maxima.
* All hopping/squash/tilt, line/dot reveal and fading shadows remain strict. No generic .25-second start exception or fade-out exception appears in this snapshot.

## Common/inherited premises not independently certified here

The shared 09a eligibility gate admits cut enter/exit, still hold, supported cameras and no drawing/custom FX; 09e:141 further rejects all treatments except none. This matters: these family bounds are not proof for arbitrary mainDraw motion/treatments. `finite(cut.params)` and the family amplitude/tempo guards exist at 09e:138–142; imported nonnumeric enums may follow native fallbacks but must not inherit unproved semantic guarantees. Stage, camera, contentScale, render support and numeric magnitude constraints are inherited from the shared finalizer rather than newly proved here.

The shared `cameraEnvelope` and recording/replay route were read for context, but their full effectStyle/effectFx/camera/event/offset domains and composed affine covariance were not independently re-proved in this incremental family review. Runtime actual-envelope containment is useful falsification but cannot turn an unproved all-time envelope into a certificate. An early startup/midpoint record is also not a semantic proof of every possible future event. The forced source-envelope branches above and explicit shape formulas address specific omissions, not a universal source completeness theorem.

## Actual receipt read, without execution

Read `tasks/evidence/AVOID-007/hanging03.json`, SHA-256 `204b621986577d8cfc80fb3df16b2aa4dffb5342ef68f708c7dadc217fb88771`. It contains two rows:

| Actual spec | JSON segment status | JSON frames | JSON observations | envelopeCovered=false |
|---|---:|---:|---:|---:|
| hanging,1920×1080,center(.5,.42),r=.2 | safe | 24 | 24 | 0 |
| hanging,1920×1080,center(.5,.5),r=.2 | safe | 24 | 24 | 0 |

Both rows' diagnostics say `certified-bounded-adapter`. These are statements contained in an existing selected-condition receipt, not this reviewer's execution result. This review did not establish that the receipt ran against either reviewed source snapshot or the closing mutable source, did not review its full prelaunch pin, and did not infer all-time correctness from its 24 frames. No rain/bounce receipt counts are asserted. Earlier hanging01/02 were read as historical context and are not substituted for current evidence.

The parent and main implementation owner received the snapshot-qualified findings and the freshness limitation. Final acceptance and implementation repair remain with their owners.
