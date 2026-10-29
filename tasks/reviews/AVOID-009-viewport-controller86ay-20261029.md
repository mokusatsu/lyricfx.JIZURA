# 電球：倍率0.75の私有描画経路試作（86ax/86ay）

実装担当 gpt-6.1-sol / medium。owner の私有候補・local table から現在の viewport の支持と品質を再評価し、試作用 ticket と描画前確認を行う source-only controller を作成。親が差分と生成方法を確認し、既存controller回帰53、再生14、handoff92の mock 検査を再実行した。

Qt 実Canvasの3時刻 j=12/60/231 では通常sourceの9 own・325描画記録、描画状態・変換・文字metricsとRGBA hash 3件が既存の同条件原本と一致。偽ticket、世代失効、旧ticket再使用の3例は描画前に拒否し bitmap 不変。親が51入力・4 rawの hash と元記録を照合し checker を再実行した。入力は風の先へ、seed1205、720×405、倍率0.75、noPost限定。一般の入力や旧Chromiumの受入には拡張しない。

単発実測は canonical準備20.5秒、viewport準備19.4秒、同期record生成12.0秒。記録付き描画40.7–82.3 ms。実用性能も60fpsも未達であり、このままUIへ組み込まない。正式plan issuer・通常UIは未接続。8 MiB計上上限と入力等の失効・全支持の検査を維持して準備処理を短縮する。
