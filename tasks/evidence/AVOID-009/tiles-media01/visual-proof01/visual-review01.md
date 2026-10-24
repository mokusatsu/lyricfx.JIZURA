# tiles-media01 独立静止画レビュー

判定：PASS（指定7対の静止画比較に限定）。

元14PNGを view_image(detail="original") で960×540原寸実見した。主要な文字タイル、ラック、点数、SCOREは約134px下へ移動し、文字、色、大きさ、横配置、重なり、影の意図を保持している。新たな文字欠け・下端切れは確認できなかった。

初回はbefore側上端の細い灰色横線がafter側に見当たらないと目視で判断し、保留とした。その後、元PNGのRGBA配列をPillowで読み、全7対について全幅上20px（x[0,960), y[0,20)）と線周囲（x[280,425), y[0,20)）を比較した。全14ROI比較で異なる画素数0、異なるチャンネル数0、最大差0、対応する配列SHA-256も一致した。細線消失の指摘は目視見落としだったため撤回し、PASSへ訂正した。線・周辺背景の修正は不要。数値・ハッシュは roi-comparison01.json に保存した。

| 時点 | 実見した前後共通の状態と根拠 |
|---|---|
| 0.10秒 / 006 | 文字0、ラックのみ。形、色、陰影を保持。 |
| 0.40秒 / 024 | 読める文字3「風」「の」「先」。「先」は右側に浮遊。色付きタイルの重なり、傾き、影、SCORE「010」を保持。 |
| 1.00秒 / 060 | 4文字「風の先へ」が整列。各点数10・2・10・2、黄色「024」、SCOREを保持。 |
| 2.00秒 / 120 | 同じ4文字の整列状態。下移動以外の明瞭な意匠差なし。 |
| 3.60秒 / 216 | 同じ4文字、退場前。タイル間隔とラックとの関係を保持。 |
| 3.85秒 / 231 | タイル上で明瞭に読める文字3「の」「先」「へ」。背後にシアン・ピンクの文字残像。左端の残像の切れ、半透明の重なり、影、ラック、「024」は両側に存在。左端切れは変更前にも存在。 |
| 4.0667秒 / 244 | 文字0。ラックとSCOREも消え、両側とも背景だけ。 |

動画は閲覧していない。動画の連続性、全時刻での円回避、motion、全体幾何、人間による動作確認は未判定。人間にはMP4で登場・着地・残像を伴う退場の連続性と、下寄せされたSCORE／024の下端余白（静止画では約14px）を確認してほしい。

実見した元PNG（共通ディレクトリ：/workspace/lyricfx.JIZURA/tasks/evidence/AVOID-009/tiles-media01/local-proof/images/）：

- /workspace/lyricfx.JIZURA/tasks/evidence/AVOID-009/tiles-media01/local-proof/images/before-006.png
- /workspace/lyricfx.JIZURA/tasks/evidence/AVOID-009/tiles-media01/local-proof/images/after-006.png
- /workspace/lyricfx.JIZURA/tasks/evidence/AVOID-009/tiles-media01/local-proof/images/before-024.png
- /workspace/lyricfx.JIZURA/tasks/evidence/AVOID-009/tiles-media01/local-proof/images/after-024.png
- /workspace/lyricfx.JIZURA/tasks/evidence/AVOID-009/tiles-media01/local-proof/images/before-060.png
- /workspace/lyricfx.JIZURA/tasks/evidence/AVOID-009/tiles-media01/local-proof/images/after-060.png
- /workspace/lyricfx.JIZURA/tasks/evidence/AVOID-009/tiles-media01/local-proof/images/before-120.png
- /workspace/lyricfx.JIZURA/tasks/evidence/AVOID-009/tiles-media01/local-proof/images/after-120.png
- /workspace/lyricfx.JIZURA/tasks/evidence/AVOID-009/tiles-media01/local-proof/images/before-216.png
- /workspace/lyricfx.JIZURA/tasks/evidence/AVOID-009/tiles-media01/local-proof/images/after-216.png
- /workspace/lyricfx.JIZURA/tasks/evidence/AVOID-009/tiles-media01/local-proof/images/before-231.png
- /workspace/lyricfx.JIZURA/tasks/evidence/AVOID-009/tiles-media01/local-proof/images/after-231.png
- /workspace/lyricfx.JIZURA/tasks/evidence/AVOID-009/tiles-media01/local-proof/images/before-244.png
- /workspace/lyricfx.JIZURA/tasks/evidence/AVOID-009/tiles-media01/local-proof/images/after-244.png
