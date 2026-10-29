# ドカン：限定正式計画・描画（83av/83aw）

実装担当 gpt-6.1-sol / medium。既存owned-plan registryをドカン専用に結び、真正ready ownerからissuer・runtime admissionへ渡す source-only 試作。元のhalf本文、リング・放射線・破片のsource bodyは変更せず、専用adapterによる placementUnits 注入だけを除く。current layout・全支持・円・画面・clock・rootの描画前検査と83asの時間範囲を維持。親が差分、mock controller35・facade18、80固定入力・3 rawを照合しcheckerを再実行した。

真正J.planから一度準備し正式J.finalizeに成功。j=6/60/231のRGBA hashは既存の同条件source原本と一致した。新しい全paint observerの証拠とはしない。別plan、範囲外post、円の再stageと復元後の旧planは描画前に拒否し、各bitmapは不変。binding・certificate・owner stage/jobは解放された。今回の円変更は旧plan失効確認であり、新しい円に対する再準備・描画は未実施。

83atはgenericのvalidated lifecycleを試作側が拒否、83auで原因確認。修正後83avは別planの実renderer先行拒否codeに対する試験側の期待誤りで停止。いずれも保持し、実装を変えず期待を正した83awが通過。準備18,748.5 ms、最大step232.8 ms、finalize103.8 ms、hash取得を含むframe42.2–133 msは単発値で、通常UI・60fps性能は未達。960×540・scale1・fast/noPostの限定source-only接続であり、製品登録や6演出全体の完了ではない。
