# AVOID-007 motion-bound advisory — six dynamic families

2026-10-22. Read-only mathematical/source review for the parent and implementation owner. This document is the only file written by this reviewer. No product edits, tests, image inspection, network operations or commits were performed. This is an advisory derivation, **not** acceptance, a verified implementation certificate, or a raster result.

## Sources and proof scope

The requested `work/avoid007-before/src/11p_layoutsB.js` was absent. Every B source line below refers to **`git show e96cbb2:src/11p_layoutsB.js`**, not the concurrently changing working source. Renderer, mainDraw and utility references likewise use that revision. Read `tasks/AVOID-007.md`, `dev/avoidance/contract.json`, `tasks/evidence/AVOID-007/design-review.md` and `parent-review.md`. There is no contract.json directly inside the 007 evidence directory; the dev contract is the applicable one.

The six native layout blocks have no layout-local clipping that can prove primary avoidance. Any ENTER/EXIT/treatment clip in mainDraw is a separate source clip and must retain its source semantics; adding an avoidance clip is not a solution. All lyric copies and their owned elements below remain primary. Only rain's previously approved background grid is tiledAux. Bubble motes and equalizer's unlettered thin bars are independent decorations; the letter-bearing bubbles/bars are protected. An unknown event cannot be reassigned to either exception.

These bounds cover native layout geometry **before** mainDraw's additional effects. A complete certificate must compose them with the certified ENTER/HOLD/EXIT, treatment, glyph/ruby/stroke/finite shadow, ghost and camera envelopes. A midpoint mainDraw recording with `placementEnvelope:true` bypasses the native enter/hold/exit pipeline (`06_layouts.js:17`, versus :23–56); it cannot by itself certify the layout motion derived here or the omitted pipeline. Unknown custom FX and unsupported numeric domains must produce an explicit unsupported result.

## Common clocks, geometry and domain

Let `l = env.lt`, `b = env.ltb`, `p = env.pOut`, `W,H` be the **original full stage** and `M=min(W,H)`. Intervals must be derived from actual evaluation/render support, including retained lyrics and pre-roll, not simply `[0,cut.dur]`.

* `09_render.js:99–106,187–220`: frame time is quantized to `tq`; each ghost pass has `tp=max(0,tq-lag)`, `l=tp-cut.start`, `b=l+lag`. Lag is 0, .8/24 or 1.6/24. The random step uses `tp`, while beatInfo is computed from `tq` (:174), so a ghost's beat phase is not in general the beat at `tp`. Region selection uses real time; motion classification uses each pass's own native clock. Include the quantization preimage and both sides of cut/region/beat boundaries when deriving intervals.
* `09_render.js:330–347`: `p` is clamped to [0,1]; with positive outDur it is `(l-(dur-outDur))/outDur`, otherwise zero. Retained render cuts may have adjusted lifecycle data; use the actual render cut. `pIn` can use pre-roll, whereas mainDraw's local entrance uses `l-delay`.
* `06_layouts.js:23–29`: actual delay is `(mi|0)*(cut.stagger||0)`. The helper `miAt=ta/max(.005,stagger||.04)` at B:31 does **not** preserve `ta` exactly: integer truncation and default/zero stagger matter. Record native `mi`, actual delay, and explicit layout availability separately. Row reflow must retain original global glyph index, seed and beat key.
* `09_render.js:247–251`: with center C=(W/2,H/2), the transform is translation to `C+(shake+ghostOff+camOffset)*motion`, then rotation, x-shear, scale `[cs*lerp(1,cam.sx,motion),cs*lerp(1,cam.sy,motion)]`, then translation by -C, with `cs=lerp(1,cam.s,motion)*contentScale`. Compose in that order, once. Translation of native geometry by d becomes **L(t)d** after camera linear map L(t), not generally a constant screen displacement. Camera blur (:228,260) needs separately proved finite alpha support or rejection.
* Finite W,H>0, finite time endpoints, nonempty finite font ink metrics, valid discrete enums, positive finite denominators and bounded recording counts are preconditions. Native `fits` counts are generator constraints, not runtime validation of imported/custom params. Empty text and spaces must follow source branching, not divide by n. Reject NaN/Infinity before J.clamp, which does not sanitize NaN (`01_util.js:7`).

To bound a transformed glyph, use its actual font ink hull K including variants and treatment. A safe simple bound for fixed-axis half-extents a,b, scales sx,sy and angle theta is `rx=|sx|*a*|cos(theta)|+|sy|*b*|sin(theta)|`, `ry=|sx|*a*|sin(theta)|+|sy|*b*|cos(theta)|`; preserve any font-origin offset as a rotated point, rather than assuming a centered glyph box. Interval trigonometric bounds or full circumscribed radius prove all angles; finitely many angle samples do not. All parameter products may be interval-bounded independently (looser but conservative). Split intervals at finite source branches to tighten them.

`env.line` explicitly uses miter joins and butt caps (`09_render.js:354–357`). For elastic bent polylines, centerline hull plus lw/2 alone is insufficient at joins; use recorded stroked-ink geometry or a bound using the actual finite miterLimit and cap state. Circle/arc/rect stroke extents and AA must be included. Stroke/AA inflation precedes the appropriate outer affine map; do not assume every stroke remains one screen pixel.

All-time certification can use interval hulls or analytic extremum isolation. A recorder's discrete time union is useful falsification evidence only. In every family below, full-interval bounds remain available even if no meaningful native safe-hold window exists.

## rain — B:90–168

Native plan domain: orient h/v; order ltr/random; speed [.85,1.25], density [.5,.72], tint sub/accent (:94–102). The latter three affect the exempt background grid; primary still depends on the actual font/rf, pool and size. Generator fits 1..16. Horizontal `mainLines(11,6)` and vertical `clean` produce different glyph sets/positions (:106–110). Freeze exact layout, rank/permutation and original indices in a delivery recipe.

Protected units are (1) each final mainDraw glyph, (2) the flying delivery lead, and (3) **all eight** delivery trail glyphs. Trail symbols are sampled from `poolOf(cut)` (:72–80), which includes own non-Latin, nonpunctuation characters plus alternating KATA. Every pool character's rf ink must be bounded, not just current/random final text. Variation of pool widths and vertical layout metrics must be accounted for.

Let B=base.size, T=ts=clamp(.32B,.8cell,1.5cell), d=1.12T, `fd=clamp(.1dur,.14,.26)`, `span=clamp(.2dur,.1,.5)`. For glyph i, `ta=.05+fd+rankFraction*span`; vertical rank is reversed and ignores the random order. Set `u=(l-(ta-fd))/fd` (:141–150).

* Primary delivery support is exactly `0<u<2` (:151). On `0<u<1`, `yh=-2d+(gy+2d)u²`, and lead size `hs=T+(B-T)u³`. On `1<=u<2`, `yh=gy`, `hs=B`; **there is no lead**, but the trail stays visible and fades (:152–160).
* Lead center x=gx and y=yh. Conservative center y range is the endpoint interval hull of -2d and gy; hs lies between T and B even if imported geometry changes their ordering. Bound glyph ink for the entire size interval, vertical orientation and actual font. A tighter corner polynomial has quadratic position plus cubic scale: include real derivative roots in [0,1], not just endpoints.
* Trail item's origin is `(gx, yh-hs/2-8d)` and uses fixed size T, vertical layout/track .12/align left (:158). Add a local hull of **every possible eight-position pool sequence**, using actual vertical glyph metrics/placement. A simpler safe construction unions per-slot worst-case local ink with the known slot layout rule; this needs a proof if pool metrics influence subsequent slot advances. Do not confuse the draw-item origin with glyph center.
* Trail-origin y on [0,1] is `-10d-T/2+(gy+2d)u²-(B-T)u³/2`. Besides endpoints, its only possible interior stationary point is `u=4(gy+2d)/(3(B-T))` when B!=T; include it if in (0,1). Adding glyph-local extrema gives the exact candidate polynomial extrema. On [1,2], origin is fixed `gy-B/2-8d`.
* Final mainDraw glyph remains at `(gx,gy)` with size B, but its delayed mainDraw pipeline continues independently (:162–164). `fl` only changes color, not visibility. A source snapshot before late `ta` cannot establish future event coverage.

Only the moving lead/trail **while 0<u<1** can be a source-native geometric entry relaxation candidate; endpoint is `l=ta`, not a global .5 second cutoff. The trail from ta to ta+fd is stationary fade and stays strict, as does the final glyph's stationary content. Background grid is unchanged and excluded only under the reviewed role, not because its code also calls env.draw. No layout-native geometric exit exists here; `outK` fades. Generic mainDraw motion must be classified by its own proved source event policy.

Short cuts can end before the last delivery or main entrance; retain original availability. For finite long tails, delivery ends but final glyphs remain; do not extend delivery relaxation to the whole cut. A reflow can alter final glyph positions, row widths and delivery lanes while keeping W,H, ranks, source pool, ta/fd and clocks; recompute the quadratic/cubic envelope per recipe.

## hanging — B:171–250

Native plan domain: shape arc/wave/random/stair, dir ±1, amp [.06,.11], kick [.16,.26], ph [0,6], tag/rail booleans (:176–177); generator fits 2..12. Native portrait split is two rows only for W<H,n>5 (:184). Slot spaces retain indices, spacing and ta but render no tag/string/glyph.

Every glyph/tag/hole/string/pin and the optional common rail is owned. Rail at `railY=.075H` spans `[W/2-.52W*inA,W/2+.52W*inA]` (:189–192), whose final x endpoints are -.02W and 1.02W. A stage-fit solver must handle that honest native extent; silently clipping or removing rail is not a proof. Native no-rail mode still has suspension origins at y=-2 (:189), not at the top lyric row.

Each anchor ax and equilibrium cy is fixed by :200–212. `L=max(.06H,cy-attach-railY)>0`; `w=TAU/(1.5sqrt(L/(.45H)))`. Let `aK` be 1 or .5, `tau=l-ta`, `ta=.12+i*gap`, `gap=clamp(.35dur/n,.03,.08)`.

The angle in radians is

`r = (sp/L)*aK*[amp*sin(w*b+phase) + 1_(tau>0)*kick*sign*exp(-tau/.7)*sin(1.3w*tau)]`.

Thus global `|r| <= (sp/L)*aK*(|amp|+|kick|)`; before tau=0 omit kick, after a positive lower bound tau0 use `|kick|exp(-tau0/.7)`. `bounce=1+.05exp(-tau/.18)cos(30tau)` for tau>0, else1, hence [.95,1.05]. Grow=`outCubic(clamp((l-(ta-.3))/.3))` lies [0,1]; `Ls=L*bounce*grow` lies [0,1.05L] (:218–224).

String is the segment from `(ax,railY)` to `(ax+Ls sin r,railY+Ls cos r)`; its hull plus stroke contains all its points. Tag center is the same ray at radius `Ls+attach`, glyph center additionally advances `.06tagH` for tag mode (:229,243). Interval sin/cos and radial multiplication produce conservative per-event rectangles; a full disk around anchor of radius `1.05L+attach+glyph/tag radius` is also valid but often far too loose to find a useful candidate. Tight interval/phase bounds retain the native side-lane feasibility.

Tag scale is `outBack(clamp(tau/.18),1.4)*outK`, rotation `-r`, and local tag rectangle is tagW×tagH plus the hole circle at y=-.4tagH (:236–240). For `outBack(x,s)=1+(s+1)(x-1)^3+s(x-1)^2`, s>0, the maximum on [0,1] is **`B(s)=1+4s³/[27(s+1)²]`**, attained at `x=1-2s/[3(s+1)]` (`01_util.js:24`). This is needed for the tag: scale exceeds1 before it settles. Glyph does not receive that same explicit tag scale; it goes through its own mainDraw pipeline and availability `tau>=0`. Preserve both, rather than projecting the tag animation onto its glyph.

Potential entry tags: rope grow ends at ta, tag pop scale ends at ta+.18; the glyph itself is unavailable before ta. These are event-specific, separate from sinusoidal hold sway. Neither the kick nor bounce has a finite exact settling time; exponentially small is not zero. The pendulum `sin(w*b+phase)` is hold motion forever. Every hold interval is strict with all these contributions included. Rail/pin stationary portions and fade-only exit are strict; tag's explicit exit shrink may be classified as geometric only with a separate source event identity, without relaxing rail/string hold dynamics. Rail reveal alone grants no blanket permission.

Reflow must define ordered suspension rows, explicit new anchor/rail geometry and tag-letter relationships; recalculate L,w,angle bounds for the new geometry. Merely translating glyphs without their attachment is invalid. Scaling W/H to a lane would also change oscillation physics, fonts and stage rail and is outside the intended recipe.

## bounceLine — B:477–547

Native plan domain: mode wave/beat/hop, hop [.38,.6], tempo [.42,.6], shadow/tilt booleans, line line/dots/none (:482–483); generator fits 2..16. Preserve original global i and `g.li` semantics when reflowing; reseting i by row changes wave, beat routing and tilt signs.

Let S=size, hd=clamp(.62tempo,.22,.34), sq=.13. Piecewise profile (:498–503) gives globally `h in [0,1]`, `sx in [.94,1.2]`, `sy in [.76,1.08]`. Only airborne `0<=tau<hd` has h=4v(1-v), v=tau/hd; its maximum is1 at v=.5. Anticipation [-.07,0] and squash [hd,hd+.13] have sine extrema at midpoints. Else profile is identity. Native branch boundaries can have discontinuous sx/sy; enclose **both** one-sided values.

Glyph center x=gx and `y=yb-.5S*sy-h*S*hop`, `yb=gy+.5S` (:524,534). A safe center interval is `[yb-.54S-S*|hop|, yb-.38S]` for nonnegative native hop; in-air sy is exactly1.08 and squash h is0, so piecewise bounds tighten this substantially. Tilt is only in air and lies [-7°,7°], with extrema at tau/hd=1/4,3/4 (:535). It is not constant at the maximum hop. Compose with actual non-centered font ink and mainDraw effects.

Ground shadow is owned: center `(gx,yb+.06S)`, outer ctx scale(1,.2), radius `.34S*(1-.55h)*sx` (:528–531). Global horizontal radius <=.408S and vertical <=.0816S; no glyph tilt is applied to it. The shadow is stationary in center but changes size during **hold**, so it remains strict. Lines span fixed row min/max glyph bounds plus .35S each side, at `yb+.1S`, and dots radius1.2lw (:539–543). Full unrevealed baseline/dots are a valid conservative bound; no avoidance relaxation follows from reveal.

The branch clocks are not interchangeable: wave uses JS remainder of `tt+.07` with period `max(2.2tempo,n*gap+hd+.35)`, gap=min(.09,.9/n); beat either uses `beat.index%n===i` and actual beat.since or the fallback floor/tempo; hop uses seeded period [.9,1.7], phase and startup suppression (:509–521). Negative JS remainder near startup must not be treated as normalized modulo. The global profile ranges above are nevertheless valid for any real tau. For tight branch intervals split at all remainder wraps, startup thresholds, beats and profile knots; do not sample a few beats.

There is **no layout-native entry or exit movement distinct from this ongoing hopping system**. The .25 start threshold does not license a cut-wide entrance exception. All hops, squash and tilt throughout hold are strict. Fade outK and line reveal remain strict. Separate generic mainDraw entry/exit motion may use only its separately certified policy.

Reflow candidates can wrap ordered bounce rows, change row pitch and baseline placement, preserving global phase keys and ground attachments. Derive envelopes again from row anchors, S and native hop amplitude; never reduce the entire stage into a small rectangle.

## elastic — B:550–618

Native domain: orient h/v/diag, ang magnitude6..12° and sign±, every[1.1,1.6], amp[.3,.45], anchor dot/ring/pin (:554–557); generator fits2..12. Positive every is mandatory for fallback modulo, and ang only affects diag's base axis. A finite outside-domain custom value may be bounded directly, but cannot inherit these constants without a guard.

Set t=l-.02 and `spr=0` for t<=0, else `1-exp(-10t)cos(15t)`. With `k=max(.04,spr)*(1+.6p³)` (:576–578), the tight global maximum of spr for t>=0 is

`smax = 1+(3/sqrt(13))*exp[-(2/3)*(pi-atan(2/3))]`,

at `t*=(pi-atan(2/3))/15`. Derivation: spr'=`exp(-10t)[10cos(15t)+15sin(15t)]`; later positive maxima decay by `exp(-20pi/15)`. Therefore **`.04<=k<=1.6*smax` (about1.843)**. A previous preliminary message quoted a smaller number; this exact expression supersedes it. `k<=1.6` is false. On a particular interval use p and spr correlated in time for tighter bounds; independent multiplication remains conservative.

`st=clamp(k,.15,1.6)` is a separate variable. Glyph axes are `(st,1/sqrt(st))` horizontally and swapped vertically (:601–603), so their respective global bounds are [.15,1.6] and `[1/sqrt(1.6),1/sqrt(.15)]` (maximum about2.582). Position and anchors use **unclamped k**, not st. The large early inverse stretch can matter before ordinary rest snapshots.

Let Amax=S*|amp|*max(|ampK|), native ampK in{.55,1}. Wave `wv(u)=A*sin(pi*u)*cos(22tau)*exp(-tau/.42)` if tau>=0, else0 (:580–584). Its absolute bound <=Amax, independently of how long the tail lasts. For glyph a=along(g)*k, u=(a-aA)/max(1,aB-aA), `aA=-half*k,aB=half*k`. Screen position is the **orthogonal** map P2 of (a,wv), vertical variant being (cx+d,cy+a) (:585–588). Rotate interval box by the actual axis angle; do not scale it into stage lanes.

Slope is a centered finite difference, not the analytic derivative (:599). Since `sin(pi(u+.01))-sin(pi(u-.01))=2cos(pi*u)sin(.01pi)`,

`|slope| <= Amax*|sin(.01pi)|/[.01*max(1,2half*k)] <= pi*Amax/max(1,2half*k)`.

Use ±atan(slopeBound) plus ang for glyph rotation; a very coarse full rotation radius also works. Assumes half>=0 for replacing aB-aA by2half*k; otherwise keep source max(1,aB-aA) and bound it directly. A layout that changes order/metric extents must validate positive half rather than assume it.

Owned bands are the actual 13-point polylines from anchor to text end `tA=a0*k-.12S`, `tB=a1*k+.12S` (:591–595). Bound each vertex by along and wave intervals, union their convex hull and **miter stroke** support. Native rendered segments are linear joins of these vertices, not a continuous ideal sine. Pin mode's cross offset -3.2R, connecting stem, ring radius1.3R and its1.3lw stroke, dot/circle radius and overshoot `B(2)` all belong in the owned envelope (:607–614). Ring inner radius.45R and pin radii.9R/.4R also scale by q. `q=outBack(clamp(l/.2),2)*outK`; its maximum <=B(2). Stem alpha=q changes, but stem geometry runs to a point offset -3.2R independently of q.

The spring does not become exactly stationary after .3 or .5 seconds. Continuous decay and periodic pluck remain strict during all hold. Native entrance convergence can receive an explicitly chosen finite moving-event-only relaxation window only if the residual spring **after that window remains included** in strict envelopes; it cannot be replaced by k=1. Exit extension `1+.6p³` is true native geometric exit for glyph positions/anchors/bands, but background/stationary event exemption cannot follow. Pluck resets at beats or `l=.45+j*every`; A jumps at .45, actual beat branch changes at l>.5, and startup t=0/.02 and st clamp crossings are proof boundaries. Shortdur exit may overlap spring/pluck; independent ranges handle this safely.

Axis recipes may move/orient the connected band into a side lane and adjust spacing/half, with fixed stage and original global mi=i*.5. Recompute k-dependent positions and slope denominators; source axis replacement is not a common scale transform.

## bubbles — B:932–985 (cellRows :848 onward)

Native plan: style soap/solid/mixed, rise[.018,.035], wob[.6,1.2], motes boolean (:935–936); generator fits1..12. Preserve cell global index and the exact Kanji/small-kana/punctuation kind; spaces occupy layout cells but skip rendering. Independent motes (:947–954) are not letter bubbles and do not authorize excluding any owned circle/highlight.

For each cell, `R=.5k*kind*(.94+.12rand)`, `t0=.04+.05i+.08rand`, `q0=clamp((l-t0)/.3)`, `q=outBack(q0,2.2)`; no bubble or glyph exists when q0<=0 (:959–964). Use q<=B(2.2), not1. Popup endpoint is t0+.3. Let `f=.7+.6rand` (native [.7,1.3]), `dx=rs*k*.1`, `dy=rs*k*.14`, phi=rand*TAU. Centers are

`x=cx+dx+.1R*sin(1.6*wob*b+phi)`;
`y=cy+dy-H*rise*f*b+.06R*cos(1.2*b+phi)` (:966–967).

Over **finite actual b interval** [b0,b1], bound the affine drift using both endpoints and add sine/cosine ranges. For tighter y include solutions of `-H*rise*f-.072R*sin(1.2b+phi)=0` in the interval. For x include sin extrema. There is **no finite duration-independent y envelope** if rise!=0 and b is unbounded: native continuing rise makes long-tail domain essential.

Bubble radius `Rr=R*q*(1+.35*outCubic(p))` <=`1.35R*B(2.2)` (:944,969). Full owned disk bounds solid fill; soap/mixed need disk stroke max(1.2,.035R)/2, highlight arc radius.78Rr with stroke max(1.5,.07R)/2, highlight point at `(x+.52Rr,y-.52Rr)` with radius max(1.5,.05R) (:973–979). The highlight point radius does **not** shrink with q; the branch appears just after t0. Bound all these; glyph's size is `1.05R*min(1,q)`, so q overshoot enlarges bubble but **not** glyph size (:981). mainDraw starts at miAt(t0) and applies independent supported transformations and plateHold restrictions.

Popup expansion is geometric entrance, ending individually t0+.3; exit popK growth is geometric exit. However rising and wobbling continue through entry/hold/exit and remain strict in hold. A bubble cannot receive broad lifetime relaxation just because it rises from its original row. If implementing relaxation for popup, identify the combined moving event and certify its full drift/wobble at every hold time. Alpha outK alone does not relax the stationary highlight/glyph/owned field. Different source availability must not be filled in from midpoint snapshots, especially late-index short cuts.

Cell reflow may define ordered staggered cell rows and alter pitch/available cell geometry, retaining i/kind/t0/seed and all owned elements. Any drift amplitude/speed change must be an explicit ID recipe decision; replacing H by a small lane height silently changes native rise and is not translation covariance.

## equalizer — B:1747–1817

Native plan: style bars/blocks/mirror, thin0/2/3, peaks boolean, col accent/duo/fg, tempo[.42,.55] (:1750–1751); generator fits1..12. Portrait splits into two rows when n>6; slot spaces retain slot indices but have no lettered bar (:1755–1758,1799–1800). Preserve global i **and** native level key `j+.5+r*7`; if a recipe wraps rows, blindly computing a new r/j changes noise and beat signal. Store the original band key for every glyph.

`level(x,t)` ends in `clamp(v,.06,1)` (:1765–1773). Thus `.06<=level<=1` is a source analytic bound for **all finite** noise/pulse/energy input results; it does not require empirical noise extrema. Validate finite tempo>0, energy and beat fields, and finite intermediates to avoid NaN (J.clamp does not fix it). Native `noise1` interpolates two bounded rs values with smoothstep (`01_util.js:73–75`); a tighter signal proof may use this but is unnecessary for the clamped global range. Peak lookbacks call level with t=b-k*.1 but still use current env.beat.since/index if real beats exist. They are **not** actual past beat-state samples.

Set e=outExpo(clamp(l/.45)), o=outK∈[0,1], `hmax=(rows>1?.26H:.44H)-.4S`, `yb=rows>1?(r?.84H:.47H):.74H` (:1779–1780). Under native sizing hmax>0; a lane-height recipe must validate this again. Then `h=hmax*level*e*o` lies `[0,hmax]`. Letter center x is fixed and y lies `[yb-hmax-.62S-dp, yb-.62S-dp]`, dp=peaks?.1sw:0 (:1801–1812). Its mainDraw envelope is added separately.

Owned lettered bars have x extent ±bw/2, with bars/mirror top y=yb-h and bottom yb. Block mode's m=floor(h/seg), seg=max(4,.14sw), gap=.28seg, has no block outside [yb-h,yb], but individual event counts change at every h=m*seg and the h>.5 branch. Mirror includes **positive** y extent through `yb+2lw+.35h` (:1783–1789); omission of the lower reflection is underbounding. Unlettered thin bars alone may remain independent.

For peaks, `pk=max_(k=0..5)(level(x,b-.1k)-.055k)` (:1808). k=0 implies pk>=.06, and every term<=1, so `.06<=pk<=1`; after e*o, `ph∈[0,hmax]`. With `dh=max(3,.05sw)` the peak rectangle is y `[yb-ph-dh-.04sw, yb-ph-.04sw]`, x±bw/2 (:1810). It can extend **dh+.04sw above** the maximum bar top. Baseline extends x from x0-.2sw to x0+cnt*sw+.2sw, with stroke lw, at yb; its reveal does not excuse collisions (:1782).

Level/noise/beat/peak/letter following are ongoing **hold dynamics**, always strict. Geometric entry e changes bar height and glyph y until l=.45; geometric exit o retracts bars and moves glyph y. A relaxation policy needs explicit separate letter/bar/peak tags and endpoints; baseline is stationary reveal/fade and remains strict. Peak lookbacks and beat boundaries cannot be approximated by a stationary maximum sampled at rest. Block quantization creates branch events but does not invalidate the global [0,hmax] bound.

Reflow can wrap an ordered spectrum row, alter explicit lane hmax/yb/sw while keeping global signal keys/tempo/clock and owned relationships. Validate S, readability, hmax and mirror support rather than reusing H from a small alternate stage. Increasing row count is an actual structural recipe and needs semantic/source coverage for every row, not a uniform scaled replay.

## Implementation handoff and limits

1. Certify complete source event identities and availability before forming bounds. Empty/midpoint-invisible delivery, tags, bubbles, partial baseline/dots, peaks, pin variants and shadow variants must have explicit future support. Hold envelopes must include residual exponential, periodic motion and long-tail drift.
2. Use source-dependent finite time intervals and analytic global ranges above; optional interval subdivision improves feasibility. Separate source branch domains from native plan ranges. A valid tighter algorithm must include interior extrema, discontinuity sides and clock lag, not only more samples.
3. Native joint translation is covariant only when the **whole owned composition** receives the same source translation and the camera applies its correctly transformed displacement. Branches driven by W/H, fitSize, railY, half/L/w, level keys and lift are not invariant under replacing W/H with lane dimensions. Per-ID anchor/row/axis recipes keep full stage dimensions and recalculate their own equations.
4. Bounds supplied here are necessary ingredients, not a complete existing FX certificate. Font metric coverage, actual native/replay event mapping, stroke miter/AA, camera/filter bounds, exact supported treatment domains, implementation interval arithmetic and runtime containment still need independent implementation/review and appropriate verification by the owners. An unsupported domain is an explicit unsupported/excluded result, not safe or auxiliary.
5. Entry/exit relaxation is event-specific and reported as safe-hold, with every stationary event strict and a nonempty minimum hold interval per the contract. A short cut with overlapping native entry and exit does not acquire a hold certificate by clamping the windows together. No hold dynamics in these six families are generally eligible for circle passage.

No implementation or acceptance outcome is asserted by this advisory.
