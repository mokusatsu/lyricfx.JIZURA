# C command/line matrix read reuse — source/pure candidate only

Parent review requested; browser/timing/CDP/security fuzz/images/public were not run. This is not a render-performance pass. Prior +4.9ms rendering failure and all old evidence remain unchanged.

Start HEAD d29ebd4ca13b97bced477974ecf48f9000bdf93a, old09a SHA `e22e968e8c6b4619216c2e432805d4af469338366fd78e8a4fd2f0b9771a3ae4`. Product changes are only09a and generated JA/EN. Candidate09a SHA `ba667de1409fd435ce9f5e96f8a5ce8bacb89f1f8c46d67c7cb07511e02e6190`. Other83source bytes, including09g repair memo/cache,09h/i/j,09_render/11p/11z are exact. Main/docs/pyc/parent gates and unrelated untracked files were untouched.

## Implementation and normal admitted scope

The existing source-known and stock-renderer transport guard at A.record entry remains intact. Only `placementLayoutsC===true && !validationOnly` native command branches reuse a private six-number matrix. First dirty command reads actual Canvas getTransform; later commands reuse it until invalidation. No JS transform composition was added. First bPathMatrix gets its own fresh slice, never the cache array. Every existing command validation and bPathMatrix equality comparison remains. Paint, clip, push/event matrix, nativeRoot/nativeState snapshots, geometry/hulls, replay and all thresholds keep their original calculations/reads.

Invalidation occurs on save/restore, translate/rotate/scale/transform, set/resetTransform, beginPath, clip/paint/gradient/pattern/strokeRect/fillRect/text boundaries, style setters, fallback property access (including canvas), and unknown native-method invocation. Saved unknown methods still invalidate at invocation via a bound-method wrapper. Proxy reset stays on this fallback route: it invalidates but does **not** change the old nativeOps/root reset behavior. No unrelated reset bug is repaired.

High-level shape/blob/line/item entries, push and ownership/bounds callbacks also invalidate. A small private epoch increments on every A.record entry; nested records using the shared measurement context make outer cached reads stale, even after the nested record returns. Outer commandTransform then reads the actual matrix and keeps the original path-transform mismatch diagnosis. No public helper or externally registrable cache was added.

For C non-validation `recorder.line` with exact original A.point, one fresh matrix is shared by the existing point map and four-component hypot. Non-C,validationOnly or replaced A.point retains the original per-point + four hypot getTransform reads. Arithmetic/parenthesization after the norm, all map outputs, original pts/args references, miter/dash guards and the separate push matrix read remain intact.

This is scoped to ordinary numeric source-created points and synchronous stock native command sequences. It is not a generic optimization for arbitrary retained public raw measurement contexts or callback-driven coordinates. No new security review or attack matrix was performed.

## Source route evidence

- 09a builds renderer.makeEnv with ctx:proxy before native drawing; ordinary C native ctx commands and renderer helper transforms therefore cross the invalidation wrappers.
- Existing private C record helpers reset the raw measurement context **before** A.record:09g record (~272),09h (~12),09i (~72),09j (~12/219). Editorial dictionary print-field audit resets after its recorded program (~84). These are not hidden CTM changes inside an ordinary source command run.
- 09h cssPaint (~162) changes raw fillStyle only. Stock itemGeometry uses measurement text state, not CTM; its measurementContext resize is guarded by item-entry invalidation. Public raw measurementContext is not assumed inaccessible.
- Native newspaper raw path runs and stampSheet wave/rule line points are ordinary local numeric values. Native C source was not found to retain and mutate the shared measurement CTM outside proxy between the long command sequences targeted here. Explicit canvas access, reset and nested A.record routes are nevertheless invalidated.

The original source-only plans `/tmp/native-path-matrix-read-plan.md` and `/tmp/native-line-matrix-plan.md` motivated this finite scope; no broader public context guarantee is inferred.

## Executed pure oracle

New helper `dev/avoidance/layouts-c-native-command-matrix-pure.cjs` uses fixed old e22e source and a normal mock Canvas with separate contexts, actual affine state changes, save/restore and canvas resize. No browser is launched. Existing attack-heavy extrema helper was not run or imported.

Final commands:

```
node --check src/09a_placement.js
node --check dev/avoidance/layouts-c-native-command-matrix-pure.cjs
node dev/avoidance/layouts-c-native-command-matrix-pure.cjs
PYTHONDONTWRITEBYTECODE=1 python3 build.py
```

`pure03.raw.json.gz` and summary: **40 normal cases PASS**. Every full native program, nested program and Canvas call trace excluding deliberately counted getTransform matches old source with util.isDeepStrictEqual and exact V8 serialization (including aliases,undefined,-0). Full old/new V8 data is retained as base64 in lossless gzip. getTransform counts are actual mock-method invocations, not estimated wall-time savings.

Coverage includes arc fill/stroke,arcTo,Bezier/Quadratic,1161arc halftone,4096point path; C/B/A/generic/validationOnly; translate/rotate/scale/transform/set/resetTransform; ctx.reset and stored reset; canvas resize; nested save/restore; beginPath and clip matrix ownership; style/unknown native method/helper boundaries;2/17point lines under affine transforms; non-stock point fallback; and same/different CTM nested record. Changed-transform paths retain identical old diagnostics rather than manufacturing success.

Actual reductions:1161arc run1160 calls saved;4096commands4095 saved; C2point line5 saved; C17point line20 saved. B/A/generic,validationOnly and replaced-point controls retain exact old counts. Single arc has no command saving, as expected. No claim about native Canvas rounding/pixels or original100 timing follows from this mock oracle.

Historical pure01 and pure02 PASS evidence is retained. pure02 added conservative classified-method boundary invalidation; pure03 added fixed old-source SHA assertion and pins the final helper. Initial progress commentary accidentally said41; actual stdout/summary and final report correctly say40. No functional failure or expectation change occurred in this prototype.

## Build, reverse and stop

Current build succeeded with PYTHONDONTWRITEBYTECODE. A private temporary reverse build with starting09a and the other83 unchanged sources reproduced both starting JA/EN HTML bytes exactly. No before/after HTML gzip duplicates were created. Lossless source.patch reverse-applies to exact old09a; before/after09a bytes and hashes are stored. `reverse-proof01.json` records83protected source pins and both HTML identities; `unchanged-functions.json` proves all bytes from applyNativeTransform onward (replay/finalization/freeze/signature) and matrix helper unchanged. No pyc created in this donor (absent initially); main pyc untouched.

All temporary reverse-build artifacts were removed after successful byte comparison;250MiB reserve maintained. Current source/helper/compiled/evidence pins are in manifest. Stopped after scoped donor commit for parent source/pure review. Separate authorized browser correctness and original performance measurement are still required before adoption; no next job is started.
