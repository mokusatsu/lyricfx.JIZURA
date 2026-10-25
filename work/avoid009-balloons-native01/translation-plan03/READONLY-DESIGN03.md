# Balloons: next continuous native-translation diagnostic — READONLY design

Status: design only; no helper/adapter/metric/browser implementation or execution.
Native02 fidelity accepted and two sources integrated with exact offline JA/EN.
This document is not a continuous proof, fit result or source recipe approval.

## First diagnostic scope and honest outcomes

Start with one whole-cut circular-region constraint and one constant stage-space
translation shared by every source primary part and all original main/A/B copies.
Native size/font, row partition, phase, motion coefficients, source membership,
render clocks, alpha and painter order remain unchanged. A constant translation
preserves native displacements and velocities. Do not introduce a time-varying
placement path to manufacture clearance. Reuse existing reviewed camera support;
unknown/nonaffine camera or source effects remain typed unsupported. Do not infer
that the native catalog by itself certifies the camera, continuous ink or stage.

Use at most3 initial native cases (one bunch single row, one bunch multirow,
one free/Latin gaps) from the approved8 fixtures, with their original font/seed
and ghost settings. Keep motionScale.5 represented by the bunch portrait case
if selecting it; do not erase it to avoid FX fidelity. Each result distinguishes
certified translation, conservative insufficient envelope, unsupported source,
and budget exhausted/inconclusive. A finite unsuccessful candidate search is
never proof that the source layout cannot fit. No safe-adapter count changes.

## Font CSS bins and finite measurement budget

The source nominal size is N*(.3+.7*outBack(e,2.2)), e in(0,1], with maximum
1.1078356481481482*N at e=13/24 and held size N. J.fontCSS uses nominal size
.toFixed(2). Gloss uses THE SAME nominal size/CSS string as its source rim/body;
its .93 is a Canvas glyph scale AFTER font assignment. Never measure nominal*.93
as if it were the actual gloss font. Preserve the original live clip callback;
a complete un-clipped .93-scaled glyph support is a conservative diagnostic.

Preflight the unique (actual resolved face/fontCSS string, scalar character)
keys for all reachable rounded CSS bins over [.3N,1.1078356481481482N], including
a one-bin numerical guard at each end. Resolve composite/per-language faces
exactly via original fontForChar/faceOf and frozen eight-font snapshot. Measure
actualBoundingBox L/R/ascent/descent at center/middle for every key, not only max
size. No monotonic-font-size assumption, metrics interpolation or proportional
outline scaling is permitted. Held e=1 may reuse its exact existing bin.

Proposed first gate caps:150000 unique measureText keys per cut,300000 total,
45s metric work per cut;4096 interval cells per cut, max depth16,1024 deterministic
translation candidates. Preflight counts must be written before metric work.
If a cap cannot cover every key/cell, return budget-exhausted/inconclusive with
remaining counts; never turn partial enumeration into a bound. These are finite
experiment limits, not performance acceptance. Reuse keys across rim/body/gloss
and copies. Keep per-bin four-Float64 metrics in RAM (150k=>4.8MB); write only
small counts/domain/extrema/digest/provenance receipts, not full metric archives.
No dependency/font/runtime/HTML copies or installs. Exact source/font/runtime/
metric state and .5/1/2 output-scale raster policy must be pinned before process.

For each time cell take the union over ALL CSS bins reachable within its nominal
size range, then add exact nominal-dependent source stroke envelopes. Rim/body
stroke is .13/.065 of nominal, respectively. Gloss transforms the same raw-font
ink by .93 and its screen-axis (-.02sz,-.03sz) item offset before source rotation;
that offset must not be rotated as a balloon-local attachment. Keep one font-space
pixel and the existing reviewed two-device-pixel guard, converted conservatively
for minimum supported output scale. No duplicate AA waiver, no alpha-based ink
shrinkage, no finite native-frame sample substituted for a continuous certificate.

## Cell boundaries and geometry

Seal original source selectors and real render-clock construction first:
renderer quantizes tq, tp=max(0,tq-passLag), activeCuts(tp), lt=tp-start,
ltb=lt+passLag, original outDur/stagger and original motionScale-effective FX.
Main body alone takes integer-mi delay and source mainDraw lifetime; strings,
knots/rim/gloss/highlight have distinct e/ghost/alpha membership. Common anchor
has its own tin(env,.2,.3) and main-only paint. Do not use raw replay JSON as an
executable program or silently make main-visible membership global across parts.

Partition at source e=0/e=1, growth maximum, pOut=0/1, body delay/active selector,
alpha threshold crossings where relevant, free endpoint min-branch switching,
region start/end and copy birth/expiry. Use reviewed Float64 endpoint/neighbor
classification for branch cuts; never waive a mixed cell via midpoint sampling.
CSS-bin changes can be covered by exhaustive within-cell metric union rather
than thousands of time roots. Ordinary continuous trigonometric extrema have
analytic sin/cos interval bounds; combine with conservative interval polynomial
entry/fly/growth bounds and actual source coefficient order. Tighten only with
sound interval subdivisions and recorded numerical outward slack. Point samples
can diagnose overbounds but cannot certify the gap between them.

Use separately owned hulls: each rim/body/gloss glyph, highlight circle, triangle
knot, every one of10 string segments and all joins, and common anchor. For line
stroke preserve original butt caps/miter joins and captured native miterLimit;
a conservative join disc of halfWidth*max(1,miterLimit) is allowed diagnostically.
Never drop a string endpoint or replace all owners by one scene hull. Propagate
actual camera/root matrix bounds once. Check stage inequalities plus circle
distance to EVERY owner/copy support. A too-wide curve hull gives conservative
insufficiency, not physical impossibility. Keep finite-distance/numerical slack.

## Stage, entry, exit and region tails

Ordinary bob/rotation/string wiggle/growth stays strict stage-contained. Native
entry is upward from lower y, but not automatically monotone: bob can reverse
local velocity; strings/free endpoint and stationary bunch anchor have separate
trajectories. A BOTTOM entry exception requires per-owner continuous source
crossing/inward condition and reviewed allowance; cannot borrow another glyph's
waiver. Common anchor may not inherit an entry waiver. Free ey=min(1.05H,by+.3H)
can remain below BOTTOM even at held phase: then translation must fix it or the
diagnostic reports insufficient. Do not excuse permanent stage crossing as entry.

Native exit is upward via fly=inCubic(pOut)*.9H, with glyph-specific seed factor;
free ey has its own min branch. TOP egress/fully-TOP-exited support needs a
separate parent-reviewed per-owner condition, accounting for bob/rot/wiggle and
source alpha. Any cell straddling strict/egress/fully-exited remains conservative
until split. Body has no source out multiplier and can survive when rim/gloss/
strings fade. Preserve exact main/A/B activeCuts/expiry, including nonaligned
main/ghost own clocks. No earlier expiry, velocity damping or source clipping.

A region ending or offset0 tail is a separate proof obligation. If dropping a
constant translation to0 could reveal still-live ink in the circle or jump a
visible owner, do not adopt it. Keep translation over that owner's full original
visible life when policy permits, or return unsupported for that region schedule.
Exact native offset0 tail may be accepted only after EVERY live source copy/part
is expired or continuously proven fully outside the relevant stage/circle under
its own original lifetime. No generic stationary-q1 rule copied from blocks.

## Translation search and later alternative gate

Intersect owner/copy/time-cell stage constraints to bound a constant-offset domain.
Test deterministic stage extremes/center/cardinal/tangent-derived candidates
within that domain against each owner's continuous circle-distance certificate.
Every adopted candidate must pass all cells; report the worst clearance and
responsible owner/copy/cell. Exhausted candidates or negative conservative bounds
remain insufficient/inconclusive. Do not tune font/shape/speed to pass.

Only if native translation is diagnostically insufficient, ask a SEPARATE source
gate for constant rest-position changes: original row/glyph rest anchors and a
coherent bunch anchor. Bunch math with constant glyph shift dg and anchor shift da
changes endpoint by de=(.06dg.x+.94da.x, da.y): its y is gy-fly,
not an interpolation of glyph and anchor y. Each string vertex changes by
(1-f)*dg+f*de, preserving velocity if nativeSize/rot/fly/seed/time stay native. Neck/triangle/highlight/gloss follow their original owner shift. This is
an algebraic candidate only, not implemented or authorized. For free ey, moving
rest y can change min branch membership/velocity; freeze the original min result
then add a constant shift only under a separately reviewed source recipe, or mark
that family unsupported. No row refit, new RNG, string shortening or glyph resize.
