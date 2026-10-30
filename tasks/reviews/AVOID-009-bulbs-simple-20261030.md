# Bulbs の単純な初回準備（2026-10-30）

実装担当 gpt-6.1-sol / medium。基点 `0c9ebdd2`。限定経路の親レビュー済み。公開アクセス・HTTP/hash確認・画像/動画閲覧・実encodeなし。過去の未追跡実験は変更していない。

## 差分

`11zz17_bulbs_simple.js` が native layout/subtitle を一度用意し、板の outBack overshoot・灯 halo 2.1r・shadow offset・本文/字幕・既知の効果を保守包絡にする。円偏りscoreで主方向を選び、主領域内のnative/幅に応じた少数の行分けだけを評価する。側方分散・全時計生成・所有/描画記録モデルは使わない。variantのsupport/spacing/packingは準備内Mapで一度だけ計算する。

既存の原字号を維持。旧admissionに合う入力だけ、承認済み one-row-compact / two-row-native / two-row-95 も既存幾何関数から候補化する。旧admissionは既存の入力検証関数だけを再利用しclock/compile/ownerへ進まない（旧validatorの例外をこの一入口で未適用へ戻す）。.95は同方向に原字号でsafeがない場合だけ。その後はscore→形適性→正規化距離→前方向。同policyの前offsetは新候補/領域/円で再検証して再利用する。

旧recipeはnative字幕の文字/字号を維持し、通常held時の行間・輪郭内余白・主字幕間隔・灯body/haloと文字の間隔・隣接灯のhard gap3を数値検査する。glyphの行所属はgeometryの元indexを使う。入退場でnativeから縮む灯列を一律異常にしない。preferred gap4.86は旧同様softで、hardへ昇格しない。

描画は元の板・灯・字幕を使い、現在フレームのnative shape周長から元と同じN(t)を求めて適応rimを一度resampleする。i/N・dir・reveal/chase/beat・元時計は保持する。原字幕切捨て以上の新しい切捨てはしない。

通常自動例のneonOnに限り最大shadowBlur=min(80,.32size)の6σ余白を追加した。romajiLineは元area/clip/時計/主歌詞bboxで独立描画し、本文を二重描画しない。bulbsだけpost bloomはrendererと同じ `(glow??.6)*.5*(texture??.6)>.05` のときだけ包絡へ加える。他layoutの従来計算は維持。最後の構文検査後、neonOnの入退場重複時のshadow最大値にも同じ上限を加算した（actual06の入退場非重複条件は不変）。6σは既存の工学的基準であり、全ブラウザの画素一致証明ではない。

## 最小確認

証拠はrepo外 `/workspace/jizura-logic-evidence-20261027/bulbs-simple-{source,actual}01…06` と各actualの `-runtime`。管理Qt runner、生成前空き約9.35GB、expected1MiB、同時実行1。

最終 actual06 はQt6.11/WebEngine6.11.2/Chromium140で PASS、postpins一致。

- 純自動：歌詞「風の先へ」、seed1205、blueprint、layout=bulbsだけ指定、円(.5,.42,r.2)。neonOn/flashBox/overexposeOut、double/chase/dir−1/subfalse、romajiLineを維持。safe/right、字号63.504、非空。prepare29.2ms、UI replanから可視175.3ms。legacy非active。
- 円入力変更x=.6：safe/left score.2、非空。prepare8.2ms、可視102.5ms。
- 同auto入力contentScale8：明示不足 `NO_SAFE_BULBS_SIGN`、空表示。prepare8.0ms、応答72.1ms。
- 旧admission代表：1920×1080/60fps、fullstage、board/chase/dir1/subtrue/dela、cut/still/cut/none/push、円(.5,.2,r.2)、空media/foreground、glow0/texture0。旧scope通過、17候補中 one-row-compact がsafe/down score.6。字号259.2はnativeと同じ、灯径15.552=native×.8、字幕保持、非空。prepareと以下2描画を含む計84.6ms（prepare単独値ではない）。実描画のbody灯数がt=.1で54/native54、t=.8で64/native64。

全ケースは `allClockGeneration:false`、旧controller非active。実全時計生成・全時刻/raster安全検証は行っていない。通常初回の約8秒問題に対する限定経路の実測であり、全FX全入力の性能保証ではない。

actual01はcut/still/cut等を固定した制御例であって純自動ではない（safe/入力変更/不足）。actual02は純自動の旧未対応を記録した後、fixtureにfonts:nullを渡した試験設定ミスでnetwork errorになり中断。actual03は旧scopeのみ通過したが元padding候補で不足。actual04はneonOn/romajiLine追加後の純自動safe、旧recipeを加えても不要bloom計上で不足。旧scope通過は旧実際safeの証明ではない。actual05はbloom修正後両safe、actual06はpacking/Map/順位修正後の確認。いずれの失敗も成功へ置換していない。

actual06 resource:3ページ全て通常close、service返却、所有子3件exit0回収、signal0、ownership failure0、remaining0、debug port閉鎖。actual02の機能失敗時も通常close/回収は別記録。元々のPID1 zombieには触れていない。

## 制限・引渡し

新経路は単一円、自動配置、既知enter(cut/flicker/inkBleed/magnet/neonOn)、hold(still/flashBox)、exit(cut/overexposeOut)、treat(none/hardShadow)、既知6camera、romajiLineだけ。手動/lock/emphasisの優先は既存判定を保持。他の演出は旧controllerの対象へ残し、既存未対応の状態を新safeと表示しない。新scope内のパラメータ不明はunsupported、配置不能は明示不足。通常全効果の回避完成とはしない。

既存PNG/動画の共通outputPlan入口で同じprepared planが使われる。実encodeは未実施。AEは従来仕様の未反映通知/metadataを維持。ほかのレイアウトの機能試験再実行なし。

`node --check`（layoutsD / generator / simple_circle / bulbs_simple）と `PYTHONDONTWRITEBYTECODE=1 python build.py` は成功。JA/EN生成HTML更新。追加試験や係数調整はせず、ここで親の差分・結果レビューへ渡す。

## 親レビュー修正：lineageなし入力

`bulbsSimple.handles` の preserved 判定を `!==true` から `===false` に統一した。J.plan lineageがなく判定nullのplanを新経路で旧controllerから除外しない。sourceをNode vmで読み、preserved=null→handles=false、true→false、false→trueの3値を確認。旧controllerの除外は同じhandles値なのでnull入力は旧経路へ残る。既存Qt実例はlineageありfalseで不変。構文検査/build成功、生成JA/EN更新。追加Qtは未実施。

## 親レビュー修正：正規prepared planの識別

単にpreserved===falseへ揃えた途中修正では、正規prepareが返す新planもlineage=nullとなり、Rendererで旧controllerへ戻る恐れがあった。既存private `sourceCuts` WeakMapの登録と `plan.cuts.includes(cut)` を確認する `simpleCircle.preparedCut` を追加。handlesはこの正規生成cut、または元planのpreserved===falseだけを受ける。未知cloneや他cutのindex一致だけでは通さない。

Node vmで実sourceのprepare（幾何だけstub）を通し、元lineage plan=true、正規prepared plan/cut=true、未知plan clone=false、同indexのcut clone=falseを確認。通常auto1例だけ最終actual07でQt再確認し、safe/right・字号63.504・非空・旧controller非active。prepare28.3ms、可視186.6ms、postpins一致。3ページ正常close、所有子3件exit0回収・signal0・remaining0・debug port閉鎖。構文/build成功、JA/EN更新。追加の一般試験なし。

親は共通振分け、既存recipeの限定適用、方向順、native灯数の現在時刻計算、局所キャッシュ、未対応時の旧経路、実測結果とQt終了記録をレビューした。actual07は最終コードの通常auto1例、入力変更・不足と旧admissionの2時点灯数一致はactual06の結果であり、後の正規prepared plan識別修正後に再実行していない。全入力・全clockの安全性、旧admission全条件、正式性能や人間視覚承認は主張しない。
