# ドミノ73: isolated source準備

AVOID-009内の独立候補。canonical source/HTML/shared API/Gitを変更せず、このディレクトリだけに書込む。親source初稿受入、Canvas実行は未実施。安全adapter登録もsafe表示もない。

## 元演出と限定順

元: `src/11p_layoutsD.js` 22 dominoes、分類: `src/09k_layoutsD_placement.js`。面・側面・影・pips・印字・接地線は全primary。元rowの連続chain、縦横比/pitch/lean、rise/終盤fall、global giによるtiとmiAt、row内jによるfo/先頭末尾88度を保持する。

1. 元位置、次に全rowの共同移動。
2. 元の各rowを接地線ごと再配置。行内glyphを分離せず、row membership/順序/寸法/元時計を変えない。
3. tile/font局所縮小は今後別設計。今回はtyped unsupported。global縮小・行再分割・円maskは実装しない。
4. 有限候補不成立は不足/非採用。連続配置不可能や実ink衝突の証明とはしない。

## 実装境界

`overlay73.cjs`: 原ファイルをメモリ上だけで5箇所置換、dominoes境界外を保持。完全逆変換で原bytes一致。元yF/xc計算後へrow deltaを加え、接地線両端も移す。ゼロは加算をせず原数値/演算順を保持。ctx.save/transform追加なし。bbも元drawAffから移動したMで導く。

`runtime73.js`: native/joint-translation/row-translation binding。所有はrow単位primary、例外時も元descriptorとbindingを復元。初期960×540/CJK BMP2–14文字、元自動sizeのみ。grapheme/空白/改行/明示size/別viewportはtyped未対応。proof/certificateではない。

## 今回確認

`node work/avoid009-domino73-isolated/source-test73.cjs`

`pure-result73.json`: native/off/on zero66状態、共同移動36paint、元2row10glyphのmodel/mi一致、例外後cleanup、typed拒否、逆変換PASS。stub Canvas/色/ease/chunkTextによるsource seamの比較だけで、実Canvas・実フォント・RGBA・実支持は未確認。非zeroはfinalvertex+deltaでなく元T(local)のF64順で期待値を計算する。test初稿の座標/演算順/stub不足はfailure01–03に保持。

## 次ゲート（親依頼、実行前レビュー待ち）

同source/frame closureの独立経路: 原HTML native / RAM overlay OFF / ON native-zero、1row「風の先へ」・元10glyph2rowの代表、960×540/60fps/4s、dela/seed固定。全RGBA/paint/text/pips/接地線/時計/実CTM exact、非zero共同移動は原closureの座標引数だけを移す別oracleと照合。元renderer/camera/pass順を保持。全primary観測とunknownpaint typed拒否。既存losslesscodecでliteralraw、同namespace親数値照合・失敗prefix保持・保存方針は親gateで固定。

stage/circle全時計と有限候補採択は次段階。この初回fidelityを製品回避成功に数えない。比較MP4/PNG/閲覧HTMLはSitesのみ、GitHubへ新規追加しない。公開確認/保存後readback/拒否経路再試行0。
