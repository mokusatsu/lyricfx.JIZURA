# AVOID-006 拡張Aの26通常レイアウトの対応

- 状態: 完了
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
- [x] 親がコードとテスト結果をレビューし、指摘を解消した。人間の動作確認が必要なら比較URL・操作・期待結果を提示し、必須項目のOKと動作判定を記録した。不要なら利用者の委任に基づく親の判断理由と完了判定を記録した。

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
- [x] 新8演出の受入と親の最終完了判定を記録した。今回film/ticketの人間OKと続行指示、他6の追加人間再確認不要という親判断を区別し、旧18承認を新8の人間OKへ流用しない。

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

## 2026-10-21 全比較パターンのnative MP4追加依頼

- 利用者は全パターンの変更前後アニメをMP4で確認すること、HTML画面録画ではなくアニメだけを直接動画化することを追加依頼。006内の検証改善として状態を`実装中`へ戻す。開始work/HEAD `88f270dc5377725dbb194553badd6c4fe6f6ead3`。既存pyc変更、dev/node_modules、scratch/workと未公開reviewを保持・対象外とし、製品source・docs/VERIFICATION・既存bundleは変更しない。
- 担当は`all006_native_mp4`、gpt-6.1-sol / medium。親がsmokeのコード/結果を確認してから全captureへ進む。旧04全174比較条件（26演出）＋追加film3条件の177組、変更前後354本を各24fps/4秒/96frameでnative rendererから直接取得する計画。実施済み件数とは記録しない。利用者へのasync確認で代表26のみの希望があれば別途反映するが、未回答時点の既定scopeは全177。
- 変更前は全177組を`06b87459822ac5bc6395e20b8eeb4a47cf12cb57`のstaged A26へ統一し、変更後は開始HEAD88f270dのadaptive。追加film3もfocused02の変更前3e2ff804とは異なることを明示する。同じ比較入力・字体・寸法・seed・実時刻を固定し、HTML UI録画を含めない。新ページで旧WebM transcodeは一切使わず、旧公開物は不変履歴として保持する。
- 公開比較と検証証拠を分離して準備する。既存Pagesは983,367,613 bytes、残り16,632,387 bytesのためSitesを予定するが、公開先/URL・build ID・容量実測・公開成功は未確定。新規撮影・全条件の対応/元描画とMP4整合・標準再生pause/seek・初期転送・公開全raw hash・親レビューは未完。[新依頼record draft](reviews/AVOID-006-all-native-mp4-draft.md)。
- 旧04/focused02の公開成功と失敗履歴、旧18例の人間受入、新8例の未回答を保持する。今回の全177組動画の受入には流用しない。006のみ進行し、007以降は未着手、通常既定の切替は017。

### 利用者回答により26代表条件へscope確定（2026-10-21）

- 利用者のasync回答は「26演出の代表例」。上の177組/354本は回答前の初期想定として保持し、現在scopeを26演出各1代表条件・前後52 MP4へ縮小した。追加film3は別ケースとして追加せず、filmも26演出中1例だけとする。全174/177条件の動画を生成・変更・検証済みとは主張しない。実装担当へ対応指示済み。
- 同条件のnative直接取得（24fps/4秒/96frame）、変更前06b8745 staged/変更後88f270d adaptive、HTML UI録画・旧WebM transcode不使用、製品/source不変の条件は維持する。filmの変更前がfocused02の3e2ff804と異なる点も維持して表示する。
- 52 MP4と比較ページがPages残り16,632,387 bytesへ収まるか実測後に判定する。収まればPages、だめなら自己完結ZIPを確実に用意する。Sitesは登録のみで未公開、公式helper欠如の[blocker証拠](evidence/AVOID-006/all-native-mp4/sites-blocker.json)を保持する。公開先・URL・容量合格・公開成功は未確定。
- [26代表条件の確認準備draft](reviews/AVOID-006-all-native-mp4-draft.md)と一覧を同期。smoke親レビュー後の全撮影・ローカル/公開検証・人間動作受入は未完。006実装中、旧公開成功/旧18受入/新8未回答、007以降未着手・既定切替017を維持する。

### 26代表native MP4正式03撮影完了・実環境検証待ち（2026-10-21）

- 正式`local-20261021-03`の26組/52本、各24fps/4秒/96frame・計4,992 native renderer frameの撮影完了。前後は06b8745 staged/88f270d adaptive、HTML UI録画・円guide動画合成・旧WebM transcodeなし、各W×H原寸。公開予定55 files/7,143,943 bytes（MP4合計6,994,708 bytes）。[capture結果](evidence/AVOID-006/all-native-mp4/final03-capture.json)。
- [公開用manifest](../review/AVOID-006/local-20261021-03/manifest.json) SHA-256 `ceab32d46c763775c407add084c04b610f0d41fef05b1fe63800f18558e6b474`。[親の18対照照合](evidence/AVOID-006/all-native-mp4/parent-accepted-controls.json)で受入済み18演出×96frameのnative PNG前後hashが全一致した。これはMP4全編検証・人間判断の代替ではない。
- [実Jekyll監査](evidence/AVOID-006/all-native-mp4/pages/pages-output-audit.json)はpassed:true、2,911 URL/990,511,556 bytes、旧2,856 URL保持。Pages容量内となりPagesを公開候補とするが、公開成功・全公開raw検証はまだ主張しない。Sites登録のみ/公式helper欠如の履歴は保持する。
- local52本の全編再生pause/seek・元描画整合/初期転送とisolated visualは進行中。状態を一覧と`実環境検証待ち`へ同期し、公開全検証と必要な人間動作確認を残す。[正式03確認準備draft](reviews/AVOID-006-local-20261021-03.md)へ移行、旧generic draftは初期scope履歴と移行先を保持する。
- 新8未回答・旧18受入、007以降未着手・通常既定017は不変。全174/177条件の取得/検証済みを主張せず、filmは26中1代表のみ。製品/source/docs/既存bundleは変更していない。

### 正式03 isolated visual完了・local seek検証修正（2026-10-21）

- [独立visual A](evidence/AVOID-006/all-native-mp4/visual-a/review.md)・[B](evidence/AVOID-006/all-native-mp4/visual-b/review.md)は各13件で全26件完了。原寸anchor52枚とMP4抽出312枚をmontageで実見、filmは抽出12枚も追加原寸実見し、サンプル内で新規欠陥なし。全4,992frameの実見・連続再生は主張しない。ticker反復帯の`tiledAux`分類と018補助マスク未完は既知のまま保持し、新しい免除や対応完了へ置換しない。
- [local初回失敗receipt](evidence/AVOID-006/all-native-mp4/final03-local-validation-failure1.json): 52 anchor原寸再描画と42/52本の全編試験後、ruler-beforeのdecoded seek時刻assertが失敗。動画は96 PTS正常、同一動画の実30回調査は再現0だが、元失敗metadata未保存のため原因確定とはしない。
- [seek-validator修正レビュー](evidence/AVOID-006/all-native-mp4/seek-validator-fix-review.json)と[親正本](evidence/AVOID-006/all-native-mp4/parent-review.md): 旧helper callback競合はmock再現し、修正後親12tests/targeted4seekは成功。新validator `44181a677ca645ab09fdb3e831bf848774f6a71277b22c6f745b401cd25a1dab`だけを更新、0.1秒許容/10秒deadlineを維持し、capture/public/source・旧capture tool hashは不変。
- 全52local retry1は進行中、公開は未実施。006は実環境検証待ちを維持し、[03依頼draft](reviews/AVOID-006-local-20261021-03.md)へ現在状態を反映。最終案内は各組の「前後を最初から一緒に再生」「前後を停止」を中心にする。旧18受入/新8未回答、007以降未着手、既定017・補助018未完は維持する。

### 正式03 local retry1全52本成功・公開検証待ち（2026-10-21）

- [最終local summary](evidence/AVOID-006/all-native-mp4/final03-local-summary.json)、[retry1全結果](evidence/AVOID-006/all-native-mp4/final03-local-validation-retry1.json)、[確定receipt](evidence/AVOID-006/all-native-mp4/final03-local-validation-retry1-receipt.json)を正本とする。52 anchor一致・52本fullplay全編終了・全seek・JA/EN入口/desktop/mobile UIが成功。初期media取得0、ペア開始/再開始/停止・filter切替停止も確認した。先行42本後seek失敗は別履歴として保持する。
- min decoded92、drop合計89/最大21（当該decoded92）、corrupt0。全52成功を完全滑らか/無dropと読み替えず、公開全52検証でも測定する。file://は管理Chromium policyで未検証、HTTPによる確認とは区別する。
- 親コード＋visual＋実Jekyll全gate確認済み。今から公開commit/pushと全公開検証へ進む段階で、まだ公開成功ではない。006実環境検証待ち、旧18受入/新8未回答・007以降未着手・既定017/補助018未完を維持する。

### 正式03 公開全検証完了・新8人間動作確認待ち（2026-10-21）

- 公開commit `d16261e770f5187bb5b862d3d8d8a9f0626e14a2`、[Pages39550746543](https://github.com/mokusatsu/lyricfx.JIZURA/actions/runs/39550746543)は05:41:38 UTC/14:41:38 JSTにsuccess。[publication正本](evidence/AVOID-006/all-native-mp4/publication.json)は親が実receipt・完全hash/path/byte数・52動画集合を独立照合して05:49:02 UTC/14:49:02 JSTに確定した。manifestは`ceab32d46c763775c407add084c04b610f0d41fef05b1fe63800f18558e6b474`不変。
- [公開全検証](evidence/AVOID-006/all-native-mp4/final03-public-validation.json)はpassed:true、55 raw全HTTP200/完全bytes/hash一致、52公開MP4のplay/pause/decoded seek/全編終了、JA/EN初期とdesktop/mobile UI・ペア開始/再開始/停止/filter停止が成功。初期media取得0。[別site-smoke](evidence/AVOID-006/all-native-mp4/public-site-smoke.log)も両言語で実起動・2歌詞行Canvas描画が成功し、[通常HTTPS](evidence/AVOID-006/all-native-mp4/ordinary-https.log)はmanifest/JA/EN HTTP200/TLS0/hash一致。
- 52 anchor再描画一致はlocal固定engine/font検証であり、publicsource再描画とは呼ばない。公開全52再生と55raw完全一致は別に検証した。public再生測定はmin decoded92、drop計3/最大2、corrupt0。local drop89/max21/92の履歴を保持し、完全滑らか/任意環境無dropへ広げない。file://は管理policyで未確認、HTTP desktop/mobileのみ確認済み。
- 実Jekyll2,911 URL/990,511,556 bytes・旧2,856 URL保持、26組52本native直接取得/原寸/HTML録画と旧transcodeなし、独立visual全26のサンプル実見と親コード/テスト確認を満たした。[03レビュー依頼](reviews/AVOID-006-local-20261021-03.md)を正式公開済みへ刷新し、全26閲覧可能・各組の「前後を最初から一緒に再生」「前後を停止」を案内する。旧18受入を維持し、新8の見え方・動きだけの回答を依頼する。
- 残条件は新8の人間動作確認のみ。006実環境検証待ちを維持、007以降未着手、通常既定017/補助018未完（ticker既分類tiledAux）、保存初期cut不一致013は既知未成功のまま保持。公開成功から新8承認を推定せず、人間未回答をOKにしない。

## 2026-10-21 filmstrip帯の端到達・ticket退場切離量の修正再開

- 利用者は正式03の比較を見て、filmstripは変更前の帯が画面左右端まである一方、変更後は左右端まで届いていないと報告し、上下方向も確認するよう依頼した。ticketは最後の切離量が変更後で小さくなっているとの報告。今回はこのfilmstrip/ticketの修正依頼として006を`実装中`へ戻し、一覧と同期する。新8全体へのOKや他6新例の回答は推定しない。
- 開始work/HEAD `8193b0580a03f19472637807231685728d0718d7`。既存の`app/__pycache__/english.cpython-312.pyc`変更とuntracked作業物は保持・対象外。正式03の公開動画・manifest・検証証拠は不変の履歴として維持する。03の公開全検証成功は、この利用者報告への修正成功や人間の受入を意味しない。
- 実装担当は新しいisolated `film_ticket_edges_fix`（gpt-6.1-sol / medium）で原因調査中。親がコード/テスト結果をレビューし、別のisolated solが画像照合を行う。横長/縦長の同条件native MP4で、film帯の左右/上下の到達範囲とticketの退場時切離量・時刻を変更前後で比較する。既存のfilm露光コマ3:2（縦回転2:3）・元のmotion/順次描画・strict holdと入退場緩和の契約は保持する。
- 証拠予定は`tasks/evidence/AVOID-006/film-ticket-edges/`。原因確定・実装修正・必要回帰・横縦動画取得・親レビュー・独立視覚照合・公開全bytes/再生seek検証はいずれも未完であり、実施成功は主張しない。修正版は旧03を上書きせず、検証後に今回の動作確認を依頼する。
- 旧18例の受入を維持し、新8のうちfilm/ticketの報告を他6例のOKへ広げない。006のみを進め、007以降は開始しない。通常既定切替017、補助018未完と保存013の既知事項は維持する。

### film/ticket正式04：visual・9core・実Jekyll監査完了、性能/local/公開待ち（2026-10-21）

- [独立visual正式所見](evidence/AVOID-006/film-ticket-edges/visual-review.md)・[ledger](evidence/AVOID-006/film-ticket-edges/visual-review-ledger.json)が完了、親はtextレビュー済みで画像は開いていない。film5成立条件の端/穴の維持・改善、横ticket2の切離改善、縦ticket不変対照、保持中の窓/主文字欠けなしを見た範囲で確認。実見50画像/元167抽出frame・追加原寸10枚の視認経路をledgerへ記録し、全frame目視/実時間再生とは扱わない。縦film r.2の両側insufficient-spaceは成功例/人間OK対象から除外する。
- [9core summary](evidence/AVOID-006/film-ticket-edges/final-candidate/fixtures/functional-summary.json)の全exit0/候補hash一致を親が実JSON確認。候補JA `c3a03e4466138567b28b01e36ae6a6f6070e20c4ec0e815a8bcf2d43ed3adbdb`、EN `18f3233a887fbb1f363162f316abd188d7c5f5beac35677b58a65e91449e528f`。性能gateは実行中、local validatorは未完。初回numeric丸め差/tolerance根拠/原ログ上書き欠損は[親レビュー](evidence/AVOID-006/film-ticket-edges/parent-review.md)の記録を保持する。
- 正式04公開候補は9組/18 native MP4参照（15 unique）/公開18 files・5,927,801 bytes、manifest `e86d1f4bbea73abd83ad0f9de89e6f8e8271bb30ce0f460dcd6207589058a2d5`。beforeは8193b058、afterは上記候補。同じ24fps/4秒/96frameを直接native取得し、HTML UI録画/円guide合成/旧transcodeは使わない。PNG付き超過初稿は非公開draft-private/public-04へ保持、旧公開版は不変。
- [最終実Jekyll監査](evidence/AVOID-006/film-ticket-edges/pages-output-audit.json)はpassed:true/actualJekyllOutput:true、2,929 URL/996,440,939 bytes・旧2,911 URL保持・10 manifest/2,883 asset参照で容量上限以下。初回/[再試行](evidence/AVOID-006/film-ticket-edges/pages-jekyll-retry.log)のENOSPC rawlogsは保持する。Docker内空き0とhost約1.5GBの差を踏まえ、今回生成sourceのみ旧immutable snapshotと同byte hardlink共有980,720,249 bytes/2,910 files、旧snapshot不変の[記録](evidence/AVOID-006/film-ticket-edges/snapshot-storage-sharing.json)を保存し、[3回目exit0](evidence/AVOID-006/film-ticket-edges/pages-jekyll-storage-retry.log)後に全URL/byte監査成功。初回から成功とは扱わない。
- [04確認依頼draft](reviews/AVOID-006-local-20261021-04.md)を準備。公開URLは予定と明記し、横film左右/縦film上下の帯・穴、3:2/2:3・順次描画、ticket終盤の切離を比較する。公開commit/push・全raw/動画/日英起動検証と人間の今回受入は未完。006は実装中のまま、旧18受入/他6新例未回答・007以降未着手・既定017/補助018未完を維持する。

### 正式性能不合格：c3a候補公開停止・測定処理調査（2026-10-21）

- 親は[正式performance.json](evidence/AVOID-006/film-ticket-edges/final-candidate/performance.json)/[raw log](evidence/AVOID-006/film-ticket-edges/final-candidate/performance.log)を実読しpassed:falseを確認。100cutはplanning factor1.680124/追加render+4.5ms、1000cutは3.029502/+9.5ms。既定上限2/+3msを超えた。warmup3/sample6/stressは不変。入力同一・actualCountsValid・dense100/1000決定性/128 unique budgetは成功だが、性能gate不合格を相殺しない。
- 旧c3a/EN18f候補は公開しない。local playbackはまだ未実施。現在の04 capture/manifest e86d・独立visual・9core・実Jekyll成功はこの旧候補の証拠として保持し、新候補の成功へ流用しない。
- 担当へ原因profileと送り穴測定geometryの保守的外接矩形化（primary分類・実描画不変）を修正調査依頼済み。現在調査中/変更未完で、新hash・再試験・再captureの範囲は親レビュー後に決める。測定省略や閾値変更で合格へ置換しない。
- [親レビュー](evidence/AVOID-006/film-ticket-edges/parent-review.md)と[04 draft](reviews/AVOID-006-local-20261021-04.md)へ不合格/公開停止を反映。006実装中を維持し、技術的不合格を人間レビューへ出さない。旧18受入・他6新例未回答・007以降未着手・既定017/補助018未完は維持する。

### fb876軽量化候補も正式1000 planning不合格（2026-10-21）

- 親は[optimized正式performance.json](evidence/AVOID-006/film-ticket-edges/optimized-candidate/performance.json)/[log](evidence/AVOID-006/film-ticket-edges/optimized-candidate/performance.log)を実読。JA `fb876e83a68fdd2b7d31418b29191d81f413eb19c508a6b273fe2c3f4b44782b`の既定warmup3/sample6/stress有効の正式gateはpassed:false。100cutはplanning1.467417/追加render−2msで合格、1000cutはplanning2.354051（上限2）/render−2.7msでplanning不合格。renderの上限+3msは両方合格。入力同一/counts・stress決定性128budget通過は性能全体の合格に置換しない。
- 公開未実施、core/capture再確認は停止。担当が追加の最小計算最適化案を調査中で、変更や再検証の成功は未確認。c3a正式失敗・rect-only非正式診断・fb876正式失敗は[親レビュー](evidence/AVOID-006/film-ticket-edges/parent-review.md)に別履歴として保持する。
- 006実装中を維持し、技術的不合格を人間確認へ回さない。旧04 capture/manifest/Jekyll等は旧c3a候補の証拠で新候補合格へ流用しない。旧18受入・他6新例未回答・007以降未着手・既定017/補助018未完は維持する。

### a3c4正式性能gate合格・新候補の後続検証へ（2026-10-21）

- 親は[final-candidate-v2/performance.json](evidence/AVOID-006/film-ticket-edges/final-candidate-v2/performance.json)/[log](evidence/AVOID-006/film-ticket-edges/final-candidate-v2/performance.log)を実読しpassed:trueを確認。after JA `a3c4d0e3c76994033910d61711180787576a0bec938d397da8425c37b8124ba7`/tool `5b2bcc774fa963b6e764c1f84c08a6f0e258c2a7be20216720fbdac485742bf0`現物hash一致。標準100/1000、warmup3/sample6/stress:true/runtimeProfile:falseは不変。
- 100cut planning1.44605149/追加render−2.5ms、1000cut1.96455410/−1.4msで上限2/+3msを通過。1000 planningP95 before14,145.5/after27,789.6ms。入力同一/counts・stress100/1000決定性/128budgetも通過。c3a/fb876正式不合格・非正式中間診断は[親レビュー](evidence/AVOID-006/film-ticket-edges/parent-review.md)に保持し、この正式実行の合格を任意環境/全実行の性能保証へ広げない。
- a3c4新候補のnumeric21/9core/864frame再確認、正式05 pack、local再生/公開全検証は進行または未実施。旧04のcapture/manifest/visual/Jekyll等は旧候補証拠で、新候補へ自動流用しない。05依頼はpack後の結果レビューを待つ。006実装中・公開未完、旧18受入/他6新例未回答・007以降未着手・既定017/補助018未完を維持する。

### 正式05 pack完了・local/Pages/公開確認待ち（2026-10-21）

- 新[05 manifest](../review/AVOID-006/local-20261021-05/manifest.json) SHA-256 `7eaf816ec97d1d9560b59ee8e15871181061ad72aa3333947553aea78690daa2`、公開18 files/5,928,462 bytes・native MP4 18参照/15 unique・private121 assets。after a3c4 fresh864frameを取得し旧c3a PNG hashと全一致、before8193は元撮影再利用。候補識別と再利用/新規取得はmanifestへ固定した。
- [新9core summary](evidence/AVOID-006/film-ticket-edges/final-candidate-v2/fixtures/functional-summary.json)全exit0、[親98files hash確認](evidence/AVOID-006/film-ticket-edges/final-candidate-v2/parent-functional-hash-review.json)、[親numeric21独立review](evidence/AVOID-006/film-ticket-edges/parent-numeric-review.json)の認証20/診断1・band hold68 samplesの端交差/比率/strict geometry・pixel確認、既述の正式性能gate合格を満たした。
- 旧04は未公開perf失敗候補として[historical manifest](evidence/AVOID-006/film-ticket-edges/historical-public04-manifest.json)/[status](evidence/AVOID-006/film-ticket-edges/historical-public04-status.json)へ保存し、[新05確認準備draft](reviews/AVOID-006-local-20261021-05.md)へ案内を更新。旧未公開URLを現在の依頼先に使わない。visual addendumは別担当進行中で、旧c3a画像実見と新a3c4のfresh864 PNG一致のつながりを別途記録する。
- local/native54再生、新05のPages容量/全bytes監査・公開全raw/再生seek/日英起動と人間受入は未完、006実装中を維持する。旧18のみ受入、他6新例未回答・007以降未着手・既定017/補助018未完・保存013既知failure未成功を維持する。

### 公開前05：visual接続・実Jekyll完了、local HTTP導線再検証待ち（2026-10-21）

- [visual final addendum](evidence/AVOID-006/film-ticket-edges/visual-review-final-addendum.md)/[ledger](evidence/AVOID-006/film-ticket-edges/visual-review-final-ledger.json)が完了。新864 native PNG hash/計141 assets・旧実見after75 samplesの対応を照合し、旧視認を新a3c4へ機械的に接続した。追加閲覧/再生はしておらず、全frame実見やユーザーOKへ拡張しない。
- 新05公式Jekyllは[初回ENOSPC log](evidence/AVOID-006/film-ticket-edges/final-pages-jekyll.log)を保持。今回raw report2本をgzip展開完全同値確認してrawのみ解放した[記録](evidence/AVOID-006/film-ticket-edges/final-candidate-v2/raw-report-storage-release.json)後、[retry01](evidence/AVOID-006/film-ticket-edges/final-pages-jekyll-retry01.log)が成功。[最終actual audit](evidence/AVOID-006/film-ticket-edges/final-pages-output-audit.json)はpassed:true、2,929 URL/996,446,620 bytes・旧2,911 URL/VERIFICATION/config保持・10manifest/2,883asset参照。完全audit後、今回生成の再現可能outputだけを削除しimmutable source/projection/log/auditを保持した[記録](evidence/AVOID-006/film-ticket-edges/final-pages-output-storage-release.json)を残す。
- [local05-validation-01](evidence/AVOID-006/film-ticket-edges/local05-validation-01.json)を実読すると54 native frame確認/after864 PNG一致後、local page.gotoのHTTP導線エラーで失敗しplayback0件。動画再生/標準UI成功はまだ主張せず、再検証を待つ。
- [環境178](evidence/AVOID-006/film-ticket-edges/environment-network-178.json)はcurrent:true、通常HTTPSで旧03manifest200/TLS0/hash一致。旧版到達確認と新05公開成功を区別し、006実装中・公開/人間受入未完を維持する。

### local05 HTTP導線失敗・製品固定のまま06 repackへ（2026-10-21）

- local05初回01はpassed:false。native54 frame/after864 parity一致は成功したが、static serverのdirectory/index.html routing欠落でpage.gotoが失敗し、動画へ未到達/playback0。製品の描画失敗や動画再生の不合格と混同しない。
- 親は指定担当へtool修正/新06 repackを依頼し、05 publicをunstage、05の未公開失敗履歴を保持する。製品a3c4・engine/captureは固定でcore/perf/capture再実行不要と親判断。新06のPages監査/local/公開全検証は別途必要、06確認依頼はpack後に用意する。05の未公開URLを現在の依頼先には使わない。
- 006実装中を維持、旧18受入/他6未回答・007以降未着手・既定017/補助018・保存013既知事項は不変。

### 06 pack完了・local handler承認後の全検証開始（2026-10-21）

- 新[06 manifest](../review/AVOID-006/local-20261021-06/manifest.json) SHA-256 `4a8485524c9d8112a148434630e457c3dfef13c7b8e08d3788a8f7deb69fca9c`、validator `56ce799440ac44da501b936455b97d70455ef6d26fc5702b5b25cae161bc4954`でfreeze。9組/18 native MP4参照・15 unique、公開18 files/5,928,462 bytes/private121 assets。製品a3c4/EN3d1eと同before/optimized-afterは不変、親判断でcore/perf/capture再実行不要。
- 親はlocal限定handlerのdecode URL/root境界→directory/index解決→境界再確認をレビューし、[HTTP9case](evidence/AVOID-006/film-ticket-edges/local-static-routing-test.json)を実読承認。製品/MP4/公開fetch/判定閾値不変。05のnative54/after864一致後goto失敗・動画0件は未公開履歴として保持する。
- [06確認準備draft](reviews/AVOID-006-local-20261021-06.md)を作成、05履歴から案内を移行。local全検証54 native frame/18参照playback/UIを開始済みだが成功未確定、独立visualへ06hash接続を依頼済み。新Pages/公開全検証・人間受入は未完、006実装中を維持。旧18のみ受入/他6未回答・007以降未着手・既定017/補助018・保存013既知事項を維持する。

### local06 seek timeout・07 pack前診断へ（2026-10-21）

- [local06-validation-01](evidence/AVOID-006/film-ticket-edges/local06-validation-01.json)/[log](evidence/AVOID-006/film-ticket-edges/local06-validation-01.log)はnative54 frame/after864 PNG parity mismatch0/raw20 asset確認まで成功。最初のvideo seek2.6秒に対しseekedAt/currentTime0・decodedAfterSeek:nullでtimeoutし、passed:false/playback0件。06を成功扱いせず未公開失敗として保持する。
- [修正前probe](evidence/AVOID-006/film-ticket-edges/local-media-probe-before.json)はRange要求に200全427,940 bytes、MIME/Accept-Ranges未明示、seekable[0,0]を実測。Content-LengthはNode自動付与427940があり、欠落とは断定しない。local serverのMIME/Range対応を修正対象とする。担当が修正前単体診断→修正→18参照/UIだけの診断を実施中でnative再描画なし。07 pack前に親レビューする予定、修正成功・07 pack/公開はまだ判定しない。製品a3c4/MP4/native証拠固定、05/06失敗履歴と旧18のみ受入/他6未回答・007以降未着手・既定017/補助018/保存013既知事項を保持し、006実装中を維持する。

### transport修正承認・07 pack凍結と正式local検証開始（2026-10-21）

親はlocal限定MIME/Range対応をレビュー承認。[修正前probe](evidence/AVOID-006/film-ticket-edges/local-media-probe-before.json)のRange要求HTTP200全427,940 bytes/seekable[0,0]から、[修正後probe](evidence/AVOID-006/film-ticket-edges/local-media-probe-after.json)はHTTP206/Content-Range/明示video/mp4/seekable[0,4]となり、2.6秒seek後のdecodedを確認した。修正前もNode自動Content-Length427940はあり、Length欠落とは扱わない。製品/MP4/公開fetch/判定閾値は不変。

[local06-media-diagnostic-01](evidence/AVOID-006/film-ticket-edges/local06-media-diagnostic-01.json)は18参照のplay/pause/decoded seek/endedと日英desktop/mobile UIに成功、minDecoded92/drop計21/corrupt0。ただしnativeFrames:0、diagnosticOnly:true/diagnosticPassed:true/passed:false/acceptanceComplete:falseであり、正式合格や完全な滑らかさを意味しない。05/06の正式local失敗は保持する。

07 [manifest](../review/AVOID-006/local-20261021-07/manifest.json) SHA-256 `6934ae9a57215ce8583f1a291fb59f325ba9411b0bcddb33141b74aba6305c20`、validator `bfee0b0ce8a4df0e8dac200bebb648ef5046761cbdcd4b443b33934144049f71`でfreeze。公開18 files/5,928,462 bytes、9組18 native MP4参照/15 unique。製品a3c4/EN3d1e・同before/optimized-afterは不変、親判断でcore/perf/capture再実行不要。[07確認準備稿](reviews/AVOID-006-local-20261021-07.md)を作成し、旧05/06 URLを現在の確認依頼に使わない。

07の正式local54 native/18参照playback/UI、独立visual hash接続は進行中。[環境180](evidence/AVOID-006/film-ticket-edges/environment-network-180.json)はactual/desired180・observations_current:true・connected・unrestricted/enforced。新Pages/公開全検証・人間受入は未完、006実装中を維持。旧18のみ受入/他6未回答、007以降未着手・既定017/補助018/保存013既知事項は不変。

### 07正式local・独立visual接続完了（2026-10-22 JST記録、公開前）

- [07正式local結果](evidence/AVOID-006/film-ticket-edges/local07-validation-01.json)/[log](evidence/AVOID-006/film-ticket-edges/local07-validation-01.log)は2026-10-21 22:37 JST作成、passed:true/diagnosticOnly:false/acceptanceComplete:true。凍結manifest `6934ae9a57215ce8583f1a291fb59f325ba9411b0bcddb33141b74aba6305c20`・validator `bfee0b0ce8a4df0e8dac200bebb648ef5046761cbdcd4b443b33934144049f71`を実結果と照合。raw20 assets/native54再描画/after864 PNG parity mismatch0、18参照のplay/pause・2.6秒decoded seek・endedが成功した。minDecoded92/drop計5/corrupt0で既定gate合格、完全な滑らかさの保証にはしない。日英desktop1280×900/mobile390×844の同時再生・停止/幅確認を通過してからpassed:trueとなるvalidator経路も確認した。
- [07 visual addendum](evidence/AVOID-006/film-ticket-edges/visual-review-07-addendum.md)/[ledger](evidence/AVOID-006/film-ticket-edges/visual-review-07-ledger.json)は独立solによる公開20/private121 assetsの実hash照合済み。06とMP4 15/PNG54 assets相違0、9条件/来歴一致で、旧実見after75 samplesとnative864frame一致の接続を継承した。追加画像閲覧/decode/再生なし、親も画像を開いていない。全frame目視や人間承認を意味しない。
- 新07のPages監査・公開全raw/再生/日英実描画と人間の見え方確認は未完。[07準備稿](reviews/AVOID-006-local-20261021-07.md)へ現物結果を同期。05/06正式local失敗・06診断は別履歴として保持し、006実装中、旧18のみ受入/他6未回答、007以降未着手・既定017/補助018未完を維持する。保存013のexpected0/actual1既知failureを成功へ置換しない。

### 07公式Pages監査完了・実環境検証待ち（2026-10-22 JST）

[07実Jekyll log](evidence/AVOID-006/film-ticket-edges/pages07-jekyll.log)は公式imageのoffline/read-onlyビルド成功（3.053秒）。[07出力監査](evidence/AVOID-006/film-ticket-edges/pages07-output-audit.json)はpassed:true/actualJekyllOutput:true、2,929 URL（旧2,911保持）、10 manifest/2,883 assets、996,446,620 bytes。projection SHA-256 `390363475ba5326cf2d4a2036c69d0a479ddc5934f016e8e70c0f32235aa018b`、config `a06ab85fc12f54c1b1b2dc0ece8fdbd5db935f3529ba4272839cef28674d8709`。旧05監査の流用ではなく07現物の監査である。

07正式local/独立visual接続/公式Pages監査が揃い、状態を実環境検証待ちへ更新。commit/push・新07公開raw全hash/18参照再生/アプリJA・EN起動と実描画、人間の見え方確認は未完。公開前の成功を公開済みへ置換せず、旧18のみ受入/他6未回答・保存013既知failure・後続未着手を維持する。

### 公開07の全検証成功・film/ticket人間動作確認待ち（2026-10-22 11:47 JST）

- release `abf02cee40e2fb17a664a4fd5a9df1c006ca3ba9`をworkへcommit/pushし、[Pages run39712842995](https://github.com/mokusatsu/lyricfx.JIZURA/actions/runs/39712842995)はcompleted/success。[公開記録](evidence/AVOID-006/film-ticket-edges/publication.json)はpassed:true。公開Git blob mapは07公式監査snapshotの2,930件（config込み）と同一と親が確認した。
- [公開07 validator結果](evidence/AVOID-006/film-ticket-edges/public07-validation-01.json)はpassed:true/acceptanceComplete:true。raw20 assets＋manifest計21件HTTP200/hash一致、18動画のplay/pause・2.6秒decoded seek・ended、日英1280×900/390×844の同時再生・停止/幅確認を通過。minDecoded92/drop0/corrupt0。公開nativeFrames:0で、native54再描画は既存local結果、after864 PNG parity mismatch0は公開結果にも記録される。再撮影や公開環境でのnative再描画を主張しない。
- [公開日英アプリ起動/描画log](evidence/AVOID-006/film-ticket-edges/public07-site-smoke.log)は両言語passed・current JA a3c4/EN3d1e hash一致・歌詞描画を確認。[通常HTTPS結果](evidence/AVOID-006/film-ticket-edges/public07-normal-https.json)は2026-10-22 11:47 JST、継承proxy/既定CA・TLS検証を維持しJA/EN/07manifestの3対象HTTP200/TLSverify0・完全byte一致。
- [現行公開確認依頼](reviews/AVOID-006-local-20261021-07.md)をfilm帯の左右/上下端と穴列・ticket終盤切離しの見え方確認へ更新。技術上の未解決失敗はないが、人間の今回回答は未受領なので006は実環境検証待ちを維持。縦film r.2のinsufficient-space診断をOK対象/認証成功へ含めない。旧18のみ承認/他6新例未回答・007以降未着手・既定017/補助018未完、保存013のexpected0/actual1既知failureは維持する。過去05/06失敗や公開前の未完記述は履歴であり、現在の公開結果は本節を正本とする。

## 2026-10-22 最終受入・完了判定

利用者の「確認OKです。タスクリストの続きを順次実装していってください。」を公開07のfilm/ticket修正へのOKと後続への続行指示として記録した。[受入記録](evidence/AVOID-006/film-ticket-edges/acceptance-20261022.json)。公開07の全raw21 hash・18動画・日英起動描画、最終metadata版の公開一致まで成功済み。機能・数値・正式性能・親コード/結果レビューの未解決指摘はない。

親は最新の続行指示と委任に基づき、旧18の受入、全26代表の原寸MP4公開検証、新8の独立sol視覚証拠、他6の演出構成が今回修正で変わらないことと回帰成功を合わせ、他6への追加人間再確認は不要と判定した。これは他6の項目別人間OKを受けた記録ではなく、親の根拠付き判定である。過去の「他6未回答」は履歴として保持する。

全必須条件を満たしたためAVOID-006を完了にし、次のAVOID-007を開始する。縦film r=.2等の明示診断を成功例に含めず、既定切替017・補助018・保存013の既知不一致は後続へ保持する。
