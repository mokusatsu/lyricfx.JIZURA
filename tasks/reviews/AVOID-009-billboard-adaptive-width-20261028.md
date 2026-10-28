# 看板81g：入力計測による候補幅の試作

2026-10-28。実装担当 gpt-6.1-sol / medium。親は固定17filesのbytes / SHA256とsourceを確認、純粋幅813 / family439 / model26 checksを独立再実行し、未登録source-only unit `d8893208` を保存。製品 / UIは未変更。

81f真ENの移動円では原brkが単語を保つため、従来307.2px板の0.72候補は667 ownでTEXT_FACE。品質閾値を緩めず、各文字サイズstageの現在文字列に対し、元J.layoutText anchorと同CSSのTextMetricsを測定、既存+1 fontpxのink幅からwriting field .84に必要な板幅を導出する。従来幅を下限にoutward ceilし、左右で測定を共有。7候補数・元brk / ground / font比 / タグは維持し、現入力のraw値を固定で埋め込まない。必要幅がstage / 円 / 構造条件を超えたら不足のまま。計測データ / layout配列属性 / caller予約を既存8MiB serialized予算へ合算。

幅は候補導出であり+2 devicepxや実CTM / 全clock品質の保証ではない。mock試験のため実Canvas / 全727own・7候補の品質/支持、別入力回帰、製品owner / frame / UIは未資格。元のEN失敗は保持し、次に同入力の移動円を中心に実字体・全時刻で再評価。正本はGit外 `/workspace/jizura-logic-evidence-20261027/billboard-adaptive-width-source81g`。媒体/巨大rawはGitに含めず、既承認動画の再確認は不要。
