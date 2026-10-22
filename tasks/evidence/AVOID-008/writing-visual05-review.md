# AVOID-008 writing-preview05 独立ローカル視覚レビュー

判定: **限定PASS（letter-fold-inscription-portrait fixtureのみ）**。gpt-6.1-sol / medium / context-none。親から画像の印象・判定を受け取らず確認した。AGENTS.md、implementation-review-policy.md、visual-review-comparison.mdを読んだ。公開結果確認は利用者指示により恒久停止・対象外。公開URL/HTTP/hash/公開画像/公開動画/UI/起動確認は実施していない。browser、新capture、製品実行、tests、原媒体・製品・Gitの変更もしていない。

対象は `/workspace/avoid008-objects/tasks/evidence/AVOID-008/objects/writing-preview05` の1 fixture。manifest SHA-256は `2213fd7d177a361d3b26662dd00676308414ffd39c7887f5d083610f95c53f53`。独立計算したasset8件、source3件、script、fixture、font manifest、font9件、保存engine2件、全sourcePlan/renderPlan/actualCut前後6件のgzipと復元バイトの計37 hash検査は全一致。09iは `174ea2509eccf32dfa305533242bb12d2e5dc9c006deb787d553e3f2b7cf5733`、11pは `7c00507bd0426fe7df4edf04c43a6fa3f38c3264735137b0df93faa9d5b248fc` と一致した。

MP4前後をffprobeし、各540×960、24/1 fps、96 decoded frames、4秒を確認。ffmpegで独立decodeし、前後各0–95の全コマを12コマずつの自作sheetで時系列に実見した。**実時間再生ではなくコマ列実見**である。sheet原寸2160×2955は画像ツールで1344×1838へ表示縮小されたため、細字/二重線の判断は元のnative PNG前後6/42/90を各540×960で実見して補った。decoded前後1/95も単独実見した。

- 紙端: afterは見えている全コマで上下左右4辺が画面内に残り、新しい紙欠けを認めない。beforeのframe1には元の入場による下端cropがある。afterはこのcropを増やさず、全紙を小さく表示している。frame0は両側とも紙が不可視。
- 上部/本文罫線: native6/42/90で、近接した上の太線・細線は2本の組として区別でき、本文と離れている。本文3本は「風の」と「先へ」の各行を挟み、黒いglyphとの異常交差は見られない。署名も黒罫線に乗っていない。
- 文字と読順: before「風の先へ」の1行に対し、after「風の」→「先へ」の2行。左右→次の行という読順は自然で、4字すべてと文意を保つ。欠字・重複・異常な字間重なりは見られない。
- No署名/注記: `— No.01`は主文の下の右側に残り、nativeキーで判読可能。別注記はsourceにも存在しない。fade末期に薄くなるのは紙/主文と同じ退場で、署名だけ消える異常とは判定しない。
- 折り目: 元の淡い2本の折り目は保持され、afterでは大きな文字の一部を横切る。これは淡い紙の折り目として見え、字を切り落とすものではない。濃い本文罫線の交差と混同して無かったことにはしていない。
- 入退場: コマ列で両側のfadeと上下方向のsettle/退場が見える。afterの紙・字・線・署名は一体として移動し、途中だけ部材が飛ぶ現象や新しい紙端cropは見られない。滑らかさの実時間評価は未確認。
- 便箋の意図: 縦長白紙、二重header、本文罫線、折り目、右下のNoで便箋として識別できる。大きな1枚から上方の小さな1枚となり、1行から2行へ変わるため、元の広い余白と画面内の存在感は弱くなる。これは確認した明確な構図変更である。今回の折り畳み紙面への再配置fixtureでは文字/便箋の同一性を失うほどとは判断しない。

保存された全6 plan gzipを独立に復元・parseし、gzip hash、復元hash、復元長を確認した。前後sourcePlanは同一、before sourcePlan=renderPlan、両actualCutは各renderPlanのcut[0]と同一。afterでも元cutの既存全fieldは保持され、placement関係のみが加わる。after trajectoryはobjectScale=0.35 / letterWritingScale=0.7 / letterPaper-fold-panel-inscription、保持窓0.5–3.6を宣言する。全96 frame-keyの時刻i/24を確認した。これら数値やsafe/envelopeの自己申告を画像合否の代替にはしていない。

startup.jsonとmanifest.startupの唯一の差は、後者にだけ最終`sourceStartEndMatched:true`が加わる点。生成scriptがstartup.jsonを先に保存し、capture後にmanifestへ最終flagを足す順序と一致する。hash/版識別の差はない。font audit前後は同一、9 faces loaded、assignmentと全face hashは保存font manifest/実ファイルと一致する。ただし固定transport代替fontでありproduction fontの証明ではない。

未確認domain: 実時間再生の速度感・滑らかさ、96コマ間の連続時刻、4.0秒ちょうど以降（最終コマ95/24）、別text/seed/font/縦横比/variant、production font、UI/編集/保存/Undo/export/アプリ起動。公開結果確認は恒久停止・対象外で、成功へ置換していない。このPASSはAVOID-008全体または上記未確認domainへの合格を意味しない。

全実見frame-key: before:00–95 と after:00–95（各整数を欠けなく全て）。native原PNGキー: before:06/42/90、after:06/42/90。単独追加decoded: before:01/95、after:01/95。列挙は `writing-visual05-metadata.json` のallViewedFrameKeysに全192件を保存した。詳細hash/ffprobe/全復元plan/全decoded PNGのhashは `scratch/avoid008-writing-visual05/receipt.json`、自作sheet16枚と自作decode PNG192枚も同scratchに保持。原媒体・元keysは一切削除・変更していない。
