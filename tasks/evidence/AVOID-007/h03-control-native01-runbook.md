# Native retention control capture01 / browser01 — prepared only

Current state: **not executed, awaiting parent-reviewed distinct control tool integration and explicit start instruction.**007 incomplete;008 unstarted. Existing product/main02, old H03 fixtures/tools, current control fixture/focused and old failed raw02 remain immutable. The approved focused control has rain/bubbles safe within measured scope and credits FG-insufficient; no receipt or approved subset is changed by these wrappers.

Prepared entry points (both use a require.main guard; importing them does not run main):

- `dev/avoidance/layouts-b-h03-control-capture01-run.cjs`
- `dev/avoidance/layouts-b-h03-control-browser01-run.cjs`

Only pure preparation was run: both node --check, and importing both modules to confirm main exports without starting any work. No missing tool was stubbed or substituted. Newtool is required lazily from `layouts-b-h03-control-review.cjs` only inside main.

## Required integration review before execution

1. Parent integrates/approves the isolated distinct tool. Default review receipt path in wrapper is `tasks/evidence/AVOID-007/parent-h03-control-tool-review.json`; if parent's actual filename differs, adjust this preparation path before prelaunch pin, never fabricate a receipt. Both wrappers pin the real review file, parent focused review, metadata02, freeze02, focused/fixture/config, main manifest/config, exact main source/font/fixture assets, all current79source/JAEN bytes, and original media bytes. Their H.pin snapshots are written before calling capture/validateBrowser. Environment-pre files are required as inputs for the relevant stage.
2. Confirm tool CLOCK exactly{absoluteStart:.5,absoluteEnd:4.5,fps:24,frames:96,duration:4}, strict profile native-single-retention-v1, all3 diagnostic outcomes, approved rain+bubbles only, no future source-cut removal and no FG-collision acceptance. Confirm native PNG→direct H264 recipe from the tool; no HTML recording/slides/transcode. Wrapper does not change clock/encoder/quality criteria.
3. Current draft config is `dev/avoidance/layouts-b-h03-control-capture.local-20261022-01.json`, build local-20261022-h03-control-01. Intended fresh output is **work/avoid007-h03/control-native-local-20261022-01**, not old raw02 or the earlier incomplete acquisition. Both original2MP4bytes/fonts/seed/circle/media positions unchanged. Do not overwrite any existing dir/report/partial/snapshot.

## Capture stage (only after start instruction)

Record current environment status to `h03-control-native-capture01-environment-pre.json`. Check no other browser/ffmpeg/heavyIO is running. Start:

```
JIZURA_BROWSER=/usr/bin/chromium node dev/avoidance/layouts-b-h03-control-capture01-run.cjs
```

Wrapper validates every current source/product against freeze02, binds exact main manifest, pins inputs, asserts fresh directory and expected tool clock, then calls only newtool.capture(config,dir). The tool owns native96Canvas frames per side/case, direct PNG→H264, all source/receipt/asset startup/end pins and validateFiles. Expected acquired subset is2pairs/4MP4s with no invented third success. Capture includes file qualification; repeat validateFiles only if a new failure or parent request warrants it.

Wrapper report `h03-control-native-capture01.json` and `-partial.json` record actual return or failure and end input checks. No failure rerun/overwrite; stop and return the raw receipt. Record environment-post, source/tool/config/manifestSHA, total/max asset sizes and CPU release. Do not publish. Independent visual review and later package/public qualification remain separate.

## Browser stage (separate explicit start instruction / CPU reservation)

After successful capture/file review, record `h03-control-native-browser01-environment-pre.json`. Ensure no real-time playback/browser/ffmpeg/heavyIO competition. Start:

```
JIZURA_BROWSER=/usr/bin/chromium node dev/avoidance/layouts-b-h03-control-browser01-run.cjs
```

Wrapper requires successful capture/end-input proof, pins selected source/control inputs plus sealed new manifest/capture receipt, then hashes every manifest asset before entering the validator. It invokes only newtool.validateBrowser(dir,{onProgress}) using the default owned phase-separated browser lifecycles. It does not customize thresholds, monkeypatch playback, remove seek/revisit calls, lower frame counts, retry until pass, or re-encode media. Strict successful status remains `raw HTTP, UI, MP4 decoded seek/playback and native parity verified`. The tool handles raw HTTP/UI, decoded seek/playback, native parity/live/profile/FG support as reviewed. Wrapper verifies every startup input/current freeze/sealed asset again at exit.

`h03-control-native-browser01.json` and `-partial.json` preserve real progress/failure. Record environment-post and CPU release; stop if any gate fails. Parent independently reviews raw results and schedules isolated visual review. Credits' excluded acquisition remains indexed as FG-insufficient in the full focused receipt. Original eight-cut raw02 visual FAIL remains012 input; a successful new control does not establish general group/foreground/content avoidance or unlock017 activation.
