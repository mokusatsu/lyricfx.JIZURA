# AVOID-003 円形回避データ・正規化・時刻resolver

- 状態: 完了（公開検証・親レビュー済み、人間動作確認不要）
- 段階: 基盤
- 技術依存: [AVOID-002](AVOID-002.md)
- 事業優先度: 未指定。記載順は技術上の推奨順。

## 開始前確認

- 開始: 2026-10-18 UTC / work / c930c0977e1247865dcd5e45c4e9eb064b89f0fe / clean。担当: gpt-6.1-sol medium。変更前は `/workspace/work/avoid003-before` へgit archiveで固定。AVOID-002の公開検証と親判定を確認済み。
- 共通解析基準: b7c23bf。スキル導入済みHEAD: 3c79480。着手時に差分を再確認する。
- 正本: [設計・根拠](avoidance-design.md)、[一覧](task-list.md)、[スキル](../.agents/skills/evidence-driven-task-management/SKILL.md)。
- 依存タスクの必須条件と証拠を確認する。完了を推測せず、未完条件を引き継ぐ。
- 対象ファイルに既存変更がある場合は競合を確認する。同時進行タスクは原則1件。

## 目的

保存可能な領域と決定的な時間解決を先に作り、UI・描画・外部入力で解釈を統一する。

## 変更範囲

- 当該段階のGitHub Pages確認サンプル・変更前後のキャプチャ画像・比較HTML・公開manifest、確認依頼/回答記録。共通手順は[Pages人間確認運用](pages-human-review.md)と[比較画像・HTML契約](visual-review-comparison.md)。

- 新規 src/08ca_lyric_avoidance.js（配置名はbuildの結合順を確認）、src/08_planner.js
- src/12_ui.jsのmergeProjectとの接点、モデルのunit/serialization test、設計文書
- 文書更新: 本記録・task-list.mdの状態/証拠、設計の該当契約、対応表を同じ変更で同期する。

## 実装手順

1. project.lyricAvoidance.version/regionsと単一のvalidatorを実装する。
2. start/end:null、隣接、空白、ID、重複拒否、曲長からの独立を実装する。
3. 旧データmissingと明示的な空配列を区別し、旧avoidCenter・autoPlacementの有効条件を再利用する。
4. pure resolverとplan用の時系列indexを用意し、将来のpositionAt(t)を呼出側の変更なしに差し替えられる境界を定める。
5. source分析情報は小さなprovenanceとして扱える契約だけ定め、モデル推論やBlob格納を追加しない。

## 禁止事項

- 2026-10-18の順次実装依頼に基づき、依存条件を満たしてから着手する。[実装レビュー運用](implementation-review-policy.md)に従い、実装担当と親レビューを分ける。
- 無関係なリファクタリング、ロック解除、手動配置の破棄、歌詞のline/partや時間の変更を混ぜない。
- 主歌詞の回避をマスク抜きで代用しない。補助的な大量反復歌詞は利用者指定により軌道再設計の対象外とし、AVOID-018の円形グラデーションマスクで扱う。演出全体の小矩形への縮小・未対応レイアウトの黙示除外は禁止。
- テスト期待値を通過のためだけに変更しない。旧ONの意図した変更には要件上の根拠を付ける。
- Gitコミット/push/PR/公開は依頼または明示許可がある範囲のみ。計画・タスク・証拠のコミット/プッシュは依頼済み。後続の実装依頼を受けた各段階では、利用者指定のworkブランチからGitHub Pagesへ公開し、反映確認後に人間へ確認ポイントを提示する。現在の計画更新を実装開始の許可とは解釈しない。

## 完了条件

- [x] 全H-IDに対応する同条件の変更前後キャプチャと比較HTMLを生成し、Pagesで全画像の表示・ハッシュ一致・前後ラベル・項目リンクを確認した。新機能不在/条件差/仕様見本を明示し、画像比較と必要な実操作を含む依頼を用意した。
- [x] workへコミット・プッシュした対象版がGitHub Pagesへ反映され、日英HTMLと確認fixtureの一致、公開版の起動/描画を確認した。
- [x] 親がコードとテスト結果をレビューし、指摘を解消した。人間の動作確認が必要なら比較URL・操作・期待結果を提示し、必須項目のOKと動作判定を記録した。不要なら利用者の委任に基づく親の判断理由と完了判定を記録した。

- [x] 同じproject/tで同じ結果を返し、1000回の順不同seekでもproject・結果が変わらない。
- [x] t−ε/t/t+ε、gap、最終end:null、出力長短縮/再延長が契約どおりである。
- [x] ID重複・非有限数・逆区間・時間重複・未知versionが保存前に検出され、失敗時の現projectが変わらない。
- [x] 16:9/9:16/1:1/21:9/4:5/任意videoSizeで物理半径が等方になる。
- [x] 既存3トラックのcut数・durationを回避トラックが増やさない。

## テスト方法

- 比較成果物: [共通契約](visual-review-comparison.md)に従い、全H-IDの画像対応・撮影条件・HTML表示・公開一致を検証する。画像だけで数値/時間/保存の自動試験を代替しない。
- Unit: 正規化の冪等性、入力非破壊、1000領域、境界条件。
- Integration: defaultProject→normalize→plan、旧JSONと明示的空配列。
- Regression: 旧OFFの計画snapshot、duration/timeline境界。
- 実環境: Pages確認ページの領域図・時刻選択・結果表でresolverを人間が確認する。製品UIの完成を待って省略しない。
- 今回のローカル実行結果: 下記証拠参照。既存のAVOID-001/002ログを今回の成功証拠へ流用していない。

## GitHub Pagesでの人間確認

[共通手順](pages-human-review.md)と[依頼テンプレート](templates/pages-review-request.md)に従う。以下は実装後に用意する確認ケースの予定であり、現在は未公開・未実施。依頼時には実際のUI名・サンプル名・ケースURLへ具体化する。

各項目に下表の前後キャプチャを準備し、比較HTMLの同じH-IDアンカーへまとめる。操作の前後状態が複数ある場合は、各状態それぞれで実装変更前/変更後を撮る。担当エージェントが画像を生成・公開検証してから人間へ依頼する。

| 項目ID | 人間に依頼する操作 | 期待結果 | 比較キャプチャ（予定） |
|---|---|---|---|
| AVOID-003-H01 | 確認ページの固定区間サンプルで、各境界の直前・境界・直後と空白区間を選ぶ。 | 実装したresolverの結果が区間内で固定、境界で切替、空白で回避なしとなる。図と結果表が一致する。 | 境界t−ε/t/t+εとgapの領域図・resolver実測表。旧版の未接続状態を明示する。 |
| AVOID-003-H02 | 旧データ・明示的な空配列・OFF・不正区間の各サンプルを選ぶ。 | 初期領域の補完と空配列が区別され、不正入力は元データを壊さず拒否される。 | 旧データ/空配列/OFF/不正入力ごとの図と正規化/拒否結果表。元データ保持は自動検証も添える。 |
| AVOID-003-H03 | 横長・縦長・正方形へ切り替え、出力長を短縮して再延長する。 | 円が楕円にならず、後半の回避要素が再延長で戻る。製品トラックはまだ未接続と表示される。 | 16:9/9:16/1:1の円と、短縮/再延長後の領域図。新トラックが未実装であることを表示する。 |

公開コミット / 変更前・変更後の実装識別子 / build ID / 比較HTML実URL / H-IDと画像の対応・撮影条件 / 操作用Pages実URL / 公開画像の一致・表示確認日時 / 自動検証証拠 / 依頼記録 / 人間の回答: 実装・公開後に記入する。親のコード/テスト結果レビュー、人間の動作確認の要否と理由も記録する。不要判定を人間のOK回答には置換しない。未確認を成功として補わない。

## 停止条件

- 破壊的なproject/portable version変更が必要と判明した場合。
- 既存データの手動値削除や正当なIDの再採番が必要になる場合。
- 仕様矛盾・破壊的データ変換・予期しない公開互換性影響・既存変更との競合は、確認済み事実と選択肢を記録する。

## ロールバックと引き継ぎ

- 当該タスクの差分を単位として戻せる状態を保つ。保存されたユーザーデータを削除するロールバックにしない。
- 完了条件ごとに達成/未達/未確認、対応コマンド・件数・ログ・frame証拠を追記する。
- 開始/終了HEAD、git status、対象外既存変更、未実施検証、後続に渡すAPI/制約を残す。
- ローカル検証済み・実環境検証待ち・完了を区別する。最終判定は最新の[実装レビュー運用](implementation-review-policy.md)に従う。人間にコードレビューを依頼しない。

## 証拠・残事項

- 計画根拠: [AVOID-001](AVOID-001.md) と [設計書のE01〜E23](avoidance-design.md)。
- 実装・ローカル試験: 下記の003専用証拠を追加。公開・親の最終判定のチェックボックスは未確認のまま。
- 個別の追加判断は着手時に記録し、共通設計と矛盾させない。


## 2026-10-18 実装・ローカル検証記録

- 担当割当: gpt-6.1-sol / medium。終了時HEADもc930c0977e1247865dcd5e45c4e9eb064b89f0fe、work上の未コミット候補。親へreview用に引継ぎ、担当自身はcommit/push/公開/完了判定をしていない。
- 追加: `src/08ca_lyric_avoidance.js` のモデル/単一validator/pure binary resolver/元ステージ円変換。`08_planner.js`のdefault/index接続、`11b_project_file.js`の副作用前検証、`12_ui.js`のmerge/replace/import/save境界・不正LS原データ保護。日英HTMLを最終buildから再生成した。
- 同一project/時刻でdetachedな結果を返し、計画indexはnull終端と未来の要素を保持する。最終composeのduration短縮/再延長へ追従し、cut数/時間を増やさない。render/adapter/新トラックUIへは未接続。
- adopted contractの数値・境界は維持。最短.04秒だけmachine epsilonを許容して十進丸めを吸収し、lookup/overlapは厳密。sourceは最大4096 UTF-8 bytes・深さ16の有限JSON objectとして採用し、deep cloneする。詳細は[設計](avoidance-design.md#avoid-003-実装契約2026-10-18)と[API](../dev/avoidance/README.md#avoid-003-production-control-model-and-resolver)。
- [model-test](evidence/AVOID-003/model-test.log): 17 checks成功（1000順不同seek、1000要素cap、境界±epsilon、gap/OFF、6寸法、非破壊/不正/roundtrip/LS保護）。[asset/font入り強化再実行](evidence/AVOID-003/model-test-with-assets.log)も同じ製品ソースで成功。既存asset1/userFont1・30 assertionsを含む。
- [既存6本](evidence/AVOID-003/baseline-results.json)全成功、[日英local smoke](evidence/AVOID-003/site-smoke-local.log)成功、[fresh build一致](evidence/AVOID-003/build-check.json)成功。既存assertionを変更していない。
- [既存save test](evidence/AVOID-003/project_file_test.cjs.log)は**失敗**: 初期cut数expected0/actual1、保存本体未到達。AVOID-013へ引継ぎ。今回の限定model roundtrip成功を既存save test成功に置換しない。
- 比較成果物: [local-20261018-03](../review/AVOID-003/local-20261018-03/index.html)、[manifest](../review/AVOID-003/local-20261018-03/manifest.json)、[実操作サンプル](../review/AVOID-003/local-20261018-03/sample.html)。42ケース/168 PNG、H01 16時刻・H02 8入力・H03 6寸法×3尺。旧c930c09を開始時archiveで固定し、最終build後に前後同条件で取得。旧resolverの不存在を観測として表示し、afterは実関数の結果。元PNGは制御領域図であり新歌詞軌道ではない。
- [capture](evidence/AVOID-003/capture-local-20261018-03.log)成功。bundled Noto CJKの実パネル全文字cmap検査・全結果行収容を実施。[local validate](evidence/AVOID-003/validate-local-20261018-03.log)は全181 assets/168 PNG・全リンク・42 live fixtures・1500/390px・重ね合わせ/前後切替/原寸・出力長操作で成功。
- [新003 negative](evidence/AVOID-003/negative-local-20261018-03.log): 無改変cloneをoverlay配信してpositive成功後、条件＋self hash改変、PNG、fixture、H-ID欠損、source hash、実測座標、リンク欠損、overlay座標の8変異を期待理由付きで拒否。
- manifest SHA-256: `ce885af40d40d99dcb1cc11537b6681ec4eb2824df96d31334695424caa34fce`。製品model SHA-256: `fcafeeae6affe51df2c9dbea1f09a440e36343976208069c24efcc3ec0ebea0d`。[実行環境/版/試行履歴](evidence/AVOID-003/implementation-context.json)。01はパネル切れ、02は390px比較のhash折返し不足を検出した未公開試行としてworkへ退避し、成果物を上書きしていない。
- [親レビュー用引継ぎ/公開後確認下書き](reviews/AVOID-003-local-20261018-03.md)。親からの途中R01〜R08指摘を修正済み。親の最終コード/テストレビュー・公開日英/fixture/全画像hash・公開ブラウザの検証と、人間動作確認の必要/不要の判断は**未実施**。ローカル成功を公開成功/完了にしない。
- AVOID-004以降の実装は開始していない。AVOID-002の旧公開bundle・manifest・validator受入条件は変更していない。

## 親の公開前レビュー

- [親レビュー](evidence/AVOID-003/parent-review.md)で最終差分と試験結果を承認。独立した35,916件の時刻照合と十進区間8件が成功し、最終モデルhashも一致した。途中指摘は解消済み。
- [実行中環境](evidence/AVOID-003/publication-environment.json)はrevision3、current=true、unrestricted/enforced、connected。[通常HTTPS](evidence/AVOID-003/publication-https.log)は継承proxy/CA/TLS維持で200/verify0。
- 次はworkへの公開と実公開検証。上記の実装担当終了時点の「未実施」は履歴であり、公開成功・最終判定はまだ主張しない。

## 公開検証・完了判定（2026-10-18 UTC）

- 対象commit: `a0902746faf761f2fdde936d4e6d6bc389889bb3`（workへpush済み）。[Pages run 39164015364](https://github.com/mokusatsu/lyricfx.JIZURA/actions/runs/39164015364)成功を確認したうえで、公開ファイル自体と実動作を別途検査した。
- [公開比較](https://mokusatsu.github.io/lyricfx.JIZURA/review/AVOID-003/local-20261018-03/) / [実操作](https://mokusatsu.github.io/lyricfx.JIZURA/review/AVOID-003/local-20261018-03/sample.html)。H01/H02/H03の42ケース、168 PNGを含む全181 assetsとmanifest、日英HTMLがHTTP200かつ手元のhashと一致。manifest SHA-256は `ce885af40d40d99dcb1cc11537b6681ec4eb2824df96d31334695424caa34fce`。
- コマンド: `JIZURA_BROWSER=/usr/bin/chromium node dev/avoidance/model-review.cjs validate local-20261018-03 --base-url https://mokusatsu.github.io/lyricfx.JIZURA/`、`JIZURA_BROWSER=/usr/bin/chromium node mcp/site-smoke-test.mjs`。どちらもexit0。[公開validator](evidence/AVOID-003/public-validation.log)は全42 live cases・1500/390px・前後/重ね合わせ/原寸/リンク/操作も成功。[日英smoke](evidence/AVOID-003/public-site-smoke.log)は起動・2行歌詞生成・実描画成功。
- 親が公開UIの境界/空白、missing/empty/OFF/拒否、6寸法、短縮/再延長、旧版関数不在を28項目で独立操作。[観測](evidence/AVOID-003/public-parent-ui.json)、[desktop比較](evidence/AVOID-003/public-comparison-desktop.png)、[desktop実操作](evidence/AVOID-003/public-sample-desktop.png)、[mobile実操作](evidence/AVOID-003/public-sample-mobile.png)を確認した。真円、実測表、前後ラベル、制限説明が表示され、横溢れ/欠損/JS例外なし。
- 人間の動作確認: **不要（親の委任判定）**。003は内部データ/時刻解決の基盤で、新歌詞描画・トラック編集を有効化していない。契約の数値/時刻/非破壊条件を自動試験、親の独立照合、公開実操作と画像確認で検証できたため、主観的な演出/編集操作の判断は不要。人間のOK回答としては記録しない。
- [公開機械記録](evidence/AVOID-003/publication.json)と[親の最終レビュー](evidence/AVOID-003/parent-review.md)に基づき、全完了条件を達成として親が完了判定した。上記の未実施表記は各時点の履歴。
- 制限: 184IDの対応表は全adapter完了を意味しない。全画面描画/新トラック/マスクは後続。既存保存テストは冒頭cut数不一致の失敗をAVOID-013へ保持。次の依存タスクはAVOID-004。
