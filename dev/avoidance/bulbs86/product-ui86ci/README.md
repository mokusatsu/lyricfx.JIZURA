# Bulbs product main preview86ci

This connects the already-qualified limited86cc preparation/frame pipeline to the ordinary product build. Scope is the bulbs main preview: preparing state, explicit cancel/retry, typed unsupported/failure, and suppression of old generations. It does not extend other effects, certify all inputs, implement output/position/detail editing for this route, or accept preparation performance. Product source was not changed after actual01; later changes only add boundary tests and evidence documentation.

## Integration and supported boundaries

`generate.py ROOT` derives the ten cooperative dependencies from the existing tracked86cc/86bu/86j/86bp sources, derives the controller/adapter/session with bounded additions, and derives UI from the included frozen `12_ui.base.js` plus `ui-fragment.js`. Generated JS in this directory must byte-match the corresponding `src/` files. Both ordinary JA/EN builds regenerate byte-identically with `PYTHONDONTWRITEBYTECODE=1 python build.py`. The only shared finalizer difference is the previously qualified bulbs-only missing neutral glow equivalence in `src/09a_placement.js`.

Editable plans remain mutable. Every input/debounce/replan/actual Canvas size change revokes the private generation before publication. Font work is tracked and generation preparation is serialized with pending native/thumbnail loads. A cancelled font wait or queued step cannot publish; ready draws recheck the current plan, fonts, source and viewport. The preparation view is empty while waiting, cancelled or unsupported, and the overlay offers cancel/retry. Other current clock intervals use ordinary rendering. Target detection includes the renderer's trail offsets; manual/notation/locked cuts and disabled avoidance remain on their existing routes. Mixed/multiple or other unproved input domains retain the existing typed refusal rather than inheriting these fixture approvals.

Area and detail editing of targeted bulbs, alternate Renderer/Canvas snapshot, warm/short preview, and image/video output have explicit main-only boundaries. Screenshot throws into the existing toast/catch before `toBlob`/`saveFile`; export is refused before opening its export dialog. Settings/project serialization is unaffected. This is intentionally a main preview connection and must not be described as export equivalence. Shared renderer recovery from arbitrary exceptions or arbitrary unbalanced Canvas save/restore remains unqualified; the local coordinator can hide a failed partial image and revoke authority without redesigning shared rendering.

## Evidence and reproducibility

Run the lightweight tests without Qt:

```
node dev/avoidance/bulbs86/product-ui86ci/session-test.cjs
node dev/avoidance/bulbs86/product-ui86ci/font-queue-test.cjs
node dev/avoidance/bulbs86/product-ui86ci/route-test.cjs
```

Results: original14session checks,28additional failure/race checks,6font queue checks and15routing checks. Additional tests cover fonts/stage/begin/step/finalize exceptions, late old-generation rejection after new ready, queued plan replacement, and cancellation before/after publication. They use mocked runtime dependencies and are not actual-render evidence.

Git-external original source/actual/runtime directories are under `/workspace/jizura-logic-evidence-20261027/`:

- `bulbs-product-ui-source86ci01` / `bulbs-product-ui86ci-actual01`: original actual product UI preparation/cancel/retry/ready, input invalidation, INSUFFICIENT_SPACE, center exact hash handoff, area/export/screenshot boundary. Ready7.919s, max step61.2ms, scheduled cancellation callback6.4ms late in this single trial. No image/video serialization/save occurred.
- `bulbs-product-ui-source86ci-boundary02` / `bulbs-product-ui86ci-boundary-actual02`: failed test fixture. A requested600px width was still clamped to480×270 by viewport height, so `RESIZE_STALE` stopped the test. Failure remains recorded; it is not a product regression or a pass.
- `bulbs-product-ui-source86ci-boundary03` / `bulbs-product-ui86ci-boundary-actual03`: corrected400px request produced398×224 from480×270 and synchronously revoked the old generation. JA/EN each verify late cancelled fonts cannot be overtaken, rejected current fonts become explicit unsupported, preparation resize/cancel cannot publish, and a renderer throwing after filling a small partial rectangle leaves alpha0/model0/records0/bindings0 with failure overlay. Ordinary center, disabled-avoidance bulbs, dominoes, burst, contour, crossword each resolve their exact layout and draw one nonempty frame with inactive bulbs session. These smoke checks are not all-time pixel equality or proof of generalization of the other effects.

Boundary03 JA ready9.415s/max step67.4ms; EN8.388s/max step91.3ms. Historical86cc preparation was approximately9–11s. These are single wall observations with long tasks, not fast preparation, a guaranteed cancellation bound, percentile/CPU measurements or formal product performance acceptance. A cancel event cannot interrupt synchronous work already executing; cancellation revokes at the next event-loop yield. The explicit control and stale-result suppression make this delay interruptible between steps, without claiming the delay itself solved.

Every trial used `dev/avoidance/qt-resource-runtime/run_probe.py`, with capacity checked above the unchanged1GiB floor plus4MiB declared output on new boundary trials, and no concurrent Qt run. All three trials, including the failed02, confirm three normal page closes, owned child reaping, no signals/remaining children/ownership failures, and closed local port. Images, video, public URL/Sites/Pages access, and publication/readback were not performed.

Read and verify saved bytes without starting Qt:

```
PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/bulbs86/product-ui86ci/check-evidence.py /workspace/jizura-logic-evidence-20261027
```

The checker validates every recorded source and raw/gzip hash, preserved failure02, explicit JA/EN assertions and managed lifecycle. Original01/02 pinned a test harness that was later extended; the original bytes are copied to the new `bulbs-product-ui86ci-historical-pin-recovery03/` directory and indexed in `map.json`. Exactly three historical harness pins use those byte/SHA-matched executed snapshots:01session-test,02session-test and02boundary-browser. All product pins still match current source. The checker exposes these as `currentHarnessPinDifferences`; it does not rewrite old result/source or pretend historical current-path pins remained unchanged after later harness edits. The old session test came from `/workspace/jizura-recovery-product86ci-20261030/files/`;02browser came from its frozen source copy. New03pins all match directly.

`actual-summary.json` records exact original paths, result hashes, checker SHA, counts and limited measurements. Original raw lives outside Git; this summary is not a replacement for the raw.

To create a new run, first regenerate/build/verify, then use fresh source/output/runtime names:

```
PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/bulbs86/product-ui86ci/boundary-build.py ROOT NEW_SOURCE
PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/qt-resource-runtime/run_probe.py NEW_SOURCE NEW_OUTPUT --expected-bytes 4194304 --timeout 240
```

`build-test.py` and `boundary-build.py` explicitly depend on frozen `/workspace/jizura-logic-evidence-20261027/bulbs-variable-ui-source86cc01` service/browser/probe and `/workspace/jizura-browser-runtime-20261027/qt-page.cjs`. A clean checkout alone does not reconstruct this historical Qt host. Never overwrite frozen inputs/results. Actual01 and completed03 need no repeated render for documentation/review.
