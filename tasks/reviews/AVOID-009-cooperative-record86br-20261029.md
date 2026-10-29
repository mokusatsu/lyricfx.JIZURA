# 電球：正式計画用recordの分割準備（86br）

実装担当 gpt-6.1-sol / medium。従来の同期replayを、各ownのCanvas復帰後にyieldするprivate generatorへ分割。再開ごとに真正ownerから同期借用し、入力・円・字体・世代・context・sourceを確認する。候補・model・contextは公開せず、途中取消や失効は破棄。proof中の2 MiB固定予約にowner・adapter・record・各一時値を加えて既存8 MiB上限内に計上する。親は差分、private job mock22・adapter mock20・既存回帰53、73固定入力・15 rawとcheckerを確認した。

同一の真正modelで分割版と旧同期版のrecipe・delta・circle・10 groups・held・profile・sourceKey・727参照が一致。正式planから通常optionの j=12/60/231 を描き、旧86bpの9 own・325描画記録・3RGBAと一致。別scale・世代変更・復元後旧handleは描画前に拒否し資源解放。peak 7,981,163 B / 8 MiB。途中取消・入力・字体・context変更はmock確認、実proof途中の変更確認ではない。

単発のformal finalizeは39.1 ms、同一modelの旧同期replayは2,787.6 ms。分割を前倒しした準備全体は29,476.9 ms、最大step3,680.5 msで通常UIへの自動適用は未達。step時間はwall測定でCPU処理と環境待ちの内訳は未確定。製品未インストール。旧250描画・動画は再生成していない。
