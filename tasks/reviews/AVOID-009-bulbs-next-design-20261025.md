# 電球サイン：製品化する次段階の設計（親レビュー用、未実装）

2026-10-25。開始点はwork `d08cd4d6be162b8ba9e93764a03b53c3551821e5`。実装担当gpt-6.1-sol/medium、親source/rawレビュー。今回は文書だけを追加し、src/build/ブラウザ/Git操作は行っていない。既存dirty/PYC7/保護資料は親の開始記録を継承して保持する。

## 目標と境界

native53の計測/transport51を使い、人間OK済み59A（「風の先へ」→「風の\n先へ」、一枚board、右配置）を有限の製品配置戦略へ進める。固定MP4の承認は他shapeや自動side方針の承認ではない。新しい方針は下記を親レビューし、異なる見た目が採用された代表例だけ動作確認へ回す。

初回はboard/subあり、既存59/60と同じfont/context/960×540/4秒/stock push・cut/cut/still/none・一つの全区間regionという入力境界をコードで明示する。文言・seed・FX等の一致条件を59/60の実fixtureから抽出し、曖昧な範囲拡張をしない。一般文字量/縦横比/arrow/double/jitter/breathe/複数region/gapは、同じstrategy APIへ追加する後段であり、初回成功に数えない。範囲外はtyped unsupportedで元入力を保持する。

## 有限候補と選択

「native形状全体移動」→「一枚/同一1行/元fontのままwriting余白・board枠寸法調整」→「一枚board内の自然な2行、元font」→「59Aの2行/局所font .95」の4段階。各段階は一つのboardのまま、元行/全文/No.01/元点灯N(t)・点灯順・q/out/各pass clockを保つ。第2段は元1行と字号を保持してpad(.22,.25)・bulb radius .8へ調整し、横長のまま下などへ納まる可能性を先に試す。第3/4段も同じpad/radiusを起点にするが、すべてhard品質合格が条件。1行の文字を横へ潰したり、boardだけを文字より小さくすることはない。初回は59A以外の未知recipeを大量探索しない。native段のpadding/radiusは元値のまま。明示サイズなら.95候補を評価せず不足を返す。

各recipeに対して全時間所有支持からstage内の平行移動可能域を求め、上下左右それぞれ最大2候補、合計8候補までを生成する。円の外側bandまたは円弦に接する候補と、当該sideで原位置に最も近い候補を用い、重複を除く。4recipe×8=32候補/regionを初期上限にする。元の24は未実行の設計値であり、失敗を通すための既存上限引上げではない。各side2点を維持することで、一方の接線点が画面外でも原位置近傍の解を落としにくくする。各recipeの支持は一度取得し、32候補は平行移動の幾何評価だけなので、24→32で描画取得数を増やす設計ではない。予算切れと全候補不成立を分ける。offsetは1region内固定、seek中再探索しない。

hard条件を通る候補からrecipe順、位置選好、元位置からの移動量、余白、固定side順で決める。位置選好は `dev/avoidance/contract.json` の `fx.centerBandY=[.45,.55]` と `fx.positionPreference` を参照し、circle.cy/H<.45では左右/下、>.55では左右/上、閉区間[.45,.55]では全side同列とする。左右/下などの同列集合内は元位置からの距離を先に比べる。距離はcamera適用後の元ステージpxにおける平行移動量の二乗dx²+dy²とし、同じ寸法・字号なら元配置への変更量を小さくする意図による新規方針である。距離も同値なら最小stage端余白が大きい候補、なお同値なら下→右→左→上、最後に生成ordinalで固定する。このside同点順は既存利用者指定ではなく、本初期設計の決定的tie-breakとして親がレビューする。hard合格前にsideだけを決めない。これは新規設計案であり、扉の横長優先や固定右側承認を全演出へ一般化したものではない。

同一recipeの左右を必ず両方評価する。右に元と同じ59Aが入っても、これまでの数値offset293.1329669691148を汎用解として埋め込まず、fresh支持と実destination行列で再認定する。recipe0が安全なら元形状を保持する。元字号1行の余白調整が成立すれば2行へ変えず、元字号2行が成立すれば.95を選ばない。明示lyricSize/contentScaleをlineageで検出した場合、.95を強制候補除外し、実際の指定字号と一致しないreferenceを使う全候補もtyped拒否する。

## hardとsoft、実装方法

全phaseの円/画面・shadow/halo/outline・全文source mapping・字幕とboard内領域・実halo/text離隔はhard。保持時の論理電球間隔hard3px、preferred4.86pxは初回の固定解像度でだけ使い、preferred不足を診断で残す。任意解像度へこのpxを黙って流用しない。移動中packingのsoft扱いは59のown-pass分類に合わせ、円/画面hardは緩和しない。入退場緩和は初回追加しない。

元のN(t)は元native形状から求め、変形後の輪郭を同じN(t)で再samplingする。点灯インデックス/色/alpha/halo/glint数を維持する。字数を減らす・字幕を短縮し直す・所有物をdecorへ落とすことはしない。元ソースに既にある字幕truncateは変更せず、その元値との一致を検査する。

新moduleは `src/11p_layoutsEe_bulbs_geometry68.js`（時計/支持/有限候補の純粋計算）と `src/11p_layoutsEf_bulbs_adapter68.js`（finalize/render、`09k` registry登録）を予定する。既存Ed_tilesの後・11q等のwrapperより前に読み込む。native `11p_layoutsD.js` はOFF保持を優先し、必要な純粋recipe入口だけを設ける。`09a` transportは51のaccepted範囲を広げず、recipe側が既存記録可能イベントを生成する。`src/11zb_bulbs_native_transport51.js` はbulbs render/Renderer/core/easesを遅い時点でcaptureするsource witnessであり、別renderへの差替えで回避しない。`src/11p_layoutsD.js:8` のnativeSourcesと同じ登録render自体を使う。

59の独立アプリ丸ごとコピーを製品へ追加しない。元rendererの共通幾何計算へ明示的recipe入力を注入する最小差分を検討し、OFFの元演算順を保持する。具体的入口案は11pのbulbs render内だけが読むprivate Symbolのrecipe bindingとし、同closure内で `withBulbsRecipe68(env,recipe,reference,fn)` を定義してEe/Efへ凍結APIを渡す。recipe/referenceのsource/context整合を検査してからbindingを有効化し、finallyで復元する。cut.paramsや保存データには追加しない。元register renderのidentityを変えず、recipeなし分岐の演算/呼出順を維持する。変更点はtext/size/padX/Y/rの局所生成、固定元Nでのrim再sampling、字幕のreferenceサイズ保持だけ。共通resample関数の挙動は変えず、bulbs専用resampleCountを追加する。binding APIの公開属性・guard依存はsourceレビュー時に最終固定する。native参考N(t)を取るために製品で余分なRGBAを読む方式は採用しない。製品proofはfresh記録済み形状・行列・font metricsと有限Number時計を用い、pixel readback0。診断runnerだけがRGBAを照合する。

字号.95は `work/avoid009-bulbs59-focused/runner/recipe59.js` の `size=reference.size*recipe.scale` と同じCSSサイズで `J.measure/J.mainDraw` を呼び、元qの `Math.min(1,q)` をそのまま乗じる。59/60は固定CSS＋一律Canvas縮尺方式ではなかったので、その方式へ無断置換しない。`oracle60.js` の同計算、元N/字幕referenceサイズ、1font-space-px/2device-px前提と独立照合を再検査する。全own-clock状態/末尾の導出とsupportは59/60の条件付き数値基盤を再利用する。250/727を初めに仮定せず導出後に照合する。1font-space-px/2device-pxなど既存の数値前提を隠さずsourceProofへ残し、普遍Canvas証明とは記録しない。予算はまず1recipeあたりstates512/pass1536/1passあたりpaint2048、全4recipe合計states2048/pass6144、32候補、proof記録8MiB、cache2entryで停止する。上限到達はtyped budget failure、引上げで押し通さない。候補ごとに同じgeometryを再記録せず、recipeごとのsupportを共有して32平行移動を検査する。全4recipeで導出各250状態/727passなら最多1000状態/2908passのrecipe計測（native recipeを含む）を見込むが、実際の状態数は導出し直す。実装時は1recipeごとにgeometry/記録bytes/所要時間を測り、8MiBの残量見積りと全recipe共有tableの重複率をrawへ出す。超過したら部分結果を保持して停止し、capを上げず表現/候補数の再設計を親へ返す。正式性能合格は別途実測が必要。

## 検証と受入条件

1. 現環境のNode/browser/font/一時保存/永続保存手段を再確認し、旧SHMや専用indexを前提にしない。新入力・runner・失敗を含むrawをGit/Projectsへ保存可能な容量計画を親が受入してから実行する。
2. 59A固定fixtureのfresh全Number状態で元/zeroのRGBA・全paint/所有/CTM/clock/N/点灯が元と一致する。元renderer経由の独立recipe経路でも照合する。既存60の合格を新製品試験へ転記しない。
3. 全32以下の候補結果を保存し、選択理由/拒否理由、hard/soft、未評価候補を分ける。default円で既存右候補を再現し、上/下/左右小円・半径.02/.2/.45・画面端は各々新規合否を記録する。成立0も正常な不足診断で、初回境界外の合格にはしない。
4. 明示サイズ、OFF/空regions/強調/manual/lock、font revision/replan、stale dependency、unsupported shape/複数region/gap、予算停止、seek順不同で期待する保持/診断を確認する。追加Cyber/fuzzは行わない。
5. 同じ通常buildからJA/ENを生成し、受入sourceと実描画が一致。他D controlsと既存基本6試験を確認。保存本体・AVOID-013の既知失敗を別記する。
6. 新しい候補が59Aと見た目同一なら親が追加人間確認不要の根拠を判定する。異なる行組み/side/字号が採用された必要例だけ原寸アニメ部分60fps MP4・同条件before/after HTMLを作成。親rawレビューと別文脈sol静止照合後、利用者へ動作だけを確認する。公開結果確認/pollingは0を維持する。

完了は「初回限定adapterがfresh条件で認定されるか不足を明示し、既存動作を保持し、親が差分/rawを受入れたこと」。全bulbs対応・正式性能・保存・全009完了にはしない。親が初回source/rawを受入れた後も同じ担当が継続する。まずtextlength（1/4/8/14文字・Latin語境界）、次にviewport（縦/正方形/横長）、seed、font/FXの順で各境界を宣言・追加試験し、一枚/自然行組の選択を広げる。board/subなし、arrow/doubleはその後の別recipeとして追加する。初回固定familyを「製品化完了/全bulbs完了」としない。各段階のhard/soft/不成立を残し、看板native63→新規transport試験へ順次進む。


親修正反映: 同一1行・元fontのwriting余白/枠調整を2行化より前へ追加。32候補は未実行初期設計の上限で、既存失敗のcap引上げではない。現workspace free約15MB・Node24/Chromium/Playwright既存という親資源確認を受領したが、実行用TMPDIR/永続rawの容量は新規run前に別途確認する。
