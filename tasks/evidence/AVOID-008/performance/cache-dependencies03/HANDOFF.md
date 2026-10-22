# Returned review fix: native helper/map/species eligibility

Base `a383e3ff6764b9dd5d4f175eecacaa2de04fc954` has a reproduced dependency-key collision and is NOT an accepted source. Its exact source is retained as `a383-source09g.js.gz` (SHA61351435c0a7a79c591961d6683b128f60df4966c92506b5272d21ba743cad4a).

First, the immutable-base pure Node actual collector reproduction changes Array.prototype.map to drop all rows, then changes J.native identity2→211 with the exact same input graph. The old full graph changes and still includes the map identity seam95. The a383 typed dependency key and complete dependency+input key collide; new seam rows are empty. `a383-actual-collector-counterexample.raw.json.gz` preserves the complete keys/source cause,35748raw bytes/SHA78e95d64f9553774bb52b44d0495b775fda681ee96055908c1f419ec02b0b8e9. This is an expected failing control, never rewritten as success.

Candidate09g SHAacd53f14e3ff03c8486d09ede3a579cd204d4a52317f3e6c992166204d2b87fc changes only private capture/eligibility and scalar calls to those captured helpers. The collector itself, old encoder/decoder, wholeinput/options/lineage graph, result payload, second verify, capacity32/128MiB/512header/two ledgers, geometry/render/clock/bounds and83other source files remain exact base bytes. The25-negative browser driver/B1corpus/perf runner are unchanged.

Capture actual Object/Array/JSON/Number/global objects and Object/Array prototypes, native getOwnPropertyDescriptor/getPrototypeOf/hasOwn/is/isFinite/JSON.stringify, and map/Array.prototype.constructor/Array Symbol.species descriptors. Eligibility uses the captured descriptor helpers rather than reading changed public getters. It requires own-data public helper identities, unchanged global bindings/prototypes, exact map/constructor/species descriptors (including getter identity/flags), original constructor identity and ordinary prototype chain, and no prototype toJSON. No species getter is invoked during checking. All checks repeat before metadata transformation, after arbitrary font graph encoding and after private JSON output. Changed callbacks/accessors are strict bypasses, not silently dropped dependencies.

Native map is retained for the private table transformation: it creates dense own data slots. A naive empty-array indexed-write rewrite would introduce inherited numeric setter behavior. The original collector still calls its original faces.map before private eligibility; the zero-callback/getter guarantee below applies to the isolated eligibility checks, not a claim that the unchanged collector can never invoke a changed legacy method before cache bypass.

Pure commands (no browser/timing):

```
node dev/avoidance/layouts-c-cache-dependencies-map-repro.cjs
node dev/avoidance/layouts-c-cache-dependencies03-test.cjs
```

`oracle-results.json`:258eligible exact old graph inverse cases,30individual collision mutations,18unsupported/cross-alias rejects,prior7guards and actual collector15mutations remain passing. All258eligible keys are byte-identical to a383 under normal native helpers; only newly rejected seams change eligibility. New23cases cover dropping map/accessor map, constructor data/accessor, species custom carrier/own-toJSON/getter/descriptor flag, captured descriptor/helper data wrappers and accessors, and global constructor accessors. Changed callbacks/getters invoked within those isolated eligibility checks:0/0. Five persistent post-font drift cases reject. The original actualcollector map counterexample now rejects both attempts without returning a dependency key. The old full graph still distinguishes the helper change.

`source-transform.json` declares exact replacements; reverse reconstructs immutable a383 source. `source-proof.json` verifies83otherSRC and all original harness/fixture bytes, plus deliberate compiled state. The previous conservative metadata bound remains unchanged and its pure16KiB boundary test passes; actual pool ledger calculations remain unchanged.

Build/browser/timing are intentionally NOT run. Parent explicitly stopped build until source review, so JA/EN still embed a383 source and are unchanged at old hashes4b2a227a…/139c2069…. They do NOT yet contain the candidate09g. Do not use them to claim current candidate browser correctness. A later parent gate must rebuild first and then establish40normal value/alias/native/call equivalence,25old negatives/new bypasses/schema/ledger/eviction. Actual byte stats may differ from6d; no false full-row byte equality claim.

Original random corpus formalFAIL,94/100staged and76/80C observations remain unresolved. No supported-domain fixture substitution, variant support, render optimization, formal/1000/CDP/timing or public check was performed.


## Subsequent parent-authorized build

After source-only8f1ef58 was submitted and source-reviewed, parent allowed JAEN build only. One `PYTHONDONTWRITEBYTECODE=1 python3 build.py` completed. Current JA01c9280a086705379db2927c0bac0d7d0dcc8b35d626585be4ac03a7fef92b53 and ENb68d17bb6af7937f41b9fad8219561cdaa8355f9135df720e68b73535761919e each embed exact candidate09g once. Olda383 compiled→new compiled is exactly that single module replacement;83otherSRC and original driver/25negative/corpus pins remain exact. Start frozen84source manifest equals observed end. `build-proof.json` supersedes only the intentionally-unbuilt *current state* above, preserving that source-review chronology. No browser/correctness/size/timing/formal/1000 run followed; the other owner's browser slot remains reserved.
