# C nativePath first-local-hull prototype — parent review required

Basis: isolated `/workspace/avoid008-final-c34`, HEAD `446ed00a8a9d42ca5d06d30603083142caf65386`. Product owner changed only `src/09a_placement.js` and rebuilt JA/EN. No browser, timing, image inspection, public operation, main-tree write or Git mutation. Existing `record-readonly-analysis01/` belongs to the integration agent and was preserved.

Candidate 09a SHA256: `2d28d216f438a68aee8a5b9468ec82b4444fa23ca1e13f9e23ab3208a5767ea9`.

## Scope and admission

Only C raw fill/stroke's FIRST local `bounds(convexHull(expanded points))` can use scalar extrema. Native B-only, C-false and validationOnly use the literal old expression. Native commands, painter state, strokePad computation, rect reconstruction, A.point calls, final WORLD convexHull, event validation, all shapes/thresholds/clock/continuous certificates and codec09g are unchanged.

A new private bOwned flag starts at each private beginPath array birth and becomes permanently false for that path if the stock check fails. Checks occur before the argument validation/slice seams, after getTransform callbacks, after arcTo Math callbacks immediately before append, and around paint's stroke expansion. These checks cover own data/accessor descriptors of original A helpers, relevant Array/Number/Math operations, Array constructor/species and iterator next. Array/Object prototype numeric properties are rejected before native append: a native push alone can still invoke a setter which retains its receiver. Restoration of a custom push/slice/species hook cannot restore bOwned. The old operations still execute for failed provenance; there is no Proxy inspection of foreign points.

Admitted guarded-point coordinates must be primitive finite Numbers with absolute value <=100000; each actual +/-1 operation must remain strictly noncollapsed. The expanded box must be nondegenerate and its subsequent x0+(x1-x0), y0+(y1-y0) reconstruction must round-trip exactly. Otherwise the old expression runs, including its original large-coordinate/overflow errors. Boolean input remains legal to the legacy argument guard, but cannot enter scalar extrema. Stroke's existing two diagonal expansions are preserved before four-corner AA extrema; pad and AA arithmetic are not merged.

The scalar min/max encloses ALL of the actual four-corner expanded set. The old monotone hull returns a subset of that same set, hence local bounds are identical or conservatively larger; exact equality for every finite float is not assumed. No last-world-hull or circle proof is removed. The proof is of the local expanded set, not a replacement floating predicate or a claim that every arbitrarily ill-conditioned transformed old rounding artifact is bit-identical. Browser admission still needs the canonical complete-program/geometry/pixel oracle before adoption.

Bootstrap premise: the module's captured standard builtins are the original application bootstrap intrinsics; runtime modifications after capture are handled by the guards. This prototype does not establish trustworthy originals for a realm already maliciously modified before the source is loaded. No new global realm-validation framework was added.

## Pure evidence

`pure02.json`, driver `dev/avoidance/layouts-c-native-path-extrema-test.cjs`:

- 60 full native-record program + callback-order differential cases, exact Node deepStrictEqual AND v8 graph/value serialization comparison; 37 take extrema,23 retain legacy.
- 34 stored-plan geometry cases use immutable payload-tree-browser01 raw coordinates re-expressed as line paths. These are real stored coordinates, NOT actual source-renderer Canvas executions or canonical workload native commands.
- 26 synthetic arc/curve/fill/stroke/large-set and edge/hook cases: 1161 halftone-like arcs,4096 points, signed zero, boolean, NaN/Infinity, overflow, +/-1 collapse, outside range, helper getter/Proxy, Math hook, transient push/slice/species restore, Proxy slice output, inherited numeric setter, native arcTo and a Math callback installing/restoring push mid-command; B-only and validationOnly controls.
- Independent expanded-point and old-local-box containment oracle120/120, all120 exact for those selected finite sets. It does not claim exhaustive floating equivalence.
- `pure02-full.raw.json.gz` contains BOTH complete compared outputs and traces as base64 Node v8 serialization (preserves -0/undefined/aliases); summary alone is not the raw target. Its SHA is in pure02.json. No tolerances or target omissions.
- The first driver attempt's recursive trace.push RangeError was a harness-only failure; `pure01-driver-failure.json` preserves it. pure01.json is the earlier successful prototype report before splice-descriptor coverage; pure02 is the current report. Old giant-coordinate failure diagnostics are preserved in full raw and summary. `prior-readonly-study.md` preserves the earlier more restrictive analysis.

## Preservation and reverse proof

`before.json` pins84 source files,JA/EN and the existing pyc if present. `protected-and-reverse.json` proves83 unchanged sources and exactly three changed product paths:09a,index.html,en/index.html. Its reverse patch ran ONLY on a disposable /tmp copy and reconstructed the original Git09a bytes. Replacing the one candidate09a occurrence in each current generated HTML with the exact before source reconstructs both original HTML files byte-for-byte. Before and candidate source/compiled/driver bytes are independently gzip-fixed here. `source.patch` is the scoped product diff.

`PYTHONDONTWRITEBYTECODE=1 python3 build.py` succeeded for both editions. node --check passed for09a and the driver. This is a pure/build checkpoint, not browser correctness or performance acceptance.

## Cost / stop boundary

The sound provenance guard is not free: it inspects method descriptors and enumerates two prototype key sets. The1161-arc case invokes it2325 times; the4096-point case8195 times. These counts are pure structural observations, not timings. It can erase or exceed the saved sort/hull work; no speedup is claimed. Splitting capture-only vs paint-only checks might reduce that cost but has NOT been implemented or justified in this checkpoint. Parent should review the source/provenance burden before authorizing a browser gate; abandoning this prototype remains reasonable if it is not cheap enough.

Previous aggregate hull CPU34.746ms/80 (~.434ms/frame) includes more than this first hull. No p95 improvement or closure of the +5.5ms render failure is promised. Source/build are now fixed for parent review. No benchmark, formal100/1000, media or public check was executed.
