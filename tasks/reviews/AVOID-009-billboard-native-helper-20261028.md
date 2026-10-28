# 看板 native helper 81a–c

2026-10-28。実装担当 gpt-6.1-sol / medium。親はsource-only unitの22ファイルbytes / SHA256を確認し、別ディレクトリで3 generator、純粋896 / 2,024 checks、逆変換を独立再現した。`d2909920` は開発用sourceであり製品登録ではない。

元の初期座標・色・pose、元文字サイズとmain / tag item、灯りRNG / clock、支柱・brace・足場・地面・枠・盤面・灯り・clip・gradient / 光路・illuminationの19部品の式を抽出した。既存描画順・owned callback・clip / gradientの位置を維持する提案で、全3段の逆変換が元sourceとbyte一致。純粋試験はsyntheticな式 / RNG / 引数の確認であり、実Canvas・字体・支持領域・安全証明ではない。lineWidthは実Canvasのsetter/readbackを後続で扱う。

次はvisible / 短いtimer・rAF preflightを先に行い、旧sourceと同runtimeで全250時計・描画部品・画素を比較する。入力由来recipe / 全支持と円判定、未対応の明示、製品adapter / UIは未完。固定動画の再承認は不要。source正本はGit外 `/workspace/jizura-logic-evidence-20261027/billboard-helper-unit81`、Gitへ媒体・巨大rawは含めていない。
