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

以下の公開済みチェックは追加要件前の`local-20261019-02`についての履歴。再開後の最終04は末尾の「最終04の受入状況」で別途判定し、旧版のチェックを流用しない。

- [x] 全H-IDに対応する同条件の変更前後キャプチャと比較HTMLを生成し、Pagesで全画像の表示・ハッシュ一致・前後ラベル・項目リンクを確認した。新機能不在/条件差/仕様見本を明示し、画像比較と必要な実操作を含む依頼を用意した。
- [x] workへコミット・プッシュした対象版がGitHub Pagesへ反映され、日英HTMLと確認fixtureの一致、公開版の起動/描画を確認した。
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

[共通手順](pages-human-review.md)と[依頼テンプレート](templates/pages-review-request.md)に従う。以下は計画登録時の項目表。公開済みの実際のUI・URL・操作・期待結果は[確認依頼](reviews/AVOID-006-local-20261019-02.md)に具体化した。公開検証は成功、人間の回答は未受領。

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

親のコード・機能試験承認済み。公開全byte・本番起動の確認も成功。下記の公開記録を参照。演出のまとまりについて人間の動作確認を必要と判断した。Stackでの指摘のとおり幾何上の安全だけでは演出の意味を確定できず、今回は26構造へ適用範囲を広げたため。公開検証後のH01〜H03確認依頼を用意した。未回答をOKとは扱わない。007は未着手。

## 公開版の検証と人間確認待ち

対象commit `672ca9fded4347837c7aa6e91394cd483bbca86f`、build `local-20261019-02`。[公開検証記録](evidence/AVOID-006/publication.json)に日時・Pages実行・HTTP/hash・日英起動・再生/シークを保存。775assets＋manifestの全公開raw bytes、374原寸再描画が一致。通常HTTPSはHTTP200/TLS検証0。公開版で外部通信を遮断しない親の操作試験も成功。保存の既知失敗を成功に置換していない。

[動作確認依頼と未回答の項目](reviews/AVOID-006-local-20261019-02.md)。今回の残条件はH01〜H03の演出の見え方。親は確認必要と判定しており、コードレビューを人間には依頼しない。公開成功だけで完了にせず、006の状態は実環境検証待ち。007は未着手。


## 2026-10-19 追加要件による再開（段階的再配置）

- 再開HEAD: `06b87459822ac5bc6395e20b8eeb4a47cf12cb57`、work、作業ツリーclean。旧公開bundle `local-20261019-02` は固定保持する。
- 利用者は「角の小円以外のものはOK」と回答した。18演出の既存確認例への承認として保持する。角の小円の8演出（justified/subtitleBar/splitScreen/sideways/panels/filmstrip/quote/ticket）と新しい構成変更への承認には拡張しない。
- 最新指示: 全面を使う8演出は回避ON用の構成変更を優先し、それでも成立しなければ回避時の選択対象から外す。円の大きさの変化に備え、複数戦略を段階的に適用し、なるべく演出意図を保つ仕組みを実装する。移動→分割・再配置→縮小は利用者が挙げた例であり、固定順序の要求ではない。追加の明示指示に従い、共通の優先原則と各演出の保持条件から戦略順を検討して確定する。
- この追加要件は006の未達を解消する作業として扱う。007を開始しない。joint translationのみ・自動文字サイズ不変という006の旧制限は今回の指示で改訂するが、演出全体を小矩形へ縮小する旧方式、主歌詞マスク、無断の手動/lock/明示サイズ変更は禁止を維持する。
- 指定gpt-6.1-sol / mediumの実装担当へ設計調査を委任。親が戦略・保持条件・検証方法をレビューしてから実装する。共通段階APIは後続adapterにも拡張可能にし、現在未対応のIDまで対応済みとは扱わない。
- 必須追加受入: 各段階の採用/失敗理由が追跡できること、半径.02〜.45・複数位置/aspect/文字量・enter/hold/exitを検査すること、区間内は選択を固定してseekで同じ結果になること。分割で歌詞/読み順/カット時間を欠落・変更しないこと。サイズ下限と候補数上限を明文化すること。
- 選択対象外は歌詞を消す処理にしない。自動選択での代替と、固定/手動指定の制約表示を区別し、通常アプリ統合017への引継ぎ範囲も明示する。
- 新候補は現在版との同条件比較を新build IDで作成し、親レビューと全公開byte/hash・起動検証後、構成変更の見え方のみ人間確認へ回す。旧18例への承認を新候補の未検証箇所へ流用しない。
- 再開実行環境: observations_current=true、spec/observed52/52、connected/running、unrestricted/enforced。保存設定の参照と実行中反映を区別し、proxy/CA/TLSを維持する。


### 段階戦略の親設計レビュー

固定の移動→分割→縮小順は採用しない。既存の一体移動が成立する場合は保持し、失敗時にID別の宣言済み候補順を使う。意味・読み順・可読性・所有枠との結合・色の対比・全区間安全性を必須とし、その中で変更量を抑える。版面/二分割は組版・折返し、フィルムは連続帯の走行経路、引用は本文/引用符/出典の一体組版と飛来経路、チケットは券寸法/余白の再計算を優先する。チケットは構造を崩す分割より限定縮小を先に検討する。

新候補の採用設計値: 主歌詞下限max(18px,短辺×.035)、意味のある副歌詞下限max(12px,短辺×.020)、限定縮小比.95/.90/.85/.80/.75/.70。既存の安全な描画を新下限で棄却しない。元サイズが下限未満なら追加縮小しない。新構成で下限未達は成功扱いしない。明示サイズ/手動/lockを保持。候補は区間内固定で、実測した試行と棄却理由を記録する。再構成候補の上限は1区間64、性能実測で妥当性を検証する。

指定担当の設計案をレビューし実装開始を指示した。詳細のID別契約・根拠・試験証拠は `evidence/AVOID-006/adaptive-revision/` へ記録予定。まだ新実装の成功や公開を主張しない。通常HTTPS再確認は公開02のmanifest HTTP200/TLSverify0、SHA256 `3f0a5358acf187521cfdf6c049f99ab3ce9bc9a806b0376aac1d9e73935467f2` 一致。新公開候補の検証を代替しない。


### 追加許可: 入退場中の一時通過

利用者が「入退場で円を一時的に通るのは緩和条件にしていいです。」と明示した。保持中の円回避は必須とし、source由来の入退場時間窓に限る緩和候補を追加する。全時間での回避と入退場のみ通過ありを別判定/表示にする。構造を大きく変える分割や縮小より、native構造を保ち入退場だけ緩和する候補を優先できるよう順序を再評価する。時間窓の根拠・実時刻/演出時刻・残像を明示し、保持時間まで緩和を延長したり保持時間がないcutを全時間安全にしたりしない。上記全区間安全の旧記述は、完全回避候補の条件として保持し、緩和候補には保持区間の証明と入退場別診断を要求する。担当へ契約/実装/比較ツールの変更を指示した。

### 2026-10-20 再配置候補の性能・機能検証

状態は実装中を維持。固定候補JA850e43d/ENdd025dfについて、必須9＋追加3試験の実log/source hashを親が照合。正式性能は100/1000条件で計画比1.5288/1.9861、追加描画1.4/0.3msとなり条件内（1000条件の余裕は小さい）。192条件576frameの旧候補との一致も成功。証拠は[最終候補](evidence/AVOID-006/adaptive-revision/final-candidate/)と[親レビュー](evidence/AVOID-006/adaptive-revision/parent-review.md)。既存180frameの最終独立再確認、比較tool修正後のbundle生成・独立sol画像動画照合、全公開検証は未完。新8演出の動作確認依頼は公開検証後に行う。

### 再開時点の残事項（2026-10-20）

- HEAD06b8745、work、既存未コミット変更を保持。状態は実装中。
- schema3比較03はローカル348/348照合等が完了したが、履歴遮断solの画像照合でsubtitleBar縦画面に新規の文字遮蔽VIS006-01を発見したため最終候補にはしない。
- 指定sol/mediumが当該再構成候補の品質検査と診断を修正中。親がコードと試験結果をレビューし、修正後の画像照合は履歴遮断solへ再委任する。
- 公開容量の見積りと対策を調査中。未公開01/02/03を旧公開bundleの代わりに公開済みと扱わない。007以降は未着手。
- 証拠: adaptive-revision/parent-review.md、parent-final/resume-20261020/。

### 再開継続：性能未達の切り分けと公開工具（2026-10-20）

遮蔽修正後のca1f21fc候補は正式性能で1000条件計画2.100612倍、100条件追加描画3.20msとなり未達。旧850e43d合格を新候補へ流用しない。現候補のCPU/割当診断に基づき、09a/09bの凸包・camera生成の演算順/点順を保つ重複処理削減を指定solが実装、親が差分レビューした。新JA b2c23026/EN e4b4c311は同値試験中で、正式性能・全機能・公開検証は未完。

schema4公開工具は固定旧ca1fの28条件smokeでcapture、native/UI各56枚の再描画、破損27 PNG/12 gzip/13 bundleと再生故障注入、字体ブラウザ検査が成功。親が工具4hashと実ログ5本を照合し、[工具証拠](evidence/AVOID-006/adaptive-revision/parent-final/schema4-tool-review/)へ保存。全174条件の最終比較・公開受入ではない。Pages容量対策もローカル設定/試作検証段階。詳細は[親レビュー](evidence/AVOID-006/adaptive-revision/parent-review.md)。006実装中・007以降未着手を維持する。

2026-10-20追記: 固定b2c23026は14suite・親独立180PNG/shape18,000/異常11/基準6/日英4起動が成功。正式条件を変えないsingle controlled confirmationも100/1000計画1.3751/1.7619倍・追加描画-0.10/-0.60msで成功し、親が性能gateを受入。先行する不合格と未帰属遅延を保持し、全試行安定成功とはしない。最終比較local-20261020-04の生成に着手。旧850証拠は上書きせずsnapshot方式を採用。最終画像照合・公開容量実測・全公開検証が残るため006実装中を維持。

### 最終04の受入状況

- [x] 固定b2c候補の実装・性能・14suiteと親の独立回帰検証を完了した。過去の性能未達も保持した。
- [x] 同条件174組・696画像参照・4動画を生成し、原寸/UI各348枚の再描画と全観測、再生/seek/日英起動が一致した。
- [x] 破損検査（PNG27/gzip12/bundle15・再生故障）、字体検査、root既定manifest照合が成功し、親が正式ログ/工具/source hashを確認した。
- [x] 履歴を渡さないsolによる最終画像・動画・診断UI照合を完了した。範囲と限界は下記に記録。
- [x] 最終indexからの公式Jekyll実出力が容量・既存URL維持・全bytes/hashの条件を満たした。
- [x] workへcommit/pushした04の全公開画像・共有先・manifest・日英HTMLと実起動を確認した。
- [ ] 新8演出の必要な人間動作確認を取得し、親が最終完了判定を記録した。旧18例への承認は保持し、新8例へ流用しない。

manifest SHA-256 `2d9a87544a5a8b4818591b0daeb0b1ccd659c241d52d1383111422aca579e01d`。[ローカル検証](evidence/AVOID-006/adaptive-revision/parent-final/schema4-final-local/summary.json)、[最終04の公開済み動作確認依頼](reviews/AVOID-006-local-20261020-04.md)。commit `e15a330909a34e786abb5d13ee190e216c310413` を公開検証済みであり、007以降は未着手。保存試験の既知の初期cut不一致は013へ引継ぎ、保存成功として扱わない。

最終visual: 先任solのafter UI174・native overview149・旧実見hash/RGBA継承199と動画176サンプル（5fps）に、後任isolated solの原寸34枚（新8主要前後、長文/下限、修正portrait前後）を合わせ、重大所見なし。before UI全件の新規実見・動画全frame確認は主張しない。親が7証拠hash/manifestと実見範囲を照合し、公開候補として受入。[所見](evidence/AVOID-006/adaptive-revision/parent-final/final-visual-04/report.md)。状態を一覧と実環境検証待ちへ同期。新8の見え方は人間確認が必要、H03例外対照は自動検証と親レビューを根拠に人間再確認不要。公開検証は省略しない。


### 最終04の公開検証完了・人間動作確認待ち（2026-10-20）

Pages run [39457255823](https://github.com/mokusatsu/lyricfx.JIZURA/actions/runs/39457255823)はe15a330で成功。最終indexの公式Jekyll監査は2806 URL/946,786,660 bytes、既存1923 URL・旧review1808file維持、7manifest/2752参照の全bytes/hash一致。公開attempt03は2026-10-20 17:02:10.209 UTCにexit0、全938asset＋manifestの939 raw HTTP200/hash、原寸/UI各348再描画・全観測・再生/seek・日英起動が一致した。通常通信UIは26anchor＋6再生seek（32操作）、外部通信/page error0、別site-smokeもJA/ENの実HTML hash・2歌詞行・Canvas描画が成功。環境129/129、current=true、proxy/CA/TLS維持。親が実ログ・manifest/source/tool hashを独立照合した。[公開正本](evidence/AVOID-006/adaptive-revision/parent-final/public-final04/publication.json)。

先行attempt01/02のHTTP503と、その後の通常curl200/TLS0/hash一致を保持し、原因は未特定のまま。親レビュー済み外付けhelperは固定939＋index由来174 URLのGET/固定callbackに限り503を最大3回・1/2秒待機で再試行するが、最終03では失敗0・追加試行0。元validator・raw bytes/hash・後続全検査は不変で、child/親の21mockも成功した。公開成功を、人間の見え方の承認や全時点の通信安定性の証明へ広げない。

残条件は[新8演出の動作確認](reviews/AVOID-006-local-20261020-04.md)のみ。主要8＋動き4項目は全て未回答、旧18例の承認は新構成へ転用しない。H03は自動検証と親レビューに基づき人間再確認不要の判断を保持する。006は実環境検証待ち、007以降は未着手。保存初期cut不一致は013へ引継ぎ、保存成功にはしない。

## 2026-10-21 filmstrip 比率・動き・軽量再生の追加修正

- 利用者の露光コマをライカ判36×24（3:2）へ保つ要求、横スクロールと順次出現の確認要求、確認動画を実MP4へする要求によって006を`実装中`へ戻した。007以降は開始しない。開始HEAD `3e2ff804fac2e94dce79039ddf7a46ec19221494`、work。実装担当gpt-6.1-sol / medium、親がコード/結果をレビューする。実装担当は画像・動画を開かず、別のisolated担当の視覚確認を待つ。
- 開始時の`app/__pycache__/english.cpython-312.pyc`変更、dev/node_modules、work/scratch、未公開local-20261020-01/02/03を保持し対象外とする。公開済みlocal-20261020-04は不変の履歴として保持する。
- 原因の実測: 旧anchorの露光コマは560.85×201.3984（約2.7848:1）。adaptive recipeがalongとbandを独立に設定し、travelは4.779 stage px、hold速度は1.19475 px/sまで低下していた。元のnativeは1920幅でentry1728/exit2688 px、hold32.4 px/s。元のper-slotの実描画閾値0/.1212163940293249/.2828382527350914秒は残っており、順次出現のコードは変更しない。[変更前の実測](evidence/AVOID-006/film-revision/before-probe.json)。
- 修正範囲: filmstripのみ、native露光コマ1.3:1も利用者要求に合わせ3:2へ変更する（OFFのfilmだけも意図した変更。OFF完全不変とは主張しない）。縦版は回転した2:3。adaptiveではlaneと3:2の両方から共同寸法を求め、文字の横余白だけ再配分する。既存frame clipは同一、主歌詞マスク・全ステージ縮小は使わない。元のnative入退場距離・hold速度・方向を戻し、hold包絡も同じ速度で証明する。
- 新anchorは344.088×229.392、fontScale .7、59候補でhold-safe（旧43候補・fontScale .8・全区間safe）。入退場だけsource-tagged moving eventsの既定許容を使う。holdとstationary eventsは引き続きstrict。旧04の全区間safeを新版filmの合格へ流用しない。
- 新規`dev/avoidance/filmstrip-test.cjs`は実rendererの露光primitive、時刻ごとのmain item実描画の有無、native移動量、独立包絡、alpha1画素を確認する。ON/OFF・両方向・landscape/portrait・tilt±3を扱う。`filmstrip-parity.cjs`はfilm以外25のOFFと受入済み18のadaptive例を開始HEADと同条件で比較する。
- 今回の比較はfilmの変更に必要な選択例と元の4動き例に絞り、旧04の174組監査を新版filmの受入へ置換しない。新bundleは実H.264/yuv420p MP4・faststart・native controls・preload metadata/noneの軽量ページを準備する。全174組の再撮影はこの差分の必須条件としない。公開容量・全raw bytes・再生/seek・日英起動・親レビュー・独立視覚確認・人間の動作判定は別途必要で、未実施を成功にしない。
- 最終候補の実行ログ・実測実行時間・exit/hashは[evidence/AVOID-006/film-revision](evidence/AVOID-006/film-revision/)に保存する。最終source一致の再実行と既定100/1000性能gateの結果は下記に記録。新公開版・人間の動作確認は未完。
- 最終source一致のローカル検証結果: JA `d780ca129dfe87868a8a448a90c02a2e6ba4f2398a4a7f522a91973bad62eda0` / EN `97941bd9ddabaf197292481dcbf235bd5e73cfed95ad09c6495b5b7d7970fd02`。既存9core＋filmstrip16ケース624露光矩形＋parity43条件129frameがすべてexit0。filmの実際の正alpha順次描画も開始HEADと11時刻で一致。親のコード/結果レビューに渡す[全src/script/log/実行時間のreceipt](evidence/AVOID-006/film-revision/functional-summary.json)と[実装引継ぎ](evidence/AVOID-006/film-revision/implementation-results.md)。
- 既定の独立100/1000性能gateもexit0/passed:true。warmup3/sample6/stress有効を維持し、同一入力、planning factor1.370271/1.935485（上限2）、render差−3/−2ms（上限+3ms）。candidate planningP95は460/27525.7ms、cold総計3008.7/27346.6ms。dense100/1000 regionのsegment数・決定性・候補128上限も成功。[全測定](evidence/AVOID-006/film-revision/performance.json)。gateを緩めていない。今回の実MP4確認は重いcold planningを人間の動画再生へ毎回要求しないためのもの。新公開物・視覚確認・人間の動作判定は引き続き別条件。

### 2026-10-21 親レビュー・focused確認依頼draft

- 親は全77 sourceと11試験ログのhashを独立照合し、film16ケース/624露光矩形の試験を独立実行してexit0を確認した。[親レビュー](evidence/AVOID-006/film-revision/parent-core-review.json)。コード/試験の受入であって、視覚確認・公開・人間の動作判定の完了ではない。
- 公開予定focused buildは`local-20261021-02`。`local-20261021-01`は任意長文「僕」の固定字体欠字で撮影中断した未公開試行として保持する。02は既存の長文「風の先へ歩いて行こう」を使う。02は未公開・撮影完了未確認で、[動作確認依頼draft](reviews/AVOID-006-local-20261021-02.md)は公開事前検証後に確定する。
- [旧04依頼](reviews/AVOID-006-local-20261020-04.md)へfilm比率NG・横scroll/順次出現の確認困難・重すぎて再生不能の利用者報告を追記した。他項目のOKは推定しない。006は`実装中`（修正進行中）を継続し、007以降は未着手。長文やportraitの実際の採用/除外は02撮影結果で確定し、診断用元描画を回避成功へ数えない。

### focused02 撮影完了・検証継続（2026-10-21）

- `local-20261021-02`の撮影完了。[manifest](../review/AVOID-006/local-20261021-02/manifest.json) SHA-256 `426202261383ea42f62241a29602e7923e209cd7ede3e75af21f4cedc518c754`。landscape/long/portraitは全3beforeが全区間safe、全3afterがsafe-hold（保持中strict・動く入退場だけ緩和）。長文「風の先へ歩いて行こう」も採用済みであり、診断用の候補除外例ではない。他の条件の除外を成功へ置換しない。
- 新しい前後6 MP4は各4秒/96 frame/24fps・H.264/yuv420p、367,809〜497,993 bytes。撮影条件・診断はmanifestへ固定した。独立visual solの速報は重大指摘なし、正式report作成中で親の最終受入や人間OKとは扱わない。
- local validatorはseek競合への対応後、offscreen/drop診断の修正中で未PASS。公開・容量/全bytes・公開再生seek/日英起動は未完。[依頼draft](reviews/AVOID-006-local-20261021-02.md)を撮影事実と長文採用safe-holdへ更新し、未公開表示を保つ。006は実装中継続、007以降は未着手。新8のfilm以外は人間未回答のまま、通常既定への切替は017に残す。

### focused02 ローカル・独立visual完了、実環境検証待ち（2026-10-21）

- [local validate retry2](evidence/AVOID-006/film-review/final02-validation-retry2.json)はpassed:true、親が実JSON確認済み。全9 MP4の標準play/pause/seek・全編終了と、1.5秒の前後6 PNGの原寸再描画hash一致を確認した。新6動画の測定全編区間はdrop/corrupt差分0、旧quote変換はdrop差分1。先行seek/offscreen・drop診断の不成功履歴は保持する。
- 初期JA/ENはHTML1 requestのみ、動画・追加resource取得0。ローカルHTTPのinitial transferは4,781/4,689 bytes（encoded HTML4,481/4,389 bytes）。公開通信の測定は別途必要。
- [独立visual正式所見](evidence/AVOID-006/film-review/visual02/review.md)と[ledger](evidence/AVOID-006/film-review/visual02/ledger.json)が完了。75画像相当の実見範囲で重大指摘なし。長文先頭「風の先」＋「へ」の2行wrapは読めるが組版の好みは人間判断に残す。全動画frameの目視・視覚担当自身の連続再生とは扱わない。
- 状態を一覧と`実環境検証待ち`へ同期。実Jekyll容量監査は進行中、公開全raw bytes・公開動画再生seek/日英起動・人間動作判定は未完。新8のfilm以外は人間未回答、007以降は未着手、通常既定切替は017を維持する。

### focused02 公開全検証完了・人間動作確認待ち（2026-10-21）

- 本体commit `2a842636ad9cc7221ce634dee32467f77fa1e97b`をworkへpushし、[Pages run39543982854](https://github.com/mokusatsu/lyricfx.JIZURA/actions/runs/39543982854)は2026-10-21T04:27:50Z（13:27:50 JST）にsuccess。manifestは`426202261383ea42f62241a29602e7923e209cd7ede3e75af21f4cedc518c754`固定。
- [実Jekyll最終監査](evidence/AVOID-006/film-review/pages-final02/pages-output-audit.json)は2,856 URL/983,367,613 bytes、8 manifest/2,809 asset参照を検査し成功、既存2,806 URLを保持した。旧04その他公開物のbyte不変条件を緩めていない。
- [公開validator retry1](evidence/AVOID-006/film-review/public02/validator-retry1.json)はexit0/passed:true。58/58 raw HTTP200/hash、JA/EN root2 HTMLのhash+uiApi、全9 native MP4の全編終了/pause/seek、前後6 native PNG原寸再描画が一致。[別site-smoke](evidence/AVOID-006/film-review/public02/site-smoke.log)も両言語で2歌詞行・Canvas実描画が成功した。
- 公開初期表示JA/ENはHTML1 requestのみ、動画/追加resource取得0。transfer1,839/1,691 bytes（encoded HTML1,539/1,391 bytes）。今回測定した全9動画の全編区間はdrop/corrupt差分0。この測定を任意端末/通信の性能保証へ広げない。
- 公開初回は206 partial cacheで失敗した[stderr](evidence/AVOID-006/film-review/public02/validator.stderr.log)と[実失敗receipt](evidence/AVOID-006/film-review/local-20261021-02-public-1792556893480-01f35c96.json)を保持する。validator `44f0e5d602ce8d5a331a3f3a69ff387f837db6b36cc6651c1137158e534d0822`による完全raw取得確認後のretry1が成功。製品source/bundle/manifestは不変で、初回から成功したとは扱わない。
- [02動作確認依頼](reviews/AVOID-006-local-20261021-02.md)をdraftから公開検証済みの依頼へ確定。film横長3:2/縦長2:3/長文先頭2行wrapと、native MP4再生seekを人間へ依頼する。独立visualは75実見で重大指摘なしだが、長文組版の好みと演出の動作受入は人間判断が必要。未回答をOKにしない。
- 006は人間の動作確認が残るため`実環境検証待ち`を維持。旧18例の受入、新8film以外の人間未回答、007以降未着手、通常既定切替017を維持する。公開成功から他の新8項目の承認を推定しない。task-listの今回進捗4段落は最新1短段落へ統合し、各時点の詳細は本記録に保持した。

公開検証の親正本は[publication.json](evidence/AVOID-006/film-review/publication.json)。親は58 rawの実hash完全一致を独立照合し、[metadata-public-identity.json](evidence/AVOID-006/film-review/metadata-public-identity.json)で設定を含む2,857公開Git blobが本体commitから不変と確認した。公開retry1の全9本測定全編区間はdrop/corrupt差分0。local旧quoteのdrop1は別実行の履歴として保持する。
