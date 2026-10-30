# Live product UI boundary supplement86cn

At HEAD409b994b, this closes three specific missing live-product cases. Product src/build/HTML, earlier evidence and production coordinator/runtime are unchanged. Unlike86cl's fixture runtime, this trial uses the actual UI coordinator, private runtime, real owner/compiler/issuer and main Renderer entry. Only J.ensureFonts completion and the actual renderer entry are temporarily fault-injected; original functions/property descriptors are restored before real owner preparation resumes.

The single successful JA run first holds the completion of a real font request. Its generation is cancelled and replaced. The replacement stays fonts/compiles0 while that old promise is pending; after rejecting the old completion with undefined it prepares/compiles once and reaches ready. Later queued work does not invalidate its generation or stable bitmap hash. The serialized font queue intentionally waits for in-flight requests to settle; this does not promise progress if a browser font request never settles.

At each of the first two genuine ready owners, the real runtime calls the actual Renderer entry with its genuine private formal plan. The injected entry fills a small rectangle then throws null or undefined. Actual coordinator state becomes unsupported/PREPARATION_FAILED, cleanupError null, alpha0/failure overlay, with real resident model/records/bindings/active-frame bytes0. The unwrapped renderer and fonts are restored. Retry recompiles through the real owner before the second case.

Then the real UI switches to center, confirms ordinary rendering and owner release, and switches back to bulbs. The pending view is empty, a new real compile reaches ready, and older private bound formal-plan authority is passed to the original renderer. Immediately after failure it rejects with BULBS80T_OWNED_PLAN_REQUIRED; after the new ready generation it rejects STALE_PLACEMENT_PLAN. Every attempt records bitmap-write counters0 and unchanged full numeric RGBA hash; it does not export a raw ticket/token/model or grant authority via a test wrapper. The new generation remains ready. Final real cancel releases model/records/bindings and clears the view.

The three distinct necessary ready intervals are8.472s/8.574s/8.176s, compiles1/2/3. They are single wall observations, not performance acceptance. There is no approved-media regeneration, all-time paint replay, PNG/image/video generation or viewing, public/Sites/Pages access, or shared renderer Canvas-stack recovery claim.

## Evidence and preserved first attempt

Git-external source/output/runtime are under `/workspace/jizura-logic-evidence-20261027/`:

- `bulbs-live-boundaries-source86cn01` / `bulbs-live-boundaries86cn-actual01`: failure preserved. The stale-authority instrumentation restored native ctx methods by assignment, leaving own properties where they had been inherited. Actual native-method guard correctly refused the next ready frame with BULBS69_STOCK_CONTEXT_METHOD:fill. This is a harness restoration bug, not relaxed source admission.
- `bulbs-live-boundaries-source86cn02` / `bulbs-live-boundaries86cn-actual02`: exact own-property descriptor restoration fixes the instrumentation; complete=true,2raw,errors0/postpins unchanged. All177pins match current executed input directly.

01only stored page-init and the final thrown failure object, not separately returned successful case records. Its private formal authority existed only in the closed process and cannot be reconstituted from JSON. Repeating the required owner-generation sequence in02was necessary to finish the missing boundary; it was not a repeated all-time/media oracle. No01result/raw/source is rewritten.

01's original browser-test.js is7882B SHA716e7391d74d10e0a6488d2656bbf0696dcf43abce144ebfeb5a4ef72073c421, identical both in the frozen01source and new `bulbs-live-boundaries86cn-harness-recovery01/browser-test.js`. That recovery's map records original path/bytes/SHA/snapshot. The checker reports this one historical current-path harness difference explicitly;02has none.

```
PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/bulbs86/live-boundaries86cn/check-evidence.py /workspace/jizura-logic-evidence-20261027
```

The read-only checker validates all ten previous/current source/raw/runtime sets, original gzip/JSON hashes, per-record8MiB/total128MiB JSON/32MiB gzip caps and the exact successful live-boundary assertions. `actual-summary.json` records result/checker hashes, timings and source recovery paths. Old checkers remain unchanged historical snapshots. The parent independently checked02's177pins/2raw/normal lifecycle.

Both runs use the managed runner:1GiB spare floor plus declared4MiB output, approximately11GiB free, one Qt run at a time. Both confirm3normal page closes, service/owned-child reap, signals0/remaining0/ownership failures0 and closed debugging port. Small source/numeric/runtime evidence is retained; no unnecessary media or large temporary artifacts were generated or need deletion.

To create a new trial only for a new implementation change, use fresh names:

```
PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/bulbs86/live-boundaries86cn/build-test.py ROOT NEW_SOURCE
PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/qt-resource-runtime/run_probe.py NEW_SOURCE NEW_OUTPUT --expected-bytes 4194304 --timeout 180
```

The builder explicitly reuses the earlier86ci/frozen86cc offline host; clean checkout alone does not reconstruct that historical Qt environment. Existing completed evidence needs no redraw for review.
