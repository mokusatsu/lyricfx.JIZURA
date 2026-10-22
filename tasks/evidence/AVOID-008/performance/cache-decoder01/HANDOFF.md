# Decoder-only prototype and bounded diagnostic

Product base: accepted128 `778eb302b97ab84abe36206c163918335073acbd`.
Deterministic fixture remains separately committed at `b1ddc2dff2cfa18693500607549e4e9663d69626`.
Only `cacheDecode` in09g changes; JA/EN are exact rebuilds containing that same replacement. Other83 source modules, encoder/key/dependencies, 32entries/128MiB/two byte ledgers/512header/LRU, source geometry, clocks, renderer and native omikuji are byte-identical. See `product-byte-proof.json`.

The new decoder reuses fresh JSON.parse dense arrays, creates object own-data slots with Object.fromEntries before populating values, and restores null prototypes before recursion. It preserves old graph memo/aliases and creates fresh independently mutable graphs per read; normal finalization still deep-freezes outputs. No frozen result is retained in the pool.

`differential-results.json`: independent old decoder vs candidate,196valid graphs (16fixed+180random),98 inherited-setter guarded graphs,6826 decoded object occurrences,17 old unsupported input shapes rejected identically. Ordered ownkeys/descriptors, undefined/-0, nullproto/DAG, __proto__/constructor/toString, inherited setters, independent reads/deepfreeze are covered. Entire nondecoder product bytes reverse exactly.

Fresh local correctness: `../cache-decoder01-correctness01/`.40cold/warm fullvalue+graph/alias pairs,18native pairs,25dependency misses (original23 plus Object.fromEntries/setPrototypeOf),4nonC controls, separate schema20→21 failure/restore/warm contract, two oversized ledgers and LRU eviction passed.104input pins unchanged. Every field in all40 old128 rows, original23miss, controls, eviction, oversized fixtures and schema result is exactly equal to the accepted olddecoder run. `independent-old-new-comparison.json` records this comparison.

One authorized unprofiled `--diagnose100`: `../cache-decoder01-diagnostic100/`. Four baseline2bb/candidate100 ON/OFF sides,3warm+1 measured point,80frames/16warmup; alone monitor/external-origin abort/5min wall bound unchanged. No CDP, formal rerun,1000 or size sweep was executed.118pins unchanged; all original formal100 normalized inputs/cuts and all76 recorded C observations equal. There are80 frame calls, but only76 C record/replay/observation calls; four frames follow preserved unsupported native paths. This fails the unchanged actualPipelineValid>=80 gate. All browser/server processes closed. Results retain actual cold cost and cache counters; historical candidateBudget is not actual warm reconstruction.

| scope | baseline measured planning | candidate | ratio | render p95 baseline→candidate |
|---|---:|---:|---:|---:|
|100 ON|51.2ms|153.4ms|2.9961|3.1→8.5ms (+5.4)|
|100 OFF|51.8ms|121.9ms|2.3533|2.2→4.0ms (+1.8)|

These are single post-warm planning points, not formal planning p95 or a performance acceptance. Remaining budget shortfall is preserved; no repeat/optimization loop follows. ON cold4969.4ms/595actual records; OFF cold156.3ms/0records. Each candidate had3hits/1miss/1store/bypass0; measured warm records0. ON measured source60.5ms+finalize92.9ms; OFF68.4+53.5ms.94/100 ON cuts are staged, exactly matching original output; six unsupported cuts remain unsupported. All34renderIDs are present. The old formal100 p95 and old CDP run have different sample counts/overhead and cannot establish a causal speedup ratio against this point.

`summary.json` and `diagnostic-render-contributors.json` retain exact measurements/rows. New correctness pretty raw is losslessly canonicalized as `results.raw.json.gz` plus raw bytes/SHA receipt; its duplicate pretty JSON alone was removed. New diagnostic retains both pretty JSON and lossless raw gzip. Existing formal/diagnostic/profile historical results were never rewritten or deleted.

## Remaining work proposal (not implemented)

The new unprofiled ON render tail still exceeds +3ms. Measured slow ON frames here include stampSheet16.1/9.2ms, clapper9.8, newspaper8.5/8.1 and magazine8.0. OFF stampSheet17.2ms is also slow; source-native cost and extra C checks must remain distinguishable. No claim that the old sampled per-function times are the new decoder's exact phase costs.

Prior unchanged-render source profile gives actual hot functions, globally restricted to all80 renderer.frame calls (no planning or clock anchor):09h.contains line7 self29.747ms;09i.polygonContains line13 self10.149; old09g.contains line212 self9.967.09h.render line307 anonymous containment dispatch self19.999/inclusive49.746 overlaps contains and must not be added as disjoint totals. Record-side09a.convexHull line18 self20.081/inclusive32.858, push line93 self10.711/inclusive23.829, itemGeometry line44 self8.975/inclusive29.221, record jsonClone line251 self8.5; replay fillText18.858. These retain old uninstrumented CPU evidence provenance and sampling limitations in `../formal128-cache-render-profile01/render-function-breakdown-v2.json`.

A narrow next render candidate is C-owned containment helpers only: stop once both monotonic cross-sign flags become true, and optionally precompute immutable per-polygon edge differences while preserving the exact subtraction/multiply/subtract expression order, epsilon and vertex order. No AABB rejection, point skipping, changed AA/bounds/clock, observation filtering, or repeated-time framecache. It needs differential predicates over degenerate/nonfinite/boundary cases and full cold/warm/native/negative traces before any diagnostic; the total sampled containment self cost alone does not promise to remove the5.4ms p95 gap. Changes to shared09a recording should wait for a separately scoped proof and measured need.

For remaining planning cost, old CPU evidence still points at dependency/key encoding (same source bytes): a later exact verifier could compare the full old codec stream to the stored key without allocating a duplicate encoding, retaining every dependency read, ordering and two-boundary verification. This is a proposal only; no verification was skipped or changed here. No new CPU profiling has run after the decoder change. Further product optimization or diagnostic/formal execution requires a new parent gate.
