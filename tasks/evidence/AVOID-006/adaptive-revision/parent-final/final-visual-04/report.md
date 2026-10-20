# AVOID-006 final04 visual review

今回の原寸重点確認34枚では、視覚上の新たな重大問題は認めませんでした。これは静止画像と引継ぎ証拠の範囲に限る所見です。新8レイアウトの最終受入は公開後の人間確認に残します。

対象は `review/AVOID-006/local-20261020-04`。manifest SHA256 は `2d9a87544a5a8b4818591b0daeb0b1ccd659c241d52d1383111422aca579e01d`、after JA/source SHA256 は `b2c230268f7731df2201093893397551b3265c8cad9984ef8b517cc1fe8bc696`。

## 今回自分で実見した範囲

`visual006_final_detail` が `tools.view_image(detail=original)` で原寸native PNG全体を開きました。crop・再撮影は行っていません。exact case/side/path、encoded/raw/RGBA hash、閲覧方法は [detail-ledger.json](detail-ledger.json) に記録しています。encoded SHA256は34/34一致しました。

- justified / subtitleBar / splitScreen / sideways / panels / filmstrip / quote / ticket の native-anchor 前後16枚。
- 同8レイアウトの text-long after 8枚、standard-size-limit after 8枚。
- subtitleBar-portrait-center 前後2枚。前担当の残25 after全件を包含し、追加でbefore native 9枚を確認しました。

修正portraitでは大きな淡い「へ」全体が字幕板の上に収まり、板に隠れません。主要例では文字と各意匠を判別できます。certifiedな長文・下限例の主歌詞は原寸で読め、長文の改行やfilmstripの低い帯などにも演出の形が残っています。sidewaysの回転長文は読み方向への慣れが必要ですが、横書き複製からも歌詞を読めます。justifiedの埋め草との重なり、sidewaysの端に近い配置、filmstrip長文の小型化は、人間が対象表示環境で好みと読みやすさを追認する点です。

panels-text-long、ticket-text-long、subtitleBar-standard-size-limit、filmstrip-standard-size-limit、ticket-standard-size-limit は候補除外です。表示される元描画は回避成功として扱っていません。

## 前担当から引き継いだ範囲

以下は `visual006_resume` の実見記録であり、今回の担当者が見たという主張ではありません。[view-ledger.json](view-ledger.json)、[handoff.md](handoff.md)、[videos.json](videos.json)、[transfers-verified.json](transfers-verified.json) が出典です。

- after UI 174/174 caseのstageと診断欄の縮小crop、fresh native 149/149 overview。
- native 199/199参照は旧実見から継承。元PNG rawhashと元/保存RGBAの独立decode一致を確認した記録付き。overviewは原寸可読性確認ではありません。
- 動画はquote44 / ticket47 / sideways35 / filmstrip50、計176サンプル。名目5fps・0.2秒間隔でrecording範囲を標本化したもので、連続再生・全frame確認ではありません。filmstrip後半regionはUIで明示された除外であり成功扱いしません。

最初に読んだscratch ledgerではfilmstripが0実見・50残でしたが、直接報告では50実見済みでした。前担当が同一担当の会話中tool画像実見証拠から復元し、正式view-ledgerへ50として保存しました。今回担当者によるfilmstrip再閲覧はありません。

90 overview group / 323 job のexactasset対応を [view-group-asset-map.json](view-group-asset-map.json) へ保存しました。元groups.jsonのSHA256および各PNGのpath・hashを含むため、scratchだけに対応関係を残していません。主要証拠のhashは [report.json](report.json) にあります。

## 限界と人間確認

before UI 174例は新たには閲覧しておらず、両側UI全件確認とは数えません。native beforeは別の範囲です。native PNGにはDOMの円ガイドがなく、円と診断statusのoverview確認は前担当記録、数値安全性の検査は親担当の範囲です。入退場で動く要素だけ円通過可、hold・静止・fadeのみは厳格という基準を維持します。

公開後は新8例の構成・縮小時の可読性、とくにjustifiedの密度、sidewaysの回転長文、filmstrip長文の小型化を実際の表示で確認してください。動画は全frame保証がないため、対象環境での全再生確認も推奨します。旧18の受入とは別です。

実装・asset変更、stage、commit/push、公開は行っていません。
