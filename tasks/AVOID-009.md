# AVOID-009 拡張Dの34レイアウト・カスタム描画の対応

- 状態: 実装中
- 現在の確認段階: [既存代表の残り3例は未回答](reviews/AVOID-009-selected-20261023-01.md)。扉・円筒の別修正版はOK。次の確認は今回の集約へ保存し、009内の実装を継続。全体完了ではない。
- 最新回答: 円筒に「OKです。今から寝るので8時間後にまとめて確認するくらいにして」を受領。約8時間の確認集約を予約し、009内の独立実装を継続。[今回の進捗と確認queue](evidence/AVOID-009/batch-20261023/progress.json)。
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

## 代表MP4の独立視覚レビューと差し戻し

利用者の指示に従い、親は画像・動画を閲覧せず、生成担当と別のコンテキストなしgpt-6.1-sol / mediumへ[視覚照合](evidence/AVOID-009/independent-visual01.md)を依頼した。ネイティブ60fps/4秒の代表4組について、魚眼・立方体・gateは演出意図を限定受入。blintzは元の1:1菱形が約4:1へ扁平化し、四隅の折り運動が失われるため不合格。幾何安全・可読性だけでは承認せず実装担当へ差し戻し、rx=ryの元比率を保つ紙面と再組版を検討する。未修正のblintzは人間確認用に公開しない。

[親のMP4メタデータ照合](evidence/AVOID-009/parent-media03-review.json)では60assetsのhash、8MP4の実60fps/240frame/4秒・原寸を確認した。撮影条件fps60は前後両方のplanに設定し、24fps素材を60fpsコンテナへ複製した旧試行は失敗として保持。魚眼235/240、他240/240のnative入力frameが異なる。親の画像閲覧と公開先アクセスは0。

[折り紙の空フレーム修正](evidence/AVOID-009/parent-origami04-review.json)は36件の既存UNMEASURED_INKを解消し24非空観測は完全一致、98archive entryを独立hash照合して統合へ受入。ただし上記blintz比率は別の視覚問題であり完了として扱わない。[完全一致キャッシュの親レビュー](evidence/AVOID-009/parent-cache02-review.json)と[同一finalization内の純粋な形状証明再利用](evidence/AVOID-009/parent-proof-memo02-review.json)を限定受入。後者は112入力pin・6family/108native時刻・14key条件を照合したが、実1000区間の診断では再利用0件/性能改善なし。実入力の差異を調べ、再利用の依存条件をソースから確認して継続する。性能成功へ置換しない。

## blintz比率の修正と証拠の保存

[親レビュー05](evidence/AVOID-009/parent-origami05-review.json)で、blintzの独立した横縦半径を1つのwriteRへ変更した1行差分を確認。rx=ry、元の折り角・順序・clockを保持し、文字幅と高さの大きい方から紙面を決める。通常円の代表例は元の字体サイズのまま2行再配置で成立。対象256条件は195安全/61不足、拡張64条件は60安全/4不足、付着48条件は35安全/13不足、OFF2条件は12pixel組と測定回数一致。12live pin・40入力pinと1,184 glyph頂点の紙面・記入域包含を独立照合。旧256条件から12安全→不足・2不足→安全へ変わった結果を保持し、扁平化による成功を残さない。新MP4の独立視覚照合は別途必要。

[折り紙証拠の保管記録](evidence/AVOID-009/origami-history01.json)に旧checkpoint03と修正checkpoint04を格納したarchiveのSHA、全174entry照合、復元コマンドを記録。容量制約のため、この大容量archiveはGitへ保存しskip-worktreeにしており、作業ツリーへのコピーを省略する。既存の無関係なファイルの削除やgcは行っていない。

## 代表4例の確認段階（2026-10-23）

四隅折りの比率修正後、実60fpsのframe30で包絡違反を検出。物理的な紙のdiamondではなく、折り線のpolyline記録が持つAABBまで連続的に包含する八角形証明へ修正した。描画・runtime guardの緩和は行わない。[親レビュー06](evidence/AVOID-009/parent-origami06-review.json)で13source/55入力pin、4,772実polygon、48の端点AABB頂点を独立照合。256条件183安全/73不足、拡張64条件48安全/16不足、付着48条件30安全/18不足。旧成功が不足へ変わるものを正しく保持し、境界72件と代表240frame/5alpha1観測が成功。正方形比率・四隅折りは[独立視覚02](evidence/AVOID-009/independent-visual02.md)で限定PASS。

[frozen04親レビュー](evidence/AVOID-009/parent-preview04-review.json)と[stagedソース照合](evidence/AVOID-009/parent-staged-frozen04.json)により、レビュー済み10製品ファイルを保存する。main workingの性能memo差分は上書きせず、[WIP capsule](evidence/AVOID-009/performance-wip-capsule01.json)へ別保管。機能上のmemo10受入と正式な性能合格を混同しない。最新の正式性能02は1000件5.841倍の未達、cold負荷も未解消。診断profile06は正式試験ではない。

最終frozen04で新規実行した[native04](evidence/AVOID-009/native04/scope.json)は全34ID×3時刻=102組の回避OFF RGBAがwhole6e016f7と一致。136native probeの89対応組が一致、47件のtyped未対応を保持。34ID全回避成功とは扱わない。[core04](evidence/AVOID-009/core04/review01.json.gz)は前後各11suite、各8成功/3失敗。JA/独立ENのlyric_area先頭0!==1とcompositing色差は両方の新規rawで一致し、期待値を変更せず失敗として残す。未到達UI/MP4/EN assertions、AVOID-013の保存本体は成功ではない。全22job終了・cleanup・入力pin不変を確認。

[最終回帰の親再計算](evidence/AVOID-009/parent-final-frozen04-regression.json)は99入力pin、全OFF hash/対応PNG hash、22実行のrawログhashと前後の失敗署名を独立照合。[過去の限定受入raw](evidence/AVOID-009/reviewed-functional-raw01.json)は56entryをxz内に保管し、内容hashと復元名を記録。過去の異なるsource版の試験を最終版の再実行とは扱わない。

core04/lite-capsule01.tar.gzに22実行の全rawログ・driver/preload・元test bytes・pinを含む153entryを保存（133,239bytes、SHA-256 `8a437fb7db466efe6040ccbecbacb4de3663dc8bf114be06a667e37f8a5de44d`）。[registry05親レビュー](evidence/AVOID-009/parent-registry05-review.json)は既存単体試験をkernel-only fixtureへ保守し、完成したstock adapterとの二重登録と、可変のsynthetic closureに対するcache再利用を解消。元assertionは変更せず4登録拒否/13callback/5保持条件を実行。stock全体の幾何合格には数えない。旧04の失敗rawも保持し、製品APIへ上書き登録などを追加していない。

[代表4例](reviews/AVOID-009-selected-20261023-01.md)だけSitesへ追加し、公開操作succeededを記録した。元の606 distファイル・hosting/homeと既存の閲覧対象を保持。公開結果確認は利用者指示により中止・対象外、接続/画像/動画/起動/状態pollingは0。人間の回答は未回答。形と動きの判断だけを依頼し、人間のコードレビューは求めない。

残件: 円筒は[cylinder-wip01](evidence/AVOID-009/cylinder-wip01/status.json)に独立実装・試験の未親受入packetを保存。flipCardsは未検証/未統合WIP capsuleに隔離。両者ともmain製品へ含めず、人間確認後に親レビューから再開する。他Dとcustomの実回避・正式性能は未完。009は実装中、010以降は未着手を維持する。

製品・試験・記録はworkの`895bde9`へ保存しpush成功。[終了状態](evidence/AVOID-009/delivery-selected01.json)に10製品fileのGit/frozen一致、残存する性能WIP4fileと既存pycacheのhash保持、core軽量capsule153fileの親独立hash照合を記録した。無関係な未追跡ファイルは追加・削除していない。公開結果確認と親の画像閲覧は0。

## 扉の横長優先（利用者フィードバック）

「折り紙（扉）は入りきる場合は横長にして納めるほうが良好な演出に思える」を受領。下側への固定要求ではなく、空き領域に横長の紙面を収められるなら縦型の多行へ変更する前に優先する意図として実装へ返却。[開始記録](evidence/AVOID-009/gate-landscape-start01.json)。元の扉運動と文字の紙面付着、可読性、全区間包絡、明示サイズを維持する。blintzとOFFは変更対象外。指定モデル担当が別treeで修正し、親レビュー後に扉1例だけ新旧MP4比較を用意する。他3例をOKとみなさず、009実装中・010以降未着手を継続する。

修正版は元構成の無変更配置を先頭に保持したうえで、横長（幅≥高さ×1.2）の元行構成/全文1行/7列をfont1→.6で評価し、最後に旧候補へフォールバック。代表は71.32→61.13pxの約14%縮小で全文1行の紙745.81×110.04pxを下へ配置。追加65%候補では完全包絡が不足することを実測し、余白やガードを緩和せず60%を採用した。明示サイズ・可読floorは維持。

[親レビュー](evidence/AVOID-009/parent-gate-landscape01-review.json)で09nだけの差分、102pin、128証明/16,580実polygonを独立照合。前後51例safe33→36・低下0、元構成9例とactualblintz13例不変、OFF24RGBA hash一致。拡張32・保護8・明示サイズ2・alpha1 3時刻も通過。診断のcache誤再利用失敗を保持し、正式同条件seed704で再試験した。親の計算スクリプトはregion非activeのt=4と保護ケースのnull geometryを訂正し、製品やrawは変更しない。

[統合receipt](evidence/AVOID-009/gate-landscape01/integration-receipt01.json)でmainの09nとJAENの該当moduleだけ置換し、逆置換で開始時bytes完全一致を確認。性能WIP09a/09lとpycacheは不変。Gitへは別treeのレビュー済みJAENを格納し、workingの性能WIPは保持する。扉1組のみ生成した60fps MP4は[parent mediaレビュー](evidence/AVOID-009/gate-landscape01/parent-media-review01.json)と[独立視覚](evidence/AVOID-009/gate-landscape01/independent-visual01.md)で限定受入。[新しい動作確認](reviews/AVOID-009-gate-landscape-20261023-01.md)を用意し、人間の回答は未回答。

製品・試験・証拠をworkの`9f4318b`へcommit/push。扉1例のSites[公開操作](evidence/AVOID-009/gate-landscape01/publication.json)はsucceededを返した。source commit16fa2e9、既存671 dist filesとhosting/home・閲覧対象を保持。公開先へのアクセスや状態pollingは実施しない。小packetのraw4件とsource/test4件を親が内容hash照合し、診断失敗とcache誤再利用の無効な試行も軽量履歴として保持した。正式性能・他D/custom・保存の未完状態は変えず、扉の形と動きの人間確認へ戻す。

## 扉のOK受領・円筒の限定受入

最新の「OKです 続きを順次実装して」で扉の動作確認OKを受領。[回答](evidence/AVOID-009/gate-landscape01/human-review01.json)。009全体の完了や他3例の回答には拡張せず、円筒へ進んだ。[開始状態](evidence/AVOID-009/cylinder-start01.json)は14beefb、既存性能WIPとpycacheを保持。指定モデル担当が旧円筒checkpoint04を最新canonicalへ別treeで合成し、mainは承認差分だけを反映した。

円筒は主文字と全周回反復・裏面・帯・ガラスをprimaryとして一体配置する。元のslot数・順序・mi・rowphase・回転clockを保持し、物理半径/自然な行組み/pitch→局所字体縮小を検討。帯は元の74点clipとgradientを再現するD cylinder/main限定経路で、回避用maskではなく全preclip矩形を保護する。旧root丸め失敗を保持し、元live camera CTMを維持して正確にreplayする。C/Bのcapabilityや一般のaffine判定を緩和しない。

[旧checkpoint親レビュー](evidence/AVOID-009/parent-cylinder-checkpoint04-review.json)で175条件66安全/108不足/1未対応、1,231証明/141,035実polygonと入力pinを独立照合。[最新canonical親レビュー](evidence/AVOID-009/parent-cylinder-canonical01-review.json)は46条件22安全/23不足/1未対応、435証明/43,616実polygonを独立再計算。OFF72、clipless native108、帯native324組のhash一致。whole14beefbとのC/D/円筒OFF18条件72組も同じ画像とsafety/transport metadataを保持した。親の再計算スクリプトは最新rawの非圧縮JSON形式へパスを訂正して実行し、元テスト/製品の変更はない。

[統合逆差分検証](evidence/AVOID-009/cylinder-canonical01/verify-integration01.py)を親も実行PASS。09aは承認bridgeだけをmemoWIPへ追加し、11pの円筒ブロックと09oを反映。JAEN開始bytesを元canonicalと既存WIPから再構築し、現在の逆差分が全文一致することを確認。Gitへはレビュー済みcanonical5製品fileを保存し、workingの性能WIPは残す。最新raw/runner/patchは9.18MB capsuleへ保存し、旧40MB archiveは参照指紋・復元方法を残して持ち込まない。

縦横2代表のMP4をローカルで同条件生成し、全4本60fps/240frame/4秒、変更後480frameのstrict guardsが成功。親はhash/ffprobeのみ、画像照合は別contextの指定solが20標本で両方PASS。[証拠](evidence/AVOID-009/cylinder-canonical01/independent-visual01.md)。縦は構成・字体・時系列を維持した平行移動であり追加人間確認不要と親が判断。行組みが変わる[横の1例](reviews/AVOID-009-cylinder-reflow-20261023-01.md)だけを公開対象へ絞り、人間の形・動き・可読性確認を依頼する。人間の回答は未回答、009実装中・010以降未着手を維持。flipCardsと他D/custom・正式性能は引き続き未完。

製品・試験・証拠はworkの`694b289`へ保存しpush成功。横画面1例の[公開操作](evidence/AVOID-009/cylinder-canonical01/publication.json)はsucceeded。既存689 dist files・hosting/home・閲覧対象を保持し、公開結果の接続/再生/画像/起動/pollingは0。mainには引き続き性能WIPと既存pycacheが残り、公開/保存製品は検証済みcanonicalと同一bytes。形式検査は証拠のunified patchにある末尾context空行をwhitespaceとして検出したため、その正本patchのbytesは変更せず保持し、当該patch以外のコード・文書でcheck成功を確認した。機能試験の失敗を合格へ変更したものではない。

## 約8時間後への確認集約

円筒の[人間OK](evidence/AVOID-009/cylinder-canonical01/human-review01.json)を記録。最新指示により23:01 UTC目安の一回の進捗まとめを予約した。以後の必要な動作確認は未回答の版・根拠・比較をqueueへ保存し、009内の独立部分を進める。他の未回答をOKへ置換せず、009や依存010の完了条件を保つ。

次は保存された性能memoの正式03測定をCPU/browser排他で実行し、flipCardsは別treeでsource調査・実装を開始。古い失敗captureの稼働しない親子だけをownerが特定して停止し、失敗raw/outputは保持した。性能測定中は他のbrowser/encodeを実行しない。[進捗](evidence/AVOID-009/batch-20261023/progress.json)を正本として更新する。公開結果確認の永久禁止はscheduledまとめにも明示した。

## 2026-10-23 集約作業: 魚眼の証明データ再利用を受入

[formal03親レビュー](evidence/AVOID-009/performance/formal03/parent-review.json)で、元のwarmup3/sample6・100/1000カット・同一入力・同一runnerの性能基準を受入。親はraw全sampleからp95と比率を再計算し、開始/終了pinと現在sourceを照合した。1000カットの計画p95は279.2→370.7ms（1.3277倍、上限2倍）、描画p95差は+1.7ms（上限3ms）。100カットは1.1610倍/+0.9ms。初回1000カットは2712msであり、cold入力編集の高速性は保証しない。測定後segmentは298/2998件ともinsufficient-spaceであり、安全例の増加や全D34演出の性能受入とは扱わない。旧formal01/02の失敗は保持。

前回受入済みmemo10 sourceと円筒bridgeの既存統合証拠を再利用し、[carry](evidence/AVOID-009/performance/formal03-carry01/receipt.json)で6系統108観測・15keycontrols、memo無効時との全JSON同一、freshな領域solve4件、共有alias/freeze/detachedを確認。proof11の元browser終了codeはorchestrationが保持していないため成功exitを捏造せず、保持rawへの元最終assertion再実行exit0と最終summaryを根拠とする。cache6条件/6失効はexit0。円筒実adapter登録後に旧cache試験の未使用probe ID cylinderが重複したexit1も保持し、test-onlyで未登録wallへ1語変更した。全実条件/失効/期待値は維持し、wall実装時にはfixtureの再隔離が必要。

描画意図を変えない限定的な証明データ再利用であり、既存sourceレビューと上記同値性の根拠により追加の人間確認・比較公開は不要と親が判定。009全体は実装中、保存検証の既存失敗と公開結果確認禁止は継続。

## 2026-10-23 集約作業: flipCardsの限定対応

[親コード・rawレビュー](evidence/AVOID-009/parent-flipcards-final03-review.json)で、1b0d901へ合成した固定版を限定受入。カードの完全な表裏・影・主文字と両隅の同じ歌詞をprimaryに含める。裏向きテーブルとliteral「？」「★」の覗きは元source由来のindependentDecorとして配置・時計を保持。元のカード寸法とめくれ順/clockを保ち、まず共同移動、次に列数・行間、最後にカード内文字の局所サイズを探索する。明示サイズと主文字/隅文字の可読下限は維持。通常代表は元カード寸法104.13pxのまま、主字62.48→56.23px、隅文字15.62→14.06px（90%）、2列・右へ271.71pxとなる。

半回転時の元glyphを落とさず記録するため、変更されていないflipCards source・plain text・clipなし・元描画transportだけへ有限forward projectionを限定。一般A.affine/inverse、font/stroke/AA guard、C/B等の適用範囲は維持。nativeの全guard付着失敗を診断として残し、そのnative候補はsafeに選ばない。guardを物理outlineから分離する編集案は自動審査で「余白を弱める可能性」として拒否され未実施。代替は全guardを保った局所font候補の探索であり、[拒否・代替記録](evidence/AVOID-009/flipcards-final03/flipcards-attachment-review01.json)を保存した。

最終matrix288＋extended96条件はsafe152/空間不足232。親は567証明polygon・961文字付着polygon・22,190実描画polygonを独立照合し、さらに半回転境界324記録の3,030primary polygonも円余白/stage/所有包絡へ照合した。一般singular affineの拒否は維持し、near-singular文字45eventが残ることも確認。OFF64原画SHA＋D zerooffset168描画SHA一致、control8/明示サイズ4、alpha1サンプルの衝突0。通常Canvas読み取り性能hint8件は保持しエラー扱いと混同しない。非flipの既存memo/cache回帰2本もexit0で、親は全JSON同値/alias/freeze/detach・6失効をraw照合した。formal性能の新主張はしない。

[統合receipt](evidence/AVOID-009/flipcards-final03/integration-receipt01.json)で固定source/日英HTMLを完全一致で転送し、対象外source/既存pycache89ファイルを保持。完全raw4本・開始snapshot・runner・元失敗等は21MBの固定capsuleに保存した。アニメ原寸MP4は代表1例だけ生成して独立solの視覚確認へ回す。人間の動作確認は必要、回答は今回の8時間集約へ未回答のまま保存し、同009の独立した蛇腹adapterを続ける。009全体は未完。

カード代表1例のSites公開操作はsucceededを返した。[比較と未回答の確認点](reviews/AVOID-009-flipcards-selected-20261024-01.md)と[操作戻り値](evidence/AVOID-009/flipcards-media03/publication.json)を保存。利用者指示どおり公開結果確認・デプロイpolling・公開動画再生は行っていない。独立solは16静止コマで形/付着を限定受入し、裏カード/星の覗きの一部重なりを人間の判断へ残した。10月24日03:00日本時間の再開トリガーを追加予約し、08:01ごろの確認まとめも維持。

## 集約作業: 蛇腹の連続帯adapterを限定受入

[親コード/rawレビュー](evidence/AVOID-009/parent-accordion-final04-review.json)で90909a0へ合成した蛇腹候補を限定受入。全ての空白panel・歌詞・折り目・表紙・帯の影をprimaryとして扱う。元の開閉・呼吸・退場・向き・折りの奇偶と、元sourceJからの出現q、可視glyph巡回gi/miAtのclockを維持する。全体移動→自然な語/chunk境界での連続帯分割→文字付着を維持する同1.2比panel寸法→局所文字縮小の有限61候補を使い、明示サイズと可読性floorを保持する。演出全体の小矩形化はしない。

fold clamp全域2～88.5度について各source点を定数+a cos+b sinで表し、端点と全導関数ゼロ点から連続包絡を作る。親レビューで縦文字のfontX/fontYを取り違えた計算を発見し、実描画は変えず、fontYが帯方向・fontXが横方向となるよう証明を修正させた。異なる幅の文字4種×3fonts×fold2種の24条件・192実投影で紙面側線との付着を確認。親は元fontBoundsから行列を通す頂点を再計算し、実紙面内を独立照合した。

元のcamera rootを計測Canvasへ移す際の小数丸めによる24/432画素差も検出した。変更されていない蛇腹/元transport・cut/cut/still/none・ABC/drawing/effectsOnly/decorなし・main/A/Bだけで実描画rootを保持し、既存のD再生経路を再利用して解消。一般のaffine/inverse、clipや描画capability、幾何guardは拡張しない。元24失敗と診断22失敗、縦軸修正前のrawは保持する。

最終matrix04は81条件中safe49/不足31/文字数範囲外1。親は51safe区間の660証明polygon・396文字付着polygon・20,365実polygonを円余白/stage/連続所有包絡へ独立照合。OFF12条件×6時刻、native再生72組、元clock18条件、独立した移動432組、他C/D18条件72RGBAとcache3例が一致した。正式性能は未評価で、補助的なtimingを性能成功とは扱わない。[固定packetと復元手順](evidence/AVOID-009/accordion-wip/handoff-final01.md)を保存し、初期UNACCEPTED WIPは履歴のまま保持する。

通常円の横代表は全文の字体サイズ106.92pxを保持し、panel137.7×165.24、自然境界で2帯、右へ286.01px。縦代表も字体サイズを保ち、panel145.8×174.96、2帯/4表紙、下へ233.63px。局所MP4で形・折り・読み順を独立solへ確認してから必要な例だけ公開し、人間回答は集約queueへ残す。次の旗は読取設計段階、009全体は未完。

旗は[source計画](evidence/AVOID-009/flag-plan01/PLAN02.md)と[親の設計判断](evidence/AVOID-009/flag-plan01/parent-design01.json)に基づき80f046dから隔離実装を許可。元sourceには負uのpow差分による非有限値、1.2Hの支柱、布の非矩形clipという制約がある。OFFはそのまま保持し、Dのみの有限端点差分・完全primaryの物理支柱/昇降距離・source限定の布clipを実装する。元の文字出現predicate/mi/stagger時計は変えず、実際に存在するentry/furlのはみ出しもglyph全体の円/stage証明に含める。fullrevealでは全guardの布内付着を必要とする。旗の回避成功/性能/視覚承認はまだない。
