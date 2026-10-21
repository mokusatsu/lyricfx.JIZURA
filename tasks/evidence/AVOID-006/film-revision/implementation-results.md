# Filmstrip implementation handoff (2026-10-21)

Implementation model: gpt-6.1-sol / medium. Starting work HEAD:
`3e2ff804fac2e94dce79039ddf7a46ec19221494`.

The old adaptive anchor independently chose a 560.85 px along-axis exposure and
279.72 px band, producing a 201.3984 px cross-axis exposure (2.7848:1). It reduced
entry travel to 4.779 px and hold travel to 1.19475 px/s. Native stage-scale travel
was 1728 px entry, 2688 px exit and 32.4 px/s hold at 1920×1080.

The candidate jointly bounds exposures at 3:2 and restores native entry/exit/hold
motion. The default adaptive anchor is 344.088×229.392 px, fontScale .7, candidate
59, hold-safe. Its former result was fontScale .8, candidate43, full-interval safe;
that former safety result is not reused. Hold and stationary events remain strict;
only source-tagged moving entry/exit events receive existing relaxation. The native
film exposure changes from 1.3 to 1.5 intentionally, including OFF. Other layouts'
OFF output is unchanged.

The original sequence was present: actual positive-alpha film text draw calls on
both baseline and candidate have the same text/delay/alpha sequence at 11 exact
timestamps. At native stagger .04040546467644163, the three actual thresholds are
0, .1212163940293249 and .2828382527350914 seconds. No timing code was changed.

Final JA SHA-256:
`d780ca129dfe87868a8a448a90c02a2e6ba4f2398a4a7f522a91973bad62eda0`.
Final EN SHA-256:
`97941bd9ddabaf197292481dcbf235bd5e73cfed95ad09c6495b5b7d7970fd02`.
Baseline JA SHA-256:
`b2c230268f7731df2201093893397551b3265c8cad9984ef8b517cc1fe8bc696`.

`functional-summary.json` pins all src files, final JA/EN, fixture, executed scripts,
raw logs, actual durations and exits. All eleven suites pass: the nine original
core suites plus filmstrip-test and filmstrip-parity. The existing test assertions
were not relaxed. Adaptive results: eight certified anchors (six whole-interval,
two hold), 168 matrix cases (73 whole-interval, 32 hold, 63 explicit exclusions),
32 controls, eight explicit scales, eight boundaries, 576 anchor frames, 16 motion
cases/80 frames and 16 motion parity checks. The focused film suite executes 16
ON/OFF/direction/portrait/tilt cases, 13 timestamps each, with 624 actual exposure
rectangle checks, real positive-alpha text draws, native entry/hold/exit distances,
independent envelope checks and alpha1 strict-conflict raster checks. The parity
suite preserves all other 25 OFF layouts and the accepted 18 adaptive examples:
43 conditions, 129 exact Canvas/observation/trajectory frame comparisons, no mismatch.

The unchanged full 100/1000-cut performance gate is recorded separately in
performance.json/performance.log when complete. Public MP4 capture/validation,
capacity/raw-byte audit, independent visual review, parent review and human motion
review remain outside this implementation's local functional claims. The
implementation agent has not opened images or videos and has not committed or
pushed changes. Existing user/unpublished artifacts remain untouched.

The isolated original performance gate completed with exit0/passed:true. Actual100/1000 cuts and regions, warmup3/sample6, dense stress enabled; both source inputs identical. Planning factors1.370271/1.935485 are below2, render deltas−3/−2ms are below+3ms. Candidate planningP95 460/27525.7ms, renderP95 5.1/5.3ms; cold totals3008.7/27346.6ms. Dense100/1000-region stress deterministic, exact segment counts, unique recipe budget128. The gate was not changed; these are measured limits rather than a claim of instant cold planning. performance.json and performance.log carry all raw samples/configuration/source hashes.
