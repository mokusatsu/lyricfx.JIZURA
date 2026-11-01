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
