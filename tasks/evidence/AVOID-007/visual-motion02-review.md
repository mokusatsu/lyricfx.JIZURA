# immutable02 independent motion review

判定: **視覚範囲 PASS（観察事項あり）**。5修正の部材接続・主歌詞の読順・動きの対応に、新しい破綻は見つからなかった。追加wordCloudも主歌詞の欠落やf91での構図跳びは見つからなかった。一方、全beforeの厳密一致という条件はwordCloud-before f91のnative RGBA hash差により **FAIL / 原因未解決** のまま。視覚PASSはその差の解消やcapture再現性の保証を意味しない。

担当はcontextを遮断した gpt-6.1-sol / medium。親は画像を開かず、この独立実見に基づく。準備依頼visual-motion02-request.mdを読み、immutable原本は変更せずscratchだけへ抽出した。repo/祖先の探索で適用AGENTS.mdは見つからなかった。ブラウザ起動、製品/テスト編集、Git、公開は行っていない。

対象manifest SHA256: `186580a8269d1b51f481f84001277f154722fee700226876ed0b82f3c80cbc4f`。旧01: `c0c64e78bbbfc33761e378acd21fd7899cd59353e3a1ac1dcb02e6c9c2a77274`。554 listed raw assetsを再hashして全件一致し、freeze02-identity.json記載の79after sourceおよびJA/EN productsもbundled sourceと一致した。freeze source aggregateは`c0e72b76a33296039d8f1e6946bb96c2b84a6a53ab0e22535ab62bf46e54eb70`。native-stream-comparison02.jsonではafter対象外20×96=1920native hashes一致、before2399/2400一致（wordCloud91のみ差）、修正5afterのdraft15key PNG/RGBA一致が記録されている。このreceiptを確認し、unexpected wordCloudを追加実見した。これはこの担当自身が全25familyのnative再描画を行ったという主張ではない。

実見範囲は tunnel / elastic / typeSpecimen / kanjiFocus / equalizer の前後10MP4にwordCloud前後2MP4を加えた12本。各96frame、合計1152frameを全てffmpegで抽出し、各family4枚のbounded contact sheet（24枚）を全て開いて時系列に走査した。frame0–95、24fps、t=n/24、0–3.958333s。各sheetは前半24before、後半同じ24afterで、区間は0–23 /24–47 /48–71 /72–95。抽出完了・CPU解放を親へ通知してから、画像実見へ移った。実時間動画再生やdrop0検証はこの担当の範囲外。

scratch: `/workspace/scratch/avoid007-motion02-sol/`。sheet2304×1936（384×216/frame）はviewerで1713×1440に縮小された。elastic/kanjiFocusのnativeは3200×1080、他4familyは1920×1080。時間走査用thumbnailは同じ384×216へ非等方resizeされており、elastic/kanjiFocusの形状判断にはafter f36の1:1 cropを使った。細線/小文字の全frame原寸保証はしない。全対象frame36(1.5s)のbefore/after native PNG12枚も開いた。3200幅のfull viewはviewerで2048幅に縮小されたため、after elastic `(350,420)-(1650,930)` とkanjiFocus `(1850,70)-(2900,1040)` をnative1:1 cropで別途確認。typeSpecimen after f36の上段label/顔も `(100,0)-(1420,210)` で1:1確認。各原本/派生物hashはmetadataに記録した。

| Family | 判定 | 具体的実見 |
|---|---|---|
| tunnel | PASS | 横一行が左列「風/の」・右列「先/へ」へ分かれる。両列を左→右で読む構成として明瞭。周縁反復とは離れ、全96frameで周縁の位置/拡縮/消え方が対応。通常の右列先行縦書きと同じではなく、横一行の保持とは言わない。 |
| elastic | PASS | 下側左寄りに歌詞・両端円・短軸が一緒に移る。f0–2の細い導入、周期的伸縮、f91–95の広がりがsourceのphaseに対応。旧中心に残った端点や別軸、剥離した字は見えない。f36原寸で一つの斜め軸として確認。 |
| typeSpecimen | PASS | 六つの異なるfaceが上段3・下段大主歌詞+2へ再配置。f36原寸でserif regular400、rounded extrabold800、dot regular400、sans bold700/regular400、serif bold700を読める。13–18のindexもbeforeと一致。labelと各sampleが剥離せず、段階的revealが対応。 |
| kanjiFocus | PASS | 巨大outline風、小さい主歌詞、金dot、underlineが右側で一つの構成。reveal/fadeも対応し、旧中心に取り残したdot/線は見えない。outlineが主歌詞の背後を横切る関係はbefore/after共にある。 |
| equalizer | PASS・観察事項 | 4列から右側2×2、上「風/の」下「先/へ」。棒本体・細い内部信号・cap・基線がchartに留まり、高さ変動の対応が見える。f48–71などcapが字へ交差し瞬間的に個別字が読みづらいsource挙動もafterに残る。全frameで完全可読とはしない。新たな細棒剥離は見えない。 |
| wordCloud | PASS・観察事項 | 白主歌詞が右下で明瞭、周辺反復は中心cloudで出現/消失。全96frameで突然移動や主歌詞欠落を見ない。f36原寸では白い主歌詞が下側secondary「へ」等へ部分的に重なり、beforeの中心主歌詞に比べcloud中心に空きが生じる。主歌詞の意味/順は保たれるが、secondary遮蔽ゼロとは言わない。これは旧01からafter20 exactの対象でもあり、今回5修正による新規差とはしていない。 |

wordCloud-before f91(3.7916667s)は旧01/新02両MP4から1920×1080 decodedRGBを抽出し、両full画像・差分8倍・差分外接範囲 `(366,695)-(1380,846)` の両原寸cropを実見した。主歌詞の意味・順・位置・構図は同じに見え、差は周辺小部に限られ、読める主歌詞の変化とは認めなかった。decodedRGB比較は532pixels、max absolute channel difference19、RGB MAE0.0006442901。旧decodedRGB SHA256 `6461e9a54b74750211c74328acd4fc791887ea47600bee4e06c83567f4f5be3a`、新 `243e25eb519b835611ca9f869eead6b5661171ee133fa5f521cbe18e9dc28e8e`。

この数値はlossy H264由来のdecoded差であり、native差532pixelsという意味ではない。旧f91 native PNGは未保存なのでnative差の厳密量、Canvas/encoder/環境などの原因は確定しない。wordcloud-before-input-comparison02.jsonの89 inputs/conditions一致は確認したが、それを理由にnative RGBA hash差を無視しない。

この判断は記載条件（文字「風の先へ」、seed704、circle中心0.5/0.42、radius0.2、記載canvas/font/params）の捕捉4秒中の離散frameと指定原寸keyに限る。未検証条件、subframe、4秒外、実ブラウザ連続再生、全時刻の安全性や性能を保証しない。lossy MP4とnative PNGのexact equalityは主張しない。
