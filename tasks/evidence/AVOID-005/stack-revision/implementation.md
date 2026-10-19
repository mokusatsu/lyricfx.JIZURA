# AVOID-005 Stack revision implementation handoff

- Implementer: `gpt-6.1-sol`, reasoning effort `medium`; parent reviews independently.
- Starting product: `834fb5bc69867840080e4cf2c2d25db2082e8d71`, frozen archive `/workspace/work/avoid005-stack-before`.
- Scope: Stack joint placement, targeted regressions, separate immutable comparison tooling. No commit/push, AVOID-006 work, old review bundle edits, default-path enablement, or other-layout product edits by this implementer.
- Frozen product SHA-256: `src/09b_basic_placement.js` = `1a8086b15ff2dfe86c956d95e23c9f5b59f86eeeae3a3b4c279909e54250bd16`; JA = `1b9410dcb158a0ce315ae500be9e704734bcca6494838538416ad4ebbb8c4ea3`; EN = `5ba21ffcde7a42f430beb3640ce80837de4e6cd68aaedb4c26c120de09d211f1`. Full implemented-file hashes: `implementation-hashes.json`.

## Behavior and invariants

Common translation remains the first choice. Stack alone then tries a finite joint family instead of the independent-owner fallback. Native item anchors are recorded without changing the native renderer. Per-row offsets are affine in copy index, so adjacent anchor displacement remains constant, including during native animation/camera transforms. Glyph size, font, rotation, style, opacity, timing and copy order remain native.

The family first adds horizontal progression at native vertical spacing. It then tries vertical spacing factors .875/.75 with horizontal increments bounded by 25% stage width and twice native copy distance. The camera/contentScale lower bound must retain at least half the minimum native vertical step with the same order. Before admitting a candidate, every pair's translated continuous-envelope bounding-box overlap area must be no larger than that same pair's native envelope overlap area. This is an envelope-bbox invariant, not a claim to prove readability or exact glyph-ink overlap. Native Stack intentionally layers repetitions; human behavior review remains necessary.

The existing solver admits only jointly translated complete continuous camera/ghost/AA envelopes that fit the stage and clear the circle plus margin. No sampled frame is used to establish whole-time safety. No solution within this declared family yields explicit `insufficient-space`; it does not establish impossibility of arbitrary layouts. Other 15 layouts use the existing path unchanged.

Default landscape upper/lower circles now have real safe diagonal progressions (native step approximately [-1.92,99.71], after upper [197.53,74.78], lower [-201.37,74.78]). The upper condition was previously scattered and stays safe with the new invariant. The lower was previously insufficient and becomes safe. The landscape central condition becomes honest insufficiency; native portrait default anchors remain safe. These are the same before/after text, seed, params, font, stage and time.

## Executed checks

Use existing runtime: `NODE_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules`, `JIZURA_BROWSER=/usr/bin/chromium`; videos also use `PLAYWRIGHT_BROWSERS_PATH=/workspace/work/jizura-handoff/playwright`. Local browser/server/subprocess commands ran with the supported network permission. TLS settings were not bypassed.

| Command | Result and evidence |
| --- | --- |
| `PYTHONDONTWRITEBYTECODE=1 python build.py` | JA/EN generated from frozen source above |
| `node dev/avoidance/stack-test.cjs` | Exit0; `stack-test.log`: 30 native conditions, 2 admitted diagonals, 1 formerly scattered condition still safe. Three aspects × three circle positions; copies3/4/5, dirs±1, gap .82/1.02, xs±.04, fade/outline, push/panL/panR/dutch, ghost and contentScale .5/1.25 plus4 impossible condition; six times .01/.1/.2/1.5/3.8/3.99. Independent polygon-circle oracle, stage bounds, affine offset residual, pairwise bbox-overlap nonincrease. Other15 ×4controls =60 byte-identical PNG/trajectory/observation comparisons. Before834 fails affine invariant. |
| `node dev/avoidance/basic-test.cjs` | Exit0; `basic-test.log`:144 conditions,101 certified/43 insufficient/0unsupported/0errors; native replay and clip negatives |
| `node dev/avoidance/basic-acceptance.cjs` | Exit0; `basic-acceptance.log`:46 checks passed |
| `node dev/avoidance/stage-test.cjs` | Exit0; `stage-test.log`; prior stage contracts retained |
| `node dev/avoidance/stack-review.cjs capture stack-smoke-03 --smoke` | Exit0; final tools,3 smoke rows, synchronized actual Stack playback video. Bundle is scratch tooling evidence only. |
| `node dev/avoidance/stack-review.cjs validate stack-smoke-03 --smoke` | Exit0; `tool-smoke-validate.log`: raw hashes/native rerenders, desktop/mobile UI, controls, playback/scrubber, actual JA/EN renderer initialization |
| `node dev/avoidance/stack-negative.cjs work/stack-tool-smoke/stack-smoke-03` | Exit0; `tool-negative.log`:26 canonical cases,12 negative guards; disposable clone only |

Intermediate tilted candidates with native-distance progression showed extra overlap and were rejected during review. A strict overlap guard initially removed all new diagonals in the30-condition set; this led to the bounded wider diagonal family, without weakening the guard. `intermediate-search-failure.log` retains the exploratory-script failure (its circle oracle had used a fixed cx while exploratory inputs varied cx; canonical regression uses actual cx). The first tool-negative attempt could not spawn git under the default sandbox; `tool-negative-sandbox-failure.log` is retained. The supported-permission rerun passed.

## New comparison tools and limits

`stack-cases.cjs` defines26 targeted pairs:9 aspect/circle-position holds,4 enter/exit frames,4 dir/style examples,2 copies4/5 exploratory cases,6 compatibility controls,1 impossible case. This is distinct from the30-condition regression and the original123-pair bundle. Both before834 and after run the same005 API, unlike the original004→005 comparison. `stack-review.cjs` copies raw original/executed HTML, fixtures, source hashes, font/license, exact native PNGs and full UI screenshots; hashes all assets plus JA/EN; verifies immutable source/archive identity and rerenders real native frames. `stack-sample.html` has actual synchronized playback/scrubber and Japanese diagonal-stack guidance. H02 is explicitly a Stack follow-up; the original16-layout/attachment bundle remains linked. `stack-negative.cjs` rejects API absence, nonaffine safe offsets, false safe outcomes, modified source/condition/assets/PNG bytes and unsynchronized video metadata.

Final26-case capture/publication belongs to the parent after review, using a new unused build ID, e.g. `node dev/avoidance/stack-review.cjs capture local-20261019-03`, then `validate`, and `node dev/avoidance/stack-negative.cjs review/AVOID-005/local-20261019-03`. Public validation uses the same tool with `--base-url https://mokusatsu.github.io/lyricfx.JIZURA/`; it requires raw-byte identity for every asset and manifest, then real rerenders. Local success is not public verification. Smoke01/02 preserve earlier tool/product snapshots under untracked `work/stack-tool-smoke/`; smoke03 is the final tool smoke. Do not include scratch work as release assets.

No browser remains open from this implementer. Parent owns solo performance recheck, final capture/publication, independent review and human behavior handoff. Visual smoke02 was inspected: three equally progressing rows read as a diagonal Stack; human review still decides whether that diagonal spacing matches the intended expression. No insufficiency is counted as a safe example.
