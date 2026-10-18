# AVOID-001 解析証拠

対象アプリの基準HEADは `b7c23bff8a04019b9b90357b433927995834ae62`。実行時HEADはスキルだけを追加した `3c794806992a8d36dc763a16448e68b3767f4681`。アプリ・既存テストのソースは同一。

## 記録一覧

| 記録 | 内容・限界 |
|---|---|
| [baseline-results.json](baseline-results.json) と各 `.log` | 現行テスト7本を実行、6成功、保存テスト1本はHTTP接続で未完走。新機能の合格証拠ではない。 |
| [baseline-sandbox-blocked.json](baseline-sandbox-blocked.json) | 初回起動のsandbox制限。後に許可された実行コンテキストで上記を取得した。 |
| [build-check.json](build-check.json) | 作業用コピーでbuild.py成功、日英HTMLが追跡済みファイルと一致。元リポジトリは変更していない。 |
| [runtime-probe.json](runtime-probe.json) | 4アスペクト×6レイアウト×2設定の48計測、5カットの残留group、184レイアウトの実行時registry/renderSource。 |
| [existing-ring-avoid.png](existing-ring-avoid.png) | 現行ringの小矩形描画例。外部フォントを読み込まない解析画面のため、本番フォントの視覚品質の証拠には使わない。 |
| [layout-inventory.csv](layout-inventory.csv) | 全184IDとソース・責任タスク・描画役割のレビュー状態。実装済みという意味ではない。 |
| [auxiliary-role-review.md](auxiliary-role-review.md) | 20IDの追加静的レビュー。タイリング除外の誤適用を防ぐ分類根拠。 |
| [precommit-validation.json](precommit-validation.json) | コミット・プッシュの追加依頼を記録した後、ステージ前に実行した文書整合確認。 |
| [registration-validation.json](registration-validation.json) | タスク状態・依存・リンク・ソース参照・スキル原本・アプリ無変更の最終機械検証。新機能の実装試験ではない。 |

## 実行環境と再現

Linux、Node 24.19、Python 3.12、Playwrightは `/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules`、Chromiumは `/usr/bin/chromium`。元の一部テストのWindows Edge固定パスを、解析専用の `browser-shim.cjs` でChromiumへ差し替えた。テストアサーションは変更していない。

実行したスクリプト `run-baseline.py` / `probe.cjs` / `browser-shim.cjs` / `make-inventory.py` は当時のパスを保持している。リポジトリは `/workspace/lyricfx.JIZURA`、出力先は `/workspace/work/avoidance-analysis`。別環境では作業用にコピーしてパスだけを調整し、既存ログを上書きしない。プローブはローカルHTMLをrouteで供給し、外部リクエストを中断する。ネットワークや本番へのアクセスは必要ない。

~~~sh
NODE_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules python /workspace/work/avoidance-analysis/run-baseline.py
NODE_PATH=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules node /workspace/work/avoidance-analysis/probe.cjs
~~~

`make-inventory.py` は最初のソース照合用の履歴スクリプトであり、初期分割時の責任タスク番号を出力する。追加分割・018登録・描画役割レビュー後の正本は現在のCSV。これを初期スクリプトの出力で上書きしない。最終の責任分担件数は005:16、006:26、007:25、008:34、009:34、010:42、011:7。018はID単位の置換ではなく、各ID内で分類された補助反復を扱う。

タスク文書の整合確認は、リポジトリ内で次を実行する。添付ZIPとの比較が必要なときだけ `--skill-zip /path/to/evidence-driven-task-management.zip` を付ける。

~~~sh
python tasks/evidence/AVOID-001/validate-registration.py
~~~

このvalidatorのHEAD/差分の検査は今回の計画登録時点専用。後続実装が始まった後は、基準変更を説明せず合格させるために条件を弱めない。リポジトリ外の成果物コピーでは `--repo` に実際のリポジトリを指定する。

## 未確認事項の扱い

- `project_file_test.cjs` は `localhost:8765` のサーバー不在で `ERR_CONNECTION_REFUSED`。ソースにはWindowsフォントの固定パスもあり、後続013で再現環境を整えて保存試験を完走する。現行保存機能の失敗とも成功とも判断しない。
- `lyric_scene_test.cjs` の1,296シーン/言語は既存の矩形配置・緩和条件の検証。円回避・新しい軌道・補助反復マスクを検証していない。
- probeのOFF側はautoPlacementもOFF。中央回避スイッチだけを切り替えた純粋比較ではない。
- 全184IDの実画面、全効果組合せ、AE実機、実動画分析、提案した新方式の実装可能性と性能は未検証。後続タスクの受入条件として管理する。

コミット時にCSVのCRLFをLFへ統一し、placement stabilityログ2行の行末空白だけを除去した。CSVの解析結果とログの実質的な内容は不変。実行時の原ログは作業用ディレクトリに保持している。
