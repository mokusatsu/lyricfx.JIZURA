# AVOID-002 仕様契約・回帰基準・検証オラクルの確定

- 状態: 実環境検証待ち
- 段階: 基盤
- 技術依存: [AVOID-001](AVOID-001.md)
- 事業優先度: 未指定。記載順は技術上の推奨順。

## 開始前確認

- 開始: 2026-10-18、branch `work`、HEAD `646ea4fe82582d072f36ed2206cc1c07749f9bdf`、作業ツリーclean（運用更新前）。
- 利用者が順次実装を依頼済み。実装担当は `gpt-6.1-sol / medium`、親エージェントがコード・テスト結果をレビューする。最新の[実装レビュー運用](implementation-review-policy.md)を適用する。
- 共通解析基準: b7c23bf。スキル導入済みHEAD: 3c79480。着手時に差分を再確認する。
- 正本: [設計・根拠](avoidance-design.md)、[一覧](task-list.md)、[スキル](../.agents/skills/evidence-driven-task-management/SKILL.md)。
- 依存タスクの必須条件と証拠を確認する。完了を推測せず、未完条件を引き継ぐ。
- 対象ファイルに既存変更がある場合は競合を確認する。同時進行タスクは原則1件。

## 目的

数値・競合・対象範囲を実装者ごとの推測に任せず、独立した合否判定と現行基準を固定する。

## 変更範囲

- 当該段階のGitHub Pages確認サンプル・変更前後のキャプチャ画像・比較HTML・公開manifest、確認依頼/回答記録。共通手順は[Pages人間確認運用](pages-human-review.md)と[比較画像・HTML契約](visual-review-comparison.md)。

- tasks/avoidance-design.md、tasks/evidence/AVOID-001/、docs/VERIFICATION.md
- dev/ の新規fixture・幾何学オラクル・共通ブラウザ起動helper・キャプチャ/比較HTML生成と公開物検証の手順、必要な既存テストの起動方法
- review/<TASK-ID>/<build-ID>/ の版付き比較ページ・画像・manifest・確認用fixture（後続実装時に作成）
- 文書更新: 本記録・task-list.mdの状態/証拠、設計の該当契約、対応表を同じ変更で同期する。

## 実装手順

- workを公開元とする既存Pagesに、公開確認ページ・サンプル選択・版ID/manifestの最小構成を用意する。現行UIが未対応の基盤検証も、後続タスクがケースを追加して人間に見せられる構成にする。Pages設定変更や新規公開ワークフローは前提にしない。

- 追加確定要件: 大量反復補助は軌道再設計対象外。primary/tiledAux/independentDecor、附属板、強調例外の対応表と、R/F/alphaの受入契約を作る。非分離FXとblendの実現性を小fixtureで先に検証する。

1. 確認済みの強調例外・固定区間切替を要件IDで固定する。
2. 初期円、単位、区間/gap/重複、null end、サイズ記法、lock、円軌道の中心語、FXの保証範囲を決定記録にする。
3. 184レイアウトの全IDをinventoryと照合し、直接/補助描画・文字面・装飾・カメラの責務を分類する。
4. 検証側の円と文字境界判定を生成側と共有しない。旧fixtureの表示・seed・効果・タイミング・manual/lockを保存する。
5. 固定機材・フォント・ブラウザと性能fixtureを定義する。Windowsパス固定をJIZURA_BROWSER等へ寄せ、サーバー依存を再現可能にする。
6. [比較画像・HTML契約](visual-review-comparison.md)に沿って撮影条件・manifest schema・生成/検証コマンドを確定する。固定時刻・font/media readinessで撮る共通手順と、H-ID別に前後画像を並べる静的HTML生成を用意する。002自身も現行描画と新設した確認ページで実施し、仕様見本は別枠とする。

## 禁止事項

- 計画登録だけでは実装許可としない。2026-10-18の順次実装の明示依頼を受け、本タスクは実装中。
- 無関係なリファクタリング、ロック解除、手動配置の破棄、歌詞のline/partや時間の変更を混ぜない。
- 主歌詞の回避をマスク抜きで代用しない。補助的な大量反復歌詞は利用者指定により軌道再設計の対象外とし、AVOID-018の円形グラデーションマスクで扱う。演出全体の小矩形への縮小・未対応レイアウトの黙示除外は禁止。
- テスト期待値を通過のためだけに変更しない。旧ONの意図した変更には要件上の根拠を付ける。
- Gitコミット/push/PR/公開は依頼または明示許可がある範囲のみ。計画・タスク・証拠のコミット/プッシュは依頼済み。後続の実装依頼を受けた各段階では、利用者指定のworkブランチからGitHub Pagesへ公開し、反映確認後、親が人間の動作確認の要否を判断し、必要な場合だけ確認ポイントを提示する。実装許可は上記の順次実装依頼による。

## 完了条件

- [ ] 全H-IDに対応する同条件の変更前後キャプチャと比較HTMLを生成し、Pagesで全画像の表示・ハッシュ一致・前後ラベル・項目リンクを確認した。新機能不在/条件差/仕様見本を明示し、画像比較と必要な実操作を含む依頼を用意した。
- [ ] workへコミット・プッシュした対象版がGitHub Pagesへ反映され、日英HTMLと確認fixtureの一致、公開版の起動/描画を確認した。
- [x] 親のコード・テスト結果レビューを記録し、人間の動作確認が必要と親が判断した場合は実URL・操作・期待結果を提示し必須項目OKと最終動作判定を保存した。不要の場合は親が根拠を記録した。公開未検証や必須試験の未達を省略判定で成功にしない。

- [x] 共通のキャプチャ/比較HTML生成・検証手順を再実行でき、画像欠損・版/条件不一致・H-ID未対応を検出できる。後続タスク用のschema/コマンドを文書化した。
- [x] 利用者指定、採用した設計案、未決・対象外が別欄に記録され、未決事項に担当タスクがある。
- [x] 時間/座標/例外/サイズ/FXの受入値をfixturesと文書で一意に判定できる。
- [x] 登録済み184レイアウトに漏れ・重複のない対応タスクが割り当てられている。
- [x] 現行の小矩形問題に実測証拠があり、中央を横切る線・真円の崩れ・主歌詞までマスクする誤実装を落とせる独立fixtureがある。現行に存在しない新方式の失敗を現行の観測事実としない。
- [x] 関連旧テストを現行HEADで実行し、環境依存失敗と製品失敗を区別した基準ログがある。

## テスト方法

- 比較成果物: [共通契約](visual-review-comparison.md)に従い、全H-IDの画像対応・撮影条件・HTML表示・公開一致を検証する。画像だけで数値/時間/保存の自動試験を代替しない。
- Unit: 円/矩形/ポリゴンの接触・境界・真円・線分交差を独立に検証。
- Integration: 旧fixtureとread-only browser probeを再実行。
- Regression: lyric_test、lyric_avoid_center、lyric_group_avoidance、lyric_scene、lyric_placement_stability、timeline_boundary_drag。
- 実環境: Pages上で現行基準・仕様見本・受入契約を親が検証し、必要時だけ人間が動作確認する。フォント差を含む条件も記録する。
- 実行結果: 末尾の2026-10-18実施証拠を参照。AVOID-001の履歴を上書きせず002の再実行ログを保存した。

## GitHub Pagesでの人間確認

[共通手順](pages-human-review.md)と[依頼テンプレート](templates/pages-review-request.md)に従う。以下の確認ケースを06候補へ具体化済み（末尾リンク）。ローカル画像/HTMLは生成・検証済み、Pages公開は未確認。人間確認が必要かは親が動作レビュー結果から判断する。

各項目に下表の前後キャプチャを準備し、比較HTMLの同じH-IDアンカーへまとめる。操作の前後状態が複数ある場合は、各状態それぞれで実装変更前/変更後を撮る。担当エージェントが画像を生成・公開検証してから人間へ依頼する。

| 項目ID | 人間に依頼する操作 | 期待結果 | 比較キャプチャ（06候補） |
|---|---|---|---|
| AVOID-002-H01 | 仕様見本と現行の同一サンプルを開き、回避位置の中央・上・下を順に選ぶ。 | 現行の小矩形問題と新しい軌道の期待像が区別され、上下左右の使い分け、強調例外、円軌道の中心専用ルールを判断できる。見本は未実装と表示される。 | 現行と確認ページ追加後の同一描画。中央/上/下の仕様見本は未実装と表示して別枠へ置く。 |
| AVOID-002-H02 | 確認用の代表歌詞・アスペクト・固定seedを切り替え、主歌詞と反復補助の分類一覧を見る。 | 以後の各段階で同じケースを再利用でき、補助反復は軌道再設計対象外と分かる。 | 同じ歌詞・seed・アスペクトの描画と分類表示。旧版に分類UIがない点を明記する。 |
| AVOID-002-H03 | 初期円、gap/境界、手動/ロック、競合、マスク幅の決定表を読む。 | 利用者指定と設計提案が区別され、採用する数値と例外についてOK/NGを回答できる。 | 旧版の実測結果と、追加した契約/観測結果表。数値の採否は表と根拠で確認し、仕様見本を実測扱いしない。 |

公開コミット / 変更前・変更後の実装識別子 / build ID / 比較HTML実URL / H-IDと画像の対応・撮影条件 / 操作用Pages実URL / 公開画像の一致・表示確認日時 / 自動検証証拠 / 依頼記録 / 人間の回答: 実装・公開後に記入する。未確認を成功として補わない。

## 停止条件

- 回避成功の定義が円軌道の「中心のみ」や手動値維持と矛盾する場合は、その仕様判断だけ保留する。
- 全画面FXの完全な非侵入を現行の変形で保証できない場合、未対応のまま受入条件を緩めない。
- 仕様矛盾・破壊的データ変換・予期しない公開互換性影響・既存変更との競合は、確認済み事実と選択肢を記録する。

## ロールバックと引き継ぎ

- 当該タスクの差分を単位として戻せる状態を保つ。保存されたユーザーデータを削除するロールバックにしない。
- 完了条件ごとに達成/未達/未確認、対応コマンド・件数・ログ・frame証拠を追記する。
- 開始/終了HEAD、git status、対象外既存変更、未実施検証、後続に渡すAPI/制約を残す。
- ローカル検証済み・実環境検証待ち・完了を区別する。最新の実装レビュー運用に従い、親がコード・テスト結果をレビューし、人間の動作確認が必要な場合だけ回答を求める。不要時も親の根拠を残す。

## 証拠・残事項

- 計画根拠: [AVOID-001](AVOID-001.md) と [設計書のE01〜E23](avoidance-design.md)。
- 旧計画時点は実装差分・検証ログなし。以下に002実施証拠を追記する。公開/親レビューの未完了は保持する。
- 個別の追加判断は着手時に記録し、共通設計と矛盾させない。

### 2026-10-18 実装担当のローカル証拠（親レビュー前）

- 実装担当: `gpt-6.1-sol / medium`。開始HEAD `646ea4fe82582d072f36ed2206cc1c07749f9bdf`、branch `work`。親が共通運用・他タスク記録を並行更新しているため、それらの差分は実装担当の対象外として保持した。
- 本番 `src/` / 日英HTML は無変更。既存6テストは共通 `dev/browser.cjs` の起動へ移行し、assertionは維持。保存テストは明示TTFだけ環境変数化した。
- 採用契約: [contract.json](../dev/avoidance/contract.json) / [受入入力](../dev/avoidance/cases.json)。利用者指定、002の数値/方式判断、後続担当を分離。中心(.50,.42)/短辺.20、中央帯.45..55、gap/null/重複、強調全描画免除、manual/lock/明示サイズ維持、円軌道中心のみ、補助R/F/alphaを固定。
- [独立幾何oracle](../dev/avoidance/oracle.cjs): production importなし、25 checks成功。接触/横断線/文字の占有範囲/回転/真円/中心穴、不正・未計測境界のfail-closedを含む。親の独立照合は親所有記録へ。
- [184-ID照合](evidence/AVOID-002/inventory.json): 184登録・一意ID・担当分担・原ソース内render一致・現行runtime render hash一致。primary責務を全IDへ保守的に割当て、13個の根拠付き反復単位だけ免除した。個別unit/板/FXの意味とadapter実描画の検証は各005〜011/018で未完であり、未調査を成功としていない。
- 基準6 scripts成功。5 browser scriptsは日英、sceneは各1296。sandbox初回のsetsockopt拒否と許可contextでの再実行を別ログに保存。[結果](evidence/AVOID-002/baseline-results.json)。作業用コピーのbuild.py成功、日英HTML SHA一致: [build-check.json](evidence/AVOID-002/build-check.json)。
- 保存試験はHTTP/font不足を解消後、旧assertion line14の新規project初期cut数「期待0/実1」で失敗。[結果](evidence/AVOID-002/saved-project-results.json)。保存本体まで未到達で成功を主張しない。製品修正や期待値変更は範囲外、013へ引継ぎ。
- 小Canvas fixtureはalpha/multiply/主歌詞・媒体非干渉/誤った全画面mask拒否の8 checks。役割混合blurはprovenance不在のため未対応と明示し、製品FX全対応の証拠としていない。性能は固定font・単独実行した旧planner100/1000行の基準であり、新region処理は未実装（evaluated=0）。[結果](evidence/AVOID-002/fx-perf.json)。
- 最終ローカル比較候補: [local-20261018-06](../review/AVOID-002/local-20261018-06/index.html)、[操作用サンプル](../review/AVOID-002/local-20261018-06/sample.html)、[manifest](../review/AVOID-002/local-20261018-06/manifest.json)。H01=4位置、H02=3layout×5aspect、H03=現行enter/hold/exitの22cases。44同寸UI画像と44原寸stage PNG。前後stage PNGは同じ本番描画のためhash一致を必須にした。初期/gap/境界/manual/lock/競合/mask表は採用契約であって未実装の実測と混同しない。
- 撮影はNode24/Chromium154、viewport1500×1000/DPR1、seed1、指定時刻、外部request禁止、同梱Noto Sans CJK subset（license付）、font loaded待機・glyph/metrics cache無効化。版のHEAD HTML一致、fixture/source/PNG hash・寸法・UTC・取得方法をmanifestへ固定した。01〜05は未公開の試行としてscratchへ退避、最終公開候補には含めない。
- ローカルvalidatorは全画像/fixture/日英HTML/hash、H-IDと22ケース完全性、条件一致、全リンク、1500/390、並列/切替/重ね合わせ/原寸、画像rect一致、実サンプル起動を検査。正常cloneを通した上で欠損/PNG hash/条件/H-ID/case/source/壊れたlinkの7 negativeを期待理由付きで拒否。値なし/未知option/非HTTP(S)/末尾slashなしの公開CLI誤指定4件も拒否。
- 再現コマンド・manifest schema・失敗時の区別: [dev/avoidance/README.md](../dev/avoidance/README.md)、詳細ログ一覧: [証拠README](evidence/AVOID-002/README.md)。

### 残事項と完了条件の判定（実装担当時点）

| 条件 | 判定 | 証拠・担当 |
|---|---|---|
| H01〜H03全キャプチャ/比較HTML生成 | ローカル達成、Pages未確認 | 06 bundle。公開一致は親 |
| work commit/push/日英HTML・fixtureの公開一致 | 未実施 | 親担当、ネットワーク制約を回避しない |
| 親のコード/テスト結果レビュー、人間の動作確認の要否 | 未完 | 親が記録・判断。実装担当は完了確定しない |
| 共通生成/検証、破損・条件差・H-ID漏れ拒否 | ローカル達成 | validator / positive + 7 negative / CLI4 |
| 指定/採用/未決と担当の分離 | 達成 | contract.sourceKinds / inventory.status / README |
| 時間/座標/例外/サイズ/FX受入値 | 契約固定達成、製品実装は後続 | contract/cases。003が実resolverを接続 |
| 184登録の漏れ/重複なし担当割当 | 達成、個別adapter検証は後続未完 | 184-ID inventory。未確定unitはprimary扱い |
| 小矩形実測/独立negative fixture | 達成 | 原寸実描画、observation、oracle、Canvas checks |
| 関連旧テスト基準 | 6成功、保存は既存不一致で未完 | 全ログ、013へ引継ぎ |

Pages公開未検証、親レビュー未完、必要と判定された人間動作確認の回答がない状態を完了としない。実装担当は次タスクを開始しない。

- 終端確認: branch/HEADと作業ツリー一覧は [implementation-status.json](evidence/AVOID-002/implementation-status.json)。実装担当はcommit/pushしていない。親更新の運用文書/他タスクは保持。最終コードのsyntax/oracle/比較validator/正常clone+negativeを再実行済み、`git diff --check`成功、子ブラウザjob終了。公開用manifest SHAは `cfa2d79603268193dc181442c0026816e42d624e3aa639a0463edeb20cdea30a`（manifest自身へ埋め込まない外部記録）。

### 親レビューの結果と現在状態

親のコード/テスト結果レビューは承認。[指摘と解消・独立試験](evidence/AVOID-002/parent-review.md)を参照。今回の基盤整備に人間の動作確認は不要と判断した（人間OKの代用記録ではない）。[版別レビュー記録](reviews/AVOID-002-local-20261018-06.md)に判断と公開確認状況を残す。

ローカル22ケース/88PNGと比較UIを検証済み。Pagesへの通信が現環境の許可ドメイン制限で403となるため、公開版の画像・manifest・日英HTML一致と起動を未確認として保持する。状態は実環境検証待ち。公開検証が済むまで002を完了にせず003へ進まない。

公開成果物commit: `f14fa2c28683735e6c5eef1d5fbd00e1bb588e61`。workへのpush成功、Pages [run 39131787480](https://github.com/mokusatsu/lyricfx.JIZURA/actions/runs/39131787480) 成功。実URLの検証は別条件で未確認。[公開記録](evidence/AVOID-002/publication.json)。

公開validatorの通信経路を追加レビューして修正し、ローカル全88画像と正常/破損ケースを再検証して成功。実Pagesと既存公開smokeは所定proxyで接続拒否（ERR_TUNNEL_CONNECTION_FAILED）。TLSを無効化せず、許可ドメインへのmokusatsu.github.io追加を利用者へ依頼済み。R14までの修正を親が承認した詳細は親レビュー記録を参照。
