# Bulbs render output boundary86cj

Parent review found three rendering-output callers that bypassed main UI86ci: ordinary `btnAE` JSON save, CEP `buildInAE()`, and local MCP `output({kind:'ae'})`. MCP also calls `J.exportMP4`/`J.exportPNGZip` directly. These could serialize an editable bulbs avoidance plan without proving that AE/image/video output matches its private main preview. This correction refuses those outputs explicitly before their output resources or external writes begin.

## Changed boundary

`src/11_export.js` now owns `J.assertPlanOutputSupported(plan)`. It throws `BULBS_UI_OUTPUT_UNSUPPORTED` for a visible lyrics layer whose plan targets the limited bulbs preview. `J.planForAE`, `J.exportMP4` and `J.exportPNGZip` call it as their first body operation. Rejection precedes JSON cloning, media pausing, transition mutation, codec negotiation, Canvas/Renderer/ZIP/encoder allocation and output generation. The default argument evaluation of the existing functions is unchanged.

| Caller | Refusal point | Preserved behavior |
|---|---|---|
| Ordinary browser `btnAE` | Before hidden-layer prompt/filename dialog; central `planForAE` also rechecks after the filename await | Non-bulbs/disabled avoidance still serialize and save AE JSON |
| CEP header/easy/pro AE build buttons and `J.cep.buildInAE()` | Before connection, again through central conversion after connection, and immediately after the30ms status wait before temp-file write/`startFromString` | Existing native-file/string branches for supported plans; changing to a target plan during either await cannot send it |
| Local MCP `output()` | Before audit/font wait for rendered kinds; shared conversion/export functions recheck after awaits | `project`, `settings`, `favorites` bypass this render restriction |
| Direct `J.planForAE`/`J.exportMP4`/`J.exportPNGZip` | Common function entry | Existing non-target paths continue unchanged |
| UI image/video/short/snapshot | Existing86ci entry guards now exclude hidden lyrics, matching the central guard | A hidden bulbs lyric layer does not block other visible content from output |

`plan.layerVisibility.lyrics===false` is safely outside rendered output: the renderer excludes that layer, `targetsFrame` is false, and AE conversion already removes its lyrics/cuts/events. The common guard allows it. Main UI export/short/snapshot predicates were narrowed to the same visible-layer condition; prep/main routing itself is unchanged. Manual/notation/locked bulbs, disabled avoidance, empty avoidance regions and other layouts remain outside the existing limited target. These exclusions do not certify all other output accuracy; they preserve existing behavior.

Project/settings/favorites persist editable configuration rather than a proved render and remain permitted. No generic `J.saveFile` block was added: it must continue saving those formats. All production `planForAE`, `exportMP4`, `exportPNGZip` direct uses were traced with `rg` in `src/`, `cep/`, `mcp/`; historical `review/` fixtures were not edited. The MCP `preview_frame` route is an existing inspection API, not `output`; this task does not newly qualify its image correctness.

`product-ui86ci/generate.py` contains the ordinary UI AE preflight and the four visible-layer output predicates, so regeneration preserves them. Other new guard code remains in its ordinary `src/11_export.js`, `cep/cep.js`, `mcp/browser-api.js` sources. Generated matching templates and JA/EN builds are byte-identical after regeneration.

## Verification

```
node dev/avoidance/bulbs86/ae-output86cj/test.cjs
PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/bulbs86/ae-output86cj/check-evidence.py /workspace/jizura-logic-evidence-20261027
```

57pure assertions use the real export/CEP/MCP source with mocked host/fs/resources. They cover target rejection before resources, all original target exclusions, supported AE JSON byte equality with the pre-change implementation, both CEP native-file/string branches, plan changes during connect/status await, MCP project/settings/favorites preservation, and hidden-layer AE stripping plus MP4/PNG admission to an old-operation sentinel. They do not generate an image/video or contact AE. Existing86ci14session+28race+6font+15routing checks also pass.

Git-external source/output/runtime:

- `/workspace/jizura-logic-evidence-20261027/bulbs-ae-output-source86cj01` / `bulbs-ae-output86cj-actual01`: complete JA/EN product UI test before the hidden-layer refinement. It verifies target refusal, permitted project/settings UI saves, ordinary/disabled AE output, MCP target rejection, and mocked CEP string/native-file output. This intermediate source did not yet allow hidden lyrics; it is preserved as that limited result.
- `/workspace/jizura-logic-evidence-20261027/bulbs-ae-output-source86cj02` / `bulbs-ae-output86cj-actual02`: complete JA/EN final source with the same tests plus hidden lyrics. AE JSON strips all lyric cuts and passes the existing filename/save UI; MP4 dialog opens; direct MP4/PNG reach an immediately throwing admission sentinel before any output media.

Both runs have4raw records/errors0/post-execution pins unchanged. All actual saves/project packing/CEP `evalScript`/Node `fs.writeFileSync` are test mocks. Permitted AE JSON is constructed only in memory. JA exercises mocked CEP `startFromString`; EN exercises mocked Node temp-file write then `startFromFile`. No actual filesystem output, AE comp, image, video, Blob serialization or encoder is produced by these tests. The only disk writes are source/numeric evidence and managed-runtime diagnostics. This is output boundary validation, not execution in a real AE host, all-time paint recertification, performance acceptance or shared-renderer exception redesign.

Both managed runtimes confirm3normal page closes, service/owned-child reap, signals0/remaining0/ownership failures0 and closed debug port. Runner generation gates require1GiB spare plus declared4MiB; free space was approximately11GiB. No Qt tests overlap. Public/Sites/Pages access and old media/replay regeneration remain0.

`actual-summary.json` pins the result files and checker. The checker also validates original86ci01, failed boundary02 and successful boundary03 without rewriting them. Product edits here intentionally change old current-path pins. Executed bytes are retained in the new `bulbs-ae-output86cj-pre-edit/` and `bulbs-ae-output86cj-hidden-pre-edit/` directories, each with a hash/byte/path map, plus the existing historical86ci harness recovery. Every fallback is exposed as `currentSourcePinDifferences` and checked against its original recorded SHA. Final86cj02pins match current files directly. Use this checker for the full chain after the intentional source changes; the old86ci checker only described its earlier source state and is unchanged.

New Qt runs, if needed for a new implementation change, must use fresh namespaces and the managed runner:

```
PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/bulbs86/ae-output86cj/build-test.py ROOT NEW_SOURCE
PYTHONDONTWRITEBYTECODE=1 python dev/avoidance/qt-resource-runtime/run_probe.py NEW_SOURCE NEW_OUTPUT --expected-bytes 4194304 --timeout 180
```

The builder explicitly depends on the previous86ci builder and frozen86cc Qt/browser host plus `/workspace/jizura-browser-runtime-20261027/qt-page.cjs`; a clean checkout alone does not reconstruct that historical runtime. Existing completed runs need no redraw for review.
