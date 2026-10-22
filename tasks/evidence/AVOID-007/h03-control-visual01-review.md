# AVOID-007 H03 control: 独立視覚レビュー

結論: **control全体はFAIL**。rain/panLは観測付きPASS、bubbles/pushはafterの局所的な新規可読性低下によりFAIL。これは今回の別3全文controlだけの判定であり、既存8cut/raw02のFAILを修正・再判定したものではない。manifestのsafe表示や円の数値検証から視覚判定を推測していない。

## 入力の同一性と範囲

sealed bundle: `work/avoid007-h03/control-native-local-20261022-01/`。manifest SHA-256 `9788b3b3ac0efac2d403460baf94a09fecd5737537600f0b5fa2ea6917550934` が指定値と一致。manifest記載224assetのraw SHA-256を全て再計算し224/224一致、実ファイル225。4MP4のstreamもffprobeで実測した。hash全件・stream全情報・画像hash/dimensionsは同名metadata JSONに保存。

profile `native-single-retention-v1`。initial記録4件でseed704、3200×1080、circle(.5,.42,.2)、元projectのsingle:true、全文line0「風の先へ」at0、line1「光を越えて」at4.5、line2「夢の続き」at8、retainedCutIndices[0,1,2]とend9.5を確認。8fontsと元BG/FG 12s動画はasset hashの対象。表示window[.5,4.5)はowner0のみ。line1/2はwindow外であり、非表示を欠落扱いしていない。

4動画は全てH264/yuv420p、3200×1080、24/1fps、4.000000s、nb_frames=nb_read_frames=96。ffmpeg `-threads 1`で全動画を実decodeし、各96枚、合計384枚のPNGを生成した。

| 動画 | raw SHA-256 |
| --- | --- |
| h03-rain-panL-before.mp4 | `294f9d9765bbf6633829cf0de84700138bd2acc09c1899dcabeded4d468e3558` |
| h03-rain-panL-after.mp4 | `b285f8bf7a0b4a68be71cabae13deec59d1a9d034e5d0a565cb967de87da36f6` |
| h03-bubbles-push-before.mp4 | `80b4d35dd13223dfae855eded61436e590fc5e2eec5898dd8102d7a4e5c2eb48` |
| h03-bubbles-push-after.mp4 | `18621650050013b334849614c90f669685e040ac38835422d53d161ee3a51e5b` |

## 実際に見たもの

- 全384decoded framesを、同時刻before/after左右対照の32枚のcontact sheetsで**全てview_image実見**。各pairについてf0–5、6–11、…、90–95の16枚、各sheet1280×1428、各動画frame640×216。飛ばしたframeなし。
- native key PNGはf3/15/36/90 × before/after × 2pairs = **16枚全て実見**。元3200×1080はtoolで2048×691へ縮小されたため、それだけで細部判定しなかった。
- その16native keysから主要文字を含む**原寸crop16枚全て実見**（リサイズなし）。さらに疑いのあるbubbles「先」をdecoded f15/36/60/75 × before/after = **原寸detail crop8枚全て実見**。
- 実見したユニーク画像ファイル合計**72枚**（sheets32+native16+native crops16+decoded crops8）。元動画をリアルタイム再生したという意味ではなく、全frame接触票による逐次比較である。

frame番号は0始まり、絶対時刻t=.5+f/24。f75=3.625からf95=4.458333までの21frames/動画はslotEnd3.6後の真の残留。ここも全て実見した。

## 判定軸の分離

| 判定軸 | rain/panL | bubbles/push |
| --- | --- | --- |
| 同時刻のentry/hold/残留位相、主文字と所有shapeの保持、欠落・新規跳び、BG/FG位置・進行 | 観測範囲内PASS | 観測範囲内PASS |
| afterで新規に主歌詞の局所contrastが低下していないか | 白枠接触の注意観測あり、明瞭な可読性退行は認めず | FAIL: 「先」の下部が淡黄bar上で低contrast |

上段のH03保持観測と下段の任意BG上のcontrast観測は別の結論である。overall FAILは下段を含めた視覚レビューの判定であり、主文字欠落や位相破綻を検出したという意味ではない。

## 個別判定

### rain/panL — 観測付きPASS（このwindow内）

before中央からafter左へ主歌詞が移る。f0–8前後の「先」「へ」の上方からの出現と白/黄の重なりはbeforeにもあるnative entryで、afterだけの欠落としなかった。f15(1.125)、f36(2.000)、f90(4.250)原寸cropで「風の先へ」の順序・4文字・太い画線を確認。f75以後も主歌詞はそのまま残り、3.6境界で消えたり新しい不規則な跳びへ切り替わったりしていない。縦のrain/copy列も進み続け、主文字だけが附属要素から突然離れる現象は認めなかった。

注意観測: afterの「の」右縁はBGの白い縦枠に接する。原寸f15/36/90でも縦枠との接続は見えるが、文字内の抜きと外形が残り、4文字は容易に読めた。白枠との交差だけを理由にFAILとはしない。BGの緑panelとentry文字の接触もあり、当該frameで主歌詞がFGに隠れる、新たに文字が欠けるという現象は確認しなかった。

### bubbles/push — FAIL（新規の局所的可読性低下）

beforeの横1列「風・の・先・へ」が、afterでは上段「風の」／下段「先へ」の2×2となる。左上→右上→左下→右下の読み順は保てる。小さくなるものの、4文字・各bubble外周・光沢弧・小さい点・黄色の「の」の面はnative16keysと全frame対照で残っており、bubbleだけ置き去りになる、文字が脱落する、新規の跳びは見なかった。浮遊位相も進み、slotEnd後のf75/84/90/95で4文字とbubbleは保持される。

ただしafter下段「先」がBGの淡黄barへ移動し、**f15(1.125s)、特にf36(2.000s)で、左下払いおよび下部の白画線が淡黄面上になって輪郭を追いづらくなる**。native key原寸cropとdecoded原寸detail cropの双方で確認した。before同時刻の「先」は褐色面上で下部まで明瞭。f36ではafterのbubble左下外周も淡黄面上で弱まる。これは単に不透明BGと主歌詞が交差したという判定ではなく、**実際にafterの白画線とBGの明度が近くなった局所的な低コントラスト**である。実見できたのは「主な字形・4文字・2×2読順は認識できるが、局所の払いが低コントラスト」という程度である。「先」が識別不能、別字に見える、全文が読めないとは実見していない。全文の認識は可能だが、beforeと同等の局所可読性を維持したとは判定しない。

f60(3.000s)はbar上縁が「先」の足先付近まで下がり、f75(3.625s)・f90(4.250s)では字の下に離れる。したがって全windowで常時文字が隠れるという主張ではない。右上FG panelによる主歌詞遮蔽は確認しなかった。

### BG/FGの位置・時計・動き — 新規退行を認めず

2pairsともBGの大きい褐色panel/白枠/上方heading時計、緑移動panelと下方淡黄bar、右上の青いFG panel/時計/ピンク移動barが同時刻before/afterで同じ位置・同じ表示値に見え、時間とともに進行する。native f3/15/36/90でBG/FG双方の時計0.625/1.125/2.000/4.250を確認。decoded早期には隣接frameで同じ時計値を示すstepもあるが、before/after双方で同じ進行として観察した。24fpsの全frameで媒体内容が必ず一意に更新される、あるいは目視でサブframe同期を保証するとは言わない。

## crop/source inventory

全てscratch `scratch/avoid007-control-visual01-sol/` 内。native sourceはbundle `images/` 内。下表のboxは元3200×1080に対する左上x,y,右下x,y、cropは原寸。各列のf3/15/36/90を全て実見した。

| case/side | native source stem | crop box | crop寸法 |
| --- | --- | --- | --- |
| rain before | h03-rain-panL-before-{3,15,36,90}.png | 950,0,2200,750 | 1250×750 |
| rain after | h03-rain-panL-after-{3,15,36,90}.png | 50,0,1350,750 | 1300×750 |
| bubbles before | h03-bubbles-push-before-{3,15,36,90}.png | 820,300,2320,750 | 1500×450 |
| bubbles after | h03-bubbles-push-after-{3,15,36,90}.png | 700,350,1300,930 | 600×580 |
| bubbles decoded before | h03-bubbles-push-before/{016,037,061,076}.png | 1600,300,1950,750 | 350×450 |
| bubbles decoded after | h03-bubbles-push-after/{016,037,061,076}.png | 750,600,1100,1000 | 350×400 |

crop名はnativeではsource stem+`-native-crop.png`、decodedでは0始まりf15/36/60/75を含む`-decoded-detail.png`。全72画像の個別パス・SHA-256・寸法はmetadata JSONのviewedImagesへ記載した。

## 未実施・限界

ブラウザ実行、実装修正、Git操作、公開はしていない。円の数値安全性はこの視覚レビューでは再計算していない。credits/dutchはinsufficientで動画なしのため視覚未実施。window外、他半径、未来line1/2、cross-owner、未表示source、9.5までの全時間の見え方は保証しない。旧8cut/raw02画像は開いておらず再判定していない。
