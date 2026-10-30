# Bulbs previous model / placement reuse86co

Independent sidecar at product HEAD `cf8a64d2`. Product src, JA/EN HTML, earlier evidence and renderer are unchanged. This is a bounded performance proposal, not product adoption or cold-performance acceptance. Implementation: gpt-6.1-sol / medium; parent review/commit pending.

The owner already has a geometry key that excludes only the circle center/radius. `park()` deletes the old opaque handle, clears its generation/input references and keeps one immutable model by reference. Matching geometry input, exact font/source dependency revision/FontFace snapshot and the same dedicated renderer/context/viewport admit a new handle. Changed input, independent metric revision or viewport discard the old model and compile normally. Explicit cancellation/stop/failure drops retained data. No revision is ignored, no arbitrary model/raw input becomes authority, and no extra generic cache is introduced.

The controller deletes the old ticket/certificate before retaining one private accepted proof, containing reference index, held quality, recipe/delta and aggregate groups. It never reuses old authority. With the same resident model ID, timing range, viewport and pristine context, every previous group is evaluated against the new circle using the unchanged exact geometry evaluator. The first failure ends this attempt; the existing candidate/position/replay path runs. If all groups pass, the previous position wins and a fresh record/certificate is issued. Current-frame preflight and source drawing are unchanged.

The UI font entry reuses the existing domino completed-request predicate and its `readDominoFonts82aq` helper, with a separate bulbs memo. Only identical completed text/font/fallback requests, loader, loaded FontFace objects/attributes and metric revision can omit redundant font loading/cache clearing. It still runs in the existing serialized font queue. Changed or independently cleared font state reloads normally. No shared renderer exception recovery is added.

## Saved comparison

All numbers are single observations in fixed old→new order, on the same input, 480×270 viewport, font/runtime and circle. Main UI stays clear until ready, and old private plans are refused before bitmap changes.

| Condition | Old wall | New wall | Old max coordinator step | New max step | Compile / steps, old→new |
| --- | ---: | ---: | ---: | ---: | --- |
| Same input replan | 26.647s | 0.181s | 1422.8ms | 11.1ms | 1/538 → 0/2 |
| Circle `.52,.1,r=.09` | 25.239s | 0.189s | 1076.2ms | 17.6ms | 1/538 → 0/2 |
| Prior position collides, `.5,.1,r=.12` | 8.280s cold reference | 3.535s with retained model | 72.0ms | 29.4ms | 1/538 → 0/253 |

For same input, old/new frame hashes and dy25.428563044469847 match. On the benign circle change, new reuses that previous dy; old exploration chooses dy22.728563044469844 and has a different frame hash. The new circle frame matches the **same-position initial/same-input frame**, not the old changed-circle result. Every retained support clears the new circle.

The collision case fails at the fourth previous aggregate group, then uses normal exploration, selects dy30.828563044469846, and performs the original250-clock replay. Its timing/budget-excluded semantic model hash, all1754 support contributions/250 reference coverage, accepted proof groups and actual frame hash exactly match the old cold reference. Candidate count grows by2 only on that fallback. Successful warm reuse adds no candidates, no scalar/glyph construction and no replay: it evaluates all10 accepted aggregate groups (10 geometry calls/10 bounds instead of the old4 calls/40 bounds including candidate tests). The unchanged cold model records250 selected clock states,5456 glyph matrices across recipes,19884 ring points and40 source groups. These are compile work counts, not individual pixel or all-time paint counts.

`src/11zz08b_bulbs_replay86.js` iterates every `model.schedule` entry, every template support and every item glyph, transforms its bounds, and unions them by pass/semantic, incrementing `scalarContributions`. The accepted10-group proof contains1754 such contributions and250 schedule references. Reusing its union retains inclusion of all previously proved parts/clocks because model/geometry/font/context are unchanged. The checker also independently compares every saved group with the new circle/stage using Python Fraction. This does not add a new ink-collision or whole-input proof.

Cold remains slow and variable: initial old55.224s/max step10.889s, new24.993s/max3.609s; supplemental old8.280s and new8.632s. These are preserved facts, with no established cause or cold improvement claim. The coordinator step timer covers `runtime.step()` including validation/accounting; it excludes font loading, replan, finalize and ordinary frame/hash work. Wall runs from the UI change through observed ready, including old-plan refusal and polling; numeric hashing follows it. These maxima do not bound every main-thread block.

## Retention and invalidation

The model stays one reference, resident1,114,348B. Parked proof32,169B, with adapter/registry reservations the observed parked total is1,348,454B. Successful new02 peak3,825,235B vs old3,825,198B. In executed new05, retaining an unnecessary old proof during independent-revision cold raises the recorded peak to3,857,404B. All are below the unchanged8MiB limit. These are the existing serialized working/resident accounting, **not JS heap/RSS or Canvas allocation measurements**. No second old/new model is retained.

The final source adds exactly one adapter line after05: when `owner.beginPreparation86c().state().phase !== 'reusing'`, `issuer.clearPrevious()` releases that unnecessary proof before first scalar and the adapter budget check. The4-check actual-method mock confirms warm retention and cold release. This line has **not** had another Qt run. Actual05 numeric timings/peaks refer to the pre-line version; its geometry/render/fallback evidence applies because that computation is unchanged. The final source has a different adapter/generator pin, resolved through sourceprep03 for old executions. No claim that the lower final cold peak was measured is made.

Actual05 independently clears metrics and recompiles; changing the effective glyph font from dela to gothic_bold is rejected by original `BULBS80_FIXED_NATIVE_FAMILY` with no old display. After the necessary default-font owner restore, changing only viewport to640×360 rejects `BULBS86AL_PLAN` and releases the model. This existing viewport limitation is preserved. Actual02 cancellation drops cached model/proof/records/bindings, clears the view and refuses old authority. Pure owner checks additionally exercise actual input/text and viewport cold invalidation; font pure checks cover loader/fallback/face/revision mismatch. These do not claim all font or viewport combinations work.

## Frozen evidence and reproduction

External base: `/workspace/jizura-logic-evidence-20261027/`.

- `bulbs-previous-model-source86co-{old,new}02` → `bulbs-previous-model-{old,new}-actual86co02`:187pins/2raw each, successful initial/same-input/circle comparison.
- `bulbs-previous-model-source86co-old04` → `bulbs-previous-model-old-actual86co04`:190pins/2raw, collision-circle cold reference.
- `bulbs-previous-model-source86co-new05` → `bulbs-previous-model-new-actual86co05`:190pins/2raw, collision fallback/revision/glyph/viewport supplement.
- Each actual has sibling `-runtime/host.json`:3normal page closes, owned children exit0/reaped, signals0/remaining0/ownership failures0, debugging port closed. Expected output4MiB, >9.9GB available at start, unchanged1GiB spare floor, no concurrent Qt.
- `source86co-old01` and `source86co-old03` retain producer failures: ambiguous whole-HTML geometry function and an ambiguous harness replacement, respectively. `failed-builder.py` is preserved; no Qt ran for either. `source86co-new04` is an unused generated candidate; it did not run. No failed raw/result is rewritten.
- `bulbs-previous-model86co-sourceprep01/02/03/pins.json` map every changed sidecar execution-time file to byte-identical snapshots. `sourceprep01/preflight.json` records exact Qt zombie enumeration:1136, all existing before the first managed runner (newest PID162719 vs first managed service165753), no live Qt. Earlier summary counts used a different enumeration. No unrelated process was signalled.
- Final files are pinned separately in `bulbs-previous-model86co-sourceprep04-final/pins.json`.

```
node dev/avoidance/bulbs86/previous-model86co/owner-test.cjs
node dev/avoidance/bulbs86/previous-model86co/controller-test.cjs
node dev/avoidance/bulbs86/previous-model86co/font-test.cjs
node dev/avoidance/bulbs86/previous-model86co/adapter-test.cjs
PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/bulbs86/previous-model86co/check.py /workspace/jizura-logic-evidence-20261027
```

Pure27 total; checker validates4actual runs/8raw, all execution pins with explicit historical snapshot resolution, raw hashes/caps, lifecycle and the comparisons above. It does not redraw. Initial02 `modelHash` includes timing/budget and varies even between old compiles; it is not used to prove old/new semantic equivalence. The04/05 supplement intentionally removes only timing/budget for that comparison.

`generate.py ROOT` deterministically emits the five sidecar modules from current product source; it does not alter product files. `build.py ROOT NEW_SOURCE old|new [residual]` builds a fresh offline trial using the existing86ci/frozen86cc host. Future Qt, if necessary, must use the maintained resource runner. No PNG/video/media, public/Sites/Pages request or normal-output implementation occurred. Product integration and its minimal regression remain subsequent work after parent review.
