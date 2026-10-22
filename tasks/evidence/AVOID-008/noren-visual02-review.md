# AVOID-008 暖簾 noren-preview02 独立再レビュー

**画像 PASS（指定02 bundle・single-Noto・4panel・mon=false・収録時刻に限定）**。素材識別/比較条件照合もこの範囲で PASS。旧01の画像FAIL記録は保持し、成功へ書き換えていない。数値安全性や全variant/fontの承認ではない。

親へ画像を返さず、同じ独立sol担当が自分の01実見履歴のみを引き継ぎ、02の素材と実画像を再確認した。実装者のselfPASS/receiptのsafe値を視覚判定の代用にしていない。

## 素材・源泉・時計の再照合

bundle: `/workspace/avoid008-japanese/tasks/evidence/AVOID-008/japanese/noren-preview02/`。receipt SHA-256 `a812599cbaf93f8e527cc03eddc2d4c7d966b7c6ebd47257b6fb293b78a3a13a` が依頼値と一致。実21asset（index、MP4前後、key PNG前後、追加8時刻PNG前後）のhash/byte数を全件照合し一致。全PNGは540×960。keyとf36 PNGは前後それぞれbyte一致。前後MP4はffprobeで540×960、24fps、96frames、4秒。

sourceHashes全7件を実source/JAEN HTML/capture/fixtureと再照合し一致、sourceStart/Endも同一。before render全文は実immutable native01 gzip展開HTML内、after render全文は実sourceとJA/EN双方のHTML内に存在。native baselineのgzip/展開hashを再確認し一致。02 before.png/before.mp4は01とbyte一致し、基準を都合よく交換していない。

captureコードと実fixture全文を再読。別ページimmutable native before（area=null/trajectoryなし）と、候補after（finalize layoutsC）でnative inputs全体が一致し、旧01 inputsとも一致する。歌詞/lineTextは風の先へ、note空、units風/の/先/へ、default4panel、cloth ink、mon=false、seed704、wind=-1、ph .0914166304282844、540×960、circle(.5,.42)r.2。media/foregroundなし、cut/still/cut、4秒、inDur.35/outDur.4、push cam .022、fx.koma0、chroma0、ghost0等を確認。4枚全て歌詞panelで、今回blank-only panelは存在しない。

論理fontはgothic_blackだが、fixtureは全font familyをAvoid006Fixture/weight400に統一し、local NotoSansCJK-Regular.ttcを読み込む。実font SHAは `b76b0433203017ca80401b2ee0dd69350349871c4b19d504c34dbdd80541690a`。FontFace.load/document.fonts.ready待機はコードで確認。receiptにfontLoaded実観測値・ブラウザ/OS版の記録はなく、製品の全font実測と解釈しない。

実captureのi0..95、time=i/24、PNG f36=t1.5を確認。現行rendererのstepDur/tq量子化/ltb/pOut式はimmutable baseline内にも同じliteralで存在。旧01/新02の実render sourceを比較し、drop、clip、sway、part、fadeとmain mi=miAt(t1+.15)が保持され、追加はpanel reveal metadataと局所item.yの上寄せであることを確認した。main clockを遅らせた形ではない。after recipeはobjectScale.5/mainFontSize56.688984（native.75）/preserveNativeReveal=true、jointdy372.93145で、01と同じ物理布・字scale・全体位置。

## 実見した証拠

前後MP4全96frameをdecodeし、前後12時刻ずつ載せた8枚のcontactsheetをすべて実見した（計192frame）。before/after原寸keyPNGに加え、同capture保存のf04/f05/f06/f07/f09/f36/f90/f94原寸PNGも全16枚実見。旧01f4 decodeと新02f4/f5原寸PNGの風下端を補助cropで比較した。

派生sheet/decode/cropは `scratch/avoid008-noren-visual02/`、cropは `wind-f4-old01-new02-crop.png`。旧01 crop側はMP4decode、新02側は無圧縮capture PNGである。補助cropを全体画像の代用にはしていない。

## 旧指摘の解消と新しい差

旧NOREN-V01-01（after f4=.166667秒、風の下端crop）は **02で解消**。新02 f4原寸で左下払い先端と右下鉤先端が全て描かれ、下に明るい布余白がある。旧01はその先端が裾で切れていた。f5まで表示を待たせず、最初の出現f4で全字を読める。f5で欠けた字片が後から戻る現象もない。

風と先は01より少し上がり、の/へに対して字列に小さな段差ができた。f9とf36原寸で分かるが、各字は独立した揺れる布に付いており、読む順番や可読性を損なう段差とは判断しない。01同様、布は半分・字は75%なので横余白は狭い。今回のhold全frameでは前景の隣布が字を隠す、新規重なり、布外への字のはみ出しを見ない。

| 時刻/frame | 前後の具体的な観察 |
|---|---|
| f0..3 / 0...125 | blank→棒→左から布が伸長。02だけ先に文字が出たり、棒と布が分離したりしない。 |
| f4 / .166667 | 風がnativeと同じframeで全出現。旧下端cropなし。 |
| f6 / .25 | のが全出現。風との接触/相互遮蔽なし。 |
| f7 / .291667 | 先が全出現。上寄せで初出時裾との余白があり、下端を切らない。 |
| f9 / .375 | へまで4字が揃う。へは布内、順番は風→の→先→へ。 |
| f16..86 / .666667..3.583333 | 4枚の全布・全主字を維持。微小なsway、上部帯、棒、裾の傾きを保つ。f36原寸では下方へ移った小さな暖簾でも風の先へと読める。風/先が高めの位置に固定され、時間中に上下へ跳ねる挙動は見ない。 |
| f87..90 / 3.625..3.75 | nativeと同じexitへ移行。f90原寸で全字を確認。afterだけ早期退場/新画面端cropなし。 |
| f91..92 / 3.791667..3.833333 | 前景布がのを部分的に隠し、f92では強く隠す。immutable nativeにも同frameで生じるexitの挙動。新たに別の早いframeで隠れ始めるとは見ない。 |
| f93..95 / 3.875..3.958333 | 布が交差し薄くなり、文字も密集・重なる。f94原寸でnativeにも透明な重なりがあることを確認。小さい暖簾で密集感は増すが、02の局所y補正による新しい欠損/別部品の退場は見ない。 |

棒と全4panel上端の吊下関係、上部帯、裾、paint順の見た目は維持。crestはmon=falseで存在せず、crestの承認はしない。全消失t4は素材の収録範囲外。

演出としては、nativeの大きな縦長暖簾を下方の小さな暖簾へ縮め、読みやすい字sizeを相対的に残した差がある。02修正はその小さな暖簾内で風/先をわずかに上げるため、元の横一線に近い文字位置は完全同一ではない。この位置差を記録したうえで、今回の可読性/出現/接続の視覚チェックは通過とする。

## 範囲と終了

本判定はこの文字列・4panel・single-Noto・mon=false・円条件の保存素材のみ。連続全時刻の数値安全性、全variant/font、単一字左右blank panel、mon=true、異なる文字/寸法/円条件を承認しない。metadataを併記し、01 FAILは保持する。

全ffmpeg/ffprobe処理終了、exact-name pgrepで残存なし。ブラウザ/server起動、再capture、製品/source/tests/Git mutationを行っていない。公開URL接続・HTTP/hash・画像/動画/起動等の公開結果確認は利用者指示により恒久対象外で、一切実施していない。
