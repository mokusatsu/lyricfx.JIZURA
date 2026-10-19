# AVOID-006 拡張Aの26通常レイアウトの対応

- 状態: 実環境検証待ち
- 段階: 通常軌道
- 技術依存: [AVOID-005](AVOID-005.md)
- 事業優先度: 未指定。記載順は技術上の推奨順。

## 開始記録（2026-10-19）

- 利用者の「これでOKです。次の段階に進んでください。」に従い005の受入と完了判定を記録してから着手。
- work、開始HEAD `b64ee11e9a762942643babd4f637ded8efdd8b42`（005完了記録）、製品は受入済み `85eaef6` と同一。開始時clean、AGENTS.mdなし。005完了記録はworkへpush済み。
- 変更前のHTML/src/dev/build.pyを `/workspace/work/avoid006-before` へgit archiveで固定。旧002〜005比較bundleは上書きしない。
- 実装をgpt-6.1-sol / mediumに委任し、親がコード・試験・描画をレビューする。親はタスク/完了/公開記録と独立検査を担当。006以外の段階は開始しない。
- 対象26ID: lowerThird, corners, staircase, zigzag, gridCells, dropCap, justified, frameBox, bubble, subtitleBar, ticker, splitScreen, mirror, sideways, edgeFrame, perspective, hanko, genkou, panels, filmstrip, quote, ruler, searchBar, chat, notification, ticket。arcTop/spiralは011の中心基準系として保持。
- 26IDごとに主歌詞・所有板/注釈・補助反復・独立装飾を実描画から分類し、固有の行列/枠/複製を維持する。Stackで採用した「円外でも演出の意味を失う独立分散は不採用」を引き継ぐ。未分類を補助扱いして除外しない。
- 全区間の包絡/経路証明と独立oracle・実画素/時刻検査、各IDの実際の安全例・明示制約不足、旧16ID/例外設定不変、同条件の前後キャプチャと公開raw hash/起動を必須とする。予定件数を実行済み件数へ置換しない。
- 通常アプリの既定経路切替、補助マスク、保存修正は017/018/013のまま。既存保存test初期cut数不一致（0対1、保存本体未到達）は成功扱いしない。既存features/area effects不一致は017への引継ぎを維持。
- 実行環境: observations_current=true、spec/observed38/38、unrestricted/enforced。保存設定参照と実機policy snapshotを区別し、継承proxy・CA・TLSを維持する。詳細は [initial-environment.json](evidence/AVOID-006/initial-environment.json)。

## 計画登録時の開始前確認

- ブランチ・HEAD・git status: 着手時に記録する（このスレッドで実装は開始していない）。
- 共通解析基準: b7c23bf。スキル導入済みHEAD: 3c79480。着手時に差分を再確認する。
- 正本: [設計・根拠](avoidance-design.md)、[一覧](task-list.md)、[スキル](../.agents/skills/evidence-driven-task-management/SKILL.md)。
- 依存タスクの必須条件と証拠を確認する。完了を推測せず、未完条件を引き継ぐ。
- 対象ファイルに既存変更がある場合は競合を確認する。同時進行タスクは原則1件。

## 目的

平面の拡張レイアウトにも共通軌道を適用し、補助歌詞と固有の枠を取り残さない。

## 変更範囲

- 当該段階のGitHub Pages確認サンプル・変更前後のキャプチャ画像・比較HTML・公開manifest、確認依頼/回答記録。共通手順は[Pages人間確認運用](pages-human-review.md)と[比較画像・HTML契約](visual-review-comparison.md)。

- src/11p_layoutsA.jsのarcTop/spiral以外26ID
- src/11u_note_layouts.js、共通adapterの必要な拡張、対応表・fixture
- 文書更新: 本記録・task-list.mdの状態/証拠、設計の該当契約、対応表を同じ変更で同期する。

## 実装手順

- 個々の描画をprimary/tiledAux/independentDecorに分類する。大量反復補助は経路変更せず018へ引き継ぐ。同じID内の主歌詞は対応対象のままとし、名称やmainDrawの有無だけで分類しない。

1. staircase/zigzag/edgeFrame等は読み順を保つ経路へ変換する。
2. filmstrip/panels/searchBar/chat等は文字と枠の結合を保持する。
3. mirror・perspective・splitScreen等の複製/変換を個別に検査し、env.drawの注釈も分類する。

## 禁止事項

- 2026-10-18の順次実装依頼に基づき、依存条件を満たしてから着手する。[実装レビュー運用](implementation-review-policy.md)に従い、実装担当と親レビューを分ける。
- 無関係なリファクタリング、ロック解除、手動配置の破棄、歌詞のline/partや時間の変更を混ぜない。
- 主歌詞の回避をマスク抜きで代用しない。補助的な大量反復歌詞は利用者指定により軌道再設計の対象外とし、AVOID-018の円形グラデーションマスクで扱う。演出全体の小矩形への縮小・未対応レイアウトの黙示除外は禁止。
- テスト期待値を通過のためだけに変更しない。旧ONの意図した変更には要件上の根拠を付ける。
- 利用者は順次実装、workへのcommit/pushとGitHub Pages公開を許可済み。006の必要な検証・公開・記録を行い、公開物の全byte一致と起動を確認してから必要な人間の動作確認を依頼する。Pages実行の成功だけで公開検証済みとしない。

## 完了条件

- [ ] 全H-IDに対応する同条件の変更前後キャプチャと比較HTMLを生成し、Pagesで全画像の表示・ハッシュ一致・前後ラベル・項目リンクを確認した。新機能不在/条件差/仕様見本を明示し、画像比較と必要な実操作を含む依頼を用意した。
- [ ] workへコミット・プッシュした対象版がGitHub Pagesへ反映され、日英HTMLと確認fixtureの一致、公開版の起動/描画を確認した。
- [ ] 親がコードとテスト結果をレビューし、指摘を解消した。人間の動作確認が必要なら比較URL・操作・期待結果を提示し、必須項目のOKと動作判定を記録した。不要なら利用者の委任に基づく親の判断理由と完了判定を記録した。

- [x] 26IDの対応表に方式・対象副歌詞・例外・frame証拠が揃う。
- [x] 主歌詞の円侵入を検出する検証が各経路を通り、反復補助は全ステージ上の配置を維持して018のマスク対象へ渡る。
- [x] 注釈のために中心へ文字を再配置する回帰がない。
- [x] 文字と枠の相対位置、読み順、seed、カット時間が保持される。

## テスト方法

- 比較成果物: [共通契約](visual-review-comparison.md)に従い、全H-IDの画像対応・撮影条件・HTML表示・公開一致を検証する。画像だけで数値/時間/保存の自動試験を代替しない。
- Unit: 複製と反転、枠の結合bounds、注釈の占有範囲。
- Integration: 26ID×主要aspect×回避位置、style/注釈ありなし。
- Regression: upstream_parts、imported_effect_details、effect_preview。
- 実環境: panels/mirror/edgeFrame/ticker/chatのframe比較。
- 開始時の変更前回帰: upstream_parts / imported_effect_details / effect_preview の3本を元のassertionのまま実行し、日英とも成功。基準はb64ee11。[ログ](evidence/AVOID-006/baseline-before/results.json)。変更後も同じ3本が成功。[結果](evidence/AVOID-006/parent-final-regression/results.json)。探索途中の成功数を最終候補の受入結果として流用しない。

## GitHub Pagesでの人間確認

[共通手順](pages-human-review.md)と[依頼テンプレート](templates/pages-review-request.md)に従う。以下は実装後に用意する確認ケースの予定であり、現在は未公開・未実施。依頼時には実際のUI名・サンプル名・ケースURLへ具体化する。

各項目に下表の前後キャプチャを準備し、比較HTMLの同じH-IDアンカーへまとめる。操作の前後状態が複数ある場合は、各状態それぞれで実装変更前/変更後を撮る。担当エージェントが画像を生成・公開検証してから人間へ依頼する。

| 項目ID | 人間に依頼する操作 | 期待結果 | 比較キャプチャ（予定） |
|---|---|---|---|
| AVOID-006-H01 | 拡張A26IDの一覧で、panels/filmstrip/chat等の文字と枠を確認する。 | 主歌詞が枠から剥がれず、円を避ける。 | A26IDの描画一覧とpanels/filmstrip/chatの文字・枠の拡大。 |
| AVOID-006-H02 | mirror/perspective/splitScreenのケースを再生・シークする。 | 複製や変換後の主歌詞・意味のある注釈も位置が整合する。 | mirror/perspective/splitScreenのenter/hold/exitと同時刻seek画像。 |
| AVOID-006-H03 | ticker/edgeFrame等の補助反復を主歌詞と比較する。 | 補助反復の配置を再設計していない。主歌詞と混同して全レイアウトを除外していない。 | ticker/edgeFrame等の全体画像。主歌詞と補助反復の見る箇所を別記する。 |

公開コミット / 変更前・変更後の実装識別子 / build ID / 比較HTML実URL / H-IDと画像の対応・撮影条件 / 操作用Pages実URL / 公開画像の一致・表示確認日時 / 自動検証証拠 / 依頼記録 / 人間の回答: 実装・公開後に記入する。親のコード/テスト結果レビュー、人間の動作確認の要否と理由も記録する。不要判定を人間のOK回答には置換しない。未確認を成功として補わない。

## 停止条件

- 平面adapterで固有構造が壊れる場合、個別adapterへ分離し、汎用経路で合格にしない。
- 仕様矛盾・破壊的データ変換・予期しない公開互換性影響・既存変更との競合は、確認済み事実と選択肢を記録する。

## ロールバックと引き継ぎ

- 当該タスクの差分を単位として戻せる状態を保つ。保存されたユーザーデータを削除するロールバックにしない。
- 完了条件ごとに達成/未達/未確認、対応コマンド・件数・ログ・frame証拠を追記する。
- 開始/終了HEAD、git status、対象外既存変更、未実施検証、後続に渡すAPI/制約を残す。
- ローカル検証済み・実環境検証待ち・完了を区別する。最終判定は最新の[実装レビュー運用](implementation-review-policy.md)に従う。人間にコードレビューを依頼しない。

## 証拠・残事項

- 計画根拠: [AVOID-001](AVOID-001.md) と [設計書のE01〜E23](avoidance-design.md)。
- 実装差分: 26IDの明示opt-in adapter、native描画の所有分類、clip/primitive記録、fixtureと試験を実装。製品HTMLはJA `38b8edf31aaecaa667e1e0248ccc5fa3bbf68380333f819683fdfb6494f3ebe4` / EN `9fe491dc1bf791b8567fa8e088ba4e705d78de04556c9439891e1ec51c5e9cb5` に固定した。比較ツールを統合し、最終撮影とローカル全画像/再描画検証まで成功。公開検証は下記の最新記録を参照。
- 親レビューの指摘と必須条件: [parent-review.md](evidence/AVOID-006/parent-review.md)。画素auditの描画先不備と低出力scaleでの包絡不備を修正担当へ返して解消。親の独立検査は126枚の旧描画一致、624実frame、13,242 polygon、必須回帰3本が成功。担当の最終8試験・解析契約・対応表と旧basic性能の確認を終え、親がコードを承認。比較撮影とローカル検証も成功。公開検証と演出の動作確認は下記の最新記録を参照。
- 個別の追加判断は着手時に記録し、共通設計と矛盾させない。

## 最終ローカル比較（2026-10-19）

build `local-20261019-02`、187組（UI 374枚＋原寸374枚）、4動画、775 assets。manifest `3f0a5358acf187521cfdf6c049f99ab3ce9bc9a806b0376aac1d9e73935467f2`。[結果](evidence/AVOID-006/local-verification.json)、[26IDのframe対応](evidence/AVOID-006/frame-evidence.md)。全374枚の原寸再描画一致、全画像表示、比較モード/項目リンク/日英起動、破損12件と再生中描画失敗1件の拒否、親の通常通信での26リンクと6演出の再生/シーク・スマホ幅が成功。

親のコード・機能試験承認済み。公開全byte・本番起動の確認はまだ必要。演出のまとまりについて人間の動作確認を必要と判断した。Stackでの指摘のとおり幾何上の安全だけでは演出の意味を確定できず、今回は26構造へ適用範囲を広げたため。公開検証後にH01〜H03を依頼し、未回答をOKとは扱わない。007は未着手。
