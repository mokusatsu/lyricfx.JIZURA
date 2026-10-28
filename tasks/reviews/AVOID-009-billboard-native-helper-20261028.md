# 看板 native helper 81a–c

2026-10-28。実装担当 gpt-6.1-sol / medium。親はsource-only unitの22ファイルbytes / SHA256を確認し、別ディレクトリで3 generator、純粋896 / 2,024 checks、逆変換を独立再現した。`d2909920` は開発用sourceであり製品登録ではない。

元の初期座標・色・pose、元文字サイズとmain / tag item、灯りRNG / clock、支柱・brace・足場・地面・枠・盤面・灯り・clip・gradient / 光路・illuminationの19部品の式を抽出した。既存描画順・owned callback・clip / gradientの位置を維持する提案で、全3段の逆変換が元sourceとbyte一致。純粋試験はsyntheticな式 / RNG / 引数の確認であり、実Canvas・字体・支持領域・安全証明ではない。lineWidthは実Canvasのsetter/readbackを後続で扱う。

次はvisible / 短いtimer・rAF preflightを先に行い、旧sourceと同runtimeで全250時計・描画部品・画素を比較する。入力由来recipe / 全支持と円判定、未対応の明示、製品adapter / UIは未完。固定動画の再承認は不要。source正本はGit外 `/workspace/jizura-logic-evidence-20261027/billboard-helper-unit81`、Gitへ媒体・巨大rawは含めていない。

先行実Canvas pilot：可視Qt・300ms native timer/rAF事前確認（日英旧/候補それぞれrAF18・timer30）、8字体、JA3 / 真EN1の各8 firstTime・通常/カタログ2mode、計64 pairs / 168 own / 2,504 paint。旧sourceと抽出後のRGBA・全paint / clock / root / result / catalogが一致。140 rawの両hashを親照合、literal exit 0、176 pins不変、Qt / node終了・port解放。32選択時刻の限定結果であり、全250時計のpaintや支持・回避の合格ではない。正本はGit外 `/workspace/jizura-logic-evidence-20261027/billboard-helper81-pilot-actual01`。全250時計の検証を次に進める。
