# AVOID-008 editorial visual02 独立ローカル再レビュー

判定: **bundle02の素材対応PASS、3例の一致範囲で限定視覚PASS**。visual01で検出した雑誌原寸copy不一致は修正素材で解消した。旧preview01/native-stills01とvisual01のFAILを取り消さない。親は画像未見、この担当が新原寸18枚を実見した。

## 同一性と実見の範囲

対象 `/workspace/avoid008-editorial/tasks/evidence/AVOID-008/editorial/bundle02/`。manifest SHA256 `9e2e9e981041a6c7466acaf0c5d5b1cd90101fdd817e021f768cd40788a6cd1c` が指定値と一致。全37記載assetsのbytes/hash、14inputPinsのhashが一致。changedInputsは空。HTMLのcaption/actualFixtureSpec/各PNGリンクをファイルとして読み、条件・copy・side/frame対応を照合した。ブラウザ起動、公開確認、製品の変更は行っていない。FAILURE-NOTICE.mdを実読し、旧copy対応FAILと別経路のraster audit不足を認識した。

actualFixtureSpecはimmutable matrix04ケースとdeep equal。各before/afterのsourcePlanはdeep equal、W/H/fps24/duration4/seed704/text/noteを独立assertした。actualCutはrenderPlan.cuts[0]と一致し、textとnoteは実specと一致。cutのstart0/end4/inDur.35/outDur.4は双方共通。source/render/cutを保存する生成スクリプトも実読し、同frame描画からnativeとhalf-resolution PNGを得る手順、入力assert、旧encoder-inputとの全hash assertを確認した。

6MP4 bytesを旧preview01と直接比較し**全件完全一致**。新6frame logの576件すべてについてframe index/時刻n/24/halfResolutionPNGHashを旧encoder-input logと独立照合して一致を確認した。再描画そのものはこの担当では行っていない。旧MP4のH264/yuv420p、24fps/96frames/4秒/audioなし、雑誌320²・他480×270という独立ffprobe結果と、同じ担当による全frame前後の実見は**このbytes一致を条件としてcarry**する。新動画をリアルタイム再生したとは記録しない。

新native PNGは18枚すべて原寸で実見。各case×両side×f6(.250秒)/f36(1.500秒)/f91(3.792秒)、雑誌640²/他960×540。画像header寸法・metadata時刻を独立assert。旧保存half-resolution PNGと原寸を縮小した画像の対応を数値補助し、最大RGB平均絶対差1.558/255（補間差あり）。目視でcopy/レイアウト/時刻の段階が対応する。雑誌の別copyを同じものとみなしていない。全frameの実見はvisual01での24枚対比sheet（576画像）からcarryし、新原寸の細部は今回あらためて判定した。

## 例ごとの限定視覚判定

| case | 実条件 | 判定範囲 |
|---|---|---|
| magazine-headline-4 | 640²、角(.9,.1)、短辺r=.1、headline、『雨上がり Hello 123』 | 新原寸f6/36/91で混在copyと紙面対応を確認。通常円成功の証拠ではない |
| contents-tate-1 | 960×540、通常円(.5,.42)、短辺r=.2、tate、『風の先へ』 | 縦列/番号/見出しの対応維持。activeは4秒1stateのみ |
| footnote-native-1 | 同通常円、kome/center、『風の先へ』 | 本文/描画済みsource固有注記/記号/罫線の対応維持。input.note表示は主張しない |

雑誌: 原寸の見出しは『雨上がり』『Hello』『123』の3行で、旧動画の同frameと一致する。f6は開き途中の左ページと折り面、f36は見開き、f91は閉じる途中の左ページである。afterは全体が約32stage px下へ移るが、見出し・左メタデータ・折り目・右写真枠/黄色要素・2段本文・folioが同じ紙面に乗り、互いに別方向へ逃げる状態はない。原寸f36で英字/数字・日本語を含む見出しは可読、メタデータ12 CHARSとfolioも保持され、stage端の新規cropや字欠落は検出しない。右本文は元から薄い小字で広い字間の反復copy、先頭が途中の断片になる。黄色barsは画像枠より下へ延び本文先頭付近に触れるが、beforeにも同じ関係がありafter新規悪化ではない。紙面としてのこの元の意匠は保持されたという限定PASSであり、本文の文学的な読順や最良の可読性を保証しない。

目次: 新原寸全6枚で『目次』の縦見出し、本文列『風の先へ』、終/序、046/026/000、点線、区切り線の対応が一致。afterは右へ集約するが『目』『次』は画面内に全字が収まる。本文縦読順、active黄色線と026の対応が保持される。f6の線出現途中、f36hold、f91の後半状態は旧同frameと対応。新しいcrop、不自然な重なり、部品欠落を検出しない。全4秒はactive『風の先へ/026』1stateだけで、active変更を観察したとはしない。

脚注: 新原寸全6枚で本文と注記の対応が一致。before主文一行に対しafterは『風の』『先へ』2行で、各行右上に※1/※2が付く。before f36の※1が『先』上部へ接する状態よりafterの対応は読み取りやすい。下部のsource固有注記は『※1 風の 00:00.00』『※2 先へ 00:02.00』と罫線。afterも同じcopy/記号/時刻を保持する。f6は注記出現前、f36/f91は注記ありという時計対応も一致。stage cropや字欠落の回帰を検出しない。input.note『遠い空の向こうへ』は入力に保存されるが画像に描かれていない。captionはこれをsource固有注記と区別しており、誤った表示・保持実証の主張は修正されている。新機能としてinput.noteを描く要求や成功判定は行わない。目次/脚注には紙/板がなく、紙との一体感は該当しない。

## 限界・継続未判定

- リアルタイム再生なし。旧同一MP4の全frame対比をcarryした段階/時計比較で、体感速度や滑らかさは未判定。
- 円ガイドなし。円の数値的安全・余白・paint内侵入は未判定。source recipe/trajectoryのsafeと画像実見を混同しない。
- 目次のactive遷移、input.noteの特定copy表示、4秒外のentry/exit完結、全production font family/全copy/全variantは未判定。8 actual-face C-corpus fixtureの3例に限定する。
- baseline compiledは `7cd5a5b:index.html` と一致する `17e35475df196fc87a931802a21683a1d4c7b0cafcbba88feb2e50c9ba708456`。afterはimmutable matrix04再生成compiled `db371e02b0365e6368b1e4cfe7973f4f438ee7cdc35f929d0a244530a86f0bc5` を識別対象とする。source commit `4c3d36d` 単独とは完全一致を主張しない。visual01で検出した09gの未commit検証copy差と、生成compiledがsource commit内checked-in index.htmlと同一とは限らない区別を維持する。
- 旧raster全plate audit値は別測定経路の検証対象であり、このレビューはそれを承認しない。実MP4/原寸表示の観察結果とraster audit証明を分ける。

公開結果確認はAGENTS.mdの恒久禁止に従い未実施・対象外。既存01/native01/FAILURE-NOTICEと旧レビューは編集しない。scratchは `scratch/avoid008-editorial-visual02/`、この担当が起動したmedia/browser常駐プロセスはない。
