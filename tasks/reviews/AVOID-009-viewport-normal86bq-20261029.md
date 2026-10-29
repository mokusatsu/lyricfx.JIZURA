# 電球：倍率0.75での限定通常描画設定（86bp/bq）

実装担当 gpt-6.1-sol / medium。既存86zのpost・fast中立条件を保ち、対象Canvasだけ720×405・scale0.75へ限定した source-only 試作。無効化されたtexture/glow、source依存、字体・現在CTM・描画支持などのguardを維持する。UIの空media/foregroundオブジェクトは未対応。親は差分、mock21・既存finalizer回帰53と、63＋65固定入力・14＋11 rawのcheckerを確認した。

86bpでは真正formalplanの j=12/60/231 で fast/noPost と通常 fast:false/noPost:false の9 own・325描画記録・root・clock・3RGBAが一致。通常側allowFilterはtrue、fast側はfalse。省略optionの j=60 も一致。最後の期待されたnoGhost拒否に試験側が成功判定を適用したため、86bp全体は失敗のまま保持する。86bqは正例を再描画せず、別scale・世代失効・復元後旧planの拒否と解放を補完。5拒否のbitmap不変を確認した。

固定入力・限定sourceの3時刻の結果であり、一般のpost/FXや全時刻の新証明ではない。準備15,543.5 ms・最大step799.8 ms・finalize4,755.8 ms、記録付き通常frame18.2–23.8 msは単発で通常UI・60fps未達。正式確定内の727 own再検査をprivate cooperative準備へ移し、世代・字体・円・容量と失効を保つ必要がある。製品未インストール。
