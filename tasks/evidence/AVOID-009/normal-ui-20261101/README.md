# 通常 UI・保持期観測の保存物

`held-observations.json` は対象 commit と試行ビルドを混同しないよう、それぞれの source / HTML hash、演出別状態、観測した円内差の要約を残す。raw 全体や画像は含まれず、clip 後の全文字可視性はこれだけでは判定できない。

`main-hold-unadopted.patch` は保持期の装飾 bbox を絞る不採用試作で、既定サンプルの4演出を改善しなかった。実時間の誤表示を直した最終案と試験した build は一致しない。`jizura-09d-local-api.patch`、`jizura-quote-recipe.patch`、`jizura-ticket-recipe.patch` は未接続・未試験の検討資料である。既存 recipe は引用符やチケットの構図・入場動作を変え、候補と実描画の clip・装飾・所有物を一致させる caller も不足する。これらをそのまま製品へ適用しない。

bbox 範囲全体で非表示と推定される装飾枝を候補探索時にだけ除く案も検討した。既存候補が不成立のときに探索が重複し、数値 guard の確実性と既定サンプルへの効果も未確認のため採用していない。

その後、`memphis-inputs.json` の実 UI 入力3件に対して支持生成だけを offline 比較し、非表示と判定できる枝はいずれも0件だった。`mixed-input-trial.patch` は mixed の入力取得時だけの source 差分、`memphis-mark-trial.patch` は offline 比較に使った印付け候補の `11zz14b` 部分であり、いずれも未採用。取得 probe と evaluator は `dev/avoidance/normal-ui-circle-observer-20261101/memphis-input/` にある。生成時間は順序固定の3回測定であり、探索込みの性能や一般的な差は示さない。

`cache-ranges-unadopted.patch` は文字開始・終了境界で bbox と装飾 cache を区間分割する未採用案。`cache-ranges-diagnostic.json` は、実 UI plan の先頭 cut を使い viewport 計算だけを直接測った mixed / scatter の結果で、どちらも不成立。通常 prepare の preflight や fallback、実描画、基準版との速度差は確認していない。診断 source は `dev/avoidance/normal-ui-circle-observer-20261101/viewport-diagnostic/` にある。
