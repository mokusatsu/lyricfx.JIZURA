# AVOID-008 chochin-preview01 独立視覚照合

**総合FAIL: moderateの照明退行。** afterでは提灯周囲の光の上端がstage内で直線状に切れる。主文字・本体造形・動きの時計はPASSだが、照明との一体感に新規の不自然な境界を認める。この素材・FAIL記録を保持し、修正版は別証拠で再照合する。

## 対象と検証範囲

ローカルbundle `/workspace/avoid008-japanese/tasks/evidence/AVOID-008/japanese/chochin-preview01/`（親指定commit f4c512d、native103sharedfreezeとは別source版）。自身で計算したreceipt SHA256は `ac9c946983a0bd6dc9b88bf29934a817bd12266315dbe0e8cc15920f9a2e2610`。receipt記載全5assets（before/after PNG・MP4とindex.html）の実bytes数とSHA256は全て一致した。hash一致だけでは視覚PASSにしていない。

両MP4をffmpegで全frame原寸PNGへdecode。ffprobe count_framesの実測は両方960×540、24/1fps、4.000秒、96frames。0始まりf0〜f95、計192framesを時刻対応before/after上下配置の4contact sheetsで全て実見（各frame240×135全stage）。リアルタイム動画再生ではない。native before.png・after.pngを原寸実見し、両側decoded f1,f6,f48,f95も原寸単frameで確認（追加8枚）。照明境界をafter native PNGから切り出した原寸cropも実見した。

今回のみの証拠は `scratch/avoid008-chochin-visual01/`。decode連番は1始まりで `049.png` = f48。照明cropは `after-native-glow-upper-crop.png`、native stage座標x440〜959,y60〜229を切り出したもの。色/明暗強調や拡大補間はしていない。

receipt条件はchochin variant single、960×540、『風の先へ』、seed704、circle (.5,.42),r .2。before/afterの入力にfont mincho、units単1、4秒、camera push等の一致を確認。afterは右下へ移動し物体と字面が比例して小さくなるため、同座標/同寸法は要求しない。

## 項目別結果

| 項目 | 判定 | 観測根拠・重大さ |
|---|---|---|
| 丸み・リブ・上下cap | PASS | 胴の両側が膨らむ輪郭、横に走る緩い曲線のリブ、暗い上下capを保持。afterで片側だけ潰れる/縦横比が変わる/リブだけずれる現象なし。比例縮小後も提灯の原義を保持。 |
| 縦字・全文字・可読性 | PASS | 上から『風』『の』『先』『へ』の1列4字。afterは小さいが原寸で判読可能、黒字と明るい黄色胴の対比を保持。字同士の重なり/紙外への分離/新規欠落なし。 |
| 紐とcapの接続 | PASS（見える範囲） | 天井stage上端から上cap中央へ続く長紐を保持。beforeより長く見えるafterでもcapと離れていない。短紐を長紐と別部品として識別することまではできず、独立した短紐の細部受入は未確認。 |
| entry・holdの揺れ | PASS（24fps観測） | f0空、f1暗い胴、f2〜4明るくなる胴、f5から全文字が見える。両側の同frameで同じ順序。胴/リブ/cap/字が同じ傾きで揺れ、holdは小さい左右の振れを保つ。字だけの独立移動なし。 |
| exit時計 | PASS（24fps観測） | 両側f90付近まで明るく、f91〜95で次第に暗まる。f95にも暗い胴/字/紐が残るので空frameとは主張しない。afterで時計が止まる、先に字だけ消えるといった差はない。 |
| 本体/文字のstage crop | PASS（新規退行なし） | before entry f1/f2では上cap/胴上部が元からstage上端に切れる。afterはこの上部cropを再現せず、明るい胴/全文字/上下capがstage内。天井へ続く紐のstage上端との接続は意図された吊り方として扱う。 |
| **照明の内部切断** | **FAIL / moderate** | after native PNGとdecoded f48（2.000秒）で、光のhalo上側がstage y約110〜120に浅い斜め直線の境界を作る。上capの約80px上で、紐を横切り、左右へ続く暗い平坦な上面として見える。原寸cropでも明瞭で、MP4圧縮だけの現象ではない。beforeは周囲へ滑らかに広がる光に見え、対応するstage内部の上側切断線はない。移動/縮小後に露出した照明境界として新規退行に数える。 |

照明FAILは文字が読めない/提灯が壊れる重大さではないが、発光体を囲う柔らかな光が途中で平らに切れるため、照明の一体感の受入を妨げる。主文字/物体/動きのPASSと区別する。親へ観測を報告し、moderate FAILとして確定する指示を受けた。sourceコード上の原因はこの視覚担当では監査していない。

## 未確認・作業境界

circle guideはなく、円内外の視覚PASSや数値geometryの判定は行わない。singleの1fixtureのみでrow wire、他variant、他文字列/seed/stageは対象外。正式な複数字体の受入もしていない。厳密なalpha値/サブフレーム時計、immutable before生成経路のコード監査は担当外。

公開URL接続・公開結果確認は一切行っていない。製品/他証拠/旧sticky01 FAILは編集していない。decode/probe/crop生成は終了、常駐media処理なし、CPU解放済み。
