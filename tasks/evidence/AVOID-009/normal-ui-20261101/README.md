# 通常 UI・保持期観測の保存物

`held-observations.json` は対象 commit と試行ビルドを混同しないよう、それぞれの source / HTML hash、演出別状態、観測した円内差の要約を残す。raw 全体や画像は含まれず、clip 後の全文字可視性はこれだけでは判定できない。

`main-hold-unadopted.patch` は保持期の装飾 bbox を絞る不採用試作で、既定サンプルの4演出を改善しなかった。実時間の誤表示を直した最終案と試験した build は一致しない。`jizura-09d-local-api.patch`、`jizura-quote-recipe.patch`、`jizura-ticket-recipe.patch` は未接続・未試験の検討資料である。既存 recipe は引用符やチケットの構図・入場動作を変え、候補と実描画の clip・装飾・所有物を一致させる caller も不足する。これらをそのまま製品へ適用しない。
