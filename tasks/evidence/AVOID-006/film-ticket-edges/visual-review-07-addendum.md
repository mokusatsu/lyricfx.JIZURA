# 07最終repackへの視覚証拠接続

2026-10-21、独立画像担当 `/film_ticket_edges_visual`。05/06を含む既存視覚証拠は保持し、07への接続をファイルhashとJSONで確認した。追加画像閲覧・decode・再生・画像生成・実装編集・commitなし。

07 manifest `review/AVOID-006/local-20261021-07/manifest.json` は指定SHA256 `6934ae9a57215ce8583f1a291fb59f325ba9411b0bcddb33141b74aba6305c20` と一致。最終JAは引き続き `a3c4d0e3c76994033910d61711180787576a0bec938d397da8425c37b8124ba7`。

07の公開asset20件・private証拠121件、計141件を実ファイルSHA256で検証した。MP415asset（統合後の数、before/after計18参照）とprivate PNG54assetは06の対応実ファイル・双方manifest記載hashと全件一致、相違0。9条件のcaseデータとbefore/after撮影来歴も一致した。06 ledgerのmanifest hashと旧視覚文書hashを固定し、05で検証したnative864frame一致・視認済みafter75サンプルの接続を継承した。

beforeは8193の元撮影再利用、afterは最適化後ソースによる全864frameの新native撮影。07は同じ撮影素材のrepackであり、親担当からtool・HTML build ID・manifestのみの変更と通知された。

親担当による経過：06の正式local検証はnative PNG54件通過後、Range未対応によりseekで失敗した。その後transport修正を用いた06素材の診断で18参照/UIが成功した。07正式再生は親担当が実行中であり、このhash接続は07再生成功を示すものではない。

同一素材のため追加の差分視認は不要。従来視覚レビューのサンプル範囲、film1080r.2不足診断の除外、正確な比率・角度・clearanceを数値証拠へ委ねる区別を保持する。全frame hash一致を人間の全frame視認、ユーザー承認、AVOID-006完了とは扱わない。

詳細：`visual-review-07-ledger.json`。再現用：`scratch/film-ticket-edges-visual/connect-07.py`。
