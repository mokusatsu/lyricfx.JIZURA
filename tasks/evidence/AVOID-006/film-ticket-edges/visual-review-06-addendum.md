# 06再packへの視覚証拠接続

2026-10-21、独立画像担当 `/film_ticket_edges_visual`。既存視覚レビューと05への追補を保持し、06 bundleをファイルhashとJSONのみで照合した。追加画像閲覧・decode・再生・画像生成・実装編集・commitなし。

06 manifest `review/AVOID-006/local-20261021-06/manifest.json` のSHA256は指定値 `4a8485524c9d8112a148434630e457c3dfef13c7b8e08d3788a8f7deb69fca9c` と一致。最終JAは引き続き `a3c4d0e3c76994033910d61711180787576a0bec938d397da8425c37b8124ba7`。

- 06 manifestの公開asset20件・private証拠121件、計141件を実ファイルSHA256で検証。
- 公開MP415assetとprivate PNG54assetは05の対応実ファイル・双方manifest記載hashと全件一致。9条件のbefore/after動画パス・spec・診断を含むcaseデータも05と一致。動画asset数15は共通内容のmanifest統合後の数で、比較条件はbefore/after計18本分。
- before/after撮影来歴データは05と同一。beforeは8193元撮影の再利用、afterは最適化後ソースを新規に全864frame撮影したもの。05追補で確かめたc3aとのnative PNG864件一致と、従来視認75afterサンプルとの接続を保持する。

親担当から、05 local検証はnativeキーPNG54件・parity864件の通過後、サーバーdirectory 404により再生前に失敗し、06ではhandlerだけを修正して同撮影素材を再packしたと通知された。本照合は画像・動画素材の同一性を確認するもので、06の実時間再生成功を示すものではない。

従来の視覚所見を同一素材の06へ接続できる。新たな差分視認は不要。全frame hash一致を人間の全frame視認、ユーザー承認、AVOID-006完了とは扱わない。元レビューのサンプル範囲・不足診断例の除外・数値証拠との区別を引き継ぐ。

詳細hashと接続先：`visual-review-06-ledger.json`。再現用：`scratch/film-ticket-edges-visual/connect-06.py`。
