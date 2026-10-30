# Hidden lyrics preparation UI86ck

Final review found that86cj safely allowed output with hidden lyrics but86ci's UI prepare predicate still selected hidden bulbs. Replan/resize could consequently start the approximately9-second private preparation/font pipeline for a layer that cannot be displayed. This correction changes one UI predicate: `bulbsTarget86ci(plan)` now first checks `plan.layerVisibility.lyrics!==false` before the unchanged controller preview selector.

Hidden lyrics therefore follow the existing ordinary replan/font/warm path and never begin the dedicated bulbs session. This does not disable ordinary application font loading. Displaying the lyrics layer triggers its existing replan listener and starts the normal bulbs font/preparation sequence again. Hiding it during preparation revokes the current generation and releases its model/records/bindings. Controller geometry, ownership, output preflight, source draw, cancellation/proof conditions and other effects are unchanged. The shared selector `targetsPreview` remains independent of layer visibility for its existing users; only the UI preparation route is narrowed here.

The source of the one-line change is `product-ui86ci/ui-fragment.js`; `generate.py` reproduces it into `product-ui86ci/12_ui.js` and `src/12_ui.js`, then ordinary `build.py` emits JA/EN HTML. Before editing, the five affected current files were copied byte-for-byte to `/workspace/jizura-logic-evidence-20261027/bulbs-hidden-ui86ck-pre-edit/`, with original paths/bytes/SHA/snapshot paths in `map.json`. Existing source/result/raw files are not rewritten.

## Verification

```
node dev/avoidance/bulbs86/hidden-ui86ck/test.cjs
PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/bulbs86/hidden-ui86ck/check-evidence.py /workspace/jizura-logic-evidence-20261027
```

9pure checks cover visible/hidden/default/null/non-target selection, hidden short-circuit before controller lookup, and display restoration. Syntax and `git diff --check` pass. Matching generated source/template/JA/EN helper bytes are checked.

One new managed Qt trial, `/workspace/jizura-logic-evidence-20261027/bulbs-hidden-ui-source86ck01` → `bulbs-hidden-ui86ck-actual01`, runs only the missing lifecycle matrix in JA and EN:

- Hidden initial plan, repeated replan and actual resize480×270→398×224: compiles0, session inactive/not ready, preparation overlay hidden.
- The real lyrics layer button restores visibility: fonts then preparing, compiles1 and preparation overlay shown.
- The real button hides it during queued preparation: session stops, ready false, model/records/bindings0, overlay hidden. After120ms no stale generation publishes or compiles again.
- Another show starts fonts again; explicit cancel and then hide work. Center retains the ordinary inactive session path.

Both languages pass. This trial deliberately cancels after one preparation step; it does not repeat completed9-second proofs, accepted media, all-time paint or performance tests. General application font work is not asserted to be zero. The new behavior is zero dedicated bulbs compiles while hidden and normal preparation restart when shown.

The result has complete=true,4raw records,errors0,post-execution source pins unchanged,188pins directly matching current source. Managed runner confirms3normal page closes, service/owned-child reap, signals0/remaining0/ownership failures0 and closed local port. Pre-generation capacity exceeded the unchanged1GiB floor plus declared4MiB. No concurrent Qt trial, media/PNG/video generation or viewing, public/Sites/Pages access or actual external output occurred.

`actual-summary.json` records result/checker hashes, measurements and executed source locations. The new checker validates all six86ci/cj/ck trial source/raw/runtime sets, preserving the earlier failed resize fixture. It resolves intentionally changed historical current-path pins through the byte/SHA-matched pre-edit snapshots and reports each as `currentSourcePinDifferences`. Use this checker for the current source chain; earlier checkers describe earlier current-file states and are left unchanged. Final86ck01has zero source pin differences.

If a later implementation change requires a new trial, use fresh namespaces and the managed runner:

```
PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/bulbs86/hidden-ui86ck/build-test.py ROOT NEW_SOURCE
PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/qt-resource-runtime/run_probe.py NEW_SOURCE NEW_OUTPUT --expected-bytes 4194304 --timeout 120
```

The builder uses the existing86cj/86ci builder and frozen86cc Qt/browser host; it does not claim clean-checkout-only reconstruction of that historical environment. Existing completed evidence needs no redraw for review.
