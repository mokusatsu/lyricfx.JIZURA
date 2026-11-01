# 文字別移動の未接続草案

このディレクトリは製品コードではない。mixed / scatter の文字別 source 支持、移動後の Memphis 支持、native 描画への offset 運搬、候補 solver の検討途中を保全する。実装・性能・描画・安全性はいずれも未検証であり、そのまま適用しない。

component 案は単字・空白なし・invertBox / tyStrike・Memphis 一件などに限定される。moved support 案は同一 generation の seek で到達し得る過去 bbox の明示入力と、camera / ghost / clip / post の投影を必要とする。native hook 案は offset の全 owner 対応を採用前に保証しないと、通常 renderer の例外捕捉後に部分描画が残り得る。

solver 案は限定的な二帯の試行にとどまり、円の偏りに応じた主・側領域、通常入力での成立、auto area の既存候補優先、cache の cut identity 接続を満たさない。元 viewport clip による文字欠落と領域間の読み順も要確認。これらは次に設計・実装すべき依存であり、完成済み機能の数に含めない。
