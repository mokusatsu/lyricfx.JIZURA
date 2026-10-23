# AVOID-008 named CPU forwarding labels — read-only design

固定Git5007c71bfdf099f122a577c4c14578628672ca0eだけを参照。impl編集中のlive09gは読んでいない。製品/helper/Git/browser/CDP/計測変更0。この報告は追加実行の決定・許可ではない。

## 判定

**A.record/A.replayの既存fixture計数wrapperに名前付きforwarderを足す方法は、固定fixture内のCPU専用診断として成立する候補。C native source/transport sealは壊さない。** ただしV8 CPU profileにinline祖先名が実際残ることは未確認。見えなければlayout帰属不可として終了し、clock推定やformal合格へ代用しない。

固定fixture26行はcold開始前にA.record/A.replayを一度だけwrapperへ置換し、phase非idle時の実counterを増やして元originals[name](...args)を呼ぶ。recordはargs[1]がenv（09a120）、replayはargs[0]がenv（09a254）。native source seal（11p8–9）はJ.LAYOUTS[id].render identity、transport seal（11z5–6）はrenderer.drawCut/makeEnv identityなので、この二つを触らないwrapperの外側でならnamed転送可能。09gのcacheDependenciesはA全公開helperとRenderer.prototype等の関数identityを捕捉するため、新wrapper/table/全named関数はcoldより前に一度構築し、4preparationsと6hit全期間で不変にする。途中のwrapper差替え/追加は不可。6warm内は実record0なので、record labelsが現れないのが正常。labelsで測るのは別render profile内のrecord/replayである。

## 最小 forwarding 設計（未実装）

既存wrapperのcounter更新はそのまま維持。phase==='render'の場合だけ、recordではargs[1].cut.layout、replayではargs[0].cut.layoutを追加で読む。newspaper/warningLabel/stampSheet（必要なら34全ID）ごとに、静的で明示した名前付き関数へ既存rest-args配列を **一つの引数** として渡す。例示の役割は `record_newspaper(args) -> originals.record(...args)` と `replay_newspaper(args) -> originals.replay(...args)`。named関数側に再rest配列を作らず、元call target/args/this形を維持する。未知IDは明示otherへ送り黙って除外しない。planning/idleは元の直接original呼出に戻せば、cold/font-auditに不要なenv.layout読出を加えずに済む。関数/tableをJ/Aへ公開せず、Function.nameだけを後付け変更する方式ではなく、CDP識別用の実named declarationとfixtureURL/宣言位置を固定する。

この診断は元instrumentationより **env.cut.layoutの追加読出と一つの関数call/dispatch** がある。任意getter/Proxyのあるenvに対して完全透明とは主張しない。対象は固定native fixtureが生成するown-data env/cutであり、実行するならそのdomainとfull output照合を明示する。frame timer、元時計、source、cut/recipe/options、80frames/16warm、閾値、glyph/geometryの変更は禁止。

## Renderer入口という代案

checksも含むframe全体をlayoutへ分類したいなら、固定fixture52行の既知cut.layoutを使い、**fixture私有の named frame forwarder** 内から元renderer.frame(ctx,final,time,同一options)を呼ぶ方法もある。公開Renderer.prototypeを差替える必要はなく、drawCut/makeEnv/native renderのsealとhelper identityを完全にそのままにできる。一つのcallと既知cut.layoutの追加readというoverheadは残る。requested cutと実際のrecord/replay env.cut.layoutの一致を独立確認できなければ、labelはrequested frameの名前に留め、actualsourceの証明とは呼ばない。

record/replay labelは実env由来なので当該費用の直接識別に向く一方、名前の外側で実行されるadapter checks/dispatchはlayout別に帰属できない。private frame labelはその外側も包括できるが、record固有の費用は元A.record実ancestorと交差させて分類する必要がある。両方式を一度に追加する必然性はなく、record費用だけなら前者が小さい。J.LAYOUTS.render、renderer.drawCut/makeEnvのwrapperはseal違反となるので不採用。Renderer.prototype.frameの公開wrapperもbefore-cold固定ならtransport seal自体は壊さないが、collector依存を余分に変えるため私有forwarderより優先しない。

## clockなし帰属の限界と必要証拠

新labelの実sample ancestorがあれば、該当layout群のrecord/replay rooted samplesをclock mappingなしで抽出できる。sourceURL/宣言位置/明示名を照合し、同名generic関数へ誤帰属しない。exclusive bucketは一つへ、inclusiveは重複として別記し、GC/root外/label不在samplesも独立保持する。labelがないsamplesをclock推定で補完しない。

同じlayout名を80全frameで使うだけなら、warm16とmeasured64や同IDの複数frameを区別できない。特にnewspaperは初期warmにも含まれる。この場合は「全80内のlayout群合計」と報告し、個別の遅いframe12ms/8.9msへ直接対応付けない。measured群だけが必要なら、既知のloop indexからprivate warm/measured flagを設定して別の静的labelをcold前に用意する追加案が必要で、別途明示reviewする。frameを増減したりsampleを恣意的に選ばない。関数名単独ではunprofiled wall p95との因果も立証しない。

将来実行gateが出る場合、(1)新旧fixture/driver完全逆変換とsource/clock/workloadの固定、(2)全4planning+6hitの依存identity不変、各6hit/0record/miss0、fullvalue/alias/freshfrozen/source入力不変、(3)元count更新1回を保持しON実80record/replay/obs、100staged/font/corpus全同一、(4)label実call countsと実ancestorの有無/件数を別々に記録、(5)見えない場合の「帰属不可」を停止条件にする。profile overheadをformal速度合格へ使わず、215CPU診断と214元100FAILを別に保持する。現時点はsource上の実行案のみで、V8実表示・追加費用・帰属成立を測ったとは主張しない。

## 固定入力

|Git5007 path|Bytes|SHA256|
|---|---:|---|
|dev/avoidance/layouts-c-perf-phases-fixture.js|29781|e1ef5650d701db6509974a5ef09234d24e69b82430031286bb6b8b5d3631beb7|
|dev/avoidance/immutable-edge-phases-profile.cjs|12648|e55b10826b34797e5549634be4b0a116cc6e735744283b0c00dde7af526b62da|
|src/09a_placement.js|61877|e22e968e8c6b4619216c2e432805d4af469338366fd78e8a4fd2f0b9771a3ae4|
|src/09g_layoutsC_placement.js|70142|3a333a6bab6aa61a71c652fb83b7c647d24939527e8aafb744768e642a8d7072|
|src/11p_layoutsC.js|281382|2229f1cb916d73e730beeef494c3ee77411bfffbb2ea64eb173111cc4d2a4b17|
|src/11z_layoutsC_transport.js|371|d7dd51dfff9df3410587212e908eee5f87bb08397aa0d13c0309160f30201091|
|src/09_render.js|35792|e793af7e826ddf61d2a4aaf4355615b07344b0e4e1ca395754b47c260f22b623|
