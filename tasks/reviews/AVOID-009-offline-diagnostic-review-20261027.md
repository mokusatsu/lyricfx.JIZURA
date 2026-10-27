# オフライン診断レポート検証器の親レビュー

開始・終了HEADは`e32ada3eb1560d5ab58c9ef1a1ab958c6b629109`、ローカルbranch`resume-local-20261027`。実装担当gpt-6.1-sol / medium、親が元診断コード・検証器・合成試験を確認し独立再実行した。製品／元診断／ブラウザー設定／CIは変更しない。

## 変更と使い方

`dev/avoidance/renderer-callback-throw-report-check.cjs`は既存8条件診断のJSONを読み、正常対照4件と例外4件、boolean条件の一意性、66個の元診断assertionsとの一致、source pin全件と実ファイルのSHA256、HTML中のrenderer完全一致、捕捉エラー、clip、復旧操作の件数と対象ctxを検査する。結果は`OFFLINE_REPORT_CONSISTENT`またはexit1の`OFFLINE_REPORT_REJECTED`。

```sh
node dev/avoidance/renderer-callback-throw-report-check.cjs /absolute/path/report.json [source-repository-root]
node --test dev/avoidance/renderer-callback-throw-report-check-test.cjs
```

任意rootは診断時のソースを持つcheckoutを指定する。古いreportを現在の異なるソースで合格させず、pin不一致で拒否する。読み取るだけでブラウザー・ネットワーク・製品コードを実行しない。

## 親指摘と修正

初稿では一部snapshotが型検査のみで、同一レポート内の矛盾を通せた。固定初期状態、callbackのtranslate(7,11)・alpha・blend、directの同一ctx、throw直後とcallbackAfter、最終restoreとfinalOuterの一致を追加した。必須rendererファイルとHTMLへの一回の埋込も確認する。修正後の対応する否定試験と既存否定試験の失敗位置をレビューした。最終版の未解決指摘なし（下記実Canvas制約は残る）。

親再実行: `node --test dev/avoidance/renderer-callback-throw-report-check-test.cjs`、exit0、65件PASS／FAIL0／skip0。8条件の合成fixtureは元診断assertion計数66を確認。CLIの不正JSON／失敗status拒否も成功。`git diff --check`成功。台帳は6 unique pending候補と出典3件のblob OID/SHA256を独立確認した。

## 証拠の意味と未実施

試験fixtureは明示的に合成データ。レポートの整合性確認は、実Canvasでの発生、自然発生する例外、製品の正常性、実stack深度、人間の動作承認を証明しない。成功statusでも同じ制約文を出力する。実ブラウザーの新しい成功reportとの互換性は未検証。

Chromiumは既存の最小起動診断でSUID sandbox設定エラー（Canvas到達前exit -6）。今回は起動の再試行・設定変更・回避を行わなかった。大幅な共有描画復旧修正は未承認で保留。候補有効化・見た目変更・公開・push・別環境188件取得・媒体生成は0。

検証支援の追加自体は見た目変更がなく、人間のコードレビュー依頼は不要。6候補の動作承認は別途全件未回答。AVOID-009全体は実装中。
