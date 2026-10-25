# 電球69 実行gate用source提出

親レビュー対象の残り5項目を実装した。ブラウザ・正規build・Git書込/push・seal作成はまだ実行していない。

1. runner/auditの59codec参照をGit正本 `tasks/evidence/AVOID-009/bulbs-focused59/source59/runner/` へ変更。kernel/catalog/qualityの旧work複製との全bytes一致を確認（13202/3734/9017B）。演算は変更していない。
2. 独立oracle終了時に `wrapperErrors.length===0` を明示require。warnでswallowされた差替え失敗を成功にしない。
3. `dev/avoidance/layouts_d_bulbs69_runtime.py`: fresh Englishを実sourceからcompile/execし、実build.pyを変更せず実行。openの書込みはindex/enの明示2pathだけRAMへredirect。mkdirは既存ROOT/enだけ許可。stdoutは失敗時も保存。原JA/EN HTMLをGit4a761からRAMへ取得。ROOT HEAD/index inode/fullbytes/65全物理不在/PYC7/旧HTMLを検査する。
4. 同runtime.pyの限定archiver: raw/build/frozen-inputs＋明示root JSON/stdout/stderr/失敗記録/前attempt listのみを対象とする。tmp/profile/cache/private-gitは対象外。成功/失敗どちらのproducer prefixも原文保存。新RAM bare Git、ROOT object alternates、独立indexへ格納し全blob bytes・最終treeを照合後、新archive branchへ非force push。通常proxy/TLS設定を継承し、公開URL接続はしない。ROOT HEAD/index/flags/PYC/旧HTMLを前後検査。binary runtimeはhashだけ、source/assetsはfrozen snapshotを保存。
5. `dev/avoidance/layouts-d-bulbs69-execute.py`: 1 foreground tool process/session内でRAM作成→153以上の実source/assets固定→正規RAM build→Node producer→全prefix archive/push。producer失敗でも保存段へ進む。push失敗時は同sessionを保持し、stdinの `retry` / `stop-unsaved` を待つ。EOF/timeoutは保存成功にも終了許可にもしない。明示stopはROOTへUNSAVED記録を残しexit2、成功へ補完しない。

ROOTの現在baselineは4a76100c63b3a8b55c7c12ad9e98656ba37f9599、index SHA256 cbcb5d5fe39c960139c5b25a8d62c66340b7e858b58644a2b1e87930487c8352。親がsourceをcommitした場合は、次の両コマンドのexpected head/indexを親の新値へ揃えてからsealを作る。HTMLの比較元ref4a761はそのまま保つ。

以下は親の全sourceレビュー後の実コマンド。seal作成はread/hashと小JSONだけで、build/browser/Git書込をしない。seal自体を親が確認してから本実行する。seal/run-idは未使用名を指定する。

```bash
PYTHONDONTWRITEBYTECODE=1 python -B dev/avoidance/layouts-d-bulbs69-execute.py \
  --prepare-seal /workspace/lyricfx.JIZURA/tasks/evidence/AVOID-009/resume-20261025/source69-reviewed-seal01.json \
  --expected-head 4a76100c63b3a8b55c7c12ad9e98656ba37f9599 \
  --expected-index cbcb5d5fe39c960139c5b25a8d62c66340b7e858b58644a2b1e87930487c8352 \
  --node /opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node \
  --browser-launcher /usr/bin/chromium --browser-engine /usr/lib/chromium/chromium
```

本実行はstdinを持つ通常tool sessionで起動し、RAM/Gitpushエラー時にkeeperを切らない。

```bash
PYTHONDONTWRITEBYTECODE=1 BULBS69_EXECUTE_RELEASE=PARENT_REVIEWED_BUILD_RUN_PERSIST \
python -B dev/avoidance/layouts-d-bulbs69-execute.py \
  --reviewed-seal /workspace/lyricfx.JIZURA/tasks/evidence/AVOID-009/resume-20261025/source69-reviewed-seal01.json \
  --run-id source69-local01-20261025 \
  --expected-head 4a76100c63b3a8b55c7c12ad9e98656ba37f9599 \
  --expected-index cbcb5d5fe39c960139c5b25a8d62c66340b7e858b58644a2b1e87930487c8352 \
  --node /opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node \
  --browser-launcher /usr/bin/chromium --browser-engine /usr/lib/chromium/chromium
```

成功時の保存branchは `archive/avoid009-bulbs69-source69-local01-20261025-attempt1`、raw保存先Git pathは `tasks/evidence/AVOID-009/bulbs-source69-runs/avoid009-bulbs69-source69-local01-20261025/`。再試行はsuffixが増える。push元返値とROOTの小receiptを保持し、公開結果確認は0。

通常module resolveの実測Playwrightは1.62.1（/opt/codex/.../node/node_modules/playwright/package.json）。過去メモの1.63へ暗黙に合わせず、node version/解決先/package SHAをsealとrunnerに記録・照合する。別既存runtimeを選ぶ場合は、その環境でsealから作り直す。新規installは行っていない。

追加の失敗保全: raw codec/budget失敗時は、失敗した元incoming encoded request全文（request上限の場合は受信済prefix）もgzip保存する。その後のcodec書込みを停止し、失われたtable deltaの後続を成功扱いしない。table100000/key64MiB/全serialized256MiBは据置、失敗payloadは失敗原本である。

検証はPython AST/構文、runtimeの安全なimportと入力実在確認、source pure24件、source audit、runtime pure18件がPASS。runtime pure初回は「PYC7すべてtracked」という誤仮定でbuild前停止し、原runtime/test sourceとfailure記録を `evidence/AVOID-009/resume-20261025/source69-runtime-first-failure/` へ保存。trackedはEnglish1、保護対象はuntracked含む7なので既知7pathの原bytes保持へ修正した。旧失敗を上書きしていない。

このgateはJA固定defaultの限定local source試験。JAEN RAM build生成だけで製品合格にはせず、その後のcanonical JAEN描画・通常controls/basic6・stale/negative・必要MP4・人間の新しい動作承認は未実施として継続する。既存009内で新規視覚候補約6effectまで順次続行し、未実施/失敗/同effect複数画像を加算しない。
