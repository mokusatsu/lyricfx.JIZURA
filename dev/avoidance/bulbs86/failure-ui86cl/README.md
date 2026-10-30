# Coordinator failure boundary86cl

Parent final review found a local coordinator bug: `fail(g,e)` read `e.code/e.message` directly. A renderer throwing `null` or `undefined` therefore caused a second TypeError before the partial frame could be cleared. A throwing `runtime.cancel()` could similarly prevent the state callback and hide operation. This correction is confined to the coordinator and its UI error presentation; shared renderer Canvas-stack restoration is not redesigned or certified.

## Behavior

The coordinator normalizes arbitrary thrown values without assuming an Error object. Property getters/stringification are themselves guarded. Ordinary causes keep their existing code/message; otherwise null/undefined use `PREPARATION_FAILED`. The failure state keeps primary `error` separate from `cleanupError`. The failure path revokes ready before cleanup and reports unsupported even when cleanup throws; `frame()` hides the partial Canvas in a finally block. It captures generation before drawing, so an old draw failure cannot invalidate a newer generation created during that draw. A stale finalize path no longer blindly cancels a different generation.

Cleanup failure is sticky for the coordinator's lifetime. The first cleanup exception is retained; a later successful cancel cannot prove release of resources whose references may already have been dropped. Subsequent invalidate/cancel/reject/begin operations therefore retain the cleanup failure; `begin()` returns before fonts/stage/step. There is no in-session reset or unsupported claim of successful release. Reloading the application creates a new session. UI shows cleanup failure plus reload guidance and hides retry while that failure is present. A stopped session with cleanup failure still clears the main Canvas and displays the failure when its visible bulbs clock is targeted. Ordinary failures without cleanup failure retain retry.

Canonical coordinator source is `failure-ui86cl/session86.js`. The existing `product-ui86ci/generate.py` now copies that source into its generated session template; other modules still derive from the same prior sources. UI error presentation remains in `product-ui86ci/ui-fragment.js`. `src/11zz11_bulbs_session86.js`, `src/12_ui.js` and JA/EN HTML are regenerated normally.

Before editing, eight affected files were copied to `/workspace/jizura-logic-evidence-20261027/bulbs-failure-ui86cl-pre-edit/`; `map.json` records original path, immutable snapshot, bytes and SHA. Existing raw/results/frozen sources/earlier checkers remain unchanged.

## Verification

```
node dev/avoidance/bulbs86/failure-ui86cl/test.cjs
node dev/avoidance/bulbs86/product-ui86ci/session-test.cjs
PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/bulbs86/failure-ui86cl/check-evidence.py /workspace/jizura-logic-evidence-20261027
```

99new pure assertions use the real coordinator: null/undefined/0/false/string/Symbol and throwing getters/stringifier, partial draw clearing, primary and cleanup errors separately, cancellation/stop cleanup exceptions, sticky refusal after later successful cancel, stale drawing generation and late rejected font promise. Existing14session+28failure/race assertions also pass. Syntax, template/source correspondence and `git diff --check` pass. Mocked resources do not prove actual cleanup when cleanup itself fails.

One small managed Qt supplement uses `/workspace/jizura-logic-evidence-20261027/bulbs-failure-ui-source86cl01` → `bulbs-failure-ui86cl-actual01` in JA and EN. It creates fixture runtime failures with the actual product coordinator, actual main Canvas/DOM and exact product `clearBulbsView86ci`, `showBulbsState86ci`, `onState` source callbacks. This is not a claim that an actual stock renderer produced those exceptions. A small filled rectangle followed by null/undefined throw becomes alpha0/unsupported/primary PREPARATION_FAILED. Cleanup-undefined also exposes cleanupError=CLEANUP_FAILED, reload text, hidden retry; a later successful cleanup still cannot restart fonts/stage, and stop clears the view while keeping failure visible. The trial verifies compiles0 and does not wait for/repeat a completed bulbs proof.

Result complete=true,4raw records,errors0,post-execution pins unchanged; all190pins match current files directly. Managed runtime confirms3normal page closes, owned-child/service reap, signals0/remaining0/ownership failures0 and closed port. The unchanged1GiB spare plus declared4MiB gate passes. Media/image/video generation/viewing and public/Sites/Pages access remain0. Ordinary source/numeric evidence/runtime diagnostics are the only disk output.

The final checker validates all seven86ci/cj/ck/cl source/raw/runtime sets. Intentional historical current-path changes resolve through the byte/SHA-matched pre-edit/historical snapshots; each is exposed in `currentSourcePinDifferences`. Final86cl01has no differences. Earlier failed fixture02 remains a failure. `actual-summary.json` records exact paths, result/checker hashes and limited assertions. Earlier checkers are preserved as checks of their earlier current-source states.

Use new namespaces only if a later source change needs another trial:

```
PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/bulbs86/failure-ui86cl/build-test.py ROOT NEW_SOURCE
PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/qt-resource-runtime/run_probe.py NEW_SOURCE NEW_OUTPUT --expected-bytes 4194304 --timeout 120
```

The builder explicitly reuses the86cj/86ci builders and frozen86cc offline Qt/browser runtime. A clean checkout alone does not reconstruct that historical host. Completed evidence needs no redraw for review. Source performance, arbitrary shared renderer stack/state recovery, all-input/all-time paint and actual cleanup after a failing cleanup function remain outside this result.
