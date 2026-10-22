# AVOID-008 regression01 — immutable local baseline/after

2026-10-22 UTC。実行対象は `scratch/avoid008-regression01/snapshot`。取得後にsource/compiledを読み直していない。`snapshot-manifest.json` はJA/EN compiled、src、dev tests/helpers/launcher、mcp、en、assetsを含む12,993ファイルSHA256。baseline compiledは `git show 2bb3f86:index.html` / `en/index.html`。試験後 `snapshot-integrity.json` は12,993件全一致（changed=[]）。製品・既存test・既存docsは編集していない。

| 既存assertion suite | baseline 2bb3f86 | after snapshot | 判定 |
|---|---|---|---|
| drawing_frames_test.cjs | PASS | PASS | 新規FAILなし |
| palette_stability_test.cjs | PASS | PASS | 新規FAILなし |
| cut_detail_audit_test.cjs | PASS | PASS | JA/ENのnote変更とcut反映assertionを含む |
| effect_copy_fidelity_test.cjs | PASS | PASS | 各layoutのcopy fidelity既存assertion |
| lyric_area_effects_test.cjs | FAIL | FAIL | 両版ともline35 `withoutMedia`: actual 0 / expected 1。同じ既存FAIL、成功扱いしない |

全5suiteを省略せず実行。`cut_detail_audit_test.cjs` が実在の正しいファイル名で、line22 note編集、line25 cut.note反映assertionを実行。lyric_area_effectsのnote parse assertion(line32)までは通過するが、その後line35で停止し、EN loop及びline36以降には未到達。その残りをPASS扱いしない。各実行の生stdout/stderrは `baseline-*.log` / `after-*.log`、exit code・開始UTC・秒数・commandは各result.json及びresults.json。最大3worker並走、assertion/期待値/fixture入力は変更なし。開始15:53:57Z、最後のsuite完了は15:54:26Z頃。

環境適応は新規 `environment-preload.cjs` のみ。snapshot内の既存 `dev/avoidance/layouts-b-browser-preload.cjs` をそのままrequireし、Windows Edge指定を `/usr/bin/chromium` にする。同じ既存JIZURA_REGRESSION_ROOT機能でcompiledの2readのみbaseline/afterへ切替、各readの実パス/bytes/hashを `.reads.jsonl` に記録。両版ともcurrent pinned suite/helpers/source/resourcesを使用。routeはoptional外部hostをabortし、loopback又は既存auditのsynthetic `http://test/` document fixture（メモリfulfill）のみ許可。公開URLへの接続・結果確認なし、proxy/CA/TLS変更なし。

Node v24.19.0、Chromium154.0.8037.57。Node/browser launcherと依存version/hashは `environment-pins.json`。CJS suitesはcurrent runtime Playwrightを使用、同一packageを `scratch/avoid008-regression01/dependencies` へコピーして再現可能に保存。外部fonts/optional modelはabortされるため、この試験は外部font成功や見た目の保証ではない。snapshot内に存在するfont/assetsはmanifestでpin済み。テスト独自seed/時間をそのまま使用し、runnerによるDate/Math.random書替えなし。

追加のJA/EN app startup/render smokeは **after snapshotを実際local serveしてPASS**。既存 `snapshot/mcp/site-smoke-test.mjs --local` のself-host serverで200、compiled hash同一、uiApi/plan起動、2歌詞行生成、canvas非単色とJS error無しを確認。JA hash `17e35475df196fc87a931802a21683a1d4c7b0cafcbba88feb2e50c9ba708456`、EN hash `21bbfdc8dc20a9ab1b8ed6c368d91f290f64726592bff4139086e59b08f7c2a7`。ログは `after-site-smoke-local-retry.log`、結果exit0、15:54:57Z開始/3.854秒。最初のESM実行はsnapshotコピー先のPlaywright依存解決で起動前FAIL（ERR_MODULE_NOT_FOUND、`after-site-smoke-local.log`、exit1）。assertionを変えず新規ESM loaderとコピー依存のisolated node_modules検索を適応しretry成功。初回FAILを消していない。smokeは常に明示 `--local`、public default未実行。

これはこのsnapshotに対する既存回帰とlocal startup smoke。AVOID-008の全ID/全時間安全性、視覚PASS、最終編集後版の受入とは別。既知保存013は保存本体未到達のため今回対象外であり、save PASSを主張しない。
