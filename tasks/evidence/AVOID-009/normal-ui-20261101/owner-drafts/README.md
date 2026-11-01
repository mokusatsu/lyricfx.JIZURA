# 文字別移動の未接続草案

このディレクトリは製品コードではない。mixed / scatter の文字別 source 支持、移動後の Memphis 支持、native 描画への offset 運搬、候補 solver の検討途中を保全する。実装・性能・描画・安全性はいずれも未検証であり、そのまま適用しない。

component 案は単字・空白なし・invertBox / tyStrike・Memphis 一件などに限定される。moved support 案は同一 generation の seek で到達し得る過去 bbox の明示入力と、camera / ghost / clip / post の投影を必要とする。native hook 案は offset の全 owner 対応を採用前に保証しないと、通常 renderer の例外捕捉後に部分描画が残り得る。

更新後の solver 案は、既存候補を先に使い、円方向と読み順を考慮した少数候補を試す。通常 UI の既定 sample では mixed / scatter とも配置不成立で、対照 center は元の移動量を保ち保持中の1時点で円内差0だった。新経路への到達や、他の入力での成立・性能・文字欠落の一般性は未確定。このため案を製品側から外した。`native-owner-transport.patch` と `owner-side-integration.patch` は試作時の追跡ファイル差分であり、同じ候補を他条件で再検討するための資料である。

さらに main / side の両方に共通する高さも候補化した診断では、mixed の region・split 44組中32組が元 viewport と交差せず、28案は読み順20・領域4・clip 2・円2で検査の最初の不成立となった。scatter は固定している補助文字の支持で候補生成前に不成立だった。各カウンタは最初に不成立となった条件であり、物理的な不可能性ではない。`anchor-diagnostic-summary.json` は観測要約、`anchor-and-counters-unadopted.patch` は未採用試作に診断を加えた差分である。対照 center の観測時点の円内差は0。
