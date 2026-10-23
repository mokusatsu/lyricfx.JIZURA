# Read-only review: deferred edge preparation and polygon-in-any hints

Fixed donor `ffc1da2dc98a63784c9aeac339ee844fd8d48bad`, product source8ff3dd8487a4fb4193d00ef9caa296372c751b4f. Source was read via Git blobs, not mutable donor files. Exact blobs/SHA in source-pins.json. No product/Git/browser/test/timing/image/public operation; only this new owned report directory was written.

## Conclusion

1. **Deferred edge preparation is a plausible small, independently reviewable next change.** Snapshot decoded polygon point references with a captured native bound slice; postpone coordinate/edge arrays and immutable proof until first use. Existing payloadGuard is NOT sufficient for slice/species, so add one narrowly scoped registration guard. This reduces upfront work; it cannot by itself promise to close render+5.1ms and may move work into first-render frames.
2. **A last-successful POLYGON hint can preserve the predicate on a strictly issued query/decoded-collection domain.** The smallest credible route is a fresh-only normalization factory plus genuine polygon-outer issuer, not broad marking of every09a point literal. A09a-point-only issuer has zero direct coverage after the current normalized literal maps. This requires additional provenance/epoch plumbing and guards; it is not yet an implementation-ready speedup proof. Keep unknown inputs on the literal old expression. A bounded pilot should target09h safe multi-envelope rendering first, not blindly all4 modules.

The hint MUST preserve `exists q: every vertex of polygon is contained by q`. It must never become `every vertex: exists q containing that vertex`. Two separated rectangles can each cover a different endpoint while no single rectangle covers the whole query polygon.

## 1. Current edge registry / lazy alternative

09g45–51 payloadGuard guards JSON.parse/stringify and Object helper identities, Array.isArray, Number.isInteger, TextEncoder and toJSON absence. **It does not guard Array.prototype.slice/constructor, Array[Symbol.species], the Array/Object prototype chain, or Function call/apply.** The different dependencyEncode eligibility guard143–150 does cover constructor/species/prototype/map; it cannot be cited as though payloadGuard performs those checks.

09g76–87 payloadDecode calls captured native JSON.parse **without a reviver**, then uses private parsed paths and captured defineProperty for scalar/alias repairs. Repaired references point into the parsed graph; no foreign object is accepted from outside it. JSON array elements are dense own data properties; parsing does not call inherited numeric setters. 09g166 calls edgeRegisterFinal immediately after this private decode, before returning the result. Thus q and its original point objects in this registry are genuinely parse-born ordinary objects/arrays, even though the live returned graph can later be mutated. This is narrower than Array.isArray(q), frozen(q), or generic Proxy detection.

Current09g97–111 selected-field traversal registers individual q arrays: unit envelopes/stageEnvelopes, segment envelopes/stageEnvelopes/entryEnvelopes/exitEnvelopes/badgeEntryEnvelopes and body full/hold. 105–106 reads each q point and two coordinates, allocates points/coords/edges, and calls captured defineProperty three times per vertex. Retained100 evidence describes4,022q/32,932edges/114,274selected slots, with8,443duplicates (immutable-edge01/HANDOFF). This supports the structural cost hypothesis; it does NOT prove the152.2ms diagnostic slowdown was caused by registration.

Minimal lazy record: `{points: capturedBoundSlice(q), length, valid:0}` plus unchanged caps/counts. Before and after registration, check captured descriptors for slice, Array.prototype.constructor, Array[Symbol.species], Array.prototype/Object.prototype chains, and original global Array identity. Source q has no own constructor at this immediate parse-born seam. Capture the bound native slice using bootstrap Reflect.apply/bind/call (as edgeGet/edgeSet already do), then call the bound function directly; do not use live `.call` or `.apply`.

Why private slice does not need a per-point numeric-setter scan: native Array.slice writes the fresh species-created output with CreateDataProperty, not a setter-triggering ordinary Set. With stock constructor/species and dense genuine source own slots, there is no callback between the precondition check and output creation/copy. Native species getter is the captured standard getter. A changed constructor/species/accessor must decline registration without invoking it; postcheck alone is not a solution to transient hook/restore. A preexisting polluted bootstrap realm is outside the currently documented native-bootstrap premise, just as for the existing edge registry.

First-use validation must check q frozen/length/index own-data descriptors and **original point-reference equality before inspecting a replacement**. Changed q[i] (including a Proxy wrapping the original point) declines acceleration with zero Proxy traps. Original point refs are genuine, so captured descriptor/prototype/frozen checks on them cannot call point getters. Require each original point's own0/1 numeric finite immutable data slots and frozen genuine array shape. Then read CURRENT coordinates and form exactly the old `(b0-a0,b1-a1,a0,a1)` edges, preserving all subtraction and cross order. No algebra change or early sign exit.

Primitive coordinates changed before freezing may now admit a current-value edge cache instead of the previous snapshot-mismatch fallback. This is safe only by comparing the resulting boolean/throws against the **legacy full predicate**, not by demanding identical hit/rejection counters. Accessor/Infinity/NaN/replaced-ref cases must still decline and let the old predicate handle its original effects. Once fully frozen validated q/points cannot change their relevant slots. Nonfinite edge intermediates from extreme finite coordinates retain the old arithmetic/NaN sign behavior; do not invent a new tolerance or approximate rejection.

Keep existing65,536edge/8,192polygon/131,072selected-slot caps. Snapshot cloning must happen only after length/cap checks, and first-use allocation is bounded by the same admitted edge total. Registry generations and OFF retirement remain unchanged. A public reader may conservatively poison acceleration with an early unfrozen call; it must not change a later legacy boolean. Diagnostic stats may differ and need explicit revised definitions; they are not geometric equivalence evidence.

## 2. Real callers and possible hint domain

| Fixed source | Actual render predicate | Implication |
|---|---|---|
|09g358,364,366|hold, clapper entry and stage `collection.some(q => polygon.every(v => contains(v,q)))`|Potential many-q hint. Badge exit/entry360/362 uses one event-mapped q and is not a search.|
|09h307|safe hold/stage same some/every|Best multi-event paper pilot. `!safe` skips BOTH searches entirely.|
|09i275|each vertex tested directly against its classified body's full/hold q|No collection search to optimize; do not rewrite all-body ownership search.|
|09j197|hang full/held collections|Possible but few q; native hold/entry guards unchanged.|
|09j235|shadow output collection|Few q; snapshot clone provenance is separate.|
|09j265–266|generic full/held collections|Usually few q; routeMap has multiple source groups.|

Every module currently creates fresh normalized `[x/scale,y/scale]` pairs AFTER A.record:09g358,09h307,09i271/275,09j195/235/265–266. Therefore marking only A.point/rect/expanded points during09a record will NOT mark the values handed to these predicates. Modifying all raw point literal sites is a large seam with many weakset writes and still misses normalization. Moreover09g clapper ownedPolygons214–217 calls public A.layoutsAClip,09h clipped210 makes fresh local rectangles, and shadowSnapshot09a clones output graphs. These transformed outer arrays need their own genuine issuer or an honest fallback.

### Narrow fresh-only factory alternative

A public immutable factory can safely return only newly allocated arrays: primitive(x,y) -> new `[x,y]`, and/or a normalization factory returning only a new polygon array. It must never register a caller-supplied array. WeakSet membership checked with a captured bound native rejects Proxy wrappers without triggering traps. A caller can mint genuine finite points, but cannot brand a Proxy or accessor-bearing replacement; lazy own-data checks on genuinely issued objects reject later coordinate accessors/mutation to nonfinite values without invoking them. Primitive changes remain current-value calculations, not a stale cached point.

A minimum09a outer issuer can mark the **literal** `out=[]` returned by the original A.convexHull18, and the literal outer array created by private rect16. The hull's input points may be foreign; this proves only its returned outer identity, not its contents. Even custom slice/push hooks cannot turn that literal object itself into a Proxy, although they may retain/mutate it. A custom public hull wrapper returning a Proxy misses the issuer. No generic post-hoc Array.isArray/descriptor test may brand arbitrary objects.

For normalization of a known genuine outer:

1. Prove Array prototype/constructor/species/native map seams, own map/constructor absent, and expected prototype using captured descriptors. Unknown outer immediately takes the literal old `.map` path without pre-reading it.
2. Call original native map through the original property expression or a captured native only in the proven stock domain. The source outer's own length is data. Species allocation occurs **before** callbacks, so subsequent p-coordinate getters changing map/species cannot substitute a Proxy output retrospectively. Holes or weird source index getters are allowed to run in their old order; they only prevent later dense query certification.
3. Callback evaluates `p[0]/scale` then `p[1]/scale` in the old order and returns a fresh-only issued point. Do not pre-read original source point coordinates to decide whether to normalize. Object coercion/throws still happen once where they did previously. Nonfinite resulting points remain unqualified.
4. The successfully returned native map output can be branded privately by the factory's closure: it is a newly created genuine array, not a public registration of supplied data. A changed source map/constructor/species path returns the old result **unbranded** and cannot authorize hints.
5. Before hint use, require a dense genuine query outer, no own every method, stock Array.prototype.every, and all own index slots referencing genuine issued finite own-data points. Frozen(query) alone is insufficient. Do not copy or normalize again inside the hint.

This avoids replacing all09a expanded literals: final hull outer issuance plus post-record normalization births provide the needed query domain. A09h clipped rectangle factory can be migrated only if it too always returns new literal arrays, or else remain unqualified; similarly leave A.layoutsAClip-derived clapper arrays and shadow snapshot clone cases on old search until separately proved. No shared09c redesign is justified solely to boost coverage.

### Hint and collection proof

Register collection identities ONLY from the private decoded selected fields, with genuine q-reference snapshots, not from arbitrary public arrays. On first use certify collection frozen/dense own-data slots/length, same q refs, and every member q's full immutable numeric proof. A replaced collection/Proxy wrapper is a registry miss; a changed member rejects before touching the replacement. Guard the collection's own some absence and live Array.prototype.some descriptor. Also guard query own every absence and Array.prototype.every. **some-only guarding is inadequate**: skipped earlier q candidates otherwise skip observable every calls.

For qualified query and collection, try the saved q index using the exact same all-vertex predicate and module epsilon. If true, return true; if false, run the FULL original q order, including the hinted candidate if encountered. Update the index only after a real successful whole-polygon check. Retain zero-length/degenerate and module epsilon semantics1e-5/1e-4/1e-5/1e-6; no AABB, early-sign exit, arithmetic rearrangement or vertexwise existential union. If any qualification fails, return a private null sentinel and invoke the original some/every expression exactly once, with no prior unknown getter/Proxy/ToPrimitive access.

## Epoch, cache and cost boundaries

A09a C-record epoch must be installed/restored with try/finally covering thrown setup and draw failures. Nested record gets a child epoch; outer active state is restored, and the completed outer epoch is published for its immediate post-record normalization. Non-C/validationOnly paths do not issue certificates. Latest-epoch WeakSets/WeakMaps have no public registration API, only immutable fresh-only factories and boolean/primitive readers. Use captured WeakSet/WeakMap methods; current call/apply/bind substitutions must not leak private tables. An issuance cap disables acceleration rather than throws or skipping rendering. Explicitly bound unique issued outers/points and hints by the existing geometry envelope budget; do not claim arbitrary JS reentry stack/whole heap bound.

New helpers placed on A participate in cacheDependencies' own-property/function-identity walk09g130–138. The key ALGORITHM/codec can remain unchanged, but exact resulting dependency-key bytes cannot be promised unchanged merely because helpers are nonenumerable. If exact key-byte identity is required, this API addition needs a different agreed internal bridge; do not silently omit helpers from dependency checks.

Per-query lazy own-slot checks cost O(vertices) descriptors; map/species checks cost O(1) per polygon; initial collection proof costs O(all member edges). A true repeated-q hint can avoid O(K*E*V) old work, but a failed hint adds another full q trial before old search. Update order may oscillate between unrelated event owners. Actual winning-index/reuse distribution has not been retained in the diagnostic raw. A bounded correctness prototype should expose counts before claiming the optimization pays. Avoid recreating the rejected thousands-of-path-seam descriptor scans.

## Existing diagnostic: scope of potential gain

Offline existing raw topframes are in existing-diagnostic-topframes.json. New diagnostic measured newspaper9.2/7.8ms is conflict:09h307 skips coverage searches, so hints cannot help these frames. stampSheet18.2/6.8ms and postcard5.3/4.4ms use09i direct-body comparisons. warningLabel9.1/5.9ms is safe but normally has only one composition envelope, so an order hint provides little benefit. swissGrid4.4ms and clapper4.2ms are plausible search candidates; exact current envelope counts/winning indices were not recorded. These are past measurements, not a new profile or timing run.

Thus defer-upfront may improve planning, but it can move first-use costs into rendering. Hints may reduce a subset of coverage work. Neither design supports a claim that render+5.1ms or actual100/1000 requirements are solved.

## Required later pure/browser gates (NOT RUN HERE)

- Existing full55,673 numeric/observable oracle and new random/edge cases for all4 epsilons; exact booleans, late getter/ToPrimitive order and throw identity; no JSON-only numeric comparison.
- Deferred registration: changed before-freeze numeric values vs legacy full predicate, changed point refs/Proxy wrapper zero extra traps, getters, holes/prototypes/nonfinite/-0, mutation after freeze attempts, caps/duplicate/OFF/new-generation behavior. Native slice/private snapshot numeric setter/species/constructor/call/apply hook tests must prove no leak or fallback without extra callbacks.
- Hint: whole-poly-vs-union counterexample; unknown p/q/outer/collection Proxy traps unchanged; own some/every/map/constructor accessors; callback changing map/species mid-map; holes; public factory accessor/Proxy attempts; genuine mutable point changed before predicate; nested records/reentry and issuance cap. Known hint false must execute original complete order; success must have checked every required vertex against the SAME q.
- Normal-domain old complete output/graph/source/clock/program/pixel equality, native80record/80replay/80observations preserved, OFF/non-C controls and actual registered34 coverage. All existing FAIL retained. Browser/performance gates require separate parent authorization; no changed workload/waiver or record bypass.
