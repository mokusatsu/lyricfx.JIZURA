# Immutable decoded polygon edge 差分の read-only 評価

固定446ed00a（製品7bd83c23）の Git blob のみを確認。実装・試験・browser・timing・Git更新なし。結論は **狭い条件なら exact な候補として成立するが、速度利益は未実測**。任意 q の Object.isFrozen 判定だけでは認証しない。直接 native 案は現行不採用のまま。

## 最小差分と実際の登録先

主変更は09g payloadDecode/readFinalCache内部と、09g:290、09h:7、09i:13 polygonContains、09j:9の4述語先頭だけ。09i:14の矩形containsは対象外。09a/freeze/codec wire/入力key/元render record→replayを変更しない。payloadDecodeのgenericなroot全てを登録せず、成功したcompleted finalizationのread経路で返された result.plan.cuts の own-data placementTrajectoryだけ選択登録する。登録失敗/予算超過は機能失敗にせず元述語へfallback。

選択するpolygon配列は、trajectory.units[*] の envelopes/stageEnvelopes、units[*].segments[*] の envelopes/stageEnvelopes/entryEnvelopes/exitEnvelopes/badgeEntryEnvelopes、同 segments[*].bodies[*] の full/hold。実callerは09g321–328（hold/exit/badgeEntry/entry/stage）、09h307（active hold/stage）、09i275（body.full/hold）、09j196/234/264–265（hang/shadow/native hold/stage）。bodyのsource等の任意配列、observation、originalCutsは辿らない。品質検査用の毎frame生成 field/zone や冷計画中の polygon は未登録なので元述語。shadow の tr.units[0].envelopes も登録対象となる。各列挙は own-data/native dense array 型確認を伴い、不明なshapeは飛ばす。全graph再walkは不要だが、これら選択枝の走査・重複alias dedupは必要。

payloadParse由来のtreeと修復alias先は同一parse由来native containerのみで、reviver/user callbackを使わない。修復完了・payloadGuard成功後に選択登録し、q/pointそれぞれが native Array、dense own-data number coordinateであることを captured descriptor helpers で確認する。proxyを後から登録できる公開APIは設けない。coordsはObject.is相当で -0 を区別してsnapshot、有限numberに限定する。parse時点のprototype/length/slot/point参照も保存。登録時はまだmutableなので速い述語を使用しない。

## 初回認証とreader

最初の利用で、登録済み q と全pointの captured Object.isFrozen、length/slot/0/1の own-data・nonwritable・nonconfigurable、snapshotとのpoint参照/座標完全一致を確認する。本物parse配列なのでdescriptor trapはない。未freeze、slot差替え、座標変更、getter付加、非number等は永久fallback又は再登録なし。qをProxy wrapしても私有WeakMap missなので元述語になる。認証後は同じimmutable own-data列を変えられず、以降各callのfull再検査は不要。任意pには型/descriptor検査を追加しない。

WeakMap constructor/prototype/get/set/has等、captured Object descriptor/isFrozen/is/Array.isArray helpers と global binding/prototype の必要な own-data identityを、登録前・登録後・利用前に副作用なく確認する。カスタム関数を呼んで確認しない。改変中にset/getを呼ぶと private record を漏らされ、restore後に改変edgeが使われ得るため、captured native直接呼出＋guard fail→fallbackが必要。未登録qのgetterを認証処理で触らない。p getterからの再入・helper mutationもoracle対象。predicate途中は新しい公開methodを呼ばない。

09gはprivate関数を直接使用。他3moduleへは immutable own-data/nonwritable/nonconfigurable の bool|null readerを一つだけ設置し、module初期化時にその関数をcaptureする案。edges/record/登録関数は公開しない。後から差し替え可能なA.helper呼出をshortcutのauthorityにしない。既存 complete A helper collectorに新reader identityが入り、追加したintrinsic seamもcache依存/再verifyに反映する。単に source/transport seal があるだけでreaderを信用しない。新公開helperの可観測な追加は明示sourceレビュー項目。

## exact 証明範囲

元edge計算は `(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0])`。q/pointが認証済み不変own-data finite numberなら、dx=b0-a0、dy=b1-a1、ax=a0、ay=a1を同じbinary64演算で一度計算して保持できる。毎callは `dx*(p[1]-ay)-dy*(p[0]-ax)` とし、括弧/演算順を変えずMath.fround/代数展開/FMAを導入しない。-0/overflowした差分Infinityも元と同じnumber。p[1]の読出・ToPrimitive/ToNumberが終わってからp[0]を読む。元の間に挟まる q数値read/減算にはuser callbackがないため、移動しても可観測副作用/throw順は変わらない。

全edgeを最後まで回し、pos/neg両成立でもearly-returnしない。各edge p[1]→p[0]を一回ずつ読み、epsilonは09g/09i1e-5、09h1e-4、09j1e-6をそれぞれ元通り使用。空polygonはp未読でtrue、1/2point・重複・collinear・NaN p・Infinity p・string/object pの変換/例外も旧式と同じ。ただし全て認証条件内qの場合だけ。未認証qは元のfor/body全文へ戻し、任意q getter/Proxy/古いthrow反例を元通り維持する。

## 有界性

例として累積65,536 edges・8,192 polygons・選択枝訪問131,072 slotsを上限にし、超過は未登録fallback。私有WeakMapはweakだが、GC後も累積counterを減らさない保守的上限とし、上限でmapを全掃除する必要はない。各recordはq/point refsと4edge scalar/coordinate snapshotだけ、plan/root全体を捕捉しない。全数値/ref/recordの個数上限を明示し、JS heap実bytesの保証とは呼ばない。必要ならclearで新mapへepoch切替できるが、既存finalcache clearと区別し公開edge recordは返さない。上限値は案であり実登録率/サイズは未測定。

## 必要 oracle と速度判断

1. 4旧述語を独立referenceとして bool/throw identity/order、pのgetter/Proxy/valueOf/toString呼出列を比較。p[1]がp[0]を書換え・helper変更・再入する例、後半edgeだけthrowする例、両sign成立後もgetter継続を含む。
2. qはnative registered/frozen、unfrozen、freeze前mutation、同値slot差替え、getter、point replacement、Proxy wrap、未登録frozen、alias point、-0/極大finite/degenerateを分離。getter/proxy未登録は追加読出なしで旧例外を保持。
3. WeakMap/get/set/has/constructorとObject/Array helpersのwrapper/accessor/改変→restore、登録中と利用中のleak試行。private payload/edge漏洩なし、custom getter呼出0、元fallbackへ戻ること。
4. decoded full40値/alias/18+18native pixel/元25+新guard・schema・4nonC・dualbudgetを維持。wire/旧payload bytes不変、source変更は4moduleだけ、実record/replay/観測80は変更しない。新cache統計は実registration/validation/hit/fallbackを分ける。

利益は全edgeの反復q/point accessと2減算を省くこと、長いenvelopeを多数の実pointへ照合するwarm renderが対象。まだ外側のenvelope全候補走査も毎call検査用helper/WeakMap/guardも残る。旧profileのchecks124.988ms/80はinclusive広いbucketで、contains単体やこの案の上限として使えない。最新+5.5ms p95を解消すると主張できず、まずexact oracleと実登録率/実利用数、それから別gateのactual timingが必要。現時点は実装候補として条件付き可、速度合格とはしない。
