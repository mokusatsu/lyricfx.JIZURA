# クロスワード：限定正式計画と品質確認（85s）

実装担当 gpt-6.1-sol / medium。既存58Aの入力由来左配置・下ヒントを私有owner/controller・正式issuerへ接続する source-only 試作。元の盤面・番号・ヒント・紙・鉛筆の支持を保ち、入力・字体・source・context・世代を検査する。prepareは既存250 j/60・727 ownのモデルと移動後支持を確認し、任意のcurrent frameは最大3 ownを実CTMで描画前に再検査、有限時刻証拠だけを連続時間の認可に使わない。親はsource、mock19・既存hook回帰13・品質8、52固定入力・2 rawとcheckerを確認した。

真正formalplanの j=14/90/231 は既存85oの3RGBA・9 own・370支持・124描画文字・元source呼出順と一致。準備proofは727 own・32,304支持・11,822 glyph、最小画面端余裕2.0000004458077556 px。親のFraction検査は3frameの345品質項目で最小セル内余裕0.12668530273435863 px。画面・円には既存の2 device px余裕、セル内品質には元85nの1 font px余裕を適用する。初回85rはこの二つを重ねて誤拒否し、失敗を保持。85sは正の軸整列CTMに限り、glyphの外向き・セル境界の内向き区間で元の厳密判定より甘くならない方式へ訂正した。

alias・post条件外・円再stage・復元後旧planは描画前に拒否しbitmap不変、資源は解放。円変更後の新planや実文字・字体変更は今回未検証。準備39,072.5 ms、最大step318.6 ms、finalize85.1 ms、hash/audit付きframe78.1–86.1 msは単発で通常UI・60fps未達。新たな250回の描画は実施せず、旧85oの全時刻記録を維持。製品未インストール。
