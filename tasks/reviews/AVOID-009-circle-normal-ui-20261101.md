# AVOID-009: 通常 UI の円回避（2026-11-01 再開）

公開版は `37f57f309a167e1b363f2a96d6338387eb1917e0`。この記録の変更は、保持期に影響する chroma / shake の時間窓、元描画で残像を持たない Swiss の所有物、縦 Ruby の連動した拡縮・移動を、既存の描画式に合わせる。入退場中の一時的な円通過は許容し、元の部品や効果を削除しない。

親は差分と実描画式をレビューし、現時点で重大な過小評価を確認していない。既存の境界テスト69件、歌詞パーサー、D の既存 admission テストを通過した。証拠は Git 外の `/workspace/jizura-logic-evidence-20261027` に保持する。

ローカル構築版の HTML SHA-256 は `e6c3bac1855fff79151d9c86c2a7796dd3908155d6a0447ac8d5541354c85b9a`。通常 UI で既定サンプル歌詞・中央回避 ON・1行目の2カット目を選び、保持中の代表時刻を観測した `normal-ui-e2e-local-part1-batch-hold-actual-20261031-05` では、center / neon / pill / magazine / vcols / ticket / labels の7演出が表示され、対象 cut を除いた比較で円内の画素差は0だった。Swiss Grid は回避配置を見つけられず、成功には数えない。観測された複数矩形 clip は同じ raw を用いて別途照合した。

この結果は固定入力・代表時刻の限定確認であり、文字の最終画素での完全な可視性、全演出・全条件、公開版の本変更は未確認。通常 UI の全演出一括走査と公開版 E2E が残る。Swiss は現在の保守範囲を平行移動する限り配置候補がなく、元の字号や構成を勝手に変更しない。

## 追加確認

上記 HTML を含む `e5dffb6ce1b81fb10260ba30a3f4dc51823bdd87` が Pages に反映された。公開版の通常 UI で同じ歌詞・設定・代表時刻を確認し、上記7演出で対象 cut の描画呼出しを観測し、対象 cut のみを除いた比較で円内の画素差は0だった。Swiss Grid は配置不成立。複数 clip と bloom の一部は観測器の判定対象外であり、全時刻・全文字の最終画素の可視性はこの結果から確定できない。記録は Git 外の `normal-ui-e2e-public-part1-batch-hold-e5dffb6c-actual-20261101-01`。

同一版の通常 UI で固定サンプル・先頭行の最初のカットを全184演出について一括走査した。中心軌道の例外7件を除く177件の内訳は、配置計算が成立9件、広い viewport の支持範囲では配置を見つけられない163件、条件未対応2件、20秒以内に準備状態を観測できなかった3件。9件は配置計算の結果であり、実描画の円外確認や全文字表示の合格数ではない。中断した前半92件と残り92件の記録はそれぞれ Git 外の `normal-ui-all-layouts-actual-20261101-01`、`normal-ui-all-layouts-resume-actual-20261101-01`。一時的な容量不足による前半の停止後、試験側の作業用コピーを保全の上で整理し、再開分では重複走査していない。

全 viewport の対角候補と mixed の文字別支持の試作を6演出でまとめて確認したが、いずれも通常サンプルで配置不成立のままだったため採用せず戻した。mixed の追加診断では、所有する装飾の保守範囲と光の余白が配置を制約していた。記録は Git 外の `normal-ui-e2e-local-part0-six-hold-actual-20261101-01` と `normal-ui-mixed-diagnostic-actual-20261101-01`。係数や所有物を削って合格にはしていない。

追加のローカル試作 `f8a51ded` は stack の文字・輪郭・装飾を個別に扱う。通常 UI の先頭カットと、歌詞を「明日へ続く道」に変更した後の先頭カットで、それぞれ文字描画を観測し、対象 cut を除いた円内画素差0を確認した。記録は Git 外の `normal-ui-e2e-local-part0-stack-headlinedeck-hold-actual-20261101-01` と `normal-ui-e2e-local-part0-stack-replace-prefix-hold-actual-20261101-01`。保持期の代表時刻だけの確認で、全歌詞・全時刻の合格ではない。未 push・未公開。

通常 UI の ON/OFF を比較すると、同じ tile の source area は ON で高さ0.245、OFF で0.3898096377769716となった。旧自動配置の中央 blocker が新しい円回避より前に適用されるためで、字号や反復背景の維持を評価する際に無視できない。記録は Git 外の `normal-ui-e2e-local-part0-tile-source-area-compare-actual-20261101-01`。反復背景の位置を保つ role 別描画と OFF 相当領域を使う試作は、通常サンプルの marquee/tile の双方で配置不成立だったため製品へ採用せず戻した（`normal-ui-e2e-local-part0-marquee-tile-sourcearea-actual-20261101-01`）。stack についても OFF 相当の字号維持は未確認。

## 未公開の共通経路の修正と通常 UI 観測

旧 blocker を適用する前の自動領域と、対応する layout params を入力時に保持し、新円回避がその領域から再計画する差分を試作した。手動・ロック・強調・明示サイズ等は従来の境界を維持し、反復背景は主歌詞と分離する。これは上記の不採用試作の再実行ではなく、通常 UI の共通入口へ接続した別の未公開差分である。

旧版で切替中に `UNSUPPORTED_MEASUREMENT` と表示された例外は、他 cut の数値 `treatP.dir` を配列として展開した TypeError と確認し、扱いを修正した。旧表示だけでは字体エラーと断定できなかった。修正後の center→vcols→stack→contents の通常 UI 連続操作では同例外は再現しなかった。

同一セッションの既定サンプル・先頭カット・保持中の1時点では、center と vcols はそれぞれ全6文字の描画呼出しを観測し、対象 cut のみを除いた最終描画との差は円内0画素だった。center は OFF 時と同じ字号 101.989... を保ち、2行に再配置した。UIで歌詞を「明日へ続く道」に変更した center の先頭 cut 「明日へ」も、3文字の描画呼出しと同じ1時点の円内差0を観測した。stack は既定サンプルが不成立、変更後先頭 cut は同様の1時点で円内差0。vcols は変更後先頭 cut が不成立、contents は両条件とも不成立だった。未観測の効果・所有物や全時刻、その他演出についてこれらの結果を流用しない。記録は Git 外の `normal-ui-e2e-local-part0-four-final-local-actual-20261101-01`。

既存の184演出走査で bulbs / burst / dominoes の3件を準備時間20秒超と推定してはならない。同試験は `simplePrepared` のみを待っており、別の legacy session が担当する場合に対応していなかった。実際の UI 経路と描画結果の確認が必要である。

実際に3演出を通常 UI で選択して経路別状態を確認すると、bulbs は `BULBS86BX_UNSUPPORTED`、burst は `BURST83BD_STAGE_REQUIRED`、dominoes は `UNSUPPORTED_ADAPTER` で、それぞれ未対応表示となった。いずれも legacy 経路で、観測した準備時間は約0.2秒。準備時間超過ではなく通常設定への接続・成立条件が残っている。実描画や円外確認の合格には含めない。記録は Git 外の `normal-ui-three-routes-actual-20261101-01`。

下部テロップの既存 source sweep と主文字・帯・ラベル・装飾の所有範囲を共通入口に接続した。方向の同点は形の適性、正規化移動量、前方向の順に比較する。通常 UI の同じ先頭 cut・保持中1時点では center / vcols / lowerThird の文字描画を観測し、対象 cut を除いた円内最終画素差はそれぞれ0だった。実測の準備計算はこの環境・入力で順に約113 / 92 / 155 ms。stack と contents のサンプルは配置不成立であり成功に数えない。これらは公開版ではなくローカル確認で、記録は `normal-ui-e2e-local-part0-five-integrated-actual-20261101-01`。

電球・ドカンの通常入退場、保持、Memphis を想定した所有部品別 viewport 支持を別試作し、通常 UI の既定歌詞と変更後歌詞でまとめて確認した。両演出とも配置候補を見つけられず、成功数を増やせなかったため製品経路から外した。試作と結果は Git 外の `normal-ui-common-wip-20261101` および `normal-ui-e2e-local-part0-bulbs-burst-new-actual-20261101-01` に保持する。候補探索の不成立は物理的に不可能という証明ではない。

共通入口の変更後、通常 UI の184選択肢を route 別に1セッションで走査した（HTML SHA-256 `fd6a22f7df13974de630758c37fb737d1260e17d56bb0b8aaf68448be08bc204`）。中心固定例外7を除く177件は、配置計算成立6、不成立166、条件未対応2、専用経路で未対応3。計算成立は描画合格ではない。旧公開版で成立していた condensed / ticket / neon / magazine の4件はこの版で不成立となり、lowerThird が新たに成立した。旧版の成立9件から回帰しているため、この状態を公開版としては採用しない。記録は `normal-ui-all-layouts-routes-elapsed-actual-20261101-01`。旧自動配置の条件を維持する共通 fallback を追加し、成立時は自動調整された文字サイズを UI に示す修正を検証中。

共通 fallback を追加したローカル版では、旧版から回帰していた condensed / ticket / neon / magazine の先頭 cut が再び成立し、通常 UI の保持中1時点で対象 cut の円内画素差0を確認した。frameBox も同条件で円内差0、quote は全画面の再描画が円外64画素で不一致だったものの、円内の UI–比較画像差と対象 cut の有無の差はいずれも0だった。元の公開版で確認済みの別 cut の center / neon / pill / magazine / vcols / ticket / labels も計算成立し、保存済みの円内限定比較では各々 UI–比較画像差と対象 cut の有無の差が0だった。全画面の比較条件は円外の微小差で不一致となり、文字・clip の一部は既存観測器で未解決のままなので、全時刻や全文字の完全性へは拡張しない。記録は `normal-ui-e2e-local-part0-eight-final-fallback-actual-20261101-01` と `normal-ui-e2e-local-part1-seven-preservation-actual-20261101-01`。

自動領域を再試行した場合はプレビューと出力の通知に文字サイズの自動調整を明記し、明示 contentScale・手動・ロック等では候補を作らない。反復背景の位置とサイズを保つため marquee / tile は旧領域への再試行をしない。これらの試作再改行は通常 sample の不成立を解消できず、製品差分から取り下げた。

part1 の7演出の保存済み paint を再解析したところ、clip を適用しない保守矩形でも観測された各描画呼出しは円外だった。「覚えてる」の各字の呼出しは全7演出で順に観測され、pill / vcols / ticket の coverage 未解決は複数の clip 分片による重複呼出しが一因だった。ただし clip 後の全文字の完全な可視性までは確定していない。MP4 / PNG 出力については実エンコードせず、`autoSizeCuts` の通知が描画開始前に呼ばれることを両 export 関数のスタブ試験で確認した。

旧自動領域 fallback 追加後、通常 UI の184選択肢を再集計した（HTML SHA-256 `88b4ebac3925956ce753ad0d21cceff3d3e4acdf31498c78d71c3ed0b8079e99`）。中心固定7件を除く177件のうち、配置計算成立15、不成立157、条件未対応2、専用経路未対応3。旧公開版の9件より6件増え、旧成立9件は計算上維持された。ただし成立15件を描画・安全確認済み15件とは数えない。記録は `normal-ui-all-layouts-fallback-actual-20261101-01`。この後に追加した typography provider は、この集計には含まれない。

共有した文字・行・枠の支持を追加した後、通常 UI の同じサンプル・先頭 cut・保持中1時点で、tyMargin / tyBaseline / zigzag と ruler / tyJustify / tyRuby / gridCells / genkou の計8演出は文字・付属物の描画呼出しを観測し、対象 cut の円内最終画素差0だった。tyMargin は元の自動サイズ、残り7演出は通知付きの従来自動サイズを使用した。corners / staircase は配置不成立である。記録は `normal-ui-e2e-local-part0-five-structure-actual-20261101-01` と `normal-ui-e2e-local-part0-five-expanded-actual-20261101-01`。先の全選択肢集計で不成立だった5演出のうち3件と、次の5演出が追加成立したが、この集計は変更影響範囲の個別再試験を旧一括結果に対応づけたものであり、全時刻や他条件の保証ではない。

物体・番号の13条件について、通常 UI から登場/退場カット・保持still・装飾なし等を指定し、既存支持とpost補正を接続した試作を確認した。12件は `NO_SAFE_SOURCE_SWEEP` 等の不成立、bookSpine はclip条件未対応で、部品別経路の成功は観測されなかった。この試作は製品差分から外し、記録とソースを Git 外に保持した。再現入力で不成立だったことで、他条件でも不可能と断定はしない。記録は `normal-ui-cobjects-numbered-post-actual-20261101-01`。

Bの共通構造では kanjiFocus が通常サンプルの保持時点で文字描画と円内差0を確認した。一方 columnsBig / halfVertical / typeSpecimen は不成立であり、効果の得られない縦書き支持の試作は外した。次の typography / editorial 共通化では tyIndexTable / tySquare / tyLineFocus / footnote / proofread の5演出が同じ通常サンプルの保持時点で円内差0だった。footnote は円外97画素の再描画差があるため、UI–比較画像と対象 cut 有無の双方が円内0という限定比較である。記録は `normal-ui-e2e-local-part0-b-four-actual-20261101-01` と `normal-ui-e2e-local-part0-five-tynotes-actual-20261101-01`。

さらに文字装飾・UI部品・番号など13演出を通常 UI の同一サンプルでまとめて観測した。tyFullTrack / tyStatCount / chat / numbered は保持時点の描画呼出しと対象 cut 有無の円内差0を観測した。notification は UI と比較画面の円外26画素が異なり、円内限定では UI–比較画面と対象 cut 有無の差がともに0だった。tyVRuler / tyScaleSteps / searchBar / keycaps / poster は候補不成立、bubbles は独立した背景粒子の位置を保つため未対応だった。slotMachine / flipBoard では新 provider の範囲集計が2頂点を矩形として渡す実装ミスを起こしたため、4頂点に修正し再確認を要する。この結果は保持中1時点の観測であり、独立粒子の完全性、全時刻、他の入力や全 cut の合格を示さない。記録は `normal-ui-e2e-local-part0-thirteen-integrated-actual-20261101-01`。

上の5演出では各主歌詞文字と、番号・線・ラベル・吹き出し等の呼出しも観測した。ただし tyFullTrack / chat の主文字、および numbered の番号・ゴーストには clip を伴う呼出しがあり、観測器は clip 後の完全な可視性を判定できない。残る2演出でも全付属物の欠落がないことは未監査である。

保存済み main paint の TextMetrics、変換行列、矩形 clip を後から照合したところ、tyFullTrack / chat の「色」「を」は主文字 ink 矩形全体を含む clip 内で呼び出されていた。numbered の主文字6字は局所 clip なし。3演出とも観測した ON の主文字 ink 矩形は viewport と画面内に収まり、該当時点で明確な主文字の切断は見つからなかった。これは記録された矩形の照合であり、OFF 側・別時刻・全付属物の完全性の証明ではない。

既存支持の接線候補と mixed / scatter / B セルの試作を一括で再確認した。corners / staircase / tyVRuler / tyScaleSteps / searchBar / keycaps / mixed / scatter は引き続き配置不成立だった。slotMachine / flipBoard は範囲集計の例外が解消したが、配置不成立だった。ticket は同じ移動量を保ち、保持時点の円内差0を確認した。対象条件で成立例を増やせなかった試作は製品差分から取り下げ、ソースと結果は Git 外の `normal-ui-common-wip-20261101` と `normal-ui-e2e-local-part0-tangent-mixed-eleven-actual-20261101-01` に保持した。これらは限られた通常サンプルでの結果で、別条件の可能性を否定しない。

Memphis は少数の実図形に対して bbox 変動の保守枝が多数あり、既定 mixed では歌詞だけなら候補がある一方、所有する Memphis の支持が移動を制約していた。入退場を除いた主描画の保持時に完全な文字 bbox を使う試作を行ったが、通常 UI の corners / staircase / mixed / scatter は引き続き不成立だった。対照 zigzag は同じ移動量を維持し、cut 全体の時間を基準に選んだ3時点で円内差0。文字ごとの入場遅延が残る可能性があるため、これを全文字が入場を終えた保持区間の境界確認と数えない。試作は不採用とし `normal-ui-common-wip-20261101/main-hold-trial-final.patch` と `normal-ui-e2e-local-part0-decor-hold-boundaries-actual-20261101-01` に保持した。試作途中で、実時間範囲を全 cut 共通の最大 step で丸めると個々の effect step と不一致になり得る問題が見つかり、実装候補で訂正した。採否と別に、入退場通過許容は主描画の実際の動作時刻で扱う。

次に、元の Memphis が必ず非表示にする枝だけを候補から外す案を、通常 UI の corners / staircase / mixed の最初の Memphis 入力で offline 比較した。不可視と確定できた支持は順に 0 / 1190、0 / 1190、0 / 1154。各3回の生成時間は旧→案で約274→265、257→260、250→257 ms だったが、ウォームアップや探索再試行を含まない参考値にとどまる。この3入力では改善根拠がないため案を採用しない。mixed は追加 provider の試作時の入力で、各演出とも最初の1呼出しだけであり、他の候補・入力へ一般化しない。入力と取得記録は `normal-ui-memphis-input-three-actual-20261101-01` にある。

Memphis / starburst の共通 `getBB` は、現在の有効な bbox で保持中に更新し、文字が隠れた場合と退出中には以前の bbox を維持する。これは表示位置の跳躍を避ける既存の意図である。一方、初回に退出へ直接 seek した場合は、その時点の bbox が以前の保持位置として扱われ得る。さらに `displayEnd` ありの cut は描画ごとに clone され、WeakMap のキーが持続しない。これらは source の読取り結果で、seek 前後の画素差は未実測。単純な cache 消去や固定位置への置換は元の退場・非表示時の描画を変えるため行わず、現行描画の起こし得る cache も回避計算に含める。

単字 item の invertBox / tyStrike に限定し、入場・退場の時刻境界で装飾の cache 候補を分け、全範囲を同じ配置で検査する試作を行った。通常 UI で取得した完全な plan の先頭 cut から source viewport を再構成して直接 `prepareViewport` を呼ぶ限定診断では、mixed / scatter とも配置不成立で、計算時間はそれぞれ約920 / 698 ms。この診断は通常の prepare 全体、旧自動領域 fallback、全 cut、実描画や安全性の検証ではない。基準 build の同一測定もないため速度差は断定しない。対象2条件で改善を示せなかった試作は取り下げ、差分と結果は `normal-ui-common-wip-20261101/cache-ranges-unadopted.patch` と `normal-ui-mixed-scatter-viewport-diagnostic-actual-20261101-01` に保持した。
