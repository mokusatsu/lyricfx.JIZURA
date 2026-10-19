# AVOID-005 基本16レイアウトの通常回避軌道

- 状態: 完了
- 段階: 通常軌道
- 技術依存: [AVOID-004](AVOID-004.md)
- 事業優先度: 未指定。記載順は技術上の推奨順。

## 開始前確認

- ブランチ・HEAD・git status: 計画登録時は未着手。実際の着手記録と現在の結果は末尾を参照する。
- 共通解析基準: b7c23bf。スキル導入済みHEAD: 3c79480。着手時に差分を再確認する。
- 正本: [設計・根拠](avoidance-design.md)、[一覧](task-list.md)、[スキル](../.agents/skills/evidence-driven-task-management/SKILL.md)。
- 依存タスクの必須条件と証拠を確認する。完了を推測せず、未完条件を引き継ぐ。
- 対象ファイルに既存変更がある場合は競合を確認する。同時進行タスクは原則1件。

## 目的

既存基本レイアウトで、文字サイズを小矩形へ縮めず、円外を使う通常軌道を確立する。

## 2026-10-19 最終判定

- 利用者回答: 「これでOKです。次の段階に進んでください。」Stack修正版 `local-20261019-03` の動作OKと次段階の実施指示として記録する。他の安全例への既存OKと合わせ、H01の見え方の確認を完了した。
- 旧H02/H03は個別の人間OKへ書き換えず、親の委任判断で追加確認不要とする。H02は実注釈・所有板を含む受入試験、原版の公開比較/再描画・親の目視を完了済み。今回の修正はStack分岐だけで、他15IDの60条件/45frameで描画と所有関係の不変を再確認。H03は6例外対照の画素一致、固定大サイズの明示的制約不足、破損validator試験で決定的に判定できる。未回答を人間の承認として補っていない。
- 親レビュー、必須ローカル試験、公開121assets＋manifest/52原寸再描画/日英起動、前版512assetsの検証を含む証拠が揃ったため完了。完了対象HEAD `85eaef642610857252e44cc4c8e5374b4cfa15fb`、work、clean、fetchしたworkと一致。最終Pages run39233126009成功と公開照合済み。
- 保存testの既存不一致は013、既存features/area effects不一致は017、補助マスクは018、通常アプリの新方式有効化は017へ引き継ぐ。保存成功や全variant成功は主張しない。

## 2026-10-19 Stack動作確認への対応（履歴）

- 利用者回答: 「安全例はどれもOKですが、Stackで避けたときにまちまちの場所になっていて、Stackの原義とは異にするものになっています。斜線上でもいいので積み重なっている感じを維持できるといいです。」
- 他の安全例のOKを記録する。Stackは要修正。回答の範囲を越えてH02/H03全項目の承認へ置換しない。
- 開始: work、HEAD `834fb5bc69867840080e4cf2c2d25db2082e8d71`、作業ツリーclean。通常のfetchでwork最新HEAD一致。AGENTS.mdなし。修正前の製品と検証ソースを `/workspace/work/avoid005-stack-before` へ固定。
- 原因: 全所有単位の共通平行移動が成立しないとき、Stackの反復行にも独立配置を適用し、円外でも積み重なりを失う。
- 修正範囲: Stackの反復行を一つの整列した組として扱い、順序・一貫した間隔・文字サイズを保つ。斜めの積み重なりも許容する。候補が成立しない条件は明示的な制約不足とする。その他15レイアウトと互換対照は保持する。
- 実装・修正は指定のgpt-6.1-sol / mediumへ委任した。既存の `local-20261019-02` と公開証拠は履歴として保存し、修正比較は別buildで作成・公開検証した。着手時点では修正版の再検証は未実施で、結果は以下へ追記した。
- AVOID-006以降は未着手のまま保持する。
- 修正版は指定担当の実装・親のコード/結果/実画像レビュー済み。反復indexに対してoffsetを一次式にし、一つの整列した組として回避する。円が上/下の横長例で斜め配置が成立し、横長中央は制約不足。旧版で分散した配置をsafeとした条件を無理に維持しない。
- ローカル: 担当30条件、他15×4設定=60互換比較、基本native144条件、受入46項目、004回帰118項目、親独立58条件/1100描画polygonと他15の45frame/6対照、性能基準を成功確認。[親レビュー](evidence/AVOID-005/stack-revision/parent-review.md)。保存testの既存不一致は013、既存features/area effects不一致は017への引継ぎを維持し、今回も保存成功とはしない。
- 新比較 `local-20261019-03`: 26組、52UI＋52原寸PNG、1動画。13 safe /7 insufficient /0 unsupported /6例外対照。121assets＋manifest。manifest SHA256 `3aa2ea6c5a06e4a45f03e3e3d7580642767f02b05ba97c61a2e9814ba32340a1`。ローカルvalidatorと破損12件の拒否成功。
- 公開: artifact commit `025e436baca82dba97f5b6ceeca6553e6c93c827`、Pages run39232475343成功。全121assets＋manifestのHTTP/raw hash一致、全52原寸の公開再描画、日英起動・描画、親の通常通信での再生/シーク/スマホ幅を確認済み。[公開記録](evidence/AVOID-005/stack-revision/publication.json)。[修正版の確認依頼](reviews/AVOID-005-local-20261019-03.md)のStackの見え方は未確認であり、タスク完了にはしない。

## 変更範囲

- 当該段階のGitHub Pages確認サンプル・変更前後のキャプチャ画像・比較HTML・公開manifest、確認依頼/回答記録。共通手順は[Pages人間確認運用](pages-human-review.md)と[比較画像・HTML契約](visual-review-comparison.md)。

- src/06_layouts.jsのring以外の登録16レイアウト
- src/08c_composition.js・共通trajectory生成、layout別fixture
- 文書更新: 本記録・task-list.mdの状態/証拠、設計の該当契約、対応表を同じ変更で同期する。

## 実装手順

1. flow/static/scatter/band等の経路生成を共通化し、各IDの文字単位/語単位を明示する。
2. 中央/上/下に応じる候補と重みを実装し、左右位置・半径・文字寸法も考慮する。
3. 主歌詞・ルビ・意味のある注釈・主歌詞のプレート・下線が整合するadapterを付ける。tile/marquee/glossの反復補助は配置を再設計せず、役割タグを付け018へ渡す。
4. 固定サイズや長文で解がないケースに契約済みの診断を返す。

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

- [x] inventoryの当該16IDすべてにテストとframe証拠があり、未対応を成功扱いしない。
- [x] 対象となる主歌詞は中心点だけでなく文字占有範囲と全経路が円を避ける。反復補助の軌道は変更せず、マスクの受入は018に分離する。
- [x] 中央では四方向が使用され、上/下の100seed比較が契約された方向偏りを満たす。
- [x] 同じfixtureで文字の読み順・開始/終了・色・演出seedが保持され、画面面積比による一括縮小がない。
- [x] 強調・manual・lock・OFFの互換fixtureが変わらない。

## テスト方法

- 比較成果物: [共通契約](visual-review-comparison.md)に従い、全H-IDの画像対応・撮影条件・HTML表示・公開一致を検証する。画像だけで数値/時間/保存の自動試験を代替しない。
- Unit: 経路の始終点は外・線分は内の反例、接線、画面端、候補なし。
- Integration: 16ID×主要aspect×上下中央、長文/改行/ルビ/抑制/size記法。
- Regression: lyric_emphasis、lyric_features、lyric_placement_stability。
- 実環境: marquee/wave/scatter/diagを含む動画と静止frameを確認。
- 計画登録時の実行結果: 未実施。現在の実装・実行結果は末尾と final-candidate 証拠へ記録する。AVOID-001の旧基準ログを修正後の証拠として流用しない。

## GitHub Pagesでの人間確認

[共通手順](pages-human-review.md)と[依頼テンプレート](templates/pages-review-request.md)に従う。以下は計画登録時に定めた確認項目。現在の比較生成・公開・確認の状態は末尾を参照する。依頼時には実際のUI名・サンプル名・ケースURLへ具体化する。

各項目に下表の前後キャプチャを準備し、比較HTMLの同じH-IDアンカーへまとめる。操作の前後状態が複数ある場合は、各状態それぞれで実装変更前/変更後を撮る。担当エージェントが画像を生成・公開検証してから人間へ依頼する。

| 項目ID | 人間に依頼する操作 | 期待結果 | 比較キャプチャ（予定） |
|---|---|---|---|
| AVOID-005-H01 | 基本16IDの公開一覧を開き、中央・上・下の円を切り替える。 | 主歌詞が小矩形へ縮まず、中央なら四方向、上なら左右/下、下なら左右/上を使う傾向が見える。 | 基本16ID×中央/上/下の全体描画。固定seed群とenter/hold/exitで方向の偏りを確認する。 |
| AVOID-005-H02 | marquee/tileの主歌詞と実際の箱、glossの主歌詞・pipe注釈のケースを再生する。 | tileの主歌詞とknock box、glossの実際のpipe注釈は所有単位で揃って回避する。marqueeの反復行と行箱は元の配置を保つ。反復補助のマスクは未実装と明示する。 | tileの主歌詞とknock box、marqueeの主歌詞と反復行箱、glossの主歌詞と実際のpipe注釈を示す。marquee/tileに供給していないnote描画を見本にしない。 |
| AVOID-005-H03 | 長文・強調・手動・ロック・OFFの対照ケースを開く。 | 強調の例外と手動指定が保たれ、解がない場合は未対応/競合が分かる。 | 長文/強調/手動/lock/OFFの描画と競合時の診断表示。 |

公開コミット / 変更前・変更後の実装識別子 / build ID / 比較HTML実URL / H-IDと画像の対応・撮影条件 / 操作用Pages実URL / 公開画像の一致・表示確認日時 / 自動検証証拠 / 依頼記録 / 人間の回答: 実装・公開後に記入する。親のコード/テスト結果レビュー、人間の動作確認の要否と理由も記録する。不要判定を人間のOK回答には置換しない。未確認を成功として補わない。

## 停止条件

- 可読性を保つ経路がなく、契約外の文字縮小やカット分割が必要になる場合。
- 仕様矛盾・破壊的データ変換・予期しない公開互換性影響・既存変更との競合は、確認済み事実と選択肢を記録する。

## ロールバックと引き継ぎ

- 当該タスクの差分を単位として戻せる状態を保つ。保存されたユーザーデータを削除するロールバックにしない。
- 完了条件ごとに達成/未達/未確認、対応コマンド・件数・ログ・frame証拠を追記する。
- 開始/終了HEAD、git status、対象外既存変更、未実施検証、後続に渡すAPI/制約を残す。
- ローカル検証済み・実環境検証待ち・完了を区別する。最終判定は最新の[実装レビュー運用](implementation-review-policy.md)に従う。人間にコードレビューを依頼しない。

## 証拠・残事項

- 計画根拠: [AVOID-001](AVOID-001.md) と [設計書のE01〜E23](avoidance-design.md)。
- 計画登録時の実装差分はなし。現在の実装・検証は末尾の最新候補と final-candidate 証拠を参照する。上のチェックボックスは最終の公開・人間確認を含む総合受入であり、空欄を「ローカル試験をすべて未実施」と解釈しない。
- 個別の追加判断は着手時に記録し、共通設計と矛盾させない。

## 2026-10-19 着手

- 開始branch `work` / HEAD `3d8f52c7ce3f8efec25f5f0d7ad4c71bdb225173`。開始前作業ツリーclean。直前のremote fetchは `48837df` と一致し、004の人間全項目OK記録を上記commitへ追加。AGENTS.mdは検索範囲に存在しない。
- 004は利用者の全項目OKと親の必須条件確認で完了。原則1件ずつに従い005のみ開始。実装は指定 `gpt-6.1-sol / medium` の子担当、コード/試験の親レビューと公開検証は親担当。
- 004での説明上の指摘を反映し、005比較ページでは各caseの日本語の見る箇所・期待する変化/不変を個別表示する。従来動作の対照を新機能と混同させない。004公開bundleは固定して保持する。
- 実行環境観測はcurrent=true、spec/observed=24/24、unrestricted/enforced。保存設定と実行中反映を区別し、公開検証では継承proxy・CA・TLSを維持する。

## 2026-10-19 実装途中のcheckpoint（未承認）

- 状態は実装中。親が現prototypeを005の受入として不十分と判定し、同じ指定model/mediumの新しい実装contextへ順次引継ぐ。利用者の実装許可は継続し、005の完了・公開・人間確認はまだ行わない。
- 固定変更前: `3d8f52c7ce3f8efec25f5f0d7ad4c71bdb225173` を変更前に `/workspace/work/avoid005-before` へgit archive。変更後の製品/fixture/test hashとraw logは [checkpoint](evidence/AVOID-005/prototype-01/checkpoint.json)。コミット・pushなし。
- opt-in `J.finalizePlacementPlan(plan,{basicLayouts:true})` のprototypeに16IDを登録。通常既定と004の狭いopt-inは旧経路を維持。16IDが最終受入を満たしたという意味ではない。
- `basic-test.cjs`: native seed704・歌詞「風の先へ」・16ID×3aspect×中央/上/下 =144件。各caseの全時間包絡を002独立oracleへ照合し、別に5時刻の描画を確認。幾何上certified88件/insufficient56件/unsupported0件/描画throw0件。**文字同士の重なり・読み順を検証/保証していないため、88件も005成功数には数えない。** ランドスケープ中央で幾何上safeはmixed/marquee/scatter/condensed/stackの5IDのみ。
- ネイティブ16ID×4時刻の記録/replay offset0は64/64完全画素一致。複数rect/rect+arc/rect+line/clip引数/Path2Dの5件は明示拒否。特殊affine・最小render縮尺・移動後gradient/clipは未検証。円eclipse shadowは明示未対応のまま。
- 004の既存stage regressionは118 checks成功。ログ内のbefore比較は004自身の固定archiveを使用し、005の比較成果物の代用にはしない。
- 親の変更前回帰: emphasis/placement_stability日英成功、featuresはdefaulttitleが加わる既存期待1/実2でline24失敗。005変更後の3回帰はこのcheckpointでは未実施。project_file期待0/実1は013、areaeffect期待1/実0は017へ継続。既存assertionの変更なし。
- 公開bundle/manifest/比較PNG/動画は未作成。004公開bundleは不変。bulk captureはcore acceptanceの成立後に行う。
- 未解決: 過度に保守的なfull-duration bboxではnative wave/labels等を実用的に回避できない。独立した所有単位の候補選択は新しい重なりや読み順の逆転を起こせるため再設計が必要。glyph/word間の順序・間隔、附属板/注釈・rubyの所有、連続軌道とstage収容の全区間証明、中央四方向・上下100seed、全nativevariant・長文/改行/抑制/sizeの受入を追加する。
- 次案は円と文字占有範囲のMinkowski境界に沿う連続route operator。まだ未実装/未検証。可視部分のbboxへ追従するとtype/alphaで飛ぶため、全revealed寸法とovershoot上限で安定した所有矩形を作る。円の接線外側まで連続guardを延長し、native位置へ戻る境界でジャンプしないこと、全時刻の歌詞間順序/間隔が保たれることを証明する。単なる4矩形の空き領域選択へ戻さない。


## 2026-10-19 通常軌道の実装候補（prototype記録を更新）

- 上の prototype-01 の未解決事項は履歴として保持する。現在の実装は [adapter 契約表](evidence/AVOID-005/adapter-contract.md) と最終候補証拠を参照する。親レビュー・公開・人間確認が完了するまではタスク状態を実装中のままにする。
- opt-in の16IDに、所有単位と semantic な読み順・新しい潰れの制約、実円 polygon の候補解、wave の連続境界 route、huge の字形を保持する分離セル、labels の全 annulus を共通移動する証明を実装した。正常アプリ既定は従来経路のまま。
- 文字/shape の AA、miter/square cap/dash、小 scale、gradient/clip replay、refinalization の source復元を修正した。実際の抑制記法は auto area が代わりに持っていた intrinsic scale を opt-in 時に復元し、明示 size override は尊重する。旧 JSON/既定描画は変えない。
- 固定 native matrix は16×3aspect×3位置144件。101 certified/43 insufficient/0 unsupported/0描画例外。全16IDに genuine native admitted case がある。全配置が成功するという主張ではなく、固定サイズ不適合と定義した候補探索の限界を明示する。
- 最終候補 `c2449974833a49f14d27de4fc84704e0d8ca7b6baf68960de6dd690a9ebc6652` の acceptance46/46成功。実画素16×3scale×3time=144条件で円衝突・polygon取りこぼし・conflictすべて0。実 parsed note/抑制/強調/size/改行、source/clock/seed保持、cache差分8条件、font/async invalidationを含む。004 unchanged regression118成功。
- coreの最終性能/親の独立検証後に比較captureへ進む。比較bundle・公開・利用者確認はまだ未実施。004公開assetと002 inventoryは不変。

- 最終再識別: 製品comment1箇所の説明訂正だけを行いJA SHA256 `c7dbd4d94309d840b885c8a916f7d98544888d2b5663db054654d5f0671d4f41` / EN `c55180c81354e6265a785c936590cb54857b5ac86434933d10d09d52528a6897`。直前版との意味差なし。native/acceptance/stageの現版再試験と親の独立検証を実施中。原始結果とsource hashは [final-candidate](evidence/AVOID-005/final-candidate/summary.json)、16ID所有/variant/限界は [adapter契約](evidence/AVOID-005/adapter-contract.md)。
- 制御された最終性能測定は100/100で計画1.718倍・描画+.8ms、1000/1000で1.831倍・+1.3msで契約内。初回cold320.3ms/1790.3msと失敗測定履歴も記録し、warmup後p95と区別する。commentのみの再build前の実測を改ざんせず保持する。


## 2026-10-19 ローカル受入・公開候補の確定

- 状態を実環境検証待ちへ更新。親のコード/テストレビュー完了、H01〜H03の人間確認は必要と判断。依存する006は未着手。
- build `local-20261019-02`、manifest `e8c81c696acae92f9a5edc88d79b9430f12ee59e95b9238c6530f2823633ab83`。123組（UI246枚＋原寸246枚）・4動画・512assets＋manifest。全123組の同条件描画再照合、前後不変6件、全16安全例、desktop/mobile切替/overlay/links、日英本体起動のlocal validator成功。正常clone/破損11件成功。
- 画像結果は安全82/制約不足35/unsupported0/対照6。27必須安全例と1必須不足例を含み、期待未達0。449は定義条件数のみ。native自動試験144×5時刻とは別の集合として記録。
- 親の通常通信による20操作・保存/フォント安定と視覚確認も完了。詳細は[親レビュー](evidence/AVOID-005/parent-review.md)、[公開記録](evidence/AVOID-005/publication.json)、[依頼稿](reviews/AVOID-005-local-20261019-02.md)。public HTTP/hash・全画像/動画・日英起動はこれから実施し、ローカル成功で代用しない。
- failed build01は末尾のfontCoverage引数長上限で未完。全テキストをstdinへ渡す修正後に新build02を再撮影した。失敗証拠は保持し、未完bundleを公開しない。


## 公開検証完了・人間動作確認待ち

- artifact `8358337901941fccb5023741d48bba2d883ffd42`、Pages run [39227736588](https://github.com/mokusatsu/lyricfx.JIZURA/actions/runs/39227736588) 成功。実行中環境はobservations_current=true、spec/observed=28/28、unrestricted/enforced。保存設定の参照と実行中反映を別記した。
- 通常HTTPSでmanifest・日英HTMLすべてHTTP200/TLS verify0、期待SHA256と一致。継承proxy/CA/TLSを維持。公開validatorは512assets＋manifestをraw bytesで全照合し、123組246描画のnativePNGを再生成して一致、desktop/mobile表示・リンク・前後切替・overlay・再生/seek・日英本体起動も成功。
- 公開site-smokeの日英両方成功。親も通常通信・interceptionなしで20操作、外部要求0/pageerror0/保存・font状態不変を確認し、公開画像を目視した。[公開証拠](evidence/AVOID-005/publication.json)にUTC/Asia-Tokyo日時を記録。
- [比較URL](https://mokusatsu.github.io/lyricfx.JIZURA/review/AVOID-005/local-20261019-02/)と[具体的な確認項目](reviews/AVOID-005-local-20261019-02.md)を用意した。人間には文字の読みやすさ、動き、附属物の追従と対照の不変を依頼する。コードレビューは親が完了している。
- 状態は実環境検証待ち（残件は人間H01〜H03の動作確認）。004へのOKを005へ流用しない。人間の回答待ちのため006は未着手。
