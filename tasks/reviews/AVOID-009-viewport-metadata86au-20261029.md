# 電球：viewport 準備の局所計数比較（86at/86au）

実装担当 gpt-6.1-sol / medium。親は差分を確認し、旧/新の mock 各63項目と handoff 30項目を再実行した。private な viewport job の同一 record・phase・steps 内で不変 metadata の計数を再利用し、memo の容量も上限に計上する。入力、円、字体、世代、context、source の照合は維持する。製品 source には未適用。

既存86apと実Canvas新規86auの出力候補・aggregate・品質 summary は一致。両方の固定入力と raw hash を親が照合。viewport準備は単発 17,013.4→16,303.5 ms、最大区間 218→121.6 ms、canonical準備 14,578.8→16,793.1 ms、finalize 1,546.4→1,532.8 ms。測定変動があるため統計的な速度改善とは扱わず、全体は約34秒で通常UI接続の性能完了ではない。新規試験の最大計上値は 7,974,172 / 8,388,608 bytes。generation失効と旧token拒否、作業枠解放、画面・context復帰を確認。入力・字体・円失効は mock 検査であり、実Canvasでの変更試験と混同しない。

この診断は有限条件の source-only 試作で、配置の正式認可や実UI接続ではない。連続する実時間での量子化境界と source/root の対応、通常plan/frameへの接続、実用的準備時間は引き続き必要。
