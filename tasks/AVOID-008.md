# AVOID-008 拡張Cの34レイアウトの対応

- 状態: 実装中
- 段階: 通常軌道
- 技術依存: [AVOID-005](AVOID-005.md)
- 事業優先度: 未指定。記載順は技術上の推奨順。

## 2026-10-23 JST 現在の指示と開始記録

- 現765/4addの[元正式100/1000を親がrawから独立再計算](evidence/AVOID-008/parent-dependency-string-memo-formal01-review.json)。8side全完走・全9入力hash一致・120archive/173依存/86製品/実kernel1/reapgone/close/reserveを確認。100ON計画2.102倍/描画+4.0ms、100OFF計画2.070倍/描画−0.8ms、1000ON計画3.863倍/描画+3.0ms、1000OFF1.618倍/+0.2msで正式FAIL。旧baseline入力差は現版で解消したが、現1000ONのrepair full8/capped8/fast0が具体的未達要因として判明した。指定担当は主pool128MiB/元codec/geometry/基準を維持し、最新1entry補助memoの有限容量設計をsource/pure段階で修正中。別read-only担当が描画処理の同値省力化を調査し、追加browser/性能/画像/公開確認は未実行。環境はactual230/230currentへ更新済で旧229との速度因果比較はしない。main製品未採用、4構図未回答、009以降未着手を保持する。

- dependency文字列再利用9bdb232の[親source/pure](evidence/AVOID-008/parent-dependency-string-memo01-source-review.json)で元collector/generic・他83source・日英84module逆変換・74正常再実行のraw完全一致を受入。[全field paired browser](evidence/AVOID-008/parent-dependency-string-memo-browser01-review.json)も144frame/全結果一致。続く[元100診断の親再計算](evidence/AVOID-008/parent-dependency-string-memo-diagnose01-review.json)はON計画92.6/82.7ms=1.120倍・描画+3.1msで描画未達、OFF1.501倍/+1.1ms。単発baseline82.7msの揺れを保持し因果改善/正式p95合格は主張しない。同一診断の再試行や僅差への推測修正を繰り返さず、現765fixture/4add corpusの元正式100/1000（3warm/6sample、80render/16warm、2倍/+3ms）で評価する準備へ進む。1000のmemo適用率/正式性能・main結合・4構図確認は未完。公開結果確認と追加サイバー調査は実行しない。

- dense decoded freeze版6b97206は[親source/pure](evidence/AVOID-008/parent-dense-decoded-freeze01-source-review.json)と[全field browser144frame](evidence/AVOID-008/parent-dense-decoded-freeze-browser01-review.json)を受入。元100診断も[親が入力120・固定証拠133・実kernel/cleanup/reserveを照合](evidence/AVOID-008/parent-dense-decoded-freeze-diagnose01-review.json)したが、ON計画103.7/48.3ms=2.147倍で未達、描画追加2.6msは診断基準内。OFFは1.375倍/+0.2ms。正式p95/1000成功にはしない。既存profileに基づく依存情報の厳密有界再利用を指定担当が通常source/pure段階で実装中。旧formalの入力差は[現765fixture/4add corpusに修正済み](evidence/AVOID-008/formal-fixture-readonly-current-corpus01.md)で、現在の正式1000は未実行。main製品未採用・元4構図未回答を保持し、ユーザー確認フェイズまで内部作業を継続する。公開結果確認/追加サイバー調査は行わない。

- [候補finalization限定CPU診断を親受入](evidence/AVOID-008/parent-node-wire-finalization-profile01-review.json)。同じ100cutの各ON/OFFで4prewarm後8hit/8fast/record0、入力/出力/alias/descriptor/凍結/ID不変。全112archive・173実依存・84module UTF16line-map・実kernel388354/reap/gone/reserveを独立照合。J.finalizePlacementPlan祖先sampleだけ抽出するとON403884us（8call）の内訳は復元110400、freeze92192、keyencode58497、依存55510、signature37320、edge20226、他29739us。制御隙間/idle/program415589usは除外し、正式性能値にはしない。次はfreshdecoded private rootに限るdense-array freezeを元と同じ最後の時点で行い、配列のObject.values一時確保を省く。cold/非C/一般freezeと変更済みhelper環境は旧fallback、geometry/codec/二重verifyは変えない。main未採用・旧性能未達・正式1000/元4構図未完を保持する。

- node JSON再利用版2f3a837の[親source/pureレビュー](evidence/AVOID-008/parent-node-wire-encode01-source-review.json)で元generic/41通常byte一致・165既存通常+5 lifecycle・他83source・全84module日英逆復元を確認。[paired browser](evidence/AVOID-008/parent-node-wire-encode-browser01-review.json)も全field（統計含む）・144frame/プログラム/alias/観測が完全一致。続く[元100診断の親再計算](evidence/AVOID-008/parent-node-wire-encode-diagnose01-review.json)はON116.9/46.3ms=2.525倍・描画+3.4msで未達、OFF1.697倍/+2.1ms。source時間の変動があり1点からnode再利用の速度効果を主張しない。全4side機能・120入力・133固定証拠・実kernel/cleanup/reserveは維持。次は製品を変えず、同一100cutの候補finalizationだけを各ON/OFFで4prewarm後8hit限定CPU診断し、実hotspotから修正箇所を選定する。別診断であって元合否用runner/fixture/2x,+3msやgeometry/freezeは変更しない。main未採用・正式1000/元4構図未完、公開確認/追加サイバー調査は行わない。

- local hull memo版の[paired browser親レビュー](evidence/AVOID-008/parent-native-local-bounds-memo-browser01-review.json)で全旧field・144frame・program/alias/観測が一致し、実target hits193を確認。保存後reserve249.79MiBの逸脱は残し、旧untracked生成previewを全SHA保持で別領域へ移し元pathも維持して復旧した。続く[元100診断を親が独立再計算](evidence/AVOID-008/parent-native-local-bounds-memo-diagnose01-review.json)し、ON計画100.4/45.2ms=2.221倍・描画+2.4ms、OFF1.706倍・描画+3.5msで未達。120入力・全4side・実80record/replay/観測・133固定Git証拠・exit0/reap/gone・今回reserveを確認。計画は1点で正式p95ではない。次はcacheEncodeで既存node JSON文字列を再利用し、末尾の全graph二重serializationを減らす通常byte同値実装へ進む。nodeごとの厳密予算・二重verify・geometry/freezeは維持する。main製品採用/正式1000/元4構図は未完、追加サイバー調査と公開確認は実施しない。

- 第一local hull/boundsの完全一致memo版 `9848672` を[親source/pureレビュー](evidence/AVOID-008/parent-native-local-bounds-memo01-source-review.json)で受入。通常46件を親でも再実行し全program/V8 alias/native traceが一致、上限・clear・衝突・signed zeroも確認。既存installer stubの通常165件/5 lifecycleを保持し、他82 source・全84moduleの日英HTML・2source逆復元・135固定Git pinを照合した。512entry/1048576座標slot/8192点pathの別管理有界memoで、hitもfresh bounds、miss/非C/validation/nonstock/capは元算法。追加サイバー審査は省略し、通常paired browser比較の準備へ進む。新速度は未計測、旧2.197倍/描画+4.40ms未達、main製品未採用、元4構図未確認、AVOID-009以降未着手を保持する。公開結果確認は行わない。

- CTM版の[元100診断を親が独立再計算](evidence/AVOID-008/parent-native-command-matrix-diagnose01-review.json)。ON58.7+54.0=112.7/51.3ms=2.197倍・描画追加4.40msで未達、OFF1.368倍/追加1.80ms。120入力/3support/173実依存/86製品/140manifest、旧全4side機能fields・実80record/replay/観測、exit0/reap/goneを保持。計画は1点で正式p95ではない。次はC nativePathの第一local hull+boundsを、全座標・paint/padの完全一致時だけ私有有界cacheで再利用する実装へ進む。missは元算法・検証、hitは前回の4scalarをfresh objectへ戻し、world変換/第二hull/全80pipelineは維持する。512entry/1048576coord/8192point上限と既存clearへの連動を設け、数式の近似・scalar extrema・検証除外へ置換しない。追加サイバー審査は行わず通常cache衝突/float/alias/lifecycleを確認する。main採用/正式1000/元4構図は未完。

- CTM再利用版d298の[旧新pairedブラウザ照合を親受入](evidence/AVOID-008/parent-native-command-matrix-browser01-review.json)。旧ccfe/新d298の全HTML・同exerciseで各40通常＋別2角小円の経路例を実行し、各84fast/72frame（計144）の全results・program/alias hash・画素・観測が一致。各実program63/観測63、計画cold record427/warm-fast0を確認し、角小円のstamp nativePath144/newspaper line45を通常円成功例へ置換しない。全frameerror0、112input/173実依存/86product/19manifest・実waitpid0/reap/goneも照合。内部の読出再利用に追加の人間確認は不要と親判断したが、元4構図は未回答のまま。旧+4.9ms未達を保持し、次は元100の別診断を準備中で、速度成功/正式1000/main製品採用はまだ主張しない。追加安全性審査と公開結果確認は実施しない。

- C command/lineのCTM読出再利用版`d298d6a`を[親source/正常pureレビュー](evidence/AVOID-008/parent-native-command-matrix01-source-review.json)で受入。通常40ケースの全native program/V8 alias/traceは再実行も一致し、実getTransformだけ1161arcで1160回、4096commandで4095回、2/17点lineで5/20回減。transform/reset/save/restore/canvas/helper/再入を確認し、非C・validationOnly・非stock pointは旧経路。元のgeometry/hull/replay/freeze/signature・他83source・09gを維持し、JAEN全84moduleとHTML逆復元を照合。新sourceのbrowser/速度は未実行で、旧ccfeと新d298の完全HTMLを別realmで同じ40条件＋stampSheet/newspaper2目的例へ通す比較を準備中。追加サイバー審査は省略、旧+4.9ms未達は保持し、main製品採用・正式1000・必要4構図は未完。

- memo版の[正常40条件の親レビュー](evidence/AVOID-008/parent-validated-repair-memo-browser01-review.json)を受入。全80fast read・54native frame/観測45件は一致し、旧64,424leafとの差51は追加readによる世代番号+2*iのみ。111入力/173実依存/86製品と実waitpid0/reapを照合。続く[元100診断も親が再計算](evidence/AVOID-008/parent-validated-repair-memo-diagnose01-review.json)し、ONは99.6/50.1ms=1.988倍・描画追加4.90msで未達、OFFは1.657倍/追加1.50ms。120入力/3support/実80record/replay/観測/字体/全100cutを保持し、計画は1点で正式p95ではない。次はCの同一command列/line内のCTM読出をまとめる狭い性能改善を指定sol担当が実装中。通常のtransform/reset/再入・出力oracleを確認し、追加サイバー審査は省略。main採用/正式1000/必要4構図は未完、旧FAILと公開確認禁止は保持。

- 同一payloadの検証手順memo版`3166516`（証拠固定`ccfe825`）を[親がsource/通常pureレビュー](evidence/AVOID-008/parent-validated-repair-memo01-source-review.json)で受入。旧decoder・他83source・通常freeze/signature・key/二度目verify・budget/LRU・描画は維持し、JAEN全84moduleとHTML逆復元を照合。親再実行の165正常ケース/5lifecycle・1full+2fast・全descriptor/alias/freshnessとraw/summaryが一致した。新規サイバー審査は省略。次は同じ40通常browser条件のfast read/描画確認を準備中で、追加helper mutation/巨大budget/security matrixは再実行しない。新速度・正式1000・main製品への採用・必要4構図の人間確認は未完。新runtimeは222/222 currentで、旧215との差を速度改善とは扱わない。

- 最新利用者指示により追加のサイバーセキュリティ審査・攻撃的Proxy/prototype fuzzの安全性調査は省略し、通常機能・幾何・描画・性能の確認に絞って続行する。[運用正本](implementation-review-policy.md)。事前freeze案は採用保留とし、09aの通常freeze/signatureは変えない。現在は同一のimmutable payloadについて、初回の旧decoder検証後にpath/scalar/null-prototype手順を最新1entry・上限付きで再利用し、各hitの出力graphは新規生成する通常性能改善を指定sol担当が実装中。key/dependency・二度目verify・既存budget/LRU・描画/pipeline/基準は維持する。新規安全性matrixの実行や合格は主張せず、通常DAG/alias/freshness/descriptor・保存fixture等の機能oracleを親がレビューする。

- 遅延edge3bの[元100診断を親が独立再計算](evidence/AVOID-008/parent-immutable-edge-lazy-diagnose01-review.json)。ONはsource51.5+finalize62.4=113.9ms／基準52.2ms（2.182倍）、描画p95追加5.2msで未達。OFFは1.393倍/追加1.1ms。120入力/173依存/86製品/3supportを元bytes・固定Gitと照合し、全4side/100cut・region/34ID・ON100staged/実80record/replay/観測・字体を保持、旧8ffの機能fieldsも一致した。実PID369130を親bootstrapがwaitpidしexit0/reap後gone、close後livejob0を確認。これは1点の計画診断であり正式p95や1000の成功ではない。追加runをせず、描画側はnativePathの私有境界計算で高価なguardを減らせるか、計画側はprivate decode由来DAGのfreeze準備を通常経路の意味を保って改善できるかを指定担当がread-only設計中。main製品への採用・4構図の人間確認・009以降は進めていない。公開結果確認は恒久停止。

- 遅延edge版3bの[新browser02親レビュー](evidence/AVOID-008/parent-lazy-browser02-raw-review.json)を受入。旧機能66,163leaf・40組/28負例・419cold実record/0warm・18+18native frame/15+15観測・196ledgerを保持し、新9stats×52箇所だけ追加した。110保存入力/173実依存と固定b5 raw SHAを独立照合し、実warm 25,008hit・176polygon/1,743辺の準備を確認。browser01は親gateの配列順不備で起動前停止した別証拠で、173path/hashは同じだった。02のrunnerはPID1配下のZとして残存するためgoneを主張せず、同一PID/startTicksのkernel stat field52=0で実終了0を確認した。表示変更の追加人間確認は不要だが、元4構図の人間確認は残る。次の元100単独速度診断を[親が新source/preload逆変換で準備受入](evidence/AVOID-008/parent-immutable-edge-lazy-diagnose-preparation01-review.json)。元runner/fixture/corpus/基準/100ONOFF/実80frameは維持し、fresh215のruntime02と全期間exclusive leaseで1回だけ実行する。新速度の合格・正式1000・main製品採用・009着手はまだ主張しない。

- 遅延edge準備の固定版`3b0c995`を[親source/pureレビュー](evidence/AVOID-008/parent-immutable-edge-lazy01-source-review.json)で受入。対象は09gの私有registryだけで、他83source・元の4述語・描画・通常freeze・codec/key/dependencyを保持し、日英の全84変換済みbundleとHTML逆復元を照合した。親が元driverを別出力先で再実行し、55,677照合/64controlsと5成果物全文、94開始終了pinの一致を確認。primitive/-0をfreeze前に変えた場合は現在値を採用する内部加速条件に変更したが、旧述語の最終bool/読出・例外順序は保持する。実browser/速度はこのsourceではまだ未確認。旧40組/28負例を保持するbrowser派生を準備中で、main製品への採用・正式1000・必要4構図の人間確認へは進めていない。

- 現在8ffの分離CPU診断を[親が元raw・117保存入力・173実依存・4profileの排他的内訳・6出力bytesで独立照合](evidence/AVOID-008/parent-immutable-edge-profile01-review.json)。6回の全体hitはいずれも実record0、ONの実80record/replay/観測・全100staged・字体と元functional fieldsを保持した。6warmのrooted 774.123ms中357.115msがedge登録で、描画で未使用のpolygonも前払いする実装が主要負荷だったため、指定sol担当が点参照だけを先に保存し、最初の利用時に不変性を確認して辺を準備する案を実装中。通常55,673条件の結果と4観測順序を維持するpure/buildを準備し、親レビュー後に新sourceの実browserと元100診断へ進める。CPUは215環境の診断で旧214の速度FAILを置換しない。ON描画はclock差29.423msにより全80frameの内部sampleが0で、個別演出へのCPU帰属はできない。[私有named転送関数の設計案](evidence/AVOID-008/parent-named-phase-label-study01-review.json)は実行せず保持し、追加profileを許可した扱いにしない。main製品はhang受入5fのまま、正式1000・必要4構図の人間確認・009以降は未完/未着手。公開結果確認は恒久停止。

- immutable-edge試作`8ff3dd8`は[親source逆変換](evidence/AVOID-008/parent-immutable-edge-source01-review.json)・[元55,673条件＋別18,000条件の独立照合](evidence/AVOID-008/parent-immutable-edge-pure01-review.json)・[新browser02の40組/28負例](evidence/AVOID-008/parent-immutable-edge-browser02-review.json)で正確性を受入。全旧値/alias/18+18frame/15+15観測は一致し、実warm描画25,008hit/176初回検証/reject0を確認した。browser01はChromium起動前のlocalhost listen EPERMで未実行として保持し、明示network権限の02だけが本試験である。続く[元100の単独診断](evidence/AVOID-008/parent-immutable-edge-diagnose01-review.json)はON計画48→152.2ms（3.171倍）、描画2.7→7.8ms（追加5.1ms）で未達。全100staged/実80record・replay・観測と入力/字体を維持したが、正式1000は未許可、main製品への採用は保留。登録時の仕事を減らす案と、元の「単一envelopeがpolygon全頂点を含む」意味を保つ探索案をread-only評価中。点ごとの別envelopeへ意味を変えず、一般getter/Proxyの読み飛ばしも行わない。 [次案read-only評価](evidence/AVOID-008/parent-next-render-readonly01-review.json)で、現在の遅いnewspaperはsafe=falseで探索を通らず、stampSheetはbody直接判定と確認したため、複雑なhint実装は計測前に採用保留。遅延edge準備は計画の候補として残し、製品を変えず現在8ffの分離CPU診断を準備する。新環境観測は215/215 currentで、旧214の性能結果を置換しない。

- nativePathの最初の局所hullを極値へ置換する試作は、[親レビュー](evidence/AVOID-008/parent-native-path-extrema01-review.json)で60組の全program/traceとV8 graph bytesを照合したが、命令ごとのdescriptor/key走査が増えるため計測前の候補選別で採用保留。実測FAILとは扱わず、試作・純粋oracle・失敗歴を保存し、09a/JA/ENを固定446ed00の全bytesへ復元した。次は指定担当が、decode由来で不変性を証明したpolygonの辺差分だけを最新1世代で再利用する案をsource/pure段階で実装中。通常freeze、旧述語へのfallback、全edge走査、実record/replay経路、性能基準は維持する。browser/性能の新合格や1000適用率は未確認。

- tree codecの[新browser親レビュー](evidence/AVOID-008/parent-payload-tree-browser01-review.json)は105入力/173依存・40cold/warm全値alias・419cold実record/0warm/40hit・旧25＋新3負例・196会計箇所・schema/両budgetを受入。40行の旧noncache全field、18+18native frame digest/15+15観測もfd6と完全一致。非Cの既存回帰は[到達済みassertionだけ限定carry](evidence/AVOID-008/parent-payload-tree-core-carry01.json)し、fresh22再実行や既知3失敗の成功化は主張しない。続く[元100単独診断の親レビュー](evidence/AVOID-008/parent-payload-tree-diagnose01-review.json)では120＋3入力/173依存・全100staged/実80record-replay-観測を保持。ON計画72.3→108ms=1.494倍、OFF51.5→68.6ms=1.332倍だが、ON描画2.9→8.4ms（追加5.5ms）は未達。正式100/1000は未許可、旧FAILを保持し描画の重複処理を調査中。main製品へは未結合、4構図の人間確認も未完。

- payload専用tree形式`7bd83c23`を[親source/pureレビュー](evidence/AVOID-008/parent-payload-tree-source01-review.json)で受入。他83source・描画・元入力encoder・通常freeze/signatureを保持し、実codecは旧v1 snapshotのみから変換、old admissionとactual compactの会計を分離する。[親の独立1,000 DAG/8,819 object照合](evidence/AVOID-008/parent-payload-tree-fuzz01.json)も旧全文/alias/descriptor/fresh read一致、200 getter/setter対照の呼出0。既存40組/25負例を保持し3負例と会計を加えた派生driverを11逆変換・86製品/173依存/15字体pinで親確認し、runtime214の[1回限定browser gate](evidence/AVOID-008/performance/payload-tree-browser01-parent-gate.json)へ進めた。browserと速度の合格は未判定。先行fd6回帰/CPUの証拠だけは`3598053`へpush済み、製品はmain未結合のまま。nativePathのhull省略は証明不足のため[今回は不採用](evidence/AVOID-008/performance/native-path-bounds-study01/parent-decision.json)。

- 統合fd6の既存回帰22jobを[親が元ログ・133記録hash・86 Git入力・13共通試験入力で独立照合](evidence/AVOID-008/parent-core-fd6-review01.json)。変更前後とも8成功/3失敗で、新規候補だけの失敗はなし。歌詞areaの35行とcompositingの既知RGB不一致は失敗のまま保持し、その先のUI/保存/EN/exportを成功にはしない。続く[分離CPU診断の親レビュー](evidence/AVOID-008/parent-final-c34-profile02-review.json)では113保存pin・173依存file・4実profileを確認。warm finalizationのdecodeが主負荷だったため、元key/dependency/二度目verify/通常freeze/両容量上限を保つpayload専用のJSON tree＋alias修復形式を指定担当へ実装依頼。約30%の縮小はoffline表現の推定であり、速度合格ではない。新codecの正確性/性能・正式1000・必要4構図の人間確認は未完、main製品への結合前に008内で継続する。

- 隔離結合fd6の[親実raw正確性レビュー](evidence/AVOID-008/parent-final-c34-correctness03-review.json)は40cold/warm全値/alias、25負例、173依存file、104開始/保存pin、110ledgerを受入。38行は旧03とkey会計以外完全同一、変更2行のみ障子不足/値札safeへ更新。続く[元100の単独診断](evidence/AVOID-008/parent-final-c34-diagnose01-review.json)は元入力SHA不変で100/100 staged・実record/replay/観測各80・全34ID・font/cmapを確認したが、ON計画54.1+72.4=126.5ms/基準45.4ms（2.786倍）、描画追加4.5msで未達。OFF単一点の基準230.7msも置換せず保存。計画p95/正式1000成功とはせず、新sourceのCPU診断だけを追加して原因を絞る。main製品はhang5fのまま、証拠6dd7241をpush済み。全体回帰22job・必要4構図の人間確認は未完、009以降未着手。

- shadow1214044は[親source/実Canvasレビュー](evidence/AVOID-008/parent-shadow07-review.json)を通過。native camera rootを保つ09a限定修正後、日英120RGBA組・40guard・82役割字体文字/cmap・34font URL byte・294開始終了pin・両filter PNG2組byte一致を実照合。全10条件はtyped不足/safe0であり、blurを変えたり安全と偽認したりしない。原1画素FAIL・fixtureの字体/guardcode/URL失敗を保持。構図変更なしのためこの追加は人間不要、別4構図は必要なまま。cache/hang/shadowの[仮結合の独立逆変換・JAEN全84bundle](evidence/AVOID-008/parent-final-c34-provisional-merge01.json)まで確認したが、旧be15版の証拠なので修正版結合/全経路/性能/22回帰は未受入。source/checkpointを混同せず008のみ継続する。

- shadowのbe15 scope修正は[親source/pureレビュー](evidence/AVOID-008/parent-shadow-source01-review.json)で受入（12入力180不足/22positive49negative、実Canvas未受入）。初回browser01は試験字体の未収録「雨」で停止、元corpusを変えず追加mixed fixtureを収録済み字へ訂正したbrowser02もJA横長t=.6の実RGBA不一致で停止。両FAIL/旧runnerを保持し、原因の1時刻再現を担当へ返却。shadow/cacheはmain未結合、最終sourceは仮組立てのみ、全体回帰22job/正式性能/人間4構図は引き続き未完。main製品は値札受入版5f982bcまでpush操作成功、公開結果確認なし。

- 値札hangの[独立raw/幾何親レビュー](evidence/AVOID-008/parent-hang03-review.json)・[限定視覚レビュー](evidence/AVOID-008/hang-visual01-review.md)を経て、[main限定結合](evidence/AVOID-008/parent-hang-main01-review.json)を受入。全84source/JAENがtested`1f30863`と全byte一致し、170選択path・他82source・既存pycを実照合。日英各28条件6safe/18不足/4未対応、663実native/replay組、12segment120polygonと成立条件の実strict画素円cross0を確認。固定横移動以外の寸法/意味/時計は保持し、1代表8PNG+MP4抽出4frameに新crop/縮小/欠落がないため、この追加の人間確認は不要と親判断。旧empty-program FAILは保存、6物理サイズはcrop未証明で不採用、全条件成功とはしない。別4例の全体008人間確認・shadow/最終性能/回帰22jobは未完。

- 依存最適化03の[新browser正確性親レビュー](evidence/AVOID-008/parent-cache-dependencies03-correctness-review.json)を受入。104開始終了/live/archive pin、62,676全leaf/stringを独立照合し、534差分は実key会計のみ。40cold/warm値/alias、25負例、18+18frame/15+15実観測、110 ledgerが一致。render record/replay独立counterは未計測で推定しない。速度は未再計測、元94/76の正式経路FAILも未更新、cache sourceはmain未結合。

- 依存表現候補a383は、改変mapにより実collectorのJ.native差分が落ちる[親再現/修正レビュー](evidence/AVOID-008/parent-cache-dependencies03-review.json)でexpected FAILを保存。指定担当の`8f1ef58`はcaptured native/descriptor・map/constructor/speciesを厳格確認し、親の独立pure再実行も258同値・30区別・23新guard/変更getter呼出0・5途中変化拒否までbyte一致。source段階のみ受入、browser/速度は未確認。元formal/100単点のFAILと94/76経路不足は未解消扱い。製品sourceを変えない証拠checkpoint`afe7a94`をworkへpush済み、公開確認なし。容量不足は固定Git blob一致の旧worktree証拠のみsparse除外して復元可能にし、未commit変更/未追跡媒体を保持（[integrated記録](evidence/AVOID-008/storage-recovery01/integrated.json)、[editorial記録](evidence/AVOID-008/storage-recovery01/editorial.json)）。

- 性能調査の固定証拠1212件を、子の`7e6e375`からGit blob/両ファイルhash/1209 hardlink/保護87入力の実照合付きで保存（[親importレビュー](evidence/AVOID-008/parent-performance-evidence-import01-review.json)）。原raw・旧FAILは保持し、main製品source/cacheは未変更。最終回帰の[準備02親レビュー](evidence/AVOID-008/parent-core-preparation02-review.json)では元2bbの4入力・66準備file・173依存fileと、所有プロセス清掃の実synthetic3件を確認。candidate未封印、22本番回帰jobは未実行。値札hangと障子shadowの追加は別worktreeで実装中、未検証を成功とせず008内で継続する。

- 隔離decoder候補`6dcd2a1`の[親コード/104・118pin/実rawレビュー](evidence/AVOID-008/parent-cache-decoder01-review.json)を記録。196 graph/98 setter負例/6826 object/17未対応形、40組全field・18native・25依存負例を通過し、旧128版の値/alias/描画を維持。一方、非CDPの100単点診断はON計画2.996倍/描画+5.4ms、OFF2.353倍で速度未達。加えて元corpusは94/100 staged、80 frame呼出し中C record/replay/観測は各76で、shadow障子3・hang値札3が未対応。正式試験の全経路条件も未達であり、全80観測・全34成功とは呼ばない。旧記述の80観測は全76記録済み観測の一致へ訂正する。依存表現の限定効率化と2variantの実source対応案を調査中、guard/閾値/元corpusを変更して合格へ置換しない。mainは未達cacheを含めずf828のまま、008実装中/009以降未着手。

- 最終34 source結合は`f828ff2`までworkへpush済み。隔離cache候補`778eb302`は[親128MiB正確性レビュー](evidence/AVOID-008/parent-cache128-review.json)で値・alias・18native frame・23依存負例・4非C対照・両ledger超過拒否・同一1000入力cold/warm完全一致を受入。ただし[正式性能01の親レビュー](evidence/AVOID-008/parent-cache128-formal01-review.json)では100ON計画4.300倍/描画+4.600ms、100OFF計画3.065倍で既定2倍/+3msを未達。baseline1000ONの9計画後に入力同一性assertも失敗し、candidate1000は未実行。正確性/cache hitを速度合格に置換せず、旧FAILを保持して入力差分と実コストを調査する。性能未達候補はmainへ結合していない。最終回帰・必要4例の人間動作確認も未完、008実装中/009以降未着手を維持。公開結果確認は恒久停止。

- Poster4d0の限定main結合を[親344入力/19結果・全raw比較](evidence/AVOID-008/parent-poster4d0-main01.json)で受入。50条件27safe/21不足/2既存未対応、500OFF/36fault/96copy-clock/8cmap1894glyph/EN33+3guard/192native・192元encoder・6key/日英起動が固定4d0と一致。他33block/header/物体09i64/和風09j/共有は保持。126変更配置stage外0と15nativeidentity元crop6948は分離。旧carry01の480縮小誤比較FAILを保存し、元960×540入力のcarry02で訂正、168inkは限定継承。34のsource結合が安定したため次は正確な値/別名関係を保つ限定cacheの最終C34実証と16MiBサイズ調査へ進める。formal100/1000はまだ未許可・未実行で、source stableを34成功や008完了に置換しない。

- writingc861の限定修正02を[親335入力/74結果・3群321開始pin・raw照合](evidence/AVOID-008/parent-writingC861-main02.json)で受入。延べ323/405/276条件、safe94/83/51、24fault・新日英起動を確認。親が独立に503区間polygon/77,471実strict polygon/3,752hold頂点を再計算。共通fitBoundsの01候補は本棚の新cropで[独立視覚FAIL](evidence/AVOID-008/translation-visual01-review.md)を保持し、新列挙を2paperだけへ限定して他8の258行を旧859の位置・図形・時計へ完全復元、9組18PNGのbyte一致で限定FAILを解消。新guardは維持。paper530行は01/c861の全selectedが一致し、384native/encoder/12keysと375/574/287/101は依存を示す限定継承であってfresh02再撮影ではない。次はPoster4d0のみの限定結合、性能/全体回帰/最後の少数人間確認は必須未完。

- magazine/newspaperの有限検討02を[親raw・実cmap・容量計算レビュー](evidence/AVOID-008/parent-paper-study02-review.json)で受入。製品source4d0の変更なし、16入力/32案は新safe0。雑誌B側は21高さ不足/3必要条件のみ、新聞は6幅不足/2高さ不足。A/Bの再配分やgreek線分の再配置は未実装・未証明として残し、物理的不可能とは主張しない。012の選択除外検討へ渡す証拠であり、現製品で既に除外したという意味ではない。旧study01の未収録「続/道」4role-face-charとFAILは保持、covered16字fixtureでの再実行だけを02として扱う。

- 少数の人間動作確認用にSwiss/校正/便箋/Posterの4例・約12MBのローカル比較を準備中。最終main carry受入後に公開し、全34/全条件の一括公開は行わない。性能・最終回帰は必須未完であり、34登録を完了数として扱わない。

- 校正4d72の限定main結合を[親302入力/17結果/302start=endレビュー](evidence/AVOID-008/parent-proofread4d72-main01.json)で受入。52条件/80fault/520OFF/116copy-clock/192native＋192encoder/6key/日英ローカルが固定版と一致。旧64stampαは同source/時計/媒体で限定継承し、fresh64やfresh168inkとは呼ばない。856重複条件indexの更新は旧Proofread11行→52だけ。次はwritingc861の2paperと09iのみを結合、校正の大括弧状leader/tombo交差の構図は最後の少数人間確認に残す。

- 目次e13の限定main結合を[親293入力/19結果/292start=end照合](evidence/AVOID-008/parent-contentsE13-main01.json)で受入。54条件/51fault/540OFF/234copy-clock/実markerα45/192native carry＋192encoder/6key/日英ローカルが一致。summary01の234誤集計は歴史保存しsummary02/freeze02へ訂正、試験再実行での合格化ではない。全34登録と815重複条件indexは完了数ではなく、次は固定校正4d72のみを結合する。

- 新writing c861は[315pinと3最終raw・独立幾何・owned/ruling/負例の親レビュー](evidence/AVOID-008/parent-writingc861-review.json)、校正4d72は[100pin/80fault/actual ink/clockの親レビュー](evidence/AVOID-008/parent-proofread09-review.json)を通過し、固定候補として後続main結合へ進める。writing05限定PASSと、校正02の192frame/6key限定PASSを接続。校正の大括弧状leader/tombo交差は最後の限定した人間構図確認候補として残す。旧writing04/校正01のFAILは保持。現在mainは目次e13のfresh検証中であり、未結合候補の成功をmain成功に数えない。

- 和風0efdのmain結合を[親の実rawレビュー](evidence/AVOID-008/parent-japanese0efd-main01.json)で受入。284inputs/39results/237start=end、90条件26safe/58不足/6未対応、66font全rows・coverage原本一致、44controls/192OFF、1344前後PNG/14歴史keyと別identity03の14stock/42actualclockを接続。carry01の誤identity FAILは消さず、同一関数の内側sourceとwrapper差を補強した限定7fixture carryとして扱う。34登録/777重複条件は34完成ではない。追加人間再確認・大量再公開は同一描画carryの根拠で省略、次は固定Contents e13のみを結合する。公開結果確認は対象外。

- 新writing/校正の親レビューは[writing記録](evidence/AVOID-008/parent-writing-review-notes.md)・[proofread01記録](evidence/AVOID-008/parent-proofread01-review-notes.md)へ分離。writing04は上部二重線欠落の独立視覚FAILを保持、意味ある空白の検査/field1px許容を修正中。arcText日付が分割itemになるという親の仮説は、実sourceのone-item+charFnを読んで撤回した。writing05の便箋1例は独立sol192frame/6key/37pinsで限定PASSだが最終raw/main受入前。校正d634はleaderが注記「太字」を貫通する画像FAIL、専用elbow経路とactual ink非交差へ修正を返却。これら未承認新候補はmain固定859/旧紙面へ混入させない。
- 和風0efdの結合では、calendar本体を保持しつつlexicalに隣接する専用lantern helperの2glow行だけを固定0efdへ移す例外を親がsource確認して承認。1344原寸PNG/14歴史key/recipe-offsetは一致した一方、旧carryのplain sourceと登録wrapperの誤ったidentity比較はFAIL保持、実内側source/stock identityを別短probeで補強中。matrixは90実行であり、旧親の94は包絡数であって94ケースではない。通常norenの旧safe減少は最終0efdの全不足へ正しく反映する。全34の最終freeze/親結合レビューは未完。
- 物体固定859を現mainへ限定結合し、[親202入力/19結果/201start=end＋101 matrix原本pins照合](evidence/AVOID-008/parent-objects859-main01.json)で受入。[freeze01](evidence/AVOID-008/objects859-main01/freeze01/manifest.json)は09i/10blockだけを追加、他24/header/共有/09h/既存pyc完全保持。333条件93成立/236不足/4未対応の全spec/corpus/eventKinds/bodyPhases/segments/attempts/observations/candidateBudgetは親受入859と完全一致。384原寸frame/時計、切手carrier raw96frame、旧紙面等27key、OFF60、135primary raster（可視120）/3偽safe拒否、日英local起動を確認。原本は244,873,152bytesをlossless gzip32,487,897bytes一本で保持。登録23は完了数ではなく、葉書/カレンダー0成立、中央切手/通常vinyl不足を成功にしない。追加人間確認・大量公開は不要と親判断した中間checkpointで、新writingは含めていない。
- 目次固定e13は[親100raw/54条件レビュー](evidence/AVOID-008/parent-contents10-review.json)と[独立sol全192frame/native6key](evidence/AVOID-008/contents-visual01-review.md)が限定PASS。540 OFF、234copy/paint/clock、45実marker alpha比較、189primary/stage・477個別unit、93active state proof、実8face1311glyph/16EN+3guardを確認。右の狭いledger・短い点線と縮小動画の補助文字難読を明記し、rows/bar/mincho/ctxの1fixtureだけ受入。main結合・96原寸frame/時計carry後の追加人間確認は不要と親判断できる。mutable後続4紙面と混ぜない。
- [親の性能診断レビュー](evidence/AVOID-008/parent-performance-diagnose100-01.json)でfb65082の116raw/Git入力・旧2bb baseline・4条件入力同一・独占実行を照合し、未達78.84倍/追加4.60msを確定。34 raw corpus measurement未対応も保持し、原因をhelper再束縛不足とした一時説明は撤回した。nativeC34 flagに依存する有限Canvas handlerが無効だった点を分析し、harness準備版83119faは未実行と区別。製品では正確な全計画/lineage/options/source/adapter/renderer/helper/font revision依存に限るbounded再利用を指定担当の隔離treeで実装中。cold/warm出力同一・invalidated/byte/entry上限の親レビューと全34正式性能は必須未完。
- SwissC9の現main結合を[親165 raw/201結果pins](evidence/AVOID-008/parent-swissC9-main01.json)で受入。[freeze01](evidence/AVOID-008/swissC9-main01/freeze01/manifest.json)は153入力/12結果、45条件36成立/9不足、450 OFF frame、72 copy/clock、153全primary/153stage/369個別unit、42注入候補拒否、16EN/3guard、実8face1146glyph、旧Swiss96原寸frame/時計同一、日英local起動を確認。固定c9のoutcome/recipe/geometryも一致。狭い縦帯への構図差は最終の必要最小限の人間確認候補とし、全variant承認へ拡大しない。
- 和風最終固定`0efd6bf`は[親46pins/rawJAENと実cmap照合](evidence/AVOID-008/parent-japanese10-review.json)で限定結合を承認。66字体条件48成立/18不足の成立48行は旧cp08とsourceMapping/recipe/geometry同一、66円/66stage包絡と144strict-raster/stageを独立確認。44controls/192 OFF frame完全一致。暖簾18条件は全不足、非certified740event/5倍率のclip分離診断と192topologyは描画経路だけの根拠で成功候補ではない。物体固定859の後にmain結合する。
- 性能担当の専用alone診断100は26.468秒で終了、入力/foreign drift/描画error/budget違反0。旧2bbとの同一ON入力は単一post-warm点51.60→4067.90ms（78.84倍）、render p95追加4.60ms、OFFは51.90→63.50ms/追加.50ms。計測iterationのclapper3cut/171recordが3116msで主要因。これは旧名札を含むC23途中版（68/100 staged、和風11未登録）だけの診断でplanning p95や全C合格ではない。最終全34結合後の共通候補生成の局所改善・正式100/1000性能は必須未完。
- numbered54の現main結合を[親が160 raw/gzipと201結果pinsで再確認](evidence/AVOID-008/parent-numbered54-main01.json)。固定54の09h差分/単一numbered blockだけを受け、他33block/header/共有基盤/既存pycを保持した。[freeze01](evidence/AVOID-008/numbered54-main01/freeze01/manifest.json)で60条件36成立/24不足、600 OFF frame、72 copy/clock、159全primary/159stage/375個別unit、16注入候補拒否、24EN/3guard、実8face925glyph、旧視覚2fixtureの192原寸frame/時計同一、日英localhost起動を確認。限定受入し追加人間確認・公開は不要と親判断した。全C34完了ではない。
- HELLO横長1920の[独立sol照合](evidence/AVOID-008/badge-hello-visual01-review.md)は全192frame/原寸8keyで限定PASS。名札の階層/全4字/上方dropとovershoot/右下回転fadeを保持し、汎用anchorは使っていない。板の縦横比・白欄比率と名前の2行化は明記済み。single Noto・当該1fixtureだけの根拠で、全字体/全寸法へ拡張しない。一般captionのanchor説明は本fixtureに不適合なので、必要な公開前に実recipeに合わせて訂正する。
- Swiss固定c9と物体固定859は[親Swissレビュー](evidence/AVOID-008/parent-swiss05-review.json)・[親物体統合レビュー](evidence/AVOID-008/parent-objects-integration859.json)で次の限定結合対象としたが、現mainへは未反映。Swissの狭い縦帯構図は[独立sol](evidence/AVOID-008/swiss-visual01-review.md)が限定PASSと大きな構図差を併記。和風最終0efdは親最終レビュー待ちで、暖簾は小倍率の欠けを保守的20px包絡へ反映した結果、通常円の既存試験は全不足としている。旧noren02のscale1視覚PASSを通常成功に流用しない。
- 新便箋writing03は紙上端のcropを解消した一方、[独立sol](evidence/AVOID-008/writing-visual02-review.md)で濃い本文罫線が文字を横切るFAIL。指定担当へ実leading/字面に応じた本文罫線だけの再設計を返却した。葉書03は不足・元演出保持で回避成功ではなく、94/96 native frame hash一致（f2/f5差）とケース別caption不足を記録。これら未承認writing変更は固定物体257/859へ混ぜない。008実装中/009以降未着手を維持し、公開結果確認は行わない。
- mainの結合033は[freeze02](evidence/AVOID-008/combined033-main01/freeze02/manifest.json)と[親169raw/252結果pins照合](evidence/AVOID-008/parent-combined033-main01.json)を完了。13ID経路の中間checkpointとしてcommit/pushできると判定した。紙面170rows/対照/negativeは親受入033と完全一致、school03は96原寸frame同一、他9fixtureは864原寸frameと時計同一、cache12/OFF34、80境界/5guard、辞書22、日英localhost起動を現結合sourceで確認。未承認の汎用名札anchor9は探索から除外され、通常portrait helloは正直に不足へ減少（名札18条件8成立/10不足）。比較媒体欠損ENOENTとfreeze helperの既存pyc比較誤りは旧失敗として保持し、pyc739…は未変更。21未登録を含むためC34完了ではない。
- 和風cp08は[親が44結果pinsとactual JAEN埋込み/再構築を照合](evidence/AVOID-008/parent-japanese08-review.json)。94円包絡/94全stage包絡、308strict-raster/stage sample、実8cmap/110role-key-codepoint/50glyph、5個別unit＋2alpha-exitの偽safe拒否を独立確認した。元compiledがGit ae3d5a5とは異なる点は、検証copyの09gと再構築JAENを`477faab`/`6d8f0e0`で原本追跡して区別した。新cp09の暖簾通常円候補は、[独立sol visual01](evidence/AVOID-008/noren-visual01-review.md)で初出f4だけ『風』下端が元より布のreveal裾に切れる画像FAILを検出。hold/円/画面外alphaの成功では代替せず、指定担当へcp10修正を返した。未受入のまま継続する。
- 新numbered固定`54b10d8`は[親コード/結果レビュー](evidence/AVOID-008/parent-numbered06-review.json)と[独立solの2fixture全frame/原寸照合](evidence/AVOID-008/numbered-visual01-review.md)が限定PASS。2列/読順を保つ中央gutter・元row構成・実番号の単一y sweepを使い、100入力/60条件（36成立/24不足）、600OFF frame、72実copy/clock、実925glyph、159全primary/159stage/375個別unit、16注入candidate拒否、24EN境界/3偽safeを確認。現mainの正確なcacheとの結合検証と原寸frame carry後に限定受入できる。SwissGridの新候補は別未固定、同sourceへ混入させない。追加人間確認不要の根拠と条件は親receiptに記録。
- 紙面群の固定統合版`03384d7`を[親が独立レビュー](evidence/AVOID-008/parent-editorial-integration033.json)した。119入力のraw/gzip/Git/現物一致、11結果hash、main00aのheader・他24block・共有基盤保持、170条件（102成立/66不足/2未対応）、306全primary hold・918個別unit・306stage、80境界/5偽safe拒否、864原寸frame/時計の同一性と実8face/4632glyphのcmapを確認した。辞書は`45ad887`の修正版で、[親の印刷欄・語間・全注記照合](evidence/AVOID-008/parent-dictionary10-review.json)と[独立solの2fixture動画照合](evidence/AVOID-008/dictionary-visual02-review.md)で、294の二つの不具合解消を確認。追加人間確認は不要と親判定した（利用者OKの代記ではない）。mainへは最新名札・共通headerを保持して該当10block/09hだけを取り込み、結合版を再検証中。未commitのnumbered追加候補は含めない。
- 名札は紙面の縦横比と文字サイズを保つschool物理縮小候補を別固定し、独立solへpreview03の全96frame前後照合を依頼した。旧preview02の大きな登場移動が短くなる構成は未承認で、汎用anchor9候補を探索から除外する修正を指定担当へ返した。helloの印刷欄を詰める追加試作は実測で不成立のため撤回し、成功には数えない。和風の実字体/欄の修正、物体系の切手carrierを含む固定版統合と葉書/便箋の専用構成を継続。AVOID-008は実装中、009以降は未着手。公開結果確認は今後も実施しない。
- `00a7515` のwork push操作成功（`e881904..00a7515`）を記録した。公開結果確認はしていない。旧probe12のpins不一致には、[同checkpoint127原本を独立directoryへ戻したprobe13](evidence/AVOID-008/clapper01/probe13-checkpoint-receipt.json)を追加し、[親が8pins/127入力と216hold・216entry・216exit polygonを独立照合](evidence/AVOID-008/parent-clapper13-checkpoint.json)。18条件8safe/10不足で、portrait cy=.42/r=.2の数値成立を現sourceで確認した。視覚受入は前記2fixtureだけ。
- 紙面の旧matrix04/boundary02とcorrected raster05は[親再照合](evidence/AVOID-008/parent-editorial04-raster05.json)済み。170native/OFF・40対照pixel・10明示サイズ・30negative・80boundary・5静止unit guardを区別し、8実faceの4632glyphをactual cmapから独立確認。新辞書294の[単fixture視覚](evidence/AVOID-008/dictionary-visual01-review.md)は限定PASSだが、親コードレビューでcontext幅計測の字間不足とLatin softbreak語間消失を発見、実装担当が実再現し修正中。294全体は未受入。安定e1紙面10blockをmain00a共通headerへ移した独立統合branchでは672native frame carryと日英local起動が成功し、辞書追補後の本検証を予定。
- 物体257の[親レビュー](evidence/AVOID-008/parent-objects05-carrier-font03.json)は105source/raw pins・Git/JAEN source対応、full sheet carrierを含む切手6例/72polygonの円距離/画面内、実9face cmap/3348glyph/12明示fallbackを独立確認した。切手の成立は角(.1,.1)/(.9,.9)r=.2に限り、中央既定円では不足のまま。EMAのrack・非hero無文字本/棚は独立背景のsource根拠と接続を条件に受入れた。葉書/便箋の文字領域再構成、和風の実多字体検証と独立sol視覚、名札の入退場anchor接続を継続。

- 現在の親受入checkpointは[clapper02固定版](evidence/AVOID-008/checkpoint-clapper02/manifest.json)（manifest `0f5d70e6ae0012f109040b2cc18e3ce118c4d7ec21b4128e4d646b1432d2942f`）。[親照合](evidence/AVOID-008/parent-checkpoint-clapper02.json)でraw/gzip152件・結果pins190件・日英実source embed・freeze02 registry/font prefix同一を確認した。C専用の正確な寸法cache、全4corner連続包絡、静止unitの円侵入guard、描画監査のhelper再束縛を受入れた。clapperは1920×1080/cy=.42と1080×1920/cy=.5の2fixtureで元のsnap/文字欄/入退場を保持し、旧portrait上棒cropの修正を[独立sol](evidence/AVOID-008/clapper-visual02-review.md)で確認。corrected監査はruntime192frame、native stripe clip40件、circle18sampleで違反0。これは限定fixtureの内部受入で、追加人間確認・公開は不要と親判定。C34全完了・全字体・portrait既定cy=.42視覚承認ではない。
- 以前のCラスタ監査で`{...env,ctx}`だけを変更すると、rrect/circle/arc/blobのhelper閉包が元contextへ描画していた。[影響範囲訂正](evidence/AVOID-008/audit-helper-context-scope01.md)。旧「全shape alpha」の主張を縮小し、helper再束縛後のsticky stage03/acceptance03/boundary05とclapper raster04へ置き換えた。sourceの区間包絡の数学確認・native frame bytes照合は別根拠として維持。付箋192frame carry・cache warm/cold12条件・OFF34一致・実source strict-unit negativeも現固定版でPASS。probe12だけは4source pinsが旧版なので履歴扱いとし、現版18条件の証明へ流用しない。
- 名札はhold-only試作のまま未受入。portrait schoolの退場f94で原版にない主字cropが残るため、native owned eventごとの連続的な画面内期間を保持する修正中。紙面10・物体10・和風11は専用worktreeで実装/検証中で未統合。和風は8試作/3未実装/最終0、辞書の意味単位reflowや物体系の紙・全注記保持を継続。切手シートのcarrier余白も所有する紙本体としてprimaryへ修正を返却、旧分類の成功6例は現成功に流用しない。009以降は未着手。

- freeze02保存後、独立x/y区間の対角2点だけをconvexHullへ入れる計算の不足が判明。[親の数学反例](evidence/AVOID-008/parent-interval-hull-counterexample.json)を記録し、main付箋/名札の09g、新聞09h、物体09iへ全4corner包絡と再検証を返却した。freeze02のregistry/font/各note phase/192frame同一性の結果は保持するが、連続sweep証明の受入はこの点を再審査中。共有checkpoint `e881904` はworkへpush操作成功、公開結果確認は実施していない。[操作戻り値](evidence/AVOID-008/git-operations.json)。
- 最新の共有・付箋checkpointは[freeze02](evidence/AVOID-008/shared-sticky-freeze02/manifest.json)。親がraw/gzip113件・結果のsource pins120件と実結果を独立照合し、registryの型/region/hold検証、CSSの実px抽出、付箋の各note別入退場判定を受入れた。[親記録](evidence/AVOID-008/parent-shared-sticky-freeze02.json)。既受入preview02の全192 native frame bytesが一致し、同じMP4/PNGの独立視覚結果をcarryできる。この基盤・付箋限定の受入に追加の人間確認・公開は不要。名札の退場方向/文字領域recipeは同snapshot内の未受入試作であり、clapperと他31IDも最終対応完了には数えない。
- 和風の試作は掛け軸・おみくじ・暖簾・提灯の4IDで検証中、残り7IDはそのcheckpointでは未実装。[親の幾何照合](evidence/AVOID-008/parent-japanese-checkpoint03.json)は掛け軸/提灯のsafe-hold6条件の円距離とstage包絡を独立再計算したもの。掛け軸の[独立視覚](evidence/AVOID-008/kake-visual01-review.md)はsingle-Notoの1fixture限定PASSで、正規のbrush字体・他variant・C34完了ではない。提灯01は光の上辺に新しい直線切断が見つかり修正中。先に静止するunitの期間を、後続unitの入場で一律緩和しない修正も各群へ返している。紙面/物体系も専用worktreeで実装・検証中。009以降には進んでいない。
- 以下の「付箋試作中」「残り33ID pending」等は開始からの履歴であり、最新checkpointの受入範囲と区別する。C34全体の状態は引き続き実装中。
- 指定担当gpt-6.1-sol / mediumへ008実装を依頼済み。初期inventoryは[evidence](evidence/AVOID-008/inventory-initial.json)。共有transportの親レビューは[transport05記録](evidence/AVOID-008/parent-transport05-review.json)で承認済み（その時点の共有基盤のみ）。native136/136・OFF34/34一致、40variantのraw145イベント／可視3,117,352画素の保守境界内包含を確認した。C34回避adapterの完了を意味しない。
- 007の完了と008開始を2bb3f864b5d40361961d8ad2aabeec24bfb5d1cbへcommit/push済み。公開結果確認は実施していない。C固有の最初の付箋adapterを試作中。他33IDはC_RECIPE_PENDINGであり対応済みに数えない。付箋も全区間の根拠・negative・画像/動画照合・親最終レビューは未完。
- [途中checkpoint01](evidence/AVOID-008/checkpoint01/snapshot.json)は共有transport、付箋の連続stage包絡修正、名札の試作を保存したもの。C34完了ではない。付箋preview01は独立視覚FAILを保持し、修正02で配置方向を選び直した。親がstage包絡10polygonの画面内保持、padding上の実描画22frameでstage外alpha画素0、日英buildのbyte冪等を確認した。修正02の最終視覚記録と他32ID、全体の回帰/性能等は未完。名札はstage proof未完の試作であり最終対応数に含めない。
- checkpoint commit `7cd5a5b` をworkへpush済み（戻り値 `2bb3f86..7cd5a5b work -> work`）。公開結果確認は実施していない。付箋02は[独立sol視覚](evidence/AVOID-008/sticky-visual02-review.md)で旧crop解消と原義維持を確認し、この2fixtureを親が受入。追加人間確認・比較公開はこの内部checkpointでは不要。C34全体の受入とは区別する。
- [既存回帰01](evidence/AVOID-008/regression01/README.md)はimmutable2bb/7cd比較。drawing_frames/palette_stability/cut_detail_audit/effect_copy_fidelityは両版PASS、lyric_area_effectsは両版同じ既知のline35 actual0/expected1 FAIL（017へ既存引継ぎ済み、残り/ENは未到達）。日英local起動/描画smokeは7cdの実HTMLでPASS。親が既存suite本体5件とGit原本、snapshot12,993hash、実read/生log/環境適応を照合した。保存013の成功は主張しない。
- 実装量に対し008だけをactiveのまま、専用registryで別worktreeへ分離。全員gpt-6.1-sol / medium、親は各小群を逐次レビュー。mainは共有基盤とsticky/nameTag/clapper、`avoid008-editorial`はeditorial10（09h）、`avoid008-objects`は物体10（09i）、`avoid008-japanese`は和風等11（09j）。共通source helper/recorder/09g/11zはmain単独所有、他担当は指定source block・専用module/tests/evidenceだけ。生成JAENは統合後にmainが再buildする。009以降は未着手。
- 利用者が007/equalizer02へOKし「続きを順次実装」を指示。007完了後、C34のみ調査開始。009以降は未着手。
- 開始branch work、HEAD d947497be507a58e4288d59e78e05c4998b09708。既存変更はapp/__pycache__/english.cpython-312.pyc（SHA7390411f8a74499a4ef117d443f4c04f3814039cbb64343cb50c043cc580f898）と未追跡selected B helpers/原本/work/scratch/dependencies。全て保持し対象外とする。
- 実装はgpt-6.1-sol / medium、親がコード/テスト結果レビュー。画像・動画の照合は親の文脈を渡さないsolへ依頼する。
- [AGENTS.md](../AGENTS.md)を優先し、公開URLの接続・HTTP/hash/画像/動画/起動/smoke/自動再確認は今後も実行しない。以前の公開検証必須条項は取消済み。公開操作とローカル検証は許可済み。
- 比較はアニメ部分のMP4と同条件の前後HTML/PNG。人間確認・公開は必要な対象だけに絞り、全パターン一括公開を要件にしない。元の演出意図/所有する板・物体/読順/時計を保持し、汎用折返しを根拠なく適用しない。
- environment_statusは207/207/current/enforced/unrestricted。環境設定の観測値であり、公開接続の成功を意味しない。Node24.19.0、Chromium/usr/bin/chromium、既存lockfile dependenciesを再利用。

## 開始前計画（以下は過去の計画記録）

- ブランチ・HEAD・git status: 着手時に記録する（このスレッドで実装は開始していない）。
- 共通解析基準: b7c23bf。スキル導入済みHEAD: 3c79480。着手時に差分を再確認する。
- 正本: [設計・根拠](avoidance-design.md)、[一覧](task-list.md)、[スキル](../.agents/skills/evidence-driven-task-management/SKILL.md)。
- 依存タスクの必須条件と証拠を確認する。完了を推測せず、未完条件を引き継ぐ。
- 対象ファイルに既存変更がある場合は競合を確認する。同時進行タスクは原則1件。

## 目的

雑誌・看板・和風の複合レイアウトで、文字と物体の関係を保ちながら配置を変える。

## 変更範囲

- 当該段階のGitHub Pages確認サンプル・変更前後のキャプチャ画像・比較HTML・公開manifest、確認依頼/回答記録。共通手順は[Pages人間確認運用](pages-human-review.md)と[比較画像・HTML契約](visual-review-comparison.md)。

- src/11p_layoutsC.jsの34ID
- 必要なitem/group adapter、注釈・固有装飾の検証
- 文書更新: 本記録・task-list.mdの状態/証拠、設計の該当契約、対応表を同じ変更で同期する。

## 実装手順

- 個々の描画をprimary/tiledAux/independentDecorに分類する。大量反復補助は経路変更せず018へ引き継ぐ。同じID内の主歌詞は対応対象のままとし、名称やmainDrawの有無だけで分類しない。

1. magazine/poster/newspaper等は文字block単位の流れと余白を保持する。
2. vinyl/cassette/chochin/noren/shoji等は回転する図形の名称だけで円軌道に分類せず、実際の歌詞配置を評価する。
3. ルビ・補助文字・ページ見出し・複数板のboundsを結合関係付きで定義する。

## 禁止事項

- 2026-10-18の順次実装依頼に基づき、依存条件を満たしてから着手する。[実装レビュー運用](implementation-review-policy.md)に従い、実装担当と親レビューを分ける。
- 無関係なリファクタリング、ロック解除、手動配置の破棄、歌詞のline/partや時間の変更を混ぜない。
- 主歌詞の回避をマスク抜きで代用しない。補助的な大量反復歌詞は利用者指定により軌道再設計の対象外とし、AVOID-018の円形グラデーションマスクで扱う。演出全体の小矩形への縮小・未対応レイアウトの黙示除外は禁止。
- テスト期待値を通過のためだけに変更しない。旧ONの意図した変更には要件上の根拠を付ける。
- Gitコミット/push/PR/公開は依頼または明示許可がある範囲のみ。計画・タスク・証拠のコミット/プッシュは依頼済み。後続の実装依頼を受けた各段階では、利用者指定のworkブランチからGitHub Pagesへ公開し、反映確認後に人間へ確認ポイントを提示する。現在の計画更新を実装開始の許可とは解釈しない。

## 完了条件

- [ ] 各H-IDに必要な同条件の前後MP4/PNG/比較HTMLをローカル検証し、必要な人間動作確認対象だけを公開した。公開結果確認はAGENTS.mdにより対象外。
- [ ] 対象版をworkへコミット/pushし、日英ローカル起動/描画を検証した。公開操作の戻り値は記録するが、公開結果確認は実行しない。
- [ ] 親がコードとテスト結果をレビューし、指摘を解消した。人間の動作確認が必要なら比較URL・操作・期待結果を提示し、必須項目のOKと動作判定を記録した。不要なら利用者の委任に基づく親の判断理由と完了判定を記録した。

- [ ] 34IDの本体と保護対象補助文字が回避対象に含まれる。
- [ ] 枠から文字が剥がれる、文字面だけ伸びる、元の演出が小矩形へ閉じる回帰がない。
- [ ] レイアウト固有の装飾と全画面背景の責務が対応表で分かれている。
- [ ] manual/OFF/ロックとpalette/フォントの互換条件を満たす。

## テスト方法

- 比較成果物: [共通契約](visual-review-comparison.md)に従い、全H-IDの画像対応・撮影条件・HTML表示・公開一致を検証する。画像だけで数値/時間/保存の自動試験を代替しない。
- Unit: 複数blockと結合物体のbounds、局所座標変換。
- Integration: 34ID×注釈/日英/主要aspect、video overlay背景。
- Regression: note系・drawing_frames・palette_stability。
- 実環境: magazine/vinyl/noren/routeMap等の視覚レビュー。
- 現時点の実行結果: 未実施（後続実装タスク）。既存の基準ログはAVOID-001へ参照し、修正後の証拠として流用しない。

## GitHub Pagesでの人間確認

[共通手順](pages-human-review.md)と[依頼テンプレート](templates/pages-review-request.md)に従う。以下は実装後に用意する確認ケースの予定であり、現在は未公開・未実施。依頼時には実際のUI名・サンプル名・ケースURLへ具体化する。

各項目に下表の前後キャプチャを準備し、比較HTMLの同じH-IDアンカーへまとめる。操作の前後状態が複数ある場合は、各状態それぞれで実装変更前/変更後を撮る。担当エージェントが画像を生成・公開検証してから人間へ依頼する。

| 項目ID | 人間に依頼する操作 | 期待結果 | 比較キャプチャ（予定） |
|---|---|---|---|
| AVOID-008-H01 | 拡張C34IDの一覧でmagazine/poster/newspaper等を見る。 | 主歌詞・意味のある見出しと枠の関係を保って円を避ける。 | C34IDの一覧とmagazine/poster/newspaperの文字・見出し・枠の拡大。 |
| AVOID-008-H02 | vinyl/noren/chochin等の物体を伴うケースを再生する。 | 文字面だけが伸びたり、文字が物体から剥がれたりしない。円形の物体というだけで中心専用へ分類されない。 | vinyl/noren/chochin等の物体全体と文字面の連続コマ。 |
| AVOID-008-H03 | 日英・注釈あり/なし・手動/OFFを比較する。 | 必要な文字が欠けず、対照ケースの意匠・色・文字サイズが維持される。 | 日英・注釈あり/なし・手動/OFFを独立ケースにした同時刻画像。 |

公開コミット / 変更前・変更後の実装識別子 / build ID / 比較HTML実URL / H-IDと画像の対応・撮影条件 / 操作用Pages実URL / 公開画像の一致・表示確認日時 / 自動検証証拠 / 依頼記録 / 人間の回答: 実装・公開後に記入する。親のコード/テスト結果レビュー、人間の動作確認の要否と理由も記録する。不要判定を人間のOK回答には置換しない。未確認を成功として補わない。

## 停止条件

- 中央に固定した物体の意匠維持と回避の両立が不能なら、勝手に別レイアウトへ置換しない。
- 仕様矛盾・破壊的データ変換・予期しない公開互換性影響・既存変更との競合は、確認済み事実と選択肢を記録する。

## ロールバックと引き継ぎ

- 当該タスクの差分を単位として戻せる状態を保つ。保存されたユーザーデータを削除するロールバックにしない。
- 完了条件ごとに達成/未達/未確認、対応コマンド・件数・ログ・frame証拠を追記する。
- 開始/終了HEAD、git status、対象外既存変更、未実施検証、後続に渡すAPI/制約を残す。
- ローカル検証済み・実環境検証待ち・完了を区別する。最終判定は最新の[実装レビュー運用](implementation-review-policy.md)に従う。人間にコードレビューを依頼しない。

## 証拠・残事項

- 計画根拠: [AVOID-001](AVOID-001.md) と [設計書のE01〜E23](avoidance-design.md)。
- 実装差分: なし。検証ログ: なし。上のチェックボックスはすべて未達/未確認。
- 個別の追加判断は着手時に記録し、共通設計と矛盾させない。


## 2026-10-19追加要件の引継ぎ（未着手）

006の段階的再配置APIを再利用し、当該IDの演出意図に応じて候補順を検討・記録する。固定の移動→分割→縮小順は利用者要求ではない。可変半径.02〜.45、通常円.2、複数位置/aspect・文字量で全区間の安全性と成立限界を試験する。明示サイズ/手動/lock、主歌詞保持、所有板と読順、既存安全候補を保つ。成立しない場合の選択除外と診断を実装し、代替を元演出の成功に数えない。006完了前に着手しない。全体の横断検証は[AVOID-019](AVOID-019.md)へ引き継ぐ。
