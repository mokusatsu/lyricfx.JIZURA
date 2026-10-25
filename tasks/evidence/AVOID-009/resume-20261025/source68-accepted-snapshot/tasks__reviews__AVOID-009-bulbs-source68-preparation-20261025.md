# 電球68 source準備・最初のレビュー区切り

基準work HEAD `4d8378a81e4e8ed881ca1af95972c4fcf9cc2790`。親が有限設計を受入後、同じgpt-6.1-sol/medium担当が準備。source準備であり、アプリ/adapter/配置の合格ではない。

変更:

- `src/11p_layoutsD.js`: private Symbolの同期recipe binding。元registered render内にだけtext/字号/padding/radius/元N sampling/元字幕サイズの宣言分岐を追加。recipeはcatalog kind/nativeOnly/sourceProofをnativeと分離。初回の4漢字かな以外・grapheme拡張・明示サイズ/異なるcontentScale・plan.lang不一致等はtyped拒否。culled時は元q/out/理由と空catalogを確認し、存在しないr/字幕を要求しない。非culled字幕は実ss/q/fitSizeの元式で検査する。
- `src/09a_placement.js`: recipe catalogのprogramはnativeBulbsTransport51と別の`bulbsRecipe68Transport`へラベルを移し、nativeGeometry=false/safetyCertificate=falseを保持。
- `src/11p_layoutsEe_bulbs_geometry68.js`: 4recipe/最大8side候補、元構成保持・1行枠調整優先、4px内側配置の生成、captured-doubleの正確なdyadic判定（接触は拒否）、不足/未評価/品質不合格の区別。保守矩形モデルであり連続配置の不可能性を証明しない。
- `dev/avoidance/layouts-d-bulbs68-source-test.cjs`: geometryとactual binding helperのsynthetic runnerを準備。円への接触、境界外、1行優先/旧offset固定なし、explicit除外、品質不合格、予算・determinism、t0/earlyq<1/held/expiredcull、誤字幕/誤cull/言語不一致を確認する。未実行。
- `dev/avoidance/layouts-d-bulbs68-source-audit.py`: 宣言した分岐/入口を逆変換し、11p全体と09aが基準Gitblobに完全一致することを確認。実行PASS。Nodeの構文確認は4JS/CJSでPASS。アプリ機能試験の結果ではない。

親初回指摘への修正: 正当なculled catalogでr/rings/subtitleを要求しない。q<1で変わる字幕サイズを20.736固定にしない。改行はlayoutTextのglyph iを変えないことをsource確認したが、実mainDraw/各passのnative比較はまだ行っていない。

未完: fresh native参照を取得したcontext/fontrevision/source/helper/clock/rootへbindする機能、全Number状態のpaint支持/品質取得、actual destination行列での再認定、Ef adapterとframe preflight/render接続、JAEN build/native比較、正式性能・保存本体。現recipe APIの参照値検査だけでfreshnessや安全性を認定しない。adapterは未登録でsafe表示を有効にしていない。次は親fullsourceレビューと指摘対応、その後に同担当が未完の最小sourceを準備する。

browser/build/画像/動画/公開結果確認/Git変更操作/fixture freezeは0。Git資料保存は親が担当する。容量・TMPDIR・Node/font/browserは新規runの前提を別途確認し、rawをworkspaceだけの必須資料にしない。必要なbefore HTMLは基準Gitblobを直接使い、大きなworkspace複製を作らない。

## 親レビュー修正2

- recipe/reference cloneを再帰コピーへ変更。-0と存在するundefinedを保持し、Object.isのown-clock比較を損なわない。
- recipe ringだけnativeCount/actualStep=新周長÷元N、spacing=actualStep、固定元Nの新derivationを出力。native ring metadataは変更しない。
- 全recipeでzero位置を先に検査。早期winnerの後続recipe/位置は理由付きnot-evaluatedとし、位置評価はlazy化。全空支持tableはBULBS68_EMPTY_SUPPORTSで未認定のまま。
- binding callback例外後のSymbol cleanupと次呼出回復、signed-zero/undefined、非native zero維持、後続未評価/空支持のsynthetic試験を追加。

再実行: synthetic31 checks PASS、基準4d837への逆変換audit PASS、変更JS/CJSの構文確認PASS。native描画・アプリ・ブラウザは0、fresh参照bind/adapterは依然未実装。この実行は純粋なsynthetic/source helper検証であり実font/Canvas/各own時計での配置合格ではない。
