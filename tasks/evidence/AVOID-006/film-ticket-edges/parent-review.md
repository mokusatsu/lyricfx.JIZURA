# Parent review draft: filmstrip帯の端到達 / ticket退場切離量

**07 pack凍結済み、正式local検証中・未公開。** local transport修正の親レビューと18参照/UI診断は成功したが、診断native0/passed:falseを正式合格へ置換しない。製品a3c4固定、05/06失敗保持。006実装中・新Pages/公開/人間受入未完を維持する。

実装担当はisolated `film_ticket_edges_fix`（gpt-6.1-sol / medium）。親がコード/結果をレビューし、別isolated solが画像を実見する。親レビューや独立visualを人間の受入へ置換しない。

## 対象と開始条件

開始work/HEAD `8193b0580a03f19472637807231685728d0718d7`。利用者の報告は、filmstripの変更後の帯が変更前のように左右端まで届かないこと（縦方向の上下も照合）、ticketの最後の切離量が小さいこと。正式03の公開物は不変履歴として保持し、修正版の成功や新8全体へのOKには置換しない。旧18受入と他6新例の未回答、007以降未着手、既定017・補助018未完を維持する。

既存pyc変更とuntracked作業物は保持・対象外。今回の候補差分はfilm/ticketのnative描画とadaptive recipe/fit処理を対象とし、他演出や通常の既定切替を含めない。

## 親の一次差分レビュー

### filmstrip

原因はadaptiveだけの`bandLen = fw0 * 3.2`。3:2露光コマをlaneへ収めるとコマ寸法とともに帯自体が短くなるため、nativeの画面沿軸長`A * 1.6`へ戻す候補を確認した。露光コマ3:2（縦回転2:3）、pitch・文字・nativeの送り方向/速度/順次描画は維持する。

adaptiveの穴は帯全体の有限indexを描画する。nativeの120上限/描画前stage内判定をそのままadaptiveへ適用すると、後段のplacement offsetによって画面端に来る穴が欠け得るため、adaptiveでは全列を記録する。通常のrecorder draw-resource ceilingは残り、無制限の描画を許す変更ではない。数値21条件では最大88穴列/188 primary eventsで、予算内の実描画を確認した。正式動画の独立visualも完了したが、性能不合格のため公開受入とは扱わない。

stageのalong-axis cropを許すのは帯・穴・edge codeだけ。露光窓、歌詞、countdownのfitは維持し、hold fitの対象へ露光窓も明示している。円との衝突包絡から帯等を除外することや、主歌詞マスクで欠損を隠すことを認める変更ではない。hold strictとsource-tagged moving entry/exitだけの許容を維持する。横の左右端と縦の上下端、傾き/方向・保持中移動の数値結果を親が確認済み。独立visualではサンプル内の改善を確認済み。性能不合格の解消と新候補確認は別途必要。

### ticket

adaptiveの`tearDistance = pad * .2`と`tearTurn = 2`で退場時の半券の切離が小さくなっていた。候補は元のstage寸法からnative券幅/高さを求め、`tearOffset = [nativeW * .12, nativeH * .2]`、`tearTurn = 12`へ戻す。`tearDistance = hypot(tearOffset)`は包絡の保守境界として使い、実描画は元の各軸offsetを使う点を確認した。

entryのtravel/entryTurnは変更しない。今回の要望は退場の切離量であり、entry改善まで承認済みとは扱わない。半券の文字/情報の所有関係、exit timing、strict holdと既存の入退場許容、sweepの移動/角度上限が一致することを最終試験・横縦動画で確認する。

## 親が確認した試験結果と残るゲート

| 項目 | 現時点の記録 |
|---|---|
| 21数値条件 | 親が実読確認済み。19 safe-hold＋1 safe＋既知の縦radius .2 insufficient-space 1条件。最大88穴列/188 primary events。[summary](numeric21-summary.json)と[全report](numeric21-report.json.gz)。21全条件safeとは扱わない。 |
| 縦radius .2 | 従来からinsufficient-spaceの診断例。今回も成功例や必須成立数へ含めず、診断用元描画と認証描画を区別する。 |
| 同条件の新比較 | 正式captureは両側9×96frame完了、同じtool SHA-256 `1197fe6f1dd2c5ca3f9afeeaf97b639a803af98097f2556e6ebbf4f434c0c4a8`。親は実JSONを独立実読。撮影完了をvalidator完走へ読み替えない。 |
| filmstrip回帰 | [filmstrip-test](filmstrip-test.log)/[report](filmstrip-test-report.json)は16条件・624コマ比率/移動/順次表示がpass。 |
| 不変対照 | [parity](parity.log)/[report](parity-report.json)は43条件・129画像でmismatch0、reveal11 samples一致。 |
| adaptive包絡/画素 | [adaptive.log](adaptive.log)/[report](adaptive-report.json)を親実読、passed:true。anchors8＝5 full＋3 hold、matrix168＝71 full＋34 hold＋63 insufficient-space、controls32/explicitScales8/boundaries8、motion16条件80frames・anchor576frames。除外63を安全例へ数えない。 |
| 独立visual | [正式report](visual-review.md)/[ledger](visual-review-ledger.json)完了、親はtextレビュー済み。film端/穴と横ticket切離はサンプル内改善、縦ticketは不変対照。人間受入や新候補の検証ではない。 |
| 公開 | 旧c3a候補04のpackと実Jekyll監査は完了したが、正式性能不合格のため公開しない。local playback未実施・全公開検証未実施。旧03を上書きしない。 |

候補JA SHA-256 `c3a03e4466138567b28b01e36ae6a6f6070e20c4ec0e815a8bcf2d43ed3adbdb`、EN `18f3233a887fbb1f363162f316abd188d7c5f5beac35677b58a65e91449e528f`。親は上記数値結果と候補識別を確認して正式captureを承認した。最終source/JA/EN/fixture/script/logとcaptureの対応は正式receiptへ固定する。

### 初回数値失敗の原ログ欠損

初回numericは約1.46e-6 stage pxの差で失敗した。Canvas matrixのFloat32丸めに基づき、数値一致toleranceを1e-4 stage pxへ修正する根拠を親がレビュー済み。安全包絡・画素・読みやすさの閾値を通過のために緩める変更とは扱わない。

ただし担当の再実行で初回失敗ログが上書きされ、原ログは欠損している。上の差と修正理由は親が確認した事実の記録であり、初回raw logが保存済みであるとは主張しない。後から初回ログを再構成して実測原本として補わず、最終pass reportとは区別する。

露光窓のfitやstrict holdを弱める変更、除外診断の成功扱い、比較入力の無断変更は認めない。新しい人間確認は技術検証・公開全検証後に行う。

## 正式captureの親実読結果と追加OFF対照

[before native capture log](before-native-capture.log)と[after native capture log](after-native-capture.log)を固定し、両側9条件×96frameを同一capture toolで取得した。親は実JSONを独立に読み、次を確認した。

- afterの認証8条件は全96frameで`strictFalse = 0`。
- film認証5条件は各hold72frameでbandの端到達・window fit・穴のassertionを実行した。
- 縦radius .2の既知診断条件は96frameのstrictFalseをそのまま保持し、認証8条件の成功数へ含めない。
- 追加[film/ticket OFF parity](film-ticket-off-parity.json)/[log](film-ticket-off-parity.log)も親が実読。14条件・各side70frameが一致。今回の修正をOFFにも新しい見え方を加えたものとは扱わない。

## 公開候補04の構成と容量監査待ち

公開候補は`review/AVOID-006/local-20261021-04/`。native MP4のみ18参照/15 unique、公開実ファイルは日英HTML・manifestを含め18 files/5,927,801 bytes。manifest SHA-256は`e86d1f4bbea73abd83ad0f9de89e6f8e8271bb30ce0f460dcd6207589058a2d5`。同一byteの動画共有を参照数/uniqueファイル数の削減として区別し、9組の比較数を減らしたとは扱わない。

容量を超えたPNG付き初稿は`draft-private-04/`と`draft-public-04/`へ非公開証拠として保持する。新しい公開候補はMP4・日英HTML・manifestだけを使い、native PNG/観測は非公開evidenceへ分離した。既存公開版のbyteやURLを削除・上書きする方式ではない。

その後[最終実Jekyll監査](pages-output-audit.json)はactualJekyllOutput/ passed:true、2,929 URLs/996,440,939 bytes、旧2,911 URL保持、10 manifest/2,883 asset参照で成功した。9coreと正式visualも完了したが、いずれも旧c3a候補の識別に紐づく。性能不合格からこの候補を公開せず、新candidateの成功へ流用しない。local playback・全公開検証は未実施。

## 実行環境と既存公開版到達確認

親の最新観測は環境revision172/observed172、current=true、unrestricted/enforced、connected。`environment-start.json`は開始時revision171/observed171のhistorical snapshotであり、最新172と同じ時点の記録とは扱わない。

親の通常sandbox curlは継承proxyの8080接続でexit7。その後、同じ継承proxy/CAとTLS検証を維持した`require_escalated`のcurlでは、既存正式03 manifestがHTTP200・`ssl_verify_result=0`となった。これは既存03への到達確認であり、今回修正版の公開成功ではない。proxy回避・TLS無効化を行ったとは記録しない。

## 正式性能gate不合格・修正調査

[正式performance.json](final-candidate/performance.json)と[raw log](final-candidate/performance.log)を親が実読。既定100/1000 cut、warmup3/sample6・stress有効を維持した実行はpassed:false。

| cut数 | planning factor（上限2） | 追加render（上限+3ms） | 結果 |
|---|---|---|---|
| 100 | 1.680124 | +4.5ms | render超過 |
| 1000 | 3.029502 | +9.5ms | planning/renderとも超過 |

入力同一・actualCountsValidはtrue。dense100/1000-region stressの決定性・128 unique budgetも成功しているが、性能の必須不合格を相殺しない。閾値を変更して合格にしない。

親は担当へ原因profileと、送り穴の測定geometryを保守的外接矩形へする修正調査を依頼済み。primary分類・実描画は不変とし、測定を省略して性能だけを通す変更は認めない。この時点の調査指示を受け、下記のrect-only診断とvalidationOnly payload修正へ進んだ。旧c3a正式不合格を後続の非正式診断で合格に置換しない。

## 軽量化の中間記録（非正式diagnostic）

最初のrect-only候補JAは`7e8947396e1d6fe61dd260169a0111fd70c6b8d595ac15774464af89fa29a9cb`。[planning diagnostic](planning-diagnostic.json)/[log](planning-diagnostic.log)はwarmup1/sample1・stress:false・runtimeProfile:trueで、正式gateの代替ではない。1000 cut planning factorは2.724265で未解消（100 cutも2.035501）。追加renderは100で+2.1ms、1000で−2.3msと改善したが、非正式結果から公開を承認しない。

[planning profile summary](planning-profile-summary.json)ではafter側のself timeがpush約12.42s、GC約8.07s、jsonClone約3.87s。これはこの診断条件のprofileであり、正式性能の最終値ではない。親は原因調査を踏まえた次の差分をレビュー済み。

- `validationOnly`で、明示的なfilm穴hintのある`rrect`だけ記録payloadを省略する。affine/scalar検査、`A.bounds`、draw-resource guardは残す。
- 不確かなshape/座標、明示`placementBounds`の処理、itemや他primitiveは省略しない。unsupported path、invalid radius/affine、4097 event等の拒否を維持する。
- validationOnly programの`measurementSupported:false`とreplay拒否は不変。validation passを実描画programや完全measurementとして使わない。
- 実recordでは全primary穴が残り、実描画は変えない。hintの状態は通常/例外ともtry/finallyで復元する。

### freeze候補とhint試験

最終freeze候補JA `fb876e83a68fdd2b7d31418b29191d81f413eb19c508a6b273fe2c3f4b44782b`、EN `f2240e533d8021c01f9162b7aea9de643b110176449c573a13e9e6e27cdc8442`。親は差分・試験log・source hashを実読確認済み。[hint/bounds試験report](film-hole-bounds-test.json)/[log](film-hole-bounds-test.log)はpassed:true。

48条件のうち46非空、計20,406 visible pixel、外接矩形outside0。前後RGBA一致、通常/例外のhint復元を確認した。negativeはbudget4097/radius/affine/unsupported path/explicit placementBounds/uncertain coordinates/item-other保持とvalidationOnly replay拒否がpass。これは穴の保守境界・validation passの契約試験であり、正式perf・9core・公開の成功を意味しない。

`makeEnv`欠落の初回試験は[初回log](film-hole-bounds-test-first.log)/[初回JSON](film-hole-bounds-test-first.json)へ、中間結果は`*-rect-only.*`と`*-payload-before-review.*`へ保存した。旧originalsとsnapshotも保持し、中間版の結果を最終freeze候補の試験と混同しない。最終候補のplanning診断は[実行log](planning-payload-diagnostic.log)で再実行中。

## fb876候補の正式性能も不合格

[optimized-candidate/performance.json](optimized-candidate/performance.json)/[raw log](optimized-candidate/performance.log)を親が実読。after JAは`fb876e83a68fdd2b7d31418b29191d81f413eb19c508a6b273fe2c3f4b44782b`。既定100/1000 cut・warmup3/sample6・stress:true、runtimeProfile:falseの正式実行はpassed:false。

| cut数 | planning factor（上限2） | 追加render（上限+3ms） | 結果 |
|---|---|---|---|
| 100 | 1.467417 | −2ms | 合格 |
| 1000 | 2.354051 | −2.7ms | planning超過で不合格 |

両入力同一・actualCountsValid:true、dense100/1000 stress決定性・128 unique budgetは通過。render改善と100 cutの合格を1000 planningの不合格解消として扱わない。閾値は不変。

担当は追加の最小計算最適化案を調査中で、修正・新hash・再実行の成功は未確認。core/capture再確認は停止し、公開は未実施。旧c3a正式失敗、rect-only非正式diagnostic、fb876正式失敗を別の候補/設定の履歴として保持する。

## 判定

c3aとfb876の両候補とも正式性能不合格で公開しない。旧04 capture/manifest e86d・visual・9core・Jekyll成功はc3a候補の履歴で、新候補の受入へ自動流用できない。追加最適化は調査段階で、親の差分レビューと正式性能合格後にcore/capture/local/公開の再確認範囲を確定する。技術的不合格を人間へ判定させず、006実装中・人間OK/完了未判定を維持。他6新例の回答も推定しない。

## 追加履歴：immutable snapshot共有案の試行と撤回

試行候補JAは`751b48fb3fe634156a845d1515df39db82d99698ed4a05bea2678c153a0d9d69`。[immutable focused試験](immutable-snapshots-test.json)/[log](immutable-snapshots-test.log)は14 eventsでpassed:true、親レビュー済み。6 shared pairs、nested freeze、元source objectの可変性、既定event mutationの独立、restore/reset/sweep変更時の無効化、hint OFF非共有、全event値一致と共有値mutation拒否を確認した。これは試した共有契約の証拠で、性能gateの合格ではない。

[短い非正式planning診断](planning-immutable-diagnostic.json)/[log](planning-immutable-diagnostic.log)はwarmup1/sample1・stress:false。planning factorは100 cutで1.918361、1000 cutで1.946072だったが、前後の実行環境差があり、親は明確な改善とは判定しない。この数値を正式perfや再現性のある改善証明へ置換せず、この候補の正式perfは未実行のまま保持する。

[candidate-profile-immutable.json](candidate-profile-immutable.json)/[log](candidate-profile-immutable.log)は43 validationOnly callsに対し、共有opt-inの働くfull recordが1回と示した。共有案の効果が届く範囲は限定的で、focused試験の成功だけで複雑さに見合う利益があるとは判断しない。

親は利益の乏しいimmutable共有案を撤回し、fb876ベースで穴prepassのsource-owned batchを検討/実装する方針へ移行した。担当がsourceを変更中で、batchの成功・新hash・正式perf/core/capture再確認はまだ判定していない。751b試行とc3a/fb876の旧正式不合格は別履歴として残し、公開・人間確認へ進めない。

## 追加履歴：source-owned穴prepass batchの親レビュー

immutable共有案は撤回済み。fb876ベースからのbatch候補はJA `b81d12ee0ad091934330822e36dfbe03ce2114bae3e90aa2a7b903e364decf96`、EN `39dc53fa5c121ada921f1c87be9738815463fe27eb4d3fec5896c7e1077ef224`。親が差分・[focused13case report](film-hole-batch-test.json)/[log](film-hole-batch-test.log)とtool SHA-256 `b72529d2f81ddfc88d039ecfe232d13297f2889faabeee50be5c5a25ff97233e`を実読照合した。

対象はvalidationOnlyでfilm穴のsource-owned batchだけ。matrix/affine等の同一検査を共通化し、scalar/radius/予算の各行検査を残す。通常full recorderにbatch hookはなく、全primary穴・描画・measurementSupported/replayの契約を変える変更ではない。不確かな値、他primitive、明示boundsとエラーの優先順を維持する。

親は当初案のallrows事前allocationがresource budgetに到達する前に巨大確保し得る点を指摘し、128 row chunkへ修正させた。最終focused試験は13条件すべて同じprogram/diagnostics、row不変を確認。極小pitchは4096 rows生成・32 chunks・maxChunk128でGEOMETRY_LIMITを早期拒否し、全量事前確保を認めない。

初回には共有measurementContextの状態を誤って用いた試験があり、[初回JSON](film-hole-batch-test-initial-identity-context.json)と[初回log](film-hole-batch-test-initial-identity-context.log)を保持する。独立Canvasでsingular transformを実際に設定し、実行された拒否をassertするよう修正した。[chunk assert修正前の中間記録](film-hole-batch-test-before-chunk-assert.json)も保持し、最終13caseの結果へ置換して隠さない。

[単発batch profile](candidate-profile-batch.json)/[log](candidate-profile-batch.log)では43 prepass合計が前の約60.3msから約41msへ変わり、geometry入力とPNG hashは同一。これは非正式の単発profileであり、正式100/1000性能gateの合格・安定改善を示すものではない。無profileの短い[planning batch診断](planning-batch-diagnostic.log)は進行中。正式合格、新candidateのcore/capture/local/公開再確認はまだ確認していない。

## 追加履歴：batch短診断とticket prepass負荷の調査

[planning-batch-diagnostic.json](planning-batch-diagnostic.json)/[log](planning-batch-diagnostic.log)はwarmup1/sample1・stress:false・無profileの短診断。100 cut planning factor1.532771、1000 cut1.968552、追加renderは−2.6/−3.2ms。正式設定の再実行ではなく、この単発結果で全体が十分改善したとは判定しない。正式100/1000 gateはまだ再実行していない。

[layout-profile-batch-v2.json](layout-profile-batch-v2.json)/[log](layout-profile-batch-v2.log)はafter1000 cutのみ・warmup0/sample1・instrumentedの非正式調査。ticket prepassは5,375 calls/約5.696s/295,625 events、film prepassは6,125 calls/約3.076sで、ticket側にも大きい負荷があると示した。計測のoverheadを含む1回のprofileであり、正式値や改善保証へ置換しない。

初回はalias経由の処理を捕捉できなかった。[初回JSON](layout-profile-batch.json)/[log](layout-profile-batch.log)/[tool](layout-profile-batch-v1-tool.cjs)をそのまま保持し、捕捉漏れを処理時間0の証明にしない。v2では`planAdaptiveComposition`を捕捉するよう修正した。

親はticketの`validationOnly && 確実なshape`に限りnon-item payload複製を省く案を承認し、実装担当が変更中。scalar/affine/bounds/resource budgetの全guardを維持し、uncertain shapeは元の完全な処理へfallback、通常full recordでは全図形を残す。実描画やprimary分類を変えず、測定の過小評価・guard省略で性能を通さない。新候補のhash・focused試験・正式性能合格はまだ判定していない。

## 追加履歴：ticket prepass focused試験とwarm診断

正式再試行対象はJA `a3c4d0e3c76994033910d61711180787576a0bec938d397da8425c37b8124ba7`、EN `3d1eb2dcb69f81ca3b86879720d7595aae683bec551a7e24380ffa2e9ef4deeb`。親は[ticket-prepass-test.json](ticket-prepass-test.json)/[log](ticket-prepass-test.log)の8case、source hashとtool SHA-256 `394e52b34fac0f075963ebc844c22ca4b0cb8d7b2116c76e3bad7006d39de68f`をレビュー/照合済み。

guard/diagnostics・通常full program・trajectory・native PNG3枚の一致を確認した。prepass item比較ではnon-item省略によって変わる絶対`order`値だけを除外し、item自体と相対順序を保つことを確認する。prepass31 calls/candidate full2 callsは前後同じ。payload省略を実図形・primaryの削除やguard免除へ置換しない。

最初の[cold before profile](candidate-profile-ticket-before.json)/[log](candidate-profile-ticket-before.log)と[cold after](candidate-profile-ticket-after.json)/[log](candidate-profile-ticket-after.log)では、時間改善を確認できなかった結果を保持する。単発cold timingから成功を宣言しない。

続く[warm before診断](candidate-profile-ticket-repeat-before.json)/[log](candidate-profile-ticket-repeat-before.log)と[warm after](candidate-profile-ticket-repeat-after.json)/[log](candidate-profile-ticket-repeat-after.log)はwarmup3/sample6、各sample20 records。before mean20.1667ms/median20.10ms、after mean12.3667ms/median11.65ms、記録payload eventsは6,600→720、itemは保持した。この繰返し条件でprepassの効能を確認し正式再試行の根拠としたが、component診断を全体の正式性能gateへ置換しない。

親は標準設定の正式性能試験を1回再実行することを承認した。100/1000 cuts・warmup3/sample6・stress:true・profile:falseで[final-candidate-v2/performance.log](final-candidate-v2/performance.log)へ実行中。正式合格はまだ未確認、core/capture/local/公開の新候補再確認も未完。c3a/fb876の正式失敗、非正式diagnostic各版とcold未改善を保持し、人間確認や公開受入へ進めない。

## a3c4候補の標準正式性能gate合格

[final-candidate-v2/performance.json](final-candidate-v2/performance.json)/[raw log](final-candidate-v2/performance.log)はpassed:true。親は実JSONを読み、after JA `a3c4d0e3c76994033910d61711180787576a0bec938d397da8425c37b8124ba7`、tool SHA-256 `5b2bcc774fa963b6e764c1f84c08a6f0e258c2a7be20216720fbdac485742bf0`を現物と照合した。設定は標準100/1000 cut・warmup3/sample6・stress:true・runtimeProfile:falseで、閾値を変更していない。

| cut数 | planning factor（上限2） | 追加render（上限+3ms） | 結果 |
|---|---|---|---|
| 100 | 1.44605149 | −2.5ms | 合格 |
| 1000 | 1.96455410 | −1.4ms | 合格 |

1000 cut planningP95はbefore14,145.5ms/after27,789.6ms。入力同一・actualCountsValid:true、dense100/1000 stress決定性/128 unique budgetも通過した。この候補のこの正式実行の合格であり、cold planningが即時になるとの意味や全実行/環境の性能保証へ広げない。旧c3a/fb876の失敗、各非正式診断とcold未改善の履歴は保持する。

新候補に対応するnumeric21・9core・864frameの再確認、正式05 pack、local playback・公開全検証は進行または未実施。親の後続結果レビュー後に正式05の依頼を用意する。旧04 manifest/capture/visual/Jekyll等の証拠は旧c3a候補のまま、新候補受入へ自動流用しない。006実装中、人間受入未取得、公開未完を維持し、他6新例の回答も推定しない。

## 正式05 pack完了・新候補の機能/数値/864frame確認

公開候補`local-20261021-05`の[manifest](../../../../review/AVOID-006/local-20261021-05/manifest.json) SHA-256は`7eaf816ec97d1d9560b59ee8e15871181061ad72aa3333947553aea78690daa2`。9組/18 native MP4参照・15 unique、公開18 files/5,928,462 bytes、private121 assets。[旧04 manifest](historical-public04-manifest.json)/[status](historical-public04-status.json)は未公開perf失敗候補の履歴として分離し、現行案内は[05 draft](../../../reviews/AVOID-006-local-20261021-05.md)へ移す。

- after a3c4をfresh9×96＝864frame取得し、旧c3a対応native PNG hashと全一致（[optimized-after report](optimized-after/report.json)）。before8193の元撮影は再利用。05 manifestへ新旧の取得元・比較数・hashを明記した。
- [新9core summary](final-candidate-v2/fixtures/functional-summary.json)は全exit0、[親hash review](final-candidate-v2/parent-functional-hash-review.json)で98filesを照合。
- [親numeric21独立review](parent-numeric-review.json)は認証20/診断1、band hold68 samplesの端交差・露光比率/strict geometry・pixel監査を独立に確認した。縦r.2は認証へ数えない。
- 正式性能v2は既述の標準gate合格。新fresh864frame一致に対応するvisual addendumは別担当進行中で、旧visualの実見元はc3aのまま区別する。

local/native54 playback、新05のPages/公開全検証と人間受入は未完。旧04のJekyll成功を05の新監査に置換しない。旧18のみ人間受入を保持し、他6新例の回答・既知保存failureの成功を推定せず、007以降未着手・既定017/補助018未完を維持する。

## 公開前05：visual接続・実Jekyll完了、local導線再検証待ち

[visual final addendum](visual-review-final-addendum.md)/[ledger](visual-review-final-ledger.json)が完了。新a3c4と旧視認c3aの全864 native PNG hash、公開/private計141 assetsの実hash、旧実見after75 samplesのケース/時刻対応を独立照合した。追加画像閲覧・decode・再生は実施しておらず、旧実見範囲を同一画像の新候補へ機械的に接続する証拠。旧04 manifestの視認経路も保存し、全frame目視/実時間再生/人間OKへ拡張しない。

新05の公式Jekyll初回は[ENOSPC log](final-pages-jekyll.log)を保持。今回生成raw report2本だけをgzip展開bytes完全一致で確認してから解放し、170,129,638 bytesを空けた。[raw-report-storage-release](final-candidate-v2/raw-report-storage-release.json)にraw/encoded hash・bytesを保存し、gzipによる完全復元性を維持した。旧証拠や公開物を削除したものではない。

[retry01 log](final-pages-jekyll-retry01.log)はexit0、[final-pages-output-audit](final-pages-output-audit.json)はpassed:true/actualJekyllOutput:true。2,929 URL/996,446,620 bytes、旧2,911 URL・VERIFICATION/config保持、10 manifest/2,883 assets参照を検査した。旧04の996,440,939 bytes監査とは候補を区別する。完全監査後、今回生成した再現可能outputだけを容量確保のため削除し、immutable source/projection/log/完全auditを保持した（[output-storage-release](final-pages-output-storage-release.json)）。

[local05初回01](local05-validation-01.json)/[log](local05-validation-01.log)は54 native frame確認・after864 parity mismatch0後、local HTTP URLへのpage.gotoがERR_HTTP_RESPONSE_CODE_FAILUREで失敗、playback0件。再検証待ちであり、動画再生/標準UIの成功を主張しない。

[環境178観測](environment-network-178.json)はobserved178/current:true/connected/unrestricted-enforced。継承proxy/CA/TLS維持の通常HTTPSで旧03 manifest HTTP200/TLS0/hash一致。これは既存版到達のみで、新05の公開成功ではない。公開全検証と人間の受入は未完。

### local05初回失敗の原因と06 repack方針

親はlocal static serverのdirectory/index.html routing欠落を確認し、指定実装担当へtool修正を依頼した。native54 frame/after864 parity一致は成功、動画は未到達でplayback0。05失敗履歴は保持・未公開のまま、旧05 publicはunstageして新06へrepackする。製品a3c4・元engine/captureは不変のため、親判断でcore/perf/captureの再実行は不要。06のmanifest/Pages監査/localはpack後に確認し、新公開成功はまだ主張しない。06の確認依頼草稿もpack後に用意する。

## 06 freeze・local HTTP handler承認と再検証開始

06 manifest SHA-256 `4a8485524c9d8112a148434630e457c3dfef13c7b8e08d3788a8f7deb69fca9c`、validator `56ce799440ac44da501b936455b97d70455ef6d26fc5702b5b25cae161bc4954`。9組/18 native MP4参照・15 unique、公開18 files/5,928,462 bytes/private121 assets。製品JA a3c4/EN3d1eは不変、同before/optimized-afterを再利用し、再撮影・core/perf再実行は行っていない。05失敗履歴は保持し、現行案内を[06 draft](../../../reviews/AVOID-006-local-20261021-06.md)へ移した。

親はhandler差分のdecode URL→root境界確認→directory/index.html解決→境界再確認をレビューし、[HTTP9case receipt](local-static-routing-test.json)/[log](local-static-routing-test.log)を実読して承認。404/不正encoding/root外pathも検査し、製品・MP4・公開fetch・判定閾値は不変。独立visualへ06hash接続を依頼済みで、親は画像を開いていない。

06 local全検証（54 native frame/18参照playback/UI）は開始済み、まだ成功とは記録しない。新Pages監査・公開全検証・人間受入も未完。旧05監査/visual接続と新06で必要な確認を区別する。

## 06 local seek失敗の履歴（07 pack前の診断待ち）

[local06-validation-01.json](local06-validation-01.json)/[log](local06-validation-01.log)はpassed:false。native54 frame確認・after864 PNG parity mismatch0・raw20 asset確認は成功したが、最初のvideo seek target2.6秒に対してseekedAt/currentTimeが0、decodedAfterSeek:nullでtimeoutし、playback完了0件。これを動画再生成功や全local検証成功へ置換しない。

[修正前probe](local-media-probe-before.json)の実測はRange要求にHTTP200で全427,940 bytes、MIME/Accept-Ranges未明示、seekable[0,0]/seek2.6失敗。Content-LengthはNodeが427940を自動付与しており、Length欠落が実証されたとは扱わない。MIME/Range応答を修正対象とし、担当が修正前の単体診断→修正→18参照/UIだけの診断（native再描画なし）を実施中。診断/修正結果はまだ未確定、07 pack前に親がレビューする。製品a3c4・既存MP4と以前のnative証拠は固定し、05/06失敗ログは保持。新07のpack・公開と全検証は未実施。

## transport修正承認・07 freezeと正式local検証開始

親はlocal限定MIME/Range対応をレビュー承認。[修正前probe](local-media-probe-before.json)のRange要求HTTP200全427,940 bytes/seekable[0,0]から、[修正後probe](local-media-probe-after.json)はHTTP206/Content-Range/明示video/mp4/seekable[0,4]となり、2.6秒seek後のdecodedを確認した。修正前もNode自動Content-Length427940はあり、Length欠落とは扱わない。製品/MP4/公開fetch/判定閾値は不変。

[local06-media-diagnostic-01](local06-media-diagnostic-01.json)は18参照のplay/pause/decoded seek/endedと日英desktop/mobile UIに成功、minDecoded92/drop計21/corrupt0。ただしnativeFrames:0、diagnosticOnly:true/diagnosticPassed:true/passed:false/acceptanceComplete:falseであり、正式合格や完全な滑らかさを意味しない。05/06の正式local失敗は保持する。

07 [manifest](../../../../review/AVOID-006/local-20261021-07/manifest.json) SHA-256 `6934ae9a57215ce8583f1a291fb59f325ba9411b0bcddb33141b74aba6305c20`、validator `bfee0b0ce8a4df0e8dac200bebb648ef5046761cbdcd4b443b33934144049f71`でfreeze。公開18 files/5,928,462 bytes、9組18 native MP4参照/15 unique。製品a3c4/EN3d1e・同before/optimized-afterは不変、親判断でcore/perf/capture再実行不要。[07確認準備稿](../../../reviews/AVOID-006-local-20261021-07.md)を作成し、旧05/06 URLを現在の確認依頼に使わない。

07の正式local54 native/18参照playback/UI、独立visual hash接続は進行中。[環境180](environment-network-180.json)はactual/desired180・observations_current:true・connected・unrestricted/enforced。新Pages/公開全検証・人間受入は未完、006実装中を維持。旧18のみ受入/他6未回答、007以降未着手・既定017/補助018/保存013既知事項は不変。

## 07正式local・独立visual接続完了（2026-10-22 JST記録、公開前）

- [07正式local結果](local07-validation-01.json)/[log](local07-validation-01.log)は2026-10-21 22:37 JST作成、passed:true/diagnosticOnly:false/acceptanceComplete:true。凍結manifest `6934ae9a57215ce8583f1a291fb59f325ba9411b0bcddb33141b74aba6305c20`・validator `bfee0b0ce8a4df0e8dac200bebb648ef5046761cbdcd4b443b33934144049f71`を実結果と照合。raw20 assets/native54再描画/after864 PNG parity mismatch0、18参照のplay/pause・2.6秒decoded seek・endedが成功した。minDecoded92/drop計5/corrupt0で既定gate合格、完全な滑らかさの保証にはしない。日英desktop1280×900/mobile390×844の同時再生・停止/幅確認を通過してからpassed:trueとなるvalidator経路も確認した。
- [07 visual addendum](visual-review-07-addendum.md)/[ledger](visual-review-07-ledger.json)は独立solによる公開20/private121 assetsの実hash照合済み。06とMP4 15/PNG54 assets相違0、9条件/来歴一致で、旧実見after75 samplesとnative864frame一致の接続を継承した。追加画像閲覧/decode/再生なし、親も画像を開いていない。全frame目視や人間承認を意味しない。
- 新07のPages監査・公開全raw/再生/日英実描画と人間の見え方確認は未完。[07準備稿](../../../reviews/AVOID-006-local-20261021-07.md)へ現物結果を同期。05/06正式local失敗・06診断は別履歴として保持し、006実装中、旧18のみ受入/他6未回答、007以降未着手・既定017/補助018未完を維持する。保存013のexpected0/actual1既知failureを成功へ置換しない。

## 再開環境187と07公開前の検証範囲（2026-10-22 JST）

[再開環境187](resume-environment187.json)はspec/observed187一致・observations_current:true・connected/running・unrestricted/enforced。継承proxy・既定CA/TLS検証を維持した通常HTTPSで旧03到達HTTP200/TLSverify0を確認した。旧版到達と新07公開検証を区別する。製品/素材/凍結validator不変のため、親は既存07正式local成功を採用しcore/perf/native/playbackを再実行しないと判断。07公式Pagesイメージのoffline/read-onlyビルド・出力監査は進行中で、新公開全hash・18参照再生・アプリJA/EN起動/実描画は今後の必須確認として残す。

## 07公式Pages監査完了・実環境検証待ち（2026-10-22 JST）

[07実Jekyll log](pages07-jekyll.log)は公式imageのoffline/read-onlyビルド成功（3.053秒）。[07出力監査](pages07-output-audit.json)はpassed:true/actualJekyllOutput:true、2,929 URL（旧2,911保持）、10 manifest/2,883 assets、996,446,620 bytes。projection SHA-256 `390363475ba5326cf2d4a2036c69d0a479ddc5934f016e8e70c0f32235aa018b`、config `a06ab85fc12f54c1b1b2dc0ece8fdbd5db935f3529ba4272839cef28674d8709`。旧05監査の流用ではなく07現物の監査である。

07正式local/独立visual接続/公式Pages監査が揃い、状態を実環境検証待ちへ更新。commit/push・新07公開raw全hash/18参照再生/アプリJA・EN起動と実描画、人間の見え方確認は未完。公開前の成功を公開済みへ置換せず、旧18のみ受入/他6未回答・保存013既知failure・後続未着手を維持する。
