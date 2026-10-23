# AVOID-008 record 重複処理・直接 native 描画の read-only 調査

対象は固定 `446ed00a8a9d42ca5d06d30603083142caf65386` の製品（7bd83c23）。編集中の live 09a を根拠にしない。追加実装、試験、browser、profile、timing、Git 更新はしていない。実測根拠は既存 fd6 profile02 と最新 payload-tree-diagnose01。09a/03/06/11p は旧 profile と同一だが、旧 CPU 内訳を最新 CPU 実測とは呼ばない。

## 結論

clone/layout/transform の無条件 memo は採用不可。許容し得る狭い案にも速度根拠が小さく、追加描画 p95 +5.5ms の解消策として断言できない。nativePath 最初の hull は親が別 owner に移管済みなので、ここでは実装しない。直接 native 描画は現在の benchmark の record/replay 各80 guard に適合せず、現行合格経路として不採用。将来の別方式としての契約検討だけを残す。

## 実測と採否

以下は A.record の stack 配下に限定した旧 ON render CPU sample の inclusive 値（重複するので加算禁止）。全80 frame の record 203.651ms に対し jsonClone 8.973、getTransform 6.953、J.layoutText 7.376、recordedItemBounds 6.186、nativeState 0.752ms。GC/短い frame の不確実性があり、これらから p95 改善量は求めない。新診断は ON render 2.9→8.4ms、追加5.5ms FAIL のまま。

| 対象（固定09aの行） | 重複・採否 | 必要 oracle / 反例 |
|---|---|---|
| placementCBody / layoutASweep の push ごとの JSON clone（138,303） | 同じ参照でも mutable な本文・配列・toJSON を持ち得る。identity memo は却下。nativeState は private だが全体0.752msなので優先しない。 | push 間の入替/同一参照内 mutation、getter/toJSON の呼出順・例外、nested alias と各 event の独立性。clips は現状 outer copy だけで nested alias を保持するので、deep clone 化も挙動変更。 |
| itemGeometry→recordedItemBounds の J.layoutText/charFn 再実行（44–77,181–186） | glyph配列を再利用すると callback の対象 identity と順序が変わる。source/transport seal は J.layoutText/J.mainDraw/J.drawFx/metrics/charFn の純粋性を保証しない。却下。 | `charFn(i,g){g.x+=1;return null}`、計算途中で item/metrics を変える helper、getter/Proxy、二回目だけ throw。placementSweep の別 local-origin geometry は連続包絡用で単なる重複ではない。 |
| line の4回 getTransform（248） | native context と matrix accessor が stock と局所確認できれば1回読みに縮約する候補。ただし全 getTransform 合計6.953ms/80以下の小範囲。現時点保留。 | point getter/A.point が actual measurement context を変更、DOMMatrix getter/instance method wrapper、NaN/奇異行列、例外順。全頂点の matrix hoist は同じ理由で無条件不可。 |
| nativePath の `bounds(hull(expandedPoints))` 後の二つ目 hull（168） | 最初の hull が bounds にしか使われない具体的候補。該当 caller inclusive19.488ms/80は二つの hull 等を含む上限で、first hull 単体の値ではない。別 owner に委譲。 | EPS/degenerate/NaN/overflow/-0、元 hull が失敗した入力、rounding、A.bounds/A.convexHull 改変、戻り値全 field。単純 min/max は旧故障を修正してしまう可能性がある。 |

唯一検討余地のある clone 案は、元 JSON.stringify を毎 event 一度そのまま実施し、結果が同一の **flat primitive-only JSON object** の場合だけ bounded な parsed-template から fresh own-data object を作るもの。nested object/array は元 parse、helper identity 不適合は元経路とする。getter/toJSON を省かないが、元 `JSON.parse(JSON.stringify(v))` は stringify より先に parse callee を読むため、その lookup/例外順まで保つ必要がある。__proto__、順序、prototype、descriptor、fresh read の oracle が必要。全 jsonClone が8.973ms/80に過ぎず、追加 guard/lookup の複雑さに見合うと未証明なので今回は推奨しない。

既存選択観測は event kind/owner/polygons を残すが native body/transform/clip snapshot の全文は残さない。従って clone の実重複率や body の unique bytes を原 raw から復元できたとは主張しない。最新 actual top frame は stampSheet17.8ms、newspaper14.4/13.7、clapper8.4、routeMap8.2、postcard7.6。旧 stack sample と新 wall frame を同一時刻の因果分解として結合しない。

## 直接 certified native 描画の契約調査

`contract.json` の性能条件は100/100と1000/1000、同browser/font/viewport/warmup、計画p95≤2倍・追加描画p95≤3ms。一般契約自体には実装機構 record/replay の文言はない。一方、固定 runner47行の `actualPipelineValid` は ON 側の **実 record≥80、実 replay≥80、実 observation≥80** と measurementSupported/envelopeCovered を明示要求する。したがって direct C draw を record/replay と偽計数したり旧 benchmark を成功扱いする余地はない。今の許可範囲では fixture/guard/threshold を変えないので現行案として不採用。

将来別契約として検討するなら、一般契約の ownership・元時計・camera/入退場/copy・AA閾値・primary非mask・手動/lock/explicit・不十分/unsupported診断を保持する必要がある。元演出意図/所有物体/読順/時計保持、期待値を通すだけの変更禁止、黙示除外禁止は task 本文114–126行にもある。

現状の source/transport seal は render/drawCut/makeEnv の identity に限られ、公開 helper、font metrics/data、params、callback の副作用全体を閉じない。認証済 recipe と offset だけでは runtime event と連続包絡の一致を保証できない。plan の WeakMap や同一参照を mutable 依存確認の代用にしてはいけない。全依存を毎frame再走査すれば安価かも未証明。必要なら immutable な private certificate と exact依存検証/明確な元 record 経路 fallback の設計から別途審査する。

直接描画では、現在 record が画面への replay 前に止める途中 throw、unsupported text/state、budget、missing owner/body、strict stage/phase、現在 event の envelope/circle 違反を、描画後に発見すると既に partial pixels が残る。元経路 fallback を後から呼ぶだけでは同値でない。transaction rollback 用 buffer も pixel/compositing/buffer予算の別証明を要する。shadow は同じ数値 matrix の setTransform でも live camera root を置換すると gradient RGBA が変わった実 FAIL があり、固定 offset の適用位置にも厳密 pixel 検証が要る。

将来採用を議論する場合の最低証拠は (1) actualDirectCDraw/actualRecord/actualReplay の別計数、(2)元 record による全 event geometry/owner/coverage/AA/phase/circle/stage 証明、(3)全variant/時計/入退場/copy/clip/filter/gradient の native pixel equality、(4)helper/metrics/source/params mutation と例外時の fail-before-draw/fallback oracle、(5)同一入力・固定閾値の別名 benchmark と元 benchmark FAIL の併記。direct call数を実record80へ変換せず、元 benchmark の代替合格にはしない。実装許可はない。

原資料の数表と raw/source identity は existing-raw-analysis.json と receipt.json に記録。旧 FAIL、元 driver/corpus、他 owner の作業を変更していない。
