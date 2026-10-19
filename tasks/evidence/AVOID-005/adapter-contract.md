# AVOID-005 adapter 契約（Stack修正を検証中）

2026-10-19。旧 prototype-01、[final-candidate](final-candidate/summary.json)と旧公開比較は履歴として保持する。Stackの動作確認を受けた再修正は[stack-revision](stack-revision/parent-review.md)を参照する。通常アプリの既定経路は変更していない。対象は `finalizePlacementPlan(plan,{basicLayouts:true})` の明示 opt-in のみ。

| ID | 主歌詞と所有単位 | 補助・例外 | 通常軌道と読み順 |
|---|---|---|---|
| center | 全文、sub 行、下線、accent は同じ所有単位 | なし | 全revealed ink の共通平行移動 |
| mixed | 元の glyph/word 単位 | なし | 実際の単位順を保持。新しい重なり・中心の潰れを拒否 |
| vcols | 各 column の全文。対称 column も異なる整数 ID | 反復も primary | column ごとの全文を保持。共通移動優先、可読性制約付き個別移動 |
| marquee | 中央の主歌詞 | `marquee.rows` の反復行とそのネイティブ行装飾だけ tiledAux | 主歌詞は全文単位。補助行の動きは変更しない |
| tile | 中央主歌詞と knock box/下線 | `tile.repetitions` だけ tiledAux | 所有板と歌詞を一緒に移動 |
| scatter | 主 glyph と各 `scatter.extra.N` 全文 | extras も primary | 主 glyph の読む順を保持。extras は独立全文であり巨大な一塊にはしない |
| wave | 各 glyph と同 glyph の位相別 trail。明示整数 glyph/phase metadata | trail も primary | 安定寸法の横方向セルと連続円外 route。主 glyph のセルは分離し順序固定、trail の元の位相差・前後順を保持 |
| huge | 元の glyph index を保つ各文字、caption とその板 | なし | 元の字形・文字サイズ・gradient 座標を保持し、row-major の分離セルへ配置。ネイティブ pan/camera の変位は単調 atan 写像でセル内の有界運動へ移す |
| labels | `labels.label.N` の単語と板。center word も primary | `labels.centerOrb` は文字を持たない独立した背景円 | radial は orbit 中心の共通移動で位相・板との関係を保持。orb も同じ共通移動に追従。rows/scatter は通常所有単位の包絡 |
| condensed | 全文の各反復 | 反復も primary | 全文内の読む順は変更せず、反復間に新しい潰れを作らない |
| gloss | 主歌詞、実際の cut.note（pipe のルビ・注釈）、その板 | `gloss.background` だけ tiledAux | 横・縦 note を主歌詞と同じ所有単位で移動 |
| type | 最大 reveal の全文と underline/caret 装飾 | なし | 見えている部分で寸法を変えず、固定包絡を共通移動 |
| diag | 主 band とその全文 | `diag.secondBand` だけ tiledAux | 実際の回転 polygon で円外を判定。元から2.4Wある板の canvas crop は保持し、主歌詞の可視範囲を stage に収める |
| circle | 主歌詞と disc/ring の板 | eclipse の blur は明示 unsupported | circumscribed polygon で丸い板の隅の余地を使い、全文と板を共通移動 |
| stack | 各反復全文を一つの整列した組として解く | 反復も primary | 共通平行移動を優先し、成立しなければ一定の隣接変位を持つ斜め配置を探索。文字サイズ・角度・行順・反復数を維持。全区間包絡の対ごとのbbox重なり面積を元より増やさない。個別に分散するfallbackは禁止 |
| pill | 主歌詞、smalls/note、pill plate、所有 clip | なし | gradient と clip を含む記録順を保持して同じ変換を適用 |

「ruby」は既存の `歌詞|よみ` → cut.note の経路を指す。glyph 単位に架空のルビ記法を追加していない。各 layout が元から描く note を所有対象にする。名前を挙げた4群以外は tiledAux に分類しない。補助群のマスクは018の受入であり、本段階では未実装。

## 全区間の根拠

静的単位は最大 reveal/overshoot の polygon に camera scale extrema、dutch 回転の変位上限、pan/chroma/shake の移動上限を Minkowski 合成する。円との最近点距離と stage 収容を独立判定する。候補は円周72方向、実 polygon の辺法線、stage/circle に接する隅を含み、円 bbox 外の4矩形だけには制限しない。

wave は glyph の最大寸法・最大 slope rotation・camera を含む固定 body を使う。円中心から body への水平距離を g、半径と余白を R とすると、g<R の上側制限は `cy-halfHeight-sqrt(R²-g²)`。g>=R では水平分離が成立し、接線から stage 境界まで連続 guard を伸ばす。この写像の全定義域を解析的に検査し、各 region で固定 side を選ぶ。主 glyph は全時刻で stage 内。trail のネイティブ canvas crop は維持し、circle clearance は全 primary に適用する。travel=0 と微小正負が連続し、travel の絶対値を正規化で消さない。

radial labels は全軌道 annulus の内外のどちらかに円が収まることと外周の stage 収容を検査する。center word がある場合は内側を空き領域として扱わない。huge は全 glyph/caption の安定 body が分離セル内に留まることと円外であることを検査する。huge の native 実装自体が空白を除去し、長い文字列を自動改行するため、その同じ glyph 列を row-major に再配置する。

これらは frame sampling を連続性の証明に使わない。5時刻・実 alpha raster・独立 oracle は証明実装の反証検査である。region lookup は realTime を再帰内でも固定し、元の動きには量子化・ghost lag を含む t/lt/ltb を使う。

## 画素境界と資源

文字は TextMetrics と stroke に1 font-space pixel の metrics/grid guard を加え、変換後さらに device 軸2pxの grid/AA guard を合成する。最小 render scale .1 では20 stage pxを包絡に予約する。shape は device 軸1px（最小scaleで10stage px）。circle/arc は外接 polygon、rrect は内側矩形と外接円 polygon の Minkowski 和。miter の直角と square-cap/dashed の端の角を別に保守的に含める。弱い alpha も actual alpha>=1 の pixel center を検査する。

追加 canvas は共有1×1計測用1枚だけ。1frame（再帰を含む）4096 events/16384 glyphs の上限を維持する。計測 metrics は4096件、準備描画データは2048件・serialized size64MiB、純粋な幾何解は8192件・serialized size8MiBの LRU。実 object memory が serialized size と等しいという主張ではない。font revision で破棄し、全 source cut・style/fx・stage/time を準備 key に含める。解の key は exact polygon/circle/stage/seed/fitBounds/revision。意味制約 callback の解は cache しない。保存した program/result は detached な再帰 freeze 済み値で、plan に直接共有しない。差分試験は cache hit と cache clear 後の結果を照合する。

## admission と診断の限界

受入対象は cut enter/exit/groupExit、still hold、push/panL/panR/dutch camera、none/marker treatment、decorなし、既存の有界 frame FX の範囲。render scale は.1〜4。manual/notation/lock/emphasis/OFFは原値を保つ。eclipse blur、未適応の状態、非有限値、イベント上限超過などは明示 unsupported。例外を握って旧描画へ戻し safe と称する経路はない。

固定サイズや円の条件によって `insufficient-space` を返す。`unit-envelope-exceeds-stage` はその所有単位の保守包絡の不適合、`bounded-candidate-search-exhausted` は定義した候補集合の尽きであり、任意の文字の噛み合わせが数学的に不可能という証明ではない。huge の試した行数/幅/高さも serializer に残す。縮小・文字欠落・新しい小 clip・cut分割で通さない。

抑制 `~…~` は自動小領域が代わりに持っていた intrinsic .7 を、auto area を外す opt-in だけで復元する。WeakMap に実際の正規化の来歴を持ち、明示 contentScale の編集はそれを消す。従来経路の JSON/描画は変えない。明示1/.85、manual/lockなどを尊重する。

## 現在の証拠

以下の件数・hash・性能はStack修正前の005公開版を識別する履歴。修正候補の測定は[stack-revision](stack-revision/parent-review.md)へ別記し、旧版の成功を修正版の成功として流用しない。

- native matrix10: seed704「風の先へ」、16×3aspect×上下中央144件。101 certified /43 insufficient /0 unsupported /0 errors。全16IDに admitted case がある。この固定条件の成功数を全variant対応率とは呼ばない。
- acceptance current10:46/46、actual alpha raster16×3scale×3time=144条件で circle collision / polygon uncovered / conflict がすべて0。中央 wave の usable native parameter case は `Go`, amp .08, freq .8。default4字の中央不適合を隠さない。diag の landscape raster は upper circle。
- 原始 JSONとsource hashは final-candidate、親の独立検証は parent-final、公開比較と検証は publication.json。公開検証済み・人間動作確認待ち。


## 固定候補の識別

現在の変更後 JA HTML SHA256 は `c7dbd4d94309d840b885c8a916f7d98544888d2b5663db054654d5f0671d4f41`、EN は `c55180c81354e6265a785c936590cb54857b5ac86434933d10d09d52528a6897`。直前の `c2449974…` からの製品差分は09aの guard 説明コメント1箇所だけで、動作変更なし。performance.json は直前版の測定をそのまま保持し、冷状態の初回も併記する。native/acceptance/stage は現在版で再実行し成功した。直前版の原始証拠は final-candidate/pre-comment-c2449974/ に保持する。

性能の実測は100cuts/100regionsで計画 p95 比1.718、追加描画p95 .8ms、1000/1000で1.831、1.3ms（契約上限2倍/3ms）。cold first の計画合計320.3ms/1790.3msも省略しない。失敗した最初の性能測定・修正途中の測定も final-candidate に保存し、成功結果だけへ置き換えない。
