# 電球：文字・円・字体変更時の限定正式計画（86bm/bn/bo）

実装担当 gpt-6.1-sol / medium。720×405・倍率0.75・fast/noPostの source-only 正式plan経路で、文字を「風風先先」、円半径を0.20→0.21、字体registry weightを700→400へそれぞれ変更。各変更で旧planと復元後の旧ticketは描画前に拒否し、新たに準備したplanは成立した。親が文字の126描画記録と訂正oracle、円・字体の各126描画記録と独立source oracleを照合するcheckerを再実行した。円のdevice移動量は入力由来で72.3007882629842→76.35078826298418へ変化。字体は同じ8字体ファイルでregistry weightを変更した試験であり、別フォントファイルの試験ではない。

文字の初回比較86bmは独立oracleがnative参照後の線幅・strokeStyleを復帰せず失敗。既存formal描画を再実行せず、Canvas状態をsave/restoreする86bn oracleで全126記録が一致。比較項目は除外せず失敗も保持した。文字の試験は失敗時に明示releaseへ到達せずサービス終了時の回収となった。円・字体は明示release後にmodel・record・binding・active frameが0。

新規準備は円30.5秒／最大step3.79秒、字体16.0秒／最大step0.81秒で、通常UIの性能は未達。各条件の1時刻の実描画確認を、任意入力・全時刻の製品対応と混同しない。製品へのインストール、通常UI、他5演出の正式接続は未完。
