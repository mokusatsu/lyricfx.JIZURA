# Dependency representation proposal — no implementation or execution

Base: `6dcd2a1d9b08bb85a557a59afef0c34f670b44e7`. This document does not authorize another run. Product/source/fixtures/thresholds remain unchanged.

## Evidence and scope

The single new100 diagnostic leaves ON finalization92.9ms (source60.5ms) and OFF53.5ms (source68.4ms), despite actual measured reconstruction0 and true whole-result hits. The prior unmodified dependency implementation occupied207.631ms ON/140.209ms OFF inclusively across six warm finalizations in the old sampled CPU run. Those old totals are overlapping inclusive samples, not new exact phase measurements. They motivate a dependency-encoding candidate; they do not predict a pass. Render still adds5.4ms p95 in the new bounded diagnostic and remains a separate unresolved problem.

Preferred next candidate:09g only, replace the **representation** at the return of `cacheDependencies`, with a private typed primitive-table serializer. Keep every existing dependency read/walk/order and every runtime identity. Keep `cacheEncode({input,options,lineage})` byte-for-byte unchanged and retain both begin collection and read/keep recollection. No metadata cache, generation-only shortcut, WeakMap-only reuse, sampled validation, freeze/signature skip or second-verification skip.

`cacheEncode` and `cacheDecode` remain byte-identical to6d, so result payload graph bytes and whole input/options/lineage graph bytes remain identical. Dependency strings intentionally get a new disjoint version namespace; they are not asserted byte-identical to the old dependency graph encoding. New actual key bytes must be measured by the existing two-ledger charges, not carried from old results.32entries/128MiB/512header/LRU/clear/stats remain unchanged.09a/09h/09i/09j/11p/11z and geometry/renderer remain untouched.

## Concrete representation

Retain the current collector's local variables and existing call sequence. Project the freshly collected metadata into a fixed schema:

```
["C008-deps-primitive-table-v2",
 [typed(version), typed(revision), typed(language), typed(fontSetIdentity),
  [typed(fontSetAccessor.get), typed(fontSetAccessor.set)],
  typed(measurementContextIdentity), measurementOwnSeams,
  typed(devicePixelRatio), facesInExistingOrder, seamsInExistingOrder,
  adaptersInExistingOrder],
 oldCacheEncode(J.FONTS)]
```

Every value cell, including every string/ID/path/tag/optional descriptor value in the tables, is encoded by the same explicit scalar grammar:

- undefined → `["u"]`; null → `["n"]`.
- finite number → `["d", n]`; negative zero → `["d", "-0"]`.
- string → `["s", s]`; boolean → `["b", b]`.
- object/function/symbol/bigint/nonfinite → **cache bypass**, never omit/stringify/coerce.

All table containers are fresh ordinary dense arrays constructed inside the collector, with fixed field positions and explicit row lengths. User objects never enter those arrays. Arrays/objects from arbitrary data are not recursively flattened into this fast representation. `J.FONTS` is the sole arbitrary graph and is independently encoded with the unchanged exact graph codec, preserving own key order/prototype/undefined/-0/internal aliases and old unsupported rejection.

One native JSON.stringify serializes the private typed tables and the old-font-codec string. No JSON.stringify replacer, toJSON callback or user getter may participate in this path. Capture the module-load JSON.stringify function privately, require its live public identity unchanged for fast-path eligibility, and fail closed if a toJSON descriptor exists anywhere on the prototype chain of generated array/object containers. Check descriptors without invoking getters. Recheck this eligibility after collecting/encoding and before returning, so a seam changed during collection cannot authorize a stored/reused result. Do not trust JSON output after a changed seam. Captured helpers must be represented in the existing public seam collection and new helper identity negatives must miss/bypass.

The implementation must validate the *actual* table values before encoding. Schema positions alone are insufficient if a descriptor/property unexpectedly yields an object or unsupported scalar. A narrow eligibility rejection falls through the existing cache bypass/cold path and must preserve original outputs/diagnostics. It may not remove that source/case from a benchmark or relabel unsupported output as safe.

## Completeness mapping and cross-alias proof obligation

| Existing dependency | Required exact retention |
|---|---|
|version/revision/language/DPR|All actual scalar values and types, including undefined and -0. A non-scalar cannot use this fast path.|
|J.FONTS|Entire unchanged old graph codec, with no selected-family or metrics-field filtering.|
|document.fonts|Actual FontFaceSet identity, getter/setter identity, loaded precondition, <=128faces, every face loaded.|
|Every face, existing iteration order|identity,family,style,weight,stretch,unicodeRange,status,featureSettings,variationSettings,display,ascentOverride,descentOverride,lineGapOverride.|
|A.measurementContext()|Actual context identity and sorted own function/accessor get/set identities; transient drawing state remains excluded under the original reset contract.|
|Source/adapter/helper runtime seams|Exact existing walk over rootJ,placement depth4,E depth4,metrics/glyphs depth2,Renderer.prototype depth2,LAYOUTS depth2; same names, sort order, depth and shared seen-set. All existing function IDs, accessor get/set IDs and scalar data values retained.|
|Native intrinsic seams|Exact current Math,JSON,Object,Array.prototype,String.prototype,Number.prototype,Map.prototype,Set.prototype,TextEncoder.prototype walks; CanvasRenderingContext2D/TextMetrics/FontFace constructor and prototype seams unchanged.|
|Registry|Existing externalAdapters iteration order,layout,id,finalize/render function IDs. Registration changes still miss; schema synthetic failure/restore stays separate from geometry acceptance.|

This proves equivalence to the **currently collected dependency domain**, not inaccessible closure state or a new claim that every possible JavaScript mutation is observable. No existing field/walk may be narrowed during implementation.

All metadata containers other than J.FONTS are newly created and private. All externally read leaves are required to be primitive after validation. Consequently there can be no user-visible cross-alias between the metadata tree and J.FONTS. If language/revision/face/seam data returns J.FONTS or any other object, eligibility rejects instead of turning graph aliasing into a value tree. Internal aliases inside J.FONTS remain in its old codec. Cross-alias between J.FONTS and input was already separated by the old dependency/input codec boundary; the complete input/options/lineage graph remains encoded together, including all its internal aliases.

For eligible metadata, equality of the new string must imply equality of every old collected primitive with Object.is number semantics, all exact function/object IDs, existing ordering and the old-font graph string. Type tags distinguish missing/null/undefined/-0/string lookalikes; fixed nested array boundaries prevent concatenation collisions. The codec version keeps old and new dependency representations disjoint. No hash-only equality or rounding is introduced.

## Required proof/tests before any new diagnostic

1. Independent old collector representation → graph decoder oracle versus new typed representation over actual saved metadata and randomized closed tables. Verify the equivalence implication in both directions for eligible domains, including all fields/row order. Do not merely mirror the new serializer.
2. Collision boundaries: undefined/null/false/0/-0/empty string/"-0"/"u"/tag-like strings, CJK/quotes/backslashes/control/lone surrogates, numeric-ID/string-ID distinction, missing descriptor get/set vs null, reordered/added/deleted seam and face rows. New representation must distinguish each semantically distinct original dependency.
3. Arbitrary fonts: ordered keys,nullproto,DAG/internal aliases,__proto__/constructor/toString and input-font shared references. Original graph encoding unchanged; object-valued metadata, cycles, accessors, symbols,bigints,nonfinite and custom prototypes reject/bypass instead of dropping fields.
4. New runtime misses/bypasses: same-behavior JSON.stringify wrapper; benign Array.prototype/Object.prototype toJSON; toJSON accessor whose getter must never run during the isolated eligibility check (existing cold product behavior after bypass is separate); module-load captured helper replacement; metadata seam switched during collection; restoration afterward must restore eligible exact behavior. Distinguish intentional strict bypass from a cache miss/store.
5. Keep all25 existing dependency negatives,40full cold/warm value+alias pairs,18native pairs,4nonC controls,schema registration failure/restore/warm,2ledger oversized fixtures,LRU and actual0warm record counters. Compare every original normal row and old payload graph with6d, not just safety counts. Existing clocks/bounds/AA/negative predicates remain unchanged.
6. Static exact-source reverse: only cacheDependencies representation/new private helper area09g changes, generated JAEN exactmodule replacement, all other83src exact. Old encoder/decoder/input-key construction/verify call sites/cap/thresholds exact. Actual key/payload/ledger stats must remain honest and bounded.

A small pure Node oracle is the first implementation check; browser correctness and a subsequent bounded diagnostic would need a new parent execution gate. No new1000/formal/timing is proposed under the present authorization.

## Alternative, if new dependency representation is rejected

Optimize only the old graph encoder's per-node budget accounting while preserving its final JSON.stringify bytes. Today each completed node is JSON.stringify'd to count characters and then serialized again in the final graph. A compositional exact JSON character count could remove that redundant node traversal. It must retain identical node visitation/IDs, own-property validation, every primitive/string escape, original encodedChars increment/throw boundary and old key/payload bytes. Arbitrary toJSON/intrinsic changes require old-path fallback or fail-closed bypass, not an assumed length. Unicode escape/surrogate/negative-zero/unsupported/oversized boundary tests plus an independent old encoder oracle are mandatory. This alternative touches the shared encoder used for input/dependencies/payload and therefore has a wider proof scope; it should be a separate later patch, not silently combined with the preferred dependency-only candidate.

## Render remains separate

The old unmodified-render profile has C containment self totals29.747+10.149+9.967=49.863samplems/80frames (~0.623ms/frame average), not a bound on p95 savings. Record/dispatch/replay attribution and exact hot lines are already in decoder01/HANDOFF and profile01 v2. No claim that containment early exit alone resolves +5.4ms. No render change is included here.


## Mandatory coverage gates, independent of speed

The original random corpus cannot currently pass the unchanged formal gates, even with perfect timing. Actual100ON results are94staged/100 and record76/replay76/observations76 over80 renderer.frame calls. The six un-staged cuts are shoji.shadow at27/61/95 (`UNSUPPORTED_SHOJI_FILTER_SUPPORT`) and priceTag.hang at30/64/98 (`UNSUPPORTED_PRICE_PENDULUM`). The exact native variant spelling is `hang`, not `tag`. Four of80 sampled frames target those unsupported paths, explaining76 C observations. All34 IDs in renderIDs are native frame-call coverage, not proof of34 C staged paths. `candidateFullCoverage` isfalse and the unchanged actualPipelineValid>=80 gate also fails. Older wording “all80observations equal” was incorrect; comparisons actually proved equality of all76 recorded observations and all cut summaries.

No guard is waived, no original random result is renamed successful, and no fixture change is included in this proposal.34source stable is distinct from every random variant being staged or safe. Preserve original formal01FAIL, decoder diagnostic and their source/corpus as controls.

Two possible next scopes require a parent requirement decision:

1. **New explicitly named supported-domain corpus**, e.g. `C34-supported-native-variants-v1`. Native shoji.plan line3205 genuinely selects shadow/open/shadow; adapter09j line47 supports open with rows4–6/cols2–3. Native priceTag.plan line3396 genuinely selects hang/hang/shelf; adapter09j line41 supports shelf. A separate fixture could retain every real J.plan/native.plan call and timer, all100/1000cuts+regions/all34IDs/nonzero clocks/seed/ONOFF/80+16/3+6/thresholds/strict guards, then explicitly choose only these two native variant fields as open/shelf after the source timer, identically on immutable2bb baseline and candidate. Preserve every other param (including swing/price/rows/cols), native font/copy and unknown fields. This changes actual geometry and must be a new named input corpus with new canonical bytes/hashes and explicit provenance; it is **not** the deterministic omikuji correction or the old random corpus passing. It needs supported-variant correctness/native qualification/80 actual C observations, and separately named shadow/hang unsupported controls. Old geometry/performance evidence cannot be silently carried across variant changes. No assumption that all100/1000 will stage or meet speed is allowed before fresh evidence. Whether that supported-domain benchmark fulfills taskcontract is for parent review, not inferred here.
2. **Implement shadow/hang support in their product owner domain**, retaining the original random corpus and its strict guard. Shoji shadow needs actual filter/blur ink support and full source shadow/glyph/architecture bounds, rather than disabling blur or reclassifying it away. PriceTag hang needs continuous native pendulum/owned paper+string+glyph support through entry/hold/exit, with stage/circle/source-clock proof. Those are product feature proofs, not cache optimizations; they are not authorized here and must not be approximated by parameter substitution or inflated bounds without source evidence.

Until one scope is explicitly selected and evidenced, further cache work can establish correctness/cost only. It cannot claim original corpus formal performance acceptance.
