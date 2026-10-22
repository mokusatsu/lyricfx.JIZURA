# Equalizer row visual01 — independent local visual review

判定: **FAIL / 要改善（meter意図の保持）**。単一行・単一baselineへの復帰自体はPASS。比較対象はsealed bundle `equalizer-row-20261022-01` のbefore/afterのみ。修正版や製品の動作を見た判定ではない。

## 資格と実見範囲

最初にmanifest SHA256と記載全30assetの実ファイルSHA256/bytesを照合し、全件一致した。manifest SHA256は `b98ce4c11cd3f6fe84b67e3d357ce7db3d1dfffde53ea32836a571b573cc78a9`。

両MP4をffprobeのcount_framesで確認: H264 / yuv420p / 1920×1080 / 24fps / 4.000s / nb_frames=nb_read_frames=96。before SHA256=`907271908377cd3924d79adb49c988c5ea43c18f5072d01a1f52fe084b87fa55`、after SHA256=`92406236130d49eb41e31ed1c5494d989084afc365a331de89d503ddcc8e7fb3`。

原証拠は2本のMP4。ffmpegで全96framesずつを欠落なくdecodeし、0–23 / 24–47 / 48–71 / 72–95の全画面contact sheetsを各側4枚、全192frames実見した。各tile480×270。表示側はsheetを1632×1509へ縮小したため、afterの全96framesは追加で下部crop `(180,660)–(1740,1080)` の640×172 tilesでも再実見した。8keyPNG（各側3/15/36/90）はすべて1920×1080で原寸確認した。GIFやPNGだけを動画原証拠の代用にはしていない。

## 見えた構造と動き

- before/afterとも左から「風・の・先・へ」の固定4帯。afterは4帯が一つの水平baselineを共有し、左右順の入替え、追加行、途中の二分割、別baselineへの分離はない。実周波数の値や音との同期は映像だけでは証明できないが、左右の帯順は維持されている。
- glyphは各main barの上で上下し、幅広い灰色main bar、左右2本の細い明灰色bar、白い横peakが各帯に留まる。thin barの相対高さも変動し、単に4文字を上下させるだけの動きにはなっていない。baseline下の薄い反射も残る。
- 例えばframes24–39で右の「へ」が伸び、43–46で下がり、47–49で左側が再び大きく立つ。同じ左右の盛衰をafterでも追える。main/thin/peak/glyphの上下の信号関係は残るが、afterの縦の移動距離は目立って短い。
- frame0は「風」のみでbar/baselineがほぼ現れず、frame1で4barが出て、frame2で「の」、frame3で「先」、frame4で「へ」が揃う。これはbefore/after共通の導入。afterだけの突然の消失・行追加・位置跳びとは認めない。frame47等の急な伸びも両側共通のmeter変動。frame4以降、文字や帯の脱落は見ない。
- peakがglyphを横切る瞬間がある（「の」frame5付近、「へ」43–46付近、「先」90等）。key90原寸でafterの「先」の下寄りを白いpeakが横断する。beforeにも同位相の横断があり、新規の分裂ではないが、文字とpeakの完全分離・常時無干渉まではPASSにできない。文字自体は原寸で4字を読める。

## 意図が十分戻ったとしない理由

afterは文字だけでなく全meterが画面下部へ下がり、baselineは概ねy1007（beforeは約y801）。画面上方に広い空きが生まれる一方、反射は下端近くに詰まり、縦の力感が弱くなる。

key36の実画像で、幅広main barはbefore幅約175pxに対しafter約140px。baseline上の灰色本体の高さを画像の灰色連続領域で補助計測すると、beforeは左から約270 / 243 / 318 / 396px、afterは96 / 86 / 113 / 141px。幅の縮小に比べて縦が大きく縮み、nativeで高さ/幅約1.4–2.3の縦長barだった4帯が、afterでは約0.6–1.0の浅い箱〜正方形になる。

key90ではbeforeの高さ約220 / 219 / 114 / 94pxに対しafterは77 / 76 / 39 / 31px。右2帯は幅140pxに対して高さ31–39pxであり、浅い横長の箱として強く見える。frames43–46、54–58、64–70、90–95でも低い帯の縦運動は小さく、原寸でも「伸縮する縦のlevel meter」より「横長の箱の上を文字と横線が動く」印象が強い。全画面縮小では特にこの差が目立つ。

したがって、2行化の問題を避けたことは確認できるが、利用者が重視するlevel meterの視覚的意図が十分戻ったとは独立承認しない。単一行を保ちながらbarの縦横比と縦振幅を再検討する余地がある。数値safeやmanifestのrecipe宣言はこの視覚判定の根拠にしていない。

## 回避円・限界

回避円の輪郭/塗りは両MP4にもkeyPNGにも描かれていない。afterが画面下の一帯に集まり中央上部を広く空けていることは観測できるが、円の境界との接触・余白を映像だけで直接検証したとは言えない。円の座標やradiusの単位を推定してoverlayし、実見済みの円として扱うこともしなかった。幾何判定は別担当の責任範囲。

実時間playerでの連続再生ではなく、許可されたローカルffmpeg decodeの全frameを順序付きcontact sheetsで確認した。24fpsの時系列形状・分裂/跳びは比較したが、再生時の主観的テンポや音同期を保証しない。比較beforeはnativeであり、以前の2行版動画を今回直接見ていない。公開URL、公開browser、ネット接続、起動確認、製品コード読込み、Git操作を行っていない。capturewrapperのcleanup API失敗履歴については本reviewから成功/失敗を推定しない。

ffmpeg/ffprobeは同期処理で全件正常終了し、当reviewのdecode/encoder/playerは常駐していない。sealed bundle・source・既存証拠を変更していない。
