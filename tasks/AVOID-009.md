# AVOID-009 拡張Dの34レイアウト・カスタム描画の対応

- 状態: 実装中
- 段階: 特殊描画
- 技術依存: [AVOID-005](AVOID-005.md)
- 事業優先度: 未指定。記載順は技術上の推奨順。

## 2026-10-23 JST 開始記録

開始ブランチwork、HEAD 7d3ced6。AVOID-008の必要4構図への最新OKを受領し、依存005/006と前段008の完了記録を確認して順次開始。[全開始状態](evidence/AVOID-009/start-state01.json)。既存pyc変更と全未追跡成果物を保持する。実装はgpt-6.1-sol / mediumのcontextなし子、親がコード・生テスト結果をレビューし、画像照合もcontextなしsolへ分離する。公開結果確認は永久停止、追加サイバー調査は行わない。必要な確認例だけ原寸アニメ部分のMP4/比較HTMLを公開する。旧公開検証必須の条項はAGENTS.mdに従い対象外。

AVOID-008受入・009開始のローカルcommitは6e016f7。pushはproxy:8080への接続失敗（exit128）で未完。[操作記録](evidence/AVOID-009/start-publication-operation01.json)。設定239/観測239・running/currentを取得したがnetwork stateはunknownであり、実通信成功とは扱わない。ローカル実装と親レビューを継続する。その後、実行コマンドに通常のnetwork権限を明示した同じpushは成功（7d3ced6..c40d0f0）。継承proxy・CA・TLSを維持し、公開結果確認は行っていない。初回失敗は消さず保持する。

## 初期境界の親レビュー

[checkpoint01親レビュー](evidence/AVOID-009/parent-boundary-checkpoint01-review.json)で34IDの初期役割表、custom13経路のtyped未対応診断、元座標/描画保持を限定受入。親の独立pure13件は元rawと完全一致。browser03の13経路×3時刻=39描画組、OFF/manual/lock/emphasis4条件、診断roundtrip/idempotence/独立fresh legacyとの再finalize一致をrawから照合。親browser再実行・画像閲覧はこの段階では0。Dの回避幾何もcustomの安全な配置も未実装/未受入であり、タスク完了ではない。

初期レビューでcustom診断の優先順位、円筒の補助扱い、custom FX取りこぼしを指摘し修正した。旧browser01のbg source-preservation期待の誤りは、旧来のcenter adapterがnoDで適用可能なため、独立fresh noDとの一致へ試験を訂正。元失敗rawを保持し成功へ置換しない。旧01/02のrunner原本snapshotは欠けており、その歴史的内容の完全再現は主張しない。今後の実行は開始前snapshotを保存する。次は実D所有単位と全区間証明のadapterを順次実装する。

## D初期試作の進捗（未完）

[34IDの固定ソース監査](evidence/AVOID-009/inventory-audit01.md)と[親照合](evidence/AVOID-009/parent-inventory-audit01-review.json)で全登録ID/行番号を確認。分類と戦略案はadapter完成・視覚承認を意味しない。pileの大量heap、wordSearchの無文字decoy capsule、magnetsのDECOYと主文字shadow、wall/glitch/crowdの実sourceコピーを分離して扱う。

[魚眼01の親raw再計算](evidence/AVOID-009/parent-fisheye01-review.json)は10開始snapshot一致・72条件/576時刻観測・安全2条件の8証明polygon/60実観測polygonで実円距離とstage包含を確認。試験円中心は(.5,.5)であり契約初期位置(.5,.42)ではない。小円2safe・70不足、半径.2ではsafe0。最大CSSサイズ1点のTextMetricsだけでは連続サイズを証明できないため、01の安全性証明は受入保留。固定CSS＋均等Canvas拡大、Gaussian位置関係を使う区間境界、同条件での再検証を指定担当が実装中。[次戦略の読み取り監査](evidence/AVOID-009/fisheye-strategy-audit01.md)は一体行/レンズの再配置を提案しており、実装済みとは扱わない。独立親再計算は各segment.circleの実値を使用。別の親メッセージで契約位置を使った空き高さ計算は実fixtureの失敗原因としない。

## 開始前確認

- ブランチ・HEAD・git status: 上の実開始記録とstart-state01.jsonを参照。従来の計画文は以下に保持する。
- 共通解析基準: b7c23bf。スキル導入済みHEAD: 3c79480。着手時に差分を再確認する。
- 正本: [設計・根拠](avoidance-design.md)、[一覧](task-list.md)、[スキル](../.agents/skills/evidence-driven-task-management/SKILL.md)。
- 依存タスクの必須条件と証拠を確認する。完了を推測せず、未完条件を引き継ぐ。
- 対象ファイルに既存変更がある場合は競合を確認する。同時進行タスクは原則1件。

## 目的

3D面・affine・Canvas直接文字・カスタムプログラムを共通フックの取りこぼしなく扱う。

## 変更範囲

- 当該段階のGitHub Pages確認サンプル・変更前後のキャプチャ画像・比較HTML・公開manifest、確認依頼/回答記録。共通手順は[Pages人間確認運用](pages-human-review.md)と[比較画像・HTML契約](visual-review-comparison.md)。

- src/11p_layoutsD.js、src/11w_custom_draw.js、src/11wa_custom_effects.js
- src/03_text.js等の特殊描画境界、カスタムcomponent契約・fixture
- 文書更新: 本記録・task-list.mdの状態/証拠、設計の該当契約、対応表を同じ変更で同期する。

## 実装手順

- 個々の描画をprimary/tiledAux/independentDecorに分類する。大量反復補助は経路変更せず018へ引き継ぐ。同じID内の主歌詞は対応対象のままとし、名称やmainDrawの有無だけで分類しない。

1. drawAff/drawAffPlain、文字texture/3D面、直接fillText/strokeTextを分類してstage boundsを取得する。
2. cube/cylinder/flag/blocks/dominoes/wall等は物体単位のadapterを用意する。
3. wordSearch/maskReveal/contourのCanvas直接文字、drawProgram replace/overlay、カスタムlayout/decorの文字を検査する。
4. カスタムの既存手動座標指定は勝手に変えず、対応capabilityと未対応の診断を定義する。

## 禁止事項

- 2026-10-18の順次実装依頼に基づき、依存条件を満たしてから着手する。[実装レビュー運用](implementation-review-policy.md)に従い、実装担当と親レビューを分ける。
- 無関係なリファクタリング、ロック解除、手動配置の破棄、歌詞のline/partや時間の変更を混ぜない。
- 主歌詞の回避をマスク抜きで代用しない。補助的な大量反復歌詞は利用者指定により軌道再設計の対象外とし、AVOID-018の円形グラデーションマスクで扱う。演出全体の小矩形への縮小・未対応レイアウトの黙示除外は禁止。
- テスト期待値を通過のためだけに変更しない。旧ONの意図した変更には要件上の根拠を付ける。
- Gitコミット/push/PR/公開は依頼または明示許可がある範囲のみ。計画・タスク・証拠のコミット/プッシュは依頼済み。後続の実装依頼を受けた各段階では、利用者指定のworkブランチからGitHub Pagesへ公開し、反映確認後に人間へ確認ポイントを提示する。現在の計画更新を実装開始の許可とは解釈しない。

## 完了条件

- [ ] 全H-IDに対応する同条件の変更前後キャプチャと比較HTMLを生成し、Pagesで全画像の表示・ハッシュ一致・前後ラベル・項目リンクを確認した。新機能不在/条件差/仕様見本を明示し、画像比較と必要な実操作を含む依頼を用意した。
- [ ] workへコミット・プッシュした対象版がGitHub Pagesへ反映され、日英HTMLと確認fixtureの一致、公開版の起動/描画を確認した。
- [ ] 親がコードとテスト結果をレビューし、指摘を解消した。人間の動作確認が必要なら比較URL・操作・期待結果を提示し、必須項目のOKと動作判定を記録した。不要なら利用者の委任に基づく親の判断理由と完了判定を記録した。

- [ ] 34stock IDに対してmainDraw外の文字も検査される。
- [ ] 3D/affineとcameraの合成が正しく、二重変換やクリップ欠けがない。
- [ ] drawProgram replace/overlayおよびcomponent由来の副歌詞が対応表に含まれる。
- [ ] カスタム非対応を自動成功扱いせず、保存・プレビュー・出力で同じ診断となる。
- [ ] 演出コピーに絶対回避座標が混入しない。

## テスト方法

- 比較成果物: [共通契約](visual-review-comparison.md)に従い、全H-IDの画像対応・撮影条件・HTML表示・公開一致を検証する。画像だけで数値/時間/保存の自動試験を代替しない。
- Unit: affine/透視面の包絡、特異行列、クリップ、カスタム文字node。
- Integration: stock34ID、custom/drawing replace/overlay、cam/ghost/treat。
- Regression: drawing_frames、drawing_fonts、custom_effects、effect_copy_fidelity。
- 実環境: cube/flag/cylinder/contour/wordSearchとカスタムfixtureの動画。
- 現時点の実行結果: 未実施（後続実装タスク）。既存の基準ログはAVOID-001へ参照し、修正後の証拠として流用しない。

## GitHub Pagesでの人間確認

[共通手順](pages-human-review.md)と[依頼テンプレート](templates/pages-review-request.md)に従う。以下は実装後に用意する確認ケースの予定であり、現在は未公開・未実施。依頼時には実際のUI名・サンプル名・ケースURLへ具体化する。

各項目に下表の前後キャプチャを準備し、比較HTMLの同じH-IDアンカーへまとめる。操作の前後状態が複数ある場合は、各状態それぞれで実装変更前/変更後を撮る。担当エージェントが画像を生成・公開検証してから人間へ依頼する。

| 項目ID | 人間に依頼する操作 | 期待結果 | 比較キャプチャ（予定） |
|---|---|---|---|
| AVOID-009-H01 | 拡張D34IDの一覧でcube/flag/cylinder/dominoes等を再生する。 | 3D/affineの面と主文字が揃い、クリップ欠け・二重変換がない。 | D34IDの一覧とcube/flag/cylinder/dominoesの面・主文字の連続コマ。 |
| AVOID-009-H02 | wordSearch/contour/maskReveal/mosaicTiles等を見る。 | 直接Canvas描画や主文字を作るタイルも対象になり、補助反復として主文字を消していない。 | wordSearch/contour/maskReveal/mosaicTilesの全体像と主文字の拡大。 |
| AVOID-009-H03 | 確認用custom/drawProgramの対応・未対応ケースを切り替える。 | 対応ケースは主歌詞と配置が揃い、未対応は分かる形で診断される。 | 同じcustom入力での描画または診断画面。未対応の画像欠損を正常描画と扱わない。 |

公開コミット / 変更前・変更後の実装識別子 / build ID / 比較HTML実URL / H-IDと画像の対応・撮影条件 / 操作用Pages実URL / 公開画像の一致・表示確認日時 / 自動検証証拠 / 依頼記録 / 人間の回答: 実装・公開後に記入する。親のコード/テスト結果レビュー、人間の動作確認の要否と理由も記録する。不要判定を人間のOK回答には置換しない。未確認を成功として補わない。

## 停止条件

- カスタムDSLの公開schemaの破壊が必要になる場合は別の互換性判断へ切り分ける。
- 仕様矛盾・破壊的データ変換・予期しない公開互換性影響・既存変更との競合は、確認済み事実と選択肢を記録する。

## ロールバックと引き継ぎ

- 当該タスクの差分を単位として戻せる状態を保つ。保存されたユーザーデータを削除するロールバックにしない。
- 完了条件ごとに達成/未達/未確認、対応コマンド・件数・ログ・frame証拠を追記する。
- 開始/終了HEAD、git status、対象外既存変更、未実施検証、後続に渡すAPI/制約を残す。
- ローカル検証済み・実環境検証待ち・完了を区別する。最終判定は最新の[実装レビュー運用](implementation-review-policy.md)に従う。人間にコードレビューを依頼しない。

## 証拠・残事項

- 計画根拠: [AVOID-001](AVOID-001.md) と [設計書のE01〜E23](avoidance-design.md)。
- 実装差分: なし。検証ログ: なし。上のチェックボックスはすべて未達/未確認。
- 個別の追加判断は着手時に記録し、共通設計と矛盾させない。


## 2026-10-19追加要件の引継ぎ（未着手）

006の段階的再配置APIを再利用し、当該IDの演出意図に応じて候補順を検討・記録する。固定の移動→分割→縮小順は利用者要求ではない。可変半径.02〜.45、通常円.2、複数位置/aspect・文字量で全区間の安全性と成立限界を試験する。明示サイズ/手動/lock、主歌詞保持、所有板と読順、既存安全候補を保つ。成立しない場合の選択除外と診断を実装し、代替を元演出の成功に数えない。006完了前に着手しない。全体の横断検証は[AVOID-019](AVOID-019.md)へ引き継ぐ。

## 2026-10-23 継続レビュー（未完）

親レビューで[魚眼04](evidence/AVOID-009/parent-fisheye04-review.json)の288条件中142安全/146不足、10入力snapshot、630証明polygonと6,516実観測polygonの円距離・stage包含を独立再計算。契約初期円も含む。固定CSS字体をCanvasで拡縮するON方式の見た目は未承認。

[立方体08](evidence/AVOID-009/parent-cube08-review.json)は132条件中24安全/108不足。親が101snapshot、24証明包絡、8,532実観測polygon、94面内文字境界、108 native/replay pixel組を照合し統合へ限定受入。三辺の等長・元のpitch・top文字サイズ・面内余白・元歌詞の時系列対応を保持する。統合後の機能試験も同件数で成功したが、全D完了・視覚承認とは扱わない。

[折り紙03](evidence/AVOID-009/parent-origami03-review.json)は384条件301安全/83不足、拡張96条件、実文字付着60条件、OFF12条件のraw/pinsを照合し、1,584のglyph頂点が紙面と記入域に収まることを独立計算。親が空描画時の判定不具合を追加発見し実装担当へ修正返却中。立方体/折り紙のOFF比較は元の各演出ブロックを同じ周辺エンジンへ差し替えた比較であり、アプリ全体の6e016f7との比較とは区別する。最終統合版の回帰・視覚照合が残る。

[性能01/02の親再計算](evidence/AVOID-009/parent-performance02-review.json)で失敗を保持。入力/100・1000件/ウォームアップ3回/測定6回を維持した。既存の容量制限付き完全一致CキャッシュをDへ拡張し、6条件の完全値・alias・descriptor・freeze・オブジェクト分離・入力不変、円/区間/フォント/ヘルパー/登録の無効化を確認。02で100件は1.617倍まで改善したが、1000件は5.841倍で基準2倍を超える。coldも約2.0秒/18.8秒で未解消。描画追加負荷は基準3ms以内。性能合格として扱わず、計算再利用と実測費用の診断を継続する。

公開結果の確認アクセス・親による画像動画閲覧は0。利用者の恒久指示を維持し、確認が必要な演出だけを後でMP4化・別コンテキストsolで視覚照合する。AVOID-009は実装中のまま、010以降は未着手。
