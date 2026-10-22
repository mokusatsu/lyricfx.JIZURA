# 最終最適化候補への視覚証拠の接続

2026-10-21、独立画像担当 `/film_ticket_edges_visual`。先の `visual-review.md` と `visual-review-ledger.json` は変更せず保持した。本追補は元の視認範囲を最終候補に接続する機械的な同一性確認であり、追加の画像閲覧・動画decode・再生・画像生成は行っていない。実装編集・commitなし。

最終JA SHA256 `a3c4d0e3c76994033910d61711180787576a0bec938d397da8425c37b8124ba7` の新native撮影 `optimized-after/report.json` と、視覚確認済み候補c3aの `after/report.json` を独立に照合した。9条件のspec・時刻列・96frame分のnative PNG SHA256は全864件一致、相違0件。従来実視認したafterの75サンプルを各ケース・時刻へ接続した。

完成済み `review/AVOID-006/local-20261021-05/manifest.json` と次を照合した。

- manifest掲載の公開MP4・その他公開assetとprivate証拠を計141件、実ファイルSHA256で検証。
- before/afterそれぞれ9条件の公開MP4 hashを対応captureファイルへ照合。after9本はc3aで実視認に用いた動画とバイト単位でも一致。
- privateのキーPNG各側27枚（n3/36/90）を対応capture PNGと照合。afterの27枚は旧c3a PNG・最終候補PNG・report該当frame hashとも一致。
- private gzip reportの展開JSONをbefore/optimized-after reportと照合。
- 保存済み `historical-public04-manifest.json` のspecと各側動画hashを、旧視覚ledgerに対応するcaptureへ照合。旧04と新05のmanifest自体・関連report・旧視覚文書のhashを新ledgerへ固定。

beforeは8193時点の元撮影を再利用している。afterは最適化後ソースを全864コマ新規にnative描画・撮影したもの。同一hashの公開動画がmanifestで共通パスに統合されていても、after撮影をbeforeや旧動画から作ったという意味にはならない。

したがって、先のサンプル視認所見（filmの端連続、横ticket切離しの回復、縦ticket不変対照、film1080r.2不足診断の除外）を同一画像の最終候補へ接続できる。全frame hash一致は人間による全frame視認、実時間再生検証、ユーザー承認、AVOID-006完了を意味しない。正確な窓比率・12deg・円clearance等の数値保証は従来どおり別証拠に委ねる。

照合詳細・75サンプルの接続・141assetのhash・各文書hash：`visual-review-final-ledger.json`。再現用スクリプト：`scratch/film-ticket-edges-visual/connect-final.py`。
