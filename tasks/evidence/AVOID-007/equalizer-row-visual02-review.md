# Equalizer row visual02 — independent local visual review

判定: **PASS（このfixtureの単一meter意図・動き・可読性・画面内保持）**。縦長barの伸縮が戻り、横に一列に並ぶlevel meterとして見える。01のFAIL記録は変更していない。本判定は新02のみ。円境界の合否は視覚判定の範囲外。

## ファイル資格と実見範囲

manifest SHA256=`88c6fa4f9f92d49edf404f4b34ee950494237e843706c810093b117608bbf30a` は依頼値と一致。記載全30assetについて実ファイルSHA256/bytesが一致した。製品コード/fixtureコードは読んでいない。

両MP4をffprobe count_framesで実測: H264 / yuv420p / 1920×1080 / 24fps / duration4.000s / nb_frames=nb_read_frames=96。afterのSHA256はmetadataに記録。

before MP4・before4keyPNG・observations/before-frames.jsonは、01の同名6ファイルと実bytes比較で全件同一。私自身がvisual01で実見したbefore全96framesと4keyPNGをSHA接続してcarryした。今回beforeを再閲覧したとは扱っていない。

新after MP4をffmpegで全96frames decodeし、0–23 / 24–47 / 48–71 / 72–95の全画面contact sheets4枚を時系列順に実見した。各tile480×270、sheet1920×1776（表示側1632×1509へ縮小）。after4keyPNGの3/15/36/90は全て1920×1080原寸確認。追加でMP4由来frames4/26/44/55/64/76/87/95の右側詳細crop `(1160,150)–(1920,1000)` を380×425 tilesで実見。原証拠はMP4であり、PNGだけを動画原証拠の代わりにしていない。

## 見えた事実

- 4帯は画面右に集まり、一つの水平baselineを共有する。一列のlevel meterとしてまとまっている。途中に行追加、別baseline、二つのmeterへの分裂はない。
- 左から風→の→先→への順が固定される。各glyphの下に対応する幅広main bar、その内側左右2本のthin bar、上部の白い横peakが追従する。文字やbarの左右入替え、別帯への乗換えは見ない。実周波数値や音同期は映像から証明しない。
- 新02はbarが縦長で、4帯のlevel差と伸縮が十分見える。frames24–39で右の「へ」の帯が高くなり、43–46で下がり、47–49で左側が大きく立つ。54–58で中の帯が低くなり、64–76で右側の帯が再び高くなる。main/thin/peak/glyphの上下の信号関係がまとまって見える。
- key36ではmain bar幅約100pxに対し、baseline上の灰色本体高さが左から270 / 243 / 318 / 396px。これはcarryしたnative beforeの同frameと同じ高さ。画像の灰色連続領域で補助計測し、peak/glyphを本体高さに含めていない。01の浅い箱の外観は本02には持ち越されず、barの高さ/幅は約2.4–4.0の縦長になる。
- key90の本体高さも約222 / 221 / 116 / 96pxで、右2帯は低いlevelを示しつつ、幅約100pxとの関係で細いmeterの一部として読める。frame95で全帯が低くなる局面も、途中までの大きな縦運動と共通baselineがあるので「浅い箱だけの演出」には見えない。
- 字間はnative beforeより狭く、一つの語として密に見えるが、4字はそれぞれ判読できる。key3/15/36/90原寸と全frame/追加detailで、隣接glyph同士の新たな交差・潰れ・欠けを観測しない。字の大きさはnativeの大きな見え方を維持しており、右に集めたことによる文字縮小の印象はない。
- 白いpeakが自身のglyphを横切る瞬間は残る（「の」frame5付近、「へ」43–46付近、「先」90等）。carryしたnativeにもある位相関係であり、新02による文字同士の衝突とは区別する。常時peakとglyphが完全分離するというPASSではない。
- 右端の「へ」、そのbar/thin/peak/反射、baseline終端は画面内にあり、frame途中で切れる様子はない。原寸keysと全frameで新たな右端cropを観測しない。補助的にdecoded全96framesのRGB各成分180以上の明部を走査すると最大x1858（frame84）、右端から61pxで、これは明部のみの補助値であり全形状の厳密余白保証ではない。
- 導入frame0は「風」のみ、frame1で4bar、frame2「の」、frame3「先」、frame4「へ」と揃う。beforeと共通の導入であり、新規欠落ではない。frame4以後は4glyph/4帯を保持し、不意の消失・行追加・横方向の跳びを見ない。frame47等の急な縦伸長はnativeにもあるlevel変動。

## 範囲と限界

円guideはMP4/keyPNGに描かれていない。見えない円の境界・接触・余白を検証したとは記録しない。幾何的な円回避合否は別担当の検証範囲。

本reviewは新02のこの4字・seed・4秒映像だけ。全25演出、別文字長、別条件、製品起動や公開サイトを検証したものではない。時系列に全decoded frameを見たが、実時間playerでの再生テンポや音同期は評価していない。公開接続/browser/ネット、コード読込み、Git操作を行っていない。

自身のffmpeg/ffprobeは同期呼出しで正常終了し、decode/encoder/playerジョブは常駐していない。sealed bundle、01review/metadata、製品コード、既存証拠を変更していない。
