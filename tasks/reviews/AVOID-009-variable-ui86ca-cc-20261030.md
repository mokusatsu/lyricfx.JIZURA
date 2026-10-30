# AVOID-009 variable UI86ca–86cc — implementation handoff

実装担当ui_viewport_performance（親指定gpt-6.1-sol/medium）。開始HEAD837fadcc、開始worktree clean。既存009の承認済み6演出一般化／通常UI接続のうち、未登録電球候補の可変preview寸法と処理区間のみを扱った。製品src/index/日英HTML、承認済み媒体、旧source/raw、86bx07/08失敗結果は変更していない。commit/pushは親。evidence-driven-task-managementとmanaged cloud runtime skillを適用。親の最終差分レビュー・保存判定待ちで、009全体完了／製品登録とはしない。

86caはdesign1920×1080を維持し、実view寸法由来のscaleで専用DOM接続Canvasを作る。整数width1..1920・height=round(1080×width/1920)以外はunsupported。context snapshotに寸法・scaleを持ち、stage前取消、step/frame前のlive寸法一致、入力key・世代・font/context依存照合を保つ。全時計・全所有物の元処理、device円余白2.7/support pad2、全held-qualityと最終destination replay、現frame字体測定と8MiB予算は維持。固定文字・seed・円による分岐を加えていない。入力によって安全な候補がなければ明示拒否する。

最初の86ca actual01は720の通常UI成功後、自然480の不足を成功必須assertが拒否してaggregate失敗。生失敗を保持。86cbは同一HQ.checkをレシピ単位で実行し、全heldInputと既結果を予算計上したままyieldする。86ccは純粋FD builderをgeneratorへし、元検証・全callback・最終データを保持しつつ16preimage/own-index単位でyieldする。同期buildは同じgeneratorをdrainし、compilerのyield*により途中取消は元finallyとfinalAccount.clearへ伝播する。不変の私有情報だけ既存計数再利用を使い、全時計・全所有物の検証を削らない。

86cc actual01は同runtimeで720×405（円radius.2/y.2）、自然480×270（同円）、自然480×270（radius.1/y.1）の実UI計画を順に扱った。前後2件はready/通常UI1frameで、86cbと同hash af614a…/004403…。同円480はnative品質passだが配置なし、compactはcaption gap、2行はrow/caption/neighbor gapが不足してtyped INSUFFICIENT_SPACE。ready false・モデル/record/binding0と旧結果非公開を維持する。これは有限候補の十分条件拒否であり、全ての配置が不可能という証明ではない。成功例はlyrics準備途中取消、font/circle変更routeで旧所有物解放も記録。字体selectorの値自体を変えた新font資格ではない。

単発wall計測：86cbは720max136.4ms（FD iterator132.4ms）、480小円max97.9ms。86ccは720max108.1ms、480小円max80.9ms、ready区間10.540s/8.756s。FD分割後720のsetupはiterator47.3ms、preimage/index batch最大4.7/8.1ms。model-outputはiterator17.9msに対し外側95.3msで、publication・guard・計数等の外側処理も残る。CPU原因や上限/percentileとは断定しない。実用性能・正式性能は引続き未達で、周辺改修へ広げずこの単位を保存区切りとする。

試験は96幾何assert（6scaleと独立数値矩形/円分離・高さ不一致拒否）、元286品質境界assert＋3recipe一括/分割全JSON同値、元19FD assertを旧/新両方で確認、1/17/157/512clockの旧/新全JSONとcallback件数同値・途中return、30mock寸法binding/拒否、14session lifecycle mock、全JS構文・generator再生成一致。これは実Qt全resize/font matrixや独立全paint oracleの代用ではない。

実試験入口は管理Qt runnerのみ。生成前空き約11GiB、各32MiB/180s宣言、同時実行1件。86cb02/86cc01はcomplete/errors0/postPinsUnchanged、3窓正常close・所有子回収・残存0/signal0・port閉。86ca01はprobe失敗だが同じ正常回収を確認。plain lifecycle fixture専用checkerはproduct probeのpagesキーを想定しないためそのまま使えず、各host/pages/startupを直接照合。親は途中で86cbの27pin/5raw、86ccの28pin/5rawと回収およびhash同値を独立照合したと連絡済み。source全体と新summaryの最終レビューは親が行う。

正本原本はGit外 `/workspace/jizura-logic-evidence-20261027/bulbs-variable-ui-source86ca01` / `source86cb02` / `source86cc01` と対応actual/runtime。86cb01は生成中の2箇所一致assertで止まった未実行builder部分物を保持。小summaryと詳細手順は `dev/avoidance/bulbs86/variable-ui86ca/README.md`、86cb/86cc同名path。新規JS/generator/builderは凍結し、以後の修正は別namespaceで行う。不要な媒体・一時大rawの生成0、公開/Sites/Pages閲覧0、製品反映0。

未実施：独立全時刻paint/RGBA oracle、他入力・全dynamic viewport/real font matrix、残り演出の一般化、通常製品への登録、正式性能資格。旧86bx07/08は失敗のままで、86bz粒子対照の限定説明をそのまま保持する。
