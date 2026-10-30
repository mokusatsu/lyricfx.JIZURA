# Burst previous model/proof reuse83bf

Source-only proposal over product HEAD `2358e5d6`, gpt-6.1-sol / medium. Product src/HTML are unchanged. The parent requested this independently reviewable unit before further product work. No renderer, native sampler, compiler, clock, post/fast scope, candidate geometry, current-frame drawing or output guard is modified.

The existing model holds immutable row/clock/index tables, per-part local geometry/glyph metrics/root and a source union. It does **not** retain exact destination support bounds. Adding delta to source bounds would not reproduce Canvas rounding, so no approximation or extra bounds array is introduced. Same input reuses the trusted model/proof references with a new handle, without compilation, candidate generation or support replay. Circle change shares the immutable tables (only sourceKey metadata is retargeted), runs the original destination replay at the previous delta for every owner and evaluates every support against the new circle. The first failed owner ends this attempt and returns to the original candidate selection and complete destination proof. If every owner passes, the previous position wins.

Parking clears formal certificates/tickets/publication/old handle before retaining one private model/proof. Old generation callbacks are not kept. Cache identity excludes only circle center/radius, retaining all other input, source, language, layer, timing and region fields. Existing dependency snapshots still require exact font metric revision, FontFace identities/attributes, helpers and prototypes. Input/viewport/explicit cancel/stop/failure discard the cache; matching replan/begin/debounce can park it. Viewport update remains permitted only with no active resources, and a different viewport discards the parked data. A cache attempt whose new reservation exceeds8MiB is discarded and the normal cold compiler is used; no limit is relaxed.

Burst's font phase uses the existing completed-font request predicate and `readDominoFonts82aq` helper, with its own one-entry memo inside the shared serialized font queue. Only identical completed text/fonts/fallback/loader/loaded FontFace objects/attributes and metric revision skip redundant loads/cache clears. Independent revision/face/input changes cannot use previous geometry. No new generic cache or exception recovery framework is added.

## Same-runtime observations

Each comparison is one observation, old→new fixed order,480×270, actual normal main preview, dela, `風の先へ`, same seed/style/clock and runtime. Compile counts are compiler-generator starts; destination replay counts exclude the compiler's separate zero-reference replay. A cold compile verifies250 zero-reference owners in addition to the250 destination owners shown here.

| Condition | Old wall → new wall | Old max step → new | Compile | Destination replay | Support checks | New candidates |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Same-input replan | 5.459s → 0.303s | 44.3ms → 1.6ms | 1 → 0 | 250 → 0 | 3392 → 0 | 2 → 0 |
| Clear new circle `.71,.42,r=.19` | 5.384s → 1.991s | 52.0ms → 20.7ms | 1 → 0 | 250 → 250 | 3392 → 3392 | 2 → 0 |
| Collision circle `.68,.42,r=.21` | 5.325s → 2.450s | 153.4ms → 27.0ms | 1 → 0 | 250 → 277 | 3392 → 3809 | 2 → 2 |

Original input model counts:112 clock states,250 active owners,3392 supports,964 glyphs,250 verified zero-reference owners. Same-input old/new semantic model hash, adopted delta and actual frame hash match. On the clear circle the new path retains dx−57.94792994294437; old cold selects dx−50.44792994294443. The new clear-circle frame matches the initial/same-position frame, **not** the old clear-circle frame. Model tables/clock remain the same; the new circle is checked by the exact old replay/evaluator. On collision, the first27 owners/417 supports are attempted at the old position, then original exploration selects dx−70.24792994294432 and replays all250/3392. New final model hash, delta, counts, circle/slack and frame hash match the old collision cold reference.

Initial cold is still unresolved: old6.611s vs new7.439s; another new initial7.033s/max362.6ms and independent-revision cold7.125s/max338.2ms. No cold improvement or stable latency guarantee is claimed. Earlier bulb/domino cold anomalies remain separate unresolved issues. The coordinator maximum covers runtime.step, excluding replan/font/finalize/frame/hash work. Wall starts before the UI change, includes stale-authority refusal/polling and ends at observed ready; numeric hashes follow it. Semantic hashes omit only model.budget. Each destination replay/evaluation uses the unchanged source; no sample replaces final acceptance.

## Capacity and validity boundaries

No additional all-support array is retained. The model is1,789,828 serialized bytes; parked model/proof/control reservation peaks2,168,345B. Executed new proof peak2,340,139B vs old2,334,900B, including the added geometry-key metadata under the unchanged8MiB cap. These are existing serialized accounting, not JS heap/RSS/Canvas allocation measurements. Same input shares the exact model/proof objects; circle retargeting shares the same immutable tables, not a second full model. A synthetic oversize-cache test verifies cold fallback. No near-cap real Qt trial was added.

Executed versions are deliberately distinguished.01 tests the initial same-input path.02 additionally clears the temporary old cache wrapper before reservation checking.03–05 include the local cache-over-budget→cold branch; below-cap same/circle behavior is otherwise unchanged, and that branch is tested in the actual-method mock. No old source/result/pin is rewritten. There is no additional Qt repeat of successful same/circle conditions after the capacity branch;03–05 qualify real cold/invalidation on its source version.

Actual UI boundaries:

- 02 independently calls metrics.clear: new compile1/250destination replay/3392supports, with old authority refused.
- 03 edits the actual lyrics input to `風の先まで`: a completed276-owner/3959-support model and ready frame are saved. Input event plus immediate replan starts two compiler generations, one superseded. The harness wrongly requires exactly1 start and fails **after** the completed new input. Its failure remains complete=false, not reuse success.
- 04 resumes with that input, then changes only viewport480×270→640×360: compile1/276replay/3959supports, old authority refused, ready. A stale hard-coded cases[2] index then throws. The saved viewport success and failure remain separate; no product fix was made for either fixture error.
- 05 recreates only the required ready640owner, changes the effective glyph font to gothic_bold and receives existing `BURST83N_PARAMS`, with clear view/cache/model release. Returning to dela, it cancels after actual preparation steps; cached/model/preparing/formal binding/certificate counts all0, clear/cancelled remains stable. Successful input/resize comparisons were not repeated.

FontFace attribute/revision/fallback/loader identity cases are pure/source checks. Actual FontFace object replacement is **not** a Qt test. The actual glyph-font case proves invalidation and existing unsupported handling, not general support for another font. The supported font/input/FX domain is unchanged. Prepared/source tokens never come from imported raw or arbitrary models.

## Evidence and review commands

External base `/workspace/jizura-logic-evidence-20261027/`:

- `burst-previous-model-source83bf-{old,new}01` and `burst-previous-model-{old,new}-actual83bf01`:188pins/2raw each, same-input pair.
- `...source83bf-{old,new}02` / `...{old,new}-actual83bf02`:189pins/2raw each, circle pair plus new independent revision.
- `...source83bf-new03/04/05` / `...new-actual83bf03/04/05`:192pins/2raw each;03/04 preserved fixture failures,05 complete=true.
- `burst-previous-model83bf-sourceprep01…05/pins.json`: exact historical changed harness/module/producer bytes. `sourceprep01/preflight.json` records baseline HEAD,9.89GB free, Qt zombies1132/live0,4MiB expected output. All7runs normally close3pages, service/owned children exit0/reaped, signals0/remaining0/ownership failures0, closed debug port. The two failed probes have expected Node exit1. No unrelated process was signalled.
- `burst-previous-model83bf-sourceprep06-final/pins.json`: final source/review and baseline core/UI required for generation reproduction. Product remains unchanged.

```
node dev/avoidance/burst83/previous-model83bf/owner-test.cjs
node dev/avoidance/burst83/previous-model83bf/boundary-test.cjs
node dev/avoidance/burst83/previous-model83bf/font-test.cjs
python -B dev/avoidance/burst83/previous-model83bf/check.py /workspace/jizura-logic-evidence-20261027
```

Pure35 and7run/14raw checker PASS; parent independently reran both. The checker resolves exact old pins, verifies hashes/caps/normal cleanup, separates partial successes/failures and compares models/frames/work counters. It does not draw or claim a new all-input geometric oracle. Generator/source comparison keeps the qualified sampler/compiler/replay and current-frame paths unchanged. The initial producer stopped on an outdated viewport replacement needle before any Qt; that source context was corrected before source01 was pinned. Early mock fixture syntax/clock/dep omissions were corrected before pure PASS; no Canvas acceptance is inferred from mocks.

`generate.py ROOT` emits four owner/session fragments plus a candidate UI from the baseline product and makes no product writes. `build.py ROOT NEW_SOURCE old|new [same|circle|boundaries|remaining|font-cancel]` reuses the existing86ci/frozen86cc offline host. The failed boundaries/remaining variants are retained historical fixtures, not recommended reruns. Any necessary future Qt uses the resource runner,1GiB spare plus declared output, one at a time. No image/video/media, approved fixed-motion regeneration, public/Sites/Pages access or shared renderer redesign occurred. Product application/regression is the next stage after this parent review checkpoint; no current product speedup is claimed yet.
