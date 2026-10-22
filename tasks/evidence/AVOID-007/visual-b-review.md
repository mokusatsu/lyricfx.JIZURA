# AVOID-007 visual-b review

- Reviewed UTC: 2026-10-22T09:26:43.434175+00:00
- Immutable bundle: `/workspace/lyricfx.JIZURA/work/avoid007-native/local-20261022-01`
- Manifest SHA256 (actual): `c0c64e78bbbfc33761e378acd21fd7899cd59353e3a1ac1dcb02e6c9c2a77274` (matches supplied pin).
- All 16 input MP4 actual SHA256 match manifest assets; per-file values and ffprobe results are in `visual-b-metadata.json`. Each reports 1920×1080, 24/1 fps, 96 frames, 4 seconds.
- Before: e96 original fullstage geometry. After: avoidance opt-in, before default switch 017. Same circle (.5,.42,r=.2 shortside), seed704, text「風の先へ」and pinned fonts.
- No source assets changed, transcoded, or overwritten. ffmpeg decode used `-threads 1` before input and output. Inspection PNG/contact sheets only were created in `scratch/avoid007-visual-b`.

## Material finding

tunnel has a readability regression in the inspected sample. Other seven IDs have no additional clear defect observed in the sampled images; this is not an all-time pass. curtain retains the stage-fixed slate phase but changes the moments when the relocated text becomes visible/covered.

## Inspected evidence

Every before/after MP4: frames 0,6,12,24,36,48,72,90,95. Actual ffprobe presentation times: 0.000000,0.250000,0.500000,1.000000,1.500000,2.000000,3.000000,3.750000,3.958333 seconds. Paired sheets: `scratch/avoid007-visual-b/{tunnel,wordCloud,crossBands,zoomRepeat,credits,slotMachine,flipBoard,curtain}-contact.png`. All were viewed.

slotMachine, flipBoard and curtain additionally: every frame 0–15 and 88–95, in paired `*-intro.png` and `*-exit.png` sheets. Actual presentation timestamps and paths are recorded per side in metadata. These transitions were viewed.

Native PNGs viewed at original resolution: `images/b25-tunnel-before-90.png`, `images/b25-tunnel-after-90.png`, `images/b25-tunnel-after-36.png`, `images/b25-credits-before-36.png`, `images/b25-credits-after-36.png`, `images/b25-zoomRepeat-after-36.png`. Also viewed tunnel after frame72 decoded PNG at original resolution. Each viewed sheet/native image actual SHA256 is recorded in metadata.

## Per-ID findings

### tunnel — finding-readability-regression

主歌詞は右下へ移り4字と読む順を維持。全画面の遠近線/周縁反復も元の大きさと動きを保つ。一方after36(1.5s)原寸では金色の逆さ反復が主歌詞「風」「の」「先」の上側に交差し、水平の枠線も主歌詞を横切る。after72(3.0s)のdecode原寸とafter90(3.75s)native原寸では、白〜灰の逆さ反復が主歌詞の下1/3を横断し「風」の下部、「の」の下部、「先」の下部、「へ」の右下側と交差する。before90では中央の主歌詞が暗い空間で独立しており、この追加の線画交差はない。欠字とは判定しないが、afterの輪郭の読み分けと主歌詞の階層が劣化。

補助反復が円に入ったという判定ではない。移動した主歌詞と据置の周縁反復が可視的に交差して読みづらくなることを根拠とする。補助配置維持という条件下でprimary配置を再検討する必要がある。

### wordCloud — no-additional-defect-observed-in-samples

太い中央主歌詞は右下へ移り「風の先へ」の1行を維持。雲の色/大小/向き/段階的な出現は対応するsampleで元のまま。after24以降、主歌詞近辺の薄い反復は残るが太い4字を識別でき、tunnelのような明瞭な輪郭交差による退行はこのsampleでは認めない。雲の円内残存は018待ち例外。

### crossBands — no-additional-defect-observed-in-samples

主歌詞の4字と附属する暗い矩形/白枠が一緒に右下へ移動。交差する白/黄色帯と帯上の反復は全画面の対角線を維持し、主歌詞は暗い板上で読める。frame0では板がなく、6–90で板を伴い、95で板が退くという対応も保持。帯が円を横切ることは018待ち例外。

### zoomRepeat — no-additional-defect-observed-in-samples

太い主歌詞と密着する抜き/輪郭の対が右下へ一緒に移り、4字と読む順を維持。native after36でも対のずれや欠字を認めない。背後の巨大な輪郭反復は全画面の拡縮意図を維持し、単一小矩形へ圧縮されていない。背景copiesの円内残存は018待ち例外。

### credits — no-additional-defect-observed-in-samples

大きい主歌詞は左側の「風の」/「先へ」の2行へ組み替えられ、上行→下行で4字を読める。右側のsemantic credit rowsは削除されず、before/after36 native原寸で「詞 風の先へ」「語 風の」「先へ」「LINE 01」「TIME 00:00.00」を照合。区切り縦線と行群の上昇/上端下端のfadeもsample間で対応し、ラベルやLINE/TIMEを補助例外として除外していない。

### slotMachine — no-additional-defect-observed-in-samples

4列の横一列から右側の2×2へ再構成。読む順は上段「風 の」→下段「先 へ」。回転字と窓/白い外枠/停止線/矢印が各セルと結合している。追加のframe0–15連続画像で、ランダムな回転字の対応、先頭「風」の停止、続く「の」の進行を照合。36以降の確定4字に欠落なし。frame88–95の退出fadeでも字とセルが対応する。

### flipBoard — no-additional-defect-observed-in-samples

横一列の4枚の板と文字が一体で右下へ移動。追加のframe0–15連続画像で、透明な出現→代替文字の反転→「風の先へ」確定がbefore/afterで対応。反転途中の誤字状の形は両sideに対応する演出であり、確定字欠落ではない。88–95のfadeも板と文字が結合し、読む順/字数を保つ。

### curtain — stage-fixed-phase-preserved-with-visibility-timing-change

全画面の黄色いstage-fixed slateは同じ位置/開閉位相を維持し、主歌詞だけが右下へ移る。追加frame0–15/88–95連続画像でslateと4字を照合。afterは下にあるためframe5で下端が露出し6で読め、beforeは7で部分露出し8で読める。退出もbefore91で文字を覆い92で隠すのに対し、after91は読め92で部分的に覆い93で隠す。これはslateを動かさない方針とprimary移動の組合せによる可視時刻の変化。slate位相破綻/主歌詞欠字とは認定しないが、見かけの出現退出時刻が厳密同一であるとは判定しない。

## Limits

- 画像から円外の数値安全を証明しない。
- 全96frameの連続動画を視聴した判定ではない。全8IDは指定9時点、slotMachine/flipBoard/curtainはさらに0–15と88–95を連続静止画で比較。他区間の一瞬の離散跳びは未判定。
- H264は非可逆。輪郭・細字の精密な一致を保証しない。native key PNG原寸を一部併用。
- mask018未実装のtunnel perimeter、wordCloud雲、crossBands repeat/bands、zoomRepeat copiesの円内残存をdefectに含めない。主歌詞/semantic rows/slot/flap字は除外しない。
- 単一4秒/単一文字列/単一seed・font条件。別文字・別配置・別時刻への一般化不可。
- 空間再構成によるサイズ/折返し/可視タイミングの変化を原画と完全同一とはしない。

No numeric safety claim, browser test, or performance test was performed. No images were transmitted to the parent; this report supplies textual observations and metadata only.
