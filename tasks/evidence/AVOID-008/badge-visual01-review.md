# AVOID-008 badge-preview01 独立ローカル視覚レビュー

指定bundle `work/avoid008-c-preview/badge-preview01/index.html` を対象に、既存実装・証拠を変更せず確認した。結論は **実見した空間的一体感・可読性・frame列上の入退場は限定PASS、新規の必須修正FAILは検出なし**。リアルタイム再生の動感、本来書体、円との数値的安全性は未判定であり、この報告をそれらのPASSへ拡張しない。

## Receiptと前後対応

- manifest SHA256: `1c8c932b1c947afb952bfd697631d95f58dab855564d2bc821bdd13e18982ff2`。指定値一致。
- manifest全112 assetsの実bytes/SHA256一致。before解凍SHA `ad7257a257ff7bfc43c07fe06bc83490d3cdf8b7fcf716019eb9b3e70e67ce57`、after解凍SHA `fa9f75ba959ef3981b275529f7d6d1b41b399b0cb6958fe3aec09eb6050d1a2b` はmanifestに一致。beforeは `tasks/evidence/AVOID-008/native01/index.html.before.gz` と解凍bytes同一。初回 `2bb` のgit略記は解決不能だった。その後、正式commit `2bb3f864b5d40361961d8ad2aabeec24bfb5d1cb:index.html` を `git show` で取得し、bundle beforeの解凍bytesと完全同一を確認した。
- 2条件はlandscape 960×540 hello／portrait 1080×1920 school。両方circle中心(.5,.42)、短辺比radius .2、seed704、歌詞「風の先へ」、同一Noto代替書体。capture scriptの前後は共通fixture/寸法/文字/seed/時計、beforeとafterのsource/recipe切替。実コードの正当性は親レビュー対象。
- 実ffprobeにより4MP4ともH264/yuv420p、24/1fps、96frame、4.000秒。全384framesのPTSは `i/24`（最終95=3.958333秒）、frame JSONも同時刻。16原寸keyPNGはframe JSONのhashと一致。
- 詳細receipt（全assets・全MP4 frame PTS・pins）は `scratch/avoid008-badge-visual01/receipt.json`、要約は `tasks/evidence/AVOID-008/badge-visual01-metadata.json`。

## 実見方法

4MP4をローカルffmpegで全frameにdecodeし、before/after同時刻対比の8 contact sheetsを実見した。各条件0–95全frameを掲載（384画）。縮小シートは時間的対応・大きな形状推移の判断だけに使用。さらにbundleの16 keyPNG（各side f6=.25、f36=1.5、f91=3.791667、f93=3.875秒）を `view_image` のoriginal指定で実見。追加でMP4 decode原寸のf1=.041667およびf95=3.958333秒を各side計8画実見した。抽出画像の連番は1始まりで、`002.png` がf1、`096.png` がf95。リアルタイム動画再生・HTML UI起動は行っていない。

## 条件別判断

### Landscape hello

原寸 `images/badge-landscape-{before,after}-36.png` で、beforeの中央横長名札がafterでは左上寄りの縦に近い名札となる。HELLO → my name is → 主歌詞という階層は残り、黒い外板・白い文字領域・headerがまとまった一枚の名札として読める。主歌詞は「風の／先へ」の2行へ変わる。各文字は欠けず、重なりもない。afterの下段「先」の下余白はbeforeより明確に狭いが、白領域内に収まり、可読性FAILには至らない。横幅縮小と行組変更は視覚的に大きな変更なので、元の横長意匠の完全保持とは扱わない。

f6では前後とも主歌詞がまだ表示されず、metadataと板だけが入っている。f7以降のcontact列で主歌詞が同時刻に現れ、holdで一体性が保たれる。f91/f93原寸とf95 decodeで、afterはbeforeより横方向の成分が強く、時計回りに傾きながら薄くなる。plate・header・主歌詞は一緒に動く。before f93/f95は下端へ抜けてstage cropする一方、afterはstage内に残ってfadeする。このため退場らしさは読み取れるが、完全に画面外へ落ちる終わり方と同じ見えではない。成分交換の厳密な長さ・18度・eo時計の同一性は静止画から証明しない。

f1原寸では前後とも上端でheaderが切れるnative entry。afterの切れ方は位置調整で増えるが、f6およびholdでは新規stage cropを認めない。

### Portrait school

原寸 `images/badge-portrait-{before,after}-36.png` で、beforeの中央大判名札からafterは上方へ移り、板が小さくなる。「1ねん 4くみ」→罫線→「なまえ」→「風の先へ」の関係は保持され、すべて読める。主歌詞は一行を保ち、板に対する文字の余白も残る。右上の丸、罫線、上方の細いpin状線と端の丸は前後に存在する。同じ相対関係のまま動いており、afterだけの分離や装飾の取り残しはない。上の細線が板から少し離れて見えること自体はbeforeにもある。

f1–3ではafterが上端から入り、一部がstage外になる（f1原寸では板下部だけ見える）。元entryを上へ移した結果として読み、hold cropとは区別する。f6、f36、f91、f93の原寸でmetadata・歌詞・板・pin状線を確認し、hold以降の新規crop/文字欠けは見つからない。f91→93→95で板全体が右下へ進み、時計回り回転・fadeする。beforeは最終frameで下端/右端crop、afterは小さく上方から始まるためstage内で薄くなり、動きのまとまりは残る。

## 判定の制限

- circle guideは映像/PNGにない。中心やradiusの記載を画像上の円と見なさず、円回避の数値的安全は判定しない。
- 本来複数書体を単一Noto CJKへ置換したtransport。字体の本来の表情・字幅差・font別細部は未判定。
- 全frameを時系列静止対比で見たが、リアルタイム再生は未実施。動きの速度感・自然さの最終承認は未見事項。
- 抽出した全frameを原寸で個別検査したわけではない。細部PASSは列挙した原寸24画とそれに続く視認可能な列の範囲に限定。
- 公開結果確認は利用者指示により中止・対象外。公開URL/HTTP/hash/画像/動画/UI/起動/公開後確認を一切実行していない。
- 使用ffmpeg/ffprobeは終了済。browser/serverは起動していない。
