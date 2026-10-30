# AVOID-009 登録164 IDの限定検証（2026-10-30）

基準HEADは `8625ea9a3d22e3582db817371580494e1cb31710`。実装担当 gpt-6.1-sol / medium、親がソース・rawを独立レビュー。以下は異なる条件の証拠であり、件数を足して164 ID全体・全入力・全時刻の合格にはしない。本書の追加ローカル試験では公開サイトへアクセスしていない。

## actual21：元のsample条件

- 登録164 IDのうち旧5 ID（8個の既承認fixture）を条件固定で再利用し、新規159 IDを実行。新規141 IDが同一sample時刻のnative主文字内容・所有描画boundsの独立判定を通過。旧5 ID込み146 IDは、それぞれ列挙された条件に限る。
- producerの非空描画146件を独立合格141件と混同しない。新規13件はerror、残る差異・未verifiedも成功へ置換しない。
- cut/still/cut条件のsample判定であり、途中で一部だけ見える演出の全歌詞・全lifetime、全clipping/truncation保持は未検証。代表時計にも失敗・未認定が残る。
- 原本：`/workspace/jizura-logic-evidence-20261027/registered164-source21/`、`registered164-actual21/aggregate-independent-report.json`。独立checker：同親ディレクトリの `review-registered164-21.py`。raw278 records / gzip5,698,035Bを照合済み。

## actual22：円と元描画が重なる別条件

- 旧5 IDを維持し、新規159 IDを別の円条件で実行。独立判定は101件、そのうち元の所有描画と円の重複・実Canvas主文字anchorの非ゼロ移動・内容/boundsを確認した移動成功98件。残る3件を移動成功に加えない。
- producer分類は非空描画130、不足4、未対応15、error10。これらは移動成功98件との別集計。不足/未対応のtyped outcome独立確認は17件で、全19件を確認済みとはしない。
- actual21の141件とactual22の98件は条件・主張が異なる。同じIDも含むため合算せず、元sampleの成功を別円条件の成功へ拡張しない。actual21は再実行していない。
- 独立背景は、exact-layoutのソース契約で承認された `tiledAux` / `independentDecor` のみ所有描画の円判定から除外。元の背景交差rawは保持した。全背景・全補助文字を一律除外した判定ではない。対象契約はaggregate reportの `backgroundSourceContracts` に列挙。
- strict `contentEqual` と、非作用state等を区別した独立effective判定を併記。strict差異を消していない。変換・clipはrawに残すがpixel同一性、post-composite bloom、全所有物lifetime、全入力・全時刻・正式性能は未認定。`overallPassed=false` を維持する。
- 原本：`/workspace/jizura-logic-evidence-20261027/registered164-source22/`、`registered164-actual22/aggregate-independent-report.json`。独立checker：`review-registered164-22.py`。raw331 records / gzip6,926,319B、actual bounds7,150件・native bounds7,292件を照合。

## animation補完：限定18 frameとchild Canvas

actual22の6構造代表（mixed / marquee / wave / labels / condensed / stack）はflicker / still / overexposeOutのentry・hold・exit、計18 frame。元の独立判定はsource parity・回避とも12 frameで、6構造すべての3 phase合格ではない。

別のread-only補完 `/workspace/jizura-logic-evidence-20261027/animation-child-independent-actual22.json`（checker `review-animation-child-actual22.py`）は、waveの3 frameが対応不足、他15 frameでchildを含む文字・順序・変換のsource parityを確認した。ただしstack / marqueeのsource-area clipによるbloom等のpixel範囲は未認定。15 frameの文字等の一致をclip/pixel範囲・全時計の合格へ拡張しない。

## font wake-up actual24：6件の停止回復

`02_fonts.js` のloadingdoneでmetrics revisionが進んでも停止中UIの再描画要求が立たず、simplePreparedが旧revisionのまま残る回帰を確認。`src/12_ui.js` のS宣言直後にloadingdoneで `S.need=true` とする1行を追加し、build.pyで日英HTMLを生成。既存draw時のrevision失効・generation/stale guardは変更しない。親はこの最小修正とactual24の証拠を受入れた。

- source22のbrowser-test / warm / observer / support / service / inventoryはbyte同一。sidecar probeでdictionary / ema / bookSpine / calendar / omikuji / ledScrollと通常mixed controlのみを一括実行。141件や159件は再実行していない。
- 6件すべてで実font loadingdone時の旧prepared・idle状態と `need=true`、後続frameでの回復を記録。実フォント照合・250ms以上の安定gateを通過し、prepared / metrics revisionは順に11 / 18 / 23 / 27 / 31 / 35で一致。mixedは36で一致。font停止回復に限った受入れ。
- ledScroll / mixedはstrict描画判定も合格。dictionary / calendar / omikujiはsafe・円交差0だがstrict内容差異が残る（dictionary letterSpacing 1件、calendar owner/role 35件、omikuji role 4件）。ema / bookSpineはそれぞれcoupled decor translation / field clipでunsupported、元描画の円交差も残る。これら5件を回避全体の合格に変えない。
- actual23はNSS DBのread-onlyによるTLS・font前提失敗として保存し、成功にしない。actual24は既存NSS DBへのwriteだけを許可した同じmanaged runnerで実行。証明書設定・TLSの無効化なし。3ページ正常close、所有子回収、debug port close、raw9 records / gzip203,332Bの完全性を確認。公開・画像・動画の追加なし。
- 実行source：`/workspace/jizura-logic-evidence-20261027/registered164-font-wakeup-source23/`。raw / 限定report：`registered164-font-wakeup-actual24/font-wakeup-report.json`、独立照合用checker：`registered164-font-wakeup-check.py`。試行番号actual24とsource23は別名。このfont修正を含む製品commit SHAおよび公開検証は記録作成時点で未確定。

この記録に動画・PNG・raw本体は含めない。font停止回復の受入れと、未対応・strict差異・clip等の残存範囲を区別し、AVOID-009全体完了とはしない。
