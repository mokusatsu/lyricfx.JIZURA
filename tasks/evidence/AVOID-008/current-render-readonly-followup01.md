# AVOID-008 current render read-only proposals

対象 `/workspace/avoid008-final-c34`、依頼指定source9bdb232。実装担当のrepairMemo変更と競合しない読取のみ。新test/browser/perf/CDP/network/public/image/追加security調査・コード変更なし。

## 根拠と世代差

既存 `tasks/evidence/AVOID-008/performance/dependency-string-memo-formal01/results.json.gz` compressed SHA256 `268f43b1ec516ac69a4893cafc10512ab0213a01ff39119299faaea5b1009d31` / decoded JSON SHA256 `18fdc0f9b49c678b6325b858173dcfd5471ff6878ca4c2bbd7dfe6b30f9f3b26`。8side完走、passed=false。100ON追加render p95=4ms、1000ON=3ms（上限3ms）。1000ON candidateはrenderCalls record80/replay80、observations80。nativeLocalBounds hits12455/misses226/entries226/evictions0/caps0。よってlocalbounds容量増加をrender改善候補にする根拠なし。

旧 `immutable-edge-profile01/cpu-aggregate.json` はsource checkpoint8ff3dd8487a4fb4193d00ef9caa296372c751b4f、100ONのみの旧render profile。global self sample見積でA.convexHull18.42ms、edgeContains9.59ms、A.bounds6.44ms（全profile合計、frame p95への換算不可）。sampling/時計対応/GC等の限界あり、現在のhotspot順位の証明ではない。

保存旧09a SHA256 e22e968e8c6b4619216c2e432805d4af469338366fd78e8a4fd2f0b9771a3ae4、現読取09a SHA256 25ecebc4e90818aa66c91b2cad0aa6dc6888d0723048c004f597279a98346651。旧profileはcachedNativeLocalBounds無し、reuseCommandMatrix無し、roundedRectHullは既に有り。旧09g SHA2563a333a6bab6aa61a71c652fb83b7c647d24939527e8aafb744768e642a8d7072、現読取09g SHA256 b6fb7673846981e8988e282d69c0819ba2bdcf77a2a4fc85ad896b0624e8ff09。edgeContains末尾の全辺走査は旧/現で同形。旧convexHullサンプルには現版が既に除去したlocal hull分も含むため、全量を再改善可能と扱わない。

## 提案1: private verified edgesのmixed-sign確定でfalse終了

`src/09g_layoutsC_placement.js:222`のedgeContainsは、凍結数値座標から作ったprivate edgesについて、pos/neg両方がtrueになっても末尾まで走査する。既存計算式/epsilonのまま、両方true後は最終戻り値falseが確定。辺順/演算式/境界判定を変えず終了できる。convex方向を仮定した片側だけの棄却やAABB近似は不要。

有効なのは外側polygon候補を順番に探すrenderループの「不一致候補」。次の候補へ早く進める:
- 09g:495 stationary hold、502 stage envelope（.some(q=>p.every(v=>contains(v,q))))。
- 09h_layoutsC_editorial.js:308 strict/stage envelope。
- 09j_layoutsC_japanese.js:265/266 primary stage/strict envelope、235 shoji shadow等。
- 09i_layoutsC_objects.js render中body.full/body.holdへのpolygonContains（全頂点につき両方判定）。ただし実際にinsideばかりなら早期終了効果なし。

注意: qがprivate verifiedでも公開helperへ渡されるpは任意objectのまま。単に公開helperへ早期returnを追加すると、既存の繰返しp[0]/p[1]取得が減る場合がある。変更するなら、上記renderが自身で生成したfresh primitive二座標点という内部経路に限定するか、同等の所有/値条件を満たす経路だけへ適用し、任意pへの現fallbackは維持する。generic contains fallback全般への無条件変更は提案しない。新たな攻撃的調査は不要。実record/replay、全polygon存在/観測、失敗条件は維持。

## 提案2: nativePath localbounds hit時の不要stroke点配列生成を遅延

`src/09a_placement.js:203-204`、native fill/stroke handlerで`guardedPoints = k==='stroke' ? bPoints.flatMap(...) : bPoints`をcachedNativeLocalBoundsの前に生成している。hit時はcompute callbackが呼ばれず、このstroke配列が使われない。既存compute callbackの中へguardedPointsの構築を移せば、miss/fallbackの演算/点順/値は同じままhit時の一時配列だけ省ける。現rawのhits12455はfill/stroke合計なのでstroke対象件数や節約量は不明。大きな速度効果は主張しない。

同箇所の「local convexHull→bounds」と「矩形4頂点をworldへ変換→device-axis ±1 guard convexHull」は同じ仕事ではない。前者はlocal-space padding、後者は変換後のAA。strokePad後±1とworld±1をまとめたり、local rectangleをworld AABBへ置換すると幾何が変わるため不可。world hullの結果cacheを足すより、まず上の不要allocation除去だけに絞る。

2案とも未実装・未測定。repairMemo容量修正の効果とは別。実装する場合は担当6.1-sol mediumへ通常同値確認を返し、record/replay80・observation80、完全geometry/入力hash/元thresholdを維持して親レビューする。

親判断: 提案2の不要stroke点配列遅延だけを指定実装担当へ返す。提案1は公開p読取り条件の追加設計が必要なため今回採用しない。速度効果は未実測。親は画像を開いていない。
